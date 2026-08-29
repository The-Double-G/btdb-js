const fs = require("fs")
const path = require("path")
const vm = require("vm")

const root = path.resolve(__dirname, "..")
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8")
const context = {
    console,
    Math,
    Set,
    Map,
    gameNow: () => 0,
    cursor: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    pathObjects: [],
    canvas: { width: 1366, height: 768 },
    counter: 0,
    maxCounter: 1,
    bloons: [],
}
context.globalThis = context
vm.createContext(context)
vm.runInContext(read("js/00-constants.js") + "\nglobalThis.balancePrices = BASE_TOWER_PRICES; globalThis.balanceBoosts = BOOST_SETTINGS;", context)
vm.runInContext(read("js/03-tower.js") + "\nglobalThis.BalanceTower = Tower;", context)

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
assert(aiSource.includes("farm.aiPlacedAt > 0 && farm.aiPlacedRound == visibleRound && players[side].lives > 35"), "New AI farms can be sold in their placement round")
assert((rounds.match(/else if\(round == 43\)/g) || []).length === 2, "Round 43 must appear exactly once per round mode")
assert(/maxCounter = 5\s+setTimeout\(function\(\) \{\s+if\(counter < 5\)/.test(rounds), "Mastery round 80 counter mismatch returned")
assert(!rounds.includes("Math.ceil(9200 *"), "Mastery round 67 side asymmetry returned")

console.log(`Balance validation passed for ${towerTypes.length} units and 51 upgrade paths.`)
