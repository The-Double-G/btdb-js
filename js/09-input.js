// Input handling and gameplay controls.

// Core input primitives.

function updateMousePosition(event) {
    mouseX = event.x
    mouseY = event.y
}

function isKeyReady(keyCode) {
    return gameNow() >= keyCooldowns[keyCode] + keyMsCooldown
}

function markKeyUsed(keyCode) {
    keyCooldowns[keyCode] = gameNow()
}

function handlePauseToggleInput(eventType) {
    if(eventType == "keydown" && keyState[KEY_CODES.pause] && pauseToggleReady()) {
        markPauseToggleUsed()
        toggleGamePaused()
        return true
    }

    return false
}

function moveCursor(side, dx, dy) {
    var activeCursor = players[side].cursor
    var minX = 0
    var maxX = canvas.width / 2

    if(side == PLAYER_SIDE.left) {
        minX = gameStarted ? canvas.width / 8 : 0
        maxX = canvas.width / 2
    } else {
        minX = canvas.width / 2
        maxX = gameStarted ? 7 * canvas.width / 8 : canvas.width
    }

    activeCursor.x = clamp(activeCursor.x + dx, minX, maxX)
    activeCursor.y = clamp(activeCursor.y + dy, 0, canvas.height)
}

// Shared movement across both player cursors.
function handleCursorMovementInput() {
    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1Up] && isKeyReady(KEY_CODES.p1Up)) {
        markKeyUsed(KEY_CODES.p1Up)
        moveCursor(PLAYER_SIDE.left, 0, -15)
    }
    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1Left] && isKeyReady(KEY_CODES.p1Left)) {
        markKeyUsed(KEY_CODES.p1Left)
        moveCursor(PLAYER_SIDE.left, -15, 0)
    }
    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1Down] && isKeyReady(KEY_CODES.p1Down)) {
        markKeyUsed(KEY_CODES.p1Down)
        moveCursor(PLAYER_SIDE.left, 0, 15)
    }
    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1Right] && isKeyReady(KEY_CODES.p1Right)) {
        markKeyUsed(KEY_CODES.p1Right)
        moveCursor(PLAYER_SIDE.left, 15, 0)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2Up] && isKeyReady(KEY_CODES.p2Up)) {
        markKeyUsed(KEY_CODES.p2Up)
        moveCursor(PLAYER_SIDE.right, 0, -15)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2Left] && isKeyReady(KEY_CODES.p2Left)) {
        markKeyUsed(KEY_CODES.p2Left)
        moveCursor(PLAYER_SIDE.right, -15, 0)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2Down] && isKeyReady(KEY_CODES.p2Down)) {
        markKeyUsed(KEY_CODES.p2Down)
        moveCursor(PLAYER_SIDE.right, 0, 15)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2Right] && isKeyReady(KEY_CODES.p2Right)) {
        markKeyUsed(KEY_CODES.p2Right)
        moveCursor(PLAYER_SIDE.right, 15, 0)
    }
}

function processHeldCursorMovement() {
    if(gamePaused || isFrontMenuOpen()) {
        return
    }

    handleCursorMovementInput()
}

// Shared menu selection and in-game tower selection.
function selectPregameItemsAt(side, x, y) {
    var selectedAnything = false
    for(var i = 0; i < UITowers.length; i++) {
        if(UITowers[i].clicked(x, y) && players[side].towers.length < 3) {
            players[side].towers.push(UITowers[i].image)
            UITowers.splice(i, 1)
            i--
            selectedAnything = true
        }
    }
    for(var j = 0; j < UIBoosts.length; j++) {
        if(UIBoosts[j].clicked(x, y) && players[side].boostTypes.length < 2) {
            players[side].boostTypes.push(UIBoosts[j].image)
            UIBoosts.splice(j, 1)
            j--
            selectedAnything = true
        }
    }

    return selectedAnything
}

function selectTowerAt(side, x, y) {
    var selectedTower = null
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower) {
            continue
        }

        if(tower.playerSide == side) {
            tower.selected = tower.clicked(x, y)
            if(tower.selected) {
                selectedTower = tower
            }
        }
    }

    return selectedTower
}

function selectTowerObject(side, tower) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i] && towers[i].playerSide == side) {
            towers[i].selected = towers[i] == tower
        }
    }

    return tower
}

function trySelectLoadoutOrTower(side) {
    if(isHumanControlledSide(side) == false) {
        return
    }

    var selectKey = side == PLAYER_SIDE.left ? KEY_CODES.p1Select : KEY_CODES.p2Select
    if(!keyState[selectKey] || !isKeyReady(selectKey)) {
        return
    }

    markKeyUsed(selectKey)

    if(gameStarted == false) {
        selectPregameItemsAt(side, players[side].cursor.x, players[side].cursor.y)
        return
    }

    selectTowerAt(side, players[side].cursor.x, players[side].cursor.y)
}

