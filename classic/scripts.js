class Bloon {
    constructor(x, y, radius, pathPos, iced, glued, stunned, health, playerSide, isAI, unadjustable) {
        this.x = x
        this.y = y
        this.radius = radius
        this.drawRad = radius
        this.pathPos = pathPos
        this.health = health
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
        this.regularAdjustments = 0
        this.t5Adjustments = 0
        this.bloonBoosted = 1
        this.cobraBoosted = 1
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
                if(Math.random() <= 0.125 && this.health < 18 && round <= 50) {
                    if(this.health != 18) {
                        this.health++
                    }
                    if(this.health > 8 && this.health < 18) {
                        this.health = 18
                    }
                } else if(Math.random() <= 0.125 && health < 68 && round > 50) {
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
            this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "red.png"
        } else if(this.health == 2) {
            this.speed = 0.042 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "blue.png"
        } else if(this.health == 3) {
            this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "green.png"
        } else if(this.health == 4) {
            this.speed = 0.096 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "yellow.png"
        } else if(this.health == 5) {
            this.speed = 0.105 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "pink.png"
        } else if(round <= 50) {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "black.png"
                this.spawnPinks = true
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zebra.png"
                this.spawnPinks = true
                this.spawnBlacks = true
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "rainbow.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
            } else if(this.health > 8 && this.health <= 10) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic1.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 10 && this.health <= 12) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic2.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 12 && this.health <= 14) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic3.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 14 && this.health <= 16) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic4.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 16 && this.health <= 18) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic5.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
            } else if(this.health > 18 && this.health <= 58) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 58 && this.health <= 98) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 98 && this.health <= 138) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 138 && this.health <= 178) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 178 && this.health <= 218) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
            } else if(this.health > 218 && this.health <= 358) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 358 && this.health <= 498) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 498 && this.health <= 638) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 638 && this.health <= 778) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 778 && this.health <= 918) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 918 && this.health <= 1718) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "black.png"
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zebra.png"
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "rainbow.png"
            } else if(this.health > 8 && this.health <= 20) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic1.png"
            } else if(this.health > 20 && this.health <= 32) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic2.png"
            } else if(this.health > 32 && this.health <= 44) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic3.png"
            } else if(this.health > 44 && this.health <= 56) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic4.png"
            } else if(this.health > 56 && this.health <= 68) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic5.png"
            } else if(this.health > 68 && this.health <= 68 + Math.ceil(40 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(40 * this.healthFactor) && this.health <=  68 + Math.ceil(80 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(80 * this.healthFactor) && this.health <=  68 + Math.ceil(120 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(120 * this.healthFactor) && this.health <= 68 + Math.ceil(160 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health >  68 + Math.ceil(160 * this.healthFactor) && this.health <=  68 + Math.ceil(200 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
            } else if(this.health > 68 + Math.ceil(200 * this.healthFactor) && this.health <= 68 + Math.ceil(340 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(340 * this.healthFactor) && this.health <= 68 + Math.ceil(480 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(480 * this.healthFactor) && this.health <= 68 + Math.ceil(620 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(620 * this.healthFactor) && this.health <= 68 + Math.ceil(760 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(760 * this.healthFactor) && this.health <= 68 + Math.ceil(900 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
            } else if(this.health > 68 + Math.ceil(900 * this.healthFactor) && this.health <= 68 + Math.ceil(1700 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(1700 * this.healthFactor) && this.health <= 68 + Math.ceil(2500 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(2500 * this.healthFactor) && this.health <= 68 + Math.ceil(3300 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(3300 * this.healthFactor) && this.health <= 68 + Math.ceil(4100 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            } else if(this.health > 68 + Math.ceil(4100 * this.healthFactor) && this.health <= 68 + Math.ceil(4900 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
                this.spawnCeramics = true
                this.spawnMOABs = true
                this.spawnBFBs = true
            }
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
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        if(debug) {
            ctx.fillStyle = "blue"
            ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.fillText(this.health.toLocaleString(), this.x, this.y, 2 * this.radius)
        }
    }


    update() {
        if(this.health == 1) {
            this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "red.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 4)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 8)), this.iced, this.glued, this.stunned, 1, this.playerSide, this.isAI, true))
                }
            }
        } else if(this.health == 2) {
            this.speed = 0.042 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "blue.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 0.5, this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (0.5 * (i + 2)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (0.5 * (i + 4)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (0.5 * (i + 8)), this.iced, this.glued, this.stunned, 2, this.playerSide, this.isAI, true))
                }
            }
        } else if(this.health == 3) {
            this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "green.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 4)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 8)), this.iced, this.glued, this.stunned, 3, this.playerSide, this.isAI, true))
                }
            }
        } else if(this.health == 4) {
            this.speed = 0.096 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "yellow.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 4)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 8)), this.iced, this.glued, this.stunned, 4, this.playerSide, this.isAI, true))
                }
            }
        } else if(this.health == 5) {
            this.speed = 0.105 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
            this.image = "pink.png"
            this.radius = this.drawRad
            if(this.spawnPinks == true) {
                this.spawnPinks = false
                bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true))
            }
            if(this.spawnBlacks == true) {
                this.spawnBlacks = false
                for(var i = 0; i < 2; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnZebras == true) {
                this.spawnZebras = false
                for(var i = 0; i < 4; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 4)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true))
                }
            }
            if(this.spawnRainbows == true) {
                this.spawnRainbows = false
                for(var i = 0; i < 8; i++) {
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 8)), this.iced, this.glued, this.stunned, 5, this.playerSide, this.isAI, true))
                }
            }
        } else if(round <= 50) {
            if(this.health == 6) {
                this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "black.png"
                this.spawnPinks = true
                this.radius = this.drawRad
                if(this.spawnBlacks == true) {
                    this.spawnBlacks = false
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true))
                }
                if(this.spawnZebras == true) {
                    this.spawnZebras = false
                    for(var i = 0; i < 2; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true))
                    }
                }
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    for(var i = 0; i < 4; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 4)), this.iced, this.glued, this.stunned, 6, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zebra.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.radius = this.drawRad
                if(this.spawnZebras == true) {
                    this.spawnZebras = false
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 7, this.playerSide, this.isAI, true))
                }
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    for(var i = 0; i < 2; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 2)), this.iced, this.glued, this.stunned, 7, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "rainbow.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.radius = this.drawRad
                if(this.spawnRainbows == true) {
                    this.spawnRainbows = false
                    bloons.push(new Bloon(-1000, 0, 25, this.pathPos - 1.5, this.iced, this.glued, this.stunned, 8, this.playerSide, this.isAI, true))
                }
            } else if(this.health > 8 && this.health <= 10) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic1.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 10 && this.health <= 12) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic2.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 12 && this.health <= 14) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic3.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 14 && this.health <= 16) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic4.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 16 && this.health <= 18) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic5.png"
                this.spawnPinks = true
                this.spawnBlacks = true
                this.spawnZebras = true
                this.spawnRainbows = true
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 18, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 18 && this.health <= 58) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 58 && this.health <= 98) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 98 && this.health <= 138) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 138 && this.health <= 178) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 178 && this.health <= 218) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 218, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 218 && this.health <= 358) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 358 && this.health <= 498) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 498 && this.health <= 638) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 638 && this.health <= 778) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 778 && this.health <= 918) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 918, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 918 && this.health <= 1718) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
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
                this.speed = 0.054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "black.png"
                this.radius = this.drawRad
            } else if(this.health == 7) {
                this.speed = 0.06 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zebra.png"
                this.radius = this.drawRad
            } else if(this.health == 8) {
                this.speed = 0.066 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "rainbow.png"
                this.radius = this.drawRad
            } else if(this.health > 8 && this.health <= 20) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic1.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 20 && this.health <= 32) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic2.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 32 && this.health <= 44) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic3.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 44 && this.health <= 56) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic4.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 56 && this.health <= 68) {
                this.speed = 0.075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "ceramic5.png"
                this.radius = this.drawRad
                if(this.spawnCeramics == true) {
                    this.spawnCeramics = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68, this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 && this.health <= 68 + Math.ceil(40 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab1.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health >  68 + Math.ceil(40 * this.healthFactor) && this.health <=  68 + Math.ceil(80 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab2.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health >  68 + Math.ceil(80 * this.healthFactor) && this.health <=  68 + Math.ceil(120 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab3.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health >  68 + Math.ceil(120 * this.healthFactor) && this.health <= 68 + Math.ceil(160 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab4.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health >  68 + Math.ceil(160 * this.healthFactor) && this.health <=  68 + Math.ceil(200 * this.healthFactor)) {
                this.speed = 0.03 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "moab5.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnMOABs == true) {
                    this.spawnMOABs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(200 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(200 * this.healthFactor) && this.health <= 68 + Math.ceil(340 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb1.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(340 * this.healthFactor) && this.health <= 68 + Math.ceil(480 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb2.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(480 * this.healthFactor) && this.health <= 68 + Math.ceil(620 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb3.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(620 * this.healthFactor) && this.health <= 68 + Math.ceil(760 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb4.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(760 * this.healthFactor) && this.health <= 68 + Math.ceil(900 * this.healthFactor)) {
                this.speed = 0.0075 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "bfb5.png"
                this.radius = 2.5 * this.drawRad
                if(this.spawnBFBs == true) {
                    this.spawnBFBs = false
                    for(var i = 0; i < 3; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (1.5 * (i + 1)), this.iced, this.glued, this.stunned, 68 + Math.ceil(900 * this.healthFactor), this.playerSide, this.isAI, true))
                    }
                }
            } else if(this.health > 68 + Math.ceil(900 * this.healthFactor) && this.health <= 68 + Math.ceil(1700 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg1.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(1700 * this.healthFactor) && this.health <= 68 + Math.ceil(2500 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg2.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(2500 * this.healthFactor) && this.health <= 68 + Math.ceil(3300 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg3.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(3300 * this.healthFactor) && this.health <= 68 + Math.ceil(4100 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg4.png"
                this.radius = 2.5 * this.drawRad
            } else if(this.health > 68 + Math.ceil(4100 * this.healthFactor) && this.health <= 68 + Math.ceil(4900 * this.healthFactor)) {
                this.speed = 0.0054 * this.speedFactor * this.iced * this.bloonBoosted * this.cobraBoosted
                this.image = "zomg5.png"
                this.radius = 2.5 * this.drawRad
            }
        }
        this.pathPos += 3 * this.speed
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
    }

    collisionCheck(obj) {
        if(obj.x + obj.radius * 0.707 >= this.x - this.radius * 0.707 && obj.x - obj.radius * 0.707 <= this.x + this.radius * 0.707 && obj.y + obj.radius * 0.707 >= this.y - this.radius * 0.707 && obj.y - obj.radius * 0.707 <= this.y + this.radius * 0.707) {
            return true
        } else {
            return false
        }
    }
}

class Tower {
    constructor(x, y, radius, range, towerType, playerSide) {
        this.x = x
        this.y = y
        this.radius = radius
        this.range = range
        this.towerType = towerType
        this.playerSide = playerSide
        this.selected = false
        this.path1Upgrades = 0
        this.path2Upgrades = 0
        this.path3Upgrades = 0
        this.totalCost = 0
        this.attackSpeed = 100
        this.target = -1
        this.nextFire = Date.now() + this.attackSpeed
        this.towerVar = 0
        this.towerID = Math.trunc(Math.random() * 10 ** 9)
        this.popCount = 0
        this.farmerCap = 200
        this.lightningCount = 0
        this.targetPrio = 0
        this.random = Math.random()
        this.targetX = cursor[0].x
        this.targetY = cursor[0].y
        this.towerBoosted = 1
        this.cobraBoosted = 1
        this.popAdjustBoosted = 0
        this.ecoStealCooldown = -1
        this.attritionCooldown = -1
        this.activeSyphonCooldown = -1

        this.path1Name = []
        this.path2Name = []
        this.path3Name = []
        this.path1Cost = []
        this.path2Cost = []
        this.path3Cost = []
        if(this.towerType == "dart") {
            this.path1Name[0] = "Sharper Darts"
            this.path1Name[1] = "Razor Sharp Darts"
            this.path1Name[2] = "Spike O-Pult"
            this.path1Name[3] = "Juggernaut"
            this.path1Name[4] = "Ultra-Juggernaut"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Quick Shots"
            this.path2Name[1] = "Very Quick Shots"
            this.path2Name[2] = "Triple Shot"
            this.path2Name[3] = "Super Monkey Training"
            this.path2Name[4] = "Plasma Monkey Training"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Longer Range"
            this.path3Name[1] = "Enhanced Eyesight"
            this.path3Name[2] = "Crossbow"
            this.path3Name[3] = "Sharp Shooter"
            this.path3Name[4] = "Crossbow Master"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 200
            this.path1Cost[1] = 250
            this.path1Cost[2] = 500
            this.path1Cost[3] = 2000
            this.path1Cost[4] = 20000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 100
            this.path2Cost[1] = 200
            this.path2Cost[2] = 600
            this.path2Cost[3] = 8000
            this.path2Cost[4] = 50000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 50
            this.path3Cost[1] = 100
            this.path3Cost[2] = 450
            this.path3Cost[3] = 2500
            this.path3Cost[4] = 35000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "tack") {
            this.path1Name[0] = "Faster Shooting"
            this.path1Name[1] = "Even Faster Shooting"
            this.path1Name[2] = "Hot Shots"
            this.path1Name[3] = "Ring of Fire"
            this.path1Name[4] = "Inferno Ring"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Extra Range"
            this.path2Name[1] = "Super Range"
            this.path2Name[2] = "Blade Shooter"
            this.path2Name[3] = "Blade Maelstrom"
            this.path2Name[4] = "Super Maelstrom"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "More Tacks"
            this.path3Name[1] = "Even More Tacks"
            this.path3Name[2] = "Tack Sprayer"
            this.path3Name[3] = "Overdrive"
            this.path3Name[4] = "Tack Zone"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 400
            this.path1Cost[2] = 600
            this.path1Cost[3] = 5000
            this.path1Cost[4] = 70000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 450
            this.path2Cost[2] = 600
            this.path2Cost[3] = 8000
            this.path2Cost[4] = 35000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 250
            this.path3Cost[1] = 250
            this.path3Cost[2] = 400
            this.path3Cost[3] = 4000
            this.path3Cost[4] = 35000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "farm") {
            this.path1Name[0] = "Faster Production"
            this.path1Name[1] = "Even Faster Production"
            this.path1Name[2] = "Banana Plantation"
            this.path1Name[3] = "Banana Factory"
            this.path1Name[4] = "Banana Central"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Long Life Bananas"
            this.path2Name[1] = "Valuable Bananas"
            this.path2Name[2] = "Monkey Bank"
            this.path2Name[3] = "Banana Investments Advisatory"
            this.path2Name[4] = "Monkeynomics"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Easier Collection"
            this.path3Name[1] = "Auto Salvage"
            this.path3Name[2] = "Marketplace"
            this.path3Name[3] = "Central Market"
            this.path3Name[4] = "Monkey Wall Street"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 500
            this.path1Cost[1] = 600
            this.path1Cost[2] = 2500
            this.path1Cost[3] = 17500
            this.path1Cost[4] = 150000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 100
            this.path2Cost[1] = 800
            this.path2Cost[2] = 7000
            this.path2Cost[3] = 20000
            this.path2Cost[4] = 100000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 200
            this.path3Cost[2] = 2200
            this.path3Cost[3] = 15000
            this.path3Cost[4] = 60000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "super") {
            this.path1Name[0] = "Laser Blasts"
            this.path1Name[1] = "Plasma Blasts"
            this.path1Name[2] = "Solar Blasts"
            this.path1Name[3] = "Sun Avatar"
            this.path1Name[4] = "Sun God"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Super Range"
            this.path2Name[1] = "Epic Range"
            this.path2Name[2] = "Robo Monkey"
            this.path2Name[3] = "Tech Terror"
            this.path2Name[4] = "Anti-Bloon"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Knockback"
            this.path3Name[1] = "Heavier Knockback"
            this.path3Name[2] = "Dark Knight"
            this.path3Name[3] = "Dark Champion"
            this.path3Name[4] = "Legend of the Night"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 1500
            this.path1Cost[1] = 3000
            this.path1Cost[2] = 12000
            this.path1Cost[3] = 200000
            this.path1Cost[4] = 750000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 1500
            this.path2Cost[1] = 1500
            this.path2Cost[2] = 17500
            this.path2Cost[3] = 80000
            this.path2Cost[4] = 200000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 2000
            this.path3Cost[1] = 3000
            this.path3Cost[2] = 10000
            this.path3Cost[3] = 60000
            this.path3Cost[4] = 250000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "bomb") {
            this.path1Name[0] = "Bigger Bombs"
            this.path1Name[1] = "Heavier Bombs"
            this.path1Name[2] = "Even Bigger Bombs"
            this.path1Name[3] = "Bloon Impact"
            this.path1Name[4] = "Bloon Crush"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Faster Shooting"
            this.path2Name[1] = "Missile Launcher"
            this.path2Name[2] = "Mauler Launcher"
            this.path2Name[3] = "Assassin Launcher"
            this.path2Name[4] = "Eliminator Launcher"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Extra Range"
            this.path3Name[1] = "Fragment Shot"
            this.path3Name[2] = "Cluster Bomb"
            this.path3Name[3] = "Recursive Cluster"
            this.path3Name[4] = "Bomb Blitz"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 400
            this.path1Cost[1] = 750
            this.path1Cost[2] = 1500
            this.path1Cost[3] = 7000
            this.path1Cost[4] = 70000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 250
            this.path2Cost[1] = 500
            this.path2Cost[2] = 3000
            this.path2Cost[3] = 4000
            this.path2Cost[4] = 40000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 200
            this.path3Cost[1] = 300
            this.path3Cost[2] = 2000
            this.path3Cost[3] = 5000
            this.path3Cost[4] = 40000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "ice") {
            this.path1Name[0] = "Permafrost"
            this.path1Name[1] = "Cold Snap"
            this.path1Name[2] = "Ice Shards"
            this.path1Name[3] = "Super Shards"
            this.path1Name[4] = "Shard Master"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Enhanced Freeze"
            this.path2Name[1] = "Deep Freeze"
            this.path2Name[2] = "Arctic Wind"
            this.path2Name[3] = "Snow Storm"
            this.path2Name[4] = "Blizzard"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Longer Range"
            this.path3Name[1] = "Even Longer Range"
            this.path3Name[2] = "Snowball Cannon"
            this.path3Name[3] = "Improved Cannon"
            this.path3Name[4] = "MOAB Freeze"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 1000
            this.path1Cost[2] = 2500
            this.path1Cost[3] = 7500
            this.path1Cost[4] = 40000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 300
            this.path2Cost[1] = 400
            this.path2Cost[2] = 4000
            this.path2Cost[3] = 7500
            this.path2Cost[4] = 25000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 200
            this.path3Cost[1] = 200
            this.path3Cost[2] = 1000
            this.path3Cost[3] = 7500
            this.path3Cost[4] = 60000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "farmer") {
            this.path1Name[0] = "Larger Storage"
            this.path1Name[1] = "Even Larger Storage"
            this.path1Name[2] = "Ruby Box"
            this.path1Name[3] = "Angry Farmer"
            this.path1Name[4] = "Robotic Wrath"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Banana Cannon"
            this.path2Name[1] = "Stronger Cannon"
            this.path2Name[2] = "Cannon Pro"
            this.path2Name[3] = "Banan-ades"
            this.path2Name[4] = "Ordinance Bananas"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Silver Pitchfork"
            this.path3Name[1] = "Longer Pitchfork"
            this.path3Name[2] = "Copper Bananas"
            this.path3Name[3] = "Golden Bananas"
            this.path3Name[4] = "Bling-nanas"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 250
            this.path1Cost[1] = 350
            this.path1Cost[2] = 500
            this.path1Cost[3] = 2500
            this.path1Cost[4] = 70000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 300
            this.path2Cost[2] = 1200
            this.path2Cost[3] = 5000
            this.path2Cost[4] = 30000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 200
            this.path3Cost[2] = 1500
            this.path3Cost[3] = 3000
            this.path3Cost[4] = 20000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "dartling") {
            this.path1Name[0] = "Increased Accuracy"
            this.path1Name[1] = "Laser Darts"
            this.path1Name[2] = "Laser Cannon"
            this.path1Name[3] = "Plasma Accelerator"
            this.path1Name[4] = "Ray of Doom"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Faster Darts"
            this.path2Name[1] = "Faster Barrel Spin"
            this.path2Name[2] = "Hydra Rocket Pods"
            this.path2Name[3] = "Rocket Storm"
            this.path2Name[4] = "MOAB Assured Destroyer"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Wider Darts"
            this.path3Name[1] = "Powerful Darts"
            this.path3Name[2] = "Buckshot"
            this.path3Name[3] = "Bloon Area Denial"
            this.path3Name[4] = "Bloon Exclusion Zone"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 200
            this.path1Cost[1] = 1000
            this.path1Cost[2] = 4000
            this.path1Cost[3] = 20000
            this.path1Cost[4] = 150000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 750
            this.path2Cost[2] = 7000
            this.path2Cost[3] = 7500
            this.path2Cost[4] = 120000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 200
            this.path3Cost[1] = 1500
            this.path3Cost[2] = 3200
            this.path3Cost[3] = 12000
            this.path3Cost[4] = 80000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "wizard") {
            this.path1Name[0] = "Faster Bolts"
            this.path1Name[1] = "Arcane Bolts"
            this.path1Name[2] = "Arcane Mastery"
            this.path1Name[3] = "Arcane Spike"
            this.path1Name[4] = "Archmage"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Fireball"
            this.path2Name[1] = "More Fireballs"
            this.path2Name[2] = "Dragon's Breath"
            this.path2Name[3] = "Phoenix's Breath"
            this.path2Name[4] = "Volcano's Breath"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Intense Magic"
            this.path3Name[1] = "Monkey Sense"
            this.path3Name[2] = "Summon Lightning"
            this.path3Name[3] = "Tornadoes"
            this.path3Name[4] = "Superstorm"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 200
            this.path1Cost[1] = 750
            this.path1Cost[2] = 2000
            this.path1Cost[3] = 10000
            this.path1Cost[4] = 40000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 400
            this.path2Cost[1] = 600
            this.path2Cost[2] = 4000
            this.path2Cost[3] = 8000
            this.path2Cost[4] = 75000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 300
            this.path3Cost[1] = 200
            this.path3Cost[2] = 1800
            this.path3Cost[3] = 8000
            this.path3Cost[4] = 50000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "cobra") {
            this.path1Name[0] = "Higher Caliber"
            this.path1Name[1] = "Mega Caliber"
            this.path1Name[2] = "Monkey Stim"
            this.path1Name[3] = "Pop Adjustment"
            this.path1Name[4] = "Damage Adjustment"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Wired Funds"
            this.path2Name[1] = "Eco Steal"
            this.path2Name[2] = "Attrition"
            this.path2Name[3] = "Active Syphon"
            this.path2Name[4] = "Grand Heist"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Double Tap"
            this.path3Name[1] = "Bloon Adjustment"
            this.path3Name[2] = "Bloon Stim"
            this.path3Name[3] = "Offensive Push"
            this.path3Name[4] = "Upgrade Sent"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 600
            this.path1Cost[2] = 750
            this.path1Cost[3] = 2000
            this.path1Cost[4] = 5000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 400
            this.path2Cost[1] = 500
            this.path2Cost[2] = 750
            this.path2Cost[3] = 5000
            this.path2Cost[4] = 50000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 300
            this.path3Cost[1] = 750
            this.path3Cost[2] = 750
            this.path3Cost[3] = 2000
            this.path3Cost[4] = 10000
            this.path3Cost[5] = "Max"
        }
    }

    checkIDs() {
        for(var i = 0; i < towers.length - 1; i++) {
            if(towers[i].towerID == this.towerID) {
                this.towerID = Math.trunc(Math.random() * 10 ** 9)
                this.checkIDs()
            }
        }
    }

    draw() {
        var image = new Image()
        if(this.path1Upgrades < 5 && this.path2Upgrades < 5 && this.path3Upgrades < 5) {
            image.src = String(this.path1Upgrades) + this.path2Upgrades + this.path3Upgrades + this.towerType + ".png"
        } else if(this.path1Upgrades == 5) {
            image.src = "500" + this.towerType + ".png"
        } else if(this.path2Upgrades == 5) {
            image.src = "050" + this.towerType + ".png"
        } else if(this.path3Upgrades == 5) {
            image.src = "005" + this.towerType + ".png"
        }
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        if(debug) {
            ctx.fillStyle = "darkblue"
            ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.fillText(this.path1Upgrades + "-" + this.path2Upgrades + "-" + this.path3Upgrades, this.x, this.y, 2 * this.radius)
        }
    }

    clicked(x, y) {
        if(x >= this.x - this.radius * 0.707 && x <= this.x + this.radius * 0.707 && y >= this.y - this.radius * 0.707 && y <= this.y + this.radius * 0.707) {
            return true
        } else {
            return false
        }
    }

    findTarget() {
        this.target = -1
        for(var i = 0; i < bloons.length; i++) {
            if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && this.target == -1 && bloons[i].playerSide == this.playerSide) {
                this.target = i
            }
            if(this.targetPrio == 0) {
                if(this.target != -1) {
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 <= this.range && bloons[i].pathPos > bloons[this.target].pathPos && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 >= this.range && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                }
            } else if(this.targetPrio == 1) {
                if(this.target != -1) {
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 <= this.range && bloons[i].pathPos < bloons[this.target].pathPos && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 >= this.range && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                }
            } else if(this.targetPrio == 2) {
                if(this.target != -1) {
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 < ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 >= this.range && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                }
            } else if(this.targetPrio == 3) {
                if(this.target != -1) {
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 <= this.range && bloons[i].health > bloons[this.target].health && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 <= this.range && bloons[i].health == bloons[this.target].health && bloons[i].playerSide == this.playerSide) {
                        if(bloons[i].pathPos > bloons[this.target].pathPos) {
                            this.target = i
                        }
                    }
                    if(((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) ** 0.5 <= this.range && ((bloons[this.target].x - this.x) ** 2 + (bloons[this.target].y - this.y) ** 2) ** 0.5 >= this.range && bloons[i].playerSide == this.playerSide) {
                        this.target = i
                    }
                }
            }
        }
    }

    attack() {
        if(this.target != -1) {
            if(this.towerType == "dart") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300dartproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400dartproj.png", 1, 50, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 1, 100, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 1, 100, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 1, 100, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (333 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (167 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(-Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(-Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path3Upgrades) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path3Upgrades) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 2, 3 + 1 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 4, 5 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 25 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 4, 14 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
            } else if(this.towerType == "tack") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //000, 010, 100, 110, 200, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //020, 120, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 1) {
                    //001, 011, 101, 201
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 1) {
                    //021
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 2) {
                    //002, 012, 102, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //300, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 2)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 2)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "300tackproj.png", 2, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 2)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 2)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //400, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 3)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 15, "400tackproj.png", 2, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 3)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 15, "400tackproj.png", 2, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //401
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 3)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 15, "400tackproj.png", 2, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** 3)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 15, "400tackproj.png", 2, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //500, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** 3)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8), 10 * Math.sin(-i * Math.PI/8), 25, "400tackproj.png", 2, 16, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** 3)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8), 10 * Math.sin(-i * Math.PI/8), 25, "400tackproj.png", 2, 24, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //501
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** 3)
                    for(var i = 0; i < 20; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/10 - Math.PI/2), 10 * Math.sin(-i * Math.PI/10 - Math.PI/2), 25, "400tackproj.png", 2, 16, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** 3)
                    for(var i = 0; i < 24; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/12 - Math.PI/2), 10 * Math.sin(-i * Math.PI/12 - Math.PI/2), 25, "400tackproj.png", 2, 16, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //030, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4 - Math.PI/2), 10 * Math.sin(-i * Math.PI/4 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //040, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (50 * 0.75 ** this.path1Upgrades)
                    this.towerVar += Math.PI/15 * (0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 2; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI + this.towerVar), 10 * Math.sin(-i * Math.PI + this.towerVar), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 1 || this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (50)
                    this.towerVar += Math.PI/15
                    for(var i = 0; i < 2; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI - this.towerVar), 10 * Math.sin(-i * Math.PI - this.towerVar), 15, "030tackproj.png", 1, 4 + 2 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //050, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (50 * 0.75 ** this.path1Upgrades)
                    this.towerVar += Math.PI/15 * (0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 4; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/2 + this.towerVar), 10 * Math.sin(-i * Math.PI/2 + this.towerVar), 15, "030tackproj.png", 1, 20, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 1 || this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (50)
                    this.towerVar += Math.PI/15
                    for(var i = 0; i < 4; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/2 - this.towerVar), 10 * Math.sin(-i * Math.PI/2 - this.towerVar), 15, "030tackproj.png", 1, 20 + 10 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (2000)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (200 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (200)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (200 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 32; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/16 - Math.PI/2), 10 * Math.sin(-i * Math.PI/16 - Math.PI/2), 10, "000tackproj.png", 2, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (200)
                    for(var i = 0; i < 32; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/16 - Math.PI/2), 10 * Math.sin(-i * Math.PI/16 - Math.PI/2), 10, "000tackproj.png", 2, 8, 0, 0, this.towerID, this.playerSide))
                    }
                }
            } else if(this.towerType == "super") {
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //000, 010, 020
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //001, 011, 021
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "001superproj.png", 1, 1 + this.path2Upgrades, 10, 5, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //002, 012, 022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002superproj.png", 1, 1 + this.path2Upgrades, 20, 10, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //100, 110, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "100superproj.png", 1, 2 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //101, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "100superproj.png", 1, 2 + this.path2Upgrades, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //200, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 1, 4 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //201, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 1, 4 + this.path2Upgrades, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //300, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 4 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 4 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 6 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //301, 302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 4, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 4, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 4, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //400, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400superproj.png", 10, 25 + 5 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //401, 402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400superproj.png", 10, 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //500, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, (15 + 6 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (15 + 6 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "400superproj.png", 75, 167 + 33 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //501, 502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "400superproj.png", 75, 167, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //030
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "001superproj.png", 2, 4, 10, 5, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "001superproj.png", 2, 4, 10, 5, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002superproj.png", 2, 4, 20, 10, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002superproj.png", 2, 4, 20, 10, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (63)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (63)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 2, 4 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 14 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 2, 5, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 14 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 2, 7, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 3, 7 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 3, 7 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 3, 8, 30, 15, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 3, 8, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 3, 10, 30, 15, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 3, 10, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 8, 14 + 2 * this.path2Upgrades, 30, 15, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 8, 14 + 2 * this.path2Upgrades, 30, 15, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 8, 15, 40, 20, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 8, 15, 40, 20, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (63)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 8, 17, 40, 20, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 8, 17, 40, 20, this.towerID, this.playerSide))
                }
            } else if(this.towerType == "bomb") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //000, 001, 010, 100, 011, 101, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //200, 201, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000bombproj.png", 1, 30, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 1) {
                    //020, 021, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "020bombproj.png", 1, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "020bombproj.png", 1, 35, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 2) {
                    //002, 012, 102, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020bombproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //300, 301, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 1, 40, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 1, 45, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 1, 40, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "302bombproj.png", 1, 2, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //400, 401, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 2, 50, 25, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 2, 55, 25, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 2, 50, 25, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 7; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "302bombproj.png", 2, 4, 25, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //500, 501, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 8, 75, 50, 25, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 8, 80, 50, 25, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 8, 75, 50, 25, this.towerID, this.playerSide))
                    for(var i = 0; i < 9; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "302bombproj.png", 4, 10, 50, 25, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 1) {
                    //030, 031, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "030bombproj.png", 2, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "030bombproj.png", 2, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 1, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 1) {
                    //040, 041, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "040bombproj.png", 5, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "040bombproj.png", 5, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 2, 4, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 1) {
                    //050, 051, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "050bombproj.png", 18, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "050bombproj.png", 18, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 6, 8, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "020bombproj.png", 1, 15, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 3; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 15, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 2 == 1) {
                        for(var i = 0; i < 3; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                        }
                    }
                    if(this.towerVar % 2 == 0) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                        }
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "020bombproj.png", 1, 15, 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 2 == 1) {
                        for(var i = 0; i < 3; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 15, 0, 0, this.towerID, this.playerSide))
                        }
                    }
                    if(this.towerVar % 2 == 0) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 1, 15, 0, 0, this.towerID, this.playerSide))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 20 + 20 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 2, 20 + 20 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500 * 0.75 ** 2)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "020bombproj.png", 1, 20, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000bombproj.png", 2, 20, 0, 0, this.towerID, this.playerSide))
                    }
                }
            } else if(this.towerType == "ice") {
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //000, 001, 010, 011, 012
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //020, 021, 022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //100, 101, 102, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //200, 201, 202, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 10, "300iceproj.png", 1, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 10, "300iceproj.png", 1, 3, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 3, 10, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 10, "300iceproj.png", 2, 6, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 3, 20, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 10, "300iceproj.png", 2, 6, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 5, 10, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 24; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 15, "300iceproj.png", 4, 12, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 5, 20, 0, 0, this.towerID, this.playerSide))
                    for(var i = 0; i < 24; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 15, "300iceproj.png", 4, 12, 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 50, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 50, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 50, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 120, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 120, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 120, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 300, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 300, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 300, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** (this.path2Upgrades + 1))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003iceproj.png", 1, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "103iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "103iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** (this.path2Upgrades + 2))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003iceproj.png", 2, 30, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "103iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "103iceproj.png", 3, 20, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** (this.path2Upgrades + 2))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "005iceproj.png", 4, 40, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "005iceproj.png", 4, 50, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "105iceproj.png", 4, 40, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "105iceproj.png", 5, 40, 0, 0, this.towerID, this.playerSide))
                }
            } else if(this.towerType == "farmer") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 1, 1 + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310, 320
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (563)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 1, 1 + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410, 420
                    if(this.towerVar >= 20) {
                        var playerSideBloons = 0
                        for(var i = 0; i < bloons.length; i++) {
                            if(bloons[i].playerSide == this.playerSide) {
                                playerSideBloons++
                            }
                        }
                        if(playerSideBloons <= 150) {
                            this.attackSpeed = this.cobraBoosted * this.towerBoosted * (563 - 3 * playerSideBloons)
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 1 + Math.trunc(playerSideBloons/30), 1 + 1 + Math.trunc(playerSideBloons/30) + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        } else {
                            this.attackSpeed = this.cobraBoosted * this.towerBoosted * (113)
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 6, 6 + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        }
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510, 520
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            playerSideBloons++
                        }
                    }
                    if(this.towerVar >= 20) {
                        if(playerSideBloons <= 50) {
                            this.attackSpeed = this.cobraBoosted * this.towerBoosted * (280 - 4 * playerSideBloons)
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 1 + Math.trunc(playerSideBloons/10), 1 + Math.trunc(playerSideBloons/10) + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        } else {
                            this.attackSpeed = this.cobraBoosted * this.towerBoosted * (80)
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 21, 21 + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        }
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000farmerproj.png", 1, 10, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "040farmerproj.png", 2, 25, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "040farmerproj.png", 5, 100, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103, 203
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "003farmerproj.png", 2, 1 + 1 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104, 204
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "004farmerproj.png", 2, 5 + 3 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105, 205
                    if(this.towerVar >= 20) {
                        this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000 * 0.75 ** this.path1Upgrades)
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "005farmerproj.png", 2, 15 + 10 * this.path2Upgrades, 100, 0, this.towerID, this.playerSide))
                        this.towerVar -= 20
                    }
                }
            } else if(this.towerType == "wizard") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 100, 101, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades <= 2) {
                    //010, 011, 012, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //020, 021, 022, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //200, 201, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //300, 301, 302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 2, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 2, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //400, 401, 402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 2)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 4, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 2)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 4, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //500, 501, 502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 4)
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 4)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 8, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500 * 0.75 ** 4)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 8, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 1, 1 + Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 10 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 30 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 1, 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 45 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 3 + 2 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 3 + 2 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 30 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 20 + 10 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 3, 3, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 3, 3, 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 30 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 20 + 10 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 7 + 4 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 7 + 4 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 7 + 4 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 15 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(i * Math.PI/4), (10 + 2.5 * this.path1Upgrades) * Math.sin(i * Math.PI/4), 15, "010wizardproj.png", 3, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (100)
                    this.towerVar++
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 7, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 7, 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 7, 0, 0, this.towerID, this.playerSide))
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 15 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(i * Math.PI/4), 12.5 * Math.sin(i * Math.PI/4), 15, "010wizardproj.png", 3, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //003, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.1 && this.lightningCount < 10) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.1 && this.lightningCount < 10) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 3) {
                    //013
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.1 && this.lightningCount < 10) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.1 && this.lightningCount < 10) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //004, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 40, 100, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 25) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 40, 100, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 25) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 4) {
                    //014
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 40, 100, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 25) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 40, 100, 0, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 25) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //005, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 50, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 50, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 5) {
                    //015
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 50, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1500)
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 50, this.towerID, this.playerSide))
                    }
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide))
                            }
                        }
                    }
                }
            } else if(this.towerType == "cobra") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 5 && this.path3Upgrades == 0) {
                    //most cobras
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 5 && this.path3Upgrades >= 1) {
                    //double tap
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades <= 5 && this.path3Upgrades == 0) {
                    //3x0+
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (1000)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 6, 1, 0, 0, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades <= 5 && this.path3Upgrades >= 1) {
                    //301+
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * (500)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 6, 1, 0, 0, this.towerID, this.playerSide))
                }
            }
        }
        if(this.towerType == "farm") {
            if(roundReady == false) {
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //000, 100, 200
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", Date.now() + 10000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //010, 110, 210
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", Date.now() + 20000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //020, 120, 220
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", Date.now() + 20000, false, 60, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //300
                    this.attackSpeed = (2500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", Date.now() + 10000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //310
                    this.attackSpeed = (2500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", Date.now() + 20000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = (2500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", Date.now() + 20000, false, 60, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //400
                    this.attackSpeed = (10000)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", Date.now() + 10000, false, 900, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //410
                    this.attackSpeed = (10000)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", Date.now() + 20000, false, 900, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = (10000)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", Date.now() + 20000, false, 1350, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //500
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", Date.now() + 10000, false, 4000, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //510
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", Date.now() + 20000, false, 4000, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", Date.now() + 20000, false, 6000, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //001, 101, 201
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "000farmproj.png", Date.now() + 10000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //002, 102, 202
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "000farmproj.png", Date.now() + 10000, true, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = (2500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "000farmproj.png", Date.now() + 10000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = (2500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "000farmproj.png", Date.now() + 10000, true, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //401
                    this.attackSpeed = (10000)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 30, "400farmproj.png", Date.now() + 10000, false, 900, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = (10000)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 30, "400farmproj.png", Date.now() + 10000, true, 900, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //501
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 30, "400farmproj.png", Date.now() + 10000, false, 4000, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 30, "400farmproj.png", Date.now() + 10000, true, 4000, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 1 && this.path3Upgrades == 1) {
                    //011
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "010farmproj.png", Date.now() + 15000, false, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 1 && this.path3Upgrades == 2) {
                    //012
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "010farmproj.png", Date.now() + 15000, true, 40, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 1) {
                    //021
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "010farmproj.png", Date.now() + 15000, false, 60, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = (7500)
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 20, "010farmproj.png", Date.now() + 15000, true, 60, this.towerID, this.playerSide))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    this.attackSpeed = (2500 - 500 * this.path1Upgrades)
                    if(this.towerVar < 7000) {
                        this.towerVar += Math.trunc(20 * ((3/7000) * this.towerVar + 1))
                    }
                    if(this.towerVar > 7000) {
                        if(this.path3Upgrades == 2) {
                            money += 7000
                            this.popCount += 7000
                            this.towerVar = 0
                            moneyText.push(new MoneyText(this.x, this.y, 7000))
                        } else {
                            this.towerVar = 7000
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    this.attackSpeed = (1250 - 250 * this.path1Upgrades)
                    if(this.towerVar < 14000) {
                        this.towerVar += Math.trunc(30 * ((3/10500) * this.towerVar + 1))
                    }
                    if(this.towerVar > 14000) {
                        if(this.path3Upgrades == 2) {
                            money += 14000
                            this.popCount += 14000
                            this.towerVar = 0
                            moneyText.push(new MoneyText(this.x, this.y, 14000))
                        } else {
                            this.towerVar = 14000
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    this.attackSpeed = (625 - 125 * this.path1Upgrades)
                    if(this.towerVar < 30000) {
                        this.towerVar += Math.trunc(40 * ((3/20000) * this.towerVar + 1))
                    }
                    if(this.towerVar > 30000) {
                        if(this.path3Upgrades == 2) {
                            money += 30000
                            this.popCount += 30000
                            this.towerVar = 0
                            moneyText.push(new MoneyText(this.x, this.y, 30000))
                        } else {
                            this.towerVar = 30000
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103, 203
                    this.attackSpeed = (5000 - 1000 * this.path1Upgrades)
                    money += 40
                    this.popCount += 40
                    moneyText.push(new MoneyText(this.x, this.y, 40))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = (5000)
                    money += 30
                    this.popCount += 30
                    moneyText.push(new MoneyText(this.x, this.y, 60))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = (4500 - 900 * this.path1Upgrades)
                    money += 80
                    this.popCount += 80
                    moneyText.push(new MoneyText(this.x, this.y, 160))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = (4500)
                    money += 120
                    this.popCount += 120
                    moneyText.push(new MoneyText(this.x, this.y, 240))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = (2250 - 450 * this.path1Upgrades)
                    money += 160
                    this.popCount += 160
                    moneyText.push(new MoneyText(this.x, this.y, 320))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = (2250)
                    money += 240
                    this.popCount += 240
                    moneyText.push(new MoneyText(this.x, this.y, 480))
                }
            }
        } else if(this.towerType == "dartling") {
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (200 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "000dartproj.png", 1+1*Math.floor(this.path1Upgrades/2), 1+2*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
            }
            if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //300, 301, 302, 310, 320
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (200 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((5 * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((5 * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "130superproj.png", 3, 4+4*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
            }
            if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //400, 401, 402, 410, 420
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (100 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos(Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin(Math.atan2(this.targetY - this.y, this.targetX - this.x)), 15+3.75*Math.ceil(this.path3Upgrades/10), "130superproj.png", 2, 40+40*Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
            }
            if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //500, 501, 502, 510, 520
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (100 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos(Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin(Math.atan2(this.targetY - this.y, this.targetX - this.x)), 20+5*Math.ceil(this.path3Upgrades/10), "130superproj.png", 5, 200+200*Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                //030, 031, 032, 130, 230
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (200 * 0.66))
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                //040, 041, 042, 140, 240
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (200 * 0.66))
                this.towerVar++
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
                if(this.towerVar % 7 == 1) {
                    for(var i = 0; i < 10; i++) {
                        this.random = Math.random()
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
                    }
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                //050, 051, 052, 150, 250
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (1000 * 0.66))
                this.towerVar++
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "050dartlingproj.png", 50+25*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
                if(this.towerVar % 3 == 1) {
                    for(var i = 0; i < 10; i++) {
                        this.random = Math.random()
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "050dartlingproj.png", 50+25*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide))
                    }
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                //003, 013, 023, 103, 203
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (1000 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 2+1*Math.floor(this.path1Upgrades/2), 4, 50, 0, this.towerID, this.playerSide))
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                //004, 014, 024, 104, 204
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (250 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 3+1*Math.floor(this.path1Upgrades/2), 4, 50, 0, this.towerID, this.playerSide))
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                //005, 015, 025, 105, 205
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * (this.cobraBoosted * this.towerBoosted * (166 * 0.66 ** Math.floor(this.path2Upgrades/2)))
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 7+4*Math.floor(this.path1Upgrades/2), 12, 50, 0, this.towerID, this.playerSide))
                }
            }
        }
    }

    towerPlacementCheck(x, y, radius) {
        if(x + radius * 0.707 >= this.x - this.radius * 0.707 && x - radius * 0.707 <= this.x + this.radius * 0.707 && y + radius * 0.707 >= this.y - this.radius * 0.707 && y - radius * 0.707 <= this.y + this.radius  * 0.707) {
            return true
        } else {
            return false
        }
    }
}

class Projectile {
    constructor(x, y, dx, dy, radius, image, damage, pierce, knockback, moabKnockback, parentID, playerSide) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.radius = radius
        this.image = image
        this.damage = damage
        this.pierce = pierce
        this.knockback = knockback
        this.moabKnockback = moabKnockback
        this.parentID = parentID
        this.playerSide = playerSide
        this.popAdjustBoosted = 0
        this.damageAdjustBoosted = 0
        this.popAdjustChecked = false
        this.damageAdjustChecked = false
        this.bounceCount = 0
        this.lifespan = -1
        if(this.image == "000iceproj.png" || this.image == "100iceproj.png") {
            this.lifespan = Date.now() + 500
        }
    }


    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
    }

    update() {
        this.x += this.dx
        this.y += this.dy
    }

    popAdjustRandomize() {
        this.popAdjustBoosted = 0
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "cobra" && towers[i].path1Upgrades >= 4 && towers[i].playerSide == this.playerSide) {
                if(Math.random() <= 0.1) {
                    this.popAdjustBoosted++
                }
            }
        }
        this.pierce = Math.ceil(1.25 ** this.popAdjustBoosted * this.pierce)
    }

    damageAdjustRandomize() {
        this.damageAdjustBoosted = 0
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "cobra" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                if(Math.random() <= 0.2) {
                    this.damageAdjustBoosted++
                }
            }
        }
        this.damage = Math.ceil(1.25 ** this.damageAdjustBoosted * this.damage)
    }

    touchingBloon(x, y, radius) {
        if(x + radius * 0.707 >= this.x - this.radius * 0.707 && x - radius * 0.707 <= this.x + this.radius * 0.707 && y + radius * 0.707 >= this.y - this.radius * 0.707 && y - radius * 0.707 <= this.y + this.radius  * 0.707) {
            return true
        } else {
            return false
        }
    }
}

