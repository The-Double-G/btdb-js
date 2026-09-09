"use strict"

const assert = require("node:assert/strict")
const { assertRuntimeClean, closeRuntime, openRuntime } = require("./distributed-ai/run-worker")

async function main() {
    const runtime = await openRuntime(733)
    try {
        const result = await runtime.page.evaluate(async () => {
            ensureAILearningLoaded()
            const stateFeatures = Array.from({ length: 128 }, (_, index) => (index % 17 - 8) / 8)
            const memoryIn = Array.from({ length: 16 }, (_, index) => (index % 5 - 2) / 2)
            const candidates = Array.from({ length: 7 }, (_, candidateIndex) => Array.from({ length: 128 }, (_, index) => ((index + candidateIndex * 3) % 19 - 9) / 9))
            const expected = candidates.map(candidate => aiDecisionForward(stateFeatures, candidate, AI_DECISION_FAMILY.placement, memoryIn, aiLearning.policy).score)
            const worker = new Worker("/js/ai-inference-worker.js")
            const actual = await new Promise((resolve, reject) => {
                worker.onmessage = event => {
                    if(event.data.type == "error") reject(new Error(event.data.message))
                    else resolve(event.data.scores)
                }
                worker.onerror = event => reject(new Error(event.message || "AI inference worker failed"))
                worker.postMessage({
                    type: "score",
                    requestId: 1,
                    policyEpoch: 1,
                    policy: aiLearning.policy.decision,
                    familyIndex: AI_DECISION_FAMILY.placement,
                    stateFeatures,
                    memoryIn,
                    candidates,
                })
            })
            worker.terminate()
            const differences = actual.map((score, index) => Math.abs(score - expected[index]))
            return {
                count: actual.length,
                maximumDifference: Math.max(...differences),
                finite: actual.every(Number.isFinite),
            }
        })
        assert.deepEqual(result, {
            count: 7,
            maximumDifference: 0,
            finite: true,
        })

        const firstPlacement = await runtime.page.evaluate(() => {
            AI_IS_LOCAL_RUNTIME = false
            aiEnabled = true
            aiSide = PLAYER_SIDE.right
            humanSide = PLAYER_SIDE.left
            gameStarted = true
            gameOver = false
            gamePaused = false
            frontMenuState = "pregame"
            aiCurrentStrategy = AI_STRATEGY_LIBRARY[0]
            p2Towers = ["000farm.png", "000wizard.png", "000bomb.png"]
            p2BoostTypes = ["towerboost.png", "bloonboost.png"]
            p2money = 650
            towers = []
            bloons = []
            pathObjects = []
            resetAIProfile()
            return findAISpot(PLAYER_SIDE.right, 25, 100, "core", 0, "tack")
        })
        const firstLoadout = await runtime.page.evaluate(() => chooseAILoadoutForMatch(null))
        await runtime.page.waitForTimeout(5000)
        const resolvedLoadout = await runtime.page.evaluate(() => chooseAILoadoutForMatch(null))
        assert.equal(firstLoadout, null)
        assert.ok(resolvedLoadout && Array.isArray(resolvedLoadout.towers) && resolvedLoadout.towers.length == 3)
        await runtime.page.waitForTimeout(1000)
        const resolvedPlacement = await runtime.page.evaluate(() => findAISpot(PLAYER_SIDE.right, 25, 100, "core", 0, "tack"))
        assert.equal(firstPlacement, null)
        assert.ok(resolvedPlacement && Number.isFinite(resolvedPlacement.x) && Number.isFinite(resolvedPlacement.y))
        const firstIntent = await runtime.page.evaluate(() => chooseAIPlacementIntent(PLAYER_SIDE.right, "tack", "core", getCurrentPlayerMatchupStyle(PLAYER_SIDE.right), buildAIDecisionStateFeatures(PLAYER_SIDE.right, AI_DECISION_FAMILY.placement, null)))
        await runtime.page.waitForTimeout(1000)
        const resolvedIntent = await runtime.page.evaluate(() => chooseAIPlacementIntent(PLAYER_SIDE.right, "tack", "core", getCurrentPlayerMatchupStyle(PLAYER_SIDE.right), buildAIDecisionStateFeatures(PLAYER_SIDE.right, AI_DECISION_FAMILY.placement, null)))
        assert.equal(firstIntent, null)
        assert.ok(resolvedIntent && Array.isArray(resolvedIntent.intentTiers) && resolvedIntent.intentTiers.length == 3)
        const firstAim = await runtime.page.evaluate(() => {
            towers = [new Tower(canvas.width * 0.75, canvas.height * 0.5, 25, 300, "dartling", PLAYER_SIDE.right)]
            return getBestAIAimingOption(PLAYER_SIDE.right)
        })
        await runtime.page.waitForTimeout(1000)
        const resolvedAim = await runtime.page.evaluate(() => getBestAIAimingOption(PLAYER_SIDE.right))
        assert.equal(firstAim, null)
        assert.ok(resolvedAim && (resolvedAim.type == "aim" || resolvedAim.type == "noop"))
        const firstPriority = await runtime.page.evaluate(() => {
            towers = [new Tower(canvas.width * 0.75, canvas.height * 0.5, 25, 300, "bomb", PLAYER_SIDE.right)]
            return getBestAITargetPriorityOption(PLAYER_SIDE.right)
        })
        await runtime.page.waitForTimeout(1000)
        const resolvedPriority = await runtime.page.evaluate(() => getBestAITargetPriorityOption(PLAYER_SIDE.right))
        assert.equal(firstPriority, null)
        assert.ok(resolvedPriority && (resolvedPriority.type == "priority" || resolvedPriority.type == "noop"))
        const labStarted = await runtime.page.evaluate(() => {
            aiTrainingState = createAITrainingState()
            return startAITrainingTrueSelfPlay()
        })
        for(let attempt = 0; attempt < 12; attempt++) {
            await runtime.page.waitForTimeout(1000)
            await runtime.page.evaluate(() => tickAITrainingTrueSelfPlayLifecycle())
        }
        const labSetup = await runtime.page.evaluate(() => ({
            active: aiTrainingState.trueSelfPlayActive,
            setupPending: aiTrainingState.trueSelfPlaySetupPending,
            contextKeys: Object.keys(aiContextsBySide).sort(),
            leftLoadoutCount: p1Towers.length,
            rightLoadoutCount: p2Towers.length,
            gameStarted,
        }))
        assert.equal(labStarted, true)
        assert.deepEqual(labSetup, {
            active: true,
            setupPending: false,
            contextKeys: ["1", "2"],
            leftLoadoutCount: 3,
            rightLoadoutCount: 3,
            gameStarted: false,
        })
        await runtime.page.evaluate(() => stopAITrainingTrueSelfPlay(false))
        assertRuntimeClean(runtime)
        console.log("AI inference worker passed: full-batch scores match inline inference and placement resolves asynchronously.")
    } finally {
        await closeRuntime(runtime)
    }
}

main().catch(error => {
    console.error(error.stack || error)
    process.exitCode = 1
})
