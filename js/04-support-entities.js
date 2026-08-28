// Projectiles, UI helpers, subtowers, and support entities
class Projectile {
    constructor(x, y, dx, dy, radius, image, damage, pierce, knockback, moabKnockback, parentID, playerSide, canRicochet, target, dpsDamage, dpsType, dpsTicks, dpsLastTick, dpsTickRate) {
        this.x = x
        this.y = y
        this.previousX = x
        this.previousY = y
        this.dx = dx
        this.dy = dy
        this.radius = radius
        this.image = image
        this.sourceImage = image
        this.damage = damage
        this.pierce = pierce
        this.knockback = knockback
        this.moabKnockback = moabKnockback
        this.parentID = parentID
        this.playerSide = playerSide
        this.canRicochet = canRicochet
        this.boomerProgress = 0
        this.pathPos = -1000
        this.popAdjustBoosted = 0
        this.damageAdjustBoosted = 0
        this.popAdjustChecked = false
        this.damageAdjustChecked = false
        this.trapCapacity = 0
        this.bounceCount = 0
        this.lifespan = -1
        this.target = target
        this.targetHit = false
        this.hitBloons = new Set()
        this.spawnedFrags = false
        this.maxPierce = pierce
        this.dpsDamage = dpsDamage
        this.dpsType = dpsType
        this.dpsTicks = dpsTicks
        this.dpsLastTick = dpsLastTick
        this.dpsTickRate = dpsTickRate
        this.rotationAngle = 0
        if(this.image == "000iceproj.png" || this.image == "100iceproj.png" || this.image == "400tackproj.png" || this.image == "500boomerproj2.png" || this.image == "502boomerproj2.png" || this.image == "explosion.png" || this.image == "555tackproj1.png" || this.image == "000swordproj.png") {
            this.lifespan = gameNow() + 500
        }
    }


    draw() {
        if(this.image != "") {
            drawRotatedCenteredAsset(this.image, this.x, this.y, this.radius, this.rotationAngle)
        }
    }

    update() {
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        this.previousX = this.x
        this.previousY = this.y
        if(this.image != "000boomerproj.png" && this.image != "002boomerproj.png" && this.image != "200boomerproj.png" && this.image != "202boomerproj.png"  && this.image != "500boomerproj.png" && this.image != "502boomerproj.png" && this.image != "050boomerproj.png" && this.image != "052boomerproj.png" && this.image != "250boomerproj.png" && this.image != "004wizardproj.png" && this.image != "001ninjaproj.png" && this.image != "201ninjaproj.png" && this.image != "041ninjaproj.png" && this.image != "051ninjaproj.png" && this.image != "040swordproj.png" && this.image != "050swordproj.png" && this.image != "042swordproj.png" && this.image != "052swordproj.png") {
            this.x += this.dx * simStepMultiplier
            this.y += this.dy * simStepMultiplier
        } else if(this.image == "004wizardproj.png" && this.pathPos == -1000 || this.image == "001ninjaproj.png" && this.pathPos == -1000 || this.image == "201ninjaproj.png" && this.pathPos == -1000 || this.image == "041ninjaproj.png" && this.pathPos == -1000 || this.image == "051ninjaproj.png" && this.pathPos == -1000) {
            this.x += this.dx * simStepMultiplier
            this.y += this.dy * simStepMultiplier
        } else if(this.pathPos != -1000 && this.playerSide == 1 && mapNumber == 0) {
            this.pathPos -= 0.45 * simStepMultiplier
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
        } else if(this.pathPos != -1000 && this.playerSide == 2 && mapNumber == 0) {
            this.pathPos -= 0.45 * simStepMultiplier
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
        } else if(this.pathPos != -1000 && this.playerSide == 1 && mapNumber == 1) {
            this.pathPos -= 0.3 * simStepMultiplier
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
        } else if(this.pathPos != -1000 && this.playerSide == 2 && mapNumber == 1) {
            this.pathPos -= 0.3 * simStepMultiplier
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
        } else if(this.image == "000boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "002boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "200boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "202boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000  || this.image == "500boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "502boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "050boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "052boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "250boomerproj.png" && this.boomerProgress < 25 && this.pathPos == -1000 || this.image == "040swordproj.png" && this.boomerProgress < 25 || this.image == "050swordproj.png" && this.boomerProgress < 25 || this.image == "042swordproj.png" && this.boomerProgress < 25 || this.image == "052swordproj.png" && this.boomerProgress < 25) {
            this.x += this.dx * simStepMultiplier
            this.y += this.dy * simStepMultiplier
            this.boomerProgress += simStepMultiplier
        } else if(this.image == "000boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "002boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "200boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "202boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000  || this.image == "500boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "502boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "050boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "052boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "250boomerproj.png" && this.boomerProgress >= 25 && this.pathPos == -1000 || this.image == "040swordproj.png" && this.boomerProgress >= 25 || this.image == "050swordproj.png" && this.boomerProgress >= 25 || this.image == "042swordproj.png" && this.boomerProgress >= 25 || this.image == "052swordproj.png" && this.boomerProgress >= 25) {
            this.x -= this.dx * simStepMultiplier
            this.y -= this.dy * simStepMultiplier
            this.boomerProgress += simStepMultiplier
        }
        if(this.image == "004wizardproj.png" || this.image == "500boomerproj2.png" || this.image == "502boomerproj2.png") {
            return
        } else if(this.image == "000boomerproj.png" || this.image == "002boomerproj.png" || this.image == "200boomerproj.png" || this.image == "202boomerproj.png"  || this.image == "500boomerproj.png" || this.image == "502boomerproj.png" || this.image == "050boomerproj.png" || this.image == "052boomerproj.png" || this.image == "250boomerproj.png") {
            this.rotationAngle += Math.PI/6 * simStepMultiplier
        } else if(this.image == "002swordproj.png" || this.image == "040swordproj.png" || this.image == "042swordproj.png" || this.image == "050swordproj.png" || this.image == "052swordproj.png") {
            this.rotationAngle = Math.atan2(this.dy, this.dx) + Math.PI/4
        } else {
            this.rotationAngle = Math.atan2(this.dy, this.dx) + Math.PI/2
        }
    }

