"use strict"

const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const {
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    TRAIN_RESULT_KIND,
    aggregateEvaluationResults,
    canonicalStringify,
    computeMetrics,
    createCheckpoint,
    createHostedSnapshot,
    digest,
    finalizeResult,
    makeSelectionReport,
    materializePolicyOnlyCandidate,
    buildPolicyPromotionRequest,
    selectBestTrainResult,
    validateCheckpoint,
    validateEvaluationAggregate,
    validateEvaluationResult,
    validateHostedPromotionResponse,
    validateHostedSnapshotManifest,
    validatePolicyOnlyCandidate,
    validatePromotionBundle,
    validateTrainResult,
} = require("./distributed-ai/common")
const { createHostedReconciliation, validateEndpointUrl } = require("./distributed-ai/hosted-model")

const vector = (length, value = 0) => Array.from({ length }, () => value)
const matrix = (rows, columns, value = 0) => Array.from({ length: rows }, () => vector(columns, value))

function policy() {
    return {
        hiddenSize1: 12,
        hiddenSize2: 8,
        learningRate: 0.09,
        W1: matrix(12, 17, 0.01),
        b1: vector(12),
        W2: matrix(8, 12, -0.01),
        b2: vector(8),
        W3: matrix(75, 8, 0.02),
        b3: vector(75),
    }
}

function model() {
    const candidatePolicy = policy()
    return {
        version: 8,
        modelFamily: "bounded-contextual-bandit-v1",
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
        candidateGeneration: 0,
        championGeneration: 0,
        policy: candidatePolicy,
        championPolicy: structuredClone(candidatePolicy),
        populationPolicies: [],
    }
}

function match(index, map, candidateSide, result, candidateRole = Math.floor(index % 8 / 4) % 2 == 0 ? "responder" : "probe") {
    const lives = result == "win" ? [80, 0] : result == "loss" ? [0, 65] : [0, 0]
    const leftLives = candidateSide == "left" ? lives[0] : lives[1]
    const rightLives = candidateSide == "right" ? lives[0] : lives[1]
    return {
        index,
        map,
        candidateSide,
        candidateRole,
        result,
        candidateLives: lives[0],
        opponentLives: lives[1],
        leftLives,
        rightLives,
        round: 12 + index,
        frames: 1000 + index,
        evaluation: false,
    }
}

const base = createCheckpoint({ gameVersion: "v-test", model: model(), mode: "initialize", seed: 1, shard: "init", matches: 0 })

const hostedModel = model()
hostedModel.totalHumanDemonstrations = 2
hostedModel.playerProfile.games = 2
const hostedEnvelope = {
    ok: true,
    protocolVersion: 1,
    gameVersion: "v2.5.3",
    modelSchema: 8,
    revision: 14,
    modelDigest: `sha256:${"1".repeat(64)}`,
    policyDigest: `sha256:${"2".repeat(64)}`,
    championPolicyDigest: `sha256:${"9".repeat(64)}`,
    promotionBaseDigest: `sha256:${"3".repeat(64)}`,
    updatedAt: "2026-08-28T00:00:00Z",
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
assert.throws(() => createHostedSnapshot({ ...hostedEnvelope, gameVersion: "v-old" }), /incompatible with this game build/)
const tamperedManifest = structuredClone(hostedSnapshot.manifest)
tamperedManifest.revision++
assert.throws(() => validateHostedSnapshotManifest(tamperedManifest, hostedSnapshot.checkpoint), /snapshotId/)

function trainResult(shard, seed, outcomes, builtInEvaluationScore = null, sourceCheckpoint = base) {
    const summaries = outcomes.map((outcome, index) => match(index, index % 2, index % 2 ? "right" : "left", outcome))
    const candidateModel = model()
    candidateModel.policy.b1[0] = seed / 1000
    const candidate = createCheckpoint({
        gameVersion: sourceCheckpoint.gameVersion,
        model: candidateModel,
        parentCheckpointId: sourceCheckpoint.checkpointId,
        mode: "train",
        seed,
        shard,
        matches: summaries.length,
    })
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
        metrics: computeMetrics(summaries, { builtInEvaluationScore }),
        matches: summaries,
    })
}

