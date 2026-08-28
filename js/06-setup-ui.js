// Match setup, persistent globals, map layout, and shared UI initialization.

// Match-level toggles and counters.
var maxCounter = 0
var moneyFactor = 1
var autostart = true
var moabCount = 0
var bfbCount = 0
var zomgCount = 0
var mastery = false
var bossMode = false
var bossSpawned = false
var versionText = GAME_VERSION
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
var p1Boost1Count = BOOST_SETTINGS.charges
var p2Boost1Count = BOOST_SETTINGS.charges
var p1Boost2Count = BOOST_SETTINGS.charges
var p2Boost2Count = BOOST_SETTINGS.charges
var p1Boost1Expires = 0
var p2Boost1Expires = 0
var p1Boost2Expires = 0
var p2Boost2Expires = 0
var p1TowerBoostVisual = 0
var p2TowerBoostVisual = 0
var p1BloonBoostVisual = 0
var p2BloonBoostVisual = 0
var p1SlowBoostVisual = 0
var p2SlowBoostVisual = 0
var p1LightningBoostTicksRemaining = 0
var p2LightningBoostTicksRemaining = 0
var p1LightningBoostNextTick = 0
var p2LightningBoostNextTick = 0
var p1BoostTypes = []
var p2BoostTypes = []
var baseDartPrice = BASE_TOWER_PRICES.dart
var baseTackPrice = BASE_TOWER_PRICES.tack
var baseBombPrice = BASE_TOWER_PRICES.bomb
var baseIcePrice = BASE_TOWER_PRICES.ice
var baseSuperPrice = BASE_TOWER_PRICES.super
var baseFarmPrice = BASE_TOWER_PRICES.farm
var baseFarmerPrice = BASE_TOWER_PRICES.farmer
var baseDartlingPrice = BASE_TOWER_PRICES.dartling
var baseWizardPrice = BASE_TOWER_PRICES.wizard
var baseCobraPrice = BASE_TOWER_PRICES.cobra
var baseBoomerPrice = BASE_TOWER_PRICES.boomer
var baseSniperPrice = BASE_TOWER_PRICES.sniper
var baseNinjaPrice = BASE_TOWER_PRICES.ninja
var baseEngiPrice = BASE_TOWER_PRICES.engi
var baseBuccaneerPrice = BASE_TOWER_PRICES.buccaneer
var baseMortarPrice = BASE_TOWER_PRICES.mortar
var baseSwordPrice = BASE_TOWER_PRICES.sword
var p1decal = false
var p2decal = false
var p1TotalPopCount = 0
var p2TotalPopCount = 0
var p1TotalCashGenerated = 0
var p2TotalCashGenerated = 0
var p1CashGenWithEco = 0
var p2CashGenWithEco = 0
var keyMsCooldown = ECONOMY_SETTINGS.keyCooldownMs
var mapNumber = 0
var consoleAdjustments = 0
var p1AutoEco = false
var p2AutoEco = false
var practiceMode = false
var nonPlayableSide = 2
var fpsCounter = 0

// Runtime collections used by the main loop.
var bloons = []
var towers = []
var projectiles = []
var pathObjects = []
var UITowers = []
var UIBoosts = []
var bananas = []
var moneyText = []
var cursor = []
var images = []
var images2 = []
var boostIcons = []
var displayBloons = []
var keyCooldowns = []
var subtowers = []

// Offside map path points.
var a = new Point(0, 1/2)
var b = new Point(1/12, 1/2)
var c = new Point(1/6, 7/8)
var d = new Point(1/4, 1/2)
var f = new Point(1/3, 7/8)
var g = new Point(5/12, 11/16)
var h = new Point(1/3, 1/4)
var o = new Point(5/12, 1/8)
var p = new Point(1/2, 1/2)
var v = dist(a, b) + dist(b, c) + dist(c, d) + dist(d, f) + dist(f, g) + dist(g, h) + dist(h, o) + dist(o, p)

function dist(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
}

// Pre-fill the cooldown array so direct keycode indexing stays cheap.
for(var i = 0; i <= 192; i++) {
    keyCooldowns.push(0)
}

// Loadout selection UI.
UITowers.push(new DisplayTowers(31*canvas.width/48, canvas.height/4, 30, "000dart.png", "", baseDartPrice))
UITowers.push(new DisplayTowers(33*canvas.width/48, canvas.height/4, 30, "000tack.png", "", baseTackPrice))
UITowers.push(new DisplayTowers(35*canvas.width/48, canvas.height/4, 30, "000bomb.png", "", baseBombPrice))
UITowers.push(new DisplayTowers(37*canvas.width/48, canvas.height/4, 30, "000ice.png", "", baseIcePrice))
UITowers.push(new DisplayTowers(39*canvas.width/48, canvas.height/4, 30, "000super.png", "", baseSuperPrice))
UITowers.push(new DisplayTowers(41*canvas.width/48, canvas.height/4, 30, "000farm.png", "", baseFarmPrice))

UITowers.push(new DisplayTowers(31*canvas.width/48, canvas.height/3, 30, "000dartling.png", "", baseDartlingPrice))
UITowers.push(new DisplayTowers(33*canvas.width/48, canvas.height/3, 30, "000wizard.png", "", baseWizardPrice))
UITowers.push(new DisplayTowers(35*canvas.width/48, canvas.height/3, 30, "000cobra.png", "", baseCobraPrice))
UITowers.push(new DisplayTowers(37*canvas.width/48, canvas.height/3, 30, "000boomer.png", "", baseBoomerPrice))
UITowers.push(new DisplayTowers(39*canvas.width/48, canvas.height/3, 30, "000sniper.png", "", baseSniperPrice))
UITowers.push(new DisplayTowers(41*canvas.width/48, canvas.height/3, 30, "000ninja.png", "", baseNinjaPrice))

UITowers.push(new DisplayTowers(31*canvas.width/48, 5*canvas.height/12, 30, "000engi.png", "", baseEngiPrice))
UITowers.push(new DisplayTowers(33*canvas.width/48, 5*canvas.height/12, 30, "000buccaneer.png", "", baseBuccaneerPrice))
UITowers.push(new DisplayTowers(35*canvas.width/48, 5*canvas.height/12, 30, "000mortar.png", "", baseMortarPrice))
UITowers.push(new DisplayTowers(37*canvas.width/48, 5*canvas.height/12, 30, "000sword.png", "", baseSwordPrice))