// Pregame-only toggles.
function handlePregameInput() {
    if(keyState[KEY_CODES.p1Decal] && isKeyReady(KEY_CODES.p1Decal)) {
        markKeyUsed(KEY_CODES.p1Decal)
        players[PLAYER_SIDE.left].decalEnabled = !players[PLAYER_SIDE.left].decalEnabled
    }
    if(keyState[KEY_CODES.p2Decal] && isKeyReady(KEY_CODES.p2Decal)) {
        markKeyUsed(KEY_CODES.p2Decal)
        players[PLAYER_SIDE.right].decalEnabled = !players[PLAYER_SIDE.right].decalEnabled
    }
    if(keyState[KEY_CODES.cycleMap] && isKeyReady(KEY_CODES.cycleMap)) {
        markKeyUsed(KEY_CODES.cycleMap)
        mapNumber++
        if(mapNumber > 1) {
            mapNumber = 0
        }
    }
    if(aiEnabled == false && keyState[KEY_CODES.togglePractice] && isKeyReady(KEY_CODES.togglePractice)) {
        markKeyUsed(KEY_CODES.togglePractice)
        practiceMode = !practiceMode
        if(practiceMode && nonPlayableSide != 1 && nonPlayableSide != 2) {
            nonPlayableSide = 2
        }
    }
    if(aiEnabled == false && keyState[KEY_CODES.cyclePracticeSide] && isKeyReady(KEY_CODES.cyclePracticeSide)) {
        markKeyUsed(KEY_CODES.cyclePracticeSide)
        nonPlayableSide++
        if(nonPlayableSide > 2) {
            nonPlayableSide = 1
        }
    }
    if(keyState[KEY_CODES.toggleBossMode] && isKeyReady(KEY_CODES.toggleBossMode)) {
        markKeyUsed(KEY_CODES.toggleBossMode)
        bossMode = !bossMode
    }
}

// Boost activation and bloon-send helpers.
function getBoostCount(side, slot) {
    if(side == PLAYER_SIDE.left) {
        return slot == 0 ? p1Boost1Count : p1Boost2Count
    }
    return slot == 0 ? p2Boost1Count : p2Boost2Count
}

function setBoostCount(side, slot, value) {
    if(side == PLAYER_SIDE.left) {
        if(slot == 0) {
            p1Boost1Count = value
        } else {
            p1Boost2Count = value
        }
        return
    }
    if(slot == 0) {
        p2Boost1Count = value
    } else {
        p2Boost2Count = value
    }
}

function getBoostExpires(side, slot) {
    if(side == PLAYER_SIDE.left) {
        return slot == 0 ? p1Boost1Expires : p1Boost2Expires
    }
    return slot == 0 ? p2Boost1Expires : p2Boost2Expires
}

function setBoostExpires(side, slot, value) {
    if(side == PLAYER_SIDE.left) {
        if(slot == 0) {
            p1Boost1Expires = value
        } else {
            p1Boost2Expires = value
        }
        return
    }
    if(slot == 0) {
        p2Boost1Expires = value
    } else {
        p2Boost2Expires = value
    }
}

function showBoostText(side, text) {
    var textX = canvas.width * (side == PLAYER_SIDE.left ? 5 / 16 : 11 / 16)
    images2.push(new Images(textX, canvas.height / 2, canvas.height / 12, "", gameNow() + 1000, text))
}

function showEnemySideBoostText(side, text) {
    var textX = canvas.width * (side == PLAYER_SIDE.left ? 11 / 16 : 5 / 16)
    images2.push(new Images(textX, canvas.height / 2, canvas.height / 12, "", gameNow() + 1000, text))
}

function applyLightningBoost(side) {
    if(typeof queueLightningBoostForSide == "function") {
        queueLightningBoostForSide(side)
    }
}

function activateBoost(side, slot) {
    var boostType = players[side].boostTypes[slot]
    if(boostType == "towerboost.png") {
        showBoostText(side, "Tower Boost")
        if(side == PLAYER_SIDE.left) {
            p1TowerBoostVisual = gameNow()
        } else {
            p2TowerBoostVisual = gameNow()
        }
    } else if(boostType == "bloonboost.png") {
        showEnemySideBoostText(side, "Bloon Boost")
        if(side == PLAYER_SIDE.left) {
            p1BloonBoostVisual = gameNow()
        } else {
            p2BloonBoostVisual = gameNow()
        }
    } else if(boostType == "lightningboost.png") {
        showBoostText(side, "Lightning")
        applyLightningBoost(side)
    } else if(boostType == "slowboost.png") {
        showEnemySideBoostText(side, "Slow")
        if(side == PLAYER_SIDE.left) {
            p1SlowBoostVisual = gameNow()
        } else {
            p2SlowBoostVisual = gameNow()
        }
    } else if(boostType == "ecoboost.png") {
        showBoostText(side, "Eco Boost")
        players[side].eco += Math.round(BOOST_SETTINGS.ecoBoostRoundFactor * round)
        moneyText.push(new MiscText(canvas.width * (side == PLAYER_SIDE.left ? 5/32 : 27/32), canvas.height / 8, Math.round(BOOST_SETTINGS.ecoBoostRoundFactor * round), "eco"))
    }
}

