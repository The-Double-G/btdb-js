"use strict"

const assert = require("node:assert/strict")
const {
    FORMAT_VERSION,
    HOSTED_PROMOTION_RECEIPT_KIND,
    digest,
    validateEvaluationAggregate,
    validateHostedPromotionReceipt,
} = require("./distributed-ai/common")
const {
    STATUS_MAX_BYTES,
    artifactJsonFromZip,
    encodeStatus,
    projectJobs,
    publishTrainingStatus,
    validateSourceEvent,
    validateStatus,
} = require("./distributed-ai/training-status")

const REPOSITORY = "example/btdb-js"
const REPOSITORY_ID = 9876
const logger = { warnings: [], warn(message) { this.warnings.push(message) } }

function objectId(value) {
    return `sha256:${value.toString(16).padStart(64, "0")}`
}

function headSha(value) {
    return value.toString(16).padStart(40, "0")
}

function workflowEvent({ action, runId, runNumber, runAttempt = 1, conclusion = null, minute = 0 }) {
    const status = action == "requested" ? "queued" : action
    const timestamp = `2026-08-29T00:${String(minute).padStart(2, "0")}:00Z`
    return {
        action,
        repository: { id: REPOSITORY_ID, full_name: REPOSITORY, default_branch: "main" },
        workflow_run: {
            id: runId,
            run_number: runNumber,
            run_attempt: runAttempt,
            workflow_id: 55,
            name: "Distributed AI Training",
            path: ".github/workflows/ai-training.yml",
            event: "workflow_dispatch",
            head_branch: "main",
            head_sha: headSha(runNumber),
            head_repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
            repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
            status,
            conclusion: action == "completed" ? conclusion || "success" : null,
            created_at: "2026-08-29T00:00:00Z",
            run_started_at: "2026-08-29T00:01:00Z",
            updated_at: timestamp,
        },
    }
}

function evaluation(runNumber) {
    const bucket = games => ({ games, wins: games, losses: 0, ties: 0, score: 1 })
    const aggregate = {
        kind: "btdb-ai-evaluation-aggregate",
        formatVersion: FORMAT_VERSION,
        aggregateId: "",
        candidateCheckpointId: objectId(runNumber * 10 + 1),
        candidateModelDigest: objectId(runNumber * 10 + 2),
        baselineCheckpointId: objectId(runNumber * 10 + 3),
        baselineModelDigest: objectId(runNumber * 10 + 4),
        gameVersion: "v-test",
        modelSchemaVersion: 9,
        thresholds: {
            minimumScore: 0.58,
            minimumGames: 8,
            minimumBucketScore: 0.48,
            minimumSurvivalRate: 0.5,
            maximumSevereCollapseRate: 0.27,
        },
        passed: true,
        overall: bucket(8),
        byMap: { "0": bucket(4), "1": bucket(4) },
        bySide: { left: bucket(4), right: bucket(4) },
        byRole: { responder: bucket(4), probe: bucket(4) },
        coverage: {
            minimumGamesPerMap: 4,
            minimumGamesPerSide: 4,
            minimumGamesPerRole: 4,
            mapsCovered: true,
            sidesCovered: true,
            rolesCovered: true,
            balanced: true,
        },
        safety: {
            games: 8,
            survivals: 8,
            severeCollapses: 0,
            survivalRate: 1,
            severeCollapseRate: 0,
            averageCandidateLives: 150,
            averageOpponentLives: 0,
        },
        sourceResultIds: [objectId(runNumber * 10 + 5)],
    }
    aggregate.aggregateId = digest(Object.fromEntries(Object.entries(aggregate).filter(([key]) => key != "aggregateId")))
    return aggregate
}

function receipt(aggregate, value = 1) {
    return {
        kind: HOSTED_PROMOTION_RECEIPT_KIND,
        formatVersion: FORMAT_VERSION,
        snapshotId: objectId(value * 100 + 1),
        promotionId: aggregate.candidateCheckpointId,
        duplicate: false,
        revision: value,
        modelDigest: objectId(value * 100 + 2),
        contributionEpoch: 1,
        championGeneration: value,
        promotedPolicyDigest: objectId(value * 100 + 3),
        candidatePolicyPreserved: true,
    }
}

function job(source, name, status, conclusion = null) {
    return { name, status, conclusion, run_id: source.runId, run_attempt: source.runAttempt }
}

