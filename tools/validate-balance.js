const fs = require("fs")
const path = require("path")
const vm = require("vm")

const root = path.resolve(__dirname, "..")
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8")
const sandboxMath = Object.create(Math)
const context = {
    console,
    Math: sandboxMath,
    Set,
    Map,
    gameNow: () => 0,
    cursor: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    pathObjects: [],
    canvas: { width: 1366, height: 768 },
    counter: 0,
    maxCounter: 1,
    bloons: [],
    projectiles: [],
    bananas: [],
    subtowers: [],
    towers: [],
    moneyText: [],
    roundReady: false,
    p1money: 0,
    p2money: 0,
    p1TotalCashGenerated: 0,
    p2TotalCashGenerated: 0,
    document: { hidden: false, addEventListener: () => {} },
    addEventListener: () => {},
    nativeSetInterval: () => 0,
}
context.globalThis = context
vm.createContext(context)
vm.runInContext(read("js/00-constants.js") + "\nglobalThis.balancePrices = BASE_TOWER_PRICES; globalThis.balanceBoosts = BOOST_SETTINGS;", context)
vm.runInContext(read("js/03-tower.js") + "\nglobalThis.BalanceTower = Tower;", context)
vm.runInContext(read("js/04-support-entities.js") + "\nglobalThis.BalanceProjectile = Projectile;", context)
vm.runInContext(read("js/09-input.js") + "\nglobalThis.balanceTowerConfig = LOADOUT_TOWER_CONFIG; globalThis.balanceApplyPath1UpgradeEffects = applyPath1UpgradeEffects; globalThis.balanceApplyPath2UpgradeEffects = applyPath2UpgradeEffects; globalThis.balanceApplyPath3UpgradeEffects = applyPath3UpgradeEffects;", context)
vm.runInContext(read("js/01-ai-capabilities.js") + "\nglobalThis.balanceTowerCapabilities = getAITowerCapabilityFacts; globalThis.balanceBoostCapabilities = getAIBoostCapabilityFacts; globalThis.balanceSendCapabilities = getAISendCapabilityFacts; globalThis.balanceLoadoutCapabilities = getAILoadoutCapabilityFacts; globalThis.balanceCapabilityKeys = AI_CAPABILITY_KEYS;", context)

function assert(condition, message) {
    if(!condition) {
        throw new Error(message)
    }
}

const towerTypes = Object.keys(context.balancePrices)
assert(towerTypes.length === 17, `Expected 17 placeable units, found ${towerTypes.length}`)
assert(context.balanceBoosts.bloonBoostFactor === 1.4, "Bloon Boost must use the documented 1.4x speed factor")

for(const towerType of towerTypes) {
    const basePrice = context.balancePrices[towerType]
    assert(Number.isFinite(basePrice) && basePrice > 0, `${towerType} needs a positive base price`)
    const tower = new context.BalanceTower(100, 100, 30, 175, towerType, 1)
    for(const pathNumber of [1, 2, 3]) {
        const names = tower[`path${pathNumber}Name`]
        const costs = tower[`path${pathNumber}Cost`]
        if(towerType === "farmer") {
            assert(costs[0] === "Max", "Farmer must remain non-upgradeable")
            continue
        }
        for(let tier = 0; tier < 5; tier++) {
            assert(typeof names[tier] === "string" && names[tier].length > 0, `${towerType} path ${pathNumber} tier ${tier + 1} needs a name`)
            assert(Number.isFinite(costs[tier]) && costs[tier] > 0, `${towerType} path ${pathNumber} tier ${tier + 1} needs a positive cost`)
        }
    }
}

const runtimeTowerTypes = Object.values(context.balanceTowerConfig).map(config => config.towerType)
assert(runtimeTowerTypes.length === 16, `Expected runtime placement data for 16 towers, found ${runtimeTowerTypes.length}`)
for(const towerType of runtimeTowerTypes) {
    const facts = context.balanceTowerCapabilities(towerType)
    assert(Object.keys(facts).length === 32, `${towerType} capability facts must have 32 fields`)
    assert(Object.values(facts).every(Number.isFinite), `${towerType} capability facts must be finite`)
}

const dartFacts = context.balanceTowerCapabilities("dart")
const tackFacts = context.balanceTowerCapabilities("tack")
const iceFacts = context.balanceTowerCapabilities("ice")
const farmFacts = context.balanceTowerCapabilities("farm")
const dartlingFacts = context.balanceTowerCapabilities("dartling")
const cobraFacts = context.balanceTowerCapabilities("cobra")
assert(dartFacts.range === 125 && dartFacts.directDamage === 1 && dartFacts.pierce === 2 && dartFacts.volleysPerSecond === 1, "Dart capabilities drifted from its runtime attack")
assert(tackFacts.projectilesPerVolley === 8 && tackFacts.volleysPerSecond === 1, "Tack volley capabilities drifted from its runtime attack")
assert(iceFacts.range === 70 && iceFacts.effectRadius === 70 && iceFacts.targetSpeedMultiplier === 0.8, "Ice area/slow capabilities drifted from runtime")
assert(farmFacts.cashDelta === 40 && farmFacts.economyInterval === 7500, "Farm income capabilities drifted from runtime")
assert(dartlingFacts.range === 50 && dartlingFacts.volleysPerSecond === 5 && dartlingFacts.projectileSpeed === 10, "Dartling capabilities drifted from runtime")
assert(cobraFacts.directDamage === 2 && cobraFacts.pierce === 1, "Cobra projectile capabilities drifted from runtime")