function tryUseBoost(side, slot, keyCode) {
    if(!keyState[keyCode] || !isKeyReady(keyCode)) {
        return
    }

    markKeyUsed(keyCode)
    if(getBoostCount(side, slot) > 0 && getBoostExpires(side, slot) + BOOST_SETTINGS.cooldownMs <= gameNow()) {
        activateBoost(side, slot)
        setBoostExpires(side, slot, gameNow())
        setBoostCount(side, slot, getBoostCount(side, slot) - 1)
    }
}

function cycleSelectedBloon(side, direction) {
    if(side == PLAYER_SIDE.left) {
        players[side].selectedBloon += direction
        if(players[side].selectedBloon > 9) {
            players[side].selectedBloon = 0
        } else if(players[side].selectedBloon < 0) {
            players[side].selectedBloon = 9
        }
        return
    }

    players[side].selectedBloon += direction
    if(players[side].selectedBloon > 19) {
        players[side].selectedBloon = 10
    } else if(players[side].selectedBloon < 10) {
        players[side].selectedBloon = 19
    }
}

function tryQueueSelectedBloon(side, keyCode) {
    if(!keyState[keyCode] || !isKeyReady(keyCode)) {
        return
    }

    var selectedBloon = displayBloons[players[side].selectedBloon]
    if(players[side].bloonQueue.length < 6 && selectedBloon.image != "locked.png" && players[side].money >= selectedBloon.cost) {
        markKeyUsed(keyCode)
        players[side].bloonQueue.push(new SentBloonQueue(selectedBloon.health, selectedBloon.cost, selectedBloon.eco, selectedBloon.spacing, selectedBloon.count))
        players[side].money -= selectedBloon.cost
        players[side].eco += selectedBloon.eco
        if(players[side].eco < 0) {
            players[side].eco = 0
        }
    }
}

function handleSharedLiveHotkeys() {
    if(isHumanControlledSide(PLAYER_SIDE.left)) {
        tryUseBoost(PLAYER_SIDE.left, 0, KEY_CODES.p1Boost1)
        tryUseBoost(PLAYER_SIDE.left, 1, KEY_CODES.p1Boost2)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right)) {
        tryUseBoost(PLAYER_SIDE.right, 0, KEY_CODES.p2Boost1)
        tryUseBoost(PLAYER_SIDE.right, 1, KEY_CODES.p2Boost2)
    }

    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1BloonNext] && isKeyReady(KEY_CODES.p1BloonNext)) {
        markKeyUsed(KEY_CODES.p1BloonNext)
        cycleSelectedBloon(PLAYER_SIDE.left, 1)
    }
    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1BloonPrev] && isKeyReady(KEY_CODES.p1BloonPrev)) {
        markKeyUsed(KEY_CODES.p1BloonPrev)
        cycleSelectedBloon(PLAYER_SIDE.left, -1)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2BloonNext] && isKeyReady(KEY_CODES.p2BloonNext)) {
        markKeyUsed(KEY_CODES.p2BloonNext)
        cycleSelectedBloon(PLAYER_SIDE.right, 1)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2BloonPrev] && isKeyReady(KEY_CODES.p2BloonPrev)) {
        markKeyUsed(KEY_CODES.p2BloonPrev)
        cycleSelectedBloon(PLAYER_SIDE.right, -1)
    }

    if(isHumanControlledSide(PLAYER_SIDE.left)) {
        tryQueueSelectedBloon(PLAYER_SIDE.left, KEY_CODES.p1Send)
    }
    if(isHumanControlledSide(PLAYER_SIDE.right)) {
        tryQueueSelectedBloon(PLAYER_SIDE.right, KEY_CODES.p2Send)
    }

    if(isHumanControlledSide(PLAYER_SIDE.left) && keyState[KEY_CODES.p1AutoEco] && isKeyReady(KEY_CODES.p1AutoEco)) {
        markKeyUsed(KEY_CODES.p1AutoEco)
        players[PLAYER_SIDE.left].autoEco = !players[PLAYER_SIDE.left].autoEco
    }
    if(isHumanControlledSide(PLAYER_SIDE.right) && keyState[KEY_CODES.p2AutoEco] && isKeyReady(KEY_CODES.p2AutoEco)) {
        markKeyUsed(KEY_CODES.p2AutoEco)
        players[PLAYER_SIDE.right].autoEco = !players[PLAYER_SIDE.right].autoEco
    }
}