UITowers.push(new DisplayTowers(7*canvas.width/48, canvas.height/4, 30, "000dart.png", "", baseDartPrice))
UITowers.push(new DisplayTowers(9*canvas.width/48, canvas.height/4, 30, "000tack.png", "", baseTackPrice))
UITowers.push(new DisplayTowers(11*canvas.width/48, canvas.height/4, 30, "000bomb.png", "", baseBombPrice))
UITowers.push(new DisplayTowers(13*canvas.width/48, canvas.height/4, 30, "000ice.png", "", baseIcePrice))
UITowers.push(new DisplayTowers(15*canvas.width/48, canvas.height/4, 30, "000super.png", "", baseSuperPrice))
UITowers.push(new DisplayTowers(17*canvas.width/48, canvas.height/4, 30, "000farm.png", "", baseFarmPrice))

UITowers.push(new DisplayTowers(7*canvas.width/48, canvas.height/3, 30, "000dartling.png", "", baseDartlingPrice))
UITowers.push(new DisplayTowers(9*canvas.width/48, canvas.height/3, 30, "000wizard.png", "", baseWizardPrice))
UITowers.push(new DisplayTowers(11*canvas.width/48, canvas.height/3, 30, "000cobra.png", "", baseCobraPrice))
UITowers.push(new DisplayTowers(13*canvas.width/48, canvas.height/3, 30, "000boomer.png", "", baseBoomerPrice))
UITowers.push(new DisplayTowers(15*canvas.width/48, canvas.height/3, 30, "000sniper.png", "", baseSniperPrice))
UITowers.push(new DisplayTowers(17*canvas.width/48, canvas.height/3, 30, "000ninja.png", "", baseNinjaPrice))

UITowers.push(new DisplayTowers(7*canvas.width/48, 5*canvas.height/12, 30, "000engi.png", "", baseEngiPrice))
UITowers.push(new DisplayTowers(9*canvas.width/48, 5*canvas.height/12, 30, "000buccaneer.png", "", baseBuccaneerPrice))
UITowers.push(new DisplayTowers(11*canvas.width/48, 5*canvas.height/12, 30, "000mortar.png", "", baseMortarPrice))
UITowers.push(new DisplayTowers(13*canvas.width/48, 5*canvas.height/12, 30, "000sword.png", "", baseSwordPrice))

UIBoosts.push(new DisplayTowers(canvas.width/16, canvas.height * 4 / 16, 30, "towerboost.png", "", ""))
UIBoosts.push(new DisplayTowers(canvas.width/16, canvas.height * 5.5 / 16, 30, "bloonboost.png", "", ""))
UIBoosts.push(new DisplayTowers(canvas.width/16, canvas.height * 7 / 16, 30, "lightningboost.png", "", ""))
UIBoosts.push(new DisplayTowers(canvas.width/16, canvas.height * 8.5 / 16, 30, "slowboost.png", "", ""))
UIBoosts.push(new DisplayTowers(canvas.width/16, canvas.height * 10 / 16, 30, "ecoboost.png", "", ""))

UIBoosts.push(new DisplayTowers(15*canvas.width/16, canvas.height * 4 / 16, 30, "towerboost.png", "", ""))
UIBoosts.push(new DisplayTowers(15*canvas.width/16, canvas.height * 5.5 / 16, 30, "bloonboost.png", "", ""))
UIBoosts.push(new DisplayTowers(15*canvas.width/16, canvas.height * 7 / 16, 30, "lightningboost.png", "", ""))
UIBoosts.push(new DisplayTowers(15*canvas.width/16, canvas.height * 8.5 / 16, 30, "slowboost.png", "", ""))
UIBoosts.push(new DisplayTowers(15*canvas.width/16, canvas.height * 10 / 16, 30, "ecoboost.png", "", ""))

