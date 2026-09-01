"use strict"

const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const {
    DECISION_CANDIDATE_INPUT_SIZE,
    DECISION_CREDIT_VERSION,
    DECISION_STATE_INPUT_SIZE,
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    GAME_VERSION,
    MAX_JSON_BYTES,
    MAX_RECOVERED_STALLS,
    MODEL_FAMILY,
    MODEL_SCHEMA_VERSION,
    POLICY_FORMAT_VERSION,
    POLICY_PARAMETER_COUNT,
    TRAIN_RESULT_KIND,
    TRAINING_INTERNAL_EVALUATION_MATCHES,
    TRAINING_LEARNING_MATCHES,
    TRAINING_MATCHES,
    aggregateEvaluationResults,
    aggregateTrainResultPolicies,
    buildPolicyPromotionRequest,
    canonicalStringify,
    computeMetrics,
    createCheckpoint,
    createHostedSnapshot,
    digest,
    finalizeResult,
    hostedDigest,
    makeSelectionReport,
    materializeAggregatedPolicyCandidate,
    materializePolicyOnlyCandidate,
    selectBestTrainResult,
    validateCheckpoint,
    validateEvaluationAggregate,
    validateEvaluationResult,
    validateHostedPromotionResponse,
    validateHostedSnapshotManifest,
    validateModel,
    validatePolicyOnlyCandidate,
    validatePolicyPromotionRequest,
    validatePromotionBundle,
    validateTrainResult,
} = require("./distributed-ai/common")
const {
    assertMigrationRetention,
    migrateSchema11Model,
    validateMigrationSource,
} = require("./distributed-ai/run-worker")
const {
    HOSTED_REQUEST_TIMEOUT_MS,
    HOSTED_RESPONSE_MAX_BYTES,
    createHostedReconciliation,
    infinityFreeChallengeCookie,
    readResponseBody,
    requestJson,
    validateEndpointUrl,
} = require("./distributed-ai/hosted-model")

const vector = (length, value = 0) => Array.from({ length }, () => value)
const matrix = (rows, columns, value = 0) => Array.from({ length: rows }, () => vector(columns, value))

function policy(value = 0) {
    return {
        formatVersion: POLICY_FORMAT_VERSION,
        strategyLearningRate: 0.03,
        decisionLearningRate: 0.02,
        strategy: {
            hiddenSize1: 64,
            hiddenSize2: 32,
            W1: matrix(64, 17, value),
            b1: vector(64),
            W2: matrix(32, 64, value),
            b2: vector(32),
            W3: matrix(75, 32, value),
            b3: vector(75),
        },
        decision: {
            stateInputSize: DECISION_STATE_INPUT_SIZE,
            candidateInputSize: DECISION_CANDIDATE_INPUT_SIZE,
            stateHiddenSize: 96,
            candidateHiddenSize: 48,
            embeddingSize: 48,
            memorySize: 16,
            survivalClassCount: 4,
            trainingSamples: vector(8),
            WState1: matrix(96, DECISION_STATE_INPUT_SIZE, value),
            bState1: vector(96),
            WState2: matrix(48, 96, value),
            bState2: vector(48),
            WCandidate1: matrix(48, DECISION_CANDIDATE_INPUT_SIZE, value),
            bCandidate1: vector(48),
            WCandidate2: matrix(48, 48, value),
            bCandidate2: vector(48),
            WStateToMemory: matrix(16, 48, value),
            WMemoryToMemory: matrix(16, 16, value),
            bMemory: vector(16),
            WMemoryToState: matrix(48, 16, value),
            WValue: vector(48),
            bValue: 0,
            WSurvival: matrix(4, 48, value),
            bSurvival: vector(4),
            familyBias: vector(8),
        },
    }
}

function schema11Policy(value = 0) {
    const legacy = policy(value)
    legacy.decision.stateInputSize = 72
    legacy.decision.candidateInputSize = 64
    legacy.decision.WState1 = legacy.decision.WState1.map(row => row.slice(0, 72))
    legacy.decision.WCandidate1 = legacy.decision.WCandidate1.map(row => row.slice(0, 64))
    return legacy
}

function expectedSchema12Policy(legacy) {
    const expected = structuredClone(legacy)
    expected.decision.stateInputSize = 80
    expected.decision.candidateInputSize = 80
    expected.decision.WState1 = expected.decision.WState1.map(row => row.concat(vector(8)))
    expected.decision.WCandidate1 = expected.decision.WCandidate1.map(row => row.concat(vector(16)))
    return expected
}

function legacyCheckpoint(legacyModel) {
    const checkpoint = {
        kind: "btdb-ai-checkpoint",
        formatVersion: FORMAT_VERSION,
        gameVersion: "v-test",
        modelSchemaVersion: legacyModel.version,
        modelFamily: legacyModel.modelFamily,
        modelDigest: digest(legacyModel),
        checkpointId: "",
        parentCheckpointId: null,
        provenance: { mode: "initialize", seed: 1, shard: "schema-11", matches: 0 },
        model: structuredClone(legacyModel),
    }
    checkpoint.checkpointId = digest(Object.fromEntries(Object.entries(checkpoint).filter(([key]) => key != "checkpointId")))
    return checkpoint
}