// Upgrade and placement helpers replace the old mirrored player-one/player-two branches.
const LOADOUT_TOWER_CONFIG = {
    "000dart.png": { radius: 30, range: 125, towerType: "dart", price: () => baseDartPrice },
    "000tack.png": { radius: 30, range: 100, towerType: "tack", price: () => baseTackPrice },
    "000bomb.png": { radius: 30, range: 150, towerType: "bomb", price: () => baseBombPrice },
    "000ice.png": { radius: 30, range: 70, towerType: "ice", price: () => baseIcePrice },
    "000super.png": { radius: 30, range: 200, towerType: "super", price: () => baseSuperPrice },
    "000farm.png": { radius: 45, range: 200, towerType: "farm", price: () => baseFarmPrice },
    "000ninja.png": { radius: 30, range: 175, towerType: "ninja", price: () => baseNinjaPrice },
    "000dartling.png": { radius: 30, range: 50, towerType: "dartling", price: () => baseDartlingPrice },
    "000wizard.png": { radius: 30, range: 150, towerType: "wizard", price: () => baseWizardPrice },
    "000cobra.png": { radius: 30, range: 175, towerType: "cobra", price: () => baseCobraPrice },
    "000boomer.png": { radius: 30, range: 175, towerType: "boomer", price: () => baseBoomerPrice },
    "000sniper.png": { radius: 30, range: Infinity, towerType: "sniper", price: () => baseSniperPrice },
    "000engi.png": { radius: 30, range: 175, towerType: "engi", price: () => baseEngiPrice },
    "000buccaneer.png": { radius: 30, range: 175, towerType: "buccaneer", price: () => baseBuccaneerPrice },
    "000mortar.png": { radius: 45, range: Infinity, towerType: "mortar", price: () => baseMortarPrice },
    "000sword.png": { radius: 30, range: 100, towerType: "sword", price: () => baseSwordPrice },
}

function getSelectedTower(side) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i] && towers[i].selected && towers[i].playerSide == side) {
            return towers[i]
        }
    }

    return null
}

function hasSelectedTower(side) {
    return getSelectedTower(side) != null
}

function hasOtherTier5(side, tower, pathNumber) {
    var pathProp = "path" + pathNumber + "Upgrades"
    for(var i = 0; i < towers.length; i++) {
        var otherTower = towers[i]
        if(!otherTower) {
            continue
        }

        if(otherTower != tower && otherTower[pathProp] == 5 && otherTower.towerType == tower.towerType && otherTower.playerSide == side) {
            return true
        }
    }

    return false
}

function canTowerBeUpgraded(tower) {
    return tower && tower.towerType != "farmer"
}

function tryBuyUpgrade(side, tower, pathProp, costProp) {
    var upgradeIndex = tower[pathProp]
    var upgradeCost = tower[costProp][upgradeIndex]
    if(typeof upgradeCost != "number" || players[side].money < upgradeCost) {
        return false
    }

    players[side].money -= upgradeCost
    tower.totalCost += upgradeCost
    tower[pathProp]++
    return true
}

function applySharedPath1Locks(tower) {
    tower.upgradedMidRound = true
    if(tower.path1Upgrades == 3) {
        tower.path2Cost[2] = "Max"
        tower.path3Cost[2] = "Max"
        tower.path2Name[2] = "Upgrades"
        tower.path3Name[2] = "Upgrades"
    }
    if(tower.path1Upgrades > 0 && tower.path2Upgrades > 0) {
        tower.path3Cost[0] = "Max"
        tower.path3Name[0] = "Upgrades"
    }
    if(tower.path1Upgrades > 0 && tower.path3Upgrades > 0) {
        tower.path2Cost[0] = "Max"
        tower.path2Name[0] = "Upgrades"
    }
}

function applyPath1UpgradeEffects(tower) {
    if(tower.towerType == "farm" && tower.path1Upgrades == 1 && tower.path3Upgrades >= 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/10)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 2 && tower.path3Upgrades >= 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/14)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 1 && tower.path3Upgrades < 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/5)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 2 && tower.path3Upgrades < 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/7)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/16)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 4) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/5)) + 1
    }

    applySharedPath1Locks(tower)

    if(tower.towerType == "dart" && tower.path1Upgrades == 3) {
        tower.range += 20
    }
    if(tower.towerType == "tack" && tower.path1Upgrades == 5) {
        tower.range += 50
    }
    if(tower.towerType == "super" && tower.path1Upgrades >= 4) {
        tower.range += 30
    }
    if(tower.towerType == "ice" && tower.path1Upgrades == 3) {
        tower.range += 30
    }
    if(tower.towerType == "farmer" && tower.path1Upgrades == 1) {
        tower.farmerCap += 200
    }
    if(tower.towerType == "farmer" && tower.path1Upgrades == 2) {
        tower.farmerCap += 400
    }
    if(tower.towerType == "farmer" && tower.path1Upgrades == 3) {
        tower.farmerCap += 1200
    }
    if(tower.towerType == "farmer" && tower.path1Upgrades == 4) {
        tower.farmerCap += 3000
    }
    if(tower.towerType == "farmer" && tower.path1Upgrades == 5) {
        tower.farmerCap += 5000
    }
    if(tower.towerType == "wizard" && tower.path1Upgrades >= 3) {
        tower.range += 35
    }
    if(tower.towerType == "ninja" && tower.path1Upgrades == 5) {
        tower.range += 30
    }
    if(tower.towerType == "engi" && tower.path1Upgrades == 1) {
        tower.sentrySpawnCooldown = gameNow()
    }
    if(tower.towerType == "engi" && tower.path1Upgrades == 2) {
        tower.sentrySpawnCooldown -= 2000
    }
}