class PathObject {
    constructor(x, y, radius) {
        this.x = x
        this.y = y
        this.radius = radius
    }

    draw() {
        ctx.fillStyle = "lime"
        ctx.fillRect(this.x - this.radius/2, this.y - this.radius/2, this.radius, this.radius)
    }

    towerPlacementCheck(x, y, radius) {
        if(x + radius * 0.707 >= this.x - this.radius * 0.707 && x - radius * 0.707 <= this.x + this.radius * 0.707 && y + radius * 0.707 >= this.y - this.radius * 0.707 && y - radius * 0.707 <= this.y + this.radius  * 0.707) {
            return true
        } else {
            return false
        }
    }
}

class Banana {
    constructor(x, y, radius, image, lifespan, salvage, cashGiven, parentID, playerSide) {
        this.x = x
        this.y = y
        this.radius = radius
        this.lifespan = lifespan
        this.salvage = salvage
        this.image = image
        this.cashGiven = cashGiven
        this.parentID = parentID
        this.playerSide = playerSide
    }

    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
    }

    mouseOn(x, y) {
        if(x >= this.x - this.radius * 0.707 && x <= this.x + this.radius * 0.707 && y >= this.y - this.radius && y <= this.y + this.radius) {
            return true
        } else {
            return false
        }
    }
}

