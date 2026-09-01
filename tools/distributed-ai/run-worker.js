#!/usr/bin/env node
"use strict"

const path = require("node:path")
const { chromium } = require("playwright")
const {
    DECISION_CANDIDATE_INPUT_SIZE,
    DECISION_STATE_INPUT_SIZE,
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    MODEL_FAMILY,
    MODEL_SCHEMA_VERSION,
    MAX_RECOVERED_STALLS,
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
const MAX_STALL_RECOVERIES_PER_MATCH = MAX_RECOVERED_STALLS
const SCHEMA_10_FAMILY = "shared-recurrent-actor-critic-v2"
const SCHEMA_11_FAMILY = "semantic-recurrent-actor-critic-v3"
const SCHEMA_11_STATE_INPUT_SIZE = 72
const SCHEMA_11_CANDIDATE_INPUT_SIZE = 64

const usage = `Usage:
  node tools/distributed-ai/run-worker.js --mode initialize --seed N --shard ID --output checkpoint.json
  node tools/distributed-ai/run-worker.js --mode migrate --checkpoint checkpoint.json --seed N --shard ID --output checkpoint.json
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

function validateMigrationSource(checkpoint) {
    if(!checkpoint || checkpoint.kind != "btdb-ai-checkpoint" || checkpoint.formatVersion != FORMAT_VERSION) fail("Migration source has an unsupported kind or format version")
    const supportedFamily = checkpoint.modelSchemaVersion == 10 ? SCHEMA_10_FAMILY : checkpoint.modelSchemaVersion == 11 ? SCHEMA_11_FAMILY : null
    if(checkpoint.modelFamily != supportedFamily) fail(`Migration source must use schema 10 and ${SCHEMA_10_FAMILY}, or schema 11 and ${SCHEMA_11_FAMILY}`)
    if(!checkpoint.model || checkpoint.model.version != checkpoint.modelSchemaVersion || checkpoint.model.modelFamily != checkpoint.modelFamily) fail("Migration source model identity is inconsistent")
    if(digest(checkpoint.model) != checkpoint.modelDigest) fail("Migration source modelDigest does not match its model")
    const identity = {}
    for(const key of ["kind", "formatVersion", "gameVersion", "modelSchemaVersion", "modelFamily", "modelDigest", "parentCheckpointId", "provenance", "model"]) identity[key] = checkpoint[key]
    if(digest(identity) != checkpoint.checkpointId) fail("Migration source checkpointId does not match its contents")
    return checkpoint
}

function appendZeroColumns(matrix, rows, oldColumns, newColumns, label) {
    if(!Array.isArray(matrix) || matrix.length != rows) fail(`${label} must contain ${rows} rows`)
    return matrix.map((row, index) => {
        if(!Array.isArray(row) || row.length != oldColumns) fail(`${label}[${index}] must contain ${oldColumns} values`)
        return row.concat(Array(newColumns - oldColumns).fill(0))
    })
}

function migrateSchema11Policy(policy, label) {
    if(!policy || !policy.decision) fail(`${label} is missing its decision network`)
    const migrated = JSON.parse(JSON.stringify(policy))
    const decision = migrated.decision
    if(decision.stateInputSize != SCHEMA_11_STATE_INPUT_SIZE || decision.candidateInputSize != SCHEMA_11_CANDIDATE_INPUT_SIZE) fail(`${label}.decision has incompatible schema 11 input dimensions`)
    decision.stateInputSize = DECISION_STATE_INPUT_SIZE
    decision.candidateInputSize = DECISION_CANDIDATE_INPUT_SIZE
    decision.WState1 = appendZeroColumns(decision.WState1, 96, SCHEMA_11_STATE_INPUT_SIZE, DECISION_STATE_INPUT_SIZE, `${label}.decision.WState1`)
    decision.WCandidate1 = appendZeroColumns(decision.WCandidate1, 48, SCHEMA_11_CANDIDATE_INPUT_SIZE, DECISION_CANDIDATE_INPUT_SIZE, `${label}.decision.WCandidate1`)
    return migrated
}

function migrateSchema11Model(source) {
    if(!source || source.version != 11 || source.modelFamily != SCHEMA_11_FAMILY) fail(`Migration requires schema 11 and ${SCHEMA_11_FAMILY}`)
    if(!Array.isArray(source.populationPolicies) || source.populationPolicies.length > 2) fail("Schema 11 migration source has an invalid policy population")
    const migrated = JSON.parse(JSON.stringify(source))
    migrated.version = MODEL_SCHEMA_VERSION
    migrated.modelFamily = MODEL_FAMILY
    migrated.placementStats = {}
    migrated.loadoutPlacementStats = {}
    migrated.tacticalFamilyStats = Object.fromEntries(Object.entries(source.tacticalFamilyStats).filter(([key]) => !key.startsWith("human|")))
    migrated.policy = migrateSchema11Policy(source.policy, "model.policy")
    migrated.championPolicy = migrateSchema11Policy(source.championPolicy, "model.championPolicy")
    migrated.populationPolicies = source.populationPolicies.map((policy, index) => migrateSchema11Policy(policy, `model.populationPolicies[${index}]`))
    return migrated
}

function assertMigrationRetention(source, migrated) {
    if(source.version == 11) {
        if(digest(migrateSchema11Model(source)) != digest(migrated)) fail("Schema 11 migration changed data beyond identity, policy input expansion, incompatible stores, and reserved human priors")
        return
    }
    const modelKeys = [
        "totalGames", "totalSyntheticEpisodes", "totalPolicySamples", "totalLoadoutSamples", "totalHumanDemonstrations",
        "playerProfile", "strategyStats", "loadoutStats", "timingStats",
        "loadoutStrategyStats", "crosspathStats", "loadoutCounterStats", "tacticalStats", "tacticalFamilyStats",
        "totalTacticalSamples", "candidateGeneration", "championGeneration",
    ]
    for(const key of modelKeys) if(digest(source[key]) != digest(migrated[key])) fail(`Migration did not preserve model.${key}`)
    if(Object.keys(migrated.placementStats).length != 0 || Object.keys(migrated.loadoutPlacementStats).length != 0) fail("Migration did not reset perspective-sensitive placement stores")
    if(migrated.totalDecisionSamples != 0) fail("Migration did not reset totalDecisionSamples")

    const retainedDecisionKeys = [
        "stateHiddenSize", "candidateHiddenSize", "embeddingSize", "memorySize", "survivalClassCount",
        "bState1", "WState2", "bState2", "WStateToMemory", "WMemoryToMemory", "bMemory",
        "WMemoryToState", "WValue", "bValue", "WSurvival", "bSurvival",
    ]
    const policyPairs = [[source.policy, migrated.policy], [source.championPolicy, migrated.championPolicy]]
    for(let index = 0; index < source.populationPolicies.length; index++) policyPairs.push([source.populationPolicies[index], migrated.populationPolicies[index]])
    for(const [oldPolicy, newPolicy] of policyPairs) {
        if(digest(oldPolicy.strategy) != digest(newPolicy.strategy)) fail("Migration did not preserve a strategy network")
        if(oldPolicy.strategyLearningRate != newPolicy.strategyLearningRate || oldPolicy.decisionLearningRate != newPolicy.decisionLearningRate) fail("Migration did not preserve learning rates")
        for(const key of retainedDecisionKeys) if(digest(oldPolicy.decision[key]) != digest(newPolicy.decision[key])) fail(`Migration did not preserve decision.${key}`)
        const expandedState = appendZeroColumns(oldPolicy.decision.WState1, 96, SCHEMA_11_STATE_INPUT_SIZE, DECISION_STATE_INPUT_SIZE, "schema 10 decision.WState1")
        if(digest(expandedState) != digest(newPolicy.decision.WState1)) fail("Migration did not preserve and zero-expand decision.WState1")
        if(newPolicy.decision.trainingSamples.some(value => value != 0) || newPolicy.decision.familyBias.some(value => value != 0)) fail("Migration did not reset decision-family training state")
    }
}

async function migrate(source, seed, shard, output) {
    const runtime = await openRuntime(seed)
    try {
        const normalized = await normalizedModel(runtime.page, source.model)
        const repeated = await normalizedModel(runtime.page, source.model)
        if(digest(normalized) != digest(repeated)) fail("Schema migration is not deterministic")
        const model = source.modelSchemaVersion == 11 ? migrateSchema11Model(source.model) : normalized
        if(source.modelSchemaVersion == 11 && digest(model) != digest(normalized)) fail("Explicit schema 11 migration does not match runtime normalization")
        assertMigrationRetention(source.model, model)
        validateModel(model, model.version, model.modelFamily)
        const checkpoint = createCheckpoint({
            gameVersion: runtime.gameVersion,
            model,
            parentCheckpointId: source.checkpointId,
            mode: "migrate",
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
                aiTrainingState.candidateTrainingMatches = 128
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

async function stepUntilMatches(runtime, mode, candidate, baseline, requestedMatches, maxFramesPerMatch, afterHarnessInstalled) {
    const page = runtime.page
    await installMatchHarness(page, mode, candidate, baseline, requestedMatches)
    if(afterHarnessInstalled) await afterHarnessInstalled(page)
    const matches = []
    let framesThisMatch = 0
    let observedStalls = 0
    let recoveriesThisMatch = 0
    while(matches.length < requestedMatches) {
        const expectedMatches = matches.length
        const remainingBudget = maxFramesPerMatch - framesThisMatch
        if(remainingBudget <= 0) fail(`Frame budget exhausted during match ${expectedMatches}`)
        const batch = Math.min(200, remainingBudget)
        const state = await page.evaluate(({ expectedMatches, batch, frameMs, observedStalls }) => {
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
                if(aiTrainingState.trueSelfPlayDiscardCurrentMatch || aiTrainingState.trueSelfPlayStallRecoveries != observedStalls || aiTrainingState.trueSelfPlayMatches != expectedMatches) {
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
        }, { expectedMatches, batch, frameMs: FRAME_MS, observedStalls })
        framesThisMatch += state.framesRun
        if(!state.finiteModel || !state.validPolicy) fail(`Non-finite or invalid model values detected during match ${expectedMatches}`)
        if(state.stalls < observedStalls) fail(`Self-play stall recovery count moved backwards during match ${expectedMatches}`)
        const recovered = state.stalls - observedStalls
        if(recovered > 0) {
            recoveriesThisMatch += recovered
            observedStalls = state.stalls
            console.warn(`Recovered discarded match ${expectedMatches} (${recoveriesThisMatch}/${MAX_STALL_RECOVERIES_PER_MATCH})`)
            if(recoveriesThisMatch > MAX_STALL_RECOVERIES_PER_MATCH) fail(`Stall recovery limit exceeded during match ${expectedMatches}`)
            if(observedStalls > MAX_RECOVERED_STALLS) fail(`Stall recovery limit exceeded for the worker result`)
        }
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
            recoveriesThisMatch = 0
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
    return { matches, model: finalState.model, builtInEvaluationScore: finalState.builtInEvaluationScore, stallRecoveries: observedStalls }
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
            stalls: execution.stallRecoveries,
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
    if(!["initialize", "migrate", "train", "evaluate"].includes(mode)) fail("--mode must be initialize, migrate, train, or evaluate")
    const seed = integerArg(args, "seed", { maximum: 0xffffffff })
    const shard = requiredArg(args, "shard")
    const output = requiredArg(args, "output")
    if(mode == "initialize") {
        if(args.checkpoint || args.baseline || args.matches || args["max-frames-per-match"]) fail("Initialize accepts only --mode, --seed, --shard, and --output")
        const result = await initialize(seed, shard, output)
        console.log(`Initialized ${result.id} at ${result.output}`)
        return
    }
    if(mode == "migrate") {
        if(args.baseline || args.matches || args["max-frames-per-match"]) fail("Migrate accepts only --mode, --checkpoint, --seed, --shard, and --output")
        const source = validateMigrationSource(readJson(requiredArg(args, "checkpoint")))
        const result = await migrate(source, seed, shard, output)
        console.log(`Migrated ${result.id} at ${result.output}`)
        return
    }
    const checkpoint = validateCheckpoint(readJson(requiredArg(args, "checkpoint")))
    const matchCount = integerArg(args, "matches", { minimum: 1 })
    if(mode == "evaluate" && matchCount % 8 != 0) fail("Evaluation workers require a positive multiple of 8 matches for map/side/role balance")
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
    assertMigrationRetention,
    assertRuntimeClean,
    closeRuntime,
    migrateSchema11Model,
    openRuntime,
    stepUntilMatches,
    validateMigrationSource,
}
