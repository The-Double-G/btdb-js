"use strict"

const crypto = require("node:crypto")
const fs = require("node:fs")
const http = require("node:http")
const path = require("node:path")

const ROOT = path.resolve(__dirname, "..", "..")
const FORMAT_VERSION = 1
const CHECKPOINT_KIND = "btdb-ai-checkpoint"
const TRAIN_RESULT_KIND = "btdb-ai-train-result"
const EVALUATION_RESULT_KIND = "btdb-ai-evaluation-result"
const SELECTION_REPORT_KIND = "btdb-ai-selection-report"
const EVALUATION_AGGREGATE_KIND = "btdb-ai-evaluation-aggregate"
const POLICY_LIMIT = 4
const FEATURE_COUNT = 17
const HIDDEN_SIZE_1 = 12
const HIDDEN_SIZE_2 = 8
const STRATEGY_COUNT = 75

function fail(message) {
    throw new Error(message)
}

function isPlainObject(value) {
    if(value == null || typeof value != "object" || Array.isArray(value)) return false
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
}

function assertPlainObject(value, label) {
    if(!isPlainObject(value)) fail(`${label} must be an object`)
}

function assertExactKeys(value, expected, label) {
    assertPlainObject(value, label)
    const actual = Object.keys(value).sort()
    const wanted = expected.slice().sort()
    if(actual.length != wanted.length || actual.some((key, index) => key != wanted[index])) {
        fail(`${label} keys must be exactly: ${wanted.join(", ")}`)
    }
}

function assertString(value, label, allowEmpty = false) {
    if(typeof value != "string" || (!allowEmpty && value.length == 0)) fail(`${label} must be ${allowEmpty ? "a string" : "a non-empty string"}`)
}

function assertInteger(value, label, minimum = 0) {
    if(!Number.isSafeInteger(value) || value < minimum) fail(`${label} must be an integer >= ${minimum}`)
}

function assertNumber(value, label, minimum = -Infinity, maximum = Infinity) {
    if(!Number.isFinite(value) || value < minimum || value > maximum) fail(`${label} must be finite and between ${minimum} and ${maximum}`)
}

function assertDigest(value, label) {
    if(typeof value != "string" || !/^sha256:[0-9a-f]{64}$/.test(value)) fail(`${label} must be a canonical SHA-256 identifier`)
}

function assertFiniteTree(value, label = "value", seen = new Set()) {
    if(typeof value == "number") {
        if(!Number.isFinite(value)) fail(`${label} contains a non-finite number`)
        return
    }
    if(value == null || typeof value == "string" || typeof value == "boolean") return
    if(typeof value != "object") fail(`${label} contains unsupported type ${typeof value}`)
    if(seen.has(value)) fail(`${label} contains a cycle`)
    seen.add(value)
    if(Array.isArray(value)) {
        value.forEach((item, index) => assertFiniteTree(item, `${label}[${index}]`, seen))
    } else {
        assertPlainObject(value, label)
        for(const key of Object.keys(value)) assertFiniteTree(value[key], `${label}.${key}`, seen)
    }
    seen.delete(value)
}

function canonicalStringify(value) {
    assertFiniteTree(value)
    function encode(item) {
        if(item === null) return "null"
        if(typeof item == "number" || typeof item == "boolean") return JSON.stringify(item)
        if(typeof item == "string") return JSON.stringify(item)
        if(Array.isArray(item)) return `[${item.map(encode).join(",")}]`
        return `{${Object.keys(item).sort().map(key => `${JSON.stringify(key)}:${encode(item[key])}`).join(",")}}`
    }
    return encode(value)
}

function digest(value) {
    return `sha256:${crypto.createHash("sha256").update(canonicalStringify(value)).digest("hex")}`
}

function clone(value) {
    return JSON.parse(JSON.stringify(value))
}

function validatePolicy(policy, label, strategyCount) {
    assertExactKeys(policy, ["hiddenSize1", "hiddenSize2", "learningRate", "W1", "b1", "W2", "b2", "W3", "b3"], label)
    if(policy.hiddenSize1 != HIDDEN_SIZE_1 || policy.hiddenSize2 != HIDDEN_SIZE_2) fail(`${label} has incompatible hidden dimensions`)
    assertNumber(policy.learningRate, `${label}.learningRate`, Number.MIN_VALUE, 0.2)
    const vector = (value, length, vectorLabel) => {
        if(!Array.isArray(value) || value.length != length) fail(`${vectorLabel} must contain ${length} values`)
        value.forEach((item, index) => assertNumber(item, `${vectorLabel}[${index}]`, -POLICY_LIMIT, POLICY_LIMIT))
    }
    const matrix = (value, rows, columns, matrixLabel) => {
        if(!Array.isArray(value) || value.length != rows) fail(`${matrixLabel} must contain ${rows} rows`)
        value.forEach((row, index) => vector(row, columns, `${matrixLabel}[${index}]`))
    }
    matrix(policy.W1, HIDDEN_SIZE_1, FEATURE_COUNT, `${label}.W1`)
    vector(policy.b1, HIDDEN_SIZE_1, `${label}.b1`)
    matrix(policy.W2, HIDDEN_SIZE_2, HIDDEN_SIZE_1, `${label}.W2`)
    vector(policy.b2, HIDDEN_SIZE_2, `${label}.b2`)
    matrix(policy.W3, strategyCount, HIDDEN_SIZE_2, `${label}.W3`)
    vector(policy.b3, strategyCount, `${label}.b3`)
}

const MODEL_KEYS = [
    "version", "modelFamily", "totalGames", "totalSyntheticEpisodes", "totalPolicySamples",
    "totalLoadoutSamples", "totalHumanDemonstrations", "playerProfile", "strategyStats", "loadoutStats",
    "placementStats", "loadoutPlacementStats", "timingStats", "loadoutStrategyStats", "crosspathStats",
    "loadoutCounterStats", "tacticalStats", "tacticalFamilyStats", "totalTacticalSamples", "candidateGeneration",
    "championGeneration", "policy", "championPolicy", "populationPolicies",
]

