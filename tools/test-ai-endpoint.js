const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const fs = require("node:fs")
const net = require("node:net")
const os = require("node:os")
const path = require("node:path")
const { spawn } = require("node:child_process")
const { createHostedSnapshot, hostedDigest } = require("./distributed-ai/common")

const root = path.resolve(__dirname, "..")
const featureCount = 17
const strategyCount = 75
const hidden1 = 64
const hidden2 = 32
const stateInputSize = 48
const candidateInputSize = 32
const stateHiddenSize = 96
const candidateHiddenSize = 48
const embeddingSize = 48
const familyCount = 8
const userAgent = "BTDB-AI-Endpoint-Test/1"

const vector = (length, value = 0) => Array.from({ length }, () => value)
const matrix = (rows, columns, value = 0) => Array.from({ length: rows }, () => vector(columns, value))
const scoreRecord = (samples, score) => ({ samples, score, mean: score, m2: 0 })

function createLegacyPolicy(seed = 0) {
    const policy = {
        hiddenSize1: 12,
        hiddenSize2: 8,
        learningRate: 0.09,
        W1: matrix(12, featureCount),
        b1: vector(12),
        W2: matrix(8, 12),
        b2: vector(8),
        W3: matrix(strategyCount, 8),
        b3: vector(strategyCount),
    }
    policy.W1[0][0] = 0.11 + seed
    policy.W1[1][3] = -0.07 - seed
    policy.b1[0] = 0.03 + seed
    policy.W2[0][0] = 0.17 + seed
    policy.W2[2][1] = -0.13 - seed
    policy.b2[0] = -0.02 + seed
    policy.W3[3][0] = 0.23 + seed
    policy.W3[17][2] = -0.19 - seed
    policy.b3[3] = 0.31 + seed
    policy.b3[17] = -0.27 - seed
    return policy
}

function createLegacyModel() {
    const strategyStats = Array.from({ length: strategyCount }, () => ({ games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0 }))
    strategyStats[3] = { games: 1, wins: 1, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0.9 }
    strategyStats[4] = { games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 2, lastReward: -0.2 }
    const policy = createLegacyPolicy(0.01)
    return {
        version: 8,
        modelFamily: "bounded-contextual-bandit-v1",
        totalGames: 1,
        totalSyntheticEpisodes: 2,
        totalPolicySamples: 3,
        totalLoadoutSamples: 1,
        totalHumanDemonstrations: 2,
        playerProfile: { games: 3, features: vector(featureCount, 0.2) },
        strategyStats,
        loadoutStats: { "legacy-loadout": { games: 1, wins: 1, losses: 0, ties: 0, lastReward: 0.9 } },
        placementStats: { "legacy-placement": scoreRecord(1, 0.4) },
        loadoutPlacementStats: {},
        timingStats: {},
        loadoutStrategyStats: {},
        crosspathStats: {},
        loadoutCounterStats: {},
        tacticalStats: { "legacy-tactical": scoreRecord(1, 0.6) },
        tacticalFamilyStats: {},
        totalTacticalSamples: 1,
        candidateGeneration: 5,
        championGeneration: 4,
        policy,
        championPolicy: structuredClone(policy),
        populationPolicies: [createLegacyPolicy(0.03), structuredClone(policy), createLegacyPolicy(0.05)],
    }
}

function createStrategy() {
    return {
        hiddenSize1: hidden1,
        hiddenSize2: hidden2,
        W1: matrix(hidden1, featureCount),
        b1: vector(hidden1),
        W2: matrix(hidden2, hidden1),
        b2: vector(hidden2),
        W3: matrix(strategyCount, hidden2),
        b3: vector(strategyCount),
    }
}

function createDecision() {
    return {
        stateInputSize,
        candidateInputSize,
        stateHiddenSize,
        candidateHiddenSize,
        embeddingSize,
        trainingSamples: vector(familyCount),
        WState1: matrix(stateHiddenSize, stateInputSize),
        bState1: vector(stateHiddenSize),
        WState2: matrix(embeddingSize, stateHiddenSize),
        bState2: vector(embeddingSize),
        WCandidate1: matrix(candidateHiddenSize, candidateInputSize),
        bCandidate1: vector(candidateHiddenSize),
        WCandidate2: matrix(embeddingSize, candidateHiddenSize),
        bCandidate2: vector(embeddingSize),
        familyBias: vector(familyCount),
    }
}

