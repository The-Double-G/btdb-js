// Front menu state and the single-player AI opponent.
var frontMenuState = "mode"
var selectedMenuMode = ""
var multiplayerMenuMessageUntil = 0
var humanSide = PLAYER_SIDE.left
var aiEnabled = false
var aiSide = 0
var frontMenuBackgroundAsset = "menu-background.png"
var aiProfile = {
    loadoutFilled: false,
    loadoutPlanReady: false,
    loadoutObserveUntil: 0,
    loadoutObserveDelayMs: 0,
    loadoutObservePausedAt: 0,
    loadoutObservedAny: false,
    startedAutoEcoAt: false,
    lastRushAt: 0,
    farmSpotIndex: 0,
    defenseSpotIndex: 0,
    bombSpotIndex: 0,
    lastRoundBoostCheck: -1,
    lastAimX: 0,
    lastAimY: 0,
    aimLocked: false,
    manualAimAction: null,
    currentAction: null,
    policySnapshot: null,
    learningEnabled: false,
    explorationEnabled: false,
    pendingTacticalDecision: null,
    tacticalTrace: [],
    placementOutcomes: {},
    placementSamples: [],
    observedLivesBySide: {},
    observedLivesLostBySide: {},
    decisionMemory: [],
}

var aiDesiredLoadoutTowers = ["000farm.png", "000wizard.png", "000bomb.png"]
var aiDesiredLoadoutBoosts = ["towerboost.png", "bloonboost.png"]
var AI_BOOST_IMAGES = ["towerboost.png", "bloonboost.png", "lightningboost.png", "slowboost.png", "ecoboost.png"]
var AI_IS_LOCAL_RUNTIME = typeof window != "undefined" && (window.location.protocol == "file:" || window.location.hostname == "" || window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")
var AI_CROSS_MATCH_LEARNING_ENABLED = !AI_IS_LOCAL_RUNTIME
var AI_LEARNING_ENDPOINT = "ai-learning.php?protocol=1"
var AI_TRAINING_STATUS_ENDPOINT = "https://raw.githubusercontent.com/The-Double-G/btdb-js/ai-status/ai-training-status.json"
var AI_TRAINING_JOBS_ENDPOINT = "https://api.github.com/repos/The-Double-G/btdb-js/actions/runs/"
var AI_TRAINING_STATUS_MAX_BYTES = 32768
var AI_TRAINING_JOBS_MAX_BYTES = 1048576
var AI_TRAINING_STATUS_REFRESH_INTERVAL = 120000
var AI_CONTRIBUTION_STORAGE_KEY = "aiPendingContributionsV2"
var AI_MAX_PENDING_CONTRIBUTIONS = 8
var AI_MAX_CONTRIBUTION_OBSERVATIONS = 320
var AI_MAX_PUBLIC_CONTRIBUTION_BYTES = 131072
var AI_MAX_PLACEMENT_SAMPLES = 64
var AI_MAX_PUBLIC_PLACEMENT_SAMPLES = 24
var AI_MAX_HUMAN_TACTICAL_EVENTS = 128
var AI_MAX_CAPTURED_HUMAN_ACTIONS = 96
var AI_MAX_HUMAN_TACTICAL_TOWERS = 64
var AI_FEATURE_KEYS = ["farm", "eco", "rush", "heavy", "late", "support", "camo", "greed", "preEco", "prePressure", "preHeavy", "preCamo", "preSupport", "preLate", "preEcoBoost", "preDefenseBoost", "preOffenseBoost"]
var AI_FEATURE_LABELS = {
    farm: "Farm",
    eco: "Eco",
    rush: "Rush",
    heavy: "Heavy",
    late: "Late",
    support: "Support",
    camo: "Camo",
    greed: "Greed",
    preEco: "Loadout Eco",
    prePressure: "Loadout Pressure",
    preHeavy: "Loadout Heavy",
    preCamo: "Loadout Camo",
    preSupport: "Loadout Support",
    preLate: "Loadout Late",
    preEcoBoost: "Eco Boost",
    preDefenseBoost: "Defense Boost",
    preOffenseBoost: "Offense Boost",
}
var AI_ACTION_PRIORITY = {
    emergency: 100,
    high: 80,
    normal: 60,
    support: 45,
    low: 20,
}
var AI_POLICY_HIDDEN_SIZE_1 = 64
var AI_POLICY_HIDDEN_SIZE_2 = 32
var AI_DECISION_STATE_INPUT_SIZE = 112
var AI_DECISION_CANDIDATE_INPUT_SIZE = 112
var AI_DECISION_STATE_HIDDEN_SIZE = 96
var AI_DECISION_CANDIDATE_HIDDEN_SIZE = 48
var AI_DECISION_EMBEDDING_SIZE = 48
var AI_DECISION_MEMORY_SIZE = 16
var AI_DECISION_SURVIVAL_CLASS_COUNT = 4
var AI_DECISION_FAMILY_COUNT = 8
var AI_DECISION_BOOTSTRAP_SAMPLES = 5000
var AI_MAX_PUBLIC_DECISION_SAMPLES = 12
var AI_MAX_DECISION_SAMPLE_AGE = 1000000
var AI_DECISION_FAMILY = {
    loadout: 0,
    strategy: 1,
    placement: 2,
    upgrade: 3,
    sell: 4,
    eco: 5,
    rush: 6,
    boost: 7,
}
var AI_POLICY_PARAMETER_LIMIT = 4
var AI_LEARNING_SCHEMA_VERSION = 13
var AI_MODEL_FAMILY = "semantic-intent-spatial-recurrent-actor-critic-v5"
var AI_DECISION_CREDIT_VERSION = 3
var AI_DECISION_TD_STEPS = 4
var AI_DECISION_DISCOUNT_PER_SECOND = 0.99
var aiDecisionStateCache = null
var aiPersistenceState = {
    backend: AI_CROSS_MATCH_LEARNING_ENABLED ? "php backend shared" : "session only",
    restoreRequested: false,
    restoreComplete: false,
    loadInFlight: false,
    saveInFlight: false,
    lastLoadedAt: 0,
    updatedAt: "",
    lastSavedAt: 0,
    lastError: "",
    revision: 0,
    modelDigest: "",
    writeEnabled: false,
    contributionEnabled: false,
    contributionToken: "",
    contributionInFlight: false,
    pendingContributions: 0,
    contributionRetryAt: 0,
    lastContributionAt: 0,
    contributionEpoch: 1,
}
var aiTrainerStatusState = {
    status: null,
    loadInFlight: false,
    lastLoadedAt: 0,
    lastError: "",
    liveRunId: 0,
    liveRunAttempt: 0,
    liveUpdatedAt: 0,
    liveError: "",
}
var aiTrainerStatusRefreshPromise = null
var aiTowerDpsCache = {}
var aiLearningRefreshPromise = null
var aiLearningRefreshForceQueued = false
var aiLearningLastRefreshSucceeded = false
var aiLoadoutLibraryReady = false
var aiLoadoutLibrary = []
var aiLoadoutsByKey = {}
var aiTickState = {
    lastLogicAt: 0,
    lastCursorAt: 0,
}
var AI_STRATEGY_LIBRARY = [
    { id: "arcane_banks", towers: ["000farm.png", "000wizard.png", "000bomb.png"], boosts: ["towerboost.png", "bloonboost.png"] },
    { id: "shadow_stall", towers: ["000farm.png", "000ninja.png", "000bomb.png"], boosts: ["towerboost.png", "lightningboost.png"] },
    { id: "sniper_econ", towers: ["000farm.png", "000sniper.png", "000bomb.png"], boosts: ["towerboost.png", "ecoboost.png"] },
    { id: "cobra_punish", towers: ["000cobra.png", "000wizard.png", "000bomb.png"], boosts: ["slowboost.png", "bloonboost.png"] },
    { id: "arcane_super", towers: ["000farm.png", "000wizard.png", "000super.png"], boosts: ["towerboost.png", "ecoboost.png"] },
    { id: "artillery_grid", towers: ["000farm.png", "000mortar.png", "000bomb.png"], boosts: ["towerboost.png", "slowboost.png"] },
    { id: "laser_lane", towers: ["000farm.png", "000dartling.png", "000wizard.png"], boosts: ["towerboost.png", "ecoboost.png"] },
    { id: "engineer_shells", towers: ["000farm.png", "000engi.png", "000bomb.png"], boosts: ["towerboost.png", "lightningboost.png"] },
    { id: "boomer_pressure", towers: ["000farm.png", "000boomer.png", "000wizard.png"], boosts: ["towerboost.png", "bloonboost.png"] },
    { id: "tack_shells", towers: ["000farm.png", "000tack.png", "000bomb.png"], boosts: ["towerboost.png", "lightningboost.png"] },
    { id: "frost_shells", towers: ["000farm.png", "000ice.png", "000bomb.png"], boosts: ["towerboost.png", "slowboost.png"] },
    { id: "dart_marksman", towers: ["000farm.png", "000dart.png", "000sniper.png"], boosts: ["towerboost.png", "ecoboost.png"] },
    { id: "sword_arcane", towers: ["000farm.png", "000sword.png", "000wizard.png"], boosts: ["towerboost.png", "bloonboost.png"] },
    { id: "tack_shadow", towers: ["000farm.png", "000tack.png", "000ninja.png"], boosts: ["lightningboost.png", "bloonboost.png"] },
    { id: "ice_arcane", towers: ["000farm.png", "000ice.png", "000wizard.png"], boosts: ["slowboost.png", "lightningboost.png"] },
]

function createAIStrategyVariant(baseStrategy, variantType) {
    return {
        id: baseStrategy.id + "_" + variantType,
        towers: baseStrategy.towers.slice(0),
        boosts: baseStrategy.boosts.slice(0),
    }
}

var aiBaseStrategiesForVariants = AI_STRATEGY_LIBRARY.slice(0)
for(var aiBaseStrategyIndex = 0; aiBaseStrategyIndex < aiBaseStrategiesForVariants.length; aiBaseStrategyIndex++) {
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "greedy"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "pressure"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "defensive"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "tempo"))
}

var AI_PLACEMENT_GRID_X = 7
var AI_PLACEMENT_GRID_Y = 6
var AI_CROSSPATH_CONTEXT_KEYS = ["balanced", "swarm", "heavy", "greed", "pressure"]
var aiLearning = null
var aiCurrentStrategy = null
var aiMatchTelemetry = null
var aiStrategySelection = null
var localMatchCollectionState = null

function createLocalMatchSideTelemetry() {
    return {
        ecoPeak: 250,
        farmPeak: 0,
        supportPeak: 0,
        camoPeak: 0,
        pressurePeak: 0,
        heavyPressurePeak: 0,
        greedMoments: 0,
        roundPeak: 0,
        lastGreedTick: 0,
        tacticalEvents: [],
        nextTacticalTowerId: 1,
    }
}

function resetLocalMatchCollection() {
    localMatchCollectionState = {
        recorded: false,
        contributionStatus: "not-eligible",
        contributionIds: [],
        acceptedContributionIds: {},
        contributionEpoch: Math.max(1, Math.floor(aiPersistenceState.contributionEpoch)),
        sides: {
            1: createLocalMatchSideTelemetry(),
            2: createLocalMatchSideTelemetry(),
        },
    }
}

function isLocalHumanTacticalCaptureActive(side) {
    return selectedMenuMode == "local" && !aiEnabled && !practiceMode && !bossMode && gameStarted && !gameOver && isHumanControlledSide(side) && localMatchCollectionState && localMatchCollectionState.sides[side]
}

function getLocalHumanTacticalTime() {
    return clamp(Math.round(Math.max(0, gameNow() - timeGameStarted) / 250) * 250, 0, 7200000)
}

function recordLocalHumanTacticalEvent(side, event) {
    if(!isLocalHumanTacticalCaptureActive(side) || !event || typeof event.k != "string") return false
    var trace = localMatchCollectionState.sides[side].tacticalEvents
    if(trace.length >= AI_MAX_CAPTURED_HUMAN_ACTIONS) return false
    var recorded = {
        k: event.k,
        t: getLocalHumanTacticalTime(),
        r: getCurrentVisibleRound(),
    }
    for(var key in event) {
        if(key != "k") recorded[key] = event[key]
    }
    trace.push(recorded)
    return true
}

function getLocalHumanTacticalTowerId(tower, createIfMissing) {
    if(!tower || !localMatchCollectionState || !localMatchCollectionState.sides[tower.playerSide]) return 0
    if(Number.isInteger(tower.localHumanTacticalId) && tower.localHumanTacticalId > 0) return tower.localHumanTacticalId
    if(!createIfMissing) return 0
    var telemetry = localMatchCollectionState.sides[tower.playerSide]
    if(telemetry.nextTacticalTowerId > AI_MAX_HUMAN_TACTICAL_TOWERS) return 0
    tower.localHumanTacticalId = telemetry.nextTacticalTowerId++
    return tower.localHumanTacticalId
}

function recordLocalHumanTowerPlacement(tower) {
    if(!tower || !isLocalHumanTacticalCaptureActive(tower.playerSide)) return false
    var tacticalTowerId = getLocalHumanTacticalTowerId(tower, true)
    if(!tacticalTowerId) return false
    var bucket = getAIPlacementBucket(tower.playerSide, tower.x, tower.y)
    return recordLocalHumanTacticalEvent(tower.playerSide, {
        k: "place",
        id: tacticalTowerId,
        tower: String(tower.towerType || ""),
        x: bucket.x,
        y: bucket.y,
    })
}

function recordLocalHumanTowerUpgrade(tower, pathNumber) {
    var id = getLocalHumanTacticalTowerId(tower, false)
    if(!id) return false
    return recordLocalHumanTacticalEvent(tower.playerSide, {
        k: "upgrade",
        id: id,
        path: pathNumber,
        tier: Number(tower["path" + pathNumber + "Upgrades"]) || 0,
    })
}

function recordLocalHumanTowerSale(tower) {
    var id = getLocalHumanTacticalTowerId(tower, false)
    return id ? recordLocalHumanTacticalEvent(tower.playerSide, { k: "sell", id: id }) : false
}

function getLocalHumanSendSlot(side) {
    return clamp((Number(players[side].selectedBloon) || 0) - (side == PLAYER_SIDE.left ? 0 : 10), 0, 9)
}

function recordLocalHumanBloonSend(side, source) {
    if(!isLocalHumanTacticalCaptureActive(side)) return false
    var trace = localMatchCollectionState.sides[side].tacticalEvents
    var now = getLocalHumanTacticalTime()
    var slot = getLocalHumanSendSlot(side)
    var previous = trace.length > 0 ? trace[trace.length - 1] : null
    if(previous && previous.k == "send" && previous.source == source && previous.slot == slot && previous.r == getCurrentVisibleRound() && now - previous.t <= 1000 && previous.groups < 6) {
        previous.groups++
        previous.t = now
        return true
    }
    return recordLocalHumanTacticalEvent(side, { k: "send", slot: slot, groups: 1, source: source })
}

function recordLocalHumanEcoToggle(side) {
    return recordLocalHumanTacticalEvent(side, { k: "eco", enabled: !!players[side].autoEco, slot: getLocalHumanSendSlot(side) })
}

function recordLocalHumanBoost(side, boostType) {
    return recordLocalHumanTacticalEvent(side, { k: "boost", boost: String(boostType || "") })
}

function recordLocalHumanCollection(tower, source) {
    var id = getLocalHumanTacticalTowerId(tower, false)
    if(!id || !isLocalHumanTacticalCaptureActive(tower.playerSide)) return false
    var trace = localMatchCollectionState.sides[tower.playerSide].tacticalEvents
    var now = getLocalHumanTacticalTime()
    var previous = trace.length > 0 ? trace[trace.length - 1] : null
    if(previous && previous.k == "collect" && previous.source == source && previous.id == id && previous.r == getCurrentVisibleRound() && now - previous.t <= 1000 && previous.count < 255) {
        previous.count++
        previous.t = now
        return true
    }
    return recordLocalHumanTacticalEvent(tower.playerSide, { k: "collect", source: source, id: id, count: 1 })
}

function getLocalHumanAimMode(tower) {
    if((tower.towerType == "dartling" || tower.towerType == "mortar") && (tower.towerType != "mortar" || tower.path3Upgrades < 1)) return tower.targetPrio == 0 ? "follow" : "lock"
    if(tower.towerType == "mortar" && tower.path3Upgrades >= 1 && tower.targetPrio >= 4) return tower.targetPrio == 4 ? "follow" : "lock"
    return ["first", "last", "close", "strong"][clamp(tower.targetPrio, 0, 3)]
}

function recordLocalHumanAim(tower) {
    var id = getLocalHumanTacticalTowerId(tower, false)
    if(!id || !isLocalHumanTacticalCaptureActive(tower.playerSide)) return false
    var bucket = getAIPlacementBucket(tower.playerSide, players[tower.playerSide].cursor.x, players[tower.playerSide].cursor.y)
    return recordLocalHumanTacticalEvent(tower.playerSide, { k: "aim", id: id, mode: getLocalHumanAimMode(tower), x: bucket.x, y: bucket.y })
}

function getLocalHumanTacticalEventsForUpload(side) {
    var trace = localMatchCollectionState && localMatchCollectionState.sides[side] ? localMatchCollectionState.sides[side].tacticalEvents : []
    var waitBudget = Math.max(0, AI_MAX_HUMAN_TACTICAL_EVENTS - trace.length)
    var events = []
    var previousTime = 0
    for(var i = 0; i < trace.length; i++) {
        var event = trace[i]
        var gap = Math.max(0, event.t - previousTime)
        if(gap >= 3000 && waitBudget > 0) {
            events.push({ k: "wait", t: event.t, r: event.r, ms: Math.min(60000, gap) })
            waitBudget--
        }
        events.push(Object.assign({}, event))
        previousTime = event.t
    }
    return events.slice(0, AI_MAX_HUMAN_TACTICAL_EVENTS)
}

function isFrontMenuOpen() {
    return gameStarted == false && frontMenuState != "pregame"
}

function isAISide(side) {
    if(aiEnabled && typeof isAITrainingTrueSelfPlayActive == "function" && isAITrainingTrueSelfPlayActive()) {
        return side == PLAYER_SIDE.left || side == PLAYER_SIDE.right
    }
    return aiEnabled && aiSide == side
}

function isHumanControlledSide(side) {
    return isAISide(side) == false
}

function resetAIProfile() {
    aiProfile.loadoutFilled = false
    aiProfile.loadoutPlanReady = false
    aiProfile.loadoutObserveUntil = 0
    aiProfile.loadoutObserveDelayMs = 0
    aiProfile.loadoutObservePausedAt = 0
    aiProfile.loadoutObservedAny = false
    aiProfile.startedAutoEcoAt = false
    aiProfile.lastRushAt = 0
    aiProfile.farmSpotIndex = 0
    aiProfile.defenseSpotIndex = 0
    aiProfile.bombSpotIndex = 0
    aiProfile.lastRoundBoostCheck = -1
    aiProfile.lastAimX = 0
    aiProfile.lastAimY = 0
    aiProfile.aimLocked = false
    aiProfile.manualAimAction = null
    aiProfile.currentAction = null
    aiProfile.policySnapshot = null
    aiProfile.learningEnabled = false
    aiProfile.explorationEnabled = false
    aiProfile.pendingTacticalDecision = null
    aiProfile.tacticalTrace = []
    aiProfile.placementOutcomes = {}
    aiProfile.placementSamples = []
    aiProfile.observedLivesBySide = {}
    aiProfile.observedLivesLostBySide = {}
    aiProfile.decisionMemory = aiCreateVector(AI_DECISION_MEMORY_SIZE, 0)
    aiDecisionStateCache = null
    aiTickState.lastLogicAt = gameNow()
    aiTickState.lastCursorAt = gameNow()
}

function getAIPregameObserveDelayMs() {
    return 5000 + Math.floor(Math.random() * 5001)
}

function shouldPauseAIPregameObservation() {
    return false
}

function updateAIPregameObservePauseState() {
    if(shouldPauseAIPregameObservation()) {
        if(aiProfile.loadoutObservePausedAt <= 0) {
            aiProfile.loadoutObservePausedAt = realNow()
        }
        return
    }

    if(aiProfile.loadoutObservePausedAt > 0) {
        aiProfile.loadoutObserveUntil += realNow() - aiProfile.loadoutObservePausedAt
        aiProfile.loadoutObservePausedAt = 0
    }
}

function startLocalGameSetup() {
    selectedMenuMode = "local"
    frontMenuState = "pregame"
    aiEnabled = false
    aiSide = 0
    practiceMode = false
    nonPlayableSide = 2
    aiCurrentStrategy = null
    aiMatchTelemetry = null
    aiStrategySelection = null
    resetAIProfile()
    resetLocalMatchCollection()
}

function startVsAIGameSetup(side) {
    selectedMenuMode = "vs-ai"
    frontMenuState = "pregame"
    humanSide = side
    aiSide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    aiEnabled = true
    practiceMode = false
    nonPlayableSide = aiSide
    aiCurrentStrategy = null
    aiMatchTelemetry = null
    aiStrategySelection = null
    aiDesiredLoadoutTowers = []
    aiDesiredLoadoutBoosts = []
    resetAIProfile()
    aiProfile.loadoutObserveDelayMs = getAIPregameObserveDelayMs()
    aiProfile.loadoutObserveUntil = realNow() + aiProfile.loadoutObserveDelayMs
}

function isFrontMenuButtonDisabled(button) {
    if(button.id == "ai-refresh") {
        return AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.loadInFlight || aiTrainerStatusState.loadInFlight
    }
    return false
}

function aiRandomWeight(scale) {
    return (Math.random() * 2 - 1) * scale
}

function aiCreateMatrix(rows, cols, scale) {
    var matrix = []
    for(var row = 0; row < rows; row++) {
        var line = []
        for(var col = 0; col < cols; col++) {
            line.push(aiRandomWeight(scale))
        }
        matrix.push(line)
    }
    return matrix
}

function aiCreateVector(length, fillValue) {
    var values = []
    for(var i = 0; i < length; i++) {
        values.push(fillValue)
    }
    return values
}

function aiDeterministicWeight(index, scale, salt) {
    var state = ((index + 1) * 1664525 + (salt || 0) * 1013904223) >>> 0
    state = (state * 1664525 + 1013904223) >>> 0
    return ((state / 4294967295) * 2 - 1) * scale
}

function aiCreateDeterministicMatrix(rows, cols, scale, salt) {
    var matrix = []
    for(var row = 0; row < rows; row++) {
        var line = []
        for(var col = 0; col < cols; col++) {
            line.push(aiDeterministicWeight(row * cols + col, scale, (salt || 0) + row * 17))
        }
        matrix.push(line)
    }
    return matrix
}

function createEmptyLoadoutSummary() {
    return {
        towerImages: [],
        boostImages: [],
        towerTypes: [],
        eco: 0,
        pressure: 0,
        heavy: 0,
        camo: 0,
        support: 0,
        late: 0,
        ecoBoost: 0,
        defenseBoost: 0,
        offenseBoost: 0,
        filledTowerSlots: 0,
        filledBoostSlots: 0,
        selectionRatio: 0,
        hasAnySelection: false,
        signature: "",
    }
}

function addTowerTypeToLoadoutSummary(summary, towerType, image) {
    summary.towerTypes.push(towerType)
    summary.towerImages.push(image)
    summary.filledTowerSlots++

    if(towerType == "farm") {
        summary.eco += 1.35
        summary.late += 0.12
    } else if(towerType == "cobra") {
        summary.eco += 0.6
        summary.support += 1.15
        summary.pressure += 1.05
    } else if(towerType == "sniper") {
        summary.support += 0.95
        summary.heavy += 0.9
        summary.camo += 0.75
        summary.late += 0.45
    } else if(towerType == "wizard") {
        summary.camo += 1.05
        summary.late += 0.72
        summary.pressure += 0.35
    } else if(towerType == "ninja") {
        summary.camo += 1.05
        summary.support += 0.35
        summary.pressure += 0.45
    } else if(towerType == "bomb") {
        summary.heavy += 1.2
        summary.pressure += 0.2
    } else if(towerType == "mortar") {
        summary.heavy += 1
        summary.camo += 0.3
        summary.late += 0.45
    } else if(towerType == "dartling") {
        summary.heavy += 1
        summary.camo += 0.25
        summary.late += 0.65
        summary.pressure += 0.55
    } else if(towerType == "super") {
        summary.heavy += 1.35
        summary.late += 1.45
    } else if(towerType == "boomer") {
        summary.pressure += 0.78
        summary.heavy += 0.45
    } else if(towerType == "tack") {
        summary.pressure += 0.95
    } else if(towerType == "ice") {
        summary.support += 0.82
        summary.pressure += 0.4
    } else if(towerType == "engi") {
        summary.support += 0.95
        summary.pressure += 0.35
        summary.late += 0.4
    } else if(towerType == "sword") {
        summary.heavy += 0.95
        summary.pressure += 0.52
        summary.late += 0.48
    } else if(towerType == "buccaneer") {
        summary.heavy += 0.72
        summary.late += 0.5
        summary.camo += 0.25
    } else if(towerType == "dart") {
        summary.pressure += 0.55
        summary.camo += 0.15
    }
}

function addBoostTypeToLoadoutSummary(summary, boostImage) {
    summary.boostImages.push(boostImage)
    summary.filledBoostSlots++

    if(boostImage == "ecoboost.png") {
        summary.ecoBoost += 1
        summary.eco += 0.35
    } else if(boostImage == "towerboost.png") {
        summary.defenseBoost += 1
    } else if(boostImage == "lightningboost.png") {
        summary.defenseBoost += 0.9
    } else if(boostImage == "slowboost.png") {
        summary.defenseBoost += 0.45
        summary.offenseBoost += 0.65
        summary.pressure += 0.25
    } else if(boostImage == "bloonboost.png") {
        summary.offenseBoost += 1
        summary.pressure += 0.35
    }
}

function finalizeLoadoutSummary(summary) {
    summary.towerTypes.sort()
    summary.boostImages.sort()
    summary.selectionRatio = clamp((summary.filledTowerSlots / 3 + summary.filledBoostSlots / 2) / 2, 0, 1)
    summary.hasAnySelection = summary.filledTowerSlots > 0 || summary.filledBoostSlots > 0
    summary.signature = summary.towerTypes.join(",") + "||" + summary.boostImages.join(",")
    summary.eco = clamp(summary.eco / 2.35, 0, 1)
    summary.pressure = clamp(summary.pressure / 2.35, 0, 1)
    summary.heavy = clamp(summary.heavy / 2.25, 0, 1)
    summary.camo = clamp(summary.camo / 1.9, 0, 1)
    summary.support = clamp(summary.support / 2.15, 0, 1)
    summary.late = clamp(summary.late / 2.35, 0, 1)
    summary.ecoBoost = clamp(summary.ecoBoost, 0, 1)
    summary.defenseBoost = clamp(summary.defenseBoost, 0, 1)
    summary.offenseBoost = clamp(summary.offenseBoost, 0, 1)
    return summary
}

function summarizeLoadoutSelection(towerImages, boostImages) {
    var summary = createEmptyLoadoutSummary()
    for(var i = 0; i < towerImages.length; i++) {
        var image = towerImages[i]
        if(!image) {
            continue
        }
        addTowerTypeToLoadoutSummary(summary, getTowerTypeFromImage(image), image)
    }
    for(var boostIndex = 0; boostIndex < boostImages.length; boostIndex++) {
        var boostImage = boostImages[boostIndex]
        if(!boostImage) {
            continue
        }
        addBoostTypeToLoadoutSummary(summary, boostImage)
    }
    return finalizeLoadoutSummary(summary)
}

function createDefaultAILoadoutStatsRecord() {
    return {
        games: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        lastReward: 0,
    }
}

function getAILoadoutSelectionStatKey(loadoutSignature, loadoutKey) {
    return loadoutSignature + "|" + loadoutKey
}

function ensureAILoadoutLibraryInitialized() {
    if(aiLoadoutLibraryReady) {
        return true
    }
    if(typeof LOADOUT_TOWER_CONFIG == "undefined") {
        return false
    }

    aiLoadoutLibraryReady = true
    aiLoadoutLibrary = []
    aiLoadoutsByKey = {}
    var towerImages = Object.keys(LOADOUT_TOWER_CONFIG).sort()
    for(var firstTowerIndex = 0; firstTowerIndex < towerImages.length - 2; firstTowerIndex++) {
        for(var secondTowerIndex = firstTowerIndex + 1; secondTowerIndex < towerImages.length - 1; secondTowerIndex++) {
            for(var thirdTowerIndex = secondTowerIndex + 1; thirdTowerIndex < towerImages.length; thirdTowerIndex++) {
                var selectedTowers = [towerImages[firstTowerIndex], towerImages[secondTowerIndex], towerImages[thirdTowerIndex]]
                for(var firstBoostIndex = 0; firstBoostIndex < AI_BOOST_IMAGES.length - 1; firstBoostIndex++) {
                    for(var secondBoostIndex = firstBoostIndex + 1; secondBoostIndex < AI_BOOST_IMAGES.length; secondBoostIndex++) {
                        var selectedBoosts = [AI_BOOST_IMAGES[firstBoostIndex], AI_BOOST_IMAGES[secondBoostIndex]]
                        var summary = summarizeLoadoutSelection(selectedTowers, selectedBoosts)
                        var loadout = {
                            key: summary.signature,
                            towers: selectedTowers.slice(0),
                            boosts: selectedBoosts.slice(0),
                            summary: summary,
                        }
                        aiLoadoutLibrary.push(loadout)
                        aiLoadoutsByKey[loadout.key] = loadout
                    }
                }
            }
        }
    }
    return true
}

function getAILoadoutByKey(loadoutKey) {
    ensureAILoadoutLibraryInitialized()
    return aiLoadoutsByKey[loadoutKey] || null
}

function peekAILoadoutStatsRecord(loadoutKey) {
    ensureAILearningLoaded()
    return aiLearning.loadoutStats[loadoutKey] || null
}

function getAILoadoutStatsRecord(loadoutKey) {
    ensureAILearningLoaded()
    if(!aiLearning.loadoutStats[loadoutKey]) {
        aiLearning.loadoutStats[loadoutKey] = createDefaultAILoadoutStatsRecord()
    }
    return aiLearning.loadoutStats[loadoutKey]
}

function getAILoadoutPerformanceBonus(loadoutKey) {
    var record = peekAILoadoutStatsRecord(loadoutKey)
    if(!record) {
        return 0
    }
    if(record.games <= 0) {
        return 0
    }
    var confidence = record.games / (record.games + 12)
    return clamp((record.wins - record.losses) / Math.max(1, record.games) * 0.28 * confidence, -0.28, 0.28)
}

function getAILoadoutExplorationBonus(loadoutKey) {
    if(!aiProfile || aiProfile.explorationEnabled == false) {
        return 0
    }
    var record = peekAILoadoutStatsRecord(loadoutKey)
    var totalSamples = Math.max(1, aiLearning.totalLoadoutSamples || aiLearning.totalGames || 1)
    var games = record ? record.games : 0
    return Math.sqrt(Math.log(totalSamples + 1) / Math.max(1, games + 1)) * 0.42
}

function getAILoadoutCoverageBonus(loadoutKey) {
    if(!aiProfile || aiProfile.explorationEnabled == false) {
        return 0
    }
    var record = peekAILoadoutStatsRecord(loadoutKey)
    if(!record || Math.max(0, Number(record.games) || 0) == 0) {
        // Sample every legal loadout before policy noise can favor a small
        // familiar subset indefinitely.
        return 2.25
    }
    return 0
}

function getAILoadoutCounterHeuristicBonus(loadoutSummary, observedLoadoutSummary) {
    if(!observedLoadoutSummary || observedLoadoutSummary.hasAnySelection == false) {
        return loadoutSummary.eco * 0.08 + loadoutSummary.support * 0.04 + loadoutSummary.late * 0.03
    }

    var bonus = 0
    bonus += observedLoadoutSummary.eco * (loadoutSummary.pressure * 0.72 + loadoutSummary.offenseBoost * 0.26 + loadoutSummary.camo * 0.08 - loadoutSummary.eco * 0.12)
    bonus += observedLoadoutSummary.ecoBoost * (loadoutSummary.pressure * 0.38 + loadoutSummary.offenseBoost * 0.18 + loadoutSummary.support * 0.08)
    bonus += observedLoadoutSummary.pressure * (loadoutSummary.defenseBoost * 0.42 + loadoutSummary.heavy * 0.34 + loadoutSummary.support * 0.26 - loadoutSummary.eco * 0.12)
    bonus += observedLoadoutSummary.offenseBoost * (loadoutSummary.defenseBoost * 0.28 + loadoutSummary.heavy * 0.16 + loadoutSummary.support * 0.12)
    bonus += observedLoadoutSummary.heavy * (loadoutSummary.heavy * 0.4 + loadoutSummary.late * 0.16 + loadoutSummary.support * 0.08)
    bonus += observedLoadoutSummary.camo * (loadoutSummary.camo * 0.46 + loadoutSummary.support * 0.14)
    bonus += observedLoadoutSummary.support * (loadoutSummary.late * 0.18 + loadoutSummary.pressure * 0.12)
    bonus += observedLoadoutSummary.late * (loadoutSummary.pressure * 0.22 + loadoutSummary.heavy * 0.18 + loadoutSummary.late * 0.08)
    if(loadoutSummary.towerTypes.indexOf("farm") != -1 && observedLoadoutSummary.pressure < 0.35 && observedLoadoutSummary.offenseBoost < 0.35) {
        bonus += 0.1
    }
    if(loadoutSummary.towerTypes.indexOf("cobra") != -1 && observedLoadoutSummary.eco >= 0.45) {
        bonus += 0.16
    }
    if(loadoutSummary.towerTypes.indexOf("bomb") != -1 && observedLoadoutSummary.heavy >= 0.45) {
        bonus += 0.12
    }
    if((loadoutSummary.towerTypes.indexOf("wizard") != -1 || loadoutSummary.towerTypes.indexOf("ninja") != -1 || loadoutSummary.towerTypes.indexOf("sniper") != -1) && observedLoadoutSummary.camo >= 0.45) {
        bonus += 0.12
    }
    return bonus * observedLoadoutSummary.selectionRatio
}

function getAILoadoutCounterLearningBonus(loadoutKey, observedLoadoutSummary) {
    ensureAILearningLoaded()
    if(!observedLoadoutSummary || observedLoadoutSummary.hasAnySelection == false || observedLoadoutSummary.signature == "||") {
        return 0
    }
    return getAILearningScore(aiLearning.loadoutCounterStats, getAILoadoutSelectionStatKey(observedLoadoutSummary.signature, loadoutKey)) * (0.55 + observedLoadoutSummary.selectionRatio * 0.35)
}

function chooseAILoadoutForMatch(observedLoadoutSummary, excludedLoadoutKeys) {
    if(ensureAILoadoutLibraryInitialized() == false || aiLoadoutLibrary.length <= 0) {
        return {
            key: summarizeLoadoutSelection(aiDesiredLoadoutTowers, aiDesiredLoadoutBoosts).signature,
            towers: aiDesiredLoadoutTowers.slice(0),
            boosts: aiDesiredLoadoutBoosts.slice(0),
            summary: summarizeLoadoutSelection(aiDesiredLoadoutTowers, aiDesiredLoadoutBoosts),
        }
    }
    ensureAILearningLoaded()
    var scoredLoadouts = []
    for(var i = 0; i < aiLoadoutLibrary.length; i++) {
        var loadout = aiLoadoutLibrary[i]
        if(excludedLoadoutKeys) {
            if(Array.isArray(excludedLoadoutKeys) && excludedLoadoutKeys.indexOf(loadout.key) != -1) {
                continue
            }
            if(Array.isArray(excludedLoadoutKeys) == false && excludedLoadoutKeys == loadout.key) {
                continue
            }
        }
        scoredLoadouts.push({ loadout: loadout })
    }
    var bestEntry = null
    var stateFeatures = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.loadout, null, observedLoadoutSummary ? getObservedLoadoutFeatureVector(observedLoadoutSummary) : null)
    var candidateLimit = scoredLoadouts.length
    for(var candidateIndex = 0; candidateIndex < candidateLimit; candidateIndex++) {
        var entry = scoredLoadouts[candidateIndex]
        var summary = entry.loadout.summary
        entry.decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.loadout, {
            id: entry.loadout.key,
            type: summary.towerTypes.join(","),
            role: summary.boostImages.join(","),
            actionKey: "loadout|" + entry.loadout.key,
            index: candidateIndex,
            maxIndex: Math.max(1, candidateLimit - 1),
            count: summary.filledTowerSlots + summary.filledBoostSlots,
            countScale: 5,
            loadoutSummary: summary,
            capabilityFacts: getAILoadoutCapabilityFacts(entry.loadout.towers, entry.loadout.boosts, 0),
        }, null, stateFeatures)
        entry.decision.counterLearningBonus = getAILoadoutCounterLearningBonus(entry.loadout.key, observedLoadoutSummary)
        entry.decision.performanceBonus = getAILoadoutPerformanceBonus(entry.loadout.key)
        entry.decision.explorationBonus = getAILoadoutExplorationBonus(entry.loadout.key)
        entry.decision.coverageBonus = getAILoadoutCoverageBonus(entry.loadout.key)
        entry.decision.score += entry.decision.counterLearningBonus + entry.decision.performanceBonus + entry.decision.explorationBonus + entry.decision.coverageBonus
        if(!bestEntry || isAIDecisionScoreBetter(entry.decision, bestEntry.decision)) {
            bestEntry = entry
        }
    }
    var selected = bestEntry || scoredLoadouts[0]
    if(!selected) return aiLoadoutLibrary[0]
    return {
        key: selected.loadout.key,
        towers: selected.loadout.towers.slice(0),
        boosts: selected.loadout.boosts.slice(0),
        summary: selected.loadout.summary,
        decisionSample: selected.decision || null,
    }
}

function createAIRuntimeStrategyForLoadout(loadout, archetype, observedLoadoutSummary) {
    var runtimeStrategy = {
        id: archetype && archetype.id ? archetype.id : loadout.key,
    }
    runtimeStrategy.loadoutKey = loadout.key
    runtimeStrategy.loadoutSummary = loadout.summary
    runtimeStrategy.towers = loadout.towers.slice(0)
    runtimeStrategy.boosts = loadout.boosts.slice(0)
    return runtimeStrategy
}

function getObservedOpponentLoadoutSummary(side) {
    return summarizeLoadoutSelection(players[side].towers, players[side].boostTypes)
}

function getObservedLoadoutFeatureVector(summary) {
    var vector = aiCreateVector(AI_FEATURE_KEYS.length, 0)
    if(!summary || summary.hasAnySelection == false) {
        return vector
    }

    vector[getFeatureIndex("preEco")] = summary.eco
    vector[getFeatureIndex("prePressure")] = summary.pressure
    vector[getFeatureIndex("preHeavy")] = summary.heavy
    vector[getFeatureIndex("preCamo")] = summary.camo
    vector[getFeatureIndex("preSupport")] = summary.support
    vector[getFeatureIndex("preLate")] = summary.late
    vector[getFeatureIndex("preEcoBoost")] = summary.ecoBoost
    vector[getFeatureIndex("preDefenseBoost")] = summary.defenseBoost
    vector[getFeatureIndex("preOffenseBoost")] = summary.offenseBoost
    return vector
}

function getLoadoutCounterStatKey(loadoutSignature, strategyIndex) {
    return loadoutSignature + "|" + AI_STRATEGY_LIBRARY[strategyIndex].id
}

function createDefaultAIStrategyPolicy(outputBias) {
    return {
        hiddenSize1: AI_POLICY_HIDDEN_SIZE_1,
        hiddenSize2: AI_POLICY_HIDDEN_SIZE_2,
        W1: aiCreateMatrix(AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length, 0.16),
        b1: aiCreateVector(AI_POLICY_HIDDEN_SIZE_1, 0),
        W2: aiCreateMatrix(AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1, 0.14),
        b2: aiCreateVector(AI_POLICY_HIDDEN_SIZE_2, 0),
        W3: aiCreateMatrix(AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2, 0.16),
        b3: outputBias.slice(0),
    }
}

function createDefaultAIDecisionPolicy() {
    // Keep first 80 columns deterministic as in schema 12 for test stability; extra 32 for 112 are zero-started and learned.
    var baseWState1 = aiCreateDeterministicMatrix(AI_DECISION_STATE_HIDDEN_SIZE, 80, 0.08, 11)
    var baseWCandidate1 = aiCreateDeterministicMatrix(AI_DECISION_CANDIDATE_HIDDEN_SIZE, 80, 0.09, 37)
    for(var r = 0; r < baseWState1.length; r++) baseWState1[r] = baseWState1[r].concat(aiCreateVector(AI_DECISION_STATE_INPUT_SIZE - 80, 0))
    for(var r2 = 0; r2 < baseWCandidate1.length; r2++) baseWCandidate1[r2] = baseWCandidate1[r2].concat(aiCreateVector(AI_DECISION_CANDIDATE_INPUT_SIZE - 80, 0))
    return {
        stateInputSize: AI_DECISION_STATE_INPUT_SIZE,
        candidateInputSize: AI_DECISION_CANDIDATE_INPUT_SIZE,
        stateHiddenSize: AI_DECISION_STATE_HIDDEN_SIZE,
        candidateHiddenSize: AI_DECISION_CANDIDATE_HIDDEN_SIZE,
        embeddingSize: AI_DECISION_EMBEDDING_SIZE,
        memorySize: AI_DECISION_MEMORY_SIZE,
        survivalClassCount: AI_DECISION_SURVIVAL_CLASS_COUNT,
        trainingSamples: aiCreateVector(AI_DECISION_FAMILY_COUNT, 0),
        WState1: baseWState1,
        bState1: aiCreateVector(AI_DECISION_STATE_HIDDEN_SIZE, 0),
        WState2: aiCreateDeterministicMatrix(AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE, 0.07, 23),
        bState2: aiCreateVector(AI_DECISION_EMBEDDING_SIZE, 0),
        WCandidate1: baseWCandidate1,
        bCandidate1: aiCreateVector(AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0),
        WCandidate2: aiCreateDeterministicMatrix(AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0.07, 53),
        bCandidate2: aiCreateVector(AI_DECISION_EMBEDDING_SIZE, 0),
        WStateToMemory: aiCreateDeterministicMatrix(AI_DECISION_MEMORY_SIZE, AI_DECISION_EMBEDDING_SIZE, 0.05, 67),
        WMemoryToMemory: aiCreateDeterministicMatrix(AI_DECISION_MEMORY_SIZE, AI_DECISION_MEMORY_SIZE, 0.04, 79),
        bMemory: aiCreateVector(AI_DECISION_MEMORY_SIZE, 0),
        WMemoryToState: aiCreateMatrix(AI_DECISION_EMBEDDING_SIZE, AI_DECISION_MEMORY_SIZE, 0),
        WValue: aiCreateVector(AI_DECISION_EMBEDDING_SIZE, 0),
        bValue: 0,
        WSurvival: aiCreateMatrix(AI_DECISION_SURVIVAL_CLASS_COUNT, AI_DECISION_EMBEDDING_SIZE, 0),
        bSurvival: aiCreateVector(AI_DECISION_SURVIVAL_CLASS_COUNT, 0),
        familyBias: aiCreateVector(AI_DECISION_FAMILY_COUNT, 0),
    }
}

function createDefaultAIPolicy(outputBias) {
    return {
        formatVersion: 2,
        strategyLearningRate: 0.09,
        decisionLearningRate: 0.018,
        strategy: createDefaultAIStrategyPolicy(outputBias),
        decision: createDefaultAIDecisionPolicy(),
    }
}

function cloneAIMatrix(matrix) {
    return matrix.map(function(row) { return row.slice(0) })
}

function cloneAIPolicy(policy) {
    return {
        formatVersion: policy.formatVersion,
        strategyLearningRate: policy.strategyLearningRate,
        decisionLearningRate: policy.decisionLearningRate,
        strategy: {
            hiddenSize1: policy.strategy.hiddenSize1,
            hiddenSize2: policy.strategy.hiddenSize2,
            W1: cloneAIMatrix(policy.strategy.W1),
            b1: policy.strategy.b1.slice(0),
            W2: cloneAIMatrix(policy.strategy.W2),
            b2: policy.strategy.b2.slice(0),
            W3: cloneAIMatrix(policy.strategy.W3),
            b3: policy.strategy.b3.slice(0),
        },
        decision: {
            stateInputSize: policy.decision.stateInputSize,
            candidateInputSize: policy.decision.candidateInputSize,
            stateHiddenSize: policy.decision.stateHiddenSize,
            candidateHiddenSize: policy.decision.candidateHiddenSize,
            embeddingSize: policy.decision.embeddingSize,
            memorySize: policy.decision.memorySize,
            survivalClassCount: policy.decision.survivalClassCount,
            trainingSamples: policy.decision.trainingSamples.slice(0),
            WState1: cloneAIMatrix(policy.decision.WState1),
            bState1: policy.decision.bState1.slice(0),
            WState2: cloneAIMatrix(policy.decision.WState2),
            bState2: policy.decision.bState2.slice(0),
            WCandidate1: cloneAIMatrix(policy.decision.WCandidate1),
            bCandidate1: policy.decision.bCandidate1.slice(0),
            WCandidate2: cloneAIMatrix(policy.decision.WCandidate2),
            bCandidate2: policy.decision.bCandidate2.slice(0),
            WStateToMemory: cloneAIMatrix(policy.decision.WStateToMemory),
            WMemoryToMemory: cloneAIMatrix(policy.decision.WMemoryToMemory),
            bMemory: policy.decision.bMemory.slice(0),
            WMemoryToState: cloneAIMatrix(policy.decision.WMemoryToState),
            WValue: policy.decision.WValue.slice(0),
            bValue: policy.decision.bValue,
            WSurvival: cloneAIMatrix(policy.decision.WSurvival),
            bSurvival: policy.decision.bSurvival.slice(0),
            familyBias: policy.decision.familyBias.slice(0),
        },
    }
}

function isFiniteAIVector(vector, expectedLength) {
    if(Array.isArray(vector) == false || vector.length != expectedLength) {
        return false
    }
    for(var i = 0; i < vector.length; i++) {
        if(Number.isFinite(vector[i]) == false || Math.abs(vector[i]) > AI_POLICY_PARAMETER_LIMIT) {
            return false
        }
    }
    return true
}

function isValidAIMatrix(matrix, expectedRows, expectedCols) {
    if(Array.isArray(matrix) == false || matrix.length != expectedRows) {
        return false
    }
    for(var row = 0; row < matrix.length; row++) {
        if(isFiniteAIVector(matrix[row], expectedCols) == false) {
            return false
        }
    }
    return true
}

function isValidAICounterVector(vector, expectedLength) {
    if(Array.isArray(vector) == false || vector.length != expectedLength) {
        return false
    }
    for(var i = 0; i < vector.length; i++) {
        if(Number.isSafeInteger(vector[i]) == false || vector[i] < 0) {
            return false
        }
    }
    return true
}

function isValidAIPolicy(policy) {
    if(!policy || policy.formatVersion != 2 || !policy.strategy || !policy.decision) {
        return false
    }
    if(Number.isFinite(policy.strategyLearningRate) == false || policy.strategyLearningRate <= 0 || policy.strategyLearningRate > 0.2 || Number.isFinite(policy.decisionLearningRate) == false || policy.decisionLearningRate <= 0 || policy.decisionLearningRate > 0.1) {
        return false
    }
    var strategy = policy.strategy
    if(strategy.hiddenSize1 != AI_POLICY_HIDDEN_SIZE_1 || strategy.hiddenSize2 != AI_POLICY_HIDDEN_SIZE_2 || isValidAIMatrix(strategy.W1, AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length) == false || isFiniteAIVector(strategy.b1, AI_POLICY_HIDDEN_SIZE_1) == false || isValidAIMatrix(strategy.W2, AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1) == false || isFiniteAIVector(strategy.b2, AI_POLICY_HIDDEN_SIZE_2) == false || isValidAIMatrix(strategy.W3, AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2) == false || isFiniteAIVector(strategy.b3, AI_STRATEGY_LIBRARY.length) == false) {
        return false
    }
    var decision = policy.decision
    if(decision.stateInputSize != AI_DECISION_STATE_INPUT_SIZE || decision.candidateInputSize != AI_DECISION_CANDIDATE_INPUT_SIZE || decision.stateHiddenSize != AI_DECISION_STATE_HIDDEN_SIZE || decision.candidateHiddenSize != AI_DECISION_CANDIDATE_HIDDEN_SIZE || decision.embeddingSize != AI_DECISION_EMBEDDING_SIZE || decision.memorySize != AI_DECISION_MEMORY_SIZE || decision.survivalClassCount != AI_DECISION_SURVIVAL_CLASS_COUNT) {
        return false
    }
    return isValidAICounterVector(decision.trainingSamples, AI_DECISION_FAMILY_COUNT) && isValidAIMatrix(decision.WState1, AI_DECISION_STATE_HIDDEN_SIZE, AI_DECISION_STATE_INPUT_SIZE) && isFiniteAIVector(decision.bState1, AI_DECISION_STATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WState2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bState2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE, AI_DECISION_CANDIDATE_INPUT_SIZE) && isFiniteAIVector(decision.bCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WCandidate2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bCandidate2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WStateToMemory, AI_DECISION_MEMORY_SIZE, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WMemoryToMemory, AI_DECISION_MEMORY_SIZE, AI_DECISION_MEMORY_SIZE) && isFiniteAIVector(decision.bMemory, AI_DECISION_MEMORY_SIZE) && isValidAIMatrix(decision.WMemoryToState, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_MEMORY_SIZE) && isFiniteAIVector(decision.WValue, AI_DECISION_EMBEDDING_SIZE) && Number.isFinite(decision.bValue) && Math.abs(decision.bValue) <= AI_POLICY_PARAMETER_LIMIT && isValidAIMatrix(decision.WSurvival, AI_DECISION_SURVIVAL_CLASS_COUNT, AI_DECISION_EMBEDDING_SIZE) && isFiniteAIVector(decision.bSurvival, AI_DECISION_SURVIVAL_CLASS_COUNT) && isFiniteAIVector(decision.familyBias, AI_DECISION_FAMILY_COUNT)
}

function getAIPolicyParameterCount(policy) {
    if(isValidAIPolicy(policy) == false) {
        return 0
    }
    var strategy = policy.strategy
    var decision = policy.decision
    return strategy.W1.length * strategy.W1[0].length + strategy.b1.length + strategy.W2.length * strategy.W2[0].length + strategy.b2.length + strategy.W3.length * strategy.W3[0].length + strategy.b3.length + decision.WState1.length * decision.WState1[0].length + decision.bState1.length + decision.WState2.length * decision.WState2[0].length + decision.bState2.length + decision.WCandidate1.length * decision.WCandidate1[0].length + decision.bCandidate1.length + decision.WCandidate2.length * decision.WCandidate2[0].length + decision.bCandidate2.length + decision.WStateToMemory.length * decision.WStateToMemory[0].length + decision.WMemoryToMemory.length * decision.WMemoryToMemory[0].length + decision.bMemory.length + decision.WMemoryToState.length * decision.WMemoryToState[0].length + decision.WValue.length + 1 + decision.WSurvival.length * decision.WSurvival[0].length + decision.bSurvival.length + decision.familyBias.length
}

function createDefaultPolicyOutputBias() {
    var outputBias = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        outputBias.push(0)
    }
    return outputBias
}

function isValidAISchema9Decision(decision) {
    return decision && decision.stateInputSize == 48 && decision.candidateInputSize == 32 && decision.stateHiddenSize == AI_DECISION_STATE_HIDDEN_SIZE && decision.candidateHiddenSize == AI_DECISION_CANDIDATE_HIDDEN_SIZE && decision.embeddingSize == AI_DECISION_EMBEDDING_SIZE && isValidAICounterVector(decision.trainingSamples, AI_DECISION_FAMILY_COUNT) && isValidAIMatrix(decision.WState1, AI_DECISION_STATE_HIDDEN_SIZE, 48) && isFiniteAIVector(decision.bState1, AI_DECISION_STATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WState2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bState2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE, 32) && isFiniteAIVector(decision.bCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WCandidate2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bCandidate2, AI_DECISION_EMBEDDING_SIZE) && isFiniteAIVector(decision.familyBias, AI_DECISION_FAMILY_COUNT)
}

function isValidAISchema9Policy(policy) {
    if(!policy || policy.formatVersion != 2 || !policy.strategy || !isValidAISchema9Decision(policy.decision)) {
        return false
    }
    var strategy = policy.strategy
    return Number.isFinite(policy.strategyLearningRate) && policy.strategyLearningRate > 0 && policy.strategyLearningRate <= 0.2 && Number.isFinite(policy.decisionLearningRate) && policy.decisionLearningRate > 0 && policy.decisionLearningRate <= 0.1 && strategy.hiddenSize1 == AI_POLICY_HIDDEN_SIZE_1 && strategy.hiddenSize2 == AI_POLICY_HIDDEN_SIZE_2 && isValidAIMatrix(strategy.W1, AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length) && isFiniteAIVector(strategy.b1, AI_POLICY_HIDDEN_SIZE_1) && isValidAIMatrix(strategy.W2, AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1) && isFiniteAIVector(strategy.b2, AI_POLICY_HIDDEN_SIZE_2) && isValidAIMatrix(strategy.W3, AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2) && isFiniteAIVector(strategy.b3, AI_STRATEGY_LIBRARY.length)
}

function isValidAIFullDecisionForInputSizes(decision, stateInputSize, candidateInputSize) {
    return decision && decision.stateInputSize == stateInputSize && decision.candidateInputSize == candidateInputSize && decision.stateHiddenSize == AI_DECISION_STATE_HIDDEN_SIZE && decision.candidateHiddenSize == AI_DECISION_CANDIDATE_HIDDEN_SIZE && decision.embeddingSize == AI_DECISION_EMBEDDING_SIZE && decision.memorySize == AI_DECISION_MEMORY_SIZE && decision.survivalClassCount == AI_DECISION_SURVIVAL_CLASS_COUNT && isValidAICounterVector(decision.trainingSamples, AI_DECISION_FAMILY_COUNT) && isValidAIMatrix(decision.WState1, AI_DECISION_STATE_HIDDEN_SIZE, stateInputSize) && isFiniteAIVector(decision.bState1, AI_DECISION_STATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WState2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bState2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE, candidateInputSize) && isFiniteAIVector(decision.bCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WCandidate2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bCandidate2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WStateToMemory, AI_DECISION_MEMORY_SIZE, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WMemoryToMemory, AI_DECISION_MEMORY_SIZE, AI_DECISION_MEMORY_SIZE) && isFiniteAIVector(decision.bMemory, AI_DECISION_MEMORY_SIZE) && isValidAIMatrix(decision.WMemoryToState, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_MEMORY_SIZE) && isFiniteAIVector(decision.WValue, AI_DECISION_EMBEDDING_SIZE) && Number.isFinite(decision.bValue) && Math.abs(decision.bValue) <= AI_POLICY_PARAMETER_LIMIT && isValidAIMatrix(decision.WSurvival, AI_DECISION_SURVIVAL_CLASS_COUNT, AI_DECISION_EMBEDDING_SIZE) && isFiniteAIVector(decision.bSurvival, AI_DECISION_SURVIVAL_CLASS_COUNT) && isFiniteAIVector(decision.familyBias, AI_DECISION_FAMILY_COUNT)
}

function isValidAISchema10Decision(decision) {
    return isValidAIFullDecisionForInputSizes(decision, 72, 40)
}

function isValidAISchema10Policy(policy) {
    if(!policy || policy.formatVersion != 2 || !policy.strategy || !isValidAISchema10Decision(policy.decision)) return false
    var strategy = policy.strategy
    return Number.isFinite(policy.strategyLearningRate) && policy.strategyLearningRate > 0 && policy.strategyLearningRate <= 0.2 && Number.isFinite(policy.decisionLearningRate) && policy.decisionLearningRate > 0 && policy.decisionLearningRate <= 0.1 && strategy.hiddenSize1 == AI_POLICY_HIDDEN_SIZE_1 && strategy.hiddenSize2 == AI_POLICY_HIDDEN_SIZE_2 && isValidAIMatrix(strategy.W1, AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length) && isFiniteAIVector(strategy.b1, AI_POLICY_HIDDEN_SIZE_1) && isValidAIMatrix(strategy.W2, AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1) && isFiniteAIVector(strategy.b2, AI_POLICY_HIDDEN_SIZE_2) && isValidAIMatrix(strategy.W3, AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2) && isFiniteAIVector(strategy.b3, AI_STRATEGY_LIBRARY.length)
}

function isValidAISchema11Decision(decision) {
    return isValidAIFullDecisionForInputSizes(decision, 72, 64)
}

function isValidAISchema11Policy(policy) {
    if(!policy || policy.formatVersion != 2 || !policy.strategy || !isValidAISchema11Decision(policy.decision)) return false
    var strategy = policy.strategy
    return Number.isFinite(policy.strategyLearningRate) && policy.strategyLearningRate > 0 && policy.strategyLearningRate <= 0.2 && Number.isFinite(policy.decisionLearningRate) && policy.decisionLearningRate > 0 && policy.decisionLearningRate <= 0.1 && strategy.hiddenSize1 == AI_POLICY_HIDDEN_SIZE_1 && strategy.hiddenSize2 == AI_POLICY_HIDDEN_SIZE_2 && isValidAIMatrix(strategy.W1, AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length) && isFiniteAIVector(strategy.b1, AI_POLICY_HIDDEN_SIZE_1) && isValidAIMatrix(strategy.W2, AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1) && isFiniteAIVector(strategy.b2, AI_POLICY_HIDDEN_SIZE_2) && isValidAIMatrix(strategy.W3, AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2) && isFiniteAIVector(strategy.b3, AI_STRATEGY_LIBRARY.length)
}

function isValidAISchema12Decision(decision) {
    return isValidAIFullDecisionForInputSizes(decision, 80, 80)
}

function isValidAISchema12Policy(policy) {
    if(!policy || policy.formatVersion != 2 || !policy.strategy || !isValidAISchema12Decision(policy.decision)) return false
    var strategy = policy.strategy
    return Number.isFinite(policy.strategyLearningRate) && policy.strategyLearningRate > 0 && policy.strategyLearningRate <= 0.2 && Number.isFinite(policy.decisionLearningRate) && policy.decisionLearningRate > 0 && policy.decisionLearningRate <= 0.1 && strategy.hiddenSize1 == AI_POLICY_HIDDEN_SIZE_1 && strategy.hiddenSize2 == AI_POLICY_HIDDEN_SIZE_2 && isValidAIMatrix(strategy.W1, AI_POLICY_HIDDEN_SIZE_1, AI_FEATURE_KEYS.length) && isFiniteAIVector(strategy.b1, AI_POLICY_HIDDEN_SIZE_1) && isValidAIMatrix(strategy.W2, AI_POLICY_HIDDEN_SIZE_2, AI_POLICY_HIDDEN_SIZE_1) && isFiniteAIVector(strategy.b2, AI_POLICY_HIDDEN_SIZE_2) && isValidAIMatrix(strategy.W3, AI_STRATEGY_LIBRARY.length, AI_POLICY_HIDDEN_SIZE_2) && isFiniteAIVector(strategy.b3, AI_STRATEGY_LIBRARY.length)
}

function migrateAISchema11Decision(oldDecision) {
    var decision = createDefaultAIDecisionPolicy()
    decision.trainingSamples = oldDecision.trainingSamples.slice(0)
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        decision.WState1[stateRow] = oldDecision.WState1[stateRow].concat(aiCreateVector(AI_DECISION_STATE_INPUT_SIZE - 72, 0))
    }
    decision.bState1 = oldDecision.bState1.slice(0)
    decision.WState2 = cloneAIMatrix(oldDecision.WState2)
    decision.bState2 = oldDecision.bState2.slice(0)
    for(var candidateRow = 0; candidateRow < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateRow++) {
        decision.WCandidate1[candidateRow] = oldDecision.WCandidate1[candidateRow].concat(aiCreateVector(AI_DECISION_CANDIDATE_INPUT_SIZE - 64, 0))
    }
    decision.bCandidate1 = oldDecision.bCandidate1.slice(0)
    decision.WCandidate2 = cloneAIMatrix(oldDecision.WCandidate2)
    decision.bCandidate2 = oldDecision.bCandidate2.slice(0)
    decision.WStateToMemory = cloneAIMatrix(oldDecision.WStateToMemory)
    decision.WMemoryToMemory = cloneAIMatrix(oldDecision.WMemoryToMemory)
    decision.bMemory = oldDecision.bMemory.slice(0)
    decision.WMemoryToState = cloneAIMatrix(oldDecision.WMemoryToState)
    decision.WValue = oldDecision.WValue.slice(0)
    decision.bValue = oldDecision.bValue
    decision.WSurvival = cloneAIMatrix(oldDecision.WSurvival)
    decision.bSurvival = oldDecision.bSurvival.slice(0)
    decision.familyBias = oldDecision.familyBias.slice(0)
    return decision
}

function migrateAISchema12Decision(oldDecision) {
    var decision = createDefaultAIDecisionPolicy()
    decision.trainingSamples = oldDecision.trainingSamples.slice(0)
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        decision.WState1[stateRow] = oldDecision.WState1[stateRow].concat(aiCreateVector(AI_DECISION_STATE_INPUT_SIZE - 80, 0))
    }
    decision.bState1 = oldDecision.bState1.slice(0)
    decision.WState2 = cloneAIMatrix(oldDecision.WState2)
    decision.bState2 = oldDecision.bState2.slice(0)
    for(var candidateRow = 0; candidateRow < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateRow++) {
        decision.WCandidate1[candidateRow] = oldDecision.WCandidate1[candidateRow].concat(aiCreateVector(AI_DECISION_CANDIDATE_INPUT_SIZE - 80, 0))
    }
    decision.bCandidate1 = oldDecision.bCandidate1.slice(0)
    decision.WCandidate2 = cloneAIMatrix(oldDecision.WCandidate2)
    decision.bCandidate2 = oldDecision.bCandidate2.slice(0)
    decision.WStateToMemory = cloneAIMatrix(oldDecision.WStateToMemory)
    decision.WMemoryToMemory = cloneAIMatrix(oldDecision.WMemoryToMemory)
    decision.bMemory = oldDecision.bMemory.slice(0)
    decision.WMemoryToState = cloneAIMatrix(oldDecision.WMemoryToState)
    decision.WValue = oldDecision.WValue.slice(0)
    decision.bValue = oldDecision.bValue
    decision.WSurvival = cloneAIMatrix(oldDecision.WSurvival)
    decision.bSurvival = oldDecision.bSurvival.slice(0)
    decision.familyBias = oldDecision.familyBias.slice(0)
    return decision
}

function migrateAISchema10Decision(oldDecision) {
    var decision = createDefaultAIDecisionPolicy()
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        decision.WState1[stateRow] = oldDecision.WState1[stateRow].concat(aiCreateVector(AI_DECISION_STATE_INPUT_SIZE - 72, 0))
    }
    decision.bState1 = oldDecision.bState1.slice(0)
    decision.WState2 = cloneAIMatrix(oldDecision.WState2)
    decision.bState2 = oldDecision.bState2.slice(0)
    decision.WStateToMemory = cloneAIMatrix(oldDecision.WStateToMemory)
    decision.WMemoryToMemory = cloneAIMatrix(oldDecision.WMemoryToMemory)
    decision.bMemory = oldDecision.bMemory.slice(0)
    decision.WMemoryToState = cloneAIMatrix(oldDecision.WMemoryToState)
    decision.WValue = oldDecision.WValue.slice(0)
    decision.bValue = oldDecision.bValue
    decision.WSurvival = cloneAIMatrix(oldDecision.WSurvival)
    decision.bSurvival = oldDecision.bSurvival.slice(0)
    return decision
}

function migrateAISchema9Decision(oldDecision) {
    var decision = createDefaultAIDecisionPolicy()
    decision.bState1 = oldDecision.bState1.slice(0)
    decision.WState2 = cloneAIMatrix(oldDecision.WState2)
    decision.bState2 = oldDecision.bState2.slice(0)
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        decision.WState1[stateRow] = oldDecision.WState1[stateRow].concat(aiCreateVector(AI_DECISION_STATE_INPUT_SIZE - 48, 0))
    }
    return decision
}

function migrateAIPolicy(candidatePolicy) {
    if(isValidAIPolicy(candidatePolicy)) {
        return cloneAIPolicy(candidatePolicy)
    }
    var outputBias = createDefaultPolicyOutputBias()
    if(candidatePolicy && candidatePolicy.strategy && Array.isArray(candidatePolicy.strategy.b3) && candidatePolicy.strategy.b3.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.strategy.b3.slice(0)
    } else if(candidatePolicy && Array.isArray(candidatePolicy.b3) && candidatePolicy.b3.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.b3.slice(0)
    } else if(candidatePolicy && Array.isArray(candidatePolicy.b2) && candidatePolicy.b2.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.b2.slice(0)
    }

    var migrated = createDefaultAIPolicy(outputBias)
    if(isValidAISchema12Policy(candidatePolicy)) {
        migrated.strategyLearningRate = candidatePolicy.strategyLearningRate
        migrated.decisionLearningRate = candidatePolicy.decisionLearningRate
        migrated.strategy = JSON.parse(JSON.stringify(candidatePolicy.strategy))
        migrated.decision = migrateAISchema12Decision(candidatePolicy.decision)
        return migrated
    }
    if(isValidAISchema11Policy(candidatePolicy)) {
        migrated.strategyLearningRate = candidatePolicy.strategyLearningRate
        migrated.decisionLearningRate = candidatePolicy.decisionLearningRate
        migrated.strategy = JSON.parse(JSON.stringify(candidatePolicy.strategy))
        migrated.decision = migrateAISchema11Decision(candidatePolicy.decision)
        return migrated
    }
    if(isValidAISchema10Policy(candidatePolicy)) {
        migrated.strategyLearningRate = candidatePolicy.strategyLearningRate
        migrated.decisionLearningRate = candidatePolicy.decisionLearningRate
        migrated.strategy = JSON.parse(JSON.stringify(candidatePolicy.strategy))
        migrated.decision = migrateAISchema10Decision(candidatePolicy.decision)
        return migrated
    }
    if(isValidAISchema9Policy(candidatePolicy)) {
        migrated.strategyLearningRate = candidatePolicy.strategyLearningRate
        migrated.decisionLearningRate = candidatePolicy.decisionLearningRate
        migrated.strategy = {
            hiddenSize1: candidatePolicy.strategy.hiddenSize1,
            hiddenSize2: candidatePolicy.strategy.hiddenSize2,
            W1: cloneAIMatrix(candidatePolicy.strategy.W1),
            b1: candidatePolicy.strategy.b1.slice(0),
            W2: cloneAIMatrix(candidatePolicy.strategy.W2),
            b2: candidatePolicy.strategy.b2.slice(0),
            W3: cloneAIMatrix(candidatePolicy.strategy.W3),
            b3: candidatePolicy.strategy.b3.slice(0),
        }
        migrated.decision = migrateAISchema9Decision(candidatePolicy.decision)
        return migrated
    }
    var oldStrategy = candidatePolicy && candidatePolicy.strategy ? candidatePolicy.strategy : candidatePolicy
    if(oldStrategy && isValidAIMatrix(oldStrategy.W1, 12, AI_FEATURE_KEYS.length) && isFiniteAIVector(oldStrategy.b1, 12) && isValidAIMatrix(oldStrategy.W2, 8, 12) && isFiniteAIVector(oldStrategy.b2, 8) && isValidAIMatrix(oldStrategy.W3, AI_STRATEGY_LIBRARY.length, 8) && isFiniteAIVector(oldStrategy.b3, AI_STRATEGY_LIBRARY.length)) {
        var strategy = migrated.strategy
        for(var newFirstIndex = 12; newFirstIndex < AI_POLICY_HIDDEN_SIZE_1; newFirstIndex++) {
            for(var firstInputIndex = 0; firstInputIndex < AI_FEATURE_KEYS.length; firstInputIndex++) {
                strategy.W1[newFirstIndex][firstInputIndex] = aiDeterministicWeight(newFirstIndex * AI_FEATURE_KEYS.length + firstInputIndex, 0.08, 71)
            }
        }
        for(var newSecondIndex = 8; newSecondIndex < AI_POLICY_HIDDEN_SIZE_2; newSecondIndex++) {
            for(var secondInputIndex = 0; secondInputIndex < AI_POLICY_HIDDEN_SIZE_1; secondInputIndex++) {
                strategy.W2[newSecondIndex][secondInputIndex] = aiDeterministicWeight(newSecondIndex * AI_POLICY_HIDDEN_SIZE_1 + secondInputIndex, 0.07, 83)
            }
        }
        for(var hidden1Index = 0; hidden1Index < 12; hidden1Index++) {
            strategy.W1[hidden1Index] = oldStrategy.W1[hidden1Index].slice(0)
            strategy.b1[hidden1Index] = oldStrategy.b1[hidden1Index]
        }
        for(var hidden2Index = 0; hidden2Index < 8; hidden2Index++) {
            for(var oldHidden1Index = 0; oldHidden1Index < 12; oldHidden1Index++) {
                strategy.W2[hidden2Index][oldHidden1Index] = oldStrategy.W2[hidden2Index][oldHidden1Index]
            }
            for(var extraHidden1Index = 12; extraHidden1Index < AI_POLICY_HIDDEN_SIZE_1; extraHidden1Index++) {
                strategy.W2[hidden2Index][extraHidden1Index] = 0
            }
            strategy.b2[hidden2Index] = oldStrategy.b2[hidden2Index]
        }
        for(var outputIndex = 0; outputIndex < AI_STRATEGY_LIBRARY.length; outputIndex++) {
            for(var oldHidden2Index = 0; oldHidden2Index < 8; oldHidden2Index++) {
                strategy.W3[outputIndex][oldHidden2Index] = oldStrategy.W3[outputIndex][oldHidden2Index]
            }
            for(var extraHidden2Index = 8; extraHidden2Index < AI_POLICY_HIDDEN_SIZE_2; extraHidden2Index++) {
                strategy.W3[outputIndex][extraHidden2Index] = 0
            }
            strategy.b3[outputIndex] = oldStrategy.b3[outputIndex]
        }
        migrated.strategyLearningRate = Number(candidatePolicy.strategyLearningRate || candidatePolicy.learningRate) || migrated.strategyLearningRate
    }
    return migrated
}

function migrateAIModelPolicyBundle(candidate) {
    var candidatePolicy = migrateAIPolicy(candidate.policy)
    var championPolicy = migrateAIPolicy(candidate.championPolicy || candidate.policy)
    var history = Array.isArray(candidate.populationPolicies) ? candidate.populationPolicies.slice(-2) : []
    var populationPolicies = history.map(migrateAIPolicy)
    if(!isValidAIPolicy(candidatePolicy) || !isValidAIPolicy(championPolicy) || populationPolicies.some(function(policy) { return isValidAIPolicy(policy) == false })) {
        return null
    }
    return {
        policy: candidatePolicy,
        championPolicy: championPolicy,
        populationPolicies: populationPolicies,
    }
}

function createDefaultAILearning() {
    var outputBias = createDefaultPolicyOutputBias()
    var strategyStats = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        strategyStats.push({ games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0 })
    }

    var candidatePolicy = createDefaultAIPolicy(outputBias)
    return {
        version: AI_LEARNING_SCHEMA_VERSION,
        modelFamily: AI_MODEL_FAMILY,
        totalGames: 0,
        totalSyntheticEpisodes: 0,
        totalPolicySamples: 0,
        totalLoadoutSamples: 0,
        totalHumanDemonstrations: 0,
        playerProfile: {
            games: 0,
            features: aiCreateVector(AI_FEATURE_KEYS.length, 0),
        },
        strategyStats: strategyStats,
        loadoutStats: {},
        placementStats: {},
        loadoutPlacementStats: {},
        timingStats: {},
        loadoutStrategyStats: {},
        crosspathStats: {},
        loadoutCounterStats: {},
        tacticalStats: {},
        tacticalFamilyStats: {},
        totalTacticalSamples: 0,
        totalDecisionSamples: 0,
        candidateGeneration: 0,
        championGeneration: 0,
        policy: candidatePolicy,
        championPolicy: cloneAIPolicy(candidatePolicy),
        populationPolicies: [],
    }
}

function isValidAILearningData(candidate) {
    return candidate && candidate.policy && candidate.playerProfile && Array.isArray(candidate.strategyStats)
}

function normalizeAILearningData(candidate) {
    if(isValidAILearningData(candidate) == false) {
        return createDefaultAILearning()
    }

    try {
        candidate = JSON.parse(JSON.stringify(candidate))
    } catch(error) {
        return createDefaultAILearning()
    }
    var sourceVersion = Number(candidate.version) || 0
    var losslessDecisionMigration = sourceVersion == 11 && candidate.modelFamily == "semantic-recurrent-actor-critic-v3"
    var resetDecisionTraining = (candidate.version != AI_LEARNING_SCHEMA_VERSION || candidate.modelFamily != AI_MODEL_FAMILY) && !losslessDecisionMigration

    if(!candidate.playerProfile || typeof candidate.playerProfile != "object") {
        candidate.playerProfile = {
            games: 0,
            features: aiCreateVector(AI_FEATURE_KEYS.length, 0),
        }
    }
    candidate.playerProfile.games = Math.max(0, Math.floor(Number(candidate.playerProfile.games) || 0))
    if(!candidate.playerProfile.features || Array.isArray(candidate.playerProfile.features) == false) {
        candidate.playerProfile.features = aiCreateVector(AI_FEATURE_KEYS.length, 0)
    }
    while(candidate.playerProfile.features.length < AI_FEATURE_KEYS.length) {
        candidate.playerProfile.features.push(0)
    }
    if(candidate.playerProfile.features.length > AI_FEATURE_KEYS.length) {
        candidate.playerProfile.features = candidate.playerProfile.features.slice(0, AI_FEATURE_KEYS.length)
    }
    for(var featureIndex = 0; featureIndex < candidate.playerProfile.features.length; featureIndex++) {
        candidate.playerProfile.features[featureIndex] = clamp(Number(candidate.playerProfile.features[featureIndex]) || 0, 0, 1)
    }
    if(!candidate.placementStats || typeof candidate.placementStats != "object") {
        candidate.placementStats = {}
    }
    if(!candidate.loadoutPlacementStats || typeof candidate.loadoutPlacementStats != "object") {
        candidate.loadoutPlacementStats = {}
    }
    if(sourceVersion != AI_LEARNING_SCHEMA_VERSION) {
        candidate.placementStats = {}
        candidate.loadoutPlacementStats = {}
    }
    if(!candidate.timingStats || typeof candidate.timingStats != "object") {
        candidate.timingStats = {}
    }
    if(!candidate.loadoutStrategyStats || typeof candidate.loadoutStrategyStats != "object") {
        candidate.loadoutStrategyStats = {}
    }
    if(!candidate.crosspathStats || typeof candidate.crosspathStats != "object") {
        candidate.crosspathStats = {}
    }
    if(!candidate.loadoutCounterStats || typeof candidate.loadoutCounterStats != "object") {
        candidate.loadoutCounterStats = {}
    }
    if(!candidate.loadoutStats || typeof candidate.loadoutStats != "object") {
        candidate.loadoutStats = {}
    }
    if(!candidate.tacticalStats || typeof candidate.tacticalStats != "object" || Array.isArray(candidate.tacticalStats)) {
        candidate.tacticalStats = {}
    }
    if(!candidate.tacticalFamilyStats || typeof candidate.tacticalFamilyStats != "object" || Array.isArray(candidate.tacticalFamilyStats)) {
        candidate.tacticalFamilyStats = {}
    }
    if(sourceVersion < AI_LEARNING_SCHEMA_VERSION) {
        for(var tacticalFamilyKey in candidate.tacticalFamilyStats) {
            if(tacticalFamilyKey.indexOf("human|") == 0) delete candidate.tacticalFamilyStats[tacticalFamilyKey]
        }
    }
    while(candidate.strategyStats.length < AI_STRATEGY_LIBRARY.length) {
        candidate.strategyStats.push({ games: 0, wins: 0, losses: 0, ties: 0, syntheticEpisodes: 0, lastReward: 0 })
    }
    if(candidate.strategyStats.length > AI_STRATEGY_LIBRARY.length) {
        candidate.strategyStats = candidate.strategyStats.slice(0, AI_STRATEGY_LIBRARY.length)
    }
    var preservedTotalGames = Math.max(0, Math.floor(Number(candidate.totalGames) || 0))
    var preservedTotalSyntheticEpisodes = Math.max(0, Math.floor(Number(candidate.totalSyntheticEpisodes) || 0))
    var preservedTotalPolicySamples = Math.max(0, Math.floor(Number(candidate.totalPolicySamples) || 0))
    var preservedTotalLoadoutSamples = Math.max(0, Math.floor(Number(candidate.totalLoadoutSamples) || 0))
    var migratedPolicies = migrateAIModelPolicyBundle(candidate)
    if(!migratedPolicies) {
        return createDefaultAILearning()
    }
    candidate.policy = migratedPolicies.policy
    candidate.championPolicy = migratedPolicies.championPolicy
    candidate.populationPolicies = migratedPolicies.populationPolicies

    var totalGames = 0
    var totalSyntheticEpisodes = 0
    var totalLoadoutSamples = 0
    for(var i = 0; i < candidate.strategyStats.length; i++) {
        var stats = candidate.strategyStats[i] || {}
        var wins = Math.max(0, Number(stats.wins) || 0)
        var losses = Math.max(0, Number(stats.losses) || 0)
        var ties = Math.max(0, Number(stats.ties) || 0)
        var recordedGames = Math.max(0, Number(stats.games) || 0)
        var actualGames = Math.max(wins + losses + ties, stats.syntheticEpisodes == null ? wins + losses + ties : recordedGames)
        var syntheticEpisodes = stats.syntheticEpisodes == null ? Math.max(0, recordedGames - wins - losses - ties) : Math.max(0, Number(stats.syntheticEpisodes) || 0)
        candidate.strategyStats[i] = {
            games: actualGames,
            wins: wins,
            losses: losses,
            ties: ties,
            syntheticEpisodes: syntheticEpisodes,
            lastReward: clamp(Number(stats.lastReward) || 0, -1, 1),
        }
        totalGames += actualGames
        totalSyntheticEpisodes += syntheticEpisodes
    }

    for(var loadoutKey in candidate.loadoutStats) {
        var loadoutRecord = candidate.loadoutStats[loadoutKey]
        if(!loadoutRecord || typeof loadoutRecord != "object") {
            candidate.loadoutStats[loadoutKey] = createDefaultAILoadoutStatsRecord()
            continue
        }
        candidate.loadoutStats[loadoutKey] = {
            games: Math.max(0, Number(loadoutRecord.games) || 0),
            wins: Math.max(0, Number(loadoutRecord.wins) || 0),
            losses: Math.max(0, Number(loadoutRecord.losses) || 0),
            ties: Math.max(0, Number(loadoutRecord.ties) || 0),
            lastReward: clamp(Number(loadoutRecord.lastReward) || 0, -1, 1),
        }
        totalLoadoutSamples += candidate.loadoutStats[loadoutKey].games
    }

    candidate.totalGames = Math.max(preservedTotalGames, totalGames)
    candidate.totalSyntheticEpisodes = Math.max(preservedTotalSyntheticEpisodes, totalSyntheticEpisodes)
    candidate.totalPolicySamples = Math.max(preservedTotalPolicySamples, candidate.totalGames + candidate.totalSyntheticEpisodes)
    candidate.totalLoadoutSamples = Math.max(preservedTotalLoadoutSamples, totalLoadoutSamples)
    candidate.totalHumanDemonstrations = Math.max(0, Math.floor(Number(candidate.totalHumanDemonstrations) || 0))
    candidate.totalTacticalSamples = Math.max(0, Math.floor(Number(candidate.totalTacticalSamples) || 0))
    candidate.totalDecisionSamples = resetDecisionTraining ? 0 : Math.max(0, Math.floor(Number(candidate.totalDecisionSamples) || 0))
    candidate.candidateGeneration = Math.max(0, Math.floor(Number(candidate.candidateGeneration) || 0))
    candidate.championGeneration = Math.max(0, Math.floor(Number(candidate.championGeneration) || 0))
    candidate.modelFamily = AI_MODEL_FAMILY
    candidate.version = AI_LEARNING_SCHEMA_VERSION
    return candidate
}

function getAILearningProgressTotal(candidate) {
    if(!candidate) {
        return 0
    }
    return Math.max(0, Number(candidate.totalPolicySamples) || Number(candidate.totalGames) || 0)
}

function updateAIPersistenceBackendLabel() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiPersistenceState.backend = "session only"
    } else if(aiPersistenceState.contributionEnabled) {
        aiPersistenceState.backend = "global community learning"
    } else if(aiPersistenceState.writeEnabled == false || getAITrainerKey() == "") {
        aiPersistenceState.backend = "shared model read-only"
    } else {
        aiPersistenceState.backend = "authenticated shared trainer"
    }
}

function getAITrainerKey() {
    try {
        return typeof sessionStorage != "undefined" ? sessionStorage.getItem("aiTrainerKey") || "" : ""
    } catch(error) {
        return ""
    }
}

function shouldRequireAISaveFolder() {
    return false
}

function applyAILearningEnvelope(parsed, forceModelInstall) {
    if(!parsed || parsed.ok !== true || Number.isFinite(parsed.revision) == false || !parsed.model) {
        throw new Error("Backend returned an invalid learning envelope")
    }
    var normalized = normalizeAILearningData(parsed.model)
    if(isValidAILearningData(normalized) == false) {
        throw new Error("Backend returned an invalid AI model")
    }

    var incomingRevision = Math.max(0, Math.floor(parsed.revision))
    var incomingEpoch = Math.max(1, Math.floor(Number(parsed.contributionEpoch) || 1))
    if(incomingEpoch < aiPersistenceState.contributionEpoch || incomingEpoch == aiPersistenceState.contributionEpoch && incomingRevision < aiPersistenceState.revision) {
        return false
    }
    if(forceModelInstall || !aiLearning || incomingEpoch != aiPersistenceState.contributionEpoch || incomingRevision >= aiPersistenceState.revision) {
        var installedAsHostedSnapshot = typeof installAITrainingHostedLearning == "function" && installAITrainingHostedLearning(normalized)
        if(installedAsHostedSnapshot == false) {
            aiLearning = normalized
        }
    }
    aiPersistenceState.revision = incomingRevision
    aiPersistenceState.modelDigest = parsed.modelDigest || ""
    aiPersistenceState.updatedAt = typeof parsed.updatedAt == "string" ? parsed.updatedAt : ""
    aiPersistenceState.writeEnabled = parsed.writeEnabled === true
    aiPersistenceState.contributionEnabled = parsed.contributionEnabled === true
    aiPersistenceState.contributionToken = typeof parsed.contributionToken == "string" ? parsed.contributionToken : ""
    aiPersistenceState.contributionEpoch = incomingEpoch
    discardStaleAIPublicContributions()
    aiPersistenceState.lastLoadedAt = realNow()
    aiPersistenceState.lastError = ""
    updateAIPersistenceBackendLabel()
    return true
}

function waitForAILearningRefreshIdle() {
    if(!aiLearningRefreshPromise) {
        return Promise.resolve(aiLearningLastRefreshSucceeded)
    }
    return aiLearningRefreshPromise.then(waitForAILearningRefreshIdle)
}

function refreshAILearningFromBackend(forceModelInstall) {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiPersistenceState.restoreComplete = true
        return Promise.resolve(false)
    }
    if(aiLearningRefreshPromise) {
        if(forceModelInstall) {
            aiLearningRefreshForceQueued = true
        }
        return waitForAILearningRefreshIdle()
    }

    aiPersistenceState.restoreRequested = true
    aiPersistenceState.loadInFlight = true
    aiLearningRefreshPromise = fetch(AI_LEARNING_ENDPOINT + "&t=" + realNow(), { cache: "no-store" }).then(function(response) {
        if(response.ok == false) {
            throw new Error("Backend load failed: " + response.status)
        }
        return response.json()
    }).then(function(parsed) {
        aiLearningLastRefreshSucceeded = applyAILearningEnvelope(parsed, forceModelInstall === true)
        return aiLearningLastRefreshSucceeded
    }).catch(function(error) {
        aiLearningLastRefreshSucceeded = false
        aiPersistenceState.lastError = String(error)
        aiPersistenceState.backend = "php backend shared unavailable"
        if(getAIPublicContributionQueue().length > 0) {
            aiPersistenceState.contributionRetryAt = Math.max(aiPersistenceState.contributionRetryAt, realNow() + 3000)
        }
        return false
    }).finally(function() {
        aiPersistenceState.loadInFlight = false
        aiPersistenceState.restoreComplete = true
        aiLearningRefreshPromise = null
        if(aiLearningRefreshForceQueued) {
            aiLearningRefreshForceQueued = false
            refreshAILearningFromBackend(true)
        } else {
            flushAIPublicContributionQueue()
        }
    })
    return waitForAILearningRefreshIdle()
}

function requestAILearningFromBackend() {
    if(aiPersistenceState.restoreRequested || AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiPersistenceState.restoreComplete = true
        return waitForAILearningRefreshIdle()
    }
    return refreshAILearningFromBackend(false)
}

function ensureAILearningLoaded() {
    if(aiLearning) {
        return
    }

    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiLearning = normalizeAILearningData(createDefaultAILearning())
        aiPersistenceState.backend = "session only"
        aiPersistenceState.lastError = ""
        aiPersistenceState.restoreComplete = true
        return
    }

    aiLearning = normalizeAILearningData(createDefaultAILearning())
    aiPersistenceState.backend = "php backend shared"
    requestAILearningFromBackend()
}

function pruneAILearningStore(store, maxEntries) {
    var keys = Object.keys(store || {})
    if(keys.length <= maxEntries) {
        return
    }
    keys.sort(function(a, b) {
        var aSamples = store[a] && Number(store[a].samples) || 0
        var bSamples = store[b] && Number(store[b].samples) || 0
        if(aSamples != bSamples) {
            return bSamples - aSamples
        }
        return a < b ? -1 : a > b ? 1 : 0
    })
    for(var i = maxEntries; i < keys.length; i++) {
        delete store[keys[i]]
    }
}

function pruneAILearningForSave() {
    pruneAILearningStore(aiLearning.placementStats, 1800)
    pruneAILearningStore(aiLearning.loadoutPlacementStats, 1800)
    pruneAILearningStore(aiLearning.timingStats, 1800)
    pruneAILearningStore(aiLearning.loadoutStrategyStats, 1800)
    pruneAILearningStore(aiLearning.crosspathStats, 1400)
    pruneAILearningStore(aiLearning.loadoutCounterStats, 2400)
    pruneAILearningStore(aiLearning.tacticalStats, 5000)
    pruneAILearningStore(aiLearning.tacticalFamilyStats, 1000)
    aiLearning.populationPolicies = aiLearning.populationPolicies.slice(-2)
}

function getAIPublicContributionQueue() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || typeof localStorage == "undefined") {
        return []
    }
    try {
        localStorage.removeItem("aiPendingContributionsV1")
        var parsed = JSON.parse(localStorage.getItem(AI_CONTRIBUTION_STORAGE_KEY) || "[]")
        return Array.isArray(parsed) ? parsed.slice(-AI_MAX_PENDING_CONTRIBUTIONS) : []
    } catch(error) {
        return []
    }
}

function setAIPublicContributionQueue(queue) {
    var boundedQueue = Array.isArray(queue) ? queue.slice(-AI_MAX_PENDING_CONTRIBUTIONS) : []
    aiPersistenceState.pendingContributions = boundedQueue.length
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || typeof localStorage == "undefined") {
        return
    }
    try {
        if(boundedQueue.length == 0) {
            localStorage.removeItem(AI_CONTRIBUTION_STORAGE_KEY)
        } else {
            localStorage.setItem(AI_CONTRIBUTION_STORAGE_KEY, JSON.stringify(boundedQueue))
        }
    } catch(error) {
        aiPersistenceState.lastError = "Unable to store the pending global AI contribution."
    }
}

function getAIPublicContributionEpoch(contribution) {
    return Math.max(1, Math.floor(Number(contribution && contribution.contributionEpoch) || 1))
}

function markAIPublicContributionStatus(contributionId, status) {
    if(!contributionId) {
        return
    }
    if(aiMatchTelemetry && aiMatchTelemetry.contributionId == contributionId) {
        aiMatchTelemetry.contributionStatus = status
    }
    if(typeof aiContextsBySide != "undefined" && aiContextsBySide) {
        for(var contextSide in aiContextsBySide) {
            var contextTelemetry = aiContextsBySide[contextSide] && aiContextsBySide[contextSide].aiMatchTelemetry
            if(contextTelemetry && contextTelemetry.contributionId == contributionId) {
                contextTelemetry.contributionStatus = status
            }
        }
    }
    if(localMatchCollectionState && Array.isArray(localMatchCollectionState.contributionIds) && localMatchCollectionState.contributionIds.indexOf(contributionId) >= 0) {
        if(status == "accepted") {
            localMatchCollectionState.acceptedContributionIds[contributionId] = true
            var allAccepted = localMatchCollectionState.contributionIds.every(function(id) {
                return localMatchCollectionState.acceptedContributionIds[id] === true
            })
            localMatchCollectionState.contributionStatus = allAccepted ? "accepted" : "queued"
        } else {
            localMatchCollectionState.contributionStatus = status
        }
    }
}

function discardStaleAIPublicContributions() {
    var queue = getAIPublicContributionQueue()
    var currentEpoch = Math.max(1, Math.floor(Number(aiPersistenceState.contributionEpoch) || 1))
    var currentQueue = queue.filter(function(contribution) {
        var keep = getAIPublicContributionEpoch(contribution) == currentEpoch
        if(!keep) {
            markAIPublicContributionStatus(contribution.contributionId, "discarded")
        }
        return keep
    })
    if(currentQueue.length != queue.length) {
        setAIPublicContributionQueue(currentQueue)
    }
    return queue.length - currentQueue.length
}

function createAIContributionId() {
    var bytes = new Uint8Array(16)
    if(typeof crypto != "undefined" && crypto && typeof crypto.getRandomValues == "function") {
        crypto.getRandomValues(bytes)
    } else {
        for(var i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256)
        }
    }
    var result = ""
    for(var byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
        result += bytes[byteIndex].toString(16).padStart(2, "0")
    }
    return result
}

function getAIUTF8ByteLength(text) {
    text = String(text)
    if(typeof TextEncoder == "function") return new TextEncoder().encode(text).byteLength
    return unescape(encodeURIComponent(text)).length
}

function requestAIPublicContributionToken() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.loadInFlight) {
        return waitForAILearningRefreshIdle()
    }
    return refreshAILearningFromBackend(true)
}

function queueAIPublicContribution(contribution) {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.contributionEnabled == false || !contribution) {
        return false
    }
    var queue = getAIPublicContributionQueue()
    queue.push(contribution)
    setAIPublicContributionQueue(queue)
    markAIPublicContributionStatus(contribution.contributionId, "queued")
    flushAIPublicContributionQueue()
    return true
}

function flushAIPublicContributionQueue() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.contributionEnabled == false || aiPersistenceState.restoreComplete == false || aiPersistenceState.loadInFlight || aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight) {
        return false
    }
    var queue = getAIPublicContributionQueue()
    setAIPublicContributionQueue(queue)
    if(queue.length == 0) {
        return false
    }
    var now = realNow()
    if(now < aiPersistenceState.contributionRetryAt) {
        setTimeout(flushAIPublicContributionQueue, Math.max(50, aiPersistenceState.contributionRetryAt - now))
        return false
    }
    if(aiPersistenceState.contributionToken == "") {
        requestAIPublicContributionToken()
        return false
    }

    aiPersistenceState.contributionInFlight = true
    var pending = queue[0]
    fetch(AI_LEARNING_ENDPOINT + "&action=contribute", {
        method: "POST",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            "X-AI-Contribution-Token": aiPersistenceState.contributionToken,
        },
        body: JSON.stringify(pending),
    }).then(function(response) {
        return response.json().catch(function() { return null }).then(function(payload) {
            if(response.ok == false) {
                var error = new Error("Global AI contribution failed: " + (payload && payload.error ? payload.error.code : "http_" + response.status))
                error.status = response.status
                error.payload = payload
                throw error
            }
            return payload
        })
    }).then(function(parsed) {
        if(!parsed || parsed.ok !== true || Number.isFinite(parsed.revision) == false) {
            throw new Error("Global AI contribution returned an invalid response")
        }
        var latestQueue = getAIPublicContributionQueue()
        if(latestQueue.length > 0 && latestQueue[0].contributionId == pending.contributionId) {
            latestQueue.shift()
        } else {
            latestQueue = latestQueue.filter(function(item) { return item.contributionId != pending.contributionId })
        }
        setAIPublicContributionQueue(latestQueue)
        markAIPublicContributionStatus(pending.contributionId, "accepted")
        var contributionRevision = Math.max(0, Math.floor(parsed.revision))
        var contributionEpoch = Math.max(1, Math.floor(Number(parsed.contributionEpoch) || 1))
        var contributionMetadataCurrent = contributionEpoch >= aiPersistenceState.contributionEpoch && contributionRevision >= aiPersistenceState.revision
        aiPersistenceState.revision = Math.max(aiPersistenceState.revision, contributionRevision)
        aiPersistenceState.contributionEpoch = Math.max(aiPersistenceState.contributionEpoch, contributionEpoch)
        if(contributionMetadataCurrent) {
            aiPersistenceState.modelDigest = parsed.modelDigest || aiPersistenceState.modelDigest
        }
        aiPersistenceState.lastContributionAt = realNow()
        aiPersistenceState.lastSavedAt = aiPersistenceState.lastContributionAt
        aiPersistenceState.contributionRetryAt = 0
        aiPersistenceState.lastError = ""
        updateAIPersistenceBackendLabel()
        if(latestQueue.length == 0) {
            return refreshAILearningFromBackend(true)
        }
    }).catch(function(error) {
        var payload = error && error.payload
        var code = payload && payload.error ? payload.error.code : ""
        if(error && (error.status == 400 || error.status == 422)) {
            var invalidQueue = getAIPublicContributionQueue().filter(function(item) { return item.contributionId != pending.contributionId })
            setAIPublicContributionQueue(invalidQueue)
            markAIPublicContributionStatus(pending.contributionId, "discarded")
            aiPersistenceState.contributionRetryAt = 0
            aiPersistenceState.lastError = "Discarded a permanently invalid global AI contribution."
            return
        }
        if(code == "contribution_epoch_mismatch" && payload && Number.isFinite(payload.currentContributionEpoch)) {
            aiPersistenceState.contributionToken = ""
            aiPersistenceState.lastError = "Refreshing the global AI after a knowledge reset."
            return refreshAILearningFromBackend(true).then(function(refreshed) {
                aiPersistenceState.contributionRetryAt = refreshed ? 0 : realNow() + 3000
            })
        }
        if(code == "contribution_revision_stale" && payload && Number.isFinite(payload.currentRevision)) {
            aiPersistenceState.lastError = "Refreshing a stale global AI revision."
            return refreshAILearningFromBackend(true).then(function(refreshed) {
                if(refreshed) {
                    var retryQueue = getAIPublicContributionQueue()
                    if(retryQueue.length > 0 && retryQueue[0].contributionId == pending.contributionId) {
                        retryQueue[0].baseRevision = aiPersistenceState.revision
                        setAIPublicContributionQueue(retryQueue)
                    }
                    aiPersistenceState.contributionRetryAt = 0
                } else {
                    aiPersistenceState.contributionRetryAt = realNow() + 3000
                }
            })
        }
        if(code == "invalid_contribution_token") {
            aiPersistenceState.contributionToken = ""
        }
        aiPersistenceState.contributionRetryAt = realNow() + (error && error.status == 429 ? 60000 : 3000)
        aiPersistenceState.lastError = String(error)
    }).finally(function() {
        aiPersistenceState.contributionInFlight = false
        if(getAIPublicContributionQueue().length > 0) {
            setTimeout(flushAIPublicContributionQueue, Math.max(0, aiPersistenceState.contributionRetryAt - realNow()))
        }
    })
    return true
}

function saveAILearningSnapshot() {
    if(!aiLearning) {
        return false
    }

    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiPersistenceState.backend = "session only"
        return false
    }
    if(aiPersistenceState.restoreComplete == false || aiPersistenceState.loadInFlight || aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight || getAIPublicContributionQueue().length > 0) {
        return false
    }
    var trainerKey = getAITrainerKey()
    if(aiPersistenceState.writeEnabled == false || trainerKey == "") {
        aiPersistenceState.backend = "shared model read-only"
        aiPersistenceState.lastError = trainerKey == "" ? "Trainer key is not set for this session." : "Hosted trainer commits are disabled."
        return false
    }

    pruneAILearningForSave()
    var savedLearningSnapshot = JSON.parse(JSON.stringify(aiLearning))
    var expectedRevision = aiPersistenceState.revision
    aiPersistenceState.saveInFlight = true
    fetch(AI_LEARNING_ENDPOINT + "&action=commit", {
        method: "POST",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            "X-AI-Trainer-Key": trainerKey,
        },
        body: JSON.stringify({
            protocolVersion: 1,
            expectedRevision: expectedRevision,
            model: savedLearningSnapshot,
        }),
    }).then(function(response) {
        if(response.ok == false) {
            return response.json().catch(function() { return null }).then(function(payload) {
                var code = payload && payload.error ? payload.error.code : "http_" + response.status
                throw new Error("Backend save failed: " + code)
            })
        }
        return response.json()
    }).then(function(parsed) {
        if(!parsed || parsed.ok !== true || Number.isFinite(parsed.revision) == false) {
            throw new Error("Backend save returned an invalid response")
        }
        var committedRevision = Math.max(0, Math.floor(parsed.revision))
        var installCommittedLearning = committedRevision >= aiPersistenceState.revision
        aiPersistenceState.revision = Math.max(aiPersistenceState.revision, committedRevision)
        if(installCommittedLearning) {
            aiPersistenceState.modelDigest = parsed.modelDigest || ""
        }
        aiPersistenceState.lastSavedAt = realNow()
        aiPersistenceState.lastError = ""
        if(installCommittedLearning && typeof syncAITrainingCommittedLearning == "function") {
            syncAITrainingCommittedLearning(savedLearningSnapshot)
        }
        updateAIPersistenceBackendLabel()
    }).catch(function(error) {
        aiPersistenceState.lastError = String(error)
        aiPersistenceState.backend = "php backend shared unavailable"
    }).finally(function() {
        aiPersistenceState.saveInFlight = false
        if(typeof aiTrainingState != "undefined" && aiTrainingState && aiTrainingState.saveQueued) {
            aiTrainingState.saveQueued = false
            if(typeof syncAITrainingSaveState == "function") {
                syncAITrainingSaveState()
            }
            if(aiTrainingState.pendingSaveEpisodes >= AI_TRAINING_AUTOSAVE_EPISODES && typeof requestAITrainingSave == "function") {
                requestAITrainingSave(false)
            }
        }
        flushAIPublicContributionQueue()
    })
    return true
}

function saveAILearning() {
    return saveAILearningSnapshot()
}

function getHistoricalPlayerFeatureVector() {
    ensureAILearningLoaded()
    return aiLearning.playerProfile.features.slice(0, AI_FEATURE_KEYS.length)
}

function buildAIStrategySelectionFeatures(observedLoadoutSummary) {
    var features = getHistoricalPlayerFeatureVector()
    if(!observedLoadoutSummary || observedLoadoutSummary.hasAnySelection == false) {
        return features
    }

    var observedFeatures = getObservedLoadoutFeatureVector(observedLoadoutSummary)
    for(var i = 0; i < AI_FEATURE_KEYS.length; i++) {
        if(AI_FEATURE_KEYS[i].indexOf("pre") == 0) {
            features[i] = clamp(features[i] * 0.3 + observedFeatures[i] * 0.7, 0, 1)
        }
    }

    features[getFeatureIndex("farm")] = clamp(features[getFeatureIndex("farm")] * 0.72 + observedLoadoutSummary.eco * 0.28, 0, 1)
    features[getFeatureIndex("heavy")] = clamp(features[getFeatureIndex("heavy")] * 0.72 + observedLoadoutSummary.heavy * 0.28, 0, 1)
    features[getFeatureIndex("late")] = clamp(features[getFeatureIndex("late")] * 0.72 + observedLoadoutSummary.late * 0.28, 0, 1)
    features[getFeatureIndex("support")] = clamp(features[getFeatureIndex("support")] * 0.72 + observedLoadoutSummary.support * 0.28, 0, 1)
    features[getFeatureIndex("camo")] = clamp(features[getFeatureIndex("camo")] * 0.72 + observedLoadoutSummary.camo * 0.28, 0, 1)
    features[getFeatureIndex("greed")] = clamp(features[getFeatureIndex("greed")] * 0.74 + Math.max(observedLoadoutSummary.eco * 0.7, observedLoadoutSummary.ecoBoost) * 0.26, 0, 1)
    features[getFeatureIndex("rush")] = clamp(features[getFeatureIndex("rush")] * 0.72 + Math.max(observedLoadoutSummary.pressure, observedLoadoutSummary.offenseBoost * 0.85) * 0.28, 0, 1)
    return features
}

function getStrategyPerformanceBonus(index) {
    ensureAILearningLoaded()
    var stats = aiLearning.strategyStats[index]
    if(stats.games == 0) {
        return 0.06
    }

    return clamp((stats.wins - stats.losses) / Math.max(1, stats.games) * 0.18, -0.22, 0.22)
}

function getAIPolicyForDecision() {
    ensureAILearningLoaded()
    if(aiProfile && isValidAIPolicy(aiProfile.policySnapshot)) {
        return aiProfile.policySnapshot
    }
    return isValidAIPolicy(aiLearning.policy) ? aiLearning.policy : aiLearning.championPolicy
}

function aiPolicyForward(inputs, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || getAIPolicyForDecision()
    var strategy = policy.strategy
    var safeInputs = []
    for(var inputIndex = 0; inputIndex < AI_FEATURE_KEYS.length; inputIndex++) {
        safeInputs.push(clamp(Number(inputs[inputIndex]) || 0, 0, 1))
    }
    var hidden1 = []
    var hidden2 = []
    var outputs = []

    for(var row = 0; row < strategy.hiddenSize1; row++) {
        var hiddenSum = strategy.b1[row]
        for(var col = 0; col < safeInputs.length; col++) {
            hiddenSum += strategy.W1[row][col] * safeInputs[col]
        }
        hidden1.push(Math.tanh(hiddenSum))
    }

    for(var hiddenRow = 0; hiddenRow < strategy.hiddenSize2; hiddenRow++) {
        var hidden2Sum = strategy.b2[hiddenRow]
        for(var hiddenCol = 0; hiddenCol < hidden1.length; hiddenCol++) {
            hidden2Sum += strategy.W2[hiddenRow][hiddenCol] * hidden1[hiddenCol]
        }
        hidden2.push(Math.tanh(hidden2Sum))
    }

    for(var outputIndex = 0; outputIndex < AI_STRATEGY_LIBRARY.length; outputIndex++) {
        var outputSum = strategy.b3[outputIndex]
        for(var hiddenIndex = 0; hiddenIndex < hidden2.length; hiddenIndex++) {
            outputSum += strategy.W3[outputIndex][hiddenIndex] * hidden2[hiddenIndex]
        }
        outputs.push(outputSum)
    }

    return {
        hidden: hidden2,
        hidden1: hidden1,
        hidden2: hidden2,
        outputs: outputs,
    }
}

function clampAIDecisionFeature(value) {
    return clamp(Number.isFinite(Number(value)) ? Number(value) : 0, -1, 1)
}

function getAIStableStringHash(value) {
    var text = String(value == null ? "" : value)
    var hash = 2166136261
    for(var i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

function getAIStableCandidateId(familyIndex, metadata) {
    if(metadata && metadata.id != null) {
        return String(metadata.id)
    }
    metadata = metadata || {}
    return [familyIndex, metadata.type || "", metadata.role || "", metadata.actionKey || "", Math.round(Number(metadata.x) || 0), Math.round(Number(metadata.y) || 0), Number(metadata.index) || 0].join("|")
}

function getAIDecisionBootstrapWeight(familyIndex, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || getAIPolicyForDecision()
    var samples = policy && policy.decision && Array.isArray(policy.decision.trainingSamples) ? Number(policy.decision.trainingSamples[familyIndex]) || 0 : 0
    return 1 - clamp(samples / AI_DECISION_BOOTSTRAP_SAMPLES, 0, 1)
}

function summarizeAIDecisionEntities(side) {
    var towerCount = 0
    var towerTierTotal = 0
    var towerTierMaximum = 0
    var towerCostTotal = 0
    var towerXTotal = 0
    var towerYTotal = 0
    if(typeof towers != "undefined" && Array.isArray(towers)) {
        for(var towerIndex = 0; towerIndex < towers.length; towerIndex++) {
            var tower = towers[towerIndex]
            if(!tower || tower.playerSide != side) continue
            var tierTotal = Math.max(0, Number(tower.path1Upgrades) || 0) + Math.max(0, Number(tower.path2Upgrades) || 0) + Math.max(0, Number(tower.path3Upgrades) || 0)
            towerCount++
            towerTierTotal += tierTotal
            towerTierMaximum = Math.max(towerTierMaximum, tierTotal)
            towerCostTotal += Math.max(0, Number(tower.totalCost) || 0)
            towerXTotal += Math.max(0, Number(tower.x) || 0)
            towerYTotal += Math.max(0, Number(tower.y) || 0)
        }
    }
    var bloonCount = 0
    var bloonHealthTotal = 0
    var bloonHealthMaximum = 0
    var bloonPathTotal = 0
    var bloonPathMaximum = 0
    var boostedBloons = 0
    if(typeof bloons != "undefined" && Array.isArray(bloons)) {
        for(var bloonIndex = 0; bloonIndex < bloons.length; bloonIndex++) {
            var bloon = bloons[bloonIndex]
            if(!bloon || bloon.playerSide != side) continue
            var health = Math.max(0, Number(bloon.health) || 0)
            var pathPosition = Math.max(0, Number(bloon.pathPos) || 0)
            bloonCount++
            bloonHealthTotal += health
            bloonHealthMaximum = Math.max(bloonHealthMaximum, health)
            bloonPathTotal += pathPosition
            bloonPathMaximum = Math.max(bloonPathMaximum, pathPosition)
            if((Number(bloon.bloonBoosted) || 1) > 1) boostedBloons++
        }
    }
    var width = Math.max(1, typeof canvas != "undefined" ? canvas.width : 1366)
    var height = Math.max(1, typeof canvas != "undefined" ? canvas.height : 768)
    return [
        clamp(towerCount / 24, 0, 1),
        clamp(towerTierTotal / 72, 0, 1),
        clamp(towerTierMaximum / 15, 0, 1),
        clamp(Math.log1p(towerCostTotal) / Math.log(100001), 0, 1),
        clamp(towerXTotal / Math.max(1, towerCount) / width, 0, 1),
        clamp(towerYTotal / Math.max(1, towerCount) / height, 0, 1),
        clamp(bloonCount / 48, 0, 1),
        clamp(Math.log1p(bloonHealthTotal) / Math.log(100001), 0, 1),
        clamp(Math.log1p(bloonHealthMaximum) / Math.log(10001), 0, 1),
        clamp(bloonPathTotal / Math.max(1, bloonCount) / 100, 0, 1),
        clamp(bloonPathMaximum / 100, 0, 1),
        clamp(boostedBloons / Math.max(1, bloonCount), 0, 1),
    ]
}

function getAISideFarmBankTotal(side) {
    if(typeof towers == "undefined" || Array.isArray(towers) == false) return 0
    var total = 0
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower || tower.playerSide != side || tower.towerType != "farm" || tower.path2Upgrades < 3) continue
        total += Math.max(0, Number(tower.towerVar) || 0)
    }
    return total
}

function getAISideBananaCashTotal(side) {
    if(typeof bananas == "undefined" || Array.isArray(bananas) == false) return 0
    var total = 0
    for(var i = 0; i < bananas.length; i++) {
        var banana = bananas[i]
        if(!banana || banana.playerSide != side) continue
        total += Math.max(0, Number(banana.cashGiven) || 0)
    }
    return total
}

function getAISideBananaExpiryAvg(side) {
    if(typeof bananas == "undefined" || Array.isArray(bananas) == false) return 0
    var total = 0
    var count = 0
    var now = typeof gameNow == "function" ? gameNow() : 0
    for(var i = 0; i < bananas.length; i++) {
        var banana = bananas[i]
        if(!banana || banana.playerSide != side) continue
        total += Math.max(0, Number(banana.lifespan) - now)
        count++
    }
    return count > 0 ? total / count : 0
}

function buildAIDecisionStateFeatures(side, familyIndex, matchup, contextFeatures) {
    var features = aiCreateVector(AI_DECISION_STATE_INPUT_SIZE, 0)
    if(familyIndex >= 0 && familyIndex < AI_DECISION_FAMILY_COUNT) {
        features[familyIndex] = 1
    }
    var own = typeof players != "undefined" && players[side] ? players[side] : {}
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var enemy = typeof players != "undefined" && players[enemySide] ? players[enemySide] : {}
    var ownLives = own.lives == Infinity ? 150 : Number(own.lives) || 0
    var enemyLives = enemy.lives == Infinity ? 150 : Number(enemy.lives) || 0
    var ownPops = side == PLAYER_SIDE.left ? typeof p1TotalPopCount == "undefined" ? 0 : p1TotalPopCount : typeof p2TotalPopCount == "undefined" ? 0 : p2TotalPopCount
    var enemyPops = enemySide == PLAYER_SIDE.left ? typeof p1TotalPopCount == "undefined" ? 0 : p1TotalPopCount : typeof p2TotalPopCount == "undefined" ? 0 : p2TotalPopCount
    var values = [
        clamp((typeof getCurrentVisibleRound == "function" ? getCurrentVisibleRound() : 0) / 50, 0, 1),
        clamp(Math.log1p(Math.max(0, Number(own.money) || 0)) / Math.log(30001), 0, 1),
        clamp((Number(own.eco) || 0) / 3000, 0, 1),
        clamp(ownLives / 150, 0, 1),
        clamp(Math.log1p(Math.max(0, Number(enemy.money) || 0)) / Math.log(30001), 0, 1),
        clamp((Number(enemy.eco) || 0) / 3000, 0, 1),
        clamp(enemyLives / 150, 0, 1),
        clamp((ownLives - enemyLives) / 150, -1, 1),
        clamp(typeof getSideTowerCountExcluding == "function" ? getSideTowerCountExcluding(side, ["farmer"]) / 16 : 0, 0, 1),
        clamp(typeof getSideTowerCountExcluding == "function" ? getSideTowerCountExcluding(enemySide, ["farmer"]) / 16 : 0, 0, 1),
        clamp(typeof getSideTowersByType == "function" ? getSideTowersByType(side, "farm").length / 6 : 0, 0, 1),
        clamp(typeof getSideTowersByType == "function" ? getSideTowersByType(enemySide, "farm").length / 6 : 0, 0, 1),
        clamp(Math.log1p(Math.max(0, Number(ownPops) || 0)) / Math.log(1000001), 0, 1),
        clamp(Math.log1p(Math.max(0, Number(enemyPops) || 0)) / Math.log(1000001), 0, 1),
        clamp(own && Array.isArray(own.bloonQueue) ? own.bloonQueue.length / 12 : 0, 0, 1),
        clamp(enemy && Array.isArray(enemy.bloonQueue) ? enemy.bloonQueue.length / 12 : 0, 0, 1),
        clamp(own && Number(own.selectedBloon) || 0, 0, 19) / 19,
        clamp(enemy && Number(enemy.selectedBloon) || 0, 0, 19) / 19,
        own && own.autoEco ? 1 : 0,
        enemy && enemy.autoEco ? 1 : 0,
        aiProfile && aiProfile.currentAction ? 1 : 0,
        clamp(aiProfile && aiProfile.tacticalTrace ? aiProfile.tacticalTrace.length / 128 : 0, 0, 1),
        clamp(typeof bananas != "undefined" && Array.isArray(bananas) ? bananas.length / 24 : 0, 0, 1),
        matchup && matchup.dangerHigh ? 1 : 0,
        matchup && matchup.safeToGreed ? 1 : 0,
        typeof roundReady != "undefined" && roundReady ? 1 : 0,
        typeof roundReady != "undefined" && roundReady && typeof endOfRoundGiven != "undefined" && endOfRoundGiven == false && typeof timeRoundEnded != "undefined" && gameNow() - timeRoundEnded >= 6000 ? 1 : 0,
    ]
    if(familyIndex != AI_DECISION_FAMILY.loadout) {
        // Expose stored and collectible economy that the previous state omitted.
        var ownFarmBank = getAISideFarmBankTotal(side)
        var enemyFarmBank = getAISideFarmBankTotal(enemySide)
        var ownBananaCash = getAISideBananaCashTotal(side)
        var enemyBananaCash = getAISideBananaCashTotal(enemySide)
        var ownBananaExpiry = getAISideBananaExpiryAvg(side)
        var economyExtras = [
            clamp(Math.log1p(ownFarmBank) / Math.log(30001), 0, 1),
            clamp(Math.log1p(enemyFarmBank) / Math.log(30001), 0, 1),
            clamp(Math.log1p(ownBananaCash) / Math.log(6001), 0, 1),
            clamp(Math.log1p(enemyBananaCash) / Math.log(6001), 0, 1),
            clamp(ownBananaExpiry / 10000, 0, 1),
            clamp(typeof timeRoundEnded != "undefined" && typeof gameNow == "function" ? Math.max(0, gameNow() - timeRoundEnded) / 6000 : 0, 0, 1),
        ]
        for(var economyIndex = 0; economyIndex < economyExtras.length; economyIndex++) values.push(economyExtras[economyIndex])
    }
    var supplied = Array.isArray(contextFeatures) ? contextFeatures : []
    for(var suppliedIndex = 0; suppliedIndex < supplied.length && suppliedIndex < 13; suppliedIndex++) {
        values.push(clamp(Number(supplied[suppliedIndex]) || 0, 0, 1))
    }
    for(var valueIndex = 0; valueIndex < values.length && AI_DECISION_FAMILY_COUNT + valueIndex < features.length; valueIndex++) {
        features[AI_DECISION_FAMILY_COUNT + valueIndex] = clampAIDecisionFeature(values[valueIndex])
    }
    var entityFeatures = summarizeAIDecisionEntities(side).concat(summarizeAIDecisionEntities(enemySide))
    for(var entityIndex = 0; entityIndex < entityFeatures.length; entityIndex++) features[48 + entityIndex] = clampAIDecisionFeature(entityFeatures[entityIndex])
    // 112-dim extension: per-tower-type composition for both sides (32 dims at 80-111) for bit-perfect loadout/tower awareness.
    var towerTypesForState = ["dart", "tack", "bomb", "ice", "super", "farm", "dartling", "wizard", "cobra", "boomer", "sniper", "ninja", "engi", "buccaneer", "mortar", "sword"]
    var perTypeBase = 80
    for(var typeIdx = 0; typeIdx < towerTypesForState.length; typeIdx++) {
        var towerType = towerTypesForState[typeIdx]
        var ownTypeCount = typeof getSideTowersByType == "function" ? getSideTowersByType(side, towerType).length : 0
        var enemyTypeCount = typeof getSideTowersByType == "function" ? getSideTowersByType(enemySide, towerType).length : 0
        if(perTypeBase + typeIdx < features.length) features[perTypeBase + typeIdx] = clamp(ownTypeCount / 6, 0, 1)
        if(perTypeBase + 16 + typeIdx < features.length) features[perTypeBase + 16 + typeIdx] = clamp(enemyTypeCount / 6, 0, 1)
    }
    return features
}

function getAIPerspectivePlacementX(side, x) {
    var bounds = getSideBounds(side, 0)
    var progress = clamp((x - bounds.minX) / Math.max(1, bounds.maxX - bounds.minX), 0, 1)
    return side == PLAYER_SIDE.right ? 1 - progress : progress
}

function buildAIDecisionCandidateFeatures(side, familyIndex, metadata) {
    metadata = metadata || {}
    var features = aiCreateVector(AI_DECISION_CANDIDATE_INPUT_SIZE, 0)
    if(familyIndex >= 0 && familyIndex < AI_DECISION_FAMILY_COUNT) {
        features[familyIndex] = 1
    }
    var money = Math.max(1, Number(metadata.money) || 1)
    var width = Math.max(1, typeof canvas != "undefined" ? canvas.width : 1366)
    var height = Math.max(1, typeof canvas != "undefined" ? canvas.height : 768)
    var candidateX = Number(metadata.x)
    var candidateY = Number(metadata.y)
    var hasPosition = Number.isFinite(candidateX) && Number.isFinite(candidateY)
    var nearestOwnDistance = 1
    var nearestEnemyDistance = 1
    var sameTypeCount = 0
    if(typeof towers != "undefined" && Array.isArray(towers)) {
        var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
        for(var towerIndex = 0; towerIndex < towers.length; towerIndex++) {
            var tower = towers[towerIndex]
            if(!tower) continue
            if(tower.playerSide == side && String(tower.towerType) == String(metadata.type || "")) sameTypeCount++
            if(!hasPosition) continue
            var normalizedDistance = Math.sqrt(Math.pow((Number(tower.x) || 0) - candidateX, 2) + Math.pow((Number(tower.y) || 0) - candidateY, 2)) / Math.sqrt(width * width + height * height)
            if(tower.playerSide == side) nearestOwnDistance = Math.min(nearestOwnDistance, normalizedDistance)
            if(tower.playerSide == enemySide) nearestEnemyDistance = Math.min(nearestEnemyDistance, normalizedDistance)
        }
    }
    var candidateCost = Math.max(0, Number(metadata.cost) || 0)
    var availableMoney = Math.max(1, Number(metadata.money) || Number(typeof players != "undefined" && players[side] && players[side].money) || 1)
    var genericFeatures = [
        clamp(candidateCost / money, 0, 2) - 1,
        clamp(Math.log1p(candidateCost) / Math.log(100001), 0, 1),
        clamp((Number(metadata.x) || 0) / width, 0, 1),
        clamp((Number(metadata.y) || 0) / height, 0, 1),
        clamp(Number(metadata.position) || 0, 0, 1),
        clamp((Number(metadata.count) || 0) / Math.max(1, Number(metadata.countScale) || 16), 0, 1),
        metadata.cooldownReady === false ? -1 : 1,
        metadata.affordable === false ? -1 : 1,
        metadata.legal === false ? -1 : 1,
        metadata.selected ? 1 : 0,
        clamp((Number(metadata.tier1) || 0) / 5, 0, 1),
        clamp((Number(metadata.tier2) || 0) / 5, 0, 1),
        clamp((Number(metadata.tier3) || 0) / 5, 0, 1),
        metadata.noop ? 1 : 0,
        metadata.playerSide == null ? 0 : metadata.playerSide == side ? 1 : -1,
        clamp(Math.log1p(money) / Math.log(100001), 0, 1),
        clamp((availableMoney - candidateCost) / availableMoney, -1, 1),
        hasPosition ? (side == PLAYER_SIDE.left ? candidateX < width / 2 : candidateX >= width / 2) ? 1 : -1 : 0,
        hasPosition ? 1 - clamp(nearestOwnDistance, 0, 1) : 0,
        hasPosition ? 1 - clamp(nearestEnemyDistance, 0, 1) : 0,
        clamp(sameTypeCount / 12, 0, 1),
        clamp(((Number(metadata.tier1) || 0) + (Number(metadata.tier2) || 0) + (Number(metadata.tier3) || 0)) / 15, 0, 1),
        clamp(Number(metadata.capacityHeadroom) || 0, 0, 1),
        hasPosition ? 1 : 0,
    ]
    for(var genericIndex = 0; genericIndex < genericFeatures.length; genericIndex++) features[AI_DECISION_FAMILY_COUNT + genericIndex] = clampAIDecisionFeature(genericFeatures[genericIndex])

    var semanticFeatures
    if(Array.isArray(metadata.capabilityVector)) {
        semanticFeatures = metadata.capabilityVector.slice(0, AI_CAPABILITY_KEYS.length)
    } else if(metadata.capabilityBefore || metadata.capabilityAfter) {
        semanticFeatures = getNormalizedAICapabilityDelta(metadata.capabilityBefore, metadata.capabilityAfter)
    } else {
        var capabilityFacts = copyAICapabilities(metadata.capabilityFacts)
        if(metadata.tower) addAICapabilities(capabilityFacts, getAITowerCapabilityFacts(metadata.tower), Number(metadata.capabilityScale) || 1)
        else if(AI_BASE_TOWER_CAPABILITIES[String(metadata.type || "")]) addAICapabilities(capabilityFacts, getAITowerCapabilityFacts(metadata.type), Number(metadata.capabilityScale) || 1)
        if(metadata.send) addAICapabilities(capabilityFacts, getAISendCapabilityFacts(metadata.send, metadata.sendGroups), 1)
        if(metadata.boostType) addAICapabilities(capabilityFacts, getAIBoostCapabilityFacts(metadata.boostType, typeof round == "undefined" ? 0 : round), 1)
        if(metadata.manualFollow) capabilityFacts.manualFollow = 1
        if(metadata.manualLock) capabilityFacts.manualLock = 1
        semanticFeatures = getNormalizedAICapabilityVector(capabilityFacts)
    }
    while(semanticFeatures.length < AI_CAPABILITY_KEYS.length) semanticFeatures.push(0)
    for(var semanticIndex = 0; semanticIndex < AI_CAPABILITY_KEYS.length; semanticIndex++) features[32 + semanticIndex] = clampAIDecisionFeature(semanticFeatures[semanticIndex])
    if(metadata.loadoutSummary && metadata.placementGeometry !== true) {
        var loadoutSummary = metadata.loadoutSummary
        var loadoutFeatures = [
            loadoutSummary.eco,
            loadoutSummary.pressure,
            loadoutSummary.heavy,
            loadoutSummary.camo,
            loadoutSummary.support,
            loadoutSummary.late,
            loadoutSummary.ecoBoost,
            (Number(loadoutSummary.defenseBoost) + Number(loadoutSummary.offenseBoost)) / 2,
        ]
        for(var loadoutFeatureIndex = 0; loadoutFeatureIndex < loadoutFeatures.length; loadoutFeatureIndex++) {
            features[72 + loadoutFeatureIndex] = clampAIDecisionFeature(loadoutFeatures[loadoutFeatureIndex])
        }
    } else if(metadata.placementGeometry === true && hasPosition) {
        var coverage = getPlacementCoverageStats(side, candidateX, candidateY, Number(metadata.range) || 0)
        var sidePathCount = Math.max(1, getSidePathObjectCount(side))
        var placementFeatures = [
            getAIPerspectivePlacementX(side, candidateX),
            1 - clamp(coverage.nearestTrackDistance / 260, 0, 1),
            clamp(coverage.coverageCount / sidePathCount, 0, 1),
            clamp(coverage.averageProgress, 0, 1),
            clamp(coverage.span, 0, 1),
            clamp(coverage.longestRun, 0, 1),
            clamp(coverage.straightRun, 0, 1),
            clamp(coverage.lineAimScore, 0, 1),
        ]
        for(var placementIndex = 0; placementIndex < placementFeatures.length; placementIndex++) features[72 + placementIndex] = placementFeatures[placementIndex]
    }
    // 112-dim extension: tower-type one-hot (16 dims at 80-95) and detailed tier/cost context at 96-111 for bit-perfect quirk separation.
    var towerTypesForCandidate = ["dart", "tack", "bomb", "ice", "super", "farm", "dartling", "wizard", "cobra", "boomer", "sniper", "ninja", "engi", "buccaneer", "mortar", "sword"]
    var rawType = String(metadata.type || metadata.towerType || "").split("|")[0].split(",")[0]
    for(var typeIdx = 0; typeIdx < towerTypesForCandidate.length; typeIdx++) {
        if(rawType === towerTypesForCandidate[typeIdx] && 80 + typeIdx < features.length) features[80 + typeIdx] = 1
    }
    if(Number.isFinite(Number(metadata.tier1)) && 96 < features.length) features[96] = clamp(Number(metadata.tier1) / 5, 0, 1)
    if(Number.isFinite(Number(metadata.tier2)) && 97 < features.length) features[97] = clamp(Number(metadata.tier2) / 5, 0, 1)
    if(Number.isFinite(Number(metadata.tier3)) && 98 < features.length) features[98] = clamp(Number(metadata.tier3) / 5, 0, 1)
    if(typeof metadata.cost == "number" && 99 < features.length) features[99] = clamp(Math.log1p(Math.max(0, Number(metadata.cost))) / Math.log(100001), 0, 1)
    if(typeof metadata.money == "number" && 100 < features.length) features[100] = clamp(Math.log1p(Math.max(0, Number(metadata.money))) / Math.log(100001), 0, 1)
    if(typeof metadata.count == "number" && 101 < features.length) features[101] = clamp(Number(metadata.count) / Math.max(1, Number(metadata.countScale) || 16), 0, 1)
    if(metadata.send && 102 < features.length) features[102] = clamp(Math.log1p(Math.max(0, Number(metadata.send.health) || 0)) / Math.log(100001), 0, 1)
    if(metadata.boostType && 103 < features.length) features[103] = 1
    return features
}

function aiDecisionEncode(inputs, firstWeights, firstBias, secondWeights, secondBias) {
    var hidden = []
    var embedding = []
    var preactivation = []
    for(var row = 0; row < firstWeights.length; row++) {
        var sum = firstBias[row]
        for(var col = 0; col < inputs.length; col++) {
            sum += firstWeights[row][col] * inputs[col]
        }
        hidden.push(Math.tanh(sum))
    }
    for(var embeddingIndex = 0; embeddingIndex < secondWeights.length; embeddingIndex++) {
        var embeddingSum = secondBias[embeddingIndex]
        for(var hiddenIndex = 0; hiddenIndex < hidden.length; hiddenIndex++) {
            embeddingSum += secondWeights[embeddingIndex][hiddenIndex] * hidden[hiddenIndex]
        }
        preactivation.push(embeddingSum)
        embedding.push(Math.tanh(embeddingSum))
    }
    return { hidden: hidden, embedding: embedding, preactivation: preactivation }
}

function getAIDecisionMemory() {
    if(!aiProfile) return aiCreateVector(AI_DECISION_MEMORY_SIZE, 0)
    if(!isFiniteAIVector(aiProfile.decisionMemory, AI_DECISION_MEMORY_SIZE)) {
        aiProfile.decisionMemory = aiCreateVector(AI_DECISION_MEMORY_SIZE, 0)
    }
    return aiProfile.decisionMemory
}

function aiSoftmax(logits) {
    var maximum = Math.max.apply(null, logits)
    var exponentials = logits.map(function(value) { return Math.exp(clamp(value - maximum, -40, 40)) })
    var total = exponentials.reduce(function(sum, value) { return sum + value }, 0)
    return exponentials.map(function(value) { return value / Math.max(1e-12, total) })
}

function aiDecisionForward(stateFeatures, candidateFeatures, familyIndex, memoryIn, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || getAIPolicyForDecision()
    if(isValidAIPolicy(policy) == false || familyIndex < 0 || familyIndex >= AI_DECISION_FAMILY_COUNT || !Array.isArray(stateFeatures) || !Array.isArray(candidateFeatures)) {
        return null
    }
    var safeState = stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE).map(clampAIDecisionFeature)
    var safeCandidate = candidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE).map(clampAIDecisionFeature)
    var resolvedMemory = Array.isArray(memoryIn) ? memoryIn : getAIDecisionMemory()
    var safeMemory = resolvedMemory.slice(0, AI_DECISION_MEMORY_SIZE).map(clampAIDecisionFeature)
    if(safeState.length != AI_DECISION_STATE_INPUT_SIZE || safeCandidate.length != AI_DECISION_CANDIDATE_INPUT_SIZE || safeMemory.length != AI_DECISION_MEMORY_SIZE) {
        return null
    }
    var decision = policy.decision
    var state = null
    if(aiDecisionStateCache && aiDecisionStateCache.features == stateFeatures && aiDecisionStateCache.memory == resolvedMemory && aiDecisionStateCache.policy == policy) {
        safeState = aiDecisionStateCache.safeState
        safeMemory = aiDecisionStateCache.safeMemory
        state = aiDecisionStateCache.state
    } else {
        var baseState = aiDecisionEncode(safeState, decision.WState1, decision.bState1, decision.WState2, decision.bState2)
        var memoryOut = []
        for(var memoryIndex = 0; memoryIndex < AI_DECISION_MEMORY_SIZE; memoryIndex++) {
            var memorySum = decision.bMemory[memoryIndex]
            for(var stateInputIndex = 0; stateInputIndex < AI_DECISION_EMBEDDING_SIZE; stateInputIndex++) memorySum += decision.WStateToMemory[memoryIndex][stateInputIndex] * baseState.embedding[stateInputIndex]
            for(var memoryInputIndex = 0; memoryInputIndex < AI_DECISION_MEMORY_SIZE; memoryInputIndex++) memorySum += decision.WMemoryToMemory[memoryIndex][memoryInputIndex] * safeMemory[memoryInputIndex]
            memoryOut.push(Math.tanh(memorySum))
        }
        var stateEmbedding = []
        for(var embeddingIndex = 0; embeddingIndex < AI_DECISION_EMBEDDING_SIZE; embeddingIndex++) {
            var stateSum = baseState.preactivation[embeddingIndex]
            for(var memoryColumn = 0; memoryColumn < AI_DECISION_MEMORY_SIZE; memoryColumn++) stateSum += decision.WMemoryToState[embeddingIndex][memoryColumn] * memoryOut[memoryColumn]
            stateEmbedding.push(Math.tanh(stateSum))
        }
        var valueLogit = decision.bValue
        for(var valueIndex = 0; valueIndex < AI_DECISION_EMBEDDING_SIZE; valueIndex++) valueLogit += decision.WValue[valueIndex] * stateEmbedding[valueIndex]
        var survivalLogits = []
        for(var survivalIndex = 0; survivalIndex < AI_DECISION_SURVIVAL_CLASS_COUNT; survivalIndex++) {
            var survivalLogit = decision.bSurvival[survivalIndex]
            for(var survivalFeature = 0; survivalFeature < AI_DECISION_EMBEDDING_SIZE; survivalFeature++) survivalLogit += decision.WSurvival[survivalIndex][survivalFeature] * stateEmbedding[survivalFeature]
            survivalLogits.push(survivalLogit)
        }
        state = {
            hidden: baseState.hidden,
            baseEmbedding: baseState.embedding,
            embedding: stateEmbedding,
            memoryOut: memoryOut,
            value: Math.tanh(valueLogit),
            survivalProbabilities: aiSoftmax(survivalLogits),
        }
        aiDecisionStateCache = { features: stateFeatures, memory: resolvedMemory, policy: policy, safeState: safeState, safeMemory: safeMemory, state: state }
    }
    var candidate = aiDecisionEncode(safeCandidate, decision.WCandidate1, decision.bCandidate1, decision.WCandidate2, decision.bCandidate2)
    var dot = 0
    var stateSquared = 0
    var candidateSquared = 0
    for(var i = 0; i < AI_DECISION_EMBEDDING_SIZE; i++) {
        dot += state.embedding[i] * candidate.embedding[i]
        stateSquared += state.embedding[i] * state.embedding[i]
        candidateSquared += candidate.embedding[i] * candidate.embedding[i]
    }
    var stateNorm = Math.sqrt(stateSquared + 1e-6)
    var candidateNorm = Math.sqrt(candidateSquared + 1e-6)
    var normalizedDot = dot / (stateNorm * candidateNorm)
    var actorLogit = normalizedDot + decision.familyBias[familyIndex]
    return {
        stateFeatures: safeState,
        candidateFeatures: safeCandidate,
        memoryIn: safeMemory,
        memoryOut: state.memoryOut,
        stateHidden: state.hidden,
        baseStateEmbedding: state.baseEmbedding,
        stateEmbedding: state.embedding,
        candidateHidden: candidate.hidden,
        candidateEmbedding: candidate.embedding,
        stateNorm: stateNorm,
        candidateNorm: candidateNorm,
        normalizedDot: normalizedDot,
        actorLogit: actorLogit,
        score: Math.tanh(actorLogit),
        value: state.value,
        survivalProbabilities: state.survivalProbabilities,
    }
}

function scoreAIDecisionCandidate(side, familyIndex, metadata, matchup, stateFeatures, policyOverride) {
    metadata = metadata || {}
    var stableId = getAIStableCandidateId(familyIndex, metadata)
    var resolvedState = stateFeatures || buildAIDecisionStateFeatures(side, familyIndex, matchup, metadata.contextFeatures)
    var candidateFeatures = buildAIDecisionCandidateFeatures(side, familyIndex, metadata)
    var memoryIn = getAIDecisionMemory()
    var forward = aiDecisionForward(resolvedState, candidateFeatures, familyIndex, memoryIn, policyOverride)
    var explorationScale = aiProfile && aiProfile.explorationEnabled ? Math.max(0.02, 0.24 * Math.pow(0.997, (policyOverride || getAIPolicyForDecision()).decision.trainingSamples[familyIndex] || 0)) : 0
    var humanTacticalBonus = getAIHumanTacticalCandidateBonus(side, familyIndex, metadata)
    var result = {
        id: stableId,
        side: side,
        familyIndex: familyIndex,
        stateFeatures: resolvedState,
        candidateFeatures: candidateFeatures,
        memoryIn: forward ? forward.memoryIn : memoryIn.slice(0),
        memoryOut: forward ? forward.memoryOut : memoryIn.slice(0),
        neuralScore: forward ? forward.score : 0,
        humanTacticalBonus: humanTacticalBonus,
        score: (forward ? forward.score : 0) + humanTacticalBonus + aiRandomWeight(explorationScale),
    }
    if(!Array.isArray(resolvedState.aiCandidateBatch)) {
        Object.defineProperty(resolvedState, "aiCandidateBatch", { value: [], configurable: true })
    }
    resolvedState.aiCandidateBatch.push(result)
    return result
}

function getAIHumanTacticalCandidateKeys(side, familyIndex, metadata) {
    var actionKey = String(metadata && metadata.actionKey || "")
    var parts = actionKey.split("|")
    var keys = []
    if(familyIndex == AI_DECISION_FAMILY.placement && parts[0] == "place" && parts[1]) {
        keys.push("human|placement|place|" + parts[1])
        if(Number.isFinite(Number(metadata.x)) && Number.isFinite(Number(metadata.y))) {
            var bucket = getAIPlacementBucket(side, Number(metadata.x), Number(metadata.y))
            keys.push("human|placement|place|" + parts[1] + "|" + bucket.x + "|" + bucket.y)
        }
    } else if(familyIndex == AI_DECISION_FAMILY.placement && parts[0] == "aim" && parts[1] && parts[1] != "noop") {
        keys.push("human|placement|aim|" + parts[1])
    } else if(familyIndex == AI_DECISION_FAMILY.upgrade && parts[0] == "upgrade" && parts[1] && parts[2]) {
        keys.push("human|upgrade|upgrade|" + parts[1] + "|" + parts[2])
    } else if(familyIndex == AI_DECISION_FAMILY.sell && parts[0] == "sell" && parts[1]) {
        keys.push("human|sell|sell|" + parts[1])
    } else if(familyIndex == AI_DECISION_FAMILY.sell && parts[0] == "collect" && parts[1]) {
        keys.push("human|sell|collect|" + parts[1])
    } else if((familyIndex == AI_DECISION_FAMILY.eco || familyIndex == AI_DECISION_FAMILY.rush) && parts[0] == "send" && parts[1]) {
        keys.push("human|" + (familyIndex == AI_DECISION_FAMILY.eco ? "eco" : "rush") + "|send|" + parts[1])
        if(familyIndex == AI_DECISION_FAMILY.eco) keys.push("human|eco|auto|1")
    } else if(familyIndex == AI_DECISION_FAMILY.eco && parts[0] == "auto" && (parts[1] == "0" || parts[1] == "1")) {
        keys.push("human|eco|auto|" + parts[1])
    } else if(familyIndex == AI_DECISION_FAMILY.boost && parts[0] == "boost" && parts[1]) {
        keys.push("human|boost|boost|" + parts[1])
    }
    return keys
}

function getAIHumanTacticalCandidateBonus(side, familyIndex, metadata) {
    ensureAILearningLoaded()
    var keys = getAIHumanTacticalCandidateKeys(side, familyIndex, metadata)
    var total = 0
    var used = 0
    for(var i = 0; i < keys.length; i++) {
        var record = getAILearningRecord(aiLearning.tacticalFamilyStats, keys[i])
        if(!record || Math.max(0, Number(record.samples) || 0) < 4) continue
        total += getAILearningScore(aiLearning.tacticalFamilyStats, keys[i])
        used++
    }
    return used > 0 ? clamp(total / used * 0.05, -0.05, 0.05) : 0
}

function isAIDecisionScoreBetter(candidateScore, bestScore) {
    return !bestScore || candidateScore.score > bestScore.score || candidateScore.score == bestScore.score && candidateScore.id < bestScore.id
}

function getAICosineEmbeddingDeltas(forward, outputDelta) {
    var stateDeltas = []
    var candidateDeltas = []
    for(var embeddingIndex = 0; embeddingIndex < AI_DECISION_EMBEDDING_SIZE; embeddingIndex++) {
        var stateValue = forward.stateEmbedding[embeddingIndex]
        var candidateValue = forward.candidateEmbedding[embeddingIndex]
        var stateGradient = candidateValue / (forward.stateNorm * forward.candidateNorm) - forward.normalizedDot * stateValue / (forward.stateNorm * forward.stateNorm)
        var candidateGradient = stateValue / (forward.stateNorm * forward.candidateNorm) - forward.normalizedDot * candidateValue / (forward.candidateNorm * forward.candidateNorm)
        stateDeltas.push(clamp(outputDelta * stateGradient * (1 - stateValue * stateValue), -1, 1))
        candidateDeltas.push(clamp(outputDelta * candidateGradient * (1 - candidateValue * candidateValue), -1, 1))
    }
    return { state: stateDeltas, candidate: candidateDeltas }
}

function trainAIDecision(sample, target, survivalClass, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || aiLearning.policy
    if(!sample || !Array.isArray(sample.stateFeatures) || !Array.isArray(sample.chosenCandidateFeatures) || !Array.isArray(sample.memoryIn) || !Number.isInteger(sample.familyIndex) || Number.isFinite(target) == false) {
        return false
    }
    var familyIndex = sample.familyIndex
    var chosen = aiDecisionForward(sample.stateFeatures, sample.chosenCandidateFeatures, familyIndex, sample.memoryIn, policy)
    if(!chosen) return false
    var decision = policy.decision
    target = clamp(target, -1, 1)
    var advantage = clamp(target - chosen.value, -1, 1)
    var actorDelta = advantage
    var chosenActorDeltas = getAICosineEmbeddingDeltas(chosen, actorDelta)
    var valueDelta = clamp(target - chosen.value, -1, 1) * (1 - chosen.value * chosen.value)
    var survivalDeltas = aiCreateVector(AI_DECISION_SURVIVAL_CLASS_COUNT, 0)
    var hasSurvivalTarget = Number.isInteger(survivalClass) && survivalClass >= 0 && survivalClass < AI_DECISION_SURVIVAL_CLASS_COUNT
    if(hasSurvivalTarget) {
        for(var survivalIndex = 0; survivalIndex < AI_DECISION_SURVIVAL_CLASS_COUNT; survivalIndex++) survivalDeltas[survivalIndex] = (survivalIndex == survivalClass ? 1 : 0) - chosen.survivalProbabilities[survivalIndex]
    }
    var originalStateWeights = cloneAIMatrix(decision.WState2)
    var originalCandidateWeights = cloneAIMatrix(decision.WCandidate2)
    var originalMemoryToState = cloneAIMatrix(decision.WMemoryToState)
    var originalStateToMemory = cloneAIMatrix(decision.WStateToMemory)
    var originalValueWeights = decision.WValue.slice(0)
    var originalSurvivalWeights = cloneAIMatrix(decision.WSurvival)
    var stateEmbeddingDelta = []
    for(var stateEmbeddingIndex = 0; stateEmbeddingIndex < AI_DECISION_EMBEDDING_SIZE; stateEmbeddingIndex++) {
        var headActivationDelta = originalValueWeights[stateEmbeddingIndex] * valueDelta
        if(hasSurvivalTarget) {
            for(var survivalClassIndex = 0; survivalClassIndex < AI_DECISION_SURVIVAL_CLASS_COUNT; survivalClassIndex++) headActivationDelta += originalSurvivalWeights[survivalClassIndex][stateEmbeddingIndex] * survivalDeltas[survivalClassIndex]
        }
        var stateDelta = chosenActorDeltas.state[stateEmbeddingIndex] + headActivationDelta * (1 - chosen.stateEmbedding[stateEmbeddingIndex] * chosen.stateEmbedding[stateEmbeddingIndex])
        stateEmbeddingDelta.push(clamp(stateDelta, -1, 1))
    }
    var memoryDelta = aiCreateVector(AI_DECISION_MEMORY_SIZE, 0)
    for(var memoryIndex = 0; memoryIndex < AI_DECISION_MEMORY_SIZE; memoryIndex++) {
        var memoryDownstream = 0
        for(var memoryStateIndex = 0; memoryStateIndex < AI_DECISION_EMBEDDING_SIZE; memoryStateIndex++) memoryDownstream += originalMemoryToState[memoryStateIndex][memoryIndex] * stateEmbeddingDelta[memoryStateIndex]
        memoryDelta[memoryIndex] = clamp(memoryDownstream * (1 - chosen.memoryOut[memoryIndex] * chosen.memoryOut[memoryIndex]), -1, 1)
    }
    var baseEmbeddingDelta = []
    for(var baseIndex = 0; baseIndex < AI_DECISION_EMBEDDING_SIZE; baseIndex++) {
        var baseDownstream = stateEmbeddingDelta[baseIndex]
        for(var baseMemoryIndex = 0; baseMemoryIndex < AI_DECISION_MEMORY_SIZE; baseMemoryIndex++) baseDownstream += originalStateToMemory[baseMemoryIndex][baseIndex] * memoryDelta[baseMemoryIndex] * (1 - chosen.baseStateEmbedding[baseIndex] * chosen.baseStateEmbedding[baseIndex])
        baseEmbeddingDelta.push(clamp(baseDownstream, -1, 1))
    }
    var stateHiddenDelta = aiCreateVector(AI_DECISION_STATE_HIDDEN_SIZE, 0)
    for(var stateHiddenIndex = 0; stateHiddenIndex < stateHiddenDelta.length; stateHiddenIndex++) {
        var stateDownstream = 0
        for(var hiddenEmbeddingIndex = 0; hiddenEmbeddingIndex < AI_DECISION_EMBEDDING_SIZE; hiddenEmbeddingIndex++) stateDownstream += originalStateWeights[hiddenEmbeddingIndex][stateHiddenIndex] * baseEmbeddingDelta[hiddenEmbeddingIndex]
        stateHiddenDelta[stateHiddenIndex] = clamp(stateDownstream * (1 - chosen.stateHidden[stateHiddenIndex] * chosen.stateHidden[stateHiddenIndex]), -1, 1)
    }
    function candidateHiddenDeltas(forward, embeddingDeltas) {
        var deltas = aiCreateVector(AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0)
        for(var hiddenIndex = 0; hiddenIndex < deltas.length; hiddenIndex++) {
            var downstream = 0
            for(var candidateEmbeddingIndex = 0; candidateEmbeddingIndex < AI_DECISION_EMBEDDING_SIZE; candidateEmbeddingIndex++) downstream += originalCandidateWeights[candidateEmbeddingIndex][hiddenIndex] * embeddingDeltas[candidateEmbeddingIndex]
            deltas[hiddenIndex] = clamp(downstream * (1 - forward.candidateHidden[hiddenIndex] * forward.candidateHidden[hiddenIndex]), -1, 1)
        }
        return deltas
    }
    var chosenCandidateHiddenDelta = candidateHiddenDeltas(chosen, chosenActorDeltas.candidate)
    var learningRate = policy.decisionLearningRate / Math.sqrt(1 + decision.trainingSamples[familyIndex] / 500)
    for(var valueWeightIndex = 0; valueWeightIndex < AI_DECISION_EMBEDDING_SIZE; valueWeightIndex++) decision.WValue[valueWeightIndex] = clampAIPolicyParameter(decision.WValue[valueWeightIndex] + learningRate * valueDelta * chosen.stateEmbedding[valueWeightIndex])
    decision.bValue = clampAIPolicyParameter(decision.bValue + learningRate * valueDelta)
    if(hasSurvivalTarget) {
        for(var survivalRow = 0; survivalRow < AI_DECISION_SURVIVAL_CLASS_COUNT; survivalRow++) {
            for(var survivalColumn = 0; survivalColumn < AI_DECISION_EMBEDDING_SIZE; survivalColumn++) decision.WSurvival[survivalRow][survivalColumn] = clampAIPolicyParameter(decision.WSurvival[survivalRow][survivalColumn] + learningRate * survivalDeltas[survivalRow] * chosen.stateEmbedding[survivalColumn])
            decision.bSurvival[survivalRow] = clampAIPolicyParameter(decision.bSurvival[survivalRow] + learningRate * survivalDeltas[survivalRow])
        }
    }
    for(var outputIndex = 0; outputIndex < AI_DECISION_EMBEDDING_SIZE; outputIndex++) {
        for(var memoryWeightIndex = 0; memoryWeightIndex < AI_DECISION_MEMORY_SIZE; memoryWeightIndex++) decision.WMemoryToState[outputIndex][memoryWeightIndex] = clampAIPolicyParameter(decision.WMemoryToState[outputIndex][memoryWeightIndex] + learningRate * stateEmbeddingDelta[outputIndex] * chosen.memoryOut[memoryWeightIndex])
        for(var stateHiddenWeightIndex = 0; stateHiddenWeightIndex < AI_DECISION_STATE_HIDDEN_SIZE; stateHiddenWeightIndex++) {
            decision.WState2[outputIndex][stateHiddenWeightIndex] = clampAIPolicyParameter(decision.WState2[outputIndex][stateHiddenWeightIndex] + learningRate * baseEmbeddingDelta[outputIndex] * chosen.stateHidden[stateHiddenWeightIndex])
        }
        decision.bState2[outputIndex] = clampAIPolicyParameter(decision.bState2[outputIndex] + learningRate * baseEmbeddingDelta[outputIndex])
        for(var candidateHiddenWeightIndex = 0; candidateHiddenWeightIndex < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateHiddenWeightIndex++) {
            var candidateSecondGradient = chosenActorDeltas.candidate[outputIndex] * chosen.candidateHidden[candidateHiddenWeightIndex]
            decision.WCandidate2[outputIndex][candidateHiddenWeightIndex] = clampAIPolicyParameter(decision.WCandidate2[outputIndex][candidateHiddenWeightIndex] + learningRate * candidateSecondGradient)
        }
        decision.bCandidate2[outputIndex] = clampAIPolicyParameter(decision.bCandidate2[outputIndex] + learningRate * chosenActorDeltas.candidate[outputIndex])
    }
    for(var memoryRow = 0; memoryRow < AI_DECISION_MEMORY_SIZE; memoryRow++) {
        for(var memoryStateColumn = 0; memoryStateColumn < AI_DECISION_EMBEDDING_SIZE; memoryStateColumn++) decision.WStateToMemory[memoryRow][memoryStateColumn] = clampAIPolicyParameter(decision.WStateToMemory[memoryRow][memoryStateColumn] + learningRate * memoryDelta[memoryRow] * chosen.baseStateEmbedding[memoryStateColumn])
        for(var recurrentColumn = 0; recurrentColumn < AI_DECISION_MEMORY_SIZE; recurrentColumn++) decision.WMemoryToMemory[memoryRow][recurrentColumn] = clampAIPolicyParameter(decision.WMemoryToMemory[memoryRow][recurrentColumn] + learningRate * memoryDelta[memoryRow] * chosen.memoryIn[recurrentColumn])
        decision.bMemory[memoryRow] = clampAIPolicyParameter(decision.bMemory[memoryRow] + learningRate * memoryDelta[memoryRow])
    }
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        for(var stateCol = 0; stateCol < AI_DECISION_STATE_INPUT_SIZE; stateCol++) {
            decision.WState1[stateRow][stateCol] = clampAIPolicyParameter(decision.WState1[stateRow][stateCol] + learningRate * stateHiddenDelta[stateRow] * chosen.stateFeatures[stateCol])
        }
        decision.bState1[stateRow] = clampAIPolicyParameter(decision.bState1[stateRow] + learningRate * stateHiddenDelta[stateRow])
    }
    for(var candidateRow = 0; candidateRow < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateRow++) {
        for(var candidateCol = 0; candidateCol < AI_DECISION_CANDIDATE_INPUT_SIZE; candidateCol++) {
            var candidateFirstGradient = chosenCandidateHiddenDelta[candidateRow] * chosen.candidateFeatures[candidateCol]
            decision.WCandidate1[candidateRow][candidateCol] = clampAIPolicyParameter(decision.WCandidate1[candidateRow][candidateCol] + learningRate * candidateFirstGradient)
        }
        decision.bCandidate1[candidateRow] = clampAIPolicyParameter(decision.bCandidate1[candidateRow] + learningRate * chosenCandidateHiddenDelta[candidateRow])
    }
    decision.trainingSamples[familyIndex]++
    aiDecisionStateCache = null
    if(!policyOverride || policyOverride == aiLearning.policy) {
        aiLearning.totalDecisionSamples++
    }
    return true
}

function chooseAIStrategyFromFeatures(features) {
    return chooseAIStrategyFromFeaturesWithObservation(features, null)
}

function chooseAIStrategyFromFeaturesWithObservation(features, observedLoadoutSummary) {
    var pass = aiPolicyForward(features)
    var chosenIndex = 0
    var bestScore = -Infinity
    var explorationChance = aiProfile && aiProfile.explorationEnabled ? Math.max(0.04, 0.22 * Math.pow(0.985, aiLearning.totalPolicySamples || aiLearning.totalGames)) * getAIDecisionBootstrapWeight(AI_DECISION_FAMILY.strategy) : 0
    var scoredOutputs = []
    var decisionScores = []
    var decisionState = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.strategy, null, features)
    for(var scoreIndex = 0; scoreIndex < pass.outputs.length; scoreIndex++) {
        var strategy = AI_STRATEGY_LIBRARY[scoreIndex]
        var decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.strategy, {
            id: strategy.id,
            type: strategy.id,
            role: "strategy",
            actionKey: "strategy|" + strategy.id,
            index: scoreIndex,
            maxIndex: Math.max(1, pass.outputs.length - 1),
            capabilityFacts: getAILoadoutCapabilityFacts(strategy.towers, strategy.boosts, typeof round == "undefined" ? 0 : round),
        }, null, decisionState)
        var adjustedScore = pass.outputs[scoreIndex] + decision.score
        decisionScores.push(decision)
        scoredOutputs.push(adjustedScore)
    }

    var sortedOutputs = scoredOutputs.slice(0).sort(function(a, b) {
        return b - a
    })
    var confidenceMargin = sortedOutputs.length > 1 ? sortedOutputs[0] - sortedOutputs[1] : 0

    if(confidenceMargin < 0.08) {
        explorationChance += 0.07
    } else if(confidenceMargin < 0.16) {
        explorationChance += 0.03
    }
    explorationChance = clamp(explorationChance, 0, 0.28)

    if(Math.random() < explorationChance) {
        chosenIndex = Math.floor(Math.random() * AI_STRATEGY_LIBRARY.length)
    } else {
        for(var i = 0; i < scoredOutputs.length; i++) {
            if(scoredOutputs[i] > bestScore) {
                bestScore = scoredOutputs[i]
                chosenIndex = i
            }
        }
    }

    return {
        index: chosenIndex,
        features: features.slice(0),
        hidden: pass.hidden,
        outputs: scoredOutputs,
        rawOutputs: pass.outputs,
        decisionSample: decisionScores[chosenIndex],
    }
}

function chooseAIArchetypeFromFeatures(features, excludedStrategyIndex, loadoutKey) {
    var pass = aiPolicyForward(features)
    var chosenIndex = 0
    var bestScore = -Infinity
    var explorationChance = aiProfile && aiProfile.explorationEnabled ? Math.max(0.04, 0.22 * Math.pow(0.985, aiLearning.totalPolicySamples || aiLearning.totalGames)) * getAIDecisionBootstrapWeight(AI_DECISION_FAMILY.strategy) : 0
    var scoredOutputs = []
    var decisionScores = []
    var decisionState = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.strategy, null, features)
    for(var scoreIndex = 0; scoreIndex < pass.outputs.length; scoreIndex++) {
        if(AI_STRATEGY_LIBRARY.length > 1 && scoreIndex == excludedStrategyIndex) {
            scoredOutputs.push(-Infinity)
            decisionScores.push(null)
            continue
        }
        var strategy = AI_STRATEGY_LIBRARY[scoreIndex]
        var decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.strategy, {
            id: strategy.id,
            type: strategy.id,
            role: "strategy",
            actionKey: "strategy|" + strategy.id,
            index: scoreIndex,
            maxIndex: Math.max(1, pass.outputs.length - 1),
            capabilityFacts: getAILoadoutCapabilityFacts(strategy.towers, strategy.boosts, typeof round == "undefined" ? 0 : round),
        }, null, decisionState)
        var adjustedScore = pass.outputs[scoreIndex] + decision.score
        decisionScores.push(decision)
        scoredOutputs.push(adjustedScore)
    }

    var sortedOutputs = scoredOutputs.slice(0).sort(function(a, b) {
        return b - a
    })
    var confidenceMargin = sortedOutputs.length > 1 ? sortedOutputs[0] - sortedOutputs[1] : 0
    if(confidenceMargin < 0.08) {
        explorationChance += 0.07
    } else if(confidenceMargin < 0.16) {
        explorationChance += 0.03
    }
    explorationChance = clamp(explorationChance, 0, 0.28)

    if(Math.random() < explorationChance) {
        do {
            chosenIndex = Math.floor(Math.random() * AI_STRATEGY_LIBRARY.length)
        } while(AI_STRATEGY_LIBRARY.length > 1 && chosenIndex == excludedStrategyIndex)
    } else {
        for(var i = 0; i < scoredOutputs.length; i++) {
            if(scoredOutputs[i] > bestScore) {
                bestScore = scoredOutputs[i]
                chosenIndex = i
            }
        }
    }

    return {
        index: chosenIndex,
        features: features.slice(0),
        hidden: pass.hidden,
        outputs: scoredOutputs,
        rawOutputs: pass.outputs,
        decisionSample: decisionScores[chosenIndex],
    }
}

function getCurrentAIStrategy() {
    return aiCurrentStrategy || AI_STRATEGY_LIBRARY[0]
}

function getCurrentAILoadoutKey() {
    if(aiStrategySelection && aiStrategySelection.loadoutKey) {
        return aiStrategySelection.loadoutKey
    }
    if(aiMatchTelemetry && aiMatchTelemetry.aiLoadoutKey) {
        return aiMatchTelemetry.aiLoadoutKey
    }
    if(aiCurrentStrategy && aiCurrentStrategy.loadoutKey) {
        return aiCurrentStrategy.loadoutKey
    }
    return ""
}

function getCurrentAIStrategyId() {
    if(aiStrategySelection && aiStrategySelection.index != null && AI_STRATEGY_LIBRARY[aiStrategySelection.index]) {
        return AI_STRATEGY_LIBRARY[aiStrategySelection.index].id
    }
    if(aiCurrentStrategy && aiCurrentStrategy.id) {
        return aiCurrentStrategy.id
    }
    return AI_STRATEGY_LIBRARY[0].id
}

function createAIMatchTelemetry(strategyIndex, features, observedLoadoutSummary) {
    return {
        recorded: false,
        contributionStatus: "not-eligible",
        contributionId: "",
        contributionEpoch: Math.max(1, Math.floor(aiPersistenceState.contributionEpoch)),
        strategyIndex: strategyIndex,
        strategyId: AI_STRATEGY_LIBRARY[strategyIndex].id,
        aiLoadoutKey: "",
        aiLoadoutSummary: createEmptyLoadoutSummary(),
        selectionFeatures: features.slice(0),
        observedLoadoutSummary: observedLoadoutSummary || createEmptyLoadoutSummary(),
        playerEcoPeak: 0,
        playerFarmPeak: 0,
        playerSupportPeak: 0,
        playerCamoPeak: 0,
        playerPressurePeak: 0,
        playerHeavyPressurePeak: 0,
        aiEcoPeak: 0,
        aiFarmPeak: 0,
        aiPressurePeak: 0,
        aiHeavyPressurePeak: 0,
        playerGreedMoments: 0,
        aiDangerGreedMoments: 0,
        aiCashFloatMoments: 0,
        aiEmergencyDefenseMoments: 0,
        aiEarlyTowerSpamMoments: 0,
        aiUncoveredBananaMoments: 0,
        aiLateFarmMoments: 0,
        roundPeak: 0,
        lastGreedTick: 0,
        lastSelfAuditTick: 0,
    }
}

function prepareAIStrategyForMatch(observedLoadoutSummary) {
    ensureAILearningLoaded()
    ensureAILoadoutLibraryInitialized()
    var chosenLoadout = chooseAILoadoutForMatch(observedLoadoutSummary, null)
    recordAIDecisionTraceSample(chosenLoadout.decisionSample, 0)
    var selectionFeatures = buildAIStrategySelectionFeatures(observedLoadoutSummary)
    aiStrategySelection = chooseAIArchetypeFromFeatures(selectionFeatures, null, chosenLoadout.key)
    aiStrategySelection.loadoutKey = chosenLoadout.key
    aiStrategySelection.loadoutSummary = chosenLoadout.summary
    aiCurrentStrategy = createAIRuntimeStrategyForLoadout(chosenLoadout, AI_STRATEGY_LIBRARY[aiStrategySelection.index], observedLoadoutSummary)
    aiDesiredLoadoutTowers = chosenLoadout.towers.slice(0)
    aiDesiredLoadoutBoosts = chosenLoadout.boosts.slice(0)
    aiMatchTelemetry = createAIMatchTelemetry(aiStrategySelection.index, aiStrategySelection.features, observedLoadoutSummary)
    aiMatchTelemetry.aiLoadoutKey = chosenLoadout.key
    aiMatchTelemetry.aiLoadoutSummary = chosenLoadout.summary
    recordAIDecisionTraceSample(aiStrategySelection.decisionSample, 0)
    aiProfile.loadoutPlanReady = true
}

function clampAIPolicyParameter(value) {
    return clamp(Number.isFinite(value) ? value : 0, -AI_POLICY_PARAMETER_LIMIT, AI_POLICY_PARAMETER_LIMIT)
}

function trainAIPolicy(features, chosenIndex, reward, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || aiLearning.policy
    var strategy = policy.strategy
    if(isValidAIPolicy(policy) == false || chosenIndex < 0 || chosenIndex >= AI_STRATEGY_LIBRARY.length || Number.isFinite(reward) == false) {
        return false
    }
    var safeFeatures = []
    for(var featureIndex = 0; featureIndex < AI_FEATURE_KEYS.length; featureIndex++) {
        var featureValue = Number(features[featureIndex])
        if(Number.isFinite(featureValue) == false) {
            return false
        }
        safeFeatures.push(clamp(featureValue, 0, 1))
    }
    var forward = aiPolicyForward(safeFeatures, policy)
    var chosenOutput = forward.outputs[chosenIndex]
    var prediction = Math.tanh(chosenOutput)
    var target = clamp(reward, -0.98, 0.98)
    var error = clamp(target - prediction, -1, 1)
    var outputDelta = error * (1 - prediction * prediction)
    var sampleCount = aiLearning.strategyStats[chosenIndex] ? aiLearning.strategyStats[chosenIndex].games + aiLearning.strategyStats[chosenIndex].syntheticEpisodes : 0
    var learningRate = policy.strategyLearningRate / Math.sqrt(1 + sampleCount / 40)
    var originalOutputWeights = strategy.W3[chosenIndex].slice(0)
    var originalHiddenWeights = []
    for(var row = 0; row < strategy.hiddenSize2; row++) {
        originalHiddenWeights.push(strategy.W2[row].slice(0))
    }

    for(var hiddenIndex = 0; hiddenIndex < forward.hidden2.length; hiddenIndex++) {
        strategy.W3[chosenIndex][hiddenIndex] = clampAIPolicyParameter(strategy.W3[chosenIndex][hiddenIndex] + learningRate * outputDelta * forward.hidden2[hiddenIndex])
    }
    strategy.b3[chosenIndex] = clampAIPolicyParameter(strategy.b3[chosenIndex] + learningRate * outputDelta)

    var hidden2Errors = []
    for(var hidden2Index = 0; hidden2Index < strategy.hiddenSize2; hidden2Index++) {
        var hidden2Error = (1 - forward.hidden2[hidden2Index] * forward.hidden2[hidden2Index]) * originalOutputWeights[hidden2Index] * outputDelta
        hidden2Errors.push(hidden2Error)
        strategy.b2[hidden2Index] = clampAIPolicyParameter(strategy.b2[hidden2Index] + learningRate * hidden2Error)
        for(var hidden1Index = 0; hidden1Index < strategy.hiddenSize1; hidden1Index++) {
            strategy.W2[hidden2Index][hidden1Index] = clampAIPolicyParameter(strategy.W2[hidden2Index][hidden1Index] + learningRate * hidden2Error * forward.hidden1[hidden1Index])
        }
    }

    for(var row = 0; row < strategy.hiddenSize1; row++) {
        var downstreamError = 0
        for(var nextHiddenIndex = 0; nextHiddenIndex < strategy.hiddenSize2; nextHiddenIndex++) {
            downstreamError += originalHiddenWeights[nextHiddenIndex][row] * hidden2Errors[nextHiddenIndex]
        }
        var hiddenError = (1 - forward.hidden1[row] * forward.hidden1[row]) * downstreamError
        strategy.b1[row] = clampAIPolicyParameter(strategy.b1[row] + learningRate * hiddenError)
        for(var col = 0; col < safeFeatures.length; col++) {
            strategy.W1[row][col] = clampAIPolicyParameter(strategy.W1[row][col] + learningRate * hiddenError * safeFeatures[col])
        }
    }
    return true
}

function blendFeatureAverage(previousValue, nextValue, sampleCount) {
    var alpha = 1 / Math.max(1, sampleCount)
    return previousValue + (nextValue - previousValue) * alpha
}

function getAILearningRecord(store, key) {
    return store[key] || null
}

function getAILearningScore(store, key) {
    var record = getAILearningRecord(store, key)
    if(!record) {
        return 0
    }
    var samples = Math.max(0, Number(record.samples) || 0)
    var mean = Number(record.mean)
    if(Number.isFinite(mean) == false) {
        mean = Number(record.score) || 0
    }
    return clamp(mean, -1, 1) * samples / (samples + 8)
}

function updateAILearningScore(store, key, nextScore) {
    var record = store[key]
    if(!record) {
        record = { samples: 0, score: 0, mean: 0, m2: 0 }
        store[key] = record
    }

    var observation = clamp(Number(nextScore) || 0, -1, 1)
    var previousMean = Number.isFinite(record.mean) ? record.mean : Number(record.score) || 0
    record.samples = Math.max(0, Math.floor(Number(record.samples) || 0)) + 1
    var delta = observation - previousMean
    record.mean = previousMean + delta / record.samples
    record.m2 = Math.max(0, Number(record.m2) || 0) + delta * (observation - record.mean)
    record.score = record.mean
}

function createAIPublicLearningObservation(store, key, value) {
    return {
        store: store,
        key: String(key),
        value: clamp(Number(value) || 0, -1, 1),
    }
}

function applyAILearningObservations(observations) {
    for(var i = 0; i < observations.length; i++) {
        var observation = observations[i]
        if(aiLearning[observation.store]) {
            updateAILearningScore(aiLearning[observation.store], observation.key, observation.value)
        }
    }
}

function getAITacticalStateKey(side, matchup) {
    var visibleRound = getCurrentVisibleRound()
    var stage = visibleRound <= 6 ? "early" : visibleRound <= 20 ? "mid" : "late"
    var cash = players[side].money < 1000 ? "poor" : players[side].money < 4000 ? "ready" : "rich"
    var eco = players[side].eco < 500 ? "low" : players[side].eco < 1300 ? "mid" : "high"
    var danger = matchup && matchup.dangerHigh ? "danger" : matchup && matchup.safeToGreed ? "safe" : "guarded"
    var enemy = matchup && matchup.enemyVulnerable ? "open" : "set"
    var heavy = matchup && matchup.playerThreat && matchup.playerThreat.heavyCount > 0 ? "heavy" : "light"
    return stage + "|" + danger + "|" + cash + "|" + eco + "|" + enemy + "|" + heavy
}

function getAITacticalActionBonus(side, family, actionKey, matchup) {
    ensureAILearningLoaded()
    var stateKey = getAITacticalStateKey(side, matchup)
    var exactKey = stateKey + "|" + family + "|" + actionKey
    var familyKey = family + "|" + actionKey
    var exactBonus = getAILearningScore(aiLearning.tacticalStats, exactKey)
    var familyBonus = getAILearningScore(aiLearning.tacticalFamilyStats, familyKey)
    var exploration = 0
    if(aiProfile && aiProfile.explorationEnabled) {
        var record = getAILearningRecord(aiLearning.tacticalStats, exactKey)
        var samples = record ? Math.max(0, Number(record.samples) || 0) : 0
        exploration = Math.min(0.2, 0.06 * Math.sqrt(Math.log(aiLearning.totalTacticalSamples + 2) / (samples + 1)))
    }
    return exactBonus * 0.7 + familyBonus * 0.3 + exploration
}

function getAITacticalPotential(side, family, matchup) {
    if(!matchup) {
        matchup = getCurrentPlayerMatchupStyle(side)
    }
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var ownLives = players[side].lives == Infinity ? 150 : players[side].lives
    var enemyLives = players[enemySide].lives == Infinity ? 150 : players[enemySide].lives
    var lifeAdvantage = clamp((ownLives - enemyLives) / 150, -1, 1)
    var defenseMath = matchup.defenseMath
    var offenseMath = matchup.offenseMath
    var defenseMargin = clamp((defenseMath.currentDps - defenseMath.requiredDps) / Math.max(20, defenseMath.currentDps + defenseMath.requiredDps), -1, 1)
    var offenseMargin = clamp((offenseMath.requiredDps - offenseMath.currentDps) / Math.max(20, offenseMath.currentDps + offenseMath.requiredDps), -1, 1)
    var ecoAdvantage = clamp((players[side].eco - players[enemySide].eco) / 2200, -1, 1)
    if(family == "eco" || family == "farm") {
        return lifeAdvantage * 0.35 + ecoAdvantage * 0.35 + defenseMargin * 0.3
    }
    if(family == "rush" || family == "offenseBoost") {
        return lifeAdvantage * 0.45 + offenseMargin * 0.4 + defenseMargin * 0.15
    }
    return lifeAdvantage * 0.5 + defenseMargin * 0.5
}

function appendAIDecisionTraceEntry(entry) {
    aiProfile.tacticalTrace.push(entry)
    if(aiProfile.tacticalTrace.length > 128) {
        var familyCounts = aiCreateVector(AI_DECISION_FAMILY_COUNT, 0)
        for(var traceIndex = 0; traceIndex < aiProfile.tacticalTrace.length; traceIndex++) {
            var familyIndex = aiProfile.tacticalTrace[traceIndex].familyIndex
            if(Number.isInteger(familyIndex) && familyIndex >= 0 && familyIndex < familyCounts.length) familyCounts[familyIndex]++
        }
        var trimFamily = -1
        for(var countIndex = 0; countIndex < familyCounts.length; countIndex++) {
            if(familyCounts[countIndex] > 1 && (trimFamily == -1 || familyCounts[countIndex] > familyCounts[trimFamily])) trimFamily = countIndex
        }
        var removeIndex = 0
        if(trimFamily != -1) {
            for(var candidateIndex = 0; candidateIndex < aiProfile.tacticalTrace.length; candidateIndex++) {
                if(aiProfile.tacticalTrace[candidateIndex].familyIndex == trimFamily) {
                    removeIndex = candidateIndex
                    break
                }
            }
        }
        aiProfile.tacticalTrace.splice(removeIndex, 1)
    }
}

function commitAIDecisionMemory(decisionSample) {
    if(!aiProfile || !decisionSample || decisionSample.memoryCommitted) return false
    decisionSample.memoryCommitted = true
    if(!isFiniteAIVector(decisionSample.memoryOut, AI_DECISION_MEMORY_SIZE)) return false
    aiProfile.decisionMemory = decisionSample.memoryOut.slice(0)
    aiDecisionStateCache = null
    return true
}

function recordAIDecisionTraceSample(decisionSample, localReward) {
    if(!aiProfile || !decisionSample || !Array.isArray(decisionSample.stateFeatures) || !Array.isArray(decisionSample.candidateFeatures)) {
        return false
    }
    return beginAIDecisionTransition(decisionSample.side, "", "", null, decisionSample, localReward)
}

function recordAINoOpDecision(decisionSample) {
    if(!aiProfile || !decisionSample) {
        return false
    }
    var now = gameNow()
    if(aiProfile.pendingTacticalDecision && aiProfile.pendingTacticalDecision.decisionId == decisionSample.id && now - aiProfile.pendingTacticalDecision.startedAtMs < 3000) return false
    for(var i = aiProfile.tacticalTrace.length - 1; i >= 0; i--) {
        var previous = aiProfile.tacticalTrace[i]
        if(previous.familyIndex == decisionSample.familyIndex && previous.decisionId == decisionSample.id) {
            if(now - previous.startedAtMs < 3000) return false
            break
        }
    }
    return beginAIDecisionTransition(decisionSample.side, "noop", decisionSample.id || "noop", null, decisionSample, 0)
}

function getAIFactualDecisionOutcomeSnapshot(side) {
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var ownPops = side == PLAYER_SIDE.left ? typeof p1TotalPopCount == "undefined" ? 0 : p1TotalPopCount : typeof p2TotalPopCount == "undefined" ? 0 : p2TotalPopCount
    var enemyPops = enemySide == PLAYER_SIDE.left ? typeof p1TotalPopCount == "undefined" ? 0 : p1TotalPopCount : typeof p2TotalPopCount == "undefined" ? 0 : p2TotalPopCount
    var ownLives = players[side].lives == Infinity ? 150 : Math.max(0, Number(players[side].lives) || 0)
    if(aiProfile) {
        if(!aiProfile.observedLivesBySide) aiProfile.observedLivesBySide = {}
        if(!aiProfile.observedLivesLostBySide) aiProfile.observedLivesLostBySide = {}
        var previousLives = Number(aiProfile.observedLivesBySide[side])
        if(Number.isFinite(previousLives) && ownLives < previousLives) {
            aiProfile.observedLivesLostBySide[side] = Math.max(0, Number(aiProfile.observedLivesLostBySide[side]) || 0) + previousLives - ownLives
        }
        aiProfile.observedLivesBySide[side] = ownLives
    }
    return {
        ownLives: ownLives,
        enemyLives: players[enemySide].lives == Infinity ? 150 : Math.max(0, Number(players[enemySide].lives) || 0),
        ownMoney: Math.max(0, Number(players[side].money) || 0),
        ownPops: Math.max(0, Number(ownPops) || 0),
        enemyPops: Math.max(0, Number(enemyPops) || 0),
        ownLivesLost: aiProfile ? Math.max(0, Number(aiProfile.observedLivesLostBySide[side]) || 0) : 0,
    }
}

function getAIFactualDecisionMoneyOutcome(before, after, actionContext) {
    var moneyDelta = (Number(after.ownMoney) || 0) - (Number(before.ownMoney) || 0)
    if(!actionContext || actionContext.kind == "income") {
        return moneyDelta
    }
    if(actionContext.kind == "spend") {
        return moneyDelta + Math.max(0, Number(actionContext.expectedCost) || 0)
    }
    if(actionContext.kind == "liquidate") {
        return moneyDelta - Math.max(0, Number(actionContext.proceeds) || 0) - Math.max(0, Number(actionContext.liquidationLoss) || 0)
    }
    return 0
}

function getAIFactualDecisionLocalReward(before, after, actionContext) {
    if(!before || !after) return 0
    var lifeOutcome = (Number(after.ownLives) || 0) - (Number(before.ownLives) || 0) + (Number(before.enemyLives) || 0) - (Number(after.enemyLives) || 0)
    var popOutcome = (Number(after.ownPops) || 0) - (Number(before.ownPops) || 0) - ((Number(after.enemyPops) || 0) - (Number(before.enemyPops) || 0))
    var moneyOutcome = getAIFactualDecisionMoneyOutcome(before, after, actionContext)
    return clamp(lifeOutcome / 30 + popOutcome / 5000 + moneyOutcome / 2000, -1, 1)
}

function settleAITacticalDecision(side, successorDecisionSample, terminal) {
    if(!aiProfile || !aiProfile.pendingTacticalDecision) {
        return false
    }
    var decision = aiProfile.pendingTacticalDecision
    var settledAt = Math.max(decision.startedAtMs, gameNow())
    decision.intervalReward = clamp((Number(decision.initialReward) || 0) + getAIFactualDecisionLocalReward(decision.factualOutcomeBefore, getAIFactualDecisionOutcomeSnapshot(side), decision.actionContext), -1, 1)
    decision.settledAtMs = settledAt
    decision.terminal = terminal === true
    if(successorDecisionSample && Array.isArray(successorDecisionSample.stateFeatures) && Array.isArray(successorDecisionSample.memoryIn)) {
        decision.successorStateFeatures = successorDecisionSample.stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE)
        decision.successorMemory = successorDecisionSample.memoryIn.slice(0, AI_DECISION_MEMORY_SIZE)
    } else {
        decision.successorStateFeatures = buildAIDecisionStateFeatures(side, decision.familyIndex, getCurrentPlayerMatchupStyle(side)).slice(0, AI_DECISION_STATE_INPUT_SIZE)
        decision.successorMemory = getAIDecisionMemory().slice(0, AI_DECISION_MEMORY_SIZE)
    }
    delete decision.factualOutcomeBefore
    delete decision.initialReward
    delete decision.actionContext
    appendAIDecisionTraceEntry(decision)
    aiProfile.pendingTacticalDecision = null
    return true
}

function getAIDecisionFamilyForLegacyAction(family, actionKey) {
    if(String(actionKey).indexOf("upgrade|") == 0) return AI_DECISION_FAMILY.upgrade
    if(String(actionKey).indexOf("sell|") == 0) return AI_DECISION_FAMILY.sell
    if(String(actionKey).indexOf("place|") == 0) return AI_DECISION_FAMILY.placement
    if(family == "eco") return String(actionKey).indexOf("boost|") == 0 ? AI_DECISION_FAMILY.boost : AI_DECISION_FAMILY.eco
    if(family == "rush") return AI_DECISION_FAMILY.rush
    if(family == "defenseBoost" || family == "offenseBoost") return AI_DECISION_FAMILY.boost
    return AI_DECISION_FAMILY.placement
}

function recordAITacticalDecision(side, family, actionKey, matchup, decisionSample, factualOutcomeBefore, actionContext) {
    if(!aiProfile) {
        return
    }
    var familyIndex = decisionSample ? decisionSample.familyIndex : getAIDecisionFamilyForLegacyAction(family, actionKey)
    var resolvedDecisionSample = decisionSample || scoreAIDecisionCandidate(side, familyIndex, { id: actionKey, type: family, actionKey: actionKey }, matchup)
    return beginAIDecisionTransition(side, family, actionKey, matchup, resolvedDecisionSample, 0, factualOutcomeBefore, actionContext)
}

function beginAIDecisionTransition(side, family, actionKey, matchup, resolvedDecisionSample, initialReward, factualOutcomeBefore, actionContext) {
    if(!aiProfile || !resolvedDecisionSample || !Array.isArray(resolvedDecisionSample.stateFeatures) || !Array.isArray(resolvedDecisionSample.candidateFeatures) || !Array.isArray(resolvedDecisionSample.memoryIn)) return false
    settleAITacticalDecision(side, resolvedDecisionSample, false)
    commitAIDecisionMemory(resolvedDecisionSample)
    aiProfile.pendingTacticalDecision = {
        creditVersion: AI_DECISION_CREDIT_VERSION,
        decisionId: resolvedDecisionSample.id || "",
        family: family,
        familyIndex: resolvedDecisionSample.familyIndex,
        actionKey: actionKey,
        stateKey: getAITacticalStateKey(side, matchup),
        stateFeatures: resolvedDecisionSample.stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE),
        chosenCandidateFeatures: resolvedDecisionSample.candidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE),
        memoryIn: resolvedDecisionSample.memoryIn.slice(0, AI_DECISION_MEMORY_SIZE),
        factualOutcomeBefore: factualOutcomeBefore || getAIFactualDecisionOutcomeSnapshot(side),
        initialReward: clamp(Number(initialReward) || 0, -1, 1),
        actionContext: actionContext || null,
        startedAtMs: Math.max(0, gameNow()),
    }
    return true
}

function getAITowerPlacementOutputValue(tower) {
    if(!tower) return 0
    var output = Math.max(0, Number(tower.popCount) || 0) + Math.max(0, Number(tower.cashGenerated) || 0)
    if(tower.towerType == "farm") output += Math.max(0, Number(tower.towerVar) || 0)
    return output
}

function doesAITowerHaveCombatOutput(tower) {
    if(!tower || tower.towerType == "farm" || tower.towerType == "farmer" || typeof getAITowerCapabilityFacts != "function") return false
    var facts = getAITowerCapabilityFacts(tower)
    return Number(facts.directDamage) > 0 || Number(facts.secondaryDamage) > 0 || Number(facts.dotDamage) > 0 || Number(facts.trapCapacity) > 0
}

function createAIPlacementOutcomeSample(decision) {
    return {
        creditVersion: AI_DECISION_CREDIT_VERSION,
        familyIndex: decision.familyIndex,
        stateFeatures: decision.stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE),
        chosenCandidateFeatures: decision.chosenCandidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE),
        memoryIn: decision.memoryIn.slice(0, AI_DECISION_MEMORY_SIZE),
        startedAtMs: Math.max(0, Math.floor(Number(decision.startedAtMs) || 0)),
        settledAtMs: 0,
        intervalReward: 0,
    }
}

function bindAITowerPlacementOutcome(tower) {
    if(!aiProfile || !tower || !aiProfile.pendingTacticalDecision || aiProfile.pendingTacticalDecision.familyIndex != AI_DECISION_FAMILY.placement) return false
    if(!aiProfile.placementOutcomes) aiProfile.placementOutcomes = {}
    var factualBefore = getAIFactualDecisionOutcomeSnapshot(tower.playerSide)
    aiProfile.placementOutcomes[tower.towerID] = {
        towerID: tower.towerID,
        sample: createAIPlacementOutcomeSample(aiProfile.pendingTacticalDecision),
        initialReward: clamp(Number(aiProfile.pendingTacticalDecision.initialReward) || 0, -1, 1),
        outputBefore: getAITowerPlacementOutputValue(tower),
        ownPopsBefore: factualBefore.ownPops,
        ownLivesBefore: factualBefore.ownLives,
        ownLivesLostBefore: factualBefore.ownLivesLost,
        placementCost: Math.max(1, Number(tower.totalCost) || getBaseTowerPriceByType(tower.towerType)),
        expectsCombatOutput: doesAITowerHaveCombatOutput(tower),
    }
    return true
}

function captureAITowerPlacementOutcome(tower) {
    if(!tower) return null
    var factualAfter = getAIFactualDecisionOutcomeSnapshot(tower.playerSide)
    return {
        outputAfter: getAITowerPlacementOutputValue(tower),
        ownPopsAfter: factualAfter.ownPops,
        ownLivesAfter: factualAfter.ownLives,
        ownLivesLostAfter: factualAfter.ownLivesLost,
    }
}

function finalizeAITowerPlacementOutcome(tower, outcome) {
    if(!aiProfile || !aiProfile.placementOutcomes || !tower) return false
    var placement = aiProfile.placementOutcomes[tower.towerID]
    if(!placement) return false
    delete aiProfile.placementOutcomes[tower.towerID]

    outcome = outcome || captureAITowerPlacementOutcome(tower)
    if(!outcome) return false
    var output = Math.max(0, (Number(outcome.outputAfter) || 0) - placement.outputBefore)
    var reward = placement.initialReward
    if(output > 0) {
        reward = clamp(Math.log1p(output) / Math.log1p(placement.placementCost), 0, 1)
    } else if(placement.expectsCombatOutput && ((Number(outcome.ownPopsAfter) || 0) > placement.ownPopsBefore || (Number(outcome.ownLivesLostAfter) || 0) > placement.ownLivesLostBefore)) {
        reward = -1
    }
    if(!placement.sample) return false
    placement.sample.settledAtMs = Math.max(placement.sample.startedAtMs, Math.floor(gameNow()))
    placement.sample.intervalReward = clamp(reward, -1, 1)
    if(!aiProfile.placementSamples) aiProfile.placementSamples = []
    aiProfile.placementSamples.push(placement.sample)
    while(aiProfile.placementSamples.length > AI_MAX_PLACEMENT_SAMPLES) aiProfile.placementSamples.shift()
    return true
}

function finalizeAIPlacementOutcomesForSide(side) {
    if(!aiProfile || !aiProfile.placementOutcomes) return 0
    var towerIDs = Object.keys(aiProfile.placementOutcomes)
    var finalized = 0
    for(var i = 0; i < towerIDs.length; i++) {
        var placement = aiProfile.placementOutcomes[towerIDs[i]]
        var tower = placement ? getAITowerByID(placement.towerID) : null
        if(tower && tower.playerSide == side && finalizeAITowerPlacementOutcome(tower)) finalized++
    }
    return finalized
}

function collectAIPlacementSamples(maximumSamples) {
    if(!aiProfile || !Array.isArray(aiProfile.placementSamples)) return []
    var available = aiProfile.placementSamples.slice(0)
    var maximum = maximumSamples == null ? available.length : Math.max(0, Math.floor(maximumSamples))
    if(maximum <= 0) return []
    if(available.length <= maximum) return available
    return available.slice(0, maximum)
}

function collectAIDecisionSamples(side, terminalReward, maximumDecisions) {
    if(!aiProfile) {
        return []
    }
    settleAITacticalDecision(side, null, true)
    var available = []
    for(var i = 0; i < aiProfile.tacticalTrace.length; i++) {
        var decision = aiProfile.tacticalTrace[i]
        if(decision.creditVersion != AI_DECISION_CREDIT_VERSION || !Number.isInteger(decision.familyIndex) || decision.familyIndex < 0 || decision.familyIndex >= AI_DECISION_FAMILY_COUNT || !Array.isArray(decision.stateFeatures) || decision.stateFeatures.length != AI_DECISION_STATE_INPUT_SIZE || !Array.isArray(decision.chosenCandidateFeatures) || decision.chosenCandidateFeatures.length != AI_DECISION_CANDIDATE_INPUT_SIZE || !Array.isArray(decision.memoryIn) || decision.memoryIn.length != AI_DECISION_MEMORY_SIZE || !Array.isArray(decision.successorStateFeatures) || decision.successorStateFeatures.length != AI_DECISION_STATE_INPUT_SIZE || !Array.isArray(decision.successorMemory) || decision.successorMemory.length != AI_DECISION_MEMORY_SIZE) {
            continue
        }
        available.push({
            creditVersion: AI_DECISION_CREDIT_VERSION,
            familyIndex: decision.familyIndex,
            stateFeatures: decision.stateFeatures.slice(0),
            chosenCandidateFeatures: decision.chosenCandidateFeatures.slice(0),
            memoryIn: decision.memoryIn.slice(0),
            startedAtMs: Math.max(0, Math.floor(Number(decision.startedAtMs) || 0)),
            settledAtMs: Math.max(0, Math.floor(Number(decision.settledAtMs) || 0)),
            intervalReward: clamp(Number(decision.intervalReward) || 0, -1, 1),
            successorStateFeatures: decision.successorStateFeatures.slice(0),
            successorMemory: decision.successorMemory.slice(0),
            terminal: decision.terminal === true,
        })
    }
    var maximum = maximumDecisions == null ? available.length : Math.max(0, Math.floor(maximumDecisions))
    if(maximum <= 0) return []
    if(available.length <= maximum) return available
    return available.slice(available.length - maximum)
}

function getAIDecisionTransitionDiscount(sample) {
    var durationSeconds = Math.max(0, Number(sample.settledAtMs) - Number(sample.startedAtMs)) / 1000
    return Math.pow(AI_DECISION_DISCOUNT_PER_SECOND, durationSeconds)
}

function getAIFourStepDecisionTargets(samples, terminalReward, policy) {
    var targets = []
    for(var i = 0; i < samples.length; i++) {
        var discountedReturn = 0
        var discount = 1
        var lastSample = samples[i]
        var terminalReached = false
        for(var step = 0; step < AI_DECISION_TD_STEPS && i + step < samples.length; step++) {
            lastSample = samples[i + step]
            discountedReturn += discount * clamp(Number(lastSample.intervalReward) || 0, -1, 1)
            discount *= getAIDecisionTransitionDiscount(lastSample)
            if(lastSample.terminal) {
                discountedReturn += discount * terminalReward
                terminalReached = true
                break
            }
        }
        if(!terminalReached) {
            var successor = aiDecisionForward(lastSample.successorStateFeatures, lastSample.chosenCandidateFeatures, lastSample.familyIndex, lastSample.successorMemory, policy)
            if(successor) discountedReturn += discount * successor.value
        }
        targets.push(clamp(discountedReturn, -1, 1))
    }
    return targets
}

function trainAIDecisionsFromMatch(side, terminalReward) {
    var samples = collectAIDecisionSamples(side, terminalReward, AI_MAX_PUBLIC_DECISION_SAMPLES)
    var ownLives = players[side].lives == Infinity ? 150 : Math.max(0, Number(players[side].lives) || 0)
    var survivalClass = ownLives <= 0 ? 0 : ownLives <= 50 ? 1 : ownLives < 150 ? 2 : 3
    var targets = getAIFourStepDecisionTargets(samples, terminalReward, aiLearning.policy)
    for(var i = 0; i < samples.length; i++) {
        trainAIDecision(samples[i], targets[i], survivalClass, aiLearning.policy)
    }
    var placementSamples = collectAIPlacementSamples()
    for(var placementIndex = 0; placementIndex < placementSamples.length; placementIndex++) {
        trainAIDecision(placementSamples[placementIndex], placementSamples[placementIndex].intervalReward, survivalClass, aiLearning.policy)
    }
    return samples.length + placementSamples.length
}

function collectAITacticalLearningObservations(side, terminalReward, maximumDecisions) {
    if(!aiProfile) {
        return []
    }
    var observations = []
    var startIndex = maximumDecisions == null ? 0 : Math.max(0, aiProfile.tacticalTrace.length - Math.max(0, maximumDecisions))
    for(var i = startIndex; i < aiProfile.tacticalTrace.length; i++) {
        var decision = aiProfile.tacticalTrace[i]
        if(!decision.stateKey || !decision.family || !decision.actionKey) {
            continue
        }
        var terminalWeight = 0.3 * Math.pow(AI_DECISION_DISCOUNT_PER_SECOND, Math.max(0, gameNow() - Number(decision.settledAtMs || 0)) / 1000)
        var target = clamp((Number(decision.intervalReward) || 0) * 0.7 + terminalReward * terminalWeight, -1, 1)
        observations.push(createAIPublicLearningObservation("tacticalStats", decision.stateKey + "|" + decision.family + "|" + decision.actionKey, target))
        observations.push(createAIPublicLearningObservation("tacticalFamilyStats", decision.family + "|" + decision.actionKey, target))
    }
    return observations
}

function finalizeAITacticalLearning(side, terminalReward) {
    var observations = collectAITacticalLearningObservations(side, terminalReward, null)
    applyAILearningObservations(observations)
    aiLearning.totalTacticalSamples += Math.floor(observations.length / 2)
    aiProfile.tacticalTrace = []
    aiProfile.pendingTacticalDecision = null
}

function getAIPlacementStatKey(mapIndex, towerType, role, bucket) {
    return "p2|" + mapIndex + "|" + towerType + "|" + role + "|" + bucket.x + "|" + bucket.y
}

function getAILoadoutStrategyStatKey(loadoutKey, strategyIndex) {
    return loadoutKey + "|" + AI_STRATEGY_LIBRARY[strategyIndex].id
}

function getAIRoundTimingBucket(roundNumber) {
    var visibleRound = Math.max(1, Math.floor(roundNumber || getCurrentVisibleRound()))
    if(visibleRound <= 3) return "r1_3"
    if(visibleRound <= 6) return "r4_6"
    if(visibleRound <= 10) return "r7_10"
    if(visibleRound <= 14) return "r11_14"
    if(visibleRound <= 20) return "r15_20"
    if(visibleRound <= 30) return "r21_30"
    return "r31p"
}

function getAITimingStatKey(loadoutKey, strategyId, towerType, role, roundBucket) {
    return loadoutKey + "|" + strategyId + "|" + towerType + "|" + role + "|" + roundBucket
}

function getAILoadoutPlacementStatKey(loadoutKey, strategyId, mapIndex, towerType, role, bucket) {
    return "p2|" + loadoutKey + "|" + strategyId + "|" + mapIndex + "|" + towerType + "|" + role + "|" + bucket.x + "|" + bucket.y
}

function getAICrosspathStatKey(towerType, contextKey, targetSignature) {
    return towerType + "|" + contextKey + "|" + targetSignature
}

function getFeatureIndex(featureName) {
    for(var i = 0; i < AI_FEATURE_KEYS.length; i++) {
        if(AI_FEATURE_KEYS[i] == featureName) {
            return i
        }
    }

    return -1
}

function updatePlayerProfileFeatures(featureVector) {
    ensureAILearningLoaded()
    aiLearning.playerProfile.games++
    for(var i = 0; i < AI_FEATURE_KEYS.length; i++) {
        aiLearning.playerProfile.features[i] = blendFeatureAverage(aiLearning.playerProfile.features[i], featureVector[i], aiLearning.playerProfile.games)
    }
}

function computeMatchFeatureVector() {
    var vector = aiCreateVector(AI_FEATURE_KEYS.length, 0)
    if(!aiMatchTelemetry) {
        return vector
    }

    vector[getFeatureIndex("farm")] = clamp(aiMatchTelemetry.playerFarmPeak / 3, 0, 1)
    vector[getFeatureIndex("eco")] = clamp((aiMatchTelemetry.playerEcoPeak - 250) / 1800, 0, 1)
    vector[getFeatureIndex("rush")] = clamp(aiMatchTelemetry.playerPressurePeak / 34, 0, 1)
    vector[getFeatureIndex("heavy")] = clamp(aiMatchTelemetry.playerHeavyPressurePeak / 4, 0, 1)
    vector[getFeatureIndex("late")] = clamp(aiMatchTelemetry.roundPeak / 40, 0, 1)
    vector[getFeatureIndex("support")] = clamp(aiMatchTelemetry.playerSupportPeak / 4, 0, 1)
    vector[getFeatureIndex("camo")] = clamp(aiMatchTelemetry.playerCamoPeak / 4, 0, 1)
    vector[getFeatureIndex("greed")] = clamp(aiMatchTelemetry.playerGreedMoments / 6, 0, 1)
    var observedLoadoutFeatures = getObservedLoadoutFeatureVector(aiMatchTelemetry.observedLoadoutSummary)
    for(var i = 0; i < AI_FEATURE_KEYS.length; i++) {
        if(AI_FEATURE_KEYS[i].indexOf("pre") == 0) {
            vector[i] = observedLoadoutFeatures[i]
        }
    }
    return vector
}

function updateLocalMatchCollectionTelemetry() {
    if(selectedMenuMode != "local" || aiEnabled || practiceMode || bossMode || gameStarted == false || gameOver) {
        return
    }
    if(!localMatchCollectionState) {
        resetLocalMatchCollection()
    }
    for(var side = PLAYER_SIDE.left; side <= PLAYER_SIDE.right; side++) {
        var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
        var telemetry = localMatchCollectionState.sides[side]
        var outgoingThreat = getBloonThreatSnapshot(enemySide, true)
        var farms = getSideTowersByType(side, "farm").length
        var support = getSideTowersByType(side, "cobra").length + getSideTowersByType(side, "sniper").length + getSideTowersByType(side, "engi").length
        var camo = getSideTowersByType(side, "wizard").length + getSideTowersByType(side, "ninja").length + getSideTowersByType(side, "sniper").length
        var defense = getSideTowerCountExcluding(side, ["farm", "farmer", "cobra"])
        var greedScore = Math.max(0, farms * 1.25 - defense * 0.75 - Math.min(1.5, outgoingThreat.heavyCount * 0.75))
        telemetry.ecoPeak = Math.max(telemetry.ecoPeak, players[side].eco)
        telemetry.farmPeak = Math.max(telemetry.farmPeak, farms)
        telemetry.supportPeak = Math.max(telemetry.supportPeak, support)
        telemetry.camoPeak = Math.max(telemetry.camoPeak, camo)
        telemetry.pressurePeak = Math.max(telemetry.pressurePeak, outgoingThreat.score)
        telemetry.heavyPressurePeak = Math.max(telemetry.heavyPressurePeak, outgoingThreat.heavyCount)
        telemetry.roundPeak = Math.max(telemetry.roundPeak, getCurrentVisibleRound())
        if(greedScore >= 1.2 && outgoingThreat.score < 10 && gameNow() - telemetry.lastGreedTick >= 2500) {
            telemetry.greedMoments++
            telemetry.lastGreedTick = gameNow()
        }
    }
}

function buildLocalHumanMatchFeatures(side, loadoutSummary) {
    var telemetry = localMatchCollectionState.sides[side]
    var vector = aiCreateVector(AI_FEATURE_KEYS.length, 0)
    vector[getFeatureIndex("farm")] = clamp(telemetry.farmPeak / 3, 0, 1)
    vector[getFeatureIndex("eco")] = clamp((telemetry.ecoPeak - 250) / 1800, 0, 1)
    vector[getFeatureIndex("rush")] = clamp(telemetry.pressurePeak / 34, 0, 1)
    vector[getFeatureIndex("heavy")] = clamp(telemetry.heavyPressurePeak / 4, 0, 1)
    vector[getFeatureIndex("late")] = clamp(telemetry.roundPeak / 40, 0, 1)
    vector[getFeatureIndex("support")] = clamp(telemetry.supportPeak / 4, 0, 1)
    vector[getFeatureIndex("camo")] = clamp(telemetry.camoPeak / 4, 0, 1)
    vector[getFeatureIndex("greed")] = clamp(telemetry.greedMoments / 6, 0, 1)
    var loadoutFeatures = getObservedLoadoutFeatureVector(loadoutSummary)
    for(var featureIndex = 0; featureIndex < AI_FEATURE_KEYS.length; featureIndex++) {
        if(AI_FEATURE_KEYS[featureIndex].indexOf("pre") == 0) {
            vector[featureIndex] = loadoutFeatures[featureIndex]
        }
    }
    return vector
}

function createLocalHumanDemonstration(side, opponentSide, loadoutSummary, opponentLoadoutSummary) {
    var subjectLives = players[side].lives == Infinity ? 150 : Math.max(0, players[side].lives)
    var opponentLives = players[opponentSide].lives == Infinity ? 150 : Math.max(0, players[opponentSide].lives)
    return {
        protocolVersion: 1,
        eventType: "human-demo-v1",
        contributionId: createAIContributionId(),
        baseRevision: Math.max(0, Math.floor(aiPersistenceState.revision)),
        contributionEpoch: Math.max(1, Math.floor(localMatchCollectionState.contributionEpoch)),
        map: Math.max(0, Math.floor(Number(mapNumber) || 0)),
        durationMs: clamp(Math.ceil(Math.max(0, gameNow() - timeGameStarted) / 250) * 250, 1, 7200000),
        matchFeatures: buildLocalHumanMatchFeatures(side, loadoutSummary),
        aiLives: subjectLives,
        enemyLives: opponentLives,
        loadoutKey: loadoutSummary.signature,
        opponentLoadoutKey: opponentLoadoutSummary.signature,
        events: getLocalHumanTacticalEventsForUpload(side),
    }
}

function finalizeLocalMatchCollection() {
    if(selectedMenuMode != "local" || aiEnabled || practiceMode || bossMode || gameStarted == false || gameOver == false || !localMatchCollectionState || localMatchCollectionState.recorded) {
        return false
    }
    if(aiPersistenceState.contributionEnabled == false) {
        localMatchCollectionState.contributionStatus = AI_CROSS_MATCH_LEARNING_ENABLED ? "unavailable" : "not-eligible"
        return false
    }
    if(players[PLAYER_SIDE.left].towers.length != 3 || players[PLAYER_SIDE.right].towers.length != 3 || players[PLAYER_SIDE.left].boostTypes.length != 2 || players[PLAYER_SIDE.right].boostTypes.length != 2) {
        localMatchCollectionState.contributionStatus = "not-eligible"
        return false
    }
    var leftSummary = summarizeLoadoutSelection(players[PLAYER_SIDE.left].towers, players[PLAYER_SIDE.left].boostTypes)
    var rightSummary = summarizeLoadoutSelection(players[PLAYER_SIDE.right].towers, players[PLAYER_SIDE.right].boostTypes)
    if(leftSummary.signature == "||" || rightSummary.signature == "||") {
        localMatchCollectionState.contributionStatus = "not-eligible"
        return false
    }
    localMatchCollectionState.recorded = true
    var leftContribution = createLocalHumanDemonstration(PLAYER_SIDE.left, PLAYER_SIDE.right, leftSummary, rightSummary)
    var rightContribution = createLocalHumanDemonstration(PLAYER_SIDE.right, PLAYER_SIDE.left, rightSummary, leftSummary)
    localMatchCollectionState.contributionIds = [leftContribution.contributionId, rightContribution.contributionId]
    var leftQueued = queueAIPublicContribution(leftContribution)
    var rightQueued = queueAIPublicContribution(rightContribution)
    localMatchCollectionState.contributionStatus = leftQueued && rightQueued ? "queued" : "failed"
    return leftQueued && rightQueued
}

function getTowerTotalTier(tower) {
    if(!tower) {
        return 0
    }

    return tower.path1Upgrades + tower.path2Upgrades + tower.path3Upgrades
}

function getCurrentVisibleRound() {
    return Math.max(1, Math.floor(round / 2))
}

function getBaseTowerPriceByType(towerType) {
    return typeof BASE_TOWER_PRICES[towerType] == "number" ? BASE_TOWER_PRICES[towerType] : 100
}

function getAIFarmMoneyOutputValue(tower) {
    if(!tower || tower.towerType != "farm") {
        return tower && tower.cashGenerated || 0
    }

    return Math.max(0, tower.cashGenerated) + Math.max(0, tower.towerVar || 0)
}

function getFarmerServicedFarmCount(tower) {
    if(!tower || tower.towerType != "farmer") {
        return 0
    }

    var farms = getSideTowersByType(tower.playerSide, "farm")
    var count = 0
    for(var i = 0; i < farms.length; i++) {
        if(Math.sqrt((tower.x - farms[i].x) ** 2 + (tower.y - farms[i].y) ** 2) <= Math.max(90, tower.range - farms[i].range * 0.6)) {
            count++
        }
    }

    return count
}

function getAIFarmPerformanceReward(tower, matchReward) {
    var lifetimeSec = Math.max(8, (gameNow() - (tower.aiPlacedAt || timeGameStarted || gameNow())) / 1000)
    var totalCost = Math.max(getBaseTowerPriceByType("farm"), tower.totalCost || 0)
    var economyValue = getAIFarmMoneyOutputValue(tower)
    var incomeRate = economyValue / lifetimeSec
    var roi = economyValue / Math.max(1, totalCost)
    var normalized = incomeRate / Math.max(14, totalCost * 0.018)
    normalized += roi * 0.9
    normalized += Math.min(0.35, getTowerTotalTier(tower) * 0.05)
    normalized += clamp((Number(matchReward) || 0) * 0.16, -0.2, 0.18)
    if(aiMatchTelemetry) {
        normalized -= Math.min(0.34, aiMatchTelemetry.aiDangerGreedMoments * 0.05)
        normalized -= Math.min(0.24, aiMatchTelemetry.aiUncoveredBananaMoments * 0.04)
        normalized -= Math.min(0.32, aiMatchTelemetry.aiLateFarmMoments * 0.05)
    }
    if(getCurrentVisibleRound() > 12) {
        normalized -= Math.min(0.9, (getCurrentVisibleRound() - 12) * 0.08)
    }

    return clamp(normalized - 0.3, -0.9, 1.5)
}

function getAITowerPerformanceReward(tower, matchReward) {
    if(tower.towerType == "farm") {
        return getAIFarmPerformanceReward(tower, matchReward)
    }

    var lifetimeSec = Math.max(8, (gameNow() - (tower.aiPlacedAt || timeGameStarted || gameNow())) / 1000)
    var totalCost = Math.max(getBaseTowerPriceByType(tower.towerType), tower.totalCost || 0)
    var combatOutput = tower.popCount / lifetimeSec
    var economyOutput = tower.cashGenerated / lifetimeSec
    var baseline = tower.towerType == "farm" || tower.towerType == "farmer" ? 10 : Math.max(6, getTowerHeuristicDps({ towerType: tower.towerType, path1Upgrades: 0, path2Upgrades: 0, path3Upgrades: 0 }) * 0.55)
    var normalized = combatOutput / baseline
    normalized += economyOutput / Math.max(12, totalCost * 0.02)
    normalized += Math.min(0.45, getTowerTotalTier(tower) * 0.04)
    if(tower.towerType == "farmer") {
        normalized += getFarmerServicedFarmCount(tower) * 0.32
    }
    normalized += clamp((Number(matchReward) || 0) * 0.22, -0.32, 0.24)
    if(aiMatchTelemetry && (tower.towerType == "farm" || tower.towerType == "farmer")) {
        normalized -= Math.min(0.32, aiMatchTelemetry.aiDangerGreedMoments * 0.05)
        normalized -= Math.min(0.24, aiMatchTelemetry.aiUncoveredBananaMoments * 0.04)
    }
    if(aiMatchTelemetry && tower.towerType == "farm") {
        normalized -= Math.min(0.28, aiMatchTelemetry.aiLateFarmMoments * 0.05)
    }

    return clamp(normalized - 0.45, -0.65, 1.3)
}

function collectAITowerLearningObservations(matchReward, maximumObservations) {
    var observations = []
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower) {
            continue
        }
        if(tower.playerSide != aiSide) {
            continue
        }

        var reward = getAITowerPerformanceReward(tower, matchReward)
        var placementRole = tower.aiPlacementRole || getStrategyPlacementRoleForTowerType(tower.towerType)
        var placementBucket = tower.aiPlacementBucket || getAIPlacementBucket(tower.playerSide, tower.x, tower.y)
        observations.push(createAIPublicLearningObservation("placementStats", getAIPlacementStatKey(mapNumber, tower.towerType, placementRole, placementBucket), reward))
        if(tower.aiLoadoutKey && tower.aiStrategyId) {
            observations.push(createAIPublicLearningObservation("loadoutPlacementStats", getAILoadoutPlacementStatKey(tower.aiLoadoutKey, tower.aiStrategyId, mapNumber, tower.towerType, placementRole, placementBucket), reward))
            observations.push(createAIPublicLearningObservation("timingStats", getAITimingStatKey(tower.aiLoadoutKey, tower.aiStrategyId, tower.towerType, placementRole, getAIRoundTimingBucket(tower.aiPlacedRound || getCurrentVisibleRound())), reward))
        }

        if(tower.towerType != "farmer" && getTowerTotalTier(tower) > 0) {
            observations.push(createAIPublicLearningObservation("crosspathStats", getAICrosspathStatKey(tower.towerType, getTowerDominantCrosspathContext(tower), getTowerCurrentSignature(tower)), reward))
        }
        if(maximumObservations != null && observations.length >= maximumObservations) {
            return observations.slice(0, maximumObservations)
        }
    }
    return maximumObservations == null ? observations : observations.slice(0, maximumObservations)
}

function updateAITowerLearningFromMatch(matchReward) {
    ensureAILearningLoaded()
    applyAILearningObservations(collectAITowerLearningObservations(matchReward, null))
}

function getAIEarlyDeathPunishment(aiLives, enemyLives) {
    if(aiLives > 0 || enemyLives <= 0) {
        return 0
    }

    var visibleRound = aiMatchTelemetry && aiMatchTelemetry.roundPeak > 0 ? Math.max(1, aiMatchTelemetry.roundPeak) : getCurrentVisibleRound()
    var lateRelief = clamp((visibleRound - 10) / 30, 0, 1)
    return 0.95 - lateRelief * 0.6
}

function getAIMatchReward(aiLives, enemyLives) {
    var result = 0
    if(aiLives > enemyLives) {
        result = 1
    } else if(aiLives < enemyLives) {
        result = -1
    }
    var lifeMargin = clamp((aiLives - enemyLives) / 150, -1, 1)
    return clamp(result * 0.9 + lifeMargin * 0.1, -1, 1)
}

function createAIPublicMatchContribution(aiLives, enemyLives, reward, matchFeatures, selfPlayActive) {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.contributionEnabled == false || !aiMatchTelemetry) {
        return null
    }
    if(selfPlayActive && typeof shouldAITrainingPublishContributions == "function" && shouldAITrainingPublishContributions() == false) {
        return null
    }
    settleAITacticalDecision(aiSide, null, true)
    var observations = []
    function addObservation(store, key, value) {
        if(observations.length < AI_MAX_CONTRIBUTION_OBSERVATIONS) {
            observations.push(createAIPublicLearningObservation(store, key, value))
        }
    }

    if(aiMatchTelemetry.observedLoadoutSummary && aiMatchTelemetry.observedLoadoutSummary.hasAnySelection && aiMatchTelemetry.observedLoadoutSummary.signature != "||") {
        addObservation("loadoutCounterStats", getLoadoutCounterStatKey(aiMatchTelemetry.observedLoadoutSummary.signature, aiMatchTelemetry.strategyIndex), reward)
        if(aiMatchTelemetry.aiLoadoutKey) {
            addObservation("loadoutCounterStats", getAILoadoutSelectionStatKey(aiMatchTelemetry.observedLoadoutSummary.signature, aiMatchTelemetry.aiLoadoutKey), reward)
        }
    }
    if(aiMatchTelemetry.aiLoadoutKey) {
        addObservation("loadoutStrategyStats", getAILoadoutStrategyStatKey(aiMatchTelemetry.aiLoadoutKey, aiMatchTelemetry.strategyIndex), reward)
    }

    var tacticalObservations = collectAITacticalLearningObservations(aiSide, reward, 96)
    for(var tacticalIndex = 0; tacticalIndex < tacticalObservations.length; tacticalIndex++) {
        addObservation(tacticalObservations[tacticalIndex].store, tacticalObservations[tacticalIndex].key, tacticalObservations[tacticalIndex].value)
    }
    var remainingTowerObservations = AI_MAX_CONTRIBUTION_OBSERVATIONS - observations.length
    var towerObservations = collectAITowerLearningObservations(reward, remainingTowerObservations)
    for(var towerIndex = 0; towerIndex < towerObservations.length; towerIndex++) {
        addObservation(towerObservations[towerIndex].store, towerObservations[towerIndex].key, towerObservations[towerIndex].value)
    }

    var decisionSamples = collectAIDecisionSamples(aiSide, reward, AI_MAX_PUBLIC_DECISION_SAMPLES).map(function(sample) {
        return {
            creditVersion: sample.creditVersion,
            familyIndex: sample.familyIndex,
            stateFeatures: sample.stateFeatures,
            chosenCandidateFeatures: sample.chosenCandidateFeatures,
            memoryIn: sample.memoryIn,
            startedAtMs: sample.startedAtMs,
            settledAtMs: sample.settledAtMs,
            intervalReward: sample.intervalReward,
            successorStateFeatures: sample.successorStateFeatures,
            successorMemory: sample.successorMemory,
            terminal: sample.terminal,
        }
    })
    var placementSamples = collectAIPlacementSamples(AI_MAX_PUBLIC_PLACEMENT_SAMPLES).map(function(sample) {
        return {
            creditVersion: sample.creditVersion,
            familyIndex: sample.familyIndex,
            stateFeatures: sample.stateFeatures,
            chosenCandidateFeatures: sample.chosenCandidateFeatures,
            memoryIn: sample.memoryIn,
            startedAtMs: sample.startedAtMs,
            settledAtMs: sample.settledAtMs,
            intervalReward: sample.intervalReward,
        }
    })
    var contribution = {
        protocolVersion: 1,
        contributionId: createAIContributionId(),
        baseRevision: Math.max(0, Math.floor(aiPersistenceState.revision)),
        contributionEpoch: Math.max(1, Math.floor(aiMatchTelemetry.contributionEpoch)),
        strategyIndex: aiMatchTelemetry.strategyIndex,
        selectionFeatures: aiMatchTelemetry.selectionFeatures.slice(0, AI_FEATURE_KEYS.length).map(function(value) { return clamp(Number(value) || 0, 0, 1) }),
        matchFeatures: selfPlayActive ? null : matchFeatures.slice(0, AI_FEATURE_KEYS.length).map(function(value) { return clamp(Number(value) || 0, 0, 1) }),
        aiLives: aiLives,
        enemyLives: enemyLives,
        loadoutKey: aiMatchTelemetry.aiLoadoutKey || "",
        observations: observations,
        decisionSamples: decisionSamples,
        placementSamples: placementSamples,
        selfPlay: selfPlayActive,
    }
    while(getAIUTF8ByteLength(JSON.stringify(contribution)) > AI_MAX_PUBLIC_CONTRIBUTION_BYTES && contribution.observations.length > 0) contribution.observations.pop()
    while(getAIUTF8ByteLength(JSON.stringify(contribution)) > AI_MAX_PUBLIC_CONTRIBUTION_BYTES && contribution.decisionSamples.length > 0) contribution.decisionSamples.pop()
    while(getAIUTF8ByteLength(JSON.stringify(contribution)) > AI_MAX_PUBLIC_CONTRIBUTION_BYTES && contribution.placementSamples.length > 0) contribution.placementSamples.pop()
    return getAIUTF8ByteLength(JSON.stringify(contribution)) <= AI_MAX_PUBLIC_CONTRIBUTION_BYTES ? contribution : null
}

function finalizeAIMatchLearning() {
    if(aiEnabled == false || !aiMatchTelemetry || aiMatchTelemetry.recorded) {
        return
    }

    aiMatchTelemetry.recorded = true
    ensureAILearningLoaded()
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        aiPersistenceState.backend = "session only"
    }

    var aiLives = players[aiSide].lives == Infinity ? 150 : Math.max(0, players[aiSide].lives)
    var enemySide = aiSide == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var enemyLives = players[enemySide].lives == Infinity ? 150 : Math.max(0, players[enemySide].lives)
    var reward = getAIMatchReward(aiLives, enemyLives)
    var selfPlayActive = typeof isAITrainingTrueSelfPlayActive == "function" && isAITrainingTrueSelfPlayActive()
    var learningAllowed = selfPlayActive == false || aiProfile.learningEnabled
    if(learningAllowed == false) {
        aiProfile.tacticalTrace = []
        aiProfile.pendingTacticalDecision = null
        aiProfile.placementOutcomes = {}
        aiProfile.placementSamples = []
        return
    }
    finalizeAIPlacementOutcomesForSide(aiSide)
    var matchFeatures = computeMatchFeatureVector()
    var publicContribution = createAIPublicMatchContribution(aiLives, enemyLives, reward, matchFeatures, selfPlayActive)
    trainAIPolicy(aiMatchTelemetry.selectionFeatures, aiMatchTelemetry.strategyIndex, reward, aiLearning.policy)
    if(selfPlayActive == false) {
        updatePlayerProfileFeatures(matchFeatures)
    }
    trainAIDecisionsFromMatch(aiSide, reward)
    finalizeAITacticalLearning(aiSide, reward)
    updateAITowerLearningFromMatch(reward)
    if(aiMatchTelemetry.observedLoadoutSummary && aiMatchTelemetry.observedLoadoutSummary.hasAnySelection && aiMatchTelemetry.observedLoadoutSummary.signature != "||") {
        updateAILearningScore(aiLearning.loadoutCounterStats, getLoadoutCounterStatKey(aiMatchTelemetry.observedLoadoutSummary.signature, aiMatchTelemetry.strategyIndex), reward)
        if(aiMatchTelemetry.aiLoadoutKey) {
            updateAILearningScore(aiLearning.loadoutCounterStats, getAILoadoutSelectionStatKey(aiMatchTelemetry.observedLoadoutSummary.signature, aiMatchTelemetry.aiLoadoutKey), reward)
        }
    }
    if(aiMatchTelemetry.aiLoadoutKey) {
        updateAILearningScore(aiLearning.loadoutStrategyStats, getAILoadoutStrategyStatKey(aiMatchTelemetry.aiLoadoutKey, aiMatchTelemetry.strategyIndex), reward)
    }

    var stats = aiLearning.strategyStats[aiMatchTelemetry.strategyIndex]
    stats.games++
    stats.lastReward = reward
    if(aiLives > enemyLives) {
        stats.wins++
    } else if(aiLives < enemyLives) {
        stats.losses++
    } else {
        stats.ties++
    }
    if(aiMatchTelemetry.aiLoadoutKey) {
        var loadoutStats = getAILoadoutStatsRecord(aiMatchTelemetry.aiLoadoutKey)
        loadoutStats.games++
        loadoutStats.lastReward = reward
        if(aiLives > enemyLives) {
            loadoutStats.wins++
        } else if(aiLives < enemyLives) {
            loadoutStats.losses++
        } else {
            loadoutStats.ties++
        }
        aiLearning.totalLoadoutSamples++
    }
    aiLearning.totalGames++
    aiLearning.totalPolicySamples++
    if(publicContribution) {
        aiMatchTelemetry.contributionId = publicContribution.contributionId
        aiMatchTelemetry.contributionStatus = queueAIPublicContribution(publicContribution) ? "queued" : "failed"
    } else {
        aiMatchTelemetry.contributionStatus = AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.contributionEnabled == false ? "unavailable" : "not-eligible"
    }
}

function getCompletedMatchAIContributionStatus() {
    if(typeof aiTrainingState != "undefined" && aiTrainingState && aiTrainingState.trueSelfPlayActive && typeof aiContextsBySide != "undefined" && aiContextsBySide) {
        var candidateContext = aiContextsBySide[aiTrainingState.candidateSide]
        if(candidateContext && candidateContext.aiMatchTelemetry) {
            return candidateContext.aiMatchTelemetry.contributionStatus || "not-eligible"
        }
    }
    if(aiEnabled && aiMatchTelemetry) {
        return aiMatchTelemetry.contributionStatus || "not-eligible"
    }
    if(selectedMenuMode == "local" && localMatchCollectionState) {
        return localMatchCollectionState.contributionStatus || "not-eligible"
    }
    return "not-eligible"
}

function getCompletedMatchAIRematchMessage() {
    var status = getCompletedMatchAIContributionStatus()
    if(status == "queued") {
        return "Refresh after the global AI contribution finishes syncing..."
    }
    if(status == "accepted") {
        return "Refresh to rematch! Global AI contribution accepted."
    }
    if(status == "unavailable" || status == "failed") {
        return "Refresh to rematch! Global AI sync was unavailable."
    }
    if(status == "discarded") {
        return "Refresh to rematch! This contribution expired after an AI reset."
    }
    return "Refresh to rematch! No global AI contribution was recorded."
}

function getFrontMenuButtons() {
    var buttons = []
    if(frontMenuState == "mode") {
        var buttonWidth = canvas.width / 4
        var buttonHeight = canvas.height / 12
        var buttonX = canvas.width / 2 - buttonWidth / 2
        var gap = canvas.height / 30
        var startY = canvas.height / 2 - (buttonHeight * 6 + gap * 5) / 2

        buttons.push({ id: "local", x: buttonX, y: startY, width: buttonWidth, height: buttonHeight, label: "Local" })
        buttons.push({ id: "multiplayer", x: buttonX, y: startY + buttonHeight + gap, width: buttonWidth, height: buttonHeight, label: "Multiplayer" })
        buttons.push({ id: "classic", x: buttonX, y: startY + (buttonHeight + gap) * 2, width: buttonWidth, height: buttonHeight, label: "Classic" })
        buttons.push({ id: "vs-ai", x: buttonX, y: startY + (buttonHeight + gap) * 3, width: buttonWidth, height: buttonHeight, label: "Vs AI" })
        buttons.push({ id: "ai-stats", x: buttonX, y: startY + (buttonHeight + gap) * 4, width: buttonWidth, height: buttonHeight, label: "AI Stats" })
        buttons.push({ id: "ai-lab", x: buttonX, y: startY + (buttonHeight + gap) * 5, width: buttonWidth, height: buttonHeight, label: "AI Training Lab" })
        return buttons
    }

    if(frontMenuState == "side") {
        var sideButtonWidth = canvas.width / 5
        var sideButtonHeight = canvas.height / 9
        var sideY = canvas.height / 2
        buttons.push({ id: "side-left", x: canvas.width / 2 - sideButtonWidth - canvas.width / 40, y: sideY, width: sideButtonWidth, height: sideButtonHeight, label: "Play Left" })
        buttons.push({ id: "side-right", x: canvas.width / 2 + canvas.width / 40, y: sideY, width: sideButtonWidth, height: sideButtonHeight, label: "Play Right" })
        buttons.push({ id: "back", x: canvas.width / 2 - sideButtonWidth / 2, y: sideY + sideButtonHeight + canvas.height / 24, width: sideButtonWidth, height: sideButtonHeight * 0.8, label: "Back" })
    } else if(frontMenuState == "stats") {
        var statsButtonWidth = canvas.width / 6.8
        var statsButtonHeight = canvas.height / 12
        var statsButtonGap = canvas.width / 55
        buttons.push({ id: "ai-refresh", x: canvas.width / 2 - statsButtonWidth - statsButtonGap / 2, y: canvas.height * 0.91, width: statsButtonWidth, height: statsButtonHeight * 0.9, label: aiPersistenceState.loadInFlight ? "Refreshing..." : "Refresh Stats" })
        buttons.push({ id: "back", x: canvas.width / 2 + statsButtonGap / 2, y: canvas.height * 0.91, width: statsButtonWidth, height: statsButtonHeight * 0.9, label: "Back" })
    }

    return buttons
}

function frontMenuButtonAt(x, y) {
    var buttons = getFrontMenuButtons()
    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i]
        if(x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
            return button
        }
    }

    return null
}

function handleFrontMenuClick(x, y) {
    var button = frontMenuButtonAt(x, y)
    if(!button) {
        return false
    }
    if(isFrontMenuButtonDisabled(button)) {
        return true
    }

    if(button.id == "local") {
        startLocalGameSetup()
    } else if(button.id == "multiplayer") {
        multiplayerMenuMessageUntil = realNow() + 1800
    } else if(button.id == "classic") {
        window.location.href = "classic/index.html"
    } else if(button.id == "vs-ai") {
        frontMenuState = "side"
    } else if(button.id == "ai-stats") {
        ensureAILearningLoaded()
        refreshAILearningFromBackend(true)
        refreshAITrainerStatus(true)
        frontMenuState = "stats"
    } else if(button.id == "ai-refresh") {
        refreshAILearningFromBackend(true)
        refreshAITrainerStatus(true)
    } else if(button.id == "ai-lab" && typeof openAITrainingDashboard == "function") {
        openAITrainingDashboard()
    } else if(button.id == "side-left") {
        startVsAIGameSetup(PLAYER_SIDE.left)
    } else if(button.id == "side-right") {
        startVsAIGameSetup(PLAYER_SIDE.right)
    } else if(button.id == "back") {
        frontMenuState = "mode"
    }

    return true
}

function drawFrontMenuButton(button, fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.strokeStyle = "black"
    ctx.lineWidth = 6
    ctx.fillRect(button.x, button.y, button.width, button.height)
    ctx.strokeRect(button.x, button.y, button.width, button.height)
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.font = Math.round(button.height * 0.42) + "px Luckiest Guy"
    ctx.textAlign = "center"
    ctx.strokeText(button.label, button.x + button.width / 2, button.y + button.height * 0.64, button.width * 0.9)
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height * 0.64, button.width * 0.9)
}

function getStrategyDisplayName(strategy) {
    return strategy.id.replace(/_/g, " ").replace(/\b\w/g, function(letter) {
        return letter.toUpperCase()
    })
}

function getAIRuntimeModeLabel() {
    return AI_IS_LOCAL_RUNTIME ? "Local runtime" : "Hosted runtime"
}

function aiTrainerStatusHasExactKeys(value, keys) {
    if(!value || typeof value != "object" || Array.isArray(value)) {
        return false
    }
    var actual = Object.keys(value).sort()
    var expected = keys.slice().sort()
    return actual.length == expected.length && actual.every(function(key, index) { return key == expected[index] })
}

function isAITrainerStatusInteger(value, minimum) {
    return Number.isSafeInteger(value) && value >= minimum
}

function isAITrainerStatusDigest(value) {
    return typeof value == "string" && /^sha256:[0-9a-f]{64}$/.test(value)
}

function isAITrainerStatusTimestamp(value) {
    return typeof value == "string" && value.length <= 32 && Number.isFinite(Date.parse(value))
}

function normalizeAITrainerStatusCounts(value, keys) {
    if(aiTrainerStatusHasExactKeys(value, keys) == false) {
        return null
    }
    var normalized = {}
    for(var i = 0; i < keys.length; i++) {
        if(isAITrainerStatusInteger(value[keys[i]], 0) == false || keys[i] != "total" && value[keys[i]] > value.total) {
            return null
        }
        normalized[keys[i]] = value[keys[i]]
    }
    return normalized
}

function normalizeAITrainerStatusProjection(value) {
    if(value === null) {
        return null
    }
    if(aiTrainerStatusHasExactKeys(value, ["jobs", "workers"]) == false || aiTrainerStatusHasExactKeys(value.workers, ["training", "evaluation"]) == false) {
        return null
    }
    var jobKeys = ["total", "queued", "inProgress", "completed", "succeeded", "failed", "cancelled", "skipped"]
    var workerKeys = ["total", "queued", "inProgress", "succeeded", "failed", "cancelled", "skipped"]
    var jobs = normalizeAITrainerStatusCounts(value.jobs, jobKeys)
    var training = normalizeAITrainerStatusCounts(value.workers.training, workerKeys)
    var evaluation = normalizeAITrainerStatusCounts(value.workers.evaluation, workerKeys)
    return jobs && training && evaluation ? { jobs: jobs, workers: { training: training, evaluation: evaluation } } : null
}

function normalizeAITrainerStatusCurrent(value) {
    var keys = ["runId", "runNumber", "runAttempt", "state", "conclusion", "headSha", "url", "createdAt", "startedAt", "updatedAt", "phase", "projection"]
    if(aiTrainerStatusHasExactKeys(value, keys) == false
        || isAITrainerStatusInteger(value.runId, 1) == false
        || isAITrainerStatusInteger(value.runNumber, 1) == false
        || isAITrainerStatusInteger(value.runAttempt, 1) == false
        || ["requested", "in_progress", "completed"].includes(value.state) == false
        || typeof value.headSha != "string" || /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(value.headSha) == false
        || value.url != "https://github.com/The-Double-G/btdb-js/actions/runs/" + value.runId
        || isAITrainerStatusTimestamp(value.createdAt) == false
        || value.startedAt !== null && isAITrainerStatusTimestamp(value.startedAt) == false
        || isAITrainerStatusTimestamp(value.updatedAt) == false
        || ["queued", "running", "preparing", "training", "selecting", "evaluating", "reporting", "promoting", "finalizing", "continuing", "completed"].includes(value.phase) == false) {
        return null
    }
    if(value.state == "completed") {
        if(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required", "stale", "startup_failure"].includes(value.conclusion) == false || value.phase != "completed") {
            return null
        }
    } else if(value.conclusion !== null) {
        return null
    }
    var projection = normalizeAITrainerStatusProjection(value.projection)
    if(value.projection !== null && projection === null) {
        return null
    }
    return Object.assign({}, value, { projection: projection })
}

function normalizeAITrainerStatusEvaluation(value) {
    var legacyKeys = ["runId", "runNumber", "runAttempt", "aggregateId", "candidateCheckpointId", "baselineCheckpointId", "passed", "games", "wins", "losses", "ties", "score", "minimumScore", "minimumGames", "minimumBucketScore", "worstBucketScore", "survivalRate", "minimumSurvivalRate", "severeCollapseRate", "maximumSevereCollapseRate"]
    var currentKeys = legacyKeys.concat(["defensiveGames", "defensiveProtectedGames", "defensiveProtectionRate", "minimumDefensiveRate", "minimumDefensiveLives", "minimumDefensiveFloorLives", "minimumDefensiveObservedLives"])
    if(value === null) {
        return null
    }
    var current = Object.prototype.hasOwnProperty.call(value, "defensiveGames")
    if(aiTrainerStatusHasExactKeys(value, current ? currentKeys : legacyKeys) == false
        || isAITrainerStatusInteger(value.runId, 1) == false
        || isAITrainerStatusInteger(value.runNumber, 1) == false
        || isAITrainerStatusInteger(value.runAttempt, 1) == false
        || isAITrainerStatusDigest(value.aggregateId) == false
        || isAITrainerStatusDigest(value.candidateCheckpointId) == false
        || isAITrainerStatusDigest(value.baselineCheckpointId) == false
        || typeof value.passed != "boolean"
        || [value.games, value.wins, value.losses, value.ties].some(function(number) { return isAITrainerStatusInteger(number, 0) == false })
        || value.games != value.wins + value.losses + value.ties
        || Number.isFinite(value.score) == false || value.score < 0 || value.score > 1
        || Number.isFinite(value.minimumScore) == false || value.minimumScore < 0 || value.minimumScore > 1
        || [value.minimumBucketScore, value.worstBucketScore, value.survivalRate, value.minimumSurvivalRate, value.severeCollapseRate, value.maximumSevereCollapseRate].some(function(number) { return Number.isFinite(number) == false || number < 0 || number > 1 })
        || isAITrainerStatusInteger(value.minimumGames, 1) == false) {
        return null
    }
    if(current && (
        [value.defensiveGames, value.defensiveProtectedGames].some(function(number) { return isAITrainerStatusInteger(number, 0) == false })
        || value.defensiveProtectedGames > value.defensiveGames
        || value.defensiveGames > value.games
        || [value.defensiveProtectionRate, value.minimumDefensiveRate].some(function(number) { return Number.isFinite(number) == false || number < 0 || number > 1 })
        || [value.minimumDefensiveLives, value.minimumDefensiveFloorLives].some(function(number) { return isAITrainerStatusInteger(number, 0) == false })
        || Number.isFinite(value.minimumDefensiveObservedLives) == false || value.minimumDefensiveObservedLives < 0
        || Math.abs(value.defensiveProtectionRate - (value.defensiveGames ? value.defensiveProtectedGames / value.defensiveGames : 0)) > 1e-12
    )) {
        return null
    }
    return Object.assign({}, value)
}

function normalizeAITrainerStatusPromotion(value) {
    var keys = ["runId", "runNumber", "runAttempt", "snapshotId", "promotionId", "duplicate", "revision", "modelDigest", "contributionEpoch", "championGeneration", "promotedPolicyDigest", "candidatePolicyPreserved"]
    if(value === null) {
        return null
    }
    if(aiTrainerStatusHasExactKeys(value, keys) == false
        || isAITrainerStatusInteger(value.runId, 1) == false
        || isAITrainerStatusInteger(value.runNumber, 1) == false
        || isAITrainerStatusInteger(value.runAttempt, 1) == false
        || [value.snapshotId, value.promotionId, value.modelDigest, value.promotedPolicyDigest].some(function(digestValue) { return isAITrainerStatusDigest(digestValue) == false })
        || typeof value.duplicate != "boolean"
        || isAITrainerStatusInteger(value.revision, 0) == false
        || isAITrainerStatusInteger(value.contributionEpoch, 1) == false
        || isAITrainerStatusInteger(value.championGeneration, 0) == false
        || typeof value.candidatePolicyPreserved != "boolean") {
        return null
    }
    return Object.assign({}, value)
}

function compareAITrainerStatusRuns(left, right) {
    return left.runNumber != right.runNumber ? left.runNumber - right.runNumber : left.runAttempt - right.runAttempt
}

function normalizeAITrainerStatus(value) {
    var keys = ["kind", "formatVersion", "repository", "branch", "publishedAt", "current", "latestEvaluation", "latestPromotion"]
    if(aiTrainerStatusHasExactKeys(value, keys) == false
        || value.kind != "btdb-ai-training-status"
        || value.formatVersion != 1
        || value.repository != "The-Double-G/btdb-js"
        || value.branch != "main"
        || isAITrainerStatusTimestamp(value.publishedAt) == false) {
        return null
    }
    var current = normalizeAITrainerStatusCurrent(value.current)
    var latestEvaluation = normalizeAITrainerStatusEvaluation(value.latestEvaluation)
    var latestPromotion = normalizeAITrainerStatusPromotion(value.latestPromotion)
    if(!current || value.latestEvaluation !== null && !latestEvaluation || value.latestPromotion !== null && !latestPromotion) {
        return null
    }
    if(latestEvaluation && compareAITrainerStatusRuns(latestEvaluation, current) > 0) {
        return null
    }
    if(latestPromotion && (!latestEvaluation || compareAITrainerStatusRuns(latestPromotion, latestEvaluation) > 0 || compareAITrainerStatusRuns(latestPromotion, latestEvaluation) == 0 && latestPromotion.promotionId != latestEvaluation.candidateCheckpointId)) {
        return null
    }
    return {
        kind: value.kind,
        formatVersion: value.formatVersion,
        repository: value.repository,
        branch: value.branch,
        publishedAt: value.publishedAt,
        current: current,
        latestEvaluation: latestEvaluation,
        latestPromotion: latestPromotion,
    }
}

function getAITrainerLiveJobsURL(current) {
    return AI_TRAINING_JOBS_ENDPOINT + current.runId + "/attempts/" + current.runAttempt + "/jobs?per_page=100"
}

function getAITrainerJobKind(name) {
    var normalized = name.toLowerCase()
    if(/^prepare(?:\s|\(|$)/.test(normalized)) return "prepare"
    if(/^train(?:\s|\(|$)/.test(normalized)) return "train"
    if(/^select(?:\s|\(|$)/.test(normalized)) return "select"
    if(/^evaluate(?:\s|\(|$)/.test(normalized)) return "evaluate"
    if(/^report(?:\s|\(|$)/.test(normalized)) return "report"
    if(/^promote(?:\s|\(|$)/.test(normalized) || /^publish-hosted(?:\s|\(|$)/.test(normalized)) return "promote"
    if(/^finalize-promotion(?:\s|\(|$)/.test(normalized)) return "finalize"
    if(/^continue(?:\s|\(|$)/.test(normalized) || /^handoff-continuous-training(?:\s|\(|$)/.test(normalized)) return "continue"
    return "unknown"
}

function createAITrainerJobCounts(includeCompleted) {
    var counts = { total: 0, queued: 0, inProgress: 0, succeeded: 0, failed: 0, cancelled: 0, skipped: 0 }
    if(includeCompleted) counts.completed = 0
    return counts
}

function addAITrainerJobCount(counts, job, includeCompleted) {
    counts.total++
    if(job.status == "in_progress") counts.inProgress++
    else if(job.status == "completed" && includeCompleted) counts.completed++
    else if(job.status != "completed") counts.queued++
    if(job.conclusion == "success") counts.succeeded++
    else if(["failure", "timed_out", "action_required", "stale", "startup_failure"].includes(job.conclusion)) counts.failed++
    else if(job.conclusion == "cancelled") counts.cancelled++
    else if(job.conclusion == "skipped") counts.skipped++
}

function projectAITrainerLiveJobs(value, current) {
    if(!value || typeof value != "object" || Array.isArray(value)
        || isAITrainerStatusInteger(value.total_count, 0) == false
        || !Array.isArray(value.jobs)
        || value.total_count != value.jobs.length
        || value.jobs.length > 100) {
        throw new Error("Live trainer jobs response is invalid")
    }
    var conclusions = [null, "success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required", "stale", "startup_failure"]
    var statuses = ["queued", "in_progress", "completed", "waiting", "pending", "requested"]
    var jobs = []
    for(var i = 0; i < value.jobs.length; i++) {
        var job = value.jobs[i]
        if(!job || typeof job != "object" || Array.isArray(job)
            || typeof job.name != "string" || job.name.length == 0 || job.name.length > 256
            || statuses.includes(job.status) == false
            || conclusions.includes(job.conclusion) == false
            || job.status != "completed" && job.conclusion !== null
            || job.run_id !== current.runId
            || job.run_attempt !== current.runAttempt) {
            throw new Error("Live trainer job does not match the published run")
        }
        jobs.push({ name: job.name, status: job.status, conclusion: job.conclusion })
    }

    var jobCounts = createAITrainerJobCounts(true)
    var training = createAITrainerJobCounts(false)
    var evaluation = createAITrainerJobCounts(false)
    for(var jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
        var currentJob = jobs[jobIndex]
        var kind = getAITrainerJobKind(currentJob.name)
        addAITrainerJobCount(jobCounts, currentJob, true)
        if(kind == "train") addAITrainerJobCount(training, currentJob, false)
        if(kind == "evaluate") addAITrainerJobCount(evaluation, currentJob, false)
    }

    var phase = current.state == "requested" ? "queued" : "running"
    if(current.state == "requested" && jobs.length == 0) {
        phase = "queued"
    } else {
        var ranks = { unknown: 0, prepare: 1, train: 2, select: 3, evaluate: 4, report: 5, promote: 6, finalize: 7, continue: 8 }
        var phases = { unknown: "running", prepare: "preparing", train: "training", select: "selecting", evaluate: "evaluating", report: "reporting", promote: "promoting", finalize: "finalizing", continue: "continuing" }
        var candidates = jobs.filter(function(job) { return job.status == "in_progress" })
        var preferHigherRank = true
        if(candidates.length == 0) {
            candidates = jobs.filter(function(job) { return job.status != "completed" })
            preferHigherRank = false
        }
        if(candidates.length == 0) candidates = jobs.filter(function(job) { return job.status == "completed" })
        if(candidates.length > 0) {
            var selected = candidates[0]
            for(var candidateIndex = 1; candidateIndex < candidates.length; candidateIndex++) {
                var selectedRank = ranks[getAITrainerJobKind(selected.name)]
                var candidateRank = ranks[getAITrainerJobKind(candidates[candidateIndex].name)]
                if(preferHigherRank ? candidateRank > selectedRank : candidateRank < selectedRank) selected = candidates[candidateIndex]
            }
            phase = phases[getAITrainerJobKind(selected.name)]
        }
    }
    var projection = { jobs: jobCounts, workers: { training: training, evaluation: evaluation } }
    if(normalizeAITrainerStatusProjection(projection) == null) {
        throw new Error("Live trainer jobs projection is invalid")
    }
    return { phase: phase, projection: projection }
}

async function fetchAITrainerJSON(url, maximumBytes, controller) {
    var response = await fetch(url, {
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        referrerPolicy: "no-referrer",
        signal: controller ? controller.signal : undefined,
    })
    if(!response.ok) {
        throw new Error("Trainer status returned HTTP " + response.status)
    }
    var body = await response.text()
    var size = typeof TextEncoder == "function" ? new TextEncoder().encode(body).byteLength : body.length
    if(size > maximumBytes) {
        throw new Error("Trainer status response is too large")
    }
    return JSON.parse(body)
}

async function refreshAITrainerStatus(force) {
    if(AI_IS_LOCAL_RUNTIME) {
        return false
    }
    if(aiTrainerStatusRefreshPromise) {
        return aiTrainerStatusRefreshPromise
    }
    if(force != true && aiTrainerStatusState.lastLoadedAt > 0 && realNow() - aiTrainerStatusState.lastLoadedAt < AI_TRAINING_STATUS_REFRESH_INTERVAL) {
        return true
    }
    aiTrainerStatusState.loadInFlight = true
    var controller = typeof AbortController == "function" ? new AbortController() : null
    var timeout = controller ? setTimeout(function() { controller.abort() }, 8000) : null
    aiTrainerStatusRefreshPromise = (async function() {
        try {
            var normalized = normalizeAITrainerStatus(await fetchAITrainerJSON(AI_TRAINING_STATUS_ENDPOINT + "?t=" + nativeDateNow(), AI_TRAINING_STATUS_MAX_BYTES, controller))
            if(!normalized) {
                throw new Error("Trainer status response is invalid")
            }
            if(aiTrainerStatusState.status && compareAITrainerStatusRuns(normalized.current, aiTrainerStatusState.status.current) < 0) {
                throw new Error("Trainer status response is stale")
            }
            aiTrainerStatusState.liveRunId = 0
            aiTrainerStatusState.liveRunAttempt = 0
            aiTrainerStatusState.liveUpdatedAt = 0
            aiTrainerStatusState.liveError = ""
            if(normalized.current.state != "completed") {
                try {
                    var liveProjection = projectAITrainerLiveJobs(await fetchAITrainerJSON(getAITrainerLiveJobsURL(normalized.current), AI_TRAINING_JOBS_MAX_BYTES, controller), normalized.current)
                    normalized.current = Object.assign({}, normalized.current, liveProjection)
                    aiTrainerStatusState.liveRunId = normalized.current.runId
                    aiTrainerStatusState.liveRunAttempt = normalized.current.runAttempt
                    aiTrainerStatusState.liveUpdatedAt = realNow()
                } catch(liveError) {
                    aiTrainerStatusState.liveError = liveError && liveError.message ? liveError.message : "Live trainer progress unavailable"
                }
            }
            aiTrainerStatusState.status = normalized
            aiTrainerStatusState.lastLoadedAt = realNow()
            aiTrainerStatusState.lastError = ""
            return true
        } catch(error) {
            aiTrainerStatusState.lastError = error && error.message ? error.message : "Trainer status unavailable"
            return false
        } finally {
            if(timeout) {
                clearTimeout(timeout)
            }
            aiTrainerStatusState.loadInFlight = false
            aiTrainerStatusRefreshPromise = null
        }
    })()
    return aiTrainerStatusRefreshPromise
}

function formatAITrainerStatusAge(timestamp) {
    var ageSeconds = Math.max(0, Math.floor((realNow() - timestamp) / 1000))
    if(ageSeconds < 60) return "now"
    if(ageSeconds < 3600) return Math.floor(ageSeconds / 60) + "m"
    if(ageSeconds < 86400) return Math.floor(ageSeconds / 3600) + "h"
    return Math.floor(ageSeconds / 86400) + "d"
}

function getAITrainerProgressMetric(status) {
    var current = status.current
    var publishedAge = formatAITrainerStatusAge(Date.parse(status.publishedAt))
    if(aiTrainerStatusState.loadInFlight) return { label: "Progress", value: "Refreshing · " + publishedAge, color: "#f7c76d" }
    if(aiTrainerStatusState.lastError) return { label: "Progress", value: "Cached · " + publishedAge, color: "#ff9f8f" }
    if(current.state != "completed" && aiTrainerStatusState.liveRunId == current.runId && aiTrainerStatusState.liveRunAttempt == current.runAttempt && aiTrainerStatusState.liveUpdatedAt > 0) {
        return { label: "Progress", value: "Live · " + formatAITrainerStatusAge(aiTrainerStatusState.liveUpdatedAt), color: "#7fe0a2" }
    }
    if(current.state != "completed" && aiTrainerStatusState.liveError) return { label: "Progress", value: "Fallback · " + publishedAge, color: "#f7c76d" }
    return { label: "Progress", value: "Published · " + publishedAge, color: "#8f9bb5" }
}

function getAITrainerStatusMetrics() {
    var status = aiTrainerStatusState.status
    if(!status) {
        var unavailableLabel = AI_IS_LOCAL_RUNTIME ? "Offline" : aiTrainerStatusState.loadInFlight ? "Loading" : "Unavailable"
        return [
            { label: "GitHub Trainer", value: unavailableLabel, color: "#8f9bb5" },
            { label: "Run", value: "--", color: "#8f9bb5" },
            { label: "Workers", value: "--", color: "#8f9bb5" },
            { label: "Frozen Eval", value: "Pending", color: "#8f9bb5" },
            { label: "Promotion", value: "None", color: "#8f9bb5" },
            { label: "Progress", value: AI_IS_LOCAL_RUNTIME ? "Offline" : "No data", color: "#8f9bb5" },
        ]
    }
    var current = status.current
    var stateLabel = (current.state == "completed" ? current.conclusion : current.phase).replace(/_/g, " ").replace(/\b\w/g, function(letter) { return letter.toUpperCase() })
    var stateColor = current.state != "completed" ? "#62c5ff" : current.conclusion == "success" ? "#7fe0a2" : current.conclusion == "cancelled" || current.conclusion == "skipped" ? "#f7c76d" : "#ff9f8f"
    var workerValue = "Pending"
    if(current.projection) {
        var useEvaluation = ["evaluating", "reporting", "promoting", "finalizing"].includes(current.phase)
        var workers = useEvaluation ? current.projection.workers.evaluation : current.projection.workers.training
        workerValue = (workers.succeeded + workers.failed + workers.cancelled + workers.skipped) + "/" + workers.total
        if(workers.inProgress > 0) {
            workerValue += " (" + workers.inProgress + " live)"
        }
    }
    var evaluationValue = status.latestEvaluation ? Math.round(status.latestEvaluation.score * 1000) / 10 + "% / S" + Math.round(status.latestEvaluation.survivalRate * 1000) / 10 + "% / " + status.latestEvaluation.games : "Pending"
    if(status.latestEvaluation && status.latestEvaluation.defensiveProtectionRate != null) {
        evaluationValue += " / D" + Math.round(status.latestEvaluation.defensiveProtectionRate * 1000) / 10 + "%@" + status.latestEvaluation.minimumDefensiveLives
    }
    var evaluationColor = !status.latestEvaluation ? "#8f9bb5" : status.latestEvaluation.passed ? "#7fe0a2" : "#ff9f8f"
    var promotionValue = status.latestPromotion ? "Champion v" + status.latestPromotion.championGeneration : status.latestEvaluation && status.latestEvaluation.passed ? "Pending" : "None"
    var promotionColor = status.latestPromotion ? "#7fe0a2" : status.latestEvaluation && status.latestEvaluation.passed ? "#f7c76d" : "#8f9bb5"
    return [
        { label: "GitHub Trainer", value: stateLabel, color: stateColor },
        { label: "Run", value: "#" + current.runNumber + " · " + current.phase, color: "#b698ff" },
        { label: "Workers", value: workerValue, color: "#7bd8d4" },
        { label: "Frozen Eval", value: evaluationValue, color: evaluationColor },
        { label: "Promotion", value: promotionValue, color: promotionColor },
        getAITrainerProgressMetric(status),
    ]
}

function getAIStatsSourceDescription() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        return "Session 26,440-parameter semantic-intent-spatial actor-critic: local learning is discarded when this browser session closes."
    }
    if(aiPersistenceState.loadInFlight) {
        return "Hosted Model: refreshing authoritative statistics from the backend."
    }
    if(aiPersistenceState.lastError) {
        return "Hosted Model unavailable: showing the latest valid model loaded in this tab."
    }
    if(aiPersistenceState.contributionEnabled) {
        return "Hosted 26,440-parameter semantic-intent-spatial actor-critic: bounded contributions, human tactical priors, and verified self-play."
    }
    return "Hosted Model: read-only statistics from the authoritative backend."
}

function getAIStatsFreshnessLabel() {
    if(!aiPersistenceState.updatedAt) {
        return aiPersistenceState.lastLoadedAt > 0 ? "Loaded this session" : "Not loaded"
    }
    var updatedTime = Date.parse(aiPersistenceState.updatedAt)
    if(Number.isFinite(updatedTime) == false) {
        return "Updated " + aiPersistenceState.updatedAt
    }
    var ageMinutes = Math.max(0, Math.floor((realNow() - updatedTime) / 60000))
    if(ageMinutes < 1) {
        return "Updated less than a minute ago"
    }
    if(ageMinutes < 60) {
        return "Updated " + ageMinutes + " minute" + (ageMinutes == 1 ? "" : "s") + " ago"
    }
    var ageHours = Math.floor(ageMinutes / 60)
    return "Updated " + ageHours + " hour" + (ageHours == 1 ? "" : "s") + " ago"
}

function getAIStatsOverviewMetrics() {
    return [
        { label: "Hosted Champion", value: "v" + aiLearning.championGeneration },
        { label: "Match Perspectives", value: aiLearning.totalGames.toLocaleString() },
        { label: "Human Demos", value: aiLearning.totalHumanDemonstrations.toLocaleString() },
        { label: "Decision Samples", value: aiLearning.totalDecisionSamples.toLocaleString() },
        { label: "Loadout Samples", value: aiLearning.totalLoadoutSamples.toLocaleString() },
        { label: "Counter Records", value: Object.keys(aiLearning.loadoutCounterStats).length.toLocaleString() },
    ]
}

function getTopStrategyIndicesForStats(limit) {
    var indices = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        if(aiLearning.strategyStats[i].games > 0) {
            indices.push(i)
        }
    }

    indices.sort(function(a, b) {
        var statsA = aiLearning.strategyStats[a]
        var statsB = aiLearning.strategyStats[b]
        if(statsB.games != statsA.games) {
            return statsB.games - statsA.games
        }
        if(statsB.wins != statsA.wins) {
            return statsB.wins - statsA.wins
        }
        return statsB.lastReward - statsA.lastReward
    })

    return indices.slice(0, limit)
}

function drawAIStatsCard(x, y, width, height, title, accentColor) {
    ctx.fillStyle = "rgba(22, 27, 47, 0.88)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)"
    ctx.lineWidth = 3
    ctx.fillRect(x, y, width, height)
    ctx.strokeRect(x, y, width, height)

    ctx.fillStyle = accentColor
    ctx.fillRect(x, y, width, 6)

    ctx.textAlign = "left"
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 5
    ctx.font = "20px Luckiest Guy"
    ctx.strokeText(title, x + width * 0.05, y + 30, width * 0.9)
    ctx.fillText(title, x + width * 0.05, y + 30, width * 0.9)
}

function drawAIStatsMetricCell(x, y, width, height, label, value, accentColor) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
    ctx.lineWidth = 2
    ctx.fillRect(x, y, width, height)
    ctx.strokeRect(x, y, width, height)

    ctx.fillStyle = accentColor
    ctx.fillRect(x, y, 5, height)

    ctx.textAlign = "right"
    ctx.fillStyle = "rgba(196, 210, 241, 0.92)"
    ctx.font = "12px Arial"
    ctx.fillText(label, x + width - 10, y + 16, width - 20)

    ctx.textAlign = "left"
    ctx.fillStyle = "white"
    ctx.font = "bold 22px Arial"
    ctx.fillText(String(value), x + 14, y + height - 13, width - 24)
}

function drawAIStatsFeatureBar(x, y, width, label, value, accentColor) {
    var clampedValue = clamp(value, 0, 1)
    var trackY = y + 16
    var trackHeight = 10

    ctx.textAlign = "left"
    ctx.font = "12px Arial"
    ctx.fillStyle = "rgba(220, 228, 244, 0.92)"
    ctx.fillText(label, x, y + 10, width * 0.72)

    ctx.textAlign = "right"
    ctx.fillStyle = accentColor
    ctx.fillText(Math.round(clampedValue * 100) + "%", x + width, y + 10, width * 0.24)

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    ctx.fillRect(x, trackY, width, trackHeight)
    ctx.fillStyle = accentColor
    ctx.fillRect(x, trackY, width * clampedValue, trackHeight)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
    ctx.lineWidth = 1
    ctx.strokeRect(x, trackY, width, trackHeight)
}

function drawAIStatsScreen() {
    ensureAILearningLoaded()

    var panelX = canvas.width * 0.08
    var panelY = canvas.height * 0.09
    var panelWidth = canvas.width * 0.84
    var panelHeight = canvas.height * 0.78
    var panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight)
    panelGradient.addColorStop(0, "rgba(11, 16, 34, 0.9)")
    panelGradient.addColorStop(1, "rgba(22, 30, 58, 0.92)")
    ctx.fillStyle = panelGradient
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)"
    ctx.lineWidth = 5
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

    ctx.fillStyle = "rgba(111, 194, 255, 0.15)"
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight * 0.12)

    ctx.textAlign = "center"
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 7
    ctx.font = "36px Luckiest Guy"
    ctx.strokeText("AI Stats", canvas.width / 2, panelY + panelHeight * 0.085, panelWidth * 0.45)
    ctx.fillText("AI Stats", canvas.width / 2, panelY + panelHeight * 0.085, panelWidth * 0.45)

    ctx.font = "15px Arial"
    ctx.fillStyle = "rgba(214, 228, 255, 0.86)"
    ctx.fillText(getAIStatsSourceDescription(), canvas.width / 2, panelY + panelHeight * 0.125, panelWidth * 0.78)

    var innerPadding = panelWidth * 0.03
    var footerHeight = panelHeight * 0.12
    var contentTop = panelY + panelHeight * 0.16
    var contentBottom = panelY + panelHeight - footerHeight
    var contentHeight = contentBottom - contentTop
    var leftWidth = panelWidth * 0.32
    var contentGap = panelWidth * 0.022
    var rightWidth = panelWidth - innerPadding * 2 - leftWidth - contentGap
    var leftX = panelX + innerPadding
    var rightX = leftX + leftWidth + contentGap
    var topSectionHeight = contentHeight * 0.55
    var featureHeight = contentHeight - topSectionHeight - contentGap
    var overviewY = contentTop
    var featureY = overviewY + topSectionHeight + contentGap
    var rightY = contentTop

    drawAIStatsCard(leftX, overviewY, leftWidth, topSectionHeight, "Overview", "rgba(94, 197, 255, 0.92)")
    drawAIStatsCard(leftX, featureY, panelWidth - innerPadding * 2, featureHeight, AI_CROSS_MATCH_LEARNING_ENABLED ? "Hosted Player Profile" : "Session Player Profile", "rgba(110, 220, 168, 0.92)")
    drawAIStatsCard(rightX, rightY, rightWidth, topSectionHeight, "Top Archetype Records", "rgba(255, 189, 92, 0.92)")

    var infoX = leftX + leftWidth * 0.05
    var infoY = overviewY + 54
    ctx.textAlign = "left"
    ctx.font = "13px Arial"
    ctx.fillStyle = "rgba(214, 226, 255, 0.92)"
    ctx.fillText("Source: " + (AI_CROSS_MATCH_LEARNING_ENABLED ? "Hosted Model rev " + aiPersistenceState.revision + " / epoch " + aiPersistenceState.contributionEpoch : "Session model"), infoX, infoY, leftWidth * 0.9)
    ctx.fillText("Save backend: " + aiPersistenceState.backend, infoX, infoY + 18, leftWidth * 0.9)
    var syncSummary = AI_CROSS_MATCH_LEARNING_ENABLED ? getAIStatsFreshnessLabel() : "Learning: Session only"
    if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.lastError) {
        syncSummary = "Sync: issue detected"
    } else if(AI_CROSS_MATCH_LEARNING_ENABLED && (aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight)) {
        syncSummary = "Sync: sending AI contribution"
    } else if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.loadInFlight) {
        syncSummary = "Sync: loading AI data"
    } else if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.pendingContributions > 0) {
        syncSummary = "Sync: " + aiPersistenceState.pendingContributions + " contribution" + (aiPersistenceState.pendingContributions == 1 ? "" : "s") + " queued"
    }
    ctx.fillText(syncSummary, infoX, infoY + 36, leftWidth * 0.9)

    var metricCellWidth = leftWidth * 0.41
    var metricGapX = leftWidth * 0.05
    var metricGapY = 8
    var metricStartY = overviewY + 94
    var metricHeight = 38
    var metricColors = ["#62c5ff", "#7fe0a2", "#f7c76d", "#f08ba7", "#b698ff", "#7bd8d4"]
    var metrics = getAIStatsOverviewMetrics()
    for(var metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
        var metricColumn = metricIndex % 2
        var metricRow = Math.floor(metricIndex / 2)
        drawAIStatsMetricCell(leftX + leftWidth * 0.05 + metricColumn * (metricCellWidth + metricGapX), metricStartY + metricRow * (metricHeight + metricGapY), metricCellWidth, metricHeight, metrics[metricIndex].label, metrics[metricIndex].value, metricColors[metricIndex % metricColors.length])
    }

    var featurePalette = ["#62c5ff", "#7fe0a2", "#f7c76d", "#f08ba7", "#b698ff", "#7bd8d4"]
    var featureColumns = 4
    var featureCardWidth = panelWidth - innerPadding * 2
    var featureInnerWidth = featureCardWidth * 0.92
    var featureColumnGap = featureCardWidth * 0.02
    var featureColumnWidth = (featureInnerWidth - featureColumnGap * (featureColumns - 1)) / featureColumns
    var featureBaseX = leftX + featureCardWidth * 0.04
    var featureBaseY = featureY + 44
    var featureRows = Math.ceil(AI_FEATURE_KEYS.length / featureColumns)
    var featureRowHeight = clamp((featureHeight - 58) / Math.max(1, featureRows), 18, 24)
    for(var featureIndex = 0; featureIndex < AI_FEATURE_KEYS.length; featureIndex++) {
        var featureColumn = Math.floor(featureIndex / featureRows)
        var featureRow = featureIndex % featureRows
        var featureKey = AI_FEATURE_KEYS[featureIndex]
        drawAIStatsFeatureBar(featureBaseX + featureColumn * (featureColumnWidth + featureColumnGap), featureBaseY + featureRow * featureRowHeight, featureColumnWidth, AI_FEATURE_LABELS[featureKey], aiLearning.playerProfile.features[featureIndex], featurePalette[featureIndex % featurePalette.length])
    }

    var strategyListX = rightX + rightWidth * 0.04
    var strategyListY = rightY + 50
    var strategyListWidth = rightWidth * 0.92
    var strategyRowSpacing = 40
    var topStrategyLimit = clamp(Math.floor((topSectionHeight - 56) / strategyRowSpacing), 4, 6)
    var topStrategyIndices = getTopStrategyIndicesForStats(topStrategyLimit)
    if(topStrategyIndices.length == 0) {
        ctx.textAlign = "center"
        ctx.font = "14px Arial"
        ctx.fillStyle = "rgba(214, 226, 255, 0.78)"
        ctx.fillText("No community match perspectives recorded yet.", rightX + rightWidth / 2, strategyListY + 30, rightWidth * 0.82)
    }
    for(var strategyRow = 0; strategyRow < topStrategyIndices.length; strategyRow++) {
        var strategyIndex = topStrategyIndices[strategyRow]
        var strategy = AI_STRATEGY_LIBRARY[strategyIndex]
        var stats = aiLearning.strategyStats[strategyIndex]
        var evaluationScore = stats.games > 0 ? (stats.wins + stats.ties * 0.5) / stats.games : 0
        var rowY = strategyListY + strategyRow * strategyRowSpacing
        var rowHeight = 34
        var rewardColor = stats.lastReward >= 0 ? "#87f0ad" : "#ff9f8f"

        ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
        ctx.lineWidth = 2
        ctx.fillRect(strategyListX, rowY, strategyListWidth, rowHeight)
        ctx.strokeRect(strategyListX, rowY, strategyListWidth, rowHeight)

        ctx.fillStyle = "rgba(98, 197, 255, 0.18)"
        ctx.fillRect(strategyListX, rowY, 40, rowHeight)
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.font = "16px Luckiest Guy"
        ctx.fillText(String(strategyRow + 1), strategyListX + 20, rowY + 23, 28)

        ctx.textAlign = "left"
        ctx.font = "bold 15px Arial"
        ctx.fillText(getStrategyDisplayName(strategy), strategyListX + 52, rowY + 15, strategyListWidth * 0.5)
        ctx.font = "11px Arial"
        ctx.fillStyle = "rgba(214, 226, 255, 0.8)"
        ctx.fillText("W " + stats.wins + "  L " + stats.losses + "  T " + stats.ties + "  G " + stats.games, strategyListX + 52, rowY + 28, strategyListWidth * 0.45)

        var barX = strategyListX + strategyListWidth * 0.58
        var barWidth = strategyListWidth * 0.2
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
        ctx.fillRect(barX, rowY + 8, barWidth, 8)
        ctx.fillStyle = "#7fe0a2"
        ctx.fillRect(barX, rowY + 8, barWidth * evaluationScore, 8)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
        ctx.strokeRect(barX, rowY + 8, barWidth, 8)
        ctx.textAlign = "center"
        ctx.font = "11px Arial"
        ctx.fillStyle = "rgba(214, 226, 255, 0.84)"
        ctx.fillText("Score " + Math.round(evaluationScore * 100) + "%", barX + barWidth / 2, rowY + 28, barWidth)

        var badgeX = strategyListX + strategyListWidth * 0.82
        var badgeWidth = strategyListWidth * 0.14
        ctx.fillStyle = rewardColor
        ctx.fillRect(badgeX, rowY + 6, badgeWidth, 20)
        ctx.fillStyle = "#102030"
        ctx.font = "bold 11px Arial"
        ctx.fillText((stats.lastReward >= 0 ? "+" : "") + stats.lastReward.toFixed(2), badgeX + badgeWidth / 2, rowY + 20, badgeWidth * 0.9)
    }

    var trainerMetrics = getAITrainerStatusMetrics()
    var trainerGap = panelWidth * 0.012
    var trainerWidth = (panelWidth - innerPadding * 2 - trainerGap * (trainerMetrics.length - 1)) / trainerMetrics.length
    var trainerY = panelY + panelHeight - 52
    for(var trainerIndex = 0; trainerIndex < trainerMetrics.length; trainerIndex++) {
        drawAIStatsMetricCell(panelX + innerPadding + trainerIndex * (trainerWidth + trainerGap), trainerY, trainerWidth, 40, trainerMetrics[trainerIndex].label, trainerMetrics[trainerIndex].value, trainerMetrics[trainerIndex].color)
    }
}

function drawFrontMenu() {
    ctx.fillStyle = "#355f2a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawAsset(frontMenuBackgroundAsset, 0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(18, 22, 52, 0.12)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if(frontMenuState == "stats") {
        drawAIStatsScreen()
        var statsButtons = getFrontMenuButtons()
        for(var statsButtonIndex = 0; statsButtonIndex < statsButtons.length; statsButtonIndex++) {
            var statsFill = "rgba(58, 120, 139, 0.92)"
        if(statsButtons[statsButtonIndex].id == "back") {
            statsFill = "rgba(143, 77, 62, 0.92)"
        } else if(statsButtons[statsButtonIndex].id == "ai-refresh") {
            statsFill = "rgba(61, 139, 104, 0.92)"
        }
        if(isFrontMenuButtonDisabled(statsButtons[statsButtonIndex])) {
            statsFill = "rgba(78, 78, 90, 0.92)"
            }
            drawFrontMenuButton(statsButtons[statsButtonIndex], statsFill)
        }
        return
    }

    var buttons = getFrontMenuButtons()
    var panelMinX = canvas.width
    var panelMinY = canvas.height
    var panelMaxX = 0
    var panelMaxY = 0
    for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
        panelMinX = Math.min(panelMinX, buttons[buttonIndex].x)
        panelMinY = Math.min(panelMinY, buttons[buttonIndex].y)
        panelMaxX = Math.max(panelMaxX, buttons[buttonIndex].x + buttons[buttonIndex].width)
        panelMaxY = Math.max(panelMaxY, buttons[buttonIndex].y + buttons[buttonIndex].height)
    }

    var panelPaddingX = canvas.width / 40
    var panelPaddingTop = canvas.height / 12
    var panelPaddingBottom = canvas.height / 28
    ctx.fillStyle = "rgba(18, 16, 28, 0.5)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"
    ctx.lineWidth = 5
    ctx.fillRect(panelMinX - panelPaddingX, panelMinY - panelPaddingTop, panelMaxX - panelMinX + panelPaddingX * 2, panelMaxY - panelMinY + panelPaddingTop + panelPaddingBottom)
    ctx.strokeRect(panelMinX - panelPaddingX, panelMinY - panelPaddingTop, panelMaxX - panelMinX + panelPaddingX * 2, panelMaxY - panelMinY + panelPaddingTop + panelPaddingBottom)

    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 8
    ctx.textAlign = "center"
    ctx.font = "30px Luckiest Guy"
    if(frontMenuState == "mode") {
        ctx.strokeText("Choose a mode", canvas.width / 2, panelMinY - canvas.height / 28, canvas.width * 0.6)
        ctx.fillText("Choose a mode", canvas.width / 2, panelMinY - canvas.height / 28, canvas.width * 0.6)
    } else {
        ctx.strokeText("Choose your side", canvas.width / 2, panelMinY - canvas.height / 28, canvas.width * 0.6)
        ctx.fillText("Choose your side", canvas.width / 2, panelMinY - canvas.height / 28, canvas.width * 0.6)
    }

    for(var i = 0; i < buttons.length; i++) {
        var fillStyle = "rgba(61, 139, 64, 0.9)"
        if(buttons[i].id == "multiplayer") {
            fillStyle = "rgba(95, 123, 159, 0.92)"
        } else if(buttons[i].id == "classic") {
            fillStyle = "rgba(154, 102, 52, 0.92)"
        } else if(buttons[i].id == "vs-ai") {
            fillStyle = "rgba(123, 75, 159, 0.92)"
        } else if(buttons[i].id == "ai-stats") {
            fillStyle = "rgba(58, 120, 139, 0.92)"
        } else if(buttons[i].id == "ai-lab") {
            fillStyle = "rgba(62, 111, 166, 0.92)"
        } else if(buttons[i].id == "back") {
            fillStyle = "rgba(143, 77, 62, 0.92)"
        }
        if(isFrontMenuButtonDisabled(buttons[i])) {
            fillStyle = "rgba(78, 78, 90, 0.92)"
        }
        drawFrontMenuButton(buttons[i], fillStyle)
    }

    if(multiplayerMenuMessageUntil > realNow()) {
        ctx.font = "24px Luckiest Guy"
        ctx.strokeText("Multiplayer coming later", canvas.width / 2, canvas.height * 0.88, canvas.width * 0.7)
        ctx.fillText("Multiplayer coming later", canvas.width / 2, canvas.height * 0.88, canvas.width * 0.7)
    }
}

function isUIItemOnSide(item, side) {
    if(side == PLAYER_SIDE.left) {
        return item.x < canvas.width / 2
    }

    return item.x > canvas.width / 2
}

function findAIPregameItem(side, collection, image) {
    for(var i = 0; i < collection.length; i++) {
        if(collection[i].image == image && isUIItemOnSide(collection[i], side)) {
            return collection[i]
        }
    }

    return null
}

function updateAILoadoutFilled() {
    if(aiProfile.loadoutPlanReady == false) {
        aiProfile.loadoutFilled = false
        return
    }

    aiProfile.loadoutFilled = players[aiSide].towers.length == aiDesiredLoadoutTowers.length && players[aiSide].boostTypes.length == aiDesiredLoadoutBoosts.length
}

function ensureAIPregameLoadoutPlanReady() {
    if(aiProfile.loadoutPlanReady) {
        return true
    }

    updateAIPregameObservePauseState()

    var observedLoadoutSummary = getObservedOpponentLoadoutSummary(humanSide)
    if(observedLoadoutSummary.hasAnySelection) {
        aiProfile.loadoutObservedAny = true
    }

    if(realNow() < aiProfile.loadoutObserveUntil) {
        return false
    }

    prepareAIStrategyForMatch(aiProfile.loadoutObservedAny ? observedLoadoutSummary : null)
    return true
}

function runAIPregameSelection(side) {
    if(aiProfile.currentAction) {
        return
    }

    if(ensureAIPregameLoadoutPlanReady() == false) {
        return
    }

    updateAILoadoutFilled()
    if(aiProfile.loadoutFilled) {
        return
    }

    if(players[side].towers.length < aiDesiredLoadoutTowers.length) {
        var nextTowerImage = aiDesiredLoadoutTowers[players[side].towers.length]
        var nextTowerItem = findAIPregameItem(side, UITowers, nextTowerImage)
        if(nextTowerItem) {
            setAIAction({
                type: "selectPregameItem",
                side: side,
                targetX: nextTowerItem.x,
                targetY: nextTowerItem.y,
                priority: AI_ACTION_PRIORITY.high,
                interruptible: false,
            })
        }
        return
    }

    if(players[side].boostTypes.length < aiDesiredLoadoutBoosts.length) {
        var nextBoostImage = aiDesiredLoadoutBoosts[players[side].boostTypes.length]
        var nextBoostItem = findAIPregameItem(side, UIBoosts, nextBoostImage)
        if(nextBoostItem) {
            setAIAction({
                type: "selectPregameItem",
                side: side,
                targetX: nextBoostItem.x,
                targetY: nextBoostItem.y,
                priority: AI_ACTION_PRIORITY.high,
                interruptible: false,
            })
        }
    }
}

function getSideBounds(side, radius) {
    if(side == PLAYER_SIDE.left) {
        return {
            minX: canvas.width / 8 + radius,
            maxX: canvas.width / 2 - radius,
            minY: radius,
            maxY: canvas.height - radius,
        }
    }

    return {
        minX: canvas.width / 2 + radius,
        maxX: 7 * canvas.width / 8 - radius,
        minY: radius,
        maxY: canvas.height - radius,
    }
}

var aiPathPointCache = {
    mapNumber: -1,
    pathCount: -1,
    left: [],
    right: [],
}

function getAISidePathPoints(side) {
    if(aiPathPointCache.mapNumber != mapNumber || aiPathPointCache.pathCount != pathObjects.length) {
        aiPathPointCache.mapNumber = mapNumber
        aiPathPointCache.pathCount = pathObjects.length
        aiPathPointCache.left = []
        aiPathPointCache.right = []
        for(var i = 0; i < pathObjects.length; i++) {
            if(pathObjects[i].x <= canvas.width / 2) {
                aiPathPointCache.left.push(pathObjects[i])
            }
            if(pathObjects[i].x >= canvas.width / 2) {
                aiPathPointCache.right.push(pathObjects[i])
            }
        }
    }

    return side == PLAYER_SIDE.left ? aiPathPointCache.left : aiPathPointCache.right
}

function getSideTrackDistance(side, x, y) {
    var sidePathPoints = getAISidePathPoints(side)
    var bestDistance = Infinity
    for(var i = 0; i < sidePathPoints.length; i++) {
        var dx = x - sidePathPoints[i].x
        var dy = y - sidePathPoints[i].y
        var distanceToTrack = Math.sqrt(dx * dx + dy * dy)
        if(distanceToTrack < bestDistance) {
            bestDistance = distanceToTrack
        }
    }

    return bestDistance
}

function getSidePathObjectCount(side) {
    return getAISidePathPoints(side).length
}

function getTowerTrackProgress(tower) {
    if(!tower || tower.closestPathObject == -1 || tower.range == Infinity || tower.towerType == "sniper" || tower.towerType == "mortar") {
        return 0.5
    }

    var localIndex = 0
    var total = 0
    for(var i = 0; i < pathObjects.length; i++) {
        if(tower.playerSide == PLAYER_SIDE.left && pathObjects[i].x > canvas.width / 2) {
            continue
        }
        if(tower.playerSide == PLAYER_SIDE.right && pathObjects[i].x < canvas.width / 2) {
            continue
        }

        if(i == tower.closestPathObject) {
            localIndex = total
        }
        total++
    }

    if(total <= 1) {
        return 0.5
    }

    return localIndex / (total - 1)
}

function getAIPlacementBucket(side, x, y) {
    var bounds = getSideBounds(side, 0)
    var width = Math.max(1, bounds.maxX - bounds.minX)
    var height = Math.max(1, bounds.maxY - bounds.minY)
    var xProgress = clamp((x - bounds.minX) / width, 0, 1)
    if(side == PLAYER_SIDE.right) xProgress = 1 - xProgress
    return {
        x: clamp(Math.floor(xProgress * AI_PLACEMENT_GRID_X), 0, AI_PLACEMENT_GRID_X - 1),
        y: clamp(Math.floor(((y - bounds.minY) / height) * AI_PLACEMENT_GRID_Y), 0, AI_PLACEMENT_GRID_Y - 1),
    }
}

function getPlacementCoverageStats(side, x, y, range) {
    var sidePathPoints = getAISidePathPoints(side)
    var sidePathCount = sidePathPoints.length
    var stats = {
        coverageCount: 0,
        earlyCount: 0,
        midCount: 0,
        lateCount: 0,
        averageProgress: 0.5,
        span: 0,
        nearestTrackDistance: Infinity,
        longestRun: 0,
        straightRun: 0,
        lineAimScore: 0,
    }

    if(sidePathCount <= 0) {
        stats.nearestTrackDistance = 0
        return stats
    }

    var coverageRange = range == Infinity ? Infinity : range + 18
    var analysisRange = range == Infinity ? 220 : Math.min(260, range + 60)
    var weightedProgress = 0
    var minCoveredIndex = -1
    var maxCoveredIndex = -1
    var longestCoveredRun = 0
    var longestStraightRun = 0
    var currentCoveredRun = 0
    var currentStraightRun = 0
    var previousDirection = null
    var previousLocallyCovered = false
    for(var i = 0; i < sidePathPoints.length; i++) {
        var dx = x - sidePathPoints[i].x
        var dy = y - sidePathPoints[i].y
        var distance = Math.sqrt(dx * dx + dy * dy)
        var progress = sidePathCount <= 1 ? 0.5 : i / (sidePathCount - 1)
        if(distance < stats.nearestTrackDistance) {
            stats.nearestTrackDistance = distance
        }

        if(distance <= coverageRange) {
            stats.coverageCount++
            weightedProgress += progress
            if(progress <= 0.33) {
                stats.earlyCount++
            } else if(progress <= 0.66) {
                stats.midCount++
            } else {
                stats.lateCount++
            }
            if(minCoveredIndex == -1) {
                minCoveredIndex = i
            }
            maxCoveredIndex = i
        }

        if(distance <= analysisRange + 18) {
            currentCoveredRun++
            longestCoveredRun = Math.max(longestCoveredRun, currentCoveredRun)

            var prevPoint = sidePathPoints[Math.max(0, i - 1)]
            var nextPoint = sidePathPoints[Math.min(sidePathCount - 1, i + 1)]
            var directionX = nextPoint.x - prevPoint.x
            var directionY = nextPoint.y - prevPoint.y
            var directionLen = Math.sqrt(directionX * directionX + directionY * directionY)
            if(directionLen > 0) {
                directionX /= directionLen
                directionY /= directionLen
                if(distance > 1) {
                    var aimX = sidePathPoints[i].x - x
                    var aimY = sidePathPoints[i].y - y
                    var aimLen = Math.sqrt(aimX * aimX + aimY * aimY)
                    if(aimLen > 0) {
                        aimX /= aimLen
                        aimY /= aimLen
                        stats.lineAimScore = Math.max(stats.lineAimScore, Math.abs(directionX * aimX + directionY * aimY))
                    }
                }
                if(previousLocallyCovered && currentStraightRun > 0 && previousDirection) {
                    var directionDot = directionX * previousDirection.x + directionY * previousDirection.y
                    currentStraightRun = directionDot >= 0.94 ? currentStraightRun + 1 : 1
                } else {
                    currentStraightRun = 1
                }
                previousDirection = { x: directionX, y: directionY }
            } else {
                currentStraightRun = 1
                previousDirection = null
            }
            longestStraightRun = Math.max(longestStraightRun, currentStraightRun)
            previousLocallyCovered = true
        } else {
            currentCoveredRun = 0
            currentStraightRun = 0
            previousDirection = null
            previousLocallyCovered = false
        }
    }

    if(stats.coverageCount > 0) {
        stats.averageProgress = weightedProgress / stats.coverageCount
    }
    if(minCoveredIndex != -1 && sidePathCount > 1) {
        stats.span = (maxCoveredIndex - minCoveredIndex) / (sidePathCount - 1)
    }
    stats.longestRun = sidePathCount > 0 ? longestCoveredRun / sidePathCount : 0
    stats.straightRun = sidePathCount > 0 ? longestStraightRun / sidePathCount : 0
    if(stats.nearestTrackDistance == Infinity) {
        stats.nearestTrackDistance = 0
    }

    return stats
}

function findAIFarmerSpot(side) {
    return findAISpot(side, 30, 250, "farmer", getSideTowersByType(side, "farmer").length, "farmer")
}

function getAISpotScore(side, x, y, radius, range, role, offsetIndex, towerType, matchup) {
    ensureAILearningLoaded()
    var bucket = getAIPlacementBucket(side, x, y)
    var learningKey = getAIPlacementStatKey(mapNumber, towerType, role, bucket)
    var score = getAILearningScore(aiLearning.placementStats, learningKey) * 48
    var loadoutKey = getCurrentAILoadoutKey()
    var strategyId = getCurrentAIStrategyId()
    if(loadoutKey && strategyId) {
        score += getAILearningScore(aiLearning.loadoutPlacementStats, getAILoadoutPlacementStatKey(loadoutKey, strategyId, mapNumber, towerType, role, bucket)) * 58
    }

    return score
}

function findAISpot(side, radius, range, role, offsetIndex, towerType) {
    var bounds = getSideBounds(side, radius)
    var step = role == "farm" || role == "farmer" ? 28 : 32
    var matchup = role == "farm" || role == "farmer" ? null : getCurrentPlayerMatchupStyle(side)
    var candidates = []
    for(var y = bounds.minY; y <= bounds.maxY; y += step) {
        for(var x = bounds.minX; x <= bounds.maxX; x += step) {
            if(canPlaceTowerAt(side, x, y, radius) == false) {
                continue
            }
            candidates.push({
                x: x,
                y: y,
            })
        }
    }

    if(candidates.length == 0) {
        return null
    }

    var stateFeatures = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.placement, matchup)
    var bestCandidate = null
    for(var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
        var candidate = candidates[candidateIndex]
        candidate.decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
            id: [mapNumber, towerType, role, Math.round(candidate.x), Math.round(candidate.y)].join("|"),
            type: towerType,
            role: role,
            actionKey: "place|" + towerType + "|" + role,
            cost: towerType == "farmer" ? baseFarmerPrice : getBaseTowerPriceByType(towerType),
            money: Math.max(1, players[side].money),
            x: candidate.x,
            y: candidate.y,
            placementGeometry: true,
            range: range,
            index: candidateIndex,
            maxIndex: Math.max(1, candidates.length - 1),
        }, matchup, stateFeatures)
        if(!bestCandidate || isAIDecisionScoreBetter(candidate.decision, bestCandidate.decision)) bestCandidate = candidate
    }
    return { x: bestCandidate.x, y: bestCandidate.y, decisionSample: bestCandidate.decision }
}

function tagAITowerPlacement(tower, role) {
    tower.aiPlacementRole = role || getStrategyPlacementRoleForTowerType(tower.towerType)
    tower.aiPlacementBucket = getAIPlacementBucket(tower.playerSide, tower.x, tower.y)
    tower.aiPlacedAt = gameNow()
    tower.aiPlacedRound = getCurrentVisibleRound()
    tower.aiLoadoutKey = getCurrentAILoadoutKey()
    tower.aiStrategyId = getCurrentAIStrategyId()
    tower.aiCrosspathContexts = tower.aiCrosspathContexts || {}
    if(gameStarted && tower.playerSide == aiSide) {
        noteAITowerCrosspathContext(tower, getCurrentPlayerMatchupStyle(tower.playerSide))
    }
}

function aiPlaceTower(side, slotIndex, x, y, role) {
    var towerImage = players[side].towers[slotIndex]
    var towerConfig = LOADOUT_TOWER_CONFIG[towerImage]
    if(!towerConfig) {
        return null
    }

    var towerPrice = towerConfig.price()
    if(canPlaceTowerAt(side, x, y, towerConfig.radius) == false || players[side].money < towerPrice) {
        return null
    }
    towers.push(new Tower(x, y, towerConfig.radius, towerConfig.range, towerConfig.towerType, side))
    players[side].money -= towerPrice
    towers[towers.length - 1].totalCost += towerPrice
    tagAITowerPlacement(towers[towers.length - 1], role)
    return towers[towers.length - 1]
}

function aiPlaceTowerInRole(side, slotIndex, role, spotIndex) {
    var towerImage = players[side].towers[slotIndex]
    var towerConfig = LOADOUT_TOWER_CONFIG[towerImage]
    if(!towerConfig) {
        return null
    }

    var spot = findAISpot(side, towerConfig.radius, towerConfig.range, role, spotIndex || 0, towerConfig.towerType)
    if(!spot) {
        return null
    }

    return aiPlaceTower(side, slotIndex, spot.x, spot.y, role)
}

function aiPlaceFarmer(side, x, y) {
    if(players[side].money < baseFarmerPrice || canPlaceTowerAt(side, x, y, 30) == false) {
        return null
    }

    towers.push(new Tower(x, y, 30, 250, "farmer", side))
    players[side].money -= baseFarmerPrice
    towers[towers.length - 1].totalCost = baseFarmerPrice
    tagAITowerPlacement(towers[towers.length - 1], "farmer")
    return towers[towers.length - 1]
}

function getAITowerSellValueEstimate(tower) {
    if(typeof getTowerSellValue == "function") {
        return getTowerSellValue(tower)
    }

    if(!tower) {
        return 0
    }

    var totalCost = Math.max(getBaseTowerPriceByType(tower.towerType), tower.totalCost || 0)
    if(tower.towerType == "farm" && tower.path3Upgrades >= 2) {
        return Math.round(totalCost * 0.8)
    }
    return Math.round(totalCost * 0.7)
}

function getSideTowersByType(side, towerType) {
    var sideTowers = []
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side && towers[i].towerType == towerType) {
            sideTowers.push(towers[i])
        }
    }
    return sideTowers
}

function getTowerTypeFromImage(image) {
    var towerConfig = LOADOUT_TOWER_CONFIG[image]
    return towerConfig ? towerConfig.towerType : ""
}

function getSideTowersByImage(side, image) {
    return getSideTowersByType(side, getTowerTypeFromImage(image))
}

function getStrategyPlacementRoleForImage(image) {
    var towerType = getTowerTypeFromImage(image)
    if(towerType == "farm") return "farm"
    if(towerType == "farmer") return "farmer"
    return "tower"
}

function getStrategyPlacementRoleForTowerType(towerType) {
    if(towerType == "farmer") {
        return "farmer"
    }
    if(towerType == "farm") {
        return "farm"
    }

    return "tower"
}

function getSideTowerCountExcluding(side, excludedTypes) {
    var count = 0
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide != side) {
            continue
        }
        var excluded = false
        for(var j = 0; j < excludedTypes.length; j++) {
            if(towers[i].towerType == excludedTypes[j]) {
                excluded = true
                break
            }
        }
        if(excluded == false) {
            count++
        }
    }

    return count
}

function updateAITowerDamageRates() {
    var now = gameNow()
    var seenTowerIds = {}
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        seenTowerIds[tower.towerID] = true
        if(!aiTowerDpsCache[tower.towerID]) {
            aiTowerDpsCache[tower.towerID] = {
                lastSeenAt: now,
                lastPopCount: tower.popCount,
                recentDps: 0,
            }
            continue
        }

        var sample = aiTowerDpsCache[tower.towerID]
        if(now <= sample.lastSeenAt) {
            continue
        }
        var elapsedSec = Math.max(0.001, (now - sample.lastSeenAt) / 1000)
        var deltaPop = Math.max(0, tower.popCount - sample.lastPopCount)
        var instantDps = deltaPop / elapsedSec
        sample.recentDps = sample.recentDps * 0.55 + instantDps * 0.45
        sample.lastSeenAt = now
        sample.lastPopCount = tower.popCount
    }

    for(var towerId in aiTowerDpsCache) {
        if(seenTowerIds[towerId] == false) {
            delete aiTowerDpsCache[towerId]
        }
    }
}

function getTowerObservedDps(tower) {
    return aiTowerDpsCache[tower.towerID] ? aiTowerDpsCache[tower.towerID].recentDps : 0
}

function getTowerHeuristicDps(tower) {
    var baseDps = 0
    if(tower.towerType == "dart") {
        baseDps = 8
    } else if(tower.towerType == "tack") {
        baseDps = 15
    } else if(tower.towerType == "bomb") {
        baseDps = 18
    } else if(tower.towerType == "ice") {
        baseDps = 7
    } else if(tower.towerType == "super") {
        baseDps = 36
    } else if(tower.towerType == "wizard") {
        baseDps = 16
    } else if(tower.towerType == "cobra") {
        baseDps = 5
    } else if(tower.towerType == "boomer") {
        baseDps = 14
    } else if(tower.towerType == "sniper") {
        baseDps = 14
    } else if(tower.towerType == "engi") {
        baseDps = 15
    } else if(tower.towerType == "buccaneer") {
        baseDps = 18
    } else if(tower.towerType == "mortar") {
        baseDps = 16
    } else if(tower.towerType == "dartling") {
        baseDps = 22
    } else if(tower.towerType == "ninja") {
        baseDps = 15
    } else if(tower.towerType == "sword") {
        baseDps = 18
    }

    if(baseDps == 0) {
        return 0
    }

    baseDps *= 1 + tower.path1Upgrades * 0.26 + tower.path2Upgrades * 0.24 + tower.path3Upgrades * 0.22
    if(tower.towerType == "wizard") {
        baseDps += tower.path1Upgrades * 2 + tower.path2Upgrades * 2 + tower.path3Upgrades * 2.5
        if(tower.path3Upgrades >= 2) {
            baseDps += 10
        }
        if(tower.path1Upgrades >= 3) {
            baseDps += 8
        }
    } else if(tower.towerType == "bomb") {
        baseDps += tower.path1Upgrades * 2.5 + tower.path2Upgrades * 3 + tower.path3Upgrades * 3.5
        if(tower.path2Upgrades >= 2) {
            baseDps += 8
        }
        if(tower.path3Upgrades >= 1) {
            baseDps += 4
        }
    } else if(tower.towerType == "mortar") {
        baseDps += tower.path1Upgrades * 2.5 + tower.path2Upgrades * 3 + tower.path3Upgrades * 2
        if(tower.path2Upgrades >= 3) {
            baseDps += 10
        }
    } else if(tower.towerType == "dartling") {
        baseDps += tower.path1Upgrades * 3 + tower.path2Upgrades * 3 + tower.path3Upgrades * 2.5
        if(tower.path1Upgrades >= 3 || tower.path2Upgrades >= 3) {
            baseDps += 12
        }
    } else if(tower.towerType == "sniper") {
        baseDps += tower.path1Upgrades * 3 + tower.path2Upgrades * 2 + tower.path3Upgrades * 1.5
    } else if(tower.towerType == "ninja") {
        baseDps += tower.path1Upgrades * 2.5 + tower.path2Upgrades * 2 + tower.path3Upgrades * 2.5
    } else if(tower.towerType == "engi") {
        baseDps += tower.path1Upgrades * 3 + tower.path2Upgrades * 2 + tower.path3Upgrades * 3
    } else if(tower.towerType == "boomer") {
        baseDps += tower.path1Upgrades * 2.5 + tower.path2Upgrades * 2.2 + tower.path3Upgrades * 2.2
    } else if(tower.towerType == "super") {
        baseDps += (tower.path1Upgrades + tower.path2Upgrades + tower.path3Upgrades) * 8
    }

    return baseDps
}

function cloneTowerUpgradeState(tower) {
    var clone = Object.create(Object.getPrototypeOf(tower))
    var keys = Object.keys(tower)
    for(var i = 0; i < keys.length; i++) {
        var value = tower[keys[i]]
        if(Array.isArray(value)) clone[keys[i]] = value.slice()
        else if(value instanceof Set) clone[keys[i]] = new Set(value)
        else if(value instanceof Map) clone[keys[i]] = new Map(value)
        else clone[keys[i]] = value
    }
    return clone
}

function getBloonRemainingTimeSec(bloon) {
    return Math.max(0.2, ((100 - bloon.pathPos) / getBloonPathStepPerTick(bloon)) / 60)
}

function getBloonDefenseHp(bloon) {
    if(bloon.health <= 8) {
        return bloon.health
    }
    if(bloon.health <= 18) {
        return bloon.health * 1.2
    }
    if(bloon.health <= 68) {
        return bloon.health * 1.08
    }

    return bloon.health
}

function getTowerCombatDpsAgainstBloons(tower, relevantBloons) {
    if(isCombatTower(tower) == false) {
        return 0
    }

    var supporting = false
    var close = false
    for(var i = 0; i < relevantBloons.length; i++) {
        if(canTowerReachBloonSoon(tower, relevantBloons[i])) {
            supporting = true
            if(isBloonCloseToTowerFight(tower, relevantBloons[i])) {
                close = true
                break
            }
        }
    }

    if(supporting == false) {
        return 0
    }

    var engagementFactor = close ? 1 : 0.72
    var heuristicDps = getTowerHeuristicDps(tower) * engagementFactor
    var observedDps = getTowerObservedDps(tower) * (close ? 1 : 0.78)
    return Math.max(heuristicDps * 0.6, observedDps)
}

function getDefenseMathSnapshot(targetSide, sentBloonsOnly) {
    var relevantBloons = []
    var snapshot = {
        targetSide: targetSide,
        count: 0,
        heavyCount: 0,
        requiredDps: 0,
        closeRequiredDps: 0,
        currentDps: 0,
        boostedDps: 0,
        lightningDps: 0,
        bloonBoostRequiredDps: 0,
        slowedDefenseDps: 0,
        minTimeToExitSec: Infinity,
        maxPathPos: 0,
    }

    for(var i = 0; i < bloons.length; i++) {
        var bloon = bloons[i]
        if(bloon.playerSide != targetSide || bloon.isBoss) {
            continue
        }
        if(sentBloonsOnly && bloon.isAI) {
            continue
        }

        relevantBloons.push(bloon)
        var timeToExitSec = getBloonRemainingTimeSec(bloon)
        var hpValue = getBloonDefenseHp(bloon)
        var hpRate = hpValue / timeToExitSec
        snapshot.count++
        snapshot.requiredDps += hpRate
        if(timeToExitSec <= 4.5 || bloon.pathPos >= 55) {
            snapshot.closeRequiredDps += hpRate
        }
        if(isHeavyBloonHealth(bloon.health)) {
            snapshot.heavyCount++
        }
        snapshot.maxPathPos = Math.max(snapshot.maxPathPos, bloon.pathPos)
        snapshot.minTimeToExitSec = Math.min(snapshot.minTimeToExitSec, timeToExitSec)
    }

    if(snapshot.count == 0) {
        snapshot.minTimeToExitSec = Infinity
        return snapshot
    }

    for(var towerIndex = 0; towerIndex < towers.length; towerIndex++) {
        if(towers[towerIndex].playerSide == targetSide) {
            snapshot.currentDps += getTowerCombatDpsAgainstBloons(towers[towerIndex], relevantBloons)
        }
    }

    snapshot.boostedDps = snapshot.currentDps / BOOST_SETTINGS.towerBoostFactor
    snapshot.lightningDps = snapshot.count * 4 + snapshot.closeRequiredDps * 0.08
    snapshot.bloonBoostRequiredDps = snapshot.requiredDps * BOOST_SETTINGS.bloonBoostFactor
    snapshot.slowedDefenseDps = snapshot.currentDps / BOOST_SETTINGS.slowSabotageFactor
    snapshot.margin = snapshot.currentDps - snapshot.requiredDps
    snapshot.canHold = snapshot.margin >= 0
    return snapshot
}

function getBananasForSide(side) {
    var sideBananas = []
    for(var i = 0; i < bananas.length; i++) {
        if(bananas[i].playerSide == side) {
            sideBananas.push(bananas[i])
        }
    }
    return sideBananas
}

function getParentFarmForBanana(banana) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].towerID == banana.parentID && towers[i].towerType == "farm") {
            return towers[i]
        }
    }

    return null
}

function isBananaCoveredByFarmer(side, banana) {
    var farmers = getSideTowersByType(side, "farmer")
    for(var i = 0; i < farmers.length; i++) {
        if(Math.sqrt((farmers[i].x - banana.x) ** 2 + (farmers[i].y - banana.y) ** 2) <= farmers[i].range) {
            return true
        }
    }

    return false
}

function isFarmServicedByFarmer(farm) {
    var farmers = getSideTowersByType(farm.playerSide, "farmer")
    for(var i = 0; i < farmers.length; i++) {
        if(Math.sqrt((farmers[i].x - farm.x) ** 2 + (farmers[i].y - farm.y) ** 2) <= Math.max(90, farmers[i].range - farm.range * 0.6)) {
            return true
        }
    }

    return false
}

function getUncoveredBananas(side) {
    var uncoveredBananas = []
    var sideBananas = getBananasForSide(side)
    for(var i = 0; i < sideBananas.length; i++) {
        if(isBananaCoveredByFarmer(side, sideBananas[i]) == false) {
            uncoveredBananas.push(sideBananas[i])
        }
    }

    return uncoveredBananas
}

function getBananaCoverageIssue(side) {
    var farms = getSideTowersByType(side, "farm")
    var uncoveredBananas = getUncoveredBananas(side)
    var bestFarm = null
    var bestScore = -Infinity
    var bestUncoveredCount = 0
    var bestExpiringBananaMs = Infinity

    for(var i = 0; i < farms.length; i++) {
        var score = isFarmServicedByFarmer(farms[i]) ? 0 : 2
        var uncoveredCount = 0
        var soonestBananaMs = Infinity
        for(var k = 0; k < uncoveredBananas.length; k++) {
            var parentFarm = getParentFarmForBanana(uncoveredBananas[k])
            if(parentFarm == farms[i]) {
                uncoveredCount++
                soonestBananaMs = Math.min(soonestBananaMs, uncoveredBananas[k].lifespan - gameNow())
                score += 1 + Math.max(0, 5000 - (uncoveredBananas[k].lifespan - gameNow())) / 5000
            }
        }
        if(score > bestScore) {
            bestScore = score
            bestFarm = farms[i]
            bestUncoveredCount = uncoveredCount
            bestExpiringBananaMs = soonestBananaMs
        }
    }

    if(bestScore <= 0 || !bestFarm) {
        return null
    }

    return {
        farm: bestFarm,
        uncoveredBananas: uncoveredBananas,
        needsFarmer: isFarmServicedByFarmer(bestFarm) == false || bestUncoveredCount >= 2 || bestExpiringBananaMs <= 3500,
    }
}

function chooseBananaForCursorCollection(side) {
    var uncoveredBananas = getUncoveredBananas(side)
    if(uncoveredBananas.length == 0) {
        return null
    }

    uncoveredBananas.sort(function(a, b) {
        var aTime = a.lifespan - gameNow()
        var bTime = b.lifespan - gameNow()
        if(aTime != bTime) {
            return aTime - bTime
        }
        return b.cashGiven - a.cashGiven
    })
    return uncoveredBananas[0]
}

function isSafeForAIBananaCollection(matchup) {
    return matchup.safeToGreed && matchup.playerThreat.score < 8 && matchup.playerThreat.heavyCount == 0 && matchup.playerThreat.count < 8
}

function getTowerPriceByImage(image) {
    var towerConfig = LOADOUT_TOWER_CONFIG[image]
    return towerConfig ? towerConfig.price() : Infinity
}

function getCheapestCombatPlacementCost(side) {
    var bestCost = Infinity
    for(var i = 0; i < players[side].towers.length; i++) {
        var image = players[side].towers[i]
        var towerType = getTowerTypeFromImage(image)
        if(!towerType || towerType == "farm" || towerType == "farmer") {
            continue
        }

        var baseDps = getTowerHeuristicDps({ towerType: towerType, path1Upgrades: 0, path2Upgrades: 0, path3Upgrades: 0 })
        if(baseDps < 6) {
            continue
        }

        bestCost = Math.min(bestCost, getTowerPriceByImage(image))
    }

    return bestCost
}

function getCheapestCombatUpgradeCost(side) {
    var bestCost = Infinity
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower || tower.playerSide != side || isCombatTower(tower) == false) {
            continue
        }

        for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
            var upgradeProp = "path" + pathNumber + "Upgrades"
            var costProp = "path" + pathNumber + "Cost"
            var currentUpgrade = tower[upgradeProp]
            var upgradeCost = tower[costProp][currentUpgrade]
            if(typeof upgradeCost == "number") {
                bestCost = Math.min(bestCost, upgradeCost)
            }
        }
    }

    return bestCost
}

function getDefenseLiquidityState(side) {
    var cheapestPlacementCost = getCheapestCombatPlacementCost(side)
    var cheapestUpgradeCost = getCheapestCombatUpgradeCost(side)
    var cheapestDefenseCost = Math.min(cheapestPlacementCost, cheapestUpgradeCost)
    var money = players[side].money
    var defenseCount = getSideTowerCountExcluding(side, ["farm", "farmer", "cobra"])

    if(cheapestDefenseCost == Infinity) {
        return {
            money: money,
            defenseCount: defenseCount,
            cheapestPlacementCost: cheapestPlacementCost,
            cheapestUpgradeCost: cheapestUpgradeCost,
            cheapestDefenseCost: cheapestDefenseCost,
            liquidityRatio: 0,
            canDevelopNow: false,
            canDevelopSoon: false,
            poor: true,
            rich: false,
        }
    }

    var liquidityRatio = money / Math.max(1, cheapestDefenseCost)
    return {
        money: money,
        defenseCount: defenseCount,
        cheapestPlacementCost: cheapestPlacementCost,
        cheapestUpgradeCost: cheapestUpgradeCost,
        cheapestDefenseCost: cheapestDefenseCost,
        liquidityRatio: liquidityRatio,
        canDevelopNow: money >= cheapestDefenseCost,
        canDevelopSoon: money >= cheapestDefenseCost * 1.55,
        poor: liquidityRatio < 0.92 || money < 450 && defenseCount <= 2,
        rich: liquidityRatio >= 2.2 || money >= Math.max(2200, cheapestDefenseCost * 2.6),
    }
}

function aiRequestPlaceTowerImage(side, image, priority, decisionSample, targetX, targetY) {
    var slotIndex = players[side].towers.indexOf(image)
    if(slotIndex == -1) {
        return false
    }

    var role = getStrategyPlacementRoleForImage(image)
    if(Number.isFinite(targetX) && Number.isFinite(targetY)) {
        return setAIAction({
            type: "placeTower",
            side: side,
            slotIndex: slotIndex,
            role: role,
            targetX: targetX,
            targetY: targetY,
            priority: priority,
            decisionSample: decisionSample || null,
        })
    }
    var spotIndex = getSideTowersByType(side, getTowerTypeFromImage(image)).length
    return aiRequestPlaceTowerInRole(side, slotIndex, role, spotIndex, priority, decisionSample)
}

function withSelectedTower(side, tower, callback) {
    var previousSelections = []
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side) {
            previousSelections.push(towers[i].selected)
            towers[i].selected = towers[i] == tower
        }
    }
    callback()
    var restoreIndex = 0
    for(var j = 0; j < towers.length; j++) {
        if(towers[j].playerSide == side) {
            towers[j].selected = previousSelections[restoreIndex]
            restoreIndex++
        }
    }
}

function aiTryUpgradeTower(side, tower, pathNumber) {
    if(!tower || tower.playerSide != side || towers.indexOf(tower) == -1 || canTowerUpgradePathNow(side, tower, pathNumber) == false) {
        return false
    }

    var upgradeProp = "path" + pathNumber + "Upgrades"
    var costProp = "path" + pathNumber + "Cost"
    var currentUpgrade = tower[upgradeProp]
    var upgradeCost = tower[costProp][currentUpgrade]
    if(typeof upgradeCost != "number" || players[side].money < upgradeCost) {
        return false
    }

    if(getSelectedTower(side) != tower) {
        return false
    }

    var beforeUpgradeCount = tower[upgradeProp]
    if(pathNumber == 1) {
        tryUpgradePath1(side)
    } else if(pathNumber == 2) {
        tryUpgradePath2(side)
    } else {
        tryUpgradePath3(side)
    }
    var upgraded = tower[upgradeProp] > beforeUpgradeCount
    if(upgraded) {
        noteAITowerCrosspathContext(tower, getCurrentPlayerMatchupStyle(side))
    }
    return upgraded
}

function aiTryCollectFarm(side, tower) {
    if(tower && tower.towerType == "farm" && tower.path2Upgrades >= 3 && tower.towerVar > 0) {
        collectFarmMoney(tower)
        return true
    }
    return false
}

function aiTrySellTower(side, tower) {
    if(!tower || tower.playerSide != side) {
        return false
    }
    if(typeof sellTowerInstance != "function") {
        return false
    }
    var placementOutcome = captureAITowerPlacementOutcome(tower)
    var sold = sellTowerInstance(tower)
    if(sold) finalizeAITowerPlacementOutcome(tower, placementOutcome)
    return sold
}

function moveAICursorToward(side, targetX, targetY) {
    var activeCursor = players[side].cursor
    var dx = targetX - activeCursor.x
    var dy = targetY - activeCursor.y

    if(Math.abs(dx) <= CURSOR_MOVE_STEP && Math.abs(dy) <= CURSOR_MOVE_STEP) {
        activeCursor.x = targetX
        activeCursor.y = targetY
        return true
    }

    if(Math.abs(dx) <= CURSOR_MOVE_STEP) {
        activeCursor.x = targetX
    } else {
        moveCursor(side, dx > 0 ? CURSOR_MOVE_STEP : -CURSOR_MOVE_STEP, 0)
    }

    if(Math.abs(dy) <= CURSOR_MOVE_STEP) {
        activeCursor.y = targetY
    } else {
        moveCursor(side, 0, dy > 0 ? CURSOR_MOVE_STEP : -CURSOR_MOVE_STEP)
    }

    return activeCursor.x == targetX && activeCursor.y == targetY
}

function isManualAimTower(tower) {
    return tower.playerSide == aiSide && (tower.towerType == "dartling" || tower.towerType == "mortar")
}

function getManualAimFollowPriority(tower) {
    return tower.towerType == "mortar" && tower.path3Upgrades >= 1 ? 4 : 0
}

function getManualAimLockPriority(tower) {
    return tower.towerType == "mortar" && tower.path3Upgrades >= 1 ? 6 : 2
}

function getManualAimTowers(side) {
    var aimTowers = []
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side && isManualAimTower(towers[i])) {
            aimTowers.push(towers[i])
        }
    }

    return aimTowers
}

function isManualAimTowerLocked(tower) {
    return tower.targetPrio == getManualAimLockPriority(tower)
}

function isManualAimTowerLockedAt(tower, targetX, targetY) {
    return isManualAimTowerLocked(tower) && Math.abs(tower.targetX - targetX) < 1 && Math.abs(tower.targetY - targetY) < 1
}

function getManualAimFollowDirection(tower) {
    if(tower.towerType == "mortar" && tower.path3Upgrades >= 1 && tower.targetPrio == 6) {
        return -1
    }
    return 1
}

function startAIManualAimAction(side, type, aimTowers, targetX, targetY, decisionSample) {
    if(type != "follow" && type != "lock" || !aimTowers || aimTowers.length == 0) {
        return false
    }

    settleAITacticalDecision(side, decisionSample, false)
    aiProfile.manualAimAction = {
        side: side,
        type: type,
        towerIDs: aimTowers.map(function(tower) { return tower.towerID }),
        towerIndex: 0,
        phase: "move-to-tower",
        targetX: targetX,
        targetY: targetY,
        readyAt: 0,
        decisionSample: decisionSample || null,
        factualOutcomeBefore: getAIFactualDecisionOutcomeSnapshot(side),
        actionContext: { kind: "neutral" },
    }
    aiProfile.aimLocked = false
    return true
}

function advanceAIManualAimTower(action) {
    action.towerIndex++
    action.phase = "move-to-tower"
    action.readyAt = 0
}

function advanceAIManualAimAction(side) {
    var action = aiProfile.manualAimAction
    if(!action || action.side != side) {
        return false
    }

    while(action.towerIndex < action.towerIDs.length) {
        var tower = getAITowerByID(action.towerIDs[action.towerIndex])
        if(!tower || tower.playerSide != side || !isManualAimTower(tower)) {
            advanceAIManualAimTower(action)
            continue
        }
        if(action.type == "follow" && tower.targetPrio == getManualAimFollowPriority(tower)) {
            advanceAIManualAimTower(action)
            continue
        }
        if(action.type == "lock" && isManualAimTowerLockedAt(tower, action.targetX, action.targetY)) {
            advanceAIManualAimTower(action)
            continue
        }

        if(action.phase == "move-to-tower") {
            var reachedTower = moveAICursorToward(side, tower.x, tower.y)
            if(!reachedTower) {
                return true
            }

            selectTowerAt(side, players[side].cursor.x, players[side].cursor.y)
            if(getSelectedTower(side) != tower) {
                advanceAIManualAimTower(action)
                return true
            }
            action.phase = "wait-selected"
            action.readyAt = gameNow() + keyMsCooldown
            return true
        }

        if(getSelectedTower(side) != tower) {
            action.phase = "move-to-tower"
            action.readyAt = 0
            return true
        }

        if(action.phase == "wait-selected") {
            if(gameNow() < action.readyAt) {
                return true
            }
            if(tower.targetPrio != getManualAimFollowPriority(tower)) {
                updateTowerTargetPriority(tower, getManualAimFollowDirection(tower))
                action.readyAt = gameNow() + keyMsCooldown
                return true
            }
            if(tower.towerType == "mortar" && tower.path3Upgrades >= 1) {
                tower.target = -1
            }
            if(action.type == "follow") {
                advanceAIManualAimTower(action)
                return true
            }
            action.phase = "move-to-aim"
            return true
        }

        if(action.phase == "move-to-aim") {
            if(tower.targetPrio != getManualAimFollowPriority(tower)) {
                action.phase = "wait-selected"
                action.readyAt = gameNow()
                return true
            }
            if(!moveAICursorToward(side, action.targetX, action.targetY)) {
                return true
            }
            updateTowerTargetPriority(tower, 1)
            action.phase = "wait-lock"
            return true
        }

        if(action.phase == "wait-lock") {
            if(isManualAimTowerLockedAt(tower, action.targetX, action.targetY)) {
                advanceAIManualAimTower(action)
                return true
            }
            var transientPriority = getManualAimLockPriority(tower) - 1
            if(tower.targetPrio == transientPriority) {
                return true
            }
            action.phase = "wait-selected"
            action.readyAt = gameNow() + keyMsCooldown
            return true
        }

        action.phase = "move-to-tower"
        return true
    }

    if(action.decisionSample) recordAITacticalDecision(side, "aim", "aim|" + action.type, getCurrentPlayerMatchupStyle(side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)
    aiProfile.manualAimAction = null
    var aimTowers = getManualAimTowers(side)
    aiProfile.aimLocked = aimTowers.length > 0 && aimTowers.every(isManualAimTowerLocked)
    return true
}

function deselectAITowers(side) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side) {
            towers[i].selected = false
        }
    }
}

function isPointOverSideTower(side, x, y) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side && towers[i].clicked(x, y)) {
            return true
        }
    }

    return false
}

function getAIDeselectPoint(side) {
    var activeCursor = players[side].cursor
    var bounds = getSideBounds(side, 0)
    if(isPointOverSideTower(side, activeCursor.x, activeCursor.y) == false) {
        return { x: activeCursor.x, y: activeCursor.y }
    }

    var offsets = [
        { x: 0, y: 90 },
        { x: 0, y: -90 },
        { x: 90, y: 0 },
        { x: -90, y: 0 },
        { x: 90, y: 90 },
        { x: -90, y: 90 },
        { x: 90, y: -90 },
        { x: -90, y: -90 },
        { x: 150, y: 0 },
        { x: -150, y: 0 },
    ]

    for(var i = 0; i < offsets.length; i++) {
        var targetX = clamp(activeCursor.x + offsets[i].x, bounds.minX, bounds.maxX)
        var targetY = clamp(activeCursor.y + offsets[i].y, bounds.minY, bounds.maxY)
        if(isPointOverSideTower(side, targetX, targetY) == false) {
            return { x: targetX, y: targetY }
        }
    }

    return { x: bounds.minX + (bounds.maxX - bounds.minX) / 2, y: bounds.maxY - canvas.height / 10 }
}

function clearAIAction() {
    aiProfile.currentAction = null
}

function getAIActionRewardContext(action) {
    if(!action) {
        return null
    }

    if(action.type == "placeTower") {
        var towerImage = players[action.side].towers[action.slotIndex]
        var towerConfig = LOADOUT_TOWER_CONFIG[towerImage]
        return { kind: "spend", expectedCost: towerConfig ? towerConfig.price() : 0 }
    }
    if(action.type == "placeFarmer") {
        return { kind: "spend", expectedCost: baseFarmerPrice }
    }
    if(action.type == "upgradeTower") {
        var upgradeTower = action.tower
        var upgradeCost = upgradeTower ? upgradeTower["path" + action.pathNumber + "Cost"][upgradeTower["path" + action.pathNumber + "Upgrades"]] : 0
        return { kind: "spend", expectedCost: typeof upgradeCost == "number" ? upgradeCost : 0 }
    }
    if(action.type == "sellTower") {
        var sellTower = action.tower
        var sellValue = getAITowerSellValueEstimate(sellTower)
        var bankValue = sellTower && sellTower.towerType == "farm" && sellTower.path2Upgrades >= 3 ? Math.max(0, Number(sellTower.towerVar) || 0) : 0
        var totalCost = sellTower ? Math.max(0, Number(sellTower.totalCost) || 0) : 0
        return {
            kind: "liquidate",
            proceeds: sellValue + bankValue,
            liquidationLoss: Math.max(0, totalCost - sellValue),
        }
    }
    if(action.type == "collectFarm") {
        return { kind: "income", expectedIncome: action.tower ? Math.max(0, Number(action.tower.towerVar) || 0) : 0 }
    }
    if(action.type == "collectBanana") {
        return { kind: "income", expectedIncome: action.banana ? Math.max(0, Number(action.banana.cashGiven) || 0) : 0 }
    }
    if(action.type == "aim") {
        return { kind: "neutral" }
    }
    return null
}

function setAIAction(action) {
    if(!action) {
        return false
    }

    if(action.priority == undefined) {
        action.priority = AI_ACTION_PRIORITY.normal
    }
    if(action.interruptible == undefined) {
        action.interruptible = true
    }

    if(aiProfile.currentAction) {
        if(aiProfile.currentAction.interruptible == false || action.priority <= aiProfile.currentAction.priority) {
            return false
        }
    }

    action.attempts = 0
    if(action.side != null && action.decisionSample) {
        settleAITacticalDecision(action.side, action.decisionSample, false)
        action.factualOutcomeBefore = getAIFactualDecisionOutcomeSnapshot(action.side)
        action.actionContext = getAIActionRewardContext(action)
    }
    aiProfile.currentAction = action
    return true
}

function aiRequestPlaceTowerInRole(side, slotIndex, role, spotIndex, priority, decisionSample) {
    var towerImage = players[side].towers[slotIndex]
    var towerConfig = LOADOUT_TOWER_CONFIG[towerImage]
    if(!towerConfig) {
        return false
    }

    var spot = findAISpot(side, towerConfig.radius, towerConfig.range, role, spotIndex || 0, towerConfig.towerType)
    if(!spot) {
        return false
    }

    return setAIAction({
        type: "placeTower",
        side: side,
        slotIndex: slotIndex,
        role: role,
        targetX: spot.x,
        targetY: spot.y,
        priority: priority,
        decisionSample: decisionSample || spot.decisionSample,
    })
}

function aiRequestPlaceFarmer(side, priority, decisionSample) {
    var spot = findAIFarmerSpot(side)
    if(!spot) {
        return false
    }

    return setAIAction({
        type: "placeFarmer",
        side: side,
        targetX: spot.x,
        targetY: spot.y,
        priority: priority,
        decisionSample: decisionSample || spot.decisionSample,
    })
}

function aiRequestUpgradeTower(side, tower, pathNumber, priority, decisionSample) {
    if(!tower) {
        return false
    }

    return setAIAction({
        type: "upgradeTower",
        side: side,
        tower: tower,
        towerID: tower.towerID,
        pathNumber: pathNumber,
        targetX: tower.x,
        targetY: tower.y,
        priority: priority,
        decisionSample: decisionSample || null,
    })
}

function aiRequestSellTower(side, tower, priority, decisionSample) {
    if(!tower || tower.playerSide != side) {
        return false
    }

    return setAIAction({
        type: "sellTower",
        side: side,
        tower: tower,
        towerID: tower.towerID,
        targetX: tower.x,
        targetY: tower.y,
        priority: priority,
        decisionSample: decisionSample || null,
    })
}

function aiRequestCollectFarm(side, tower, priority, decisionSample) {
    if(!tower) {
        return false
    }

    return setAIAction({
        type: "collectFarm",
        side: side,
        tower: tower,
        towerID: tower.towerID,
        targetX: tower.x,
        targetY: tower.y,
        priority: priority,
        decisionSample: decisionSample || null,
    })
}

function aiRequestCollectBanana(side, banana, priority, decisionSample) {
    if(!banana) {
        return false
    }

    return setAIAction({
        type: "collectBanana",
        side: side,
        banana: banana,
        targetX: banana.x,
        targetY: banana.y,
        priority: priority,
        decisionSample: decisionSample || null,
    })
}

function aiRequestDeselectTower(side, priority) {
    var deselectPoint = getAIDeselectPoint(side)
    return setAIAction({
        type: "deselectTower",
        side: side,
        targetX: deselectPoint.x,
        targetY: deselectPoint.y,
        priority: priority,
    })
}

function executeAIAction(action) {
    if(action.type == "selectPregameItem") {
        selectPregameItemsAt(action.side, players[action.side].cursor.x, players[action.side].cursor.y)
        updateAILoadoutFilled()
        return true
    } else if(action.type == "placeTower") {
        var placedTower = aiPlaceTower(action.side, action.slotIndex, players[action.side].cursor.x, players[action.side].cursor.y, action.role)
        if(placedTower) {
            if(recordAITacticalDecision(action.side, placedTower.towerType == "farm" ? "farm" : "development", "place|" + placedTower.towerType + "|" + (action.role || "core"), getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)) {
                bindAITowerPlacementOutcome(placedTower)
            }
        }
        return placedTower != null
    } else if(action.type == "placeFarmer") {
        var placedFarmer = aiPlaceFarmer(action.side, players[action.side].cursor.x, players[action.side].cursor.y)
        if(placedFarmer) {
            if(recordAITacticalDecision(action.side, "farm", "place|farmer", getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)) {
                bindAITowerPlacementOutcome(placedFarmer)
            }
        }
        return placedFarmer != null
    } else if(action.type == "upgradeTower") {
        action.tower = getAITowerByID(action.towerID)
        if(!action.tower) {
            return false
        }
        if(action.phase != "upgrade") {
            selectTowerAt(action.side, players[action.side].cursor.x, players[action.side].cursor.y)
            action.phase = "upgrade"
            action.readyAt = gameNow() + keyMsCooldown
            return "pending"
        }
        if(action.readyAt && gameNow() < action.readyAt) {
            return "pending"
        }
        var upgradeSucceeded = aiTryUpgradeTower(action.side, action.tower, action.pathNumber)
        if(upgradeSucceeded) {
            recordAITacticalDecision(action.side, action.tower.towerType == "farm" ? "farm" : "development", "upgrade|" + action.tower.towerType + "|" + action.pathNumber, getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)
        }
        return upgradeSucceeded
    } else if(action.type == "collectFarm") {
        action.tower = getAITowerByID(action.towerID)
        var collectedFarm = aiTryCollectFarm(action.side, action.tower)
        if(collectedFarm) recordAITacticalDecision(action.side, "farm", "collect|farm", getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)
        return collectedFarm
    } else if(action.type == "sellTower") {
        action.tower = getAITowerByID(action.towerID)
        var soldTowerType = action.tower ? action.tower.towerType : "missing"
        var sellSucceeded = aiTrySellTower(action.side, action.tower)
        if(sellSucceeded) {
            recordAITacticalDecision(action.side, soldTowerType == "farm" ? "farm" : "development", "sell|" + soldTowerType, getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)
        }
        return sellSucceeded
    } else if(action.type == "collectBanana") {
        recordAITacticalDecision(action.side, "farm", "collect|banana", getCurrentPlayerMatchupStyle(action.side), action.decisionSample, action.factualOutcomeBefore, action.actionContext)
        return true
    } else if(action.type == "deselectTower") {
        selectTowerAt(action.side, players[action.side].cursor.x, players[action.side].cursor.y)
        return true
    }

    return false
}

function handleAIActionResult(action, result) {
    if(result === true) {
        clearAIAction()
        return
    }
    if(result == "pending") {
        return
    }
    action.attempts = (action.attempts || 0) + 1
    if(action.attempts >= 2) {
        clearAIAction()
    }
}

function getAITowerByID(towerID) {
    for(var i = 0; i < towers.length; i++) {
        if(towers[i] && towers[i].towerID == towerID) {
            return towers[i]
        }
    }
    return null
}

function shouldAIPauseEcoForPendingPurchase(side, matchup) {
    var action = aiProfile.currentAction
    if(!action || action.side != side) {
        return false
    }
    if(action.type != "placeTower" && action.type != "upgradeTower") {
        return false
    }

    var towerType = ""
    if(action.type == "placeTower") {
        towerType = getTowerTypeFromImage(players[side].towers[action.slotIndex])
    } else if(action.tower) {
        towerType = action.tower.towerType
    }
    if(towerType == "farm" || towerType == "farmer") {
        return false
    }
    if(action.priority >= AI_ACTION_PRIORITY.high) {
        return true
    }
    if(action.priority < AI_ACTION_PRIORITY.normal || !matchup || !matchup.defenseMath) {
        return false
    }

    var defenseMath = matchup.defenseMath
    return matchup.dangerHigh || defenseMath.requiredDps > defenseMath.currentDps * 0.92 || matchup.playerThreat.heavyCount >= 1 && defenseMath.requiredDps > defenseMath.currentDps * 0.84
}

function runAICursor() {
    if(aiEnabled == false || gameOver || gamePaused || isFrontMenuOpen()) {
        return
    }

    if(aiProfile.currentAction == null) {
        if(runAIAiming(aiSide)) {
            return
        }
        if(getSelectedTower(aiSide) && isPointOverSideTower(aiSide, players[aiSide].cursor.x, players[aiSide].cursor.y) == false) {
            selectTowerAt(aiSide, players[aiSide].cursor.x, players[aiSide].cursor.y)
        } else if(getSelectedTower(aiSide)) {
            aiRequestDeselectTower(aiSide, AI_ACTION_PRIORITY.low)
            return
        }
        return
    }

    var action = aiProfile.currentAction
    if(action.type == "collectBanana") {
        var bananaStillExists = false
        for(var i = 0; i < bananas.length; i++) {
            if(bananas[i] == action.banana) {
                bananaStillExists = true
                action.targetX = bananas[i].x
                action.targetY = bananas[i].y
                break
            }
        }
        if(bananaStillExists == false) {
            clearAIAction()
            return
        }
    }
    var reachedTarget = moveAICursorToward(action.side, action.targetX, action.targetY)
    if(reachedTarget) {
        handleAIActionResult(action, executeAIAction(action))
    }
}

function runAIAiming(side) {
    if(gameStarted == false) {
        return false
    }

    var aimTowers = getManualAimTowers(side)
    if(aimTowers.length == 0) {
        aiProfile.aimLocked = false
        aiProfile.manualAimAction = null
        return false
    }
    if(aiProfile.manualAimAction) {
        return advanceAIManualAimAction(side)
    }

    var matchup = getCurrentPlayerMatchupStyle(side)
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.placement, matchup)
    var bestAim = {
        type: "noop",
        decisionSample: scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
            id: "aim|noop",
            type: "aim|noop",
            actionKey: "aim|noop",
            noop: true,
        }, matchup, decisionState),
    }
    var followDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
        id: "aim|follow",
        type: "aim|follow",
        actionKey: "aim|follow",
        count: aimTowers.length,
        countScale: 8,
        manualFollow: true,
    }, matchup, decisionState)
    if(isAIDecisionScoreBetter(followDecision, bestAim.decisionSample)) bestAim = { type: "follow", x: players[side].cursor.x, y: players[side].cursor.y, decisionSample: followDecision }
    for(var bloonIndex = 0; bloonIndex < bloons.length; bloonIndex++) {
        var bloon = bloons[bloonIndex]
        if(!bloon || bloon.playerSide != side || bloon.isBoss) continue
        var lockDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
            id: "aim|lock|" + bloonIndex,
            type: "aim|lock|" + bloon.health,
            actionKey: "aim|lock",
            x: bloon.x,
            y: bloon.y,
            position: clamp((Number(bloon.pathPos) || 0) / 100, 0, 1),
            count: Math.max(0, Number(bloon.health) || 0),
            countScale: 1000,
            manualLock: true,
        }, matchup, decisionState)
        if(isAIDecisionScoreBetter(lockDecision, bestAim.decisionSample)) bestAim = { type: "lock", x: bloon.x, y: bloon.y, decisionSample: lockDecision }
    }
    if(bestAim.type == "noop") {
        recordAINoOpDecision(bestAim.decisionSample)
        return false
    }
    aiProfile.lastAimX = bestAim.x
    aiProfile.lastAimY = bestAim.y
    startAIManualAimAction(side, bestAim.type, aimTowers, bestAim.x, bestAim.y, bestAim.decisionSample)
    return advanceAIManualAimAction(side)
}

function aiSelectEcoSend(side, matchup) {
    var factualOutcomeBefore = getAIFactualDecisionOutcomeSnapshot(side)
    var startIndex = side == PLAYER_SIDE.left ? 0 : 10
    var endIndex = side == PLAYER_SIDE.left ? 9 : 19
    var currentLocalIndex = clamp(players[side].selectedBloon - startIndex, 0, endIndex - startIndex)
    var bestIndex = -1
    var bestDecision = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.eco, matchup)
    for(var i = startIndex; i <= endIndex; i++) {
        var bloon = displayBloons[i]
        if(!bloon || bloon.image == "locked.png" || bloon.eco <= 0) {
            continue
        }

        var localIndex = i - startIndex
        var groupDurationSec = Math.max(0.25, (bloon.spacing * Math.max(1, bloon.count)) / 1000)
        var ecoPerSecond = bloon.eco / groupDurationSec
        var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.eco, {
            id: "eco|" + localIndex,
            type: "bloon|" + bloon.health,
            actionKey: "send|" + localIndex,
            cost: bloon.cost,
            money: players[side].money,
            position: clamp(ecoPerSecond / 20, 0, 1),
            index: localIndex,
            maxIndex: endIndex - startIndex,
            count: bloon.count,
            send: bloon,
            selected: localIndex == currentLocalIndex,
        }, matchup, decisionState)
        if(isAIDecisionScoreBetter(decision, bestDecision)) {
            bestDecision = decision
            bestIndex = i
        }
    }

    var noOpDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.eco, {
        id: "eco|noop",
        type: "noop",
        actionKey: "auto|0",
        noop: true,
    }, matchup, decisionState)
    if(bestDecision && isAIDecisionScoreBetter(noOpDecision, bestDecision)) {
        players[side].autoEco = false
        recordAINoOpDecision(noOpDecision)
        return
    }

    if(bestIndex != -1) {
        var previousIndex = players[side].selectedBloon
        var wasAutoEco = players[side].autoEco
        players[side].selectedBloon = bestIndex
        players[side].autoEco = true
        aiProfile.startedAutoEcoAt = true
        if(previousIndex != bestIndex || wasAutoEco == false) {
            recordAITacticalDecision(side, "eco", "send|" + (bestIndex - startIndex), matchup, bestDecision, factualOutcomeBefore, { kind: "spend", expectedCost: displayBloons[bestIndex].cost })
        }
    }
}

function getBestRushPlan(side, matchup) {
    var startIndex = side == PLAYER_SIDE.left ? 0 : 10
    var endIndex = side == PLAYER_SIDE.left ? 9 : 19
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.rush, matchup)
    var bestPlan = {
        noop: true,
        decisionSample: scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.rush, {
            id: "rush|noop",
            type: "noop",
            actionKey: "noop",
            noop: true,
        }, matchup, decisionState),
    }
    var availableQueueSlots = Math.max(0, 6 - players[side].bloonQueue.length)

    for(var i = startIndex; i <= endIndex; i++) {
        var candidate = displayBloons[i]
        if(!candidate || candidate.image == "locked.png" || candidate.cost <= 0 || candidate.cost > players[side].money) {
            continue
        }

        var localIndex = i - startIndex
        var maximumGroups = Math.min(availableQueueSlots, Math.floor(players[side].money / candidate.cost))
        for(var groups = 1; groups <= maximumGroups; groups++) {
            var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.rush, {
                id: "rush|" + localIndex + "|" + groups,
                type: "bloon|" + candidate.health,
                actionKey: "send|" + localIndex + "|" + groups,
                cost: candidate.cost * groups,
                money: players[side].money,
                position: clamp(candidate.spacing / 1000, 0, 1),
                index: localIndex,
                maxIndex: endIndex - startIndex,
                count: groups,
                countScale: 6,
                send: candidate,
                sendGroups: groups,
            }, matchup, decisionState)
            if(isAIDecisionScoreBetter(decision, bestPlan.decisionSample)) {
                bestPlan = { index: i, groups: groups, noop: false, decisionSample: decision }
            }
        }
    }
    return bestPlan
}

function aiQueueRush(side, matchup) {
    var factualOutcomeBefore = getAIFactualDecisionOutcomeSnapshot(side)
    var plan = getBestRushPlan(side, matchup)
    if(!plan || plan.noop) {
        if(plan) recordAINoOpDecision(plan.decisionSample)
        return false
    }
    settleAITacticalDecision(side, plan.decisionSample, false)
    players[side].autoEco = false
    players[side].selectedBloon = plan.index
    var queuedAny = false
    for(var groupIndex = 0; groupIndex < plan.groups && players[side].bloonQueue.length < 6; groupIndex++) {
        var selectedBloon = displayBloons[plan.index]
        if(players[side].money < selectedBloon.cost) break
        players[side].bloonQueue.push(new SentBloonQueue(selectedBloon.health, selectedBloon.cost, selectedBloon.eco, selectedBloon.spacing, selectedBloon.count))
        players[side].money -= selectedBloon.cost
        players[side].eco += selectedBloon.eco
        if(players[side].eco < 0) {
            players[side].eco = 0
        }
        queuedAny = true
    }
    if(queuedAny == false) {
        return false
    }
    recordAITacticalDecision(side, "rush", plan.decisionSample.id, matchup, plan.decisionSample, factualOutcomeBefore, { kind: "spend", expectedCost: Math.max(0, factualOutcomeBefore.ownMoney - players[side].money) })
    return true
}

function aiTryUseBoost(side, slot) {
    if(getBoostCount(side, slot) > 0 && getBoostExpires(side, slot) + BOOST_SETTINGS.cooldownMs <= gameNow()) {
        activateBoost(side, slot)
        setBoostExpires(side, slot, gameNow())
        setBoostCount(side, slot, getBoostCount(side, slot) - 1)
        return true
    }
    return false
}

function getBoostSlotByType(side, boostType) {
    for(var i = 0; i < players[side].boostTypes.length; i++) {
        if(players[side].boostTypes[i] == boostType) {
            return i
        }
    }

    return -1
}

function aiTryUseBoostType(side, boostType, decisionSample) {
    var slot = getBoostSlotByType(side, boostType)
    if(slot == -1) {
        return false
    }

    var factualOutcomeBefore = getAIFactualDecisionOutcomeSnapshot(side)
    settleAITacticalDecision(side, decisionSample, false)
    var used = aiTryUseBoost(side, slot)
    if(used) {
        var family = boostType == "bloonboost.png" || boostType == "slowboost.png" ? "offenseBoost" : boostType == "ecoboost.png" ? "eco" : "defenseBoost"
        recordAITacticalDecision(side, family, "boost|" + boostType.replace(".png", ""), getCurrentPlayerMatchupStyle(side), decisionSample, factualOutcomeBefore, { kind: "neutral" })
    }
    return used
}

function estimateBloonLeakDamage(health) {
    if(round <= 50) {
        if(health >= 1 && health <= 5) {
            return health
        }
        if(health == 6) {
            return 11
        }
        if(health == 7) {
            return 23
        }
        if(health == 8) {
            return 47
        }
        if(health >= 9 && health <= 18) {
            return 104
        }
        if(health >= 19 && health <= 218) {
            return 616
        }
        if(health >= 219 && health <= 918) {
            return 3164
        }
        if(health >= 919) {
            return 16656
        }
        return 0
    }

    if(health >= 1 && health <= 8) {
        return health
    }
    if(health >= 9 && health <= 68) {
        return 68
    }
    if(health >= 69 && health <= 68 + Math.ceil(200 * (1.05 ** (round - 50)))) {
        return 472
    }
    if(health >= 69 + Math.ceil(200 * (1.05 ** (round - 50))) && health <= 68 + Math.ceil(900 * (1.05 ** (round - 50)))) {
        return 2588
    }
    if(health >= 69 + Math.ceil(900 * (1.05 ** (round - 50)))) {
        return 14352
    }

    return 0
}

function isHeavyBloonHealth(health) {
    if(round <= 50) {
        return health >= 19
    }

    return health >= 69
}

function getBloonThreatSnapshot(targetSide, onlyPlayerSent) {
    var snapshot = {
        count: 0,
        score: 0,
        nearExitScore: 0,
        maxPathPos: 0,
        heavyCount: 0,
        sentCount: 0,
    }

    for(var i = 0; i < bloons.length; i++) {
        var bloon = bloons[i]
        if(bloon.playerSide != targetSide) {
            continue
        }
        if(onlyPlayerSent && bloon.isAI) {
            continue
        }
        if(bloon.isBoss) {
            continue
        }

        var progress = clamp(bloon.pathPos / 100, 0, 1)
        var threatValue = Math.sqrt(Math.max(1, estimateBloonLeakDamage(bloon.health))) * getBloonUrgencyWeight(bloon)

        snapshot.count++
        if(bloon.isAI == false) {
            snapshot.sentCount++
        }
        snapshot.maxPathPos = Math.max(snapshot.maxPathPos, bloon.pathPos)
        snapshot.score += threatValue * (0.35 + progress * 1.15)
        if(progress >= 0.65) {
            snapshot.nearExitScore += threatValue
        }
        if(isHeavyBloonHealth(bloon.health)) {
            snapshot.heavyCount++
        }
    }

    return snapshot
}

function isCombatTower(tower) {
    return tower.towerType != "farm" && tower.towerType != "farmer"
}

function getBloonPathStepPerTick(bloon) {
    return Math.max(0.001, bloon.speed * bloon.bloonBoosted * (mapNumber == 0 ? 3 : 2))
}

function getBloonUrgencyWeight(bloon) {
    var ticksToExit = (100 - bloon.pathPos) / getBloonPathStepPerTick(bloon)
    var urgency = 0.45

    if(ticksToExit <= 140) {
        urgency = 1.25
    } else if(ticksToExit <= 220) {
        urgency = 1.05
    } else if(ticksToExit <= 320) {
        urgency = 0.85
    } else if(ticksToExit <= 440) {
        urgency = 0.65
    }

    if(isHeavyBloonHealth(bloon.health)) {
        urgency = Math.max(urgency, 0.75)
    }
    if(bloon.pathPos >= 72) {
        urgency = Math.max(urgency, 1.05)
    }

    return urgency
}

function canTowerStillMeaningfullyFightBloon(tower, bloon) {
    if(isCombatTower(tower) == false) {
        return false
    }
    if(tower.range == Infinity || tower.towerType == "sniper" || tower.towerType == "mortar") {
        return true
    }

    var towerProgress = getTowerTrackProgress(tower)
    var bloonProgress = clamp(bloon.pathPos / 100, 0, 1)
    var forwardAllowance = clamp((tower.range + 40) / 700, 0.08, 0.22)
    return bloonProgress <= towerProgress + forwardAllowance
}

function canTowerReachBloonSoon(tower, bloon) {
    if(isCombatTower(tower) == false) {
        return false
    }
    if(canTowerStillMeaningfullyFightBloon(tower, bloon) == false) {
        return false
    }
    if(tower.range == Infinity || tower.towerType == "sniper" || tower.towerType == "mortar") {
        return true
    }

    var dx = tower.x - bloon.x
    var dy = tower.y - bloon.y
    var distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= Math.max(70, tower.range * 0.95 + bloon.radius + 20)
}

function isBloonCloseToTowerFight(tower, bloon) {
    if(isCombatTower(tower) == false) {
        return false
    }
    if(canTowerStillMeaningfullyFightBloon(tower, bloon) == false) {
        return false
    }
    if(tower.range == Infinity || tower.towerType == "sniper" || tower.towerType == "mortar") {
        return bloon.pathPos >= 24
    }

    var dx = tower.x - bloon.x
    var dy = tower.y - bloon.y
    var distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= Math.max(55, tower.range * 0.62 + bloon.radius + 12)
}

function getTowerBoostThreatSnapshot(side) {
    var snapshot = {
        count: 0,
        score: 0,
        closeScore: 0,
        heavyCount: 0,
    }

    for(var i = 0; i < bloons.length; i++) {
        var bloon = bloons[i]
        if(bloon.playerSide != side || bloon.isBoss) {
            continue
        }

        var supportingTower = null
        var closeTower = null
        for(var k = 0; k < towers.length; k++) {
            if(towers[k].playerSide != side) {
                continue
            }
            if(canTowerReachBloonSoon(towers[k], bloon)) {
                supportingTower = towers[k]
                if(isBloonCloseToTowerFight(towers[k], bloon)) {
                    closeTower = towers[k]
                    break
                }
            }
        }

        if(!supportingTower) {
            continue
        }

        var threatValue = Math.sqrt(Math.max(1, estimateBloonLeakDamage(bloon.health))) * getBloonUrgencyWeight(bloon)
        var progress = clamp(bloon.pathPos / 100, 0, 1)
        snapshot.count++
        snapshot.score += threatValue * (0.45 + progress)
        if(closeTower || progress >= 0.58) {
            snapshot.closeScore += threatValue * (0.55 + progress * 0.35)
        }
        if(isHeavyBloonHealth(bloon.health)) {
            snapshot.heavyCount++
        }
    }

    return snapshot
}

function getOffensiveBoostSnapshot(side) {
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var snapshot = {
        count: 0,
        score: 0,
        closeScore: 0,
        nearExitScore: 0,
        heavyCount: 0,
        defendedCount: 0,
    }

    for(var i = 0; i < bloons.length; i++) {
        var bloon = bloons[i]
        if(bloon.playerSide != enemySide || bloon.isBoss || bloon.isAI) {
            continue
        }

        var supportingTower = null
        var closeTower = null
        for(var k = 0; k < towers.length; k++) {
            if(towers[k].playerSide != enemySide) {
                continue
            }
            if(canTowerReachBloonSoon(towers[k], bloon)) {
                supportingTower = towers[k]
                if(isBloonCloseToTowerFight(towers[k], bloon)) {
                    closeTower = towers[k]
                    break
                }
            }
        }

        if(!supportingTower && bloon.pathPos < 34) {
            continue
        }

        var threatValue = Math.sqrt(Math.max(1, estimateBloonLeakDamage(bloon.health))) * getBloonUrgencyWeight(bloon)
        var progress = clamp(bloon.pathPos / 100, 0, 1)
        snapshot.count++
        snapshot.score += threatValue * (0.35 + progress)
        if(supportingTower) {
            snapshot.defendedCount++
        }
        if(closeTower || progress >= 0.56) {
            snapshot.closeScore += threatValue * (0.5 + progress * 0.4)
        }
        if(progress >= 0.72) {
            snapshot.nearExitScore += threatValue
        }
        if(isHeavyBloonHealth(bloon.health)) {
            snapshot.heavyCount++
        }
    }

    return snapshot
}

function canTowerUpgradePathNow(side, tower, pathNumber) {
    if(!tower || tower.playerSide != side || tower.towerType == "farmer" || pathNumber < 1 || pathNumber > 3) {
        return false
    }

    var upgradeProp = "path" + pathNumber + "Upgrades"
    var costProp = "path" + pathNumber + "Cost"
    var currentUpgrade = tower[upgradeProp]
    var upgradeCost = tower[costProp][currentUpgrade]
    if(typeof upgradeCost != "number" || players[side].money < upgradeCost) {
        return false
    }
    if(currentUpgrade == 4 && typeof hasOtherTier5 == "function" && hasOtherTier5(side, tower, pathNumber)) {
        return false
    }
    return true
}

function handleAIRoundStartBoosts(side) {
    var visibleRound = Math.max(1, Math.trunc(round / 2))
    if(visibleRound <= 0 || visibleRound == aiProfile.lastRoundBoostCheck) {
        return
    }

    aiProfile.lastRoundBoostCheck = visibleRound
}

function getCurrentPlayerMatchupStyle(side) {
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var playerThreat = getBloonThreatSnapshot(side, false)
    var aiPressure = getBloonThreatSnapshot(enemySide, true)
    var defenseMath = getDefenseMathSnapshot(side, false)
    var offenseMath = getDefenseMathSnapshot(enemySide, true)
    var enemyLiquidity = getDefenseLiquidityState(enemySide)
    var playerFarms = getSideTowersByType(enemySide, "farm").length
    var playerSupport = getSideTowersByType(enemySide, "cobra").length + getSideTowersByType(enemySide, "sniper").length + getSideTowersByType(enemySide, "engi").length
    var playerCamo = getSideTowersByType(enemySide, "wizard").length + getSideTowersByType(enemySide, "ninja").length + getSideTowersByType(enemySide, "sniper").length
    var playerDefense = getSideTowerCountExcluding(enemySide, ["farm", "farmer", "cobra"])
    var playerLives = players[enemySide].lives == Infinity ? 150 : players[enemySide].lives
    var playerGreedScore = Math.max(0, playerFarms * 1.25 - playerDefense * 0.75 - Math.min(1.5, playerThreat.heavyCount * 0.75))
    var dangerHigh = playerThreat.nearExitScore >= 16 || defenseMath.closeRequiredDps > defenseMath.currentDps * 0.94 || defenseMath.requiredDps > defenseMath.currentDps * 1.18 || playerThreat.heavyCount >= 1 && defenseMath.requiredDps > defenseMath.currentDps * 0.98 || players[side].lives <= 70 && playerThreat.score >= 12
    var noActiveThreat = defenseMath.requiredDps <= 0 && defenseMath.closeRequiredDps <= 0
    var safeToGreed = playerThreat.score < 10 && playerThreat.nearExitScore < 4 && playerThreat.heavyCount == 0 && players[side].lives > 60 && (noActiveThreat || defenseMath.requiredDps < defenseMath.currentDps * 0.7 && defenseMath.closeRequiredDps < defenseMath.currentDps * 0.58)

    return {
        enemySide: enemySide,
        playerThreat: playerThreat,
        aiPressure: aiPressure,
        playerFarms: playerFarms,
        playerSupport: playerSupport,
        playerCamo: playerCamo,
        playerDefense: playerDefense,
        playerLives: playerLives,
        enemyLiquidity: enemyLiquidity,
        playerGreedScore: playerGreedScore,
        defenseMath: defenseMath,
        offenseMath: offenseMath,
        dangerHigh: dangerHigh,
        safeToGreed: safeToGreed,
        enemyVulnerable: playerGreedScore >= 1.2 || aiPressure.maxPathPos >= 34 || playerLives <= 80 || offenseMath.requiredDps > offenseMath.currentDps * 1.1 || offenseMath.closeRequiredDps > offenseMath.currentDps * 0.95 || enemyLiquidity.poor || enemyLiquidity.canDevelopNow == false,
    }
}

function updateAIMatchTelemetry() {
    if(!aiMatchTelemetry || gameStarted == false) {
        return
    }

    var matchup = getCurrentPlayerMatchupStyle(aiSide)
    aiMatchTelemetry.observedLoadoutSummary = getObservedOpponentLoadoutSummary(humanSide)
    aiMatchTelemetry.playerEcoPeak = Math.max(aiMatchTelemetry.playerEcoPeak, players[humanSide].eco)
    aiMatchTelemetry.playerFarmPeak = Math.max(aiMatchTelemetry.playerFarmPeak, matchup.playerFarms)
    aiMatchTelemetry.playerSupportPeak = Math.max(aiMatchTelemetry.playerSupportPeak, matchup.playerSupport)
    aiMatchTelemetry.playerCamoPeak = Math.max(aiMatchTelemetry.playerCamoPeak, matchup.playerCamo)
    aiMatchTelemetry.playerPressurePeak = Math.max(aiMatchTelemetry.playerPressurePeak, matchup.playerThreat.score)
    aiMatchTelemetry.playerHeavyPressurePeak = Math.max(aiMatchTelemetry.playerHeavyPressurePeak, matchup.playerThreat.heavyCount)
    aiMatchTelemetry.aiEcoPeak = Math.max(aiMatchTelemetry.aiEcoPeak, players[aiSide].eco)
    aiMatchTelemetry.aiFarmPeak = Math.max(aiMatchTelemetry.aiFarmPeak, getSideTowersByType(aiSide, "farm").length)
    aiMatchTelemetry.aiPressurePeak = Math.max(aiMatchTelemetry.aiPressurePeak, matchup.aiPressure.score)
    aiMatchTelemetry.aiHeavyPressurePeak = Math.max(aiMatchTelemetry.aiHeavyPressurePeak, matchup.aiPressure.heavyCount)
    aiMatchTelemetry.roundPeak = Math.max(aiMatchTelemetry.roundPeak, round / 2)

    if(matchup.playerGreedScore >= 1.2 && matchup.playerThreat.score < 10 && gameNow() - aiMatchTelemetry.lastGreedTick >= 2500) {
        aiMatchTelemetry.playerGreedMoments++
        aiMatchTelemetry.lastGreedTick = gameNow()
    }
    if(gameNow() - aiMatchTelemetry.lastSelfAuditTick >= 2500) {
        var visibleRound = getCurrentVisibleRound()
        var aiFarms = getSideTowersByType(aiSide, "farm").length
        var aiTowerCount = getSideTowerCountExcluding(aiSide, ["farmer"])
        var aiDefense = getSideTowerCountExcluding(aiSide, ["farm", "farmer", "cobra"])
        var aiLiquidity = getDefenseLiquidityState(aiSide)
        var uncoveredBananas = getUncoveredBananas(aiSide).length

        if(uncoveredBananas > 0 && aiFarms > 0) {
            aiMatchTelemetry.aiUncoveredBananaMoments++
        }
        if(matchup.dangerHigh && (players[aiSide].autoEco || aiFarms > aiDefense + 1)) {
            aiMatchTelemetry.aiDangerGreedMoments++
        }
        if(matchup.dangerHigh && matchup.defenseMath.requiredDps > matchup.defenseMath.currentDps * 1.04) {
            aiMatchTelemetry.aiEmergencyDefenseMoments++
        }
        if(matchup.dangerHigh == false && aiLiquidity.cheapestDefenseCost != Infinity && players[aiSide].money > Math.max(aiLiquidity.cheapestDefenseCost * 2.7, 2400) && aiProfile.currentAction == null) {
            aiMatchTelemetry.aiCashFloatMoments++
        }
        if(visibleRound <= 3) {
            var earlyTowerLimit = visibleRound + 1
            if(aiTowerCount > earlyTowerLimit) {
                aiMatchTelemetry.aiEarlyTowerSpamMoments += aiTowerCount - earlyTowerLimit
            }
        }
        if(visibleRound >= 16 && aiFarms > 0 && (matchup.dangerHigh || aiLiquidity.canDevelopNow == false || matchup.safeToGreed == false)) {
            aiMatchTelemetry.aiLateFarmMoments += aiFarms
        }

        aiMatchTelemetry.lastSelfAuditTick = gameNow()
    }
}

function getBestAIEconomyUtilityOption(side, matchup) {
    var bestOption = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.sell, matchup)
    function considerUtilityOption(option) {
        if(!bestOption || isAIDecisionScoreBetter(option.decisionSample, bestOption.decisionSample)) bestOption = option
    }
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower || tower.playerSide != side) continue
        var sellValue = getAITowerSellValueEstimate(tower)
        var sellBank = tower.towerType == "farm" && tower.path2Upgrades >= 3 ? Math.max(0, Number(tower.towerVar) || 0) : 0
        var sellProceeds = sellValue + sellBank
        var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.sell, {
            id: "sell|" + tower.towerType + "|" + tower.towerID,
            type: tower.towerType,
            actionKey: "sell|" + tower.towerType,
            money: players[side].money,
            position: clamp(Math.log1p(sellProceeds) / Math.log(100001), 0, 1),
            x: tower.x,
            y: tower.y,
            tier1: tower.path1Upgrades,
            tier2: tower.path2Upgrades,
            tier3: tower.path3Upgrades,
            count: sellProceeds,
            countScale: 6000,
            tower: tower,
            capabilityScale: -1,
            capabilityFacts: { cashDelta: sellProceeds },
        }, matchup, decisionState)
        considerUtilityOption({ type: "sell", tower: tower, score: decision.score, decisionSample: decision })
        if(tower.towerType == "farm" && tower.path2Upgrades >= 3 && tower.towerVar > 0) {
            var collectDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.sell, {
                id: "collect|farm|" + tower.towerID,
                type: "collect|farm",
                actionKey: "collect|farm",
                money: players[side].money,
                position: clamp(Math.log1p(tower.towerVar) / Math.log(100001), 0, 1),
                x: tower.x,
                y: tower.y,
                tier1: tower.path1Upgrades,
                tier2: tower.path2Upgrades,
                tier3: tower.path3Upgrades,
                count: tower.towerVar,
                countScale: 6000,
                capabilityFacts: { cashDelta: tower.towerVar },
            }, matchup, decisionState)
            considerUtilityOption({ type: "collectFarm", tower: tower, score: collectDecision.score, decisionSample: collectDecision })
        }
    }
    for(var bananaIndex = 0; bananaIndex < bananas.length; bananaIndex++) {
        var banana = bananas[bananaIndex]
        if(!banana || banana.playerSide != side) continue
        var bananaDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.sell, {
            id: "collect|banana|" + banana.parentID + "|" + bananaIndex,
            type: "collect|banana",
            actionKey: "collect|banana",
            money: players[side].money,
            position: clamp((banana.lifespan - gameNow()) / 10000, 0, 1),
            x: banana.x,
            y: banana.y,
            count: Math.max(0, Number(banana.cashGiven) || 0),
            countScale: 6000,
            capabilityFacts: { cashDelta: banana.cashGiven, effectDuration: Math.max(0, banana.lifespan - gameNow()) },
        }, matchup, decisionState)
        considerUtilityOption({ type: "collectBanana", banana: banana, score: bananaDecision.score, decisionSample: bananaDecision })
    }
    return bestOption
}

function getTowerCurrentSignature(tower) {
    if(!tower) {
        return "000"
    }

    return String(tower.path1Upgrades) + String(tower.path2Upgrades) + String(tower.path3Upgrades)
}

function getCrosspathContextKeyForMatchup(towerType, matchup) {
    if(towerType == "farm" || towerType == "farmer") {
        return matchup.safeToGreed && getCurrentVisibleRound() <= 12 ? "greed" : "balanced"
    }
    if(matchup.playerThreat.heavyCount >= 1) {
        return "heavy"
    }
    if(matchup.playerThreat.count >= 12 || matchup.playerThreat.score >= 15) {
        return "swarm"
    }
    if(matchup.enemyVulnerable) {
        return "pressure"
    }
    if(matchup.safeToGreed) {
        return "greed"
    }
    return "balanced"
}

function getCrosspathCandidatesForTowerType(towerType) {
    if(towerType == "farm") {
        return [[2, 3, 0], [0, 2, 3]]
    }
    if(towerType == "dart") {
        return [[3, 2, 0], [0, 2, 3], [2, 3, 0]]
    }
    if(towerType == "tack") {
        return [[3, 2, 0], [0, 2, 3], [2, 0, 3]]
    }
    if(towerType == "wizard") {
        return [[0, 2, 3], [2, 0, 3], [2, 3, 0]]
    }
    if(towerType == "bomb") {
        return [[0, 2, 3], [2, 0, 3]]
    }
    if(towerType == "ice") {
        return [[2, 3, 0], [0, 2, 3], [3, 2, 0]]
    }
    if(towerType == "mortar") {
        return [[2, 3, 0], [0, 2, 3]]
    }
    if(towerType == "dartling") {
        return [[0, 2, 3], [2, 3, 0]]
    }
    if(towerType == "ninja") {
        return [[1, 3, 2], [2, 0, 3]]
    }
    if(towerType == "sniper") {
        return [[3, 2, 0], [2, 3, 0]]
    }
    if(towerType == "engi") {
        return [[3, 1, 2], [1, 3, 2]]
    }
    if(towerType == "buccaneer") {
        return [[3, 2, 0], [0, 2, 3], [2, 0, 3]]
    }
    if(towerType == "boomer") {
        return [[2, 3, 0], [2, 0, 3]]
    }
    if(towerType == "super") {
        return [[2, 3, 0], [3, 2, 0]]
    }
    if(towerType == "cobra") {
        return [[2, 3, 0], [0, 2, 3]]
    }
    if(towerType == "sword") {
        return [[3, 2, 0], [0, 3, 2], [2, 0, 3]]
    }

    return [[3, 2, 0]]
}

function noteAITowerCrosspathContext(tower, matchup) {
    if(!tower || tower.towerType == "farmer") {
        return
    }

    tower.aiCrosspathContexts = tower.aiCrosspathContexts || {}
    var contextKey = getCrosspathContextKeyForMatchup(tower.towerType, matchup)
    tower.aiCrosspathContexts[contextKey] = (tower.aiCrosspathContexts[contextKey] || 0) + 1
}

function getTowerDominantCrosspathContext(tower) {
    if(!tower || !tower.aiCrosspathContexts) {
        return "balanced"
    }

    var bestContext = "balanced"
    var bestCount = 0
    for(var i = 0; i < AI_CROSSPATH_CONTEXT_KEYS.length; i++) {
        var contextKey = AI_CROSSPATH_CONTEXT_KEYS[i]
        var contextCount = tower.aiCrosspathContexts[contextKey] || 0
        if(contextCount > bestCount) {
            bestCount = contextCount
            bestContext = contextKey
        }
    }
    return bestContext
}

function getHypotheticalTowerAfterUpgrade(tower, pathNumber) {
    var clone = cloneTowerUpgradeState(tower)
    clone["path" + pathNumber + "Upgrades"]++
    if(pathNumber == 1 && typeof applyPath1UpgradeEffects == "function") applyPath1UpgradeEffects(clone)
    if(pathNumber == 2 && typeof applyPath2UpgradeEffects == "function") applyPath2UpgradeEffects(clone)
    if(pathNumber == 3 && typeof applyPath3UpgradeEffects == "function") applyPath3UpgradeEffects(clone)
    return clone
}

function getBestTowerUpgradeOption(side, matchup, defenseMath) {
    var bestOption = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.upgrade, matchup)
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(tower.playerSide != side || tower.towerType == "farmer") {
            continue
        }
        for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
            if(canTowerUpgradePathNow(side, tower, pathNumber) == false) {
                continue
            }

            var upgradeCost = tower["path" + pathNumber + "Cost"][tower["path" + pathNumber + "Upgrades"]]
            var hypotheticalTower = getHypotheticalTowerAfterUpgrade(tower, pathNumber)
            var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.upgrade, {
                id: "upgrade|" + tower.towerType + "|" + tower.towerID + "|" + pathNumber,
                type: tower.towerType,
                role: tower.towerType,
                actionKey: "upgrade|" + tower.towerType + "|" + pathNumber,
                cost: upgradeCost,
                money: players[side].money,
                x: tower.x,
                y: tower.y,
                index: pathNumber - 1,
                maxIndex: 2,
                tier1: hypotheticalTower.path1Upgrades,
                tier2: hypotheticalTower.path2Upgrades,
                tier3: hypotheticalTower.path3Upgrades,
                capabilityBefore: getAITowerCapabilityFacts(tower),
                capabilityAfter: getAITowerCapabilityFacts(hypotheticalTower),
            }, matchup, decisionState)

            var option = {
                type: "upgrade",
                tower: tower,
                pathNumber: pathNumber,
                score: decision.score,
                decisionSample: decision,
            }
            if(!bestOption || isAIDecisionScoreBetter(decision, bestOption.decisionSample)) {
                bestOption = option
            }
        }
    }

    return bestOption
}

function getLearnedPlacementOption(side, image, matchup, defenseMath) {
    var towerConfig = LOADOUT_TOWER_CONFIG[image]
    if(!towerConfig) return null
    var role = getStrategyPlacementRoleForImage(image)
    var spotIndex = getSideTowersByType(side, towerConfig.towerType).length
    var spot = findAISpot(side, towerConfig.radius, towerConfig.range, role, spotIndex, towerConfig.towerType)
    if(!spot) return null
    var decision = spot.decisionSample || scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
        id: "place|" + towerConfig.towerType + "|" + role + "|" + Math.round(spot.x) + "|" + Math.round(spot.y),
        type: towerConfig.towerType,
        role: role,
        actionKey: "place|" + towerConfig.towerType + "|" + role,
        cost: getTowerPriceByImage(image),
        money: players[side].money,
        x: spot.x,
        y: spot.y,
        count: getSideTowersByType(side, towerConfig.towerType).length,
    }, matchup)
    return {
        type: "place",
        image: image,
        targetX: spot.x,
        targetY: spot.y,
        score: decision.score,
        decisionSample: decision,
    }
}

function getLearnedFarmerPlacementOption(side, matchup) {
    if(players[side].money < baseFarmerPrice) return null
    var spot = findAISpot(side, 30, 250, "farmer", getSideTowersByType(side, "farmer").length, "farmer")
    if(!spot) return null
    return {
        type: "placeFarmer",
        targetX: spot.x,
        targetY: spot.y,
        score: spot.decisionSample.score,
        decisionSample: spot.decisionSample,
    }
}

function getBestPlacementOption(side, matchup, defenseMath) {
    var strategy = getCurrentAIStrategy()
    var candidateImages = strategy.towers
    var bestOption = null
    for(var i = 0; i < candidateImages.length; i++) {
        var image = candidateImages[i]
        if(players[side].money < getTowerPriceByImage(image)) {
            continue
        }
        var option = getLearnedPlacementOption(side, image, matchup, defenseMath)
        if(!option) {
            continue
        }
        if(!bestOption || option.score > bestOption.score) {
            bestOption = option
        }
    }
    var farmerOption = getLearnedFarmerPlacementOption(side, matchup)
    if(farmerOption && (!bestOption || farmerOption.score > bestOption.score)) bestOption = farmerOption

    return bestOption
}

function requestAIDefenseOption(side, option, priority) {
    if(!option) {
        return false
    }

    if(option.type == "upgrade") {
        return aiRequestUpgradeTower(side, option.tower, option.pathNumber, priority, option.decisionSample)
    }
    if(option.type == "placeFarmer") {
        return setAIAction({
            type: "placeFarmer",
            side: side,
            targetX: option.targetX,
            targetY: option.targetY,
            priority: priority,
            decisionSample: option.decisionSample,
        })
    }
    if(option.type == "sell") return aiRequestSellTower(side, option.tower, priority, option.decisionSample)
    if(option.type == "collectFarm") return aiRequestCollectFarm(side, option.tower, priority, option.decisionSample)
    if(option.type == "collectBanana") return aiRequestCollectBanana(side, option.banana, priority, option.decisionSample)

    return aiRequestPlaceTowerImage(side, option.image, priority, option.decisionSample, option.targetX, option.targetY)
}

function getBestDefenseOption(side, matchup) {
    var defenseMath = matchup.defenseMath
    var bestUpgrade = getBestTowerUpgradeOption(side, matchup, defenseMath)
    var bestPlacement = getBestPlacementOption(side, matchup, defenseMath)
    var economyUtility = getBestAIEconomyUtilityOption(side, matchup)
    var candidates = []
    if(bestUpgrade) {
        candidates.push(bestUpgrade)
    }
    if(bestPlacement) {
        candidates.push(bestPlacement)
    }
    if(economyUtility) {
        candidates.push(economyUtility)
    }
    if(candidates.length == 0) {
        return null
    }

    var actionableCandidates = []
    var bestNoOp = null
    for(var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
        var candidate = candidates[candidateIndex]
        var familyIndex = candidate.decisionSample.familyIndex
        var noOp = scoreAIDecisionCandidate(side, familyIndex, {
            id: "noop|" + familyIndex,
            type: "noop",
            actionKey: "noop",
            noop: true,
        }, matchup, candidate.decisionSample.stateFeatures)
        if(isAIDecisionScoreBetter(noOp, bestNoOp)) bestNoOp = noOp
        if(isAIDecisionScoreBetter(noOp, candidate.decisionSample) == false) actionableCandidates.push(candidate)
    }
    if(actionableCandidates.length == 0) {
        recordAINoOpDecision(bestNoOp)
        return null
    }

    actionableCandidates.sort(function(a, b) {
        if(a.score != b.score) return b.score - a.score
        return a.decisionSample.id < b.decisionSample.id ? -1 : 1
    })
    return actionableCandidates[0]
}

function runAIDefense(side) {
    var matchup = getCurrentPlayerMatchupStyle(side)
    if(aiProfile.currentAction) return

    var bestOption = getBestDefenseOption(side, matchup)
    if(bestOption && requestAIDefenseOption(side, bestOption, AI_ACTION_PRIORITY.normal)) {
        return
    }
}

function runAIOffense(side) {
    var matchup = getCurrentPlayerMatchupStyle(side)

    aiSelectEcoSend(side, matchup)
    aiQueueRush(side, matchup)
}

function runAIBoosts(side) {
    var matchup = getCurrentPlayerMatchupStyle(side)
    var boostChecks = [
        { type: "towerboost.png", family: "defenseBoost" },
        { type: "lightningboost.png", family: "defenseBoost" },
        { type: "slowboost.png", family: "offenseBoost" },
        { type: "bloonboost.png", family: "offenseBoost" },
        { type: "ecoboost.png", family: "eco" },
    ]
    var stateFeatures = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.boost, matchup)
    var bestBoost = null
    for(var i = 0; i < boostChecks.length; i++) {
        var candidate = boostChecks[i]
        var slot = getBoostSlotByType(side, candidate.type)
        if(slot == -1 || getBoostCount(side, slot) <= 0 || getBoostExpires(side, slot) + BOOST_SETTINGS.cooldownMs > gameNow()) {
            continue
        }
        candidate.decisionSample = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.boost, {
            id: "boost|" + candidate.type,
            type: candidate.type,
            role: candidate.family,
            actionKey: "boost|" + candidate.type.replace(".png", ""),
            index: i,
            maxIndex: boostChecks.length - 1,
            count: getBoostCount(side, slot),
            countScale: BOOST_SETTINGS.charges,
            cooldownReady: true,
            boostType: candidate.type,
        }, matchup, stateFeatures)
        if(!bestBoost || isAIDecisionScoreBetter(candidate.decisionSample, bestBoost.decisionSample)) {
            bestBoost = candidate
        }
    }
    if(!bestBoost) {
        return
    }
    var noOpDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.boost, {
        id: "boost|noop",
        type: "noop",
        actionKey: "noop",
        noop: true,
    }, matchup, stateFeatures)
    if(isAIDecisionScoreBetter(noOpDecision, bestBoost.decisionSample)) {
        recordAINoOpDecision(noOpDecision)
        return
    }
    aiTryUseBoostType(side, bestBoost.type, bestBoost.decisionSample)
}

function isAIPaidActionPending() {
    var action = aiProfile.currentAction
    return !!action && (action.type == "placeTower" || action.type == "upgradeTower" || action.type == "sellTower")
}

function runAIGameplayDecisionCycle(side) {
    handleAIRoundStartBoosts(side)
    updateAIMatchTelemetry()
    runAIDefense(side)
    if(isAIPaidActionPending()) {
        players[side].autoEco = false
    } else {
        runAIOffense(side)
    }
    runAIBoosts(side)
}

function runAI() {
    if(aiEnabled == false) {
        return
    }
    if(gameOver) {
        finalizeAIMatchLearning()
        return
    }
    if(gamePaused) {
        return
    }

    if(gameStarted == false) {
        runAIPregameSelection(aiSide)
        return
    }

    updateAITowerDamageRates()
    runAIGameplayDecisionCycle(aiSide)
}

function tickAIControllers() {
    if(aiEnabled == false) {
        return
    }

    var now = gameNow()
    if(now >= aiTickState.lastLogicAt + 250) {
        aiTickState.lastLogicAt = now
        runAI()
    }
    if(now >= aiTickState.lastCursorAt + keyMsCooldown) {
        aiTickState.lastCursorAt = now
        runAICursor()
    }
}

ensureAILearningLoaded()

function handleAIWindowFocus() {
    updateAIPregameObservePauseState()
    if(AI_CROSS_MATCH_LEARNING_ENABLED && (frontMenuState == "stats" || aiPersistenceState.lastLoadedAt <= 0 || realNow() - aiPersistenceState.lastLoadedAt >= 60000)) {
        refreshAILearningFromBackend(false)
    }
    if(frontMenuState == "stats" || aiTrainerStatusState.lastLoadedAt <= 0 || realNow() - aiTrainerStatusState.lastLoadedAt >= AI_TRAINING_STATUS_REFRESH_INTERVAL) {
        refreshAITrainerStatus(false)
    }
}

document.addEventListener("visibilitychange", updateAIPregameObservePauseState)
addEventListener("blur", updateAIPregameObservePauseState)
addEventListener("focus", handleAIWindowFocus)
nativeSetInterval(function() {
    if(document.hidden == false && frontMenuState == "stats") refreshAITrainerStatus(false)
}, AI_TRAINING_STATUS_REFRESH_INTERVAL)