function artifact(id, name, source) {
    return {
        id,
        name,
        expired: false,
        sizeInBytes: 4096,
        createdAt: "2026-08-29T00:20:00.000Z",
        runId: source.runId,
        headSha: source.headSha,
    }
}

class FakeApi {
    constructor() {
        this.status = null
        this.sha = 0
        this.jobs = []
        this.artifacts = []
        this.files = new Map()
        this.writes = 0
        this.artifactReads = 0
    }

    async readStatus() {
        return this.status === null ? null : { status: structuredClone(this.status), sha: `sha-${this.sha}` }
    }

    async writeStatus(status) {
        this.status = structuredClone(status)
        this.sha++
        this.writes++
    }

    async listJobs() {
        return structuredClone(this.jobs)
    }

    async listArtifacts() {
        return structuredClone(this.artifacts)
    }

    async readArtifactJson(item, fileName) {
        this.artifactReads++
        const value = this.files.get(`${item.id}:${fileName}`)
        if(value === undefined) throw new Error("missing artifact member")
        return structuredClone(value)
    }

    setEvidence(source, aggregate, promotion) {
        this.artifacts = [artifact(source.runId * 10, "ai-training-bundle", source)]
        this.files.set(`${source.runId * 10}:evaluation.json`, aggregate)
        if(promotion !== undefined) {
            this.artifacts.push(artifact(source.runId * 10 + 1, "ai-hosted-promotion-receipt", source))
            this.files.set(`${source.runId * 10 + 1}:hosted-promotion-receipt.json`, promotion)
        }
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

function storedZip(fileName, value) {
    const name = Buffer.from(fileName)
    const data = Buffer.from(JSON.stringify(value))
    const crc = crc32(data)
    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    name.copy(local, 30)
    const central = Buffer.alloc(46 + name.length)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    name.copy(central, 46)
    const eocd = Buffer.alloc(22)
    eocd.writeUInt32LE(0x06054b50, 0)
    eocd.writeUInt16LE(1, 8)
    eocd.writeUInt16LE(1, 10)
    eocd.writeUInt32LE(central.length, 12)
    eocd.writeUInt32LE(local.length + data.length, 16)
    return Buffer.concat([local, data, central, eocd])
}

function sourceFor(payload) {
    return validateSourceEvent(payload, REPOSITORY)
}

async function publish(api, payload, instant) {
    return publishTrainingStatus({ payload, expectedRepository: REPOSITORY, api, now: () => new Date(instant), logger })
}

async function main() {
    const api = new FakeApi()
    const requested = workflowEvent({ action: "requested", runId: 100, runNumber: 10, minute: 2 })
    let result = await publish(api, requested, "2026-08-29T01:00:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.current.state, "requested")
    assert.equal(api.status.current.phase, "queued")
    assert.deepEqual(api.status.current.projection.jobs, { total: 0, queued: 0, inProgress: 0, completed: 0, succeeded: 0, failed: 0, cancelled: 0, skipped: 0 })
    assert.equal(api.status.latestEvaluation, null)
    assert.ok(Buffer.byteLength(encodeStatus(api.status)) <= STATUS_MAX_BYTES)

    const inProgress = workflowEvent({ action: "in_progress", runId: 100, runNumber: 10, minute: 3 })
    const inProgressSource = sourceFor(inProgress)
    api.jobs = [
        job(inProgressSource, "prepare", "completed", "success"),
        job(inProgressSource, "train (0)", "completed", "success"),
        job(inProgressSource, "train (1)", "in_progress"),
    ]
    result = await publish(api, inProgress, "2026-08-29T01:01:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.current.phase, "training")
    assert.deepEqual(api.status.current.projection.workers.training, { total: 2, queued: 0, inProgress: 1, succeeded: 1, failed: 0, cancelled: 0, skipped: 0 })

    const completed = workflowEvent({ action: "completed", runId: 100, runNumber: 10, minute: 30 })
    const completedSource = sourceFor(completed)
    const aggregate10 = evaluation(10)
    validateEvaluationAggregate(aggregate10)
    const receipt10 = receipt(aggregate10, 10)
    api.jobs = [job(completedSource, "prepare", "completed", "success"), job(completedSource, "train (0)", "completed", "success"), job(completedSource, "evaluate (0)", "completed", "success"), job(completedSource, "report", "completed", "success")]
    api.setEvidence(completedSource, aggregate10, receipt10)
    result = await publish(api, completed, "2026-08-29T01:02:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.current.phase, "completed")
    assert.equal(api.status.latestEvaluation.runNumber, 10)
    assert.equal(api.status.latestEvaluation.aggregateId, aggregate10.aggregateId)
    assert.equal(api.status.latestEvaluation.worstBucketScore, 1)
    assert.equal(api.status.latestEvaluation.survivalRate, 1)
    assert.equal(api.status.latestEvaluation.severeCollapseRate, 0)
    assert.equal(api.status.latestPromotion.promotionId, aggregate10.candidateCheckpointId)
    validateStatus(api.status)

    const newer = workflowEvent({ action: "in_progress", runId: 101, runNumber: 11, minute: 31 })
    api.jobs = []
    api.artifacts = []
    result = await publish(api, newer, "2026-08-29T01:03:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.current.runNumber, 11)
    assert.equal(api.status.latestEvaluation.runNumber, 10)
    assert.equal(api.status.latestPromotion.runNumber, 10)

    const missing = workflowEvent({ action: "completed", runId: 101, runNumber: 11, minute: 32, conclusion: "failure" })
    result = await publish(api, missing, "2026-08-29T01:04:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.latestEvaluation.runNumber, 10)
    assert.equal(api.status.latestPromotion.runNumber, 10)

    const malformedEvent = workflowEvent({ action: "completed", runId: 102, runNumber: 12, minute: 33 })
    const malformedSource = sourceFor(malformedEvent)
    const malformedEvaluation = { ...evaluation(12), unexpected: true }
    api.setEvidence(malformedSource, malformedEvaluation)
    result = await publish(api, malformedEvent, "2026-08-29T01:05:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.latestEvaluation.runNumber, 10)
    assert.match(logger.warnings.at(-1), /evaluation artifact ignored/)

    const badReceiptEvent = workflowEvent({ action: "completed", runId: 103, runNumber: 13, minute: 34 })
    const badReceiptSource = sourceFor(badReceiptEvent)
    const aggregate13 = evaluation(13)
    api.setEvidence(badReceiptSource, aggregate13, { ...receipt(aggregate13, 13), unexpected: true })
    result = await publish(api, badReceiptEvent, "2026-08-29T01:06:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.latestEvaluation.runNumber, 13)
    assert.equal(api.status.latestPromotion.runNumber, 10)
    assert.match(logger.warnings.at(-1), /promotion receipt ignored/)

    const mismatchEvent = workflowEvent({ action: "completed", runId: 104, runNumber: 14, minute: 35 })
    const mismatchSource = sourceFor(mismatchEvent)
    const aggregate14 = evaluation(14)
    const mismatchedReceipt = receipt(aggregate14, 14)
    mismatchedReceipt.promotionId = objectId(999)
    api.setEvidence(mismatchSource, aggregate14, mismatchedReceipt)
    result = await publish(api, mismatchEvent, "2026-08-29T01:07:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.latestEvaluation.runNumber, 14)
    assert.equal(api.status.latestPromotion.runNumber, 10)

    const validReceiptEvent = workflowEvent({ action: "completed", runId: 105, runNumber: 15, minute: 36 })
    const validReceiptSource = sourceFor(validReceiptEvent)
    const aggregate15 = evaluation(15)
    const receipt15 = receipt(aggregate15, 15)
    api.setEvidence(validReceiptSource, aggregate15, receipt15)
    result = await publish(api, validReceiptEvent, "2026-08-29T01:08:00Z")
    assert.equal(api.status.latestEvaluation.runNumber, 15)
    assert.equal(api.status.latestPromotion.runNumber, 15)
    validateHostedPromotionReceipt(receipt15)
    assert.throws(() => validateHostedPromotionReceipt({ ...receipt15, extra: true }), /keys must be exactly/)

    const writesBeforeStale = api.writes
    const readsBeforeStale = api.artifactReads
    result = await publish(api, workflowEvent({ action: "requested", runId: 104, runNumber: 14, minute: 37 }), "2026-08-29T01:09:00Z")
    assert.deepEqual({ changed: result.changed, reason: result.reason }, { changed: false, reason: "stale" })
    assert.equal(api.writes, writesBeforeStale)
    assert.equal(api.artifactReads, readsBeforeStale)

    const attemptTwo = workflowEvent({ action: "in_progress", runId: 106, runNumber: 16, runAttempt: 2, minute: 38 })
    api.jobs = []
    api.artifacts = []
    await publish(api, attemptTwo, "2026-08-29T01:10:00Z")
    const staleAttempt = workflowEvent({ action: "completed", runId: 106, runNumber: 16, runAttempt: 1, minute: 39 })
    const staleAttemptSource = sourceFor(staleAttempt)
    const staleAggregate = evaluation(16)
    api.setEvidence(staleAttemptSource, staleAggregate, receipt(staleAggregate, 16))
    const readsBeforeAttempt = api.artifactReads
    result = await publish(api, staleAttempt, "2026-08-29T01:11:00Z")
    assert.equal(result.reason, "stale")
    assert.equal(api.status.current.runAttempt, 2)
    assert.equal(api.artifactReads, readsBeforeAttempt)
    result = await publish(api, workflowEvent({ action: "requested", runId: 106, runNumber: 16, runAttempt: 2, minute: 40 }), "2026-08-29T01:12:00Z")
    assert.equal(result.reason, "stale")

    const generation18 = workflowEvent({ action: "in_progress", runId: 108, runNumber: 18, minute: 41 })
    api.jobs = []
    api.artifacts = []
    await publish(api, generation18, "2026-08-29T01:13:00Z")
    const delayed17 = workflowEvent({ action: "completed", runId: 107, runNumber: 17, minute: 42 })
    const delayed17Source = sourceFor(delayed17)
    const aggregate17 = evaluation(17)
    api.setEvidence(delayed17Source, aggregate17, receipt(aggregate17, 17))
    result = await publish(api, delayed17, "2026-08-29T01:14:00Z")
    assert.equal(result.changed, true)
    assert.equal(api.status.current.runNumber, 18)
    assert.equal(api.status.current.state, "in_progress")
    assert.equal(api.status.latestEvaluation.runNumber, 17)
    assert.equal(api.status.latestPromotion.runNumber, 17)

    const wrongPath = workflowEvent({ action: "requested", runId: 200, runNumber: 20 })
    wrongPath.workflow_run.path = ".github/workflows/not-training.yml"
    assert.throws(() => validateSourceEvent(wrongPath, REPOSITORY), /trusted training workflow/)
    const wrongBranch = workflowEvent({ action: "requested", runId: 200, runNumber: 20 })
    wrongBranch.workflow_run.head_branch = "feature"
    assert.throws(() => validateSourceEvent(wrongBranch, REPOSITORY), /head_branch/)
    const wrongRepository = workflowEvent({ action: "requested", runId: 200, runNumber: 20 })
    wrongRepository.workflow_run.head_repository.id++
    assert.throws(() => validateSourceEvent(wrongRepository, REPOSITORY), /did not originate/)
    const wrongLifecycle = workflowEvent({ action: "in_progress", runId: 200, runNumber: 20 })
    wrongLifecycle.workflow_run.status = "completed"
    assert.throws(() => validateSourceEvent(wrongLifecycle, REPOSITORY), /lifecycle action/)

    const extraStatus = { ...api.status, unexpected: true }
    assert.throws(() => validateStatus(extraStatus), /keys must be exactly/)
    const malformedApi = new FakeApi()
    malformedApi.status = extraStatus
    await assert.rejects(publish(malformedApi, workflowEvent({ action: "requested", runId: 300, runNumber: 30 }), "2026-08-29T01:15:00Z"), /keys must be exactly/)

    const projectedSource = sourceFor(workflowEvent({ action: "in_progress", runId: 400, runNumber: 40 }))
    const unavailableProjection = projectJobs(null, projectedSource)
    assert.deepEqual(unavailableProjection, { phase: "running", projection: null })

    const zippedReceipt = storedZip("nested/hosted-promotion-receipt.json", receipt15)
    assert.deepEqual(artifactJsonFromZip(zippedReceipt, "hosted-promotion-receipt.json"), receipt15)
    const corrupted = Buffer.from(zippedReceipt)
    corrupted[35] ^= 1
    assert.throws(() => artifactJsonFromZip(corrupted, "hosted-promotion-receipt.json"), /integrity|JSON|filename changed/)

    console.log("Training status unit tests passed: lifecycle, stale attempts, strict schemas, missing artifacts, job projection, and promotion receipts are safe.")
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
