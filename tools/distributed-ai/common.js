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
const HOSTED_SNAPSHOT_KIND = "btdb-ai-hosted-snapshot"
const HOSTED_PROMOTION_RECEIPT_KIND = "btdb-ai-hosted-promotion-receipt"
const POLICY_LIMIT = 4
const POLICY_FORMAT_VERSION = 2
const GAME_VERSION = "v2.6.0"
const MODEL_SCHEMA_VERSION = 13
const MODEL_FAMILY = "semantic-intent-spatial-recurrent-actor-critic-v5"
const MAX_JSON_BYTES = 8 * 1024 * 1024
const MAX_RECOVERED_STALLS = 3
const FEATURE_COUNT = 17
const STRATEGY_HIDDEN_SIZE_1 = 64
const STRATEGY_HIDDEN_SIZE_2 = 32
const STRATEGY_COUNT = 75
const DECISION_STATE_INPUT_SIZE = 112
const DECISION_CANDIDATE_INPUT_SIZE = 112
const DECISION_CREDIT_VERSION = 3
const DECISION_STATE_HIDDEN_SIZE = 96
const DECISION_CANDIDATE_HIDDEN_SIZE = 48
const DECISION_EMBEDDING_SIZE = 48
const DECISION_MEMORY_SIZE = 16
const DECISION_SURVIVAL_CLASS_COUNT = 4
const DECISION_FAMILY_COUNT = 8
const POLICY_PARAMETER_COUNT = 31048
const TRAINING_LEARNING_MATCHES = 128
const TRAINING_INTERNAL_EVALUATION_MATCHES = 64
const TRAINING_MATCHES = TRAINING_LEARNING_MATCHES + TRAINING_INTERNAL_EVALUATION_MATCHES
const EVALUATION_AGGREGATE_FORMAT_VERSION = 2
const ABSOLUTE_DEFENSE_MINIMUM_LIVES = 50
const ABSOLUTE_DEFENSE_MINIMUM_FLOOR_LIVES = 25
const ABSOLUTE_DEFENSE_MINIMUM_RATE = 0.75
const MAX_PROMOTION_STRATEGY_DELTA = 10000
const STRATEGY_STAT_KEYS = ["games", "wins", "losses", "ties", "syntheticEpisodes"]

function maxRecoveredStalls(matches) {
    return Math.max(MAX_RECOVERED_STALLS, Math.ceil(matches / 8))
}

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

