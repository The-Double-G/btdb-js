// Factual, bounded action capabilities shared by every neural decision family.
var AI_CAPABILITY_KEYS = [
    "directDamage", "pierce", "projectilesPerVolley", "volleysPerSecond", "range", "projectileSpeed", "projectileRadius", "effectRadius",
    "projectileLifespan", "ricochetCount", "secondaryCount", "secondaryDamage", "secondaryPierce", "dotDamage", "dotTicks", "dotInterval",
    "targetSpeedMultiplier", "effectDuration", "stunDuration", "normalKnockbackChance", "moabKnockbackChance", "cashDelta", "ecoDelta", "economyInterval",
    "attackRateMultiplier", "rangeMultiplier", "trapCapacity", "sendHealth", "sendSpacing", "sendSpeedMultiplier", "manualFollow", "manualLock",
]

function createAIEmptyCapabilities() {
    var facts = {}
    for(var i = 0; i < AI_CAPABILITY_KEYS.length; i++) facts[AI_CAPABILITY_KEYS[i]] = 0
    return facts
}

function copyAICapabilities(source) {
    var facts = createAIEmptyCapabilities()
    source = source || {}
    for(var i = 0; i < AI_CAPABILITY_KEYS.length; i++) {
        var key = AI_CAPABILITY_KEYS[i]
        facts[key] = Number.isFinite(Number(source[key])) ? Number(source[key]) : 0
    }
    return facts
}

function addAICapabilities(target, source, scale) {
    source = source || {}
    scale = Number.isFinite(Number(scale)) ? Number(scale) : 1
    for(var i = 0; i < AI_CAPABILITY_KEYS.length; i++) {
        var key = AI_CAPABILITY_KEYS[i]
        target[key] += (Number(source[key]) || 0) * scale
    }
    return target
}

// Keys also serve as the allow-list for loadout towers. Combat values are
// inspected from the runtime constructors instead of being duplicated here.
var AI_BASE_TOWER_CAPABILITIES = {
    dart: {}, tack: {}, bomb: {}, ice: {}, super: {}, farm: {}, farmer: { range: 250, trapCapacity: 200 }, dartling: {},
    wizard: {}, cobra: {}, boomer: {}, sniper: {}, ninja: {}, engi: {}, buccaneer: {}, mortar: {}, sword: {},
}

var AI_TOWER_CAPABILITY_CACHE = {}

function cloneAITowerRuntimeState(tower) {
    var clone = Object.create(Object.getPrototypeOf(tower))
    var keys = Object.keys(tower)
    for(var i = 0; i < keys.length; i++) {
        var value = tower[keys[i]]
        if(Array.isArray(value)) clone[keys[i]] = value.slice()
        else if(value instanceof Set) clone[keys[i]] = new Set(value)
        else if(value instanceof Map) clone[keys[i]] = new Map(value)
        else clone[keys[i]] = value
    }
    return clone
}

function getAITowerPlacementConfig(towerType) {
    if(typeof LOADOUT_TOWER_CONFIG != "undefined") {
        var images = Object.keys(LOADOUT_TOWER_CONFIG)
        for(var i = 0; i < images.length; i++) {
            if(LOADOUT_TOWER_CONFIG[images[i]].towerType == towerType) return LOADOUT_TOWER_CONFIG[images[i]]
        }
    }
    if(towerType == "farmer") return { radius: 30, range: 250, towerType: "farmer" }
    return null
}

function createAIBaseTowerForCapabilities(towerType) {
    if(typeof Tower != "function") return null
    var config = getAITowerPlacementConfig(towerType)
    if(!config) return null
    var savedNextTowerID = typeof nextTowerID == "number" ? nextTowerID : null
    try {
        return new Tower(100, 100, config.radius, config.range, towerType, 1)
    } finally {
        if(savedNextTowerID != null) nextTowerID = savedNextTowerID
    }
}