function tryUpgradePath1(side) {
    var tower = getSelectedTower(side)
    if(!canTowerBeUpgraded(tower)) {
        return false
    }

    var otherTier5 = hasOtherTier5(side, tower, 1)
    if((tower.path2Upgrades > 2 && tower.path3Upgrades == 0) || (tower.path3Upgrades > 2 && tower.path2Upgrades == 0)) {
        if(tower.path1Upgrades < 2 && tryBuyUpgrade(side, tower, "path1Upgrades", "path1Cost")) {
            applyPath1UpgradeEffects(tower)
        }
        return true
    }

    if((tower.path2Upgrades < 3 && tower.path3Upgrades == 0) || (tower.path3Upgrades < 3 && tower.path2Upgrades == 0)) {
        if(tower.path1Upgrades < 4 && tryBuyUpgrade(side, tower, "path1Upgrades", "path1Cost")) {
            applyPath1UpgradeEffects(tower)
        } else if(tower.path1Upgrades < 5 && otherTier5 == false && tryBuyUpgrade(side, tower, "path1Upgrades", "path1Cost")) {
            applyPath1UpgradeEffects(tower)
        }
        return true
    }

    return true
}

function applyPath2UpgradeEffects(tower) {
    tower.upgradedMidRound = true
    if(tower.path2Upgrades == 3) {
        tower.path1Cost[2] = "Max"
        tower.path3Cost[2] = "Max"
        tower.path1Name[2] = "Upgrades"
        tower.path3Name[2] = "Upgrades"
    }
    if(tower.path2Upgrades > 0 && tower.path1Upgrades > 0) {
        tower.path3Cost[0] = "Max"
        tower.path3Name[0] = "Upgrades"
    }
    if(tower.path2Upgrades > 0 && tower.path3Upgrades > 0) {
        tower.path1Cost[0] = "Max"
        tower.path1Name[0] = "Upgrades"
    }
    if(tower.towerType == "tack" && tower.path2Upgrades == 1 || tower.towerType == "tack" && tower.path2Upgrades == 4) {
        tower.range += 30
    }
    if(tower.towerType == "super" && tower.path2Upgrades <= 2) {
        tower.range += 50
    }
    if(tower.towerType == "bomb" && tower.path2Upgrades == 2) {
        tower.range += 20
    }
    if(tower.towerType == "ice" && tower.path2Upgrades >= 3 && tower.path2Upgrades <= 5) {
        tower.range += 30
    }
    if(tower.towerType == "dart" && tower.path2Upgrades == 4) {
        tower.range += 50
    }
    if(tower.towerType == "cobra" && tower.path2Upgrades == 2) {
        tower.ecoStealCooldown = gameNow() + 20000
    }
    if(tower.towerType == "cobra" && tower.path2Upgrades == 3) {
        tower.attritionCooldown = gameNow() + 20000
    }
    if(tower.towerType == "cobra" && tower.path2Upgrades == 4) {
        tower.activeSyphonCooldown = gameNow() + 1000
    }
    if(tower.towerType == "sniper" && tower.path2Upgrades == 4) {
        tower.supplyDropCooldown = gameNow() + 30000
    }
    if(tower.towerType == "farmer" && tower.path2Upgrades == 4) {
        tower.farmerCap += 800
    }
    if(tower.towerType == "farmer" && tower.path2Upgrades == 5) {
        tower.farmerCap += 2000
    }
    if(tower.towerType == "engi" && tower.path2Upgrades == 1) {
        tower.range += 50
        tower.recalculateClosestTrack()
    }
    if(tower.towerType == "sword" && tower.path2Upgrades == 4) {
        tower.range += 50
    }
}

function tryUpgradePath2(side) {
    var tower = getSelectedTower(side)
    if(!canTowerBeUpgraded(tower)) {
        return false
    }

    var otherTier5 = hasOtherTier5(side, tower, 2)
    if((tower.path1Upgrades > 2 && tower.path3Upgrades == 0) || (tower.path3Upgrades > 2 && tower.path1Upgrades == 0)) {
        if(tower.path2Upgrades < 2 && tryBuyUpgrade(side, tower, "path2Upgrades", "path2Cost")) {
            applyPath2UpgradeEffects(tower)
        }
        return true
    }

    if((tower.path1Upgrades < 3 && tower.path3Upgrades == 0) || (tower.path3Upgrades < 3 && tower.path1Upgrades == 0)) {
        if(tower.path2Upgrades < 4 && tryBuyUpgrade(side, tower, "path2Upgrades", "path2Cost")) {
            applyPath2UpgradeEffects(tower)
        } else if(tower.path2Upgrades < 5 && otherTier5 == false && tryBuyUpgrade(side, tower, "path2Upgrades", "path2Cost")) {
            applyPath2UpgradeEffects(tower)
        }
        return true
    }

    return true
}