    popAdjustRandomize() {
        this.popAdjustBoosted = 0
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerType == "cobra" && towers[i].path1Upgrades >= 4 && towers[i].playerSide == this.playerSide) {
                if(Math.random() <= 0.2) {
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
                if(Math.random() <= 0.4) {
                    this.damageAdjustBoosted++
                }
            }
        }
        this.damage = Math.ceil(1.25 ** this.damageAdjustBoosted * this.damage)
    }

    spawnFrags() {
        if(this.image == "002bombprojmain.png" || this.image == "022bombprojmain.png" || this.image == "032bombprojmain.png" || this.image == "042bombprojmain.png" || this.image == "052bombprojmain.png") {
            for(var i = 0; i < 8; i++) {
                projectiles.push(new Projectile(this.x + 50 * Math.cos(i * Math.PI/4), this.y + 50 * Math.sin(i * Math.PI/4), 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 10, "002bombproj.png", this.damage, Math.ceil(this.maxPierce/10)+1, 0, 0, this.parentID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
        } else if(this.image == "003bombprojmain.png") {
            for(var i = 0; i < 8; i++) {
                projectiles.push(new Projectile(this.x + 50 * Math.cos(i * Math.PI/4), this.y + 50 * Math.sin(i * Math.PI/4), 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 10, "000bombproj.png", this.damage, this.maxPierce/2, 0, 0, this.parentID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
        } else if(this.image == "004bombprojmain.png") {
            for(var i = 0; i < 8; i++) {
                projectiles.push(new Projectile(this.x + 50 * Math.cos(i * Math.PI/4), this.y + 50 * Math.sin(i * Math.PI/4), 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 10, "003bombprojmain.png", this.damage, this.maxPierce/2, 0, 0, this.parentID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
        } else if(this.image == "302bombprojmain.png") {
            for(var i = 0; i < 12; i++) {
                projectiles.push(new Projectile(this.x + 50 * Math.cos(i * Math.PI/6), this.y + 50 * Math.sin(i * Math.PI/6), 10 * Math.cos(i * Math.PI/6), 10 * Math.sin(i * Math.PI/6), 15, "302bombproj.png", this.damage, Math.ceil(this.maxPierce/10)+1, this.knockback, this.moabKnockback, this.parentID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
        }
    }

    touchingBloon(targetOrX, y, radius) {
        var targetX = targetOrX
        var targetY = y
        var targetRadius = radius
        var targetPreviousX = targetOrX
        var targetPreviousY = y
        if(targetOrX && typeof targetOrX == "object") {
            targetX = targetOrX.x
            targetY = targetOrX.y
            targetRadius = targetOrX.radius
            targetPreviousX = targetOrX.previousX == undefined ? targetOrX.x : targetOrX.previousX
            targetPreviousY = targetOrX.previousY == undefined ? targetOrX.y : targetOrX.previousY
        }
        var combinedHalfExtent = (targetRadius + this.radius) * 0.707
        var minX = Math.min(targetX, targetPreviousX) - combinedHalfExtent
        var maxX = Math.max(targetX, targetPreviousX) + combinedHalfExtent
        var minY = Math.min(targetY, targetPreviousY) - combinedHalfExtent
        var maxY = Math.max(targetY, targetPreviousY) + combinedHalfExtent
        if(this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY) {
            return true
        }
        var startX = this.previousX
        var startY = this.previousY
        if(startX >= minX && startX <= maxX && startY >= minY && startY <= maxY) {
            return true
        }
        var deltaX = this.x - startX
        var deltaY = this.y - startY
        if(deltaX == 0 && deltaY == 0) {
            return false
        }
        var tMin = 0
        var tMax = 1
        if(deltaX == 0) {
            if(startX < minX || startX > maxX) {
                return false
            }
        } else {
            var invDeltaX = 1 / deltaX
            var t1x = (minX - startX) * invDeltaX
            var t2x = (maxX - startX) * invDeltaX
            if(t1x > t2x) {
                var swapX = t1x
                t1x = t2x
                t2x = swapX
            }
            tMin = Math.max(tMin, t1x)
            tMax = Math.min(tMax, t2x)
            if(tMin > tMax) {
                return false
            }
        }
        if(deltaY == 0) {
            return startY >= minY && startY <= maxY
        }
        var invDeltaY = 1 / deltaY
        var t1y = (minY - startY) * invDeltaY
        var t2y = (maxY - startY) * invDeltaY
        if(t1y > t2y) {
            var swapY = t1y
            t1y = t2y
            t2y = swapY
        }
        tMin = Math.max(tMin, t1y)
        tMax = Math.min(tMax, t2y)
        return tMin <= tMax
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
        drawCenteredAsset(this.image, this.x, this.y, this.radius)
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
        this.mode = "money"
    }

    update() {
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        this.y -= 2.5 * simStepMultiplier
        this.frames += simStepMultiplier
    }

    draw() {
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = 30 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText("$" + this.text.toLocaleString(), this.x, this.y, canvas.width)
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
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        this.y -= 2.5 * simStepMultiplier
        this.frames += simStepMultiplier
    }

    draw() {
        if(this.mode == "eco") {
            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = 30 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("\u25b2 " + this.text.toLocaleString(), this.x, this.y, canvas.width)
            ctx.fillText("\u25b2 " + this.text.toLocaleString(), this.x, this.y, canvas.width)
        } else {
            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.font = 30 + "px Luckiest Guy"
            ctx.textAlign = "center"
            ctx.strokeText("\u2764 " + this.text.toLocaleString(), this.x, this.y, canvas.width)
            ctx.fillText("\u2764 " + this.text.toLocaleString(), this.x, this.y, canvas.width)
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
        drawCenteredAsset(this.image, this.x, this.y, this.radius)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText(this.text, this.x, this.y - this.radius/2, 2 * this.radius)
        ctx.fillText(this.text, this.x, this.y - this.radius/2, 2 * this.radius)
        if(this.cost != "") {
            ctx.strokeText("$" + this.cost.toLocaleString(), this.x, this.y + this.radius, 2 *this.radius)
            ctx.fillText("$" + this.cost.toLocaleString(), this.x, this.y + this.radius, 2 *this.radius)
        }
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
        this.showColumn = -1
    }

    draw() {
        if(this.showColumn == -1) {
            drawCenteredAsset(this.image, this.x, this.y, this.radius)
            ctx.lineWidth = 5
            ctx.strokeStyle =  "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
            ctx.textAlign = "center"
            if(this.selected) {
                if(this.x < canvas.width/2 && p1AutoEco || this.x > canvas.width/2 && p2AutoEco) {
                    ctx.strokeStyle = "lime"
                } else {
                    ctx.strokeStyle = "yellow"
                }
                ctx.lineWidth = 5
                ctx.strokeRect(this.x - 2 * this.radius/2, this.y - 2 * this.radius/2, 2 * this.radius, 2 * this.radius)
            }
            if(this.image == "locked.png") {
                if(this.playerSide == 1) {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
                } else {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, this.y, 2 * this.radius)
                }
            } else {
                ctx.strokeStyle = "black"
                ctx.strokeText(this.text, this.x, this.y + this.radius/1.5, 2 * this.radius)
                ctx.strokeText("$" + this.cost.toLocaleString(), this.x, this.y - this.radius/1.5, 2 *this.radius)
                ctx.strokeText("\u25b2" + this.eco.toLocaleString(), this.x, this.y, 2 *this.radius)
                ctx.fillText(this.text, this.x, this.y + this.radius/1.5, 2 * this.radius)
                ctx.fillText("$" + this.cost.toLocaleString(), this.x, this.y - this.radius/1.5, 2 *this.radius)
                ctx.fillText("\u25b2" + this.eco.toLocaleString(), this.x, this.y, 2 *this.radius)
            }
        } else if(this.showColumn == 1) {
            drawAsset(this.image, this.x - this.radius, canvas.height/4 - this.radius, this.radius * 2, this.radius * 2)
            ctx.lineWidth = 5
            ctx.strokeStyle =  "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
            ctx.textAlign = "center"
            if(this.selected) {
                if(this.x < canvas.width/2 && p1AutoEco || this.x > canvas.width/2 && p2AutoEco) {
                    ctx.strokeStyle = "lime"
                } else {
                    ctx.strokeStyle = "yellow"
                }
                ctx.lineWidth = 5
                ctx.strokeRect(this.x - 2 * this.radius/2, canvas.height/4 - 2 * this.radius/2, 2 * this.radius, 2 * this.radius)
            }
            if(this.image == "locked.png") {
                if(this.playerSide == 1) {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/4, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/4, 2 * this.radius)
                } else {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/4, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/4, 2 * this.radius)
                }
            } else {
                ctx.strokeStyle = "black"
                ctx.strokeText(this.text, this.x, canvas.height/4 + this.radius/1.5, 2 * this.radius)
                ctx.strokeText("$" + this.cost.toLocaleString(), this.x, canvas.height/4 - this.radius/1.5, 2 *this.radius)
                ctx.strokeText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height/4, 2 *this.radius)
                ctx.fillText(this.text, this.x, canvas.height/4 + this.radius/1.5, 2 * this.radius)
                ctx.fillText("$" + this.cost.toLocaleString(), this.x, canvas.height/4 - this.radius/1.5, 2 *this.radius)
                ctx.fillText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height/4, 2 *this.radius)
            }
        } else if(this.showColumn == 2) {
            drawAsset(this.image, this.x - this.radius, canvas.height/3 - this.radius, this.radius * 2, this.radius * 2)
            ctx.lineWidth = 5
            ctx.strokeStyle =  "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
            ctx.textAlign = "center"
            if(this.selected) {
                if(this.x < canvas.width/2 && p1AutoEco || this.x > canvas.width/2 && p2AutoEco) {
                    ctx.strokeStyle = "lime"
                } else {
                    ctx.strokeStyle = "yellow"
                }
                ctx.lineWidth = 5
                ctx.strokeRect(this.x - 2 * this.radius/2, canvas.height/3 - 2 * this.radius/2, 2 * this.radius, 2 * this.radius)
            }
            if(this.image == "locked.png") {
                if(this.playerSide == 1) {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/3, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/3, 2 * this.radius)
                } else {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/3, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height/3, 2 * this.radius)
                }
            } else {
                ctx.strokeStyle = "black"
                ctx.strokeText(this.text, this.x, canvas.height/3 + this.radius/1.5, 2 * this.radius)
                ctx.strokeText("$" + this.cost.toLocaleString(), this.x, canvas.height/3 - this.radius/1.5, 2 *this.radius)
                ctx.strokeText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height/3, 2 *this.radius)
                ctx.fillText(this.text, this.x, canvas.height/3 + this.radius/1.5, 2 * this.radius)
                ctx.fillText("$" + this.cost.toLocaleString(), this.x, canvas.height/3 - this.radius/1.5, 2 *this.radius)
                ctx.fillText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height/3, 2 *this.radius)
            }
        } else if(this.showColumn == 3) {
            drawAsset(this.image, this.x - this.radius, canvas.height*5/12 - this.radius, this.radius * 2, this.radius * 2)
            ctx.lineWidth = 5
            ctx.strokeStyle =  "black"
            ctx.fillStyle = "white"
            ctx.font = this.radius * 2 / 3 + "px Luckiest Guy"
            ctx.textAlign = "center"
            if(this.selected) {
                if(this.x < canvas.width/2 && p1AutoEco || this.x > canvas.width/2 && p2AutoEco) {
                    ctx.strokeStyle = "lime"
                } else {
                    ctx.strokeStyle = "yellow"
                }
                ctx.lineWidth = 5
                ctx.strokeRect(this.x - 2 * this.radius/2, canvas.height*5/12 - 2 * this.radius/2, 2 * this.radius, 2 * this.radius)
            }
            if(this.image == "locked.png") {
                if(this.playerSide == 1) {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height*5/12, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p1BloonSendRound - Math.trunc(round/2))), this.x, canvas.height*5/12, 2 * this.radius)
                } else {
                    ctx.strokeStyle = "black"
                    ctx.strokeText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height*5/12, 2 * this.radius)
                    ctx.fillText("Round " + (this.roundUnlock - (p2BloonSendRound - Math.trunc(round/2))), this.x, canvas.height*5/12, 2 * this.radius)
                }
            } else {
                ctx.strokeStyle = "black"
                ctx.strokeText(this.text, this.x, canvas.height*5/12 + this.radius/1.5, 2 * this.radius)
                ctx.strokeText("$" + this.cost.toLocaleString(), this.x, canvas.height*5/12 - this.radius/1.5, 2 *this.radius)
                ctx.strokeText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height*5/12, 2 *this.radius)
                ctx.fillText(this.text, this.x, canvas.height*5/12 + this.radius/1.5, 2 * this.radius)
                ctx.fillText("$" + this.cost.toLocaleString(), this.x, canvas.height*5/12 - this.radius/1.5, 2 *this.radius)
                ctx.fillText("\u25b2" + this.eco.toLocaleString(), this.x, canvas.height*5/12, 2 *this.radius)
            }
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
        ctx.strokeStyle = "white"
        ctx.lineWidth = 5
        if(this.playerSide == 1) {
            ctx.fillStyle = "blue"
        } else {
            ctx.fillStyle = "red"
        }
        ctx.strokeRect(this.x - 2.5, this.y + 5, 5, 20)
        ctx.strokeRect(this.x - 2.5, this.y - 25, 5, 20)
        ctx.strokeRect(this.x + 5, this.y - 2.5, 20, 5)
        ctx.strokeRect(this.x - 25, this.y - 2.5, 20, 5)
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
        this.nextSend = gameNow() + this.spacing
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
        drawAsset(this.image, x - radius, y - radius, radius * 2, radius * 2)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = radius * 3 / 4 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText(this.count, x, y, 2 * radius)
        ctx.fillText(this.count, x, y, 2 * radius)
    }
}

