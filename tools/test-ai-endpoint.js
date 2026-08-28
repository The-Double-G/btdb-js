const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const fs = require("node:fs")
const net = require("node:net")
const os = require("node:os")
const path = require("node:path")
const { spawn } = require("node:child_process")

const root = path.resolve(__dirname, "..")
const featureCount = 17
const strategyCount = 75
const hidden1 = 12
const hidden2 = 8

const vector = (length, value = 0) => Array.from({ length }, () => value)
const matrix = (rows, columns, value = 0) => Array.from({ length: rows }, () => vector(columns, value))

function createPolicy() {
    return {
        hiddenSize1: hidden1,
        hiddenSize2: hidden2,
        learningRate: 0.09,
        W1: matrix(hidden1, featureCount),
        b1: vector(hidden1),
        W2: matrix(hidden2, hidden1),
        b2: vector(hidden2),
        W3: matrix(strategyCount, hidden2),
        b3: vector(strategyCount),
    }
}

function createModel() {
    const policy = createPolicy()
    return {
        version: 8,
        modelFamily: "bounded-contextual-bandit-v1",
        totalGames: 0,
        totalSyntheticEpisodes: 0,
        totalPolicySamples: 0,
        totalLoadoutSamples: 0,
        totalHumanDemonstrations: 0,
        playerProfile: { games: 0, features: vector(featureCount) },
        strategyStats: Array.from({ length: strategyCount }, () => ({ games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0 })),
        loadoutStats: {},
        placementStats: {},
        loadoutPlacementStats: {},
        timingStats: {},
        loadoutStrategyStats: {},
        crosspathStats: {},
        loadoutCounterStats: {},
        tacticalStats: {},
        tacticalFamilyStats: {},
        totalTacticalSamples: 0,
        candidateGeneration: 0,
        championGeneration: 0,
        policy,
        championPolicy: structuredClone(policy),
        populationPolicies: [],
    }
}

function createContribution(id, baseRevision = 1, contributionEpoch = 1) {
    return {
        protocolVersion: 1,
        contributionId: id,
        baseRevision,
        contributionEpoch,
        strategyIndex: 3,
        selectionFeatures: vector(featureCount, 0.25),
        matchFeatures: vector(featureCount, 0.5),
        aiLives: 80,
        enemyLives: 0,
        loadoutKey: "bomb,farm,wizard||bloonboost.png,towerboost.png",
        observations: [
            { store: "tacticalStats", key: "mid|safe|ready|mid|open|light|eco|send|1", value: 0.7 },
            { store: "tacticalFamilyStats", key: "eco|send|1", value: 0.7 },
            { store: "placementStats", key: "0|wizard|core|4|5", value: 0.4 },
        ],
        selfPlay: false,
    }
}

function createHumanDemonstration(id, baseRevision, contributionEpoch = 1) {
    return {
        protocolVersion: 1,
        eventType: "human-demo-v1",
        contributionId: id,
        baseRevision,
        contributionEpoch,
        matchFeatures: vector(featureCount, 0.75),
        aiLives: 0,
        enemyLives: 100,
        loadoutKey: "dart,farm,ninja||ecoboost.png,towerboost.png",
        opponentLoadoutKey: "bomb,farm,wizard||bloonboost.png,towerboost.png",
    }
}

async function reservePort() {
    const server = net.createServer()
    await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject))
    const port = server.address().port
    await new Promise(resolve => server.close(resolve))
    return port
}