function assertBoolean(value, label) {
    if(typeof value != "boolean") fail(`${label} must be boolean`)
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

function hostedDigest(value) {
    assertFiniteTree(value)
    function encode(item) {
        if(item === null) return "null"
        if(typeof item == "number") {
            if(Number.isSafeInteger(item)) return `i:${item}`
            const bytes = Buffer.allocUnsafe(8)
            bytes.writeDoubleBE(item)
            return `f:${bytes.toString("hex")}`
        }
        if(typeof item == "boolean") return item ? "true" : "false"
        if(typeof item == "string") return `s:${Buffer.from(item, "utf8").toString("hex")}`
        if(Array.isArray(item)) return `[${item.map(encode).join(",")}]`
        return `{${Object.keys(item).map(key => [encode(key), item[key]]).sort((left, right) => left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0).map(entry => `${entry[0]}:${encode(entry[1])}`).join(",")}}`
    }
    return `sha256:${crypto.createHash("sha256").update(encode(value)).digest("hex")}`
}

function clone(value) {
    return JSON.parse(JSON.stringify(value))
}

function validatePolicy(policy, label, strategyCount) {
    assertExactKeys(policy, ["formatVersion", "strategyLearningRate", "decisionLearningRate", "strategy", "decision"], label)
    if(policy.formatVersion !== POLICY_FORMAT_VERSION) fail(`${label}.formatVersion must be ${POLICY_FORMAT_VERSION}`)
    assertNumber(policy.strategyLearningRate, `${label}.strategyLearningRate`, Number.MIN_VALUE, 0.2)
    assertNumber(policy.decisionLearningRate, `${label}.decisionLearningRate`, Number.MIN_VALUE, 0.1)
    const vector = (value, length, vectorLabel) => {
        if(!Array.isArray(value) || value.length != length) fail(`${vectorLabel} must contain ${length} values`)
        value.forEach((item, index) => assertNumber(item, `${vectorLabel}[${index}]`, -POLICY_LIMIT, POLICY_LIMIT))
    }
    const matrix = (value, rows, columns, matrixLabel) => {
        if(!Array.isArray(value) || value.length != rows) fail(`${matrixLabel} must contain ${rows} rows`)
        value.forEach((row, index) => vector(row, columns, `${matrixLabel}[${index}]`))
    }

    const strategy = policy.strategy
    const strategyLabel = `${label}.strategy`
    assertExactKeys(strategy, ["hiddenSize1", "hiddenSize2", "W1", "b1", "W2", "b2", "W3", "b3"], strategyLabel)
    if(strategy.hiddenSize1 !== STRATEGY_HIDDEN_SIZE_1 || strategy.hiddenSize2 !== STRATEGY_HIDDEN_SIZE_2) fail(`${strategyLabel} has incompatible hidden dimensions`)
    matrix(strategy.W1, STRATEGY_HIDDEN_SIZE_1, FEATURE_COUNT, `${strategyLabel}.W1`)
    vector(strategy.b1, STRATEGY_HIDDEN_SIZE_1, `${strategyLabel}.b1`)
    matrix(strategy.W2, STRATEGY_HIDDEN_SIZE_2, STRATEGY_HIDDEN_SIZE_1, `${strategyLabel}.W2`)
    vector(strategy.b2, STRATEGY_HIDDEN_SIZE_2, `${strategyLabel}.b2`)
    matrix(strategy.W3, strategyCount, STRATEGY_HIDDEN_SIZE_2, `${strategyLabel}.W3`)
    vector(strategy.b3, strategyCount, `${strategyLabel}.b3`)

    const decision = policy.decision
    const decisionLabel = `${label}.decision`
    assertExactKeys(decision, [
        "stateInputSize", "candidateInputSize", "stateHiddenSize", "candidateHiddenSize", "embeddingSize", "memorySize", "survivalClassCount",
        "trainingSamples",
        "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2",
        "WStateToMemory", "WMemoryToMemory", "bMemory", "WMemoryToState", "WValue", "bValue", "WSurvival", "bSurvival", "familyBias",
    ], decisionLabel)
    if(decision.stateInputSize !== DECISION_STATE_INPUT_SIZE
        || decision.candidateInputSize !== DECISION_CANDIDATE_INPUT_SIZE
        || decision.stateHiddenSize !== DECISION_STATE_HIDDEN_SIZE
        || decision.candidateHiddenSize !== DECISION_CANDIDATE_HIDDEN_SIZE
        || decision.embeddingSize !== DECISION_EMBEDDING_SIZE
        || decision.memorySize !== DECISION_MEMORY_SIZE
        || decision.survivalClassCount !== DECISION_SURVIVAL_CLASS_COUNT) fail(`${decisionLabel} has incompatible dimensions`)
    if(!Array.isArray(decision.trainingSamples) || decision.trainingSamples.length != DECISION_FAMILY_COUNT) fail(`${decisionLabel}.trainingSamples must contain ${DECISION_FAMILY_COUNT} counters`)
    decision.trainingSamples.forEach((value, index) => assertInteger(value, `${decisionLabel}.trainingSamples[${index}]`))
    matrix(decision.WState1, DECISION_STATE_HIDDEN_SIZE, DECISION_STATE_INPUT_SIZE, `${decisionLabel}.WState1`)
    vector(decision.bState1, DECISION_STATE_HIDDEN_SIZE, `${decisionLabel}.bState1`)
    matrix(decision.WState2, DECISION_EMBEDDING_SIZE, DECISION_STATE_HIDDEN_SIZE, `${decisionLabel}.WState2`)
    vector(decision.bState2, DECISION_EMBEDDING_SIZE, `${decisionLabel}.bState2`)
    matrix(decision.WCandidate1, DECISION_CANDIDATE_HIDDEN_SIZE, DECISION_CANDIDATE_INPUT_SIZE, `${decisionLabel}.WCandidate1`)
    vector(decision.bCandidate1, DECISION_CANDIDATE_HIDDEN_SIZE, `${decisionLabel}.bCandidate1`)
    matrix(decision.WCandidate2, DECISION_EMBEDDING_SIZE, DECISION_CANDIDATE_HIDDEN_SIZE, `${decisionLabel}.WCandidate2`)
    vector(decision.bCandidate2, DECISION_EMBEDDING_SIZE, `${decisionLabel}.bCandidate2`)
    matrix(decision.WStateToMemory, DECISION_MEMORY_SIZE, DECISION_EMBEDDING_SIZE, `${decisionLabel}.WStateToMemory`)
    matrix(decision.WMemoryToMemory, DECISION_MEMORY_SIZE, DECISION_MEMORY_SIZE, `${decisionLabel}.WMemoryToMemory`)
    vector(decision.bMemory, DECISION_MEMORY_SIZE, `${decisionLabel}.bMemory`)
    matrix(decision.WMemoryToState, DECISION_EMBEDDING_SIZE, DECISION_MEMORY_SIZE, `${decisionLabel}.WMemoryToState`)
    vector(decision.WValue, DECISION_EMBEDDING_SIZE, `${decisionLabel}.WValue`)
    assertNumber(decision.bValue, `${decisionLabel}.bValue`, -POLICY_LIMIT, POLICY_LIMIT)
    matrix(decision.WSurvival, DECISION_SURVIVAL_CLASS_COUNT, DECISION_EMBEDDING_SIZE, `${decisionLabel}.WSurvival`)
    vector(decision.bSurvival, DECISION_SURVIVAL_CLASS_COUNT, `${decisionLabel}.bSurvival`)
    vector(decision.familyBias, DECISION_FAMILY_COUNT, `${decisionLabel}.familyBias`)
    const parameterCount = strategy.W1.length * strategy.W1[0].length + strategy.b1.length
        + strategy.W2.length * strategy.W2[0].length + strategy.b2.length
        + strategy.W3.length * strategy.W3[0].length + strategy.b3.length
        + decision.WState1.length * decision.WState1[0].length + decision.bState1.length
        + decision.WState2.length * decision.WState2[0].length + decision.bState2.length
        + decision.WCandidate1.length * decision.WCandidate1[0].length + decision.bCandidate1.length
        + decision.WCandidate2.length * decision.WCandidate2[0].length + decision.bCandidate2.length
        + decision.WStateToMemory.length * decision.WStateToMemory[0].length
        + decision.WMemoryToMemory.length * decision.WMemoryToMemory[0].length + decision.bMemory.length
        + decision.WMemoryToState.length * decision.WMemoryToState[0].length
        + decision.WValue.length + 1
        + decision.WSurvival.length * decision.WSurvival[0].length + decision.bSurvival.length
        + decision.familyBias.length
    if(parameterCount != POLICY_PARAMETER_COUNT) fail(`${label} must contain exactly ${POLICY_PARAMETER_COUNT} policy parameters`)
}

function validateStrategyStats(strategyStats, label = "strategyStats") {
    if(!Array.isArray(strategyStats) || strategyStats.length != STRATEGY_COUNT) fail(`${label} must contain ${STRATEGY_COUNT} records`)
    strategyStats.forEach((record, index) => {
        const recordLabel = `${label}[${index}]`
        assertExactKeys(record, STRATEGY_STAT_KEYS.concat("lastReward"), recordLabel)
        for(const key of STRATEGY_STAT_KEYS) assertInteger(record[key], `${recordLabel}.${key}`)
        if(record.games < record.wins + record.losses + record.ties) fail(`${recordLabel}.games is smaller than its outcomes`)
        assertNumber(record.lastReward, `${recordLabel}.lastReward`, -1, 1)
    })
    return strategyStats
}

function validateStrategyStatsDelta(candidateStats, baselineStats, label = "strategyStats") {
    validateStrategyStats(candidateStats, `${label}.candidate`)
    validateStrategyStats(baselineStats, `${label}.baseline`)
    for(let index = 0; index < STRATEGY_COUNT; index++) {
        for(const key of STRATEGY_STAT_KEYS) {
            const delta = candidateStats[index][key] - baselineStats[index][key]
            if(delta < 0 || delta > MAX_PROMOTION_STRATEGY_DELTA) fail(`${label}[${index}].${key} is outside the allowed training delta`)
        }
    }
    return candidateStats
}

const MODEL_KEYS = [
    "version", "modelFamily", "totalGames", "totalSyntheticEpisodes", "totalPolicySamples",
    "totalLoadoutSamples", "totalHumanDemonstrations", "strategyStats", "loadoutStats",
    "placementStats", "loadoutPlacementStats", "timingStats", "loadoutStrategyStats", "crosspathStats",
    "loadoutCounterStats", "tacticalStats", "tacticalFamilyStats", "totalTacticalSamples", "totalDecisionSamples", "candidateGeneration",
    "championGeneration", "policy", "championPolicy", "populationPolicies",
]

function validateModel(model, expectedSchemaVersion, expectedFamily, label = "model") {
    assertExactKeys(model, MODEL_KEYS, label)
    if(expectedSchemaVersion !== MODEL_SCHEMA_VERSION || expectedFamily !== MODEL_FAMILY) fail(`${label} must use schema ${MODEL_SCHEMA_VERSION} and family ${MODEL_FAMILY}`)
    assertInteger(model.version, `${label}.version`, 1)
    if(model.version !== expectedSchemaVersion) fail(`${label}.version does not match the checkpoint schema`)
    assertString(model.modelFamily, `${label}.modelFamily`)
    if(model.modelFamily !== expectedFamily) fail(`${label}.modelFamily does not match the checkpoint family`)
    for(const key of ["totalGames", "totalSyntheticEpisodes", "totalPolicySamples", "totalLoadoutSamples", "totalHumanDemonstrations", "totalTacticalSamples", "totalDecisionSamples", "candidateGeneration", "championGeneration"]) {
        assertInteger(model[key], `${label}.${key}`)
    }
    if(model.totalPolicySamples != model.totalGames + model.totalSyntheticEpisodes) fail(`${label}.totalPolicySamples is inconsistent`)

    if(!Array.isArray(model.strategyStats) || model.strategyStats.length != STRATEGY_COUNT) fail(`${label}.strategyStats must contain ${STRATEGY_COUNT} records`)
    validateStrategyStats(model.strategyStats, `${label}.strategyStats`)
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
    const decisionSampleTotal = model.policy.decision.trainingSamples.reduce((sum, value) => sum + value, 0)
    if(model.totalDecisionSamples != decisionSampleTotal) fail(`${label}.totalDecisionSamples is inconsistent with policy decision training samples`)
    if(!Array.isArray(model.populationPolicies) || model.populationPolicies.length > 2) fail(`${label}.populationPolicies must contain at most two policy bundles`)
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
    if(checkpoint.kind !== CHECKPOINT_KIND || checkpoint.formatVersion !== FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    assertString(checkpoint.gameVersion, `${label}.gameVersion`)
    assertInteger(checkpoint.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertString(checkpoint.modelFamily, `${label}.modelFamily`)
    assertDigest(checkpoint.modelDigest, `${label}.modelDigest`)
    assertDigest(checkpoint.checkpointId, `${label}.checkpointId`)
    if(checkpoint.parentCheckpointId !== null) assertDigest(checkpoint.parentCheckpointId, `${label}.parentCheckpointId`)
    assertExactKeys(checkpoint.provenance, ["mode", "seed", "shard", "matches"], `${label}.provenance`)
    if(!["initialize", "migrate", "train"].includes(checkpoint.provenance.mode)) fail(`${label}.provenance.mode is unsupported`)
    assertInteger(checkpoint.provenance.seed, `${label}.provenance.seed`)
    assertString(checkpoint.provenance.shard, `${label}.provenance.shard`)
    assertInteger(checkpoint.provenance.matches, `${label}.provenance.matches`)
    if(checkpoint.provenance.mode == "initialize" && (checkpoint.parentCheckpointId !== null || checkpoint.provenance.matches != 0)) fail(`${label} has invalid initialize provenance`)
    if(checkpoint.provenance.mode == "migrate" && (checkpoint.parentCheckpointId === null || checkpoint.provenance.matches != 0)) fail(`${label} has invalid migrate provenance`)
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

const HOSTED_ENVELOPE_KEYS = [
    "ok", "protocolVersion", "gameVersion", "modelSchema", "revision", "modelDigest", "policyDigest", "championPolicyDigest",
    "promotionBaseDigest", "updatedAt", "model", "writeEnabled", "promotionEnabled", "contributionEnabled",
    "contributionToken", "contributionRateLimit", "contributionEpoch",
]
const HOSTED_SNAPSHOT_KEYS = [
    "kind", "formatVersion", "snapshotId", "protocolVersion", "gameVersion", "revision", "contributionEpoch",
    "hostedModelDigest", "sourcePolicyDigest", "promotionBaseDigest", "championGeneration", "checkpointModelDigest", "checkpointId",
]

function validateHostedEnvelope(envelope, label = "hosted envelope") {
    assertExactKeys(envelope, HOSTED_ENVELOPE_KEYS, label)
    if(envelope.ok !== true || envelope.protocolVersion !== 1) fail(`${label} has an unsupported protocol response`)
    assertString(envelope.gameVersion, `${label}.gameVersion`)
    assertInteger(envelope.modelSchema, `${label}.modelSchema`, 1)
    if(envelope.gameVersion !== GAME_VERSION || envelope.modelSchema !== MODEL_SCHEMA_VERSION) fail(`${label} is incompatible with this game build`)
    assertInteger(envelope.revision, `${label}.revision`)
    assertDigest(envelope.modelDigest, `${label}.modelDigest`)
    assertDigest(envelope.policyDigest, `${label}.policyDigest`)
    assertDigest(envelope.championPolicyDigest, `${label}.championPolicyDigest`)
    assertDigest(envelope.promotionBaseDigest, `${label}.promotionBaseDigest`)
    if(envelope.updatedAt !== null) assertString(envelope.updatedAt, `${label}.updatedAt`)
    for(const key of ["writeEnabled", "promotionEnabled", "contributionEnabled"]) assertBoolean(envelope[key], `${label}.${key}`)
    assertString(envelope.contributionToken, `${label}.contributionToken`, true)
    assertInteger(envelope.contributionRateLimit, `${label}.contributionRateLimit`, 1)
    assertInteger(envelope.contributionEpoch, `${label}.contributionEpoch`, 1)
    validateModel(envelope.model, envelope.modelSchema, MODEL_FAMILY, `${label}.model`)
    if(envelope.modelDigest != hostedDigest(envelope.model)) fail(`${label}.modelDigest does not match its model`)
    if(envelope.policyDigest != hostedDigest(envelope.model.policy)) fail(`${label}.policyDigest does not match its policy bundle`)
    if(envelope.championPolicyDigest != hostedDigest(envelope.model.championPolicy)) fail(`${label}.championPolicyDigest does not match its champion policy bundle`)
    return envelope
}

function hostedSnapshotIdentity(manifest) {
    const identity = {}
    for(const key of HOSTED_SNAPSHOT_KEYS) if(key != "snapshotId") identity[key] = manifest[key]
    return identity
}

function validateHostedSnapshotManifest(manifest, checkpoint, label = "hosted snapshot") {
    assertExactKeys(manifest, HOSTED_SNAPSHOT_KEYS, label)
    if(manifest.kind !== HOSTED_SNAPSHOT_KIND || manifest.formatVersion !== FORMAT_VERSION || manifest.protocolVersion !== 1) fail(`${label} has an unsupported kind, format, or protocol`)
    assertDigest(manifest.snapshotId, `${label}.snapshotId`)
    assertString(manifest.gameVersion, `${label}.gameVersion`)
    assertInteger(manifest.revision, `${label}.revision`)
    assertInteger(manifest.contributionEpoch, `${label}.contributionEpoch`, 1)
    for(const key of ["hostedModelDigest", "sourcePolicyDigest", "promotionBaseDigest", "checkpointModelDigest", "checkpointId"]) assertDigest(manifest[key], `${label}.${key}`)
    assertInteger(manifest.championGeneration, `${label}.championGeneration`)
    if(manifest.snapshotId != digest(hostedSnapshotIdentity(manifest))) fail(`${label}.snapshotId does not match its contents`)
    if(checkpoint != null) {
        validateCheckpoint(checkpoint, "hosted baseline")
        if(manifest.gameVersion != checkpoint.gameVersion || manifest.checkpointModelDigest != checkpoint.modelDigest || manifest.checkpointId != checkpoint.checkpointId) fail(`${label} does not identify the supplied checkpoint`)
        if(manifest.championGeneration != checkpoint.model.championGeneration) fail(`${label}.championGeneration does not match the supplied checkpoint`)
        if(manifest.hostedModelDigest != hostedDigest(checkpoint.model) || manifest.sourcePolicyDigest != hostedDigest(checkpoint.model.policy)) fail(`${label} hosted digests do not match the supplied checkpoint`)
    }
    return manifest
}

function createHostedSnapshot(envelope) {
    validateHostedEnvelope(envelope)
    const checkpoint = createCheckpoint({
        gameVersion: envelope.gameVersion,
        model: envelope.model,
        mode: "initialize",
        seed: envelope.revision,
        shard: `hosted-revision-${envelope.revision}`,
        matches: 0,
    })
    const manifest = {
        kind: HOSTED_SNAPSHOT_KIND,
        formatVersion: FORMAT_VERSION,
        snapshotId: "",
        protocolVersion: envelope.protocolVersion,
        gameVersion: envelope.gameVersion,
        revision: envelope.revision,
        contributionEpoch: envelope.contributionEpoch,
        hostedModelDigest: envelope.modelDigest,
        sourcePolicyDigest: envelope.policyDigest,
        promotionBaseDigest: envelope.promotionBaseDigest,
        championGeneration: envelope.model.championGeneration,
        checkpointModelDigest: checkpoint.modelDigest,
        checkpointId: checkpoint.checkpointId,
    }
    manifest.snapshotId = digest(hostedSnapshotIdentity(manifest))
    return { checkpoint, manifest: validateHostedSnapshotManifest(manifest, checkpoint) }
}

const POLICY_PROMOTION_REQUEST_KEYS = [
    "protocolVersion", "promotionId", "sourceRevision", "expectedContributionEpoch", "expectedPromotionBaseDigest",
    "expectedPolicyDigest", "expectedChampionGeneration", "expectedStrategyStats", "strategyStats", "policy",
]

function validatePolicyPromotionRequest(request, label = "policy promotion request") {
    assertExactKeys(request, POLICY_PROMOTION_REQUEST_KEYS, label)
    if(request.protocolVersion !== 1) fail(`${label}.protocolVersion must be 1`)
    assertDigest(request.promotionId, `${label}.promotionId`)
    assertInteger(request.sourceRevision, `${label}.sourceRevision`)
    assertInteger(request.expectedContributionEpoch, `${label}.expectedContributionEpoch`, 1)
    assertDigest(request.expectedPromotionBaseDigest, `${label}.expectedPromotionBaseDigest`)
    assertDigest(request.expectedPolicyDigest, `${label}.expectedPolicyDigest`)
    assertInteger(request.expectedChampionGeneration, `${label}.expectedChampionGeneration`)
    validateStrategyStats(request.expectedStrategyStats, `${label}.expectedStrategyStats`)
    validateStrategyStats(request.strategyStats, `${label}.strategyStats`)
    validatePolicy(request.policy, `${label}.policy`, STRATEGY_COUNT)
    return request
}

function buildPolicyPromotionRequest(manifest, candidate, baseline) {
    validateHostedSnapshotManifest(manifest, baseline)
    validatePolicyOnlyCandidate(candidate, baseline)
    return validatePolicyPromotionRequest({
        protocolVersion: 1,
        promotionId: candidate.checkpointId,
        sourceRevision: manifest.revision,
        expectedContributionEpoch: manifest.contributionEpoch,
        expectedPromotionBaseDigest: manifest.promotionBaseDigest,
        expectedPolicyDigest: manifest.sourcePolicyDigest,
        expectedChampionGeneration: manifest.championGeneration,
        expectedStrategyStats: clone(baseline.model.strategyStats),
        strategyStats: clone(candidate.model.strategyStats),
        policy: clone(candidate.model.policy),
    })
}

const HOSTED_PROMOTION_RESPONSE_KEYS = [
    "ok", "protocolVersion", "promotionId", "duplicate", "revision", "modelDigest", "contributionEpoch",
    "championGeneration", "promotedPolicyDigest", "candidatePolicyPreserved",
]

function validateHostedPromotionResponse(response, request, label = "hosted promotion response") {
    validatePolicyPromotionRequest(request)
    assertExactKeys(response, HOSTED_PROMOTION_RESPONSE_KEYS, label)
    if(response.ok !== true || response.protocolVersion !== 1 || response.promotionId != request.promotionId) fail(`${label} does not identify the requested promotion`)
    assertBoolean(response.duplicate, `${label}.duplicate`)
    assertInteger(response.revision, `${label}.revision`, request.sourceRevision + 1)
    assertDigest(response.modelDigest, `${label}.modelDigest`)
    assertInteger(response.contributionEpoch, `${label}.contributionEpoch`, 1)
    assertInteger(response.championGeneration, `${label}.championGeneration`)
    assertDigest(response.promotedPolicyDigest, `${label}.promotedPolicyDigest`)
    assertBoolean(response.candidatePolicyPreserved, `${label}.candidatePolicyPreserved`)
    if(response.contributionEpoch != request.expectedContributionEpoch) fail(`${label} changed the contribution epoch`)
    if(response.championGeneration != request.expectedChampionGeneration + 1) fail(`${label} has the wrong champion generation`)
    if(response.promotedPolicyDigest != hostedDigest(request.policy)) fail(`${label}.promotedPolicyDigest does not match the submitted policy bundle`)
    return response
}

function createHostedPromotionReceipt(manifest, response) {
    const receipt = {
        kind: HOSTED_PROMOTION_RECEIPT_KIND,
        formatVersion: FORMAT_VERSION,
        snapshotId: manifest.snapshotId,
        promotionId: response.promotionId,
        duplicate: response.duplicate,
        revision: response.revision,
        modelDigest: response.modelDigest,
        contributionEpoch: response.contributionEpoch,
        championGeneration: response.championGeneration,
        promotedPolicyDigest: response.promotedPolicyDigest,
        candidatePolicyPreserved: response.candidatePolicyPreserved,
    }
    return validateHostedPromotionReceipt(receipt)
}

const HOSTED_PROMOTION_RECEIPT_KEYS = [
    "kind", "formatVersion", "snapshotId", "promotionId", "duplicate", "revision", "modelDigest",
    "contributionEpoch", "championGeneration", "promotedPolicyDigest", "candidatePolicyPreserved",
]

function validateHostedPromotionReceipt(receipt, label = "hosted promotion receipt") {
    assertExactKeys(receipt, HOSTED_PROMOTION_RECEIPT_KEYS, label)
    if(receipt.kind !== HOSTED_PROMOTION_RECEIPT_KIND || receipt.formatVersion !== FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    for(const key of ["snapshotId", "promotionId", "modelDigest", "promotedPolicyDigest"]) assertDigest(receipt[key], `${label}.${key}`)
    assertBoolean(receipt.duplicate, `${label}.duplicate`)
    assertInteger(receipt.revision, `${label}.revision`)
    assertInteger(receipt.contributionEpoch, `${label}.contributionEpoch`, 1)
    assertInteger(receipt.championGeneration, `${label}.championGeneration`)
    assertBoolean(receipt.candidatePolicyPreserved, `${label}.candidatePolicyPreserved`)
    return receipt
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

function validateFairnessSchedule(match, index, label) {
    const scenarioIndex = index % 8
    const expectedMap = index % 2
    const expectedSide = Math.floor(scenarioIndex / 2) % 2 == 0 ? "left" : "right"
    const expectedRole = Math.floor(scenarioIndex / 4) % 2 == 0 ? "responder" : "probe"
    if(match.map != expectedMap || match.candidateSide != expectedSide || match.candidateRole != expectedRole) fail(`${label} does not follow the fairness schedule`)
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
    if(result.metrics.discarded != 0 || result.metrics.stalls > maxRecoveredStalls(result.requestedMatches) || result.metrics.frameBudgetExhausted != 0) fail(`${label} records an unrecoverable failed or discarded run`)
}

function validateTrainResult(result, label = "train result") {
    assertExactKeys(result, TRAIN_RESULT_KEYS, label)
    if(result.kind !== TRAIN_RESULT_KIND || result.formatVersion !== FORMAT_VERSION || result.mode !== "train") fail(`${label} has an unsupported kind, version, or mode`)
    for(const key of ["resultId", "baseCheckpointId", "baseModelDigest"]) assertDigest(result[key], `${label}.${key}`)
    for(const key of ["gameVersion", "shard"]) assertString(result[key], `${label}.${key}`)
    assertInteger(result.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(result.seed, `${label}.seed`)
    validateCheckpoint(result.candidate, `${label}.candidate`)
    if(result.candidate.parentCheckpointId != result.baseCheckpointId) fail(`${label}.candidate has the wrong parent checkpoint`)
    if(result.candidate.gameVersion != result.gameVersion || result.candidate.modelSchemaVersion != result.modelSchemaVersion) fail(`${label}.candidate is incompatible with its result`)
    if(result.candidate.provenance.mode != "train" || result.candidate.provenance.seed != result.seed || result.candidate.provenance.shard != result.shard || result.candidate.provenance.matches != result.completedMatches) fail(`${label}.candidate provenance is inconsistent`)
    validateMatchesAndMetrics(result, label)
    const fullGeneration = result.requestedMatches == TRAINING_MATCHES
    result.matches.forEach((match, index) => {
        if(match.evaluation != (fullGeneration && index >= TRAINING_LEARNING_MATCHES)) fail(`${label}.matches[${index}] is in the wrong learning/evaluation phase`)
        validateFairnessSchedule(match, index, `${label}.matches[${index}]`)
    })
    if(fullGeneration) {
        const internalEvaluation = computeMetrics(result.matches.slice(TRAINING_LEARNING_MATCHES))
        if(result.metrics.builtInEvaluationScore === null || Math.abs(result.metrics.builtInEvaluationScore - internalEvaluation.score) > 1e-12) fail(`${label}.metrics.builtInEvaluationScore does not match its ${TRAINING_INTERNAL_EVALUATION_MATCHES} frozen matches`)
    } else if(result.metrics.builtInEvaluationScore !== null) {
        fail(`${label}.metrics.builtInEvaluationScore must be null for a partial smoke run`)
    }
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
    return policies.slice(-2)
}

function materializePolicyOnlyCandidate(result, baseline) {
    validateTrainResultAgainstBaseline(result, baseline)
    if(baseline.model.championGeneration >= Number.MAX_SAFE_INTEGER) fail("baseline championGeneration cannot be incremented")
    const model = clone(baseline.model)
    const selectedPolicy = clone(result.candidate.model.policy)
    model.policy = selectedPolicy
    model.totalDecisionSamples = selectedPolicy.decision.trainingSamples.reduce((sum, value) => sum + value, 0)
    model.strategyStats = clone(result.candidate.model.strategyStats)
    model.totalGames = result.candidate.model.totalGames
    model.totalSyntheticEpisodes = result.candidate.model.totalSyntheticEpisodes
    model.totalPolicySamples = result.candidate.model.totalPolicySamples
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

function aggregateTrainResultPolicies(results, baseline) {
    if(!Array.isArray(results) || results.length == 0) fail("No train shard results were found")
    selectBestTrainResult(results, baseline)
    const validated = results.map((result, index) => validateTrainResultAgainstBaseline(result, baseline, `train result ${index}`))
    const maximumScore = Math.max(...validated.map(result => Number.isFinite(result.metrics.builtInEvaluationScore) ? result.metrics.builtInEvaluationScore : result.metrics.score))
    const rawWeights = validated.map(result => Math.exp(((Number.isFinite(result.metrics.builtInEvaluationScore) ? result.metrics.builtInEvaluationScore : result.metrics.score) - maximumScore) * 8))
    const weightTotal = rawWeights.reduce((sum, weight) => sum + weight, 0)
    const weights = rawWeights.map(weight => weight / weightTotal)
    const policy = clone(baseline.model.policy)

    function averageValues(values) {
        if(Array.isArray(values[0])) return values[0].map((value, index) => averageValues(values.map(candidate => candidate[index])))
        return values.reduce((sum, value, index) => sum + value * weights[index], 0)
    }

    for(const key of ["W1", "b1", "W2", "b2", "W3", "b3"]) {
        policy.strategy[key] = averageValues(validated.map(result => result.candidate.model.policy.strategy[key]))
    }
    for(const key of [
        "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2",
        "WStateToMemory", "WMemoryToMemory", "bMemory", "WMemoryToState", "WValue", "bValue", "WSurvival", "bSurvival", "familyBias",
    ]) {
        policy.decision[key] = averageValues(validated.map(result => result.candidate.model.policy.decision[key]))
    }
    policy.decision.trainingSamples = policy.decision.trainingSamples.map((baselineCount, familyIndex) => {
        const learnedSamples = validated.reduce((sum, result) => {
            const candidateCount = result.candidate.model.policy.decision.trainingSamples[familyIndex]
            return sum + Math.max(0, candidateCount - baselineCount)
        }, 0)
        if(baselineCount + learnedSamples > Number.MAX_SAFE_INTEGER) fail(`aggregated decision trainingSamples[${familyIndex}] exceeds the safe integer range`)
        return baselineCount + learnedSamples
    })
    validatePolicy(policy, "aggregated policy", STRATEGY_COUNT)
    return policy
}

function aggregateTrainResultStrategyStats(results, baseline) {
    const strategyStats = clone(baseline.model.strategyStats)
    for(const [resultIndex, result] of results.entries()) {
        validateStrategyStatsDelta(result.candidate.model.strategyStats, baseline.model.strategyStats, `train result ${resultIndex}.strategyStats`)
        for(let strategyIndex = 0; strategyIndex < STRATEGY_COUNT; strategyIndex++) {
            const source = result.candidate.model.strategyStats[strategyIndex]
            const target = strategyStats[strategyIndex]
            for(const key of STRATEGY_STAT_KEYS) target[key] += source[key] - baseline.model.strategyStats[strategyIndex][key]
            if(source.games > baseline.model.strategyStats[strategyIndex].games) target.lastReward = source.lastReward
        }
    }
    return validateStrategyStats(strategyStats, "aggregated strategyStats")
}

function materializeAggregatedPolicyCandidate(results, baseline) {
    const selected = selectBestTrainResult(results, baseline)
    const model = clone(baseline.model)
    const policy = aggregateTrainResultPolicies(results, baseline)
    model.policy = policy
    model.totalDecisionSamples = policy.decision.trainingSamples.reduce((sum, value) => sum + value, 0)
    model.strategyStats = aggregateTrainResultStrategyStats(results, baseline)
    model.totalGames = model.strategyStats.reduce((sum, record) => sum + record.games, 0)
    model.totalSyntheticEpisodes = model.strategyStats.reduce((sum, record) => sum + record.syntheticEpisodes, 0)
    model.totalPolicySamples = model.totalGames + model.totalSyntheticEpisodes
    model.championPolicy = clone(policy)
    model.populationPolicies = retainedPopulationPolicies(baseline.model)
    model.championGeneration = baseline.model.championGeneration + 1
    model.candidateGeneration = model.championGeneration
    return createCheckpoint({
        gameVersion: baseline.gameVersion,
        model,
        parentCheckpointId: baseline.checkpointId,
        mode: "train",
        seed: selected.seed,
        shard: `aggregate-${results.length}`,
        matches: results.reduce((sum, result) => sum + result.completedMatches, 0),
    })
}

function validatePolicyOnlyCandidate(candidate, baseline, label = "candidate") {
    validateCheckpoint(baseline, "baseline")
    validateCheckpoint(candidate, label)
    if(candidate.parentCheckpointId != baseline.checkpointId) fail(`${label} does not descend from the supplied baseline`)
    if(candidate.gameVersion != baseline.gameVersion || candidate.modelSchemaVersion != baseline.modelSchemaVersion || candidate.modelFamily != baseline.modelFamily) fail(`${label} is incompatible with the supplied baseline`)
    if(digest(candidate.model.policy) != digest(candidate.model.championPolicy)) fail(`${label} policy and championPolicy must match`)
    validateStrategyStatsDelta(candidate.model.strategyStats, baseline.model.strategyStats, `${label}.strategyStats`)
    if(baseline.model.championGeneration >= Number.MAX_SAFE_INTEGER) fail("baseline championGeneration cannot be incremented")
    const expected = clone(baseline.model)
    expected.policy = clone(candidate.model.policy)
    expected.championPolicy = clone(candidate.model.policy)
    expected.strategyStats = clone(candidate.model.strategyStats)
    expected.totalGames = candidate.model.totalGames
    expected.totalSyntheticEpisodes = candidate.model.totalSyntheticEpisodes
    expected.totalPolicySamples = candidate.model.totalPolicySamples
    expected.totalDecisionSamples = candidate.model.policy.decision.trainingSamples.reduce((sum, value) => sum + value, 0)
    expected.populationPolicies = retainedPopulationPolicies(baseline.model)
    expected.championGeneration = baseline.model.championGeneration + 1
    expected.candidateGeneration = expected.championGeneration
    if(digest(candidate.model) != digest(expected)) fail(`${label} contains model state other than the selected policy and promotion metadata`)
    return candidate
}

function validateEvaluationResult(result, label = "evaluation result") {
    assertExactKeys(result, EVALUATION_RESULT_KEYS, label)
    if(result.kind !== EVALUATION_RESULT_KIND || result.formatVersion !== FORMAT_VERSION || result.mode !== "evaluate") fail(`${label} has an unsupported kind, version, or mode`)
    for(const key of ["resultId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest"]) assertDigest(result[key], `${label}.${key}`)
    for(const key of ["gameVersion", "shard"]) assertString(result[key], `${label}.${key}`)
    assertInteger(result.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(result.seed, `${label}.seed`)
    validateMatchesAndMetrics(result, label)
    if(result.matches.some(match => match.evaluation !== true)) fail(`${label} contains a match that was not run in frozen evaluation mode`)
    result.matches.forEach((match, index) => validateFairnessSchedule(match, index, `${label}.matches[${index}]`))
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
        const aScore = a.metrics.builtInEvaluationScore
        const bScore = b.metrics.builtInEvaluationScore
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
        scoreSource: "built-in-evaluation",
        score: result.metrics.builtInEvaluationScore,
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
        selectedScoreSource: "built-in-evaluation",
        selectedScore: selected.metrics.builtInEvaluationScore,
        aggregationMethod: "score-weighted-policy-average",
        contributorCount: results.length,
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
const LEGACY_EVALUATION_AGGREGATE_KEYS = ["kind", "formatVersion", "aggregateId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest", "gameVersion", "modelSchemaVersion", "thresholds", "passed", "overall", "byMap", "bySide", "byRole", "coverage", "safety", "sourceResultIds"]
const EVALUATION_AGGREGATE_KEYS = LEGACY_EVALUATION_AGGREGATE_KEYS.concat("absoluteDefense")
const EVALUATION_THRESHOLD_KEYS = ["minimumScore", "minimumGames", "minimumBucketScore", "minimumSurvivalRate", "maximumSevereCollapseRate", "minimumDefensiveGames", "minimumDefensiveLives", "minimumDefensiveFloorLives", "minimumDefensiveRate"]
const EVALUATION_SAFETY_KEYS = ["games", "survivals", "severeCollapses", "survivalRate", "severeCollapseRate", "averageCandidateLives", "averageOpponentLives"]
const EVALUATION_ABSOLUTE_DEFENSE_KEYS = ["games", "protectedGames", "protectionRate", "minimumCandidateLives", "averageCandidateLives"]

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

function evaluationThresholds(minimumScore, minimumGames) {
    const stableRate = value => Math.round(value * 1e12) / 1e12
    return {
        minimumScore,
        minimumGames,
        minimumBucketScore: stableRate(Math.max(0, minimumScore - 0.1)),
        minimumSurvivalRate: stableRate(Math.max(0, minimumScore - 0.08)),
        maximumSevereCollapseRate: stableRate(Math.min(1, Math.max(0, 1 - minimumScore - 0.15))),
        minimumDefensiveGames: Math.max(1, Math.ceil(minimumGames / 2)),
        minimumDefensiveLives: ABSOLUTE_DEFENSE_MINIMUM_LIVES,
        minimumDefensiveFloorLives: ABSOLUTE_DEFENSE_MINIMUM_FLOOR_LIVES,
        minimumDefensiveRate: ABSOLUTE_DEFENSE_MINIMUM_RATE,
    }
}

function safetyForMatches(matches) {
    const games = matches.length
    const survivals = matches.filter(match => match.candidateLives > 0).length
    const severeCollapses = matches.filter(match => match.candidateLives <= 0 && match.opponentLives >= 75).length
    return {
        games,
        survivals,
        severeCollapses,
        survivalRate: games ? survivals / games : 0,
        severeCollapseRate: games ? severeCollapses / games : 0,
        averageCandidateLives: games ? matches.reduce((sum, match) => sum + match.candidateLives, 0) / games : 0,
        averageOpponentLives: games ? matches.reduce((sum, match) => sum + match.opponentLives, 0) / games : 0,
    }
}

function absoluteDefenseForMatches(matches) {
    const defensiveMatches = matches.filter(match => match.candidateRole == "responder")
    const protectedGames = defensiveMatches.filter(match => match.candidateLives >= ABSOLUTE_DEFENSE_MINIMUM_LIVES).length
    return {
        games: defensiveMatches.length,
        protectedGames,
        protectionRate: defensiveMatches.length ? protectedGames / defensiveMatches.length : 0,
        minimumCandidateLives: defensiveMatches.length ? Math.min(...defensiveMatches.map(match => match.candidateLives)) : 0,
        averageCandidateLives: defensiveMatches.length ? defensiveMatches.reduce((sum, match) => sum + match.candidateLives, 0) / defensiveMatches.length : 0,
    }
}

function bucketsMeetMinimum(maps, sides, roles, minimumScore) {
    return [...Object.values(maps), ...Object.values(sides), ...Object.values(roles)].every(bucket => bucket.score >= minimumScore)
}

function aggregateIdentity(aggregate) {
    const identity = {}
    for(const key of Object.keys(aggregate)) if(key != "aggregateId") identity[key] = aggregate[key]
    return identity
}

function validateEvaluationAggregate(aggregate, label = "evaluation aggregate") {
    const current = aggregate && aggregate.formatVersion === EVALUATION_AGGREGATE_FORMAT_VERSION
    assertExactKeys(aggregate, current ? EVALUATION_AGGREGATE_KEYS : LEGACY_EVALUATION_AGGREGATE_KEYS, label)
    if(aggregate.kind !== EVALUATION_AGGREGATE_KIND || (aggregate.formatVersion !== FORMAT_VERSION && aggregate.formatVersion !== EVALUATION_AGGREGATE_FORMAT_VERSION)) fail(`${label} has an unsupported kind or format version`)
    for(const key of ["aggregateId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest"]) assertDigest(aggregate[key], `${label}.${key}`)
    assertString(aggregate.gameVersion, `${label}.gameVersion`)
    assertInteger(aggregate.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertExactKeys(aggregate.thresholds, current ? EVALUATION_THRESHOLD_KEYS : EVALUATION_THRESHOLD_KEYS.slice(0, 5), `${label}.thresholds`)
    assertNumber(aggregate.thresholds.minimumScore, `${label}.thresholds.minimumScore`, 0, 1)
    assertInteger(aggregate.thresholds.minimumGames, `${label}.thresholds.minimumGames`, 1)
    for(const key of ["minimumBucketScore", "minimumSurvivalRate", "maximumSevereCollapseRate"]) assertNumber(aggregate.thresholds[key], `${label}.thresholds.${key}`, 0, 1)
    if(current) {
        for(const key of ["minimumDefensiveLives", "minimumDefensiveFloorLives"]) assertInteger(aggregate.thresholds[key], `${label}.thresholds.${key}`, 0)
        assertInteger(aggregate.thresholds.minimumDefensiveGames, `${label}.thresholds.minimumDefensiveGames`, 1)
        for(const key of ["minimumDefensiveRate"]) assertNumber(aggregate.thresholds[key], `${label}.thresholds.${key}`, 0, 1)
    }
    const expectedThresholds = evaluationThresholds(aggregate.thresholds.minimumScore, aggregate.thresholds.minimumGames)
    const legacyThresholds = Object.fromEntries(Object.entries(expectedThresholds).filter(([key]) => EVALUATION_THRESHOLD_KEYS.slice(0, 5).includes(key)))
    if(canonicalStringify(aggregate.thresholds) != canonicalStringify(current ? expectedThresholds : legacyThresholds)) fail(`${label}.thresholds are inconsistent`)
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
    assertExactKeys(aggregate.safety, EVALUATION_SAFETY_KEYS, `${label}.safety`)
    for(const key of ["games", "survivals", "severeCollapses"]) assertInteger(aggregate.safety[key], `${label}.safety.${key}`)
    if(aggregate.safety.games != aggregate.overall.games || aggregate.safety.survivals > aggregate.safety.games || aggregate.safety.severeCollapses > aggregate.safety.games) fail(`${label}.safety counts are inconsistent`)
    for(const key of ["survivalRate", "severeCollapseRate"]) assertNumber(aggregate.safety[key], `${label}.safety.${key}`, 0, 1)
    for(const key of ["averageCandidateLives", "averageOpponentLives"]) assertNumber(aggregate.safety[key], `${label}.safety.${key}`, 0)
    const expectedSurvivalRate = aggregate.safety.games ? aggregate.safety.survivals / aggregate.safety.games : 0
    const expectedSevereCollapseRate = aggregate.safety.games ? aggregate.safety.severeCollapses / aggregate.safety.games : 0
    if(Math.abs(aggregate.safety.survivalRate - expectedSurvivalRate) > 1e-12 || Math.abs(aggregate.safety.severeCollapseRate - expectedSevereCollapseRate) > 1e-12) fail(`${label}.safety rates are inconsistent`)
    if(current) {
        assertExactKeys(aggregate.absoluteDefense, EVALUATION_ABSOLUTE_DEFENSE_KEYS, `${label}.absoluteDefense`)
        for(const key of ["games", "protectedGames"]) assertInteger(aggregate.absoluteDefense[key], `${label}.absoluteDefense.${key}`)
        if(aggregate.absoluteDefense.protectedGames > aggregate.absoluteDefense.games) fail(`${label}.absoluteDefense counts are inconsistent`)
        assertNumber(aggregate.absoluteDefense.protectionRate, `${label}.absoluteDefense.protectionRate`, 0, 1)
        for(const key of ["minimumCandidateLives", "averageCandidateLives"]) assertNumber(aggregate.absoluteDefense[key], `${label}.absoluteDefense.${key}`, 0)
        const expectedProtectionRate = aggregate.absoluteDefense.games ? aggregate.absoluteDefense.protectedGames / aggregate.absoluteDefense.games : 0
        if(Math.abs(aggregate.absoluteDefense.protectionRate - expectedProtectionRate) > 1e-12) fail(`${label}.absoluteDefense.protectionRate is inconsistent`)
        if(aggregate.absoluteDefense.games < aggregate.thresholds.minimumDefensiveGames) fail(`${label}.absoluteDefense does not contain enough responder games`)
    }
    if(!Array.isArray(aggregate.sourceResultIds) || aggregate.sourceResultIds.length == 0) fail(`${label}.sourceResultIds must be non-empty`)
    aggregate.sourceResultIds.forEach((id, index) => assertDigest(id, `${label}.sourceResultIds[${index}]`))
    if(new Set(aggregate.sourceResultIds).size != aggregate.sourceResultIds.length) fail(`${label}.sourceResultIds contains duplicates`)
    if(aggregate.sourceResultIds.some((id, index) => index > 0 && aggregate.sourceResultIds[index - 1] >= id)) fail(`${label}.sourceResultIds must be sorted`)
    const absoluteDefensePassed = !current || aggregate.absoluteDefense.protectionRate >= aggregate.thresholds.minimumDefensiveRate
        && aggregate.absoluteDefense.minimumCandidateLives >= aggregate.thresholds.minimumDefensiveFloorLives
    const expectedPassed = aggregate.overall.games >= aggregate.thresholds.minimumGames
        && aggregate.overall.score >= aggregate.thresholds.minimumScore
        && bucketsMeetMinimum(aggregate.byMap, aggregate.bySide, aggregate.byRole, aggregate.thresholds.minimumBucketScore)
        && aggregate.safety.survivalRate >= aggregate.thresholds.minimumSurvivalRate
        && aggregate.safety.severeCollapseRate <= aggregate.thresholds.maximumSevereCollapseRate
        && expectedCoverage.mapsCovered && expectedCoverage.sidesCovered && expectedCoverage.rolesCovered && expectedCoverage.balanced
        && absoluteDefensePassed
    if(aggregate.passed != expectedPassed) fail(`${label}.passed is inconsistent`)
    if(aggregate.aggregateId != digest(aggregateIdentity(aggregate))) fail(`${label}.aggregateId does not match its contents`)
    return aggregate
}

function validatePromotionBundle(candidate, evaluation, baseline, minimumScore = 0.58, minimumGames = 64) {
    assertNumber(minimumScore, "minimumScore", 0, 1)
    assertInteger(minimumGames, "minimumGames", 1)
    validatePolicyOnlyCandidate(candidate, baseline)
    validateEvaluationAggregate(evaluation, "evaluation")
    if(evaluation.candidateCheckpointId != candidate.checkpointId || evaluation.candidateModelDigest != candidate.modelDigest) fail("Evaluation does not belong to the candidate")
    if(evaluation.baselineCheckpointId != baseline.checkpointId || evaluation.baselineModelDigest != baseline.modelDigest) fail("Evaluation does not use the current baseline")
    if(evaluation.gameVersion != candidate.gameVersion || evaluation.modelSchemaVersion != candidate.modelSchemaVersion) fail("Evaluation schema does not match the candidate")
    if(evaluation.formatVersion !== EVALUATION_AGGREGATE_FORMAT_VERSION) fail("Evaluation lacks format-2 absolute defensive competence evidence")
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
    const thresholds = evaluationThresholds(minimumScore, minimumGames)
    const matches = validated.flatMap(result => result.matches)
    const safety = safetyForMatches(matches)
    const absoluteDefense = absoluteDefenseForMatches(matches)
    const aggregate = {
        kind: EVALUATION_AGGREGATE_KIND,
        formatVersion: EVALUATION_AGGREGATE_FORMAT_VERSION,
        aggregateId: "",
        candidateCheckpointId: first.candidateCheckpointId,
        candidateModelDigest: first.candidateModelDigest,
        baselineCheckpointId: first.baselineCheckpointId,
        baselineModelDigest: first.baselineModelDigest,
        gameVersion: first.gameVersion,
        modelSchemaVersion: first.modelSchemaVersion,
        thresholds,
        passed: overall.games >= minimumGames
            && overall.score >= minimumScore
            && bucketsMeetMinimum(maps, sides, roles, thresholds.minimumBucketScore)
            && safety.survivalRate >= thresholds.minimumSurvivalRate
            && safety.severeCollapseRate <= thresholds.maximumSevereCollapseRate
            && coverage.mapsCovered && coverage.sidesCovered && coverage.rolesCovered && coverage.balanced,
        overall,
        byMap: maps,
        bySide: sides,
        byRole: roles,
        coverage,
        safety,
        absoluteDefense,
        sourceResultIds: validated.map(result => result.resultId).sort(),
    }
    aggregate.passed = aggregate.passed
        && absoluteDefense.games >= thresholds.minimumDefensiveGames
        && absoluteDefense.protectionRate >= thresholds.minimumDefensiveRate
        && absoluteDefense.minimumCandidateLives >= thresholds.minimumDefensiveFloorLives
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
        `Safety: every split at least ${percent(aggregate.thresholds.minimumBucketScore)}, survival at least ${percent(aggregate.thresholds.minimumSurvivalRate)}, severe collapses at most ${percent(aggregate.thresholds.maximumSevereCollapseRate)}`,
        `Coverage: at least ${aggregate.coverage.minimumGamesPerMap} games per map, ${aggregate.coverage.minimumGamesPerSide} per candidate side, and ${aggregate.coverage.minimumGamesPerRole} per candidate role; all splits must be balanced`,
        `Observed: ${percent(aggregate.safety.survivalRate)} survival, ${percent(aggregate.safety.severeCollapseRate)} severe collapses, ${aggregate.safety.averageCandidateLives.toFixed(2)} average candidate lives`,
        ...(aggregate.absoluteDefense ? [
            `Absolute defense: at least ${aggregate.thresholds.minimumDefensiveGames} responder games, ${percent(aggregate.thresholds.minimumDefensiveRate)} finishing with at least ${aggregate.thresholds.minimumDefensiveLives} lives, and no responder below ${aggregate.thresholds.minimumDefensiveFloorLives} lives`,
            `Observed defense: ${percent(aggregate.absoluteDefense.protectionRate)} protected responder games, ${aggregate.absoluteDefense.minimumCandidateLives.toFixed(2)} minimum and ${aggregate.absoluteDefense.averageCandidateLives.toFixed(2)} average responder lives`,
        ] : []),
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
    let size
    try {
        size = fs.statSync(filePath).size
    } catch(error) {
        fail(`Unable to read JSON ${filePath}: ${error.message}`)
    }
    if(size > MAX_JSON_BYTES) fail(`JSON ${filePath} exceeds the ${MAX_JSON_BYTES}-byte limit`)
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
    const encoded = `${JSON.stringify(value, null, 2)}\n`
    const size = Buffer.byteLength(encoded)
    if(size > MAX_JSON_BYTES) fail(`JSON ${absolute} exceeds the ${MAX_JSON_BYTES}-byte limit`)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    const temporary = `${absolute}.${process.pid}.tmp`
    fs.writeFileSync(temporary, encoded, { encoding: "utf8", flag: "w" })
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
    ABSOLUTE_DEFENSE_MINIMUM_FLOOR_LIVES,
    ABSOLUTE_DEFENSE_MINIMUM_LIVES,
    ABSOLUTE_DEFENSE_MINIMUM_RATE,
    CHECKPOINT_KIND,
    DECISION_CANDIDATE_INPUT_SIZE,
    DECISION_CREDIT_VERSION,
    DECISION_STATE_INPUT_SIZE,
    EVALUATION_AGGREGATE_FORMAT_VERSION,
    EVALUATION_AGGREGATE_KIND,
    EVALUATION_RESULT_KIND,
    FORMAT_VERSION,
    GAME_VERSION,
    HOSTED_PROMOTION_RECEIPT_KIND,
    HOSTED_SNAPSHOT_KIND,
    MAX_JSON_BYTES,
    MAX_RECOVERED_STALLS,
    MODEL_FAMILY,
    MODEL_SCHEMA_VERSION,
    POLICY_FORMAT_VERSION,
    POLICY_PARAMETER_COUNT,
    ROOT,
    SELECTION_REPORT_KIND,
    TRAIN_RESULT_KIND,
    TRAINING_INTERNAL_EVALUATION_MATCHES,
    TRAINING_LEARNING_MATCHES,
    TRAINING_MATCHES,
    aggregateEvaluationResults,
    aggregateTrainResultPolicies,
    assertFiniteTree,
    canonicalStringify,
    clone,
    computeMetrics,
    createCheckpoint,
    createHostedPromotionReceipt,
    createHostedSnapshot,
    createStaticServer,
    defaultMarkdownPath,
    digest,
    evaluationMarkdown,
    fail,
    finalizeResult,
    hostedDigest,
    integerArg,
    jsonFilesRecursively,
    makeSelectionReport,
    maxRecoveredStalls,
    materializeAggregatedPolicyCandidate,
    materializePolicyOnlyCandidate,
    buildPolicyPromotionRequest,
    numberArg,
    parseArgs,
    readJson,
    requiredArg,
    selectBestTrainResult,
    validateCheckpoint,
    validateEvaluationAggregate,
    validateEvaluationResult,
    validateHostedEnvelope,
    validateHostedPromotionReceipt,
    validateHostedPromotionResponse,
    validateHostedSnapshotManifest,
    validateModel,
    validatePolicyOnlyCandidate,
    validatePolicyPromotionRequest,
    validatePromotionBundle,
    validateTrainResult,
    validateTrainResultAgainstBaseline,
    writeJson,
    writeText,
}
