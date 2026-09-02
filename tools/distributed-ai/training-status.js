"use strict"

const fs = require("node:fs")
const zlib = require("node:zlib")
const { TextDecoder } = require("node:util")
const {
    FORMAT_VERSION,
    canonicalStringify,
    validateEvaluationAggregate,
    validateHostedPromotionReceipt,
} = require("./common")

const STATUS_KIND = "btdb-ai-training-status"
const STATUS_FORMAT_VERSION = 1
const STATUS_BRANCH = "ai-status"
const STATUS_PATH = "ai-training-status.json"
const STATUS_MAX_BYTES = 32 * 1024
const ARTIFACT_JSON_MAX_BYTES = 256 * 1024
const ARTIFACT_ARCHIVE_MAX_BYTES = 32 * 1024 * 1024
const EVENT_MAX_BYTES = 2 * 1024 * 1024
const API_JSON_MAX_BYTES = 4 * 1024 * 1024
const SOURCE_WORKFLOW_NAME = "Distributed AI Training"
const SOURCE_WORKFLOW_PATH = ".github/workflows/ai-training.yml"
const SOURCE_BRANCH = "main"
const STATES = ["requested", "in_progress", "completed"]
const CONCLUSIONS = ["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required", "stale", "startup_failure"]
const PHASES = ["queued", "running", "preparing", "training", "selecting", "evaluating", "reporting", "promoting", "finalizing", "continuing", "completed"]
const COUNT_KEYS = ["total", "queued", "inProgress", "completed", "succeeded", "failed", "cancelled", "skipped"]
const WORKER_KEYS = ["total", "queued", "inProgress", "succeeded", "failed", "cancelled", "skipped"]
const FAILED_CONCLUSIONS = new Set(["failure", "timed_out", "action_required", "stale", "startup_failure"])
const LEGACY_EVALUATION_STATUS_KEYS = [
    "runId", "runNumber", "runAttempt", "aggregateId", "candidateCheckpointId", "baselineCheckpointId", "passed",
    "games", "wins", "losses", "ties", "score", "minimumScore", "minimumGames", "minimumBucketScore", "worstBucketScore",
    "survivalRate", "minimumSurvivalRate", "severeCollapseRate", "maximumSevereCollapseRate",
]
const EVALUATION_STATUS_KEYS = LEGACY_EVALUATION_STATUS_KEYS.concat([
    "defensiveGames", "defensiveProtectedGames", "defensiveProtectionRate", "minimumDefensiveRate",
    "minimumDefensiveLives", "minimumDefensiveFloorLives", "minimumDefensiveObservedLives",
])
const textDecoder = new TextDecoder("utf-8", { fatal: true })

function fail(message) {
    throw new Error(message)
}

function isPlainObject(value) {
    if(value == null || typeof value != "object" || Array.isArray(value)) return false
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
}

function assertObject(value, label) {
    if(!isPlainObject(value)) fail(`${label} must be an object`)
}

function assertExactKeys(value, keys, label) {
    assertObject(value, label)
    const actual = Object.keys(value).sort()
    const expected = keys.slice().sort()
    if(actual.length != expected.length || actual.some((key, index) => key != expected[index])) fail(`${label} keys must be exactly: ${expected.join(", ")}`)
}

function assertInteger(value, label, minimum = 0) {
    if(!Number.isSafeInteger(value) || value < minimum) fail(`${label} must be an integer >= ${minimum}`)
}

function assertString(value, label, maximum) {
    if(typeof value != "string" || value.length == 0 || value.length > maximum) fail(`${label} must be a non-empty string no longer than ${maximum} characters`)
}

function assertBoolean(value, label) {
    if(typeof value != "boolean") fail(`${label} must be boolean`)
}

function assertNumber(value, label, minimum, maximum) {
    if(!Number.isFinite(value) || value < minimum || value > maximum) fail(`${label} must be finite and between ${minimum} and ${maximum}`)
}

function assertDigest(value, label) {
    if(typeof value != "string" || !/^sha256:[0-9a-f]{64}$/.test(value)) fail(`${label} must be a canonical SHA-256 identifier`)
}

function assertHeadSha(value, label) {
    if(typeof value != "string" || !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(value)) fail(`${label} must be a canonical Git object ID`)
}

function normalizeTimestamp(value, label, nullable = false) {
    if(nullable && value === null) return null
    assertString(value, label, 32)
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) fail(`${label} must be a UTC timestamp`)
    return new Date(value).toISOString()
}

function assertRepository(value, label) {
    assertString(value, label, 200)
    if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) fail(`${label} must be an owner/repository name`)
}

function validateCounts(counts, keys, label) {
    assertExactKeys(counts, keys, label)
    for(const key of keys) assertInteger(counts[key], `${label}.${key}`)
    for(const key of keys.filter(key => key != "total")) if(counts[key] > counts.total) fail(`${label}.${key} cannot exceed total`)
    return counts
}

function validateProjection(projection, label = "status.current.projection") {
    if(projection === null) return null
    assertExactKeys(projection, ["jobs", "workers"], label)
    validateCounts(projection.jobs, COUNT_KEYS, `${label}.jobs`)
    assertExactKeys(projection.workers, ["training", "evaluation"], `${label}.workers`)
    validateCounts(projection.workers.training, WORKER_KEYS, `${label}.workers.training`)
    validateCounts(projection.workers.evaluation, WORKER_KEYS, `${label}.workers.evaluation`)
    return projection
}

function validateCurrent(current, repository, label = "status.current") {
    assertExactKeys(current, [
        "runId", "runNumber", "runAttempt", "state", "conclusion", "headSha", "url", "createdAt", "startedAt",
        "updatedAt", "phase", "projection",
    ], label)
    assertInteger(current.runId, `${label}.runId`, 1)
    assertInteger(current.runNumber, `${label}.runNumber`, 1)
    assertInteger(current.runAttempt, `${label}.runAttempt`, 1)
    if(!STATES.includes(current.state)) fail(`${label}.state is unsupported`)
    if(current.state == "completed") {
        if(!CONCLUSIONS.includes(current.conclusion)) fail(`${label}.conclusion is unsupported`)
    } else if(current.conclusion !== null) {
        fail(`${label}.conclusion must be null before completion`)
    }
    assertHeadSha(current.headSha, `${label}.headSha`)
    const expectedUrl = `https://github.com/${repository}/actions/runs/${current.runId}`
    if(current.url !== expectedUrl) fail(`${label}.url must identify the run in this repository`)
    normalizeTimestamp(current.createdAt, `${label}.createdAt`)
    normalizeTimestamp(current.startedAt, `${label}.startedAt`, true)
    normalizeTimestamp(current.updatedAt, `${label}.updatedAt`)
    if(!PHASES.includes(current.phase)) fail(`${label}.phase is unsupported`)
    if(current.state == "completed" && current.phase != "completed") fail(`${label}.phase must be completed for a completed run`)
    validateProjection(current.projection, `${label}.projection`)
    return current
}