function getAITowerProbeSource(towerOrType) {
    var tower = typeof towerOrType == "object" && towerOrType ? towerOrType : null
    var towerType = tower ? tower.towerType : String(towerOrType || "")
    if(!tower || typeof tower.attack != "function") {
        var runtimeTower = createAIBaseTowerForCapabilities(towerType)
        if(!runtimeTower) return null
        if(tower) {
            var keys = Object.keys(tower)
            for(var i = 0; i < keys.length; i++) runtimeTower[keys[i]] = tower[keys[i]]
        }
        tower = runtimeTower
    }
    return tower
}

function getAITowerCapabilityCacheKey(tower) {
    return [
        tower.towerType,
        Number(tower.path1Upgrades) || 0,
        Number(tower.path2Upgrades) || 0,
        Number(tower.path3Upgrades) || 0,
        Number.isFinite(Number(tower.range)) ? Number(tower.range) : "infinite",
        Number(tower.radius) || 0,
        Number(tower.farmerCap) || 0,
        Number(tower.degree) || 0,
    ].join("|")
}

function createAIProbeBloon(index) {
    return {
        x: 150 + index * 10,
        y: 100 + index * 5,
        radius: 25,
        pathPos: 80 - index * 10,
        health: index == 0 ? 100 : 5 + index,
        playerSide: 1,
        bloonID: index + 1,
        isBoss: false,
        isAI: false,
        iced: 1,
        sabotaged: 1,
        stunned: 0,
    }
}

function getAIProjectileExplosionFactor(image) {
    if(/^(000|300|020|030|040|050)bombproj\.png$/.test(image)) return 3
    if(/^(002|003|004|302|022|032|042|052)bombprojmain\.png$/.test(image)) return 3
    if(image == "010wizardproj.png" || image == "003ninjaproj.png") return 3
    if(/^(003|103|005|105)iceproj\.png$/.test(image)) return 3
    if(image == "030dartlingproj.png" || image == "050dartlingproj.png") return 3
    if(image == "040farmerproj.png") return 2.5
    return 0
}

function applyAIProjectileStatusCapabilities(facts, image) {
    if(image == "100iceproj.png" || image == "103iceproj.png" || image == "105iceproj.png") {
        facts.targetSpeedMultiplier = facts.targetSpeedMultiplier > 0 ? Math.min(facts.targetSpeedMultiplier, 0.6) : 0.6
    } else if(image == "000iceproj.png" || image == "003iceproj.png" || image == "005iceproj.png" || image == "030engiproj.png") {
        facts.targetSpeedMultiplier = facts.targetSpeedMultiplier > 0 ? Math.min(facts.targetSpeedMultiplier, 0.8) : 0.8
    }
    if(image == "050ninjaproj.png" || image == "051ninjaproj.png" || image == "250ninjaproj.png") {
        facts.targetSpeedMultiplier = facts.targetSpeedMultiplier > 0 ? Math.min(facts.targetSpeedMultiplier, 0.5) : 0.5
    } else if(image == "040ninjaproj.png" || image == "041ninjaproj.png" || image == "240ninjaproj.png") {
        facts.targetSpeedMultiplier = facts.targetSpeedMultiplier > 0 ? Math.min(facts.targetSpeedMultiplier, 0.75) : 0.75
    }
}

