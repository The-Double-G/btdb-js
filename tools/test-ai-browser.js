"use strict"

const assert = require("node:assert/strict")
const { assertRuntimeClean, closeRuntime, openRuntime } = require("./distributed-ai/run-worker")

async function main() {
    const runtime = await openRuntime(253)
    try {
        const result = await runtime.page.evaluate(() => {
            aiEnabled = true
            aiSide = PLAYER_SIDE.right
            humanSide = PLAYER_SIDE.left
            gameStarted = true
            gameOver = false
            gamePaused = false
            frontMenuState = "pregame"
            aiTrainingState.trueSelfPlayActive = false

            towers.length = 0
            players[aiSide].cursor.x = canvas.width / 2 + 60
            players[aiSide].cursor.y = 180
            aiProfile.currentAction = {
                type: "deselectTower",
                side: aiSide,
                targetX: canvas.width / 2 + 240,
                targetY: 360,
                priority: AI_ACTION_PRIORITY.low,
                attempts: 0,
            }
            const normalStart = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            runAICursor()
            const normalEnd = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            const normalDirectMode = isAITrainingDirectAIActionMode()

            aiTrainingState.trueSelfPlayActive = true
            players[aiSide].cursor.x = normalStart.x
            players[aiSide].cursor.y = normalStart.y
            aiProfile.currentAction = {
                type: "deselectTower",
                side: aiSide,
                targetX: canvas.width / 2 + 240,
                targetY: 360,
                priority: AI_ACTION_PRIORITY.low,
                attempts: 0,
            }
            runAICursor()
            const trainingEnd = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            const trainingDirectMode = isAITrainingDirectAIActionMode()

            aiTrainingState.trueSelfPlayActive = false
            aiProfile.currentAction = {
                type: "upgradeTower",
                side: aiSide,
                towerID: -1,
                pathNumber: 1,
                targetX: players[aiSide].cursor.x,
                targetY: players[aiSide].cursor.y,
                priority: AI_ACTION_PRIORITY.normal,
                attempts: 0,
            }
            runAICursor()
            const staleActionRetried = aiProfile.currentAction != null && aiProfile.currentAction.attempts == 1
            runAICursor()
            const staleActionCleared = aiProfile.currentAction == null

            aiProfile.currentAction = null
            aiProfile.manualAimAction = null
            function createAimTower(towerType, towerID, x, y, path3Upgrades, targetPrio) {
                return {
                    playerSide: aiSide,
                    towerType,
                    towerID,
                    x,
                    y,
                    targetPrio,
                    targetX: 0,
                    targetY: 0,
                    target: -1,
                    path3Upgrades,
                    selected: false,
                    clicked(cursorX, cursorY) {
                        return Math.sqrt((this.x - cursorX) ** 2 + (this.y - cursorY) ** 2) <= 30
                    },
                    findTarget() {
                        this.target = -1
                    },
                }
            }
            const aimTowers = [
                createAimTower("dartling", 999991, canvas.width / 2 + 120, 240, 0, 0),
                createAimTower("mortar", 999992, canvas.width / 2 + 180, 300, 0, 0),
                createAimTower("mortar", 999993, canvas.width / 2 + 240, 240, 1, 4),
            ]
            towers.push(...aimTowers)
            players[aiSide].cursor.x = canvas.width / 2 + 60
            players[aiSide].cursor.y = 180
            const aimX = canvas.width / 2 + 300
            const aimY = 390
            bloons.length = 0
            const aimBloon = {
                playerSide: aiSide,
                isBoss: false,
                pathPos: 60,
                health: 1,
                x: aimX,
                y: aimY,
                speed: 1,
                bloonBoosted: 1,
            }
            bloons.push(aimBloon)
            for(let tick = 0; tick < 40 && !aiProfile.manualAimAction; tick++) {
                runAIAiming(aiSide)
                window.__distributedAI.advance(keyMsCooldown)
                advanceRuntimeClock()
            }
            const lockStartedThroughRunAiming = aiProfile.manualAimAction && aiProfile.manualAimAction.type == "lock"

            const selectedAt = {}
            const lockInputAt = {}
            const lockInputSelected = {}
            let changedBeforeCooldown = false
            for(let tick = 0; tick < 240 && aiProfile.manualAimAction; tick++) {
                const previousPriorities = aimTowers.map(tower => tower.targetPrio)
                advanceAIManualAimAction(aiSide)
                for(let index = 0; index < aimTowers.length; index++) {
                    const tower = aimTowers[index]
                    if(tower.selected && selectedAt[tower.towerID] == null) {
                        selectedAt[tower.towerID] = gameNow()
                        const selectedPriority = tower.targetPrio
                        advanceAIManualAimAction(aiSide)
                        changedBeforeCooldown ||= tower.targetPrio != selectedPriority
                    }
                    const transientPriority = getManualAimLockPriority(tower) - 1
                    if(tower.targetPrio == transientPriority && previousPriorities[index] != transientPriority) {
                        lockInputAt[tower.towerID] = gameNow()
                        lockInputSelected[tower.towerID] = tower.selected
                    }
                }
                updateManualAimTowerTargets()
                window.__distributedAI.advance(keyMsCooldown)
                advanceRuntimeClock()
            }
            const initialAimActionCompleted = aiProfile.manualAimAction == null
            let cumulativeFollowStarted = false
            let prematureFollowStarted = false
            for(const shift of [14, 28, 43]) {
                aimBloon.x = aimX + shift
                runAIAiming(aiSide)
                if(aiProfile.manualAimAction && aiProfile.manualAimAction.type == "follow") {
                    if(shift < 42) {
                        prematureFollowStarted = true
                    } else {
                        cumulativeFollowStarted = true
                    }
                    break
                }
            }

            return {
                aimActionCompleted: initialAimActionCompleted,
                aimTarget: { x: aimX, y: aimY },
                aimTowers: aimTowers.map(tower => ({
                    lockDelay: lockInputAt[tower.towerID] - selectedAt[tower.towerID],
                    lockInputSelected: lockInputSelected[tower.towerID],
                    targetPrio: tower.targetPrio,
                    targetX: tower.targetX,
                    targetY: tower.targetY,
                })),
                changedBeforeCooldown,
                cumulativeFollowStarted,
                lockStartedThroughRunAiming,
                normalDelta: { x: normalEnd.x - normalStart.x, y: normalEnd.y - normalStart.y },
                normalDirectMode,
                prematureFollowStarted,
                staleActionCleared,
                staleActionRetried,
                trainingDirectMode,
                trainingEnd,
                trainingTarget: { x: canvas.width / 2 + 240, y: 360 },
            }
        })

        assert.equal(result.normalDirectMode, false)
        assert.ok(result.normalDelta.x > 0 || result.normalDelta.y > 0)
        assert.ok(Math.abs(result.normalDelta.x) <= 15)
        assert.ok(Math.abs(result.normalDelta.y) <= 15)
        assert.equal(result.trainingDirectMode, true)
        assert.deepEqual(result.trainingEnd, result.trainingTarget)
        assert.equal(result.staleActionRetried, true)
        assert.equal(result.staleActionCleared, true)
        assert.equal(result.lockStartedThroughRunAiming, true)
        assert.equal(result.changedBeforeCooldown, false)
        for(const tower of result.aimTowers) {
            assert.equal(tower.lockInputSelected, true)
            assert.ok(tower.lockDelay >= 150)
            assert.ok(tower.targetPrio == 2 || tower.targetPrio == 6)
            assert.deepEqual({ x: tower.targetX, y: tower.targetY }, result.aimTarget)
        }
        assert.equal(result.aimActionCompleted, true)
        assert.equal(result.prematureFollowStarted, false)
        assert.equal(result.cumulativeFollowStarted, true)
        assertRuntimeClean(runtime)
        console.log("AI browser regression passed: normal cursor travel is bounded and manual aim locks require visible tower selection.")
    } finally {
        await closeRuntime(runtime)
    }
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