function applyPath3UpgradeEffects(tower) {
    if(tower.towerType == "farm" && tower.path1Upgrades == 0 && tower.path3Upgrades == 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/6)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 1 && tower.path3Upgrades == 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/10)) + 1
    } else if(tower.towerType == "farm" && tower.path1Upgrades == 2 && tower.path3Upgrades == 3) {
        tower.bananaCounter = Math.floor(counter/(maxCounter/14)) + 1
    }

    tower.upgradedMidRound = true
    if(tower.path3Upgrades == 3) {
        tower.path1Cost[2] = "Max"
        tower.path2Cost[2] = "Max"
        tower.path1Name[2] = "Upgrades"
        tower.path2Name[2] = "Upgrades"
    }
    if(tower.path3Upgrades > 0 && tower.path1Upgrades > 0) {
        tower.path2Cost[0] = "Max"
        tower.path2Name[0] = "Upgrades"
    }
    if(tower.path3Upgrades > 0 && tower.path2Upgrades > 0) {
        tower.path1Cost[0] = "Max"
        tower.path1Name[0] = "Upgrades"
    }
    if(tower.towerType == "dart" && tower.path3Upgrades == 1) {
        tower.path1Cost[0] *= 0.8
        tower.path1Cost[1] *= 0.8
        tower.path1Cost[2] *= 0.8
        tower.path1Cost[3] *= 0.8
        tower.path1Cost[4] *= 0.8
        tower.path2Cost[0] *= 0.8
        tower.path2Cost[1] *= 0.8
        tower.path2Cost[2] *= 0.8
        tower.path2Cost[3] *= 0.8
        tower.path2Cost[4] *= 0.8
    }
    if(tower.towerType == "dart" && tower.path3Upgrades == 2) {
        tower.range += 70
    }
    if(tower.towerType == "dart" && tower.path3Upgrades == 3) {
        tower.range += 35
    }
    if(tower.towerType == "dart" && tower.path3Upgrades == 5) {
        tower.range += 50
    }
    if(tower.towerType == "bomb" && tower.path3Upgrades == 1) {
        tower.range += 50
    }
    if(tower.towerType == "ice" && tower.path3Upgrades == 1) {
        tower.path1Cost[0] *= 0.8
        tower.path1Cost[1] *= 0.8
        tower.path1Cost[2] *= 0.8
        tower.path1Cost[3] *= 0.8
        tower.path1Cost[4] *= 0.8
        tower.path2Cost[0] *= 0.8
        tower.path2Cost[1] *= 0.8
        tower.path2Cost[2] *= 0.8
        tower.path2Cost[3] *= 0.8
        tower.path2Cost[4] *= 0.8
    }
    if(tower.towerType == "ice" && tower.path3Upgrades == 2) {
        tower.range += 50
    }
    if(tower.towerType == "ice" && tower.path3Upgrades == 3) {
        tower.range += 50
    }
    if(tower.towerType == "farmer" && tower.path3Upgrades <= 2) {
        tower.range += 50
    }
    if(tower.towerType == "wizard" && tower.path3Upgrades == 2) {
        tower.range += 50
    }
    if(tower.towerType == "boomer" && tower.path3Upgrades == 1) {
        tower.range += 50
    }
    if(tower.towerType == "farm" && tower.path3Upgrades == 1) {
        tower.path1Cost[0] *= 0.8
        tower.path1Cost[1] *= 0.8
        tower.path1Cost[2] *= 0.8
        tower.path1Cost[3] *= 0.8
        tower.path1Cost[4] *= 0.8
        tower.path2Cost[0] *= 0.8
        tower.path2Cost[1] *= 0.8
        tower.path2Cost[2] *= 0.8
        tower.path2Cost[3] *= 0.8
        tower.path2Cost[4] *= 0.8
    }
    if(tower.towerType == "ninja" && tower.path3Upgrades == 1 || tower.towerType == "ninja" && tower.path3Upgrades == 5) {
        tower.range += 30
    }
    if(tower.towerType == "engi" && tower.path3Upgrades == 4) {
        tower.trapSpawnCooldown = gameNow() + 5000
        tower.lastTimeTrapPopped = gameNow()
    }
    if(tower.towerType == "buccaneer" && tower.path3Upgrades == 1) {
        tower.range += 50
    }
    if(tower.towerType == "mortar" && tower.targetPrio == 2) {
        tower.targetPrio = 6
    }
    if(tower.towerType == "sword" && tower.path3Upgrades == 1) {
        tower.range += 30
    }
    if(tower.towerType == "sword" && tower.path3Upgrades == 2) {
        tower.range += 75
    }
}