function applyAINonProjectileTowerCapabilities(facts, tower) {
    if(tower.towerType == "bomb" && tower.path1Upgrades >= 4) facts.stunDuration = tower.path1Upgrades == 5 ? 1250 : 750
    if(tower.towerType == "ninja" && tower.path3Upgrades >= 3) facts.stunDuration = tower.path3Upgrades == 5 ? 1000 : tower.path3Upgrades == 4 ? 750 : 500
    if(tower.towerType == "mortar" && tower.path1Upgrades >= 3) facts.stunDuration = tower.path1Upgrades == 5 ? 1000 : tower.path1Upgrades == 4 ? 750 : 500
    if(tower.towerType == "ninja" && tower.path2Upgrades >= 3) facts.attackRateMultiplier = 1 / (0.9 ** 0.5)
    if(tower.towerType == "engi" && tower.path2Upgrades == 4) facts.attackRateMultiplier = 1 / 0.85
    if(tower.towerType == "engi" && tower.path2Upgrades == 5) facts.attackRateMultiplier = 1 / 0.75
    if(tower.towerType == "cobra" && tower.path1Upgrades >= 3) facts.attackRateMultiplier = 1 / 0.98
    if(tower.towerType == "cobra" && tower.path3Upgrades >= 3) facts.sendSpeedMultiplier = 1.02
    if(tower.towerType == "cobra" && tower.path2Upgrades >= 4) {
        facts.cashDelta = Math.max(facts.cashDelta, 15)
        facts.economyInterval = 1000
    }
    if(tower.towerType == "sniper" && tower.path2Upgrades >= 4) {
        facts.cashDelta = Math.max(facts.cashDelta, tower.path2Upgrades == 5 ? 3500 : 2000)
        facts.economyInterval = 30000
    }
    if(tower.towerType == "engi" && tower.path3Upgrades >= 4) facts.trapCapacity = tower.path3Upgrades == 5 ? 8000 : 500
    if(tower.towerType == "farmer") facts.trapCapacity = Math.max(0, Number(tower.farmerCap) || 0)
}

function summarizeAITowerProbe(tower, emittedProjectiles, emittedBananas, emittedSubtowers, moneyDelta, bankDelta, now) {
    var facts = createAIEmptyCapabilities()
    facts.range = Number.isFinite(Number(tower.range)) ? Math.max(0, Number(tower.range)) : typeof canvas != "undefined" ? canvas.width : 1366
    var rankedProjectiles = emittedProjectiles.slice().sort(function(a, b) {
        return (Number(b.damage) || 0) * Math.max(1, Number(b.pierce) || 0) - (Number(a.damage) || 0) * Math.max(1, Number(a.pierce) || 0)
    })
    facts.projectilesPerVolley = rankedProjectiles.length
    if(rankedProjectiles.length > 0 && Number(tower.attackSpeed) > 0) facts.volleysPerSecond = 1000 / Number(tower.attackSpeed)
    for(var i = 0; i < rankedProjectiles.length; i++) {
        var projectile = rankedProjectiles[i]
        var damage = Math.max(0, Number(projectile.damage) || 0)
        var pierce = Number(projectile.pierce) == Infinity ? 100000 : Math.max(0, Number(projectile.pierce) || 0)
        var speed = Math.sqrt((Number(projectile.dx) || 0) ** 2 + (Number(projectile.dy) || 0) ** 2)
        var radius = Math.max(0, Number(projectile.radius) || 0)
        var explosionFactor = getAIProjectileExplosionFactor(String(projectile.sourceImage || projectile.image || ""))
        if(i == 0) {
            facts.directDamage = damage
            facts.pierce = pierce
        } else {
            facts.secondaryDamage = Math.max(facts.secondaryDamage, damage)
            facts.secondaryPierce = Math.max(facts.secondaryPierce, pierce)
        }
        facts.projectileSpeed = Math.max(facts.projectileSpeed, speed)
        facts.projectileRadius = Math.max(facts.projectileRadius, radius)
        if(speed == 0) facts.effectRadius = Math.max(facts.effectRadius, radius)
        if(explosionFactor > 0) facts.effectRadius = Math.max(facts.effectRadius, radius * explosionFactor)
        if(Number(projectile.lifespan) >= now) facts.projectileLifespan = Math.max(facts.projectileLifespan, Number(projectile.lifespan) - now)
        if(explosionFactor > 0) facts.projectileLifespan = Math.max(facts.projectileLifespan, 500)
        facts.ricochetCount = Math.max(facts.ricochetCount, projectile.canRicochet ? Math.max(1, Number(projectile.bounceCount) || 0) : Number(projectile.bounceCount) || 0)
        facts.dotDamage = Math.max(facts.dotDamage, Math.max(0, Number(projectile.dpsDamage) || 0))
        facts.dotTicks = Math.max(facts.dotTicks, Math.max(0, Number(projectile.dpsTicks) || 0))
        facts.dotInterval = Math.max(facts.dotInterval, Math.max(0, Number(projectile.dpsTickRate) || 0))
        facts.normalKnockbackChance = Math.max(facts.normalKnockbackChance, Math.max(0, Number(projectile.knockback) || 0))
        facts.moabKnockbackChance = Math.max(facts.moabKnockbackChance, Math.max(0, Number(projectile.moabKnockback) || 0))
        facts.trapCapacity = Math.max(facts.trapCapacity, Math.max(0, Number(projectile.trapCapacity) || 0))
        applyAIProjectileStatusCapabilities(facts, String(projectile.sourceImage || projectile.image || ""))
    }
    facts.secondaryCount = Math.max(0, rankedProjectiles.length - 1, emittedSubtowers.length)
    for(var subtowerIndex = 0; subtowerIndex < emittedSubtowers.length; subtowerIndex++) {
        if(Number(emittedSubtowers[subtowerIndex].lifespan) >= now) facts.effectDuration = Math.max(facts.effectDuration, Number(emittedSubtowers[subtowerIndex].lifespan) - now)
    }
    var bananaCash = 0
    for(var bananaIndex = 0; bananaIndex < emittedBananas.length; bananaIndex++) bananaCash += Math.max(0, Number(emittedBananas[bananaIndex].cashGiven) || 0)
    facts.cashDelta = Math.max(0, bananaCash + moneyDelta + bankDelta)
    if(facts.cashDelta > 0 && Number(tower.attackSpeed) > 0) facts.economyInterval = Number(tower.attackSpeed)
    applyAINonProjectileTowerCapabilities(facts, tower)
    return facts
}