function model() {
    const candidatePolicy = policy()
    return {
        version: MODEL_SCHEMA_VERSION,
        modelFamily: MODEL_FAMILY,
        totalGames: 0,
        totalSyntheticEpisodes: 0,
        totalPolicySamples: 0,
        totalLoadoutSamples: 0,
        totalHumanDemonstrations: 0,
        playerProfile: { games: 0, features: vector(17) },
        strategyStats: Array.from({ length: 75 }, () => ({ games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0 })),
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
        totalDecisionSamples: 0,
        candidateGeneration: 0,
        championGeneration: 0,
        policy: candidatePolicy,
        championPolicy: structuredClone(candidatePolicy),
        populationPolicies: [],
    }
}

function match(index, result, evaluation) {
    const scenarioIndex = index % 8
    const candidateSide = Math.floor(scenarioIndex / 2) % 2 == 0 ? "left" : "right"
    const candidateRole = Math.floor(scenarioIndex / 4) % 2 == 0 ? "responder" : "probe"
    const candidateLives = result == "win" ? 80 : result == "loss" ? 0 : 50
    const opponentLives = result == "win" ? 0 : result == "loss" ? 65 : 50
    return {
        index,
        map: index % 2,
        candidateSide,
        candidateRole,
        result,
        candidateLives,
        opponentLives,
        leftLives: candidateSide == "left" ? candidateLives : opponentLives,
        rightLives: candidateSide == "right" ? candidateLives : opponentLives,
        round: 12 + index,
        frames: 1000 + index,
        evaluation,
    }
}

function trainingOutcomes(internalOutcomes) {
    assert.equal(internalOutcomes.length, TRAINING_INTERNAL_EVALUATION_MATCHES)
    return [...Array.from({ length: TRAINING_LEARNING_MATCHES }, (_, index) => index % 3 == 0 ? "win" : index % 3 == 1 ? "loss" : "tie"), ...internalOutcomes]
}

function trainResult(shard, seed, internalOutcomes, sourceCheckpoint) {
    const outcomes = trainingOutcomes(internalOutcomes)
    const summaries = outcomes.map((outcome, index) => match(index, outcome, index >= TRAINING_LEARNING_MATCHES))
    const candidateModel = model()
    candidateModel.policy.strategy.b1[0] = seed / 1000
    candidateModel.policy.decision.familyBias[0] = -seed / 2000
    candidateModel.policy.decision.trainingSamples[0] = seed
    candidateModel.totalDecisionSamples = seed
    candidateModel.placementStats.learned = { samples: 1, score: 0.5, mean: 0.5, m2: 0 }
    const candidate = createCheckpoint({
        gameVersion: sourceCheckpoint.gameVersion,
        model: candidateModel,
        parentCheckpointId: sourceCheckpoint.checkpointId,
        mode: "train",
        seed,
        shard,
        matches: summaries.length,
    })
    const internalMetrics = computeMetrics(summaries.slice(TRAINING_LEARNING_MATCHES))
    return finalizeResult({
        kind: TRAIN_RESULT_KIND,
        formatVersion: FORMAT_VERSION,
        resultId: "",
        baseCheckpointId: sourceCheckpoint.checkpointId,
        baseModelDigest: sourceCheckpoint.modelDigest,
        gameVersion: sourceCheckpoint.gameVersion,
        modelSchemaVersion: sourceCheckpoint.modelSchemaVersion,
        mode: "train",
        seed,
        shard,
        requestedMatches: summaries.length,
        completedMatches: summaries.length,
        candidate,
        metrics: computeMetrics(summaries, { builtInEvaluationScore: internalMetrics.score }),
        matches: summaries,
    })
}

function evaluationResult(shard, seed, outcomes, candidateCheckpoint, baselineCheckpoint) {
    const summaries = outcomes.map((outcome, index) => match(index, outcome, true))
    return finalizeResult({
        kind: EVALUATION_RESULT_KIND,
        formatVersion: FORMAT_VERSION,
        resultId: "",
        candidateCheckpointId: candidateCheckpoint.checkpointId,
        candidateModelDigest: candidateCheckpoint.modelDigest,
        baselineCheckpointId: baselineCheckpoint.checkpointId,
        baselineModelDigest: baselineCheckpoint.modelDigest,
        gameVersion: baselineCheckpoint.gameVersion,
        modelSchemaVersion: baselineCheckpoint.modelSchemaVersion,
        mode: "evaluate",
        seed,
        shard,
        requestedMatches: summaries.length,
        completedMatches: summaries.length,
        metrics: computeMetrics(summaries),
        matches: summaries,
    })
}

function countTensor(value) {
    return Array.isArray(value) ? value.reduce((total, child) => total + countTensor(child), 0) : 1
}

function policyParameterCounts(candidatePolicy) {
    const strategy = candidatePolicy.strategy
    const decision = candidatePolicy.decision
    return {
        strategy: [strategy.W1, strategy.b1, strategy.W2, strategy.b2, strategy.W3, strategy.b3].reduce((total, tensor) => total + countTensor(tensor), 0),
        decision: [decision.WState1, decision.bState1, decision.WState2, decision.bState2, decision.WCandidate1, decision.bCandidate1, decision.WCandidate2, decision.bCandidate2, decision.WStateToMemory, decision.WMemoryToMemory, decision.bMemory, decision.WMemoryToState, decision.WValue, decision.bValue, decision.WSurvival, decision.bSurvival, decision.familyBias].reduce((total, tensor) => total + countTensor(tensor), 0),
    }
}

