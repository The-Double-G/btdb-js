// Round spawning and progression data
function spawnRound() {
    if(mastery == false) {
        var standardRoundPlan = STANDARD_ROUND_PLANS[round]
        if(standardRoundPlan) {
            runStandardRoundPlan(standardRoundPlan)
            return
        }

        if(round == 14) {
            maxCounter = 56
            setTimeout(function() {
                if(counter < 10) {
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 24) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 24 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 28 && counter < 38) {
                    counter++
                    spawnRound()
                } else if(counter >= 38 && counter < 46) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 46 && counter < 52) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 52 && counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
                if(counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false, 0, 0, 0, 0, 0, 0))
                }
            }, 300)
        } else if(round == 15) {
            maxCounter = 48
            setTimeout(function() {
                if(counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 12 && counter < 24) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 24 && counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 44) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 44 && counter < 48) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 16) {
            maxCounter = 63
            setTimeout(function() {
                if(counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 41) {
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 63) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 17) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 18) {
            maxCounter = 60
            setTimeout(function() {
                if(counter < 60) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 19) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 20) {
            maxCounter = 6
            setTimeout(function() {
                if(counter < 6) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 21) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 22) {
            maxCounter = 12
            setTimeout(function() {
                if(counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 23) {
            maxCounter = 18
            setTimeout(function() {
                if(counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 24) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 25) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 26) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 27) {
            maxCounter = 120
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 60) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 60 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 90 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 28) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 29) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 30) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 21 && counter % 3 != 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter < 21 && counter % 3 == 2) {
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 31) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 21 && counter % 3 != 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter < 21 && counter % 3 == 2) {
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 32) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 33) {
            maxCounter = 66
            setTimeout(function() {
                if(counter < 66) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 34) {
            maxCounter = 135
            setTimeout(function() {
                if(counter < 135) {
                    if(counter % 7 != 6) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    }
                } else {
                    bloonsToSpawn = true
                }
            }, 125)
        } else if(round == 35) {
            maxCounter = 21
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                }  else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 36) {
            maxCounter = 150
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 60) {
                    counter++
                    spawnRound()
                } else if(counter >= 60 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 90 && counter < 120) {
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 150) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                }  else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 37) {
            maxCounter = 50
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 25 && counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 38) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 28 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 39) {
            maxCounter = 45
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 35) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 35 && counter < 45) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 40) {
            maxCounter = 1
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        } else if(round == 41) {
            maxCounter = 66
            setTimeout(function() {
                if(counter < 66) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 150)
        } else if(round == 42) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 43) {
            maxCounter = 15
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 44) {
            maxCounter = 45
            setTimeout(function() {
                if(counter < 45) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 45) {
            maxCounter = 40
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 40) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 46) {
            maxCounter = 18
            setTimeout(function() {
                if(counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 47) {
            maxCounter = 90
            setTimeout(function() {
                if(counter < 40) {
                    if(counter % 5 == 4) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 40 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 48) {
            maxCounter = 245
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 70) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 70 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 135) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 135 && counter < 185) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 185 && counter < 195) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 195 && counter < 245) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 49) {
            maxCounter = 245
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 70) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 70 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 135) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 135 && counter < 185) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 185 && counter < 195) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 195 && counter < 245) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 50) {
            maxCounter = 57
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 41) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 56 && counter < 57) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 51) {
            maxCounter = 40
            setTimeout(function() {
                if(counter < 20) {
                    if(counter % 2 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 20 && counter < 40) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 52) {
            maxCounter = 92
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 41) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 91) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 91 && counter < 92) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 53) {
            maxCounter = 43
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 22 && counter < 42) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 42 && counter < 43) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 54) {
            maxCounter = 37
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 37) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 55) {
            maxCounter = 81
            setTimeout(function() {
                if(counter < 80) {
                    if(counter % 20 < 10) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 80 && counter < 81) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 75)
        } else if(round == 56) {
            maxCounter = 23
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 57) {
            maxCounter = 23
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 58) {
            maxCounter = 34
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 12 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 22 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 23 && counter < 33) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 33 && counter < 34) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 59) {
            maxCounter = 31
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 31) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 60) {
            maxCounter = 1
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1)
        } else if(round == 61) {
            maxCounter = 204
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 51) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 51 && counter < 101) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 101 && counter < 102) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 102 && counter < 152) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 152 && counter < 153) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 153 && counter < 203) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 203 && counter < 204) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 62) {
            maxCounter = 160
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 25 && counter < 26) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 26 && counter < 51) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 51 && counter < 52) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 52 && counter < 77) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 77 && counter < 78) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 78 && counter < 103) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 103 && counter < 104) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 104 && counter < 129) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 129 && counter < 130) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 130 && counter < 160) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 63) {
            maxCounter = 240
            setTimeout(function() {
                if(counter < 240) {
                    if(counter % 80 < 40) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else {
                    bloonsToSpawn = true
                }
            }, 25)
        } else if(round == 64) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 65) {
            maxCounter = 125
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 && counter < 55) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 55 && counter < 95) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 95 && counter < 125) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 66) {
            maxCounter = 19
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 4) {
                    counter++
                    spawnRound()
                } else if(counter >= 4 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 10) {
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 14) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 14 && counter < 18) {
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 19) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 67) {
            maxCounter = 8
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 68) {
            maxCounter = 3
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1500)
        } else if(round == 69) {
            maxCounter = 11
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 70) {
            maxCounter = 11
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3 && counter < 4) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 4 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 8 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 71) {
            maxCounter = 4
            setTimeout(function() {
                if(counter < 4) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1000)
        } else if(round == 72) {
            maxCounter = 12
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 73) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 74) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3 && counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 14) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 14 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 75) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 8 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 76) {
            maxCounter = 10
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1000)
        } else if(round == 77) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 17) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 17 && counter < 27) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 27 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 78) {
            maxCounter = 4121
            setTimeout(function() {
                if(counter < 1000) {
                    if(counter % 20 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 1000 && counter < 1060) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1060 && counter < 2060) {
                    if(counter % 20 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 2060 && counter < 2061) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2061 && counter < 3061) {
                    if(counter % 20 == 2) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 3061 && counter < 3121) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3121 && counter < 4121) {
                    if(counter % 20 == 2) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 10)
        } else if(round == 79) {
            maxCounter = 476
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 76) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 76 && counter < 77) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 77 && counter < 152) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 152 && counter < 153) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 153 && counter < 228) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 228 && counter < 229) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 229 && counter < 304) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 304 && counter < 305) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 305 && counter < 380) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 380 && counter < 381) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 381 && counter < 476) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 80) {
            maxCounter = 1
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1)
        } else {
            maxCounter = zomgCount + bfbCount + moabCount
            setTimeout(function() {
                if(counter < zomgCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= zomgCount && counter < zomgCount + bfbCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= zomgCount + bfbCount && counter < zomgCount + bfbCount + moabCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        }
    } else {
        if(round == 1) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 2) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 3) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 4) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 5) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 6) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 7) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 8) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 9) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 10) {
            maxCounter = 50
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 250)
        } else if(round == 11) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 12) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 && counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 12 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 13) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 14) {
            maxCounter = 56
            setTimeout(function() {
                if(counter < 10) {
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 24) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 24 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 28 && counter < 38) {
                    counter++
                    spawnRound()
                } else if(counter >= 38 && counter < 46) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 46 && counter < 52) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 52 && counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
                if(counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                }
            }, 300)
        } else if(round == 15) {
            maxCounter = 48
            setTimeout(function() {
                if(counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 12 && counter < 24) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 24 && counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 44) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 44 && counter < 48) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 16) {
            maxCounter = 63
            setTimeout(function() {
                if(counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 41) {
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 63) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 17) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 18) {
            maxCounter = 60
            setTimeout(function() {
                if(counter < 60) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 19) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 20) {
            maxCounter = 6
            setTimeout(function() {
                if(counter < 6) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 21) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 22) {
            maxCounter = 12
            setTimeout(function() {
                if(counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 23) {
            maxCounter = 18
            setTimeout(function() {
                if(counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 24) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 25) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 26) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 27) {
            maxCounter = 120
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 60) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 60 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 90 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 28) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 29) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 30) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 21 && counter % 3 != 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter < 21 && counter % 3 == 2) {
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 31) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 21 && counter % 3 != 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter < 21 && counter % 3 == 2) {
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 32) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 33) {
            maxCounter = 66
            setTimeout(function() {
                if(counter < 66) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 34) {
            maxCounter = 135
            setTimeout(function() {
                if(counter < 135) {
                    if(counter % 7 != 6) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    }
                } else {
                    bloonsToSpawn = true
                }
            }, 125)
        } else if(round == 35) {
            maxCounter = 21
            setTimeout(function() {
                if(counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 15 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                }  else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 36) {
            maxCounter = 150
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 60) {
                    counter++
                    spawnRound()
                } else if(counter >= 60 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 90 && counter < 120) {
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 150) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                }  else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 37) {
            maxCounter = 50
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 25 && counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 38) {
            maxCounter = 30
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 28 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 39) {
            maxCounter = 45
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 35) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 35 && counter < 45) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 40) {
            maxCounter = 1
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 1, true, false, 0, 0, 0, 0, 0, 0))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 2, true, false, 0, 0, 0, 0, 0, 0))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        } else if(round == 41) {
            maxCounter = 66
            setTimeout(function() {
                if(counter < 66) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 150)
        } else if(round == 42) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 43) {
            maxCounter = 15
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 15) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 400)
        } else if(round == 44) {
            maxCounter = 45
            setTimeout(function() {
                if(counter < 45) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 45) {
            maxCounter = 40
            setTimeout(function() {
                if(counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 20 && counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 40) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 46) {
            maxCounter = 18
            setTimeout(function() {
                if(counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 47) {
            maxCounter = 90
            setTimeout(function() {
                if(counter < 40) {
                    if(counter % 5 == 4) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 40 && counter < 90) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 48) {
            maxCounter = 245
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 70) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 70 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 135) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 135 && counter < 185) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 185 && counter < 195) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 195 && counter < 245) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 49) {
            maxCounter = 245
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 70) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 70 && counter < 120) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 120 && counter < 135) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 135 && counter < 185) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 185 && counter < 195) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 195 && counter < 245) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 50) {
            maxCounter = 57
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 41) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 56) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 56 && counter < 57) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 918, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 51) {
            maxCounter = 40
            setTimeout(function() {
                if(counter < 20) {
                    if(counter % 2 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 20 && counter < 40) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 52) {
            maxCounter = 92
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 41) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 41 && counter < 91) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 91 && counter < 92) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 53) {
            maxCounter = 43
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 22 && counter < 42) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 42 && counter < 43) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 54) {
            maxCounter = 37
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 36) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 36 && counter < 37) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 55) {
            maxCounter = 81
            setTimeout(function() {
                if(counter < 80) {
                    if(counter % 20 < 10) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else if(counter >= 80 && counter < 81) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 75)
        } else if(round == 56) {
            maxCounter = 23
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 57) {
            maxCounter = 23
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 21) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 21 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 58) {
            maxCounter = 34
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 12 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 22 && counter < 23) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 23 && counter < 33) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 33 && counter < 34) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 59) {
            maxCounter = 31
            setTimeout(function() {
                if(counter < 30) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 30 && counter < 31) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 60) {
            maxCounter = 1
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1)
        } else if(round == 61) {
            maxCounter = 204
            setTimeout(function() {
                if(counter < 50) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 50 && counter < 51) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 51 && counter < 101) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 101 && counter < 102) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 102 && counter < 152) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 152 && counter < 153) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 153 && counter < 203) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 203 && counter < 204) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else if(round == 62) {
            maxCounter = 160
            setTimeout(function() {
                if(counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 25 && counter < 26) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 26 && counter < 51) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 51 && counter < 52) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 52 && counter < 77) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 77 && counter < 78) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 78 && counter < 103) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 103 && counter < 104) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 104 && counter < 129) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 129 && counter < 130) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 130 && counter < 160) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 63) {
            maxCounter = 240
            setTimeout(function() {
                if(counter < 240) {
                    if(counter % 80 < 40) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                        counter++
                        spawnRound()
                    } else {
                        counter++
                        spawnRound()
                    }
                } else {
                    bloonsToSpawn = true
                }
            }, 25)
        } else if(round == 64) {
            maxCounter = 9
            setTimeout(function() {
                if(counter < 9) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 65) {
            maxCounter = 125
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 && counter < 55) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 55 && counter < 95) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 95 && counter < 125) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        } else if(round == 66) {
            maxCounter = 19
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 4) {
                    counter++
                    spawnRound()
                } else if(counter >= 4 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 10) {
                    counter++
                    spawnRound()
                } else if(counter >= 10 && counter < 14) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 14 && counter < 18) {
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 19) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 67) {
            maxCounter = 8
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 68) {
            maxCounter = 3
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1500)
        } else if(round == 69) {
            maxCounter = 11
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 300)
        } else if(round == 70) {
            maxCounter = 11
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3 && counter < 4) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 4 && counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 8 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 71) {
            maxCounter = 4
            setTimeout(function() {
                if(counter < 4) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1000)
        } else if(round == 72) {
            maxCounter = 12
            setTimeout(function() {
                if(counter < 2) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2 && counter < 12) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 73) {
            maxCounter = 25
            setTimeout(function() {
                if(counter < 7) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 7 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 25) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 74) {
            maxCounter = 20
            setTimeout(function() {
                if(counter < 3) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3 && counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 14) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 14 && counter < 20) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 75) {
            maxCounter = 22
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 8) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 8 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 18) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 18 && counter < 22) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 76) {
            maxCounter = 10
            setTimeout(function() {
                if(counter < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 1000)
        } else if(round == 77) {
            maxCounter = 28
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 11) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 11 && counter < 17) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 17 && counter < 27) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 27 && counter < 28) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 500)
        } else if(round == 78) {
            maxCounter = 4121
            setTimeout(function() {
                if(counter < 1000) {
                    if(counter % 20 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 1000 && counter < 1060) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1060 && counter < 2060) {
                    if(counter % 20 == 1) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 2060 && counter < 2061) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 2061 && counter < 3061) {
                    if(counter % 20 == 2) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else if(counter >= 3061 && counter < 3121) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 3121 && counter < 4121) {
                    if(counter % 20 == 2) {
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                        bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    }
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 10)
        } else if(round == 79) {
            maxCounter = 476
            setTimeout(function() {
                if(counter < 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 1 && counter < 76) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 76 && counter < 77) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 77 && counter < 152) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 152 && counter < 153) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 153 && counter < 228) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 228 && counter < 229) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 229 && counter < 304) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 304 && counter < 305) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 305 && counter < 380) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 380 && counter < 381) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 381 && counter < 476) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 50)
        } else if(round == 80) {
            maxCounter = 5
            setTimeout(function() {
                if(counter < 5) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 100)
        } else {
            maxCounter = zomgCount + bfbCount + moabCount
            setTimeout(function() {
                if(counter < 5 * zomgCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >=  5 * zomgCount && counter <  5 * zomgCount + bfbCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else if(counter >= 5 * zomgCount + bfbCount && counter < 5 * zomgCount + bfbCount + moabCount) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false, 0, 0, 0, 0, 0, 0))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false, 0, 0, 0, 0, 0, 0))
                    counter++
                    spawnRound()
                } else {
                    bloonsToSpawn = true
                }
            }, 200)
        }
    }
}