class MoneyText {
    constructor(x, y, text) {
        this.x = x
        this.y = y
        this.text = text
        this.frames = 0
    }

    update() {
        this.y -= 5
        this.frames++
    }

    draw() {
        ctx.fillStyle = "yellow"
        ctx.font = 30 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.fillText("$" + this.text.toLocaleString(), this.x, this.y, canvas.width)
    }
}

class MiscText {
    constructor(x, y, text, mode) {
        this.x = x
        this.y = y
        this.text = text
        this.mode = mode
        this.frames = 0
    }

    update() {
        this.y -= 5
        this.frames++
    }

    draw() {
        if(this.mode == "eco") {
            ctx.fillStyle = "lime"
            ctx.font = 30 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.fillText("\u25b2" + this.text.toLocaleString(), this.x, this.y, canvas.width)
        } else {
            ctx.fillStyle = "red"
            ctx.font = 30 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.fillText("\u2665" + this.text.toLocaleString(), this.x, this.y, canvas.width)
        }
    }
}

class DisplayTowers {
    constructor(x, y, radius, image, text, cost) {
        this.x = x
        this.y = y
        this.radius = radius
        this.image = image
        this.text = text
        this.cost = cost
    }

    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.fillStyle = "gold"
        ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.fillText(this.text, this.x, this.y - this.radius/2, 2 * this.radius)
        ctx.fillText("$" + this.cost.toLocaleString(), this.x, this.y + this.radius/2, 2 *this.radius)
    }

    clicked(x, y) {
        if(x >= this.x - this.radius * 0.707 && x <= this.x + this.radius * 0.707 && y >= this.y - this.radius * 0.707 && y <= this.y + this.radius * 0.707) {
            return true
        } else {
            return false
        }
    }
}

class DisplayBloons {
    constructor(x, y, radius, image, text, count, health, cost, eco, spacing, roundUnlock, playerSide) {
        this.x = x
        this.y = y
        this.radius = radius
        this.roundUnlock = roundUnlock
        this.playerSide = playerSide
        this.internalImage = image
        this.image = image
        this.text = text
        this.count = count
        this.health = health
        this.cost = cost
        this.eco = eco
        this.spacing = spacing
        this.selected = false
    }

    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.fillStyle = "blue"
        ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
        ctx.textAlign = "center"
        if(this.selected) {
            ctx.strokeStyle = "yellow"
            ctx.lineWidth = 5
            ctx.strokeRect(this.x - 2 * this.radius/2, this.y - 2 * this.radius/2, 2 * this.radius, 2 * this.radius)
        }
        if(this.image == "locked.png") {
            if(this.playerSide == 1) {
                ctx.fillText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
            } else {
                ctx.fillText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
            }
        } else {
            ctx.fillText(this.text, this.x, this.y + this.radius/1.5, 2 * this.radius)
            ctx.fillText("$" + this.cost.toLocaleString(), this.x, this.y - this.radius/1.5, 2 *this.radius)
            ctx.fillText("\u25b2" + this.eco.toLocaleString(), this.x, this.y, 2 *this.radius)
        }
    }
}

class Cursor {
    constructor(x, y, playerSide) {
        this.x = x
        this.y = y
        this.playerSide = playerSide
    }

    draw() {
        if(this.playerSide == 1) {
            ctx.fillStyle = "blue"
        } else {
            ctx.fillStyle = "red"
        }
        ctx.fillRect(this.x - 2.5, this.y + 5, 5, 20)
        ctx.fillRect(this.x - 2.5, this.y - 25, 5, 20)
        ctx.fillRect(this.x + 5, this.y - 2.5, 20, 5)
        ctx.fillRect(this.x - 25, this.y - 2.5, 20, 5)
    }
}

class SentBloonQueue {
    constructor(health, cost, eco, spacing, count) {
        this.health = health
        this.cost = cost
        this.eco = eco
        this.spacing = spacing
        this.count = count
        this.nextSend = Date.now() + this.spacing
    }

    draw(x, y, radius) {
        if(this.health == 1) {
            this.image = "red.png"
        } else if(this.health == 2) {
            this.image = "blue.png"
        } else if(this.health == 3) {
            this.image = "green.png"
        } else if(this.health == 4) {
            this.image = "yellow.png"
        } else if(this.health == 5) {
            this.image = "pink.png"
        } else if(this.health == 6) {
            this.image = "black.png"
        } else if(this.health == 7) {
            this.image = "zebra.png"
        } else if(this.health == 8) {
            this.image = "rainbow.png"
        } else if(this.health == 18 || this.health == 68) {
            this.image = "ceramic5.png"
        }
        if(round <= 50) {
            if(this.health == 218) {
                this.image = "moab5.png"
            } else if(this.health == 918) {
                this.image = "bfb5.png"
            } else if(this.health == 4918) {
                this.image = "zomg5.png"
            }
        } else {
            if(this.health == 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                this.image = "moab5.png"
            } else if(this.health == 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
                this.image = "bfb5.png"
            } else if(this.health == 68 + Math.ceil(4900 * (1.05 ** (round - 50)))) {
                this.image = "zomg5.png"
            }
        }
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2)
        ctx.fillStyle = "blue"
        ctx.font = radius * 3 / 4 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.fillText(this.count, x, y, 2 * radius)
    }
}

class Images {
    constructor(x, y, radius, image) {
        this.x = x
        this.y = y
        this.radius = radius
        this.image = image
        this.text = ""
    }

    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
    }
}

class BoostIcons {
    constructor(x, y, radius, image) {
        this.x = x
        this.y = y
        this.radius = radius
        this.image = image
    }

