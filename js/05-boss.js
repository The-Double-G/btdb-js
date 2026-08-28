// Boss entity
class Boss {
    constructor(x, y, radius, pathPos, iced, glued, stunned, health, playerSide, isAI, unadjustable, dpsDamage, dpsType, dpsTicks, dpsLastTick, dpsTickRate, dpsTowerID) {
        this.bloonID = nextBloonID++
        this.x = x
        this.y = y
        this.previousX = x
        this.previousY = y
        this.radius = 2.5 * radius
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
        this.isBoss = true
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
        this.checkpoint80reached = false
        this.checkpoint60reached = false
        this.checkpoint40reached = false
        this.checkpoint20reached = false
        this.speed = 0.0021
        this.image = "boss5.png"
        if(mapNumber == 0) {
            this.mapFactor = 1.5
        } else if(mapNumber == 1) {
            this.mapFactor = 1
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
        if(this.dpsTicks > 0) {
            drawCenteredAsset("onfiremoab.png", this.x, this.y, this.radius)
        }
        if(debug) {
            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText(this.health, this.x, this.y, 2 * this.radius)
            ctx.fillText(this.health, this.x, this.y, 2 * this.radius)
        }
    }


    update() {
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        this.previousX = this.x
        this.previousY = this.y
        if(this.stunned <= gameNow()) {
            if(mapNumber == 0) {
                this.pathPos += 3 * this.speed * simStepMultiplier
            } else if(mapNumber == 1) {
                this.pathPos += 2 * this.speed * simStepMultiplier
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
        if(this.health >= 0.8 * this.maxHealth) {
            this.speed = 0.0021
            this.image = "boss5.png"
            this.radius = 2.5 * this.drawRad
        } else if(this.health >= 0.6 * this.maxHealth) {
            this.speed = 0.0021
            this.image = "boss4.png"
            this.radius = 2.5 * this.drawRad
            if(this.checkpoint80reached == false) {
                this.checkpoint80reached = true
                if(round >= 40 && round <= 50) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 18, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round > 50 && round < 60) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 60 && round < 80) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 80 && round < 100) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 100 && round < 120) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 120) {
                    for(var i = 0; i < 50; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor/5 * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                }
            }
        } else if(this.health >= 0.4 * this.maxHealth) {
            this.speed = 0.0021
            this.image = "boss3.png"
            this.radius = 2.5 * this.drawRad
            if(this.checkpoint60reached == false) {
                this.checkpoint60reached = true
                if(round >= 40 && round <= 50) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 18, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round > 50 && round < 60) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 60 && round < 80) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 80 && round < 100) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 100 && round < 120) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 120) {
                    for(var i = 0; i < 50; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor/5 * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                }
            }
        } else if(this.health >= 0.2 * this.maxHealth) {
            this.speed = 0.0021
            this.image = "boss2.png"
            this.radius = 2.5 * this.drawRad
            if(this.checkpoint40reached == false) {
                this.checkpoint40reached = true
                if(round >= 40 && round <= 50) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 18, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round > 50 && round < 60) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 60 && round < 80) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 80 && round < 100) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 100 && round < 120) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 120) {
                    for(var i = 0; i < 50; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor/5 * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                }
            }
        } else if(this.health >= 0 * this.maxHealth) {
            this.speed = 0.0021
            this.image = "boss1.png"
            this.radius = 2.5 * this.drawRad
            if(this.checkpoint20reached == false) {
                this.checkpoint20reached = true
                if(round >= 40 && round <= 50) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 18, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round > 50 && round < 60) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 60 && round < 80) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(200 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 80 && round < 100) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 100 && round < 120) {
                    for(var i = 0; i < 10; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                } else if(round >= 120) {
                    for(var i = 0; i < 50; i++) {
                        bloons.push(new Bloon(-1000, 0, 25, this.pathPos - (this.mapFactor/5 * (i + 1)), 1, 1, 1, Math.ceil(4900 * (1.05 ** (round - 50))) + 68, this.playerSide, this.isAI, true, 0, 0, 0, 0, 0, 0))
                    }
                }
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
