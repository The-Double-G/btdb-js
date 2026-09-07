#!/usr/bin/env node
"use strict"

const path = require("node:path")
const {
    compareEvaluationQuality,
    defaultMarkdownPath,
    fail,
    numberArg,
    parseArgs,
    readJson,
    requiredArg,
    validateEvaluationAggregate,
    writeJson,
    writeText,
} = require("./common")

const usage = "Usage: node tools/distributed-ai/compare-evaluation.js --candidate evaluation.json --baseline evaluation.json --output quality.json [--report report.md] [--minimum-games 64]"

function qualityMarkdown(comparison) {
    const percent = value => `${(value * 100).toFixed(2)}%`
    const deltaPercent = value => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`
    const row = (label, key, format = percent) => `| ${label} | ${format(comparison.candidate[key])} | ${format(comparison.baseline[key])} | ${format(comparison.deltas[key])} |`
    return [
        "# AI Gameplay Quality Comparison",
        "",
        `Decision: **${comparison.passed ? "PASS" : "FAIL"}**`,
        "",
        `Candidate evaluation: \`${comparison.candidateAggregateId}\`  `,
        `Baseline evaluation: \`${comparison.baselineAggregateId}\`  `,
        `Compared games: ${comparison.games}; maximum allowed safety regressions are bounded and recorded in the JSON artifact.`,
        "",
        "| Metric | Candidate | Baseline | Delta |",
        "| --- | ---: | ---: | ---: |",
        row("Overall score", "overallScore"),
        row("Worst bucket score", "worstBucketScore"),
        row("Survival rate", "survivalRate"),
        row("Severe collapse rate", "severeCollapseRate", deltaPercent),
        row("Average candidate lives", "averageCandidateLives", value => value.toFixed(2)),
        row("Responder defense rate", "defenseProtectionRate"),
        row("Minimum responder lives", "defenseMinimumLives", value => value.toFixed(2)),
        row("Responder score", "responderScore"),
        "",
    ].join("\n")
}

function main() {
    const args = parseArgs(process.argv.slice(2), ["candidate", "baseline", "output", "report", "minimum-games"])
    if(args.help) {
        console.log(usage)
        return
    }
    const candidate = validateEvaluationAggregate(readJson(requiredArg(args, "candidate")), "candidate evaluation")
    const baseline = validateEvaluationAggregate(readJson(requiredArg(args, "baseline")), "baseline evaluation")
    const minimumGames = numberArg(args, "minimum-games", candidate.thresholds.minimumGames)
    if(!Number.isSafeInteger(minimumGames) || minimumGames < 1) fail("--minimum-games must be a positive integer")
    const comparison = compareEvaluationQuality(candidate, baseline, minimumGames)
    const output = writeJson(requiredArg(args, "output"), comparison)
    const report = writeText(args.report || defaultMarkdownPath(output), qualityMarkdown(comparison))
    console.log(`Gameplay quality ${comparison.passed ? "passed" : "failed"}: ${comparison.games} paired games`)
    console.log(`JSON: ${path.resolve(output)}`)
    console.log(`Markdown: ${path.resolve(report)}`)
    if(!comparison.passed) process.exitCode = 1
}

try {
    main()
} catch(error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
}
