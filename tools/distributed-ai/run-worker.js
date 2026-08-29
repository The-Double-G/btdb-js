#!/usr/bin/env node
"use strict"

const path = require("node:path")
const { chromium } = require("playwright")
const {
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    ROOT,
    TRAIN_RESULT_KIND,
    computeMetrics,
    createCheckpoint,
    createStaticServer,
    digest,
    fail,
    finalizeResult,
    integerArg,
    parseArgs,
    readJson,
    requiredArg,
    validateCheckpoint,
    validateModel,
    validatePolicyOnlyCandidate,
    writeJson,
} = require("./common")

const FRAME_MS = 1000 / 60
const DEFAULT_MAX_FRAMES = 600000

const usage = `Usage:
  node tools/distributed-ai/run-worker.js --mode initialize --seed N --shard ID --output checkpoint.json
  node tools/distributed-ai/run-worker.js --mode train --checkpoint checkpoint.json --seed N --shard ID --matches N --output result.json [--max-frames-per-match N]
  node tools/distributed-ai/run-worker.js --mode evaluate --checkpoint candidate.json --baseline baseline.json --seed N --shard ID --matches N --output result.json [--max-frames-per-match N]`

function initScript(seed) {
    let randomState = seed >>> 0
    if(randomState == 0) randomState = 0x6d2b79f5
    let now = 1700000000000
    let timerId = 0
    Math.random = function() {
        randomState = (randomState + 0x6d2b79f5) >>> 0
        let value = randomState
        value = Math.imul(value ^ value >>> 15, value | 1)
        value ^= value + Math.imul(value ^ value >>> 7, value | 61)
        return ((value ^ value >>> 14) >>> 0) / 4294967296
    }
    Date.now = function() { return now }
    const noopTimer = function() { return ++timerId }
    window.setTimeout = noopTimer
    window.setInterval = noopTimer
    window.clearTimeout = function() {}
    window.clearInterval = function() {}
    window.requestAnimationFrame = noopTimer
    window.cancelAnimationFrame = function() {}

    const noop = function() {}
    HTMLCanvasElement.prototype.getContext = function() {
        const canvas = this
        const gradient = { addColorStop: noop }
        return new Proxy({}, {
            get(target, property) {
                if(property == "canvas") return canvas
                if(property == "measureText") return function() { return { width: 0 } }
                if(property == "createLinearGradient" || property == "createRadialGradient") return function() { return gradient }
                if(property == "createPattern") return function() { return null }
                return Object.prototype.hasOwnProperty.call(target, property) ? target[property] : noop
            },
            set(target, property, value) {
                target[property] = value
                return true
            },
        })
    }
    window.__distributedAI = {
        advance(milliseconds) { now += milliseconds },
        now() { return now },
        seed,
    }
}

function resultForLives(candidateLives, opponentLives) {
    if(candidateLives > opponentLives) return "win"
    if(candidateLives < opponentLives) return "loss"
    return "tie"
}