function validateEvidenceSource(value, label) {
    assertInteger(value.runId, `${label}.runId`, 1)
    assertInteger(value.runNumber, `${label}.runNumber`, 1)
    assertInteger(value.runAttempt, `${label}.runAttempt`, 1)
}

function validateEvaluationStatus(evaluation, label = "status.latestEvaluation") {
    if(evaluation === null) return null
    const current = Object.prototype.hasOwnProperty.call(evaluation, "defensiveGames")
    assertExactKeys(evaluation, current ? EVALUATION_STATUS_KEYS : LEGACY_EVALUATION_STATUS_KEYS, label)
    validateEvidenceSource(evaluation, label)
    for(const key of ["aggregateId", "candidateCheckpointId", "baselineCheckpointId"]) assertDigest(evaluation[key], `${label}.${key}`)
    assertBoolean(evaluation.passed, `${label}.passed`)
    for(const key of ["games", "wins", "losses", "ties"]) assertInteger(evaluation[key], `${label}.${key}`)
    if(evaluation.games != evaluation.wins + evaluation.losses + evaluation.ties) fail(`${label} outcomes do not add up to games`)
    assertNumber(evaluation.score, `${label}.score`, 0, 1)
    assertNumber(evaluation.minimumScore, `${label}.minimumScore`, 0, 1)
    assertInteger(evaluation.minimumGames, `${label}.minimumGames`, 1)
    for(const key of ["minimumBucketScore", "worstBucketScore", "survivalRate", "minimumSurvivalRate", "severeCollapseRate", "maximumSevereCollapseRate"]) assertNumber(evaluation[key], `${label}.${key}`, 0, 1)
    if(current) {
        for(const key of ["defensiveGames", "defensiveProtectedGames"]) assertInteger(evaluation[key], `${label}.${key}`)
        if(evaluation.defensiveProtectedGames > evaluation.defensiveGames || evaluation.defensiveGames > evaluation.games) fail(`${label}.defensive counts are inconsistent`)
        for(const key of ["defensiveProtectionRate", "minimumDefensiveRate"]) assertNumber(evaluation[key], `${label}.${key}`, 0, 1)
        for(const key of ["minimumDefensiveLives", "minimumDefensiveFloorLives"]) assertInteger(evaluation[key], `${label}.${key}`)
        assertNumber(evaluation.minimumDefensiveObservedLives, `${label}.minimumDefensiveObservedLives`, 0)
        const expectedRate = evaluation.defensiveGames ? evaluation.defensiveProtectedGames / evaluation.defensiveGames : 0
        if(Math.abs(evaluation.defensiveProtectionRate - expectedRate) > 1e-12) fail(`${label}.defensiveProtectionRate is inconsistent`)
    }
    return evaluation
}

function validatePromotionStatus(promotion, label = "status.latestPromotion") {
    if(promotion === null) return null
    assertExactKeys(promotion, [
        "runId", "runNumber", "runAttempt", "snapshotId", "promotionId", "duplicate", "revision", "modelDigest",
        "contributionEpoch", "championGeneration", "promotedPolicyDigest", "candidatePolicyPreserved",
    ], label)
    validateEvidenceSource(promotion, label)
    for(const key of ["snapshotId", "promotionId", "modelDigest", "promotedPolicyDigest"]) assertDigest(promotion[key], `${label}.${key}`)
    assertBoolean(promotion.duplicate, `${label}.duplicate`)
    assertInteger(promotion.revision, `${label}.revision`)
    assertInteger(promotion.contributionEpoch, `${label}.contributionEpoch`, 1)
    assertInteger(promotion.championGeneration, `${label}.championGeneration`)
    assertBoolean(promotion.candidatePolicyPreserved, `${label}.candidatePolicyPreserved`)
    return promotion
}

function validateStatus(status, label = "status") {
    assertExactKeys(status, ["kind", "formatVersion", "repository", "branch", "publishedAt", "current", "latestEvaluation", "latestPromotion"], label)
    if(status.kind !== STATUS_KIND || status.formatVersion !== STATUS_FORMAT_VERSION) fail(`${label} has an unsupported kind or format version`)
    assertRepository(status.repository, `${label}.repository`)
    if(status.branch !== SOURCE_BRANCH) fail(`${label}.branch must be ${SOURCE_BRANCH}`)
    normalizeTimestamp(status.publishedAt, `${label}.publishedAt`)
    validateCurrent(status.current, status.repository, `${label}.current`)
    validateEvaluationStatus(status.latestEvaluation, `${label}.latestEvaluation`)
    validatePromotionStatus(status.latestPromotion, `${label}.latestPromotion`)
    if(status.latestEvaluation !== null && compareRun(status.latestEvaluation, status.current) > 0) fail(`${label}.latestEvaluation cannot be newer than current`)
    if(status.latestPromotion !== null) {
        if(status.latestEvaluation === null || compareRun(status.latestPromotion, status.latestEvaluation) > 0) fail(`${label}.latestPromotion cannot be newer than latestEvaluation`)
        if(compareRun(status.latestPromotion, status.latestEvaluation) == 0 && status.latestPromotion.promotionId != status.latestEvaluation.candidateCheckpointId) fail(`${label}.latestPromotion does not match latestEvaluation`)
    }
    return status
}

function encodeStatus(status) {
    validateStatus(status)
    const encoded = `${JSON.stringify(status, null, 2)}\n`
    const size = Buffer.byteLength(encoded)
    if(size > STATUS_MAX_BYTES) fail(`Status document exceeds the ${STATUS_MAX_BYTES}-byte limit`)
    return encoded
}

function validateEventRepository(payload, expectedRepository) {
    assertObject(payload, "event")
    assertRepository(expectedRepository, "expected repository")
    assertObject(payload.repository, "event.repository")
    if(payload.repository.full_name !== expectedRepository) fail("event.repository does not match GITHUB_REPOSITORY")
    assertInteger(payload.repository.id, "event.repository.id", 1)
    if(payload.repository.default_branch !== SOURCE_BRANCH) fail(`event.repository.default_branch must be ${SOURCE_BRANCH}`)
    return payload.repository.id
}

function sourceStateForStatus(status) {
    if(["queued", "requested", "pending", "waiting"].includes(status)) return "requested"
    if(status == "in_progress") return "in_progress"
    if(status == "completed") return "completed"
    fail("training run has an unsupported status")
}