    draw() {
        var image = new Image()
        image.src = this.image
        ctx.drawImage(image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.fillStyle = "white"
        ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.fillText(this.text, this.x, this.y, 2 * this.radius)
    }
}

var canvas = document.querySelector("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("2d")

var money = 650
var lives = 150
var eco = 250
var p1money = 650
var p2money = 650
var p1eco = 250
var p2eco = 250
var p1lives = 150
var p2lives = 150
var timeRoundEnded = 0
var timeGameStarted = Date.now()
var round = 0
var debug = false
var speedFactor = 1
var healthFactor = 1
var mouseX = 0
var mouseY = 0
var gameOver = false
var roundReady = true
var bloonsToSpawn = false
var endOfRoundGiven = true
var counter = 0
var moneyFactor = 1
var autostart = true
var moabCount = 0
var bfbCount = 0
var zomgCount = 0
var mastery = false
var bossMode = false
var bossSpawned = false
var versionText = "Version 1.0.0"
var gamemodeSelected = false
var gameStarted = false
var p1BloonSendRound = 0
var p2BloonSendRound = 0
var p1Towers = []
var p2Towers = []
var p1BloonQueue = []
var p2BloonQueue = []
var p1SelectedBloon = 0
var p2SelectedBloon = 10
var p1BloonUI = []
var p2BloonUI = []
var p1TowerBoostCount = 3
var p2TowerBoostCount = 3
var p1BloonBoostCount = 3
var p2BloonBoostCount = 3
var p1TowerBoostExpires = 0
var p2TowerBoostExpires = 0
var p1BloonBoostExpires = 0
var p2BloonBoostExpires = 0

var bloons = []
var towers = []
var projectiles = []
var pathObjects = []
var UITowers = []
var bananas = []
var moneyText = []
var cursor = []
var images = []
var boostIcons = []
var displayBloons = []
UITowers.push(new DisplayTowers(16*canvas.width/24, canvas.height/4, 30, "000dart.png", "", 300))
UITowers.push(new DisplayTowers(17*canvas.width/24, canvas.height/4, 30, "000tack.png", "", 400))
UITowers.push(new DisplayTowers(18*canvas.width/24, canvas.height/4, 30, "000bomb.png", "", 1000))
UITowers.push(new DisplayTowers(19*canvas.width/24, canvas.height/4, 30, "000ice.png", "", 1250))
UITowers.push(new DisplayTowers(20*canvas.width/24, canvas.height/4, 30, "000super.png", "", 2000))
UITowers.push(new DisplayTowers(16*canvas.width/24, 3*canvas.height/8, 30, "000farm.png", "", 1250))
UITowers.push(new DisplayTowers(17*canvas.width/24, 3*canvas.height/8, 30, "000farmer.png", "", 100))
UITowers.push(new DisplayTowers(18*canvas.width/24, 3*canvas.height/8, 30, "000dartling.png", "", 850))
UITowers.push(new DisplayTowers(19*canvas.width/24, 3*canvas.height/8, 30, "000wizard.png", "", 600))
UITowers.push(new DisplayTowers(20*canvas.width/24, 3*canvas.height/8, 30, "000cobra.png", "", 400))

UITowers.push(new DisplayTowers(4*canvas.width/24, canvas.height/4, 30, "000dart.png", "", 300))
UITowers.push(new DisplayTowers(5*canvas.width/24, canvas.height/4, 30, "000tack.png", "", 400))
UITowers.push(new DisplayTowers(6*canvas.width/24, canvas.height/4, 30, "000bomb.png", "", 1000))
UITowers.push(new DisplayTowers(7*canvas.width/24, canvas.height/4, 30, "000ice.png", "", 1250))
UITowers.push(new DisplayTowers(8*canvas.width/24, canvas.height/4, 30, "000super.png", "", 2000))
UITowers.push(new DisplayTowers(4*canvas.width/24, 3*canvas.height/8, 30, "000farm.png", "", 1250))
UITowers.push(new DisplayTowers(5*canvas.width/24, 3*canvas.height/8, 30, "000farmer.png", "", 100))
UITowers.push(new DisplayTowers(6*canvas.width/24, 3*canvas.height/8, 30, "000dartling.png", "", 850))
UITowers.push(new DisplayTowers(7*canvas.width/24, 3*canvas.height/8, 30, "000wizard.png", "", 600))
UITowers.push(new DisplayTowers(8*canvas.width/24, 3*canvas.height/8, 30, "000cobra.png", "", 400))
images.push(new Images(canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp1.png"))
images.push(new Images(3*canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp2.png"))


cursor.push(new Cursor(canvas.width/4, canvas.height/2, 1))
cursor.push(new Cursor(3*canvas.width/4, canvas.height/2, 2))
function tickAll() {
    for(var i = 0; i < bloons.length; i++) {
        bloons[i].health--
        if(bloons[i].health > 7) {
            bloons[i].health -= 9
        }
    }
}
//alert("WARNING: If you are sensitive to flashing lights do not play this game.\n\nPlease launch the game in fullscreen for best experience.\nTry not to tab out, as this breaks the game.\n\nWelcome to Bloons TD Javascript 2!\nPlace towers by moving your mouse to a desired area, then pressing the corresponding button for the tower. Click on the tower to select it, allowing you to upgrade and sell it. The top, middle, and bottom paths are upgraded with the \",\", \".\", and \"/\" keys respectively. Selling is achieved with the \"Backspace\" key. For Banana Farms with the Monkey Bank upgrade or higher, press \"Tab\" to change target priority, Dartlings can lock on a point, & Monkey Banks to collect stored money.\nTowers can only have 2 selected paths, and one path can be fully upgraded while the other can only be upgraded 2 times, and only one Tier 5 tower of that path and tower type can exist.\nPress \"Shift\" to toggle autostart.\n\nHave fun learning what each tower, their upgrades, and crosspath interactions do!")
for(var i = 0; i < 50; i++) {
    if(i < 50/8) {
        pathObjects.push(new PathObject(canvas.width/4 + canvas.width/16, (2 * i/50) * canvas.height, 30))
        pathObjects.push(new PathObject(canvas.width/4 + 7*canvas.width/16, (2 * i/50) * canvas.height, 30))
    } else if(i < 100/8) {
        pathObjects.push(new PathObject(((-1 * i/50) + 3/8) * canvas.width + canvas.width/16, canvas.height/4, 30))
        pathObjects.push(new PathObject(((-1 * i/50) + 3/8) * canvas.width + 7*canvas.width/16, canvas.height/4, 30))
    } else if(i < 150/8) {
        pathObjects.push(new PathObject(canvas.width/8 + canvas.width/16, (2 * i/50 - 1/4) * canvas.height, 30))
        pathObjects.push(new PathObject(canvas.width/8 + 7*canvas.width/16, (2 * i/50 - 1/4) * canvas.height, 30))
    } else if(i < 250/8) {
        pathObjects.push(new PathObject(((1 * i/50) - 1/4) * canvas.width + canvas.width/16, canvas.height/2, 30))
        pathObjects.push(new PathObject(((1 * i/50) - 1/4) * canvas.width + 7*canvas.width/16, canvas.height/2, 30))
    } else if(i < 300/8) {
        pathObjects.push(new PathObject(3*canvas.width/8 + canvas.width/16, (2 * i/50 - 3/4) * canvas.height, 30))
        pathObjects.push(new PathObject(3*canvas.width/8 + 7*canvas.width/16, (2 * i/50 - 3/4) * canvas.height, 30))
    } else if(i < 350/8) {
        pathObjects.push(new PathObject(((-1 * i/50) + 9/8) * canvas.width + canvas.width/16, 3*canvas.height/4, 30))
        pathObjects.push(new PathObject(((-1 * i/50) + 9/8) * canvas.width + 7*canvas.width/16, 3*canvas.height/4, 30))
    } else if(i <= 400/8) {
        pathObjects.push(new PathObject(canvas.width/4 + canvas.width/16, (2 * i/50 - 1) * canvas.height, 30))
        pathObjects.push(new PathObject(canvas.width/4 + 7*canvas.width/16, (2 * i/50 - 1) * canvas.height, 30))
    }
}

function drawUI() {
    var p1TowerSelected = false
    var p2TowerSelected = false
    ctx.fillStyle = "gray"
    ctx.fillRect(0, 0, canvas.width/8, canvas.height)
    ctx.fillRect(7 * canvas.width/8, 0, canvas.width/8, canvas.height)
    ctx.fillRect(9*canvas.width/20, 0, canvas.width/10, canvas.height/8)
    ctx.fillStyle = "black"
    ctx.font = "30px Luckiest Guy"
    ctx.textAlign = "right"
    ctx.font = "30px Luckiest Guy"
    ctx.textAlign = "center"
    ctx.fillText(" Round " + (round/2).toLocaleString(), canvas.width/2, 3*canvas.height/48, canvas.width/2)
    //ctx.fillText('\u25b2' + " " + eco.toLocaleString(), canvas.width/2, 40, canvas.width/2)
    if(Math.floor((Date.now() - timeGameStarted)/1000)%60 >= 10) {
        ctx.fillText(" " + Math.floor((Date.now() - timeGameStarted)/60000) + ":" + Math.floor((Date.now() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
    } else {
        ctx.fillText(" " + Math.floor((Date.now() - timeGameStarted)/60000) + ":0" + Math.floor((Date.now() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
    }
    ctx.textAlign = "left"
    ctx.fillText(" $ " + Math.trunc(p1money).toLocaleString(), 0, canvas.height/16, canvas.width/8)
    ctx.fillText(" \u25b2 " + Math.trunc(p1eco).toLocaleString(), 0, canvas.height/8, canvas.width/8)
    ctx.fillText(" \u2665 " + p1lives.toLocaleString(), 0, 3*canvas.height/16, canvas.width/4)
    ctx.fillText(" $ " + Math.trunc(p2money).toLocaleString(), 7*canvas.width/8, canvas.height/16, canvas.width/8)
    ctx.fillText(" \u25b2 " + Math.trunc(p2eco).toLocaleString(), 7*canvas.width/8, canvas.height/8, canvas.width/8)
    ctx.fillText(" \u2665 " + p2lives.toLocaleString(), 7*canvas.width/8, 3*canvas.height/16, canvas.width/4)
    for(var i = 0; i < UITowers.length; i++) {
        UITowers[i].draw()
    }
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].selected && towers[i].playerSide == 1) {
            p1TowerSelected = true
            ctx.fillStyle = "black"
            ctx.textAlign = "left"
            if(towers[i].towerType == "dart") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Dart Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "tack") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Tack Shooter", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades < 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $7,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farmer", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + Math.floor(towers[i].towerVar).toLocaleString() + " / $" + towers[i].farmerCap.toLocaleString(), 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "super") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Super Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "bomb") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Bomb Shooter", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ice") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Ice Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "dartling") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Dartling Gunner", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "wizard") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Wizard Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "cobra") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("COBRA", 0, canvas.height/2, canvas.width/8)
            }
            ctx.font = "30px Luckiest Guy"
            ctx.fillText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 0, 5*canvas.height/8, canvas.width/8)
            ctx.fillText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 0, 11*canvas.height/16, canvas.width/8)
            ctx.fillText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 0, 3*canvas.height/4, canvas.width/8)
            if(towers[i].towerType == "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Made: $" + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
                if(towers[i].towerType != "dartling") {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                    }
                } else {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Follow Mouse", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    }
                }
            }
            if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Sell: $" + Math.round(0.7 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
            }
        } else if(towers[i].selected && towers[i].playerSide == 2) {
            p2TowerSelected = true
            ctx.fillStyle = "black"
            ctx.textAlign = "left"
            if(towers[i].towerType == "dart") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Dart Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "tack") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Tack Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades < 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $7,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Banana Farmer", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + Math.floor(towers[i].towerVar).toLocaleString() + " / $" + towers[i].farmerCap.toLocaleString(), 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "super") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Super Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "bomb") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Bomb Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ice") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Ice Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "dartling") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Dartling Gunner", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "wizard") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Wizard Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "cobra") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("COBRA", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            }
            ctx.font = "30px Luckiest Guy"
            ctx.fillText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 7*canvas.width/8, 5*canvas.height/8, canvas.width/8)
            ctx.fillText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 7*canvas.width/8, 11*canvas.height/16, canvas.width/8)
            ctx.fillText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 7*canvas.width/8, 3*canvas.height/4, canvas.width/8)
            if(towers[i].towerType == "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Made: $" + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
                if(towers[i].towerType != "dartling") {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    }
                } else {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Follow Mouse", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    }
                }
            }
            if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 7*canvas.width/8, 7*canvas.height/8, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.fillText("Sell: $" + Math.round(0.7 * towers[i].totalCost).toLocaleString(), 7*canvas.width/8, 7*canvas.height/8, canvas.width/8)
            }
        }
    }
    for(var i = 0; i < p1BloonQueue.length; i++) {
        p1BloonQueue[i].draw(canvas.width/8 + 25, canvas.height - 300 + 50 * i, 25)
    }
    for(var i = 0; i < p2BloonQueue.length; i++) {
        p2BloonQueue[i].draw(7*canvas.width/8 - 25, canvas.height - 300 + 50 * i, 25)
    }
    if(p1TowerBoostCount > 0 && p1TowerBoostExpires + 40000 <= Date.now()) {
        boostIcons[0].image = "towerboost.png"
        boostIcons[0].text = "x" + p1TowerBoostCount
        boostIcons[0].draw()
    } else {
        boostIcons[0].image = "towerboostcooldown.png"
        boostIcons[0].text = "x" + p1TowerBoostCount
        boostIcons[0].draw()
    }
    if(p1BloonBoostCount > 0 && p1BloonBoostExpires + 40000 <= Date.now()) {
        boostIcons[1].image = "bloonboost.png"
        boostIcons[1].text = "x" + p1BloonBoostCount
        boostIcons[1].draw()
    } else {
        boostIcons[1].image = "bloonboostcooldown.png"
        boostIcons[1].text = "x" + p1BloonBoostCount
        boostIcons[1].draw()
    }
    if(p2TowerBoostCount > 0 && p2TowerBoostExpires + 40000 <= Date.now()) {
        boostIcons[2].image = "towerboost.png"
        boostIcons[2].text = "x" + p2TowerBoostCount
        boostIcons[2].draw()
    } else {
        boostIcons[2].image = "towerboostcooldown.png"
        boostIcons[2].text = "x" + p2TowerBoostCount
        boostIcons[2].draw()
    }
    if(p2BloonBoostCount > 0 && p2BloonBoostExpires + 40000 <= Date.now()) {
        boostIcons[3].image = "bloonboost.png"
        boostIcons[3].text = "x" + p2BloonBoostCount
        boostIcons[3].draw()
    } else {
        boostIcons[3].image = "bloonboostcooldown.png"
        boostIcons[3].text = "x" + p2BloonBoostCount
        boostIcons[3].draw()
    }
    for(var i = 0; i < displayBloons.length; i++) {
        displayBloons[i].selected = false
    }
    displayBloons[p1SelectedBloon].selected = true
    displayBloons[p2SelectedBloon].selected = true
    if(p1TowerSelected == false) {
        for(var i = 0; i >= 0 && i <= 9; i++) {
            displayBloons[i].draw()
        }
    }
    if(p2TowerSelected == false) {
        for(var i = 10; i >= 10 && i <= 19; i++) {
            displayBloons[i].draw()
        }
    }
}