function tryUpgradePath3(side) {
    var tower = getSelectedTower(side)
    if(!canTowerBeUpgraded(tower)) {
        return false
    }

    var otherTier5 = hasOtherTier5(side, tower, 3)
    if((tower.path1Upgrades > 2 && tower.path2Upgrades == 0) || (tower.path2Upgrades > 2 && tower.path1Upgrades == 0)) {
        if(tower.path3Upgrades < 2 && tryBuyUpgrade(side, tower, "path3Upgrades", "path3Cost")) {
            applyPath3UpgradeEffects(tower)
        }
        return true
    }

    if((tower.path1Upgrades < 3 && tower.path2Upgrades == 0) || (tower.path2Upgrades < 3 && tower.path1Upgrades == 0)) {
        if(tower.path3Upgrades < 4 && tryBuyUpgrade(side, tower, "path3Upgrades", "path3Cost")) {
            applyPath3UpgradeEffects(tower)
        } else if(tower.path3Upgrades < 5 && otherTier5 == false && tryBuyUpgrade(side, tower, "path3Upgrades", "path3Cost")) {
            applyPath3UpgradeEffects(tower)
        }
        return true
    }

    return true
}

function canPlaceTowerAt(side, x, y, radius) {
    if(side == PLAYER_SIDE.left) {
        if(x > canvas.width / 2 - radius || x < canvas.width / 8 + radius || y > canvas.height - radius || y < radius) {
            return false
        }
    } else {
        if(x > 7 * canvas.width / 8 - radius || x < canvas.width / 2 + radius || y > canvas.height - radius || y < radius) {
            return false
        }
    }

    for(var i = 0; i < pathObjects.length; i++) {
        if(pathObjects[i].towerPlacementCheck(x, y, radius)) {
            return false
        }
    }
    for(var j = 0; j < towers.length; j++) {
        if(towers[j] && towers[j].towerPlacementCheck(x, y, radius)) {
            return false
        }
    }

    return true
}

function tryPlaceLoadoutTower(side, slotIndex) {
    var towerImage = players[side].towers[slotIndex]
    var towerConfig = LOADOUT_TOWER_CONFIG[towerImage]
    if(!towerConfig) {
        return
    }

    var activeCursor = players[side].cursor
    if(canPlaceTowerAt(side, activeCursor.x, activeCursor.y, towerConfig.radius) && players[side].money >= towerConfig.price()) {
        towers.push(new Tower(activeCursor.x, activeCursor.y, towerConfig.radius, towerConfig.range, towerConfig.towerType, side))
        players[side].money -= towerConfig.price()
        towers[towers.length - 1].totalCost += towerConfig.price()
    }
}

function handlePlayerPathInput(side, pathKeyCode, slotIndex, upgradePath) {
    if(!keyState[pathKeyCode] || !isKeyReady(pathKeyCode)) {
        return
    }

    markKeyUsed(pathKeyCode)
    var hadSelection = hasSelectedTower(side)

    if(upgradePath == 1) {
        tryUpgradePath1(side)
    } else if(upgradePath == 2) {
        tryUpgradePath2(side)
    } else if(upgradePath == 3) {
        tryUpgradePath3(side)
    }

    if(hadSelection == false) {
        tryPlaceLoadoutTower(side, slotIndex)
    }
}

// Shared in-match utility actions.
function getTowerSellValue(tower) {
    if(!tower) {
        return 0
    }

    var totalCost = Math.max(0, tower.totalCost || 0)
    if(tower.towerType == "farm" && tower.path3Upgrades >= 2) {
        return Math.round(0.8 * totalCost)
    }
    return Math.round(0.7 * totalCost)
}

function sellTowerInstance(tower) {
    if(!tower) {
        return false
    }

    var towerIndex = towers.indexOf(tower)
    if(towerIndex == -1) {
        return false
    }

    var side = tower.playerSide
    if(tower.towerType == "farm" && tower.path2Upgrades >= 3 && tower.towerVar > 0) {
        players[side].money += tower.towerVar
        moneyText.push(new MoneyText(tower.x, tower.y, tower.towerVar))
        tower.towerVar = 0
    }
    players[side].money += getTowerSellValue(tower)
    tower.selected = false
    towers.splice(towerIndex, 1)
    return true
}

function sellSelectedTower(side, keyCode) {
    if(!keyState[keyCode] || !isKeyReady(keyCode)) {
        return
    }

    markKeyUsed(keyCode)
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower) {
            continue
        }

        if(tower.selected && tower.playerSide == side) {
            sellTowerInstance(tower)
            return
        }
    }
}

function tryPlaceFarmer(side) {
    var activeCursor = players[side].cursor
    if(players[side].money < baseFarmerPrice || canPlaceTowerAt(side, activeCursor.x, activeCursor.y, 30) == false) {
        return false
    }
    towers.push(new Tower(activeCursor.x, activeCursor.y, 30, 250, "farmer", side))
    players[side].money -= baseFarmerPrice
    towers[towers.length - 1].totalCost = baseFarmerPrice
    return true
}

function collectFarmMoney(tower) {
    players[tower.playerSide].money += tower.towerVar
    tower.popCount += tower.towerVar
    moneyText.push(new MoneyText(tower.x, tower.y, tower.towerVar))
    tower.towerVar = 0
}

