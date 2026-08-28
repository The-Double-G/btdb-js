// Bloon entity and behavior
var nextBloonID = 1

function advanceBloonSpawnProgressByElapsedMs(bloon, elapsedMs) {
    if(!bloon || elapsedMs <= 0 || bloon.stunned > gameNow()) {
        return bloon
    }
    var simStepMultiplier = elapsedMs / (1000 / 60)
    if(mapNumber == 0) {
        bloon.pathPos += 3 * bloon.speed * bloon.bloonBoosted * simStepMultiplier
    } else if(mapNumber == 1) {
        bloon.pathPos += 2 * bloon.speed * bloon.bloonBoosted * simStepMultiplier
    }
    return bloon
}

class Bloon {
    constructor(x, y, radius, pathPos, iced, glued, stunned, health, playerSide, isAI, unadjustable, dpsDamage, dpsType, dpsTicks, dpsLastTick, dpsTickRate, dpsTowerID) {
        this.bloonID = nextBloonID++
        this.x = x
        this.y = y
        this.previousX = x
        this.previousY = y
        this.radius = radius
        this.drawRad = radius
        this.pathPos = pathPos
        this.health = health
        this.maxHealth = health
        this.iced = iced
        this.glued = glued
        this.stunned = stunned
        this.playerSide = playerSide
        this.isAI = isAI
        this.unadjustable = unadjustable
        this.spawnPinks = false
        this.spawnBlacks = false
        this.spawnZebras = false
        this.spawnRainbows = false
        this.spawnCeramics = false
        this.spawnMOABs = false
        this.spawnBFBs = false
        this.speedFactor = 1
        this.healthFactor = 1
        this.isBoss = false
        this.regularAdjustments = consoleAdjustments
        this.t5Adjustments = 0
        this.bloonBoosted = 1
        this.cobraBoosted = 1
        this.mapFactor = 1
        this.sabotaged = 1
        this.dpsDamage = dpsDamage
        this.dpsType = dpsType
        this.dpsTicks = dpsTicks
        this.dpsLastTick = dpsLastTick
        this.dpsTickRate = dpsTickRate
        this.dpsTowerID = dpsTowerID
        if(mapNumber == 0) {
            this.mapFactor = 1.5
        } else if(mapNumber == 1) {
            this.mapFactor = 1
        }
        if(this.playerSide == 1) {
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 2 && towers[i].playerSide == 2) {
                    this.regularAdjustments++
                }
                if(towers[i].towerType == "cobra" && towers[i].path3Upgrades == 5 && towers[i].playerSide == 2) {
                    this.t5Adjustments++
                }
            }
        } else if(this.playerSide == 2) {
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerType == "cobra" && towers[i].path3Upgrades >= 2 && towers[i].playerSide == 1) {
                    this.regularAdjustments++
                }
                if(towers[i].towerType == "cobra" && towers[i].path3Upgrades == 5 && towers[i].playerSide == 1) {
                    this.t5Adjustments++
                }
            }
        }
        if(this.isAI && this.unadjustable == false) {
            for(var i = 0; i < this.regularAdjustments; i++) {
                if(Math.random() <= 0.2 && this.health < 18 && round <= 50) {
                    if(this.health != 18) {
                        this.health++
                    }
                    if(this.health > 8 && this.health < 18) {
                        this.health = 18
                    }
                } else if(Math.random() <= 0.2 && this.health < 68 && round > 50) {
                    if(this.health != 68) {
                        this.health++
                    }
                    if(this.health > 8 && this.health < 68) {
                        this.health = 68
                    }
                }
            }
        }
        if(this.isAI == false && this.unadjustable == false) {
            if(this.t5Adjustments != 0) {
                if(this.health < 18 && round <= 50) {
                    if(this.health != 18) {
                        this.health++
                    }
                    if(this.health > 8 && this.health < 18) {
                        this.health = 18
                    }
                } else if(this.health < 68 && round > 50) {
                    if(this.health != 68) {
                        this.health++
                    }
                    if(this.health > 8 && this.health < 68) {
                        this.health = 68
                    }
                }
            }
        }
        if(round > 50) {
            this.speedFactor = 1.02 ** (round - 50)
            this.healthFactor = 1.05 ** (round - 50)
        }
        if(this.health == 1) {
            this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "red.png"
        } else if(this.health == 2) {
            this.speed = 0.042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "blue.png"
        } else if(this.health == 3) {
            this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "green.png"
        } else if(this.health == 4) {
            this.speed = 0.096 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "yellow.png"
        } else if(this.health == 5) {
            this.speed = 0.105 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "pink.png"
        } else if(round <= 50) {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "black.png"
                this.spawnPinks = true
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zebra.png"
                this.spawnPinks = true
                this.spawnBlacks = true
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "rainbow.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
            } else if(this.health > 8 && this.health <= 10) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic1.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 10 && this.health <= 12) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic2.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 12 && this.health <= 14) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic3.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 14 && this.health <= 16) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic4.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 16 && this.health <= 18) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic5.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 18 && this.health <= 58) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 58 && this.health <= 98) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 98 && this.health <= 138) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 138 && this.health <= 178) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 178 && this.health <= 218) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 218 && this.health <= 358) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 358 && this.health <= 498) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 498 && this.health <= 638) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 638 && this.health <= 778) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 778 && this.health <= 918) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 918 && this.health <= 1718) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 1718 && this.health <= 2518) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 2518 && this.health <= 3318) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 3318 && this.health <= 4118) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 4118 && this.health <= 4918) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            }
        } else {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "black.png"
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zebra.png"
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "rainbow.png"
            } else if(this.health > 8 && this.health <= 20) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic1.png"
            } else if(this.health > 20 && this.health <= 32) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic2.png"
            } else if(this.health > 32 && this.health <= 44) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic3.png"
            } else if(this.health > 44 && this.health <= 56) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic4.png"
            } else if(this.health > 56 && this.health <= 68) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic5.png"
            } else if(this.health > 68 && this.health <= 68 + Math.ceil(40 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(40 * this.healthFactor) && this.health <=  68 + Math.ceil(80 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(80 * this.healthFactor) && this.health <=  68 + Math.ceil(120 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(120 * this.healthFactor) && this.health <= 68 + Math.ceil(160 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(160 * this.healthFactor) && this.health <=  68 + Math.ceil(200 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health > 68 + Math.ceil(200 * this.healthFactor) && this.health <= 68 + Math.ceil(340 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(340 * this.healthFactor) && this.health <= 68 + Math.ceil(480 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(480 * this.healthFactor) && this.health <= 68 + Math.ceil(620 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(620 * this.healthFactor) && this.health <= 68 + Math.ceil(760 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(760 * this.healthFactor) && this.health <= 68 + Math.ceil(900 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(900 * this.healthFactor) && this.health <= 68 + Math.ceil(1700 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(1700 * this.healthFactor) && this.health <= 68 + Math.ceil(2500 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(2500 * this.healthFactor) && this.health <= 68 + Math.ceil(3300 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(3300 * this.healthFactor) && this.health <= 68 + Math.ceil(4100 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(4100 * this.healthFactor) && this.health <= 68 + Math.ceil(4900 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            }
        }
        if(this.pathPos == 0 && this.x == -1000 && runtimeTaskScheduleBaseAt > 0) {
            advanceBloonSpawnProgressByElapsedMs(this, Math.max(0, gameNow() - runtimeTaskScheduleBaseAt))
        }
    }


    draw()
    {
        /*
        ctx.fillStyle = this.color
        ctx.strokeStyle = "black"
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.arc
        (
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        )
        ctx.fill()
        ctx.stroke()
        */
        drawCenteredAsset(this.image, this.x, this.y, this.radius)
        if(this.playerSide == 1 && p2decal && this.isAI == false || this.playerSide == 2 && p1decal && this.isAI == false) {
            var overlayImage = "decaliceswag.png"
            if(this.radius != this.drawRad) {
                overlayImage = "decaliceswagmoab.png"
            }
            drawCenteredAsset(overlayImage, this.x, this.y, this.radius)
        }
        if(this.dpsTicks > 0) {
            var fireOverlayImage = "onfire.png"
            if(this.radius != this.drawRad) {
                fireOverlayImage = "onfiremoab.png"
            }
            drawCenteredAsset(fireOverlayImage, this.x, this.y, this.radius)
        }
        if(debug) {
            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
            ctx.textAlign = "center"
            if(round <= 50) {
                if(this.health <= 8) {
                    ctx.strokeText("1", this.x, this.y, 2 * this.radius)
                    ctx.fillText("1", this.x, this.y, 2 * this.radius)
                } else if(this.health <= 18) {
                    ctx.strokeText(this.health - 8, this.x, this.y, 2 * this.radius)
                    ctx.fillText(this.health - 8, this.x, this.y, 2 * this.radius)
                } else if(this.health <= 218) {
                    ctx.strokeText(this.health - 18, this.x, this.y, 2 * this.radius)
                    ctx.fillText(this.health - 18, this.x, this.y, 2 * this.radius)
                } else if(this.health <= 918) {
                    ctx.strokeText(this.health - 218, this.x, this.y, 2 * this.radius)
                    ctx.fillText(this.health - 218, this.x, this.y, 2 * this.radius)
                } else if(this.health <= 4918) {
                    ctx.strokeText((this.health - 918).toLocaleString(), this.x, this.y, 2 * this.radius)
                    ctx.fillText((this.health - 918).toLocaleString(), this.x, this.y, 2 * this.radius)
                }
            } else {
                if(this.health <= 8) {
                    ctx.strokeText("1", this.x, this.y, 2 * this.radius)
                    ctx.fillText("1", this.x, this.y, 2 * this.radius)
                } else if(this.health <= 68) {
                    ctx.strokeText(this.health - 8, this.x, this.y, 2 * this.radius)
                    ctx.fillText(this.health - 8, this.x, this.y, 2 * this.radius)
                } else if(this.health <= Math.ceil(200 * this.healthFactor + 68)) {
                    ctx.strokeText((Math.ceil(this.health) - 68).toLocaleString(), this.x, this.y, 2 * this.radius)
                    ctx.fillText((Math.ceil(this.health) - 68).toLocaleString(), this.x, this.y, 2 * this.radius)
                } else if(this.health <= Math.ceil(900 * this.healthFactor + 68)) {
                    ctx.strokeText((Math.ceil(this.health) - Math.ceil(200 * this.healthFactor + 68)).toLocaleString(), this.x, this.y, 2 * this.radius)
                    ctx.fillText((Math.ceil(this.health) - Math.ceil(200 * this.healthFactor + 68)).toLocaleString(), this.x, this.y, 2 * this.radius)
                } else if(this.health <= Math.ceil(4900 * this.healthFactor + 68)) {
                    ctx.strokeText((Math.ceil(this.health) - Math.ceil(900 * this.healthFactor + 68)).toLocaleString(), this.x, this.y, 2 * this.radius)
                    ctx.fillText((Math.ceil(this.health) - Math.ceil(900 * this.healthFactor + 68)).toLocaleString(), this.x, this.y, 2 * this.radius)
                }
            }
        }
    }


    update() {
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        this.previousX = this.x
        this.previousY = this.y
        if(this.stunned <= gameNow()) {
            if(mapNumber == 0) {
                this.pathPos += 3 * this.speed * this.bloonBoosted * simStepMultiplier
            } else if(mapNumber == 1) {
                this.pathPos += 2 * this.speed * this.bloonBoosted * simStepMultiplier
            }
        }
        if(mapNumber == 0) {
            if(this.playerSide == 1) {
                if(this.pathPos < 100/8) {
                    this.x = canvas.width/4 + canvas.width/16
                    this.y = (2 * this.pathPos/100) * canvas.height
                } else if(this.pathPos < 200/8) {
                    this.x = ((-1 * this.pathPos/100) + 3/8) * canvas.width + canvas.width/16
                    this.y = canvas.height/4
                } else if(this.pathPos < 300/8) {
                    this.x = canvas.width/8 + canvas.width/16
                    this.y = (2 * this.pathPos/100 - 1/4) * canvas.height
                } else if(this.pathPos < 500/8) {
                    this.x = ((1 * this.pathPos/100) - 1/4) * canvas.width + canvas.width/16
                    this.y = canvas.height/2
                } else if(this.pathPos < 600/8) {
                    this.x = 3*canvas.width/8 + canvas.width/16
                    this.y = (2 * this.pathPos/100 - 3/4) * canvas.height
                } else if(this.pathPos < 700/8) {
                    this.x = ((-1 * this.pathPos/100) + 9/8) * canvas.width + canvas.width/16
                    this.y = 3*canvas.height/4
                } else if(this.pathPos < 800/8) {
                    this.x = canvas.width/4 + canvas.width/16
                    this.y = (2 * this.pathPos/100 - 1) * canvas.height
                }
            } else {
                if(this.pathPos < 100/8) {
                    this.x = canvas.width/4 + 7*canvas.width/16
                    this.y = (2 * this.pathPos/100) * canvas.height
                } else if(this.pathPos < 200/8) {
                    this.x = ((-1 * this.pathPos/100) + 3/8) * canvas.width + 7*canvas.width/16
                    this.y = canvas.height/4
                } else if(this.pathPos < 300/8) {
                    this.x = canvas.width/8 + 7*canvas.width/16
                    this.y = (2 * this.pathPos/100 - 1/4) * canvas.height
                } else if(this.pathPos < 500/8) {
                    this.x = ((1 * this.pathPos/100) - 1/4) * canvas.width + 7*canvas.width/16
                    this.y = canvas.height/2
                } else if(this.pathPos < 600/8) {
                    this.x = 3*canvas.width/8 + 7*canvas.width/16
                    this.y = (2 * this.pathPos/100 - 3/4) * canvas.height
                } else if(this.pathPos < 700/8) {
                    this.x = ((-1 * this.pathPos/100) + 9/8) * canvas.width + 7*canvas.width/16
                    this.y = 3*canvas.height/4
                } else if(this.pathPos < 800/8) {
                    this.x = canvas.width/4 + 7*canvas.width/16
                    this.y = (2 * this.pathPos/100 - 1) * canvas.height
                }
            }
        } else if(mapNumber == 1) {
            if(this.playerSide == 1) {
                if(this.pathPos < (100/v)*dist(o, p)) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(o, p))*this.pathPos + 1/2) * 3/4 + 1/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(o, p)))*this.pathPos + 1/2)
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(h, o))*this.pathPos + 5/12 - ((-1/12)/((100/v)*dist(h, o))) * (100/v)*dist(o, p)) * 3/4 + 1/8)
                    this.y = canvas.height * (((1/8)/((100/v)*dist(h, o))*this.pathPos + 1/8 - ((1/8))/((100/v)*dist(h, o)) * (100/v)*dist(o, p)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) {
                    this.x = canvas.width * (((1/12)/((100/v)*dist(g, h))*this.pathPos + 1/3 - ((1/12)/((100/v)*dist(g, h))) * (100/v)*(dist(o, p) + dist(h, o))) * 3/4 + 1/8)
                    this.y = canvas.height * (((7/16)/((100/v)*dist(g, h))*this.pathPos + 1/4 - ((7/16))/((100/v)*dist(g, h)) * (100/v)*(dist(o, p) + dist(h, o))))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(f, g))*this.pathPos + 5/12 - ((-1/12)/((100/v)*dist(f, g))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) * 3/4 + 1/8)
                    this.y = canvas.height * (((3/16)/((100/v)*dist(f, g))*this.pathPos + 11/16 - ((3/16))/((100/v)*dist(f, g)) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(d, f))*this.pathPos + 1/3 - ((-1/12)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) * 3/4 + 1/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(d, f)))*this.pathPos + 7/8 - ((-3/8)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(c, d))*this.pathPos + 1/6 - ((-1/12)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) * 3/4 + 1/8)
                    this.y = canvas.height * (((3/8)/((100/v)*dist(c, d)))*this.pathPos + 7/8 - ((3/8)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(b, c))*this.pathPos + 1/12 - ((-1/12)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) * 3/4 + 1/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(b, c)))*this.pathPos + 1/2 - ((-3/8)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c)))
                } else if(this.pathPos < 100) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(a, b))*this.pathPos - ((-1/12)/((100/v)*dist(a, b))) * 100) * 3/4 + 1/8)
                    this.y = canvas.height * (1/2)
                }
            } else {
                if(this.pathPos < (100/v)*dist(o, p)) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(o, p))*this.pathPos + 1/2) * -3/4 + 7/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(o, p)))*this.pathPos + 1/2)
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(h, o))*this.pathPos + 5/12 - ((-1/12)/((100/v)*dist(h, o))) * (100/v)*dist(o, p)) * -3/4 + 7/8)
                    this.y = canvas.height * (((1/8)/((100/v)*dist(h, o))*this.pathPos + 1/8 - ((1/8))/((100/v)*dist(h, o)) * (100/v)*dist(o, p)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) {
                    this.x = canvas.width * (((1/12)/((100/v)*dist(g, h))*this.pathPos + 1/3 - ((1/12)/((100/v)*dist(g, h))) * (100/v)*(dist(o, p) + dist(h, o))) * -3/4 + 7/8)
                    this.y = canvas.height * (((7/16)/((100/v)*dist(g, h))*this.pathPos + 1/4 - ((7/16))/((100/v)*dist(g, h)) * (100/v)*(dist(o, p) + dist(h, o))))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(f, g))*this.pathPos + 5/12 - ((-1/12)/((100/v)*dist(f, g))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) * -3/4 + 7/8)
                    this.y = canvas.height * (((3/16)/((100/v)*dist(f, g))*this.pathPos + 11/16 - ((3/16))/((100/v)*dist(f, g)) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(d, f))*this.pathPos + 1/3 - ((-1/12)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) * -3/4 + 7/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(d, f)))*this.pathPos + 7/8 - ((-3/8)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(c, d))*this.pathPos + 1/6 - ((-1/12)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) * -3/4 + 7/8)
                    this.y = canvas.height * (((3/8)/((100/v)*dist(c, d)))*this.pathPos + 7/8 - ((3/8)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d)))
                } else if(this.pathPos < (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(b, c))*this.pathPos + 1/12 - ((-1/12)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) * -3/4 + 7/8)
                    this.y = canvas.height * (((-3/8)/((100/v)*dist(b, c)))*this.pathPos + 1/2 - ((-3/8)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c)))
                } else if(this.pathPos < 100) {
                    this.x = canvas.width * (((-1/12)/((100/v)*dist(a, b))*this.pathPos - ((-1/12)/((100/v)*dist(a, b))) * 100) * -3/4 + 7/8)
                    this.y = canvas.height * (1/2)
                }
            }
        }
    }

    spawnBloons() {
        if(this.health == 1) {
            this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "red.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                this.sabotaged = 1
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 8)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
        } else if(this.health == 2) {
            this.speed = 0.042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "blue.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                this.sabotaged = 1
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 8)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
        } else if(this.health == 3) {
            this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "green.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                this.sabotaged = 1
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 8)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
        } else if(this.health == 4) {
            this.speed = 0.096 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "yellow.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                this.sabotaged = 1
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 8)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
        } else if(this.health == 5) {
            this.speed = 0.105 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
            this.image = "pink.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                this.sabotaged = 1
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 8)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            }
        } else if(round <= 50) {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "black.png"
                this.spawnPinks = true
                this.radius = this.drawRad
                if(this.spawnBlacks == true) {
                    this.spawnBlacks = false
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
                if(this.spawnZebras == true) {
                    this.spawnZebras = false
                    for(var i = 0; i < 2; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    for(var i = 0; i < 4; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 4)), this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zebra.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.radius = this.drawRad
                if(this.spawnZebras == true) {
                    this.spawnZebras = false
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 7, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    for(var i = 0; i < 2; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 2)), this.iced, this.glued, this.stunned, 7, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "rainbow.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.radius = this.drawRad
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    this.sabotaged = 1
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - this.mapFactor, this.iced, this.glued, this.stunned, 8, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                }
            } else if(this.health > 8 && this.health <= 10) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic1.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 10 && this.health <= 12) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic2.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 12 && this.health <= 14) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic3.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 14 && this.health <= 16) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic4.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 16 && this.health <= 18) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic5.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 18 && this.health <= 58) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 58 && this.health <= 98) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 98 && this.health <= 138) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 138 && this.health <= 178) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 178 && this.health <= 218) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 218 && this.health <= 358) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 358 && this.health <= 498) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 498 && this.health <= 638) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 638 && this.health <= 778) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 778 && this.health <= 918) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 918 && this.health <= 1718) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 1718 && this.health <= 2518) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 2518 && this.health <= 3318) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 3318 && this.health <= 4118) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 4118 && this.health <= 4918) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            }
        } else {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "black.png"
                this.radius = this.drawRad
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zebra.png"
                this.radius = this.drawRad
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "rainbow.png"
                this.radius = this.drawRad
            } else if(this.health > 8 && this.health <= 20) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic1.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 20 && this.health <= 32) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic2.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 32 && this.health <= 44) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic3.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 44 && this.health <= 56) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic4.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 56 && this.health <= 68) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "ceramic5.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 && this.health <= 68 + Math.ceil(40 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health >  68 + Math.ceil(40 * this.healthFactor) && this.health <=  68 + Math.ceil(80 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health >  68 + Math.ceil(80 * this.healthFactor) && this.health <=  68 + Math.ceil(120 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health >  68 + Math.ceil(120 * this.healthFactor) && this.health <= 68 + Math.ceil(160 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health >  68 + Math.ceil(160 * this.healthFactor) && this.health <=  68 + Math.ceil(200 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(200 * this.healthFactor) && this.health <= 68 + Math.ceil(340 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(340 * this.healthFactor) && this.health <= 68 + Math.ceil(480 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(480 * this.healthFactor) && this.health <= 68 + Math.ceil(620 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(620 * this.healthFactor) && this.health <= 68 + Math.ceil(760 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(760 * this.healthFactor) && this.health <= 68 + Math.ceil(900 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        this.sabotaged = 1
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true, this.dpsDamage, this.dpsType, this.dpsTicks, this.dpsLastTick, this.dpsTickRate, this.dpsTowerID))
                    }
                }
            } else if(this.health > 68 + Math.ceil(900 * this.healthFactor) && this.health <= 68 + Math.ceil(1700 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(1700 * this.healthFactor) && this.health <= 68 + Math.ceil(2500 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(2500 * this.healthFactor) && this.health <= 68 + Math.ceil(3300 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(3300 * this.healthFactor) && this.health <= 68 + Math.ceil(4100 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(4100 * this.healthFactor) && this.health <= 68 + Math.ceil(4900 * this.healthFactor)) {
                this.speed = 0.0042 * this.speedFactor * this.iced * this.sabotaged * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
            }
        }
    }

    collisionCheck(obj) {
        if(obj.x + obj.radius * 0.707 >= this.x - this.radius * 0.707 && obj.x - obj.radius * 0.707 <= this.x + this.radius * 0.707 && obj.y + obj.radius * 0.707 >= this.y - this.radius * 0.707 && obj.y - obj.radius * 0.707 <= this.y + this.radius * 0.707) {
            return true
        } else {
            return false
        }
    }
}