function validateSourceRun(run, workflow, expectedRepository, expectedRepositoryId) {
    assertRepository(expectedRepository, "expected repository")
    assertInteger(expectedRepositoryId, "expected repository ID", 1)
    assertObject(workflow, "training workflow")
    assertInteger(workflow.id, "training workflow.id", 1)
    if(workflow.name !== SOURCE_WORKFLOW_NAME || workflow.path !== SOURCE_WORKFLOW_PATH) fail("GitHub API did not return the trusted training workflow")
    assertObject(run, "training run")
    assertInteger(run.workflow_id, "training run.workflow_id", 1)
    if(run.workflow_id !== workflow.id || run.path !== SOURCE_WORKFLOW_PATH) fail("training run does not use the trusted workflow identity")
    if(run.event !== "workflow_dispatch") fail("training run has an unsupported trigger")
    if(run.head_branch !== SOURCE_BRANCH) fail(`training run.head_branch must be ${SOURCE_BRANCH}`)
    assertObject(run.head_repository, "training run.head_repository")
    if(run.head_repository.id !== expectedRepositoryId || run.head_repository.full_name !== expectedRepository) fail("training run did not originate in this repository")
    assertObject(run.repository, "training run.repository")
    if(run.repository.id !== expectedRepositoryId || run.repository.full_name !== expectedRepository) fail("training run repository identity is inconsistent")
    assertInteger(run.id, "training run.id", 1)
    assertInteger(run.run_number, "training run.run_number", 1)
    assertInteger(run.run_attempt, "training run.run_attempt", 1)
    assertHeadSha(run.head_sha, "training run.head_sha")
    const state = sourceStateForStatus(run.status)
    if(state == "completed") {
        if(!CONCLUSIONS.includes(run.conclusion)) fail("completed training run has an unsupported conclusion")
    } else if(run.conclusion !== null) {
        fail("incomplete training run must not have a conclusion")
    }
    return {
        repository: expectedRepository,
        runId: run.id,
        runNumber: run.run_number,
        runAttempt: run.run_attempt,
        state,
        conclusion: state == "completed" ? run.conclusion : null,
        headSha: run.head_sha,
        createdAt: normalizeTimestamp(run.created_at, "training run.created_at"),
        startedAt: normalizeTimestamp(run.run_started_at, "training run.run_started_at", true),
        updatedAt: normalizeTimestamp(run.updated_at, "training run.updated_at"),
    }
}

function validateSourceEvent(payload, expectedRepository) {
    const repositoryId = validateEventRepository(payload, expectedRepository)
    if(!STATES.includes(payload.action)) fail("event.action is not a supported workflow_run lifecycle action")
    assertObject(payload.workflow_run, "event.workflow_run")
    const run = payload.workflow_run
    if(run.path !== SOURCE_WORKFLOW_PATH) fail("workflow_run is not the trusted training workflow")
    if(run.event !== "workflow_dispatch") fail("workflow_run has an unsupported trigger")
    if(run.head_branch !== SOURCE_BRANCH) fail(`workflow_run.head_branch must be ${SOURCE_BRANCH}`)
    assertObject(run.head_repository, "event.workflow_run.head_repository")
    if(run.head_repository.id !== repositoryId || run.head_repository.full_name !== expectedRepository) fail("workflow_run did not originate in this repository")
    if(run.repository != null) {
        assertObject(run.repository, "event.workflow_run.repository")
        if(run.repository.id !== repositoryId || run.repository.full_name !== expectedRepository) fail("workflow_run repository identity is inconsistent")
    }
    assertInteger(run.workflow_id, "event.workflow_run.workflow_id", 1)
    assertInteger(run.id, "event.workflow_run.id", 1)
    assertInteger(run.run_number, "event.workflow_run.run_number", 1)
    assertInteger(run.run_attempt, "event.workflow_run.run_attempt", 1)
    assertHeadSha(run.head_sha, "event.workflow_run.head_sha")
    const allowedStatuses = {
        requested: ["queued", "requested", "pending", "waiting"],
        in_progress: ["in_progress"],
        completed: ["completed"],
    }
    if(!allowedStatuses[payload.action].includes(run.status)) fail("workflow_run status does not match the lifecycle action")
    if(payload.action == "completed") {
        if(!CONCLUSIONS.includes(run.conclusion)) fail("completed workflow_run has an unsupported conclusion")
    } else if(run.conclusion !== null) {
        fail("incomplete workflow_run must not have a conclusion")
    }
    const createdAt = normalizeTimestamp(run.created_at, "event.workflow_run.created_at")
    const startedAt = normalizeTimestamp(run.run_started_at, "event.workflow_run.run_started_at", true)
    const updatedAt = normalizeTimestamp(run.updated_at, "event.workflow_run.updated_at")
    return {
        repository: expectedRepository,
        runId: run.id,
        runNumber: run.run_number,
        runAttempt: run.run_attempt,
        state: payload.action,
        conclusion: payload.action == "completed" ? run.conclusion : null,
        headSha: run.head_sha,
        createdAt,
        startedAt,
        updatedAt,
    }
}

function compareRun(left, right) {
    if(left.runNumber != right.runNumber) return left.runNumber < right.runNumber ? -1 : 1
    if(left.runId != right.runId) fail(`Run number ${left.runNumber} has conflicting run IDs`)
    if(left.runAttempt != right.runAttempt) return left.runAttempt < right.runAttempt ? -1 : 1
    return 0
}

function lifecycleRank(state) {
    return STATES.indexOf(state)
}

function isStaleSource(current, source) {
    const runOrder = compareRun(source, current)
    return runOrder < 0 || runOrder == 0 && lifecycleRank(source.state) < lifecycleRank(current.state)
}

function acceptsHistoricalEvidence(current, source) {
    return source.state == "completed" && source.runId != current.runId && compareRun(source, current) < 0
}

function emptyCounts(keys) {
    return Object.fromEntries(keys.map(key => [key, 0]))
}

function addJobCount(counts, job) {
    counts.total++
    if(job.status == "in_progress") counts.inProgress++
    else if(job.status == "completed") counts.completed++
    else counts.queued++
    if(job.conclusion == "success") counts.succeeded++
    else if(FAILED_CONCLUSIONS.has(job.conclusion)) counts.failed++
    else if(job.conclusion == "cancelled") counts.cancelled++
    else if(job.conclusion == "skipped") counts.skipped++
}

function addWorkerCount(counts, job) {
    counts.total++
    if(job.status == "in_progress") counts.inProgress++
    else if(job.status != "completed") counts.queued++
    if(job.conclusion == "success") counts.succeeded++
    else if(FAILED_CONCLUSIONS.has(job.conclusion)) counts.failed++
    else if(job.conclusion == "cancelled") counts.cancelled++
    else if(job.conclusion == "skipped") counts.skipped++
}