function getAITowerRuntimeCapabilityFacts(towerOrType) {
    var source = getAITowerProbeSource(towerOrType)
    if(!source || typeof source.attack != "function" || typeof Projectile != "function" || typeof projectiles == "undefined" || typeof bananas == "undefined" || typeof subtowers == "undefined") return null
    var cacheKey = getAITowerCapabilityCacheKey(source)
    if(AI_TOWER_CAPABILITY_CACHE[cacheKey]) return copyAICapabilities(AI_TOWER_CAPABILITY_CACHE[cacheKey])
    var probe = cloneAITowerRuntimeState(source)
    probe.target = 0
    probe.target2 = 1
    probe.target3 = 2
    probe.target4 = 3
    probe.targetX = 150
    probe.targetY = 100
    probe.towerVar = 0
    probe.planeCount = 0
    probe.towerBoosted = 1
    probe.cobraBoosted = 1
    probe.slowSabotaged = 1
    probe.overclockFactor = 1
    probe.shinobiStacks = 0

    var savedProjectiles = projectiles
    var savedBananas = bananas
    var savedSubtowers = subtowers
    var savedTowers = towers
    var savedBloons = bloons
    var savedMoneyText = moneyText
    var savedRoundReady = roundReady
    var savedP1Money = p1money
    var savedP2Money = p2money
    var savedP1TotalCashGenerated = p1TotalCashGenerated
    var savedP2TotalCashGenerated = p2TotalCashGenerated
    var savedNextTowerID = typeof nextTowerID == "number" ? nextTowerID : null
    var savedRandom = Math.random
    var now = gameNow()
    try {
        projectiles = []
        bananas = []
        subtowers = []
        towers = [probe]
        bloons = [createAIProbeBloon(0), createAIProbeBloon(1), createAIProbeBloon(2), createAIProbeBloon(3)]
        moneyText = []
        roundReady = false
        p1money = 0
        p2money = 0
        p1TotalCashGenerated = 0
        p2TotalCashGenerated = 0
        Math.random = function() { return 0.25 }
        probe.attack()
        if(typeof probe.spawnSentry == "function") probe.spawnSentry()
        var bankDelta = probe.towerType == "farm" ? Math.max(0, Number(probe.towerVar) || 0) : 0
        var facts = summarizeAITowerProbe(probe, projectiles, bananas, subtowers, p1money + p2money, bankDelta, now)
        AI_TOWER_CAPABILITY_CACHE[cacheKey] = copyAICapabilities(facts)
        return facts
    } finally {
        Math.random = savedRandom
        projectiles = savedProjectiles
        bananas = savedBananas
        subtowers = savedSubtowers
        towers = savedTowers
        bloons = savedBloons
        moneyText = savedMoneyText
        roundReady = savedRoundReady
        p1money = savedP1Money
        p2money = savedP2Money
        p1TotalCashGenerated = savedP1TotalCashGenerated
        p2TotalCashGenerated = savedP2TotalCashGenerated
        if(savedNextTowerID != null) nextTowerID = savedNextTowerID
    }
}