function validateModel(model, expectedSchemaVersion, expectedFamily, label = "model") {
    assertExactKeys(model, MODEL_KEYS, label)
    assertInteger(model.version, `${label}.version`, 1)
    if(model.version != expectedSchemaVersion) fail(`${label}.version does not match the checkpoint schema`)
    assertString(model.modelFamily, `${label}.modelFamily`)
    if(model.modelFamily != expectedFamily) fail(`${label}.modelFamily does not match the checkpoint family`)
    for(const key of ["totalGames", "totalSyntheticEpisodes", "totalPolicySamples", "totalLoadoutSamples", "totalHumanDemonstrations", "totalTacticalSamples", "candidateGeneration", "championGeneration"]) {
        assertInteger(model[key], `${label}.${key}`)
    }
    if(model.totalPolicySamples != model.totalGames + model.totalSyntheticEpisodes) fail(`${label}.totalPolicySamples is inconsistent`)

    assertExactKeys(model.playerProfile, ["games", "features"], `${label}.playerProfile`)
    assertInteger(model.playerProfile.games, `${label}.playerProfile.games`)
    if(!Array.isArray(model.playerProfile.features) || model.playerProfile.features.length != FEATURE_COUNT) fail(`${label}.playerProfile.features must contain ${FEATURE_COUNT} values`)
    model.playerProfile.features.forEach((value, index) => assertNumber(value, `${label}.playerProfile.features[${index}]`, 0, 1))

    if(!Array.isArray(model.strategyStats) || model.strategyStats.length != STRATEGY_COUNT) fail(`${label}.strategyStats must contain ${STRATEGY_COUNT} records`)
    model.strategyStats.forEach((record, index) => {
        const recordLabel = `${label}.strategyStats[${index}]`
        assertExactKeys(record, ["games", "wins", "losses", "ties", "syntheticEpisodes", "lastReward"], recordLabel)
        for(const key of ["games", "wins", "losses", "ties", "syntheticEpisodes"]) assertInteger(record[key], `${recordLabel}.${key}`)
        if(record.games < record.wins + record.losses + record.ties) fail(`${recordLabel}.games is smaller than its outcomes`)
        assertNumber(record.lastReward, `${recordLabel}.lastReward`, -1, 1)
    })
    const totalGames = model.strategyStats.reduce((sum, record) => sum + record.games, 0)
    const totalSynthetic = model.strategyStats.reduce((sum, record) => sum + record.syntheticEpisodes, 0)
    if(model.totalGames != totalGames || model.totalSyntheticEpisodes != totalSynthetic) fail(`${label} strategy totals are inconsistent`)

    assertPlainObject(model.loadoutStats, `${label}.loadoutStats`)
    for(const [key, record] of Object.entries(model.loadoutStats)) {
        const recordLabel = `${label}.loadoutStats[${JSON.stringify(key)}]`
        assertExactKeys(record, ["games", "wins", "losses", "ties", "lastReward"], recordLabel)
        for(const field of ["games", "wins", "losses", "ties"]) assertInteger(record[field], `${recordLabel}.${field}`)
        if(record.games != record.wins + record.losses + record.ties) fail(`${recordLabel} outcomes do not add up to games`)
        assertNumber(record.lastReward, `${recordLabel}.lastReward`, -1, 1)
    }
    const scoreStores = ["placementStats", "loadoutPlacementStats", "timingStats", "loadoutStrategyStats", "crosspathStats", "loadoutCounterStats", "tacticalStats", "tacticalFamilyStats"]
    for(const key of scoreStores) {
        assertPlainObject(model[key], `${label}.${key}`)
        for(const [recordKey, record] of Object.entries(model[key])) {
            const recordLabel = `${label}.${key}[${JSON.stringify(recordKey)}]`
            assertExactKeys(record, ["samples", "score", "mean", "m2"], recordLabel)
            assertInteger(record.samples, `${recordLabel}.samples`)
            assertNumber(record.score, `${recordLabel}.score`, -1, 1)
            assertNumber(record.mean, `${recordLabel}.mean`, -1, 1)
            assertNumber(record.m2, `${recordLabel}.m2`, 0)
        }
    }
    const totalLoadoutSamples = Object.values(model.loadoutStats).reduce((sum, record) => sum + (isPlainObject(record) && Number.isSafeInteger(record.games) ? record.games : 0), 0)
    if(model.totalLoadoutSamples != totalLoadoutSamples) fail(`${label}.totalLoadoutSamples is inconsistent`)

    const strategyCount = model.strategyStats.length
    validatePolicy(model.policy, `${label}.policy`, strategyCount)
    validatePolicy(model.championPolicy, `${label}.championPolicy`, strategyCount)
    if(!Array.isArray(model.populationPolicies) || model.populationPolicies.length > 4) fail(`${label}.populationPolicies must contain at most four policies`)
    model.populationPolicies.forEach((policy, index) => validatePolicy(policy, `${label}.populationPolicies[${index}]`, strategyCount))
    assertFiniteTree(model, label)
    return model
}

const CHECKPOINT_KEYS = ["kind", "formatVersion", "gameVersion", "modelSchemaVersion", "modelFamily", "modelDigest", "checkpointId", "parentCheckpointId", "provenance", "model"]

function checkpointIdentity(checkpoint) {
    const identity = {}
    for(const key of CHECKPOINT_KEYS) if(key != "checkpointId") identity[key] = checkpoint[key]
    return identity
}

