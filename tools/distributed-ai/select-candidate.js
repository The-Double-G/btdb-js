#!/usr/bin/env node
"use strict"

const path = require("node:path")
const {
    TRAIN_RESULT_KIND,
    fail,
    jsonFilesRecursively,
    makeSelectionReport,
    materializePolicyOnlyCandidate,
    parseArgs,
    readJson,
    requiredArg,
    selectBestTrainResult,
    validateCheckpoint,
    validateTrainResult,
    writeJson,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/select-candidate.js --results-dir DIR --baseline checkpoint.json --output candidate.json [--report selection.json]"

function defaultReportPath(output) {
    const parsed = path.parse(output)
    return path.join(parsed.dir, `${parsed.name}.selection.json`)
}

function main() {
    const args = parseArgs(process.argv.slice(2), ["results-dir", "baseline", "output", "report"])
    if(args.help) {
        console.log(usage)
        return
    }
    const resultsDirectory = requiredArg(args, "results-dir")
    const baseline = validateCheckpoint(readJson(requiredArg(args, "baseline")), "baseline")
    const output = requiredArg(args, "output")
    const files = jsonFilesRecursively(resultsDirectory)
    const results = []
    for(const file of files) {
        const document = readJson(file)
        if(document && document.kind == TRAIN_RESULT_KIND) results.push(validateTrainResult(document, file))
    }
    if(results.length == 0) fail(`No train shard result JSON files found under ${path.resolve(resultsDirectory)}`)
    const selected = selectBestTrainResult(results, baseline)
    const candidate = materializePolicyOnlyCandidate(selected, baseline)
    const report = makeSelectionReport(results, selected, candidate)
    const candidatePath = writeJson(output, candidate)
    const reportPath = writeJson(args.report || defaultReportPath(output), report)
    console.log(`Selected policy bundle from ${selected.candidate.checkpointId} and materialized ${candidate.checkpointId} from ${results.length} shard(s): ${candidatePath}`)
    console.log(`Selection report: ${reportPath}`)
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