async function openRuntime(seed) {
    const staticServer = createStaticServer(ROOT)
    const origin = await staticServer.start()
    let browser = null
    let context = null
    const faults = []
    const hostedPersistence = []
    try {
        browser = await chromium.launch({ headless: true })
        context = await browser.newContext({ serviceWorkers: "block" })
        await context.addInitScript(initScript, seed)
        await context.route("**/*", async route => {
            const request = route.request()
            const url = new URL(request.url())
            if(url.hostname == "127.0.0.1" && url.origin == origin) {
                await route.continue()
                return
            }
            if(request.method() != "GET" && request.method() != "HEAD") hostedPersistence.push(`${request.method()} ${request.url()}`)
            await route.fulfill({ status: 204, body: "" })
        })
        const page = await context.newPage()
        page.on("console", message => {
            if(message.type() == "error") faults.push(`console: ${message.text()}`)
        })
        page.on("pageerror", error => faults.push(`page: ${error.stack || error.message}`))
        page.on("requestfailed", request => {
            if(request.url().startsWith(origin)) faults.push(`request: ${request.method()} ${request.url()} (${request.failure() && request.failure().errorText})`)
        })
        page.on("response", response => {
            if(response.url().startsWith(origin) && response.status() >= 400) faults.push(`response: ${response.status()} ${response.url()}`)
        })
        await page.goto(`${origin}/`, { waitUntil: "load", timeout: 30000 })
        const runtime = await page.evaluate(() => ({
            local: typeof AI_IS_LOCAL_RUNTIME != "undefined" && AI_IS_LOCAL_RUNTIME === true,
            persistence: typeof AI_CROSS_MATCH_LEARNING_ENABLED != "undefined" && AI_CROSS_MATCH_LEARNING_ENABLED === true,
            ready: typeof createDefaultAILearning == "function" && typeof advanceRuntimeClock == "function" && typeof animate == "function",
            gameVersion: typeof GAME_VERSION == "string" ? GAME_VERSION : "",
        }))
        if(!runtime.ready) fail("The browser game did not expose the required AI/runtime functions")
        if(!runtime.local || runtime.persistence) fail("The browser game enabled hosted persistence outside a session-only localhost runtime")
        if(faults.length) fail(`Browser startup failed: ${faults.join(" | ")}`)
        return { browser, context, page, staticServer, faults, hostedPersistence, gameVersion: runtime.gameVersion }
    } catch(error) {
        if(context) await context.close().catch(() => {})
        if(browser) await browser.close().catch(() => {})
        await staticServer.close().catch(() => {})
        throw error
    }
}

async function closeRuntime(runtime) {
    await runtime.context.close().catch(() => {})
    await runtime.browser.close().catch(() => {})
    await runtime.staticServer.close().catch(() => {})
}

function assertRuntimeClean(runtime) {
    if(runtime.hostedPersistence.length) fail(`Hosted persistence was attempted: ${runtime.hostedPersistence.join(" | ")}`)
    if(runtime.staticServer.errors.length) fail(`Static server failed: ${runtime.staticServer.errors.map(String).join(" | ")}`)
    if(runtime.faults.length) fail(`Browser errors occurred: ${runtime.faults.join(" | ")}`)
}

async function normalizedModel(page, model) {
    return page.evaluate(candidate => {
        aiLearning = normalizeAILearningData(candidate)
        return JSON.parse(JSON.stringify(aiLearning))
    }, model)
}

async function initialize(seed, shard, output) {
    const runtime = await openRuntime(seed)
    try {
        const model = await runtime.page.evaluate(() => {
            aiLearning = normalizeAILearningData(createDefaultAILearning())
            return JSON.parse(JSON.stringify(aiLearning))
        })
        validateModel(model, model.version, model.modelFamily)
        const checkpoint = createCheckpoint({
            gameVersion: runtime.gameVersion,
            model,
            mode: "initialize",
            seed,
            shard,
            matches: 0,
        })
        assertRuntimeClean(runtime)
        writeJson(output, checkpoint)
        return { id: checkpoint.checkpointId, output: path.resolve(output) }
    } finally {
        await closeRuntime(runtime)
    }
}