function jobKind(name) {
    const normalized = name.toLowerCase()
    if(/^prepare(?:\s|\(|$)/.test(normalized)) return "prepare"
    if(/^train(?:\s|\(|$)/.test(normalized)) return "train"
    if(/^select(?:\s|\(|$)/.test(normalized)) return "select"
    if(/^evaluate(?:\s|\(|$)/.test(normalized)) return "evaluate"
    if(/^report(?:\s|\(|$)/.test(normalized)) return "report"
    if(/^promote(?:\s|\(|$)/.test(normalized) || /^publish-hosted(?:\s|\(|$)/.test(normalized)) return "promote"
    if(/^finalize-promotion(?:\s|\(|$)/.test(normalized)) return "finalize"
    if(/^continue(?:\s|\(|$)/.test(normalized) || /^handoff-continuous-training(?:\s|\(|$)/.test(normalized)) return "continue"
    return "unknown"
}

const KIND_RANK = { prepare: 1, train: 2, select: 3, evaluate: 4, report: 5, promote: 6, finalize: 7, continue: 8, unknown: 0 }
const KIND_PHASE = { prepare: "preparing", train: "training", select: "selecting", evaluate: "evaluating", report: "reporting", promote: "promoting", finalize: "finalizing", continue: "continuing", unknown: "running" }

function validateJob(job, source, index) {
    const label = `jobs[${index}]`
    assertObject(job, label)
    assertString(job.name, `${label}.name`, 256)
    if(!["queued", "in_progress", "completed", "waiting", "pending", "requested"].includes(job.status)) fail(`${label}.status is unsupported`)
    if(job.status == "completed") {
        if(job.conclusion !== null && !CONCLUSIONS.includes(job.conclusion)) fail(`${label}.conclusion is unsupported`)
    } else if(job.conclusion !== null) {
        fail(`${label}.conclusion must be null before completion`)
    }
    if(job.run_id != null && job.run_id !== source.runId) fail(`${label}.run_id does not match the source run`)
    if(job.run_attempt != null && job.run_attempt !== source.runAttempt) fail(`${label}.run_attempt does not match the source attempt`)
    return { name: job.name, status: job.status, conclusion: job.conclusion }
}

function projectJobs(jobs, source) {
    if(jobs === null) return { phase: source.state == "requested" ? "queued" : source.state == "completed" ? "completed" : "running", projection: null }
    if(!Array.isArray(jobs) || jobs.length > 100) fail("jobs must be an array with at most 100 entries")
    const sanitized = jobs.map((job, index) => validateJob(job, source, index))
    const jobCounts = emptyCounts(COUNT_KEYS)
    const training = emptyCounts(WORKER_KEYS)
    const evaluation = emptyCounts(WORKER_KEYS)
    for(const job of sanitized) {
        addJobCount(jobCounts, job)
        const kind = jobKind(job.name)
        if(kind == "train") addWorkerCount(training, job)
        if(kind == "evaluate") addWorkerCount(evaluation, job)
    }
    let phase
    if(source.state == "completed") {
        phase = "completed"
    } else if(source.state == "requested" && sanitized.length == 0) {
        phase = "queued"
    } else {
        const inProgress = sanitized.filter(job => job.status == "in_progress")
        const queued = sanitized.filter(job => job.status != "in_progress" && job.status != "completed")
        const completed = sanitized.filter(job => job.status == "completed")
        let selected = null
        if(inProgress.length) selected = inProgress.reduce((best, job) => KIND_RANK[jobKind(job.name)] > KIND_RANK[jobKind(best.name)] ? job : best)
        else if(queued.length) selected = queued.reduce((best, job) => KIND_RANK[jobKind(job.name)] < KIND_RANK[jobKind(best.name)] ? job : best)
        else if(completed.length) selected = completed.reduce((best, job) => KIND_RANK[jobKind(job.name)] > KIND_RANK[jobKind(best.name)] ? job : best)
        phase = selected ? KIND_PHASE[jobKind(selected.name)] : source.state == "requested" ? "queued" : "running"
    }
    return { phase, projection: { jobs: jobCounts, workers: { training, evaluation } } }
}

function projectEvaluation(aggregate, source) {
    validateEvaluationAggregate(aggregate, "training status evaluation artifact")
    const buckets = [...Object.values(aggregate.byMap), ...Object.values(aggregate.bySide), ...Object.values(aggregate.byRole)]
    const projected = {
        runId: source.runId,
        runNumber: source.runNumber,
        runAttempt: source.runAttempt,
        aggregateId: aggregate.aggregateId,
        candidateCheckpointId: aggregate.candidateCheckpointId,
        baselineCheckpointId: aggregate.baselineCheckpointId,
        passed: aggregate.passed,
        games: aggregate.overall.games,
        wins: aggregate.overall.wins,
        losses: aggregate.overall.losses,
        ties: aggregate.overall.ties,
        score: aggregate.overall.score,
        minimumScore: aggregate.thresholds.minimumScore,
        minimumGames: aggregate.thresholds.minimumGames,
        minimumBucketScore: aggregate.thresholds.minimumBucketScore,
        worstBucketScore: Math.min(...buckets.map(bucket => bucket.score)),
        survivalRate: aggregate.safety.survivalRate,
        minimumSurvivalRate: aggregate.thresholds.minimumSurvivalRate,
        severeCollapseRate: aggregate.safety.severeCollapseRate,
        maximumSevereCollapseRate: aggregate.thresholds.maximumSevereCollapseRate,
    }
    if(aggregate.absoluteDefense) Object.assign(projected, {
        defensiveGames: aggregate.absoluteDefense.games,
        defensiveProtectedGames: aggregate.absoluteDefense.protectedGames,
        defensiveProtectionRate: aggregate.absoluteDefense.protectionRate,
        minimumDefensiveRate: aggregate.thresholds.minimumDefensiveRate,
        minimumDefensiveLives: aggregate.thresholds.minimumDefensiveLives,
        minimumDefensiveFloorLives: aggregate.thresholds.minimumDefensiveFloorLives,
        minimumDefensiveObservedLives: aggregate.absoluteDefense.minimumCandidateLives,
    })
    return validateEvaluationStatus(projected)
}

function projectPromotion(receipt, source) {
    validateHostedPromotionReceipt(receipt, "training status promotion receipt")
    return validatePromotionStatus({
        runId: source.runId,
        runNumber: source.runNumber,
        runAttempt: source.runAttempt,
        snapshotId: receipt.snapshotId,
        promotionId: receipt.promotionId,
        duplicate: receipt.duplicate,
        revision: receipt.revision,
        modelDigest: receipt.modelDigest,
        contributionEpoch: receipt.contributionEpoch,
        championGeneration: receipt.championGeneration,
        promotedPolicyDigest: receipt.promotedPolicyDigest,
        candidatePolicyPreserved: receipt.candidatePolicyPreserved,
    })
}

function mergeEvidence(existing, incoming, label) {
    if(incoming === null) return existing
    if(existing === null) return incoming
    const order = compareRun(incoming, existing)
    if(order > 0) return incoming
    if(order < 0) return existing
    if(canonicalStringify(incoming) != canonicalStringify(existing)) fail(`Conflicting ${label} evidence for one run attempt`)
    return existing
}

function withoutPublishedAt(status) {
    return { ...status, publishedAt: "1970-01-01T00:00:00.000Z" }
}

function mergeStatus(previous, source, jobs, evidence, publishedAt) {
    if(previous !== null) validateStatus(previous)
    if(previous !== null && previous.repository !== source.repository) fail("Existing status belongs to a different repository")
    const historicalEvidence = previous !== null && acceptsHistoricalEvidence(previous.current, source)
    if(previous !== null && isStaleSource(previous.current, source) && !historicalEvidence) return { changed: false, status: previous }
    let current
    if(historicalEvidence) {
        current = previous.current
    } else {
        const projectedJobs = projectJobs(jobs, source)
        current = {
            runId: source.runId,
            runNumber: source.runNumber,
            runAttempt: source.runAttempt,
            state: source.state,
            conclusion: source.conclusion,
            headSha: source.headSha,
            url: `https://github.com/${source.repository}/actions/runs/${source.runId}`,
            createdAt: source.createdAt,
            startedAt: source.startedAt,
            updatedAt: source.updatedAt,
            phase: projectedJobs.phase,
            projection: projectedJobs.projection,
        }
    }
    const incomingEvaluation = evidence.evaluation === null ? null : projectEvaluation(evidence.evaluation, source)
    let incomingPromotion = evidence.receipt === null ? null : projectPromotion(evidence.receipt, source)
    let matchingEvaluation = incomingEvaluation
    if(matchingEvaluation === null && previous !== null && previous.latestEvaluation !== null && compareRun(previous.latestEvaluation, source) == 0) matchingEvaluation = previous.latestEvaluation
    if(incomingPromotion !== null && (matchingEvaluation === null || incomingPromotion.promotionId != matchingEvaluation.candidateCheckpointId)) incomingPromotion = null
    const draft = {
        kind: STATUS_KIND,
        formatVersion: STATUS_FORMAT_VERSION,
        repository: source.repository,
        branch: SOURCE_BRANCH,
        publishedAt,
        current,
        latestEvaluation: mergeEvidence(previous === null ? null : previous.latestEvaluation, incomingEvaluation, "evaluation"),
        latestPromotion: mergeEvidence(previous === null ? null : previous.latestPromotion, incomingPromotion, "promotion"),
    }
    validateStatus(draft)
    encodeStatus(draft)
    if(previous !== null && canonicalStringify(withoutPublishedAt(previous)) == canonicalStringify(withoutPublishedAt(draft))) return { changed: false, status: previous }
    return { changed: true, status: draft }
}

function selectArtifact(artifacts, name, source) {
    if(!Array.isArray(artifacts)) fail("artifacts must be an array")
    const cutoff = Date.parse(source.startedAt || source.createdAt)
    const matches = artifacts.filter(artifact => {
        if(!isPlainObject(artifact) || artifact.name !== name || artifact.expired !== false) return false
        if(!Number.isSafeInteger(artifact.id) || artifact.id < 1 || !Number.isSafeInteger(artifact.sizeInBytes) || artifact.sizeInBytes < 0 || artifact.sizeInBytes > ARTIFACT_ARCHIVE_MAX_BYTES) return false
        if(artifact.runId !== source.runId || artifact.headSha !== source.headSha) return false
        return typeof artifact.createdAt == "string" && Number.isFinite(Date.parse(artifact.createdAt)) && Date.parse(artifact.createdAt) >= cutoff
    })
    return matches.length == 1 ? matches[0] : null
}

async function loadJobs(api, source, logger) {
    try {
        const jobs = await api.listJobs(source)
        projectJobs(jobs, source)
        return jobs
    } catch(error) {
        logger.warn(`Training job projection unavailable: ${error.message}`)
        return null
    }
}

async function loadEvidence(api, source, logger) {
    const empty = { evaluation: null, receipt: null }
    if(source.state != "completed") return empty
    let artifacts
    try {
        artifacts = await api.listArtifacts(source)
    } catch(error) {
        logger.warn(`Training artifacts unavailable: ${error.message}`)
        return empty
    }
    const evaluationArtifact = selectArtifact(artifacts, "ai-training-bundle", source)
    if(evaluationArtifact === null) return empty
    let evaluation
    try {
        evaluation = await api.readArtifactJson(evaluationArtifact, "evaluation.json")
        validateEvaluationAggregate(evaluation, "training status evaluation artifact")
    } catch(error) {
        logger.warn(`Training evaluation artifact ignored: ${error.message}`)
        return empty
    }
    const result = { evaluation, receipt: null }
    const receiptArtifact = selectArtifact(artifacts, "ai-hosted-promotion-receipt", source)
    if(receiptArtifact === null) return result
    try {
        const receipt = await api.readArtifactJson(receiptArtifact, "hosted-promotion-receipt.json")
        validateHostedPromotionReceipt(receipt, "training status promotion receipt")
        if(receipt.promotionId != evaluation.candidateCheckpointId) fail("promotion receipt does not match the evaluated candidate")
        result.receipt = receipt
    } catch(error) {
        logger.warn(`Training promotion receipt ignored: ${error.message}`)
    }
    return result
}

class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

async function readResponseBytes(response, maximum) {
    const contentLength = response.headers && response.headers.get("content-length")
    if(contentLength != null && (!/^\d+$/.test(contentLength) || Number(contentLength) > maximum)) fail(`GitHub response exceeds ${maximum} bytes`)
    const chunks = []
    let size = 0
    if(response.body != null && typeof response.body[Symbol.asyncIterator] == "function") {
        for await(const chunk of response.body) {
            const bytes = Buffer.from(chunk)
            size += bytes.length
            if(size > maximum) fail(`GitHub response exceeds ${maximum} bytes`)
            chunks.push(bytes)
        }
    } else {
        const bytes = Buffer.from(await response.arrayBuffer())
        if(bytes.length > maximum) fail(`GitHub response exceeds ${maximum} bytes`)
        chunks.push(bytes)
    }
    return Buffer.concat(chunks)
}

function parseJsonBytes(bytes, label) {
    let text
    try {
        text = textDecoder.decode(bytes)
    } catch(error) {
        fail(`${label} is not valid UTF-8: ${error.message}`)
    }
    try {
        return JSON.parse(text)
    } catch(error) {
        fail(`${label} is not valid JSON: ${error.message}`)
    }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
    let crc = value
    for(let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ crc >>> 1 : crc >>> 1
    return crc >>> 0
})

function crc32(bytes) {
    let crc = 0xffffffff
    for(const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ crc >>> 8
    return (crc ^ 0xffffffff) >>> 0
}

function safeZipName(bytes, flags) {
    if((flags & 0x800) == 0 && bytes.some(byte => byte > 0x7f)) fail("Artifact ZIP contains a non-UTF-8 filename")
    const name = textDecoder.decode(bytes)
    if(name.includes("\0") || name.includes("\\") || name.startsWith("/") || name.split("/").some(part => part == "." || part == "..")) fail("Artifact ZIP contains an unsafe filename")
    return name
}

function artifactJsonFromZip(archive, fileName) {
    if(!Buffer.isBuffer(archive) || archive.length > ARTIFACT_ARCHIVE_MAX_BYTES) fail("Artifact ZIP is missing or oversized")
    if(!/^[A-Za-z0-9_.-]+\.json$/.test(fileName)) fail("Artifact JSON filename is unsupported")
    const minimumEocd = 22
    let eocd = -1
    for(let offset = archive.length - minimumEocd; offset >= Math.max(0, archive.length - 65557); offset--) {
        if(archive.readUInt32LE(offset) == 0x06054b50) {
            eocd = offset
            break
        }
    }
    if(eocd < 0 || eocd + minimumEocd > archive.length) fail("Artifact is not a supported ZIP archive")
    const disk = archive.readUInt16LE(eocd + 4)
    const centralDisk = archive.readUInt16LE(eocd + 6)
    const diskEntries = archive.readUInt16LE(eocd + 8)
    const entries = archive.readUInt16LE(eocd + 10)
    const centralSize = archive.readUInt32LE(eocd + 12)
    const centralOffset = archive.readUInt32LE(eocd + 16)
    const commentLength = archive.readUInt16LE(eocd + 20)
    if(disk != 0 || centralDisk != 0 || diskEntries != entries || entries > 256 || entries == 0 || centralOffset + centralSize > eocd || eocd + minimumEocd + commentLength != archive.length) fail("Artifact uses an unsupported ZIP layout")
    let offset = centralOffset
    const centralEnd = centralOffset + centralSize
    const matches = []
    for(let index = 0; index < entries; index++) {
        if(offset + 46 > centralEnd || archive.readUInt32LE(offset) != 0x02014b50) fail("Artifact ZIP central directory is malformed")
        const flags = archive.readUInt16LE(offset + 8)
        const compression = archive.readUInt16LE(offset + 10)
        const expectedCrc = archive.readUInt32LE(offset + 16)
        const compressedSize = archive.readUInt32LE(offset + 20)
        const uncompressedSize = archive.readUInt32LE(offset + 24)
        const nameLength = archive.readUInt16LE(offset + 28)
        const extraLength = archive.readUInt16LE(offset + 30)
        const entryCommentLength = archive.readUInt16LE(offset + 32)
        const entryDisk = archive.readUInt16LE(offset + 34)
        const localOffset = archive.readUInt32LE(offset + 42)
        const next = offset + 46 + nameLength + extraLength + entryCommentLength
        if(next > centralEnd || entryDisk != 0 || [compressedSize, uncompressedSize, localOffset].includes(0xffffffff)) fail("Artifact ZIP entry is malformed or ZIP64")
        const name = safeZipName(archive.subarray(offset + 46, offset + 46 + nameLength), flags)
        if(name == fileName || name.endsWith(`/${fileName}`)) matches.push({ flags, compression, expectedCrc, compressedSize, uncompressedSize, localOffset, name })
        offset = next
    }
    if(offset != centralEnd || matches.length != 1) fail(`Artifact ZIP must contain exactly one ${fileName}`)
    const entry = matches[0]
    if(entry.flags & 1) fail("Artifact ZIP entry is encrypted")
    if(entry.uncompressedSize > ARTIFACT_JSON_MAX_BYTES || entry.compressedSize > ARTIFACT_ARCHIVE_MAX_BYTES) fail("Artifact JSON entry is oversized")
    if(entry.localOffset + 30 > archive.length || archive.readUInt32LE(entry.localOffset) != 0x04034b50) fail("Artifact ZIP local header is malformed")
    const localFlags = archive.readUInt16LE(entry.localOffset + 6)
    const localCompression = archive.readUInt16LE(entry.localOffset + 8)
    const localNameLength = archive.readUInt16LE(entry.localOffset + 26)
    const localExtraLength = archive.readUInt16LE(entry.localOffset + 28)
    const dataOffset = entry.localOffset + 30 + localNameLength + localExtraLength
    const dataEnd = dataOffset + entry.compressedSize
    if(localFlags != entry.flags || localCompression != entry.compression || dataEnd > archive.length) fail("Artifact ZIP local entry does not match its central directory")
    const localName = safeZipName(archive.subarray(entry.localOffset + 30, entry.localOffset + 30 + localNameLength), localFlags)
    if(localName != entry.name) fail("Artifact ZIP filename changed between headers")
    const compressed = archive.subarray(dataOffset, dataEnd)
    let decoded
    if(entry.compression == 0) decoded = Buffer.from(compressed)
    else if(entry.compression == 8) decoded = zlib.inflateRawSync(compressed, { maxOutputLength: ARTIFACT_JSON_MAX_BYTES })
    else fail("Artifact JSON uses an unsupported ZIP compression method")
    if(decoded.length != entry.uncompressedSize || crc32(decoded) != entry.expectedCrc) fail("Artifact JSON failed ZIP integrity checks")
    return parseJsonBytes(decoded, fileName)
}

function validateBranchRef(response, branch, label) {
    assertObject(response, label)
    if(response.ref !== `refs/heads/${branch}`) fail(`${label} does not identify refs/heads/${branch}`)
    assertObject(response.object, `${label}.object`)
    if(response.object.type !== "commit") fail(`${label}.object must identify a commit`)
    assertHeadSha(response.object.sha, `${label}.object.sha`)
    return response.object.sha
}

class GitHubApi {
    constructor(repository, token, fetchImplementation = global.fetch) {
        assertRepository(repository, "repository")
        assertString(token, "GitHub token", 4096)
        if(typeof fetchImplementation != "function") fail("fetch is unavailable")
        this.repository = repository
        this.token = token
        this.fetch = fetchImplementation
        this.base = `https://api.github.com/repos/${repository}`
    }

    async request(path, options = {}) {
        let response
        try {
            response = await this.fetch(`${this.base}${path}`, {
                method: options.method || "GET",
                redirect: "follow",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.token}`,
                    "X-GitHub-Api-Version": "2022-11-28",
                    "User-Agent": "btdb-ai-training-status",
                    ...(options.body == null ? {} : { "Content-Type": "application/json" }),
                },
                body: options.body == null ? undefined : JSON.stringify(options.body),
            })
        } catch(error) {
            throw new ApiError(`GitHub API request failed: ${error.message}`, 0)
        }
        if(options.notFoundIsNull && response.status == 404) return null
        if(!response.ok) throw new ApiError(`GitHub API request failed with HTTP ${response.status}`, response.status)
        return readResponseBytes(response, options.maximum || API_JSON_MAX_BYTES)
    }

    async requestJson(path, options = {}) {
        const bytes = await this.request(path, options)
        return bytes === null ? null : parseJsonBytes(bytes, "GitHub API response")
    }

    async getTrainingWorkflow() {
        return this.requestJson("/actions/workflows/ai-training.yml")
    }

    async getTrainingRun(runId) {
        assertInteger(runId, "training run ID", 1)
        return this.requestJson(`/actions/runs/${runId}`)
    }

    async listTrainingRuns(status = null) {
        if(status !== null && status !== "completed") fail("training run list status is unsupported")
        const suffix = status === null ? "" : `&status=${status}`
        const response = await this.requestJson(`/actions/workflows/ai-training.yml/runs?branch=${SOURCE_BRANCH}&event=workflow_dispatch&per_page=100${suffix}`)
        assertObject(response, "training runs API response")
        assertInteger(response.total_count, "training runs API response.total_count")
        if(!Array.isArray(response.workflow_runs) || response.workflow_runs.length > 100) fail("training runs API response is malformed")
        const runs = response.workflow_runs.map((run, index) => {
            const label = `training runs API response.workflow_runs[${index}]`
            assertObject(run, label)
            assertInteger(run.id, `${label}.id`, 1)
            assertInteger(run.run_number, `${label}.run_number`, 1)
            assertInteger(run.run_attempt, `${label}.run_attempt`, 1)
            return { id: run.id, runNumber: run.run_number, runAttempt: run.run_attempt }
        })
        runs.sort((left, right) => right.runNumber - left.runNumber || right.runAttempt - left.runAttempt || right.id - left.id)
        return runs.map(run => run.id)
    }

    async readBranchRef(branch, notFoundIsNull = false) {
        const response = await this.requestJson(`/git/ref/heads/${branch}`, { notFoundIsNull })
        if(response === null) return null
        return { response, sha: validateBranchRef(response, branch, `${branch} branch ref`) }
    }

    async ensureStatusBranch() {
        if(await this.readBranchRef(STATUS_BRANCH, true) !== null) return
        const source = await this.readBranchRef(SOURCE_BRANCH)
        try {
            const created = await this.requestJson("/git/refs", {
                method: "POST",
                body: { ref: `refs/heads/${STATUS_BRANCH}`, sha: source.sha },
            })
            validateBranchRef(created, STATUS_BRANCH, "created status branch ref")
        } catch(error) {
            if(!(error instanceof ApiError) || error.status != 422) throw error
            if(await this.readBranchRef(STATUS_BRANCH, true) === null) throw error
        }
    }

    async readStatus() {
        const response = await this.requestJson(`/contents/${STATUS_PATH}?ref=${STATUS_BRANCH}`, { notFoundIsNull: true, maximum: 128 * 1024 })
        if(response === null) return null
        assertObject(response, "status Contents API response")
        if(response.type !== "file" || response.path !== STATUS_PATH || response.encoding !== "base64") fail("Status Contents API response does not identify the fixed status file")
        assertInteger(response.size, "status Contents API response.size")
        if(response.size > STATUS_MAX_BYTES) fail(`Existing status exceeds the ${STATUS_MAX_BYTES}-byte limit`)
        if(typeof response.sha != "string" || !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(response.sha)) fail("Status Contents API response has an invalid blob SHA")
        if(typeof response.content != "string") fail("Status Contents API response has no base64 content")
        const compact = response.content.replace(/\n/g, "")
        if(compact.length % 4 != 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) fail("Status Contents API response has invalid base64 content")
        const bytes = Buffer.from(compact, "base64")
        if(bytes.length != response.size || bytes.toString("base64") != compact) fail("Status Contents API response base64 length is inconsistent")
        const status = parseJsonBytes(bytes, "existing status")
        validateStatus(status, "existing status")
        return { status, sha: response.sha }
    }

    async writeStatus(status, sha) {
        const encoded = encodeStatus(status)
        if(sha == null) await this.ensureStatusBranch()
        const body = {
            message: `Publish AI training status for run ${status.current.runId} attempt ${status.current.runAttempt}`,
            content: Buffer.from(encoded).toString("base64"),
            branch: STATUS_BRANCH,
        }
        if(sha != null) body.sha = sha
        await this.requestJson(`/contents/${STATUS_PATH}`, { method: "PUT", body, maximum: 512 * 1024 })
    }

    async listJobs(source) {
        const response = await this.requestJson(`/actions/runs/${source.runId}/attempts/${source.runAttempt}/jobs?per_page=100`)
        assertObject(response, "jobs API response")
        assertInteger(response.total_count, "jobs API response.total_count")
        if(!Array.isArray(response.jobs) || response.total_count > response.jobs.length || response.jobs.length > 100) fail("jobs API response is incomplete")
        return response.jobs
    }

    async listArtifacts(source) {
        const response = await this.requestJson(`/actions/runs/${source.runId}/artifacts?per_page=100`)
        assertObject(response, "artifacts API response")
        assertInteger(response.total_count, "artifacts API response.total_count")
        if(!Array.isArray(response.artifacts) || response.total_count > response.artifacts.length || response.artifacts.length > 100) fail("artifacts API response is incomplete")
        return response.artifacts.map((artifact, index) => {
            const label = `artifacts API response.artifacts[${index}]`
            assertObject(artifact, label)
            assertInteger(artifact.id, `${label}.id`, 1)
            assertString(artifact.name, `${label}.name`, 256)
            assertBoolean(artifact.expired, `${label}.expired`)
            assertInteger(artifact.size_in_bytes, `${label}.size_in_bytes`)
            const createdAt = normalizeTimestamp(artifact.created_at, `${label}.created_at`)
            let runId = source.runId
            let headSha = source.headSha
            if(artifact.workflow_run != null) {
                assertObject(artifact.workflow_run, `${label}.workflow_run`)
                assertInteger(artifact.workflow_run.id, `${label}.workflow_run.id`, 1)
                assertHeadSha(artifact.workflow_run.head_sha, `${label}.workflow_run.head_sha`)
                runId = artifact.workflow_run.id
                headSha = artifact.workflow_run.head_sha
            }
            return { id: artifact.id, name: artifact.name, expired: artifact.expired, sizeInBytes: artifact.size_in_bytes, createdAt, runId, headSha }
        })
    }

    async readArtifactJson(artifact, fileName) {
        const archive = await this.request(`/actions/artifacts/${artifact.id}/zip`, { maximum: ARTIFACT_ARCHIVE_MAX_BYTES })
        return artifactJsonFromZip(archive, fileName)
    }
}

async function publishSourceStatus({ source, api, now = () => new Date(), logger = console }) {
    let jobs
    let evidence
    for(let attempt = 0; attempt < 3; attempt++) {
        const record = await api.readStatus()
        const previous = record === null ? null : validateStatus(record.status, "existing status")
        const historicalEvidence = previous !== null && acceptsHistoricalEvidence(previous.current, source)
        if(previous !== null && isStaleSource(previous.current, source) && !historicalEvidence) return { changed: false, reason: "stale", status: previous }
        if(jobs === undefined) jobs = historicalEvidence ? null : await loadJobs(api, source, logger)
        if(evidence === undefined) evidence = await loadEvidence(api, source, logger)
        const publishedAt = normalizeTimestamp(now().toISOString(), "publication time")
        const merged = mergeStatus(previous, source, jobs, evidence, publishedAt)
        if(!merged.changed) return { changed: false, reason: "unchanged", status: merged.status }
        try {
            await api.writeStatus(merged.status, record && record.sha)
            return { changed: true, reason: "published", status: merged.status }
        } catch(error) {
            if(!(error instanceof ApiError) || error.status != 409 || attempt == 2) throw error
        }
    }
    fail("Unable to publish training status")
}

async function publishTrainingStatus({ payload, expectedRepository, api, now = () => new Date(), logger = console }) {
    const source = validateSourceEvent(payload, expectedRepository)
    return publishSourceStatus({ source, api, now, logger })
}

function parseTrainingRunId(value) {
    if(value == null || value === "") return null
    if(typeof value != "string" || !/^[1-9][0-9]*$/.test(value)) fail("training_run_id must be a positive decimal integer")
    const runId = Number(value)
    assertInteger(runId, "training_run_id", 1)
    return runId
}

async function reconcileTrainingStatus({
    payload,
    eventName,
    trainingRunId = "",
    trustedRef,
    expectedRepository,
    api,
    now = () => new Date(),
    logger = console,
}) {
    const repositoryId = validateEventRepository(payload, expectedRepository)
    const requestedRunId = parseTrainingRunId(trainingRunId)
    let runIds
    if(eventName == "workflow_run") {
        if(requestedRunId !== null) fail("workflow_run reconciliation cannot override the source run ID")
        runIds = [validateSourceEvent(payload, expectedRepository).runId]
    } else if(eventName == "workflow_dispatch" || eventName == "schedule") {
        if(trustedRef !== `refs/heads/${SOURCE_BRANCH}`) fail(`reconciliation must run from refs/heads/${SOURCE_BRANCH}`)
        if(requestedRunId !== null) {
            runIds = [requestedRunId]
        } else {
            const completed = await api.listTrainingRuns("completed")
            const overall = await api.listTrainingRuns()
            runIds = [completed[0], overall[0]].filter(runId => runId !== undefined)
        }
    } else {
        fail("workflow event cannot publish training status")
    }
    runIds = [...new Set(runIds)]
    if(runIds.length == 0) return { changed: false, reason: "no-runs", status: null, results: [] }
    const workflow = await api.getTrainingWorkflow()
    const results = []
    for(const runId of runIds) {
        const run = await api.getTrainingRun(runId)
        const source = validateSourceRun(run, workflow, expectedRepository, repositoryId)
        results.push(await publishSourceStatus({ source, api, now, logger }))
    }
    const changed = results.some(result => result.changed)
    const last = results.at(-1)
    return { changed, reason: changed ? "published" : last.reason, status: last.status, results }
}

function readEvent(filePath) {
    const stat = fs.statSync(filePath)
    if(!stat.isFile() || stat.size > EVENT_MAX_BYTES) fail(`Workflow event must be a regular file no larger than ${EVENT_MAX_BYTES} bytes`)
    return parseJsonBytes(fs.readFileSync(filePath), "workflow event")
}

async function main() {
    const eventPath = process.env.GITHUB_EVENT_PATH
    const repository = process.env.GITHUB_REPOSITORY
    const token = process.env.GH_TOKEN
    const eventName = process.env.GITHUB_EVENT_NAME
    const trustedRef = process.env.GITHUB_REF
    assertString(eventPath, "GITHUB_EVENT_PATH", 4096)
    assertString(eventName, "GITHUB_EVENT_NAME", 64)
    assertString(trustedRef, "GITHUB_REF", 256)
    const payload = readEvent(eventPath)
    const api = new GitHubApi(repository, token)
    const result = await reconcileTrainingStatus({
        payload,
        eventName,
        trainingRunId: process.env.TRAINING_RUN_ID || "",
        trustedRef,
        expectedRepository: repository,
        api,
    })
    console.log(result.changed ? `Published ${STATUS_PATH} on ${STATUS_BRANCH}.` : `Status publication skipped (${result.reason}).`)
}

if(require.main === module) main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})

module.exports = {
    ARTIFACT_ARCHIVE_MAX_BYTES,
    ARTIFACT_JSON_MAX_BYTES,
    ApiError,
    GitHubApi,
    SOURCE_BRANCH,
    SOURCE_WORKFLOW_NAME,
    SOURCE_WORKFLOW_PATH,
    STATUS_BRANCH,
    STATUS_FORMAT_VERSION,
    STATUS_KIND,
    STATUS_MAX_BYTES,
    STATUS_PATH,
    artifactJsonFromZip,
    encodeStatus,
    isStaleSource,
    loadEvidence,
    mergeStatus,
    projectEvaluation,
    projectJobs,
    projectPromotion,
    publishSourceStatus,
    publishTrainingStatus,
    reconcileTrainingStatus,
    sourceStateForStatus,
    validateSourceEvent,
    validateSourceRun,
    validateStatus,
}