// Static control overlays and initial cursors.
images.push(new Images(canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp1.png", -1, ""))
images.push(new Images(3*canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp2.png", -1, ""))


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
function calculatePopCount(dmg, hp) {
    if(round > 50) {
        if(hp <= dmg && hp <= 68) {
            return hp
        } else if(hp <= dmg && hp > 68 && hp <= 68 + Math.floor(200 * 1.05 ** (round - 50))) {
            return hp + 204
        } else if(hp <= dmg && hp > 68 + Math.floor(200 * 1.05 ** (round - 50)) && hp <= 68 + Math.floor(900 * 1.05 ** (round - 50))) {
            return hp + 3 * Math.floor(200 * 1.05 ** (round - 50)) + 1020
        } else if(hp <= dmg && hp > 68 + Math.floor(900 * 1.05 ** (round - 50)) && hp <= 68 + Math.floor(4900 * 1.05 ** (round - 50))) {
            return hp + 3 * Math.floor(900 * 1.05 ** (round - 50)) + 15 * Math.floor(200 * 1.05 ** (round - 50)) + 4284
        } else {
            return dmg
        }
    } else if(dmg == 1) {
        return 1
    } else if(dmg == 2) {
        if(hp == 1) {
            return hp
        } else if(hp <= 5 || hp >= 10) {
            return 2
        } else {
            return 3
        }
    } else if(dmg == 3) {
        if(hp <= 2) {
            return hp
        } else if(hp <= 5 || hp >= 11) {
            return 3
        } else if(hp == 10) {
            return 4
        } else if(hp == 6) {
            return 5
        } else {
            return 7
        }
    } else if(dmg == 4) {
        if(hp <= 3) {
            return hp
        } else  if(hp <= 5 || hp >= 12) {
            return 4
        } else if(hp == 11) {
            return 5
        } else if(hp == 6) {
            return 7
        } else if(hp == 10) {
            return 8
        } else if(hp == 7) {
            return 11
        } else {
            return 15
        }
    } else if(dmg == 5) {
        if(hp <= 4) {
            return hp
        } else if(hp == 5 || hp >= 13) {
            return 5
        } else if(hp == 12) {
            return 6
        } else if(hp == 6 || hp == 11) {
            return 9
        } else if(hp == 7) {
            return 15
        } else if(hp == 10) {
            return 16
        } else if(hp == 8) {
            return 23
        } else {
            return 31
        }
    } else if(dmg == 6) {
        if(hp <= 5) {
            return hp
        } else if(hp >= 14) {
            return 6
        } else if(hp == 13) {
            return 7
        } else if(hp == 12) {
            return 10
        } else if(hp == 6) {
            return 11
        } else if(hp == 11) {
            return 17
        } else if(hp == 7) {
            return 19
        } else if(hp == 8) {
            return 31
        } else if(hp == 10) {
            return 32
        } else {
            return 47
        }
    } else if(dmg == 7) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp >= 15) {
            return 7
        } else if(hp == 14) {
            return 8
        } else if(hp == 13) {
            return 11
        } else if(hp == 12) {
            return 18
        } else if(hp == 7) {
            return 23
        } else if(hp == 11) {
            return 33
        } else if(hp == 8) {
            return 39
        } else if(hp == 10) {
            return 48
        } else {
            return 63
        }
    } else if(dmg == 8) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp >= 16) {
            return 8
        } else if(hp == 15) {
            return 9
        } else if(hp == 14) {
            return 12
        } else if(hp == 13) {
            return 19
        } else if(hp == 12) {
            return 34
        } else if(hp == 8) {
            return 47
        } else if(hp == 11) {
            return 49
        } else if(hp == 10) {
            return 64
        } else {
            return 79
        }
    } else if(dmg == 9) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp >= 17) {
            return 9
        } else if(hp == 16) {
            return 10
        } else if(hp == 15) {
            return 13
        } else if(hp == 14) {
            return 20
        } else if(hp == 13) {
            return 35
        } else if(hp == 12) {
            return 50
        } else if(hp == 11) {
            return 65
        } else if(hp == 10) {
            return 80
        } else {
            return 95
        }
    } else if(dmg == 10) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp == 9) {
            return 95
        } else if(hp >= 18) {
            return 10
        } else if(hp == 17) {
            return 11
        } else if(hp == 16) {
            return 14
        } else if(hp == 15) {
            return 21
        } else if(hp == 14) {
            return 36
        } else if(hp == 13) {
            return 51
        } else if(hp == 12) {
            return 66
        } else if(hp == 11) {
            return 81
        } else {
            return 96
        }
    } else if(dmg == 11) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6 || hp > 18) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 10) {
            return 86 + hp
        } else if(hp == 18) {
            return 12
        } else if(hp == 17) {
            return 15
        } else if(hp == 16) {
            return 22
        } else if(hp == 15) {
            return 37
        } else if(hp == 14) {
            return 52
        } else if(hp == 13) {
            return 67
        } else if(hp == 12) {
            return 82
        } else {
            return 97
        }
    } else if(dmg == 12) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 11) {
            return 86 + hp
        } else if(hp == 18) {
            return 16
        } else if(hp == 17) {
            return 23
        } else if(hp == 16) {
            return 38
        } else if(hp == 15) {
            return 53
        } else if(hp == 14) {
            return 68
        } else if(hp == 13) {
            return 83
        } else if(hp > 18) {
            return 12
        } else {
            return 98
        }
    } else if(dmg == 13) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 12) {
            return 86 + hp
        } else if(hp == 18) {
            return 24
        } else if(hp == 17) {
            return 39
        } else if(hp == 16) {
            return 54
        } else if(hp == 15) {
            return 69
        } else if(hp == 14) {
            return 84
        } else if(hp > 18) {
            return 13
        } else {
            return 99
        }
    } else if(dmg == 14) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 13) {
            return 86 + hp
        } else if(hp == 18) {
            return 40
        } else if(hp == 17) {
            return 55
        } else if(hp == 16) {
            return 70
        } else if(hp == 15) {
            return 85
        } else if(hp > 18) {
            return 14
        } else {
            return 100
        }
    } else if(dmg == 15) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 14) {
            return 86 + hp
        } else if(hp == 18) {
            return 56
        } else if(hp == 17) {
            return 71
        } else if(hp == 16) {
            return 86
        } else if(hp > 18) {
            return 15
        } else {
            return 101
        }
    } else if(dmg == 16) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 15) {
            return 86 + hp
        } else if(hp == 18) {
            return 72
        } else if(hp == 17) {
            return 87
        } else if(hp > 18) {
            return 16
        } else {
            return 102
        }
    } else if(dmg == 17) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 16) {
            return 86 + hp
        } else if(hp == 18) {
            return 88
        } else if(hp > 18) {
            return 17
        } else {
            return 103
        }
    } else if(dmg == 18) {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 17) {
            return 86 + hp
        } else if(hp > 18) {
            return 18
        } else {
            return 104
        }
    } else {
        if(hp <= 5) {
            return hp
        } else if(hp == 6) {
            return 11
        } else if(hp == 7) {
            return 23
        } else if(hp == 8) {
            return 47
        } else if(hp <= 18) {
            return 86 + hp
        } else if(hp > 18 && hp <= dmg) {
            return hp
        } else if(hp <= dmg && hp > 18 && hp <= 218) {
            return hp + 398
        } else if(hp <= dmg && hp > 218 && hp <= 918) {
            return hp + 2246
        } else if(hp <= dmg && hp > 918 && hp <= 4918) {
            return hp + 11738
        } else if(hp > 18) {
            return dmg
        }
    }
}