function fakeResponse(chunks, contentLength = null) {
    let index = 0
    return {
        headers: { get: name => name == "content-length" ? contentLength : null },
        body: {
            getReader() {
                return {
                    async read() {
                        return index < chunks.length ? { done: false, value: chunks[index++] } : { done: true, value: undefined }
                    },
                    async cancel() {},
                }
            },
        },
    }
}

async function main() {
    assert.equal(MODEL_SCHEMA_VERSION, 12)
    assert.equal(MODEL_FAMILY, "semantic-intent-spatial-recurrent-actor-critic-v4")
    assert.equal(DECISION_STATE_INPUT_SIZE, 80)
    assert.equal(DECISION_CANDIDATE_INPUT_SIZE, 80)
    assert.equal(DECISION_CREDIT_VERSION, 3)
    assert.equal(POLICY_PARAMETER_COUNT, 26440)
    assert.equal(TRAINING_MATCHES, 192)
    assert.equal(TRAINING_LEARNING_MATCHES, 128)
    assert.equal(TRAINING_INTERNAL_EVALUATION_MATCHES, 64)
    assert.equal(MAX_JSON_BYTES, 8 * 1024 * 1024)
    assert.equal(HOSTED_REQUEST_TIMEOUT_MS, 90000)
    assert.equal(HOSTED_RESPONSE_MAX_BYTES, 8 * 1024 * 1024)
    assert.equal(await readResponseBody(fakeResponse([Buffer.from("1234"), Buffer.from("5678")]), 8), "12345678")
    await assert.rejects(readResponseBody(fakeResponse([Buffer.alloc(8), Buffer.alloc(1)]), 8), /exceeds 8 bytes/)
    await assert.rejects(readResponseBody(fakeResponse([], "8388609")), /exceeds 8388608 bytes/)
    const infinityFreeChallenge = '<html><body><script type="text/javascript" src="/aes.js" ></script><script>var a=toNumbers("f655ba9d09a112d4968c63579db590b4"),b=toNumbers("98344c2eee86c3994890592585b49f80"),c=toNumbers("aca8666ef59ce6922ce5566e59f9515f");document.cookie="__test="+toHex(slowAES.decrypt(c,2,a,b))+"; path=/";</script></body></html>'
    assert.equal(infinityFreeChallengeCookie(infinityFreeChallenge), "__test=33d42158b7f9a148cc47d4eb4b45a347")
    assert.equal(infinityFreeChallengeCookie("<html><body>Maintenance</body></html>"), null)
    assert.throws(() => infinityFreeChallengeCookie(infinityFreeChallenge.replace("aca8666ef59ce6922ce5566e59f9515f", "invalid")), /malformed InfinityFree/)
    const originalFetch = global.fetch
    const challengeRequests = []
    try {
        global.fetch = async (url, options) => {
            challengeRequests.push({ url, options })
            return challengeRequests.length == 1
                ? new Response(infinityFreeChallenge, { status: 200, headers: { "Content-Type": "text/html" } })
                : new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } })
        }
        assert.deepEqual(await requestJson("https://challenge.invalid/ai-learning.php?protocol=1", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Test-Key": "secret" },
            body: "{}",
        }), { ok: true })
    } finally {
        global.fetch = originalFetch
    }
    assert.equal(challengeRequests.length, 2)
    assert.equal(challengeRequests[0].options.headers.Cookie, undefined)
    assert.equal(challengeRequests[1].options.headers.Cookie, "__test=33d42158b7f9a148cc47d4eb4b45a347")
    assert.equal(challengeRequests[1].options.method, "POST")
    assert.equal(challengeRequests[1].options.body, "{}")
    assert.equal(challengeRequests[1].options.headers["X-Test-Key"], "secret")

    const exactPolicy = policy()
    assert.deepEqual(Object.keys(exactPolicy).sort(), ["formatVersion", "strategyLearningRate", "decisionLearningRate", "strategy", "decision"].sort())
    assert.deepEqual(Object.keys(exactPolicy.strategy).sort(), ["hiddenSize1", "hiddenSize2", "W1", "b1", "W2", "b2", "W3", "b3"].sort())
    assert.deepEqual(Object.keys(exactPolicy.decision).sort(), ["stateInputSize", "candidateInputSize", "stateHiddenSize", "candidateHiddenSize", "embeddingSize", "memorySize", "survivalClassCount", "trainingSamples", "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2", "WStateToMemory", "WMemoryToMemory", "bMemory", "WMemoryToState", "WValue", "bValue", "WSurvival", "bSurvival", "familyBias"].sort())
    assert.equal(exactPolicy.decision.WState1.length, 96)
    assert.ok(exactPolicy.decision.WState1.every(row => row.length == 80))
    assert.equal(exactPolicy.decision.WCandidate1.length, 48)
    assert.ok(exactPolicy.decision.WCandidate1.every(row => row.length == 80))
    assert.deepEqual(policyParameterCounts(exactPolicy), { strategy: 5707, decision: 20733 })
    assert.equal(Object.values(policyParameterCounts(exactPolicy)).reduce((sum, count) => sum + count, 0), 26440)

    const schema11Model = model()
    schema11Model.version = 11
    schema11Model.modelFamily = "semantic-recurrent-actor-critic-v3"
    schema11Model.totalDecisionSamples = 37
    schema11Model.totalTacticalSamples = 41
    schema11Model.candidateGeneration = 5
    schema11Model.championGeneration = 4
    schema11Model.placementStats.legacy = { samples: 2, score: 0.25, mean: 0.25, m2: 0.5 }
    schema11Model.loadoutPlacementStats.legacy = { samples: 3, score: -0.25, mean: -0.25, m2: 0.75 }
    schema11Model.timingStats.retained = { samples: 4, score: 0.5, mean: 0.5, m2: 1 }
    schema11Model.tacticalFamilyStats["human|placement|place|dart"] = { samples: 5, score: 0.6, mean: 0.6, m2: 1.25 }
    schema11Model.policy = schema11Policy(0.01)
    schema11Model.championPolicy = schema11Policy(0.02)
    schema11Model.populationPolicies = [schema11Policy(0.03), schema11Policy(0.04)]
    const schema11Policies = [schema11Model.policy, schema11Model.championPolicy, ...schema11Model.populationPolicies]
    schema11Policies.forEach((legacyPolicy, index) => {
        legacyPolicy.decision.trainingSamples = vector(8, index + 1)
        legacyPolicy.decision.familyBias = vector(8, (index + 1) / 10)
        legacyPolicy.decision.bValue = (index + 1) / 20
    })
    const schema11Before = structuredClone(schema11Model)
    validateMigrationSource(legacyCheckpoint(schema11Model))
    const safeMigration = migrateSchema11Model(schema11Model)
    assertMigrationRetention(schema11Model, safeMigration)
    assert.deepEqual(schema11Model, schema11Before)
    const expectedMigration = structuredClone(schema11Model)
    expectedMigration.version = 12
    expectedMigration.modelFamily = MODEL_FAMILY
    expectedMigration.placementStats = {}
    expectedMigration.loadoutPlacementStats = {}
    expectedMigration.tacticalFamilyStats = {}
    expectedMigration.policy = expectedSchema12Policy(schema11Model.policy)
    expectedMigration.championPolicy = expectedSchema12Policy(schema11Model.championPolicy)
    expectedMigration.populationPolicies = schema11Model.populationPolicies.map(expectedSchema12Policy)
    assert.deepEqual(safeMigration, expectedMigration)
    assert.deepEqual(Object.keys(safeMigration).sort(), Object.keys(schema11Model).sort())
    assert.deepEqual(safeMigration.tacticalFamilyStats, {})
    assert.equal(Object.prototype.hasOwnProperty.call(safeMigration, "humanTacticalStats"), false)
    validateModel(safeMigration, MODEL_SCHEMA_VERSION, MODEL_FAMILY)

    const base = createCheckpoint({ gameVersion: "v-test", model: model(), mode: "initialize", seed: 1, shard: "init", matches: 0 })
    validateCheckpoint(base)
    assert.equal(base.model.totalDecisionSamples, 0)
    const migrated = createCheckpoint({ gameVersion: "v-test", model: model(), parentCheckpointId: base.checkpointId, mode: "migrate", seed: 2, shard: "schema-migration", matches: 0 })
    validateCheckpoint(migrated)
    assert.throws(() => createCheckpoint({ gameVersion: "v-test", model: model(), mode: "migrate", seed: 2, shard: "missing-parent", matches: 0 }), /invalid migrate provenance/)
    assert.throws(() => createCheckpoint({ gameVersion: "v-test", model: model(), parentCheckpointId: base.checkpointId, mode: "migrate", seed: 2, shard: "played-matches", matches: 1 }), /invalid migrate provenance/)
    const extraModelField = model()
    extraModelField.unexpected = 0
    assert.throws(() => validateModel(extraModelField, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /keys must be exactly/)
    const missingDecisionCounter = model()
    delete missingDecisionCounter.totalDecisionSamples
    assert.throws(() => validateModel(missingDecisionCounter, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /keys must be exactly/)
    const extraPolicyModel = model()
    extraPolicyModel.policy.legacy = true
    assert.throws(() => validateModel(extraPolicyModel, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /keys must be exactly/)
    const outOfBoundsModel = model()
    outOfBoundsModel.policy.decision.familyBias[0] = 4.01
    assert.throws(() => validateModel(outOfBoundsModel, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /between -4 and 4/)
    const invalidFamilyCounterModel = model()
    invalidFamilyCounterModel.policy.decision.trainingSamples[0] = -1
    assert.throws(() => validateModel(invalidFamilyCounterModel, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /integer/)
    const excessiveDecisionRateModel = model()
    excessiveDecisionRateModel.policy.decisionLearningRate = 0.100001
    assert.throws(() => validateModel(excessiveDecisionRateModel, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /between/)
    const coercibleDimensionsModel = model()
    coercibleDimensionsModel.policy.strategy.hiddenSize1 = "64"
    assert.throws(() => validateModel(coercibleDimensionsModel, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /incompatible hidden dimensions/)
    const oldSchemaModel = model()
    oldSchemaModel.version = 8
    assert.throws(() => validateModel(oldSchemaModel, 8, MODEL_FAMILY), /must use schema 12/)

    assert.equal(canonicalStringify({ b: 1, a: [true, { d: "x", c: null }] }), '{"a":[true,{"c":null,"d":"x"}],"b":1}')
    const expectedDigest = `sha256:${crypto.createHash("sha256").update('{"a":2,"b":1}').digest("hex")}`
    assert.equal(digest({ b: 1, a: 2 }), expectedDigest)
    assert.equal(digest({ a: 2, b: 1 }), expectedDigest)
    assert.throws(() => digest({ bad: Infinity }), /non-finite/)
    assert.equal(validateEndpointUrl("https://example.invalid/ai-learning.php?protocol=1"), "https://example.invalid/ai-learning.php?protocol=1")
    assert.throws(() => validateEndpointUrl("http://example.invalid/ai-learning.php?protocol=1"), /HTTPS/)
    assert.throws(() => validateEndpointUrl("https://example.invalid/ai-learning.php?protocol=1&token=secret"), /only the protocol=1/)

    const low = Array(TRAINING_INTERNAL_EVALUATION_MATCHES).fill("loss")
    const medium = Array(TRAINING_INTERNAL_EVALUATION_MATCHES).fill("tie")
    const high = [...Array(40).fill("win"), ...Array(24).fill("loss")]
    const trainA = trainResult("a", 10, low, base)
    const trainB = trainResult("b", 11, medium, base)
    const trainC = trainResult("c", 12, high, base)
    validateTrainResult(trainA)
    assert.equal(trainC.metrics.builtInEvaluationScore, 0.625)
    assert.equal(selectBestTrainResult([trainA, trainB, trainC], base).resultId, trainC.resultId)

    const wrongPhase = structuredClone(trainC)
    wrongPhase.matches[127].evaluation = true
    wrongPhase.resultId = digest(Object.fromEntries(Object.entries(wrongPhase).filter(([key]) => key != "resultId")))
    assert.throws(() => validateTrainResult(wrongPhase), /wrong learning\/evaluation phase/)
    const wrongInternalScore = structuredClone(trainC)
    wrongInternalScore.metrics.builtInEvaluationScore = 0.5
    wrongInternalScore.resultId = digest(Object.fromEntries(Object.entries(wrongInternalScore).filter(([key]) => key != "resultId")))
    assert.throws(() => validateTrainResult(wrongInternalScore), /does not match its 64 frozen matches/)

    const materialized = materializePolicyOnlyCandidate(trainC, base)
    validatePolicyOnlyCandidate(materialized, base)
    assert.deepEqual(materialized.model.policy, trainC.candidate.model.policy)
    assert.deepEqual(materialized.model.championPolicy, trainC.candidate.model.policy)
    assert.deepEqual(materialized.model.policy.strategy, trainC.candidate.model.policy.strategy)
    assert.deepEqual(materialized.model.policy.decision, trainC.candidate.model.policy.decision)
    assert.equal(materialized.model.policy.decision.trainingSamples[0], trainC.seed)
    assert.equal(materialized.model.totalDecisionSamples, base.model.totalDecisionSamples)
    assert.deepEqual(materialized.model.placementStats, base.model.placementStats)
    assert.equal(materialized.model.championGeneration, base.model.championGeneration + 1)
    assert.equal(materialized.model.candidateGeneration, materialized.model.championGeneration)
    assert.deepEqual(materialized.model.populationPolicies, [base.model.championPolicy])
    const aggregatedPolicy = aggregateTrainResultPolicies([trainA, trainB, trainC], base)
    const aggregationRawWeights = [trainA, trainB, trainC].map(result => Math.exp((result.metrics.builtInEvaluationScore - trainC.metrics.builtInEvaluationScore) * 8))
    const aggregationWeightTotal = aggregationRawWeights.reduce((sum, weight) => sum + weight, 0)
    const expectedAggregatedBias = [trainA, trainB, trainC].reduce((sum, result, index) => sum + result.candidate.model.policy.strategy.b1[0] * aggregationRawWeights[index] / aggregationWeightTotal, 0)
    assert.ok(Math.abs(aggregatedPolicy.strategy.b1[0] - expectedAggregatedBias) < 1e-12)
    assert.equal(aggregatedPolicy.decision.trainingSamples[0], trainA.seed + trainB.seed + trainC.seed)
    const aggregatedCandidate = materializeAggregatedPolicyCandidate([trainA, trainB, trainC], base)
    validatePolicyOnlyCandidate(aggregatedCandidate, base)
    assert.deepEqual(aggregatedCandidate.model.policy, aggregatedPolicy)
    assert.equal(aggregatedCandidate.provenance.shard, "aggregate-3")
    assert.equal(aggregatedCandidate.provenance.matches, TRAINING_MATCHES * 3)

    const contaminatedModel = structuredClone(materialized.model)
    contaminatedModel.totalDecisionSamples++
    const contaminated = createCheckpoint({
        gameVersion: materialized.gameVersion,
        model: contaminatedModel,
        parentCheckpointId: base.checkpointId,
        mode: "train",
        seed: materialized.provenance.seed,
        shard: materialized.provenance.shard,
        matches: materialized.provenance.matches,
    })
    assert.throws(() => validatePolicyOnlyCandidate(contaminated, base), /model state other than/)

    const populatedModel = model()
    populatedModel.populationPolicies = [0.1, 0.2].map(value => policy(value))
    const populatedBase = createCheckpoint({ gameVersion: "v-test", model: populatedModel, mode: "initialize", seed: 3, shard: "populated", matches: 0 })
    const populatedResult = trainResult("populated-train", 25, high, populatedBase)
    const populatedCandidate = materializePolicyOnlyCandidate(populatedResult, populatedBase)
    assert.equal(populatedCandidate.model.populationPolicies.length, 2)
    assert.deepEqual(populatedCandidate.model.populationPolicies[0], populatedBase.model.populationPolicies[1])
    assert.deepEqual(populatedCandidate.model.populationPolicies[1], populatedBase.model.championPolicy)
    const oversizedPopulation = model()
    oversizedPopulation.populationPolicies = [policy(0.1), policy(0.2), policy(0.3)]
    assert.throws(() => validateModel(oversizedPopulation, MODEL_SCHEMA_VERSION, MODEL_FAMILY), /at most two policy bundles/)

    const tieZ = trainResult("z", 22, medium, base)
    const tieA = trainResult("a", 23, medium, base)
    assert.equal(selectBestTrainResult([tieZ, tieA], base).shard, "a")
    const otherBase = createCheckpoint({ gameVersion: "v-test", model: model(), mode: "initialize", seed: 2, shard: "other-init", matches: 0 })
    const incompatible = trainResult("other", 24, high, otherBase)
    assert.throws(() => selectBestTrainResult([trainA, incompatible], base), /supplied baseline/)
    assert.throws(() => validatePolicyOnlyCandidate(materialized, otherBase), /does not descend/)

    const report = makeSelectionReport([trainA, trainB, trainC], trainC, materialized)
    assert.equal(report.selectedScoreSource, "built-in-evaluation")
    assert.equal(report.selectedScore, 0.625)
    assert.equal(report.selectedSourceCheckpointId, trainC.candidate.checkpointId)
    assert.equal(report.materializedCheckpointId, materialized.checkpointId)
    assert.equal(report.aggregationMethod, "score-weighted-policy-average")
    assert.equal(report.contributorCount, 3)

    const evaluationA = evaluationResult("eval-a", 31, ["win", "tie", "loss", "win", "tie", "loss", "win", "tie"], materialized, base)
    validateEvaluationResult(evaluationA)
    const recoveredEvaluation = structuredClone(evaluationA)
    recoveredEvaluation.metrics.stalls = MAX_RECOVERED_STALLS
    finalizeResult(recoveredEvaluation)
    validateEvaluationResult(recoveredEvaluation)
    const excessiveRecovery = structuredClone(recoveredEvaluation)
    excessiveRecovery.metrics.stalls++
    finalizeResult(excessiveRecovery)
    assert.throws(() => validateEvaluationResult(excessiveRecovery), /unrecoverable failed or discarded run/)
    const aggregate = aggregateEvaluationResults([evaluationA], 0.56, 8)
    validateEvaluationAggregate(aggregate)
    assert.deepEqual(aggregate.overall, { games: 8, wins: 3, losses: 2, ties: 3, score: 0.5625 })
    assert.equal(aggregate.coverage.balanced, true)
    assert.equal(aggregate.passed, true)
    validatePromotionBundle(materialized, aggregate, base, 0.56, 8)

    const gateOutcomes = [...Array(40).fill("win"), ...Array(8).fill("tie"), ...Array(16).fill("loss")]
    const gateEvaluation = evaluationResult("eval-gate", 32, gateOutcomes, materialized, base)
    const gateAggregate = aggregateEvaluationResults([gateEvaluation], 0.58, 64)
    assert.equal(gateAggregate.overall.games, 64)
    assert.equal(gateAggregate.overall.score, 0.6875)
    assert.equal(gateAggregate.coverage.balanced, true)
    assert.equal(gateAggregate.thresholds.minimumBucketScore, 0.48)
    assert.equal(gateAggregate.thresholds.minimumSurvivalRate, 0.5)
    assert.ok(Math.abs(gateAggregate.thresholds.maximumSevereCollapseRate - 0.27) < 1e-12)
    assert.equal(gateAggregate.safety.survivalRate, 0.75)
    assert.equal(gateAggregate.safety.severeCollapseRate, 0)
    assert.equal(gateAggregate.passed, true)
    validatePromotionBundle(materialized, gateAggregate, base)

    const weakBucketOutcomes = Array.from({ length: 64 }, (_, index) => index % 8 >= 4 || Math.floor(index / 8) * 4 + index % 4 < 12 ? "win" : "loss")
    const weakBucketAggregate = aggregateEvaluationResults([evaluationResult("eval-weak-bucket", 33, weakBucketOutcomes, materialized, base)], 0.58, 64)
    assert.ok(weakBucketAggregate.overall.score > 0.58)
    assert.ok(weakBucketAggregate.byRole.responder.score < weakBucketAggregate.thresholds.minimumBucketScore)
    assert.equal(weakBucketAggregate.passed, false)

    const collapseEvaluation = structuredClone(gateEvaluation)
    let extraCollapses = 2
    for(const matchSummary of collapseEvaluation.matches) {
        if(matchSummary.result != "loss" && extraCollapses <= 0) continue
        if(matchSummary.result != "loss") extraCollapses--
        matchSummary.result = "loss"
        matchSummary.candidateLives = 0
        matchSummary.opponentLives = 100
        matchSummary.leftLives = matchSummary.candidateSide == "left" ? 0 : 100
        matchSummary.rightLives = matchSummary.candidateSide == "right" ? 0 : 100
    }
    collapseEvaluation.metrics = computeMetrics(collapseEvaluation.matches)
    collapseEvaluation.resultId = digest(Object.fromEntries(Object.entries(collapseEvaluation).filter(([key]) => key != "resultId")))
    const collapseAggregate = aggregateEvaluationResults([collapseEvaluation], 0.58, 64)
    assert.ok(collapseAggregate.overall.score > 0.58)
    assert.ok(collapseAggregate.safety.severeCollapseRate > collapseAggregate.thresholds.maximumSevereCollapseRate)
    assert.equal(collapseAggregate.passed, false)

    const shortEvaluation = evaluationResult("eval-short", 34, ["win", "win"], materialized, base)
    const unbalanced = aggregateEvaluationResults([shortEvaluation], 0, 2)
    assert.equal(unbalanced.byRole.probe.games, 0)
    assert.equal(unbalanced.coverage.balanced, false)
    assert.equal(unbalanced.passed, false)
    const wrongRole = structuredClone(evaluationA)
    wrongRole.matches[0].candidateRole = "probe"
    wrongRole.resultId = digest(Object.fromEntries(Object.entries(wrongRole).filter(([key]) => key != "resultId")))
    assert.throws(() => validateEvaluationResult(wrongRole), /fairness schedule/)

    const hostedModel = model()
    hostedModel.totalHumanDemonstrations = 2
    hostedModel.playerProfile.games = 2
    const hostedEnvelope = {
        ok: true,
        protocolVersion: 1,
        gameVersion: GAME_VERSION,
        modelSchema: MODEL_SCHEMA_VERSION,
        revision: 14,
        modelDigest: hostedDigest(hostedModel),
        policyDigest: hostedDigest(hostedModel.policy),
        championPolicyDigest: hostedDigest(hostedModel.championPolicy),
        promotionBaseDigest: `sha256:${"3".repeat(64)}`,
        updatedAt: "2026-08-29T00:00:00Z",
        model: hostedModel,
        writeEnabled: false,
        promotionEnabled: true,
        contributionEnabled: true,
        contributionToken: "excluded-from-snapshot",
        contributionRateLimit: 120,
        contributionEpoch: 3,
    }
    const hostedSnapshot = createHostedSnapshot(hostedEnvelope)
    validateHostedSnapshotManifest(hostedSnapshot.manifest, hostedSnapshot.checkpoint)
    assert.equal(hostedSnapshot.manifest.revision, 14)
    assert.equal(hostedSnapshot.checkpoint.model.totalHumanDemonstrations, 2)
    assert.equal(JSON.stringify(hostedSnapshot).includes("excluded-from-snapshot"), false)
    assert.equal(hostedSnapshot.manifest.checkpointModelDigest, digest(hostedModel))
    assert.throws(() => createHostedSnapshot({ ...hostedEnvelope, modelDigest: `sha256:${"1".repeat(64)}` }), /modelDigest does not match/)
    assert.throws(() => createHostedSnapshot({ ...hostedEnvelope, policyDigest: `sha256:${"2".repeat(64)}` }), /policyDigest does not match/)
    const tamperedManifest = structuredClone(hostedSnapshot.manifest)
    tamperedManifest.revision++
    assert.throws(() => validateHostedSnapshotManifest(tamperedManifest, hostedSnapshot.checkpoint), /snapshotId/)
    const forgedHostedDigestManifest = structuredClone(hostedSnapshot.manifest)
    forgedHostedDigestManifest.sourcePolicyDigest = `sha256:${"2".repeat(64)}`
    forgedHostedDigestManifest.snapshotId = digest(Object.fromEntries(Object.entries(forgedHostedDigestManifest).filter(([key]) => key != "snapshotId")))
    assert.throws(() => validateHostedSnapshotManifest(forgedHostedDigestManifest, hostedSnapshot.checkpoint), /hosted digests do not match/)

    const hostedTrain = trainResult("hosted", 13, high, hostedSnapshot.checkpoint)
    const hostedCandidate = materializePolicyOnlyCandidate(hostedTrain, hostedSnapshot.checkpoint)
    const promotionRequest = buildPolicyPromotionRequest(hostedSnapshot.manifest, hostedCandidate, hostedSnapshot.checkpoint)
    validatePolicyPromotionRequest(promotionRequest)
    assert.deepEqual(Object.keys(promotionRequest).sort(), ["expectedChampionGeneration", "expectedContributionEpoch", "expectedPolicyDigest", "expectedPromotionBaseDigest", "policy", "promotionId", "protocolVersion", "sourceRevision"].sort())
    assert.deepEqual(promotionRequest.policy, hostedCandidate.model.policy)
    assert.deepEqual(promotionRequest.policy.strategy, hostedCandidate.model.policy.strategy)
    assert.deepEqual(promotionRequest.policy.decision, hostedCandidate.model.policy.decision)
    assert.equal(promotionRequest.promotionId, hostedCandidate.checkpointId)
    assert.equal(Object.prototype.hasOwnProperty.call(promotionRequest, "model"), false)
    const incompletePromotion = structuredClone(promotionRequest)
    delete incompletePromotion.policy.decision
    assert.throws(() => validatePolicyPromotionRequest(incompletePromotion), /keys must be exactly/)

    const promotionResponse = {
        ok: true,
        protocolVersion: 1,
        promotionId: promotionRequest.promotionId,
        duplicate: false,
        revision: 20,
        modelDigest: `sha256:${"4".repeat(64)}`,
        contributionEpoch: 3,
        championGeneration: 1,
        promotedPolicyDigest: hostedDigest(promotionRequest.policy),
        candidatePolicyPreserved: true,
    }
    validateHostedPromotionResponse(promotionResponse, promotionRequest)
    assert.throws(() => validateHostedPromotionResponse({ ...promotionResponse, promotedPolicyDigest: `sha256:${"5".repeat(64)}` }, promotionRequest), /submitted policy bundle/)
    assert.throws(() => validateHostedPromotionResponse({ ...promotionResponse, contributionEpoch: 4 }, promotionRequest), /changed the contribution epoch/)
    assert.throws(() => validateHostedPromotionResponse({ ...promotionResponse, revision: promotionRequest.sourceRevision }, promotionRequest), /integer >= 15/)

    const hostedEvaluation = evaluationResult("hosted-eval", 44, gateOutcomes, hostedCandidate, hostedSnapshot.checkpoint)
    const hostedAggregate = aggregateEvaluationResults([hostedEvaluation], 0.58, 64)
    const reconciledModel = hostedCandidate.model
    const reconciledEnvelope = {
        ...hostedEnvelope,
        revision: 20,
        modelDigest: hostedDigest(reconciledModel),
        policyDigest: hostedDigest(reconciledModel.policy),
        championPolicyDigest: hostedDigest(reconciledModel.championPolicy),
        promotionBaseDigest: `sha256:${"8".repeat(64)}`,
        model: reconciledModel,
    }
    const reconciliation = createHostedReconciliation({
        envelope: reconciledEnvelope,
        manifest: hostedSnapshot.manifest,
        baseline: hostedSnapshot.checkpoint,
        candidate: hostedCandidate,
        evaluation: hostedAggregate,
        minimumScore: 0.58,
        minimumGames: 64,
    })
    assert.equal(reconciliation.receipt.duplicate, true)
    assert.equal(reconciliation.receipt.promotionId, hostedCandidate.checkpointId)
    assert.equal(reconciliation.receipt.promotedPolicyDigest, hostedDigest(hostedCandidate.model.championPolicy))
    assert.throws(() => createHostedReconciliation({
        envelope: hostedEnvelope,
        manifest: hostedSnapshot.manifest,
        baseline: hostedSnapshot.checkpoint,
        candidate: hostedCandidate,
        evaluation: hostedAggregate,
        minimumScore: 0.58,
        minimumGames: 64,
    }), /does not match the evaluated candidate/)

    const incompatibleEvaluation = structuredClone(evaluationA)
    incompatibleEvaluation.baselineCheckpointId = `sha256:${"f".repeat(64)}`
    incompatibleEvaluation.resultId = digest(Object.fromEntries(Object.entries(incompatibleEvaluation).filter(([key]) => key != "resultId")))
    assert.throws(() => aggregateEvaluationResults([evaluationA, incompatibleEvaluation], 0.5, 8), /not compatible/)
    const tamperedAggregate = structuredClone(aggregate)
    tamperedAggregate.byRole.probe.wins++
    assert.throws(() => validateEvaluationAggregate(tamperedAggregate), /outcomes do not add up|does not match/)
    const forgedDecision = structuredClone(aggregate)
    forgedDecision.passed = false
    forgedDecision.aggregateId = digest(Object.fromEntries(Object.entries(forgedDecision).filter(([key]) => key != "aggregateId")))
    assert.throws(() => validateEvaluationAggregate(forgedDecision), /passed is inconsistent/)
    const stalePromotion = structuredClone(aggregate)
    stalePromotion.baselineCheckpointId = otherBase.checkpointId
    stalePromotion.baselineModelDigest = otherBase.modelDigest
    stalePromotion.aggregateId = digest(Object.fromEntries(Object.entries(stalePromotion).filter(([key]) => key != "aggregateId")))
    validateEvaluationAggregate(stalePromotion)
    assert.throws(() => validatePromotionBundle(materialized, stalePromotion, base, 0.56, 8), /current baseline/)

    console.log("Distributed AI unit tests passed: schema-12 bundles, safe schema-11 migration, 192-match workers, bounded artifacts, atomic promotion, and reconciliation are deterministic.")
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
