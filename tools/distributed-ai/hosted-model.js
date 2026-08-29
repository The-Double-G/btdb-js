#!/usr/bin/env node
"use strict"

const {
    buildPolicyPromotionRequest,
    createHostedPromotionReceipt,
    createHostedSnapshot,
    digest,
    fail,
    MAX_JSON_BYTES,
    numberArg,
    integerArg,
    parseArgs,
    readJson,
    requiredArg,
    validateHostedPromotionResponse,
    validateHostedEnvelope,
    validateHostedSnapshotManifest,
    validatePromotionBundle,
    writeJson,
} = require("./common")

const usage = [
    "Fetch: node tools/distributed-ai/hosted-model.js --mode fetch --endpoint https://example/ai-learning.php?protocol=1 --output baseline.json --manifest hosted-source.json",
    "Publish: node tools/distributed-ai/hosted-model.js --mode publish --endpoint https://example/ai-learning.php?protocol=1 --baseline baseline.json --manifest hosted-source.json --candidate candidate.json --evaluation evaluation.json --receipt receipt.json [--minimum-score 0.58] [--minimum-games 64]",
    "Reconcile: node tools/distributed-ai/hosted-model.js --mode reconcile --endpoint https://example/ai-learning.php?protocol=1 --baseline baseline.json --manifest hosted-source.json --candidate candidate.json --evaluation evaluation.json --receipt receipt.json [--minimum-score 0.58] [--minimum-games 64]",
].join("\n")

const HOSTED_RESPONSE_MAX_BYTES = 8 * 1024 * 1024

function validateEndpointUrl(value) {
    let url
    try {
        url = new URL(value)
    } catch {
        fail("--endpoint must be an absolute HTTPS URL")
    }
    if(url.protocol != "https:" || url.username || url.password || url.hash) fail("--endpoint must be an HTTPS URL without credentials or a fragment")
    if(url.searchParams.size != 1 || url.searchParams.get("protocol") != "1") fail("--endpoint must contain only the protocol=1 query parameter")
    return url.toString()
}

async function readResponseBody(response, maximumBytes = HOSTED_RESPONSE_MAX_BYTES) {
    const contentLength = Number(response.headers.get("content-length"))
    if(Number.isFinite(contentLength) && contentLength > maximumBytes) fail(`Hosted endpoint response exceeds ${maximumBytes} bytes`)
    if(!response.body) return ""
    const reader = response.body.getReader()
    const chunks = []
    let size = 0
    try {
        while(true) {
            const { done, value } = await reader.read()
            if(done) break
            size += value.byteLength
            if(size > maximumBytes) fail(`Hosted endpoint response exceeds ${maximumBytes} bytes`)
            chunks.push(Buffer.from(value))
        }
    } catch(error) {
        await reader.cancel().catch(() => {})
        throw error
    }
    return Buffer.concat(chunks, size).toString("utf8")
}

async function requestJson(url, options = {}) {
    if(typeof options.body == "string" && Buffer.byteLength(options.body) > MAX_JSON_BYTES) fail(`Hosted endpoint request exceeds ${MAX_JSON_BYTES} bytes`)
    const response = await fetch(url, {
        ...options,
        redirect: "error",
        signal: AbortSignal.timeout(20000),
        headers: { Accept: "application/json", ...(options.headers || {}) },
    })
    const body = await readResponseBody(response)
    let parsed
    try {
        parsed = JSON.parse(body)
    } catch {
        fail(`Hosted endpoint returned invalid JSON with HTTP ${response.status}`)
    }
    if(!response.ok) {
        const code = parsed && parsed.error && typeof parsed.error.code == "string" ? parsed.error.code : "unknown_error"
        fail(`Hosted endpoint rejected the request with HTTP ${response.status}: ${code}`)
    }
    return parsed
}

async function requestJsonWithRetry(url, options = {}, attempts = 3) {
    let lastError
    for(let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await requestJson(url, options)
        } catch(error) {
            lastError = error
            if(attempt < attempts) {
                console.warn(`Hosted endpoint read attempt ${attempt} failed; retrying a safe read.`)
                await new Promise(resolve => setTimeout(resolve, attempt * 500))
            }
        }
    }
    throw lastError
}

async function fetchHostedSnapshot(endpoint) {
    const envelope = await requestJsonWithRetry(validateEndpointUrl(endpoint), { cache: "no-store" })
    return createHostedSnapshot(envelope)
}