function layPathObjects() {
    if(mapNumber == 0) {
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
    } else if(mapNumber == 1) {
        for(var i = 0; i <= 50; i++) {
            if(i < (50/v)*dist(o, p)) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(o, p))*2*i + 1/2) * 3/4 + 1/8), canvas.height * (((-3/8)/((100/v)*dist(o, p)))*2*i + 1/2), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(o, p))*2*i + 1/2) * -3/4 + 7/8), canvas.height * (((-3/8)/((100/v)*dist(o, p)))*2*i + 1/2), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o))) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(h, o))*2*i + 5/12 - ((-1/12)/((100/v)*dist(h, o))) * (100/v)*dist(o, p)) * 3/4 + 1/8), canvas.height * (((1/8)/((100/v)*dist(h, o))*2*i + 1/8 - ((1/8))/((100/v)*dist(h, o)) * (100/v)*dist(o, p))), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(h, o))*2*i + 5/12 - ((-1/12)/((100/v)*dist(h, o))) * (100/v)*dist(o, p)) * -3/4 + 7/8), canvas.height * (((1/8)/((100/v)*dist(h, o))*2*i + 1/8 - ((1/8))/((100/v)*dist(h, o)) * (100/v)*dist(o, p))), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o) + dist(g, h))) {
                pathObjects.push(new PathObject(canvas.width * (((1/12)/((100/v)*dist(g, h))*2*i + 1/3 - ((1/12)/((100/v)*dist(g, h))) * (100/v)*(dist(o, p) + dist(h, o))) * 3/4 + 1/8), canvas.height * (((7/16)/((100/v)*dist(g, h))*2*i + 1/4 - ((7/16))/((100/v)*dist(g, h)) * (100/v)*(dist(o, p) + dist(h, o)))), 25))
                pathObjects.push(new PathObject(canvas.width * (((1/12)/((100/v)*dist(g, h))*2*i + 1/3 - ((1/12)/((100/v)*dist(g, h))) * (100/v)*(dist(o, p) + dist(h, o))) * -3/4 + 7/8), canvas.height * (((7/16)/((100/v)*dist(g, h))*2*i + 1/4 - ((7/16))/((100/v)*dist(g, h)) * (100/v)*(dist(o, p) + dist(h, o)))), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(f, g))*2*i + 5/12 - ((-1/12)/((100/v)*dist(f, g))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) * 3/4 + 1/8), canvas.height * (((3/16)/((100/v)*dist(f, g))*2*i + 11/16 - ((3/16))/((100/v)*dist(f, g)) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h)))), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(f, g))*2*i + 5/12 - ((-1/12)/((100/v)*dist(f, g))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h))) * -3/4 + 7/8), canvas.height * (((3/16)/((100/v)*dist(f, g))*2*i + 11/16 - ((3/16))/((100/v)*dist(f, g)) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h)))), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f))) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(d, f))*2*i + 1/3 - ((-1/12)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) * 3/4 + 1/8), canvas.height * (((-3/8)/((100/v)*dist(d, f)))*2*i + 7/8 - ((-3/8)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(d, f))*2*i + 1/3 - ((-1/12)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))) * -3/4 + 7/8), canvas.height * (((-3/8)/((100/v)*dist(d, f)))*2*i + 7/8 - ((-3/8)/((100/v)*dist(d, f))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g))), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(c, d))*2*i + 1/6 - ((-1/12)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) * 3/4 + 1/8), canvas.height * (((3/8)/((100/v)*dist(c, d)))*2*i + 7/8 - ((3/8)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(c, d))*2*i + 1/6 - ((-1/12)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))) * -3/4 + 7/8), canvas.height * (((3/8)/((100/v)*dist(c, d)))*2*i + 7/8 - ((3/8)/((100/v)*dist(c, d))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d))), 25))
            } else if(i < (50/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(b, c))*2*i + 1/12 - ((-1/12)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) * 3/4 + 1/8), canvas.height * (((-3/8)/((100/v)*dist(b, c)))*2*i + 1/2 - ((-3/8)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(b, c))*2*i + 1/12 - ((-1/12)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))) * -3/4 + 7/8), canvas.height * (((-3/8)/((100/v)*dist(b, c)))*2*i + 1/2 - ((-3/8)/((100/v)*dist(b, c))) * (100/v)*(dist(o, p) + dist(h, o) + dist(g, h) + dist(f, g) + dist(d, f) + dist(c, d) + dist(b, c))), 25))
            } else if(i <= 50) {
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(a, b))*2*i - ((-1/12)/((100/v)*dist(a, b))) * 100) * 3/4 + 1/8), canvas.height * (1/2), 25))
                pathObjects.push(new PathObject(canvas.width * (((-1/12)/((100/v)*dist(a, b))*2*i - ((-1/12)/((100/v)*dist(a, b))) * 100) * -3/4 + 7/8), canvas.height * (1/2), 25))
            }
        }
    }
}