function spawnRound() {
    if(round == 1) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 2) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 3) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 4) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 5) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 6) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 7) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 22) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 8) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 9) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 10) {
        setTimeout(function() {
            if(counter < 50) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 250)
    } else if(round == 11) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 12) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 18) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 18 && counter < 24) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 24 && counter < 28) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 13) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 14) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 18) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 18 && counter < 24) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 24 && counter < 28) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 15) {
        setTimeout(function() {
            if(counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 12 && counter < 24) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 24 && counter < 36) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 36 && counter < 44) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 44 && counter < 48) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 16) {
        setTimeout(function() {
            if(counter < 24) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 24 && counter < 36) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 17) {
        setTimeout(function() {
            if(counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 18) {
        setTimeout(function() {
            if(counter < 40) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 19) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 22) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 20) {
        setTimeout(function() {
            if(counter < 6) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 21) {
        setTimeout(function() {
            if(counter < 9) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 22) {
        setTimeout(function() {
            if(counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 23) {
        setTimeout(function() {
            if(counter < 18) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 24) {
        setTimeout(function() {
            if(counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 25) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 26) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 27) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 30 && counter < 60) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 2, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 60 && counter < 90) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 90 && counter < 120) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 28) {
        setTimeout(function() {
            if(counter < 6) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 29) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 30) {
        setTimeout(function() {
            if(counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 31) {
        setTimeout(function() {
            if(counter < 21 && counter % 3 != 2) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else if(counter < 21 && counter % 3 == 2) {
                counter++
                spawnRound()
            } else if(counter >= 21 && counter < 28) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 32) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 33) {
        setTimeout(function() {
            if(counter < 66) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 50)
    } else if(round == 34) {
        setTimeout(function() {
            if(counter < 135) {
                if(counter % 7 != 6) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 4, 2, true, false))
                    counter++
                    spawnRound()
                } else {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                    counter++
                    spawnRound()
                }
            } else {
                bloonsToSpawn = true
            }
        }, 125)
    } else if(round == 35) {
        setTimeout(function() {
            if(counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 15 && counter < 21) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            }  else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 36) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 30 && counter < 60) {
                counter++
                spawnRound()
            } else if(counter >= 60 && counter < 90) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 90 && counter < 120) {
                counter++
                spawnRound()
            } else if(counter >= 120 && counter < 150) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            }  else {
                bloonsToSpawn = true
            }
        }, 50)
    } else if(round == 37) {
        setTimeout(function() {
            if(counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 25 && counter < 50) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 38) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 28) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 28 && counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 39) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 35) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 35 && counter < 45) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 40) {
        if(counter < 1) {
            bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false))
            bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false))
            counter++
            spawnRound()
        } else {
            bloonsToSpawn = true
        }
    } else if(round == 41) {
        setTimeout(function() {
            if(counter < 66) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 6, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 150)
    } else if(round == 42) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 43) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 43) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 15) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 400)
    } else if(round == 44) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 45) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 30 && counter < 40) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 46) {
        setTimeout(function() {
            if(counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 47) {
        setTimeout(function() {
            if(counter < 40) {
                if(counter % 5 == 4) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                    counter++
                    spawnRound()
                } else {
                    counter++
                    spawnRound()
                }
            } else if(counter >= 40 && counter < 90) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 48) {
        setTimeout(function() {
            if(counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 20 && counter < 40) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 40 && counter < 60) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 49) {
        setTimeout(function() {
            if(counter < 50) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 50 && counter < 70) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 70 && counter < 120) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 120 && counter < 135) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 135 && counter < 185) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 185 && counter < 195) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 195 && counter < 245) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 3, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 50) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 41) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 41 && counter < 56) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 18, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 56 && counter < 57) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 218, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 51) {
        setTimeout(function() {
            if(counter < 20) {
                if(counter % 2 == 1) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                    counter++
                    spawnRound()
                } else {
                    counter++
                    spawnRound()
                }
            } else if(counter >= 20 && counter < 40) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 52) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 41) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 53) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 21) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 21 && counter < 22) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 22 && counter < 42) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 5, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 42 && counter < 43) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 54) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 26) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 26 && counter < 27) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 55) {
        setTimeout(function() {
            if(counter < 80) {
                if(counter % 20 < 10) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                    counter++
                    spawnRound()
                } else {
                    counter++
                    spawnRound()
                }
            } else if(counter >= 80 && counter < 81) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 75)
    } else if(round == 56) {
        setTimeout(function() {
            if(counter < 80) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 80 && counter < 81) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 50)
    } else if(round == 57) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 21) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 21 && counter < 23) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 58) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 11 && counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 12 && counter < 22) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 22 && counter < 23) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 23 && counter < 33) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 33 && counter < 34) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 59) {
        setTimeout(function() {
            if(counter < 30) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 30 && counter < 31) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 50)
    } else if(round == 60) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 1)
    } else if(round == 61) {
        setTimeout(function() {
            if(counter < 50) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 50 && counter < 51) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 51 && counter < 101) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 101 && counter < 102) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 102 && counter < 152) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 152 && counter < 153) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 153 && counter < 203) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 203 && counter < 204) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    } else if(round == 62) {
        setTimeout(function() {
            if(counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 25 && counter < 26) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 26 && counter < 51) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 51 && counter < 52) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 52 && counter < 77) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 77 && counter < 78) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 78 && counter < 103) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 103 && counter < 104) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 104 && counter < 129) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 129 && counter < 130) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 130 && counter < 160) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 63) {
        setTimeout(function() {
            if(counter < 240) {
                if(counter % 80 < 40) {
                    bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
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
        setTimeout(function() {
            if(counter < 9) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 65) {
        setTimeout(function() {
            if(counter < 2) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 2 && counter < 5) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 5 && counter < 55) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 7, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 55 && counter < 95) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 95 && counter < 125) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 200)
    } else if(round == 66) {
        setTimeout(function() {
            if(counter < 2) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 2 && counter < 4) {
                counter++
                spawnRound()
            } else if(counter >= 4 && counter < 7) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 7 && counter < 10) {
                counter++
                spawnRound()
            } else if(counter >= 10 && counter < 14) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 14 && counter < 18) {
                counter++
                spawnRound()
            } else if(counter >= 18 && counter < 19) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 67) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 7) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 7 && counter < 8) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 68) {
        setTimeout(function() {
            if(counter < 3) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 1500)
    } else if(round == 69) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 300)
    } else if(round == 70) {
        setTimeout(function() {
            if(counter < 3) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 3 && counter < 4) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 4 && counter < 7) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 7 && counter < 8) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 8 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 71) {
        setTimeout(function() {
            if(counter < 4) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 1000)
    } else if(round == 72) {
        setTimeout(function() {
            if(counter < 2) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 2 && counter < 12) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 73) {
        setTimeout(function() {
            if(counter < 7) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 7 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 11 && counter < 25) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 74) {
        setTimeout(function() {
            if(counter < 3) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 3 && counter < 5) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 5 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 11 && counter < 14) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 14 && counter < 20) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 75) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 8) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 8 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 11 && counter < 18) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 18 && counter < 22) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 76) {
        setTimeout(function() {
            if(counter < 10) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 1000)
    } else if(round == 77) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 11) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 11 && counter < 17) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 17 && counter < 27) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 27 && counter < 28) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 500)
    } else if(round == 78) {
        setTimeout(function() {
            if(counter < 120) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 120 && counter < 121) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 0)
    } else if(round == 79) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 1 && counter < 76) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 76 && counter < 77) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 77 && counter < 152) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 152 && counter < 153) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 153 && counter < 228) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 228 && counter < 229) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 229 && counter < 304) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 304 && counter < 305) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 305 && counter < 380) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 380 && counter < 381) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= 381 && counter < 476) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 8, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 50)
    } else if(round == 80) {
        setTimeout(function() {
            if(counter < 1) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 1)
    } else {
        setTimeout(function() {
            if(counter < zomgCount) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= zomgCount && counter < zomgCount + bfbCount) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else if(counter >= zomgCount + bfbCount && counter < zomgCount + bfbCount + moabCount) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 1, true, false))
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, 2, true, false))
                counter++
                spawnRound()
            } else {
                bloonsToSpawn = true
            }
        }, 100)
    }
}

