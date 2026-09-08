#!/usr/bin/env node
"use strict"

const {
    GAME_VERSION,
    MODEL_SCHEMA_VERSION,
    digest,
    fail,
    integerArg,
    parseArgs,
    requiredArg,
    writeJson,
    validateEvaluationResult,
} = require("./common")

const SCENARIO_MANIFEST_KIND = "btdb-ai-scenario-manifest"
const SCENARIO_MANIFEST_FORMAT_VERSION = 1
const SCENARIO_COUNT = 8
const TRAINING_SEED_OFFSET = 0
const HOLDOUT_SEED_OFFSET = 100000
const SCENARIO_REPORT_KIND = "btdb-ai-scenario-report"
const SCENARIO_REPORT_FORMAT_VERSION = 1

function assertExactKeys(value, expected, label) {
    if(value == null || typeof value != "object" || Array.isArray(value)) fail(`${label} must be an object`)
    const actual = Object.keys(value).sort()
    const wanted = expected.slice().sort()
    if(actual.length != wanted.length || actual.some((key, index) => key != wanted[index])) fail(`${label} keys must be exactly: ${wanted.join(", ")}`)
}

function assertInteger(value, label, minimum = 0) {
    if(!Number.isSafeInteger(value) || value < minimum) fail(`${label} must be an integer >= ${minimum}`)
}

function assertString(value, label) {
    if(typeof value != "string" || value.length == 0) fail(`${label} must be a non-empty string`)
}

function scenarioForIndex(index) {
    const scenarioIndex = ((Math.floor(index) % SCENARIO_COUNT) + SCENARIO_COUNT) % SCENARIO_COUNT
    return {
        id: `scenario-${scenarioIndex}`,
        map: scenarioIndex % 2,
        candidateSide: Math.floor(scenarioIndex / 2) % 2 == 0 ? "left" : "right",
        candidateRole: Math.floor(scenarioIndex / 4) % 2 == 0 ? "responder" : "probe",
    }
}

function validateScenario(scenario, label) {
    assertExactKeys(scenario, ["id", "map", "candidateSide", "candidateRole"], label)
    assertString(scenario.id, `${label}.id`)
    if(scenario.map !== 0 && scenario.map !== 1) fail(`${label}.map must be 0 or 1`)
    if(scenario.candidateSide !== "left" && scenario.candidateSide !== "right") fail(`${label}.candidateSide is invalid`)
    if(scenario.candidateRole !== "responder" && scenario.candidateRole !== "probe") fail(`${label}.candidateRole is invalid`)
    return scenario
}

function createScenarioManifest({ baseSeed, workers, trainingMatches, evaluationMatches, gameVersion = GAME_VERSION, modelSchemaVersion = MODEL_SCHEMA_VERSION }) {
    assertInteger(baseSeed, "baseSeed")
    assertInteger(workers, "workers", 1)
    assertInteger(trainingMatches, "trainingMatches", 1)
    assertInteger(evaluationMatches, "evaluationMatches", 1)
    if(workers > 20) fail("workers must not exceed 20")
    if(baseSeed + HOLDOUT_SEED_OFFSET + workers - 1 > 0xffffffff) fail("baseSeed is too large for the holdout seed block")
    if(trainingMatches % SCENARIO_COUNT != 0 || evaluationMatches % SCENARIO_COUNT != 0) fail("trainingMatches and evaluationMatches must be multiples of the scenario count")
    const manifest = {
        kind: SCENARIO_MANIFEST_KIND,
        formatVersion: SCENARIO_MANIFEST_FORMAT_VERSION,
        gameVersion,
        modelSchemaVersion,
        baseSeed,
        workers,
        trainingMatches,
        evaluationMatches,
        trainingSeedOffset: TRAINING_SEED_OFFSET,
        holdoutSeedOffset: HOLDOUT_SEED_OFFSET,
        scenarios: Array.from({ length: SCENARIO_COUNT }, (_, index) => scenarioForIndex(index)),
    }
    return validateScenarioManifest(manifest)
}