const slowFacts = context.balanceBoostCapabilities("slowboost.png", 1)
assert(slowFacts.targetSpeedMultiplier === 0, "Slow Sabotage cannot claim a target-speed effect")
assert(Math.abs(slowFacts.attackRateMultiplier - 1 / 1.2) < 1e-12, "Slow Sabotage must expose its defense attack-rate penalty")
const lightningFacts = context.balanceBoostCapabilities("lightningboost.png", 1)
assert(lightningFacts.secondaryCount === 5 && lightningFacts.secondaryDamage === 1 && lightningFacts.secondaryPierce === 10 && lightningFacts.effectRadius === 45, "Lightning capabilities drifted from runtime")
const groupedSendFacts = context.balanceSendCapabilities({ count: 4, health: 23, spacing: 150, eco: -2, speedMultiplier: 1.4 }, 3)
assert(groupedSendFacts.secondaryCount === 12 && groupedSendFacts.sendHealth === 23 && groupedSendFacts.sendSpacing === 150 && groupedSendFacts.ecoDelta === -6 && groupedSendFacts.sendSpeedMultiplier === 1.4, "Grouped send capabilities drifted from runtime")
const loadoutFacts = context.balanceLoadoutCapabilities(["000farm.png", "000dart.png"], ["bloonboost.png"], 1)
assert(Object.values(loadoutFacts).every(Number.isFinite) && loadoutFacts.cashDelta > 0 && loadoutFacts.directDamage > 0, "Loadout image capabilities must include their factual tower effects")
assert(loadoutFacts.sendSpeedMultiplier === 1.4, "Sparse loadout multipliers cannot be diluted by unrelated slots")

const upgradeRangeTower = new context.BalanceTower(0, 0, 30, 125, "dart", 1)
upgradeRangeTower.path3Upgrades = 1
context.balanceApplyPath3UpgradeEffects(upgradeRangeTower)
upgradeRangeTower.path3Upgrades = 2
context.balanceApplyPath3UpgradeEffects(upgradeRangeTower)
assert(upgradeRangeTower.range === 195, "Dart path-three range effects drifted from the upgrade runtime")
assert(context.projectiles.length === 0 && context.bananas.length === 0 && context.subtowers.length === 0, "Capability inspection leaked emitted entities")
assert(context.p1money === 0 && context.p2money === 0, "Capability inspection leaked economy state")

const targetTower = new context.BalanceTower(0, 0, 30, 100, "dart", 1)
context.bloons = [
    { x: 50, y: 0, pathPos: 30, health: 5, playerSide: 1 },
    { x: 10, y: 0, pathPos: 10, health: 2, playerSide: 1 },
    { x: 40, y: 0, pathPos: 20, health: 20, playerSide: 1 },
    { x: 200, y: 0, pathPos: 100, health: 100, playerSide: 1 },
    { x: 5, y: 0, pathPos: 200, health: 200, playerSide: 2 },
]
const expectedTargets = [0, 1, 1, 2]
for(let priority = 0; priority < 4; priority++) {
    targetTower.targetPrio = priority
    targetTower.findTarget()
    assert(targetTower.target === expectedTargets[priority], `Priority ${priority} selected target ${targetTower.target}`)
    assert(targetTower.target2 === expectedTargets[(priority + 1) % 4], `Priority ${priority} target rotation is incorrect`)
}

const mainLoop = read("js/08-main-loop.js")
const rounds = read("js/07-rounds.js")
const towerSource = read("js/03-tower.js")
const bloonSource = read("js/02-bloon.js")
const projectileSource = read("js/04-support-entities.js")
const aiSource = read("js/06-menu-ai.js")

assert(!mainLoop.includes("Math.floor(Math.random() * 101)"), "Biased 0-100 knockback roll returned")
assert(!mainLoop.includes("1.15 ** (round - 50)"), "Incorrect freeplay knockback health scaling returned")
assert(!mainLoop.includes("projectiles[i].towerID"), "Sword child attribution regression detected")
assert(!mainLoop.includes("projectiles[i].length"), "Broken projectile merge loop returned")
assert(!towerSource.includes("this.overclockFactor * (this.cobraBoosted"), "Dartling cooldown modifiers are squared")
assert(!bloonSource.includes("&& health < 68"), "Freeplay Bloon adjustment uses an undefined health variable")
assert(projectileSource.includes("this.hitBloons = new Set()"), "Projectile hit history is missing")
assert(!aiSource.includes("canAIInvestInFarmNow"), "Farm investment heuristics cannot override the neural placement decision")
assert(aiSource.includes('tower.towerType == "farm" && tower.aiPlacedAt > 0 && tower.aiPlacedRound == visibleRound'), "New AI farms can be sold in their placement round")
assert(aiSource.includes('typeof applyPath1UpgradeEffects == "function"') && aiSource.includes('typeof applyPath2UpgradeEffects == "function"') && aiSource.includes('typeof applyPath3UpgradeEffects == "function"'), "Hypothetical upgrades must apply runtime upgrade effects")
assert((rounds.match(/else if\(round == 43\)/g) || []).length === 2, "Round 43 must appear exactly once per round mode")
assert(/maxCounter = 5\s+setTimeout\(function\(\) \{\s+if\(counter < 5\)/.test(rounds), "Mastery round 80 counter mismatch returned")
assert(!rounds.includes("Math.ceil(9200 *"), "Mastery round 67 side asymmetry returned")

console.log(`Balance validation passed for ${towerTypes.length} units and 51 upgrade paths.`)
