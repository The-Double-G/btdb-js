// Tower entity, upgrades, targeting, and attacks
var nextTowerID = 1

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
        this.target2 = -1
        this.target3 = -1
        this.target4 = -1
        this.nextFire = gameNow() + this.attackSpeed
        this.towerVar = 0
        this.towerID = nextTowerID++
        this.popCount = 0
        this.farmerCap = 200
        this.lightningCount = 0
        this.targetPrio = 0
        this.random = Math.random()
        this.targetX = cursor[0].x
        this.targetY = cursor[0].y
        this.towerBoosted = 1
        this.cobraBoosted = 1
        this.slowSabotaged = 1
        this.popAdjustBoosted = 0
        this.ecoStealCooldown = -1
        this.attritionCooldown = -1
        this.activeSyphonCooldown = -1
        this.supplyDropCooldown = -1
        this.sentrySpawnCooldown = -1
        this.trapSpawnCooldown = -1
        this.cashGenerated = 0
        this.shinobiStacks = 0
        this.overclockFactor = 1
        this.closestPathObject = -1
        this.lastTimeTrapPopped = -1
        this.planeCount = 0
        this.degree = 0
        this.bananaCounter = Math.floor(counter/(maxCounter/3)) + 1
        this.upgradedMidRound = true
        this.dpsCount = 0
        this.rotationAngle = 0
        if(this.playerSide == 1) {
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].x < canvas.width/2) {
                    if(this.closestPathObject == -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range) {
                        this.closestPathObject = i
                    } else if(this.closestPathObject != -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range &&  ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <  ((this.x - pathObjects[this.closestPathObject].x)**2 + (this.y - pathObjects[this.closestPathObject].y)**2)**0.5) {
                        this.closestPathObject = i
                    }
                }
            }
        } else if(this.playerSide == 2) {
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].x > canvas.width/2) {
                    if(this.closestPathObject == -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range) {
                        this.closestPathObject = i
                    } else if(this.closestPathObject != -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range &&  ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <  ((this.x - pathObjects[this.closestPathObject].x)**2 + (this.y - pathObjects[this.closestPathObject].y)**2)**0.5) {
                        this.closestPathObject = i
                    }
                }
            }
        }
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
            //apex plasma master
            this.path1Name[6] = "Upgrades"
            this.path2Name[0] = "Quick Shots"
            this.path2Name[1] = "Very Quick Shots"
            this.path2Name[2] = "Triple Shot"
            this.path2Name[3] = "Super Monkey Training"
            this.path2Name[4] = "Plasma Monkey Training"
            this.path2Name[6] = "Upgrades"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Subsidized Training"
            this.path3Name[1] = "Enhanced Eyesight"
            this.path3Name[2] = "Crossbow"
            this.path3Name[3] = "Sharp Shooter"
            this.path3Name[4] = "Crossbow Master"
            this.path3Name[5] = "Upgrades"
            this.path3Name[6] = "Upgrades"
            this.path1Cost[0] = 100
            this.path1Cost[1] = 150
            this.path1Cost[2] = 750
            this.path1Cost[3] = 3200
            this.path1Cost[4] = 18000
            this.path1Cost[5] = "Max"
            //300k
            this.path1Cost[6] = "Max"
            this.path2Cost[0] = 75
            this.path2Cost[1] = 150
            this.path2Cost[2] = 500
            this.path2Cost[3] = 6000
            this.path2Cost[4] = 40000
            this.path2Cost[5] = "Max"
            this.path2Cost[6] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 75
            this.path3Cost[2] = 350
            this.path3Cost[3] = 2500
            this.path3Cost[4] = 26000
            this.path3Cost[5] = "Max"
            this.path3Cost[6] = "Max"
        } else if(this.towerType == "tack") {
            this.path1Name[0] = "Faster Shooting"
            this.path1Name[1] = "Even Faster Shooting"
            this.path1Name[2] = "Hot Shots"
            this.path1Name[3] = "Ring of Fire"
            this.path1Name[4] = "Inferno Ring"
            this.path1Name[5] = "Upgrades"
            //infernal crucible
            this.path1Name[6] = "Upgrades"
            this.path2Name[0] = "Extra Range"
            this.path2Name[1] = "Sharper Tacks"
            this.path2Name[2] = "Blade Shooter"
            this.path2Name[3] = "Blade Maelstrom"
            this.path2Name[4] = "Super Maelstrom"
            this.path2Name[5] = "Upgrades"
            this.path2Name[6] = "Upgrades"
            this.path3Name[0] = "More Tacks"
            this.path3Name[1] = "Even More Tacks"
            this.path3Name[2] = "Tack Sprayer"
            this.path3Name[3] = "Overdrive"
            this.path3Name[4] = "Tack Zone"
            this.path3Name[5] = "Upgrades"
            this.path3Name[6] = "Upgrades"
            this.path1Cost[0] = 150
            this.path1Cost[1] = 250
            this.path1Cost[2] = 650
            this.path1Cost[3] = 2750
            this.path1Cost[4] = 60000
            this.path1Cost[5] = "Max"
            //300k
            this.path1Cost[6] = "Max"
            this.path2Cost[0] = 75
            this.path2Cost[1] = 300
            this.path2Cost[2] = 650
            this.path2Cost[3] = 4500
            this.path2Cost[4] = 50000
            this.path2Cost[5] = "Max"
            this.path2Cost[6] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 100
            this.path3Cost[2] = 250
            this.path3Cost[3] = 3500
            this.path3Cost[4] = 52000
            this.path3Cost[5] = "Max"
            this.path3Cost[6] = "Max"
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
            this.path3Name[0] = "Quality Soil"
            this.path3Name[1] = "Auto Salvage"
            this.path3Name[2] = "Marketplace"
            this.path3Name[3] = "Central Market"
            this.path3Name[4] = "Monkey Wall Street"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 500
            this.path1Cost[1] = 600
            this.path1Cost[2] = 3200
            this.path1Cost[3] = 20000
            this.path1Cost[4] = 75000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 100
            this.path2Cost[1] = 800
            this.path2Cost[2] = 6500
            this.path2Cost[3] = 9000
            this.path2Cost[4] = 48000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 400
            this.path3Cost[1] = 200
            this.path3Cost[2] = 2600
            this.path3Cost[3] = 15000
            this.path3Cost[4] = 55000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "super") {
            this.path1Name[0] = "Laser Blasts"
            this.path1Name[1] = "Plasma Blasts"
            this.path1Name[2] = "Solar Blasts"
            this.path1Name[3] = "Sun Avatar"
            this.path1Name[4] = "Sun God"
            this.path1Name[5] = "Upgrades"
            //Scourge of the universe
            this.path1Name[6] = "Upgrades"
            this.path2Name[0] = "Super Range"
            this.path2Name[1] = "Epic Range"
            this.path2Name[2] = "Robo Monkey"
            this.path2Name[3] = "Tech Terror"
            this.path2Name[4] = "Anti-Bloon"
            this.path2Name[5] = "Upgrades"
            this.path2Name[6] = "Upgrades"
            this.path3Name[0] = "Knockback"
            this.path3Name[1] = "Heavier Weapons"
            this.path3Name[2] = "Dark Knight"
            this.path3Name[3] = "Dark Champion"
            this.path3Name[4] = "Legend of the Night"
            this.path3Name[5] = "Upgrades"
            this.path3Name[6] = "Upgrades"
            this.path1Cost[0] = 750
            this.path1Cost[1] = 2000
            this.path1Cost[2] = 12000
            this.path1Cost[3] = 150000
            this.path1Cost[4] = 500000
            this.path1Cost[5] = "Max"
            //2.5m
            this.path1Cost[6] = "Max"
            this.path2Cost[0] = 1000
            this.path2Cost[1] = 1000
            this.path2Cost[2] = 9000
            this.path2Cost[3] = 55000
            this.path2Cost[4] = 150000
            this.path2Cost[5] = "Max"
            this.path2Cost[6] = "Max"
            this.path3Cost[0] = 1500
            this.path3Cost[1] = 1500
            this.path3Cost[2] = 5000
            this.path3Cost[3] = 45000
            this.path3Cost[4] = 110000
            this.path3Cost[5] = "Max"
            this.path3Cost[6] = "Max"
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
            this.path1Cost[0] = 250
            this.path1Cost[1] = 400
            this.path1Cost[2] = 1500
            this.path1Cost[3] = 5500
            this.path1Cost[4] = 45000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 400
            this.path2Cost[2] = 2000
            this.path2Cost[3] = 3500
            this.path2Cost[4] = 28000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 250
            this.path3Cost[2] = 2000
            this.path3Cost[3] = 7000
            this.path3Cost[4] = 35000
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
            this.path3Name[0] = "Cheap Cryogenics"
            this.path3Name[1] = "Longer Range"
            this.path3Name[2] = "Snowball Cannon"
            this.path3Name[3] = "Improved Cannon"
            this.path3Name[4] = "MOAB Freeze"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 1000
            this.path1Cost[2] = 1500
            this.path1Cost[3] = 4500
            this.path1Cost[4] = 25000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 300
            this.path2Cost[1] = 750
            this.path2Cost[2] = 3850
            this.path2Cost[3] = 7500
            this.path2Cost[4] = 20000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 150
            this.path3Cost[1] = 125
            this.path3Cost[2] = 1750
            this.path3Cost[3] = 6500
            this.path3Cost[4] = 50000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "farmer") {
            this.path1Name[0] = "No Upgrades"
            this.path2Name[0] = "No Upgrades"
            this.path3Name[0] = "No Upgrades"
            this.path1Name[1] = "No Upgrades"
            this.path2Name[1] = "No Upgrades"
            this.path3Name[1] = "No Upgrades"
            this.path1Name[2] = "No Upgrades"
            this.path2Name[2] = "No Upgrades"
            this.path3Name[2] = "No Upgrades"
            this.path1Name[3] = "No Upgrades"
            this.path2Name[3] = "No Upgrades"
            this.path3Name[3] = "No Upgrades"
            this.path1Name[4] = "No Upgrades"
            this.path2Name[4] = "No Upgrades"
            this.path3Name[4] = "No Upgrades"
            this.path1Name[5] = "No Upgrades"
            this.path2Name[5] = "No Upgrades"
            this.path3Name[5] = "No Upgrades"
            this.path1Cost[0] = "Max"
            this.path2Cost[0] = "Max"
            this.path3Cost[0] = "Max"
            this.path1Cost[1] = "Max"
            this.path2Cost[1] = "Max"
            this.path3Cost[1] = "Max"
            this.path1Cost[2] = "Max"
            this.path2Cost[2] = "Max"
            this.path3Cost[2] = "Max"
            this.path1Cost[3] = "Max"
            this.path2Cost[3] = "Max"
            this.path3Cost[3] = "Max"
            this.path1Cost[4] = "Max"
            this.path2Cost[4] = "Max"
            this.path3Cost[4] = "Max"
            this.path1Cost[5] = "Max"
            this.path2Cost[5] = "Max"
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
            this.path1Cost[0] = 100
            this.path1Cost[1] = 550
            this.path1Cost[2] = 4000
            this.path1Cost[3] = 20000
            this.path1Cost[4] = 125000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 100
            this.path2Cost[1] = 350
            this.path2Cost[2] = 6000
            this.path2Cost[3] = 10000
            this.path2Cost[4] = 125000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 600
            this.path3Cost[2] = 2200
            this.path3Cost[3] = 14000
            this.path3Cost[4] = 70000
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
            this.path1Cost[0] = 100
            this.path1Cost[1] = 500
            this.path1Cost[2] = 1000
            this.path1Cost[3] = 10000
            this.path1Cost[4] = 40000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 250
            this.path2Cost[1] = 400
            this.path2Cost[2] = 3500
            this.path2Cost[3] = 12000
            this.path2Cost[4] = 50000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 250
            this.path3Cost[1] = 100
            this.path3Cost[2] = 2200
            this.path3Cost[3] = 8000
            this.path3Cost[4] = 65000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "cobra") {
            this.path1Name[0] = "Higher Caliber"
            this.path1Name[1] = "Mega Caliber"
            this.path1Name[2] = "Monkey Stim"
            this.path1Name[3] = "Pop Adjustment"
            this.path1Name[4] = "Damage Adjustment"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Wired Funds"
            this.path2Name[1] = "Wired Eco"
            this.path2Name[2] = "Attrition"
            this.path2Name[3] = "Active Syphon"
            this.path2Name[4] = "Grand Heist"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Double Tap"
            this.path3Name[1] = "Bloon Adjustment"
            this.path3Name[2] = "Bloon Stim"
            this.path3Name[3] = "Offensive Push"
            this.path3Name[4] = "Upgrade Bloons"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 600
            this.path1Cost[2] = 1000
            this.path1Cost[3] = 2000
            this.path1Cost[4] = 7500
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 400
            this.path2Cost[1] = 500
            this.path2Cost[2] = 1000
            this.path2Cost[3] = 7500
            this.path2Cost[4] = 40000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 300
            this.path3Cost[1] = 400
            this.path3Cost[2] = 500
            this.path3Cost[3] = 3000
            this.path3Cost[4] = 10000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "boomer") {
            this.path1Name[0] = "Improved Rangs"
            this.path1Name[1] = "Glaives"
            this.path1Name[2] = "Glaive Ricochet"
            this.path1Name[3] = "MOAR Glaives"
            this.path1Name[4] = "Glaive Lord"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Faster Throwing"
            this.path2Name[1] = "Even Faster Throwing"
            this.path2Name[2] = "Bionic Boomerang"
            this.path2Name[3] = "Turbocharged"
            this.path2Name[4] = "Permacharged"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Long Reach Rangs"
            this.path3Name[1] = "Red Hot Rangs"
            this.path3Name[2] = "Heavy Rangs"
            this.path3Name[3] = "MOAB Push"
            this.path3Name[4] = "MOAB Domination"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 350
            this.path1Cost[1] = 450
            this.path1Cost[2] = 1200
            this.path1Cost[3] = 4000
            this.path1Cost[4] = 60000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 200
            this.path2Cost[2] = 1400
            this.path2Cost[3] = 6500
            this.path2Cost[4] = 45000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 75
            this.path3Cost[1] = 350
            this.path3Cost[2] = 750
            this.path3Cost[3] = 4000
            this.path3Cost[4] = 50000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "sniper") {
            this.path1Name[0] = "Full Metal Jacket"
            this.path1Name[1] = "Large Caliber"
            this.path1Name[2] = "Deadly Precision"
            this.path1Name[3] = "Heavy Duty Bullets"
            this.path1Name[4] = "Cripple MOAB"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Double Hit"
            this.path2Name[1] = "Shrapnel Shot"
            this.path2Name[2] = "Multitarget"
            this.path2Name[3] = "Supply Drop"
            this.path2Name[4] = "Elite Sniper"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Faster Shooting"
            this.path3Name[1] = "Even Faster Shooting"
            this.path3Name[2] = "Semi-Automatic"
            this.path3Name[3] = "Full-Automatic"
            this.path3Name[4] = "Elite Defender"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 250
            this.path1Cost[1] = 1400
            this.path1Cost[2] = 2000
            this.path1Cost[3] = 5000
            this.path1Cost[4] = 35000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 300
            this.path2Cost[2] = 2500
            this.path2Cost[3] = 8000
            this.path2Cost[4] = 20000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 200
            this.path3Cost[1] = 200
            this.path3Cost[2] = 2000
            this.path3Cost[3] = 4000
            this.path3Cost[4] = 25000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "ninja") {
            this.path1Name[0] = "Ninja Disipline"
            this.path1Name[1] = "Sharp Shurikens"
            this.path1Name[2] = "Double Shot"
            this.path1Name[3] = "Bloonjitsu"
            this.path1Name[4] = "Grandmaster Ninja"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Pushback"
            this.path2Name[1] = "Harsher Pushback"
            this.path2Name[2] = "Shinobi Tactics"
            this.path2Name[3] = "Bloon Sabotage"
            this.path2Name[4] = "Grand Sabotage"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Seeking Shuriken"
            this.path3Name[1] = "Caltrops"
            this.path3Name[2] = "Flash Bomb"
            this.path3Name[3] = "Stronger Bombs"
            this.path3Name[4] = "Master Bomber"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 300
            this.path1Cost[1] = 300
            this.path1Cost[2] = 750
            this.path1Cost[3] = 2500
            this.path1Cost[4] = 60000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 200
            this.path2Cost[2] = 3000
            this.path2Cost[3] = 6000
            this.path2Cost[4] = 30000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 300
            this.path3Cost[1] = 400
            this.path3Cost[2] = 2000
            this.path3Cost[3] = 7500
            this.path3Cost[4] = 60000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "engi") {
            this.path1Name[0] = "Spawn Sentries"
            this.path1Name[1] = "Faster Engineering"
            this.path1Name[2] = "Sprockets"
            this.path1Name[3] = "Sentry Expert"
            this.path1Name[4] = "Sentry Champion"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Larger Range"
            this.path2Name[1] = "Deconstruction"
            this.path2Name[2] = "Cooling Foam"
            this.path2Name[3] = "Overclock"
            this.path2Name[4] = "Ultraboost"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Oversize Nails"
            this.path3Name[1] = "Heavy Nails"
            this.path3Name[2] = "Double Gun"
            this.path3Name[3] = "Bloon Trap"
            this.path3Name[4] = "XXXL Trap"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 500
            this.path1Cost[1] = 400
            this.path1Cost[2] = 600
            this.path1Cost[3] = 4000
            this.path1Cost[4] = 50000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 350
            this.path2Cost[2] = 500
            this.path2Cost[3] = 18000
            this.path2Cost[4] = 65000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 500
            this.path3Cost[1] = 200
            this.path3Cost[2] = 400
            this.path3Cost[3] = 5000
            this.path3Cost[4] = 55000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "buccaneer") {
            this.path1Name[0] = "Faster Throwing"
            this.path1Name[1] = "Extra Shot"
            this.path1Name[2] = "Destroyer"
            this.path1Name[3] = "Aircraft Commander"
            this.path1Name[4] = "Aircraft Master"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Grape Shot"
            this.path2Name[1] = "Hot Grapes"
            this.path2Name[2] = "Cannon Ship"
            this.path2Name[3] = "Monkey Pirate"
            this.path2Name[4] = "Pirate Lord"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Spyglass"
            this.path3Name[1] = "Sharper Weapons"
            this.path3Name[2] = "Merchantman"
            this.path3Name[3] = "Favored Trader"
            this.path3Name[4] = "Trade Empire"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 400
            this.path1Cost[1] = 600
            this.path1Cost[2] = 4000
            this.path1Cost[3] = 10000
            this.path1Cost[4] = 45000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 500
            this.path2Cost[1] = 500
            this.path2Cost[2] = 1100
            this.path2Cost[3] = 5500
            this.path2Cost[4] = 42000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 300
            this.path3Cost[2] = 2200
            this.path3Cost[3] = 6500
            this.path3Cost[4] = 30000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "mortar") {
            this.path1Name[0] = "Bigger Blasts"
            this.path1Name[1] = "Bloon Buster"
            this.path1Name[2] = "Shell Shock"
            this.path1Name[3] = "Big One"
            this.path1Name[4] = "Biggest One"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Faster Reload"
            this.path2Name[1] = "Rapid Reload"
            this.path2Name[2] = "Heavy Shells"
            this.path2Name[3] = "Artillery Battery"
            this.path2Name[4] = "Artillery Overload"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Dynamic Targeting"
            this.path3Name[1] = "Burny Stuff"
            this.path3Name[2] = "Heavy Duty Burn"
            this.path3Name[3] = "Shattering Shells"
            this.path3Name[4] = "Blooncineration"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 600
            this.path1Cost[1] = 1200
            this.path1Cost[2] = 1500
            this.path1Cost[3] = 8500
            this.path1Cost[4] = 55000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 250
            this.path2Cost[1] = 400
            this.path2Cost[2] = 2500
            this.path2Cost[3] = 8500
            this.path2Cost[4] = 60000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 200
            this.path3Cost[1] = 750
            this.path3Cost[2] = 1500
            this.path3Cost[3] = 7000
            this.path3Cost[4] = 38000
            this.path3Cost[5] = "Max"
        } else if(this.towerType == "sword") {
            this.path1Name[0] = "Sharper Blade"
            this.path1Name[1] = "Heavier Sword"
            this.path1Name[2] = "Ruby Blade"
            this.path1Name[3] = "Rageblade"
            this.path1Name[4] = "Omega Rageblade"
            this.path1Name[5] = "Upgrades"
            this.path2Name[0] = "Faster Swinging"
            this.path2Name[1] = "Dual Wielder"
            this.path2Name[2] = "Mirror Blade"
            this.path2Name[3] = "Sword Thrower"
            this.path2Name[4] = "Auric Sword Spinner"
            this.path2Name[5] = "Upgrades"
            this.path3Name[0] = "Larger Slashes"
            this.path3Name[1] = "Enchanted Sword"
            this.path3Name[2] = "Starfury"
            this.path3Name[3] = "Star Wrath"
            this.path3Name[4] = "Galacticus Blade"
            this.path3Name[5] = "Upgrades"
            this.path1Cost[0] = 400
            this.path1Cost[1] = 800
            this.path1Cost[2] = 3500
            this.path1Cost[3] = 12000
            this.path1Cost[4] = 95000
            this.path1Cost[5] = "Max"
            this.path2Cost[0] = 200
            this.path2Cost[1] = 200
            this.path2Cost[2] = 2500
            this.path2Cost[3] = 9000
            this.path2Cost[4] = 65000
            this.path2Cost[5] = "Max"
            this.path3Cost[0] = 100
            this.path3Cost[1] = 300
            this.path3Cost[2] = 1200
            this.path3Cost[3] = 8500
            this.path3Cost[4] = 50000
            this.path3Cost[5] = "Max"
        }
    }

    checkIDs() {
        for(var i = 0; i < towers.length - 1; i++) {
            if(towers[i].towerID == this.towerID) {
                this.towerID = nextTowerID++
                this.checkIDs()
            }
        }
    }

    getImagePath() {
        if(this.path1Upgrades < 5 && this.path2Upgrades < 5 && this.path3Upgrades < 5) {
            return String(this.path1Upgrades) + this.path2Upgrades + this.path3Upgrades + this.towerType + ".png"
        }
        if(this.path1Upgrades == 5) {
            return "500" + this.towerType + ".png"
        }
        if(this.path2Upgrades == 5) {
            return "050" + this.towerType + ".png"
        }
        if(this.path3Upgrades == 5) {
            return "005" + this.towerType + ".png"
        }
        if(this.path1Upgrades == 6 || this.path2Upgrades == 6 || this.path3Upgrades == 6) {
            return "555" + this.towerType + ".png"
        }

        return ""
    }

    drawDebugLabel() {
        if(debug == false) {
            return
        }

        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = this.radius * 3 / 4 + "px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText(this.path1Upgrades + "-" + this.path2Upgrades + "-" + this.path3Upgrades, this.x, this.y, 2 * this.radius)
        ctx.fillText(this.path1Upgrades + "-" + this.path2Upgrades + "-" + this.path3Upgrades, this.x, this.y, 2 * this.radius)
    }

    draw() {
        drawRotatedCenteredAsset(this.getImagePath(), this.x, this.y, this.radius, this.rotationAngle)
        this.drawDebugLabel()
    }

    clicked(x, y) {
        if(x >= this.x - this.radius * 0.707 && x <= this.x + this.radius * 0.707 && y >= this.y - this.radius * 0.707 && y <= this.y + this.radius * 0.707) {
            return true
        } else {
            return false
        }
    }

    spawnSentry() {
        this.random = Math.random()
        var dice = Math.trunc(Math.random() * 4) + 1
        if(this.towerType == "engi" && this.path1Upgrades == 1 || this.towerType == "engi" && this.path1Upgrades == 2) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "100engiproj.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 3) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "300engiproj.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 4 && dice == 1) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "400engiproj1.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 4 && dice == 2) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "400engiproj2.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 4 && dice == 3) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "400engiproj3.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 4 && dice == 4) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "400engiproj4.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "engi" && this.path1Upgrades == 5) {
            subtowers.push(new Subtower(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 0, 0, 15, 175, "500engiproj.png", this.playerSide, this.towerID, gameNow() + 15000))
        } else if(this.towerType == "buccaneer" && this.path1Upgrades == 4 && this.planeCount < 2) {
            this.planeCount++
            this.random = Math.random()
            subtowers.push(new Subtower(this.x, this.y, 5 * Math.cos(this.random * Math.PI*2), 5 * Math.sin(this.random * Math.PI*2), 25, Infinity, "400buccaneerprobe.png", this.playerSide, this.towerID, Infinity))
        } else if(this.towerType == "buccaneer" && this.path1Upgrades == 5 && this.planeCount < 6) {
            var replacedCommanderPlanes = false
            for(var i = 0; i < subtowers.length; i++) {
                if(subtowers[i] && subtowers[i].towerType == "400buccaneerprobe.png" && subtowers[i].towerID == this.towerID) {
                    subtowers.splice(i, 1)
                    i--
                    replacedCommanderPlanes = true
                }
            }
            if(replacedCommanderPlanes) {
                this.planeCount = 0
            }
            this.planeCount++
            subtowers.push(new Subtower(this.x, this.y, 5 * Math.cos(this.random * Math.PI*2), 5 * Math.sin(this.random * Math.PI*2), 25, Infinity, "500buccaneerprobe.png", this.playerSide, this.towerID, Infinity))
        }
    }

    updateRotationAngle() {
        if(this.towerType == "tack" || this.towerType == "ice" && this.path3Upgrades < 3 || this.towerType == "farm") {
            return
        }
        if(this.towerType == "dartling" || this.towerType == "mortar") {
            this.rotationAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x) + Math.PI/2
            return
        }
        if(this.towerType == "super" && this.path2Upgrades >= 3) {
            this.rotationAngle = Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x) + Math.PI/2
            return
        }

        this.rotationAngle = Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + Math.PI/2
    }

    recalculateClosestTrack() {
        if(this.playerSide == 1) {
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].x < canvas.width/2) {
                    if(this.closestPathObject == -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range) {
                        this.closestPathObject = i
                    } else if(this.closestPathObject != -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range &&  ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <  ((this.x - pathObjects[this.closestPathObject].x)**2 + (this.y - pathObjects[this.closestPathObject].y)**2)**0.5) {
                        this.closestPathObject = i
                    }
                }
            }
        } else if(this.playerSide == 2) {
            for(var i = 0; i < pathObjects.length; i++) {
                if(pathObjects[i].x > canvas.width/2) {
                    if(this.closestPathObject == -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range) {
                        this.closestPathObject = i
                    } else if(this.closestPathObject != -1 && ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <= this.range &&  ((this.x - pathObjects[i].x)**2 + (this.y - pathObjects[i].y)**2)**0.5 <  ((this.x - pathObjects[this.closestPathObject].x)**2 + (this.y - pathObjects[this.closestPathObject].y)**2)**0.5) {
                        this.closestPathObject = i
                    }
                }
            }
        }
    }

    findTarget() {
        var firstTarget = -1
        var lastTarget = -1
        var closeTarget = -1
        var strongTarget = -1
        var closeDistanceSquared = Infinity
        var rangeSquared = this.range ** 2
        for(var i = 0; i < bloons.length; i++) {
            var bloon = bloons[i]
            var dx = bloon.x - this.x
            var dy = bloon.y - this.y
            var distanceSquared = dx ** 2 + dy ** 2
            if(this.range >= 0 && distanceSquared <= rangeSquared && bloon.playerSide == this.playerSide) {
                if(firstTarget == -1 || bloon.pathPos > bloons[firstTarget].pathPos) {
                    firstTarget = i
                }
                if(lastTarget == -1 || bloon.pathPos < bloons[lastTarget].pathPos) {
                    lastTarget = i
                }
                if(closeTarget == -1 || distanceSquared < closeDistanceSquared) {
                    closeTarget = i
                    closeDistanceSquared = distanceSquared
                }
                if(strongTarget == -1 || bloon.health > bloons[strongTarget].health || bloon.health == bloons[strongTarget].health && bloon.pathPos > bloons[strongTarget].pathPos) {
                    strongTarget = i
                }
            }
        }
        var targets = [firstTarget, lastTarget, closeTarget, strongTarget]
        var priorityOffset = this.targetPrio >= 0 && this.targetPrio <= 3 ? this.targetPrio : 0
        this.target = targets[priorityOffset]
        this.target2 = targets[(priorityOffset + 1) % 4]
        this.target3 = targets[(priorityOffset + 2) % 4]
        this.target4 = targets[(priorityOffset + 3) % 4]
    }

    getDartlingAttackSpeed(baseAttackSpeed) {
        var barrelFactor = this.path2Upgrades >= 2 ? 0.66 : this.path2Upgrades == 1 ? 0.875 : 1
        return this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * baseAttackSpeed * barrelFactor
    }

    attack() {
        if(this.target != -1) {
            if(this.towerType == "dart") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300dartproj.png", 1, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400dartproj.png", 2, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 2, 100, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 2, 100, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "500dartproj.png", 2, 100, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (333 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (167 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(-Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(-Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.floor(this.path3Upgrades/2)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "050dartproj.png", 4, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 2, 6 + 2 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 5, 8 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "003dartproj.png", 6, 21 + 6 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 6 || this.path2Upgrades == 6 && this.path3Upgrades == 6) {
                    //paragon
                    this.attackSpeed = this.towerBoosted * this.slowSabotaged * (167 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(-Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(-Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "555dartproj.png", Math.ceil(20 * 1.02 ** (this.degree - 1)), Math.ceil(500 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "555dartproj.png", Math.ceil(20 * 1.02 ** (this.degree - 1)), Math.ceil(500 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "555dartproj.png", Math.ceil(20 * 1.02 ** (this.degree - 1)), Math.ceil(500 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "555dartproj.png", Math.ceil(20 * 1.02 ** (this.degree - 1)), Math.ceil(500 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "555dartproj.png", Math.ceil(20 * 1.02 ** (this.degree - 1)), Math.ceil(500 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            } else if(this.towerType == "tack") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //000, 010, 100, 110, 200, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //020, 120, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 1) {
                    //001, 011, 101, 201
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 1) {
                    //021
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 2) {
                    //002, 012, 102, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 0) {
                    //300, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4), 10 * Math.sin(-i * Math.PI/4), 10, "300tackproj.png", 2, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 10, "300tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "400tackproj.png", 2 + this.path3Upgrades, 12 + 6 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "400tackproj.png", 3 + this.path3Upgrades, 128 + 64 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //030, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4 - Math.PI/2), 10 * Math.sin(-i * Math.PI/4 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    for(var i = 0; i < 10; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/5 - Math.PI/2), 10 * Math.sin(-i * Math.PI/5 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    for(var i = 0; i < 12; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/6 - Math.PI/2), 10 * Math.sin(-i * Math.PI/6 - Math.PI/2), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //040, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (50 * 0.75 ** this.path1Upgrades)
                    this.towerVar += Math.PI/15 * (0.75 ** this.path1Upgrades) * 1.5
                    for(var i = 0; i < 2; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI + this.towerVar), 10 * Math.sin(-i * Math.PI + this.towerVar), 15, "030tackproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 1 || this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (50)
                    this.towerVar += Math.PI/15 * 1.5
                    for(var i = 0; i < 2; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI - this.towerVar), 10 * Math.sin(-i * Math.PI - this.towerVar), 15, "030tackproj.png", 1, 4 + 2 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //050, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (50 * 0.75 ** this.path1Upgrades)
                    this.towerVar += Math.PI/15 * (0.75 ** this.path1Upgrades) * 1.5
                    for(var i = 0; i < 4; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/2 + this.towerVar), 10 * Math.sin(-i * Math.PI/2 + this.towerVar), 15, "030tackproj.png", 1, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/2 - this.towerVar), 10 * Math.sin(-i * Math.PI/2 - this.towerVar), 15, "030tackproj.png", 1, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 1 || this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (50)
                    this.towerVar += Math.PI/15 * 1.5
                    for(var i = 0; i < 4; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/2 - this.towerVar), 10 * Math.sin(-i * Math.PI/2 - this.towerVar), 15, "030tackproj.png", 1, 20 + 10 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(i * Math.PI/2 + this.towerVar), 10 * Math.sin(i * Math.PI/2 + this.towerVar), 15, "030tackproj.png", 1, 20 + 10 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (200 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 2, 1, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (200)
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/8 - Math.PI/2), 10 * Math.sin(-i * Math.PI/8 - Math.PI/2), 10, "000tackproj.png", 2, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (200 * 0.75 ** this.path1Upgrades)
                    for(var i = 0; i < 32; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/16 - Math.PI/2), 10 * Math.sin(-i * Math.PI/16 - Math.PI/2), 10, "000tackproj.png", 4, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (200)
                    for(var i = 0; i < 32; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/16 - Math.PI/2), 10 * Math.sin(-i * Math.PI/16 - Math.PI/2), 10, "000tackproj.png", 4, 8, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 6 || this.path2Upgrades == 6 || this.path3Upgrades == 6) {
                    //paragon
                    this.attackSpeed = this.towerBoosted * this.slowSabotaged * (100)
                    this.towerVar += Math.PI/15 * (0.75 ** 2) * 1.5
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "555tackproj1.png", Math.ceil(15 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4 + this.towerVar), 10 * Math.sin(-i * Math.PI/4 + this.towerVar), 15, "555tackproj2.png", Math.ceil(7 * 1.02 ** (this.degree - 1)), Math.ceil(100 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/4 - this.towerVar), 10 * Math.sin(-i * Math.PI/4 - this.towerVar), 15, "555tackproj2.png", Math.ceil(7 * 1.02 ** (this.degree - 1)), Math.ceil(100 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    for(var i = 0; i < 32; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-i * Math.PI/16 - Math.PI/2), 10 * Math.sin(-i * Math.PI/16 - Math.PI/2), 10, "555tackproj3.png", Math.ceil(7 * 1.02 ** (this.degree - 1)), Math.ceil(50 * 1.02 ** (this.degree - 1)), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            } else if(this.towerType == "super") {
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //000, 010, 020
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //001, 011, 021
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "001superproj.png", 1, 1 + this.path2Upgrades, 10, 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //002, 012, 022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002superproj.png", 2, 1 + this.path2Upgrades, 20, 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //100, 110, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "100superproj.png", 1, 2 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //101, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "100superproj.png", 1 + Math.floor(this.path3Upgrades/2), 2 + this.path2Upgrades, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //200, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 1, 4 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //201, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 1 + Math.floor(this.path3Upgrades/2), 4 + this.path2Upgrades, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //300, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 8 + 2*this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 8 + 2*this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1, 8 + 2*this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //301, 302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1 + Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1 + Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "300superproj.png", 1 + Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //400, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400superproj.png", 10, 75 + 25 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //401, 402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "400superproj.png", 10 + 5 * Math.floor(this.path3Upgrades/2), 75, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //500, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, (15 + 6 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (15 + 6 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "400superproj.png", 60, 500 + 100 * this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades <= 2 && this.path3Upgrades > 0) {
                    //501, 502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "400superproj.png", 60 + 30 * Math.floor(this.path3Upgrades/2), 500, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //030
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "000dartproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 15, "130superproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 15, "200superproj.png", 2, 7, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 2, 4, 10, 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 2, 4, 10, 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "001superproj.png", 2, 4, 10, 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "001superproj.png", 2, 4, 10, 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 3, 4, 20, 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 10, "000dartproj.png", 3, 4, 20, 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002superproj.png", 3, 4, 20, 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "002superproj.png", 3, 4, 20, 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5 + 3 * Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5 + 3 * Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5 + 3 * Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 15, "040superproj.png", 5 + 3 * Math.floor(this.path3Upgrades/2), 8, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 15, "040superproj.png", 5, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (63)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 15, "040superproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12 + 6 * Math.floor(this.path3Upgrades/2), 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12 + 6 * Math.floor(this.path3Upgrades/2), 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12 + 6 * Math.floor(this.path3Upgrades/2), 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 20, "050superproj.png", 12 + 6 * Math.floor(this.path3Upgrades/2), 25, 10 * this.path3Upgrades, 5 * this.path3Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 20, "050superproj.png", 12, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (63)
                    if(Math.abs(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)) <= Math.PI/18) {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 18 * Math.sin(-Math.PI/36 + Math.atan2((bloons[this.target].y + bloons[this.target2].y)/2 - this.y, (bloons[this.target].x + bloons[this.target2].x)/2 - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 18 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 18 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 20, "050superproj.png", 12, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 3, 4 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, 14 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 14 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 3, 5, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 14 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 14 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 3, 7, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 5, 7 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 5, 7 + this.path2Upgrades, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 5, 8, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 5, 8, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 5, 10, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 5, 10, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 12, 14 + 2 * this.path2Upgrades, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path2Upgrades) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 4 * this.path2Upgrades) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "003superproj.png", 12, 14 + 2 * this.path2Upgrades, 30, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 12, 15, 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "103superproj.png", 12, 15, 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (63)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 12, 17, 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "203superproj.png", 12, 17, 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 6 || this.path2Upgrades == 6 || this.path3Upgrades == 6) {
                    //500, 510, 520
                    this.attackSpeed = this.towerBoosted * this.slowSabotaged * (37)
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "555superproj1.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 20, "555superproj1.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 20, "555superproj1.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "555superproj2.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) + 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 20, "555superproj2.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 27 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 27 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x) - 0.25 * Math.PI * (Math.sin(this.towerVar/5) ** 3)), 20, "555superproj2.png", Math.ceil(160 * 1.02 ** (this.degree - 1)), Math.ceil(1000 * 1.02 ** (this.degree - 1)), 40, 20, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            } else if(this.towerType == "bomb") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //000, 001, 010, 100, 011, 101, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "000bombproj.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //200, 201, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "000bombproj.png", 1, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 1) {
                    //020, 021, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "020bombproj.png", 1, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "020bombproj.png", 1, 35, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 2) {
                    //002, 012, 102, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "002bombprojmain.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    /*for(var i = 0; i < 4; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin((Math.random() * 2 - 1) * Math.PI/4 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "002bombproj.png", 1, 2 + this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }*/
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "022bombprojmain.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //300, 301, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 1, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 1, 45, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "302bombprojmain.png", 1, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //400, 401, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 2, 50, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 2, 55, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "302bombprojmain.png", 2, 50, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 1) {
                    //500, 501, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "300bombproj.png", 8, 75, 50, 25, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "020bombproj.png", 8, 80, 50, 25, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 25, "302bombprojmain.png", 8, 75, 50, 25, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 1) {
                    //030, 031, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "030bombproj.png", 2, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "032bombprojmain.png", 2, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 1) {
                    //040, 041, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "040bombproj.png", 5, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "042bombprojmain.png", 5, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 1) {
                    //050, 051, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "050bombproj.png", 18, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "052bombprojmain.png", 18, 15 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "003bombprojmain.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 15 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "003bombprojmain.png", 1, 15, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "003bombprojmain.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "004bombprojmain.png", 2, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "003bombprojmain.png", 1, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "004bombprojmain.png", 2, 10 + 10 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "004bombprojmain.png", 2, 20 + 20 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.75 ** 2)
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 + 5 * this.path1Upgrades, "004bombprojmain.png", 2, 20 + 20 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            } else if(this.towerType == "ice") {
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //000, 001, 010, 011, 012
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //020, 021, 022
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //100, 101, 102, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //200, 201, 202, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 10, "300iceproj.png", 1, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 10, "300iceproj.png", 1, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 3, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 10, "300iceproj.png", 2, 6, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 3, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 16; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 10, "300iceproj.png", 2, 6, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 5, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 24; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), (10 + 4 * this.path3Upgrades) * (Math.random() * 2 - 1), 15, "300iceproj.png", 4, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 5, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 24; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * (Math.random() * 2 - 1), 10 * (Math.random() * 2 - 1), 15, "300iceproj.png", 4, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 50, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 50, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 50, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 120, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 120, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 120, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "000iceproj.png", 1, 300, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 1, 300, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, this.range, "100iceproj.png", 2, 300, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** (this.path2Upgrades + 1))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003iceproj.png", 2, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "103iceproj.png", 2, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "103iceproj.png", 3, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** (this.path2Upgrades + 2))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003iceproj.png", 3, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003iceproj.png", 3, 30, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "103iceproj.png", 3, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "103iceproj.png", 4, 20, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** (this.path2Upgrades + 2))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "005iceproj.png", 10, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 3)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "005iceproj.png", 10, 50, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "105iceproj.png", 10, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** 2)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "105iceproj.png", 15, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            } else if(this.towerType == "wizard") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 100, 101, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades <= 2) {
                    //010, 011, 012, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //020, 021, 022, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //200, 201, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //300, 301, 302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75)/2
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75)/2
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 2, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75)/2
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 2, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 3, 7 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //400, 401, 402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)/2
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)/2
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 4, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 2)/2
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 4, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 6, 15 + 7 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades <= 2) {
                    //500, 501, 502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 4)/2
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * this.path3Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 4)/2
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 8, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500 * 0.75 ** 4)/2
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 8, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 10, 30 + 15 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 20 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 1, 3 + 2 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 20 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 20 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 20 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 20 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 20 + 10 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 6 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 2, 6 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 20 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 20 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 1, 20 + 10 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 3, 6, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 3, 6, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 20 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 11 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(i * Math.PI/4), (10 + 2.5 * this.path1Upgrades) * Math.sin(i * Math.PI/4), 15, "010wizardproj.png", 3, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 12 + 6 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 12 + 6 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 4, 12 + 6 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (100)/2
                    this.towerVar++
                    this.random = Math.random()
                    if(this.towerVar % 11 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "010wizardproj.png", 1, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(i * Math.PI/4), (10 + 2.5 * this.path1Upgrades) * Math.sin(i * Math.PI/4), 15, "010wizardproj.png", 3, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/18 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random - Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, (7.5 + 2.5 * this.path1Upgrades) * Math.cos(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (7.5 + 2.5 * this.path1Upgrades) * Math.sin(Math.PI/18 * this.random + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "030wizardproj.png", 5, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 15 == 1) {
                       projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    if(this.towerVar % 15 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 40 + 20 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //003, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 5) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 5) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 3) {
                    //013
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 5) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.2 && this.lightningCount < 5) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //004, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 0, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4 && this.lightningCount < 13) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 0, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4 && this.lightningCount < 13) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 4) {
                    //014
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 0, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4 && this.lightningCount < 13) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 100, 100, 0, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4 && this.lightningCount < 13) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 1, 10, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                                this.lightningCount++
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //005, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 250, 100, 50, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                            }
                        }
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000wizardproj.png", 2, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 250, 100, 50, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 5) {
                    //015
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 250, 100, 50, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                            }
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1500)/2
                    this.lightningCount = 0
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "010wizardproj.png", 1, 10 + 5 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000wizardproj.png", 1, 5 + 3 * Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.lightningCount++
                    if(this.towerVar % 3 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * this.path1Upgrades) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * this.path1Upgrades) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 45, "004wizardproj.png", 1, 250, 100, 50, this.towerID, this.playerSide, true))
                    }
                    for(var i = 0; i < bloons.length; i++) {
                        if(Math.sqrt((bloons[i].x - this.x) ** 2 + (bloons[i].y - this.y) ** 2) <= this.range &&  bloons[i].playerSide == this.playerSide) {
                            if(Math.random() <= 0.4) {
                                projectiles.push(new Projectile(bloons[i].x, bloons[i].y, 0, 0, 45, "003wizardproj.png", 3, 40, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                            }
                        }
                    }
                }
            } else if(this.towerType == "cobra") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 5 && this.path3Upgrades == 0) {
                    //most cobras
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 5 && this.path3Upgrades >= 1) {
                    //double tap
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades <= 5 && this.path3Upgrades == 0) {
                    //3x0+
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 6, 1, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades <= 5 && this.path3Upgrades >= 1) {
                    //301+
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 6, 1, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
            } else if(this.towerType == "boomer") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                    //000, 001, 010, 011, 020, 021, 100, 101, 110, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000boomerproj.png", 1, 4 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //002, 012, 022, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002boomerproj.png", 2, 4 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                    //200, 201, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200boomerproj.png", 1, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "202boomerproj.png", 2, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                    //300, 301, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200boomerproj.png", 1, 30, 0, 0, this.towerID, this.playerSide, true))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "202boomerproj.png", 2, 30, 0, 0, this.towerID, this.playerSide, true))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                    //400, 401, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200boomerproj.png", 1, 50, 0, 0, this.towerID, this.playerSide, true))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "202boomerproj.png", 2, 50, 0, 0, this.towerID, this.playerSide, true))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                    //500, 501, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "500boomerproj.png", 4, 200, 0, 0, this.towerID, this.playerSide, true))
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, 70, "500boomerproj2.png", 1, 333, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "502boomerproj.png", 7, 200, 0, 0, this.towerID, this.playerSide, true))
                    projectiles.push(new Projectile(this.x, this.y, 0, 0, 70, "502boomerproj2.png", 2, 333, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 1) {
                    //030, 031, 130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 333
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000boomerproj.png", 2, 4 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 333
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002boomerproj.png", 4, 4 + 4 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 1) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 333
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200boomerproj.png", 2, 12, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 1) {
                    //040, 041, 140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 250
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000boomerproj.png", 3, 8 + 8 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 250
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002boomerproj.png", 6, 8 + 8 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 1) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 250
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "200boomerproj.png", 3, 24, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 1) {
                    //050, 051, 150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 75
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "050boomerproj.png", 5, 12 + 12 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 75
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "052boomerproj.png", 11, 12 + 12 * this.path1Upgrades, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 1) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 75
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "250boomerproj.png", 5, 36, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "002boomerproj.png", 3, 6 + 6 * this.path1Upgrades, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "202boomerproj.png", 3, 18, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "002boomerproj.png", 3, 9 + 9 * this.path1Upgrades, 50, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "202boomerproj.png", 3, 27, 50, 15, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (333 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "002boomerproj.png", 7, 18 + 18 * this.path1Upgrades, 100, 50, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (333 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "202boomerproj.png", 7, 54, 100, 50, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            } else if(this.towerType == "sniper") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 010, 011, 012, 101, 102, 110
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //200, 201, 202, 210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //020, 021, 022, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 310
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 20, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 20, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 3, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //400, 401, 402, 410
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 75, 1 + this.path2Upgrades, 0, 100, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 75, 2, 0, 100, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 12, 2, 0, 100, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 1 && this.path3Upgrades <= 2) {
                    //500, 501, 502, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 500, 1 + this.path2Upgrades, 0, 100, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades <= 2) {
                    //520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 500, 2, 0, 100, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 75, 2, 0, 100, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 3, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 3, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 3, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 7, 3, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 3, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades * 0.85)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 4, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 4, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades * 0.85)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 4, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 7, 4, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 4, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades * 0.85 * 0.75)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 5, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 5, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target3].x, bloons[this.target3].y, 10 * Math.cos(Math.atan2(bloons[this.target3].y - this.y, bloons[this.target3].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target3].y - this.y, bloons[this.target3].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 5, 0, 0, this.towerID, this.playerSide, false, this.target3))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target3].x + bloons[this.target3].radius * Math.cos(i * Math.PI/4), bloons[this.target3].y + bloons[this.target3].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target4].x, bloons[this.target4].y, 10 * Math.cos(Math.atan2(bloons[this.target4].y - this.y, bloons[this.target4].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target4].y - this.y, bloons[this.target4].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 5, 0, 0, this.towerID, this.playerSide, false, this.target4))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target4].x + bloons[this.target4].radius * Math.cos(i * Math.PI/4), bloons[this.target4].y + bloons[this.target4].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path3Upgrades * 0.85 * 0.75)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 5, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target2].x, bloons[this.target2].y, 10 * Math.cos(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target2].y - this.y, bloons[this.target2].x - this.x)), 10, "", 7, 5, 0, 0, this.towerID, this.playerSide, false, this.target2))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target2].x + bloons[this.target2].radius * Math.cos(i * Math.PI/4), bloons[this.target2].y + bloons[this.target2].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target3].x, bloons[this.target3].y, 10 * Math.cos(Math.atan2(bloons[this.target3].y - this.y, bloons[this.target3].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target3].y - this.y, bloons[this.target3].x - this.x)), 10, "", 7, 5, 0, 0, this.towerID, this.playerSide, false, this.target3))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target3].x + bloons[this.target3].radius * Math.cos(i * Math.PI/4), bloons[this.target3].y + bloons[this.target3].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(bloons[this.target4].x, bloons[this.target4].y, 10 * Math.cos(Math.atan2(bloons[this.target4].y - this.y, bloons[this.target4].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target4].y - this.y, bloons[this.target4].x - this.x)), 10, "", 7, 5, 0, 0, this.towerID, this.playerSide, false, this.target4))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target4].x + bloons[this.target4].radius * Math.cos(i * Math.PI/4), bloons[this.target4].y + bloons[this.target4].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //003, 013, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 3)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 3)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 3)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 2 + 2 * this.path1Upgrades, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 1, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 6)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 3 + 4 * this.path1Upgrades, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 6)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 12, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 6)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 3 + 4 * this.path1Upgrades, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 2, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 18)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 7 + 4 * this.path1Upgrades, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 18)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 18, 1 + this.path2Upgrades, 0, 0, this.towerID, this.playerSide, false, this.target))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** 2 / 18)
                    projectiles.push(new Projectile(bloons[this.target].x, bloons[this.target].y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "", 5 + 2 * this.path1Upgrades, 2, 0, 0, this.towerID, this.playerSide, false, this.target))
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(bloons[this.target].x + bloons[this.target].radius * Math.cos(i * Math.PI/4), bloons[this.target].y + bloons[this.target].radius * Math.sin(i * Math.PI/4), 15 * Math.cos(i * Math.PI/4), 15 * Math.sin(i * Math.PI/4), 5, "020sniperproj.png", 4, 2, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            } else if(this.towerType == "ninja") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades <= 0) {
                    //000, 010, 020, 100, 110, 120
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "000ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 0) {
                    //200, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //001, 011, 021, 101
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //201
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //002, 012, 022, 102
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 0) {
                    //300, 310, 320
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 0) {
                    //400, 410, 420
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //401
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        for(var i = 0; i < 5; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/24 - Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 0) {
                    //500, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 2, Math.ceil(8 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 2.5 * this.path2Upgrades, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //501
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 2, Math.ceil(8 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (182.5 * 0.9 ** this.shinobiStacks * 0.75)
                    for(var i = 0; i < 8; i++) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 5, 1, 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.PI * i/32 - 7*Math.PI/64 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 2, Math.ceil(8 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 0) {
                    //030, 130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "000ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "200ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 2, Math.ceil(1 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 0) {
                    //040, 140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "040ninjaproj.png", 2, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "240ninjaproj.png", 2, Math.ceil(6 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades == 1) {
                    //041
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "041ninjaproj.png", 2, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //042
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 3, Math.ceil(1 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "041ninjaproj.png", 2, Math.ceil(3 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 0) {
                    //050, 150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "050ninjaproj.png", 3, Math.ceil(6 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "250ninjaproj.png", 3, Math.ceil(8 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades == 1) {
                    //051
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (750 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "051ninjaproj.png", 3, Math.ceil(4 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //052
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 5, Math.ceil(1 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    this.towerVar++
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "051ninjaproj.png", 3, Math.ceil(4 * 1.1 ** this.shinobiStacks), 50, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003ninjaproj.png", 2, Math.ceil(10 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 3, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003ninjaproj.png", 2, Math.ceil(10 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 3, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** this.path1Upgrades)
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003ninjaproj.png", 3, Math.ceil(20 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 2.5 * this.path2Upgrades + 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 4, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(3 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75)
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "003ninjaproj.png", 3, Math.ceil(20 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 2.5 * this.path2Upgrades + 5, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 4, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(6 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** (this.path1Upgrades + 1))
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003ninjaproj.png", 8, Math.ceil(50 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 4 * this.path2Upgrades + 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 8, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "001ninjaproj.png", 1, Math.ceil(4 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (375 * 0.9 ** this.shinobiStacks * 0.75 ** 2)
                    this.towerVar++
                    if(this.towerVar % 3 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20, "003ninjaproj.png", 8, Math.ceil(50 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades + 25, 4 * this.path2Upgrades + 10, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002ninjaproj.png", 8, Math.ceil(1 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 2 == 0) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 12.5, "201ninjaproj.png", 1, Math.ceil(8 * 1.1 ** this.shinobiStacks), 25 * this.path2Upgrades, 0, this.towerID, this.playerSide, true, -1, 0, 0, 0, 0, 0))
                    }
                }
            } else if(this.towerType == "engi") {
                if(this.path1Upgrades <= 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                    //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220, 300, 301, 302, 310, 320, 400, 401, 402, 410, 420, 500, 501, 502, 510, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 1 + Math.floor(this.path2Upgrades/2), 4 + 4 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "030engiproj.png", 2, 10 + 10 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 2, 4 + 4 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "030engiproj.png", 2, 20 + 20 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 2, 14 + 14 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 1000
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "030engiproj.png", 2, 40 + 20 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 2, 28 + 14 * this.path3Upgrades, 50 * Math.floor(this.path3Upgrades/2), 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades >= 3) {
                    //003, 013, 023, 103, 203, 004, 014, 024, 104, 204, 005, 015, 025, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * 500
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000tackproj.png", 1 + Math.floor(this.path2Upgrades/2), 8, 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            } else if(this.towerType == "buccaneer") {
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 0 && this.path3Upgrades <= 3) {
                    //000, 001, 002, 100, 101, 102, 003, 103
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 0 && this.path3Upgrades <= 3) {
                    //200, 201, 202, 203
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades <= 3) {
                    //010, 011, 012, 110, 013
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "010buccaneerproj.png", 1, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 1 && this.path3Upgrades <= 0) {
                    //210
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "010buccaneerproj.png", 1, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades <= 3) {
                    //020, 021, 022, 120, 023
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades <= 0 && this.path3Upgrades <= 2) {
                    //300, 301, 302, 400, 401, 402, 500, 501, 502
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades == 1 && this.path3Upgrades <= 0) {
                    //310, 410, 510
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "010buccaneerproj.png", 1, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades >= 3 && this.path2Upgrades == 2 && this.path3Upgrades <= 0) {
                    //320, 420, 520
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 1, 15 + 7 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 0) {
                    //230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 1, 15 + 7 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 3, 3 + 2 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))

                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 0) {
                    //240
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 3, 3 + 2 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 3, 22 + 11 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 4, 8 + 4 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))

                }
                if(this.path1Upgrades == 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 0) {
                    //250
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 6; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI * 5/24 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 4, 8 + 4 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/12 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "000bombproj.png", 6, 44 + 22 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))

                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 0 && this.path3Upgrades == 4) {
                    //004, 104
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 0 && this.path3Upgrades == 4) {
                    //204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 4) {
                    //014
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "010buccaneerproj.png", 1, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 1, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades <= 0 && this.path3Upgrades == 5) {
                    //005, 105
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 2 && this.path2Upgrades <= 0 && this.path3Upgrades == 5) {
                    //205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(-Math.PI/36 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 1 && this.path3Upgrades == 5) {
                    //015
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "010buccaneerproj.png", 2, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 1 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** Math.ceil(this.path1Upgrades/10))
                    this.towerVar++
                    projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "000dartproj.png", 2, 5 + 3 * Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    for(var i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(this.x, this.y, (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.cos(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), (10 + 2.5 * Math.ceil(this.path3Upgrades/10)) * Math.sin(Math.PI * i/12 - Math.PI/6 + Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10, "020buccaneerproj.png", 4, 2 + Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            } else if(this.towerType == "sword") {
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //000, 010, 020, 100, 110, 120, 200, 210, 220
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //001, 011, 021, 101, 201
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //002, 012, 022, 102, 202
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //300
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", 3, 18, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 3, 18, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 3, 18, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 3, 5, 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //400
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 1000) {
                                this.towerVar = 1000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", Math.floor(3 * this.towerVar/500 + 3), Math.floor(18 * this.towerVar/500 + 18), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //401
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 1000) {
                                this.towerVar = 1000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", Math.floor(3 * this.towerVar/500 + 3), Math.floor(18 * this.towerVar/500 + 18), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //402
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 1000) {
                                this.towerVar = 1000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", Math.floor(3 * this.towerVar/500 + 3), Math.floor(18 * this.towerVar/500 + 18), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", Math.floor(3 * this.towerVar/500 + 3), Math.floor(5 * this.towerVar/500 + 5), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 0) {
                    //500
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 100000) {
                                this.towerVar = 100000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", Math.floor(9 * this.towerVar/25000 + 9), Math.floor(54 * this.towerVar/25000 + 54), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 1) {
                    //501
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 100000) {
                                this.towerVar = 100000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", Math.floor(9 * this.towerVar/25000 + 9), Math.floor(54 * this.towerVar/25000 + 54), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                    //502
                    this.towerVar = 0
                    for(var i = 0; i < bloons.length; i++) {
                        if(bloons[i].playerSide == this.playerSide) {
                            this.towerVar += bloons[i].health
                            if(this.towerVar >= 100000) {
                                this.towerVar = 100000
                                break
                            }
                        }
                    }
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", Math.floor(9 * this.towerVar/25000 + 9), Math.floor(54 * this.towerVar/25000 + 54), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", Math.floor(9 * this.towerVar/25000 + 9), Math.floor(15 * this.towerVar/25000 + 15), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 0) {
                    //030, 130, 230
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 1) {
                    //031
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                    //032
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 0) {
                    //040, 140, 240
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "040swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 1) {
                    //041
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "040swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                    //042
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "042swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 0) {
                    //050, 150, 250
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x + 50 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 50 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 25, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "050swordproj.png", 3 + 2 * Math.floor(this.path1Upgrades/2), 333 + 167 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(i * Math.PI/4), 20 * Math.sin(i * Math.PI/4), 40, "040swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 1) {
                    //051
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "050swordproj.png", 3 + 2 * Math.floor(this.path1Upgrades/2), 333 + 167 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(i * Math.PI/4), 20 * Math.sin(i * Math.PI/4), 40, "040swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                    //052
                    this.towerVar++
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (250)
                    projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 20 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 40, "052swordproj.png", 3 + 2 * Math.floor(this.path1Upgrades/2), 333 + 167 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.towerVar % 4 == 1) {
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 20 * Math.cos(i * Math.PI/4), 20 * Math.sin(i * Math.PI/4), 40, "042swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                        for(var i = 0; i < 8; i++) {
                            projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(i * Math.PI/4), 10 * Math.sin(i * Math.PI/4), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                    //003, 013, 023, 103, 203
                    this.random = Math.random()
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1000 * 0.75 ** this.path2Upgrades)
                    projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    if(this.playerSide == 1) {
                        projectiles.push(new Projectile((this.random * 3/8 + 1/8) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 15, "003swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 10 + 5 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        projectiles.push(new Projectile((this.random * 3/8 + 1/2) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 15, "003swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 10 + 5 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                    //004, 014, 024, 104, 204
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    for(var i = 0; i < 3; i++) {
                        this.random = Math.random()
                        if(this.playerSide == 1) {
                            projectiles.push(new Projectile((this.random * 3/8 + 1/8) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 15, "003swordproj.png", 2 + Math.floor(this.path1Upgrades/2), 25 + 12 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        } else {
                            projectiles.push(new Projectile((this.random * 3/8 + 1/2) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 15, "003swordproj.png", 2 + Math.floor(this.path1Upgrades/2), 25 + 12 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                    //005, 015, 025, 105, 205
                    this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (500 * 0.75 ** this.path2Upgrades)
                    this.towerVar++
                    if(this.towerVar % 2 == 1) {
                        projectiles.push(new Projectile(this.x + 75 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), this.y + 75 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 0, 0, 37.5, "000swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 8 + 4 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        projectiles.push(new Projectile(this.x, this.y, 10 * Math.cos(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 10 * Math.sin(Math.atan2(bloons[this.target].y - this.y, bloons[this.target].x - this.x)), 15, "002swordproj.png", 1 + Math.floor(this.path1Upgrades/2), 3 + 2 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                    for(var i = 0; i < 5; i++) {
                        this.random = Math.random()
                        if(this.playerSide == 1) {
                            projectiles.push(new Projectile((this.random * 3/8 + 1/8) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/8) * canvas.width)), 25, "005swordproj.png", 2 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        } else {
                            projectiles.push(new Projectile((this.random * 3/8 + 1/2) * canvas.width, 0, 20 * Math.cos(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 20 * Math.sin(Math.atan2(bloons[this.target].y, bloons[this.target].x - (this.random * 3/8 + 1/2) * canvas.width)), 25, "005swordproj.png", 2 + Math.floor(this.path1Upgrades/2), 100 + 50 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                        }
                    }
                }
            }
        }
        if(this.towerType == "farm") {
            if(roundReady == false) {
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //000, 100, 200
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //010, 110, 210
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 20000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //020, 120, 220
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 20000, false, 60, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //300
                    this.attackSpeed = (2000)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //310
                    this.attackSpeed = (2000)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 20000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //320
                    this.attackSpeed = (2000)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 20000, false, 60, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //400
                    this.attackSpeed = (10000)/1
                    this.random = Math.random()
                    var bananaCentralBuffed = false
                    for(var i = 0; i < towers.length; i++) {
                        if(towers[i].towerType == "farm" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                            bananaCentralBuffed = true
                            break
                        }
                    }
                    if(bananaCentralBuffed) {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 690, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 600, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //410
                    this.attackSpeed = (10000)/1
                    this.random = Math.random()
                    var bananaCentralBuffed = false
                    for(var i = 0; i < towers.length; i++) {
                        if(towers[i].towerType == "farm" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                            bananaCentralBuffed = true
                            break
                        }
                    }
                    if(bananaCentralBuffed) {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 690, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 600, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //420
                    this.attackSpeed = (10000)/1
                    this.random = Math.random()
                    var bananaCentralBuffed = false
                    for(var i = 0; i < towers.length; i++) {
                        if(towers[i].towerType == "farm" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                            bananaCentralBuffed = true
                            break
                        }
                    }
                    if(bananaCentralBuffed) {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 1035, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 900, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 0) {
                    //500
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 2500, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 1 && this.path3Upgrades == 0) {
                    //510
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 2500, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 2 && this.path3Upgrades == 0) {
                    //520
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "410farmproj.png", gameNow() + 20000, false, 3750, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //001, 101, 201
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //002, 102, 202
                    this.attackSpeed = (7500 - 1500 * this.path1Upgrades)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, true, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //301
                    this.attackSpeed = (2000)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 3 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //302
                    this.attackSpeed = (2000)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "000farmproj.png", gameNow() + 10000, true, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //401
                    this.attackSpeed = (10000)/1
                    this.random = Math.random()
                    var bananaCentralBuffed = false
                    for(var i = 0; i < towers.length; i++) {
                        if(towers[i].towerType == "farm" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                            bananaCentralBuffed = true
                            break
                        }
                    }
                    if(bananaCentralBuffed) {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 750, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 600, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 4 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //402
                    this.attackSpeed = (10000)/1
                    this.random = Math.random()
                    var bananaCentralBuffed = false
                    for(var i = 0; i < towers.length; i++) {
                        if(towers[i].towerType == "farm" && towers[i].path1Upgrades == 5 && towers[i].playerSide == this.playerSide) {
                            bananaCentralBuffed = true
                            break
                        }
                    }
                    if(bananaCentralBuffed) {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, true, 750, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    } else {
                        bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, true, 600, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 1) {
                    //501
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, false, 3000, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 5 && this.path2Upgrades == 0 && this.path3Upgrades == 2) {
                    //502
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 25, "400farmproj.png", gameNow() + 10000, true, 3000, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 1 && this.path3Upgrades == 1) {
                    //011
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 15000, false, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 1 && this.path3Upgrades == 2) {
                    //012
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 15000, true, 40, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 1) {
                    //021
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 15000, false, 60, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades == 0 && this.path2Upgrades == 2 && this.path3Upgrades == 2) {
                    //022
                    this.attackSpeed = (7500)/1
                    this.random = Math.random()
                    bananas.push(new Banana(Math.random() * this.range * Math.cos(this.random*2*Math.PI) + this.x, Math.random() * this.range * Math.sin(this.random*2*Math.PI) + this.y, 15, "010farmproj.png", gameNow() + 15000, true, 60, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                    //030, 031, 032, 130, 230
                    this.attackSpeed = (2500 - 500 * this.path1Upgrades)/1
                    if(this.towerVar < 14000) {
                        this.towerVar += Math.trunc(40 * ((3/28000) * this.towerVar + 1))
                    }
                    if(this.towerVar > 14000) {
                        if(this.path3Upgrades == 2) {
                            if(this.playerSide == 1) {
                                p1money += 14000
                                p1TotalCashGenerated += 14000
                            } else {
                                p2money += 14000
                                p2TotalCashGenerated += 14000
                            }
                            this.popCount += 14000
                            this.towerVar = 0
                            moneyText.push(new MoneyText(this.x, this.y, 14000))
                        } else {
                            this.towerVar = 14000
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                    //040, 041, 042, 140, 240
                    this.attackSpeed = (2500 - 500 * this.path1Upgrades)/1
                    if(this.towerVar < 20000) {
                        this.towerVar += Math.trunc(80 * ((3/28000) * this.towerVar + 1))
                    }
                    if(this.towerVar > 20000) {
                        if(this.path3Upgrades == 2) {
                            if(this.playerSide == 1) {
                                p1money += 20000
                                p1TotalCashGenerated += 20000
                            } else {
                                p2money += 20000
                                p2TotalCashGenerated += 20000
                            }
                            this.popCount += 20000
                            this.towerVar = 0
                            moneyText.push(new MoneyText(this.x, this.y, 20000))
                        } else {
                            this.towerVar = 20000
                        }
                    }
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                    //050, 051, 052, 150, 250
                    this.attackSpeed = (2500 - 500 * this.path1Upgrades)/1
                    if(this.towerVar < 30000) {
                        this.towerVar += Math.trunc(160 * ((3/28000) * this.towerVar + 1))
                    }
                    if(this.towerVar > 30000) {
                        if(this.path3Upgrades == 2) {
                            if(this.playerSide == 1) {
                                p1money += 30000
                                p1TotalCashGenerated += 30000
                            } else {
                                p2money += 30000
                                p2TotalCashGenerated += 30000
                            }
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
                    this.attackSpeed = (5000 - 1000 * this.path1Upgrades)/1
                    if(this.playerSide == 1) {
                        p1money += 40
                        p1TotalCashGenerated += 40
                    } else {
                        p2money += 40
                        p2TotalCashGenerated += 40
                    }
                    this.popCount += 40
                    moneyText.push(new MoneyText(this.x, this.y, 40))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 3) {
                    //023
                    this.attackSpeed = (5000)/1
                    if(this.playerSide == 1) {
                        p1money += 60
                        p1TotalCashGenerated += 60
                    } else {
                        p2money += 60
                        p2TotalCashGenerated += 60
                    }
                    this.popCount += 60
                    moneyText.push(new MoneyText(this.x, this.y, 60))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 4) {
                    //004, 014, 104, 204
                    this.attackSpeed = (4500 - 900 * this.path1Upgrades)/1
                    if(this.playerSide == 1) {
                        p1money += 160
                        p1TotalCashGenerated += 160
                    } else {
                        p2money += 160
                        p2TotalCashGenerated += 160
                    }
                    this.popCount += 160
                    moneyText.push(new MoneyText(this.x, this.y, 160))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 4) {
                    //024
                    this.attackSpeed = (4500)/1
                    if(this.playerSide == 1) {
                        p1money += 240
                        p1TotalCashGenerated += 240
                    } else {
                        p2money += 240
                        p2TotalCashGenerated += 240
                    }
                    this.popCount += 240
                    moneyText.push(new MoneyText(this.x, this.y, 240))
                }
                if(this.path1Upgrades <= 2 && this.path2Upgrades <= 1 && this.path3Upgrades == 5) {
                    //005, 015, 105, 205
                    this.attackSpeed = (2250 - 450 * this.path1Upgrades)/1
                    if(this.playerSide == 1) {
                        p1money += 320
                        p1TotalCashGenerated += 320
                    } else {
                        p2money += 320
                        p2TotalCashGenerated += 320
                    }
                    this.popCount += 320
                    moneyText.push(new MoneyText(this.x, this.y, 320))
                }
                if(this.path1Upgrades <= 0 && this.path2Upgrades == 2 && this.path3Upgrades == 5) {
                    //025
                    this.attackSpeed = (2250)/1
                    if(this.playerSide == 1) {
                        p1money += 480
                        p1TotalCashGenerated += 480
                    } else {
                        p2money += 480
                        p2TotalCashGenerated += 480
                    }
                    this.popCount += 480
                    moneyText.push(new MoneyText(this.x, this.y, 480))
                }
            }
        } else if(this.towerType == "dartling") {
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //000, 001, 002, 010, 011, 012, 020, 021, 022, 100, 101, 102, 110, 120, 200, 201, 202, 210, 220
                this.attackSpeed = this.getDartlingAttackSpeed(200)
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "000dartproj.png", 1+1*Math.floor(this.path1Upgrades/2), 2+2*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //300, 301, 302, 310, 320
                this.attackSpeed = this.getDartlingAttackSpeed(200)
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((2 * this.random * Math.PI/90 - 2 * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((2 * this.random * Math.PI/90 - 2 * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "130superproj.png", 3, 4+4*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //400, 401, 402, 410, 420
                this.attackSpeed = this.getDartlingAttackSpeed(100)
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos(Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin(Math.atan2(this.targetY - this.y, this.targetX - this.x)), 15+3.75*Math.ceil(this.path3Upgrades/10), "130superproj.png", 2, 40+40*Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 2) {
                //500, 501, 502, 510, 520
                this.attackSpeed = this.getDartlingAttackSpeed(100)
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos(Math.atan2(this.targetY - this.y, this.targetX - this.x)), (12.5+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin(Math.atan2(this.targetY - this.y, this.targetX - this.x)), 20+5*Math.ceil(this.path3Upgrades/10), "130superproj.png", 5, 200+200*Math.ceil(this.path3Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 2) {
                //030, 031, 032, 130, 230
                this.attackSpeed = this.getDartlingAttackSpeed(200)
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 2) {
                //040, 041, 042, 140, 240
                this.attackSpeed = this.getDartlingAttackSpeed(200)
                this.towerVar++
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                if(this.towerVar % 7 == 1) {
                    for(var i = 0; i < 10; i++) {
                        this.random = Math.random()
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "030dartlingproj.png", 1+1*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 2) {
                //050, 051, 052, 150, 250
                this.attackSpeed = this.getDartlingAttackSpeed(1000)
                this.towerVar++
                this.random = Math.random()
                projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((10/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 10/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "050dartlingproj.png", 100+50*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                if(this.towerVar % 3 == 1) {
                    for(var i = 0; i < 10; i++) {
                        this.random = Math.random()
                        projectiles.push(new Projectile(this.x, this.y, 12.5 * Math.cos((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5 * Math.sin((60/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 60/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 10+2.5*Math.ceil(this.path3Upgrades/10), "050dartlingproj.png", 100+50*Math.floor(this.path1Upgrades/2), 10+20*Math.floor(this.path3Upgrades/2), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                    }
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                //003, 013, 023, 103, 203
                this.attackSpeed = this.getDartlingAttackSpeed(800)
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 2+1*Math.floor(this.path1Upgrades/2), 4, 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                //004, 014, 024, 104, 204
                this.attackSpeed = this.getDartlingAttackSpeed(200)
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 3+1*Math.floor(this.path1Upgrades/2), 4, 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                //005, 015, 025, 105, 205
                this.attackSpeed = this.getDartlingAttackSpeed(133)
                for(var i = 0; i < 6; i++) {
                    this.random = Math.random()
                    projectiles.push(new Projectile(this.x, this.y, (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.cos((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), (10+2.5*(Math.ceil(this.path2Upgrades/10))) * Math.sin((30/(1+Math.ceil(this.path1Upgrades/10)) * this.random * Math.PI/90 - 30/(1+Math.ceil(this.path1Upgrades/10)) * Math.PI/180) + Math.atan2(this.targetY - this.y, this.targetX - this.x)), 12.5, "003dartlingproj.png", 7+4*Math.floor(this.path1Upgrades/2), 12, 50, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
                }
            }
        } else if(this.towerType == "mortar") {
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                //000, 001, 010, 011, 020, 021, 100, 101, 110, 120, 200, 201, 210, 220
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 1 + Math.floor(this.path1Upgrades/2), 15 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                //002, 012, 022, 102, 202
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 1 + Math.floor(this.path1Upgrades/2), 15 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                //300, 301, 310, 320
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 87, "explosion.png", 2, 30, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 3 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                //302
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 87, "explosion.png", 2, 30, 25, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                //400, 401, 410, 420
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 136, "explosion.png", 3, 100, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 4 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                //402
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 136, "explosion.png", 3, 100, 25, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades <= 1) {
                //500, 501, 510, 520
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 204, "explosion.png", 8, 400, 25, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades == 5 && this.path2Upgrades <= 2 && this.path3Upgrades == 2) {
                //502
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 204, "explosion.png", 8, 400, 50, 10, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades <= 1) {
                //030, 031, 130, 230
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 1 + Math.floor(this.path1Upgrades/2), 25 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 3 && this.path3Upgrades == 2) {
                //032
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 1 + Math.floor(this.path1Upgrades/2), 25 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades <= 1) {
                //040, 041, 140, 240
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (417 * 0.75 ** 3)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 2 + Math.floor(this.path1Upgrades/2), 25 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 4 && this.path3Upgrades == 2) {
                //042
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (417 * 0.75 ** 3)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 2 + Math.floor(this.path1Upgrades/2), 25 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades <= 1) {
                //050, 051, 150, 250
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (178 * 0.75 ** 3)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 5 + 2 * Math.floor(this.path1Upgrades/2), 30 + 20 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 0, 0, 0, 0, 0))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades == 5 && this.path3Upgrades == 2) {
                //052
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (125 * 0.75 ** 3)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 5 + 2 * Math.floor(this.path1Upgrades/2), 30 + 20 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 1, 2, 3, gameNow() + 2000, 2000))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 3) {
                //003, 013, 023, 103, 203
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 1 + Math.floor(this.path1Upgrades/2), 15 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 1, 3, 6, gameNow() + 1000, 1000))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 4) {
                //004, 014, 024, 104, 204
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 2 + Math.floor(this.path1Upgrades/2), 15 + 10 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 5, 4, 15, gameNow() + 500, 500))
            }
            if(this.path1Upgrades <= 2 && this.path2Upgrades <= 2 && this.path3Upgrades == 5) {
                //005, 015, 025, 105, 205
                this.attackSpeed = this.cobraBoosted * this.towerBoosted * this.slowSabotaged * this.overclockFactor * (1250 * 0.75 ** this.path2Upgrades)
                projectiles.push(new Projectile(this.targetX, this.targetY, 0, 0, 50 + 15 * Math.ceil(this.path1Upgrades/10), "explosion.png", 5 + 2 * Math.floor(this.path1Upgrades/2), 30 + 20 * Math.ceil(this.path1Upgrades/10), 0, 0, this.towerID, this.playerSide, false, -1, 10, 5, 40, gameNow() + 250, 250))
            }
        }
        this.updateRotationAngle()
    }

    towerPlacementCheck(x, y, radius) {
        if(x + radius * 0.707 >= this.x - this.radius * 0.707 && x - radius * 0.707 <= this.x + this.radius * 0.707 && y + radius * 0.707 >= this.y - this.radius * 0.707 && y - radius * 0.707 <= this.y + this.radius  * 0.707) {
            return true
        } else {
            return false
        }
    }

    updateDPS(num) {
        this.dpsCount += num
        setTimeout(() => {
            this.dpsCount -= num
        }, 2000)
    }
}
