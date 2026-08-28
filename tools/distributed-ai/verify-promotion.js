#!/usr/bin/env node
"use strict"

const {
    integerArg,
    numberArg,
    parseArgs,
    readJson,
    requiredArg,
    validateCheckpoint,
    validateEvaluationAggregate,
    validatePromotionBundle,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/verify-promotion.js --candidate candidate.json --evaluation evaluation.json --baseline champion.json [--minimum-score 0.56] [--minimum-games 32]"

function main() {
    const args = parseArgs(process.argv.slice(2), ["candidate", "evaluation", "baseline", "minimum-score", "minimum-games"])
    if(args.help) {
        console.log(usage)
        return
    }
    const baseline = validateCheckpoint(readJson(requiredArg(args, "baseline")), "baseline")
    const candidate = validateCheckpoint(readJson(requiredArg(args, "candidate")), "candidate")
    const evaluation = validateEvaluationAggregate(readJson(requiredArg(args, "evaluation")), "evaluation")
    const minimumScore = numberArg(args, "minimum-score", 0.56)
    const minimumGames = args["minimum-games"] == null ? 32 : integerArg(args, "minimum-games", { minimum: 1 })
    validatePromotionBundle(candidate, evaluation, baseline, minimumScore, minimumGames)
    console.log(`Promotion bundle verified for ${candidate.checkpointId}: ${evaluation.overall.games} games, score ${evaluation.overall.score.toFixed(4)}.`)
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