async function installMatchHarness(page, mode, candidate, baseline, requestedMatches) {
    await page.evaluate(({ mode, candidatePolicy, baselinePolicy, requestedMatches }) => {
        window.__daiLastMatch = null
        window.__daiLastBuiltInEvaluationScore = null

        const recordMatch = recordAITrainingTrueSelfPlayMatchResult
        recordAITrainingTrueSelfPlayMatchResult = function() {
            const leftLives = players[PLAYER_SIDE.left].lives == Infinity ? 150 : Math.max(0, players[PLAYER_SIDE.left].lives)
            const rightLives = players[PLAYER_SIDE.right].lives == Infinity ? 150 : Math.max(0, players[PLAYER_SIDE.right].lives)
            window.__daiLastMatch = {
                index: aiTrainingState.trueSelfPlayMatches,
                map: mapNumber,
                candidateSide: aiTrainingState.candidateSide == PLAYER_SIDE.left ? "left" : "right",
                candidateRole: aiTrainingState.candidateResponds ? "responder" : "probe",
                leftLives,
                rightLives,
                round: Math.max(1, Math.floor(round / 2)),
                evaluation: !!aiTrainingState.evaluationActive,
            }
            return recordMatch.apply(this, arguments)
        }

        if(mode == "train") {
            const finishEvaluation = finishAITrainingEvaluation
            finishAITrainingEvaluation = function() {
                const games = Math.max(1, aiTrainingState.evaluationGames)
                window.__daiLastBuiltInEvaluationScore = (aiTrainingState.evaluationWins + aiTrainingState.evaluationTies * 0.5) / games
                return finishEvaluation.apply(this, arguments)
            }
        } else {
            const prepareContexts = prepareAITrainingTrueSelfPlayContexts
            prepareAITrainingTrueSelfPlayContexts = function() {
                aiTrainingState.candidateTrainingMatches = 64
                const savedChampionPolicy = aiLearning.championPolicy
                aiLearning.championPolicy = cloneAIPolicy(baselinePolicy)
                try {
                    prepareContexts.apply(this, arguments)
                } finally {
                    aiLearning.championPolicy = savedChampionPolicy
                }
                const candidateContext = aiContextsBySide[aiTrainingState.candidateSide]
                const opponentContext = aiContextsBySide[getOpponentSide(aiTrainingState.candidateSide)]
                candidateContext.aiProfile.policySnapshot = cloneAIPolicy(candidatePolicy)
                candidateContext.aiProfile.learningEnabled = false
                candidateContext.aiProfile.explorationEnabled = false
                opponentContext.aiProfile.policySnapshot = cloneAIPolicy(baselinePolicy)
                opponentContext.aiProfile.learningEnabled = false
                opponentContext.aiProfile.explorationEnabled = false
                aiTrainingState.evaluationActive = true
            }
            finishAITrainingEvaluation = function() {
                aiTrainingState.evaluationActive = false
                aiTrainingState.evaluationGames = 0
                aiTrainingState.evaluationWins = 0
                aiTrainingState.evaluationLosses = 0
                aiTrainingState.evaluationTies = 0
            }
        }

        const requestedGoal = requestedMatches + 1
        getAITrainingGoalEpisodes = function() { return requestedGoal }
        aiTrainingState = createAITrainingState()
        aiTrainingState.batchOptionIndex = 0
        ensureAITrainingRuntimeInitialized()
        if(startAITrainingTrueSelfPlay() !== true) throw new Error("Unable to start true self-play")
    }, {
        mode,
        candidatePolicy: candidate.model.policy,
        baselinePolicy: baseline ? baseline.model.championPolicy : null,
        requestedMatches,
    })
}

