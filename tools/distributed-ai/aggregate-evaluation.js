#!/usr/bin/env node
"use strict"

const path = require("node:path")
const {
    EVALUATION_RESULT_KIND,
    aggregateEvaluationResults,
    defaultMarkdownPath,
    evaluationMarkdown,
    fail,
    integerArg,
    jsonFilesRecursively,
    numberArg,
    parseArgs,
    readJson,
    requiredArg,
    validateEvaluationResult,
    writeJson,
    writeText,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/aggregate-evaluation.js --results-dir DIR --output aggregate.json [--report report.md] [--minimum-score 0.56] [--minimum-games 32]"

function main() {
    const args = parseArgs(process.argv.slice(2), ["results-dir", "output", "report", "minimum-score", "minimum-games"])
    if(args.help) {
        console.log(usage)
        return
    }
    const resultsDirectory = requiredArg(args, "results-dir")
    const output = requiredArg(args, "output")
    const minimumScore = numberArg(args, "minimum-score", 0.56)
    if(minimumScore < 0 || minimumScore > 1) fail("--minimum-score must be between 0 and 1")
    const minimumGames = args["minimum-games"] == null ? 32 : integerArg(args, "minimum-games", { minimum: 1 })
    const results = []
    for(const file of jsonFilesRecursively(resultsDirectory)) {
        const document = readJson(file)
        if(document && document.kind == EVALUATION_RESULT_KIND) results.push(validateEvaluationResult(document, file))
    }
    if(results.length == 0) fail(`No evaluation result JSON files found under ${path.resolve(resultsDirectory)}`)
    const aggregate = aggregateEvaluationResults(results, minimumScore, minimumGames)
    const jsonPath = writeJson(output, aggregate)
    const reportPath = writeText(args.report || defaultMarkdownPath(output), evaluationMarkdown(aggregate))
    console.log(`Evaluation ${aggregate.passed ? "passed" : "failed"}: ${aggregate.overall.games} games, score ${aggregate.overall.score.toFixed(4)}`)
    console.log(`JSON: ${jsonPath}`)
    console.log(`Markdown: ${reportPath}`)
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