function getAITowerCapabilityFacts(towerOrType) {
    var tower = typeof towerOrType == "object" && towerOrType ? towerOrType : null
    var towerType = tower ? tower.towerType : String(towerOrType || "")
    var facts = copyAICapabilities(AI_BASE_TOWER_CAPABILITIES[towerType])
    var runtimeFacts = getAITowerRuntimeCapabilityFacts(towerOrType)
    if(runtimeFacts) return runtimeFacts
    if(!tower) return facts

    if(Number.isFinite(Number(tower.range))) facts.range = Math.max(0, Number(tower.range))
    if(Number(tower.farmerCap) > 0 && towerType == "farmer") facts.trapCapacity = Number(tower.farmerCap)
    return facts
}

function getAIBoostCapabilityFacts(boostType, roundNumber) {
    var facts = createAIEmptyCapabilities()
    var settings = typeof BOOST_SETTINGS == "undefined" ? {} : BOOST_SETTINGS
    if(boostType == "towerboost.png") {
        facts.attackRateMultiplier = settings.towerBoostFactor > 0 ? 1 / settings.towerBoostFactor : 0
        facts.effectDuration = settings.activeMs || 0
    } else if(boostType == "slowboost.png") {
        facts.attackRateMultiplier = settings.slowSabotageFactor > 0 ? 1 / settings.slowSabotageFactor : 0
        facts.effectDuration = settings.activeMs || 0
    } else if(boostType == "bloonboost.png") {
        facts.sendSpeedMultiplier = settings.bloonBoostFactor || 0
        facts.effectDuration = settings.activeMs || 0
    } else if(boostType == "ecoboost.png") {
        facts.ecoDelta = (settings.ecoBoostRoundFactor || 0) * Math.max(0, Number(roundNumber) || 0)
    } else if(boostType == "lightningboost.png") {
        facts.secondaryCount = settings.lightningTickCount || 0
        facts.secondaryDamage = 1
        facts.secondaryPierce = 10
        facts.effectRadius = 45
        facts.dotTicks = settings.lightningTickCount || 0
        facts.dotInterval = settings.lightningTickIntervalMs || 0
    }
    return facts
}

function getAISendCapabilityFacts(send, groups) {
    var facts = createAIEmptyCapabilities()
    if(!send) return facts
    groups = Math.max(1, Math.floor(Number(groups) || 1))
    facts.secondaryCount = Math.max(0, Number(send.count) || 0) * groups
    facts.sendHealth = Math.max(0, Number(send.health) || 0)
    facts.sendSpacing = Math.max(0, Number(send.spacing) || 0)
    facts.ecoDelta = (Number(send.eco) || 0) * groups
    facts.sendSpeedMultiplier = Math.max(0, Number(send.speedMultiplier) || 1)
    return facts
}