async function stepUntilMatches(runtime, mode, candidate, baseline, requestedMatches, maxFramesPerMatch) {
    const page = runtime.page
    await installMatchHarness(page, mode, candidate, baseline, requestedMatches)
    const matches = []
    let framesThisMatch = 0
    let observedStalls = 0
    while(matches.length < requestedMatches) {
        const expectedMatches = matches.length
        const remainingBudget = maxFramesPerMatch - framesThisMatch
        if(remainingBudget <= 0) fail(`Frame budget exhausted during match ${expectedMatches}`)
        const batch = Math.min(200, remainingBudget)
        const state = await page.evaluate(({ expectedMatches, batch, frameMs }) => {
            function finiteTree(value, seen) {
                if(typeof value == "number") return Number.isFinite(value)
                if(value == null || typeof value == "string" || typeof value == "boolean") return true
                if(typeof value != "object" || seen.has(value)) return false
                seen.add(value)
                const values = Array.isArray(value) ? value : Object.keys(value).map(key => value[key])
                for(let index = 0; index < values.length; index++) if(!finiteTree(values[index], seen)) return false
                seen.delete(value)
                return true
            }
            let framesRun = 0
            for(; framesRun < batch; framesRun++) {
                window.__distributedAI.advance(frameMs)
                advanceRuntimeClock()
                animate()
                if(aiTrainingState.trueSelfPlayDiscardCurrentMatch || aiTrainingState.trueSelfPlayStallRecoveries > 0 || aiTrainingState.trueSelfPlayMatches != expectedMatches) {
                    framesRun++
                    break
                }
            }
            return {
                framesRun,
                completedMatches: aiTrainingState.trueSelfPlayMatches,
                discarded: !!aiTrainingState.trueSelfPlayDiscardCurrentMatch,
                stalls: aiTrainingState.trueSelfPlayStallRecoveries,
                lastMatch: window.__daiLastMatch,
                builtInEvaluationScore: window.__daiLastBuiltInEvaluationScore,
                finiteModel: finiteTree(aiLearning, new Set()),
                validPolicy: isValidAIPolicy(aiLearning.policy) && isValidAIPolicy(aiLearning.championPolicy),
            }
        }, { expectedMatches, batch, frameMs: FRAME_MS })
        framesThisMatch += state.framesRun
        if(!state.finiteModel || !state.validPolicy) fail(`Non-finite or invalid model values detected during match ${expectedMatches}`)
        if(state.stalls > observedStalls || state.discarded) fail(`Self-play stalled or discarded match ${expectedMatches}`)
        observedStalls = state.stalls
        if(state.completedMatches < expectedMatches || state.completedMatches > expectedMatches + 1) fail(`Wrong browser match count: expected ${expectedMatches} or ${expectedMatches + 1}, got ${state.completedMatches}`)
        if(state.completedMatches == expectedMatches + 1) {
            if(!state.lastMatch || state.lastMatch.index != expectedMatches) fail(`Missing summary for completed match ${expectedMatches}`)
            const candidateLives = state.lastMatch.candidateSide == "left" ? state.lastMatch.leftLives : state.lastMatch.rightLives
            const opponentLives = state.lastMatch.candidateSide == "left" ? state.lastMatch.rightLives : state.lastMatch.leftLives
            matches.push({
                ...state.lastMatch,
                result: resultForLives(candidateLives, opponentLives),
                candidateLives,
                opponentLives,
                frames: framesThisMatch,
            })
            framesThisMatch = 0
        }
        assertRuntimeClean(runtime)
    }
    const finalState = await page.evaluate(() => {
        stopAITrainingTrueSelfPlay(false)
        return {
            completedMatches: aiTrainingState.trueSelfPlayMatches,
            model: JSON.parse(JSON.stringify(aiLearning)),
            builtInEvaluationScore: window.__daiLastBuiltInEvaluationScore,
        }
    })
    if(finalState.completedMatches != requestedMatches) fail(`Wrong final browser match count: expected ${requestedMatches}, got ${finalState.completedMatches}`)
    if(matches.length != requestedMatches) fail(`Wrong final match count: expected ${requestedMatches}, got ${matches.length}`)
    return { matches, model: finalState.model, builtInEvaluationScore: finalState.builtInEvaluationScore }
}