function drawUI() {
    var p1TowerSelected = false
    var p2TowerSelected = false
    ctx.fillStyle = "gray"
    ctx.fillRect(0, 0, canvas.width/8, canvas.height)
    ctx.fillRect(7 * canvas.width/8, 0, canvas.width/8, canvas.height)
    ctx.fillRect(9*canvas.width/20, 0, canvas.width/10, canvas.height/8)
    if(practiceMode && nonPlayableSide == 1) {
        ctx.fillRect(canvas.width/8, 0, canvas.width*3/8, canvas.height)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = "30px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText("Money: $" + Math.floor(p2money).toLocaleString(), canvas.width*5/16, canvas.height/8 + canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Eco: \u25b2" + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), canvas.width*5/16, canvas.height/8 + 2*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Lives: \u2764" + p2lives.toLocaleString(), canvas.width*5/16, canvas.height/8 + 3*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Total Damage: " + p2TotalPopCount.toLocaleString(), canvas.width*5/16, canvas.height/8 + 4*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated w/o Eco: $" + Math.floor(p2TotalCashGenerated).toLocaleString(), canvas.width*5/16, canvas.height/8 + 5*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated w/ Eco only: $" + Math.floor(p2CashGenWithEco).toLocaleString(), canvas.width*5/16, canvas.height/8 + 6*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated inc. Eco: $" + Math.floor(p2TotalCashGenerated + p2CashGenWithEco).toLocaleString(), canvas.width*5/16, canvas.height/8 + 7*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Money: $" + Math.floor(p2money).toLocaleString(), canvas.width*5/16, canvas.height/8 + canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Eco: \u25b2" + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), canvas.width*5/16, canvas.height/8 + 2*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Lives: \u2764" + p2lives.toLocaleString(), canvas.width*5/16, canvas.height/8 + 3*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Total Damage: " + p2TotalPopCount.toLocaleString(), canvas.width*5/16, canvas.height/8 + 4*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated w/o Eco: $" + Math.floor(p2TotalCashGenerated).toLocaleString(), canvas.width*5/16, canvas.height/8 + 5*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated w/ Eco only: $" + Math.floor(p2CashGenWithEco).toLocaleString(), canvas.width*5/16, canvas.height/8 + 6*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated inc. Eco: $" + Math.floor(p2TotalCashGenerated + p2CashGenWithEco).toLocaleString(), canvas.width*5/16, canvas.height/8 + 7*canvas.height*3/32, canvas.width*3/8)
    } else if(practiceMode && nonPlayableSide == 2) {
        ctx.fillRect(canvas.width/2, 0, canvas.width*3/8, canvas.height)
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.font = "30px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.strokeText("Money: $" + Math.floor(p1money).toLocaleString(), canvas.width*11/16, canvas.height/8 + canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Eco: \u25b2" + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), canvas.width*11/16, canvas.height/8 + 2*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Lives: \u2764" + p1lives.toLocaleString(), canvas.width*11/16, canvas.height/8 + 3*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Total Damage: " + p1TotalPopCount.toLocaleString(), canvas.width*11/16, canvas.height/8 + 4*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated w/o Eco: $" + Math.floor(p1TotalCashGenerated).toLocaleString(), canvas.width*11/16, canvas.height/8 + 5*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated w/ Eco only: $" + Math.floor(p1CashGenWithEco).toLocaleString(), canvas.width*11/16, canvas.height/8 + 6*canvas.height*3/32, canvas.width*3/8)
        ctx.strokeText("Cash Generated inc. Eco: $" + Math.floor(p1TotalCashGenerated + p1CashGenWithEco).toLocaleString(), canvas.width*11/16, canvas.height/8 + 7*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Money: $" + Math.floor(p1money).toLocaleString(), canvas.width*11/16, canvas.height/8 + canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Eco: \u25b2" + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), canvas.width*11/16, canvas.height/8 + 2*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Lives: \u2764" + p1lives.toLocaleString(), canvas.width*11/16, canvas.height/8 + 3*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Total Damage: " + p1TotalPopCount.toLocaleString(), canvas.width*11/16, canvas.height/8 + 4*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated w/o Eco: $" + Math.floor(p1TotalCashGenerated).toLocaleString(), canvas.width*11/16, canvas.height/8 + 5*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated w/ Eco only: $" + Math.floor(p1CashGenWithEco).toLocaleString(), canvas.width*11/16, canvas.height/8 + 6*canvas.height*3/32, canvas.width*3/8)
        ctx.fillText("Cash Generated inc. Eco: $" + Math.floor(p1TotalCashGenerated + p1CashGenWithEco).toLocaleString(), canvas.width*11/16, canvas.height/8 + 7*canvas.height*3/32, canvas.width*3/8)
    }
    ctx.fillStyle = "lime"
    if(p1lives < 150) {
        ctx.fillRect(0, 3*canvas.height/16 - 30, canvas.width/8 * (p1lives/150), 40)
    } else {
        ctx.fillRect(0, 3*canvas.height/16 - 30, canvas.width/8, 40)
    }
    if(p2lives < 150) {
        ctx.fillRect(canvas.width - canvas.width/8 * (p2lives/150), 3*canvas.height/16 - 30, canvas.width/8 * (p2lives/150), 40)
    } else {
        ctx.fillRect(canvas.width*7/8, 3*canvas.height/16 - 30, canvas.width/8, 40)
    }
    ctx.lineWidth = 5
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.font = "30px Luckiest Guy"
    ctx.textAlign = "right"
    ctx.font = "30px Luckiest Guy"
    ctx.textAlign = "center"
    ctx.strokeText(" Round " + Math.trunc(round/2).toLocaleString(), canvas.width/2, 3*canvas.height/48, canvas.width/2)
    ctx.fillText(" Round " + Math.trunc(round/2).toLocaleString(), canvas.width/2, 3*canvas.height/48, canvas.width/2)
    //ctx.fillText('\u25b2' + " " + eco.toLocaleString(), canvas.width/2, 40, canvas.width/2)
    if(Math.floor((gameNow() - timeGameStarted)/1000)%60 >= 10) {
        ctx.strokeText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
        ctx.fillText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
    } else {
        ctx.strokeText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":0" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
        ctx.fillText(" " + Math.floor((gameNow() - timeGameStarted)/60000) + ":0" + Math.floor((gameNow() - timeGameStarted)/1000)%60, canvas.width/2, 5*canvas.height/48, canvas.width/2)
    }
    ctx.textAlign = "left"
    ctx.strokeText(" $ " + Math.trunc(p1money).toLocaleString(), 0, canvas.height/16, canvas.width/8)
    ctx.strokeText(" \u25b2 " + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), 0, canvas.height/8, canvas.width/8)
    ctx.strokeText(" \u2764 " + p1lives.toLocaleString(), 0, 3*canvas.height/16, canvas.width/4)
    ctx.strokeText(" $ " + Math.trunc(p2money).toLocaleString(), 7*canvas.width/8, canvas.height/16, canvas.width/8)
    ctx.strokeText(" \u25b2 " + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), 7*canvas.width/8, canvas.height/8, canvas.width/8)
    ctx.strokeText(" \u2764 " + p2lives.toLocaleString(), 7*canvas.width/8, 3*canvas.height/16, canvas.width/4)
    ctx.fillText(" $ " + Math.trunc(p1money).toLocaleString(), 0, canvas.height/16, canvas.width/8)
    ctx.fillText(" \u25b2 " + Math.trunc(Math.trunc(p1eco*10)/10).toLocaleString(), 0, canvas.height/8, canvas.width/8)
    ctx.fillText(" \u2764 " + p1lives.toLocaleString(), 0, 3*canvas.height/16, canvas.width/4)
    ctx.fillText(" $ " + Math.trunc(p2money).toLocaleString(), 7*canvas.width/8, canvas.height/16, canvas.width/8)
    ctx.fillText(" \u25b2 " + Math.trunc(Math.trunc(p2eco*10)/10).toLocaleString(), 7*canvas.width/8, canvas.height/8, canvas.width/8)
    ctx.fillText(" \u2764 " + p2lives.toLocaleString(), 7*canvas.width/8, 3*canvas.height/16, canvas.width/4)
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].selected && towers[i].playerSide == 1) {
            p1TowerSelected = true
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
            ctx.textAlign = "left"
            if(towers[i].towerType == "dart") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Dart Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Dart Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "tack") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Tack Shooter", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Tack Shooter", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades < 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.strokeText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 0, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $20,000", 0, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $20,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farm", 0, canvas.height/2, canvas.width/8)
                ctx.strokeText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 0, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 0, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farmer", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farmer", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "super") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Super Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Super Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "bomb") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Bomb Shooter", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Bomb Shooter", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ice") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Ice Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Ice Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "dartling") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Dartling Gunner", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Dartling Gunner", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "wizard") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Wizard Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Wizard Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "cobra") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("COBRA", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("COBRA", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "boomer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Boomerang Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Boomerang Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "sniper") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sniper Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Sniper Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ninja") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Ninja Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Ninja Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "engi") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Engineer Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Engineer Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "buccaneer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Monkey Buccaneer", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Monkey Buccaneer", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "mortar") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Mortar Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Mortar Monkey", 0, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "sword") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Knight Monkey", 0, canvas.height/2, canvas.width/8)
                ctx.fillText("Knight Monkey", 0, canvas.height/2, canvas.width/8)
            }
            if(towers[i].towerType != "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText(Math.floor(towers[i].dpsCount/2).toLocaleString() + " DPS", 0, 9*canvas.height/16, canvas.width/8)
                ctx.fillText(Math.floor(towers[i].dpsCount/2).toLocaleString() + " DPS", 0, 9*canvas.height/16, canvas.width/8)
            }
            ctx.font = "30px Luckiest Guy"
            if(towers[i].towerType != "farmer" && towers[i].path1Upgrades < 6 && towers[i].path2Upgrades < 6 && towers[i].path3Upgrades < 6) {
                ctx.strokeText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 0, 5*canvas.height/8, canvas.width/8)
                ctx.strokeText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 0, 11*canvas.height/16, canvas.width/8)
                ctx.strokeText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 0, 3*canvas.height/4, canvas.width/8)
                ctx.fillText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 0, 5*canvas.height/8, canvas.width/8)
                ctx.fillText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 0, 11*canvas.height/16, canvas.width/8)
                ctx.fillText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 0, 3*canvas.height/4, canvas.width/8)
            } else if(towers[i].path1Upgrades == 6 || towers[i].path2Upgrades == 6 || towers[i].path3Upgrades == 6) {
                ctx.strokeText("Degree: " + towers[i].degree, 0, 5*canvas.height/8, canvas.width/8)
                ctx.fillText("Degree: " + towers[i].degree, 0, 5*canvas.height/8, canvas.width/8)
            }
            if(towers[i].towerType == "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Made: $" + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
                ctx.fillText("Made: $" + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
            } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades >= 1 || towers[i].towerType == "sniper" && towers[i].path2Upgrades >= 4 || towers[i].towerType == "engi" && towers[i].path3Upgrades >= 4 || towers[i].towerType == "buccaneer" && towers[i].path3Upgrades >= 3) {
                ctx.font = "25px Luckiest Guy"
                ctx.strokeText("Pops: " + towers[i].popCount.toLocaleString(), 0, 100*canvas.height/128, canvas.width/8)
                ctx.strokeText("Made: $" + Math.floor(towers[i].cashGenerated).toLocaleString(), 0, 103*canvas.height/128, canvas.width/8)
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 0, 100*canvas.height/128, canvas.width/8)
                ctx.fillText("Made: $" + Math.floor(towers[i].cashGenerated).toLocaleString(), 0, 103*canvas.height/128, canvas.width/8)
                if(towers[i].targetPrio == 0) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 1) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 2) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 3) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                }
            } else if(towers[i].towerType != "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Pops: " + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 0, 101*canvas.height/128, canvas.width/8)
                if(towers[i].towerType != "dartling" && towers[i].towerType != "mortar") {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                    }
                } else if(towers[i].towerType == "dartling" || towers[i].towerType == "mortar" && towers[i].path3Upgrades < 1) {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Follow Mouse", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Follow Mouse", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    }
                } else if(towers[i].towerType == "mortar" && towers[i].path3Upgrades >= 1) {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: First", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Last", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Close", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Strong", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 4) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Follow Mouse", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Follow Mouse", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 5) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 6) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 0, 53*canvas.height/64, canvas.width/8)
                    }
                }
            }
            if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
                ctx.fillText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sell: $" + Math.round(0.7 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
                ctx.fillText("Sell: $" + Math.round(0.7 * towers[i].totalCost).toLocaleString(), 0, 7*canvas.height/8, canvas.width/8)
            }
        } else if(towers[i].selected && towers[i].playerSide == 2) {
            p2TowerSelected = true
            ctx.lineWidth = 5
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.textAlign = "left"
            if(towers[i].towerType == "dart") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Dart Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Dart Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "tack") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Tack Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Tack Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades < 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 3) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.strokeText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $14,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 4) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.strokeText("$" + towers[i].towerVar.toLocaleString() + " / $20,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $20,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farm" && towers[i].path2Upgrades == 5) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.strokeText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
                ctx.fillText("Banana Farm", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("$" + towers[i].towerVar.toLocaleString() + " / $30,000", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            } else if(towers[i].towerType == "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Banana Farmer", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Banana Farmer", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "super") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Super Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Super Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "bomb") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Bomb Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Bomb Shooter", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ice") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Ice Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Ice Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "dartling") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Dartling Gunner", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Dartling Gunner", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "wizard") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Wizard Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Wizard Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "cobra") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("COBRA", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("COBRA", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "boomer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Boomerang Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Boomerang Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "sniper") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sniper Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Sniper Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "ninja") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Ninja Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Ninja Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "engi") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Engineer Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Engineer Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "buccaneer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Monkey Buccaneer", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Monkey Buccaneer", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "mortar") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Mortar Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Mortar Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            } else if(towers[i].towerType == "sword") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Knight Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
                ctx.fillText("Knight Monkey", 7*canvas.width/8, canvas.height/2, canvas.width/8)
            }
            if(towers[i].towerType != "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText(Math.floor(towers[i].dpsCount/2).toLocaleString() + " DPS", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
                ctx.fillText(Math.floor(towers[i].dpsCount/2).toLocaleString() + " DPS", 7*canvas.width/8, 9*canvas.height/16, canvas.width/8)
            }

            ctx.font = "30px Luckiest Guy"
            if(towers[i].towerType != "farmer" && towers[i].path1Upgrades < 6 && towers[i].path2Upgrades < 6 && towers[i].path3Upgrades < 6) {
                ctx.strokeText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 7*canvas.width/8, 5*canvas.height/8, canvas.width/8)
                ctx.strokeText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 7*canvas.width/8, 11*canvas.height/16, canvas.width/8)
                ctx.strokeText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 7*canvas.width/8, 3*canvas.height/4, canvas.width/8)
                ctx.fillText(towers[i].path1Upgrades + " - $" + towers[i].path1Cost[towers[i].path1Upgrades].toLocaleString() + " " + towers[i].path1Name[towers[i].path1Upgrades], 7*canvas.width/8, 5*canvas.height/8, canvas.width/8)
                ctx.fillText(towers[i].path2Upgrades + " - $" + towers[i].path2Cost[towers[i].path2Upgrades].toLocaleString() + " " + towers[i].path2Name[towers[i].path2Upgrades], 7*canvas.width/8, 11*canvas.height/16, canvas.width/8)
                ctx.fillText(towers[i].path3Upgrades + " - $" + towers[i].path3Cost[towers[i].path3Upgrades].toLocaleString() + " " + towers[i].path3Name[towers[i].path3Upgrades], 7*canvas.width/8, 3*canvas.height/4, canvas.width/8)
            } else if(towers[i].path1Upgrades == 6 || towers[i].path2Upgrades == 6 || towers[i].path3Upgrades == 6) {
                ctx.strokeText("Degree: " + towers[i].degree, 7*canvas.width/8, 5*canvas.height/8, canvas.width/8)
                ctx.fillText("Degree: " + towers[i].degree, 7*canvas.width/8, 5*canvas.height/8, canvas.width/8)
            }
            if(towers[i].towerType == "farm") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Made: $" + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
                ctx.fillText("Made: $" + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
            } else if(towers[i].towerType == "cobra" && towers[i].path2Upgrades >= 1 || towers[i].towerType == "sniper" && towers[i].path2Upgrades >= 4 || towers[i].towerType == "engi" && towers[i].path3Upgrades >= 4 || towers[i].towerType == "buccaneer" && towers[i].path3Upgrades >= 3) {
                ctx.font = "25px Luckiest Guy"
                ctx.strokeText("Pops: " + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 100*canvas.height/128, canvas.width/8)
                ctx.strokeText("Made: $" + Math.floor(towers[i].cashGenerated).toLocaleString(), 7*canvas.width/8, 103*canvas.height/128, canvas.width/8)
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 100*canvas.height/128, canvas.width/8)
                ctx.fillText("Made: $" + Math.floor(towers[i].cashGenerated).toLocaleString(), 7*canvas.width/8, 103*canvas.height/128, canvas.width/8)
                if(towers[i].targetPrio == 0) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 1) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 2) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                } else if(towers[i].targetPrio == 3) {
                    ctx.font = "30px Luckiest Guy"
                    ctx.strokeText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    ctx.fillText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                }
            } else if(towers[i].towerType != "farmer") {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Pops: " + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
                ctx.fillText("Pops: " + towers[i].popCount.toLocaleString(), 7*canvas.width/8, 101*canvas.height/128, canvas.width/8)
                if(towers[i].towerType != "dartling" && towers[i].towerType != "mortar") {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    }
                } else if(towers[i].towerType == "dartling" || towers[i].towerType == "mortar" && towers[i].path3Upgrades < 1) {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Follow Mouse", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Follow Mouse", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    }
                } else if(towers[i].towerType == "mortar" && towers[i].path3Upgrades >= 1) {
                    if(towers[i].targetPrio == 0) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: First", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 1) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Last", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 2) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Close", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 3) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Strong", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 4) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Follow Mouse", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Follow Mouse", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 5) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    } else if(towers[i].targetPrio == 6) {
                        ctx.font = "30px Luckiest Guy"
                        ctx.strokeText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                        ctx.fillText("Target: Lock On Point", 7*canvas.width/8, 53*canvas.height/64, canvas.width/8)
                    }
                }
            }
            if(towers[i].towerType == "farm" && towers[i].path3Upgrades >= 2) {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 7*canvas.width/8, 7*canvas.height/8, canvas.width/8)
                ctx.fillText("Sell: $" + Math.round(0.8 * towers[i].totalCost).toLocaleString(), 7*canvas.width/8, 7*canvas.height/8, canvas.width/8)
            } else {
                ctx.font = "30px Luckiest Guy"
                ctx.strokeText("Sell: $" + Math.round(0.7 * towers[i].totalCost).toLocaleString(), 7*canvas.width/8, 7*canvas.height/8, canvas.width/8)
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
    if(p1Boost1Count > 0 && p1Boost1Expires + 40000 <= gameNow()) {
        boostIcons[0].image = p1BoostTypes[0]
        boostIcons[0].text = "x" + p1Boost1Count
        boostIcons[0].draw()
    } else if (p1Boost1Count > 0) {
        boostIcons[0].image = p1BoostTypes[0].replace(".png","cooldown.png")
        boostIcons[0].text = "x" + p1Boost1Count
        boostIcons[0].draw()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(boostIcons[0].x, boostIcons[0].y)
        ctx.arc
        (
            boostIcons[0].x,
            boostIcons[0].y,
            25,
            -Math.PI/2,
            (Math.PI * 2) * (gameNow() - p1Boost1Expires)/(40000) - Math.PI/2
        )
        ctx.fill()
    } else {
        boostIcons[0].image = p1BoostTypes[0].replace(".png","cooldown.png")
        boostIcons[0].text = "x" + p1Boost1Count
        boostIcons[0].draw()
    }
    if(p1Boost2Count > 0 && p1Boost2Expires + 40000 <= gameNow()) {
        boostIcons[1].image = p1BoostTypes[1]
        boostIcons[1].text = "x" + p1Boost2Count
        boostIcons[1].draw()
    } else if(p1Boost2Count > 0) {
        boostIcons[1].image = p1BoostTypes[1].replace(".png","cooldown.png")
        boostIcons[1].text = "x" + p1Boost2Count
        boostIcons[1].draw()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(boostIcons[1].x, boostIcons[1].y)
        ctx.arc
        (
            boostIcons[1].x,
            boostIcons[1].y,
            25,
            -Math.PI/2,
            (Math.PI * 2) * (gameNow() - p1Boost2Expires)/(40000) - Math.PI/2
        )
        ctx.fill()
    } else {
        boostIcons[1].image = p1BoostTypes[1].replace(".png","cooldown.png")
        boostIcons[1].text = "x" + p1Boost2Count
        boostIcons[1].draw()
    }
    if(p2Boost1Count > 0 && p2Boost1Expires + 40000 <= gameNow()) {
        boostIcons[2].image = p2BoostTypes[0]
        boostIcons[2].text = "x" + p2Boost1Count
        boostIcons[2].draw()
    } else if(p2Boost1Count > 0) {
        boostIcons[2].image = p2BoostTypes[0].replace(".png","cooldown.png")
        boostIcons[2].text = "x" + p2Boost1Count
        boostIcons[2].draw()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(boostIcons[2].x, boostIcons[2].y)
        ctx.arc
        (
            boostIcons[2].x,
            boostIcons[2].y,
            25,
            -Math.PI/2,
            (Math.PI * 2) * (gameNow() - p2Boost1Expires)/(40000) - Math.PI/2
        )
        ctx.fill()
    } else {
        boostIcons[2].image = p2BoostTypes[0].replace(".png","cooldown.png")
        boostIcons[2].text = "x" + p2Boost1Count
        boostIcons[2].draw()
    }
    if(p2Boost2Count > 0 && p2Boost2Expires + 40000 <= gameNow()) {
        boostIcons[3].image = p2BoostTypes[1]
        boostIcons[3].text = "x" + p2Boost2Count
        boostIcons[3].draw()
    } else if(p2Boost2Count > 0) {
        boostIcons[3].image = p2BoostTypes[1].replace(".png","cooldown.png")
        boostIcons[3].text = "x" + p2Boost2Count
        boostIcons[3].draw()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(boostIcons[3].x, boostIcons[3].y)
        ctx.arc
        (
            boostIcons[3].x,
            boostIcons[3].y,
            25,
            -Math.PI/2,
            (Math.PI * 2) * (gameNow() - p2Boost2Expires)/(40000) - Math.PI/2
        )
        ctx.fill()
    } else {
        boostIcons[3].image = p2BoostTypes[1].replace(".png","cooldown.png")
        boostIcons[3].text = "x" + p2Boost2Count
        boostIcons[3].draw()
    }
    if(p1TowerSelected == false) {
        UITowers[0].draw()
        UITowers[1].draw()
        UITowers[2].draw()
    }
    if(p2TowerSelected == false) {
        UITowers[3].draw()
        UITowers[4].draw()
        UITowers[5].draw()
    }
    for(var i = 0; i < displayBloons.length; i++) {
        displayBloons[i].selected = false
        displayBloons[i].showColumn = -1
    }
    displayBloons[p1SelectedBloon].selected = true
    displayBloons[p2SelectedBloon].selected = true
    if(p1TowerSelected == false) {
        for(var i = 0; i >= 0 && i <= 9; i++) {
            displayBloons[i].draw()
        }
    } else {
        if(p1SelectedBloon == 0 || p1SelectedBloon == 1) {
            displayBloons[8].showColumn = 1
            displayBloons[9].showColumn = 1
            displayBloons[0].showColumn = 2
            displayBloons[1].showColumn = 2
            displayBloons[2].showColumn = 3
            displayBloons[3].showColumn = 3
            for(var k = 0; k <= 3; k++) {
                displayBloons[k].draw()
            }
            displayBloons[8].draw()
            displayBloons[9].draw()
        } else if(p1SelectedBloon == 2 || p1SelectedBloon == 3) {
            displayBloons[0].showColumn = 1
            displayBloons[1].showColumn = 1
            displayBloons[2].showColumn = 2
            displayBloons[3].showColumn = 2
            displayBloons[4].showColumn = 3
            displayBloons[5].showColumn = 3
            for(var k = 0; k <= 5; k++) {
                displayBloons[k].draw()
            }
        } else if(p1SelectedBloon == 4 || p1SelectedBloon == 5) {
            displayBloons[2].showColumn = 1
            displayBloons[3].showColumn = 1
            displayBloons[4].showColumn = 2
            displayBloons[5].showColumn = 2
            displayBloons[6].showColumn = 3
            displayBloons[7].showColumn = 3
            for(var k = 2; k <= 7; k++) {
                displayBloons[k].draw()
            }
        } else if(p1SelectedBloon == 6 || p1SelectedBloon == 7) {
            displayBloons[4].showColumn = 1
            displayBloons[5].showColumn = 1
            displayBloons[6].showColumn = 2
            displayBloons[7].showColumn = 2
            displayBloons[8].showColumn = 3
            displayBloons[9].showColumn = 3
            for(var k = 4; k <= 9; k++) {
                displayBloons[k].draw()
            }
        } else if(p1SelectedBloon == 8 || p1SelectedBloon == 9) {
            displayBloons[6].showColumn = 1
            displayBloons[7].showColumn = 1
            displayBloons[8].showColumn = 2
            displayBloons[9].showColumn = 2
            displayBloons[0].showColumn = 3
            displayBloons[1].showColumn = 3
            for(var k = 6; k <= 9; k++) {
                displayBloons[k].draw()
            }
            displayBloons[0].draw()
            displayBloons[1].draw()
        }
    }
    if(p2TowerSelected == false) {
        for(var i = 10; i >= 10 && i <= 19; i++) {
            displayBloons[i].draw()
        }
    } else {
        if(p2SelectedBloon == 10 || p2SelectedBloon == 11) {
            displayBloons[18].showColumn = 1
            displayBloons[19].showColumn = 1
            displayBloons[10].showColumn = 2
            displayBloons[11].showColumn = 2
            displayBloons[12].showColumn = 3
            displayBloons[13].showColumn = 3
            for(var k = 10; k <= 13; k++) {
                displayBloons[k].draw()
            }
            displayBloons[18].draw()
            displayBloons[19].draw()
        } else if(p2SelectedBloon == 12 || p2SelectedBloon == 13) {
            displayBloons[10].showColumn = 1
            displayBloons[11].showColumn = 1
            displayBloons[12].showColumn = 2
            displayBloons[13].showColumn = 2
            displayBloons[14].showColumn = 3
            displayBloons[15].showColumn = 3
            for(var k = 10; k <= 15; k++) {
                displayBloons[k].draw()
            }
        } else if(p2SelectedBloon == 14 || p2SelectedBloon == 15) {
            displayBloons[12].showColumn = 1
            displayBloons[13].showColumn = 1
            displayBloons[14].showColumn = 2
            displayBloons[15].showColumn = 2
            displayBloons[16].showColumn = 3
            displayBloons[17].showColumn = 3
            for(var k = 12; k <= 17; k++) {
                displayBloons[k].draw()
            }
        } else if(p2SelectedBloon == 16 || p2SelectedBloon == 17) {
            displayBloons[14].showColumn = 1
            displayBloons[15].showColumn = 1
            displayBloons[16].showColumn = 2
            displayBloons[17].showColumn = 2
            displayBloons[18].showColumn = 3
            displayBloons[19].showColumn = 3
            for(var k = 14; k <= 19; k++) {
                displayBloons[k].draw()
            }
        } else if(p2SelectedBloon == 18 || p2SelectedBloon == 19) {
            displayBloons[16].showColumn = 1
            displayBloons[17].showColumn = 1
            displayBloons[18].showColumn = 2
            displayBloons[19].showColumn = 2
            displayBloons[10].showColumn = 3
            displayBloons[11].showColumn = 3
            for(var k = 16; k <= 19; k++) {
                displayBloons[k].draw()
            }
            displayBloons[10].draw()
            displayBloons[11].draw()
        }
    }
}