class Images {
    constructor(x, y, radius, image, lifespan, text) {
        this.x = x
        this.y = y
        this.radius = radius
        this.image = image
        this.sourceImage = image
        this.text = text
        this.lifespan = lifespan
        this.rotationAngle = 0
        if(this.image == "pop.png") {
            this.rotationAngle = Math.random() * 2 * Math.PI
        }
    }

    draw() {
        drawRotatedCenteredAsset(this.image, this.x, this.y, this.radius, this.rotationAngle)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = this.radius + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText(this.text, this.x, this.y, canvas.width)
        ctx.fillText(this.text, this.x, this.y, canvas.width)
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
        drawCenteredAsset(this.image, this.x, this.y, this.radius)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText(this.text, this.x, this.y - this.radius, 2 * this.radius)
        ctx.fillText(this.text, this.x, this.y - this.radius, 2 * this.radius)
    }
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Subtower {
    constructor(x, y, dx, dy, radius, range, towerType, playerSide, towerID, lifespan) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.radius = radius
        this.range = range
        this.towerType = towerType
        this.playerSide = playerSide
        this.attackSpeed = 100
        this.target = -1
        this.nextFire = gameNow() + this.attackSpeed
        this.towerID = towerID
        this.targetPrio = 0
        this.random = Math.random()
        this.towerBoosted = 1
        this.cobraBoosted = 1
        this.slowSabotaged = 1
        this.overclockFactor = 1
        this.popAdjustBoosted = 0
        this.lifespan = lifespan
        this.image = this.towerType
        this.path1Name = []
        this.path2Name = []
        this.path3Name = []
        this.path1Cost = []
        this.path2Cost = []
        this.path3Cost = []
        this.parentPath1 = 0
        this.parentPath2 = 0
        this.parentPath3 = 0
        this.bonusDamage = 0
        this.bonusPierce = 0
        this.towerVar = 0
        this.rotationAngle = 0
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].towerID == this.towerID) {
                this.parentPath1 = towers[i].path1Upgrades
                this.parentPath2 = towers[i].path2Upgrades
                this.parentPath3 = towers[i].path3Upgrades
            }
        }
        if(this.parentPath2 >= 1) {
            this.range += 50
        }
        if(this.parentPath2 >= 2) {
            this.bonusDamage = 1
        }
        if(this.parentPath3 >= 1) {
            this.bonusPierce = 1
        }
        if(this.parentPath3 >= 2) {
            this.bonusKnockback = 50
        }
    }

    update() {
        var simStepMultiplier = typeof getAITrainingSimulationStepMultiplier == "function" ? getAITrainingSimulationStepMultiplier() : 1
        if(this.towerType == "400buccaneerprobe.png" || this.towerType == "500buccaneerprobe.png") {
            this.rotationAngle = Math.atan2(this.dy, this.dx) + Math.PI/2
        }
        this.x += this.dx * simStepMultiplier
        this.y += this.dy * simStepMultiplier
    }

    draw() {
        drawRotatedCenteredAsset(this.towerType, this.x, this.y, this.radius, this.rotationAngle)
    }

    findTarget() {
        this.target = -1
        var rangeSquared = this.range ** 2
        for(var i = 0; i < bloons.length; i++) {
            var bloon = bloons[i]
            var dx = bloon.x - this.x
            var dy = bloon.y - this.y
            var distanceSquared = dx ** 2 + dy ** 2
            if(this.range >= 0 && distanceSquared <= rangeSquared && bloon.playerSide == this.playerSide && (this.target == -1 || bloon.pathPos > bloons[this.target].pathPos)) {
                this.target = i
            }
        }
    }

    attack() {
        if(this.target != -1 && this.towerType == "100engiproj.png") {
            //base sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 1 + this.bonusDamage, 2 + this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "300engiproj.png") {
            //sprockets sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 400
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 1 + this.bonusDamage, 2 + this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "400engiproj1.png") {
            //crushing sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300dartproj.png", 1 + this.bonusDamage, 10 + 5 * this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "400engiproj2.png") {
            //bomb sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 2 + this.bonusDamage, 10 + 5 * this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "400engiproj3.png") {
            //energy sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
            projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "130superproj.png", 3 + this.bonusDamage, 5 + 3 * this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "400engiproj4.png") {
            //cold sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003iceproj.png", 1 + this.bonusDamage, 20 + 10 * this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "500engiproj.png") {
            //champion sentry
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 75
            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 3 + this.bonusDamage, 10 + 5 * this.bonusPierce, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
        } else if(this.target != -1 && this.towerType == "400buccaneerprobe.png") {
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 100
            projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            this.towerVar++
            if(this.towerVar % 5 == 1) {
                for(var i = 0; i < 8; i++) {
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 10, "000dartproj.png", 1, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
        } else if(this.target != -1 && this.towerType == "500buccaneerprobe.png") {
            this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 75
            projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.PI/72 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.PI/72 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(-Math.PI/72 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(-Math.PI/72 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5, this.bonusKnockback, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            this.towerVar++
            if(this.towerVar % 5 == 1) {
                for(var i = 0; i < 12; i++) {
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(i * Math.PI/6), 10 * Math.sin(i * Math.PI/6), 10, "000dartproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
        }
        if(this.towerType != "400buccaneerprobe.png" && this.towerType != "500buccaneerprobe.png") {
            this.rotationAngle = Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + Math.PI/2
        }
    }
}
