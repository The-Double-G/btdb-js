// Main animation loop and runtime orchestration
function isAITrainingGameplayCatchupActive() {
    return typeof isAITrainingTrueSelfPlayActive == "function" && isAITrainingTrueSelfPlayActive() && (typeof getAITrainingRuntimeClockMultiplier == "function" ? getAITrainingRuntimeClockMultiplier() : 1) > 1
}

function getAITrainingGameplayCatchupLimit() {
    if(isAITrainingGameplayCatchupActive() == false) {
        return 1
    }
    var runtimeMultiplier = typeof getAITrainingRuntimeClockMultiplier == "function" ? getAITrainingRuntimeClockMultiplier() : 1
    var simulationMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
    return Math.min(256, Math.max(2, Math.ceil(Math.max(runtimeMultiplier, simulationMultiplier) * 4)))
}

function getAITowerFireCatchupLimit() {
    return Math.min(64, getAITrainingGameplayCatchupLimit())
}

function isAITrainingEcoCatchupActive() {
    return isAITrainingGameplayCatchupActive()
}

function queueLightningBoostForSide(side) {
    var nextTick = gameNow() + BOOST_SETTINGS.lightningTickIntervalMs
    if(side == PLAYER_SIDE.left) {
        p1LightningBoostTicksRemaining += BOOST_SETTINGS.lightningTickCount
        if(p1LightningBoostNextTick <= 0 || p1LightningBoostNextTick > nextTick) {
            p1LightningBoostNextTick = nextTick
        }
    } else if(side == PLAYER_SIDE.right) {
        p2LightningBoostTicksRemaining += BOOST_SETTINGS.lightningTickCount
        if(p2LightningBoostNextTick <= 0 || p2LightningBoostNextTick > nextTick) {
            p2LightningBoostNextTick = nextTick
        }
    }
}

function processLightningBoostForSide(side) {
    var ticksRemaining = side == PLAYER_SIDE.left ? p1LightningBoostTicksRemaining : p2LightningBoostTicksRemaining
    var nextTick = side == PLAYER_SIDE.left ? p1LightningBoostNextTick : p2LightningBoostNextTick
    if(ticksRemaining <= 0 || nextTick <= 0) {
        return
    }

    var catchupLimit = getAITrainingGameplayCatchupLimit()
    while(ticksRemaining > 0 && nextTick <= gameNow() && catchupLimit > 0) {
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].playerSide == side && bloons[i].isBoss == false && Math.random() <= 0.2) {
                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, 0, side, false, -1, 0, 0, 0, 0, 0))
            }
        }
        ticksRemaining--
        nextTick += BOOST_SETTINGS.lightningTickIntervalMs
        catchupLimit--
    }

    if(ticksRemaining <= 0) {
        nextTick = 0
    }
    if(side == PLAYER_SIDE.left) {
        p1LightningBoostTicksRemaining = ticksRemaining
        p1LightningBoostNextTick = nextTick
    } else {
        p2LightningBoostTicksRemaining = ticksRemaining
        p2LightningBoostNextTick = nextTick
    }
}

function processLightningBoosts() {
    processLightningBoostForSide(PLAYER_SIDE.left)
    processLightningBoostForSide(PLAYER_SIDE.right)
}

var frameTowerByID = new Map()

function rebuildFrameTowerLookup() {
    frameTowerByID.clear()
    for(var i = 0; i < towers.length; i++) {
        frameTowerByID.set(towers[i].towerID, towers[i])
    }
}

function applyProjectileStun(projectile, bloon) {
    if(bloon.isBoss) {
        return
    }
    var parentTower = frameTowerByID.get(projectile.parentID)
    if(!parentTower) {
        return
    }
    var stunDurationMs = 0
    if(parentTower.towerType == "bomb" && parentTower.path1Upgrades >= 4) {
        stunDurationMs = parentTower.path1Upgrades == 5 ? 1250 : 750
    } else if(parentTower.towerType == "ninja" && parentTower.path3Upgrades >= 3 && projectile.sourceImage == "003ninjaproj.png") {
        stunDurationMs = parentTower.path3Upgrades == 5 ? 1000 : parentTower.path3Upgrades == 4 ? 750 : 500
    } else if(parentTower.towerType == "mortar" && parentTower.path1Upgrades >= 3 && projectile.sourceImage == "explosion.png") {
        stunDurationMs = parentTower.path1Upgrades == 5 ? 1000 : parentTower.path1Upgrades == 4 ? 750 : 500
    }
    if(stunDurationMs > 0) {
        bloon.stunned = Math.max(bloon.stunned, gameNow() + stunDurationMs)
    }
}

function getHeadlessTrainingMatchClockText() {
    var totalSeconds = Math.max(0, Math.floor((gameNow() - timeGameStarted) / 1000))
    var minutes = Math.floor(totalSeconds / 60)
    var seconds = totalSeconds % 60
    return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds)
}

function getBoostTypeDisplayName(boostType) {
    if(boostType == "towerboost.png") return "Tower Boost"
    if(boostType == "bloonboost.png") return "Bloon Boost"
    if(boostType == "lightningboost.png") return "Lightning"
    if(boostType == "slowboost.png") return "Slow"
    if(boostType == "ecoboost.png") return "Eco Boost"
    return "Empty"
}

function getHeadlessTrainingPowersCountText() {
    return "Powers  |  Left " + getBoostTypeDisplayName(p1BoostTypes[0]) + " " + p1Boost1Count.toLocaleString() + "  |  " + getBoostTypeDisplayName(p1BoostTypes[1]) + " " + p1Boost2Count.toLocaleString() + "  |  Right " + getBoostTypeDisplayName(p2BoostTypes[0]) + " " + p2Boost1Count.toLocaleString() + "  |  " + getBoostTypeDisplayName(p2BoostTypes[1]) + " " + p2Boost2Count.toLocaleString()
}

function getSideHighestDamageTowerIndex(side) {
    var bestIndex = -1
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side && towers[i].towerType != "farm" && towers[i].towerType != "farmer" && (bestIndex == -1 || towers[i].popCount > towers[bestIndex].popCount)) {
            bestIndex = i
        }
    }
    return bestIndex
}

function getTowerDisplayImageByIndex(towerIndex) {
    if(towerIndex == -1 || !towers[towerIndex]) {
        return ""
    }
    if(towers[towerIndex].path1Upgrades != 5 && towers[towerIndex].path2Upgrades != 5 && towers[towerIndex].path3Upgrades != 5) {
        return String(towers[towerIndex].path1Upgrades) + towers[towerIndex].path2Upgrades + towers[towerIndex].path3Upgrades + towers[towerIndex].towerType + ".png"
    } else if(towers[towerIndex].path1Upgrades == 5) {
        return "500" + towers[towerIndex].towerType + ".png"
    } else if(towers[towerIndex].path2Upgrades == 5) {
        return "050" + towers[towerIndex].towerType + ".png"
    }
    return "005" + towers[towerIndex].towerType + ".png"
}

function drawHeadlessTrainingSideStats(side, centerX) {
    var moneyValue = side == PLAYER_SIDE.left ? p1money : p2money
    var ecoValue = side == PLAYER_SIDE.left ? p1eco : p2eco
    var livesValue = side == PLAYER_SIDE.left ? p1lives : p2lives
    var totalDamageValue = side == PLAYER_SIDE.left ? p1TotalPopCount : p2TotalPopCount
    var cashNoEcoValue = side == PLAYER_SIDE.left ? p1TotalCashGenerated : p2TotalCashGenerated
    var cashEcoOnlyValue = side == PLAYER_SIDE.left ? p1CashGenWithEco : p2CashGenWithEco
    var statLines = [
        "Money: $" + Math.floor(moneyValue).toLocaleString(),
        "Eco: \u25b2" + Math.trunc(Math.trunc(ecoValue * 10) / 10).toLocaleString(),
        "Lives: \u2764" + livesValue.toLocaleString(),
        "Total Damage: " + totalDamageValue.toLocaleString(),
        "Cash Generated w/o Eco: $" + Math.floor(cashNoEcoValue).toLocaleString(),
        "Cash Generated w/ Eco only: $" + Math.floor(cashEcoOnlyValue).toLocaleString(),
        "Cash Generated inc. Eco: $" + Math.floor(cashNoEcoValue + cashEcoOnlyValue).toLocaleString(),
    ]
    ctx.lineWidth = 6
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.font = "28px Luckiest Guy"
    ctx.textAlign = "center"
    for(var i = 0; i < statLines.length; i++) {
        var lineY = canvas.height * 0.18 + i * canvas.height * 0.06
        ctx.strokeText(statLines[i], centerX, lineY, canvas.width * 0.42)
        ctx.fillText(statLines[i], centerX, lineY, canvas.width * 0.42)
    }
}

function drawHeadlessTrainingStarTower(side, centerX, fallbackUITowerIndex) {
    var towerIndex = getSideHighestDamageTowerIndex(side)
    var baseY = canvas.height * 0.78
    var image = towerIndex == -1 && UITowers[fallbackUITowerIndex] ? UITowers[fallbackUITowerIndex].image : getTowerDisplayImageByIndex(towerIndex)
    if(image) {
        drawAsset(image, centerX - 30, baseY - 30, 60, 60)
    }

    ctx.lineWidth = 6
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.font = "30px Luckiest Guy"
    ctx.textAlign = "center"
    if(towerIndex == -1) {
        ctx.strokeText("0-0-0", centerX, baseY - 30, canvas.width * 0.42)
        ctx.fillText("0-0-0", centerX, baseY - 30, canvas.width * 0.42)
        ctx.font = "34px Luckiest Guy"
        ctx.strokeText("Star Tower Pops: 0", centerX, baseY + canvas.height * 0.03, canvas.width * 0.42)
        ctx.fillText("Star Tower Pops: 0", centerX, baseY + canvas.height * 0.03, canvas.width * 0.42)
        return
    }

    var tower = towers[towerIndex]
    ctx.strokeText(tower.path1Upgrades + "-" + tower.path2Upgrades + "-" + tower.path3Upgrades + " " + tower.towerType.charAt(0).toUpperCase() + tower.towerType.slice(1), centerX, baseY - 30, canvas.width * 0.42)
    ctx.fillText(tower.path1Upgrades + "-" + tower.path2Upgrades + "-" + tower.path3Upgrades + " " + tower.towerType.charAt(0).toUpperCase() + tower.towerType.slice(1), centerX, baseY - 30, canvas.width * 0.42)
    ctx.font = "34px Luckiest Guy"
    ctx.strokeText("Star Tower Pops: " + tower.popCount.toLocaleString(), centerX, baseY + canvas.height * 0.03, canvas.width * 0.42)
    ctx.fillText("Star Tower Pops: " + tower.popCount.toLocaleString(), centerX, baseY + canvas.height * 0.03, canvas.width * 0.42)
}

function getFarmProductionDivisor(tower) {
    if(!tower || tower.towerType != "farm") {
        return 0
    }
    if(tower.path3Upgrades >= 4) {
        if(tower.path1Upgrades == 0) return 6
        if(tower.path1Upgrades == 1) return 10
        if(tower.path1Upgrades == 2) return 14
        return 0
    }
    if(tower.path1Upgrades == 0 && tower.path3Upgrades <= 3) return 3
    if(tower.path1Upgrades == 1 && tower.path3Upgrades <= 3) return 5
    if(tower.path1Upgrades == 2 && tower.path3Upgrades <= 3) return 7
    if(tower.path1Upgrades == 3 && tower.path3Upgrades <= 2) return 16
    if(tower.path1Upgrades >= 4 && tower.path3Upgrades <= 2) return 5
    return 0
}

function tickFarmProductionForTower(tower) {
    var divisor = getFarmProductionDivisor(tower)
    if(divisor <= 0 || maxCounter <= 0) {
        return
    }
    var catchupLimit = getAITrainingGameplayCatchupLimit()
    while(tower.bananaCounter * maxCounter / divisor <= counter && catchupLimit > 0) {
        tower.bananaCounter++
        tower.attack()
        catchupLimit--
    }
}

function tickSubtowerFireForIndex(index) {
    if(!subtowers[index]) {
        return
    }
    var catchupLimit = getAITowerFireCatchupLimit()
    subtowers[index].findTarget()
    if(subtowers[index] && subtowers[index].target == -1) {
        subtowers[index].nextFire = Math.max(subtowers[index].nextFire, gameNow())
        return
    }
    while(subtowers[index] && subtowers[index].target != -1 && subtowers[index].nextFire <= gameNow() && catchupLimit > 0) {
        subtowers[index].attack()
        subtowers[index].nextFire += subtowers[index].attackSpeed
        catchupLimit--
        if(subtowers[index] && catchupLimit > 0) {
            subtowers[index].findTarget()
        }
    }
}

function tickTowerFireForIndex(index) {
    if(!towers[index] || towers[index].towerType == "farmer") {
        return
    }
    var catchupLimit = getAITowerFireCatchupLimit()
    if(towers[index].towerType != "dartling" && towers[index].towerType != "mortar") {
        towers[index].findTarget()
        if(towers[index] && towers[index].towerType != "farm" && towers[index].target == -1) {
            towers[index].nextFire = Math.max(towers[index].nextFire, gameNow())
            return
        }
        while(towers[index] && towers[index].towerType != "farm" && towers[index].target != -1 && towers[index].nextFire <= gameNow() && catchupLimit > 0) {
            towers[index].attack()
            towers[index].nextFire += towers[index].attackSpeed
            catchupLimit--
            if(towers[index] && catchupLimit > 0) {
                towers[index].findTarget()
            }
        }
        return
    }
    while(towers[index] && towers[index].nextFire <= gameNow() && catchupLimit > 0) {
        towers[index].attack()
        towers[index].nextFire += towers[index].attackSpeed
        catchupLimit--
    }
}

function queueAutoEcoSendForSide(side) {
    var selectedBloon = displayBloons[players[side].selectedBloon]
    if(!selectedBloon || selectedBloon.image == "locked.png" || players[side].money < selectedBloon.cost || players[side].bloonQueue.length >= 6) {
        return false
    }
    players[side].bloonQueue.push(new SentBloonQueue(selectedBloon.health, selectedBloon.cost, selectedBloon.eco, selectedBloon.spacing, selectedBloon.count))
    players[side].money -= selectedBloon.cost
    players[side].eco += selectedBloon.eco
    if(players[side].eco < 0) {
        players[side].eco = 0
    }
    return true
}

function tickAutoEcoForSide(side) {
    if(players[side].autoEco == false) {
        return 0
    }
    var maxQueuedGroups = isAITrainingEcoCatchupActive() ? 6 : 1
    var queuedGroups = 0
    while(players[side].bloonQueue.length < 6 && queuedGroups < maxQueuedGroups) {
        if(queueAutoEcoSendForSide(side) == false) {
            break
        }
        queuedGroups++
    }
    return queuedGroups
}

function tickBloonQueueForSide(side) {
    var queue = players[side].bloonQueue
    var targetSide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var now = gameNow()
    var sendLimit = isAITrainingGameplayCatchupActive() ? 256 : 1
    var sendsProcessed = 0
    while(queue.length > 0 && sendsProcessed < sendLimit) {
        var activeSend = queue[0]
        if(activeSend.nextSend > now) {
            break
        }
        var scheduledSendAt = activeSend.nextSend
        var queuedBloon = new Bloon(-1000, 0, 25, 0, 1, 1, 1, activeSend.health, targetSide, false, false, 0, 0, 0, 0, 0, 0)
        advanceBloonSpawnProgressByElapsedMs(queuedBloon, Math.max(0, now - scheduledSendAt))
        bloons.push(queuedBloon)
        activeSend.nextSend += activeSend.spacing
        activeSend.count--
        sendsProcessed++
        if(activeSend.count <= 0) {
            var nextQueueReadyAt = activeSend.nextSend
            queue.splice(0, 1)
            if(queue.length > 0 && queue[0].nextSend < nextQueueReadyAt) {
                queue[0].nextSend = nextQueueReadyAt
            }
        }
    }
}

function updateManualAimTowerTargets() {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].towerType == "dartling") {
            if(towers[i].targetPrio == 0 || towers[i].targetPrio == 1) {
                if(towers[i].playerSide == 1) {
                    towers[i].targetX = cursor[0].x
                    towers[i].targetY = cursor[0].y
                } else {
                    towers[i].targetX = cursor[1].x
                    towers[i].targetY = cursor[1].y
                }
            }
            if(towers[i].targetPrio == 1) {
                towers[i].targetPrio = 2
            }
        } else if(towers[i].towerType == "mortar" && towers[i].path3Upgrades < 1) {
            if(towers[i].targetPrio == 0 || towers[i].targetPrio == 1) {
                if(towers[i].playerSide == 1) {
                    towers[i].targetX = cursor[0].x
                    towers[i].targetY = cursor[0].y
                } else {
                    towers[i].targetX = cursor[1].x
                    towers[i].targetY = cursor[1].y
                }
            }
            if(towers[i].targetPrio == 1) {
                towers[i].targetPrio = 2
            }
        } else if(towers[i].towerType == "mortar" && towers[i].path3Upgrades >= 1) {
            if(towers[i].targetPrio <= 3) {
                towers[i].findTarget()
                if(towers[i].target == -1) {
                    if(towers[i].playerSide == 1) {
                        towers[i].targetX = cursor[0].x
                        towers[i].targetY = cursor[0].y
                    } else {
                        towers[i].targetX = cursor[1].x
                        towers[i].targetY = cursor[1].y
                    }
                } else {
                    towers[i].targetX = bloons[towers[i].target].x
                    towers[i].targetY = bloons[towers[i].target].y
                }
            } else if(towers[i].targetPrio == 4 || towers[i].targetPrio == 5) {
                if(towers[i].playerSide == 1) {
                    towers[i].targetX = cursor[0].x
                    towers[i].targetY = cursor[0].y
                } else {
                    towers[i].targetX = cursor[1].x
                    towers[i].targetY = cursor[1].y
                }
            }
            if(towers[i].targetPrio == 5) {
                towers[i].targetPrio = 6
            }
        }
    }
}

var fpsWindowStart = nativeDateNow()
var fpsWindowFrames = 0

