// Shared configuration values used across the split runtime.
const CANVAS_SIZE = {
    width: 1366,
    height: 768,
}

const GAME_VERSION = "v2.5.3"

const ECONOMY_SETTINGS = {
    startingMoney: 650,
    startingLives: 150,
    startingEco: 250,
    ecoTickMs: 6000,
    keyCooldownMs: 150,
}

const BOOST_SETTINGS = {
    charges: 3,
    activeMs: 12000,
    cooldownMs: 40000,
    towerBoostFactor: 1 / 1.8,
    slowSabotageFactor: 1.2,
    bloonBoostFactor: 1.4,
    ecoBoostRoundFactor: 2.5,
    lightningTickCount: 5,
    lightningTickIntervalMs: 500,
}

const PLAYER_SIDE = {
    left: 1,
    right: 2,
}

const BASE_TOWER_PRICES = {
    dart: 100,
    tack: 300,
    bomb: 500,
    ice: 650,
    super: 1250,
    farm: 1400,
    farmer: 250,
    dartling: 800,
    wizard: 550,
    cobra: 450,
    boomer: 375,
    sniper: 300,
    ninja: 400,
    engi: 350,
    buccaneer: 350,
    mortar: 900,
    sword: 450,
}

const KEY_CODES = {
    p1Up: 87,
    p1Left: 65,
    p1Down: 83,
    p1Right: 68,
    p2Up: 73,
    p2Left: 74,
    p2Down: 75,
    p2Right: 76,
    p1Select: 69,
    p2Select: 85,
    pause: 27,
    p1Decal: 49,
    p2Decal: 54,
    cycleMap: 71,
    togglePractice: 80,
    cyclePracticeSide: 186,
    toggleBossMode: 66,
    p1Path1: 90,
    p2Path1: 77,
    p1Path2: 88,
    p2Path2: 188,
    p1Path3: 67,
    p2Path3: 190,
    p1Sell: 81,
    p2Sell: 79,
    p1TargetPrev: 49,
    p1TargetNext: 50,
    p1Boost1: 51,
    p1Boost2: 52,
    p2Boost1: 54,
    p2Boost2: 55,
    p2TargetPrev: 56,
    p2TargetNext: 57,
    p1BloonNext: 82,
    p1BloonPrev: 86,
    p2BloonNext: 89,
    p2BloonPrev: 78,
    p1Send: 70,
    p2Send: 72,
    p1AutoEco: 192,
    p2AutoEco: 48,
}

function getPlayerCursor(side) {
    return side == PLAYER_SIDE.left ? cursor[0] : cursor[1]
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function createPlayerState(side) {
    return {
        side: side,
        get money() {
            return side == PLAYER_SIDE.left ? p1money : p2money
        },
        set money(value) {
            if(side == PLAYER_SIDE.left) {
                p1money = value
            } else {
                p2money = value
            }
        },
        get eco() {
            return side == PLAYER_SIDE.left ? p1eco : p2eco
        },
        set eco(value) {
            if(side == PLAYER_SIDE.left) {
                p1eco = value
            } else {
                p2eco = value
            }
        },
        get lives() {
            return side == PLAYER_SIDE.left ? p1lives : p2lives
        },
        set lives(value) {
            if(side == PLAYER_SIDE.left) {
                p1lives = value
            } else {
                p2lives = value
            }
        },
        get selectedBloon() {
            return side == PLAYER_SIDE.left ? p1SelectedBloon : p2SelectedBloon
        },
        set selectedBloon(value) {
            if(side == PLAYER_SIDE.left) {
                p1SelectedBloon = value
            } else {
                p2SelectedBloon = value
            }
        },
        get autoEco() {
            return side == PLAYER_SIDE.left ? p1AutoEco : p2AutoEco
        },
        set autoEco(value) {
            if(side == PLAYER_SIDE.left) {
                p1AutoEco = value
            } else {
                p2AutoEco = value
            }
        },
        get decalEnabled() {
            return side == PLAYER_SIDE.left ? p1decal : p2decal
        },
        set decalEnabled(value) {
            if(side == PLAYER_SIDE.left) {
                p1decal = value
            } else {
                p2decal = value
            }
        },
        get towers() {
            return side == PLAYER_SIDE.left ? p1Towers : p2Towers
        },
        get bloonQueue() {
            return side == PLAYER_SIDE.left ? p1BloonQueue : p2BloonQueue
        },
        get boostTypes() {
            return side == PLAYER_SIDE.left ? p1BoostTypes : p2BoostTypes
        },
        get cursor() {
            return getPlayerCursor(side)
        },
    }
}