function updateTowerTargetPriority(tower, direction) {
    if(tower.towerType == "farm" && tower.path2Upgrades >= 3 && tower.towerVar > 0) {
        collectFarmMoney(tower)
    } else if(tower.towerType != "farm" && tower.towerType != "dartling" && tower.towerType != "mortar") {
        tower.targetPrio += direction
        if(tower.targetPrio < 0) {
            tower.targetPrio = 3
        } else if(tower.targetPrio > 3) {
            tower.targetPrio = 0
        }
    } else if(tower.towerType == "dartling" || tower.towerType == "mortar" && tower.path3Upgrades < 1) {
        tower.targetPrio++
        if(tower.targetPrio > 1) {
            tower.targetPrio = 0
        }
    } else if(tower.towerType == "mortar" && tower.path3Upgrades >= 1) {
        if(direction < 0) {
            if(tower.targetPrio != 6) {
                tower.targetPrio--
                if(tower.targetPrio == -1) {
                    tower.targetPrio = 5
                }
            } else {
                tower.targetPrio = 4
            }
        } else {
            tower.targetPrio++
            if(tower.targetPrio > 5) {
                tower.targetPrio = 0
            }
        }
    }
}

function handleFarmerOrTargeting(side, keyCode, direction) {
    if(!keyState[keyCode] || !isKeyReady(keyCode)) {
        return
    }

    markKeyUsed(keyCode)
    var selectedTower = getSelectedTower(side)
    if(!selectedTower) {
        tryPlaceFarmer(side)
        return
    }

    updateTowerTargetPriority(selectedTower, direction)
}

function handleCanvasPointerDown(event) {
    var canvasPoint = getCanvasPointFromEvent(event)
    if(handleAITrainingTrueSelfPlayOverlayClick(canvasPoint.x, canvasPoint.y)) {
        return
    }
    if(isFrontMenuOpen()) {
        handleFrontMenuClick(canvasPoint.x, canvasPoint.y)
        return
    }
    if(gamePaused && pauseMenuContainsPoint(canvasPoint.x, canvasPoint.y)) {
        markPauseToggleUsed()
        setGamePaused(false)
    }
}

addEventListener("pointermove", updateMousePosition)
addEventListener("pointerdown", handleCanvasPointerDown)

var keyState = {}

function clearKeyState() {
    for(var keyCode in keyState) {
        keyState[keyCode] = false
    }
    if(typeof aiTrainingState != "undefined" && aiTrainingState) {
        aiTrainingState.hotkeyLatch = false
    }
}

function autoPauseOnVisibilityLoss() {
    clearKeyState()
    if(typeof isAITrainingBackgroundProgressActive == "function" && isAITrainingBackgroundProgressActive()) {
        return
    }
    if(canPauseGame() && gamePaused == false) {
        setGamePaused(true)
    }
}

document.addEventListener("visibilitychange", function() {
    if(document.hidden) {
        autoPauseOnVisibilityLoss()
    }
})

addEventListener("blur", function() {
    autoPauseOnVisibilityLoss()
})

onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    keyState[e.keyCode] = e.type == 'keydown'
    if(handlePauseToggleInput(e.type)) {
        return
    }
    if(gamePaused) {
        return
    }
    if(handleAITrainingHiddenHotkey(e)) {
        return
    }
    if(isFrontMenuOpen()) {
        return
    }
    handleCursorMovementInput()
    trySelectLoadoutOrTower(PLAYER_SIDE.left)
    trySelectLoadoutOrTower(PLAYER_SIDE.right)
    if(gameStarted == false) {
        handlePregameInput()
    }
    if(gameStarted) {
        if(isHumanControlledSide(PLAYER_SIDE.left)) {
            handlePlayerPathInput(PLAYER_SIDE.left, KEY_CODES.p1Path1, 0, 1)
            handlePlayerPathInput(PLAYER_SIDE.left, KEY_CODES.p1Path2, 1, 2)
            handlePlayerPathInput(PLAYER_SIDE.left, KEY_CODES.p1Path3, 2, 3)
            sellSelectedTower(PLAYER_SIDE.left, KEY_CODES.p1Sell)
            handleFarmerOrTargeting(PLAYER_SIDE.left, KEY_CODES.p1TargetPrev, -1)
            handleFarmerOrTargeting(PLAYER_SIDE.left, KEY_CODES.p1TargetNext, 1)
        }
        if(isHumanControlledSide(PLAYER_SIDE.right)) {
            handlePlayerPathInput(PLAYER_SIDE.right, KEY_CODES.p2Path1, 0, 1)
            handlePlayerPathInput(PLAYER_SIDE.right, KEY_CODES.p2Path2, 1, 2)
            handlePlayerPathInput(PLAYER_SIDE.right, KEY_CODES.p2Path3, 2, 3)
            sellSelectedTower(PLAYER_SIDE.right, KEY_CODES.p2Sell)
            handleFarmerOrTargeting(PLAYER_SIDE.right, KEY_CODES.p2TargetPrev, -1)
            handleFarmerOrTargeting(PLAYER_SIDE.right, KEY_CODES.p2TargetNext, 1)
        }
        handleSharedLiveHotkeys()
    }
}
// fixed by gg

nativeSetInterval(processHeldCursorMovement, 1000/60)
