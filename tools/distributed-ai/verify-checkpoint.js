#!/usr/bin/env node
"use strict"

const fs = require("node:fs")
const path = require("node:path")
const {
    CHECKPOINT_KIND,
    EVALUATION_AGGREGATE_KIND,
    EVALUATION_RESULT_KIND,
    TRAIN_RESULT_KIND,
    fail,
    jsonFilesRecursively,
    parseArgs,
    readJson,
    requiredArg,
    validateCheckpoint,
    validateEvaluationAggregate,
    validateEvaluationResult,
    validateTrainResult,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/verify-checkpoint.js --input FILE_OR_DIRECTORY"

function validateDocument(document, label) {
    if(document && document.kind == CHECKPOINT_KIND) return validateCheckpoint(document, label)
    if(document && document.kind == TRAIN_RESULT_KIND) return validateTrainResult(document, label)
    if(document && document.kind == EVALUATION_RESULT_KIND) return validateEvaluationResult(document, label)
    if(document && document.kind == EVALUATION_AGGREGATE_KIND) return validateEvaluationAggregate(document, label)
    fail(`${label} is not a checkpoint, train result, evaluation result, or evaluation aggregate`)
}

function main() {
    const args = parseArgs(process.argv.slice(2), ["input"])
    if(args.help) {
        console.log(usage)
        return
    }
    const input = path.resolve(requiredArg(args, "input"))
    if(!fs.existsSync(input)) fail(`Input does not exist: ${input}`)
    const files = fs.statSync(input).isDirectory() ? jsonFilesRecursively(input) : [input]
    if(files.length == 0) fail(`No JSON files found under ${input}`)
    for(const file of files) validateDocument(readJson(file), file)
    console.log(`Verified ${files.length} distributed AI document(s).`)
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
