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
    validateQualityComparison,
    validatePromotionBundle,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/verify-promotion.js --candidate candidate.json --evaluation evaluation.json --baseline-evaluation baseline-evaluation.json --quality quality.json --baseline champion.json [--minimum-score 0.58] [--minimum-games 64]"

function main() {
    const args = parseArgs(process.argv.slice(2), ["candidate", "evaluation", "baseline-evaluation", "quality", "baseline", "minimum-score", "minimum-games"])
    if(args.help) {
        console.log(usage)
        return
    }
    const baseline = validateCheckpoint(readJson(requiredArg(args, "baseline")), "baseline")
    const candidate = validateCheckpoint(readJson(requiredArg(args, "candidate")), "candidate")
    const evaluation = validateEvaluationAggregate(readJson(requiredArg(args, "evaluation")), "evaluation")
    const baselineEvaluation = validateEvaluationAggregate(readJson(requiredArg(args, "baseline-evaluation")), "baseline evaluation")
    const quality = validateQualityComparison(readJson(requiredArg(args, "quality")), "quality")
    const minimumScore = numberArg(args, "minimum-score", 0.58)
    const minimumGames = args["minimum-games"] == null ? 64 : integerArg(args, "minimum-games", { minimum: 1 })
    validatePromotionBundle(candidate, evaluation, baseline, minimumScore, minimumGames, quality, baselineEvaluation)
    console.log(`Promotion bundle verified for ${candidate.checkpointId}: ${evaluation.overall.games} games, score ${evaluation.overall.score.toFixed(4)}.`)
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