async function runMatches({ mode, checkpoint, baseline, seed, shard, matches, output, maxFramesPerMatch }) {
    const runtime = await openRuntime(seed)
    try {
        if(runtime.gameVersion != checkpoint.gameVersion) fail(`Checkpoint game version ${checkpoint.gameVersion} does not match runtime ${runtime.gameVersion}`)
        const loadedModel = await normalizedModel(runtime.page, checkpoint.model)
        if(digest(loadedModel) != checkpoint.modelDigest) fail("The game normalized the checkpoint into different model data")
        if(baseline) {
            if(baseline.gameVersion != checkpoint.gameVersion || baseline.modelSchemaVersion != checkpoint.modelSchemaVersion || baseline.modelFamily != checkpoint.modelFamily) fail("Candidate and baseline checkpoints are incompatible")
            validatePolicyOnlyCandidate(checkpoint, baseline)
        }
        const execution = await stepUntilMatches(runtime, mode, checkpoint, baseline, matches, maxFramesPerMatch)
        validateModel(execution.model, checkpoint.modelSchemaVersion, checkpoint.modelFamily)
        assertRuntimeClean(runtime)
        const metrics = computeMetrics(execution.matches, {
            builtInEvaluationScore: mode == "train" ? execution.builtInEvaluationScore : null,
        })
        let result
        if(mode == "train") {
            const candidate = createCheckpoint({
                gameVersion: checkpoint.gameVersion,
                model: execution.model,
                parentCheckpointId: checkpoint.checkpointId,
                mode: "train",
                seed,
                shard,
                matches,
            })
            result = finalizeResult({
                kind: TRAIN_RESULT_KIND,
                formatVersion: FORMAT_VERSION,
                resultId: "",
                baseCheckpointId: checkpoint.checkpointId,
                baseModelDigest: checkpoint.modelDigest,
                gameVersion: checkpoint.gameVersion,
                modelSchemaVersion: checkpoint.modelSchemaVersion,
                mode,
                seed,
                shard,
                requestedMatches: matches,
                completedMatches: execution.matches.length,
                candidate,
                metrics,
                matches: execution.matches,
            })
        } else {
            if(digest(execution.model) != checkpoint.modelDigest) fail("Evaluation mutated the candidate model")
            result = finalizeResult({
                kind: EVALUATION_RESULT_KIND,
                formatVersion: FORMAT_VERSION,
                resultId: "",
                candidateCheckpointId: checkpoint.checkpointId,
                candidateModelDigest: checkpoint.modelDigest,
                baselineCheckpointId: baseline.checkpointId,
                baselineModelDigest: baseline.modelDigest,
                gameVersion: checkpoint.gameVersion,
                modelSchemaVersion: checkpoint.modelSchemaVersion,
                mode,
                seed,
                shard,
                requestedMatches: matches,
                completedMatches: execution.matches.length,
                metrics,
                matches: execution.matches,
            })
        }
        writeJson(output, result)
        return { id: result.resultId, output: path.resolve(output), metrics }
    } finally {
        await closeRuntime(runtime)
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2), ["mode", "checkpoint", "baseline", "seed", "shard", "matches", "output", "max-frames-per-match"])
    if(args.help) {
        console.log(usage)
        return
    }
    const mode = requiredArg(args, "mode")
    if(!["initialize", "train", "evaluate"].includes(mode)) fail("--mode must be initialize, train, or evaluate")
    const seed = integerArg(args, "seed", { maximum: 0xffffffff })
    const shard = requiredArg(args, "shard")
    const output = requiredArg(args, "output")
    if(mode == "initialize") {
        if(args.checkpoint || args.baseline || args.matches || args["max-frames-per-match"]) fail("Initialize accepts only --mode, --seed, --shard, and --output")
        const result = await initialize(seed, shard, output)
        console.log(`Initialized ${result.id} at ${result.output}`)
        return
    }
    const checkpoint = validateCheckpoint(readJson(requiredArg(args, "checkpoint")))
    const matchCount = integerArg(args, "matches", { minimum: 1 })
    const maxFramesPerMatch = args["max-frames-per-match"] == null ? DEFAULT_MAX_FRAMES : integerArg(args, "max-frames-per-match", { minimum: 1 })
    let baseline = null
    if(mode == "evaluate") baseline = validateCheckpoint(readJson(requiredArg(args, "baseline")), "baseline")
    else if(args.baseline) fail("--baseline is only valid in evaluate mode")
    const result = await runMatches({ mode, checkpoint, baseline, seed, shard, matches: matchCount, output, maxFramesPerMatch })
    console.log(`${mode == "train" ? "Trained" : "Evaluated"} ${result.id}: ${result.metrics.wins}-${result.metrics.losses}-${result.metrics.ties}, score ${result.metrics.score.toFixed(4)}, output ${result.output}`)
}

if(require.main === module) {
    main().catch(error => {
        console.error(error.stack || error.message)
        process.exitCode = 1
    })
}

module.exports = {
    assertRuntimeClean,
    closeRuntime,
    openRuntime,
}