function animate() {
    /*if(gamemodeSelected == false) {
        ctx.fillStyle = "gray"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }*/
    if(gameStarted == false) {
        setTimeout(animate, 50/3)
        ctx.fillStyle = "gray"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        for(var i = 0; i < UITowers.length; i++) {
            UITowers[i].draw()
        }
        for(var i = 0; i < images.length; i++) {
            images[i].draw()
        }
        for(var i = 0; i < cursor.length; i++) {
            cursor[i].draw()
        }
        if(p1Towers.length == 3 && p2Towers.length == 3) {
            gameStarted = true
            cursor[0].x = 5*canvas.width/16
            cursor[0].y = canvas.height/2
            cursor[1].x = 11*canvas.width/16
            cursor[1].y = canvas.height/2
            UITowers.splice(0, UITowers.length)
            timeRoundEnded = 0
            timeGameStarted = Date.now()
            if(p1Towers[0] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 200))
            } else if(p1Towers[0] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 400))
            } else if(p1Towers[0] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 1000))
            } else if(p1Towers[0] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 1250))
            } else if(p1Towers[0] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 2000))
            } else if(p1Towers[0] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 1250))
            } else if(p1Towers[0] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 100))
            } else if(p1Towers[0] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 850))
            } else if(p1Towers[0] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 600))
            } else if(p1Towers[0] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4, 30, p1Towers[0], "z", 400))
            }
            if(p1Towers[1] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 200))
            } else if(p1Towers[1] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 400))
            } else if(p1Towers[1] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 1000))
            } else if(p1Towers[1] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 1250))
            } else if(p1Towers[1] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 2000))
            } else if(p1Towers[1] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 1250))
            } else if(p1Towers[1] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 100))
            } else if(p1Towers[1] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 850))
            } else if(p1Towers[1] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 600))
            } else if(p1Towers[1] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/12, 30, p1Towers[1], "x", 400))
            }
            if(p1Towers[2] == "000dart.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 200))
            } else if(p1Towers[2] == "000tack.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 400))
            } else if(p1Towers[2] == "000bomb.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 1000))
            } else if(p1Towers[2] == "000ice.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 1250))
            } else if(p1Towers[2] == "000super.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 2000))
            } else if(p1Towers[2] == "000farm.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 1250))
            } else if(p1Towers[2] == "000farmer.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 100))
            } else if(p1Towers[2] == "000dartling.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 850))
            } else if(p1Towers[2] == "000wizard.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 600))
            } else if(p1Towers[2] == "000cobra.png") {
                UITowers.push(new DisplayTowers(canvas.width/32, canvas.height/4 + canvas.height/6, 30, p1Towers[2], "c", 400))
            }
            if(p2Towers[0] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 200))
            } else if(p2Towers[0] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 400))
            } else if(p2Towers[0] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 1000))
            } else if(p2Towers[0] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 1250))
            } else if(p2Towers[0] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 2000))
            } else if(p2Towers[0] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 1250))
            } else if(p2Towers[0] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 100))
            } else if(p2Towers[0] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 850))
            } else if(p2Towers[0] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 600))
            } else if(p2Towers[0] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4, 30, p2Towers[0], "m", 400))
            }
            if(p2Towers[1] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 200))
            } else if(p2Towers[1] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 400))
            } else if(p2Towers[1] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 1000))
            } else if(p2Towers[1] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 1250))
            } else if(p2Towers[1] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 2000))
            } else if(p2Towers[1] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 1250))
            } else if(p2Towers[1] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 100))
            } else if(p2Towers[1] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 850))
            } else if(p2Towers[1] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 600))
            } else if(p2Towers[1] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/12, 30, p2Towers[1], "comma", 400))
            }
            if(p2Towers[2] == "000dart.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 200))
            } else if(p2Towers[2] == "000tack.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 400))
            } else if(p2Towers[2] == "000bomb.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 1000))
            } else if(p2Towers[2] == "000ice.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 1250))
            } else if(p2Towers[2] == "000super.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 2000))
            } else if(p2Towers[2] == "000farm.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 1250))
            } else if(p2Towers[2] == "000farmer.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 100))
            } else if(p2Towers[2] == "000dartling.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 850))
            } else if(p2Towers[2] == "000wizard.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 600))
            } else if(p2Towers[2] == "000cobra.png") {
                UITowers.push(new DisplayTowers(31*canvas.width/32, canvas.height/4 + canvas.height/6, 30, p2Towers[2], "period", 400))
            }
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2, 25, "red.png", "x8", 8, 1, 25, 1, 100, 2, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/12, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/12, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/6, 25, "pink.png", "x3", 3, 5, 25, 1, 300, 5, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/6, 25, "black.png", "x3", 3, 6, 30, 1.5, 280, 6, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/4, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/4, 25, "rainbow.png", "x1", 1, 8, 70, 2.8, 350, 12, 1))
            displayBloons.push(new DisplayBloons(canvas.width/24, canvas.height/2 + canvas.height/3, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 1))
            displayBloons.push(new DisplayBloons(canvas.width/12, canvas.height/2 + canvas.height/3, 25, "moab5.png", "x1", 1, 218, 1000, 0, 3000, 18, 1))

            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2, 25, "red.png", "x8", 8, 1, 25, 1, 100, 2, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2, 25, "blue.png", "x5", 5, 2, 15, 0.8, 300, 2, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/12, 25, "green.png", "x5", 5, 3, 18, 0.9, 230, 3, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/12, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/6, 25, "pink.png", "x3", 3, 5, 25, 1, 300, 5, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/6, 25, "black.png", "x3", 3, 6, 30, 1.5, 280, 6, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/4, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/4, 25, "rainbow.png", "x1", 1, 8, 70, 2.8, 350, 12, 2))
            displayBloons.push(new DisplayBloons(11*canvas.width/12, canvas.height/2 + canvas.height/3, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 2))
            displayBloons.push(new DisplayBloons(23*canvas.width/24, canvas.height/2 + canvas.height/3, 25, "moab5.png", "x1", 1, 218, 1000, 0, 3000, 18, 2))

            boostIcons.push(new BoostIcons(canvas.width/24, 15*canvas.height/16, 25, "towerboost.png"))
            boostIcons.push(new BoostIcons(canvas.width/12, 15*canvas.height/16, 25, "bloonboost.png"))
            boostIcons.push(new BoostIcons(22*canvas.width/24, 15*canvas.height/16, 25, "towerboost.png"))
            boostIcons.push(new BoostIcons(23*canvas.width/24, 15*canvas.height/16, 25, "bloonboost.png"))
            setInterval(function() {
                money += eco
                p1money += p1eco
                p2money += p2eco
            }, 6000)
        }
    } else if(gameOver == false) {
        setTimeout(animate, 50/3)
        ctx.fillStyle = "green"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
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
        drawUI()

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
            displayBloons[0] = new DisplayBloons(displayBloons[0].x, displayBloons[0].y, 25, "red.png", "x8", 8, 1, 25, 1, 100, 2, 1)
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
        } else if(p1BloonSendRound >= 20) {
            displayBloons[2] = new DisplayBloons(displayBloons[2].x, displayBloons[2].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 3, 1)
        }
        if(p1BloonSendRound >= 4 && p1BloonSendRound < 8) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 1)
        } else if(p1BloonSendRound >= 8 && p1BloonSendRound < 22) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 4, 1)
        } else if(p1BloonSendRound >= 22) {
            displayBloons[3] = new DisplayBloons(displayBloons[3].x, displayBloons[3].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 4, 1)
        }
        if(p1BloonSendRound >= 5 && p1BloonSendRound < 10) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 1)
        } else if(p1BloonSendRound >= 10 && p1BloonSendRound < 20) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 5, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 23) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "zebra.png", "x3", 3, 7, 120, 3.5, 80, 5, 1)
        } else if(p1BloonSendRound >= 23) {
            displayBloons[4] = new DisplayBloons(displayBloons[4].x, displayBloons[4].y, 25, "zebra.png", "x60", 60, 7, 1200, 22, 1000/60, 5, 1)
        }
        if(p1BloonSendRound >= 6 && p1BloonSendRound < 12) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "black.png", "x3", 3, 6, 30, 1.5, 280, 6, 1)
        } else if(p1BloonSendRound >= 12 && p1BloonSendRound < 22) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 6, 1)
        } else if(p1BloonSendRound >= 22) {
            displayBloons[5] = new DisplayBloons(displayBloons[5].x, displayBloons[5].y, 25, "rainbow.png", "x4", 4, 8, 250, 6, 100, 6, 1)
        }
        if(p1BloonSendRound >= 9 && p1BloonSendRound < 13) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 1)
        } else if(p1BloonSendRound >= 13 && p1BloonSendRound < 20) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "zebra.png", "x3", 3, 7, 120, 3.5, 80, 9, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound <= 25) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x2", 2, 18, 350, 5, 110, 9, 1)
        } else if(p1BloonSendRound > 25 && p1BloonSendRound < 27) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x2", 2, 68, 350, 5, 110, 9, 1)
        } else if(p1BloonSendRound >= 27) {
            displayBloons[6] = new DisplayBloons(displayBloons[6].x, displayBloons[6].y, 25, "ceramic5.png", "x40", 40, 68, 3400, 0, 20, 9, 1)
        }
        if(p1BloonSendRound >= 12 && p1BloonSendRound < 15) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "rainbow.png", "x1", 1, 8, 70, 2.8, 350, 12, 1)
        } else if(p1BloonSendRound >= 15 && p1BloonSendRound < 22) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "rainbow.png", "x4", 4, 8, 250, 6, 100, 12, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound < 25) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x1", 1, 218, 900, 0, 500, 12, 1)
        } else if(p1BloonSendRound == 25) {
            displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x15", 15, 218, 4000, -50, 200/3, 12, 1)
        } else if(p1BloonSendRound > 25) {
            if(round <= 25) {
                displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x15", 15, 218, 4000, -50, 200/3, 12, 1)
            } else {
                displayBloons[7] = new DisplayBloons(displayBloons[7].x, displayBloons[7].y, 25, "moab5.png", "x15", 15, 68 + Math.ceil(200 * 1.05 ** (round - 50)), 4000, -50, 200/3, 12, 1)
            }
        }
        if(p1BloonSendRound >= 15 && p1BloonSendRound < 18) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 1)
        } else if(p1BloonSendRound >= 18 && p1BloonSendRound < 20) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "ceramic5.png", "x2", 2, 18, 350, 5, 110, 15, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 22) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 1600, -25, 3500, 15, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound <= 25) {
            displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 1300, -25, 600, 15, 1)
        } else if(p1BloonSendRound > 25 && p1BloonSendRound < 27) {
            if(round <= 25) {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 918, 1300, -25, 600, 15, 1)
            } else {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x1", 1, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 1300, -25, 600, 15, 1)
            }
        } else if(p1BloonSendRound >= 27) {
            if(round <= 25) {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x10", 10, 918, 7000, -150, 120, 15, 1)
            } else {
                displayBloons[8] = new DisplayBloons(displayBloons[8].x, displayBloons[8].y, 25, "bfb5.png", "x10", 10, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 7000, -150, 120, 15, 1)
            }
        }
        if(p1BloonSendRound >= 18 && p1BloonSendRound < 20) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "moab5.png", "x1", 1, 218, 1000, 0, 3000, 18, 1)
        } else if(p1BloonSendRound >= 20 && p1BloonSendRound < 22) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "moab5.png", "x1", 1, 218, 900, 0, 500, 18, 1)
        } else if(p1BloonSendRound >= 22 && p1BloonSendRound < 24) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 4918, 5500, -100, 6000, 18, 1)
        } else if(p1BloonSendRound >= 24 && p1BloonSendRound <= 25) {
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 4918, 5000, -100, 1000, 18, 1)
        } else if(p1BloonSendRound > 25 && p1BloonSendRound < 29) {
            if(round <= 25) {

            } else {

            }
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x1", 1, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 4500, -100, 1000, 18, 1)
        } else if(p1BloonSendRound > 29) {
            if(round <= 25) {
                displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x4", 4, 4918, 12000, -400, 300, 18, 1)
            } else {
                displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x4", 4, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 12000, -400, 300, 18, 1)
            }
            displayBloons[9] = new DisplayBloons(displayBloons[9].x, displayBloons[9].y, 25, "zomg5.png", "x4", 4, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 12000, -400, 300, 18, 1)
        }
        if(p2BloonSendRound >= 2 && p2BloonSendRound < 20) {
            displayBloons[10] = new DisplayBloons(displayBloons[10].x, displayBloons[10].y, 25, "red.png", "x8", 8, 1, 25, 1, 100, 2, 2)
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
        } else if(p2BloonSendRound >= 20) {
            displayBloons[12] = new DisplayBloons(displayBloons[12].x, displayBloons[12].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 3, 2)
        }
        if(p2BloonSendRound >= 4 && p2BloonSendRound < 8) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "yellow.png", "x5", 5, 4, 24, 1.2, 230, 4, 2)
        } else if(p2BloonSendRound >= 8 && p2BloonSendRound < 22) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "yellow.png", "x4", 4, 4, 40, 1.6, 60, 4, 2)
        } else if(p2BloonSendRound >= 22) {
            displayBloons[13] = new DisplayBloons(displayBloons[13].x, displayBloons[13].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 4, 2)
        }
        if(p2BloonSendRound >= 5 && p2BloonSendRound < 10) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "pink.png", "x3", 3, 5, 28, 1.4, 300, 5, 2)
        } else if(p2BloonSendRound >= 10 && p2BloonSendRound < 20) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "pink.png", "x4", 4, 5, 60, 2.3, 50, 5, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 23) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "zebra.png", "x3", 3, 7, 120, 3.5, 80, 5, 2)
        } else if(p2BloonSendRound >= 23) {
            displayBloons[14] = new DisplayBloons(displayBloons[14].x, displayBloons[14].y, 25, "zebra.png", "x60", 60, 7, 1200, 22, 1000/60, 5, 2)
        }
        if(p2BloonSendRound >= 6 && p2BloonSendRound < 12) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "black.png", "x3", 3, 6, 30, 1.5, 280, 6, 2)
        } else if(p2BloonSendRound >= 12 && p2BloonSendRound < 22) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "black.png", "x4", 4, 6, 75, 2.9, 80, 6, 2)
        } else if(p2BloonSendRound >= 22) {
            displayBloons[15] = new DisplayBloons(displayBloons[15].x, displayBloons[15].y, 25, "rainbow.png", "x4", 4, 8, 250, 6, 100, 6, 2)
        }
        if(p2BloonSendRound >= 9 && p2BloonSendRound < 13) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "zebra.png", "x2", 2, 7, 60, 2.7, 300, 9, 2)
        } else if(p2BloonSendRound >= 13 && p2BloonSendRound < 20) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "zebra.png", "x3", 3, 7, 120, 3.5, 80, 9, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound <= 25) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x2", 2, 18, 350, 5, 110, 9, 2)
        } else if(p2BloonSendRound > 25 && p2BloonSendRound < 27) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x2", 2, 68, 350, 5, 110, 9, 2)
        } else if(p2BloonSendRound >= 27) {
            displayBloons[16] = new DisplayBloons(displayBloons[16].x, displayBloons[16].y, 25, "ceramic5.png", "x40", 40, 68, 3400, 0, 20, 9, 2)
        }
        if(p2BloonSendRound >= 12 && p2BloonSendRound < 15) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "rainbow.png", "x1", 1, 8, 70, 2.8, 350, 12, 2)
        } else if(p2BloonSendRound >= 15 && p2BloonSendRound < 22) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "rainbow.png", "x4", 4, 8, 250, 6, 100, 12, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound < 25) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x1", 1, 218, 900, 0, 500, 12, 2)
        } else if(p2BloonSendRound == 25) {
            displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x15", 15, 218, 4000, -50, 200/3, 12, 2)
        } else if(p2BloonSendRound > 25) {
            if(round <= 25) {
                displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x15", 15, 218, 4000, -50, 200/3, 12, 2)
            } else {
                displayBloons[17] = new DisplayBloons(displayBloons[17].x, displayBloons[17].y, 25, "moab5.png", "x15", 15, 68 + Math.ceil(200 * 1.05 ** (round - 50)), 4000, -50, 200/3, 12, 2)
            }
        }
        if(p2BloonSendRound >= 15 && p2BloonSendRound < 18) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "ceramic5.png", "x1", 1, 18, 150, 5, 650, 15, 2)
        } else if(p2BloonSendRound >= 18 && p2BloonSendRound < 20) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "ceramic5.png", "x2", 2, 18, 350, 5, 110, 15, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 22) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 1600, -25, 3500, 15, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound <= 25) {
            displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 1300, -25, 600, 15, 2)
        } else if(p2BloonSendRound > 25 && p2BloonSendRound < 27) {
            if(round <= 25) {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 918, 1300, -25, 600, 15, 2)
            } else {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x1", 1, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 1300, -25, 600, 15, 2)
            }
        } else if(p2BloonSendRound >= 27) {
            if(round <= 25) {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x10", 10, 918, 7000, -150, 120, 15, 2)
            } else {
                displayBloons[18] = new DisplayBloons(displayBloons[18].x, displayBloons[18].y, 25, "bfb5.png", "x10", 10, 68 + Math.ceil(900 * 1.05 ** (round - 50)), 7000, -150, 120, 15, 2)
            }
        }
        if(p2BloonSendRound >= 18 && p2BloonSendRound < 20) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "moab5.png", "x1", 1, 218, 1000, 0, 3000, 18, 2)
        } else if(p2BloonSendRound >= 20 && p2BloonSendRound < 22) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "moab5.png", "x1", 1, 218, 900, 0, 500, 18, 2)
        } else if(p2BloonSendRound >= 22 && p2BloonSendRound < 24) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 5500, -100, 6000, 18, 2)
        } else if(p2BloonSendRound >= 24 && p2BloonSendRound <= 25) {
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 5000, -100, 1000, 18, 2)
        } else if(p2BloonSendRound > 25 && p2BloonSendRound < 29) {
            if(round <= 25) {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 4918, 4500, -100, 1000, 18, 2)
            } else {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x1", 1, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 4500, -100, 1000, 18, 2)
            }
        } else if(p2BloonSendRound > 29) {
            if(round <= 25) {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x4", 4, 4918, 12000, -400, 300, 18, 2)
            } else {
                displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x4", 4, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 12000, -400, 300, 18, 2)
            }
            displayBloons[19] = new DisplayBloons(displayBloons[19].x, displayBloons[19].y, 25, "zomg5.png", "x4", 4, 68 + Math.ceil(4900 * 1.05 ** (round - 50)), 12000, -400, 300, 18, 2)
        }

        if(roundReady && endOfRoundGiven == false && Date.now() - timeRoundEnded >= 5000) {
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                    towers[i].towerVar += Math.round(400 * ((3/7000) * towers[i].towerVar + 1))
                    if(towers[i].playerSide == 1) {
                        p1eco += 30
                    } else {
                        p2eco += 30
                    }
                    if(towers[i].towerVar > 7000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 7000
                            } else {
                                p2money += 7000
                            }
                            towers[i].popCount += 7000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 7000))
                        } else {
                            towers[i].towerVar = 7000
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                    towers[i].towerVar += Math.round(1200 * ((3/105000) * towers[i].towerVar + 1))
                    if(towers[i].playerSide == 1) {
                        p1eco += 100
                    } else {
                        p2eco += 100
                    }
                    if(towers[i].towerVar > 14000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 14000
                            } else {
                                p2money += 14000
                            }
                            towers[i].popCount += 14000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 14000))
                        } else {
                            towers[i].towerVar = 14000
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                    towers[i].towerVar += Math.round(3000 * ((3/20000) * towers[i].towerVar + 1))
                    if(towers[i].playerSide == 1) {
                        p1eco += 750
                    } else {
                        p2eco += 750
                    }
                    if(towers[i].towerVar > 30000) {
                        if(towers[i].path3Upgrades == 2) {
                            if(towers[i].playerSide == 1) {
                                p1money += 30000
                            } else {
                                p2money += 30000
                            }
                            towers[i].popCount += 30000
                            towers[i].towerVar = 0
                            moneyText.push(new MoneyText(towers[i].x, towers[i].y, 30000))
                        } else {
                            towers[i].towerVar = 30000
                        }
                    }
                } else if(towers[i].towerType == "farm" && towers[i].path3Upgrades == 5) {
                    if(towers[i].playerSide == 1) {
                        p1money += 10000
                    } else {
                        p2money += 10000
                    }
                    towers[i].popCount += 10000
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 10000))
                } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 5) {
                    if(towers[i].playerSide == 1) {
                        p1money += 0.1 * p2money + 80
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, Math.round((0.1 * p2money) + 80).toLocaleString()))
                        p2money -= 0.1 * p2money
                        p1eco += 0.1 * p2eco
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, Math.round((0.1 * p2eco) + 80).toLocaleString(), "eco"))
                        p2eco -= 0.1 * p2eco
                    } else {
                        p2money += 0.1 * p1money + 80
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, Math.round((0.1 * p1money) + 80).toLocaleString()))
                        p1money -= 0.1 * p2money
                        p2eco += 0.1 * p1eco
                        moneyText.push(new MiscText(towers[i].x, towers[i].y, Math.round((0.1 * p1eco) + 80).toLocaleString(), "eco"))
                        p1eco -= 0.1 * p2eco
                    }
                } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades >= 1) {
                    if(towers[i].playerSide == 1) {
                        p1money += 80
                    } else {
                        p2money += 80
                    }
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, 80))
                }
            }
            endOfRoundGiven = true
        }

        if(autostart) {
            if(roundReady && Date.now() - timeRoundEnded >= 5000) {
                round += 2
                moabCount = Math.trunc(Math.random() * (round - 40) + 1)
                bfbCount = Math.trunc(Math.random() * (round - 60) + 1)
                zomgCount = Math.trunc(Math.random() * (round - 80) + 1)
                bossSpawned = false
                for(var i = 0; i < towers.length; i++) {
                    if(towers[i].towerType == "farm") {
                        towers[i].nextFire = 0
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

        var bossCount = 0
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].isBoss) {
                bossCount++
            }
        }
        if(bossCount == 1) {
            autostart = true
        }
        if(bossCount > 1) {
            gameOver = true
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
        if(p1AIBloonCount == 0 && bloonsToSpawn || p2AIBloonCount == 0 && bloonsToSpawn) {
            roundReady = true
            if(timeRoundEnded == 0) {
                timeRoundEnded = Date.now()
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(p1TowerBoostExpires > Date.now() - 12000 && towers[i].playerSide == 1) {
                towers[i].towerBoosted = 1/1.8
            } else if(towers[i].playerSide == 1) {
                towers[i].towerBoosted = 1
            }
        }
        for(var i = 0; i < towers.length; i++) {
            if(p2TowerBoostExpires > Date.now() - 12000 && towers[i].playerSide == 2) {
                towers[i].towerBoosted = 1/1.8
            } else if(towers[i].playerSide == 2) {
                towers[i].towerBoosted = 1
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(p1BloonBoostExpires > Date.now() - 12000 && bloons[i].playerSide == 2 && bloons[i].isAI == false) {
                bloons[i].bloonBoosted = 1.25
            } else if(bloons[i].playerSide == 2) {
                bloons[i].bloonBoosted = 1
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(p2BloonBoostExpires > Date.now() - 12000 && bloons[i].playerSide == 1 && bloons[i].isAI == false) {
                bloons[i].bloonBoosted = 1.25
            } else if(bloons[i].playerSide == 1) {
                bloons[i].bloonBoosted = 1
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType != "dartling") {
                towers[i].findTarget()
                if(towers[i].nextFire <= Date.now() && towers[i].target != -1 && towers[i].towerType != "farm") {
                    towers[i].attack()
                    towers[i].nextFire = Date.now() + towers[i].attackSpeed
                } else if(towers[i].nextFire <= Date.now() && towers[i].towerType == "farm") {
                    towers[i].attack()
                    towers[i].nextFire = Date.now() + towers[i].attackSpeed
                }
            } else {
                if(towers[i].nextFire <= Date.now()) {
                    towers[i].attack()
                    towers[i].nextFire = Date.now() + towers[i].attackSpeed
                }
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
                towers[i].cobraBoosted = 0.97 ** p1MonkeyStimCount
            }
            if(towers[i].playerSide == 2) {
                towers[i].cobraBoosted = 0.97 ** p2MonkeyStimCount
            }
        }

        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].playerSide == 1) {
                bloons[i].cobraBoosted = 1.02 ** p2BloonStimCount
            }
            if(bloons[i].playerSide == 2) {
                bloons[i].cobraBoosted = 1.02 ** p1BloonStimCount
            }
        }

        for(var i = 0; i < towers.length; i++) {
            if(towers[i].ecoStealCooldown <= Date.now() && towers[i].ecoStealCooldown != -1) {
                if(towers[i].playerSide == 1) {
                    p1eco += 5
                    if(p2eco >= 5) {
                        p2eco -= 5
                    } else {
                        p2eco = 0
                    }
                } else {
                    p2eco += 5
                    if(p1eco >= 5) {
                        p1eco -= 5
                    } else {
                        p1eco = 0
                    }
                }
                moneyText.push(new MiscText(towers[i].x, towers[i].y, 5, "eco"))
                towers[i].ecoStealCooldown += 30000
            }
            if(towers[i].attritionCooldown <= Date.now() && towers[i].attritionCooldown != -1) {
                if(towers[i].playerSide == 1) {
                    if(p1lives <= 148) {
                        p1lives += 2
                    } else {
                        p1lives = 150
                    }
                    if(p2lives > 2) {
                        p2lives -= 2
                    } else {
                        p2lives = 1
                    }
                } else {
                    if(p2lives <= 148) {
                        p2lives += 2
                    } else {
                        p2lives = 150
                    }
                    if(p1lives > 2) {
                        p1lives -= 2
                    } else {
                        p1lives = 1
                    }
                }
                moneyText.push(new MiscText(towers[i].x, towers[i].y, 2, "lives"))
                towers[i].attritionCooldown += 30000
            }
            if(towers[i].activeSyphonCooldown <= Date.now() && towers[i].activeSyphonCooldown != -1) {
                if(towers[i].playerSide == 1) {
                    if(p2money >= 25) {
                        p2money -= 25
                        p1money += 25
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, 25))
                    } else {
                        p1money = p2money
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, p2money))
                        p2money = 0
                    }
                } else {
                    if(p1money >= 25) {
                        p1money -= 25
                        p2money += 25
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, 25))
                    } else {
                        p2money = p1money
                        moneyText.push(new MoneyText(towers[i].x, towers[i].y, p1money))
                        p1money = 0
                    }
                }
                towers[i].activeSyphonCooldown += 1000
            }
        }

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
            }
        }

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
            projectiles[i].update()
            if(projectiles[i].image == "500dartproj.png") {
                if(projectiles[i].playerSide == 1) {
                    if(projectiles[i].x <= canvas.width/8 + projectiles[i].radius) {
                        projectiles[i].dx = Math.abs(projectiles[i].dx)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].x >= canvas.width/2 - projectiles[i].radius) {
                        projectiles[i].dx = -Math.abs(projectiles[i].dx)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].y <= 0 + projectiles[i].radius) {
                        projectiles[i].dy = Math.abs(projectiles[i].dy)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].y >= canvas.height - projectiles[i].radius) {
                        projectiles[i].dy = -Math.abs(projectiles[i].dy)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                } else {
                    if(projectiles[i].x <= canvas.width/2 + projectiles[i].radius) {
                        projectiles[i].dx = Math.abs(projectiles[i].dx)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].x >= 7*canvas.width/8 - projectiles[i].radius) {
                        projectiles[i].dx = -Math.abs(projectiles[i].dx)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].y <= 0 + projectiles[i].radius) {
                        projectiles[i].dy = Math.abs(projectiles[i].dy)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                    if(projectiles[i].y >= canvas.height - projectiles[i].radius) {
                        projectiles[i].dy = -Math.abs(projectiles[i].dy)
                        if(projectiles[i].bounceCount == 3) {
                            projectiles.splice(i, 1)
                            i--
                        } else {
                            projectiles[i].bounceCount++
                        }
                    }
                }
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            projectiles[i].draw()
        }
        for(var i = 0; i < bananas.length; i++) {
            if(Math.sqrt((bananas[i].x - cursor[0].x) ** 2 + (bananas[i].y - cursor[0].y) ** 2) <= 40 + bananas[i].radius && bananas[i].playerSide == 1) {
                p1money += bananas[i].cashGiven
                for(var l = 0; l < towers.length; l++) {
                    if(towers[l].towerID == bananas[i].parentID) {
                        towers[l].popCount += bananas[i].cashGiven
                    }
                }
                moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, bananas[i].cashGiven))
                bananas.splice(i, 1)
            }
            if(Math.sqrt((bananas[i].x - cursor[1].x) ** 2 + (bananas[i].y - cursor[1].y) ** 2) <= 40 + bananas[i].radius && bananas[i].playerSide == 2) {
                p2money += bananas[i].cashGiven
                for(var l = 0; l < towers.length; l++) {
                    if(towers[l].towerID == bananas[i].parentID) {
                        towers[l].popCount += bananas[i].cashGiven
                    }
                }
                moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, bananas[i].cashGiven))
                bananas.splice(i, 1)
            }
            var farmersInRange = 0
            for(var k = 0; k < towers.length; k++) {
                if(towers[k].towerType == "farmer" && Math.sqrt((towers[k].x - bananas[i].x) ** 2 + (towers[k].y - bananas[i].y) ** 2) <= towers[k].range && towers[k].playerSide == bananas[i].playerSide) {
                    farmersInRange ++
                }
            }
            for(var k = 0; k < towers.length; k++) {
                if(towers[k].towerType == "farmer" && Math.sqrt((towers[k].x - bananas[i].x) ** 2 + (towers[k].y - bananas[i].y) ** 2) <= towers[k].range && towers[k].playerSide == bananas[i].playerSide) {
                    if(bananas[i].playerSide == 1) {
                        p1money += bananas[i].cashGiven
                    } else {
                        p2money += bananas[i].cashGiven
                    }
                    towers[k].towerVar += bananas[i].cashGiven/farmersInRange
                    if(towers[k].towerVar > towers[k].farmerCap) {
                        towers[k].towerVar = towers[k].farmerCap
                    }
                    for(var l = 0; l < towers.length; l++) {
                        if(towers[l].towerID == bananas[i].parentID) {
                            towers[l].popCount += bananas[i].cashGiven
                        }
                    }
                }
            }
            for(var k = 0; k < towers.length; k++) {
                if(towers[k].towerType == "farmer" && Math.sqrt((towers[k].x - bananas[i].x) ** 2 + (towers[k].y - bananas[i].y) ** 2) <= towers[k].range) {
                    moneyText.push(new MoneyText(bananas[i].x, bananas[i].y, bananas[i].cashGiven))
                    bananas.splice(i, 1)
                }
            }
        }
        for(var i = 0; i < towers.length; i++) {
            towers[i].draw()
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
        for(var i = 0; i < bloons.length; i++) {
            bloons[i].update()
            if(bloons[i].pathPos >= 100) {
                if(bloons[i].playerSide == 1) {
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
                            p1lives -= 104
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
                            p2lives -= 104
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
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].lifespan == -1) {
                if(projectiles[i].playerSide == 1) {
                    if(projectiles[i].x < canvas.width/8 + projectiles[i].radius || projectiles[i].x > canvas.width / 2 - projectiles[i].radius || projectiles[i].y < 0 + projectiles[i].radius || projectiles[i].y > canvas.height - projectiles[i].radius) {
                        if(projectiles[i].image != "500dartproj.png") {
                            projectiles.splice(i, 1)
                            i--
                        }
                    }
                } else {
                    if(projectiles[i].x < canvas.width/2 + projectiles[i].radius || projectiles[i].x > 7 * canvas.width / 8 - projectiles[i].radius || projectiles[i].y < 0 + projectiles[i].radius || projectiles[i].y > canvas.height - projectiles[i].radius) {
                        if(projectiles[i].image != "500dartproj.png") {
                            projectiles.splice(i, 1)
                            i--
                        }
                    }
                }
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].lifespan != -1 && projectiles[i].lifespan <= Date.now()) {
                projectiles.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < projectiles.length; i++) {
            if(projectiles[i].image == "003wizardproj.png" && projectiles[i].lifespan == -1) {
                projectiles[i].lifespan = Date.now() + 500
            }
        }
        if(p1BloonQueue.length > 0) {
            if(p1BloonQueue[0].nextSend <= Date.now()) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, p1BloonQueue[0].health, 2, false, false))
                p1BloonQueue[0].nextSend += p1BloonQueue[0].spacing
                p1BloonQueue[0].count--
                if(p1BloonQueue[0].count <= 0) {
                    if(p1BloonQueue.length > 1) {
                        p1BloonQueue[1].nextSend = Date.now() + p1BloonQueue[1].spacing
                    }
                    p1BloonQueue.splice(0, 1)
                }
            }
        }
        if(p2BloonQueue.length > 0) {
            if(p2BloonQueue[0].nextSend <= Date.now()) {
                bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, p2BloonQueue[0].health, 1, false, false))
                p2BloonQueue[0].nextSend += p2BloonQueue[0].spacing
                p2BloonQueue[0].count--
                if(p2BloonQueue[0].count <= 0) {
                    if(p2BloonQueue.length > 1) {
                        p2BloonQueue[1].nextSend = Date.now() + p2BloonQueue[1].spacing
                    }
                    p2BloonQueue.splice(0, 1)
                }
            }
        }
        for(var k = 0; k < bloons.length; k++) {
            for(var i = 0; i < projectiles.length; i++) {
                if(bloons[k].collisionCheck(projectiles[i]) && bloons[k].playerSide == projectiles[i].playerSide) {
                    if(projectiles[i].image == "003farmerproj.png") {
                        if(projectiles[i].playerSide == 1) {
                            p1money += 1
                        } else {
                            p2money += 1
                        }
                    } else if(projectiles[i].image == "004farmerproj.png") {
                        if(projectiles[i].playerSide == 1) {
                            p1money += 2
                        } else {
                            p2money += 2
                        }
                    } else if(projectiles[i].image == "005farmerproj.png") {
                        if(projectiles[i].playerSide == 1) {
                            p1money += 4
                        } else {
                            p2money += 4
                        }
                    }
                    if(projectiles[i].image == "000bombproj.png" || projectiles[i].image == "300bombproj.png" || projectiles[i].image == "020bombproj.png" || projectiles[i].image == "030bombproj.png" || projectiles[i].image == "040bombproj.png" || projectiles[i].image == "050bombproj.png" || projectiles[i].image == "010wizardproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "explosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "003iceproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "003iceexplosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "103iceproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "103iceexplosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "005iceproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "005iceexplosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "105iceproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "105iceexplosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "040farmerproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "explosion.png"
                        projectiles[i].radius *= 2.5
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].image == "030dartlingproj.png" || projectiles[i].image == "050dartlingproj.png") {
                        projectiles[i].dx = 0
                        projectiles[i].dy = 0
                        projectiles[i].image = "050dartlingexplosion.png"
                        projectiles[i].radius *= 3
                        projectiles[i].lifespan = Date.now() + 500
                    }
                    if(projectiles[i].pierce > 0) {
                        if(projectiles[i].knockback > 0) {
                            if(round <= 50) {
                                if(bloons[k].health <= 18) {
                                    var kbChance = Math.floor(Math.random() * 101)
                                    if(kbChance <= projectiles[i].knockback) {
                                        bloons[k].pathPos -= 1.8
                                    }
                                }
                            } else {
                                if(bloons[k].health <= 68) {
                                    var kbChance = Math.floor(Math.random() * 101)
                                    if(kbChance <= projectiles[i].knockback) {
                                        bloons[k].pathPos -= 1.8 * 0.98 ** (round - 50)
                                    }
                                }
                            }
                        }
                        if(projectiles[i].moabKnockback > 0) {
                            if(round <= 50) {
                                if(bloons[k].health > 18 && bloons[k].isBoss == false) {
                                    var kbChance = Math.floor(Math.random() * 101)
                                    if(kbChance <= projectiles[i].knockback) {
                                        if(bloons[k].health > 18 && bloons[k].health <= 218) {
                                            bloons[k].pathPos -= 0.3
                                        } else if(bloons[k].health > 218 && bloons[k].health <= 918) {
                                            bloons[k].pathPos -= 0.09
                                        }
                                        else if(bloons[k].health > 918 && bloons[k].health <= 4918) {
                                            bloons[k].pathPos -= 0.06
                                        }
                                    }
                                }
                            } else {
                                if(bloons[k].health > 68 && bloons[k].isBoss == false) {
                                    var kbChance = Math.floor(Math.random() * 101)
                                    if(kbChance <= projectiles[i].knockback) {
                                        if(bloons[k].health > 68 && bloons[k].health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
                                            bloons[k].pathPos -= 0.3 * 0.98 ** (round - 50)
                                        } else if(bloons[k].health > 68 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[k].health <= 68 + Math.ceil(900 * (1.15 ** (round - 50)))) {
                                            bloons[k].pathPos -= 0.09 * 0.98 ** (round - 50)
                                        }
                                        else if(bloons[k].health > 68 + Math.ceil(200 * (1.05 ** (round - 50))) && bloons[k].health <= 68 + Math.ceil(4900 * (1.15 ** (round - 50)))) {
                                            bloons[k].pathPos -= 0.06 * 0.98 ** (round - 50)
                                        }
                                    }
                                }
                            }
                        }
                        if(round <= 50 && bloons[k].health <= 18) {
                            if(projectiles[i].image == "000iceproj.png" && bloons[k].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[k].iced > 0.8) {
                                bloons[k].iced = 0.8
                            }
                            if(projectiles[i].image == "100iceproj.png" && bloons[k].iced > 0.6 || projectiles[i].image == "103iceexplosion.png" && bloons[k].iced > 0.6) {
                                bloons[k].iced = 0.6
                            }
                        } else if(round > 50 && bloons[k].health <= 68){
                            if(projectiles[i].image == "000iceproj.png" && bloons[k].iced > 0.8 || projectiles[i].image == "003iceexplosion.png" && bloons[k].iced > 0.8) {
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
                        for(var l = 0; l < towers.length; l++) {
                            if(towers[l].towerID == projectiles[i].parentID) {
                                if(bloons[k].health < projectiles[i].damage) {
                                    towers[l].popCount += bloons[k].health
                                } else {
                                    towers[l].popCount += projectiles[i].damage
                                }
                            }
                        }
                        bloons[k].health -= projectiles[i].damage
                        if(bloons[k].health <= 0) {
                            bloons.splice(k, 1)
                            k--
                        }
                        projectiles[i].pierce--
                        if(projectiles[i].pierce <= 0 && projectiles[i].lifespan == -1) {
                            projectiles.splice(i, 1)
                            i--
                        }
                    }
                }

            }
        }
        for(var i = bloons.length - 1; i >= 0; i--) {
            bloons[i].draw()
        }
        for(var i = 0; i < bananas.length; i++) {
            if(bananas[i].lifespan <= Date.now()) {
                if(bananas[i].salvage) {
                    if(bananas[i].playerSide == 1) {
                        p1money += Math.round(0.7 * bananas[i].cashGiven)
                    } else {
                        p2money += Math.round(0.7 * bananas[i].cashGiven)
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
            moneyText[i].update()
            if(moneyText[i].frames >= 15) {
                moneyText.splice(i, 1)
                i--
            }
        }
        for(var i = 0; i < moneyText.length; i++) {
            moneyText[i].draw()
        }
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected) {
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
            }
        }
        drawUI()
        if(bossMode == true) {
            if(bossCount == 0) {
                ctx.fillStyle = "black"
                ctx.textAlign = "center"
                ctx.font = "40px Luckiest Guy"
                if(round <= 40) {
                    ctx.fillText("Next boss in: " + String(40 - round).toLocaleString(), canvas.width*3/8, 37.5, canvas.width*3/8)
                } else {
                    ctx.fillText("Next boss in: " + String(20 - round%20).toLocaleString(), canvas.width*3/8, 37.5, canvas.width*3/8)
                }
            }
        }
        for(var i = 0; i < bloons.length; i++) {
            if(bloons[i].isBoss) {
                ctx.fillStyle = "red"
                ctx.fillRect(canvas.width*3/16, 2.5, canvas.width*3/8 * (bloons[i].health/bloons[i].maxHealth), 50)
                ctx.strokeStyle = "darkred"
                ctx.lineWidth = 5
                ctx.strokeRect(canvas.width*3/16, 2.5, canvas.width*3/8, 50)
                ctx.fillStyle = "black"
                ctx.textAlign = "center"
                ctx.font = "40px Luckiest Guy"
                ctx.fillText(bloons[i].health.toLocaleString() + " / " + bloons[i].maxHealth.toLocaleString() + " - " + (Math.ceil(100*bloons[i].health/bloons[i].maxHealth)) + "%", canvas.width*3/8, 37.5, canvas.width*3/8)
                ctx.font = "25px Luckiest Guy"
                ctx.fillText("Tier " + String(Math.floor(round/20) - 1).toLocaleString(), canvas.width*3/8, 75, canvas.width*3/8)
            }
        }
        for(var i = 0; i < cursor.length; i++) {
            cursor[i].draw()
        }
        if(p1lives <= 0 || p2lives <= 0) {
            gameOver = true
        }
    } else {
        ctx.fillStyle = "darkblue"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "black"
        ctx.font = "40px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.font = "100px Luckiest Guy"
        if(p1lives > 0 && p2lives <= 0) {
            ctx.fillText("Left Side Wins!", canvas.width/2, canvas.height/4, canvas.width)
        } else if(p1lives <= 0 && p2lives > 0) {
            ctx.fillText("Right Side Wins!", canvas.width/2, canvas.height/4, canvas.width)
        } else {
            ctx.fillText("Tie!", canvas.width/2, canvas.height/4, canvas.width)
        }
        ctx.fillText("Refresh to rematch!", canvas.width/2, canvas.height*3/4, canvas.width)
    }
    ctx.fillStyle = "black"
    ctx.font = "20px Luckiest Guy"
    ctx.textAlign = "right"
    ctx.fillText(versionText, canvas.width, canvas.height*47/48, canvas.width/4)
}
animate()