function animate() {
    /*if(gamemodeSelected == false) {
        ctx.fillStyle = "gray"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }*/
    fpsWindowFrames++
    var fpsWindowNow = nativeDateNow()
    var fpsWindowElapsed = fpsWindowNow - fpsWindowStart
    if(fpsWindowElapsed >= 500) {
        fpsCounter = Math.round(fpsWindowFrames * 2000 / fpsWindowElapsed)
        fpsWindowFrames = 0
        fpsWindowStart = fpsWindowNow
    }
    if(typeof syncAITrainingSimulationFrameStep == "function") {
        syncAITrainingSimulationFrameStep()
    }
    if(gameStarted && gameOver == false && gamePaused) {
        nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
        drawPauseOverlay()
        return
    }
    if(isFrontMenuOpen()) {
        nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
        drawFrontMenu()
        return
    }

    var previousCtx = null
    var headlessRenderingActive = false
    if(typeof isAITrainingHeadlessModeEnabled == "function" && isAITrainingHeadlessModeEnabled() && gameStarted && gameOver == false) {
        previousCtx = ctx
        headlessRenderingActive = true
        ctx = getAITrainingHeadlessRenderContext()
    }
    try {
        tickAIControllers()
        if(aiEnabled && gameOver) {
            finalizeAIControllersOnGameOver()
        }
        tickAITrainingTrueSelfPlayLifecycle()
        if(isFrontMenuOpen()) {
            nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
            drawFrontMenu()
            return
        }

        if(gameStarted == false) {
            nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
            ctx.fillStyle = "gray"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        for(var i = 0; i < UITowers.length; i++) {
            UITowers[i].draw()
        }
        for(var i = 0; i < UIBoosts.length; i++) {
            UIBoosts[i].draw()
        }
        for(var i = 0; i < images.length; i++) {
            images[i].draw()
        }
        ctx.lineWidth = 7
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = "30px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText("Select", canvas.width/16, canvas.height/8, canvas.width/2)
        ctx.strokeText("Powers", canvas.width/16, 3*canvas.height/16, canvas.width/2)
        ctx.fillText("Select", canvas.width/16, canvas.height/8, canvas.width/2)
        ctx.fillText("Powers", canvas.width/16, 3*canvas.height/16, canvas.width/2)
        ctx.strokeText("Select", 15*canvas.width/16, canvas.height/8, canvas.width/2)
        ctx.strokeText("Powers", 15*canvas.width/16, 3*canvas.height/16, canvas.width/2)
        ctx.fillText("Select", 15*canvas.width/16, canvas.height/8, canvas.width/2)
        ctx.fillText("Powers", 15*canvas.width/16, 3*canvas.height/16, canvas.width/2)
        if(p1decal == false) {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Decal Disabled", canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.strokeText("Press 1", canvas.width/4, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Decal Disabled", canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.fillText("Press 1", canvas.width/4, 3*canvas.height/16, canvas.width/2)
        } else {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Decal Enabled", canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.strokeText("Press 1", canvas.width/4, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Decal Enabled", canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.fillText("Press 1", canvas.width/4, 3*canvas.height/16, canvas.width/2)
        }
        if(p2decal == false) {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Decal Disabled", 3*canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.strokeText("Press 6", 3*canvas.width/4, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Decal Disabled", 3*canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.fillText("Press 6", 3*canvas.width/4, 3*canvas.height/16, canvas.width/2)
        } else {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Decal Enabled", 3*canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.strokeText("Press 6", 3*canvas.width/4, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Decal Enabled", 3*canvas.width/4, canvas.height/8, canvas.width/2)
            ctx.fillText("Press 6", 3*canvas.width/4, 3*canvas.height/16, canvas.width/2)
        }
        if(mapNumber == 0) {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Contact me at btdbjsdev@gmail.com to take down the game", canvas.width/2, canvas.height/16, canvas.width)
            ctx.strokeText("Selected Map", canvas.width/2, canvas.height/8, canvas.width/2)
            ctx.strokeText("\"Classic Steps\"", canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.strokeText("Press \"g\"", canvas.width/2, canvas.height/4, canvas.width/2)
            if(aiEnabled == false) {
                ctx.strokeText("Toggle Practice Mode", canvas.width/2, 5*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"p\"", canvas.width/2, 3*canvas.height/8, canvas.width/2)
                if(practiceMode && nonPlayableSide == 1) {
                    ctx.strokeText("Play as: Right", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.strokeText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                } else if(practiceMode && nonPlayableSide == 2) {
                    ctx.strokeText("Play as: Left", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.strokeText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                }
            }
            ctx.fillText("Contact me at btdbjsdev@gmail.com to take down the game", canvas.width/2, canvas.height/16, canvas.width)
            ctx.fillText("Selected Map", canvas.width/2, canvas.height/8, canvas.width/2)
            ctx.fillText("\"Classic Steps\"", canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Press \"g\"", canvas.width/2, canvas.height/4, canvas.width/2)
            if(aiEnabled == false) {
                ctx.fillText("Toggle Practice Mode", canvas.width/2, 5*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"p\"", canvas.width/2, 3*canvas.height/8, canvas.width/2)
                if(practiceMode && nonPlayableSide == 1) {
                    ctx.fillText("Play as: Right", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.fillText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                } else if(practiceMode && nonPlayableSide == 2) {
                    ctx.fillText("Play as: Left", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.fillText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                }
            }
            if(bossMode == false) {
                ctx.strokeText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.strokeText("Disabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
                ctx.fillText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.fillText("Disabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
            } else {
                ctx.strokeText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.strokeText("Enabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
                ctx.fillText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.fillText("Enabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
            }
        } else if(mapNumber == 1) {
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "30px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("Contact me at btdbjsdev@gmail.com to take down the game", canvas.width/2, canvas.height/16, canvas.width)
            ctx.strokeText("Selected Map", canvas.width/2, canvas.height/8, canvas.width/2)
            ctx.strokeText("\"Offside\"", canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.strokeText("Press \"g\"", canvas.width/2, canvas.height/4, canvas.width/2)
            if(aiEnabled == false) {
                ctx.strokeText("Toggle Practice Mode", canvas.width/2, 5*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"p\"", canvas.width/2, 3*canvas.height/8, canvas.width/2)
                if(practiceMode && nonPlayableSide == 1) {
                    ctx.strokeText("Play as: Right", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.strokeText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                } else if(practiceMode && nonPlayableSide == 2) {
                    ctx.strokeText("Play as: Left", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.strokeText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                }
            }
            ctx.fillText("Contact me at btdbjsdev@gmail.com to take down the game", canvas.width/2, canvas.height/16, canvas.width)
            ctx.fillText("Selected Map", canvas.width/2, canvas.height/8, canvas.width/2)
            ctx.fillText("\"Offside\"", canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.fillText("Press \"g\"", canvas.width/2, canvas.height/4, canvas.width/2)
            if(aiEnabled == false) {
                ctx.fillText("Toggle Practice Mode", canvas.width/2, 5*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"p\"", canvas.width/2, 3*canvas.height/8, canvas.width/2)
                if(practiceMode && nonPlayableSide == 1) {
                    ctx.fillText("Play as: Right", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.fillText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                } else if(practiceMode && nonPlayableSide == 2) {
                    ctx.fillText("Play as: Left", canvas.width/2, 7*canvas.height/16, canvas.width/2)
                    ctx.fillText("Press \";\"", canvas.width/2, canvas.height/2, canvas.width/2)
                }
            }
            if(bossMode == false) {
                ctx.strokeText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.strokeText("Disabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
                ctx.fillText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.fillText("Disabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
            } else {
                ctx.strokeText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.strokeText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.strokeText("Enabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
                ctx.fillText("Toggle Boss Mode", canvas.width/2, 13*canvas.height/16, canvas.width/2)
                ctx.fillText("Press \"b\"", canvas.width/2, 7*canvas.height/8, canvas.width/2)
                ctx.fillText("Enabled", canvas.width/2, 15*canvas.height/16, canvas.width/2)
            }
        }
        if(aiEnabled) {
            cursor[0].draw()
            cursor[1].draw()
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "24px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText(humanSide == PLAYER_SIDE.left ? "You are Left" : "AI is Left", canvas.width/16, 13*canvas.height/16, canvas.width/5)
            ctx.fillText(humanSide == PLAYER_SIDE.left ? "You are Left" : "AI is Left", canvas.width/16, 13*canvas.height/16, canvas.width/5)
            ctx.strokeText(humanSide == PLAYER_SIDE.right ? "You are Right" : "AI is Right", 15*canvas.width/16, 13*canvas.height/16, canvas.width/5)
            ctx.fillText(humanSide == PLAYER_SIDE.right ? "You are Right" : "AI is Right", 15*canvas.width/16, 13*canvas.height/16, canvas.width/5)
        } else if(practiceMode && nonPlayableSide == 1) {
            cursor[1].draw()
        } else if(practiceMode && nonPlayableSide == 2) {
            cursor[0].draw()
        } else if(practiceMode == false) {
            cursor[0].draw()
            cursor[1].draw()
        }
        if(p1Towers.length == 3 && p2Towers.length == 3 && p1BoostTypes.length == 2 && p2BoostTypes.length == 2 || practiceMode && nonPlayableSide == 1 && p2Towers.length == 3  && p2BoostTypes.length == 2 || practiceMode && nonPlayableSide == 2 && p1Towers.length == 3 && p1BoostTypes.length == 2) {
            gameStarted = true
            cursor[0].x = 5*canvas.width/16
            cursor[0].y = canvas.height/2
            cursor[1].x = 11*canvas.width/16
            cursor[1].y = canvas.height/2
            UITowers.splice(0, UITowers.length)
            timeGameStarted = gameNow()
            layPathObjects()
            if(practiceMode && nonPlayableSide == 1) {
                for(var i = 0; i < 3; i++) {
                    p1Towers[i] = "000cobra.png"
                }
                p1BoostTypes[0] = "slowboost.png"
                p1BoostTypes[1] = "bloonboost.png"
            } else if(practiceMode && nonPlayableSide == 2) {
                for(var i = 0; i < 3; i++) {
                    p2Towers[i] = "000cobra.png"
                }
                p2BoostTypes[0] = "slowboost.png"
                p2BoostTypes[1] = "bloonboost.png"
            }
            if(p1Towers[0] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseDartPrice))
            } else if(p1Towers[0] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseTackPrice))
            } else if(p1Towers[0] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseBombPrice))
            } else if(p1Towers[0] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseIcePrice))
            } else if(p1Towers[0] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseSuperPrice))
            } else if(p1Towers[0] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseFarmPrice))
            } else if(p1Towers[0] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseFarmerPrice))
            } else if(p1Towers[0] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseDartlingPrice))
            } else if(p1Towers[0] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseWizardPrice))
            } else if(p1Towers[0] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseCobraPrice))
            } else if(p1Towers[0] == "000boomer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseBoomerPrice))
            } else if(p1Towers[0] == "000sniper.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseSniperPrice))
            } else if(p1Towers[0] == "000ninja.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseNinjaPrice))
            } else if(p1Towers[0] == "000engi.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseEngiPrice))
            } else if(p1Towers[0] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseBuccaneerPrice))
            } else if(p1Towers[0] == "000mortar.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseMortarPrice))
            } else if(p1Towers[0] == "000sword.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", baseSwordPrice))
            }
            if(p1Towers[1] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseDartPrice))
            } else if(p1Towers[1] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseTackPrice))
            } else if(p1Towers[1] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseBombPrice))
            } else if(p1Towers[1] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseIcePrice))
            } else if(p1Towers[1] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseSuperPrice))
            } else if(p1Towers[1] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseFarmPrice))
            } else if(p1Towers[1] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseFarmerPrice))
            } else if(p1Towers[1] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseDartlingPrice))
            } else if(p1Towers[1] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseWizardPrice))
            } else if(p1Towers[1] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseCobraPrice))
            } else if(p1Towers[1] == "000boomer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseBoomerPrice))
            } else if(p1Towers[1] == "000sniper.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseSniperPrice))
            } else if(p1Towers[1] == "000ninja.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseNinjaPrice))
            } else if(p1Towers[1] == "000engi.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseEngiPrice))
            } else if(p1Towers[1] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseBuccaneerPrice))
            } else if(p1Towers[1] == "000mortar.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseMortarPrice))
            } else if(p1Towers[1] == "000sword.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", baseSwordPrice))
            }
            if(p1Towers[2] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseDartPrice))
            } else if(p1Towers[2] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseTackPrice))
            } else if(p1Towers[2] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseBombPrice))
            } else if(p1Towers[2] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseIcePrice))
            } else if(p1Towers[2] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseSuperPrice))
            } else if(p1Towers[2] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseFarmPrice))
            } else if(p1Towers[2] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseFarmerPrice))
            } else if(p1Towers[2] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseDartlingPrice))
            } else if(p1Towers[2] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseWizardPrice))
            } else if(p1Towers[2] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseCobraPrice))
            } else if(p1Towers[2] == "000boomer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseBoomerPrice))
            } else if(p1Towers[2] == "000sniper.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseSniperPrice))
            } else if(p1Towers[2] == "000ninja.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseNinjaPrice))
            } else if(p1Towers[2] == "000engi.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseEngiPrice))
            } else if(p1Towers[2] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseBuccaneerPrice))
            } else if(p1Towers[2] == "000mortar.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseMortarPrice))
            } else if(p1Towers[2] == "000sword.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", baseSwordPrice))
            }
            if(p2Towers[0] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseDartPrice))
            } else if(p2Towers[0] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseTackPrice))
            } else if(p2Towers[0] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseBombPrice))
            } else if(p2Towers[0] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseIcePrice))
            } else if(p2Towers[0] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseSuperPrice))
            } else if(p2Towers[0] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseFarmPrice))
            } else if(p2Towers[0] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseFarmerPrice))
            } else if(p2Towers[0] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseDartlingPrice))
            } else if(p2Towers[0] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseWizardPrice))
            } else if(p2Towers[0] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseCobraPrice))
            } else if(p2Towers[0] == "000boomer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseBoomerPrice))
            } else if(p2Towers[0] == "000sniper.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseSniperPrice))
            } else if(p2Towers[0] == "000ninja.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseNinjaPrice))
            } else if(p2Towers[0] == "000engi.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseEngiPrice))
            } else if(p2Towers[0] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseBuccaneerPrice))
            } else if(p2Towers[0] == "000mortar.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseMortarPrice))
            } else if(p2Towers[0] == "000sword.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", baseSwordPrice))
            }
            if(p2Towers[1] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseDartPrice))
            } else if(p2Towers[1] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseTackPrice))
            } else if(p2Towers[1] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseBombPrice))
            } else if(p2Towers[1] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseIcePrice))
            } else if(p2Towers[1] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseSuperPrice))
            } else if(p2Towers[1] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseFarmPrice))
            } else if(p2Towers[1] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseFarmerPrice))
            } else if(p2Towers[1] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseDartlingPrice))
            } else if(p2Towers[1] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseWizardPrice))
            } else if(p2Towers[1] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseCobraPrice))
            } else if(p2Towers[1] == "000boomer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseBoomerPrice))
            } else if(p2Towers[1] == "000sniper.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseSniperPrice))
            } else if(p2Towers[1] == "000ninja.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseNinjaPrice))
            } else if(p2Towers[1] == "000engi.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseEngiPrice))
            } else if(p2Towers[1] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseBuccaneerPrice))
            } else if(p2Towers[1] == "000mortar.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseMortarPrice))
            } else if(p2Towers[1] == "000sword.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", baseSwordPrice))
            }

            if(p2Towers[2] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseDartPrice))
            } else if(p2Towers[2] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseTackPrice))
            } else if(p2Towers[2] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseBombPrice))
            } else if(p2Towers[2] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseIcePrice))
            } else if(p2Towers[2] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseSuperPrice))
            } else if(p2Towers[2] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseFarmPrice))
            } else if(p2Towers[2] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseFarmerPrice))
            } else if(p2Towers[2] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseDartlingPrice))
            } else if(p2Towers[2] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseWizardPrice))
            } else if(p2Towers[2] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseCobraPrice))
            } else if(p2Towers[2] == "000boomer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseBoomerPrice))
            } else if(p2Towers[2] == "000sniper.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseSniperPrice))
            } else if(p2Towers[2] == "000ninja.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseNinjaPrice))
            } else if(p2Towers[2] == "000engi.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseEngiPrice))
            } else if(p2Towers[2] == "000buccaneer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseBuccaneerPrice))
            } else if(p2Towers[2] == "000mortar.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseMortarPrice))
            } else if(p2Towers[2] == "000sword.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", baseSwordPrice))
            }

            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2, 25, "red.png", "x8", 8, 1, 20, 1, 100, 2, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/12, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/12, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/6, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/6, 25, "black.png", "x3", 3, 6, 42, 2.1, 420, 6, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/4, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/4, 25, "rainbow.png", "x1", 1, 8, 70, 3.5, 350, 12, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/3, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/3, 25, "moab5.png", "x1", 1, 218, 2000, 0, 3000, 18, 1))

            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2, 25, "red.png", "x8", 8, 1, 20, 1, 100, 2, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/12, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/12, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/6, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/6, 25, "black.png", "x3", 3, 6, 42, 2.1, 420, 6, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/4, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/4, 25, "rainbow.png", "x1", 1, 8, 70, 3.5, 350, 12, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/3, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/3, 25, "moab5.png", "x1", 1, 218, 2000, 0, 3000, 18, 2))

            boostIcons.push(new BoostIcons(canvas.width/24, 15*canvas.height/16, 25, "towerboost.png"))
            boostIcons.push(new BoostIcons(canvas.width/12, 15*canvas.height/16, 25, "bloonboost.png"))
            boostIcons.push(new BoostIcons(22*canvas.width/24, 15*canvas.height/16, 25, "towerboost.png"))
            boostIcons.push(new BoostIcons(23*canvas.width/24, 15*canvas.height/16, 25, "bloonboost.png"))
            if(practiceMode && nonPlayableSide == 1) {
                p1money = Infinity
                p1eco = Infinity
                p1lives = Infinity
            } else if(practiceMode && nonPlayableSide == 2) {
                p2money = Infinity
                p2eco = Infinity
                p2lives = Infinity
            }
            setInterval(function() {
                money += eco
                p1money += p1eco
                p2money += p2eco
                p1CashGenWithEco += p1eco
                p2CashGenWithEco += p2eco
            }, 6000)
        }
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.font = "20px Luckiest Guy"
    } else if(gameOver == false) {
        nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
        ctx.fillStyle = "green"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if(mapNumber == 0) {
            ctx.lineWidth = 25
            ctx.strokeStyle = "goldenrod"
            ctx.beginPath()
            ctx.moveTo(canvas.width/4 + canvas.width/16, 0)
            ctx.lineTo(canvas.width/4 + canvas.width/16, canvas.height/4)
            ctx.lineTo(canvas.width/8 + canvas.width/16, canvas.height/4)
            ctx.lineTo(canvas.width/8 + canvas.width/16, canvas.height/2)
            ctx.lineTo(3*canvas.width/8 + canvas.width/16, canvas.height/2)
            ctx.lineTo(3*canvas.width/8 + canvas.width/16, 3*canvas.height/4)
            ctx.lineTo(canvas.width/4 + canvas.width/16, 3*canvas.height/4)
            ctx.lineTo(canvas.width/4 + canvas.width/16, canvas.height)
            ctx.moveTo(canvas.width/4 + canvas.width/16, 0)
            ctx.closePath()
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(canvas.width/4 + 7*canvas.width/16, 0)
            ctx.lineTo(canvas.width/4 + 7*canvas.width/16, canvas.height/4)
            ctx.lineTo(canvas.width/8 + 7*canvas.width/16, canvas.height/4)
            ctx.lineTo(canvas.width/8 + 7*canvas.width/16, canvas.height/2)
            ctx.lineTo(3*canvas.width/8 + 7*canvas.width/16, canvas.height/2)
            ctx.lineTo(3*canvas.width/8 + 7*canvas.width/16, 3*canvas.height/4)
            ctx.lineTo(canvas.width/4 + 7*canvas.width/16, 3*canvas.height/4)
            ctx.lineTo(canvas.width/4 + 7*canvas.width/16, canvas.height)
            ctx.moveTo(canvas.width/4 + 7*canvas.width/16, 0)
            ctx.closePath()
            ctx.stroke()

            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.beginPath()
            ctx.moveTo(canvas.width/2, 0)
            ctx.lineTo(canvas.width/2, canvas.height)
            ctx.closePath()
            ctx.stroke()
        } else if(mapNumber == 1) {
            ctx.lineWidth = 25
            ctx.strokeStyle = "yellowgreen"
            ctx.beginPath()
            ctx.moveTo(canvas.width/2*3/4 + canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width*5/12*3/4 + canvas.width/8, canvas.height/8)
            ctx.lineTo(canvas.width/3*3/4 + canvas.width/8, canvas.height/4)
            ctx.lineTo(canvas.width*5/12*3/4 + canvas.width/8, canvas.height*11/16)
            ctx.lineTo(canvas.width/3*3/4 + canvas.width/8, canvas.height*7/8)
            ctx.lineTo(canvas.width/4*3/4 + canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width/6*3/4 + canvas.width/8, canvas.height*7/8)
            ctx.lineTo(canvas.width/12*3/4 + canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width/8, canvas.height/2)
            ctx.moveTo(canvas.width/2*3/4 + canvas.width/8, canvas.height/2)
            ctx.closePath()
            ctx.stroke()

            ctx.beginPath()

            ctx.moveTo(canvas.width-canvas.width/2*3/4 - canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width-canvas.width*5/12*3/4 - canvas.width/8, canvas.height/8)
            ctx.lineTo(canvas.width-canvas.width/3*3/4 - canvas.width/8, canvas.height/4)
            ctx.lineTo(canvas.width-canvas.width*5/12*3/4 - canvas.width/8, canvas.height*11/16)
            ctx.lineTo(canvas.width-canvas.width/3*3/4 - canvas.width/8, canvas.height*7/8)
            ctx.lineTo(canvas.width-canvas.width/4*3/4 - canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width-canvas.width/6*3/4 - canvas.width/8, canvas.height*7/8)
            ctx.lineTo(canvas.width-canvas.width/12*3/4 - canvas.width/8, canvas.height/2)
            ctx.lineTo(canvas.width-canvas.width/8, canvas.height/2)
            ctx.moveTo(canvas.width-canvas.width/2*3/4 - canvas.width/8, canvas.height/2)

            ctx.closePath()
            ctx.stroke()

            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.beginPath()
            ctx.moveTo(canvas.width/2, 0)
            ctx.lineTo(canvas.width/2, canvas.height)
            ctx.closePath()
            ctx.stroke()
        }

        for(var i = 0; i < towers.length; i++) {
            if(towers[i] && towers[i].path1Cost[0] % 1 != 0) {
                towers[i].path1Cost[0] = "Max"
            }
            if(towers[i] && towers[i].path2Cost[0] % 1 != 0) {
                towers[i].path2Cost[0] = "Max"
            }
        }
        for(var i = 0; i < displayBloons.length; i++) {
            if(displayBloons[i].playerSide == 1) {
                if(displayBloons[i].roundUnlock > Math.trunc(p1BloonSendRound)) {
                    displayBloons[i].image = "locked.png"
                } else {
                    displayBloons[i].image = displayBloons[i].internalImage
                }
            } else {
                if(displayBloons[i].roundUnlock > Math.trunc(p2BloonSendRound)) {
                    displayBloons[i].image = "locked.png"
                } else {
                    displayBloons[i].image = displayBloons[i].internalImage
                }
            }
        }

        if(p1BloonSendRound >= 2 && p1BloonSendRound < 20) {
            displayBloons[0] = new DisplayBloons(displayBloons[0].x, displayBloons[0].y, 25, "red.png", "x8", 8, 1, 20, 1, 100, 2, 1)
        } else if(p1BloonSendRound >= 20) {
            displayBloons[0] = new DisplayBloons(displayBloons[0].x, displayBloons[0].y, 25, "green.png", "x5", 5, 3, 35, 1.4, 80, 2, 1)
        }
        if(p1BloonSendRound >= 2 && p1BloonSendRound < 4) {
            displayBloons[1] = new DisplayBloons(displayBloons[1].x, displayBloons[1].y, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 1)
        } else if(p1BloonSendRound >= 4 && p1BloonSendRound < 22) {
            displayBloons[1] = new DisplayBloons(displayBloons[1].x, displayBloons[1].y, 25, "blue.png", "x6", 6, 2, 24, 1.1, 100, 2, 1)
        } else if(p1BloonSendRound >= 22) {
            displayBloons[1] = new DisplayBloons(displayBloons[1].x, displayBloons[1].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 2, 1)
        }
        if(p1BloonSendRound >= 3 && p1BloonSendRound < 6) {
            displayBloons[2] = new DisplayBloons(displayBloons[2].x, displayBloons[2].y, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 1)
        } else if(p1BloonSendRound >= 6 && p1BloonSendRound < 20) {
            displayBloons[2] = new DisplayBloons(displayBloons[2].x, displayBloons[2].y, 25, "green.png", "x5", 5, 3, 35, 1.4, 80, 3, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 25) {
            displayBloons[2] = new DisplayBloons(displayBloons[2].x, displayBloons[2].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 3, 1)
        } else if(p1BloonSendRound >= 30) {
            displayBloons[2] = new DisplayBloons(displayBloons[2].x, displayBloons[2].y, 25, "pink.png", "x10", 10, 5, 300, 8, 25, 3, 1)
        }
        if(p1BloonSendRound >= 4 && p1BloonSendRound < 8) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 1)
        } else if(p1BloonSendRound >= 8 && p1BloonSendRound < 22) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 4, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound < 25) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 4, 1)
        } else if(p1BloonSendRound >= 25) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "black.png", "x5", 5, 6, 115, 2.9, 35, 4, 1)
        }
        if(p1BloonSendRound >= 5 && p1BloonSendRound < 10) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 1)
        } else if(p1BloonSendRound >= 10 && p1BloonSendRound < 20) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 5, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 23) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "zebra.png", "x3", 3, 7, 220, 6, 80, 5, 1)
        } else if(p1BloonSendRound >= 23) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "zebra.png", "x30", 30, 7, 2400, 22, 1000/30, 5, 1)
        }
        if(p1BloonSendRound >= 6 && p1BloonSendRound < 12) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "black.png", "x3", 3, 6, 42, 2.1, 420, 6, 1)
        } else if(p1BloonSendRound >= 12 && p1BloonSendRound < 22) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 6, 1)
        } else if(p1BloonSendRound >= 22) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "rainbow.png", "x4", 4, 8, 550, 9, 100, 6, 1)
        }
        if(p1BloonSendRound >= 9 && p1BloonSendRound < 13) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 1)
        } else if(p1BloonSendRound >= 13 && p1BloonSendRound < 20) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "zebra.png", "x3", 3, 7, 220, 6, 80, 9, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 24) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x2", 2, 18, 700, 5, 110, 9, 1)
        } else if(p1BloonSendRound >= 24) {
            if(round <= 50) {
                displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x20", 20, 18, 3400, 0, 40, 9, 1)
            } else {
                displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x20", 20, 68, 3400, 0, 40, 9, 1)
            }
        }
        if(p1BloonSendRound >= 12 && p1BloonSendRound < 15) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "rainbow.png", "x1", 1, 8, 120, 3.5, 700, 12, 1)
        } else if(p1BloonSendRound >= 15 && p1BloonSendRound < 22) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "rainbow.png", "x4", 4, 8, 550, 9, 100, 12, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound < 25) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x1", 1, 218, 1800, 0, 500, 12, 1)
        } else if(p1BloonSendRound == 25) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x7", 7, 218, 4000, -100, 200/1.5, 12, 1)
        } else if(p1BloonSendRound > 25) {
            if(round <= 50) {
                displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x7", 7, 218, 4000, -100, 200/1.5, 12, 1)
            } else {
                displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x7", 7, 68 + Math.ceil(200 * 1.05 ** (round - 50)), 4000, -100, 200/1.5, 12, 1)
            }
        }
        if(p1BloonSendRound >= 15 && p1BloonSendRound < 18) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 1)
        } else if(p1BloonSendRound >= 18 && p1BloonSendRound < 20) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "ceramic5.png", "x2", 2, 18, 700, 5, 110, 15, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 22) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 3200, -50, 3500, 15, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound <= 25) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 2600, -50, 600, 15, 1)
        } else if(p1BloonSendRound > 25 && p1BloonSendRound < 27) {
            if(round <= 50) {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 2600, -50, 600, 15, 1)
            } else {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 2600, -50, 600, 15, 1)
            }
        } else if(p1BloonSendRound >= 27) {
            if(round <= 50) {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x5", 5, 918, 7000, -300, 240, 15, 1)
            } else {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x5", 5, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 7000, -300, 240, 15, 1)
            }
        }
        if(p1BloonSendRound >= 18 && p1BloonSendRound < 20) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "moab5.png", "x1", 1, 218, 2000, 0, 3000, 18, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 22) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "moab5.png", "x1", 1, 218, 1800, 0, 500, 18, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound < 24) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 4918, 11000, -200, 6000, 18, 1)
        } else if(p1BloonSendRound >= 24 && p1BloonSendRound <= 25) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 4918, 10000, -200, 1000, 18, 1)
        } else if(p1BloonSendRound > 25) {
            if(round <= 50) {
                displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 4918, 9000, -200, 1000, 18, 1)
            } else {
                displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 9000, -200, 1000, 18, 1)
            }
        }
        if(p2BloonSendRound >= 2 && p2BloonSendRound < 20) {
            displayBloons[10] = new DisplayBloons(displayBloons[10].x, displayBloons[10].y, 25, "red.png", "x8", 8, 1, 20, 1, 100, 2, 2)
        } else if(p2BloonSendRound >= 20) {
            displayBloons[10] = new DisplayBloons(displayBloons[10].x, displayBloons[10].y, 25, "green.png", "x5", 5, 3, 35, 1.4, 80, 2, 2)
        }
        if(p2BloonSendRound >= 2 && p2BloonSendRound < 4) {
            displayBloons[11] = new DisplayBloons(displayBloons[11].x, displayBloons[11].y, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 2)
        } else if(p2BloonSendRound >= 4 && p2BloonSendRound < 22) {
            displayBloons[11] = new DisplayBloons(displayBloons[11].x, displayBloons[11].y, 25, "blue.png", "x6", 6, 2, 24, 1.1, 100, 2, 2)
        } else if(p2BloonSendRound >= 22) {
            displayBloons[11] = new DisplayBloons(displayBloons[11].x, displayBloons[11].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 2, 2)
        }
        if(p2BloonSendRound >= 3 && p2BloonSendRound < 6) {
            displayBloons[12] = new DisplayBloons(displayBloons[12].x, displayBloons[12].y, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 2)
        } else if(p2BloonSendRound >= 6 && p2BloonSendRound < 20) {
            displayBloons[12] = new DisplayBloons(displayBloons[12].x, displayBloons[12].y, 25, "green.png", "x5", 5, 3, 35, 1.4, 80, 3, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 25) {
            displayBloons[12] = new DisplayBloons(displayBloons[12].x, displayBloons[12].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 3, 2)
        } else if(p2BloonSendRound >= 30) {
            displayBloons[12] = new DisplayBloons(displayBloons[12].x, displayBloons[12].y, 25, "pink.png", "x10", 10, 5, 300, 8, 25, 3, 2)
        }
        if(p2BloonSendRound >= 4 && p2BloonSendRound < 8) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 2)
        } else if(p2BloonSendRound >= 8 && p2BloonSendRound < 22) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 4, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound < 25) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 4, 2)
        } else if(p2BloonSendRound >= 25) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "black.png", "x5", 5, 6, 115, 2.9, 35, 4, 2)
        }
        if(p2BloonSendRound >= 5 && p2BloonSendRound < 10) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 2)
        } else if(p2BloonSendRound >= 10 && p2BloonSendRound < 20) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 5, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 23) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "zebra.png", "x3", 3, 7, 220, 6, 80, 5, 2)
        } else if(p2BloonSendRound >= 23) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "zebra.png", "x30", 30, 7, 2400, 22, 1000/30, 5, 2)
        }
        if(p2BloonSendRound >= 6 && p2BloonSendRound < 12) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "black.png", "x3", 3, 6, 42, 2.1, 420, 6, 2)
        } else if(p2BloonSendRound >= 12 && p2BloonSendRound < 22) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 6, 2)
        } else if(p2BloonSendRound >= 22) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "rainbow.png", "x4", 4, 8, 550, 9, 100, 6, 2)
        }
        if(p2BloonSendRound >= 9 && p2BloonSendRound < 13) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 2)
        } else if(p2BloonSendRound >= 13 && p2BloonSendRound < 20) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "zebra.png", "x3", 3, 7, 220, 6, 80, 9, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 24) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x2", 2, 18, 700, 5, 110, 9, 2)
        } else if(p2BloonSendRound >= 24) {
            if(round <= 50) {
                displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x20", 20, 18, 3400, 0, 40, 9, 2)
            } else {
                displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x20", 20, 68, 3400, 0, 40, 9, 2)
            }
        }
        if(p2BloonSendRound >= 12 && p2BloonSendRound < 15) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "rainbow.png", "x1", 1, 8, 120, 3.5, 700, 12, 2)
        } else if(p2BloonSendRound >= 15 && p2BloonSendRound < 22) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "rainbow.png", "x4", 4, 8, 550, 9, 100, 12, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound < 25) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x1", 1, 218, 1800, 0, 500, 12, 2)
        } else if(p2BloonSendRound == 25) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x7", 7, 218, 4000, -100, 200/1.5, 12, 2)
        } else if(p2BloonSendRound > 25) {
            if(round <= 50) {
                displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x7", 7, 218, 4000, -100, 200/1.5, 12, 2)
            } else {
                displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x7", 7, 68 + Math.ceil(200 * 1.05 ** (round - 50)), 4000, -100, 200/1.5, 12, 2)
            }
        }
        if(p2BloonSendRound >= 15 && p2BloonSendRound < 18) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 2)
        } else if(p2BloonSendRound >= 18 && p2BloonSendRound < 20) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "ceramic5.png", "x2", 2, 18, 700, 5, 110, 15, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 22) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 3200, -50, 3500, 15, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound <= 25) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 2600, -50, 600, 15, 2)
        } else if(p2BloonSendRound > 25 && p2BloonSendRound < 27) {
            if(round <= 50) {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 2600, -50, 600, 15, 2)
            } else {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 2600, -50, 600, 15, 2)
            }
        } else if(p2BloonSendRound >= 27) {
            if(round <= 50) {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x5", 5, 918, 7000, -300, 240, 15, 2)
            } else {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x5", 5, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 7000, -300, 240, 15, 2)
            }
        }
        if(p2BloonSendRound >= 18 && p2BloonSendRound < 20) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "moab5.png", "x1", 1, 218, 2000, 0, 3000, 18, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 22) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "moab5.png", "x1", 1, 218, 1800, 0, 500, 18, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound < 24) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 11000, -200, 6000, 18, 2)
        } else if(p2BloonSendRound >= 24 && p2BloonSendRound <= 25) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 10000, -200, 1000, 18, 2)
        } else if(p2BloonSendRound > 25) {
            if(round <= 50) {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 9000, -200, 1000, 18, 2)
            } else {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 9000, -200, 1000, 18, 2)
            }
        }

        var p1AutoEcoQueued = tickAutoEcoForSide(PLAYER_SIDE.left)
        var p2AutoEcoQueued = tickAutoEcoForSide(PLAYER_SIDE.right)
        if(p1AutoEcoQueued > 0) {
            keyCooldowns[70] = gameNow()
        }
        if(p2AutoEcoQueued > 0) {
            keyCooldowns[72] = gameNow()
        }

        if(roundReady && endOfRoundGiven == false && gameNow() - timeRoundEnded >= 6000) {
            for(var i = 0; i < towers.length; i++) {
                towers[i].upgradedMidRound = false
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                    towers[i].towerVar += Math.round((800 + 100 * towers[i].path1Upgrades) * ((3/28000) * towers[i].towerVar + 1))
                    if(towers[i].towerVar > 14000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 14000
                                p1TotalCashGenerated += 14000
                            } else {
                                p2money += 14000
                                p2TotalCashGenerated += 14000
                            }
                            towers[i].popCount += 14000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 14000))
                        } else {
                            towers[i].towerVar = 14000
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                    towers[i].towerVar += Math.round((800 + 100 * towers[i].path1Upgrades) * ((3/28000) * towers[i].towerVar + 1))
                    if(towers[i].towerVar > 20000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 20000
                                p1TotalCashGenerated += 20000
                            } else {
                                p2money += 20000
                                p2TotalCashGenerated += 20000
                            }
                            towers[i].popCount += 20000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 20000))
                        } else {
                            towers[i].towerVar = 20000
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                    towers[i].towerVar += Math.round((800 + 100 * towers[i].path1Upgrades) * ((3/28000) * towers[i].towerVar + 1))
                    if(towers[i].towerVar > 30000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 30000
                                p1TotalCashGenerated += 30000
                            } else {
                                p2money += 30000
                                p2TotalCashGenerated += 30000
                            }
                            towers[i].popCount += 30000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 30000))
                        } else {
                            towers[i].towerVar = 30000
                        }
                    }
                    if(towers[i].playerSide == 1) {
                        p1eco += 200
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 200, "eco"))
                    } else {
                        p2eco += 200
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 200, "eco"))
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path3Upgrades == 3) {
                    if(towers[i].playerSide == 1) {
                        if(towers[i].path2Upgrades == 2) {
                            p1money += 375
                            p1TotalCashGenerated += 375
                            towers[i].popCount += 375
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 375))
                        } else {
                            p1money += 300
                            p1TotalCashGenerated += 300
                            towers[i].popCount += 300
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 300))
                        }
                    } else {
                        if(towers[i].path2Upgrades == 2) {
                            p2money += 375
                            p2TotalCashGenerated += 375
                            towers[i].popCount += 375
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 375))
                        } else {
                            p2money += 300
                            p2TotalCashGenerated += 300
                            towers[i].popCount += 300
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 300))
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path3Upgrades == 4) {
                    if(towers[i].playerSide == 1) {
                        if(towers[i].path2Upgrades == 2) {
                            p1money += 2500
                            p1TotalCashGenerated += 2500
                            towers[i].popCount += 2500
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2500))
                        } else {
                            p1money += 2000
                            p1TotalCashGenerated += 2000
                            towers[i].popCount += 2000
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2000))
                        }
                    } else {
                        if(towers[i].path2Upgrades == 2) {
                            p2money += 2500
                            p2TotalCashGenerated += 2500
                            towers[i].popCount += 2500
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2500))
                        } else {
                            p2money += 2000
                            p2TotalCashGenerated += 2000
                            towers[i].popCount += 2000
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2000))
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path3Upgrades == 5) {
                    if(towers[i].playerSide == 1) {
                        if(towers[i].path2Upgrades == 2) {
                            p1money += 12500
                            p1TotalCashGenerated += 12500
                            towers[i].popCount += 12500
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 12500))
                        } else {
                            p1money += 10000
                            p1TotalCashGenerated += 10000
                            towers[i].popCount += 10000
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 10000))
                        }
                    } else {
                        if(towers[i].path2Upgrades == 2) {
                            p2money += 12500
                            p2TotalCashGenerated += 12500
                            towers[i].popCount += 12500
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 12500))
                        } else {
                            p2money += 10000
                            p2TotalCashGenerated += 10000
                            towers[i].popCount += 10000
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 10000))
                        }
                    }
                } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 5) {
                    var victimSide = towers[i].playerSide == 1 ? 2 : 1
                    var victimMoney = victimSide == 1 ? p1money : p2money
                    var victimEco = victimSide == 1 ? p1eco : p2eco
                    var stolenCash = Math.min(5000, Math.max(0, Math.round(victimMoney * 0.1)))
                    var stolenEco = Math.min(100, Math.max(0, Math.round(victimEco * 0.1)))
                    var cashPayout = stolenCash + 70
                    var ecoPayout = stolenEco + 4
                    if(towers[i].playerSide == 1) {
                        p1money += cashPayout
                        p2money -= stolenCash
                        p1eco += ecoPayout
                        p2eco -= stolenEco
                        p1TotalCashGenerated += cashPayout
                    } else {
                        p2money += cashPayout
                        p1money -= stolenCash
                        p2eco += ecoPayout
                        p1eco -= stolenEco
                        p2TotalCashGenerated += cashPayout
                    }
                    towers[i].cashGenerated += cashPayout
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, cashPayout))
                    moneyText.push(new MiscText(towers[i].x, towers[i].y, ecoPayout, "eco"))
                } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 1) {
                    if(towers[i].playerSide == 1) {
                        p1money += 70
                        towers[i].cashGenerated += 70
                        p1TotalCashGenerated += 70
                    } else {
                        p2money += 70
                        towers[i].cashGenerated += 70
                        p2TotalCashGenerated += 70
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 70))
                } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades >= 2 && towers[i].path2Upgrades < 5) {
                    if(towers[i].playerSide == 1) {
                        p1money += 70
                        p1eco += 4
                        towers[i].cashGenerated += 70
                        p1TotalCashGenerated += 70
                    } else {
                        p2money += 70
                        p2eco += 4
                        towers[i].cashGenerated += 70
                        p2TotalCashGenerated += 70
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 70))
                    moneyText.push(new MiscText(towers[i].x, towers[i].y, 4, "eco"))
                } else if(towers[i].towerType == "buccaneer" && towers[i].path3Upgrades == 3) {
                    if(towers[i].playerSide == 1) {
                        p1money += 300
                        towers[i].cashGenerated += 300
                        p1TotalCashGenerated += 300
                    } else {
                        p2money += 300
                        towers[i].cashGenerated += 300
                        p2TotalCashGenerated += 300
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 300))
                } else if(towers[i].towerType == "buccaneer" && towers[i].path3Upgrades == 4) {
                    var tradeEmpirePresent = false
                    var tradeEmpireBuff = 1
                    for(var k = 0; k < towers.length; k++) {
                        if(towers[k].towerType == "buccaneer" && towers[k].path3Upgrades == 5 && towers[k].playerSide == towers[i].playerSide) {
                            tradeEmpirePresent = true
                        }
                    }
                    if(tradeEmpirePresent) {
                        for(var k = 0; k < towers.length; k++) {
                            if(towers[k].towerType == "buccaneer" && towers[k].path3Upgrades >= 4 && towers[k] != towers[i] && towers[k].playerSide == towers[i].playerSide && tradeEmpireBuff < 1.5) {
                                tradeEmpireBuff += 0.05
                            }
                        }
                    }
                    if(towers[i].playerSide == 1) {
                        p1money += 700 * tradeEmpireBuff
                        towers[i].cashGenerated += 700 * tradeEmpireBuff
                        p1TotalCashGenerated += 700 * tradeEmpireBuff
                    } else {
                        p2money += 700 * tradeEmpireBuff
                        towers[i].cashGenerated += 700 * tradeEmpireBuff
                        p2TotalCashGenerated += 700 * tradeEmpireBuff
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 700 * tradeEmpireBuff))
                } else if(towers[i].towerType == "buccaneer" && towers[i].path3Upgrades == 5) {
                    var tradeEmpirePresent = false
                    var tradeEmpireBuff = 1
                    for(var k = 0; k < towers.length; k++) {
                        if(towers[k].towerType == "buccaneer" && towers[k].path3Upgrades == 5 && towers[k].playerSide == towers[i].playerSide) {
                            tradeEmpirePresent = true
                        }
                    }
                    if(tradeEmpirePresent) {
                        for(var k = 0; k < towers.length; k++) {
                            if(towers[k].towerType == "buccaneer" && towers[k].path3Upgrades >= 4 && towers[k] != towers[i] && towers[k].playerSide == towers[i].playerSide && tradeEmpireBuff < 1.5) {
                                tradeEmpireBuff += 0.05
                            }
                        }
                    }
                    if(towers[i].playerSide == 1) {
                        p1money += 2000 * tradeEmpireBuff
                        towers[i].cashGenerated += 2000 * tradeEmpireBuff
                        p1TotalCashGenerated += 2000 * tradeEmpireBuff
                    } else {
                        p2money += 2000 * tradeEmpireBuff
                        towers[i].cashGenerated += 2000 * tradeEmpireBuff
                        p2TotalCashGenerated += 2000 * tradeEmpireBuff
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2000 * tradeEmpireBuff))
                }
            }
            endOfRoundGiven = true
        }

        if(autostart) {
            if(roundReady && gameNow() - timeRoundEnded >= 6000) {
                round += 2
                if(round != 2) {
                    images2.push(new Images(canvas.width/2, canvas.height/2, canvas.height/12, "", gameNow() + 1000, "Round " + Math.floor(round/2).toLocaleString()))
                }
                if(round == 40 && p1SelectedBloon > 1 && p1SelectedBloon % 2 == 0) {
                    p1SelectedBloon -= 2
                } else if(round == 44 && p1SelectedBloon > 1 && p1SelectedBloon % 2 == 1) {
                    p1SelectedBloon -= 2
                }
                if(round == 40 && p2SelectedBloon > 11 && p2SelectedBloon % 2 == 0) {
                    p2SelectedBloon -= 2
                } else if(round == 44 && p2SelectedBloon > 11 && p2SelectedBloon % 2 == 1) {
                    p2SelectedBloon -= 2
                }
                moabCount = Math.trunc(Math.random() * (round - 60) + 1)
                bfbCount = Math.trunc(Math.random() * (round - 70) + 1)
                zomgCount = Math.trunc(Math.random() * (round - 80) + 1)
                if(bossMode == true && round % 20 == 0 && round > 20 && practiceMode == false) {
                    bloons.push(new Boss(-1000, 0, 25, 0, 1, 1, 1, 4000 * 4 ** (round / 20 - 1), 1, false, true, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Boss(-1000, 0, 25, 0, 1, 1, 1, 4000 * 4 ** (round / 20 - 1), 2, false, true, 0, 0, 0, 0, 0, 0))
                } else if(bossMode == true && round % 20 == 0 && round > 20 && practiceMode == true && nonPlayableSide == 1) {
                    bloons.push(new Boss(-1000, 0, 25, 0, 1, 1, 1, 4000 * 4 ** (round / 20 - 1), 2, false, true, 0, 0, 0, 0, 0, 0))
                } else if(bossMode == true && round % 20 == 0 && round > 20 && practiceMode == true && nonPlayableSide == 2) {
                    bloons.push(new Boss(-1000, 0, 25, 0, 1, 1, 1, 4000 * 4 ** (round / 20 - 1), 1, false, true, 0, 0, 0, 0, 0, 0))
                }
                for(var i = 0; i < towers.length; i++) {
                    if(towers[i].towerType == "farm") {
                        towers[i].bananaCounter = 1
                    }
                }
                if(round == 41) {
                    moneyFactor *= 0.5
                } else if(round == 51) {
                    moneyFactor *= 0.5
                } else if(round == 61) {
                    moneyFactor *= 0.5
                } else if(round == 71) {
                    moneyFactor *= 0.5
                } else if(round == 81 && bossMode == false) {
                    if(mastery == false) {
                        this.alert("Congratulations for beating the main 80 rounds! For an extra challenge, press \"m\" during the pregame!\n For another challenge, press \"b\" during the pregame!")
                    } else {
                        this.alert("Congratulations for beating the main 80 rounds! For an extra challenge... just challenge yourself.")
                        this.alert("Seriously, you beat all 80 mastery rounds? I never play tested for it to be beatable!")
                        this.alert("What type of towers even can handle this?")
                        this.alert("Every single ceramic rush round is literally not fair, how did you deal with those?")
                        this.alert("It never really was a good idea to make ALL ceramics into MOABs, which have 20 times the health and spew out even more ceramics after death.")
                        this.alert("Do you like ZOMGs? If you do proceed to freeplay there will be a lot of them.")
                        this.alert("Yes, I do understand that beating the final round is a little anticlimactic, there are definitely rounds which have more ZOMGs than this.")
                        this.alert("But I was just copying what Bloons TD 5 did in its mastery mode.")
                        this.alert("I guess its time to stop typing, I already wrote a whole monologue which was completely unnecessary.")
                        this.alert("Instead of simply just putting a grand congratulations, I will leave you off with this:")
                        this.alert("Maybe this is a sign to stop playing this game.")
                    }
                } else if(round == 91) {
                    moneyFactor *= 0.5
                }
                counter = 0
                timeRoundEnded = 0
                roundReady = false
                bloonsToSpawn = false
                endOfRoundGiven = false
                spawnRound()
            }
        }

        p1BloonSendRound = round/2
        p2BloonSendRound = round/2
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 4 && towers[i].playerSide == 1) {
                p1BloonSendRound++
            } else if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 4 && towers[i].playerSide == 2) {
                p2BloonSendRound++
            }
        }

        var bossCountP1 = 0
        var bossCountP2 = 0
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].isBoss && bloons[i].playerSide == 1) {
                bossCountP1++
            } else if(bloons[i].isBoss && bloons[i].playerSide == 2) {
                bossCountP2++
            }
        }
        if(bossCountP1 > 1) {
            p1lives = 0
        }
        if(bossCountP2 > 1) {
            p2lives = 0
        }

        var p1AIBloonCount = 0
        var p2AIBloonCount = 0
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].isAI && bloons[i].playerSide == 1) {
                p1AIBloonCount++
            } else if(bloons[i].isAI && bloons[i].playerSide == 2) {
                p2AIBloonCount++
            }
        }

        var firstNaturalSideFinished = false
        if(practiceMode && nonPlayableSide == 1) {
            firstNaturalSideFinished = p2AIBloonCount == 0
        } else if(practiceMode && nonPlayableSide == 2) {
            firstNaturalSideFinished = p1AIBloonCount == 0
        } else if(practiceMode == false) {
            firstNaturalSideFinished = p1AIBloonCount == 0 || p2AIBloonCount == 0
        }

        if(firstNaturalSideFinished && bloonsToSpawn) {
            roundReady = true
            if(timeRoundEnded == 0) {
                timeRoundEnded = gameNow()
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(p1Boost1Expires > gameNow() - 12000 && towers[i].playerSide == 1 && p1BoostTypes[0] == "towerboost.png") {
                towers[i].towerBoosted = 1/1.8
            } else if(p1Boost1Expires <= gameNow() - 12000 && towers[i].playerSide == 1 && p1BoostTypes[0] == "towerboost.png") {
                towers[i].towerBoosted = 1
            }
            if(p1Boost1Expires > gameNow() - 12000 && towers[i].playerSide == 2 && p1BoostTypes[0] == "slowboost.png") {
                towers[i].slowSabotaged = 1.2
            } else if(p1Boost1Expires <= gameNow() - 12000 && towers[i].playerSide == 2 && p1BoostTypes[0] == "slowboost.png") {
                towers[i].slowSabotaged = 1
            }
            if(p1Boost2Expires > gameNow() - 12000 && towers[i].playerSide == 1 && p1BoostTypes[1] == "towerboost.png") {
                towers[i].towerBoosted = 1/1.8
            } else if(p1Boost2Expires <= gameNow() - 12000 && towers[i].playerSide == 1 && p1BoostTypes[1] == "towerboost.png") {
                towers[i].towerBoosted = 1
            }
            if(p1Boost2Expires > gameNow() - 12000 && towers[i].playerSide == 2 && p1BoostTypes[1] == "slowboost.png") {
                towers[i].slowSabotaged = 1.2
            } else if(p1Boost2Expires <= gameNow() - 12000 && towers[i].playerSide == 2 && p1BoostTypes[1] == "slowboost.png") {
                towers[i].slowSabotaged = 1
            }
            if(p2Boost1Expires > gameNow() - 12000 && towers[i].playerSide == 2 && p2BoostTypes[0] == "towerboost.png") {
                towers[i].towerBoosted = 1/1.8
            } else if(p2Boost1Expires <= gameNow() - 12000 && towers[i].playerSide == 2 && p2BoostTypes[0] == "towerboost.png") {
                towers[i].towerBoosted = 1
            }
            if(p2Boost1Expires > gameNow() - 12000 && towers[i].playerSide == 1 && p2BoostTypes[0] == "slowboost.png") {
                towers[i].slowSabotaged = 1.2
            } else if(p2Boost1Expires <= gameNow() - 12000 && towers[i].playerSide == 1 && p2BoostTypes[0] == "slowboost.png") {
                towers[i].slowSabotaged = 1
            }
            if(p2Boost2Expires > gameNow() - 12000 && towers[i].playerSide == 2 && p2BoostTypes[1] == "towerboost.png") {
                towers[i].towerBoosted = 1/1.8
            } else if(p2Boost2Expires <= gameNow() - 12000 && towers[i].playerSide == 2 && p2BoostTypes[1] == "towerboost.png") {
                towers[i].towerBoosted = 1
            }
            if(p2Boost2Expires > gameNow() - 12000 && towers[i].playerSide == 1 && p2BoostTypes[1] == "slowboost.png") {
                towers[i].slowSabotaged = 1.2
            } else if(p2Boost2Expires <= gameNow() - 12000 && towers[i].playerSide == 1 && p2BoostTypes[1] == "slowboost.png") {
                towers[i].slowSabotaged = 1
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            if(p1Boost1Expires > gameNow() - 12000 && subtowers[i].playerSide == 1 && p1BoostTypes[0] == "towerboost.png") {
                subtowers[i].towerBoosted = 1/1.8
            } else if(p1Boost1Expires <= gameNow() - 12000 && subtowers[i].playerSide == 1 && p1BoostTypes[0] == "towerboost.png") {
                subtowers[i].towerBoosted = 1
            }
            if(p1Boost1Expires > gameNow() - 12000 && subtowers[i].playerSide == 2 && p1BoostTypes[0] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1.2
            } else if(p1Boost1Expires <= gameNow() - 12000 && subtowers[i].playerSide == 2 && p1BoostTypes[0] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1
            }
            if(p1Boost2Expires > gameNow() - 12000 && subtowers[i].playerSide == 1 && p1BoostTypes[1] == "towerboost.png") {
                subtowers[i].towerBoosted = 1/1.8
            } else if(p1Boost2Expires <= gameNow() - 12000 && subtowers[i].playerSide == 1 && p1BoostTypes[1] == "towerboost.png") {
                subtowers[i].towerBoosted = 1
            }
            if(p1Boost2Expires > gameNow() - 12000 && subtowers[i].playerSide == 2 && p1BoostTypes[1] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1.2
            } else if(p1Boost2Expires <= gameNow() - 12000 && subtowers[i].playerSide == 2 && p1BoostTypes[1] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1
            }
            if(p2Boost1Expires > gameNow() - 12000 && subtowers[i].playerSide == 2 && p2BoostTypes[0] == "towerboost.png") {
                subtowers[i].towerBoosted = 1/1.8
            } else if(p2Boost1Expires <= gameNow() - 12000 && subtowers[i].playerSide == 2 && p2BoostTypes[0] == "towerboost.png") {
                subtowers[i].towerBoosted = 1
            }
            if(p2Boost1Expires > gameNow() - 12000 && subtowers[i].playerSide == 1 && p2BoostTypes[0] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1.2
            } else if(p2Boost1Expires <= gameNow() - 12000 && subtowers[i].playerSide == 1 && p2BoostTypes[0] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1
            }
            if(p2Boost2Expires > gameNow() - 12000 && subtowers[i].playerSide == 2 && p2BoostTypes[1] == "towerboost.png") {
                subtowers[i].towerBoosted = 1/1.8
            } else if(p2Boost2Expires <= gameNow() - 12000 && subtowers[i].playerSide == 2 && p2BoostTypes[1] == "towerboost.png") {
                subtowers[i].towerBoosted = 1
            }
            if(p2Boost2Expires > gameNow() - 12000 && subtowers[i].playerSide == 1 && p2BoostTypes[1] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1.2
            } else if(p2Boost2Expires <= gameNow() - 12000 && subtowers[i].playerSide == 1 && p2BoostTypes[1] == "slowboost.png") {
                subtowers[i].slowSabotaged = 1
            }
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerBoosted < 1 && towers[i].playerSide == 1) {
                ctx.beginPath()
                ctx.moveTo(towers[i].x, towers[i].y)
                ctx.arc(towers[i].x, towers[i].y, 75 * ((1 - ((((gameNow() - p1TowerBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
                ctx.fill()
            } else if(towers[i].towerBoosted < 1 && towers[i].playerSide == 2) {
                ctx.beginPath()
                ctx.moveTo(towers[i].x, towers[i].y)
                ctx.arc(towers[i].x, towers[i].y, 75 * ((1 - ((((gameNow() - p2TowerBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
                ctx.fill()
            }
            if(towers[i].slowSabotaged > 1 && towers[i].playerSide == 1) {
                ctx.beginPath()
                ctx.moveTo(towers[i].x, towers[i].y)
                ctx.arc(towers[i].x, towers[i].y, 75 * ((1 - ((((gameNow() - p1SlowBoostVisual) % 1500)/1500)) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
                ctx.fill()
            } else if(towers[i].slowSabotaged > 1 && towers[i].playerSide == 2) {
                ctx.beginPath()
                ctx.moveTo(towers[i].x, towers[i].y)
                ctx.arc(towers[i].x, towers[i].y, 75 * ((1 - ((((gameNow() - p2SlowBoostVisual) % 1500)/1500)) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
                ctx.fill()
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            if(subtowers[i] && subtowers[i].lifespan <= gameNow()) {
                subtowers.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            if(subtowers[i].playerSide == 1 && subtowers[i].x < canvas.width/8 + subtowers[i].radius) {
                subtowers[i].x = canvas.width/8 + subtowers[i].radius
                subtowers[i].dx = Math.abs(subtowers[i].dx)
            } else if(subtowers[i].playerSide == 1 && subtowers[i].x > canvas.width/2 - subtowers[i].radius) {
                subtowers[i].x = canvas.width/2 - subtowers[i].radius
                subtowers[i].dx = -Math.abs(subtowers[i].dx)
            } else if(subtowers[i].playerSide == 1 && subtowers[i].y < subtowers[i].radius) {
                subtowers[i].y = subtowers[i].radius
                subtowers[i].dy = Math.abs(subtowers[i].dy)
            } else if(subtowers[i].playerSide == 1 && subtowers[i].y > canvas.height - subtowers[i].radius) {
                subtowers[i].y = canvas.height - subtowers[i].radius
                subtowers[i].dy = -Math.abs(subtowers[i].dy)
            } else if(subtowers[i].playerSide == 2 && subtowers[i].x < canvas.width/2 + subtowers[i].radius) {
                subtowers[i].x = canvas.width/2 + subtowers[i].radius
                subtowers[i].dx = Math.abs(subtowers[i].dx)
            } else if(subtowers[i].playerSide == 2 && subtowers[i].x > 7*canvas.width/8 - subtowers[i].radius) {
                subtowers[i].x = 7*canvas.width/8 - subtowers[i].radius
                subtowers[i].dx = -Math.abs(subtowers[i].dx)
            } else if(subtowers[i].playerSide == 2 && subtowers[i].y < subtowers[i].radius) {
                subtowers[i].y = subtowers[i].radius
                subtowers[i].dy = Math.abs(subtowers[i].dy)
            } else if(subtowers[i].playerSide == 2 && subtowers[i].y > canvas.height - subtowers[i].radius) {
                subtowers[i].y = canvas.height - subtowers[i].radius
                subtowers[i].dy = -Math.abs(subtowers[i].dy)
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            tickSubtowerFireForIndex(i)
        }
        for(var i = 0; i < subtowers.length; i++) {
            if(subtowers[i].towerBoosted < 1 && subtowers[i].playerSide == 1) {
                ctx.beginPath()
                ctx.moveTo(subtowers[i].x, subtowers[i].y)
                ctx.arc(subtowers[i].x, subtowers[i].y, 75 * ((1 - ((((gameNow() - p1TowerBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
                ctx.fill()
            } else if(subtowers[i].towerBoosted < 1 && subtowers[i].playerSide == 2) {
                ctx.beginPath()
                ctx.moveTo(subtowers[i].x, subtowers[i].y)
                ctx.arc(subtowers[i].x, subtowers[i].y, 75 * ((1 - ((((gameNow() - p2TowerBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
                ctx.fill()
            }
            if(subtowers[i].slowSabotaged > 1 && subtowers[i].playerSide == 1) {
                ctx.beginPath()
                ctx.moveTo(subtowers[i].x, subtowers[i].y)
                ctx.arc(subtowers[i].x, subtowers[i].y, 75 * ((1 - ((((gameNow() - p1SlowBoostVisual) % 1500)/1500)) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
                ctx.fill()
            } else if(subtowers[i].slowSabotaged > 1 && subtowers[i].playerSide == 2) {
                ctx.beginPath()
                ctx.moveTo(subtowers[i].x, subtowers[i].y)
                ctx.arc(subtowers[i].x, subtowers[i].y, 75 * ((1 - ((((gameNow() - p2SlowBoostVisual) % 1500)/1500)) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
                ctx.fill()
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(p1Boost1Expires > gameNow() - 12000 && bloons[i].playerSide == 2 && bloons[i].isAI == false && bloons[i].isBoss == false && p1BoostTypes[0] == "bloonboost.png") {
                bloons[i].bloonBoosted = BOOST_SETTINGS.bloonBoostFactor
            } else if(p1Boost1Expires <= gameNow() - 12000 && bloons[i].playerSide == 2 && p1BoostTypes[0] == "bloonboost.png") {
                bloons[i].bloonBoosted = 1
            } else if(p1Boost2Expires > gameNow() - 12000 && bloons[i].playerSide == 2 && bloons[i].isAI == false && bloons[i].isBoss == false && p1BoostTypes[1] == "bloonboost.png") {
                bloons[i].bloonBoosted = BOOST_SETTINGS.bloonBoostFactor
            } else if(p1Boost2Expires <= gameNow() - 12000 && bloons[i].playerSide == 2 && p1BoostTypes[1] == "bloonboost.png") {
                bloons[i].bloonBoosted = 1
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(p2Boost1Expires > gameNow() - 12000 && bloons[i].playerSide == 1 && bloons[i].isAI == false && bloons[i].isBoss == false && p2BoostTypes[0] == "bloonboost.png") {
                bloons[i].bloonBoosted = BOOST_SETTINGS.bloonBoostFactor
            } else if(p2Boost1Expires <= gameNow() - 12000 && bloons[i].playerSide == 1 && p2BoostTypes[0] == "bloonboost.png") {
                bloons[i].bloonBoosted = 1
            } else if(p2Boost2Expires > gameNow() - 12000 && bloons[i].playerSide == 1 && bloons[i].isAI == false && bloons[i].isBoss == false && p2BoostTypes[1] == "bloonboost.png") {
                bloons[i].bloonBoosted = BOOST_SETTINGS.bloonBoostFactor
            } else if(p2Boost2Expires <= gameNow() - 12000 && bloons[i].playerSide == 1 && p2BoostTypes[1] == "bloonboost.png") {
                bloons[i].bloonBoosted = 1
            }
        }


        for(var i = 0; i < towers.length; i++) {
            towers[i].shinobiStacks = 0
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "ninja" && towers[i].path2Upgrades >= 3) {
                for(var k = 0; k < towers.length; k++) {
                    if(k != i && towers[k].towerType == "ninja" && towers[k].shinobiStacks < 10 && ((towers[i].x - towers[k].x)**2 + (towers[i].y - towers[k].y)**2)**0.5 <= towers[i].range && towers[i].playerSide == towers[k].playerSide) {
                        towers[k].shinobiStacks += 0.5
                    }
                }
            }
        }
        for(var i = 0; i < towers.length; i++) {
            towers[i].overclockFactor = 1
        }
        for(var i = 0; i < subtowers.length; i++) {
            subtowers[i].overclockFactor = 1
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "engi" && towers[i].path2Upgrades == 4) {
                for(var k = 0; k < towers.length; k++) {
                    if(k != i && ((towers[i].x - towers[k].x)**2 + (towers[i].y - towers[k].y)**2)**0.5 <= towers[i].range && towers[i].playerSide == towers[k].playerSide) {
                        towers[k].overclockFactor = 0.85
                    }
                }
                for(var k = 0; k < subtowers.length; k++) {
                    if(((towers[i].x - subtowers[k].x)**2 + (towers[i].y - subtowers[k].y)**2)**0.5 <= towers[i].range && towers[i].playerSide == subtowers[k].playerSide) {
                        subtowers[k].overclockFactor = 0.85
                    }
                }
            }
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "engi" && towers[i].path2Upgrades == 5) {
                for(var k = 0; k < towers.length; k++) {
                    if(k != i && ((towers[i].x - towers[k].x)**2 + (towers[i].y - towers[k].y)**2)**0.5 <= towers[i].range && towers[i].playerSide == towers[k].playerSide) {
                        towers[k].overclockFactor = 0.75
                    }
                }
                for(var k = 0; k < subtowers.length; k++) {
                    if(((towers[i].x - subtowers[k].x)**2 + (towers[i].y - subtowers[k].y)**2)**0.5 <= towers[i].range && towers[i].playerSide == subtowers[k].playerSide) {
                        subtowers[k].overclockFactor = 0.75
                    }
                }
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "farm") {
                tickFarmProductionForTower(towers[i])
            }
        }

        for(var i = 0; i < towers.length; i++) {
            tickTowerFireForIndex(i)
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "buccaneer" && towers[i].path1Upgrades >= 4) {
                towers[i].spawnSentry()
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            var hasParentTower = false
            for(var k = 0; k < towers.length; k++) {
                if(towers[k] && subtowers[i] && towers[k].towerID == subtowers[i].towerID) {
                    hasParentTower = true
                    break
                }
            }
            if(hasParentTower == false) {
                subtowers.splice(i, 1)
                i--
            }
        }

        var p1MonkeyStimCount = 0
        var p2MonkeyStimCount = 0
        var p1BloonStimCount = 0
        var p2BloonStimCount = 0
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "cobra" && towers[i].path1Upgrades >= 3 && towers[i].playerSide == 1) {
                p1MonkeyStimCount++
            }
            if(towers[i].towerType == "cobra" && towers[i].path1Upgrades >= 3 && towers[i].playerSide == 2) {
                p2MonkeyStimCount++
            }
            if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 3 && towers[i].playerSide == 1) {
                p1BloonStimCount++
            }
            if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 3 && towers[i].playerSide == 2) {
                p2BloonStimCount++
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(towers[i].playerSide == 1) {
                towers[i].cobraBoosted = Math.max(0.7, 0.98 ** p1MonkeyStimCount)
            }
            if(towers[i].playerSide == 2) {
                towers[i].cobraBoosted = Math.max(0.7, 0.98 ** p2MonkeyStimCount)
            }
        }

        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].playerSide == 1) {
                bloons[i].cobraBoosted = Math.min(1.5, 1.02 ** p2BloonStimCount)
            }
            if(bloons[i].playerSide == 2) {
                bloons[i].cobraBoosted = Math.min(1.5, 1.02 ** p1BloonStimCount)
            }
        }

        for(var i = 0; i < towers.length; i++) {
            var towerCatchupLimit = getAITrainingGameplayCatchupLimit()
            while(towers[i].attritionCooldown <= gameNow() && towers[i].attritionCooldown != -1 && towerCatchupLimit > 0) {
                if(towers[i].playerSide == 1) {
                    if(p2lives > 2 && p2lives != Infinity) {
                        p2lives -= 2
                        p1lives += 2
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 2, "lives"))
                        if(p1lives > 150) {
                            p1lives = 150
                        }
                    } else if(p2lives == 2) {
                        p2lives -= 1
                        p1lives += 1
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 1, "lives"))
                        if(p1lives > 150) {
                            p1lives = 150
                        }
                    } else if(p2lives == 1 || p2lives == Infinity) {
                        p1money += 70
                        p1TotalCashGenerated += 70
                        towers[i].cashGenerated += 70
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, 70))
                    }
                } else {
                    if(p1lives > 2 && p1lives != Infinity) {
                        p1lives -= 2
                        p2lives += 2
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 2, "lives"))
                        if(p2lives > 150) {
                            p2lives = 150
                        }
                    } else if(p1lives == 2) {
                        p1lives -= 1
                        p2lives += 1
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, 1, "lives"))
                        if(p2lives > 150) {
                            p2lives = 150
                        }
                    } else if(p1lives == 1 || p1lives == Infinity) {
                        p2money += 70
                        p2TotalCashGenerated += 70
                        towers[i].cashGenerated += 70
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, 70))
                    }
                }
                towers[i].attritionCooldown += 20000
                towerCatchupLimit--
            }
            towerCatchupLimit = getAITrainingGameplayCatchupLimit()
            while(towers[i].activeSyphonCooldown <= gameNow() && towers[i].activeSyphonCooldown != -1 && towerCatchupLimit > 0) {
                if(towers[i].playerSide == 1) {
                    p1money += 15
                    towers[i].cashGenerated += 15
                    p1TotalCashGenerated += 15
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 15))
                } else {
                    p2money += 15
                    towers[i].cashGenerated += 15
                    p2TotalCashGenerated += 15
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 15))
                }
                towers[i].activeSyphonCooldown += 1000
                towerCatchupLimit--
            }
            towerCatchupLimit = getAITrainingGameplayCatchupLimit()
            while(towers[i].supplyDropCooldown <= gameNow() && towers[i].supplyDropCooldown != -1 && towerCatchupLimit > 0) {
                if(towers[i].path2Upgrades == 4) {
                    towers[i].cashGenerated += 2000
                    if(towers[i].playerSide == 1) {
                        p1money += 2000
                        p1TotalCashGenerated += 2000
                    } else {
                        p2money += 2000
                        p2TotalCashGenerated += 2000
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 2000))
                    towers[i].supplyDropCooldown += 30000
                } else {
                    towers[i].cashGenerated += 3500
                    if(towers[i].playerSide == 1) {
                        p1money += 3500
                        p1TotalCashGenerated += 3500
                    } else {
                        p2money += 3500
                        p2TotalCashGenerated += 3500
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 3500))
                    towers[i].supplyDropCooldown += 30000
                }
                towerCatchupLimit--
            }
            towerCatchupLimit = getAITrainingGameplayCatchupLimit()
            while(towers[i].sentrySpawnCooldown <= gameNow() && towers[i].sentrySpawnCooldown != -1 && towerCatchupLimit > 0) {
                towers[i].spawnSentry()
                if(towers[i].path1Upgrades == 1) {
                    towers[i].sentrySpawnCooldown += 5000 * towers[i].cobraBoosted * towers[i].towerBoosted * towers[i].overclockFactor * towers[i].slowSabotaged
                } else {
                    towers[i].sentrySpawnCooldown += 3000 * towers[i].cobraBoosted * towers[i].towerBoosted * towers[i].overclockFactor * towers[i].slowSabotaged
                }
                towerCatchupLimit--
            }
            if(towers[i].path3Upgrades == 4 && towers[i].lastTimeTrapPopped + 8000 * towers[i].cobraBoosted * towers[i].towerBoosted * towers[i].overclockFactor * towers[i].slowSabotaged <= gameNow() && towers[i].trapSpawnCooldown != -1) {
                var alreadySpawnedTrap = false
                for(var k = 0; k < projectiles.length; k++) {
                    if(projectiles[k].image == "004engiproj.png" && projectiles[k].parentID == towers[i].towerID) {
                        alreadySpawnedTrap = true
                    }
                }
                if(alreadySpawnedTrap == false && towers[i].closestPathObject != -1) {
                   projectiles.push(new Projectile(pathObjects[towers[i].closestPathObject].x, pathObjects[towers[i].closestPathObject].y, 0, 0, 25, "004engiproj.png", 0, Infinity, 100, 0, towers[i].towerID, towers[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
            if(towers[i].path3Upgrades == 5 && towers[i].lastTimeTrapPopped + 8000 * towers[i].cobraBoosted * towers[i].towerBoosted * towers[i].overclockFactor * towers[i].slowSabotaged <= gameNow() && towers[i].trapSpawnCooldown != -1) {
                var alreadySpawnedTrap = false
                for(var k = 0; k < projectiles.length; k++) {
                    if(projectiles[k].image == "005engiproj.png" && projectiles[k].parentID == towers[i].towerID) {
                        alreadySpawnedTrap = true
                    }
                }
                if(alreadySpawnedTrap == false && towers[i].closestPathObject != -1) {
                   projectiles.push(new Projectile(pathObjects[towers[i].closestPathObject].x, pathObjects[towers[i].closestPathObject].y, 0, 0, 25, "005engiproj.png", 0, Infinity, 100, 0, towers[i].towerID, towers[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
        }

        updateManualAimTowerTargets()

        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].popAdjustChecked == false) {
                projectiles[i].popAdjustRandomize()
                projectiles[i].popAdjustChecked = true
            }
        }

        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].damageAdjustChecked == false) {
                projectiles[i].damageAdjustRandomize()
                projectiles[i].damageAdjustChecked = true
            }
        }

        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i]) {
                projectiles[i].update()
                if(projectiles[i].image == "000boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "002boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "200boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "202boomerproj.png" && projectiles[i].boomerProgress >= 50  || projectiles[i].image == "500boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "502boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "050boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "052boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "250boomerproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "040swordproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "050swordproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "042swordproj.png" && projectiles[i].boomerProgress >= 50 || projectiles[i].image == "052swordproj.png" && projectiles[i].boomerProgress >= 50) {
                    projectiles.splice(i, 1)
                    i--
                }
                if(projectiles[i] && projectiles[i].pathPos != -1000 && projectiles[i].pathPos <= 0) {
                    projectiles.splice(i, 1)
                    i--
                }

                if(projectiles[i] && projectiles[i].image == "500dartproj.png" || projectiles[i] && projectiles[i].image == "555dartproj.png") {
                    if(projectiles[i] && projectiles[i].playerSide == 1) {
                        if(projectiles[i] && projectiles[i].x <= canvas.width/8 + projectiles[i].radius) {
                            projectiles[i].dx = Math.abs(projectiles[i].dx)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].x >= canvas.width/2 - projectiles[i].radius) {
                            projectiles[i].dx = -Math.abs(projectiles[i].dx)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].y <= 0 + projectiles[i].radius) {
                            projectiles[i].dy = Math.abs(projectiles[i].dy)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].y >= canvas.height - projectiles[i].radius) {
                            projectiles[i].dy = -Math.abs(projectiles[i].dy)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                    } else {
                        if(projectiles[i] && projectiles[i].x <= canvas.width/2 + projectiles[i].radius) {
                            projectiles[i].dx = Math.abs(projectiles[i].dx)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].x >= 7*canvas.width/8 - projectiles[i].radius) {
                            projectiles[i].dx = -Math.abs(projectiles[i].dx)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].y <= 0 + projectiles[i].radius) {
                            projectiles[i].dy = Math.abs(projectiles[i].dy)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                        if(projectiles[i] && projectiles[i].y >= canvas.height - projectiles[i].radius) {
                            projectiles[i].dy = -Math.abs(projectiles[i].dy)
                            if(projectiles[i] && projectiles[i].bounceCount == 3) {
                                projectiles.splice(i, 1)
                                i--
                            } else {
                                projectiles[i].bounceCount++
                            }
                        }
                    }
                }
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].lifespan != -1 || projectiles[i].image == "004engiproj.png" || projectiles[i].image == "005engiproj.png") {
                projectiles[i].draw()
            } else if(projectiles[i].playerSide == 1 && projectiles[i].x >= canvas.width/8 + projectiles[i].radius && projectiles[i].x <= canvas.width/2 - projectiles[i].radius && projectiles[i].y >= projectiles[i].radius && projectiles[i].y <= canvas.height - projectiles[i].radius) {
                projectiles[i].draw()
            } else if(projectiles[i].playerSide == 2 && projectiles[i].x >= canvas.width/2 + projectiles[i].radius && projectiles[i].x <= canvas.width*7/8 - projectiles[i].radius && projectiles[i].y >= projectiles[i].radius && projectiles[i].y <= canvas.height - projectiles[i].radius) {
                projectiles[i].draw()
            }
        }
        for(var i = 0; i < bananas.length; i++) {
            if(bananas[i].playerSide == 1) {
                if(bananas[i].x < canvas.width/8 + bananas[i].radius) {
                    bananas[i].x = canvas.width/8 + bananas[i].radius
                }
                if(bananas[i].x > canvas.width / 2 - bananas[i].radius) {
                    bananas[i].x = canvas.width / 2 - bananas[i].radius
                }
                if(bananas[i].y < bananas[i].radius) {
                    bananas[i].y = bananas[i].radius
                }
                if(bananas[i].y > canvas.height - bananas[i].radius) {
                    bananas[i].y = canvas.height - bananas[i].radius
                }
            } else {
                if(bananas[i].x < canvas.width/2 + bananas[i].radius) {
                    bananas[i].x = canvas.width/2 + bananas[i].radius
                }
                if(bananas[i].x > 7 * canvas.width / 8 - bananas[i].radius) {
                    bananas[i].x = 7 * canvas.width / 8 - bananas[i].radius
                }
                if(bananas[i].y < bananas[i].radius) {
                    bananas[i].y = bananas[i].radius
                }
                if(bananas[i].y > canvas.height - bananas[i].radius) {
                    bananas[i].y = canvas.height - bananas[i].radius
                }
            }
        }
        for(var i = 0; i < bananas.length; i++) {
            for(var k = 0; k < towers.length; k++) {
                if(bananas[i] && towers[k].towerType == "farmer" && Math.sqrt((towers[k].x - bananas[i].x) ** 2 + (towers[k].y - bananas[i].y) ** 2) <= towers[k].range && towers[k].playerSide == bananas[i].playerSide) {
                    if(bananas[i].playerSide == 1) {
                        p1money += Math.round(bananas[i].cashGiven)
                        p1TotalCashGenerated += Math.round(bananas[i].cashGiven)
                    } else {
                        p2money += Math.round(bananas[i].cashGiven)
                        p2TotalCashGenerated += Math.round(bananas[i].cashGiven)
                    }
                    for(var l = 0; l < towers.length; l++) {
                        if(towers[l].towerID == bananas[i].parentID) {
                            towers[l].popCount += Math.round(bananas[i].cashGiven)
                        }
                    }
                    moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, Math.round(bananas[i].cashGiven)))
                    bananas.splice(i, 1)
                    i--
                }
            }
            if(bananas[i] && Math.sqrt((bananas[i].x - cursor[0].x) ** 2 + (bananas[i].y - cursor[0].y) ** 2) <= 40 + bananas[i].radius && bananas[i].playerSide == 1) {
                p1money += bananas[i].cashGiven
                p1TotalCashGenerated += bananas[i].cashGiven
                for(var l = 0; l < towers.length; l++) {
                    if(towers[l].towerID == bananas[i].parentID) {
                        towers[l].popCount += bananas[i].cashGiven
                    }
                }
                moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, bananas[i].cashGiven))
                bananas.splice(i, 1)
                i--
            }
            if(bananas[i] && Math.sqrt((bananas[i].x - cursor[1].x) ** 2 + (bananas[i].y - cursor[1].y) ** 2) <= 40 + bananas[i].radius && bananas[i].playerSide == 2) {
                p2money += bananas[i].cashGiven
                p2TotalCashGenerated += bananas[i].cashGiven
                for(var l = 0; l < towers.length; l++) {
                    if(towers[l].towerID == bananas[i].parentID) {
                        towers[l].popCount += bananas[i].cashGiven
                    }
                }
                moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, bananas[i].cashGiven))
                bananas.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].bloonBoosted > 1 && bloons[i].playerSide == 2) {
                ctx.beginPath()
                ctx.moveTo(bloons[i].x, bloons[i].y)
                ctx.arc(bloons[i].x, bloons[i].y, 2.25 * bloons[i].radius * ((1 - ((((gameNow() - p1BloonBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
                ctx.fill()
            } else if(bloons[i].bloonBoosted > 1 && bloons[i].playerSide == 1) {
                ctx.beginPath()
                ctx.moveTo(bloons[i].x, bloons[i].y)
                ctx.arc(bloons[i].x, bloons[i].y, 2.25 * bloons[i].radius * ((1 - ((((gameNow() - p2BloonBoostVisual) % 1500)/1500) - 1) ** 2) ** (1/1.2)), 0, Math.PI * 2, false)
                ctx.closePath()
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
                ctx.fill()
            }
        }
        for(var i = 0; i < subtowers.length; i++) {
            subtowers[i].update()
            subtowers[i].draw()
        }
        for(var i = 0; i < towers.length; i++) {
            towers[i].draw()
        }
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].dpsTicks == 0 && bloons[i].dpsType != 0) {
                bloons[i].dpsType = 0
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(practiceMode && nonPlayableSide == 1 && bloons[i] && bloons[i].playerSide == 1 || practiceMode && nonPlayableSide == 2 && bloons[i] && bloons[i].playerSide == 2) {
                bloons.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            bloons[i].update()
            if(bloons[i].pathPos >= 100) {
                if(bloons[i].playerSide == 1) {
                    if(bloons[i].isBoss == true) {
                        p1lives = 0
                    }
                    if(round <= 50) {
                        if(bloons[i].health >= 1 && bloons[i].health <= 5) {
                            p1lives -= bloons[i].health
                        } else if(bloons[i].health == 6) {
                            p1lives -= 11
                        } else if(bloons[i].health == 7) {
                            p1lives -= 23
                        } else if(bloons[i].health == 8) {
                            p1lives -= 47
                        } else if(bloons[i].health >= 9 && bloons[i].health <= 18) {
                            p1lives -= 104
                        } else if(bloons[i].health >= 19 && bloons[i].health <= 218) {
                            p1lives -= 616
                        } else if(bloons[i].health >= 219 && bloons[i].health <= 918) {
                            p1lives -= 3164
                        } else if(bloons[i].health >= 919 && bloons[i].health <= 4918) {
                            p1lives -= 16656
                        }
                    } else {
                        if(bloons[i].health >= 1 && bloons[i].health <= 8) {
                            p1lives -= bloons[i].health
                        } else if(bloons[i].health >= 9 && bloons[i].health <= 68) {
                            p1lives -= 68
                        } else if(bloons[i].health >= 69 && bloons[i].health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                            p1lives -= 472
                        } else if(bloons[i].health >= 69 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[i].health <= 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
                            p1lives -= 2588
                        } else if(bloons[i].health >= 69 + Math.ceil(900 * (1.05 ** (round - 50))) && bloons[i].health <= 68 + Math.ceil(4900 * (1.05 ** (round - 50)))) {
                            p1lives -= 14352
                        }
                    }
                    bloons.splice(i, 1)
                    i--
                } else {
                    if(bloons[i].isBoss == true) {
                        p2lives = 0
                    }
                    if(round <= 50) {
                        if(bloons[i].health >= 1 && bloons[i].health <= 5) {
                            p2lives -= bloons[i].health
                        } else if(bloons[i].health == 6) {
                            p2lives -= 11
                        } else if(bloons[i].health == 7) {
                            p2lives -= 23
                        } else if(bloons[i].health == 8) {
                            p2lives -= 47
                        } else if(bloons[i].health >= 9 && bloons[i].health <= 18) {
                            p2lives -= 104
                        } else if(bloons[i].health >= 19 && bloons[i].health <= 218) {
                            p2lives -= 616
                        } else if(bloons[i].health >= 219 && bloons[i].health <= 918) {
                            p2lives -= 3164
                        } else if(bloons[i].health >= 919 && bloons[i].health <= 4918) {
                            p2lives -= 16656
                        }
                    } else {
                        if(bloons[i].health >= 1 && bloons[i].health <= 8) {
                            p2lives -= bloons[i].health
                        } else if(bloons[i].health >= 9 && bloons[i].health <= 68) {
                            p2lives -= 68
                        } else if(bloons[i].health >= 69 && bloons[i].health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                            p2lives -= 472
                        } else if(bloons[i].health >= 69 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[i].health <= 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
                            p2lives -= 2588
                        } else if(bloons[i].health >= 69 + Math.ceil(900 * (1.05 ** (round - 50))) && bloons[i].health <= 68 + Math.ceil(4900 * (1.05 ** (round - 50)))) {
                            p2lives -= 14352
                        }
                    }
                    bloons.splice(i, 1)
                    i--
                }
            }
        }
        processLightningBoosts()
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].lifespan != -1 && projectiles[i].lifespan <= gameNow()) {
                projectiles.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].image == "003wizardproj.png" && projectiles[i].lifespan == -1) {
                projectiles[i].lifespan = gameNow() + 500
            }
        }
        tickBloonQueueForSide(PLAYER_SIDE.left)
        tickBloonQueueForSide(PLAYER_SIDE.right)
        if(isAITrainingEcoCatchupActive()) {
            tickAutoEcoForSide(PLAYER_SIDE.left)
            tickAutoEcoForSide(PLAYER_SIDE.right)
        }
        rebuildFrameTowerLookup()
        for(var k = 0; k < bloons.length; k++) {
            for(var i = 0; i < projectiles.length; i++) {
                if(projectiles[i].target != -1 && projectiles[i].targetHit == false) {
                    if(bloons[projectiles[i].target] && projectiles[i] && projectiles[i].touchingBloon(bloons[projectiles[i].target]) && bloons[projectiles[i].target].playerSide == projectiles[i].playerSide && projectiles[i].hitBloons.has(bloons[projectiles[i].target].bloonID) == false) {
                        if(projectiles[i].canRicochet == true && projectiles[i].pathPos == -1000) {
                            projectiles[i].pathPos = bloons[projectiles[i].target].pathPos
                        } else if(projectiles[i].image == "003farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 1
                                p1TotalCashGenerated += 1
                            } else {
                                p2money += 1
                                p2TotalCashGenerated += 1
                            }
                        } else if(projectiles[i].image == "004farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 2
                                p1TotalCashGenerated += 2
                            } else {
                                p2money += 2
                                p2TotalCashGenerated += 2
                            }
                        } else if(projectiles[i].image == "005farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 4
                                p1TotalCashGenerated += 4
                            } else {
                                p2money += 4
                                p2TotalCashGenerated += 4
                            }
                        }
                        if(projectiles[i].spawnedFrags == false) {
                            projectiles[i].spawnFrags()
                            projectiles[i].spawnedFrags = true
                        }
                        if(projectiles[i].image == "000bombproj.png" || projectiles[i].image == "300bombproj.png" || projectiles[i].image == "020bombproj.png" || projectiles[i].image == "030bombproj.png" || projectiles[i].image == "040bombproj.png" || projectiles[i].image == "050bombproj.png" || projectiles[i].image == "010wizardproj.png" || projectiles[i].image == "003ninjaproj.png" || projectiles[i].image == "002bombprojmain.png" || projectiles[i].image == "003bombprojmain.png" || projectiles[i].image == "004bombprojmain.png" || projectiles[i].image == "302bombprojmain.png" || projectiles[i].image == "022bombprojmain.png" || projectiles[i].image == "032bombprojmain.png" || projectiles[i].image == "042bombprojmain.png" || projectiles[i].image == "052bombprojmain.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "explosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "003iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "003iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "103iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "103iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "005iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "005iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "105iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "105iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "040farmerproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "explosion.png"
                            projectiles[i].radius *= 2.5
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "030dartlingproj.png" || projectiles[i].image == "050dartlingproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "050dartlingexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].pierce > 0) {
                            projectiles[i].hitBloons.add(bloons[projectiles[i].target].bloonID)
                            applyProjectileStun(projectiles[i], bloons[projectiles[i].target])
                            if(projectiles[i].knockback > 0) {
                                if(round <= 50) {
                                    if(bloons[projectiles[i].target].health <= 18) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].knockback) {
                                            bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(1.8)
                                        }
                                    }
                                } else {
                                    if(bloons[projectiles[i].target].health <= 68) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].knockback) {
                                            bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(1.8 * 0.965 ** (round - 50))
                                        }
                                    }
                                }
                            }
                            if(projectiles[i].moabKnockback > 0) {
                                if(round <= 50) {
                                    if(bloons[projectiles[i].target].health > 18 && bloons[projectiles[i].target].isBoss == false) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].moabKnockback) {
                                            if(bloons[projectiles[i].target].health > 18 && bloons[projectiles[i].target].health <= 218) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.3 * (mapNumber == 0 ? 1 : 2/3))
                                            } else if(bloons[projectiles[i].target].health > 218 && bloons[projectiles[i].target].health <= 918) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.09 * (mapNumber == 0 ? 1 : 2/3))
                                            }
                                            else if(bloons[projectiles[i].target].health > 918 && bloons[projectiles[i].target].health <= 4918) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.03 * (mapNumber == 0 ? 1 : 2/3))
                                            }
                                        }
                                    }
                                } else {
                                    if(bloons[projectiles[i].target].health > 68 && bloons[projectiles[i].target].isBoss == false) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].moabKnockback) {
                                            if(bloons[projectiles[i].target].health > 68 && bloons[projectiles[i].target].health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.3 * (mapNumber == 0 ? 1 : 2/3) * 0.965 ** (round - 50))
                                            } else if(bloons[projectiles[i].target].health > 68 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[projectiles[i].target].health <= 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.09 * (mapNumber == 0 ? 1 : 2/3) * 0.965 ** (round - 50))
                                            }
                                            else if(bloons[projectiles[i].target].health > 68 + Math.ceil(900 * (1.05 ** (round - 50))) && bloons[projectiles[i].target].health <= 68 + Math.ceil(4900 * (1.05 ** (round - 50)))) {
                                                bloons[projectiles[i].target].pathPos -= getAITrainingScaledSimulationValue(0.03 * (mapNumber == 0 ? 1 : 2/3) * 0.965 ** (round - 50))
                                            }
                                        }
                                    }
                                }
                            }
                            if(round <= 50 && bloons[projectiles[i].target].health <= 18) {
                                if(projectiles[i].image == "000iceproj.png" && bloons[projectiles[i].target].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[projectiles[i].target].iced > 0.8 || projectiles[i].image == "030engiproj.png" && bloons[projectiles[i].target].iced > 0.8) {
                                    bloons[projectiles[i].target].iced = 0.8
                                }
                                if(projectiles[i].image == "100iceproj.png" && bloons[projectiles[i].target].iced > 0.6 || projectiles[i].image == "103iceexplosion.png" && bloons[projectiles[i].target].iced > 0.6) {
                                    bloons[projectiles[i].target].iced = 0.6
                                }
                            } else if(round > 50 && bloons[projectiles[i].target].health <= 68){
                                if(projectiles[i].image == "000iceproj.png" && bloons[projectiles[i].target].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[projectiles[i].target].iced > 0.8 || projectiles[i].image == "030engiproj.png" && bloons[projectiles[i].target].iced > 0.8) {
                                    bloons[projectiles[i].target].iced = 0.8
                                }
                                if(projectiles[i].image == "100iceproj.png" && bloons[projectiles[i].target].iced > 0.6 || projectiles[i].image == "103iceexplosion.png" && bloons[projectiles[i].target].iced > 0.6) {
                                    bloons[projectiles[i].target].iced = 0.6
                                }
                            }
                            if(projectiles[i].image == "005iceexplosion.png" && bloons[projectiles[i].target].iced > 0.8) {
                                bloons[projectiles[i].target].iced = 0.8
                            }
                            if(projectiles[i].image == "105iceexplosion.png" && bloons[projectiles[i].target].iced > 0.6) {
                                bloons[projectiles[i].target].iced = 0.6
                            }
                            if(projectiles[i].image == "040ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.75 || projectiles[i].image == "041ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.75 || projectiles[i].image == "240ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.75) {
                                bloons[projectiles[i].target].sabotaged -= 0.05
                            }
                            if(projectiles[i].image == "050ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.5 || projectiles[i].image == "051ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.5 || projectiles[i].image == "250ninjaproj.png" && bloons[projectiles[i].target].sabotaged > 0.5) {
                                bloons[projectiles[i].target].sabotaged -= 0.05
                            }
                            if(projectiles[i].parentID == 0 && projectiles[i].playerSide == 1) {
                                    p1TotalPopCount += calculatePopCount(projectiles[i].damage, bloons[projectiles[i].target].health)
                            } else if(projectiles[i].parentID == 0 && projectiles[i].playerSide == 2) {
                                    p2TotalPopCount += calculatePopCount(projectiles[i].damage, bloons[projectiles[i].target].health)
                            }
                            var parentTower = frameTowerByID.get(projectiles[i].parentID)
                            if(parentTower) {
                                var popAmount = calculatePopCount(projectiles[i].damage, bloons[projectiles[i].target].health)
                                parentTower.popCount += popAmount
                                parentTower.updateDPS(popAmount)
                                if(parentTower.playerSide == 1) {
                                    p1TotalPopCount += popAmount
                                } else {
                                    p2TotalPopCount += popAmount
                                }
                            }

                            if(bloons[projectiles[i].target] && projectiles[i] && projectiles[i].dpsTicks > 0 && projectiles[i].dpsType > bloons[projectiles[i].target].dpsType) {
                                bloons[projectiles[i].target].dpsDamage = projectiles[i].dpsDamage
                                bloons[projectiles[i].target].dpsTicks = projectiles[i].dpsTicks
                                bloons[projectiles[i].target].dpsType = projectiles[i].dpsType
                                bloons[projectiles[i].target].dpsLastTick = gameNow() + projectiles[i].dpsTickRate
                                bloons[projectiles[i].target].dpsTickRate = projectiles[i].dpsTickRate
                                bloons[projectiles[i].target].dpsTowerID = projectiles[i].parentID
                            }
                            bloons[projectiles[i].target].health -= projectiles[i].damage
                            bloons[projectiles[i].target].spawnBloons()
                            if(bloons[projectiles[i].target].health <= 8 && bloons[projectiles[i].target].pathPos > 0) {
                                images.push(new Images(bloons[projectiles[i].target].x, bloons[projectiles[i].target].y, 25, "pop.png", gameNow() + 100, ""))
                            }
                            if(bloons[projectiles[i].target].health <= 0) {
                                bloons.splice(projectiles[i].target, 1)
                            }
                            projectiles[i].pierce--
                            if(projectiles[i].image == "042swordproj.png" && projectiles[i].pierce % 25 == 0) {
                                for(var a = 0; a < 8; a++) {
                                    projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 10 * Math.cos(a * Math.PI/4), 10 * Math.sin(a * Math.PI/4), 15, "002swordproj.png", 1, 3, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                }
                            } else if(projectiles[i].image == "050swordproj.png" && projectiles[i].pierce % 10 == 0) {
                                for(var a = 0; a < 8; a++) {
                                    projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 20 * Math.cos(a * Math.PI/4), 20 * Math.sin(a * Math.PI/4), 30, "040swordproj.png", 1, 100, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                }
                            } else if(projectiles[i].image == "052swordproj.png" && projectiles[i].pierce % 10 == 0) {
                                for(var a = 0; a < 8; a++) {
                                    projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 20 * Math.cos(a * Math.PI/4), 20 * Math.sin(a * Math.PI/4), 30, "042swordproj.png", 1, 100, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                }
                            }
                            if(projectiles[i].pierce > 0 && projectiles[i].targetHit == false) {
                                projectiles[i].targetHit = true
                            }
                            if(projectiles[i].pierce <= 0 && projectiles[i].lifespan == -1) {
                                projectiles.splice(i, 1)
                                i--
                            }
                        }
                    }
                }
                if(bloons[k] && projectiles[i] && projectiles[i].touchingBloon(bloons[k]) && bloons[k].playerSide == projectiles[i].playerSide && projectiles[i].hitBloons.has(bloons[k].bloonID) == false) {
                        if(projectiles[i].canRicochet == true && projectiles[i].pathPos == -1000) {
                            projectiles[i].pathPos = bloons[k].pathPos
                        } else if(projectiles[i].image == "003farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 1
                                p1TotalCashGenerated += 1
                            } else {
                                p2money += 1
                                p2TotalCashGenerated += 1
                            }
                        } else if(projectiles[i].image == "004farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 2
                                p1TotalCashGenerated += 2
                            } else {
                                p2money += 2
                                p2TotalCashGenerated += 2
                            }
                        } else if(projectiles[i].image == "005farmerproj.png") {
                            if(projectiles[i].playerSide == 1) {
                                p1money += 4
                                p1TotalCashGenerated += 4
                            } else {
                                p2money += 4
                                p2TotalCashGenerated += 4
                            }
                        }
                        if(projectiles[i].spawnedFrags == false) {
                            projectiles[i].spawnFrags()
                            projectiles[i].spawnedFrags = true
                        }
                        if(projectiles[i].image == "000bombproj.png" || projectiles[i].image == "300bombproj.png" || projectiles[i].image == "020bombproj.png" || projectiles[i].image == "030bombproj.png" || projectiles[i].image == "040bombproj.png" || projectiles[i].image == "050bombproj.png" || projectiles[i].image == "010wizardproj.png" || projectiles[i].image == "003ninjaproj.png" || projectiles[i].image == "002bombprojmain.png" || projectiles[i].image == "003bombprojmain.png" || projectiles[i].image == "004bombprojmain.png" || projectiles[i].image == "302bombprojmain.png" || projectiles[i].image == "022bombprojmain.png" || projectiles[i].image == "032bombprojmain.png" || projectiles[i].image == "042bombprojmain.png" || projectiles[i].image == "052bombprojmain.png" || projectiles[i].image == "005swordproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "explosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "003iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "003iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "103iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "103iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "005iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "005iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "105iceproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "105iceexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "040farmerproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "explosion.png"
                            projectiles[i].radius *= 2.5
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].image == "030dartlingproj.png" || projectiles[i].image == "050dartlingproj.png") {
                            projectiles[i].dx = 0
                            projectiles[i].dy = 0
                            projectiles[i].image = "050dartlingexplosion.png"
                            projectiles[i].radius *= 3
                            projectiles[i].lifespan = gameNow() + 500
                        }
                        if(projectiles[i].pierce > 0) {
                            projectiles[i].hitBloons.add(bloons[k].bloonID)
                            applyProjectileStun(projectiles[i], bloons[k])
                            if(projectiles[i].knockback > 0) {
                                if(round <= 50) {
                                    if(bloons[k].health <= 18) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].knockback) {
                                            if(mapNumber == 0) {
                                                bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.8)
                                            } else if(mapNumber == 1) {
                                                bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.2)
                                            }
                                        }
                                    }
                                } else {
                                    if(bloons[k].health <= 68) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].knockback) {
                                            if(projectiles[i].image == "004wizardproj.png") {
                                                if(mapNumber == 0) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.8)
                                                } else if(mapNumber == 1) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.2)
                                                }
                                            } else {
                                                if(mapNumber == 0) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.8 * 0.965 ** (round - 50))
                                                } else if(mapNumber == 1) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(1.2 * 0.965 ** (round - 50))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if(projectiles[i].moabKnockback > 0) {
                                if(round <= 50) {
                                    if(bloons[k].health > 18 && bloons[k].isBoss == false) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].moabKnockback) {
                                            if(bloons[k].health > 18 && bloons[k].health <= 218) {
                                                if(mapNumber == 0) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.3)
                                                } else if(mapNumber == 1) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.2)
                                                }
                                            } else if(bloons[k].health > 218 && bloons[k].health <= 918) {
                                                if(mapNumber == 0) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.09)
                                                } else if(mapNumber == 1) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.06)
                                                }
                                            }
                                            else if(bloons[k].health > 918 && bloons[k].health <= 4918) {
                                                if(mapNumber == 0) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.03)
                                                } else if(mapNumber == 1) {
                                                    bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.02)
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if(bloons[k].health > 68 && bloons[k].isBoss == false) {
                                        var kbChance = Math.random() * 100
                                        if(kbChance < projectiles[i].moabKnockback) {
                                            if(bloons[k].health > 68 && bloons[k].health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                                                if(projectiles[i].image == "004wizardproj.png") {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.3)
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.2)
                                                    }
                                                } else {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.3 * 0.965 ** (round - 50))
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.2 * 0.965 ** (round - 50))
                                                    }
                                                }
                                            } else if(bloons[k].health > 68 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[k].health <= 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
                                                if(projectiles[i].image == "004wizardproj.png") {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.09)
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.06)
                                                    }
                                                } else {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.09 * 0.965 ** (round - 50))
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.06 * 0.965 ** (round - 50))
                                                    }
                                                }
                                            }
                                            else if(bloons[k].health > 68 + Math.ceil(900 * (1.05 ** (round - 50))) && bloons[k].health <= 68 + Math.ceil(4900 * (1.05 ** (round - 50)))) {
                                                if(projectiles[i].image == "004wizardproj.png") {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.015)
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.01)
                                                    }
                                                } else {
                                                    if(mapNumber == 0) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.03 * 0.965 ** (round - 50))
                                                    } else if(mapNumber == 1) {
                                                        bloons[k].pathPos -= getAITrainingScaledSimulationValue(0.02 * 0.965 ** (round - 50))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if(round <= 50 && bloons[k].health <= 18) {
                                if(projectiles[i].image == "000iceproj.png" && bloons[k].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[k].iced > 0.8 || projectiles[i].image == "030engiproj.png" && bloons[k].iced > 0.8) {
                                    bloons[k].iced = 0.8
                                }
                                if(projectiles[i].image == "100iceproj.png" && bloons[k].iced > 0.6 || projectiles[i].image == "103iceexplosion.png" && bloons[k].iced > 0.6) {
                                    bloons[k].iced = 0.6
                                }
                            } else if(round > 50 && bloons[k].health <= 68){
                                if(projectiles[i].image == "000iceproj.png" && bloons[k].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[k].iced > 0.8 || projectiles[i].image == "030engiproj.png" && bloons[k].iced > 0.8) {
                                    bloons[k].iced = 0.8
                                }
                                if(projectiles[i].image == "100iceproj.png" && bloons[k].iced > 0.6 || projectiles[i].image == "103iceexplosion.png" && bloons[k].iced > 0.6) {
                                    bloons[k].iced = 0.6
                                }
                            }
                            if(projectiles[i].image == "005iceexplosion.png" && bloons[k].iced > 0.8) {
                                bloons[k].iced = 0.8
                            }
                            if(projectiles[i].image == "105iceexplosion.png" && bloons[k].iced > 0.6) {
                                bloons[k].iced = 0.6
                            }
                            if(projectiles[i].image == "040ninjaproj.png" && bloons[k].sabotaged > 0.75 || projectiles[i].image == "041ninjaproj.png" && bloons[k].sabotaged > 0.75 || projectiles[i].image == "240ninjaproj.png" && bloons[k].sabotaged > 0.75) {
                                bloons[k].sabotaged -= 0.05
                            }
                            if(projectiles[i].image == "050ninjaproj.png" && bloons[k].sabotaged > 0.5 || projectiles[i].image == "051ninjaproj.png" && bloons[k].sabotaged > 0.5 || projectiles[i].image == "250ninjaproj.png" && bloons[k].sabotaged > 0.5) {
                                bloons[k].sabotaged -= 0.05
                            }
                            if(projectiles[i] && projectiles[i].image == "004engiproj.png" && bloons[k].isBoss == false) {
                                if(round <= 50) {
                                    if(bloons[k].health <= 5) {
                                        projectiles[i].trapCapacity += bloons[k].health
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 6) {
                                        projectiles[i].trapCapacity += 11
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 11
                                                towers[l].updateDPS(11)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 11
                                                } else {
                                                    p2TotalPopCount += 11
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 7) {
                                        projectiles[i].trapCapacity += 23
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 23
                                                towers[l].updateDPS(23)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 23
                                                } else {
                                                    p2TotalPopCount += 23
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 8) {
                                        projectiles[i].trapCapacity += 47
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 47
                                                towers[l].updateDPS(47)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 47
                                                } else {
                                                    p2TotalPopCount += 47
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 18) {
                                        projectiles[i].trapCapacity += 104
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 86 + bloons[k].health
                                                towers[l].updateDPS(86 + bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 86 + bloons[k].health
                                                } else {
                                                    p2TotalPopCount += 86 + bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    }
                                } else {
                                    if(bloons[k].health <= 8) {
                                        projectiles[i].trapCapacity += bloons[k].health
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 68) {
                                        projectiles[i].trapCapacity += 68
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    }
                                }
                                if(projectiles[i].trapCapacity >= 500) {
                                    moneyText.push(new MoneyText(projectiles[i].x, projectiles[i].y, projectiles[i].trapCapacity))
                                    for(var l = 0; l < towers.length; l++) {
                                        if(towers[l].towerID == projectiles[i].parentID) {
                                            towers[l].cashGenerated += projectiles[i].trapCapacity
                                            towers[l].lastTimeTrapPopped = gameNow()
                                        }
                                    }
                                    if(projectiles[i].playerSide == 1) {
                                        p1money += projectiles[i].trapCapacity
                                        p1TotalCashGenerated += projectiles[i].trapCapacity
                                    } else {
                                        p2money += projectiles[i].trapCapacity
                                        p2TotalCashGenerated += projectiles[i].trapCapacity
                                    }
                                    projectiles.splice(i, 1)
                                    i--
                                }
                            }
                            if(projectiles[i] && projectiles[i].image == "005engiproj.png" && bloons[k].isBoss == false) {
                                if(round <= 50) {
                                    if(bloons[k].health <= 5) {
                                        projectiles[i].trapCapacity += bloons[k].health
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 6) {
                                        projectiles[i].trapCapacity += 11
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 11
                                                towers[l].updateDPS(11)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 11
                                                } else {
                                                    p2TotalPopCount += 11
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 7) {
                                        projectiles[i].trapCapacity += 23
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 23
                                                towers[l].updateDPS(23)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 23
                                                } else {
                                                    p2TotalPopCount += 23
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health == 8) {
                                        projectiles[i].trapCapacity += 47
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 47
                                                towers[l].updateDPS(47)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 47
                                                } else {
                                                    p2TotalPopCount += 47
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 18) {
                                        projectiles[i].trapCapacity += 104
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 86 + bloons[k].health
                                                towers[l].updateDPS(86 + bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 86 + bloons[k].health
                                                } else {
                                                    p2TotalPopCount += 86 + bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 218) {
                                        projectiles[i].trapCapacity += 616
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 398 + bloons[k].health
                                                towers[l].updateDPS(398 + bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 398 + bloons[k].health
                                                } else {
                                                    p2TotalPopCount += 398 + bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 918) {
                                        projectiles[i].trapCapacity += 3164
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 2246 + bloons[k].health
                                                towers[l].updateDPS(2246 + bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 2246 + bloons[k].health
                                                } else {
                                                    p2TotalPopCount += 2246 + bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    }
                                } else {
                                    if(bloons[k].health <= 8) {
                                        projectiles[i].trapCapacity += bloons[k].health
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 68) {
                                        projectiles[i].trapCapacity += 68
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += bloons[k].health
                                                towers[l].updateDPS(bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += bloons[k].health
                                                } else {
                                                    p2TotalPopCount += bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 68 + Math.ceil(200 * 1.05 ** (round - 50))) {
                                        projectiles[i].trapCapacity += 472
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 204 + bloons[k].health
                                                towers[l].updateDPS(204 + bloons[k].health)
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 204 + bloons[k].health
                                                } else {
                                                    p2TotalPopCount += 204 + bloons[k].health
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    } else if(bloons[k].health <= 68 + Math.ceil(900 * 1.05 ** (round - 50))) {
                                        projectiles[i].trapCapacity += 2588
                                        for(var l = 0; l < towers.length; l++) {
                                            if(towers[l].towerID == projectiles[i].parentID) {
                                                towers[l].popCount += 1688 + Math.ceil(900 * 1.05 ** (round - 50))
                                                towers[l].updateDPS(bloons[k].health + 1688 + Math.ceil(900 * 1.05 ** (round - 50)))
                                                if(towers[l].playerSide == 1) {
                                                    p1TotalPopCount += 1688 + Math.ceil(900 * 1.05 ** (round - 50))
                                                } else {
                                                    p2TotalPopCount += 1688 + Math.ceil(900 * 1.05 ** (round - 50))
                                                }
                                            }
                                        }
                                        images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                        bloons.splice(k, 1)
                                        k--
                                    }
                                }
                                if(projectiles[i].trapCapacity >= 8000) {
                                    moneyText.push(new MoneyText(projectiles[i].x, projectiles[i].y, projectiles[i].trapCapacity))
                                    for(var l = 0; l < towers.length; l++) {
                                        if(towers[l].towerID == projectiles[i].parentID) {
                                            towers[l].cashGenerated += projectiles[i].trapCapacity
                                            towers[l].lastTimeTrapPopped = gameNow()
                                        }
                                    }
                                    if(projectiles[i].playerSide == 1) {
                                        p1money += projectiles[i].trapCapacity
                                        p1TotalCashGenerated += projectiles[i].trapCapacity
                                    } else {
                                        p2money += projectiles[i].trapCapacity
                                        p2TotalCashGenerated += projectiles[i].trapCapacity
                                    }
                                    projectiles.splice(i, 1)
                                    i--
                                }
                            }
                            if(projectiles[i] && projectiles[i].image != "004engiproj.png" && projectiles[i].image != "005engiproj.png") {
                                if(projectiles[i].parentID == 0 && projectiles[i].playerSide == 1) {
                                    p1TotalPopCount += calculatePopCount(projectiles[i].damage, bloons[k].health)
                                } else if(projectiles[i].parentID == 0 && projectiles[i].playerSide == 2) {
                                    p2TotalPopCount += calculatePopCount(projectiles[i].damage, bloons[k].health)
                                }
                                var parentTower = frameTowerByID.get(projectiles[i].parentID)
                                if(parentTower) {
                                    var popAmount = calculatePopCount(projectiles[i].damage, bloons[k].health)
                                    parentTower.popCount += popAmount
                                    parentTower.updateDPS(popAmount)
                                    if(parentTower.playerSide == 1) {
                                        p1TotalPopCount += popAmount
                                    } else {
                                        p2TotalPopCount += popAmount
                                    }
                                }
                                if(bloons[k] && projectiles[i] && projectiles[i].dpsTicks > 0 && projectiles[i].dpsType > bloons[k].dpsType) {
                                    bloons[k].dpsDamage = projectiles[i].dpsDamage
                                    bloons[k].dpsTicks = projectiles[i].dpsTicks
                                    bloons[k].dpsType = projectiles[i].dpsType
                                    bloons[k].dpsLastTick = gameNow() + projectiles[i].dpsTickRate
                                    bloons[k].dpsTickRate = projectiles[i].dpsTickRate
                                    bloons[k].dpsTowerID = projectiles[i].parentID
                                }
                                bloons[k].health -= projectiles[i].damage
                                bloons[k].spawnBloons()
                                if(bloons[k].health <= 8 && bloons[k].pathPos > 0) {
                                    images.push(new Images(bloons[k].x, bloons[k].y, 25, "pop.png", gameNow() + 100, ""))
                                }
                                if(bloons[k].health <= 0) {
                                    bloons.splice(k, 1)
                                    k--
                                }
                                projectiles[i].pierce--
                                if(projectiles[i].image == "042swordproj.png" && projectiles[i].pierce % 25 == 0) {
                                    for(var a = 0; a < 8; a++) {
                                        projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 10 * Math.cos(a * Math.PI/4), 10 * Math.sin(a * Math.PI/4), 15, "002swordproj.png", 1, 3, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                    }
                                } else if(projectiles[i].image == "050swordproj.png" && projectiles[i].pierce % 10 == 0) {
                                    for(var a = 0; a < 8; a++) {
                                        projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 20 * Math.cos(a * Math.PI/4), 20 * Math.sin(a * Math.PI/4), 30, "040swordproj.png", 1, 100, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                    }
                                } else if(projectiles[i].image == "052swordproj.png" && projectiles[i].pierce % 10 == 0) {
                                    for(var a = 0; a < 8; a++) {
                                        projectiles.push(new Projectile(projectiles[i].x, projectiles[i].y, 20 * Math.cos(a * Math.PI/4), 20 * Math.sin(a * Math.PI/4), 30, "042swordproj.png", 1, 100, 0, 0, projectiles[i].parentID, projectiles[i].playerSide, false, -1, 0, 0, 0, 0, 0))
                                    }
                                }
                                if(projectiles[i].pierce <= 0 && projectiles[i].lifespan == -1) {
                                    projectiles.splice(i, 1)
                                    i--
                                }
                            }
                        }
                }
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            var dpsCatchupLimit = getAITrainingGameplayCatchupLimit()
            while(bloons[i] && bloons[i].dpsTicks > 0 && bloons[i].dpsLastTick <= gameNow() && dpsCatchupLimit > 0) {
                for(var l = 0; l < towers.length; l++) {
                    if(towers[l].towerID == bloons[i].dpsTowerID) {
                        towers[l].popCount += calculatePopCount(bloons[i].dpsDamage, bloons[i].health)
                        towers[l].updateDPS(calculatePopCount(bloons[i].dpsDamage, bloons[i].health))
                        if(towers[l].playerSide == 1) {
                            p1TotalPopCount += calculatePopCount(bloons[i].dpsDamage, bloons[i].health)
                        } else {
                            p2TotalPopCount += calculatePopCount(bloons[i].dpsDamage, bloons[i].health)
                        }
                    }
                }
                bloons[i].health -= bloons[i].dpsDamage
                bloons[i].dpsTicks--
                bloons[i].dpsLastTick += bloons[i].dpsTickRate
                bloons[i].spawnBloons()
                if(bloons[i] && bloons[i].health <= 8 && bloons[i].pathPos > 0) {
                    images.push(new Images(bloons[i].x, bloons[i].y, 25, "pop.png", gameNow() + 100, ""))
                }
                if(bloons[i] && bloons[i].health <= 0) {
                    bloons.splice(i, 1)
                    i--
                    break
                }
                dpsCatchupLimit--
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].lifespan == -1) {
                if(projectiles[i].playerSide == 1) {
                    if(projectiles[i].x < canvas.width/8 - projectiles[i].radius || projectiles[i].x > canvas.width / 2 + projectiles[i].radius || projectiles[i].y < 0 - projectiles[i].radius || projectiles[i].y > canvas.height + projectiles[i].radius) {
                        if(projectiles[i].image != "500dartproj.png" && projectiles[i].image != "555dartproj.png" && projectiles[i].image != "000boomerproj.png" && projectiles[i].image != "002boomerproj.png" && projectiles[i].image != "200boomerproj.png" && projectiles[i].image != "202boomerproj.png"  && projectiles[i].image != "500boomerproj.png" && projectiles[i].image != "502boomerproj.png" && projectiles[i].image != "050boomerproj.png" && projectiles[i].image != "052boomerproj.png" && projectiles[i].image != "250boomerproj.png" && projectiles[i].image != "040swordproj.png" && projectiles[i].image != "050swordproj.png" && projectiles[i].image != "042swordproj.png" && projectiles[i].image != "052swordproj.png") {
                            projectiles.splice(i, 1)
                            i--
                        }
                    }
                } else {
                    if(projectiles[i].x < canvas.width/2 - projectiles[i].radius || projectiles[i].x > 7 * canvas.width / 8 + projectiles[i].radius || projectiles[i].y < 0 - projectiles[i].radius || projectiles[i].y > canvas.height + projectiles[i].radius) {
                        if(projectiles[i].image != "500dartproj.png" && projectiles[i].image != "555dartproj.png" && projectiles[i].image != "000boomerproj.png" && projectiles[i].image != "002boomerproj.png" && projectiles[i].image != "200boomerproj.png" && projectiles[i].image != "202boomerproj.png"  && projectiles[i].image != "500boomerproj.png" && projectiles[i].image != "502boomerproj.png" && projectiles[i].image != "050boomerproj.png" && projectiles[i].image != "052boomerproj.png" && projectiles[i].image != "250boomerproj.png" && projectiles[i].image != "040swordproj.png" && projectiles[i].image != "050swordproj.png" && projectiles[i].image != "042swordproj.png" && projectiles[i].image != "052swordproj.png") {
                            projectiles.splice(i, 1)
                            i--
                        }
                    }
                }
            }
        }
        for(var i = bloons.length - 1; i >= 0; i--) {
            if(bloons[i] && bloons[i].pathPos > 0) {
                bloons[i].draw()
            }
        }
        for(var i = 0; i < images.length; i++) {
            images[i].draw()
            if(images[i] && images[i].lifespan <= gameNow()) {
                images.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < bananas.length; i++) {
            if(bananas[i].lifespan <= gameNow()) {
                if(bananas[i].salvage) {
                    if(bananas[i].playerSide == 1) {
                        p1money += Math.round(0.7 * bananas[i].cashGiven)
                        p1TotalCashGenerated += Math.round(0.7 * bananas[i].cashGiven)
                    } else {
                        p2money += Math.round(0.7 * bananas[i].cashGiven)
                        p2TotalCashGenerated += Math.round(0.7 * bananas[i].cashGiven)
                    }
                    for(var l = 0; l < towers.length; l++) {
                        if(towers[l].towerID == bananas[i].parentID) {
                            towers[l].popCount += Math.round(0.7 * bananas[i].cashGiven)
                        }
                    }
                    moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, Math.round(0.7 * bananas[i].cashGiven)))
                }
                bananas.splice(i, 1)
            }
        }
        for(var i = 0; i < bananas.length; i++) {
            bananas[i].draw()
        }
        for(var i = 0; i < moneyText.length; i++) {
            for(var k = 0; k < moneyText.length; k++) {
                if(moneyText[i].x == moneyText[k].x && moneyText[i].y == moneyText[k].y && i != k && moneyText[i].mode != moneyText[k].mode) {
                    moneyText[i].y -= getAITrainingScaledSimulationValue(20)
                }
            }
        }
        for(var i = 0; i < moneyText.length; i++) {
            moneyText[i].update()
            if(moneyText[i].frames >= 30) {
                moneyText.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < moneyText.length; i++) {
            for(var k = 0; k < moneyText.length; k++) {
                if(i != k && moneyText[i] && moneyText[k] && moneyText[i].mode == moneyText[k].mode && moneyText[i].frames == moneyText[k].frames && moneyText[i].x == moneyText[k].x && moneyText[i].y == moneyText[k].y) {
                    moneyText[i].text += moneyText[k].text
                    moneyText.splice(k, 1)
                    k--
                }
            }
        }
        for(var i = 0; i < moneyText.length; i++) {
            moneyText[i].draw()
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].towerType != "sniper" && towers[i].towerType != "mortar") {
                ctx.lineWidth = 3
                ctx.strokeStyle = "black"
                ctx.beginPath()
                ctx.arc
                (
                    towers[i].x,
                    towers[i].y,
                    towers[i].range,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
            } else if(towers[i].selected && towers[i].towerType == "sniper" || towers[i].selected && towers[i].towerType == "mortar") {
                ctx.lineWidth = 3
                ctx.strokeStyle = "black"
                ctx.beginPath()
                ctx.arc
                (
                    towers[i].x,
                    towers[i].y,
                    50,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
            }
        }
        drawUI()
        if(bossMode == true) {
            if(bossCountP1 == 0) {
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.lineWidth = 5
                ctx.textAlign = "center"
                ctx.font = "30px Luckiest Guy"
                if(round <= 40) {
                    ctx.strokeText("Next boss in: " + String((40 - round)/2).toLocaleString(), canvas.width*9/32, 37.5, canvas.width*3/8)
                    ctx.fillText("Next boss in: " + String((40 - round)/2).toLocaleString(), canvas.width*9/32, 37.5, canvas.width*3/8)
                } else {
                    ctx.strokeText("Next boss in: " + String((20 - round%20)/2).toLocaleString(), canvas.width*9/32, 37.5, canvas.width*3/8)
                    ctx.fillText("Next boss in: " + String((20 - round%20)/2).toLocaleString(), canvas.width*9/32, 37.5, canvas.width*3/8)
                }
            }
            if(bossCountP2 == 0) {
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.lineWidth = 5
                ctx.textAlign = "center"
                ctx.font = "30px Luckiest Guy"
                if(round <= 40) {
                    ctx.strokeText("Next boss in: " + String((40 - round)/2).toLocaleString(), canvas.width*23/32, 37.5, canvas.width*3/8)
                    ctx.fillText("Next boss in: " + String((40 - round)/2).toLocaleString(), canvas.width*23/32, 37.5, canvas.width*3/8)
                } else {
                    ctx.strokeText("Next boss in: " + String((20 - round%20)/2).toLocaleString(), canvas.width*23/32, 37.5, canvas.width*3/8)
                    ctx.fillText("Next boss in: " + String((20 - round%20)/2).toLocaleString(), canvas.width*23/32, 37.5, canvas.width*3/8)
                }
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].isBoss && bloons[i].playerSide == 1) {
                ctx.fillStyle = "red"
                ctx.strokeStyle = "darkred"
                ctx.lineWidth = 5
                ctx.fillRect(canvas.width/8, 2.5, canvas.width*13/40 * (bloons[i].health/bloons[i].maxHealth), 50)
                ctx.strokeRect(canvas.width/8, 2.5, canvas.width*13/40, 50)
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*13/200, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*13/200, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*26/200, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*26/200, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*39/200, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*39/200, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*52/200, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*52/200, 50)
                ctx.stroke()
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.textAlign = "center"
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText(bloons[i].health.toLocaleString() + " / " + bloons[i].maxHealth.toLocaleString() + " - " + (Math.ceil(100*bloons[i].health/bloons[i].maxHealth)) + "%", canvas.width*23/80, 37.5, canvas.width*3/8)
                ctx.fillText(bloons[i].health.toLocaleString() + " / " + bloons[i].maxHealth.toLocaleString() + " - " + (Math.ceil(100*bloons[i].health/bloons[i].maxHealth)) + "%", canvas.width*23/80, 37.5, canvas.width*3/8)
                ctx.font = "25px Luckiest Guy"
                ctx.strokeText("Tier " + String(Math.floor(round/20) - 1).toLocaleString(), canvas.width*23/80, 75, canvas.width*3/8)
                ctx.fillText("Tier " + String(Math.floor(round/20) - 1).toLocaleString(), canvas.width*23/80, 75, canvas.width*3/8)
            }
            if(bloons[i].isBoss && bloons[i].playerSide == 2) {
                ctx.fillStyle = "red"
                ctx.strokeStyle = "darkred"
                ctx.lineWidth = 5
                ctx.fillRect(canvas.width/8 + canvas.width * 17/40, 2.5, canvas.width*13/40 * (bloons[i].health/bloons[i].maxHealth), 50)
                ctx.strokeRect(canvas.width/8 + canvas.width * 17/40, 2.5, canvas.width*13/40, 50)
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*13/200 + canvas.width * 17/40, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*13/200 + canvas.width * 17/40, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*26/200 + canvas.width * 17/40, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*26/200 + canvas.width * 17/40, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*39/200 + canvas.width * 17/40, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*39/200 + canvas.width * 17/40, 50)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(canvas.width/8 + canvas.width*52/200 + canvas.width * 17/40, 0)
                ctx.lineTo(canvas.width/8 + canvas.width*52/200 + canvas.width * 17/40, 50)
                ctx.stroke()
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.textAlign = "center"
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText(bloons[i].health.toLocaleString() + " / " + bloons[i].maxHealth.toLocaleString() + " - " + (Math.ceil(100*bloons[i].health/bloons[i].maxHealth)) + "%", canvas.width*23/80 + canvas.width * 17/40, 37.5, canvas.width*3/8)
                ctx.fillText(bloons[i].health.toLocaleString() + " / " + bloons[i].maxHealth.toLocaleString() + " - " + (Math.ceil(100*bloons[i].health/bloons[i].maxHealth)) + "%", canvas.width*23/80 + canvas.width * 17/40, 37.5, canvas.width*3/8)
                ctx.font = "25px Luckiest Guy"
                ctx.strokeText("Tier " + String(Math.floor(round/20) - 1).toLocaleString(), canvas.width*23/80 + canvas.width * 17/40, 75, canvas.width*3/8)
                ctx.fillText("Tier " + String(Math.floor(round/20) - 1).toLocaleString(), canvas.width*23/80 + canvas.width * 17/40, 75, canvas.width*3/8)
            }
        }
        var boostTextP1 = 0
        var boostTextP2 = 0
        var boostTextP1DrawCounter = 0
        var boostTextP2DrawCounter = 0
        for(var i = 0; i < images2.length; i++) {
            if(images2[i].x < canvas.width/2) {
                boostTextP1++
            } else if(images2[i].x > canvas.width/2) {
                boostTextP2++
            }
        }
        for(var i = 0; i < images2.length; i++) {
            if(images2[i].x < canvas.width/2) {
                images2[i].y = canvas.height/2 - (boostTextP1 - 1) * canvas.height/16 + boostTextP1DrawCounter * canvas.height/8
                boostTextP1DrawCounter++
            } else if(images2[i].x > canvas.width/2) {
                images2[i].y = canvas.height/2 - (boostTextP2 - 1) * canvas.height/16 + boostTextP2DrawCounter * canvas.height/8
                boostTextP2DrawCounter++
            }
        }
        for(var i = 0; i < images2.length; i++) {
            images2[i].draw()
            if(images2[i] && images2[i].lifespan <= gameNow()) {
                images2.splice(i, 1)
                i--
            }
        }
        if(aiEnabled) {
            cursor[0].draw()
            cursor[1].draw()
        } else if(practiceMode && nonPlayableSide == 1) {
            cursor[1].draw()
        } else if(practiceMode && nonPlayableSide == 2) {
            cursor[0].draw()
        } else if(practiceMode == false) {
            cursor[0].draw()
            cursor[1].draw()
        }
        drawAITrainingTrueSelfPlayOverlay()
        if(typeof updateLocalMatchCollectionTelemetry == "function") {
            updateLocalMatchCollectionTelemetry()
        }
        if(p1lives <= 0 || p2lives <= 0) {
            gameOver = true
            if(typeof finalizeLocalMatchCollection == "function") {
                finalizeLocalMatchCollection()
            }
        }
    } else {
        if(isAITrainingTrueSelfPlayActive()) {
            nativeSetTimeout(animate, getAITrainingAnimationDelayMs())
        }
        ctx.fillStyle = "darkblue"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 7
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = "40px Luckiest Guy"
        ctx.textAlign = "center"
        if(p1lives > 0 && p2lives <= 0) {
            ctx.strokeText("Victory!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.strokeText("Defeat!", 3*canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Victory!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Defeat!", 3*canvas.width/4, canvas.height/8, canvas.width)
            p2lives = 0
        } else if(p1lives <= 0 && p2lives > 0) {
            ctx.strokeText("Defeat!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.strokeText("Victory!", 3*canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Defeat!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Victory!", 3*canvas.width/4, canvas.height/8, canvas.width)
            p1lives = 0
        } else {
            ctx.strokeText("Tie!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.strokeText("Tie!", 3*canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Tie!", canvas.width/4, canvas.height/8, canvas.width)
            ctx.fillText("Tie!", 3*canvas.width/4, canvas.height/8, canvas.width)
            p1lives = 0
            p2lives = 0
        }
        if(Math.floor((gameNow() - timeGameStarted)/1000)%60 >= 10) {
            ctx.strokeText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.fillText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 3*canvas.height/16, canvas.width/2)
        } else {
            ctx.strokeText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":0" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 3*canvas.height/16, canvas.width/2)
            ctx.fillText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":0" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 3*canvas.height/16, canvas.width/2)
        }
        ctx.strokeText("Money: $" + Math.floor(p1money).toLocaleString(), canvas.width/4, canvas.height/8 + canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Money: $" + Math.floor(p2money).toLocaleString(), 3*canvas.width/4, canvas.height/8 + canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Eco: \u25b2" + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), canvas.width/4, canvas.height/8 + 2*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Eco: \u25b2" + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 2*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Lives: \u2764" + p1lives.toLocaleString(), canvas.width/4, canvas.height/8 + 3*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Lives: \u2764" + p2lives.toLocaleString(), 3*canvas.width/4, canvas.height/8 + 3*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Total Damage: " + p1TotalPopCount.toLocaleString(), canvas.width/4, canvas.height/8 + 4*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Total Damage: " + p2TotalPopCount.toLocaleString(), 3*canvas.width/4, canvas.height/8 + 4*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated w/o Eco: $" + Math.floor(p1TotalCashGenerated).toLocaleString(), canvas.width/4, canvas.height/8 + 5*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated w/o Eco: $" + Math.floor(p2TotalCashGenerated).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 5*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated w/ Eco only: $" + Math.floor(p1CashGenWithEco).toLocaleString(), canvas.width/4, canvas.height/8 + 6*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated w/ Eco only: $" + Math.floor(p2CashGenWithEco).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 6*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated inc. Eco: $" + Math.floor(p1TotalCashGenerated + p1CashGenWithEco).toLocaleString(), canvas.width/4, canvas.height/8 + 7*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Cash Generated inc. Eco: $" + Math.floor(p2TotalCashGenerated + p2CashGenWithEco).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 7*canvas.height*3/32, canvas.width/2)
        ctx.strokeText("Round " + Math.trunc(round/2), canvas.width/2, canvas.height/8, canvas.width/2)
        var collectedCommunityMatch = aiEnabled || selectedMenuMode == "local" && practiceMode == false && bossMode == false
        var aiRematchMessage = collectedCommunityMatch && AI_CROSS_MATCH_LEARNING_ENABLED ? (aiPersistenceState.contributionInFlight || aiPersistenceState.pendingContributions > 0 ? "Refresh after the global AI contribution finishes syncing..." : "Refresh to rematch! This match contributed to the global AI.") : "Refresh to rematch!"
        ctx.strokeText(aiRematchMessage, canvas.width/2, canvas.height*7/8, canvas.width/2)
        ctx.fillText("Money: $" + Math.floor(p1money).toLocaleString(), canvas.width/4, canvas.height/8 + canvas.height*3/32, canvas.width/2)
        ctx.fillText("Money: $" + Math.floor(p2money).toLocaleString(), 3*canvas.width/4, canvas.height/8 + canvas.height*3/32, canvas.width/2)
        ctx.fillText("Eco: \u25b2" + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), canvas.width/4, canvas.height/8 + 2*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Eco: \u25b2" + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 2*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Lives: \u2764" + p1lives.toLocaleString(), canvas.width/4, canvas.height/8 + 3*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Lives: \u2764" + p2lives.toLocaleString(), 3*canvas.width/4, canvas.height/8 + 3*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Total Damage: " + p1TotalPopCount.toLocaleString(), canvas.width/4, canvas.height/8 + 4*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Total Damage: " + p2TotalPopCount.toLocaleString(), 3*canvas.width/4, canvas.height/8 + 4*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated w/o Eco: $" + Math.floor(p1TotalCashGenerated).toLocaleString(), canvas.width/4, canvas.height/8 + 5*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated w/o Eco: $" + Math.floor(p2TotalCashGenerated).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 5*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated w/ Eco only: $" + Math.floor(p1CashGenWithEco).toLocaleString(), canvas.width/4, canvas.height/8 + 6*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated w/ Eco only: $" + Math.floor(p2CashGenWithEco).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 6*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated inc. Eco: $" + Math.floor(p1TotalCashGenerated + p1CashGenWithEco).toLocaleString(), canvas.width/4, canvas.height/8 + 7*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Cash Generated inc. Eco: $" + Math.floor(p2TotalCashGenerated + p2CashGenWithEco).toLocaleString(), 3*canvas.width/4, canvas.height/8 + 7*canvas.height*3/32, canvas.width/2)
        ctx.fillText("Round " + Math.trunc(round/2), canvas.width/2, canvas.height/8, canvas.width/2)
        ctx.fillText(aiRematchMessage, canvas.width/2, canvas.height*7/8, canvas.width/2)
        drawAITrainingTrueSelfPlayOverlay()
        var p1HighestDamageTower = -1
        var p2HighestDamageTower = -1
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].playerSide == 1 && towers[i].towerType != "farm" && towers[i].towerType != "farmer" && p1HighestDamageTower == -1 || towers[i].playerSide == 1 && towers[i].towerType != "farm" && towers[i].towerType != "farmer" && towers[i].popCount > towers[p1HighestDamageTower].popCount) {
                p1HighestDamageTower = i
            } else if(towers[i].playerSide == 2 && towers[i].towerType != "farm" && towers[i].towerType != "farmer" && p2HighestDamageTower == -1 || towers[i].playerSide == 2 && towers[i].towerType != "farm" && towers[i].towerType != "farmer" && towers[i].popCount > towers[p2HighestDamageTower].popCount) {
                p2HighestDamageTower = i
            }
        }
        if(p1HighestDamageTower == -1) {
            drawAsset(UITowers[0].image, canvas.width/4 - 30, canvas.height*7/8 - 30, 60, 60)
            ctx.lineWidth = 6
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "35px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("0-0-0", canvas.width/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.fillText("0-0-0", canvas.width/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "40px Luckiest Guy"
            ctx.strokeText("Star Tower Pops: 0", canvas.width/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
            ctx.fillText("Star Tower Pops: 0", canvas.width/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
        } else {
            var p1StarTowerImage = ""
            if(towers[p1HighestDamageTower].path1Upgrades != 5 && towers[p1HighestDamageTower].path2Upgrades != 5 && towers[p1HighestDamageTower].path3Upgrades != 5) {
                p1StarTowerImage = String(towers[p1HighestDamageTower].path1Upgrades) + towers[p1HighestDamageTower].path2Upgrades + towers[p1HighestDamageTower].path3Upgrades + towers[p1HighestDamageTower].towerType + ".png"
            } else if(towers[p1HighestDamageTower].path1Upgrades == 5) {
                p1StarTowerImage = "500" + towers[p1HighestDamageTower].towerType + ".png"
            } else if(towers[p1HighestDamageTower].path2Upgrades == 5) {
                p1StarTowerImage = "050" + towers[p1HighestDamageTower].towerType + ".png"
            } else if(towers[p1HighestDamageTower].path3Upgrades == 5) {
                p1StarTowerImage = "005" + towers[p1HighestDamageTower].towerType + ".png"
            }
            drawAsset(p1StarTowerImage, canvas.width/4 - 30, canvas.height*7/8 - 30, 60, 60)
            ctx.lineWidth = 6
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "35px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText(towers[p1HighestDamageTower].path1Upgrades + "-" + towers[p1HighestDamageTower].path2Upgrades + "-" + towers[p1HighestDamageTower].path3Upgrades + " " + towers[p1HighestDamageTower].towerType.charAt(0).toUpperCase() + towers[p1HighestDamageTower].towerType.slice(1), canvas.width/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.fillText(towers[p1HighestDamageTower].path1Upgrades + "-" + towers[p1HighestDamageTower].path2Upgrades + "-" + towers[p1HighestDamageTower].path3Upgrades + " " + towers[p1HighestDamageTower].towerType.charAt(0).toUpperCase() + towers[p1HighestDamageTower].towerType.slice(1), canvas.width/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "40px Luckiest Guy"
            ctx.strokeText("Star Tower Pops: " + towers[p1HighestDamageTower].popCount.toLocaleString(), canvas.width/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
            ctx.fillText("Star Tower Pops: " + towers[p1HighestDamageTower].popCount.toLocaleString(), canvas.width/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
        }
        if(p2HighestDamageTower == -1) {
            drawAsset(UITowers[3].image, canvas.width*3/4 - 30, canvas.height*7/8 - 30, 60, 60)
            ctx.lineWidth = 6
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "35px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("0-0-0", canvas.width*3/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.fillText("0-0-0", canvas.width*3/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "40px Luckiest Guy"
            ctx.strokeText("Star Tower Pops: 0", canvas.width*3/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
            ctx.fillText("Star Tower Pops: 0", canvas.width*3/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
        } else {
            var p2StarTowerImage = ""
            if(towers[p2HighestDamageTower].path1Upgrades != 5 && towers[p2HighestDamageTower].path2Upgrades != 5 && towers[p2HighestDamageTower].path3Upgrades != 5) {
                p2StarTowerImage = String(towers[p2HighestDamageTower].path1Upgrades) + towers[p2HighestDamageTower].path2Upgrades + towers[p2HighestDamageTower].path3Upgrades + towers[p2HighestDamageTower].towerType + ".png"
            } else if(towers[p2HighestDamageTower].path1Upgrades == 5) {
                p2StarTowerImage = "500" + towers[p2HighestDamageTower].towerType + ".png"
            } else if(towers[p2HighestDamageTower].path2Upgrades == 5) {
                p2StarTowerImage = "050" + towers[p2HighestDamageTower].towerType + ".png"
            } else if(towers[p2HighestDamageTower].path3Upgrades == 5) {
                p2StarTowerImage = "005" + towers[p2HighestDamageTower].towerType + ".png"
            }
            drawAsset(p2StarTowerImage, canvas.width*3/4 - 30, canvas.height*7/8 - 30, 60, 60)

            ctx.lineWidth = 6
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "35px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText(towers[p2HighestDamageTower].path1Upgrades + "-" + towers[p2HighestDamageTower].path2Upgrades + "-" + towers[p2HighestDamageTower].path3Upgrades + " " + towers[p2HighestDamageTower].towerType.charAt(0).toUpperCase() + towers[p2HighestDamageTower].towerType.slice(1), canvas.width*3/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.fillText(towers[p2HighestDamageTower].path1Upgrades + "-" + towers[p2HighestDamageTower].path2Upgrades + "-" + towers[p2HighestDamageTower].path3Upgrades + " " + towers[p2HighestDamageTower].towerType.charAt(0).toUpperCase() + towers[p2HighestDamageTower].towerType.slice(1), canvas.width*3/4, canvas.height*7/8 - 30, canvas.width/2)
            ctx.lineWidth = 7
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = "40px Luckiest Guy"
            ctx.strokeText("Star Tower Pops: " + towers[p2HighestDamageTower].popCount.toLocaleString(), canvas.width*3/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
            ctx.fillText("Star Tower Pops: " + towers[p2HighestDamageTower].popCount.toLocaleString(), canvas.width*3/4, canvas.height*7/8 + canvas.height*3/32, canvas.width/2)
        }
    }
        ctx.lineWidth = 3
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = "20px Luckiest Guy"
        ctx.textAlign = "right"
        ctx.strokeText(versionText, canvas.width, canvas.height*47/48, canvas.width/4)
        ctx.fillText(versionText, canvas.width, canvas.height*47/48, canvas.width/4)
        ctx.textAlign = "left"
        ctx.strokeText(Math.floor(fpsCounter/2).toLocaleString() + " (" + Math.floor(fpsCounter*100/120) + "%)", 0, canvas.height*47/48, canvas.width/4)
        ctx.fillText(Math.floor(fpsCounter/2).toLocaleString() + " (" + Math.floor(fpsCounter*100/120) + "%)", 0, canvas.height*47/48, canvas.width/4)
    } finally {
        if(previousCtx) {
            ctx = previousCtx
        }
    }
    if(headlessRenderingActive) {
        ctx.fillStyle = "rgba(10, 14, 18, 0.98)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.textAlign = "center"
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.lineWidth = 6
        ctx.font = "42px Luckiest Guy"
        ctx.strokeText("Headless Self-Play", canvas.width / 2, canvas.height * 0.08, canvas.width * 0.8)
        ctx.fillText("Headless Self-Play", canvas.width / 2, canvas.height * 0.08, canvas.width * 0.8)
        ctx.font = "24px Luckiest Guy"
        ctx.strokeText("Rendering disabled above x2 for faster training", canvas.width / 2, canvas.height * 0.12, canvas.width * 0.86)
        ctx.fillText("Rendering disabled above x2 for faster training", canvas.width / 2, canvas.height * 0.12, canvas.width * 0.86)
        ctx.strokeText("Clock " + getHeadlessTrainingMatchClockText() + "  |  Round " + Math.max(1, Math.floor(round / 2)).toLocaleString() + "  |  Speed " + getAITrainingSpeedLabel(), canvas.width / 2, canvas.height * 0.16, canvas.width * 0.9)
        ctx.fillText("Clock " + getHeadlessTrainingMatchClockText() + "  |  Round " + Math.max(1, Math.floor(round / 2)).toLocaleString() + "  |  Speed " + getAITrainingSpeedLabel(), canvas.width / 2, canvas.height * 0.16, canvas.width * 0.9)
        ctx.strokeText("Matches " + aiTrainingState.trueSelfPlayMatches.toLocaleString() + "  |  Left Wins " + aiTrainingState.trueSelfPlayLeftWins.toLocaleString() + "  |  Right Wins " + aiTrainingState.trueSelfPlayRightWins.toLocaleString() + "  |  Ties " + aiTrainingState.trueSelfPlayTies.toLocaleString(), canvas.width / 2, canvas.height * 0.2, canvas.width * 0.9)
        ctx.fillText("Matches " + aiTrainingState.trueSelfPlayMatches.toLocaleString() + "  |  Left Wins " + aiTrainingState.trueSelfPlayLeftWins.toLocaleString() + "  |  Right Wins " + aiTrainingState.trueSelfPlayRightWins.toLocaleString() + "  |  Ties " + aiTrainingState.trueSelfPlayTies.toLocaleString(), canvas.width / 2, canvas.height * 0.2, canvas.width * 0.9)
        ctx.strokeText(getHeadlessTrainingPowersCountText(), canvas.width / 2, canvas.height * 0.24, canvas.width * 0.9)
        ctx.fillText(getHeadlessTrainingPowersCountText(), canvas.width / 2, canvas.height * 0.24, canvas.width * 0.9)

        drawHeadlessTrainingSideStats(PLAYER_SIDE.left, canvas.width / 4)
        drawHeadlessTrainingSideStats(PLAYER_SIDE.right, canvas.width * 3 / 4)
        drawHeadlessTrainingStarTower(PLAYER_SIDE.left, canvas.width / 4, 0)
        drawHeadlessTrainingStarTower(PLAYER_SIDE.right, canvas.width * 3 / 4, 3)
        drawAITrainingTrueSelfPlayOverlay()

        ctx.lineWidth = 3
        ctx.font = "20px Luckiest Guy"
        ctx.textAlign = "right"
        ctx.strokeText(versionText, canvas.width, canvas.height*47/48, canvas.width/4)
        ctx.fillText(versionText, canvas.width, canvas.height*47/48, canvas.width/4)
        ctx.textAlign = "left"
        ctx.strokeText(Math.floor(fpsCounter/2).toLocaleString() + " (" + Math.floor(fpsCounter*100/120) + "%)", 0, canvas.height*47/48, canvas.width/4)
        ctx.fillText(Math.floor(fpsCounter/2).toLocaleString() + " (" + Math.floor(fpsCounter*100/120) + "%)", 0, canvas.height*47/48, canvas.width/4)
    }
}
animate()