async function publishHostedPromotion({ endpoint, key, manifest, baseline, candidate, evaluation, minimumScore, minimumGames }) {
    if(typeof key != "string" || key.length < 16) fail("AI_POLICY_PROMOTION_KEY must contain at least 16 characters")
    validateHostedSnapshotManifest(manifest, baseline)
    validatePromotionBundle(candidate, evaluation, baseline, minimumScore, minimumGames)
    const request = buildPolicyPromotionRequest(manifest, candidate, baseline)
    const response = await requestJson(`${validateEndpointUrl(endpoint)}&action=promote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-AI-Policy-Promotion-Key": key,
        },
        body: JSON.stringify(request),
    })
    validateHostedPromotionResponse(response, request)
    return { request, response, receipt: createHostedPromotionReceipt(manifest, response) }
}

function createHostedReconciliation({ envelope, manifest, baseline, candidate, evaluation, minimumScore, minimumGames }) {
    validateHostedSnapshotManifest(manifest, baseline)
    validatePromotionBundle(candidate, evaluation, baseline, minimumScore, minimumGames)
    validateHostedEnvelope(envelope)
    if(envelope.contributionEpoch != manifest.contributionEpoch) fail("Hosted contribution epoch changed; this promotion cannot be reconciled")
    if(envelope.model.championGeneration != candidate.model.championGeneration || digest(envelope.model.championPolicy) != digest(candidate.model.championPolicy)) {
        fail("Hosted champion does not match the evaluated candidate; refusing audit-only reconciliation")
    }
    const request = buildPolicyPromotionRequest(manifest, candidate, baseline)
    const response = validateHostedPromotionResponse({
        ok: true,
        protocolVersion: 1,
        promotionId: candidate.checkpointId,
        duplicate: true,
        revision: envelope.revision,
        modelDigest: envelope.modelDigest,
        contributionEpoch: envelope.contributionEpoch,
        championGeneration: envelope.model.championGeneration,
        promotedPolicyDigest: envelope.championPolicyDigest,
        candidatePolicyPreserved: digest(envelope.model.policy) != digest(envelope.model.championPolicy),
    }, request)
    return { response, receipt: createHostedPromotionReceipt(manifest, response) }
}

async function reconcileHostedPromotion(options) {
    const envelope = await requestJsonWithRetry(validateEndpointUrl(options.endpoint), { cache: "no-store" })
    return createHostedReconciliation({ ...options, envelope })
}

async function main() {
    const args = parseArgs(process.argv.slice(2), ["mode", "endpoint", "output", "manifest", "baseline", "candidate", "evaluation", "receipt", "minimum-score", "minimum-games"])
    if(args.help) {
        console.log(usage)
        return
    }
    const mode = requiredArg(args, "mode")
    const endpoint = requiredArg(args, "endpoint")
    if(mode == "fetch") {
        const snapshot = await fetchHostedSnapshot(endpoint)
        writeJson(requiredArg(args, "output"), snapshot.checkpoint)
        writeJson(requiredArg(args, "manifest"), snapshot.manifest)
        console.log(`Fetched hosted revision ${snapshot.manifest.revision} as ${snapshot.checkpoint.checkpointId}.`)
        return
    }
    if(mode == "publish" || mode == "reconcile") {
        const baseline = readJson(requiredArg(args, "baseline"))
        const manifest = readJson(requiredArg(args, "manifest"))
        const candidate = readJson(requiredArg(args, "candidate"))
        const evaluation = readJson(requiredArg(args, "evaluation"))
        const minimumScore = numberArg(args, "minimum-score", 0.58)
        const minimumGames = args["minimum-games"] == null ? 64 : integerArg(args, "minimum-games", { minimum: 1 })
        const options = { endpoint, manifest, baseline, candidate, evaluation, minimumScore, minimumGames }
        const result = mode == "publish"
            ? await publishHostedPromotion({ ...options, key: process.env.AI_POLICY_PROMOTION_KEY })
            : await reconcileHostedPromotion(options)
        writeJson(requiredArg(args, "receipt"), result.receipt)
        console.log(`${mode == "publish" ? "Published" : "Reconciled"} hosted champion generation ${result.response.championGeneration} at revision ${result.response.revision}.`)
        return
    }
    fail("--mode must be fetch, publish, or reconcile")
}

if(require.main === module) main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})

module.exports = {
    HOSTED_RESPONSE_MAX_BYTES,
    createHostedReconciliation,
    fetchHostedSnapshot,
    publishHostedPromotion,
    readResponseBody,
    reconcileHostedPromotion,
    requestJson,
    validateEndpointUrl,
}