addEventListener("mousemove", function(event) {
    mouseX = event.x
    mouseY = event.y
})

addEventListener("keydown", function(event) {
    /*if(event.key == "a") {
        round = Number(this.prompt("round?"))
        if(round == NaN || round < 0 || round % 1 != 0) {
            round = 0
        }
    }*/
    /*if(event.key == "\\") {
        money += 20000//Infinity
        round = 62
        //debug = true
    }
    if(event.key == "l") {
        this.alert(bloonsToSpawn + " " + bloons.length)
    }
    if(event.key == "a") {
        bloons.push(new Bloon(-25, 0, 25, 0, 1, 1, 1, 6))
    }*/
})

var map = {}; // You could also use an array
onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';
    if(map[87]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 1 && cursor[i].y > 0) {
                cursor[i].y -= 10
                if(cursor[i].y <= 0) {
                    cursor[i].y = 0
                }
            }
        }
    }
    if(map[65]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 1 && cursor[i].x > canvas.width/8) {
                cursor[i].x -= 10
                if(cursor[i].x <= canvas.width/8) {
                    cursor[i].x = canvas.width/8
                }
            }
        }
    }
    if(map[83]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 1 && cursor[i].y < canvas.height) {
                cursor[i].y += 10
                if(cursor[i].y >= canvas.height) {
                    cursor[i].y = canvas.height
                }
            }
        }
    }
    if(map[68]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 1 && cursor[i].x < canvas.width/2) {
                cursor[i].x += 10
                if(cursor[i].x >= canvas.width/2) {
                    cursor[i].x = canvas.width/2
                }
            }
        }
    }
    if(map[73]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 2 && cursor[i].y > 0) {
                cursor[i].y -= 10
                if(cursor[i].y <= 0) {
                    cursor[i].y = 0
                }
            }
        }
    }
    if(map[74]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 2 && cursor[i].x > canvas.width/2) {
                cursor[i].x -= 10
                if(cursor[i].x <= canvas.width/2) {
                    cursor[i].x = canvas.width/2
                }
            }
        }
    }
    if(map[75]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 2 && cursor[i].y < canvas.height) {
                cursor[i].y += 10
                if(cursor[i].y >= canvas.height) {
                    cursor[i].y = canvas.height
                }
            }
        }
    }
    if(map[76]) {
        for(var i = 0; i < cursor.length; i++) {
            if(cursor[i].playerSide == 2 && cursor[i].x < 7*canvas.width/8) {
                cursor[i].x += 10
                if(cursor[i].x >= 7*canvas.width/8) {
                    cursor[i].x = 7*canvas.width/8
                }
            }
        }
    }
    if(map[90]) {
        var p1SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 1 && towers[i].clicked(cursor[0].x, cursor[0].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path1Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p1SelectedTower = true
                if(towers[i].path2Upgrades > 2 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades > 2 && towers[i].path2Upgrades == 0) {
                    if(towers[i].path1Upgrades < 2 && p1money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p1money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    }
                } else if(towers[i].path2Upgrades < 3 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades < 3 && towers[i].path2Upgrades == 0) {
                    if(towers[i].path1Upgrades < 4 && p1money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p1money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    } else if(towers[i].path1Upgrades < 5 && otherTier5 == false && p1money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p1money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    }
                }
            }
        }
        if(p1Towers[0] == "000dart.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 300) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 125, "dart", 1))
                p1money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p1Towers[0] == "000tack.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 100, "tack", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p1Towers[0] == "000bomb.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "bomb", 1))
                p1money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p1Towers[0] == "000ice.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 70, "ice", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[0] == "000super.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 2000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 200, "super", 1))
                p1money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p1Towers[0] == "000farm.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 45 || cursor[0].x < canvas.width / 8 + 45 || cursor[0].y > canvas.height - 45 || cursor[0].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 45, 200, "farm", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[0] == "000farmer.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 100) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 250, "farmer", 1))
                p1money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p1Towers[0] == "000dartling.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 850) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 50, "dartling", 1))
                p1money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p1Towers[0] == "000wizard.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 600) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "wizard", 1))
                p1money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p1Towers[0] == "000cobra.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 175, "cobra", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[88]) {
        var p1SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 1 && towers[i].clicked(cursor[0].x, cursor[0].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path2Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p1SelectedTower = true
                if(towers[i].path1Upgrades > 2 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades > 2 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path2Upgrades < 2 && p1money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p1money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    }
                } else if(towers[i].path1Upgrades < 3 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades < 3 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path2Upgrades < 4 && p1money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p1money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    } else if(towers[i].path2Upgrades < 5 && otherTier5 == false && p1money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p1money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    }
                }
            }
        }
        if(p1Towers[1] == "000dart.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 300) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 125, "dart", 1))
                p1money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p1Towers[1] == "000tack.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 100, "tack", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p1Towers[1] == "000bomb.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "bomb", 1))
                p1money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p1Towers[1] == "000ice.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 70, "ice", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[1] == "000super.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 2000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 200, "super", 1))
                p1money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p1Towers[1] == "000farm.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 45 || cursor[0].x < canvas.width / 8 + 45 || cursor[0].y > canvas.height - 45 || cursor[0].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 45, 200, "farm", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[1] == "000farmer.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 100) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 250, "farmer", 1))
                p1money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p1Towers[1] == "000dartling.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 850) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 50, "dartling", 1))
                p1money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p1Towers[1] == "000wizard.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 600) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "wizard", 1))
                p1money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p1Towers[1] == "000cobra.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 175, "cobra", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[67]) {
        var p1SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide && towers[i].clicked(cursor[0].x, cursor[0].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path3Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p1SelectedTower = true
                if(towers[i].path1Upgrades > 2 && towers[i].path2Upgrades == 0 || towers[i].path2Upgrades > 2 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path3Upgrades < 2 && p1money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p1money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    }
                } else if(towers[i].path1Upgrades < 3 && towers[i].path2Upgrades == 0 || towers[i].path2Upgrades < 3 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path3Upgrades < 4 && p1money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p1money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    } else if(towers[i].path3Upgrades < 5 && otherTier5 == false && p1money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p1money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    }
                }
            }
        }
        if(p1Towers[2] == "000dart.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 300) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 125, "dart", 1))
                p1money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p1Towers[2] == "000tack.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 100, "tack", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p1Towers[2] == "000bomb.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "bomb", 1))
                p1money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p1Towers[2] == "000ice.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 70, "ice", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[2] == "000super.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 2000) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 200, "super", 1))
                p1money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p1Towers[2] == "000farm.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 45 || cursor[0].x < canvas.width / 8 + 45 || cursor[0].y > canvas.height - 45 || cursor[0].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 1250) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 45, 200, "farm", 1))
                p1money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p1Towers[2] == "000farmer.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 100) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 250, "farmer", 1))
                p1money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p1Towers[2] == "000dartling.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 850) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 50, "dartling", 1))
                p1money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p1Towers[2] == "000wizard.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 600) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 150, "wizard", 1))
                p1money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p1Towers[2] == "000cobra.png" && p1SelectedTower == false) {
            var placeable = true
            if(cursor[0].x > canvas.width / 2 - 30 || cursor[0].x < canvas.width / 8 + 30 || cursor[0].y > canvas.height - 30 || cursor[0].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[0].x, cursor[0].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p1money >= 400) {
                towers.push(new Tower(cursor[0].x, cursor[0].y, 30, 175, "cobra", 1))
                p1money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[77]) {
        var p2SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 2 && towers[i].clicked(cursor[1].x, cursor[1].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path1Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p2SelectedTower = true
                if(towers[i].path2Upgrades > 2 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades > 2 && towers[i].path2Upgrades == 0) {
                    if(towers[i].path1Upgrades < 2 && p2money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p2money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    }
                } else if(towers[i].path2Upgrades < 3 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades < 3 && towers[i].path2Upgrades == 0) {
                    if(towers[i].path1Upgrades < 4 && p2money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p2money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    } else if(towers[i].path1Upgrades < 5 && otherTier5 == false && p2money >= towers[i].path1Cost[towers[i].path1Upgrades]) {
                        p2money -= towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].totalCost += towers[i].path1Cost[towers[i].path1Upgrades]
                        towers[i].path1Upgrades++
                        if(towers[i].path1Upgrades == 3) {
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path2Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path1Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "tack" && towers[i].path1Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "super" && towers[i].path1Upgrades >= 4) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path1Upgrades == 3) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 1) {
                            towers[i].farmerCap += 200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 2) {
                            towers[i].farmerCap += 400
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 3) {
                            towers[i].farmerCap += 1200
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 4) {
                            towers[i].farmerCap += 3000
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path1Upgrades == 5) {
                            towers[i].farmerCap += 5000
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path1Upgrades >= 3) {
                            towers[i].range += 35
                        }
                    }
                }
            }
        }
        if(p2Towers[0] == "000dart.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 300) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 125, "dart", 2))
                p2money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p2Towers[0] == "000tack.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 100, "tack", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p2Towers[0] == "000bomb.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "bomb", 2))
                p2money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p2Towers[0] == "000ice.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 70, "ice", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[0] == "000super.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 2000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 200, "super", 2))
                p2money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p2Towers[0] == "000farm.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 45 || cursor[1].x < canvas.width / 2 + 45 || cursor[1].y > canvas.height - 45 || cursor[1].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 45, 200, "farm", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[0] == "000farmer.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 100) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 250, "farmer", 2))
                p2money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p2Towers[0] == "000dartling.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 850) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 50, "dartling", 2))
                p2money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p2Towers[0] == "000wizard.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 600) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "wizard", 2))
                p2money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p2Towers[0] == "000cobra.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }[88]
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 175, "cobra", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[188]) {
        var p2SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].clicked(cursor[1].x, cursor[1].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path2Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p2SelectedTower = true
                if(towers[i].path1Upgrades > 2 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades > 2 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path2Upgrades < 2 && p2money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p2money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    }
                } else if(towers[i].path1Upgrades < 3 && towers[i].path3Upgrades == 0 || towers[i].path3Upgrades < 3 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path2Upgrades < 4 && p2money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p2money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    } else if(towers[i].path2Upgrades < 5 && otherTier5 == false && p2money >= towers[i].path2Cost[towers[i].path2Upgrades]) {
                        p2money -= towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].totalCost += towers[i].path2Cost[towers[i].path2Upgrades]
                        towers[i].path2Upgrades++
                        if(towers[i].path2Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path3Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path3Name[2] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path3Cost[0] = "Max"
                            towers[i].path3Name[0] = "Upgrades"
                        }
                        if(towers[i].path2Upgrades > 0 && towers[i].path3Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "tack" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "super" && towers[i].path2Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path2Upgrades == 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path2Upgrades >= 3 && towers[i].path2Upgrades <= 5) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "dart" && towers[i].path2Upgrades == 4) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 2) {
                            towers[i].ecoStealCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 3) {
                            towers[i].attritionCooldown = Date.now() + 30000
                        }
                        if(towers[i].towerType == "cobra" && towers[i].path2Upgrades == 4) {
                            towers[i].activeSyphonCooldown = Date.now() + 1000
                        }
                    }
                }
            }
        }
        if(p2Towers[1] == "000dart.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 300) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 125, "dart", 2))
                p2money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p2Towers[1] == "000tack.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 100, "tack", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p2Towers[1] == "000bomb.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "bomb", 2))
                p2money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p2Towers[1] == "000ice.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 70, "ice", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[1] == "000super.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 2000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 200, "super", 2))
                p2money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p2Towers[1] == "000farm.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 45 || cursor[1].x < canvas.width / 2 + 45 || cursor[1].y > canvas.height - 45 || cursor[1].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 45, 200, "farm", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[1] == "000farmer.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 100) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 250, "farmer", 2))
                p2money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p2Towers[1] == "000dartling.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 850) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 50, "dartling", 2))
                p2money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p2Towers[1] == "000wizard.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 600) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "wizard", 2))
                p2money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p2Towers[1] == "000cobra.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 175, "cobra", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[190]) {
        var p2SelectedTower = false
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 2 && towers[i].clicked(cursor[1].x, cursor[1].y)) {
                var otherTier5 = false
                for(var j = 0; j < towers.length; j++) {
                    if(towers[j].selected == false && towers[j].path3Upgrades == 5 && towers[j].towerType == towers[i].towerType) {
                        otherTier5 = true
                    }
                }
                p2SelectedTower = true
                if(towers[i].path1Upgrades > 2 && towers[i].path2Upgrades == 0 || towers[i].path2Upgrades > 2 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path3Upgrades < 2 && p2money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p2money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    }
                } else if(towers[i].path1Upgrades < 3 && towers[i].path2Upgrades == 0 || towers[i].path2Upgrades < 3 && towers[i].path1Upgrades == 0) {
                    if(towers[i].path3Upgrades < 4 && p2money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p2money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 30
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    } else if(towers[i].path3Upgrades < 5 && otherTier5 == false && p2money >= towers[i].path3Cost[towers[i].path3Upgrades]) {
                        p2money -= towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].totalCost += towers[i].path3Cost[towers[i].path3Upgrades]
                        towers[i].path3Upgrades++
                        if(towers[i].path3Upgrades == 3) {
                            towers[i].path1Cost[2] = "Max"
                            towers[i].path2Cost[2] = "Max"
                            towers[i].path1Name[2] = "Upgrades"
                            towers[i].path2Name[2] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path1Upgrades > 0) {
                            towers[i].path2Cost[0] = "Max"
                            towers[i].path2Name[0] = "Upgrades"
                        }
                        if(towers[i].path3Upgrades > 0 && towers[i].path2Upgrades > 0) {
                            towers[i].path1Cost[0] = "Max"
                            towers[i].path1Name[0] = "Upgrades"
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades <= 3) {
                            towers[i].range += 35
                        }
                        if(towers[i].towerType == "dart" && towers[i].path3Upgrades == 5) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "bomb" && towers[i].path3Upgrades == 1) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 20
                        }
                        if(towers[i].towerType == "ice" && towers[i].path3Upgrades == 3) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "farmer" && towers[i].path3Upgrades <= 2) {
                            towers[i].range += 50
                        }
                        if(towers[i].towerType == "wizard" && towers[i].path3Upgrades == 2) {
                            towers[i].range += 50
                        }
                    }
                }
            }
        }
        if(p2Towers[2] == "000dart.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 300) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 125, "dart", 2))
                p2money -= 300
                towers[towers.length - 1].totalCost += 300
            }
        } else if(p2Towers[2] == "000tack.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 100, "tack", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        } else if(p2Towers[2] == "000bomb.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "bomb", 2))
                p2money -= 1000
                towers[towers.length - 1].totalCost += 1000
            }
        } else if(p2Towers[2] == "000ice.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 70, "ice", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[2] == "000super.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 2000) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 200, "super", 2))
                p2money -= 2000
                towers[towers.length - 1].totalCost += 2000
            }
        } else if(p2Towers[2] == "000farm.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 45 || cursor[1].x < canvas.width / 2 + 45 || cursor[1].y > canvas.height - 45 || cursor[1].y < 45) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 45)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 1250) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 45, 200, "farm", 2))
                p2money -= 1250
                towers[towers.length - 1].totalCost += 1250
            }
        } else if(p2Towers[2] == "000farmer.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 100) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 250, "farmer", 2))
                p2money -= 100
                towers[towers.length - 1].totalCost += 100
            }
        } else if(p2Towers[2] == "000dartling.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 850) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 50, "dartling", 2))
                p2money -= 850
                towers[towers.length - 1].totalCost += 850
            }
        } else if(p2Towers[2] == "000wizard.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 600) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 150, "wizard", 2))
                p2money -= 600
                towers[towers.length - 1].totalCost += 600
            }
        } else if(p2Towers[2] == "000cobra.png" && p2SelectedTower == false) {
            var placeable = true
            if(cursor[1].x > 7 * canvas.width / 8 - 30 || cursor[1].x < canvas.width / 2 + 30 || cursor[1].y > canvas.height - 30 || cursor[1].y < 30) {
                placeable = false
            }
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].towerPlacementCheck(cursor[1].x, cursor[1].y, 30)) {
                    placeable = false
                }
            }
            if(placeable && p2money >= 400) {
                towers.push(new Tower(cursor[1].x, cursor[1].y, 30, 175, "cobra", 2))
                p2money -= 400
                towers[towers.length - 1].totalCost += 400
            }
        }
    }
    if(map[81]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 1) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0) {
                    p1money += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                }
                if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                    if(towers[i].playerSide == 1) {
                        p1money += Math.round(0.8 * towers[i].totalCost)
                    }
                } else {
                    p1money += Math.round(0.7 * towers[i].totalCost)
                }
                towers[i].selected = false
                towers.splice(i, 1)
            }
        }
    }
    if(map[79]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 2) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0) {
                    p2money += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                }
                if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                    if(towers[i].playerSide == 1) {
                        p2money += Math.round(0.8 * towers[i].totalCost)
                    }
                } else {
                    p2money += Math.round(0.7 * towers[i].totalCost)
                }
                towers[i].selected = false
                towers.splice(i, 1)
            }
        }
    }
    if(map[49]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 1) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 1) {
                    p1money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2 && towers[i].playerSide == 1) {
                    p2money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar) && towers[i].playerSide == 1)
                    towers[i].towerVar = 0
                } else if(towers[i].towerType != "farm" && towers[i].towerType != "dartling" && towers[i].playerSide == 1) {
                    towers[i].targetPrio--
                    if(towers[i].targetPrio == -1) {
                        towers[i].targetPrio = 3
                    }
                } else if(towers[i].towerType == "dartling" && towers[i].playerSide == 1) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio > 1) {
                        towers[i].targetPrio = 0
                    }
                }
            }
        }
    }
    if(map[50]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 1) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 1) {
                    p1money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2 && towers[i].playerSide == 1) {
                    p2money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar) && towers[i].playerSide == 1)
                    towers[i].towerVar = 0
                } else if(towers[i].towerType != "farm" && towers[i].towerType != "dartling" && towers[i].playerSide == 1) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio == 4) {
                        towers[i].targetPrio = 0
                    }
                } else if(towers[i].towerType == "dartling" && towers[i].playerSide == 1) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio > 1) {
                        towers[i].targetPrio = 0
                    }
                }
            }
        }
    }
    if(map[56]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 2) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2) {
                    p1money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2 && towers[i].playerSide == 2) {
                    p2money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar) && towers[i].playerSide == 2)
                    towers[i].towerVar = 0
                } else if(towers[i].towerType != "farm" && towers[i].towerType != "dartling" && towers[i].playerSide == 2) {
                    towers[i].targetPrio--
                    if(towers[i].targetPrio == -1) {
                        towers[i].targetPrio = 3
                    }
                } else if(towers[i].towerType == "dartling" && towers[i].playerSide == 2) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio > 1) {
                        towers[i].targetPrio = 0
                    }
                }
            }
        }
    }
    if(map[57]) {
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].selected && towers[i].playerSide == 2) {
                if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2) {
                    p1money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar))
                    towers[i].towerVar = 0
                } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades >= 3 && towers[i].selected && towers[i].towerVar > 0 && towers[i].playerSide == 2 && towers[i].playerSide == 2) {
                    p2money += towers[i].towerVar
                    towers[i].popCount += towers[i].towerVar
                    moneyText.push(new MoneyText(towers[i].x, towers[i].y, towers[i].towerVar) && towers[i].playerSide == 2)
                    towers[i].towerVar = 0
                } else if(towers[i].towerType != "farm" && towers[i].towerType != "dartling" && towers[i].playerSide == 2) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio == 4) {
                        towers[i].targetPrio = 0
                    }
                } else if(towers[i].towerType == "dartling" && towers[i].playerSide == 2) {
                    towers[i].targetPrio++
                    if(towers[i].targetPrio > 1) {
                        towers[i].targetPrio = 0
                    }
                }
            }
        }
    }
    if(map[51]) {
        if(p1TowerBoostCount > 0 && p1TowerBoostExpires + 40000 <= Date.now()) {
            p1TowerBoostExpires = Date.now()
            p1TowerBoostCount--
        }
    }
    if(map[52]) {
        if(p1BloonBoostCount > 0 && p1BloonBoostExpires + 40000 <= Date.now()) {
            p1BloonBoostExpires = Date.now()
            p1BloonBoostCount--
        }
    }
    if(map[54]) {
        if(p2TowerBoostCount > 0 && p2TowerBoostExpires + 40000 <= Date.now()) {
            p2TowerBoostExpires = Date.now()
            p2TowerBoostCount--
        }
    }
    if(map[55]) {
        if(p2BloonBoostCount > 0 && p2BloonBoostExpires + 40000 <= Date.now()) {
            p2BloonBoostExpires = Date.now()
            p2BloonBoostCount--
        }
    }
    if(map[69]) {
        if(gameStarted == false) {
            for(var i = 0; i < UITowers.length; i++) {
                if(UITowers[i].clicked(cursor[0].x, cursor[0].y) && p1Towers.length < 3) {
                    p1Towers.push(UITowers[i].image)
                    UITowers.splice(i, 1)
                }
            }
        } else {
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].clicked(cursor[0].x, cursor[0].y) && towers[i].playerSide == 1) {
                    towers[i].selected = true
                } else if(towers[i].playerSide == 1) {
                    towers[i].selected = false
                }
            }
        }
    }
    if(map[85]) {
        if(gameStarted == false ) {
            for(var i = 0; i < UITowers.length; i++) {
                if(UITowers[i].clicked(cursor[1].x, cursor[1].y) && p2Towers.length < 3) {
                    p2Towers.push(UITowers[i].image)
                    UITowers.splice(i, 1)
                }
            }
        } else {
            for(var i = 0; i < towers.length; i++) {
                if(towers[i].clicked(cursor[1].x, cursor[1].y) && towers[i].playerSide == 2) {
                    towers[i].selected = true
                } else if(towers[i].playerSide == 2) {
                    towers[i].selected = false
                }
            }
        }
    }
    if(map[82]) {
        p1SelectedBloon++
        if(p1SelectedBloon > 9) {
            p1SelectedBloon = 0
        }
    }
    if(map[86]) {
        p1SelectedBloon--
        if(p1SelectedBloon < 0) {
            p1SelectedBloon = 9
        }
    }
    if(map[89]) {
        p2SelectedBloon++
        if(p2SelectedBloon > 19) {
            p2SelectedBloon = 10
        }
    }
    if(map[78]) {
        p2SelectedBloon--
        if(p2SelectedBloon < 10) {
            p2SelectedBloon = 19
        }
    }
    if(map[70] && p1BloonQueue.length < 6 && displayBloons[p1SelectedBloon].image != "locked.png" && p1money >= displayBloons[p1SelectedBloon].cost) {
        p1BloonQueue.push(new SentBloonQueue(displayBloons[p1SelectedBloon].health, displayBloons[p1SelectedBloon].cost, displayBloons[p1SelectedBloon].eco, displayBloons[p1SelectedBloon].spacing, displayBloons[p1SelectedBloon].count))
        p1money -= displayBloons[p1SelectedBloon].cost
        p1eco += displayBloons[p1SelectedBloon].eco
        if(p1eco < 0) {
            p1eco = 0
        }
    }
    if(map[72] && p2BloonQueue.length < 6 && displayBloons[p2SelectedBloon].image != "locked.png" && p2money >= displayBloons[p2SelectedBloon].cost) {
        p2BloonQueue.push(new SentBloonQueue(displayBloons[p2SelectedBloon].health, displayBloons[p2SelectedBloon].cost, displayBloons[p2SelectedBloon].eco, displayBloons[p2SelectedBloon].spacing, displayBloons[p2SelectedBloon].count))
        p2money -= displayBloons[p2SelectedBloon].cost
        p2eco += displayBloons[p2SelectedBloon].eco
        if(p2eco < 0) {
            p2eco = 0
        }
    }
}
