// Canvas bootstrap and the core mutable runtime state.
var canvas = document.querySelector("canvas")
canvas.width = CANVAS_SIZE.width
canvas.height = CANVAS_SIZE.height
var ctx = canvas.getContext("2d")

// Legacy globals are still initialized here so the existing gameplay code can keep working.
var money = ECONOMY_SETTINGS.startingMoney
var lives = ECONOMY_SETTINGS.startingLives
var eco = ECONOMY_SETTINGS.startingEco
var p1money = ECONOMY_SETTINGS.startingMoney
var p2money = ECONOMY_SETTINGS.startingMoney
var p1eco = ECONOMY_SETTINGS.startingEco
var p2eco = ECONOMY_SETTINGS.startingEco
var p1lives = ECONOMY_SETTINGS.startingLives
var p2lives = ECONOMY_SETTINGS.startingLives
var timeRoundEnded = 0
var timeGameStarted = gameNow()
var ecoIntervalId = null
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

var players = {
    1: createPlayerState(PLAYER_SIDE.left),
    2: createPlayerState(PLAYER_SIDE.right),
}