function validateScenarioManifest(manifest, label = "scenario manifest") {
    assertExactKeys(manifest, [
        "kind", "formatVersion", "gameVersion", "modelSchemaVersion", "baseSeed", "workers", "trainingMatches", "evaluationMatches",
        "trainingSeedOffset", "holdoutSeedOffset", "scenarios",
    ], label)
    if(manifest.kind !== SCENARIO_MANIFEST_KIND || manifest.formatVersion !== SCENARIO_MANIFEST_FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    assertString(manifest.gameVersion, `${label}.gameVersion`)
    assertInteger(manifest.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(manifest.baseSeed, `${label}.baseSeed`)
    assertInteger(manifest.workers, `${label}.workers`, 1)
    assertInteger(manifest.trainingMatches, `${label}.trainingMatches`, 1)
    assertInteger(manifest.evaluationMatches, `${label}.evaluationMatches`, 1)
    if(manifest.workers > 20) fail(`${label}.workers must not exceed 20`)
    assertInteger(manifest.trainingSeedOffset, `${label}.trainingSeedOffset`)
    assertInteger(manifest.holdoutSeedOffset, `${label}.holdoutSeedOffset`)
    if(manifest.trainingSeedOffset !== TRAINING_SEED_OFFSET || manifest.holdoutSeedOffset !== HOLDOUT_SEED_OFFSET) fail(`${label} uses unsupported seed offsets`)
    if(manifest.baseSeed + manifest.holdoutSeedOffset + manifest.workers - 1 > 0xffffffff) fail(`${label} holdout seed block exceeds the safe seed range`)
    if(manifest.trainingMatches % SCENARIO_COUNT != 0 || manifest.evaluationMatches % SCENARIO_COUNT != 0) fail(`${label} match counts must be multiples of the scenario count`)
    if(!Array.isArray(manifest.scenarios) || manifest.scenarios.length !== SCENARIO_COUNT) fail(`${label}.scenarios must contain ${SCENARIO_COUNT} scenarios`)
    manifest.scenarios.forEach((scenario, index) => {
        validateScenario(scenario, `${label}.scenarios[${index}]`)
        const expected = scenarioForIndex(index)
        if(JSON.stringify(scenario) !== JSON.stringify(expected)) fail(`${label}.scenarios[${index}] does not match the canonical schedule`)
    })
    return manifest
}

function scenarioSeedForShard(manifest, mode, shard) {
    validateScenarioManifest(manifest)
    if(mode !== "train" && mode !== "evaluate") return null
    const match = mode == "train" ? /^train-([0-9]+)$/.exec(shard) : /^(?:eval|baseline-eval)-([0-9]+)$/.exec(shard)
    if(!match) return null
    const shardIndex = Number(match[1])
    if(!Number.isSafeInteger(shardIndex) || shardIndex < 0 || shardIndex >= manifest.workers) return null
    return manifest.baseSeed + (mode == "train" ? manifest.trainingSeedOffset : manifest.holdoutSeedOffset) + shardIndex
}

function emptyScenarioBucket() {
    return { games: 0, wins: 0, losses: 0, ties: 0, score: 0, averageRound: 0, minimumRound: 0, maximumRound: 0 }
}

function addScenarioMatch(bucket, match) {
    bucket.games++
    if(match.result == "win") bucket.wins++
    else if(match.result == "loss") bucket.losses++
    else bucket.ties++
    bucket.averageRound += match.round
    bucket.minimumRound = bucket.minimumRound == 0 ? match.round : Math.min(bucket.minimumRound, match.round)
    bucket.maximumRound = Math.max(bucket.maximumRound, match.round)
}

function finalizeScenarioBucket(bucket) {
    return {
        games: bucket.games,
        wins: bucket.wins,
        losses: bucket.losses,
        ties: bucket.ties,
        score: bucket.games ? (bucket.wins + bucket.ties * 0.5) / bucket.games : 0,
        averageRound: bucket.games ? bucket.averageRound / bucket.games : 0,
        minimumRound: bucket.minimumRound,
        maximumRound: bucket.maximumRound,
    }
}

function scenarioReportIdentity(report) {
    const identity = {}
    for(const key of Object.keys(report)) if(key != "reportId") identity[key] = report[key]
    return identity
}

function createScenarioReport(results, manifest) {
    validateScenarioManifest(manifest)
    if(!Array.isArray(results) || results.length == 0) fail("No evaluation results were supplied for the scenario report")
    if(results.length !== manifest.workers) fail(`Scenario report requires exactly ${manifest.workers} evaluation results`)
    const validated = results.map((result, index) => validateEvaluationResult(result, `scenario evaluation result ${index}`))
    const first = validated[0]
    if(first.gameVersion != manifest.gameVersion || first.modelSchemaVersion != manifest.modelSchemaVersion) fail("Scenario evaluation results do not match the manifest")
    const sourceResultIds = []
    const seenResultIds = new Set()
    const seenSeeds = new Set()
    const overall = emptyScenarioBucket()
    const byScenario = Object.fromEntries(manifest.scenarios.map(scenario => [scenario.id, emptyScenarioBucket()]))
    for(const result of validated) {
        const expectedSeed = scenarioSeedForShard(manifest, "evaluate", result.shard)
        if(expectedSeed == null || expectedSeed !== result.seed) fail(`Scenario evaluation result ${result.shard} is not in the manifest holdout seed block`)
        if(seenSeeds.has(expectedSeed)) fail("Scenario evaluation results contain duplicate worker shards")
        seenSeeds.add(expectedSeed)
        if(result.requestedMatches !== manifest.evaluationMatches) fail(`Scenario evaluation result ${result.shard} has the wrong match count`)
        if(result.candidateCheckpointId != first.candidateCheckpointId || result.candidateModelDigest != first.candidateModelDigest || result.baselineCheckpointId != first.baselineCheckpointId || result.baselineModelDigest != first.baselineModelDigest) fail("Scenario evaluation results do not share checkpoint identities")
        if(seenResultIds.has(result.resultId)) fail("Scenario evaluation results contain duplicate identities")
        seenResultIds.add(result.resultId)
        sourceResultIds.push(result.resultId)
        for(const match of result.matches) {
            addScenarioMatch(overall, match)
            const scenario = manifest.scenarios[match.index % SCENARIO_COUNT]
            addScenarioMatch(byScenario[scenario.id], match)
        }
    }
    const finalizedOverall = finalizeScenarioBucket(overall)
    const finalizedScenarios = Object.fromEntries(Object.entries(byScenario).map(([id, bucket]) => [id, finalizeScenarioBucket(bucket)]))
    const expectedGamesPerScenario = finalizedOverall.games / SCENARIO_COUNT
    if(!Number.isInteger(expectedGamesPerScenario) || Object.values(finalizedScenarios).some(bucket => bucket.games !== expectedGamesPerScenario)) fail("Scenario holdout results are not balanced across scenarios")
    const report = {
        kind: SCENARIO_REPORT_KIND,
        formatVersion: SCENARIO_REPORT_FORMAT_VERSION,
        reportId: "",
        gameVersion: first.gameVersion,
        modelSchemaVersion: first.modelSchemaVersion,
        manifestBaseSeed: manifest.baseSeed,
        manifestWorkers: manifest.workers,
        manifestEvaluationMatches: manifest.evaluationMatches,
        holdoutSeedOffset: manifest.holdoutSeedOffset,
        candidateCheckpointId: first.candidateCheckpointId,
        candidateModelDigest: first.candidateModelDigest,
        baselineCheckpointId: first.baselineCheckpointId,
        baselineModelDigest: first.baselineModelDigest,
        overall: finalizedOverall,
        byScenario: finalizedScenarios,
        sourceResultIds: sourceResultIds.sort(),
    }
    report.reportId = digest(scenarioReportIdentity(report))
    return validateScenarioReport(report)
}

function validateScenarioBucket(bucket, label) {
    assertExactKeys(bucket, ["games", "wins", "losses", "ties", "score", "averageRound", "minimumRound", "maximumRound"], label)
    for(const key of ["games", "wins", "losses", "ties", "minimumRound", "maximumRound"]) assertInteger(bucket[key], `${label}.${key}`)
    if(bucket.games != bucket.wins + bucket.losses + bucket.ties) fail(`${label} outcomes do not add up to games`)
    if(bucket.games == 0 && (bucket.minimumRound != 0 || bucket.maximumRound != 0)) fail(`${label} has round bounds without games`)
    if(bucket.games > 0 && (bucket.minimumRound < 1 || bucket.maximumRound < bucket.minimumRound)) fail(`${label} has invalid round bounds`)
    if(bucket.games > 0 && (bucket.averageRound < bucket.minimumRound || bucket.averageRound > bucket.maximumRound)) fail(`${label}.averageRound is outside its round bounds`)
    if(!Number.isFinite(bucket.score) || bucket.score < 0 || bucket.score > 1) fail(`${label}.score is invalid`)
    if(!Number.isFinite(bucket.averageRound) || bucket.averageRound < 0) fail(`${label}.averageRound is invalid`)
    const expectedScore = bucket.games ? (bucket.wins + bucket.ties * 0.5) / bucket.games : 0
    if(Math.abs(bucket.score - expectedScore) > 1e-12) fail(`${label}.score is inconsistent`)
}

function validateScenarioReport(report, label = "scenario report") {
    assertExactKeys(report, [
        "kind", "formatVersion", "reportId", "gameVersion", "modelSchemaVersion", "manifestBaseSeed", "manifestWorkers", "manifestEvaluationMatches", "holdoutSeedOffset",
        "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest", "overall", "byScenario", "sourceResultIds",
    ], label)
    if(report.kind !== SCENARIO_REPORT_KIND || report.formatVersion !== SCENARIO_REPORT_FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    assertString(report.gameVersion, `${label}.gameVersion`)
    assertInteger(report.modelSchemaVersion, `${label}.modelSchemaVersion`, 1)
    assertInteger(report.manifestBaseSeed, `${label}.manifestBaseSeed`)
    assertInteger(report.manifestWorkers, `${label}.manifestWorkers`, 1)
    assertInteger(report.manifestEvaluationMatches, `${label}.manifestEvaluationMatches`, 1)
    if(report.manifestWorkers > 20) fail(`${label}.manifestWorkers must not exceed 20`)
    assertInteger(report.holdoutSeedOffset, `${label}.holdoutSeedOffset`)
    if(report.holdoutSeedOffset !== HOLDOUT_SEED_OFFSET) fail(`${label} uses an unsupported holdout seed offset`)
    for(const key of ["reportId", "candidateCheckpointId", "candidateModelDigest", "baselineCheckpointId", "baselineModelDigest"]) {
        if(typeof report[key] != "string" || !/^sha256:[0-9a-f]{64}$/.test(report[key])) fail(`${label}.${key} must be a digest`)
    }
    validateScenarioBucket(report.overall, `${label}.overall`)
    assertExactKeys(report.byScenario, Array.from({ length: SCENARIO_COUNT }, (_, index) => `scenario-${index}`), `${label}.byScenario`)
    for(const [id, bucket] of Object.entries(report.byScenario)) validateScenarioBucket(bucket, `${label}.byScenario.${id}`)
    if(report.manifestEvaluationMatches % SCENARIO_COUNT != 0) fail(`${label}.manifestEvaluationMatches must be a multiple of the scenario count`)
    if(report.manifestBaseSeed + report.holdoutSeedOffset + report.manifestWorkers - 1 > 0xffffffff) fail(`${label} holdout seed block exceeds the safe seed range`)
    if(report.overall.games != report.manifestWorkers * report.manifestEvaluationMatches) fail(`${label}.overall does not contain every worker holdout`)
    if(report.overall.games != Object.values(report.byScenario).reduce((sum, bucket) => sum + bucket.games, 0)) fail(`${label}.byScenario does not add up to overall`)
    if(!Array.isArray(report.sourceResultIds) || report.sourceResultIds.length == 0 || new Set(report.sourceResultIds).size != report.sourceResultIds.length) fail(`${label}.sourceResultIds is invalid`)
    report.sourceResultIds.forEach((id, index) => {
        if(typeof id != "string" || !/^sha256:[0-9a-f]{64}$/.test(id)) fail(`${label}.sourceResultIds[${index}] must be a digest`)
        if(index > 0 && report.sourceResultIds[index - 1] >= id) fail(`${label}.sourceResultIds must be sorted`)
    })
    if(report.reportId !== digest(scenarioReportIdentity(report))) fail(`${label}.reportId does not match its contents`)
    return report
}

function main() {
    const args = parseArgs(process.argv.slice(2), ["base-seed", "workers", "training-matches", "evaluation-matches", "output"])
    if(args.help) {
        console.log("Usage: node tools/distributed-ai/scenarios.js --base-seed N --workers N --training-matches N --evaluation-matches N --output manifest.json")
        return
    }
    const manifest = createScenarioManifest({
        baseSeed: integerArg(args, "base-seed", { maximum: 0xffffffff }),
        workers: integerArg(args, "workers", { minimum: 1, maximum: 20 }),
        trainingMatches: integerArg(args, "training-matches", { minimum: 1 }),
        evaluationMatches: integerArg(args, "evaluation-matches", { minimum: 1 }),
    })
    const output = writeJson(requiredArg(args, "output"), manifest)
    console.log(`Created scenario manifest at ${output}`)
}

if(require.main === module) {
    try {
        main()
    } catch(error) {
        console.error(error.stack || error.message)
        process.exitCode = 1
    }
}

module.exports = {
    HOLDOUT_SEED_OFFSET,
    SCENARIO_COUNT,
    SCENARIO_MANIFEST_FORMAT_VERSION,
    SCENARIO_MANIFEST_KIND,
    TRAINING_SEED_OFFSET,
    createScenarioManifest,
    scenarioForIndex,
    createScenarioReport,
    SCENARIO_REPORT_FORMAT_VERSION,
    SCENARIO_REPORT_KIND,
    scenarioSeedForShard,
    validateScenarioReport,
    validateScenarioManifest,
}