function createPolicy() {
    return {
        formatVersion: 2,
        strategyLearningRate: 0.09,
        decisionLearningRate: 0.04,
        strategy: createStrategy(),
        decision: createDecision(),
    }
}

function createModel() {
    const policy = createPolicy()
    return {
        version: 9,
        modelFamily: "shared-neural-controller-v1",
        totalGames: 0,
        totalSyntheticEpisodes: 0,
        totalPolicySamples: 0,
        totalLoadoutSamples: 0,
        totalHumanDemonstrations: 0,
        totalDecisionSamples: 0,
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

function createDecisionSample(overrides = {}) {
    return {
        familyIndex: 2,
        stateFeatures: vector(stateInputSize, 0.35),
        candidateFeatures: vector(candidateInputSize, -0.2),
        localReward: -0.5,
        age: 7,
        ...overrides,
    }
}

function createContribution(id, baseRevision, contributionEpoch, decisionSamples = []) {
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
        decisionSamples,
    }
}

function createHumanDemonstration(id, baseRevision, contributionEpoch) {
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

function legacyForward(features, policy) {
    const hiddenA = policy.W1.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * features[column], policy.b1[index])))
    const hiddenB = policy.W2.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * hiddenA[column], policy.b2[index])))
    return policy.W3.map((row, index) => row.reduce((sum, weight, column) => sum + weight * hiddenB[column], policy.b3[index]))
}

function strategyForward(features, strategy) {
    const hiddenA = strategy.W1.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * features[column], strategy.b1[index])))
    const hiddenB = strategy.W2.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * hiddenA[column], strategy.b2[index])))
    return strategy.W3.map((row, index) => row.reduce((sum, weight, column) => sum + weight * hiddenB[column], strategy.b3[index]))
}

function encodeDecision(features, W1, b1, W2, b2) {
    const hidden = W1.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * features[column], b1[index])))
    return W2.map((row, index) => Math.tanh(row.reduce((sum, weight, column) => sum + weight * hidden[column], b2[index])))
}

function decisionPrediction(sample, decision) {
    const state = encodeDecision(sample.stateFeatures, decision.WState1, decision.bState1, decision.WState2, decision.bState2)
    const candidate = encodeDecision(sample.candidateFeatures, decision.WCandidate1, decision.bCandidate1, decision.WCandidate2, decision.bCandidate2)
    const dot = state.reduce((sum, value, index) => sum + value * candidate[index], 0)
    const stateNorm = Math.sqrt(state.reduce((sum, value) => sum + value * value, 0) + 1e-6)
    const candidateNorm = Math.sqrt(candidate.reduce((sum, value) => sum + value * value, 0) + 1e-6)
    return Math.tanh(dot / (stateNorm * candidateNorm) + decision.familyBias[sample.familyIndex])
}