function getAILoadoutCapabilityFacts(towerImages, boostImages, roundNumber) {
    var facts = createAIEmptyCapabilities()
    var count = 0
    var multiplierCounts = { targetSpeedMultiplier: 0, attackRateMultiplier: 0, rangeMultiplier: 0, sendSpeedMultiplier: 0 }
    function addLoadoutFacts(source) {
        addAICapabilities(facts, source, 1)
        var multiplierKeys = Object.keys(multiplierCounts)
        for(var keyIndex = 0; keyIndex < multiplierKeys.length; keyIndex++) {
            if(Number(source[multiplierKeys[keyIndex]]) > 0) multiplierCounts[multiplierKeys[keyIndex]]++
        }
    }
    towerImages = Array.isArray(towerImages) ? towerImages : []
    boostImages = Array.isArray(boostImages) ? boostImages : []
    for(var i = 0; i < towerImages.length; i++) {
        var image = String(towerImages[i] || "")
        var towerType = image.replace(/^\d{3}/, "").replace(/\.png$/i, "")
        if(towerType && AI_BASE_TOWER_CAPABILITIES[towerType]) {
            addLoadoutFacts(getAITowerCapabilityFacts(towerType))
            count++
        }
    }
    for(var boostIndex = 0; boostIndex < boostImages.length; boostIndex++) {
        var boost = String(boostImages[boostIndex] || "")
        if(boost) {
            addLoadoutFacts(getAIBoostCapabilityFacts(boost, roundNumber))
            count++
        }
    }
    if(count > 1) {
        for(var factIndex = 0; factIndex < AI_CAPABILITY_KEYS.length; factIndex++) {
            var key = AI_CAPABILITY_KEYS[factIndex]
            facts[key] /= multiplierCounts[key] || count
        }
    }
    return facts
}

function aiCapabilitySignedLog(value, scale) {
    value = Number(value) || 0
    return Math.max(-1, Math.min(1, Math.sign(value) * Math.log1p(Math.abs(value)) / Math.log1p(scale)))
}

function normalizeAICapabilityFact(key, value) {
    value = Number(value) || 0
    if(key == "manualFollow" || key == "manualLock") return value ? 1 : 0
    if(key == "targetSpeedMultiplier" || key == "attackRateMultiplier" || key == "rangeMultiplier" || key == "sendSpeedMultiplier") {
        return value > 0 ? Math.max(-1, Math.min(1, Math.log(value) / Math.log(2))) : 0
    }
    if(key == "normalKnockbackChance" || key == "moabKnockbackChance") return Math.max(-1, Math.min(1, value / 100))
    var scales = {
        directDamage: 10000, pierce: 10000, projectilesPerVolley: 64, volleysPerSecond: 60, range: 1366, projectileSpeed: 100,
        projectileRadius: 768, effectRadius: 768, projectileLifespan: 60000, ricochetCount: 64, secondaryCount: 64, secondaryDamage: 10000,
        secondaryPierce: 10000, dotDamage: 10000, dotTicks: 100, dotInterval: 60000, effectDuration: 60000, stunDuration: 60000,
        cashDelta: 100000, ecoDelta: 10000, economyInterval: 60000, trapCapacity: 100000, sendHealth: 100000, sendSpacing: 60000,
    }
    return aiCapabilitySignedLog(value, scales[key] || 10000)
}

function getNormalizedAICapabilityVector(facts) {
    facts = facts || {}
    var values = []
    for(var i = 0; i < AI_CAPABILITY_KEYS.length; i++) values.push(normalizeAICapabilityFact(AI_CAPABILITY_KEYS[i], facts[AI_CAPABILITY_KEYS[i]]))
    return values
}

function getNormalizedAICapabilityDelta(before, after) {
    var beforeValues = getNormalizedAICapabilityVector(before)
    var afterValues = getNormalizedAICapabilityVector(after)
    return afterValues.map(function(value, index) { return Math.max(-1, Math.min(1, value - beforeValues[index])) })
}
