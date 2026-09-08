"use strict"

const assert = require("node:assert/strict")
const { closeRuntime, openRuntime } = require("./distributed-ai/run-worker")

async function capture(page) {
    return page.evaluate(() => {
        const bytes = new Uint8Array(4)
        crypto.getRandomValues(bytes)
        return {
            random: [Math.random(), Math.random()],
            dateNow: Date.now(),
            dateObject: +new Date(),
            performance: [performance.now(), performance.now()],
            crypto: Array.from(bytes),
            timeout: setTimeout(() => {}, 1),
            interval: setInterval(() => {}, 1),
        }
    })
}

async function main() {
    const first = await openRuntime(7332)
    const second = await openRuntime(7332)
    try {
        const left = await capture(first.page)
        const right = await capture(second.page)
        assert.deepEqual(left.random, right.random)
        assert.equal(left.dateNow, right.dateNow)
        assert.equal(left.dateObject, right.dateObject)
        assert.deepEqual(left.performance, right.performance)
        assert.deepEqual(left.crypto, right.crypto)
        assert.deepEqual([left.timeout, left.interval], [1, 2])
        assert.deepEqual([right.timeout, right.interval], [1, 2])

        const reset = await first.page.evaluate(() => {
            nextTowerID = 99
            nextBloonID = 77
            p1BloonSendRound = 19
            p2BloonSendRound = 21
            frameTowerByID.set(99, {})
            aiTowerDpsCache = { 99: { lastSeenAt: 1, lastPopCount: 2, recentDps: 3 } }
            resetAITrainingTrueSelfPlayMatchState()
            return {
                nextTowerID,
                nextBloonID,
                p1BloonSendRound,
                p2BloonSendRound,
                frameLookupSize: frameTowerByID.size,
                dpsCache: Object.keys(aiTowerDpsCache),
            }
        })
        assert.deepEqual(reset, {
            nextTowerID: 1,
            nextBloonID: 1,
            p1BloonSendRound: 0,
            p2BloonSendRound: 0,
            frameLookupSize: 0,
            dpsCache: [],
        })
        console.log("Headless runtime tests passed: deterministic clocks/randomness, timers, and cross-match reset isolation.")
    } finally {
        await closeRuntime(first)
        await closeRuntime(second)
    }
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