function evaluationResult(shard, seed, outcomes, candidateCheckpoint = trainA.candidate, baselineCheckpoint = base) {
    const summaries = outcomes.map((outcome, index) => {
        const scenarioIndex = index % 8
        const candidateSide = Math.floor(scenarioIndex / 2) % 2 == 0 ? "left" : "right"
        const candidateRole = Math.floor(scenarioIndex / 4) % 2 == 0 ? "responder" : "probe"
        return { ...match(index, index % 2, candidateSide, outcome, candidateRole), evaluation: true }
    })
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

assert.equal(canonicalStringify({ b: 1, a: [true, { d: "x", c: null }] }), '{"a":[true,{"c":null,"d":"x"}],"b":1}')
const expectedDigest = `sha256:${crypto.createHash("sha256").update('{"a":2,"b":1}').digest("hex")}`
assert.equal(digest({ b: 1, a: 2 }), expectedDigest)
assert.equal(digest({ a: 2, b: 1 }), expectedDigest)
assert.throws(() => digest({ bad: Infinity }), /non-finite/)
assert.equal(validateEndpointUrl("https://example.invalid/ai-learning.php?protocol=1"), "https://example.invalid/ai-learning.php?protocol=1")
assert.throws(() => validateEndpointUrl("http://example.invalid/ai-learning.php?protocol=1"), /HTTPS/)
assert.throws(() => validateEndpointUrl("https://example.invalid/ai-learning.php?protocol=1&token=secret"), /only the protocol=1/)
validateCheckpoint(base)
const tamperedCheckpoint = structuredClone(base)
tamperedCheckpoint.model.policy.b1[0] = 5
assert.throws(() => validateCheckpoint(tamperedCheckpoint), /between -4 and 4/)

const trainA = trainResult("a", 10, ["win"], 0.4)
const trainB = trainResult("b", 11, ["win", "loss"], null)
const trainC = trainResult("c", 12, ["loss"], 0.6)
validateTrainResult(trainA)
assert.equal(selectBestTrainResult([trainA, trainB, trainC], base).resultId, trainC.resultId)
const materialized = materializePolicyOnlyCandidate(trainC, base)
validatePolicyOnlyCandidate(materialized, base)
assert.deepEqual(materialized.model.policy, trainC.candidate.model.policy)
assert.deepEqual(materialized.model.championPolicy, trainC.candidate.model.policy)
assert.equal(materialized.model.totalGames, base.model.totalGames)
assert.deepEqual(materialized.model.tacticalStats, base.model.tacticalStats)
assert.equal(materialized.model.championGeneration, base.model.championGeneration + 1)
assert.equal(materialized.model.candidateGeneration, materialized.model.championGeneration)
assert.deepEqual(materialized.model.populationPolicies, [base.model.championPolicy])
const hostedTrain = trainResult("hosted", 13, ["win"], 0.8, hostedSnapshot.checkpoint)
const hostedCandidate = materializePolicyOnlyCandidate(hostedTrain, hostedSnapshot.checkpoint)
const promotionRequest = buildPolicyPromotionRequest(hostedSnapshot.manifest, hostedCandidate, hostedSnapshot.checkpoint)
assert.deepEqual(Object.keys(promotionRequest).sort(), ["expectedChampionGeneration", "expectedContributionEpoch", "expectedPolicyDigest", "expectedPromotionBaseDigest", "policy", "promotionId", "protocolVersion", "sourceRevision"].sort())
assert.equal(promotionRequest.promotionId, hostedCandidate.checkpointId)
assert.equal(promotionRequest.sourceRevision, 14)
assert.equal(Object.prototype.hasOwnProperty.call(promotionRequest, "model"), false)
const promotionResponse = {
    ok: true,
    protocolVersion: 1,
    promotionId: promotionRequest.promotionId,
    duplicate: false,
    revision: 20,
    modelDigest: `sha256:${"4".repeat(64)}`,
    contributionEpoch: 3,
    championGeneration: 1,
    promotedPolicyDigest: `sha256:${"5".repeat(64)}`,
    candidatePolicyPreserved: true,
}
validateHostedPromotionResponse(promotionResponse, promotionRequest)
assert.throws(() => validateHostedPromotionResponse({ ...promotionResponse, contributionEpoch: 4 }, promotionRequest), /changed the contribution epoch/)
const report = makeSelectionReport([trainA, trainB, trainC], trainC, materialized)
assert.equal(report.selectedScoreSource, "built-in-evaluation")
assert.equal(report.selectedScore, 0.6)
assert.equal(report.selectedSourceCheckpointId, trainC.candidate.checkpointId)
assert.equal(report.materializedCheckpointId, materialized.checkpointId)

const contaminatedModel = structuredClone(materialized.model)
contaminatedModel.placementStats.injected = { samples: 1, score: 1, mean: 1, m2: 0 }
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
populatedModel.populationPolicies = [0.1, 0.2, 0.3, 0.4].map(value => {
    const historical = policy()
    historical.b1[0] = value
    return historical
})
const populatedBase = createCheckpoint({ gameVersion: "v-test", model: populatedModel, mode: "initialize", seed: 3, shard: "populated", matches: 0 })
const populatedResult = trainResult("populated-train", 25, ["win"], 0.7, populatedBase)
const populatedCandidate = materializePolicyOnlyCandidate(populatedResult, populatedBase)
assert.equal(populatedCandidate.model.populationPolicies.length, 4)
assert.deepEqual(populatedCandidate.model.populationPolicies[3], populatedBase.model.championPolicy)

const tieZ = trainResult("z", 22, ["win", "loss"], null)
const tieA = trainResult("a", 23, ["win", "loss"], null)
assert.equal(selectBestTrainResult([tieZ, tieA], base).shard, "a")
const otherBase = createCheckpoint({ gameVersion: "v-test", model: model(), mode: "initialize", seed: 2, shard: "other-init", matches: 0 })
const incompatible = trainResult("other", 24, ["win"], null, otherBase)
assert.throws(() => selectBestTrainResult([trainA, incompatible], base), /supplied baseline/)
assert.throws(() => validatePolicyOnlyCandidate(materialized, otherBase), /does not descend/)

const evaluationA = evaluationResult("eval-a", 31, ["win", "tie", "loss", "win", "tie", "loss", "win", "tie"], materialized, base)
validateEvaluationResult(evaluationA)
const aggregate = aggregateEvaluationResults([evaluationA], 0.56, 8)
validateEvaluationAggregate(aggregate)
assert.deepEqual(aggregate.overall, { games: 8, wins: 3, losses: 2, ties: 3, score: 0.5625 })
assert.deepEqual(aggregate.byMap["0"], { games: 4, wins: 2, losses: 1, ties: 1, score: 0.625 })
assert.deepEqual(aggregate.byMap["1"], { games: 4, wins: 1, losses: 1, ties: 2, score: 0.5 })
assert.deepEqual(aggregate.bySide.left, aggregate.byMap["1"])
assert.deepEqual(aggregate.bySide.right, aggregate.byMap["0"])
assert.deepEqual(aggregate.byRole.responder, aggregate.byMap["0"])
assert.deepEqual(aggregate.byRole.probe, aggregate.byMap["1"])
assert.equal(aggregate.coverage.balanced, true)
assert.equal(aggregate.passed, true)
validatePromotionBundle(materialized, aggregate, base, 0.56, 8)
const hostedEvaluation = evaluationResult("hosted-eval", 44, ["win", "tie", "loss", "win", "tie", "loss", "win", "tie"], hostedCandidate, hostedSnapshot.checkpoint)
const hostedAggregate = aggregateEvaluationResults([hostedEvaluation], 0.56, 8)
const reconciledEnvelope = {
    ...hostedEnvelope,
    revision: 20,
    modelDigest: `sha256:${"6".repeat(64)}`,
    policyDigest: `sha256:${"7".repeat(64)}`,
    promotionBaseDigest: `sha256:${"8".repeat(64)}`,
    model: hostedCandidate.model,
}
const reconciliation = createHostedReconciliation({
    envelope: reconciledEnvelope,
    manifest: hostedSnapshot.manifest,
    baseline: hostedSnapshot.checkpoint,
    candidate: hostedCandidate,
    evaluation: hostedAggregate,
    minimumScore: 0.56,
    minimumGames: 8,
})
assert.equal(reconciliation.receipt.duplicate, true)
assert.equal(reconciliation.receipt.promotionId, hostedCandidate.checkpointId)
assert.equal(reconciliation.receipt.promotedPolicyDigest, reconciledEnvelope.championPolicyDigest)
assert.throws(() => createHostedReconciliation({
    envelope: hostedEnvelope,
    manifest: hostedSnapshot.manifest,
    baseline: hostedSnapshot.checkpoint,
    candidate: hostedCandidate,
    evaluation: hostedAggregate,
    minimumScore: 0.56,
    minimumGames: 8,
}), /does not match the evaluated candidate/)
assert.equal(aggregateEvaluationResults([evaluationA], 0.57, 8).passed, false)

const shortEvaluation = evaluationResult("eval-short", 32, ["win", "win"])
const unbalanced = aggregateEvaluationResults([shortEvaluation], 0, 2)
validateEvaluationAggregate(unbalanced)
assert.equal(unbalanced.byRole.probe.games, 0)
assert.equal(unbalanced.coverage.balanced, false)
assert.equal(unbalanced.passed, false)

const incompatibleEvaluation = structuredClone(evaluationA)
incompatibleEvaluation.baselineCheckpointId = `sha256:${"f".repeat(64)}`
incompatibleEvaluation.resultId = digest(Object.fromEntries(Object.entries(incompatibleEvaluation).filter(([key]) => key != "resultId")))
assert.throws(() => aggregateEvaluationResults([evaluationA, incompatibleEvaluation], 0.5, 8), /not compatible/)

const wrongRole = structuredClone(evaluationA)
wrongRole.matches[0].candidateRole = "probe"
wrongRole.resultId = digest(Object.fromEntries(Object.entries(wrongRole).filter(([key]) => key != "resultId")))
assert.throws(() => validateEvaluationResult(wrongRole), /fairness schedule/)

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

console.log("Distributed AI unit tests passed: policy-only materialization, strict identities, fairness coverage, and aggregate validation are deterministic.")