async function waitForServer(url, headers) {
    let lastError
    for (let attempt = 0; attempt < 50; attempt++) {
        try {
            const response = await fetch(url, { headers })
            if (response.ok) return response
        } catch (error) {
            lastError = error
        }
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw lastError || new Error("PHP test server did not start")
}

async function main() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "btdb-ai-endpoint-"))
    const dataDir = path.join(tempRoot, "data")
    fs.mkdirSync(dataDir)
    fs.copyFileSync(path.join(root, "ai-learning.php"), path.join(tempRoot, "ai-learning.php"))

    const initialModel = createModel()
    const initialState = {
        protocolVersion: 1,
        revision: 1,
        modelDigest: `sha256:${crypto.createHash("sha256").update(JSON.stringify(initialModel)).digest("hex")}`,
        updatedAt: new Date().toISOString(),
        model: initialModel,
        contributionEpoch: 1,
    }
    fs.writeFileSync(path.join(dataDir, "ai-learning-global.json"), `${JSON.stringify(initialState)}\n`)

    const port = await reservePort()
    const origin = `http://127.0.0.1:${port}`
    const endpoint = `${origin}/ai-learning.php?protocol=1`
    const commonHeaders = { "User-Agent": "BTDB-AI-Endpoint-Test/1" }
    const php = spawn("php", ["-S", `127.0.0.1:${port}`, "-t", tempRoot], { stdio: ["ignore", "pipe", "pipe"] })
    let serverErrors = ""
    php.stderr.on("data", chunk => { serverErrors += chunk.toString() })

    try {
        const initialResponse = await waitForServer(endpoint, commonHeaders)
        const initialEnvelope = await initialResponse.json()
        assert.equal(initialEnvelope.contributionEnabled, true)
        assert.equal(initialEnvelope.contributionEpoch, 1)
        assert.match(initialEnvelope.contributionToken, /^\d+\.[a-f0-9]{64}$/)
        assert.equal(initialEnvelope.writeEnabled, false)

        const contributionHeaders = {
            ...commonHeaders,
            "Content-Type": "application/json",
            "Origin": origin,
            "X-AI-Contribution-Token": initialEnvelope.contributionToken,
        }
        const firstId = "00000000000000000000000000000001"
        const firstContribution = createContribution(firstId)
        const firstResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(firstContribution),
        })
        assert.equal(firstResponse.status, 200)
        const firstResult = await firstResponse.json()
        assert.equal(firstResult.revision, 2)
        assert.equal(firstResult.duplicate, false)

        const afterFirst = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(afterFirst.model.totalGames, 1)
        assert.equal(afterFirst.model.totalPolicySamples, 1)
        assert.equal(afterFirst.model.playerProfile.games, 1)
        assert.equal(afterFirst.model.strategyStats[3].games, 1)
        assert.equal(afterFirst.model.strategyStats[3].wins, 1)
        assert.equal(afterFirst.model.totalTacticalSamples, 1)
        assert.equal(afterFirst.model.tacticalStats["mid|safe|ready|mid|open|light|eco|send|1"].samples, 1)
        assert.notEqual(afterFirst.model.policy.b3[3], 0)
        assert.deepEqual(afterFirst.model.championPolicy, initialModel.championPolicy)

        const duplicateResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(firstContribution),
        })
        assert.equal(duplicateResponse.status, 200)
        const duplicateResult = await duplicateResponse.json()
        assert.equal(duplicateResult.duplicate, true)
        assert.equal(duplicateResult.revision, 2)

        const invalidTokenResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: { ...contributionHeaders, "X-AI-Contribution-Token": "invalid" },
            body: JSON.stringify(createContribution("00000000000000000000000000000002", 2)),
        })
        assert.equal(invalidTokenResponse.status, 401)

        const invalidOriginResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: { ...contributionHeaders, "Origin": "https://attacker.invalid" },
            body: JSON.stringify(createContribution("00000000000000000000000000000004", 2)),
        })
        assert.equal(invalidOriginResponse.status, 403)

        const overwriteAttempt = createContribution("00000000000000000000000000000003", 2)
        overwriteAttempt.model = initialModel
        const overwriteResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(overwriteAttempt),
        })
        assert.equal(overwriteResponse.status, 422)

        const concurrent = Array.from({ length: 5 }, (_, index) => {
            const id = (index + 10).toString(16).padStart(32, "0")
            return fetch(`${endpoint}&action=contribute`, {
                method: "POST",
                headers: contributionHeaders,
                body: JSON.stringify(createContribution(id, 2)),
            })
        })
        const concurrentResponses = await Promise.all(concurrent)
        assert.deepEqual(concurrentResponses.map(response => response.status), [200, 200, 200, 200, 200])

        const finalEnvelope = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(finalEnvelope.revision, 7)
        assert.equal(finalEnvelope.model.totalGames, 6)
        assert.equal(finalEnvelope.model.strategyStats[3].games, 6)
        assert.equal(finalEnvelope.model.tacticalStats["mid|safe|ready|mid|open|light|eco|send|1"].samples, 6)
        assert.deepEqual(finalEnvelope.model.championPolicy, initialModel.championPolicy)

        const candidateBeforeHumanDemo = structuredClone(finalEnvelope.model.policy)
        const humanResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(createHumanDemonstration("00000000000000000000000000000018", 7)),
        })
        assert.equal(humanResponse.status, 200)
        const humanResult = await humanResponse.json()
        assert.equal(humanResult.revision, 8)
        const afterHuman = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(afterHuman.model.totalGames, 6)
        assert.equal(afterHuman.model.totalPolicySamples, 6)
        assert.equal(afterHuman.model.totalHumanDemonstrations, 1)
        assert.equal(afterHuman.model.playerProfile.games, 7)
        assert.equal(afterHuman.model.loadoutStats["dart,farm,ninja||ecoboost.png,towerboost.png"].losses, 1)
        assert.equal(afterHuman.model.loadoutCounterStats["bomb,farm,wizard||bloonboost.png,towerboost.png|dart,farm,ninja||ecoboost.png,towerboost.png"].samples, 1)
        assert.deepEqual(afterHuman.model.policy, candidateBeforeHumanDemo)
        assert.deepEqual(afterHuman.model.championPolicy, initialModel.championPolicy)

        const adminResponse = await fetch(`${endpoint}&action=commit`, {
            method: "POST",
            headers: { ...commonHeaders, "Content-Type": "application/json", "Origin": origin },
            body: JSON.stringify({ expectedRevision: 8, model: afterHuman.model }),
        })
        assert.equal(adminResponse.status, 503)

        const resetKey = "BTDB-AI-Reset-Test-Key"
        const resetHash = crypto.createHash("sha256").update(resetKey).digest("hex")
        fs.writeFileSync(path.join(dataDir, "ai-trainer-key.sha256"), `${resetHash}\n`)
        const freshModel = createModel()
        const resetResponse = await fetch(`${endpoint}&action=reset`, {
            method: "POST",
            headers: { ...commonHeaders, "Content-Type": "application/json", "Origin": origin, "X-AI-Trainer-Key": resetKey },
            body: JSON.stringify({ expectedRevision: 8, model: freshModel }),
        })
        assert.equal(resetResponse.status, 200)
        const resetResult = await resetResponse.json()
        assert.equal(resetResult.revision, 9)
        assert.equal(resetResult.contributionEpoch, 2)
        assert.equal(resetResult.knowledgeReset, true)
        const resetEnvelope = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(resetEnvelope.revision, 9)
        assert.equal(resetEnvelope.contributionEpoch, 2)
        assert.equal(resetEnvelope.model.totalGames, 0)
        assert.equal(resetEnvelope.model.totalHumanDemonstrations, 0)
        assert.equal(resetEnvelope.model.playerProfile.games, 0)
        assert.equal(Object.keys(resetEnvelope.model.loadoutStats).length, 0)
        const resetState = JSON.parse(fs.readFileSync(path.join(dataDir, "ai-learning-global.json"), "utf8"))
        assert.deepEqual(resetState.contributionGuard, { recent: [], rates: [] })

        const legacyContribution = createContribution("00000000000000000000000000000030", 8, 1)
        delete legacyContribution.contributionEpoch
        const legacyResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(legacyContribution),
        })
        assert.equal(legacyResponse.status, 200)
        const legacyResult = await legacyResponse.json()
        assert.equal(legacyResult.discarded, true)
        assert.equal(legacyResult.revision, 9)

        const staleEpochResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(createContribution("00000000000000000000000000000031", 9, 1)),
        })
        assert.equal(staleEpochResponse.status, 409)
        const staleEpochResult = await staleEpochResponse.json()
        assert.equal(staleEpochResult.error.code, "contribution_epoch_mismatch")
        assert.equal(staleEpochResult.currentContributionEpoch, 2)

        const currentEpochResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(createContribution("00000000000000000000000000000032", 9, 2)),
        })
        assert.equal(currentEpochResponse.status, 200)
        const afterCurrentEpoch = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(afterCurrentEpoch.revision, 10)
        assert.equal(afterCurrentEpoch.model.totalGames, 1)

        const emptyObservationContribution = createContribution("00000000000000000000000000000033", 10, 2)
        emptyObservationContribution.observations = []
        const emptyObservationResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(emptyObservationContribution),
        })
        assert.equal(emptyObservationResponse.status, 200)
        const afterEmptyObservation = await (await fetch(endpoint, { headers: commonHeaders })).json()
        assert.equal(afterEmptyObservation.revision, 11)
        assert.equal(afterEmptyObservation.model.totalGames, 2)

        const invalidResetResponse = await fetch(`${endpoint}&action=reset`, {
            method: "POST",
            headers: { ...commonHeaders, "Content-Type": "application/json", "Origin": origin, "X-AI-Trainer-Key": resetKey },
            body: JSON.stringify({ expectedRevision: 11, model: afterEmptyObservation.model }),
        })
        assert.equal(invalidResetResponse.status, 422)

        const storedStatePath = path.join(dataDir, "ai-learning-global.json")
        const storedState = JSON.parse(fs.readFileSync(storedStatePath, "utf8"))
        const rateKey = crypto.createHash("sha256").update("127.0.0.1").digest("hex")
        storedState.contributionGuard.rates[rateKey] = { windowStart: Math.floor(Date.now() / 1000), count: 120 }
        fs.writeFileSync(storedStatePath, `${JSON.stringify(storedState)}\n`)
        const rateLimitedResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(createContribution("00000000000000000000000000000021", 11, 2)),
        })
        assert.equal(rateLimitedResponse.status, 429)
        assert.ok(Number(rateLimitedResponse.headers.get("retry-after")) > 0)

        const futureRevisionResponse = await fetch(`${endpoint}&action=contribute`, {
            method: "POST",
            headers: contributionHeaders,
            body: JSON.stringify(createContribution("00000000000000000000000000000020", 99, 2)),
        })
        assert.equal(futureRevisionResponse.status, 409)

        console.log("AI endpoint integration passed: public events are bounded and serialized, while resets invalidate stale knowledge epochs.")
    } finally {
        php.kill()
        await new Promise(resolve => php.once("exit", resolve).once("error", resolve))
        fs.rmSync(tempRoot, { recursive: true, force: true })
    }

    if (serverErrors.includes("Fatal error") || serverErrors.includes("Parse error")) {
        throw new Error(serverErrors)
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