function matchReward(aiLives, enemyLives) {
    const result = aiLives > enemyLives ? 1 : aiLives < enemyLives ? -1 : 0
    const margin = Math.max(-1, Math.min(1, (aiLives - enemyLives) / 150))
    return Math.max(-1, Math.min(1, result * 0.9 + margin * 0.1))
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
    for (let attempt = 0; attempt < 80; attempt++) {
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

function createContributionToken(secret) {
    const fingerprint = crypto.createHash("sha256").update(`127.0.0.1|${userAgent}`).digest("hex")
    const bucket = Math.floor(Date.now() / 1000 / 21600)
    const signature = crypto.createHmac("sha256", secret).update(`${bucket}|${fingerprint}`).digest("hex")
    return `${bucket}.${signature}`
}

async function readEnvelope(endpoint, headers) {
    const response = await fetch(endpoint, { headers })
    assert.equal(response.status, 200)
    return response.json()
}

async function postJson(endpoint, action, headers, body) {
    return fetch(`${endpoint}&action=${action}`, { method: "POST", headers, body: JSON.stringify(body) })
}

function assertPolicyContract(policy) {
    assert.deepEqual(Object.keys(policy).sort(), ["formatVersion", "strategyLearningRate", "decisionLearningRate", "strategy", "decision"].sort())
    assert.deepEqual(Object.keys(policy.strategy).sort(), ["hiddenSize1", "hiddenSize2", "W1", "b1", "W2", "b2", "W3", "b3"].sort())
    assert.deepEqual(Object.keys(policy.decision).sort(), [
        "stateInputSize", "candidateInputSize", "stateHiddenSize", "candidateHiddenSize", "embeddingSize",
        "trainingSamples",
        "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2", "familyBias",
    ].sort())
    assert.equal(policy.formatVersion, 2)
    assert.equal(policy.strategy.hiddenSize1, hidden1)
    assert.equal(policy.strategy.hiddenSize2, hidden2)
    assert.equal(policy.strategy.W1.length, hidden1)
    assert.equal(policy.strategy.W1[0].length, featureCount)
    assert.equal(policy.strategy.W2.length, hidden2)
    assert.equal(policy.strategy.W2[0].length, hidden1)
    assert.equal(policy.strategy.W3.length, strategyCount)
    assert.equal(policy.strategy.W3[0].length, hidden2)
    assert.equal(policy.decision.WState1.length, stateHiddenSize)
    assert.equal(policy.decision.WState1[0].length, stateInputSize)
    assert.equal(policy.decision.WState2.length, embeddingSize)
    assert.equal(policy.decision.WState2[0].length, stateHiddenSize)
    assert.equal(policy.decision.WCandidate1.length, candidateHiddenSize)
    assert.equal(policy.decision.WCandidate1[0].length, candidateInputSize)
    assert.equal(policy.decision.WCandidate2.length, embeddingSize)
    assert.equal(policy.decision.WCandidate2[0].length, candidateHiddenSize)
    assert.equal(policy.decision.familyBias.length, familyCount)
    assert.deepEqual(policy.decision.trainingSamples.length, familyCount)
}

function canonicalWeight(index, scale, salt) {
    let state = Math.imul(index + 1, 1664525) + Math.imul(salt, 1013904223) >>> 0
    state = Math.imul(state, 1664525) + 1013904223 >>> 0
    return ((state / 4294967295) * 2 - 1) * scale
}

function policyParameterDeltaNorm(candidate, baseline) {
    const strategyKeys = ["W1", "b1", "W2", "b2", "W3", "b3"]
    const decisionKeys = ["WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2", "familyBias"]
    let squared = 0
    const visit = (left, right) => {
        if(Array.isArray(left)) {
            left.forEach((value, index) => visit(value, right[index]))
            return
        }
        squared += (left - right) ** 2
    }
    strategyKeys.forEach(key => visit(candidate.strategy[key], baseline.strategy[key]))
    decisionKeys.forEach(key => visit(candidate.decision[key], baseline.decision[key]))
    return Math.sqrt(squared)
}

async function main() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "btdb-ai-endpoint-"))
    const dataDir = path.join(tempRoot, "data")
    fs.mkdirSync(dataDir)
    fs.copyFileSync(path.join(root, "ai-learning.php"), path.join(tempRoot, "ai-learning.php"))
    const statePath = path.join(dataDir, "ai-learning-global.json")
    const secret = "endpoint-test-contribution-secret-".padEnd(64, "s")
    fs.writeFileSync(path.join(dataDir, "ai-contribution-secret"), `${secret}\n`)

    const ports = [await reservePort(), await reservePort()]
    const origins = ports.map(port => `http://127.0.0.1:${port}`)
    const endpoints = origins.map(origin => `${origin}/ai-learning.php?protocol=1`)
    const commonHeaders = { "User-Agent": userAgent }
    const servers = ports.map(port => spawn("php", ["-S", `127.0.0.1:${port}`, "-t", tempRoot], { stdio: ["ignore", "pipe", "pipe"] }))
    const serverErrors = ["", ""]
    servers.forEach((server, index) => server.stderr.on("data", chunk => { serverErrors[index] += chunk.toString() }))

    try {
        const emptyEnvelope = await (await waitForServer(endpoints[0], commonHeaders)).json()
        await waitForServer(endpoints[1], commonHeaders)
        assert.equal(emptyEnvelope.modelSchema, 9)
        assert.equal(emptyEnvelope.contributionEnabled, false)
        assert.deepEqual(emptyEnvelope.model, [])

        const legacyModel = createLegacyModel()
        const legacyState = {
            protocolVersion: 1,
            revision: 7,
            modelDigest: `sha256:${"1".repeat(64)}`,
            updatedAt: "2026-01-01T00:00:00Z",
            model: legacyModel,
            contributionGuard: { recent: { ["f".repeat(32)]: Math.floor(Date.now() / 1000) }, rates: {} },
            contributionEpoch: 4,
        }
        fs.writeFileSync(statePath, `${JSON.stringify(legacyState)}\n`)

        const migrationContribution = createContribution("00000000000000000000000000000001", 7, 4)
        delete migrationContribution.decisionSamples
        const secondContributionHeaders = {
            ...commonHeaders,
            "Content-Type": "application/json",
            "Origin": origins[1],
            "X-AI-Contribution-Token": createContributionToken(secret),
        }
        const migrationRace = await Promise.all([
            fetch(endpoints[0], { headers: commonHeaders }),
            fetch(endpoints[1], { headers: commonHeaders }),
            postJson(endpoints[1], "contribute", secondContributionHeaders, migrationContribution),
        ])
        assert.deepEqual(migrationRace.map(response => response.status), [200, 200, 200])

        let envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.modelSchema, 9)
        assert.equal(envelope.revision, 9)
        assert.equal(envelope.contributionEpoch, 4)
        assert.equal(envelope.model.version, 9)
        assert.equal(envelope.model.modelFamily, "shared-neural-controller-v1")
        assert.equal(envelope.model.totalDecisionSamples, 0)
        assert.equal(envelope.model.totalGames, 2)
        assert.equal(envelope.model.totalSyntheticEpisodes, 2)
        assert.equal(envelope.model.totalPolicySamples, 4)
        assert.equal(envelope.model.totalLoadoutSamples, 2)
        assert.equal(envelope.model.totalHumanDemonstrations, 2)
        assert.equal(envelope.model.candidateGeneration, 5)
        assert.equal(envelope.model.championGeneration, 4)
        assert.equal(envelope.model.populationPolicies.length, 2)
        assert.equal(envelope.model.tacticalStats["legacy-tactical"].samples, 1)
        assert.equal(envelope.model.placementStats["legacy-placement"].samples, 1)
        assert.match(envelope.policyDigest, /^sha256:[a-f0-9]{64}$/)
        assert.match(envelope.championPolicyDigest, /^sha256:[a-f0-9]{64}$/)
        assert.match(envelope.promotionBaseDigest, /^sha256:[a-f0-9]{64}$/)
        assertPolicyContract(envelope.model.policy)
        assertPolicyContract(envelope.model.championPolicy)
        assert.equal(envelope.modelDigest, hostedDigest(envelope.model))
        assert.equal(envelope.policyDigest, hostedDigest(envelope.model.policy))
        createHostedSnapshot(envelope)

        const migratedChampion = envelope.model.championPolicy
        const migrationFeatures = Array.from({ length: featureCount }, (_, index) => (index + 1) / 30)
        const oldLogits = legacyForward(migrationFeatures, legacyModel.championPolicy)
        const newLogits = strategyForward(migrationFeatures, migratedChampion.strategy)
        oldLogits.forEach((value, index) => assert.ok(Math.abs(value - newLogits[index]) < 1e-15))
        assert.deepEqual(migratedChampion.strategy.W1.slice(0, 12), legacyModel.championPolicy.W1)
        assert.deepEqual(migratedChampion.strategy.W2.slice(0, 8).map(row => row.slice(0, 12)), legacyModel.championPolicy.W2)
        assert.deepEqual(migratedChampion.strategy.W3.map(row => row.slice(0, 8)), legacyModel.championPolicy.W3)
        assert.deepEqual(migratedChampion.strategy.b3, legacyModel.championPolicy.b3)
        assert.ok(migratedChampion.strategy.W1.slice(12).some(row => row.some(value => value !== 0)))
        assert.ok(migratedChampion.strategy.W2.slice(8).some(row => row.some(value => value !== 0)))
        assert.ok(migratedChampion.strategy.W3.every(row => row.slice(8).every(value => value === 0)))
        assert.equal(migratedChampion.strategy.W1[12][0], canonicalWeight(12 * featureCount, 0.08, 71))
        assert.equal(migratedChampion.strategy.W2[8][0], canonicalWeight(8 * hidden1, 0.07, 83))
        assert.equal(migratedChampion.decision.WState1[0][0], canonicalWeight(0, 0.08, 11))
        assert.equal(migratedChampion.decision.WState2[1][2], canonicalWeight(1 * stateHiddenSize + 2, 0.07, 23 + 17))
        assert.deepEqual(migratedChampion.decision.trainingSamples, vector(familyCount))
        assert.deepEqual(migratedChampion, envelope.model.populationPolicies[0])
        assert.deepEqual(
            legacyForward(migrationFeatures, legacyModel.populationPolicies[2]),
            strategyForward(migrationFeatures, envelope.model.populationPolicies[1].strategy),
        )
        const migratedState = JSON.parse(fs.readFileSync(statePath, "utf8"))
        assert.equal(migratedState.revision, 9)
        assert.equal(migratedState.contributionEpoch, 4)
        assert.ok(migratedState.contributionGuard.recent["f".repeat(32)] > 0)

        const contributionHeaders = {
            ...commonHeaders,
            "Content-Type": "application/json",
            "Origin": origins[0],
            "X-AI-Contribution-Token": envelope.contributionToken,
        }
        const trainerKey = "BTDB-AI-Reset-Test-Key"
        const promotionKey = "BTDB-AI-Policy-Promotion-Test-Key"
        fs.writeFileSync(path.join(dataDir, "ai-trainer-key.sha256"), `${crypto.createHash("sha256").update(trainerKey).digest("hex")}\n`)
        fs.writeFileSync(path.join(dataDir, "ai-policy-promotion-key.sha256"), `${crypto.createHash("sha256").update(promotionKey).digest("hex")}\n`)
        const trainerHeaders = { ...commonHeaders, "Content-Type": "application/json", "X-AI-Trainer-Key": trainerKey }
        const promotionHeaders = { ...commonHeaders, "Content-Type": "application/json", "X-AI-Policy-Promotion-Key": promotionKey }

        const missingOriginHeaders = { ...contributionHeaders }
        delete missingOriginHeaders.Origin
        assert.equal((await postJson(endpoints[0], "contribute", missingOriginHeaders, createContribution("00000000000000000000000000000009", envelope.revision, 4))).status, 403)
        const wrongOriginHeaders = { ...contributionHeaders, Origin: "https://evil.example" }
        assert.equal((await postJson(endpoints[0], "contribute", wrongOriginHeaders, createContribution("0000000000000000000000000000000b", envelope.revision, 4))).status, 403)
        const invalidTokenHeaders = { ...contributionHeaders, "X-AI-Contribution-Token": "invalid" }
        assert.equal((await postJson(endpoints[0], "contribute", invalidTokenHeaders, createContribution("0000000000000000000000000000000c", envelope.revision, 4))).status, 401)

        const extraPolicyKeyModel = structuredClone(envelope.model)
        extraPolicyKeyModel.policy.extra = true
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: extraPolicyKeyModel })).status, 422)
        const wrongDimensionModel = structuredClone(envelope.model)
        wrongDimensionModel.policy.decision.WState1[0].pop()
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: wrongDimensionModel })).status, 422)
        const badAccountingModel = structuredClone(envelope.model)
        badAccountingModel.totalDecisionSamples = -1
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: badAccountingModel })).status, 422)
        const unsafeCounterModel = structuredClone(envelope.model)
        unsafeCounterModel.totalDecisionSamples = Number.MAX_SAFE_INTEGER + 1
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: unsafeCounterModel })).status, 422)
        const inconsistentLoadoutModel = structuredClone(envelope.model)
        inconsistentLoadoutModel.totalLoadoutSamples++
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: inconsistentLoadoutModel })).status, 422)
        const excessiveDecisionRateModel = structuredClone(envelope.model)
        excessiveDecisionRateModel.policy.decisionLearningRate = 0.100001
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: excessiveDecisionRateModel })).status, 422)

        const unicodeDigestModel = structuredClone(envelope.model)
        unicodeDigestModel.placementStats["\ue000"] = scoreRecord(1, 0.25)
        unicodeDigestModel.placementStats["\u{10000}"] = scoreRecord(1, -0.25)
        unicodeDigestModel.placementStats["line\u2028separator"] = scoreRecord(1, 0.5)
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: unicodeDigestModel })).status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.modelDigest, hostedDigest(envelope.model))
        createHostedSnapshot(envelope)

        const modelBeforeExhaustionTest = structuredClone(envelope.model)
        const exhaustedCounterModel = structuredClone(envelope.model)
        exhaustedCounterModel.totalDecisionSamples = Number.MAX_SAFE_INTEGER
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: exhaustedCounterModel })).status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        const exhaustedContribution = createContribution("0000000000000000000000000000000d", envelope.revision, 4, [createDecisionSample()])
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, exhaustedContribution)).status, 409)
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: modelBeforeExhaustionTest })).status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)

        const malformed = createContribution("00000000000000000000000000000002", envelope.revision, 4, [createDecisionSample({ extra: true })])
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, malformed)).status, 422)
        const malformedVector = createContribution("00000000000000000000000000000003", envelope.revision, 4, [createDecisionSample({ stateFeatures: vector(stateInputSize, 1.01) })])
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, malformedVector)).status, 422)
        const excessiveAge = createContribution("00000000000000000000000000000010", envelope.revision, 4, [createDecisionSample({ age: 1000001 })])
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, excessiveAge)).status, 422)
        const tooMany = createContribution("00000000000000000000000000000004", envelope.revision, 4, Array.from({ length: 33 }, () => createDecisionSample()))
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, tooMany)).status, 422)
        const futureRevision = createContribution("0000000000000000000000000000000e", envelope.revision + 1, 4)
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, futureRevision)).status, 409)
        const staleEpoch = createContribution("0000000000000000000000000000000f", envelope.revision, 3)
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, staleEpoch)).status, 409)

        const stateBeforeRateLimit = fs.readFileSync(statePath, "utf8")
        const rateLimitedState = JSON.parse(stateBeforeRateLimit)
        const rateKey = crypto.createHash("sha256").update("127.0.0.1").digest("hex")
        rateLimitedState.contributionGuard.rates[rateKey] = { windowStart: Math.floor(Date.now() / 1000), count: 120 }
        fs.writeFileSync(statePath, `${JSON.stringify(rateLimitedState)}\n`)
        const rateLimited = createContribution("00000000000000000000000000000011", envelope.revision, 4)
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, rateLimited)).status, 429)
        fs.writeFileSync(statePath, stateBeforeRateLimit)

        const sample = createDecisionSample()
        const policyBeforeDecision = structuredClone(envelope.model.policy)
        const championBeforeDecision = structuredClone(envelope.model.championPolicy)
        const historyBeforeDecision = structuredClone(envelope.model.populationPolicies)
        const prediction = decisionPrediction(sample, policyBeforeDecision.decision)
        const reward = matchReward(80, 0)
        const target = Math.max(-1, Math.min(1, 0.7 * sample.localReward + reward * (0.3 * Math.pow(0.985, sample.age))))
        const outputDelta = Math.max(-1, Math.min(1, target - prediction)) * (1 - prediction * prediction)
        const expectedFamilyBiasDelta = policyBeforeDecision.decisionLearningRate * outputDelta
        const trainedResponse = await postJson(
            endpoints[0],
            "contribute",
            contributionHeaders,
            createContribution("00000000000000000000000000000005", envelope.revision, 4, [sample]),
        )
        assert.equal(trainedResponse.status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.model.totalDecisionSamples, 1)
        const familyBiasDelta = envelope.model.policy.decision.familyBias[sample.familyIndex] - policyBeforeDecision.decision.familyBias[sample.familyIndex]
        assert.equal(Math.sign(familyBiasDelta), Math.sign(expectedFamilyBiasDelta))
        assert.ok(Math.abs(familyBiasDelta) <= Math.abs(expectedFamilyBiasDelta) + 1e-12)
        assert.equal(envelope.model.policy.decision.trainingSamples[sample.familyIndex], 1)
        assert.ok(policyParameterDeltaNorm(envelope.model.policy, policyBeforeDecision) <= 0.350000000001)
        assert.notDeepEqual(envelope.model.policy.decision, policyBeforeDecision.decision)
        assert.notDeepEqual(envelope.model.policy.strategy, policyBeforeDecision.strategy)
        assert.deepEqual(envelope.model.championPolicy, championBeforeDecision)
        assert.deepEqual(envelope.model.populationPolicies, historyBeforeDecision)

        const policyBeforeBatch = structuredClone(envelope.model.policy)
        const boundedBatch = Array.from({ length: 32 }, () => createDecisionSample({ localReward: 1, age: 0 }))
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, createContribution("0000000000000000000000000000000a", envelope.revision, 4, boundedBatch))).status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.model.totalDecisionSamples, 33)
        assert.equal(envelope.model.policy.decision.trainingSamples[sample.familyIndex], 33)
        assert.ok(policyParameterDeltaNorm(envelope.model.policy, policyBeforeBatch) <= 0.350000000001)

        const candidateBeforeHuman = structuredClone(envelope.model.policy)
        const humanResponse = await postJson(
            endpoints[0],
            "contribute",
            contributionHeaders,
            createHumanDemonstration("00000000000000000000000000000006", envelope.revision, 4),
        )
        assert.equal(humanResponse.status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.model.totalHumanDemonstrations, 3)
        assert.deepEqual(envelope.model.policy, candidateBeforeHuman)
        const invalidHuman = { ...createHumanDemonstration("00000000000000000000000000000007", envelope.revision, 4), decisionSamples: [] }
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, invalidHuman)).status, 422)

        const promotionRequest = {
            protocolVersion: 1,
            promotionId: `sha256:${"a".repeat(64)}`,
            sourceRevision: envelope.revision,
            expectedContributionEpoch: envelope.contributionEpoch,
            expectedPromotionBaseDigest: envelope.promotionBaseDigest,
            expectedPolicyDigest: envelope.policyDigest,
            expectedChampionGeneration: envelope.model.championGeneration,
            policy: structuredClone(envelope.model.championPolicy),
        }
        promotionRequest.policy.decision.familyBias[7] = -0.35
        const malformedPromotion = structuredClone(promotionRequest)
        malformedPromotion.policy.decision.extra = 1
        assert.equal((await postJson(endpoints[0], "promote", promotionHeaders, malformedPromotion)).status, 422)
        const unauthorizedPromotionHeaders = { ...promotionHeaders, "X-AI-Policy-Promotion-Key": "wrong-key" }
        assert.equal((await postJson(endpoints[0], "promote", unauthorizedPromotionHeaders, promotionRequest)).status, 401)
        const conflictingPromotion = structuredClone(promotionRequest)
        conflictingPromotion.expectedPromotionBaseDigest = `sha256:${"b".repeat(64)}`
        assert.equal((await postJson(endpoints[0], "promote", promotionHeaders, conflictingPromotion)).status, 409)

        const intervening = createContribution("00000000000000000000000000000008", envelope.revision, 4)
        delete intervening.decisionSamples
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, intervening)).status, 200)
        const beforePromotion = await readEnvelope(endpoints[0], commonHeaders)
        assert.notEqual(beforePromotion.policyDigest, promotionRequest.expectedPolicyDigest)
        const previousChampion = structuredClone(beforePromotion.model.championPolicy)
        const promoteResponse = await postJson(endpoints[0], "promote", promotionHeaders, promotionRequest)
        assert.equal(promoteResponse.status, 200)
        const promoteResult = await promoteResponse.json()
        assert.equal(promoteResult.candidatePolicyPreserved, true)
        assert.equal(promoteResult.championGeneration, 5)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.deepEqual(envelope.model.policy, beforePromotion.model.policy)
        assert.deepEqual(envelope.model.championPolicy, promotionRequest.policy)
        assert.equal(envelope.model.populationPolicies.length, 2)
        assert.deepEqual(envelope.model.populationPolicies[1], previousChampion)
        assert.equal(envelope.model.candidateGeneration, 5)
        assert.equal(envelope.model.championGeneration, 5)
        const promotedDigest = envelope.championPolicyDigest
        assert.notEqual(promotedDigest, beforePromotion.championPolicyDigest)
        const replayPromotion = await postJson(endpoints[0], "promote", promotionHeaders, promotionRequest)
        assert.equal(replayPromotion.status, 200)
        assert.equal((await replayPromotion.json()).duplicate, true)

        const legacyCommitModel = createLegacyModel()
        assert.equal((await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: legacyCommitModel })).status, 422)
        const commitModel = structuredClone(envelope.model)
        const commitResponse = await postJson(endpoints[0], "commit", trainerHeaders, { expectedRevision: envelope.revision, model: commitModel })
        assert.equal(commitResponse.status, 200)
        envelope = await readEnvelope(endpoints[0], commonHeaders)

        const freshModel = createModel()
        const resetResponse = await postJson(endpoints[0], "reset", trainerHeaders, { expectedRevision: envelope.revision, model: freshModel })
        assert.equal(resetResponse.status, 200)
        const resetResult = await resetResponse.json()
        assert.equal(resetResult.contributionEpoch, 5)
        assert.equal(resetResult.knowledgeReset, true)
        envelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(envelope.model.version, 9)
        assert.equal(envelope.model.modelFamily, "shared-neural-controller-v1")
        assert.equal(envelope.model.totalDecisionSamples, 0)
        assertPolicyContract(envelope.model.policy)
        assert.deepEqual(envelope.model, freshModel)
        const nonFresh = structuredClone(freshModel)
        nonFresh.totalDecisionSamples = 1
        assert.equal((await postJson(endpoints[0], "reset", trainerHeaders, { expectedRevision: envelope.revision, model: nonFresh })).status, 422)

        const resetChampion = structuredClone(envelope.model.championPolicy)
        const concurrent = Array.from({ length: 4 }, (_, index) => {
            const serverIndex = index % 2
            const headers = {
                ...commonHeaders,
                "Content-Type": "application/json",
                "Origin": origins[serverIndex],
                "X-AI-Contribution-Token": createContributionToken(secret),
            }
            const contribution = createContribution(
                (index + 32).toString(16).padStart(32, "0"),
                envelope.revision,
                5,
                [createDecisionSample({ familyIndex: index })],
            )
            return postJson(endpoints[serverIndex], "contribute", headers, contribution)
        })
        const concurrentResponses = await Promise.all(concurrent)
        assert.deepEqual(concurrentResponses.map(response => response.status), [200, 200, 200, 200])
        const finalEnvelope = await readEnvelope(endpoints[0], commonHeaders)
        assert.equal(finalEnvelope.revision, envelope.revision + 4)
        assert.equal(finalEnvelope.model.totalGames, 4)
        assert.equal(finalEnvelope.model.totalPolicySamples, 4)
        assert.equal(finalEnvelope.model.totalDecisionSamples, 4)
        assert.equal(finalEnvelope.model.strategyStats[3].games, 4)
        assert.equal(finalEnvelope.model.tacticalStats["mid|safe|ready|mid|open|light|eco|send|1"].samples, 4)
        assert.deepEqual(finalEnvelope.model.championPolicy, resetChampion)

        const finalState = JSON.parse(fs.readFileSync(statePath, "utf8"))
        const exhaustedRevisionState = structuredClone(finalState)
        exhaustedRevisionState.revision = Number.MAX_SAFE_INTEGER
        fs.writeFileSync(statePath, `${JSON.stringify(exhaustedRevisionState)}\n`)
        const exhaustedRevisionContribution = createContribution("00000000000000000000000000000012", Number.MAX_SAFE_INTEGER, 5)
        assert.equal((await postJson(endpoints[0], "contribute", contributionHeaders, exhaustedRevisionContribution)).status, 409)

        const exhaustedEpochState = structuredClone(finalState)
        exhaustedEpochState.contributionEpoch = Number.MAX_SAFE_INTEGER
        fs.writeFileSync(statePath, `${JSON.stringify(exhaustedEpochState)}\n`)
        assert.equal((await postJson(endpoints[0], "reset", trainerHeaders, { expectedRevision: finalState.revision, model: createModel() })).status, 409)

        console.log("AI endpoint integration passed: schema-9 migration, strict bundles, neural SGD, promotion, reset, and concurrent writes are serialized.")
    } finally {
        servers.forEach(server => server.kill())
        await Promise.all(servers.map(server => new Promise(resolve => server.once("exit", resolve).once("error", resolve))))
        fs.rmSync(tempRoot, { recursive: true, force: true })
    }

    if (serverErrors.some(output => output.includes("Fatal error") || output.includes("Parse error"))) {
        throw new Error(serverErrors.join("\n"))
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