function validateCheckpoint(checkpoint, label = "checkpoint") {
    assertExactKeys(checkpoint, CHECKPOINT_KEYS, label)
    if(checkpoint.kind != CHECKPOINT_KIND || checkpoint.formatVersion != FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    assertString(checkpoint.gameVersion, `${label}.gameVersion`)
    assertInteger(checkpoint.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertString(checkpoint.modelFamily, `${label}.modelFamily`)
    assertDigest(checkpoint.modelDigest, `${label}.modelDigest`)
    assertDigest(checkpoint.checkpointId, `${label}.checkpointId`)
    if(checkpoint.parentCheckpointId !== null) assertDigest(checkpoint.parentCheckpointId, `${label}.parentCheckpointId`)
    assertExactKeys(checkpoint.provenance, ["mode", "seed", "shard", "matches"], `${label}.provenance`)
    if(!["initialize", "train"].includes(checkpoint.provenance.mode)) fail(`${label}.provenance.mode is unsupported`)
    assertInteger(checkpoint.provenance.seed, `${label}.provenance.seed`)
    assertString(checkpoint.provenance.shard, `${label}.provenance.shard`)
    assertInteger(checkpoint.provenance.matches, `${label}.provenance.matches`)
    if(checkpoint.provenance.mode == "initialize" && (checkpoint.parentCheckpointId !== null || checkpoint.provenance.matches != 0)) fail(`${label} has invalid initialize provenance`)
    if(checkpoint.provenance.mode == "train" && checkpoint.parentCheckpointId === null) fail(`${label} train provenance requires a parent checkpoint`)
    validateModel(checkpoint.model, checkpoint.modelSchemaVersion, checkpoint.modelFamily, `${label}.model`)
    if(checkpoint.modelDigest != digest(checkpoint.model)) fail(`${label}.modelDigest does not match its model`)
    if(checkpoint.checkpointId != digest(checkpointIdentity(checkpoint))) fail(`${label}.checkpointId does not match its contents`)
    return checkpoint
}

function createCheckpoint({ gameVersion, model, parentCheckpointId = null, mode, seed, shard, matches }) {
    assertInteger(model.version, "model.version", 1)
    assertString(model.modelFamily, "model.modelFamily")
    const checkpoint = {
        kind: CHECKPOINT_KIND,
        formatVersion: FORMAT_VERSION,
        gameVersion,
        modelSchemaVersion: model.version,
        modelFamily: model.modelFamily,
        modelDigest: digest(model),
        checkpointId: "",
        parentCheckpointId,
        provenance: { mode, seed, shard, matches },
        model: clone(model),
    }
    checkpoint.checkpointId = digest(checkpointIdentity(checkpoint))
    return validateCheckpoint(checkpoint)
}

const METRICS_KEYS = ["games", "wins", "losses", "ties", "score", "averageRound", "totalFrames", "discarded", "stalls", "frameBudgetExhausted", "builtInEvaluationScore"]
const MATCH_KEYS = ["index", "map", "candidateSide", "candidateRole", "result", "candidateLives", "opponentLives", "leftLives", "rightLives", "round", "frames", "evaluation"]

function validateMetrics(metrics, label) {
    assertExactKeys(metrics, METRICS_KEYS, label)
    for(const key of ["games", "wins", "losses", "ties", "totalFrames", "discarded", "stalls", "frameBudgetExhausted"]) assertInteger(metrics[key], `${label}.${key}`)
    if(metrics.games != metrics.wins + metrics.losses + metrics.ties) fail(`${label} outcomes do not add up to games`)
    assertNumber(metrics.score, `${label}.score`, 0, 1)
    assertNumber(metrics.averageRound, `${label}.averageRound`, 0)
    if(metrics.builtInEvaluationScore !== null) assertNumber(metrics.builtInEvaluationScore, `${label}.builtInEvaluationScore`, 0, 1)
}

function validateMatch(match, label) {
    assertExactKeys(match, MATCH_KEYS, label)
    assertInteger(match.index, `${label}.index`)
    if(match.map !== 0 && match.map !== 1) fail(`${label}.map must be 0 or 1`)
    if(match.candidateSide != "left" && match.candidateSide != "right") fail(`${label}.candidateSide must be left or right`)
    if(match.candidateRole != "responder" && match.candidateRole != "probe") fail(`${label}.candidateRole must be responder or probe`)
    if(!["win", "loss", "tie"].includes(match.result)) fail(`${label}.result is invalid`)
    for(const key of ["candidateLives", "opponentLives", "leftLives", "rightLives"]) assertNumber(match[key], `${label}.${key}`, 0)
    assertInteger(match.round, `${label}.round`, 1)
    assertInteger(match.frames, `${label}.frames`, 1)
    if(typeof match.evaluation != "boolean") fail(`${label}.evaluation must be boolean`)
    const candidateLives = match.candidateSide == "left" ? match.leftLives : match.rightLives
    const opponentLives = match.candidateSide == "left" ? match.rightLives : match.leftLives
    if(match.candidateLives != candidateLives || match.opponentLives != opponentLives) fail(`${label} candidate-side lives are inconsistent`)
    const expectedResult = candidateLives > opponentLives ? "win" : candidateLives < opponentLives ? "loss" : "tie"
    if(match.result != expectedResult) fail(`${label}.result is inconsistent with lives`)
}

function resultIdentity(result) {
    const identity = {}
    for(const key of Object.keys(result)) if(key != "resultId") identity[key] = result[key]
    return identity
}

function finalizeResult(result) {
    result.resultId = digest(resultIdentity(result))
    return result
}

const TRAIN_RESULT_KEYS = ["kind", "formatVersion", "resultId", "baseCheckpointId", "baseModelDigest", "gameVersion", "modelSchemaVersion", "mode", "seed", "shard", "requestedMatches", "completedMatches", "candidate", "metrics", "matches"]
const EVALUATION_RESULT_KEYS = ["kind", "formatVersion", "resultId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest", "gameVersion", "modelSchemaVersion", "mode", "seed", "shard", "requestedMatches", "completedMatches", "metrics", "matches"]

function validateMatchesAndMetrics(result, label) {
    assertInteger(result.requestedMatches, `${label}.requestedMatches`, 1)
    assertInteger(result.completedMatches, `${label}.completedMatches`, 1)
    if(result.completedMatches != result.requestedMatches) fail(`${label} has a wrong match count`)
    if(!Array.isArray(result.matches) || result.matches.length != result.completedMatches) fail(`${label}.matches has a wrong match count`)
    result.matches.forEach((match, index) => {
        validateMatch(match, `${label}.matches[${index}]`)
        if(match.index != index) fail(`${label}.matches indices must be contiguous`)
    })
    validateMetrics(result.metrics, `${label}.metrics`)
    if(result.metrics.games != result.completedMatches) fail(`${label}.metrics.games does not match completedMatches`)
    const computed = computeMetrics(result.matches, { builtInEvaluationScore: result.metrics.builtInEvaluationScore })
    for(const key of ["wins", "losses", "ties", "totalFrames"]) if(result.metrics[key] != computed[key]) fail(`${label}.metrics.${key} is inconsistent`)
    for(const key of ["score", "averageRound"]) if(Math.abs(result.metrics[key] - computed[key]) > 1e-12) fail(`${label}.metrics.${key} is inconsistent`)
    if(result.metrics.discarded != 0 || result.metrics.stalls != 0 || result.metrics.frameBudgetExhausted != 0) fail(`${label} records a failed or discarded run`)
}

function validateTrainResult(result, label = "train result") {
    assertExactKeys(result, TRAIN_RESULT_KEYS, label)
    if(result.kind != TRAIN_RESULT_KIND || result.formatVersion != FORMAT_VERSION || result.mode != "train") fail(`${label} has an unsupported kind, version, or mode`)
    for(const key of ["resultId", "baseCheckpointId", "baseModelDigest"]) assertDigest(result[key], `${label}.${key}`)
    for(const key of ["gameVersion", "shard"]) assertString(result[key], `${label}.${key}`)
    assertInteger(result.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(result.seed, `${label}.seed`)
    validateCheckpoint(result.candidate, `${label}.candidate`)
    if(result.candidate.parentCheckpointId != result.baseCheckpointId) fail(`${label}.candidate has the wrong parent checkpoint`)
    if(result.candidate.gameVersion != result.gameVersion || result.candidate.modelSchemaVersion != result.modelSchemaVersion) fail(`${label}.candidate is incompatible with its result`)
    if(result.candidate.provenance.mode != "train" || result.candidate.provenance.seed != result.seed || result.candidate.provenance.shard != result.shard || result.candidate.provenance.matches != result.completedMatches) fail(`${label}.candidate provenance is inconsistent`)
    validateMatchesAndMetrics(result, label)
    if(result.resultId != digest(resultIdentity(result))) fail(`${label}.resultId does not match its contents`)
    return result
}

function validateTrainResultAgainstBaseline(result, baseline, label = "train result") {
    validateCheckpoint(baseline, "baseline")
    validateTrainResult(result, label)
    if(result.baseCheckpointId != baseline.checkpointId || result.baseModelDigest != baseline.modelDigest) fail(`${label} does not belong to the supplied baseline`)
    if(result.gameVersion != baseline.gameVersion || result.modelSchemaVersion != baseline.modelSchemaVersion || result.candidate.modelFamily != baseline.modelFamily) fail(`${label} is incompatible with the supplied baseline`)
    return result
}

function retainedPopulationPolicies(model) {
    const previousChampionDigest = digest(model.championPolicy)
    const policies = model.populationPolicies.filter(policy => digest(policy) != previousChampionDigest).map(clone)
    policies.push(clone(model.championPolicy))
    return policies.slice(-4)
}

function materializePolicyOnlyCandidate(result, baseline) {
    validateTrainResultAgainstBaseline(result, baseline)
    if(baseline.model.championGeneration >= Number.MAX_SAFE_INTEGER) fail("baseline championGeneration cannot be incremented")
    const model = clone(baseline.model)
    const selectedPolicy = clone(result.candidate.model.policy)
    model.policy = selectedPolicy
    model.championPolicy = clone(selectedPolicy)
    model.populationPolicies = retainedPopulationPolicies(baseline.model)
    model.championGeneration = baseline.model.championGeneration + 1
    model.candidateGeneration = model.championGeneration
    return createCheckpoint({
        gameVersion: baseline.gameVersion,
        model,
        parentCheckpointId: baseline.checkpointId,
        mode: "train",
        seed: result.seed,
        shard: result.shard,
        matches: result.completedMatches,
    })
}

function validatePolicyOnlyCandidate(candidate, baseline, label = "candidate") {
    validateCheckpoint(baseline, "baseline")
    validateCheckpoint(candidate, label)
    if(candidate.parentCheckpointId != baseline.checkpointId) fail(`${label} does not descend from the supplied baseline`)
    if(candidate.gameVersion != baseline.gameVersion || candidate.modelSchemaVersion != baseline.modelSchemaVersion || candidate.modelFamily != baseline.modelFamily) fail(`${label} is incompatible with the supplied baseline`)
    if(digest(candidate.model.policy) != digest(candidate.model.championPolicy)) fail(`${label} policy and championPolicy must match`)
    if(baseline.model.championGeneration >= Number.MAX_SAFE_INTEGER) fail("baseline championGeneration cannot be incremented")
    const expected = clone(baseline.model)
    expected.policy = clone(candidate.model.policy)
    expected.championPolicy = clone(candidate.model.policy)
    expected.populationPolicies = retainedPopulationPolicies(baseline.model)
    expected.championGeneration = baseline.model.championGeneration + 1
    expected.candidateGeneration = expected.championGeneration
    if(digest(candidate.model) != digest(expected)) fail(`${label} contains model state other than the selected policy and promotion metadata`)
    return candidate
}

function validateEvaluationResult(result, label = "evaluation result") {
    assertExactKeys(result, EVALUATION_RESULT_KEYS, label)
    if(result.kind != EVALUATION_RESULT_KIND || result.formatVersion != FORMAT_VERSION || result.mode != "evaluate") fail(`${label} has an unsupported kind, version, or mode`)
    for(const key of ["resultId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest"]) assertDigest(result[key], `${label}.${key}`)
    for(const key of ["gameVersion", "shard"]) assertString(result[key], `${label}.${key}`)
    assertInteger(result.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(result.seed, `${label}.seed`)
    validateMatchesAndMetrics(result, label)
    if(result.matches.some(match => match.evaluation !== true)) fail(`${label} contains a match that was not run in frozen evaluation mode`)
    result.matches.forEach((match, index) => {
        const scenarioIndex = index % 8
        const expectedMap = index % 2
        const expectedSide = Math.floor(scenarioIndex / 2) % 2 == 0 ? "left" : "right"
        const expectedRole = Math.floor(scenarioIndex / 4) % 2 == 0 ? "responder" : "probe"
        if(match.map != expectedMap || match.candidateSide != expectedSide || match.candidateRole != expectedRole) fail(`${label}.matches[${index}] does not follow the fairness schedule`)
    })
    if(result.metrics.builtInEvaluationScore !== null) fail(`${label} must not contain a built-in training score`)
    if(result.resultId != digest(resultIdentity(result))) fail(`${label}.resultId does not match its contents`)
    return result
}

function computeMetrics(matches, extra = {}) {
    const wins = matches.filter(match => match.result == "win").length
    const losses = matches.filter(match => match.result == "loss").length
    const ties = matches.length - wins - losses
    return {
        games: matches.length,
        wins,
        losses,
        ties,
        score: matches.length ? (wins + ties * 0.5) / matches.length : 0,
        averageRound: matches.length ? matches.reduce((sum, match) => sum + match.round, 0) / matches.length : 0,
        totalFrames: matches.reduce((sum, match) => sum + match.frames, 0),
        discarded: extra.discarded || 0,
        stalls: extra.stalls || 0,
        frameBudgetExhausted: extra.frameBudgetExhausted || 0,
        builtInEvaluationScore: extra.builtInEvaluationScore == null ? null : extra.builtInEvaluationScore,
    }
}

function selectBestTrainResult(results, baseline) {
    if(!Array.isArray(results) || results.length == 0) fail("No train shard results were found")
    validateCheckpoint(baseline, "baseline")
    const validated = results.map((result, index) => validateTrainResultAgainstBaseline(result, baseline, `train result ${index}`))
    const first = validated[0]
    const ids = new Set()
    for(const result of validated) {
        if(ids.has(result.resultId)) fail(`Duplicate train result ${result.resultId}`)
        ids.add(result.resultId)
        if(result.baseCheckpointId != first.baseCheckpointId || result.baseModelDigest != first.baseModelDigest || result.gameVersion != first.gameVersion || result.modelSchemaVersion != first.modelSchemaVersion || result.formatVersion != first.formatVersion) {
            fail("Train shard results do not share the same base checkpoint and schema")
        }
    }
    const ranked = validated.slice().sort((a, b) => {
        const aScore = a.metrics.builtInEvaluationScore == null ? a.metrics.score : a.metrics.builtInEvaluationScore
        const bScore = b.metrics.builtInEvaluationScore == null ? b.metrics.score : b.metrics.builtInEvaluationScore
        if(aScore != bScore) return bScore - aScore
        if(a.completedMatches != b.completedMatches) return b.completedMatches - a.completedMatches
        if(a.shard != b.shard) return a.shard < b.shard ? -1 : 1
        if(a.seed != b.seed) return a.seed - b.seed
        return a.resultId < b.resultId ? -1 : a.resultId > b.resultId ? 1 : 0
    })
    return ranked[0]
}

function makeSelectionReport(results, selected, materialized) {
    const summaries = results.map(result => ({
        resultId: result.resultId,
        shard: result.shard,
        seed: result.seed,
        scoreSource: result.metrics.builtInEvaluationScore == null ? "candidate-match" : "built-in-evaluation",
        score: result.metrics.builtInEvaluationScore == null ? result.metrics.score : result.metrics.builtInEvaluationScore,
        games: result.completedMatches,
        sourceCheckpointId: result.candidate.checkpointId,
    })).sort((a, b) => a.resultId < b.resultId ? -1 : a.resultId > b.resultId ? 1 : 0)
    return {
        kind: SELECTION_REPORT_KIND,
        formatVersion: FORMAT_VERSION,
        baseCheckpointId: selected.baseCheckpointId,
        baseModelDigest: selected.baseModelDigest,
        selectedResultId: selected.resultId,
        selectedSourceCheckpointId: selected.candidate.checkpointId,
        materializedCheckpointId: materialized.checkpointId,
        selectedScoreSource: selected.metrics.builtInEvaluationScore == null ? "candidate-match" : "built-in-evaluation",
        selectedScore: selected.metrics.builtInEvaluationScore == null ? selected.metrics.score : selected.metrics.builtInEvaluationScore,
        candidates: summaries,
    }
}

function emptyBucket() {
    return { games: 0, wins: 0, losses: 0, ties: 0, score: 0 }
}

function addMatch(bucket, match) {
    bucket.games++
    const outcomeKey = match.result == "loss" ? "losses" : `${match.result}s`
    bucket[outcomeKey]++
    bucket.score = (bucket.wins + bucket.ties * 0.5) / bucket.games
}

const BUCKET_KEYS = ["games", "wins", "losses", "ties", "score"]
const EVALUATION_AGGREGATE_KEYS = ["kind", "formatVersion", "aggregateId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest", "gameVersion", "modelSchemaVersion", "thresholds", "passed", "overall", "byMap", "bySide", "byRole", "coverage", "sourceResultIds"]

function validateBucket(bucket, label) {
    assertExactKeys(bucket, BUCKET_KEYS, label)
    for(const key of ["games", "wins", "losses", "ties"]) assertInteger(bucket[key], `${label}.${key}`)
    if(bucket.games != bucket.wins + bucket.losses + bucket.ties) fail(`${label} outcomes do not add up to games`)
    const score = bucket.games ? (bucket.wins + bucket.ties * 0.5) / bucket.games : 0
    assertNumber(bucket.score, `${label}.score`, 0, 1)
    if(Math.abs(bucket.score - score) > 1e-12) fail(`${label}.score is inconsistent`)
}

function coverageFor(maps, sides, roles, minimumGames) {
    const minimumPerBucket = Math.max(1, Math.ceil(minimumGames / 2))
    return {
        minimumGamesPerMap: minimumPerBucket,
        minimumGamesPerSide: minimumPerBucket,
        minimumGamesPerRole: minimumPerBucket,
        mapsCovered: maps["0"].games >= minimumPerBucket && maps["1"].games >= minimumPerBucket,
        sidesCovered: sides.left.games >= minimumPerBucket && sides.right.games >= minimumPerBucket,
        rolesCovered: roles.responder.games >= minimumPerBucket && roles.probe.games >= minimumPerBucket,
        balanced: maps["0"].games == maps["1"].games && sides.left.games == sides.right.games && roles.responder.games == roles.probe.games,
    }
}

function aggregateIdentity(aggregate) {
    const identity = {}
    for(const key of Object.keys(aggregate)) if(key != "aggregateId") identity[key] = aggregate[key]
    return identity
}

function validateEvaluationAggregate(aggregate, label = "evaluation aggregate") {
    assertExactKeys(aggregate, EVALUATION_AGGREGATE_KEYS, label)
    if(aggregate.kind != EVALUATION_AGGREGATE_KIND || aggregate.formatVersion != FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    for(const key of ["aggregateId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest"]) assertDigest(aggregate[key], `${label}.${key}`)
    assertString(aggregate.gameVersion, `${label}.gameVersion`)
    assertInteger(aggregate.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertExactKeys(aggregate.thresholds, ["minimumScore", "minimumGames"], `${label}.thresholds`)
    assertNumber(aggregate.thresholds.minimumScore, `${label}.thresholds.minimumScore`, 0, 1)
    assertInteger(aggregate.thresholds.minimumGames, `${label}.thresholds.minimumGames`, 1)
    if(typeof aggregate.passed != "boolean") fail(`${label}.passed must be boolean`)
    validateBucket(aggregate.overall, `${label}.overall`)
    assertExactKeys(aggregate.byMap, ["0", "1"], `${label}.byMap`)
    assertExactKeys(aggregate.bySide, ["left", "right"], `${label}.bySide`)
    assertExactKeys(aggregate.byRole, ["responder", "probe"], `${label}.byRole`)
    for(const [key, bucket] of Object.entries(aggregate.byMap)) validateBucket(bucket, `${label}.byMap.${key}`)
    for(const [key, bucket] of Object.entries(aggregate.bySide)) validateBucket(bucket, `${label}.bySide.${key}`)
    for(const [key, bucket] of Object.entries(aggregate.byRole)) validateBucket(bucket, `${label}.byRole.${key}`)
    for(const [dimension, buckets] of [["byMap", Object.values(aggregate.byMap)], ["bySide", Object.values(aggregate.bySide)], ["byRole", Object.values(aggregate.byRole)]]) {
        for(const key of ["games", "wins", "losses", "ties"]) {
            if(buckets.reduce((sum, bucket) => sum + bucket[key], 0) != aggregate.overall[key]) fail(`${label}.${dimension} does not add up to overall.${key}`)
        }
    }
    const expectedCoverage = coverageFor(aggregate.byMap, aggregate.bySide, aggregate.byRole, aggregate.thresholds.minimumGames)
    assertExactKeys(aggregate.coverage, Object.keys(expectedCoverage), `${label}.coverage`)
    if(canonicalStringify(aggregate.coverage) != canonicalStringify(expectedCoverage)) fail(`${label}.coverage is inconsistent`)
    if(!Array.isArray(aggregate.sourceResultIds) || aggregate.sourceResultIds.length == 0) fail(`${label}.sourceResultIds must be non-empty`)
    aggregate.sourceResultIds.forEach((id, index) => assertDigest(id, `${label}.sourceResultIds[${index}]`))
    if(new Set(aggregate.sourceResultIds).size != aggregate.sourceResultIds.length) fail(`${label}.sourceResultIds contains duplicates`)
    if(aggregate.sourceResultIds.some((id, index) => index > 0 && aggregate.sourceResultIds[index - 1] >= id)) fail(`${label}.sourceResultIds must be sorted`)
    const expectedPassed = aggregate.overall.games >= aggregate.thresholds.minimumGames && aggregate.overall.score >= aggregate.thresholds.minimumScore && expectedCoverage.mapsCovered && expectedCoverage.sidesCovered && expectedCoverage.rolesCovered && expectedCoverage.balanced
    if(aggregate.passed != expectedPassed) fail(`${label}.passed is inconsistent`)
    if(aggregate.aggregateId != digest(aggregateIdentity(aggregate))) fail(`${label}.aggregateId does not match its contents`)
    return aggregate
}

function validatePromotionBundle(candidate, evaluation, baseline, minimumScore = 0.56, minimumGames = 32) {
    assertNumber(minimumScore, "minimumScore", 0, 1)
    assertInteger(minimumGames, "minimumGames", 1)
    validatePolicyOnlyCandidate(candidate, baseline)
    validateEvaluationAggregate(evaluation, "evaluation")
    if(evaluation.candidateCheckpointId != candidate.checkpointId || evaluation.candidateModelDigest != candidate.modelDigest) fail("Evaluation does not belong to the candidate")
    if(evaluation.baselineCheckpointId != baseline.checkpointId || evaluation.baselineModelDigest != baseline.modelDigest) fail("Evaluation does not use the current baseline")
    if(evaluation.gameVersion != candidate.gameVersion || evaluation.modelSchemaVersion != candidate.modelSchemaVersion) fail("Evaluation schema does not match the candidate")
    if(evaluation.passed !== true) fail("Evaluation did not pass its declared thresholds and coverage")
    if(evaluation.overall.score < minimumScore || evaluation.overall.games < minimumGames) fail(`Evaluation does not meet the promotion minimum of ${minimumGames} games and score ${minimumScore}`)
    return { candidate, evaluation, baseline }
}

function aggregateEvaluationResults(results, minimumScore, minimumGames) {
    assertNumber(minimumScore, "minimumScore", 0, 1)
    assertInteger(minimumGames, "minimumGames", 1)
    if(!Array.isArray(results) || results.length == 0) fail("No evaluation results were found")
    const validated = results.map((result, index) => validateEvaluationResult(result, `evaluation result ${index}`))
    const first = validated[0]
    const ids = new Set()
    for(const result of validated) {
        if(ids.has(result.resultId)) fail(`Duplicate evaluation result ${result.resultId}`)
        ids.add(result.resultId)
        if(result.candidateCheckpointId != first.candidateCheckpointId || result.candidateModelDigest != first.candidateModelDigest || result.baselineCheckpointId != first.baselineCheckpointId || result.baselineModelDigest != first.baselineModelDigest || result.gameVersion != first.gameVersion || result.modelSchemaVersion != first.modelSchemaVersion || result.formatVersion != first.formatVersion) {
            fail("Evaluation results are not compatible")
        }
    }
    const overall = emptyBucket()
    const maps = { "0": emptyBucket(), "1": emptyBucket() }
    const sides = { left: emptyBucket(), right: emptyBucket() }
    const roles = { responder: emptyBucket(), probe: emptyBucket() }
    for(const result of validated) for(const match of result.matches) {
        addMatch(overall, match)
        addMatch(maps[String(match.map)], match)
        addMatch(sides[match.candidateSide], match)
        addMatch(roles[match.candidateRole], match)
    }
    const coverage = coverageFor(maps, sides, roles, minimumGames)
    const aggregate = {
        kind: EVALUATION_AGGREGATE_KIND,
        formatVersion: FORMAT_VERSION,
        aggregateId: "",
        candidateCheckpointId: first.candidateCheckpointId,
        candidateModelDigest: first.candidateModelDigest,
        baselineCheckpointId: first.baselineCheckpointId,
        baselineModelDigest: first.baselineModelDigest,
        gameVersion: first.gameVersion,
        modelSchemaVersion: first.modelSchemaVersion,
        thresholds: { minimumScore, minimumGames },
        passed: overall.games >= minimumGames && overall.score >= minimumScore && coverage.mapsCovered && coverage.sidesCovered && coverage.rolesCovered && coverage.balanced,
        overall,
        byMap: maps,
        bySide: sides,
        byRole: roles,
        coverage,
        sourceResultIds: validated.map(result => result.resultId).sort(),
    }
    aggregate.aggregateId = digest(aggregateIdentity(aggregate))
    return validateEvaluationAggregate(aggregate)
}

function evaluationMarkdown(aggregate) {
    const percent = score => `${(score * 100).toFixed(2)}%`
    const row = (name, bucket) => `| ${name} | ${bucket.games} | ${bucket.wins} | ${bucket.losses} | ${bucket.ties} | ${percent(bucket.score)} |`
    return [
        "# Distributed AI Evaluation",
        "",
        `Decision: **${aggregate.passed ? "PASS" : "FAIL"}**`,
        "",
        `Candidate: \`${aggregate.candidateCheckpointId}\`  `,
        `Baseline: \`${aggregate.baselineCheckpointId}\`  `,
        `Required: at least ${aggregate.thresholds.minimumGames} games and ${percent(aggregate.thresholds.minimumScore)} score`,
        `Coverage: at least ${aggregate.coverage.minimumGamesPerMap} games per map, ${aggregate.coverage.minimumGamesPerSide} per candidate side, and ${aggregate.coverage.minimumGamesPerRole} per candidate role; all splits must be balanced`,
        "",
        "| Split | Games | Wins | Losses | Ties | Score |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
        row("Overall", aggregate.overall),
        row("Map 0", aggregate.byMap["0"]),
        row("Map 1", aggregate.byMap["1"]),
        row("Candidate left", aggregate.bySide.left),
        row("Candidate right", aggregate.bySide.right),
        row("Candidate responder", aggregate.byRole.responder),
        row("Candidate probe", aggregate.byRole.probe),
        "",
    ].join("\n")
}

function parseArgs(argv, allowed) {
    const allowedSet = new Set(allowed)
    const result = {}
    for(let index = 0; index < argv.length; index++) {
        const token = argv[index]
        if(token == "--help") {
            result.help = true
            continue
        }
        if(!token.startsWith("--")) fail(`Unexpected positional argument: ${token}`)
        const key = token.slice(2)
        if(!allowedSet.has(key)) fail(`Unknown argument: --${key}`)
        if(Object.prototype.hasOwnProperty.call(result, key)) fail(`Duplicate argument: --${key}`)
        if(index + 1 >= argv.length || argv[index + 1].startsWith("--")) fail(`Missing value for --${key}`)
        result[key] = argv[++index]
    }
    return result
}

function requiredArg(args, key) {
    if(typeof args[key] != "string" || args[key].length == 0) fail(`--${key} is required`)
    return args[key]
}

function integerArg(args, key, options = {}) {
    const raw = requiredArg(args, key)
    if(!/^(0|[1-9]\d*)$/.test(raw)) fail(`--${key} must be a non-negative integer`)
    const value = Number(raw)
    assertInteger(value, `--${key}`, options.minimum == null ? 0 : options.minimum)
    if(options.maximum != null && value > options.maximum) fail(`--${key} must be <= ${options.maximum}`)
    return value
}

function numberArg(args, key, defaultValue) {
    if(args[key] == null) return defaultValue
    const value = Number(args[key])
    if(!Number.isFinite(value)) fail(`--${key} must be finite`)
    return value
}

function readJson(filePath) {
    let parsed
    try {
        parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
    } catch(error) {
        fail(`Unable to read JSON ${filePath}: ${error.message}`)
    }
    assertFiniteTree(parsed, filePath)
    return parsed
}

function jsonFilesRecursively(directory) {
    const absolute = path.resolve(directory)
    if(!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) fail(`Results directory does not exist: ${absolute}`)
    const files = []
    function visit(current) {
        for(const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            const child = path.join(current, entry.name)
            if(entry.isDirectory()) visit(child)
            else if(entry.isFile() && entry.name.toLowerCase().endsWith(".json")) files.push(child)
        }
    }
    visit(absolute)
    return files
}

function isWithin(parent, child) {
    const relative = path.relative(parent, child)
    return relative == "" || (!relative.startsWith(`..${path.sep}`) && relative != ".." && !path.isAbsolute(relative))
}

function assertSafeOutputPath(filePath) {
    const absolute = path.resolve(filePath)
    if(isWithin(path.join(ROOT, "data"), absolute)) fail("Distributed AI outputs must not be written under data/")
    return absolute
}

function writeJson(filePath, value) {
    assertFiniteTree(value)
    const absolute = assertSafeOutputPath(filePath)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    const temporary = `${absolute}.${process.pid}.tmp`
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "w" })
    fs.renameSync(temporary, absolute)
    return absolute
}

function writeText(filePath, value) {
    const absolute = assertSafeOutputPath(filePath)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    const temporary = `${absolute}.${process.pid}.tmp`
    fs.writeFileSync(temporary, value, { encoding: "utf8", flag: "w" })
    fs.renameSync(temporary, absolute)
    return absolute
}

function createStaticServer(root = ROOT) {
    const absoluteRoot = fs.realpathSync(root)
    const errors = []
    const mimeTypes = {
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
    }
    const server = http.createServer((request, response) => {
        try {
            const remote = request.socket.remoteAddress || ""
            if(!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remote)) {
                response.writeHead(403).end("Forbidden")
                return
            }
            if(request.method != "GET" && request.method != "HEAD") {
                response.writeHead(405, { Allow: "GET, HEAD" }).end("Method Not Allowed")
                return
            }
            const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname)
            const relative = pathname == "/" ? "index.html" : pathname.replace(/^\/+/, "")
            if(relative.split("/").some(part => part.startsWith(".")) || relative == "data" || relative.startsWith("data/")) {
                response.writeHead(404).end("Not Found")
                return
            }
            const candidate = path.resolve(absoluteRoot, relative)
            if(!isWithin(absoluteRoot, candidate) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
                response.writeHead(404).end("Not Found")
                return
            }
            const realCandidate = fs.realpathSync(candidate)
            if(!isWithin(absoluteRoot, realCandidate)) {
                response.writeHead(403).end("Forbidden")
                return
            }
            const headers = {
                "Cache-Control": "no-store",
                "Content-Type": mimeTypes[path.extname(realCandidate).toLowerCase()] || "application/octet-stream",
                "X-Content-Type-Options": "nosniff",
            }
            const size = fs.statSync(realCandidate).size
            response.writeHead(200, { ...headers, "Content-Length": size })
            if(request.method == "HEAD") response.end()
            else fs.createReadStream(realCandidate).on("error", error => response.destroy(error)).pipe(response)
        } catch(error) {
            errors.push(error)
            if(!response.headersSent) response.writeHead(500)
            response.end("Internal Server Error")
        }
    })
    server.on("clientError", error => errors.push(error))
    return {
        errors,
        async start() {
            await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject))
            const address = server.address()
            return `http://127.0.0.1:${address.port}`
        },
        async close() {
            if(!server.listening) return
            await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
        },
    }
}

function defaultMarkdownPath(jsonPath) {
    const parsed = path.parse(jsonPath)
    return path.join(parsed.dir, `${parsed.name}.md`)
}

module.exports = {
    CHECKPOINT_KIND,
    EVALUATION_AGGREGATE_KIND,
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    ROOT,
    SELECTION_REPORT_KIND,
    TRAIN_RESULT_KIND,
    aggregateEvaluationResults,
    assertFiniteTree,
    canonicalStringify,
    clone,
    computeMetrics,
    createCheckpoint,
    createStaticServer,
    defaultMarkdownPath,
    digest,
    evaluationMarkdown,
    fail,
    finalizeResult,
    integerArg,
    jsonFilesRecursively,
    makeSelectionReport,
    materializePolicyOnlyCandidate,
    numberArg,
    parseArgs,
    readJson,
    requiredArg,
    selectBestTrainResult,
    validateCheckpoint,
    validateEvaluationAggregate,
    validateEvaluationResult,
    validateModel,
    validatePolicyOnlyCandidate,
    validatePromotionBundle,
    validateTrainResult,
    validateTrainResultAgainstBaseline,
    writeJson,
    writeText,
}
