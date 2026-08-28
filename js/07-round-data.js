// Early handcrafted rounds are represented as compact data so the runtime can stay simple.
const STANDARD_ROUND_PLANS = {
    1: { maxCounter: 20, delay: 500, phases: [{ end: 20, health: 1 }] },
    2: { maxCounter: 30, delay: 400, phases: [{ end: 30, health: 1 }] },
    3: { maxCounter: 20, delay: 500, phases: [{ end: 20, health: 1 }] },
    4: { maxCounter: 20, delay: 400, phases: [{ end: 20, health: 2 }] },
    5: { maxCounter: 30, delay: 300, phases: [{ end: 15, health: 1 }, { end: 30, health: 2 }] },
    6: { maxCounter: 25, delay: 500, phases: [{ end: 10, health: 1 }, { end: 20, health: 2 }, { end: 25, health: 3 }] },
    7: { maxCounter: 22, delay: 400, phases: [{ end: 15, health: 2 }, { end: 22, health: 3 }] },
    8: { maxCounter: 20, delay: 400, phases: [{ end: 10, health: 2 }, { end: 20, health: 3 }] },
    9: { maxCounter: 30, delay: 500, phases: [{ end: 30, health: 3 }] },
    10: { maxCounter: 50, delay: 250, phases: [{ end: 50, health: 2 }] },
    11: { maxCounter: 25, delay: 400, phases: [{ end: 10, health: 2 }, { end: 20, health: 3 }, { end: 25, health: 4 }] },
    12: { maxCounter: 22, delay: 400, phases: [{ end: 2, health: 4 }, { end: 5, health: 2 }, { end: 12, health: 3 }, { end: 22, health: 4 }] },
    13: { maxCounter: 25, delay: 500, phases: [{ end: 15, health: 3 }, { end: 25, health: 4 }] },
}

function spawnMirroredAIBloonPair(health) {
    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, health, PLAYER_SIDE.left, true, false, 0, 0, 0, 0, 0, 0))
    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, health, PLAYER_SIDE.right, true, false, 0, 0, 0, 0, 0, 0))
}

function completeRoundSpawn() {
    bloonsToSpawn = true
}

function getRoundPhaseHealth(plan, currentCounter) {
    for(var i = 0; i < plan.phases.length; i++) {
        if(currentCounter < plan.phases[i].end) {
            return plan.phases[i].health
        }
    }

    return -1
}

function runStandardRoundPlan(plan) {
    maxCounter = plan.maxCounter
    setTimeout(function() {
        var phaseHealth = getRoundPhaseHealth(plan, counter)

        // This mirrors the original recursive round spawner, but reads from data instead of a large branch chain.
        if(counter < plan.maxCounter && phaseHealth != -1) {
            spawnMirroredAIBloonPair(phaseHealth)
            counter++
            spawnRound()
        } else {
            completeRoundSpawn()
        }
    }, plan.delay)
}
