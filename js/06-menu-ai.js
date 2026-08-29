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
}

var aiDesiredLoadoutTowers = ["000farm.png", "000wizard.png", "000bomb.png"]
var aiDesiredLoadoutBoosts = ["towerboost.png", "bloonboost.png"]
var AI_BOOST_IMAGES = ["towerboost.png", "bloonboost.png", "lightningboost.png", "slowboost.png", "ecoboost.png"]
var AI_IS_LOCAL_RUNTIME = typeof window != "undefined" && (window.location.protocol == "file:" || window.location.hostname == "" || window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")
var AI_CROSS_MATCH_LEARNING_ENABLED = !AI_IS_LOCAL_RUNTIME
var AI_LEARNING_ENDPOINT = "ai-learning.php?protocol=1"
var AI_CONTRIBUTION_STORAGE_KEY = "aiPendingContributionsV1"
var AI_MAX_PENDING_CONTRIBUTIONS = 8
var AI_MAX_CONTRIBUTION_OBSERVATIONS = 320
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
var AI_DECISION_STATE_INPUT_SIZE = 48
var AI_DECISION_CANDIDATE_INPUT_SIZE = 32
var AI_DECISION_STATE_HIDDEN_SIZE = 96
var AI_DECISION_CANDIDATE_HIDDEN_SIZE = 48
var AI_DECISION_EMBEDDING_SIZE = 48
var AI_DECISION_FAMILY_COUNT = 8
var AI_DECISION_BOOTSTRAP_SAMPLES = 5000
var AI_MAX_PUBLIC_DECISION_SAMPLES = 32
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
var AI_LEARNING_SCHEMA_VERSION = 9
var AI_MODEL_FAMILY = "shared-neural-controller-v1"
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
    {
        id: "arcane_banks",
        baseBias: 0.42,
        towers: ["000farm.png", "000wizard.png", "000bomb.png"],
        boosts: ["towerboost.png", "bloonboost.png"],
        placementProfile: "balanced",
        rushRound: 18,
        rushMoney: 4200,
        ecoFloor: 3200,
        rushBias: 0.72,
        placementRoles: {
            "000farm.png": "farm",
            "000wizard.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000wizard.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 300 },
            { round: 20, image: "000wizard.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 26, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 400 },
            { round: 34, image: "000wizard.png", maxCount: 3, role: "core", buffer: 1000 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000wizard.png": [3, 2, 1],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "shadow_stall",
        baseBias: 0.27,
        towers: ["000farm.png", "000ninja.png", "000bomb.png"],
        boosts: ["towerboost.png", "lightningboost.png"],
        placementProfile: "spread",
        rushRound: 20,
        rushMoney: 4600,
        ecoFloor: 3400,
        rushBias: 0.5,
        placementRoles: {
            "000farm.png": "farm",
            "000ninja.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000ninja.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 22, image: "000ninja.png", maxCount: 2, role: "core", buffer: 300 },
            { round: 28, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 450 },
            { round: 36, image: "000ninja.png", maxCount: 3, role: "core", buffer: 1200 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000ninja.png": [1, 3, 2],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "sniper_econ",
        baseBias: 0.22,
        towers: ["000farm.png", "000sniper.png", "000bomb.png"],
        boosts: ["towerboost.png", "ecoboost.png"],
        placementProfile: "safe",
        rushRound: 22,
        rushMoney: 5200,
        ecoFloor: 3600,
        rushBias: 0.35,
        placementRoles: {
            "000farm.png": "farm",
            "000sniper.png": "support",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000sniper.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 6, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 300 },
            { round: 22, image: "000sniper.png", maxCount: 2, role: "support", buffer: 500 },
            { round: 28, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 500 },
            { round: 36, image: "000sniper.png", maxCount: 3, role: "support", buffer: 1500 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000sniper.png": [3, 2, 1],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "cobra_punish",
        baseBias: 0.18,
        towers: ["000cobra.png", "000wizard.png", "000bomb.png"],
        boosts: ["slowboost.png", "bloonboost.png"],
        placementProfile: "aggressive",
        rushRound: 14,
        rushMoney: 2600,
        ecoFloor: 2200,
        rushBias: 1,
        placementRoles: {
            "000cobra.png": "support",
            "000wizard.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000wizard.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 4, image: "000cobra.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 10, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 16, image: "000cobra.png", maxCount: 2, role: "support", buffer: 200 },
            { round: 22, image: "000wizard.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 26, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 350 },
            { round: 32, image: "000cobra.png", maxCount: 3, role: "support", buffer: 700 },
        ],
        upgradePrefs: {
            "000cobra.png": [2, 3, 1],
            "000wizard.png": [3, 2, 1],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "arcane_super",
        baseBias: 0.14,
        towers: ["000farm.png", "000wizard.png", "000super.png"],
        boosts: ["towerboost.png", "ecoboost.png"],
        placementProfile: "safe",
        rushRound: 24,
        rushMoney: 6000,
        ecoFloor: 4200,
        rushBias: 0.28,
        placementRoles: {
            "000farm.png": "farm",
            "000wizard.png": "core",
            "000super.png": "elite",
        },
        buildPlan: [
            { round: 1, image: "000wizard.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 300 },
            { round: 22, image: "000wizard.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 28, image: "000super.png", maxCount: 1, role: "elite", buffer: 0 },
            { round: 34, image: "000farm.png", maxCount: 3, role: "farm", buffer: 500 },
            { round: 40, image: "000super.png", maxCount: 2, role: "elite", buffer: 3000 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000wizard.png": [3, 2, 1],
            "000super.png": [3, 2, 1],
        },
    },
    {
        id: "artillery_grid",
        baseBias: 0.17,
        towers: ["000farm.png", "000mortar.png", "000bomb.png"],
        boosts: ["towerboost.png", "slowboost.png"],
        placementProfile: "safe",
        rushRound: 19,
        rushMoney: 4300,
        ecoFloor: 3000,
        rushBias: 0.44,
        placementRoles: {
            "000farm.png": "farm",
            "000mortar.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000mortar.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 6, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 250 },
            { round: 20, image: "000mortar.png", maxCount: 2, role: "core", buffer: 350 },
            { round: 28, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 400 },
            { round: 36, image: "000mortar.png", maxCount: 3, role: "core", buffer: 1400 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000mortar.png": [2, 1, 3],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "laser_lane",
        baseBias: 0.16,
        towers: ["000farm.png", "000dartling.png", "000wizard.png"],
        boosts: ["towerboost.png", "ecoboost.png"],
        placementProfile: "balanced",
        rushRound: 18,
        rushMoney: 4000,
        ecoFloor: 3200,
        rushBias: 0.52,
        placementRoles: {
            "000farm.png": "farm",
            "000dartling.png": "core",
            "000wizard.png": "support",
        },
        buildPlan: [
            { round: 1, image: "000dartling.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 9, image: "000wizard.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 22, image: "000dartling.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 28, image: "000wizard.png", maxCount: 2, role: "support", buffer: 500 },
            { round: 36, image: "000dartling.png", maxCount: 3, role: "core", buffer: 1200 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000dartling.png": [2, 1, 3],
            "000wizard.png": [3, 2, 1],
        },
    },
    {
        id: "engineer_shells",
        baseBias: 0.12,
        towers: ["000farm.png", "000engi.png", "000bomb.png"],
        boosts: ["towerboost.png", "lightningboost.png"],
        placementProfile: "spread",
        rushRound: 21,
        rushMoney: 4700,
        ecoFloor: 3300,
        rushBias: 0.38,
        placementRoles: {
            "000farm.png": "farm",
            "000engi.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000engi.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 6, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 250 },
            { round: 22, image: "000engi.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 28, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 400 },
            { round: 36, image: "000engi.png", maxCount: 3, role: "core", buffer: 1400 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000engi.png": [1, 3, 2],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "boomer_pressure",
        baseBias: 0.13,
        towers: ["000farm.png", "000boomer.png", "000wizard.png"],
        boosts: ["towerboost.png", "bloonboost.png"],
        placementProfile: "aggressive",
        rushRound: 17,
        rushMoney: 3600,
        ecoFloor: 2800,
        rushBias: 0.66,
        placementRoles: {
            "000farm.png": "farm",
            "000boomer.png": "core",
            "000wizard.png": "support",
        },
        buildPlan: [
            { round: 1, image: "000boomer.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 9, image: "000wizard.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 17, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 20, image: "000boomer.png", maxCount: 2, role: "core", buffer: 200 },
            { round: 28, image: "000wizard.png", maxCount: 2, role: "support", buffer: 500 },
            { round: 36, image: "000boomer.png", maxCount: 3, role: "core", buffer: 1300 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000boomer.png": [1, 2, 3],
            "000wizard.png": [3, 2, 1],
        },
    },
    {
        id: "tack_shells",
        baseBias: 0.11,
        towers: ["000farm.png", "000tack.png", "000bomb.png"],
        boosts: ["towerboost.png", "lightningboost.png"],
        placementProfile: "balanced",
        rushRound: 17,
        rushMoney: 3600,
        ecoFloor: 2900,
        rushBias: 0.6,
        placementRoles: {
            "000farm.png": "farm",
            "000tack.png": "core",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000tack.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 11, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 17, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 20, image: "000tack.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 26, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 350 },
            { round: 34, image: "000tack.png", maxCount: 3, role: "core", buffer: 1100 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000tack.png": [1, 2, 3],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "frost_shells",
        baseBias: 0.1,
        towers: ["000farm.png", "000ice.png", "000bomb.png"],
        boosts: ["towerboost.png", "slowboost.png"],
        placementProfile: "safe",
        rushRound: 19,
        rushMoney: 4100,
        ecoFloor: 3000,
        rushBias: 0.42,
        placementRoles: {
            "000farm.png": "farm",
            "000ice.png": "support",
            "000bomb.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000ice.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 6, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 12, image: "000bomb.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 250 },
            { round: 22, image: "000ice.png", maxCount: 2, role: "support", buffer: 250 },
            { round: 28, image: "000bomb.png", maxCount: 2, role: "antiMoab", buffer: 400 },
            { round: 36, image: "000ice.png", maxCount: 3, role: "support", buffer: 1200 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000ice.png": [1, 3, 2],
            "000bomb.png": [2, 3, 1],
        },
    },
    {
        id: "dart_marksman",
        baseBias: 0.09,
        towers: ["000farm.png", "000dart.png", "000sniper.png"],
        boosts: ["towerboost.png", "ecoboost.png"],
        placementProfile: "spread",
        rushRound: 20,
        rushMoney: 4300,
        ecoFloor: 3200,
        rushBias: 0.4,
        placementRoles: {
            "000farm.png": "farm",
            "000dart.png": "core",
            "000sniper.png": "antiMoab",
        },
        buildPlan: [
            { round: 1, image: "000dart.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 10, image: "000sniper.png", maxCount: 1, role: "antiMoab", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 22, image: "000dart.png", maxCount: 2, role: "core", buffer: 200 },
            { round: 28, image: "000sniper.png", maxCount: 2, role: "antiMoab", buffer: 400 },
            { round: 36, image: "000dart.png", maxCount: 3, role: "core", buffer: 900 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000dart.png": [1, 2, 3],
            "000sniper.png": [3, 2, 1],
        },
    },
    {
        id: "sword_arcane",
        baseBias: 0.1,
        towers: ["000farm.png", "000sword.png", "000wizard.png"],
        boosts: ["towerboost.png", "bloonboost.png"],
        placementProfile: "aggressive",
        rushRound: 18,
        rushMoney: 3800,
        ecoFloor: 2900,
        rushBias: 0.62,
        placementRoles: {
            "000farm.png": "farm",
            "000sword.png": "elite",
            "000wizard.png": "support",
        },
        buildPlan: [
            { round: 1, image: "000sword.png", maxCount: 1, role: "elite", buffer: 0 },
            { round: 5, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 9, image: "000wizard.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 22, image: "000sword.png", maxCount: 2, role: "elite", buffer: 250 },
            { round: 28, image: "000wizard.png", maxCount: 2, role: "support", buffer: 400 },
            { round: 36, image: "000sword.png", maxCount: 3, role: "elite", buffer: 1200 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000sword.png": [3, 2, 1],
            "000wizard.png": [3, 2, 1],
        },
    },
    {
        id: "tack_shadow",
        baseBias: 0.09,
        towers: ["000farm.png", "000tack.png", "000ninja.png"],
        boosts: ["lightningboost.png", "bloonboost.png"],
        placementProfile: "aggressive",
        rushRound: 16,
        rushMoney: 3400,
        ecoFloor: 2700,
        rushBias: 0.7,
        placementRoles: {
            "000farm.png": "farm",
            "000tack.png": "core",
            "000ninja.png": "support",
        },
        buildPlan: [
            { round: 1, image: "000tack.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 4, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 9, image: "000ninja.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 16, image: "000farm.png", maxCount: 2, role: "farm", buffer: 200 },
            { round: 20, image: "000tack.png", maxCount: 2, role: "core", buffer: 150 },
            { round: 26, image: "000ninja.png", maxCount: 2, role: "support", buffer: 350 },
            { round: 34, image: "000tack.png", maxCount: 3, role: "core", buffer: 900 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000tack.png": [1, 2, 3],
            "000ninja.png": [1, 3, 2],
        },
    },
    {
        id: "ice_arcane",
        baseBias: 0.08,
        towers: ["000farm.png", "000ice.png", "000wizard.png"],
        boosts: ["slowboost.png", "lightningboost.png"],
        placementProfile: "safe",
        rushRound: 20,
        rushMoney: 4200,
        ecoFloor: 3100,
        rushBias: 0.33,
        placementRoles: {
            "000farm.png": "farm",
            "000ice.png": "support",
            "000wizard.png": "core",
        },
        buildPlan: [
            { round: 1, image: "000wizard.png", maxCount: 1, role: "core", buffer: 0 },
            { round: 6, image: "000farm.png", maxCount: 1, role: "farm", buffer: 0 },
            { round: 10, image: "000ice.png", maxCount: 1, role: "support", buffer: 0 },
            { round: 18, image: "000farm.png", maxCount: 2, role: "farm", buffer: 250 },
            { round: 22, image: "000wizard.png", maxCount: 2, role: "core", buffer: 250 },
            { round: 28, image: "000ice.png", maxCount: 2, role: "support", buffer: 350 },
            { round: 36, image: "000wizard.png", maxCount: 3, role: "core", buffer: 1200 },
        ],
        upgradePrefs: {
            "000farm.png": [3, 2, 1],
            "000ice.png": [1, 3, 2],
            "000wizard.png": [3, 2, 1],
        },
    },
]
function cloneAIStrategyVariant(strategy) {
    return JSON.parse(JSON.stringify(strategy))
}

function adjustAIStrategyBuildPlan(strategy, roundDelta, farmBufferDelta, combatBufferDelta) {
    for(var i = 0; i < strategy.buildPlan.length; i++) {
        strategy.buildPlan[i].round = Math.max(1, strategy.buildPlan[i].round + roundDelta)
        if(strategy.buildPlan[i].role == "farm") {
            strategy.buildPlan[i].buffer = Math.max(0, strategy.buildPlan[i].buffer + farmBufferDelta)
        } else {
            strategy.buildPlan[i].buffer = Math.max(0, strategy.buildPlan[i].buffer + combatBufferDelta)
        }
    }
}

function getAIStrategyVariantBoosts(baseStrategy, variantType) {
    if(variantType == "greedy") {
        return ["towerboost.png", "ecoboost.png"]
    }
    if(variantType == "pressure") {
        return baseStrategy.towers.indexOf("000cobra.png") != -1 ? ["slowboost.png", "bloonboost.png"] : ["towerboost.png", "bloonboost.png"]
    }
    if(variantType == "defensive") {
        return baseStrategy.towers.indexOf("000ice.png") != -1 || baseStrategy.towers.indexOf("000bomb.png") != -1 ? ["towerboost.png", "lightningboost.png"] : ["towerboost.png", "slowboost.png"]
    }
    return baseStrategy.boosts.slice(0)
}

function createAIStrategyVariant(baseStrategy, variantType) {
    var strategy = cloneAIStrategyVariant(baseStrategy)
    strategy.id = baseStrategy.id + "_" + variantType

    if(variantType == "greedy") {
        strategy.baseBias += 0.015
        strategy.placementProfile = "safe"
        strategy.rushRound += 2
        strategy.rushMoney += 1100
        strategy.ecoFloor += 700
        strategy.rushBias = Math.max(0.1, strategy.rushBias - 0.2)
        strategy.boosts = getAIStrategyVariantBoosts(baseStrategy, variantType)
        adjustAIStrategyBuildPlan(strategy, 1, 250, 100)
    } else if(variantType == "pressure") {
        strategy.baseBias += 0.01
        strategy.placementProfile = "aggressive"
        strategy.rushRound = Math.max(10, strategy.rushRound - 2)
        strategy.rushMoney = Math.max(1800, strategy.rushMoney - 1000)
        strategy.ecoFloor = Math.max(1800, strategy.ecoFloor - 500)
        strategy.rushBias = Math.min(1.15, strategy.rushBias + 0.18)
        strategy.boosts = getAIStrategyVariantBoosts(baseStrategy, variantType)
        adjustAIStrategyBuildPlan(strategy, -1, -100, -120)
    } else if(variantType == "defensive") {
        strategy.baseBias += 0.008
        strategy.placementProfile = strategy.placementProfile == "aggressive" ? "balanced" : "safe"
        strategy.rushRound += 1
        strategy.rushMoney += 500
        strategy.ecoFloor += 250
        strategy.rushBias = Math.max(0.15, strategy.rushBias - 0.08)
        strategy.boosts = getAIStrategyVariantBoosts(baseStrategy, variantType)
        adjustAIStrategyBuildPlan(strategy, 0, 100, 120)
    } else if(variantType == "tempo") {
        strategy.baseBias += 0.006
        strategy.placementProfile = baseStrategy.placementProfile == "safe" ? "balanced" : baseStrategy.placementProfile
        strategy.rushRound = Math.max(10, strategy.rushRound - 1)
        strategy.rushMoney = Math.max(1800, strategy.rushMoney - 350)
        strategy.ecoFloor += 100
        strategy.rushBias = Math.min(1.1, strategy.rushBias + 0.08)
        strategy.boosts = getAIStrategyVariantBoosts(baseStrategy, variantType)
        adjustAIStrategyBuildPlan(strategy, 0, 50, -40)
    }

    return strategy
}

var aiBaseStrategiesForVariants = AI_STRATEGY_LIBRARY.slice(0)
for(var aiBaseStrategyIndex = 0; aiBaseStrategyIndex < aiBaseStrategiesForVariants.length; aiBaseStrategyIndex++) {
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "greedy"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "pressure"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "defensive"))
    AI_STRATEGY_LIBRARY.push(createAIStrategyVariant(aiBaseStrategiesForVariants[aiBaseStrategyIndex], "tempo"))
}

var AI_PLACEMENT_PROFILES = {
    balanced: {
        farmAnchorY: 0.17,
        farmOffsets: [{ x: 0, y: 0 }, { x: 88, y: 0 }, { x: 0, y: 88 }, { x: 88, y: 88 }, { x: 176, y: 0 }, { x: 0, y: 176 }],
        roleY: { core: [0.5, 0.38, 0.62], antiMoab: [0.62, 0.5, 0.36], support: [0.68, 0.54, 0.4], elite: [0.56, 0.7, 0.44] },
    },
    spread: {
        farmAnchorY: 0.16,
        farmOffsets: [{ x: 0, y: 0 }, { x: 96, y: 16 }, { x: 24, y: 108 }, { x: 120, y: 100 }, { x: 200, y: 8 }, { x: 112, y: 192 }],
        roleY: { core: [0.36, 0.64, 0.5], antiMoab: [0.56, 0.72, 0.42], support: [0.28, 0.58, 0.44], elite: [0.62, 0.46, 0.78] },
    },
    safe: {
        farmAnchorY: 0.14,
        farmOffsets: [{ x: 0, y: 0 }, { x: 76, y: 0 }, { x: 0, y: 92 }, { x: 76, y: 92 }, { x: 152, y: 0 }, { x: 0, y: 184 }],
        roleY: { core: [0.62, 0.74, 0.5], antiMoab: [0.68, 0.54, 0.4], support: [0.76, 0.62, 0.48], elite: [0.58, 0.72, 0.44] },
    },
    aggressive: {
        farmAnchorY: 0.2,
        farmOffsets: [{ x: 0, y: 0 }, { x: 92, y: 0 }, { x: 0, y: 78 }, { x: 92, y: 78 }, { x: 184, y: 0 }, { x: 0, y: 156 }],
        roleY: { core: [0.36, 0.48, 0.6], antiMoab: [0.44, 0.56, 0.68], support: [0.32, 0.44, 0.58], elite: [0.48, 0.62, 0.74] },
    },
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
        return AI_CROSS_MATCH_LEARNING_ENABLED == false || aiPersistenceState.loadInFlight
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
        var heuristicScore = getAILoadoutCounterHeuristicBonus(loadout.summary, observedLoadoutSummary)
        heuristicScore += getAILoadoutCounterLearningBonus(loadout.key, observedLoadoutSummary)
        heuristicScore += getAILoadoutPerformanceBonus(loadout.key)
        heuristicScore += getAILoadoutExplorationBonus(loadout.key)
        heuristicScore += aiRandomWeight(0.035) * getAIDecisionBootstrapWeight(AI_DECISION_FAMILY.loadout)
        scoredLoadouts.push({ loadout: loadout, heuristicScore: heuristicScore })
    }
    var loadoutPolicy = getAIPolicyForDecision()
    var loadoutBootstrap = getAIDecisionBootstrapWeight(AI_DECISION_FAMILY.loadout, loadoutPolicy)
    var loadoutSeed = observedLoadoutSummary && observedLoadoutSummary.signature ? observedLoadoutSummary.signature : "unobserved"
    loadoutSeed += "|" + loadoutPolicy.decision.trainingSamples[AI_DECISION_FAMILY.loadout]
    for(var shortlistIndex = 0; shortlistIndex < scoredLoadouts.length; shortlistIndex++) {
        var shortlistEntry = scoredLoadouts[shortlistIndex]
        var stablePriority = getAIStableStringHash(loadoutSeed + "|" + shortlistEntry.loadout.key) / 4294967295 * 2 - 1
        shortlistEntry.shortlistPriority = Math.tanh(shortlistEntry.heuristicScore / 0.75) * loadoutBootstrap + stablePriority * (1 - loadoutBootstrap)
    }
    scoredLoadouts.sort(function(a, b) {
        if(b.shortlistPriority != a.shortlistPriority) return b.shortlistPriority - a.shortlistPriority
        return a.loadout.key < b.loadout.key ? -1 : 1
    })
    var bestEntry = null
    var stateFeatures = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.loadout, null, observedLoadoutSummary ? getObservedLoadoutFeatureVector(observedLoadoutSummary) : null)
    var candidateLimit = Math.min(128, scoredLoadouts.length)
    for(var candidateIndex = 0; candidateIndex < candidateLimit; candidateIndex++) {
        var entry = scoredLoadouts[candidateIndex]
        var summary = entry.loadout.summary
        entry.decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.loadout, {
            id: entry.loadout.key,
            type: summary.towerTypes.join(","),
            role: summary.boostImages.join(","),
            actionKey: "loadout|" + entry.loadout.key,
            heuristic: entry.heuristicScore,
            heuristicScale: 0.75,
            effect: summary.eco + summary.pressure + summary.heavy + summary.late,
            effectScale: 4,
            index: candidateIndex,
            maxIndex: Math.max(1, candidateLimit - 1),
            count: summary.filledTowerSlots + summary.filledBoostSlots,
            countScale: 5,
        }, null, stateFeatures)
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

function getDefaultAIUpgradePriorityForTowerType(towerType) {
    if(towerType == "farm") return [3, 2, 1]
    if(towerType == "wizard") return [3, 2, 1]
    if(towerType == "bomb") return [2, 3, 1]
    if(towerType == "mortar") return [2, 1, 3]
    if(towerType == "dartling") return [1, 2, 3]
    if(towerType == "ninja") return [1, 3, 2]
    if(towerType == "sniper") return [3, 2, 1]
    if(towerType == "engi") return [1, 3, 2]
    if(towerType == "boomer") return [1, 2, 3]
    if(towerType == "super") return [3, 2, 1]
    if(towerType == "cobra") return [2, 3, 1]
    if(towerType == "tack") return [1, 2, 3]
    if(towerType == "ice") return [1, 3, 2]
    if(towerType == "sword") return [3, 2, 1]
    if(towerType == "buccaneer") return [3, 2, 1]
    if(towerType == "dart") return [1, 2, 3]
    return [1, 2, 3]
}

function scoreAILoadoutRoleForTowerType(towerType, role) {
    if(role == "farm") {
        return towerType == "farm" ? 3 : -100
    }
    if(role == "elite") {
        if(towerType == "super") return 3
        if(towerType == "sword") return 2.6
        if(towerType == "dartling") return 1.8
    }
    if(role == "antiMoab") {
        if(towerType == "bomb") return 3
        if(towerType == "sniper") return 2.7
        if(towerType == "mortar") return 2.6
        if(towerType == "super") return 2.5
        if(towerType == "sword") return 2.35
        if(towerType == "dartling") return 2.2
        if(towerType == "boomer") return 1.7
        if(towerType == "buccaneer") return 1.6
    }
    if(role == "support") {
        if(towerType == "cobra") return 3
        if(towerType == "engi") return 2.8
        if(towerType == "ice") return 2.5
        if(towerType == "ninja") return 2.2
        if(towerType == "sniper") return 2
        if(towerType == "wizard") return 1.8
        if(towerType == "farm") return 1.6
    }
    if(role == "core") {
        if(towerType == "dartling") return 3
        if(towerType == "tack") return 2.8
        if(towerType == "wizard") return 2.7
        if(towerType == "boomer") return 2.6
        if(towerType == "dart") return 2.2
        if(towerType == "ninja") return 2.15
        if(towerType == "buccaneer") return 2.1
        if(towerType == "sword") return 2
        if(towerType == "bomb") return 1.9
        if(towerType == "ice") return 1.5
        if(towerType == "sniper") return 1.45
        if(towerType == "cobra") return 1.3
        if(towerType == "farm") return 0.4
    }
    return 0
}

function buildAIPlacementRolesForLoadout(loadout) {
    var roles = {}
    var remainingImages = loadout.towers.slice(0)
    for(var i = remainingImages.length - 1; i >= 0; i--) {
        if(getTowerTypeFromImage(remainingImages[i]) == "farm") {
            roles[remainingImages[i]] = "farm"
            remainingImages.splice(i, 1)
        }
    }
    var roleOrder = ["elite", "antiMoab", "support", "core"]
    for(var roleIndex = 0; roleIndex < roleOrder.length; roleIndex++) {
        var bestImage = ""
        var bestScore = -Infinity
        for(var imageIndex = 0; imageIndex < remainingImages.length; imageIndex++) {
            var towerType = getTowerTypeFromImage(remainingImages[imageIndex])
            var roleScore = scoreAILoadoutRoleForTowerType(towerType, roleOrder[roleIndex])
            if(roleScore > bestScore) {
                bestScore = roleScore
                bestImage = remainingImages[imageIndex]
            }
        }
        if(bestImage) {
            roles[bestImage] = roleOrder[roleIndex]
            remainingImages.splice(remainingImages.indexOf(bestImage), 1)
        }
    }
    for(var remainingIndex = 0; remainingIndex < remainingImages.length; remainingIndex++) {
        roles[remainingImages[remainingIndex]] = "core"
    }
    var hasCore = false
    for(var image in roles) {
        if(roles[image] == "core") {
            hasCore = true
            break
        }
    }
    if(hasCore == false) {
        for(var fallbackImage in roles) {
            if(roles[fallbackImage] != "farm") {
                roles[fallbackImage] = "core"
                break
            }
        }
    }
    return roles
}

function createAIBuildPlanForLoadout(loadout, runtimeStrategy) {
    var roles = runtimeStrategy.placementRoles
    var farms = []
    var cores = []
    var supports = []
    var antiMoabs = []
    var elites = []
    for(var i = 0; i < loadout.towers.length; i++) {
        var image = loadout.towers[i]
        var role = roles[image] || "core"
        if(role == "farm") {
            farms.push(image)
        } else if(role == "support") {
            supports.push(image)
        } else if(role == "antiMoab") {
            antiMoabs.push(image)
        } else if(role == "elite") {
            elites.push(image)
        } else {
            cores.push(image)
        }
    }
    var plan = []
    function pushStep(roundNumber, image, maxCount, role, buffer) {
        if(!image) {
            return
        }
        plan.push({ round: roundNumber, image: image, maxCount: maxCount, role: role, buffer: buffer })
    }
    pushStep(1, cores[0] || elites[0] || supports[0] || antiMoabs[0], 1, cores[0] ? "core" : elites[0] ? "elite" : supports[0] ? "support" : "antiMoab", 0)
    pushStep(5, farms[0], 1, "farm", 0)
    pushStep(9, supports[0] && supports[0] != cores[0] ? supports[0] : antiMoabs[0] && antiMoabs[0] != cores[0] ? antiMoabs[0] : elites[0] && elites[0] != cores[0] ? elites[0] : "", supports[0] ? 1 : antiMoabs[0] ? 1 : elites[0] ? 1 : 0, supports[0] ? "support" : antiMoabs[0] ? "antiMoab" : "elite", 0)
    pushStep(10, farms[0], 2, "farm", 150)
    pushStep(12, antiMoabs[0] && antiMoabs[0] != cores[0] && antiMoabs[0] != supports[0] ? antiMoabs[0] : "", 1, "antiMoab", 0)
    pushStep(20, cores[0], 2, "core", 250)
    pushStep(26, supports[0] && supports[0] != cores[0] ? supports[0] : antiMoabs[0] && antiMoabs[0] != cores[0] ? antiMoabs[0] : elites[0] && elites[0] != cores[0] ? elites[0] : "", 2, supports[0] ? "support" : antiMoabs[0] ? "antiMoab" : "elite", 350)
    pushStep(32, elites[0] && elites[0] != cores[0] ? elites[0] : "", 2, "elite", 900)
    pushStep(36, cores[0], 3, "core", 1100)
    return plan
}

function createAIRuntimeStrategyForLoadout(loadout, archetype, observedLoadoutSummary) {
    var runtimeStrategy = cloneAIStrategyVariant(archetype)
    runtimeStrategy.loadoutKey = loadout.key
    runtimeStrategy.loadoutSummary = loadout.summary
    runtimeStrategy.towers = loadout.towers.slice(0)
    runtimeStrategy.boosts = loadout.boosts.slice(0)
    runtimeStrategy.placementRoles = buildAIPlacementRolesForLoadout(loadout)
    runtimeStrategy.upgradePrefs = {}
    for(var i = 0; i < runtimeStrategy.towers.length; i++) {
        var image = runtimeStrategy.towers[i]
        runtimeStrategy.upgradePrefs[image] = getDefaultAIUpgradePriorityForTowerType(getTowerTypeFromImage(image))
    }
    runtimeStrategy.buildPlan = createAIBuildPlanForLoadout(loadout, runtimeStrategy)
    runtimeStrategy.rushBias = clamp(archetype.rushBias * 0.72 + loadout.summary.pressure * 0.28 + loadout.summary.offenseBoost * 0.08 - loadout.summary.eco * 0.06, 0.12, 1.15)
    runtimeStrategy.rushRound = Math.max(10, Math.round(archetype.rushRound * 0.72 + (18 - loadout.summary.pressure * 6) * 0.28 - loadout.summary.offenseBoost * 2 + loadout.summary.late * 2))
    runtimeStrategy.rushMoney = Math.max(1800, Math.round(archetype.rushMoney * (0.84 + loadout.summary.heavy * 0.12 + loadout.summary.late * 0.08)))
    runtimeStrategy.ecoFloor = Math.max(1800, Math.round(archetype.ecoFloor * (0.88 + loadout.summary.eco * 0.16 + loadout.summary.support * 0.06 - loadout.summary.pressure * 0.04)))
    if(observedLoadoutSummary && observedLoadoutSummary.hasAnySelection && observedLoadoutSummary.pressure >= 0.55 && loadout.summary.defenseBoost >= 0.35) {
        runtimeStrategy.ecoFloor += 250
    }
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
    return {
        stateInputSize: AI_DECISION_STATE_INPUT_SIZE,
        candidateInputSize: AI_DECISION_CANDIDATE_INPUT_SIZE,
        stateHiddenSize: AI_DECISION_STATE_HIDDEN_SIZE,
        candidateHiddenSize: AI_DECISION_CANDIDATE_HIDDEN_SIZE,
        embeddingSize: AI_DECISION_EMBEDDING_SIZE,
        trainingSamples: aiCreateVector(AI_DECISION_FAMILY_COUNT, 0),
        WState1: aiCreateDeterministicMatrix(AI_DECISION_STATE_HIDDEN_SIZE, AI_DECISION_STATE_INPUT_SIZE, 0.08, 11),
        bState1: aiCreateVector(AI_DECISION_STATE_HIDDEN_SIZE, 0),
        WState2: aiCreateDeterministicMatrix(AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE, 0.07, 23),
        bState2: aiCreateVector(AI_DECISION_EMBEDDING_SIZE, 0),
        WCandidate1: aiCreateDeterministicMatrix(AI_DECISION_CANDIDATE_HIDDEN_SIZE, AI_DECISION_CANDIDATE_INPUT_SIZE, 0.09, 37),
        bCandidate1: aiCreateVector(AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0),
        WCandidate2: aiCreateDeterministicMatrix(AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0.07, 53),
        bCandidate2: aiCreateVector(AI_DECISION_EMBEDDING_SIZE, 0),
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
            trainingSamples: policy.decision.trainingSamples.slice(0),
            WState1: cloneAIMatrix(policy.decision.WState1),
            bState1: policy.decision.bState1.slice(0),
            WState2: cloneAIMatrix(policy.decision.WState2),
            bState2: policy.decision.bState2.slice(0),
            WCandidate1: cloneAIMatrix(policy.decision.WCandidate1),
            bCandidate1: policy.decision.bCandidate1.slice(0),
            WCandidate2: cloneAIMatrix(policy.decision.WCandidate2),
            bCandidate2: policy.decision.bCandidate2.slice(0),
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
    if(decision.stateInputSize != AI_DECISION_STATE_INPUT_SIZE || decision.candidateInputSize != AI_DECISION_CANDIDATE_INPUT_SIZE || decision.stateHiddenSize != AI_DECISION_STATE_HIDDEN_SIZE || decision.candidateHiddenSize != AI_DECISION_CANDIDATE_HIDDEN_SIZE || decision.embeddingSize != AI_DECISION_EMBEDDING_SIZE) {
        return false
    }
    return isValidAICounterVector(decision.trainingSamples, AI_DECISION_FAMILY_COUNT) && isValidAIMatrix(decision.WState1, AI_DECISION_STATE_HIDDEN_SIZE, AI_DECISION_STATE_INPUT_SIZE) && isFiniteAIVector(decision.bState1, AI_DECISION_STATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WState2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_STATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bState2, AI_DECISION_EMBEDDING_SIZE) && isValidAIMatrix(decision.WCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE, AI_DECISION_CANDIDATE_INPUT_SIZE) && isFiniteAIVector(decision.bCandidate1, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isValidAIMatrix(decision.WCandidate2, AI_DECISION_EMBEDDING_SIZE, AI_DECISION_CANDIDATE_HIDDEN_SIZE) && isFiniteAIVector(decision.bCandidate2, AI_DECISION_EMBEDDING_SIZE) && isFiniteAIVector(decision.familyBias, AI_DECISION_FAMILY_COUNT)
}

function getAIPolicyParameterCount(policy) {
    if(isValidAIPolicy(policy) == false) {
        return 0
    }
    var strategy = policy.strategy
    var decision = policy.decision
    return strategy.W1.length * strategy.W1[0].length + strategy.b1.length + strategy.W2.length * strategy.W2[0].length + strategy.b2.length + strategy.W3.length * strategy.W3[0].length + strategy.b3.length + decision.WState1.length * decision.WState1[0].length + decision.bState1.length + decision.WState2.length * decision.WState2[0].length + decision.bState2.length + decision.WCandidate1.length * decision.WCandidate1[0].length + decision.bCandidate1.length + decision.WCandidate2.length * decision.WCandidate2[0].length + decision.bCandidate2.length + decision.familyBias.length
}

function createDefaultPolicyOutputBias() {
    var outputBias = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        outputBias.push(AI_STRATEGY_LIBRARY[i].baseBias)
    }
    return outputBias
}

function migrateAIPolicy(candidatePolicy) {
    var outputBias = createDefaultPolicyOutputBias()
    if(candidatePolicy && candidatePolicy.strategy && Array.isArray(candidatePolicy.strategy.b3) && candidatePolicy.strategy.b3.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.strategy.b3.slice(0)
    } else if(candidatePolicy && Array.isArray(candidatePolicy.b3) && candidatePolicy.b3.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.b3.slice(0)
    } else if(candidatePolicy && Array.isArray(candidatePolicy.b2) && candidatePolicy.b2.length == AI_STRATEGY_LIBRARY.length) {
        outputBias = candidatePolicy.b2.slice(0)
    }

    var migrated = createDefaultAIPolicy(outputBias)
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
    if(isValidAIPolicy(candidate.policy) == false) {
        candidate.policy = migrateAIPolicy(candidate.policy)
    }
    if(isValidAIPolicy(candidate.championPolicy) == false) {
        candidate.championPolicy = candidate.championPolicy ? migrateAIPolicy(candidate.championPolicy) : cloneAIPolicy(candidate.policy)
    }
    if(Array.isArray(candidate.populationPolicies) == false) {
        candidate.populationPolicies = []
    }
    candidate.populationPolicies = candidate.populationPolicies.map(function(policy) {
        return isValidAIPolicy(policy) ? policy : migrateAIPolicy(policy)
    }).filter(function(policy) {
        return isValidAIPolicy(policy)
    }).slice(-2).map(function(policy) {
        return cloneAIPolicy(policy)
    })

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
    candidate.totalDecisionSamples = Math.max(0, Math.floor(Number(candidate.totalDecisionSamples) || 0))
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

function getStrategyLoadoutCounterHeuristicBonus(strategy, observedLoadoutSummary) {
    if(!observedLoadoutSummary || observedLoadoutSummary.hasAnySelection == false) {
        return 0
    }

    var strategySummary = summarizeLoadoutSelection(strategy.towers, strategy.boosts)
    var bonus = 0
    bonus += observedLoadoutSummary.eco * (strategy.rushBias * 0.46 + strategySummary.pressure * 0.28 + strategySummary.offenseBoost * 0.22)
    bonus += observedLoadoutSummary.ecoBoost * (strategy.rushBias * 0.28 + strategySummary.pressure * 0.2)
    bonus += observedLoadoutSummary.late * (strategy.rushBias * 0.34 + strategySummary.pressure * 0.2 - strategySummary.eco * 0.1)
    bonus += observedLoadoutSummary.pressure * (strategySummary.defenseBoost * 0.38 + strategySummary.heavy * 0.26 + strategySummary.camo * 0.08 - strategySummary.eco * 0.18)
    bonus += observedLoadoutSummary.offenseBoost * (strategySummary.defenseBoost * 0.34 + strategySummary.heavy * 0.16 - strategySummary.eco * 0.12)
    bonus += observedLoadoutSummary.heavy * (strategySummary.heavy * 0.36 + strategySummary.late * 0.12)
    bonus += observedLoadoutSummary.camo * (strategySummary.camo * 0.34 + strategySummary.support * 0.08)
    bonus += observedLoadoutSummary.support * (strategySummary.late * 0.16 + strategySummary.pressure * 0.12)
    if(strategy.towers.indexOf("000farm.png") != -1 && observedLoadoutSummary.pressure < 0.35 && observedLoadoutSummary.offenseBoost < 0.35) {
        bonus += 0.12
    }
    if(strategy.towers.indexOf("000cobra.png") != -1 && observedLoadoutSummary.eco >= 0.45) {
        bonus += 0.18
    }
    if(strategy.towers.indexOf("000bomb.png") != -1 && observedLoadoutSummary.heavy >= 0.45) {
        bonus += 0.15
    }
    if((strategy.towers.indexOf("000wizard.png") != -1 || strategy.towers.indexOf("000ninja.png") != -1 || strategy.towers.indexOf("000sniper.png") != -1) && observedLoadoutSummary.camo >= 0.45) {
        bonus += 0.15
    }

    return bonus * observedLoadoutSummary.selectionRatio
}

function getLoadoutCounterLearningBonus(strategyIndex, observedLoadoutSummary) {
    ensureAILearningLoaded()
    if(!observedLoadoutSummary || observedLoadoutSummary.hasAnySelection == false || observedLoadoutSummary.signature == "||") {
        return 0
    }

    return getAILearningScore(aiLearning.loadoutCounterStats, getLoadoutCounterStatKey(observedLoadoutSummary.signature, strategyIndex)) * (0.55 + observedLoadoutSummary.selectionRatio * 0.35)
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
    var defenseMath = matchup && matchup.defenseMath ? matchup.defenseMath : {}
    var offenseMath = matchup && matchup.offenseMath ? matchup.offenseMath : {}
    var threat = matchup && matchup.playerThreat ? matchup.playerThreat : {}
    var pressure = matchup && matchup.aiPressure ? matchup.aiPressure : {}
    var strategy = getCurrentAIStrategy()
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
        clamp((Number(threat.count) || 0) / 24, 0, 1),
        clamp((Number(threat.heavyCount) || 0) / 4, 0, 1),
        clamp((Number(threat.score) || 0) / 60, 0, 1),
        clamp((Number(threat.closeScore) || 0) / 40, 0, 1),
        clamp((Number(threat.maxPathPos) || 0) / 100, 0, 1),
        clamp((Number(pressure.count) || 0) / 24, 0, 1),
        clamp((Number(pressure.heavyCount) || 0) / 4, 0, 1),
        clamp((Number(pressure.score) || 0) / 60, 0, 1),
        clamp(((Number(defenseMath.currentDps) || 0) - (Number(defenseMath.requiredDps) || 0)) / Math.max(20, (Number(defenseMath.currentDps) || 0) + (Number(defenseMath.requiredDps) || 0)), -1, 1),
        clamp(((Number(offenseMath.requiredDps) || 0) - (Number(offenseMath.currentDps) || 0)) / Math.max(20, (Number(offenseMath.currentDps) || 0) + (Number(offenseMath.requiredDps) || 0)), -1, 1),
        matchup && matchup.dangerHigh ? 1 : 0,
        matchup && matchup.safeToGreed ? 1 : 0,
        matchup && matchup.enemyVulnerable ? 1 : 0,
        clamp(matchup && matchup.enemyLiquidity ? Number(matchup.enemyLiquidity.liquidityRatio) / 3 : 0, 0, 1),
        clamp(strategy && Number(strategy.rushBias) || 0, 0, 1),
        clamp(strategy && Number(strategy.rushRound) / 40 || 0, 0, 1),
        clamp(strategy && Number(strategy.ecoFloor) / 8000 || 0, 0, 1),
        own.autoEco ? 1 : 0,
        aiProfile && aiProfile.currentAction ? 1 : 0,
    ]
    var supplied = Array.isArray(contextFeatures) ? contextFeatures : aiMatchTelemetry && Array.isArray(aiMatchTelemetry.selectionFeatures) ? aiMatchTelemetry.selectionFeatures : []
    for(var suppliedIndex = 0; suppliedIndex < supplied.length && values.length < AI_DECISION_STATE_INPUT_SIZE - AI_DECISION_FAMILY_COUNT; suppliedIndex++) {
        values.push(clamp(Number(supplied[suppliedIndex]) || 0, 0, 1))
    }
    for(var valueIndex = 0; valueIndex < values.length && AI_DECISION_FAMILY_COUNT + valueIndex < features.length; valueIndex++) {
        features[AI_DECISION_FAMILY_COUNT + valueIndex] = clampAIDecisionFeature(values[valueIndex])
    }
    return features
}

function buildAIDecisionCandidateFeatures(familyIndex, metadata) {
    metadata = metadata || {}
    var features = aiCreateVector(AI_DECISION_CANDIDATE_INPUT_SIZE, 0)
    if(familyIndex >= 0 && familyIndex < AI_DECISION_FAMILY_COUNT) {
        features[familyIndex] = 1
    }
    var stableId = getAIStableCandidateId(familyIndex, metadata)
    var stableHash = getAIStableStringHash(stableId)
    var typeHash = getAIStableStringHash(metadata.type || "")
    var roleHash = getAIStableStringHash(metadata.role || "")
    var actionHash = getAIStableStringHash(metadata.actionKey || stableId)
    var heuristicScale = Math.max(0.001, Number(metadata.heuristicScale) || 100)
    var money = Math.max(1, Number(metadata.money) || 1)
    var values = [
        Math.tanh((Number(metadata.heuristic) || 0) / heuristicScale),
        clamp((Number(metadata.cost) || 0) / money, 0, 2) - 1,
        Math.tanh((Number(metadata.effect) || 0) / Math.max(0.001, Number(metadata.effectScale) || 50)),
        clamp((Number(metadata.x) || 0) / Math.max(1, typeof canvas != "undefined" ? canvas.width : 1366), 0, 1),
        clamp((Number(metadata.y) || 0) / Math.max(1, typeof canvas != "undefined" ? canvas.height : 768), 0, 1),
        clamp(Number(metadata.position) || 0, 0, 1),
        typeHash / 4294967295 * 2 - 1,
        roleHash / 4294967295 * 2 - 1,
        actionHash / 4294967295 * 2 - 1,
        clamp((Number(metadata.index) || 0) / Math.max(1, Number(metadata.maxIndex) || 1), 0, 1),
        clamp((Number(metadata.count) || 0) / Math.max(1, Number(metadata.countScale) || 16), 0, 1),
        metadata.cooldownReady === false ? -1 : 1,
        metadata.affordable === false ? -1 : 1,
        metadata.legal === false ? -1 : 1,
        metadata.selected ? 1 : 0,
        clamp((Number(metadata.tier1) || 0) / 5, 0, 1),
        clamp((Number(metadata.tier2) || 0) / 5, 0, 1),
        clamp((Number(metadata.tier3) || 0) / 5, 0, 1),
        clamp(Number(metadata.urgency) || 0, 0, 1),
        clamp(Number(metadata.safety) || 0, -1, 1),
        ((stableHash >>> 0) & 65535) / 32767.5 - 1,
        ((stableHash >>> 16) & 65535) / 32767.5 - 1,
        ((actionHash >>> 8) & 65535) / 32767.5 - 1,
        metadata.noop ? 1 : 0,
    ]
    for(var i = 0; i < values.length && AI_DECISION_FAMILY_COUNT + i < features.length; i++) {
        features[AI_DECISION_FAMILY_COUNT + i] = clampAIDecisionFeature(values[i])
    }
    return features
}

function aiDecisionEncode(inputs, firstWeights, firstBias, secondWeights, secondBias) {
    var hidden = []
    var embedding = []
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
        embedding.push(Math.tanh(embeddingSum))
    }
    return { hidden: hidden, embedding: embedding }
}

function aiDecisionForward(stateFeatures, candidateFeatures, familyIndex, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || getAIPolicyForDecision()
    if(isValidAIPolicy(policy) == false || familyIndex < 0 || familyIndex >= AI_DECISION_FAMILY_COUNT || !Array.isArray(stateFeatures) || !Array.isArray(candidateFeatures)) {
        return null
    }
    var safeState = stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE).map(clampAIDecisionFeature)
    var safeCandidate = candidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE).map(clampAIDecisionFeature)
    if(safeState.length != AI_DECISION_STATE_INPUT_SIZE || safeCandidate.length != AI_DECISION_CANDIDATE_INPUT_SIZE) {
        return null
    }
    var decision = policy.decision
    var state = null
    if(aiDecisionStateCache && aiDecisionStateCache.features == stateFeatures && aiDecisionStateCache.policy == policy) {
        safeState = aiDecisionStateCache.safeState
        state = aiDecisionStateCache.state
    } else {
        state = aiDecisionEncode(safeState, decision.WState1, decision.bState1, decision.WState2, decision.bState2)
        aiDecisionStateCache = { features: stateFeatures, policy: policy, safeState: safeState, state: state }
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
    return {
        stateFeatures: safeState,
        candidateFeatures: safeCandidate,
        stateHidden: state.hidden,
        stateEmbedding: state.embedding,
        candidateHidden: candidate.hidden,
        candidateEmbedding: candidate.embedding,
        stateNorm: stateNorm,
        candidateNorm: candidateNorm,
        normalizedDot: normalizedDot,
        score: Math.tanh(normalizedDot + decision.familyBias[familyIndex]),
    }
}

function scoreAIDecisionCandidate(side, familyIndex, metadata, matchup, stateFeatures, policyOverride) {
    metadata = metadata || {}
    var stableId = getAIStableCandidateId(familyIndex, metadata)
    var resolvedState = stateFeatures || buildAIDecisionStateFeatures(side, familyIndex, matchup, metadata.contextFeatures)
    var candidateFeatures = buildAIDecisionCandidateFeatures(familyIndex, metadata)
    var forward = aiDecisionForward(resolvedState, candidateFeatures, familyIndex, policyOverride)
    var heuristic = Math.tanh((Number(metadata.heuristic) || 0) / Math.max(0.001, Number(metadata.heuristicScale) || 100))
    return {
        id: stableId,
        familyIndex: familyIndex,
        stateFeatures: resolvedState,
        candidateFeatures: candidateFeatures,
        neuralScore: forward ? forward.score : 0,
        score: (forward ? forward.score : 0) + heuristic * getAIDecisionBootstrapWeight(familyIndex, policyOverride) * 2.5,
    }
}

function isAIDecisionScoreBetter(candidateScore, bestScore) {
    return !bestScore || candidateScore.score > bestScore.score || candidateScore.score == bestScore.score && candidateScore.id < bestScore.id
}

function trainAIDecision(stateFeatures, candidateFeatures, familyIndex, target, policyOverride) {
    ensureAILearningLoaded()
    var policy = policyOverride || aiLearning.policy
    var forward = aiDecisionForward(stateFeatures, candidateFeatures, familyIndex, policy)
    if(!forward || Number.isFinite(target) == false) {
        return false
    }
    var decision = policy.decision
    var prediction = forward.score
    var error = clamp(clamp(target, -1, 1) - prediction, -1, 1)
    var outputDelta = error * (1 - prediction * prediction)
    var stateEmbeddingDelta = []
    var candidateEmbeddingDelta = []
    for(var embeddingIndex = 0; embeddingIndex < AI_DECISION_EMBEDDING_SIZE; embeddingIndex++) {
        var stateValue = forward.stateEmbedding[embeddingIndex]
        var candidateValue = forward.candidateEmbedding[embeddingIndex]
        var stateCosineGradient = candidateValue / (forward.stateNorm * forward.candidateNorm) - forward.normalizedDot * stateValue / (forward.stateNorm * forward.stateNorm)
        var candidateCosineGradient = stateValue / (forward.stateNorm * forward.candidateNorm) - forward.normalizedDot * candidateValue / (forward.candidateNorm * forward.candidateNorm)
        stateEmbeddingDelta.push(clamp(outputDelta * stateCosineGradient * (1 - stateValue * stateValue), -1, 1))
        candidateEmbeddingDelta.push(clamp(outputDelta * candidateCosineGradient * (1 - candidateValue * candidateValue), -1, 1))
    }
    var stateHiddenDelta = aiCreateVector(AI_DECISION_STATE_HIDDEN_SIZE, 0)
    var candidateHiddenDelta = aiCreateVector(AI_DECISION_CANDIDATE_HIDDEN_SIZE, 0)
    for(var stateHiddenIndex = 0; stateHiddenIndex < stateHiddenDelta.length; stateHiddenIndex++) {
        var stateDownstream = 0
        for(var stateEmbeddingIndex = 0; stateEmbeddingIndex < AI_DECISION_EMBEDDING_SIZE; stateEmbeddingIndex++) {
            stateDownstream += decision.WState2[stateEmbeddingIndex][stateHiddenIndex] * stateEmbeddingDelta[stateEmbeddingIndex]
        }
        stateHiddenDelta[stateHiddenIndex] = clamp(stateDownstream * (1 - forward.stateHidden[stateHiddenIndex] * forward.stateHidden[stateHiddenIndex]), -1, 1)
    }
    for(var candidateHiddenIndex = 0; candidateHiddenIndex < candidateHiddenDelta.length; candidateHiddenIndex++) {
        var candidateDownstream = 0
        for(var candidateEmbeddingIndex = 0; candidateEmbeddingIndex < AI_DECISION_EMBEDDING_SIZE; candidateEmbeddingIndex++) {
            candidateDownstream += decision.WCandidate2[candidateEmbeddingIndex][candidateHiddenIndex] * candidateEmbeddingDelta[candidateEmbeddingIndex]
        }
        candidateHiddenDelta[candidateHiddenIndex] = clamp(candidateDownstream * (1 - forward.candidateHidden[candidateHiddenIndex] * forward.candidateHidden[candidateHiddenIndex]), -1, 1)
    }
    var learningRate = policy.decisionLearningRate / Math.sqrt(1 + decision.trainingSamples[familyIndex] / 500)
    for(var outputIndex = 0; outputIndex < AI_DECISION_EMBEDDING_SIZE; outputIndex++) {
        for(var stateHiddenWeightIndex = 0; stateHiddenWeightIndex < AI_DECISION_STATE_HIDDEN_SIZE; stateHiddenWeightIndex++) {
            decision.WState2[outputIndex][stateHiddenWeightIndex] = clampAIPolicyParameter(decision.WState2[outputIndex][stateHiddenWeightIndex] + learningRate * stateEmbeddingDelta[outputIndex] * forward.stateHidden[stateHiddenWeightIndex])
        }
        decision.bState2[outputIndex] = clampAIPolicyParameter(decision.bState2[outputIndex] + learningRate * stateEmbeddingDelta[outputIndex])
        for(var candidateHiddenWeightIndex = 0; candidateHiddenWeightIndex < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateHiddenWeightIndex++) {
            decision.WCandidate2[outputIndex][candidateHiddenWeightIndex] = clampAIPolicyParameter(decision.WCandidate2[outputIndex][candidateHiddenWeightIndex] + learningRate * candidateEmbeddingDelta[outputIndex] * forward.candidateHidden[candidateHiddenWeightIndex])
        }
        decision.bCandidate2[outputIndex] = clampAIPolicyParameter(decision.bCandidate2[outputIndex] + learningRate * candidateEmbeddingDelta[outputIndex])
    }
    for(var stateRow = 0; stateRow < AI_DECISION_STATE_HIDDEN_SIZE; stateRow++) {
        for(var stateCol = 0; stateCol < AI_DECISION_STATE_INPUT_SIZE; stateCol++) {
            decision.WState1[stateRow][stateCol] = clampAIPolicyParameter(decision.WState1[stateRow][stateCol] + learningRate * stateHiddenDelta[stateRow] * forward.stateFeatures[stateCol])
        }
        decision.bState1[stateRow] = clampAIPolicyParameter(decision.bState1[stateRow] + learningRate * stateHiddenDelta[stateRow])
    }
    for(var candidateRow = 0; candidateRow < AI_DECISION_CANDIDATE_HIDDEN_SIZE; candidateRow++) {
        for(var candidateCol = 0; candidateCol < AI_DECISION_CANDIDATE_INPUT_SIZE; candidateCol++) {
            decision.WCandidate1[candidateRow][candidateCol] = clampAIPolicyParameter(decision.WCandidate1[candidateRow][candidateCol] + learningRate * candidateHiddenDelta[candidateRow] * forward.candidateFeatures[candidateCol])
        }
        decision.bCandidate1[candidateRow] = clampAIPolicyParameter(decision.bCandidate1[candidateRow] + learningRate * candidateHiddenDelta[candidateRow])
    }
    decision.familyBias[familyIndex] = clampAIPolicyParameter(decision.familyBias[familyIndex] + learningRate * outputDelta)
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
        var heuristicScore = getStrategyLoadoutCounterHeuristicBonus(strategy, observedLoadoutSummary) + getLoadoutCounterLearningBonus(scoreIndex, observedLoadoutSummary)
        var summary = summarizeLoadoutSelection(strategy.towers, strategy.boosts)
        var decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.strategy, {
            id: strategy.id,
            type: strategy.id,
            role: strategy.placementProfile,
            actionKey: "strategy|" + strategy.id,
            heuristic: heuristicScore,
            heuristicScale: 0.8,
            effect: strategy.rushBias + summary.eco + summary.pressure,
            effectScale: 3,
            index: scoreIndex,
            maxIndex: Math.max(1, pass.outputs.length - 1),
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
        var heuristicScore = 0
        if(loadoutKey && (!aiProfile || !aiProfile.policySnapshot)) {
            heuristicScore += getAILearningScore(aiLearning.loadoutStrategyStats, getAILoadoutStrategyStatKey(loadoutKey, scoreIndex)) * 0.42
        }
        var strategy = AI_STRATEGY_LIBRARY[scoreIndex]
        var decision = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.strategy, {
            id: strategy.id,
            type: strategy.id,
            role: strategy.placementProfile,
            actionKey: "strategy|" + strategy.id,
            heuristic: heuristicScore,
            heuristicScale: 0.5,
            effect: strategy.rushBias,
            effectScale: 1,
            index: scoreIndex,
            maxIndex: Math.max(1, pass.outputs.length - 1),
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
    recordAIDecisionTraceSample(chosenLoadout.decisionSample, 0)
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
    for(var i = 0; i < aiProfile.tacticalTrace.length; i++) {
        if(Number.isInteger(aiProfile.tacticalTrace[i].familyIndex) && Array.isArray(aiProfile.tacticalTrace[i].stateFeatures)) {
            aiProfile.tacticalTrace[i].age = Math.max(0, Math.floor(Number(aiProfile.tacticalTrace[i].age) || 0)) + 1
        }
    }
    entry.age = 0
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

function recordAIDecisionTraceSample(decisionSample, localReward) {
    if(!aiProfile || !decisionSample || !Array.isArray(decisionSample.stateFeatures) || !Array.isArray(decisionSample.candidateFeatures)) {
        return false
    }
    appendAIDecisionTraceEntry({
        decisionId: decisionSample.id || "",
        familyIndex: decisionSample.familyIndex,
        stateFeatures: decisionSample.stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE),
        candidateFeatures: decisionSample.candidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE),
        localReward: clamp(Number(localReward) || 0, -1, 1),
        recordedAt: gameNow(),
    })
    return true
}

function recordAINoOpDecision(decisionSample) {
    if(!aiProfile || !decisionSample) {
        return false
    }
    var now = gameNow()
    for(var i = aiProfile.tacticalTrace.length - 1; i >= 0; i--) {
        var previous = aiProfile.tacticalTrace[i]
        if(previous.familyIndex == decisionSample.familyIndex && previous.decisionId == decisionSample.id) {
            if(now - previous.recordedAt < 3000) return false
            break
        }
    }
    return recordAIDecisionTraceSample(decisionSample, 0)
}

function settleAITacticalDecision(side, matchup) {
    if(!aiProfile || !aiProfile.pendingTacticalDecision) {
        return
    }
    var decision = aiProfile.pendingTacticalDecision
    var potentialAfter = getAITacticalPotential(side, decision.family, matchup)
    decision.localReward = clamp((potentialAfter - decision.potentialBefore) / 0.2, -1, 1)
    decision.settledAt = gameNow()
    appendAIDecisionTraceEntry(decision)
    aiProfile.pendingTacticalDecision = null
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

function recordAITacticalDecision(side, family, actionKey, matchup, decisionSample) {
    if(!aiProfile) {
        return
    }
    settleAITacticalDecision(side, matchup)
    var familyIndex = decisionSample ? decisionSample.familyIndex : getAIDecisionFamilyForLegacyAction(family, actionKey)
    var stateFeatures = decisionSample ? decisionSample.stateFeatures : buildAIDecisionStateFeatures(side, familyIndex, matchup)
    var candidateFeatures = decisionSample ? decisionSample.candidateFeatures : buildAIDecisionCandidateFeatures(familyIndex, { id: actionKey, type: family, actionKey: actionKey })
    aiProfile.pendingTacticalDecision = {
        family: family,
        familyIndex: familyIndex,
        actionKey: actionKey,
        stateKey: getAITacticalStateKey(side, matchup),
        stateFeatures: stateFeatures.slice(0, AI_DECISION_STATE_INPUT_SIZE),
        candidateFeatures: candidateFeatures.slice(0, AI_DECISION_CANDIDATE_INPUT_SIZE),
        potentialBefore: getAITacticalPotential(side, family, matchup),
        localReward: 0,
        recordedAt: gameNow(),
    }
}

function collectAIDecisionSamples(side, terminalReward, maximumDecisions) {
    if(!aiProfile) {
        return []
    }
    settleAITacticalDecision(side, getCurrentPlayerMatchupStyle(side))
    var available = []
    var traceLength = aiProfile.tacticalTrace.length
    for(var i = 0; i < traceLength; i++) {
        var decision = aiProfile.tacticalTrace[i]
        if(!Number.isInteger(decision.familyIndex) || decision.familyIndex < 0 || decision.familyIndex >= AI_DECISION_FAMILY_COUNT || !Array.isArray(decision.stateFeatures) || decision.stateFeatures.length != AI_DECISION_STATE_INPUT_SIZE || !Array.isArray(decision.candidateFeatures) || decision.candidateFeatures.length != AI_DECISION_CANDIDATE_INPUT_SIZE) {
            continue
        }
        var storedAge = Number(decision.age)
        var age = Number.isInteger(storedAge) ? clamp(storedAge, 0, AI_MAX_DECISION_SAMPLE_AGE) : traceLength - i - 1
        decision.age = age
        var localReward = clamp(Number(decision.localReward) || 0, -1, 1)
        available.push({
            traceIndex: i,
            familyIndex: decision.familyIndex,
            stateFeatures: decision.stateFeatures.slice(0),
            candidateFeatures: decision.candidateFeatures.slice(0),
            localReward: localReward,
            age: age,
            target: clamp(0.7 * localReward + terminalReward * (0.3 * Math.pow(0.985, age)), -1, 1),
        })
    }
    var maximum = maximumDecisions == null ? available.length : Math.max(0, Math.floor(maximumDecisions))
    if(available.length <= maximum) {
        return available.map(function(sample) {
            delete sample.traceIndex
            return sample
        })
    }

    var byFamily = aiCreateVector(AI_DECISION_FAMILY_COUNT, null).map(function() { return [] })
    for(var availableIndex = available.length - 1; availableIndex >= 0; availableIndex--) {
        byFamily[available[availableIndex].familyIndex].push(available[availableIndex])
    }
    var selected = []
    var selectedIndices = {}
    var familyOffset = 0
    while(selected.length < maximum) {
        var added = false
        for(var familyIndex = 0; familyIndex < AI_DECISION_FAMILY_COUNT && selected.length < maximum; familyIndex++) {
            if(byFamily[familyIndex][familyOffset]) {
                var familySample = byFamily[familyIndex][familyOffset]
                selected.push(familySample)
                selectedIndices[familySample.traceIndex] = true
                added = true
            }
        }
        if(added == false) break
        familyOffset++
    }
    for(var recentIndex = available.length - 1; recentIndex >= 0 && selected.length < maximum; recentIndex--) {
        if(!selectedIndices[available[recentIndex].traceIndex]) {
            selected.push(available[recentIndex])
        }
    }
    selected.sort(function(a, b) { return a.traceIndex - b.traceIndex })
    return selected.map(function(sample) {
        delete sample.traceIndex
        return sample
    })
}

function trainAIDecisionsFromMatch(side, terminalReward) {
    var samples = collectAIDecisionSamples(side, terminalReward, AI_MAX_PUBLIC_DECISION_SAMPLES)
    for(var i = 0; i < samples.length; i++) {
        trainAIDecision(samples[i].stateFeatures, samples[i].candidateFeatures, samples[i].familyIndex, samples[i].target, aiLearning.policy)
    }
    return samples.length
}

function collectAITacticalLearningObservations(side, terminalReward, maximumDecisions) {
    if(!aiProfile) {
        return []
    }
    settleAITacticalDecision(side, getCurrentPlayerMatchupStyle(side))
    var observations = []
    var startIndex = maximumDecisions == null ? 0 : Math.max(0, aiProfile.tacticalTrace.length - Math.max(0, maximumDecisions))
    for(var i = startIndex; i < aiProfile.tacticalTrace.length; i++) {
        var decision = aiProfile.tacticalTrace[i]
        if(!decision.stateKey || !decision.family || !decision.actionKey) {
            continue
        }
        var terminalWeight = 0.3 * Math.pow(0.985, aiProfile.tacticalTrace.length - i - 1)
        var target = clamp(decision.localReward * 0.7 + terminalReward * terminalWeight, -1, 1)
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
    return mapIndex + "|" + towerType + "|" + role + "|" + bucket.x + "|" + bucket.y
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
    return loadoutKey + "|" + strategyId + "|" + mapIndex + "|" + towerType + "|" + role + "|" + bucket.x + "|" + bucket.y
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
        matchFeatures: buildLocalHumanMatchFeatures(side, loadoutSummary),
        aiLives: subjectLives,
        enemyLives: opponentLives,
        loadoutKey: loadoutSummary.signature,
        opponentLoadoutKey: opponentLoadoutSummary.signature,
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
    return BASE_TOWER_PRICES[towerType] || 100
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

function getAITowerPlacementFitReward(tower) {
    if(!tower || tower.towerType == "farm" || tower.towerType == "farmer" || tower.range == Infinity && tower.towerType != "sniper" && tower.towerType != "mortar") {
        return 0
    }

    var role = tower.aiPlacementRole || getStrategyPlacementRoleForTowerType(tower.towerType)
    var coverage = getPlacementCoverageStats(tower.playerSide, tower.x, tower.y, tower.range)
    var bonus = 0
    if(tower.towerType == "dartling" || tower.towerType == "mortar" || tower.towerType == "dart") {
        bonus += coverage.lineAimScore * 0.16 + coverage.straightRun * 0.14
    } else if(tower.towerType == "bomb" || tower.towerType == "wizard" || tower.towerType == "boomer") {
        bonus += coverage.span * 0.16 + coverage.longestRun * 0.12 + coverage.coverageCount * 0.01
    } else if(tower.towerType == "tack" || tower.towerType == "ice" || tower.towerType == "sword") {
        bonus += clamp((170 - coverage.nearestTrackDistance) / 170, 0, 1) * 0.18 + coverage.earlyCount * 0.01
    } else if(tower.towerType == "sniper" || tower.towerType == "cobra") {
        bonus += clamp((coverage.nearestTrackDistance - 80) / 180, 0, 1) * 0.16 + coverage.lateCount * 0.01
    } else {
        bonus += coverage.coverageCount * 0.01 + coverage.longestRun * 0.1 + coverage.span * 0.08
    }
    if(role == "antiMoab" || role == "elite") {
        bonus += coverage.lateCount * 0.012
    }
    bonus -= getPlacementCrowdingPenalty(tower.playerSide, tower.x, tower.y, tower.towerType) * 0.003
    return clamp(bonus - 0.04, -0.12, 0.24)
}

function getAITowerCrosspathFitReward(tower) {
    if(!tower || tower.towerType == "farmer" || getTowerTotalTier(tower) <= 0) {
        return 0
    }

    var matchup = getCurrentPlayerMatchupStyle(tower.playerSide)
    var current = [tower.path1Upgrades, tower.path2Upgrades, tower.path3Upgrades]
    var targets = getCrosspathCandidatesForTowerType(tower.towerType)
    var bestFit = -Infinity
    for(var i = 0; i < targets.length; i++) {
        var target = targets[i]
        var distance = Math.abs(target[0] - current[0]) + Math.abs(target[1] - current[1]) + Math.abs(target[2] - current[2])
        var fit = getTowerStrategicTargetWeight(tower, target, matchup) - distance * 0.14
        if(fit > bestFit) {
            bestFit = fit
        }
    }

    return clamp((bestFit - 0.95) * 0.14, -0.12, 0.26)
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
    if(tower.towerType != "farmer") {
        normalized += getAITowerPlacementFitReward(tower)
        normalized += getAITowerCrosspathFitReward(tower)
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
            familyIndex: sample.familyIndex,
            stateFeatures: sample.stateFeatures,
            candidateFeatures: sample.candidateFeatures,
            localReward: sample.localReward,
            age: sample.age,
        }
    })
    return {
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
        selfPlay: selfPlayActive,
    }
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
        return
    }
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
        frontMenuState = "stats"
    } else if(button.id == "ai-refresh") {
        refreshAILearningFromBackend(true)
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

function getAIStatsSourceDescription() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        return "Session ~19k-parameter shared neural controller: local learning is discarded when this browser session closes."
    }
    if(aiPersistenceState.loadInFlight) {
        return "Hosted Model: refreshing authoritative statistics from the backend."
    }
    if(aiPersistenceState.lastError) {
        return "Hosted Model unavailable: showing the latest valid model loaded in this tab."
    }
    if(aiPersistenceState.contributionEnabled) {
        return "Hosted ~19k-parameter shared neural controller: match perspectives, demonstrations, and verified self-play."
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

    ctx.textAlign = "left"
    ctx.font = "15px Arial"
    ctx.fillStyle = "rgba(214, 226, 255, 0.9)"
    ctx.fillText(getAIStatsSourceDescription(), panelX + innerPadding, panelY + panelHeight - 38, panelWidth - innerPadding * 2)
    ctx.font = "13px Arial"
    ctx.fillStyle = "rgba(190, 204, 236, 0.78)"
    ctx.fillText("The Hosted Model is authoritative for browser play and distributed training; the repository checkpoint is its promotion audit mirror.", panelX + innerPadding, panelY + panelHeight - 16, panelWidth - innerPadding * 2)
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
    return {
        x: clamp(Math.floor(((x - bounds.minX) / width) * AI_PLACEMENT_GRID_X), 0, AI_PLACEMENT_GRID_X - 1),
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

function getRolePlacementProgressTarget(role) {
    if(role == "farm") {
        return 0.1
    }
    if(role == "farmer") {
        return 0.14
    }
    if(role == "antiMoab") {
        return 0.68
    }
    if(role == "support") {
        return 0.42
    }
    if(role == "elite") {
        return 0.58
    }
    return 0.5
}

function getTowerPlacementHeuristicProfile(towerType, role) {
    var profile = {
        coverage: 1.3,
        span: 92,
        mid: 0.9,
        late: role == "antiMoab" ? 1.5 : 0.9,
        early: role == "core" ? 0.75 : 0.35,
        progressPenalty: 56,
        preferredYPenalty: 0.16,
        longestRun: 44,
        straightRun: 30,
        lineAim: 16,
        closeTrack: 0.08,
        farTrack: 0,
    }

    if(towerType == "bomb" || towerType == "wizard" || towerType == "boomer") {
        profile.coverage += 0.2
        profile.span += 18
        profile.longestRun += 12
        profile.straightRun += 8
        profile.lineAim += 6
        profile.closeTrack = 0.12
    } else if(towerType == "dartling" || towerType == "mortar") {
        profile.coverage = 1.05
        profile.span = 74
        profile.mid = 1.15
        profile.late = towerType == "mortar" ? 1.35 : 1.2
        profile.early = 0.45
        profile.progressPenalty = 44
        profile.longestRun = 70
        profile.straightRun = 86
        profile.lineAim = 92
        profile.closeTrack = 0.06
    } else if(towerType == "sniper" || towerType == "cobra") {
        profile.coverage = 0.35
        profile.span = 16
        profile.mid = 0.75
        profile.late = towerType == "sniper" ? 1.4 : 0.8
        profile.early = 0.2
        profile.progressPenalty = 34
        profile.longestRun = 20
        profile.straightRun = 24
        profile.lineAim = towerType == "sniper" ? 42 : 8
        profile.closeTrack = 0
        profile.farTrack = towerType == "sniper" ? 0.18 : 0.14
    } else if(towerType == "tack" || towerType == "ice" || towerType == "sword") {
        profile.coverage = towerType == "ice" ? 0.95 : 1.05
        profile.span = towerType == "sword" ? 72 : 60
        profile.mid = towerType == "ice" ? 0.95 : 0.82
        profile.late = towerType == "ice" ? 0.65 : 0.45
        profile.early = towerType == "sword" ? 1.15 : 1.3
        profile.progressPenalty = 48
        profile.longestRun = 26
        profile.straightRun = towerType == "sword" ? 24 : 14
        profile.lineAim = towerType == "sword" ? 18 : 6
        profile.closeTrack = towerType == "ice" ? 0.32 : towerType == "sword" ? 0.26 : 0.36
    } else if(towerType == "dart" || towerType == "ninja" || towerType == "engi" || towerType == "buccaneer" || towerType == "super") {
        profile.coverage = towerType == "super" ? 1.45 : 1.1
        profile.span = towerType == "super" ? 84 : 72
        profile.mid = towerType == "engi" ? 0.95 : 1
        profile.late = towerType == "super" ? 1.25 : towerType == "buccaneer" ? 1.05 : 0.82
        profile.early = towerType == "dart" ? 1.05 : 0.72
        profile.progressPenalty = towerType == "super" ? 46 : 52
        profile.longestRun = towerType == "dart" ? 52 : 38
        profile.straightRun = towerType == "dart" ? 46 : 26
        profile.lineAim = towerType == "dart" ? 24 : towerType == "buccaneer" ? 22 : 18
        profile.closeTrack = towerType == "super" ? 0.14 : towerType == "buccaneer" ? 0.12 : 0.1
    }

    return profile
}

function getTowerPlacementStrategicBonus(towerType, role, coverage, matchup) {
    if(!matchup) {
        return 0
    }

    var bonus = 0
    if(matchup.playerThreat.heavyCount >= 1) {
        if(towerType == "sniper" || towerType == "bomb" || towerType == "mortar" || towerType == "dartling" || towerType == "super" || towerType == "sword") {
            bonus += coverage.lateCount * 0.85 + coverage.longestRun * 10
        }
        if(towerType == "dartling" || towerType == "mortar") {
            bonus += coverage.lineAimScore * 16 + coverage.straightRun * 12
        }
        if(towerType == "tack" || towerType == "ice") {
            bonus -= coverage.lateCount * 0.22
        }
    }
    if(matchup.playerThreat.count >= 12 || matchup.playerThreat.score >= 15) {
        if(towerType == "wizard" || towerType == "tack" || towerType == "boomer" || towerType == "bomb" || towerType == "ice") {
            bonus += coverage.span * 14 + coverage.coverageCount * 0.22 + coverage.longestRun * 10
        }
        if(towerType == "dartling" || towerType == "mortar") {
            bonus += coverage.straightRun * 18 + coverage.lineAimScore * 8
        }
    }
    if(matchup.enemyVulnerable) {
        if(towerType == "dartling" || towerType == "mortar" || towerType == "dart" || towerType == "sniper") {
            bonus += coverage.lineAimScore * 10 + coverage.straightRun * 8
        }
        if(towerType == "cobra") {
            bonus += coverage.nearestTrackDistance * 0.05
        }
    }
    if(matchup.safeToGreed) {
        if(towerType == "sniper" || towerType == "cobra" || towerType == "buccaneer") {
            bonus += coverage.midCount * 0.4 + coverage.lateCount * 0.35
        }
    }
    if(matchup.dangerHigh && (role == "antiMoab" || role == "elite")) {
        bonus += coverage.lateCount * 0.75 + coverage.longestRun * 12
    }
    return bonus
}

var AI_CROSSPATH_INTENT_WEIGHTS = {
    balanced: { damage: 1.15, splash: 1, speed: 0.9, coverage: 0.8, control: 0.6, eco: 0.2, utility: 0.35, range: 0.35 },
    swarm: { damage: 0.8, splash: 1.55, speed: 1.12, coverage: 1.22, control: 0.95, eco: 0.08, utility: 0.34, range: 0.3 },
    heavy: { damage: 1.6, splash: 0.55, speed: 0.86, coverage: 0.45, control: 0.54, eco: 0.05, utility: 0.24, range: 0.78 },
    pressure: { damage: 1.12, splash: 0.86, speed: 1.32, coverage: 0.9, control: 0.38, eco: 0.04, utility: 0.28, range: 0.42 },
    greed: { damage: 0.3, splash: 0.3, speed: 0.25, coverage: 0.2, control: 0.32, eco: 1.78, utility: 1.08, range: 0.2 },
}

var AI_TOWER_PATH_TRAITS = {
    dart: [{ damage: 1.26, coverage: 1.06 }, { speed: 1.42, coverage: 1.04 }, { damage: 1.16, range: 1.1 }],
    tack: [{ damage: 1.2, splash: 1.1, speed: 1.08 }, { utility: 1.05, coverage: 1.14, range: 1.08 }, { speed: 1.46, coverage: 1.2 }],
    bomb: [{ damage: 1.34, splash: 1.04 }, { damage: 1.24, control: 1.2 }, { splash: 1.58, coverage: 1.18 }],
    ice: [{ splash: 1.3, coverage: 1.14 }, { control: 1.62, utility: 1.08 }, { damage: 1.16, range: 1.2 }],
    super: [{ damage: 1.46, coverage: 1.08 }, { speed: 1.2, damage: 1.12 }, { damage: 1.24, control: 1.08 }],
    farm: [{ eco: 1.34, utility: 0.55 }, { eco: 1.6, utility: 1.1 }, { eco: 1.42, speed: 0.35 }],
    ninja: [{ utility: 1.12, coverage: 1.02 }, { speed: 1.34, splash: 0.94 }, { damage: 1.18, control: 1.1 }],
    dartling: [{ damage: 1.42, range: 1.1 }, { speed: 1.28, splash: 1.08 }, { control: 1.1, coverage: 1.14 }],
    wizard: [{ damage: 1.34, coverage: 1.1 }, { splash: 1.42, speed: 1.14 }, { control: 1.26, utility: 1.04 }],
    cobra: [{ utility: 1.12, range: 0.95 }, { eco: 1.16, utility: 1.3 }, { damage: 0.9, speed: 1.08 }],
    boomer: [{ damage: 1.2, coverage: 1.02 }, { control: 1.26, speed: 1.08 }, { splash: 1.42, coverage: 1.24 }],
    sniper: [{ damage: 1.58, range: 1.08 }, { eco: 1.46, utility: 1.24 }, { speed: 1.22, damage: 1.1 }],
    engi: [{ damage: 1.3, coverage: 1.08 }, { utility: 1.18, range: 1.12 }, { control: 1.18, speed: 1.08 }],
    buccaneer: [{ speed: 1.26, damage: 1.12 }, { splash: 1.2, damage: 1.18 }, { eco: 1.38, utility: 1.08 }],
    mortar: [{ splash: 1.48, coverage: 1.14 }, { damage: 1.36, speed: 1.18 }, { control: 1.26, utility: 1.08 }],
    sword: [{ damage: 1.38, splash: 0.82 }, { speed: 1.28, coverage: 1.04 }, { coverage: 1.22, range: 1.08 }],
}

function cloneAICrosspathIntentWeights(contextKey) {
    var base = AI_CROSSPATH_INTENT_WEIGHTS[contextKey] || AI_CROSSPATH_INTENT_WEIGHTS.balanced
    var weights = {}
    for(var trait in base) {
        weights[trait] = base[trait]
    }
    return weights
}

function getTowerCrosspathIntentWeights(tower, matchup) {
    var weights = cloneAICrosspathIntentWeights(getCrosspathContextKeyForMatchup(tower.towerType, matchup))
    var role = getStrategyPlacementRoleForTowerType(tower.towerType)
    if(role == "support") {
        weights.control += 0.42
        weights.utility += 0.35
        weights.coverage += 0.14
    } else if(role == "antiMoab" || role == "elite") {
        weights.damage += 0.46
        weights.range += 0.18
    } else if(role == "core") {
        weights.splash += 0.16
        weights.speed += 0.1
    }
    if(matchup.enemyVulnerable) {
        weights.speed += 0.1
        weights.damage += 0.08
    }
    return weights
}

function getTowerSpecificCrosspathAdjustment(tower, target, matchup) {
    var p1 = target[0]
    var p2 = target[1]
    var p3 = target[2]
    var bonus = 0

    if(tower.towerType == "dart") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.24
        if((matchup.playerThreat.count >= 12 || matchup.enemyVulnerable) && p2 >= 2) bonus += 0.18
        if(matchup.enemyVulnerable && p3 >= 2) bonus += 0.12
    } else if(tower.towerType == "tack") {
        if(matchup.playerThreat.count >= 12 && p1 >= 3) bonus += 0.26
        if(matchup.enemyVulnerable && p3 >= 3) bonus += 0.22
        if(matchup.dangerHigh && p2 >= 2) bonus += 0.1
    } else if(tower.towerType == "bomb") {
        if(matchup.playerThreat.heavyCount >= 1 && p2 >= 3) bonus += 0.28
        if(matchup.playerThreat.count >= 12 && p3 >= 3) bonus += 0.24
        if(matchup.dangerHigh && p1 >= 3) bonus += 0.12
    } else if(tower.towerType == "ice") {
        if(matchup.playerThreat.count >= 12 && p1 >= 3) bonus += 0.24
        if((matchup.dangerHigh || matchup.playerThreat.heavyCount >= 1) && p2 >= 3) bonus += 0.22
        if(matchup.playerThreat.heavyCount >= 1 && p3 >= 3) bonus += 0.16
    } else if(tower.towerType == "super") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.26
        if(matchup.enemyVulnerable && p2 >= 3) bonus += 0.18
        if(matchup.dangerHigh && p3 >= 3) bonus += 0.16
    } else if(tower.towerType == "farm") {
        if(matchup.safeToGreed && p2 >= 3) bonus += 0.24
        if(matchup.safeToGreed && p3 >= 3) bonus += 0.18
        if(matchup.safeToGreed == false && p1 >= 3) bonus += 0.18
    } else if(tower.towerType == "ninja") {
        if(matchup.enemyVulnerable && p2 >= 3) bonus += 0.16
        if(matchup.playerThreat.heavyCount >= 1 && p3 >= 2) bonus += 0.14
        if(matchup.dangerHigh && p1 >= 2) bonus += 0.1
    } else if(tower.towerType == "dartling") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.28
        if(matchup.playerThreat.count >= 12 && p2 >= 3) bonus += 0.24
        if(matchup.dangerHigh && p3 >= 3) bonus += 0.18
    } else if(tower.towerType == "wizard") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.24
        if(matchup.playerThreat.count >= 12 && p2 >= 3) bonus += 0.26
        if(matchup.dangerHigh && p3 >= 2) bonus += 0.14
    } else if(tower.towerType == "cobra") {
        if(matchup.safeToGreed && p2 >= 3) bonus += 0.3
        if(matchup.enemyVulnerable && p3 >= 3) bonus += 0.26
    } else if(tower.towerType == "boomer") {
        if(matchup.playerThreat.count >= 12 && p3 >= 3) bonus += 0.26
        if(matchup.playerThreat.heavyCount >= 1 && p2 >= 3) bonus += 0.22
        if(matchup.dangerHigh && p1 >= 3) bonus += 0.12
    } else if(tower.towerType == "sniper") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.3
        if(matchup.safeToGreed && p2 >= 3) bonus += 0.28
        if(matchup.enemyVulnerable && p3 >= 2) bonus += 0.14
    } else if(tower.towerType == "engi") {
        if(matchup.dangerHigh && p1 >= 3) bonus += 0.2
        if(matchup.safeToGreed && p2 >= 2) bonus += 0.14
        if(matchup.playerThreat.count >= 12 && p3 >= 3) bonus += 0.22
    } else if(tower.towerType == "buccaneer") {
        if(matchup.safeToGreed && p3 >= 3) bonus += 0.3
        if(matchup.playerThreat.heavyCount >= 1 && p2 >= 3) bonus += 0.24
        if(matchup.playerThreat.count >= 12 && p1 >= 3) bonus += 0.18
    } else if(tower.towerType == "mortar") {
        if(matchup.playerThreat.count >= 12 && p1 >= 3) bonus += 0.24
        if(matchup.playerThreat.heavyCount >= 1 && p2 >= 3) bonus += 0.26
        if(matchup.dangerHigh && p3 >= 3) bonus += 0.2
    } else if(tower.towerType == "sword") {
        if(matchup.playerThreat.heavyCount >= 1 && p1 >= 3) bonus += 0.24
        if(matchup.enemyVulnerable && p2 >= 3) bonus += 0.22
        if(matchup.playerThreat.count >= 12 && p3 >= 3) bonus += 0.2
    }

    return bonus
}

function getTowerStrategicTargetWeight(tower, target, matchup) {
    var pathTraits = AI_TOWER_PATH_TRAITS[tower.towerType]
    if(!pathTraits) {
        return 1
    }

    var weights = getTowerCrosspathIntentWeights(tower, matchup)
    var score = 0
    for(var pathIndex = 0; pathIndex < 3; pathIndex++) {
        var tiers = target[pathIndex]
        var traits = pathTraits[pathIndex] || {}
        for(var trait in traits) {
            score += tiers * traits[trait] * (weights[trait] || 0)
        }
    }

    var dominantPath = getDominantTowerPath(tower) - 1
    if(target[dominantPath] >= Math.max(2, tower["path" + (dominantPath + 1) + "Upgrades"])) {
        score += 0.9
    }
    return 0.82 + score * 0.1 + getTowerSpecificCrosspathAdjustment(tower, target, matchup)
}

function getPlacementCrowdingPenalty(side, x, y, towerType) {
    var penalty = 0
    for(var i = 0; i < towers.length; i++) {
        if(!towers[i]) {
            continue
        }
        if(towers[i].playerSide != side) {
            continue
        }

        var dx = x - towers[i].x
        var dy = y - towers[i].y
        var distance = Math.sqrt(dx * dx + dy * dy)
        if(distance < 95) {
            penalty += (95 - distance) * 0.2
            if(towers[i].towerType == towerType) {
                penalty += (95 - distance) * 0.18
            }
        }
    }

    return penalty
}

function findValidSpotNear(side, radius, centerX, centerY, maxSearchRadius) {
    var searchStep = 24
    var bounds = getSideBounds(side, radius)

    for(var distance = 0; distance <= maxSearchRadius; distance += searchStep) {
        for(var dx = -distance; dx <= distance; dx += searchStep) {
            for(var dy = -distance; dy <= distance; dy += searchStep) {
                if(distance > 0 && Math.max(Math.abs(dx), Math.abs(dy)) != distance) {
                    continue
                }

                var x = clamp(centerX + dx, bounds.minX, bounds.maxX)
                var y = clamp(centerY + dy, bounds.minY, bounds.maxY)
                if(canPlaceTowerAt(side, x, y, radius)) {
                    return { x: x, y: y }
                }
            }
        }
    }

    return null
}

function getAIFarmAnchor(side) {
    var placementProfile = AI_PLACEMENT_PROFILES[getCurrentAIStrategy().placementProfile] || AI_PLACEMENT_PROFILES.balanced
    return {
        x: side == PLAYER_SIDE.left ? canvas.width * 0.2 : canvas.width * 0.8,
        y: canvas.height * placementProfile.farmAnchorY,
    }
}

function findAIFarmSpot(side, radius, offsetIndex) {
    return findAISpot(side, radius, 200, "farm", offsetIndex || 0, "farm")
}

function findAIFarmerSpot(side) {
    return findAISpot(side, 30, 250, "farmer", getSideTowersByType(side, "farmer").length, "farmer")
}

function findAIFarmerSpotForFarm(farm) {
    ensureAILearningLoaded()
    var bestSpot = null
    var bestScore = -Infinity
    var step = 24
    for(var distance = 0; distance <= 140; distance += step) {
        for(var dx = -distance; dx <= distance; dx += step) {
            for(var dy = -distance; dy <= distance; dy += step) {
                if(distance > 0 && Math.max(Math.abs(dx), Math.abs(dy)) != distance) {
                    continue
                }

                var x = farm.x + dx
                var y = farm.y + dy
                if(canPlaceTowerAt(farm.playerSide, x, y, 30) == false) {
                    continue
                }

                var bucket = getAIPlacementBucket(farm.playerSide, x, y)
                var key = getAIPlacementStatKey(mapNumber, "farmer", "farmer", bucket)
                var score = getAILearningScore(aiLearning.placementStats, key) * 48
                score += Math.max(0, 240 - Math.sqrt((x - farm.x) ** 2 + (y - farm.y) ** 2)) * 0.24
                score += getSideTrackDistance(farm.playerSide, x, y) * 0.14
                score -= getPlacementCrowdingPenalty(farm.playerSide, x, y, "farmer")
                if(score > bestScore) {
                    bestScore = score
                    bestSpot = { x: x, y: y }
                }
            }
        }
    }

    return bestSpot
}

function getAISpotScore(side, x, y, radius, range, role, offsetIndex, towerType, matchup) {
    ensureAILearningLoaded()
    var placementProfile = AI_PLACEMENT_PROFILES[getCurrentAIStrategy().placementProfile] || AI_PLACEMENT_PROFILES.balanced
    var roleTargets = placementProfile.roleY[role] || placementProfile.roleY.core
    var preferredY = canvas.height * roleTargets[(offsetIndex || 0) % roleTargets.length]
    var bucket = getAIPlacementBucket(side, x, y)
    var learningKey = getAIPlacementStatKey(mapNumber, towerType, role, bucket)
    var score = getAILearningScore(aiLearning.placementStats, learningKey) * 48
    var loadoutKey = getCurrentAILoadoutKey()
    var strategyId = getCurrentAIStrategyId()
    if(loadoutKey && strategyId) {
        score += getAILearningScore(aiLearning.loadoutPlacementStats, getAILoadoutPlacementStatKey(loadoutKey, strategyId, mapNumber, towerType, role, bucket)) * 58
    }

    if(role == "farm") {
        var anchor = getAIFarmAnchor(side)
        var trackDistance = getSideTrackDistance(side, x, y)
        score += Math.max(0, 260 - Math.sqrt((x - anchor.x) ** 2 + (y - anchor.y) ** 2)) * 0.42
        score += trackDistance * 0.28
    } else if(role == "farmer") {
        var farms = getSideTowersByType(side, "farm")
        if(farms.length == 0) {
            return -Infinity
        }

        var farmsCovered = 0
        var totalFarmDistance = 0
        for(var farmIndex = 0; farmIndex < farms.length; farmIndex++) {
            var farmDistance = Math.sqrt((x - farms[farmIndex].x) ** 2 + (y - farms[farmIndex].y) ** 2)
            totalFarmDistance += farmDistance
            if(farmDistance <= 230) {
                farmsCovered++
            }
        }
        score += farmsCovered * 36
        score += Math.max(0, 260 - totalFarmDistance / farms.length) * 0.26
        score += getSideTrackDistance(side, x, y) * 0.14
    } else {
        var coverage = getPlacementCoverageStats(side, x, y, range)
        var progressTarget = getRolePlacementProgressTarget(role)
        var profile = getTowerPlacementHeuristicProfile(towerType, role)
        score += coverage.coverageCount * profile.coverage
        score += coverage.span * profile.span
        score += coverage.midCount * profile.mid
        score += coverage.lateCount * profile.late
        score += coverage.earlyCount * profile.early
        score += coverage.longestRun * profile.longestRun
        score += coverage.straightRun * profile.straightRun
        score += coverage.lineAimScore * profile.lineAim
        score -= Math.abs(coverage.averageProgress - progressTarget) * profile.progressPenalty
        score -= Math.abs(y - preferredY) * profile.preferredYPenalty
        score += Math.max(0, 220 - coverage.nearestTrackDistance) * profile.closeTrack
        score += coverage.nearestTrackDistance * profile.farTrack
        score += getTowerPlacementStrategicBonus(towerType, role, coverage, matchup)

        if(towerType == "bomb" || towerType == "boomer" || towerType == "tack" || towerType == "mortar" || towerType == "wizard") {
            score += coverage.span * 18 + coverage.coverageCount * 0.35
        }
        if(towerType == "dartling" || towerType == "mortar" || towerType == "dart") {
            score += coverage.lineAimScore * 18
        }
    }

    score -= getPlacementCrowdingPenalty(side, x, y, towerType)
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
                score: getAISpotScore(side, x, y, radius, range, role, offsetIndex || 0, towerType, matchup),
            })
        }
    }

    if(candidates.length == 0) {
        return null
    }

    var placementPolicy = getAIPolicyForDecision()
    var placementBootstrap = getAIDecisionBootstrapWeight(AI_DECISION_FAMILY.placement, placementPolicy)
    var placementSeed = [mapNumber, towerType, role, offsetIndex || 0, placementPolicy.decision.trainingSamples[AI_DECISION_FAMILY.placement]].join("|")
    for(var shortlistIndex = 0; shortlistIndex < candidates.length; shortlistIndex++) {
        var shortlistCandidate = candidates[shortlistIndex]
        var stablePriority = getAIStableStringHash(placementSeed + "|" + Math.round(shortlistCandidate.x) + "|" + Math.round(shortlistCandidate.y)) / 4294967295 * 2 - 1
        shortlistCandidate.shortlistPriority = Math.tanh(shortlistCandidate.score / 140) * placementBootstrap + stablePriority * (1 - placementBootstrap)
    }
    candidates.sort(function(a, b) {
        return b.shortlistPriority - a.shortlistPriority
    })
    var finalCandidates = candidates.slice(0, Math.min(candidates.length, 48))
    var stateFeatures = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.placement, matchup)
    for(var candidateIndex = 0; candidateIndex < finalCandidates.length; candidateIndex++) {
        var candidate = finalCandidates[candidateIndex]
        candidate.decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
            id: [mapNumber, towerType, role, Math.round(candidate.x), Math.round(candidate.y)].join("|"),
            type: towerType,
            role: role,
            actionKey: "place|" + towerType + "|" + role,
            heuristic: candidate.score,
            heuristicScale: 140,
            money: Math.max(1, players[side].money),
            effect: range == Infinity ? 300 : range,
            effectScale: 300,
            x: candidate.x,
            y: candidate.y,
            index: candidateIndex,
            maxIndex: Math.max(1, finalCandidates.length - 1),
        }, matchup, stateFeatures)
    }
    finalCandidates.sort(function(a, b) {
        if(a.decision.score != b.decision.score) return b.decision.score - a.decision.score
        return a.decision.id < b.decision.id ? -1 : 1
    })
    return { x: finalCandidates[0].x, y: finalCandidates[0].y, decisionSample: finalCandidates[0].decision }
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
    var strategy = getCurrentAIStrategy()
    return strategy.placementRoles[image] || "core"
}

function getStrategyPlacementRoleForTowerType(towerType) {
    var strategy = getCurrentAIStrategy()
    for(var i = 0; i < strategy.towers.length; i++) {
        if(getTowerTypeFromImage(strategy.towers[i]) == towerType) {
            return getStrategyPlacementRoleForImage(strategy.towers[i])
        }
    }

    if(towerType == "farmer") {
        return "farmer"
    }
    if(towerType == "farm") {
        return "farm"
    }

    return "core"
}

function getSideTowersByStrategyRole(side, role) {
    var sideTowers = []
    for(var i = 0; i < towers.length; i++) {
        if(towers[i].playerSide == side && getStrategyPlacementRoleForTowerType(towers[i].towerType) == role) {
            sideTowers.push(towers[i])
        }
    }
    return sideTowers
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
    return {
        towerType: tower.towerType,
        path1Upgrades: tower.path1Upgrades,
        path2Upgrades: tower.path2Upgrades,
        path3Upgrades: tower.path3Upgrades,
        playerSide: tower.playerSide,
        towerID: tower.towerID,
    }
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

function aiRequestPlaceTowerImage(side, image, priority, decisionSample) {
    var slotIndex = players[side].towers.indexOf(image)
    if(slotIndex == -1) {
        return false
    }

    var role = getStrategyPlacementRoleForImage(image)
    var spotIndex = getSideTowersByStrategyRole(side, role).length
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
    return sellTowerInstance(tower)
}

function moveAICursorToward(side, targetX, targetY) {
    var activeCursor = players[side].cursor
    var dx = targetX - activeCursor.x
    var dy = targetY - activeCursor.y

    if(Math.abs(dx) <= 15 && Math.abs(dy) <= 15) {
        activeCursor.x = targetX
        activeCursor.y = targetY
        return true
    }

    if(Math.abs(dx) <= 15) {
        activeCursor.x = targetX
    } else {
        moveCursor(side, dx > 0 ? 15 : -15, 0)
    }

    if(Math.abs(dy) <= 15) {
        activeCursor.y = targetY
    } else {
        moveCursor(side, 0, dy > 0 ? 15 : -15)
    }

    return activeCursor.x == targetX && activeCursor.y == targetY
}

function isAITrainingDirectAIActionMode() {
    return typeof isAITrainingTrueSelfPlayActive == "function" && isAITrainingTrueSelfPlayActive()
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

function startAIManualAimAction(side, type, aimTowers, targetX, targetY) {
    if(type != "follow" && type != "lock" || !aimTowers || aimTowers.length == 0) {
        return false
    }

    aiProfile.manualAimAction = {
        side: side,
        type: type,
        towerIDs: aimTowers.map(function(tower) { return tower.towerID }),
        towerIndex: 0,
        phase: "move-to-tower",
        targetX: targetX,
        targetY: targetY,
        readyAt: 0,
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
            var reachedTower = false
            if(isAITrainingDirectAIActionMode()) {
                players[side].cursor.x = tower.x
                players[side].cursor.y = tower.y
                reachedTower = true
            } else {
                reachedTower = moveAICursorToward(side, tower.x, tower.y)
            }
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

    aiProfile.manualAimAction = null
    var aimTowers = getManualAimTowers(side)
    aiProfile.aimLocked = aimTowers.length > 0 && aimTowers.every(isManualAimTowerLocked)
    return true
}

function getAIAimSnapshot(side) {
    var weightedX = 0
    var weightedY = 0
    var totalWeight = 0
    var count = 0
    var heavyCount = 0
    var maxPathPos = 0

    for(var i = 0; i < bloons.length; i++) {
        var bloon = bloons[i]
        if(bloon.playerSide != side || bloon.isBoss) {
            continue
        }

        var progress = clamp(bloon.pathPos / 100, 0, 1)
        var weight = Math.sqrt(Math.max(1, estimateBloonLeakDamage(bloon.health))) * getBloonUrgencyWeight(bloon) * (0.45 + progress)
        weightedX += bloon.x * weight
        weightedY += bloon.y * weight
        totalWeight += weight
        count++
        maxPathPos = Math.max(maxPathPos, bloon.pathPos)
        if(isHeavyBloonHealth(bloon.health)) {
            heavyCount++
        }
    }

    if(totalWeight <= 0 || count == 0) {
        return null
    }

    return {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight,
        count: count,
        heavyCount: heavyCount,
        maxPathPos: maxPathPos,
        score: totalWeight,
    }
}

function shouldAILockAim(aimSnapshot) {
    return aimSnapshot.heavyCount >= 1 || aimSnapshot.maxPathPos >= 48 || aimSnapshot.count <= 4
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

function aiRequestPlaceFarmer(side, priority) {
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
    })
}

function aiRequestPlaceFarmerForFarm(farm, priority) {
    var spot = findAIFarmerSpotForFarm(farm)
    if(!spot) {
        return false
    }

    return setAIAction({
        type: "placeFarmer",
        side: farm.playerSide,
        targetX: spot.x,
        targetY: spot.y,
        priority: priority,
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
    if(!tower) {
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

function aiRequestCollectFarm(side, tower, priority) {
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
    })
}

function aiRequestCollectBanana(side, banana, priority) {
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
            recordAITacticalDecision(action.side, placedTower.towerType == "farm" ? "farm" : "development", "place|" + placedTower.towerType + "|" + (action.role || "core"), getCurrentPlayerMatchupStyle(action.side), action.decisionSample)
        }
        return placedTower != null
    } else if(action.type == "placeFarmer") {
        var placedFarmer = aiPlaceFarmer(action.side, players[action.side].cursor.x, players[action.side].cursor.y)
        if(placedFarmer) {
            recordAITacticalDecision(action.side, "farm", "place|farmer", getCurrentPlayerMatchupStyle(action.side))
        }
        return placedFarmer != null
    } else if(action.type == "upgradeTower") {
        action.tower = getAITowerByID(action.towerID)
        if(!action.tower) {
            return false
        }
        if(isAITrainingDirectAIActionMode()) {
            selectTowerAt(action.side, action.tower.x, action.tower.y)
            var directUpgradeSucceeded = aiTryUpgradeTower(action.side, action.tower, action.pathNumber)
            if(directUpgradeSucceeded) {
                recordAITacticalDecision(action.side, action.tower.towerType == "farm" ? "farm" : "development", "upgrade|" + action.tower.towerType + "|" + action.pathNumber, getCurrentPlayerMatchupStyle(action.side), action.decisionSample)
            }
            return directUpgradeSucceeded
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
            recordAITacticalDecision(action.side, action.tower.towerType == "farm" ? "farm" : "development", "upgrade|" + action.tower.towerType + "|" + action.pathNumber, getCurrentPlayerMatchupStyle(action.side), action.decisionSample)
        }
        return upgradeSucceeded
    } else if(action.type == "collectFarm") {
        action.tower = getAITowerByID(action.towerID)
        return aiTryCollectFarm(action.side, action.tower)
    } else if(action.type == "sellTower") {
        action.tower = getAITowerByID(action.towerID)
        var soldTowerType = action.tower ? action.tower.towerType : "missing"
        var sellSucceeded = aiTrySellTower(action.side, action.tower)
        if(sellSucceeded) {
            recordAITacticalDecision(action.side, soldTowerType == "farm" ? "farm" : "development", "sell|" + soldTowerType, getCurrentPlayerMatchupStyle(action.side), action.decisionSample)
        }
        return sellSucceeded
    } else if(action.type == "collectBanana") {
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
    if(isAITrainingDirectAIActionMode()) {
        players[action.side].cursor.x = action.targetX
        players[action.side].cursor.y = action.targetY
        handleAIActionResult(action, executeAIAction(action))
        return
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

    var aimSnapshot = getAIAimSnapshot(side)
    if(!aimSnapshot) {
        var unlockedTowers = aimTowers.filter(function(tower) { return !isManualAimTowerLocked(tower) })
        if(unlockedTowers.length > 0) {
            startAIManualAimAction(side, "lock", unlockedTowers, players[side].cursor.x, players[side].cursor.y)
            return advanceAIManualAimAction(side)
        }
        aiProfile.aimLocked = true
        return false
    }

    aiProfile.lastAimX = aimSnapshot.x
    aiProfile.lastAimY = aimSnapshot.y
    var lockedTowers = aimTowers.filter(isManualAimTowerLocked)
    aiProfile.aimLocked = lockedTowers.length == aimTowers.length
    var desiredShift = 0
    for(var i = 0; i < lockedTowers.length; i++) {
        desiredShift = Math.max(desiredShift, Math.sqrt((aimSnapshot.x - lockedTowers[i].targetX) ** 2 + (aimSnapshot.y - lockedTowers[i].targetY) ** 2))
    }

    if(desiredShift >= 42 && lockedTowers.length > 0) {
        startAIManualAimAction(side, "follow", lockedTowers, aimSnapshot.x, aimSnapshot.y)
        return advanceAIManualAimAction(side)
    }
    if(aiProfile.aimLocked) {
        return false
    }

    var reachedTarget = moveAICursorToward(side, aimSnapshot.x, aimSnapshot.y)

    if(reachedTarget && shouldAILockAim(aimSnapshot)) {
        var towersToLock = aimTowers.filter(function(tower) { return !isManualAimTowerLockedAt(tower, aimSnapshot.x, aimSnapshot.y) })
        if(towersToLock.length > 0) {
            startAIManualAimAction(side, "lock", towersToLock, aimSnapshot.x, aimSnapshot.y)
            return advanceAIManualAimAction(side)
        }
    }
    return !reachedTarget
}

function aiSelectEcoSend(side, matchup) {
    if(shouldAIPauseEcoForPendingPurchase(side, matchup)) {
        players[side].autoEco = false
        return
    }

    var startIndex = side == PLAYER_SIDE.left ? 0 : 10
    var strategy = getCurrentAIStrategy()
    var endIndex = side == PLAYER_SIDE.left ? 9 : 19
    var gameRound = Math.max(1, Math.trunc(round / 2))
    var currentLocalIndex = clamp(players[side].selectedBloon - startIndex, 0, endIndex - startIndex)
    var reserveMoney = strategy.ecoFloor
    if(matchup) {
        reserveMoney += matchup.dangerHigh ? 900 : 0
        reserveMoney += matchup.playerThreat.heavyCount > 0 ? 700 : 0
        if(matchup.defenseMath.requiredDps > matchup.defenseMath.currentDps * 0.95) {
            reserveMoney += 1000
        }
    }
    if(gameRound >= 28) {
        reserveMoney += 1800 + (gameRound - 28) * 320
        if(players[side].eco >= 1600) {
            reserveMoney += Math.round((players[side].eco - 1600) * 1.5)
        }
        if(matchup && matchup.safeToGreed == false) {
            reserveMoney += 1400
        }
    }

    var reserveConstrained = players[side].money < reserveMoney && (gameRound >= 28 || matchup && matchup.dangerHigh)

    var sustainableSpendRate = players[side].eco / 6 + Math.max(0, players[side].money - reserveMoney) / 8
    var recommendedStage = 0
    if(gameRound >= 2) recommendedStage = 1
    if(gameRound >= 3) recommendedStage = 2
    if(gameRound >= 4) recommendedStage = 3
    if(gameRound >= 5) recommendedStage = 4
    if(gameRound >= 6) recommendedStage = 5
    if(gameRound >= 9) recommendedStage = 6
    if(gameRound >= 12) recommendedStage = 7
    if(gameRound >= 16 && players[side].eco >= 900 && players[side].money >= reserveMoney + 1800) recommendedStage = 8
    if(matchup) {
        if(matchup.dangerHigh) {
            recommendedStage -= 2
        }
        if(matchup.playerThreat.heavyCount > 0) {
            recommendedStage -= 1
        }
        if(matchup.safeToGreed && players[side].eco >= 700) {
            recommendedStage += 1
        }
        if(matchup.enemyVulnerable && strategy.rushBias >= 0.6) {
            recommendedStage += 1
        }
    }
    if(gameRound >= 28) {
        if(players[side].eco >= 2200) {
            recommendedStage = Math.min(recommendedStage, 4)
        } else {
            recommendedStage = Math.min(recommendedStage, 5)
        }
    }
    recommendedStage = clamp(recommendedStage, 0, 8)

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
        var ecoPerCost = bloon.eco / Math.max(1, bloon.cost)
        var ecoPerSecond = bloon.eco / groupDurationSec
        var costPerSecond = bloon.cost / groupDurationSec
        var score = ecoPerSecond * 1.9 + ecoPerCost * 65

        score -= Math.abs(localIndex - recommendedStage) * 1.8
        score -= Math.max(0, localIndex - recommendedStage - 1) * 4.5
        score -= Math.max(0, Math.abs(localIndex - currentLocalIndex) - 2) * 1.2

        if(localIndex == currentLocalIndex) {
            score += 2.5
        } else if(localIndex == currentLocalIndex + 1) {
            score += 1.25
        }

        if(costPerSecond > sustainableSpendRate * 1.08) {
            score -= (costPerSecond - sustainableSpendRate * 1.08) * 0.18
        }
        if(players[side].money < bloon.cost * 2 && localIndex > currentLocalIndex + 1) {
            score -= 8
        }
        if(matchup && matchup.dangerHigh && localIndex >= 7) {
            score -= 6
        }
        if(matchup && matchup.safeToGreed && localIndex == recommendedStage) {
            score += 4
        }
        score += getAITacticalActionBonus(side, "eco", "send|" + localIndex, matchup) * 18
        var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.eco, {
            id: "eco|" + localIndex,
            type: "bloon|" + bloon.health,
            actionKey: "send|" + localIndex,
            heuristic: score,
            heuristicScale: 24,
            cost: bloon.cost,
            money: players[side].money,
            effect: ecoPerSecond,
            effectScale: 20,
            index: localIndex,
            maxIndex: endIndex - startIndex,
            count: bloon.count,
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
        actionKey: "noop",
        heuristic: reserveConstrained ? 12 : matchup && matchup.dangerHigh ? 5 : -3,
        heuristicScale: 24,
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
            recordAITacticalDecision(side, "eco", "send|" + (bestIndex - startIndex), matchup, bestDecision)
        }
    }
}

function getDefenseTraitsForSide(side) {
    var traits = {
        splash: 0,
        heavy: 0,
        global: 0,
        defenseCount: 0,
    }

    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(!tower) {
            continue
        }
        if(tower.playerSide != side || isCombatTower(tower) == false) {
            continue
        }

        var tier = getTowerTotalTier(tower)
        traits.defenseCount++
        if(tower.towerType == "bomb" || tower.towerType == "boomer" || tower.towerType == "tack" || tower.towerType == "ice" || tower.towerType == "wizard" || tower.towerType == "mortar") {
            traits.splash += 1 + tier * 0.2
        }
        if(tower.towerType == "dartling" && tower.path3Upgrades >= 2 || tower.towerType == "engi" && tower.path3Upgrades >= 3) {
            traits.splash += 1.2 + tier * 0.2
        }
        if(tower.towerType == "bomb" || tower.towerType == "sniper" || tower.towerType == "super" || tower.towerType == "mortar" || tower.towerType == "dartling" || tower.towerType == "sword") {
            traits.heavy += 1 + tier * 0.22
        }
        if(tower.towerType == "boomer" && tower.path2Upgrades >= 3 || tower.towerType == "wizard" && tower.path1Upgrades >= 3) {
            traits.heavy += 0.8 + tier * 0.18
        }
        if(tower.range == Infinity || tower.towerType == "sniper" || tower.towerType == "mortar" || tower.towerType == "dartling") {
            traits.global += 1 + tier * 0.1
        }
    }

    return traits
}

function getRushSendScore(side, bloon, matchup, enemyTraits, aggressiveRush) {
    var groupDurationSec = Math.max(0.2, (bloon.spacing * Math.max(1, bloon.count)) / 1000)
    var totalHealth = bloon.health * bloon.count
    var burstPressure = totalHealth / groupDurationSec
    var score = burstPressure * 0.06 + Math.sqrt(Math.max(1, totalHealth)) * 0.7 - bloon.cost * 0.0015

    if(bloon.health >= 18) {
        score += Math.max(0, 9 - enemyTraits.heavy * 1.8)
    }
    if(bloon.count >= 4 || bloon.spacing <= 100) {
        score += Math.max(0, 9 - enemyTraits.splash * 1.7)
    }
    if(bloon.eco < 0) {
        score += 3
    }
    if(enemyTraits.defenseCount <= 2) {
        score += 6
    }
    if(matchup.enemyVulnerable) {
        score += 5.5
    }
    if(matchup.playerLives <= 80) {
        score += 2.5
    }
    if(aggressiveRush) {
        score += 3.5
    }
    if(matchup.dangerHigh) {
        score -= 8
    }
    if(players[side].money < bloon.cost * 2 && bloon.eco < 0) {
        score -= 4
    }

    var displayIndex = displayBloons.indexOf(bloon)
    var localIndex = displayIndex >= 10 ? displayIndex - 10 : displayIndex
    score += getAITacticalActionBonus(side, "rush", "send|" + localIndex, matchup) * 18

    return score
}

function getBestRushSendIndex(side, matchup) {
    var startIndex = side == PLAYER_SIDE.left ? 0 : 10
    var endIndex = side == PLAYER_SIDE.left ? 9 : 19
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var enemyTraits = getDefenseTraitsForSide(enemySide)
    var aggressiveRush = getCurrentAIStrategy().rushBias >= 0.72
    var bestIndex = -1
    var bestDecision = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.rush, matchup)

    for(var i = startIndex; i <= endIndex; i++) {
        var candidate = displayBloons[i]
        if(!candidate || candidate.image == "locked.png" || candidate.cost > players[side].money) {
            continue
        }

        var localIndex = i - startIndex
        var candidateScore = getRushSendScore(side, candidate, matchup, enemyTraits, aggressiveRush)
        var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.rush, {
            id: "rush|" + localIndex,
            type: "bloon|" + candidate.health,
            actionKey: "send|" + localIndex,
            heuristic: candidateScore,
            heuristicScale: 28,
            cost: candidate.cost,
            money: players[side].money,
            effect: candidate.health * candidate.count,
            effectScale: 800,
            index: localIndex,
            maxIndex: endIndex - startIndex,
            count: candidate.count,
            urgency: matchup.enemyVulnerable ? 1 : 0.25,
        }, matchup, decisionState)
        if(isAIDecisionScoreBetter(decision, bestDecision)) {
            bestDecision = decision
            bestIndex = i
        }
    }
    if(bestIndex != -1) displayBloons[bestIndex].aiDecisionSample = bestDecision
    return bestIndex
}

function aiQueueRush(side, matchup) {
    var strategy = getCurrentAIStrategy()
    var bestIndex = getBestRushSendIndex(side, matchup)

    if(bestIndex == -1) {
        return false
    }

    var reserveMoney = matchup.dangerHigh ? strategy.ecoFloor * 0.75 : strategy.ecoFloor * 0.4
    if(strategy.rushBias >= 0.72 && matchup.enemyVulnerable) {
        reserveMoney *= 0.7
    }

    players[side].autoEco = false
    players[side].selectedBloon = bestIndex
    var queuedAny = false
    while(players[side].bloonQueue.length < 6) {
        var selectedBloon = displayBloons[bestIndex]
        if(players[side].money < selectedBloon.cost || players[side].money - selectedBloon.cost < reserveMoney) {
            break
        }
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
    aiProfile.lastRushAt = gameNow()
    recordAITacticalDecision(side, "rush", "send|" + (bestIndex - (side == PLAYER_SIDE.left ? 0 : 10)), matchup, displayBloons[bestIndex].aiDecisionSample)
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

    var used = aiTryUseBoost(side, slot)
    if(used) {
        var family = boostType == "bloonboost.png" || boostType == "slowboost.png" ? "offenseBoost" : boostType == "ecoboost.png" ? "eco" : "defenseBoost"
        recordAITacticalDecision(side, family, "boost|" + boostType.replace(".png", ""), getCurrentPlayerMatchupStyle(side), decisionSample)
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

function canAIUpgradeToHandleThreat(side, matchup, defenseMath) {
    var option = getBestTowerUpgradeOption(side, matchup, defenseMath || matchup.defenseMath)
    if(!option) {
        return false
    }

    var relevantMath = defenseMath || matchup.defenseMath
    if(!relevantMath || relevantMath.requiredDps <= 0) {
        return true
    }

    return option.projectedDps >= relevantMath.requiredDps * 0.94 || option.dpsGain >= Math.max(6, relevantMath.requiredDps - relevantMath.currentDps)
}

function canAIPlaceExtraDefenseNow(side, matchup, defenseMath) {
    var option = getBestPlacementOption(side, matchup, defenseMath || matchup.defenseMath, true)
    if(!option) {
        return false
    }

    var relevantMath = defenseMath || matchup.defenseMath
    if(!relevantMath || relevantMath.requiredDps <= 0) {
        return true
    }

    return option.projectedDps >= relevantMath.requiredDps * 0.9 || option.dpsGain >= Math.max(8, relevantMath.requiredDps - relevantMath.currentDps)
}

function isAIDefenseActionPending() {
    return aiProfile.currentAction && (aiProfile.currentAction.type == "upgradeTower" || aiProfile.currentAction.type == "placeTower")
}

function shouldAITowerBoost(side) {
    var threat = getBloonThreatSnapshot(side, false)
    var boostWindow = getTowerBoostThreatSnapshot(side)
    var matchup = getCurrentPlayerMatchupStyle(side)
    var defenseMath = matchup.defenseMath
    var lives = players[side].lives == Infinity ? 150 : players[side].lives
    var actionPending = isAIDefenseActionPending()
    var canStillDefendWithoutBoost = canAIUpgradeToHandleThreat(side, matchup, defenseMath) || canAIPlaceExtraDefenseNow(side, matchup, defenseMath)

    if(threat.count == 0) {
        return false
    }
    if(defenseMath.closeRequiredDps <= defenseMath.currentDps * 1.06 && threat.nearExitScore < 18 && boostWindow.heavyCount == 0) {
        return false
    }
    if(boostWindow.count == 0) {
        return false
    }
    if(boostWindow.closeScore < 7 && boostWindow.heavyCount == 0) {
        return false
    }
    if(boostWindow.score < threat.score * 0.34 && threat.nearExitScore < 18) {
        return false
    }
    if((actionPending || canStillDefendWithoutBoost) && defenseMath.minTimeToExitSec > 2.8 && defenseMath.requiredDps <= defenseMath.currentDps * 1.22 && boostWindow.closeScore < 16 && threat.maxPathPos < 64) {
        return false
    }

    return defenseMath.boostedDps >= Math.max(defenseMath.closeRequiredDps, defenseMath.requiredDps * 0.88) * 0.94 && (defenseMath.minTimeToExitSec <= 4.5 || boostWindow.closeScore >= 14 || threat.nearExitScore >= 18 || boostWindow.heavyCount >= 1) || defenseMath.minTimeToExitSec <= 2.2 && defenseMath.currentDps < defenseMath.requiredDps
}

function shouldAIBloonBoost(side) {
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var pressure = getBloonThreatSnapshot(enemySide, true)
    var offenseWindow = getOffensiveBoostSnapshot(side)
    var matchup = getCurrentPlayerMatchupStyle(side)
    var offenseMath = matchup.offenseMath
    var enemyLiquidity = matchup.enemyLiquidity
    var enemyLives = players[enemySide].lives == Infinity ? 150 : players[enemySide].lives
    var actionPending = isAIDefenseActionPending()

    if(pressure.sentCount == 0) {
        return false
    }
    if(offenseMath.requiredDps <= 0 || offenseMath.currentDps >= offenseMath.bloonBoostRequiredDps) {
        return false
    }
    if(offenseWindow.count == 0) {
        return false
    }
    if(offenseWindow.closeScore < 10 && offenseWindow.nearExitScore < 10 && offenseWindow.heavyCount == 0) {
        return false
    }
    if((actionPending || matchup.dangerHigh) && offenseWindow.nearExitScore < 16 && offenseWindow.closeScore < 18) {
        return false
    }
    if(gameNow() - aiProfile.lastRushAt > 4500 && offenseWindow.nearExitScore < 12 && offenseWindow.closeScore < 18) {
        return false
    }
    if(enemyLiquidity.rich && enemyLiquidity.canDevelopSoon && offenseWindow.nearExitScore < 14 && offenseWindow.closeScore < 18 && offenseWindow.heavyCount == 0) {
        return false
    }
    if(enemyLiquidity.canDevelopNow && matchup.enemyVulnerable == false && offenseMath.bloonBoostRequiredDps <= offenseMath.currentDps * 1.12 && offenseWindow.nearExitScore < 14 && offenseWindow.closeScore < 18) {
        return false
    }

    return offenseMath.bloonBoostRequiredDps > offenseMath.currentDps * (enemyLiquidity.poor ? 1.0 : 1.03) && (offenseWindow.nearExitScore >= (enemyLiquidity.poor ? 8 : 10) || offenseWindow.heavyCount >= 1 && offenseWindow.closeScore >= (enemyLiquidity.poor ? 8 : 9) || pressure.sentCount >= 8 && pressure.maxPathPos >= 52 && offenseWindow.closeScore >= (enemyLiquidity.poor ? 10 : 11) || enemyLives <= 80 && offenseWindow.closeScore >= (enemyLiquidity.poor ? 10 : 12))
}

function shouldAILightningBoost(side) {
    var threat = getBloonThreatSnapshot(side, false)
    var boostWindow = getTowerBoostThreatSnapshot(side)
    var matchup = getCurrentPlayerMatchupStyle(side)
    var defenseMath = matchup.defenseMath
    var actionPending = isAIDefenseActionPending()
    var canStillDefendWithoutBoost = canAIUpgradeToHandleThreat(side, matchup, defenseMath) || canAIPlaceExtraDefenseNow(side, matchup, defenseMath)

    if(threat.heavyCount > 0) {
        return false
    }
    if(defenseMath.closeRequiredDps <= defenseMath.currentDps * 1.05 && threat.nearExitScore < 16) {
        return false
    }
    if(boostWindow.count < 8) {
        return false
    }
    if(boostWindow.closeScore < 9) {
        return false
    }
    if(boostWindow.score < threat.score * 0.36 && threat.nearExitScore < 18) {
        return false
    }
    if((actionPending || canStillDefendWithoutBoost) && defenseMath.minTimeToExitSec > 3 && defenseMath.requiredDps <= defenseMath.currentDps * 1.2 && boostWindow.closeScore < 16 && threat.maxPathPos < 62) {
        return false
    }

    return defenseMath.currentDps + defenseMath.lightningDps >= Math.max(defenseMath.closeRequiredDps, defenseMath.requiredDps * 0.88) * 0.94 && (boostWindow.count >= 12 || threat.nearExitScore >= 18 || defenseMath.minTimeToExitSec <= 3)
}

function shouldAISlowBoost(side) {
    var enemySide = side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
    var offenseWindow = getOffensiveBoostSnapshot(side)
    var matchup = getCurrentPlayerMatchupStyle(side)
    var offenseMath = matchup.offenseMath
    var enemyLiquidity = matchup.enemyLiquidity
    var actionPending = isAIDefenseActionPending()
    var enemyDefense = getSideTowerCountExcluding(enemySide, ["farm", "farmer", "cobra"])

    if(enemyDefense == 0) {
        return false
    }
    if(offenseMath.requiredDps <= 0 || offenseMath.currentDps <= offenseMath.requiredDps) {
        return false
    }
    if(offenseWindow.count < 5) {
        return false
    }
    if(offenseWindow.closeScore < 10) {
        return false
    }
    if((actionPending || matchup.dangerHigh) && offenseWindow.nearExitScore < 18 && offenseWindow.closeScore < 20) {
        return false
    }
    if(gameNow() - aiProfile.lastRushAt > 4500 && offenseWindow.nearExitScore < 10 && offenseWindow.closeScore < 18) {
        return false
    }
    if(enemyLiquidity.rich && enemyLiquidity.canDevelopSoon && offenseWindow.nearExitScore < 16 && offenseWindow.closeScore < 20 && offenseWindow.heavyCount == 0) {
        return false
    }
    if(enemyLiquidity.canDevelopNow && matchup.enemyVulnerable == false && offenseMath.slowedDefenseDps >= offenseMath.requiredDps * 0.88 && offenseWindow.nearExitScore < 16 && offenseWindow.closeScore < 18) {
        return false
    }

    return offenseMath.slowedDefenseDps < offenseMath.requiredDps * (enemyLiquidity.poor ? 1.0 : 0.96) && (offenseWindow.heavyCount >= 1 && offenseWindow.closeScore >= (enemyLiquidity.poor ? 9 : 10) || offenseWindow.defendedCount >= 6 && offenseWindow.closeScore >= (enemyLiquidity.poor ? 11 : 12) || offenseWindow.closeScore >= (enemyLiquidity.poor ? 16 : 18))
}

function shouldAIEcoBoost(side) {
    var threat = getBloonThreatSnapshot(side, false)
    var offenseWindow = getOffensiveBoostSnapshot(side)
    var matchup = getCurrentPlayerMatchupStyle(side)
    var strategy = getCurrentAIStrategy()

    if(isAIDefenseActionPending() || matchup.dangerHigh) {
        return false
    }
    if(offenseWindow.closeScore >= 10 || offenseWindow.nearExitScore >= 8) {
        return false
    }

    return round >= 10 && round <= 26 && threat.score < 8 && players[side].eco < 900 + round * 14 && players[side].money < strategy.ecoFloor + 1500
}

function handleAIRoundStartBoosts(side) {
    var visibleRound = Math.max(1, Math.trunc(round / 2))
    if(visibleRound <= 0 || visibleRound == aiProfile.lastRoundBoostCheck) {
        return
    }

    aiProfile.lastRoundBoostCheck = visibleRound
}

function getStrategyImageForTowerType(towerType) {
    var strategy = getCurrentAIStrategy()
    for(var i = 0; i < strategy.towers.length; i++) {
        if(getTowerTypeFromImage(strategy.towers[i]) == towerType) {
            return strategy.towers[i]
        }
    }

    return ""
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

function shouldAICashOutFarm(side, farm, matchup) {
    if(!farm || farm.towerType != "farm") {
        return false
    }

    var visibleRound = getCurrentVisibleRound()
    if(farm.aiPlacedAt > 0 && farm.aiPlacedRound == visibleRound && players[side].lives > 35) {
        return false
    }
    var liquidity = getDefenseLiquidityState(side)
    var sellValue = getAITowerSellValueEstimate(farm)
    var needsLiquidity = liquidity.cheapestDefenseCost != Infinity && players[side].money < liquidity.cheapestDefenseCost && players[side].money + sellValue >= liquidity.cheapestDefenseCost
    if(matchup.dangerHigh && needsLiquidity) {
        return true
    }
    if(visibleRound >= 22) {
        return true
    }
    if(visibleRound >= 16 && (matchup.safeToGreed == false || getTowerTotalTier(farm) <= 6 || needsLiquidity)) {
        return true
    }
    return false
}

function getBestAIFarmCashoutCandidate(side, matchup) {
    var farms = getSideTowersByType(side, "farm")
    var bestFarm = null
    var bestDecision = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.sell, matchup)
    var visibleRound = getCurrentVisibleRound()
    for(var i = 0; i < farms.length; i++) {
        var farm = farms[i]
        if(farm.aiPlacedAt > 0 && farm.aiPlacedRound == visibleRound && players[side].lives > 35) {
            continue
        }

        var cashoutRecommended = shouldAICashOutFarm(side, farm, matchup)
        var score = getAITowerSellValueEstimate(farm)
        if(cashoutRecommended == false) score -= 1200
        score += Math.max(0, 6 - getTowerTotalTier(farm)) * 12
        if(matchup.dangerHigh) {
            score += 40
        }
        if(farm.path2Upgrades >= 3 && farm.towerVar > 0) {
            score += farm.towerVar * 0.08
        }
        score += Math.max(0, visibleRound - 28) * 4
        var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.sell, {
            id: "sell|farm|" + farm.towerID,
            type: "farm",
            actionKey: "sell|farm",
            heuristic: score,
            heuristicScale: 1200,
            cost: 0,
            money: players[side].money,
            effect: getAITowerSellValueEstimate(farm),
            effectScale: 6000,
            x: farm.x,
            y: farm.y,
            tier1: farm.path1Upgrades,
            tier2: farm.path2Upgrades,
            tier3: farm.path3Upgrades,
            urgency: matchup.dangerHigh ? 1 : 0.35,
        }, matchup, decisionState)
        if(isAIDecisionScoreBetter(decision, bestDecision)) {
            bestDecision = decision
            bestFarm = farm
        }
    }
    var noOpDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.sell, {
        id: "sell|noop",
        type: "noop",
        actionKey: "noop",
        heuristic: matchup.dangerHigh ? -8 : 8,
        heuristicScale: 1200,
        noop: true,
    }, matchup, decisionState)
    if(bestDecision && isAIDecisionScoreBetter(noOpDecision, bestDecision)) {
        recordAINoOpDecision(noOpDecision)
        return null
    }
    if(bestFarm) {
        bestFarm.aiSellDecisionSample = bestDecision
    }
    return bestFarm
}

function getEmergencyDefenseImages(strategy) {
    var priority = []
    for(var i = 0; i < strategy.towers.length; i++) {
        var role = getStrategyPlacementRoleForImage(strategy.towers[i])
        if(role == "antiMoab") {
            priority.push(strategy.towers[i])
        }
    }
    for(var j = 0; j < strategy.towers.length; j++) {
        var coreRole = getStrategyPlacementRoleForImage(strategy.towers[j])
        if(coreRole == "core" || coreRole == "elite") {
            priority.push(strategy.towers[j])
        }
    }

    return priority
}

function getDominantTowerPath(tower) {
    if(!tower) {
        return 1
    }

    var dominantPath = 1
    if(tower.path2Upgrades > tower.path1Upgrades) {
        dominantPath = 2
    }
    if(tower.path3Upgrades > tower["path" + dominantPath + "Upgrades"]) {
        dominantPath = 3
    }
    return dominantPath
}

function getTowerTargetSignature(target) {
    return String(target[0]) + String(target[1]) + String(target[2])
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
    if(matchup.enemyVulnerable && getCurrentAIStrategy().rushBias >= 0.72) {
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

function getTowerBuildTargets(tower, matchup) {
    var dominantPath = getDominantTowerPath(tower)
    var baseTargets = null

    if(tower.towerType == "farm") {
        baseTargets = matchup.safeToGreed ? [{ target: [2, 3, 0], weight: 1.45 }, { target: [0, 2, 3], weight: 1.1 }] : [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 3, 0], weight: 0.95 }]
    } else if(tower.towerType == "dart") {
        if(dominantPath == 1) {
            baseTargets = [{ target: [3, 2, 0], weight: 1.45 }, { target: [0, 2, 3], weight: 1.0 }]
        } else if(dominantPath == 3) {
            baseTargets = matchup.playerThreat.heavyCount >= 1 ? [{ target: [3, 2, 0], weight: 1.38 }, { target: [0, 2, 3], weight: 1.05 }] : [{ target: [0, 2, 3], weight: 1.42 }, { target: [3, 2, 0], weight: 1.0 }]
        } else {
            baseTargets = matchup.dangerHigh ? [{ target: [3, 2, 0], weight: 1.35 }, { target: [0, 2, 3], weight: 1.08 }] : [{ target: [0, 2, 3], weight: 1.34 }, { target: [3, 2, 0], weight: 1.06 }]
        }
    } else if(tower.towerType == "tack") {
        if(dominantPath == 1) {
            baseTargets = [{ target: [3, 2, 0], weight: 1.42 }, { target: [0, 2, 3], weight: 1.0 }]
        } else if(dominantPath == 3) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.45 }, { target: [3, 2, 0], weight: 1.0 }]
        } else {
            baseTargets = matchup.dangerHigh ? [{ target: [0, 2, 3], weight: 1.34 }, { target: [3, 2, 0], weight: 1.08 }] : [{ target: [3, 2, 0], weight: 1.28 }, { target: [0, 2, 3], weight: 1.16 }]
        }
    } else if(tower.towerType == "wizard") {
        if(dominantPath == 2) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 0, 3], weight: 1.05 }]
        } else if(dominantPath == 1) {
            baseTargets = [{ target: [2, 0, 3], weight: 1.4 }, { target: [2, 3, 0], weight: 1.0 }]
        } else {
            baseTargets = matchup.dangerHigh || matchup.playerThreat.heavyCount >= 1 ? [{ target: [2, 0, 3], weight: 1.45 }, { target: [0, 2, 3], weight: 1.05 }] : [{ target: [0, 2, 3], weight: 1.4 }, { target: [2, 0, 3], weight: 1.1 }]
        }
    } else if(tower.towerType == "bomb") {
        if(dominantPath == 2) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.4 }, { target: [2, 0, 3], weight: 1.05 }]
        } else {
            baseTargets = matchup.playerThreat.heavyCount >= 1 ? [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 0, 3], weight: 1.0 }] : [{ target: [2, 0, 3], weight: 1.35 }, { target: [0, 2, 3], weight: 1.05 }]
        }
    } else if(tower.towerType == "ice") {
        if(dominantPath == 2) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 3, 0], weight: 1.02 }]
        } else if(dominantPath == 1) {
            baseTargets = [{ target: [2, 3, 0], weight: 1.42 }, { target: [0, 2, 3], weight: 1.04 }]
        } else {
            baseTargets = matchup.playerThreat.heavyCount >= 1 ? [{ target: [0, 2, 3], weight: 1.4 }, { target: [2, 3, 0], weight: 1.06 }] : [{ target: [2, 3, 0], weight: 1.34 }, { target: [0, 2, 3], weight: 1.1 }]
        }
    } else if(tower.towerType == "mortar") {
        if(dominantPath == 3) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 3, 0], weight: 1.0 }]
        } else {
            baseTargets = matchup.playerThreat.heavyCount >= 1 ? [{ target: [2, 3, 0], weight: 1.45 }, { target: [0, 2, 3], weight: 1.05 }] : [{ target: [0, 2, 3], weight: 1.35 }, { target: [2, 3, 0], weight: 1.1 }]
        }
    } else if(tower.towerType == "dartling") {
        if(dominantPath == 2) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 3, 0], weight: 1.0 }]
        } else {
            baseTargets = matchup.dangerHigh ? [{ target: [2, 3, 0], weight: 1.45 }, { target: [0, 2, 3], weight: 1.05 }] : [{ target: [0, 2, 3], weight: 1.35 }, { target: [2, 3, 0], weight: 1.1 }]
        }
    } else if(tower.towerType == "ninja") {
        baseTargets = dominantPath == 2 ? [{ target: [1, 3, 2], weight: 1.45 }, { target: [2, 0, 3], weight: 1.0 }] : matchup.dangerHigh ? [{ target: [2, 0, 3], weight: 1.4 }, { target: [1, 3, 2], weight: 1.05 }] : [{ target: [1, 3, 2], weight: 1.35 }, { target: [2, 0, 3], weight: 1.0 }]
    } else if(tower.towerType == "sniper") {
        baseTargets = dominantPath == 1 ? [{ target: [3, 2, 0], weight: 1.4 }, { target: [2, 3, 0], weight: 1.0 }] : matchup.safeToGreed ? [{ target: [2, 3, 0], weight: 1.45 }, { target: [3, 2, 0], weight: 1.0 }] : [{ target: [3, 2, 0], weight: 1.35 }, { target: [2, 3, 0], weight: 1.05 }]
    } else if(tower.towerType == "engi") {
        baseTargets = dominantPath == 1 ? [{ target: [3, 1, 2], weight: 1.4 }, { target: [1, 3, 2], weight: 1.05 }] : matchup.dangerHigh ? [{ target: [1, 3, 2], weight: 1.45 }, { target: [3, 1, 2], weight: 1.0 }] : [{ target: [3, 1, 2], weight: 1.35 }, { target: [1, 3, 2], weight: 1.1 }]
    } else if(tower.towerType == "buccaneer") {
        if(matchup.safeToGreed) {
            baseTargets = [{ target: [2, 0, 3], weight: 1.45 }, { target: [3, 2, 0], weight: 1.0 }]
        } else if(matchup.playerThreat.heavyCount >= 1) {
            baseTargets = [{ target: [0, 2, 3], weight: 1.42 }, { target: [3, 2, 0], weight: 1.04 }]
        } else {
            baseTargets = [{ target: [3, 2, 0], weight: 1.34 }, { target: [0, 2, 3], weight: 1.08 }]
        }
    } else if(tower.towerType == "boomer") {
        baseTargets = dominantPath == 3 ? [{ target: [2, 0, 3], weight: 1.35 }, { target: [2, 3, 0], weight: 1.05 }] : matchup.dangerHigh ? [{ target: [2, 0, 3], weight: 1.4 }, { target: [2, 3, 0], weight: 1.1 }] : [{ target: [2, 3, 0], weight: 1.4 }, { target: [2, 0, 3], weight: 1.05 }]
    } else if(tower.towerType == "super") {
        baseTargets = matchup.dangerHigh ? [{ target: [3, 2, 0], weight: 1.45 }, { target: [2, 3, 0], weight: 1.05 }] : [{ target: [2, 3, 0], weight: 1.35 }, { target: [3, 2, 0], weight: 1.1 }]
    } else if(tower.towerType == "cobra") {
        baseTargets = matchup.enemyVulnerable ? [{ target: [0, 2, 3], weight: 1.45 }, { target: [2, 3, 0], weight: 1.0 }] : [{ target: [2, 3, 0], weight: 1.35 }, { target: [0, 2, 3], weight: 1.05 }]
    } else if(tower.towerType == "sword") {
        if(dominantPath == 1) {
            baseTargets = [{ target: [3, 2, 0], weight: 1.44 }, { target: [2, 0, 3], weight: 1.0 }]
        } else if(dominantPath == 2) {
            baseTargets = [{ target: [0, 3, 2], weight: 1.42 }, { target: [3, 2, 0], weight: 1.02 }]
        } else {
            baseTargets = matchup.dangerHigh ? [{ target: [0, 3, 2], weight: 1.36 }, { target: [2, 0, 3], weight: 1.1 }] : [{ target: [2, 0, 3], weight: 1.34 }, { target: [3, 2, 0], weight: 1.08 }]
        }
    } else {
        baseTargets = [{ target: [3, 2, 0], weight: 1.0 }]
    }

    ensureAILearningLoaded()
    var contextKey = getCrosspathContextKeyForMatchup(tower.towerType, matchup)
    var mergedTargets = []
    var mergedBySignature = {}

    function mergeTarget(target, weight) {
        var signature = getTowerTargetSignature(target)
        if(mergedBySignature[signature]) {
            mergedBySignature[signature].weight = Math.max(mergedBySignature[signature].weight, weight)
            return
        }

        var entry = { target: target.slice(0), weight: weight }
        mergedBySignature[signature] = entry
        mergedTargets.push(entry)
    }

    for(var baseIndex = 0; baseIndex < baseTargets.length; baseIndex++) {
        mergeTarget(baseTargets[baseIndex].target, baseTargets[baseIndex].weight)
    }

    var strategicTargets = getCrosspathCandidatesForTowerType(tower.towerType)
    for(var strategicIndex = 0; strategicIndex < strategicTargets.length; strategicIndex++) {
        mergeTarget(strategicTargets[strategicIndex], getTowerStrategicTargetWeight(tower, strategicTargets[strategicIndex], matchup))
    }

    for(var learnedIndex = 0; learnedIndex < strategicTargets.length; learnedIndex++) {
        var learnedSignature = getTowerTargetSignature(strategicTargets[learnedIndex])
        var learnedBonus = getAILearningScore(aiLearning.crosspathStats, getAICrosspathStatKey(tower.towerType, contextKey, learnedSignature))
        if(!mergedBySignature[learnedSignature]) {
            mergeTarget(strategicTargets[learnedIndex], 0.9)
        }
        mergedBySignature[learnedSignature].weight += learnedBonus * 1.35
    }

    mergedTargets.sort(function(a, b) {
        return b.weight - a.weight
    })
    return mergedTargets
}

function getTowerBuildTargetScore(tower, pathNumber, matchup) {
    var current = [tower.path1Upgrades, tower.path2Upgrades, tower.path3Upgrades]
    var upgraded = [tower.path1Upgrades, tower.path2Upgrades, tower.path3Upgrades]
    upgraded[pathNumber - 1]++
    var bestScore = 0

    var buildTargets = getTowerBuildTargets(tower, matchup)
    for(var i = 0; i < buildTargets.length; i++) {
        var target = buildTargets[i].target
        var weight = buildTargets[i].weight
        var beforeDistance = Math.abs(target[0] - current[0]) + Math.abs(target[1] - current[1]) + Math.abs(target[2] - current[2])
        var afterDistance = Math.abs(target[0] - upgraded[0]) + Math.abs(target[1] - upgraded[1]) + Math.abs(target[2] - upgraded[2])
        var dominantTargetPath = 1
        if(target[1] > target[dominantTargetPath - 1]) {
            dominantTargetPath = 2
        }
        if(target[2] > target[dominantTargetPath - 1]) {
            dominantTargetPath = 3
        }

        var score = (beforeDistance - afterDistance) * 22 * weight
        if(pathNumber != dominantTargetPath && current[dominantTargetPath - 1] >= Math.max(2, target[dominantTargetPath - 1] - 1) && current[pathNumber - 1] < target[pathNumber - 1]) {
            score += 14 * weight
        }
        if(pathNumber == dominantTargetPath && current[dominantTargetPath - 1] >= target[dominantTargetPath - 1] && (current[0] < target[0] || current[1] < target[1] || current[2] < target[2])) {
            score -= 10 * weight
        }
        if(score > bestScore) {
            bestScore = score
        }
    }

    return bestScore
}

function getTowerGoalTarget(tower, matchup) {
    return getTowerBuildTargets(tower, matchup)[0].target
}

function getGoalUpgradeOrder(goalTarget) {
    var dominantPath = 1
    if(goalTarget[1] > goalTarget[dominantPath - 1]) {
        dominantPath = 2
    }
    if(goalTarget[2] > goalTarget[dominantPath - 1]) {
        dominantPath = 3
    }

    var order = [dominantPath]
    for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
        if(pathNumber != dominantPath) {
            order.push(pathNumber)
        }
    }
    order.sort(function(a, b) {
        if(a == dominantPath) {
            return -1
        }
        if(b == dominantPath) {
            return 1
        }
        return goalTarget[b - 1] - goalTarget[a - 1]
    })
    return order
}

function getPreferredGoalPath(tower, matchup) {
    var bestPath = 0
    var bestScore = -Infinity
    for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
        if(canTowerUpgradePathNow(tower.playerSide, tower, pathNumber) == false) {
            continue
        }
        var pathScore = getTowerBuildTargetScore(tower, pathNumber, matchup)
        if(pathScore > bestScore) {
            bestScore = pathScore
            bestPath = pathNumber
        }
    }

    return bestPath
}

function getHypotheticalTowerAfterUpgrade(tower, pathNumber) {
    var clone = cloneTowerUpgradeState(tower)
    clone["path" + pathNumber + "Upgrades"]++
    return clone
}

function estimateTowerUpgradeDpsGain(tower, pathNumber, matchup) {
    var currentHeuristic = getTowerHeuristicDps(tower)
    var projectedHeuristic = getTowerHeuristicDps(getHypotheticalTowerAfterUpgrade(tower, pathNumber))
    var heuristicGain = Math.max(0, projectedHeuristic - currentHeuristic)
    var observedDps = Math.max(currentHeuristic, getTowerObservedDps(tower))
    if(currentHeuristic > 0) {
        heuristicGain *= observedDps / currentHeuristic
    }

    if(tower.towerType == "bomb" && matchup.playerThreat.heavyCount >= 1 && pathNumber != 1) {
        heuristicGain *= 1.2
    }
    if(tower.towerType == "mortar" && matchup.playerThreat.heavyCount >= 1 && pathNumber == 2) {
        heuristicGain *= 1.25
    }
    if(tower.towerType == "dartling" && matchup.dangerHigh && (pathNumber == 1 || pathNumber == 2)) {
        heuristicGain *= 1.2
    }
    if(matchup && matchup.defenseMath && matchup.defenseMath.requiredDps > 0) {
        var relevantBloons = getAIThreatBloonsForSide(tower.playerSide)
        var canEngage = false
        for(var i = 0; i < relevantBloons.length; i++) {
            if(canTowerReachBloonSoon(tower, relevantBloons[i])) {
                canEngage = true
                break
            }
        }
        if(canEngage == false) {
            heuristicGain *= 0.12
        }
    }

    return Math.max(1.5, heuristicGain)
}

function getAIThreatBloonsForSide(side) {
    var relevant = []
    for(var i = 0; i < bloons.length; i++) {
        if(bloons[i] && bloons[i].playerSide == side && !bloons[i].isBoss) {
            relevant.push(bloons[i])
        }
    }
    return relevant
}

function estimatePlacementDpsByImage(image, matchup) {
    var towerType = getTowerTypeFromImage(image)
    var estimate = getTowerHeuristicDps({ towerType: towerType, path1Upgrades: 0, path2Upgrades: 0, path3Upgrades: 0 })
    if(towerType == "bomb" && matchup.playerThreat.heavyCount >= 1) {
        estimate *= 1.2
    }
    if((towerType == "wizard" || towerType == "mortar" || towerType == "dartling") && matchup.dangerHigh) {
        estimate *= 1.1
    }

    return estimate
}

function isAIFarmInvestmentWindow(matchup) {
    return !!matchup && matchup.safeToGreed && matchup.dangerHigh == false && getCurrentVisibleRound() <= 12
}

function getAIGameStage() {
    var visibleRound = getCurrentVisibleRound()
    if(visibleRound <= 6) {
        return "early"
    }
    if(visibleRound <= 20) {
        return "mid"
    }
    return "late"
}

function getAITowerStageUsageScore(towerType, role, matchup) {
    var stage = getAIGameStage()
    var score = 0
    if(stage == "early") {
        if(towerType == "dartling") score = 26
        else if(towerType == "tack") score = 24
        else if(towerType == "wizard") score = 22
        else if(towerType == "dart" || towerType == "boomer") score = 18
        else if(towerType == "bomb") score = 14
        else if(towerType == "mortar") score = 12
        else if(towerType == "engi" || towerType == "buccaneer") score = 10
        else if(towerType == "ninja") score = 8
        else if(towerType == "ice") score = 2
        else if(towerType == "sniper") score = -18
        else if(towerType == "cobra") score = -24
        else if(towerType == "sword") score = -12
        else if(towerType == "super") score = -30
    } else if(stage == "mid") {
        if(towerType == "wizard" || towerType == "bomb") score = 12
        else if(towerType == "dartling") score = 10
        else if(towerType == "ninja" || towerType == "sniper") score = 8
        else if(towerType == "boomer" || towerType == "engi") score = 6
        else if(towerType == "cobra") score = 4
        else if(towerType == "mortar" || towerType == "buccaneer") score = 5
        else if(towerType == "tack" || towerType == "dart") score = -6
        else if(towerType == "super") score = -8
    } else {
        if(towerType == "super") score = 26
        else if(towerType == "sword") score = 18
        else if(towerType == "wizard" || towerType == "sniper") score = 12
        else if(towerType == "bomb" || towerType == "dartling") score = 10
        else if(towerType == "ninja") score = 8
        else if(towerType == "ice" || towerType == "buccaneer") score = 6
        else if(towerType == "cobra") score = -10
        else if(towerType == "tack" || towerType == "dart") score = -14
    }

    if(role == "support" && stage == "early" && (towerType == "cobra" || towerType == "sniper")) {
        score -= 18
    }
    if(role == "elite" && stage != "late") {
        score -= 16
    }
    if(role == "antiMoab" && stage == "early" && (!matchup || matchup.playerThreat.heavyCount == 0)) {
        score -= 8
    }
    return score
}

function getAIEarlyTowerSpamPenalty(side) {
    var visibleRound = getCurrentVisibleRound()
    if(visibleRound > 3) {
        return 0
    }
    var towerCount = getSideTowerCountExcluding(side, ["farmer"])
    var towerLimit = visibleRound + 1
    if(towerCount <= towerLimit) {
        return 0
    }
    var overflow = towerCount - towerLimit
    return overflow * overflow * 32
}

function getAIStrictPlacementPenalty(side, towerType, matchup) {
    var visibleRound = getCurrentVisibleRound()
    var totalTowers = getSideTowerCountExcluding(side, ["farmer"])
    var defenseCount = getSideTowerCountExcluding(side, ["farm", "farmer", "cobra"])
    var penalty = 0

    if(visibleRound <= 3) {
        penalty += Math.max(0, totalTowers - (visibleRound + 1)) * 90
    } else if(visibleRound <= 6) {
        penalty += Math.max(0, defenseCount - 2) * 48
    } else if(visibleRound <= 12) {
        penalty += Math.max(0, defenseCount - 4) * 24
    }

    if(towerType != "farm" && towerType != "farmer") {
        var cheapestUpgradeCost = getCheapestCombatUpgradeCost(side)
        if(cheapestUpgradeCost != Infinity) {
            if(getAIGameStage() == "early") {
                penalty += 22
            } else if(getAIGameStage() == "mid") {
                penalty += 10
            }
        }
    }

    if(matchup && matchup.dangerHigh == false && getAIGameStage() == "early" && towerType != "farm") {
        penalty += 8
    }

    return penalty
}

function getAIStrictUpgradeBias() {
    var stage = getAIGameStage()
    if(stage == "early") {
        return 34
    }
    if(stage == "mid") {
        return 20
    }
    return 8
}

function getAIFarmLifecycleScore(matchup) {
    var visibleRound = getCurrentVisibleRound()
    if(isAIFarmInvestmentWindow(matchup)) {
        return visibleRound <= 8 ? 30 : 22
    }
    if(visibleRound <= 16) {
        return -18
    }
    if(visibleRound <= 24) {
        return -34
    }
    return -48
}

function getBestTowerUpgradeOption(side, matchup, defenseMath) {
    var bestOption = null
    var decisionState = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.upgrade, matchup)
    for(var i = 0; i < towers.length; i++) {
        var tower = towers[i]
        if(tower.playerSide != side || tower.towerType == "farmer") {
            continue
        }
        if(tower.towerType == "farm" && defenseMath && defenseMath.minTimeToExitSec <= 2.2 && defenseMath.requiredDps > defenseMath.currentDps) {
            continue
        }

        for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
            if(canTowerUpgradePathNow(side, tower, pathNumber) == false) {
                continue
            }

            var upgradeCost = tower["path" + pathNumber + "Cost"][tower["path" + pathNumber + "Upgrades"]]
            var dpsGain = estimateTowerUpgradeDpsGain(tower, pathNumber, matchup)
            var score = dpsGain / Math.max(1, upgradeCost) * 1000
            var hypotheticalTower = getHypotheticalTowerAfterUpgrade(tower, pathNumber)
            var hypotheticalSignature = getTowerCurrentSignature(hypotheticalTower)
            var contextKey = getCrosspathContextKeyForMatchup(tower.towerType, matchup)
            var learnedCrosspathScore = getAILearningScore(aiLearning.crosspathStats, getAICrosspathStatKey(tower.towerType, contextKey, hypotheticalSignature))
            score += learnedCrosspathScore * (tower.towerType == "farm" ? 180 : 118)
            score += getAITowerStageUsageScore(tower.towerType, getStrategyPlacementRoleForTowerType(tower.towerType), matchup)
            if(getDominantTowerPath(tower) == pathNumber) {
                score += 8
            }
            if(tower.towerType == "farm") {
                score += getAIFarmLifecycleScore(matchup)
                score += getTowerBuildTargetScore(tower, pathNumber, matchup) * 1.15
            } else {
                score += getTowerBuildTargetScore(tower, pathNumber, matchup) * 1.45
            }
            if(defenseMath && defenseMath.requiredDps > defenseMath.currentDps) {
                score += dpsGain * 0.45
                if(tower.towerType == "farm") {
                    score -= 20
                }
            } else if(matchup.safeToGreed && tower.towerType == "farm") {
                score += isAIFarmInvestmentWindow(matchup) ? 16 : -12
            }
            if(tower.towerType == "sniper" && matchup.safeToGreed && pathNumber == 2) {
                score += 12
            }
            if(tower.towerType == "cobra" && matchup.enemyVulnerable && pathNumber == 3) {
                score += 10
            }
            score += getAITacticalActionBonus(side, tower.towerType == "farm" ? "farm" : "development", "upgrade|" + tower.towerType + "|" + pathNumber, matchup) * 24
            var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.upgrade, {
                id: "upgrade|" + tower.towerType + "|" + tower.towerID + "|" + pathNumber,
                type: tower.towerType,
                role: getStrategyPlacementRoleForTowerType(tower.towerType),
                actionKey: "upgrade|" + tower.towerType + "|" + pathNumber,
                heuristic: score,
                heuristicScale: 90,
                cost: upgradeCost,
                money: players[side].money,
                effect: dpsGain,
                effectScale: 80,
                x: tower.x,
                y: tower.y,
                index: pathNumber - 1,
                maxIndex: 2,
                tier1: hypotheticalTower.path1Upgrades,
                tier2: hypotheticalTower.path2Upgrades,
                tier3: hypotheticalTower.path3Upgrades,
                urgency: matchup.dangerHigh ? 1 : 0.3,
            }, matchup, decisionState)

            var projectedDps = defenseMath ? defenseMath.currentDps + dpsGain : dpsGain
            var option = {
                type: "upgrade",
                tower: tower,
                pathNumber: pathNumber,
                dpsGain: dpsGain,
                projectedDps: projectedDps,
                heuristicScore: score,
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

function getPlacementDuplicationPenalty(side, image, matchup) {
    var towerType = getTowerTypeFromImage(image)
    if(towerType == "farm" || towerType == "farmer") {
        return 0
    }

    var sameTypeTowers = getSideTowersByType(side, towerType)
    if(sameTypeTowers.length == 0) {
        return 0
    }

    var stage = getAIGameStage()
    var visibleRound = getCurrentVisibleRound()
    var lowTierCount = 0
    var veryLowTierCount = 0
    var upgradedCount = 0
    var highTierCount = 0
    var totalTier = 0
    var bestUpgradeGain = 0
    var signatureCounts = {}
    var lowSignatureDuplicates = 0
    for(var i = 0; i < sameTypeTowers.length; i++) {
        var tower = sameTypeTowers[i]
        var towerTier = getTowerTotalTier(tower)
        var towerSignature = getTowerCurrentSignature(tower)
        totalTier += towerTier
        signatureCounts[towerSignature] = (signatureCounts[towerSignature] || 0) + 1
        if(towerTier <= 4) {
            lowTierCount++
        }
        if(towerTier <= 2) {
            veryLowTierCount++
        }
        if(towerTier >= 3) {
            upgradedCount++
        }
        if(towerTier >= 5) {
            highTierCount++
        }
        for(var pathNumber = 1; pathNumber <= 3; pathNumber++) {
            if(canTowerUpgradePathNow(side, tower, pathNumber)) {
                bestUpgradeGain = Math.max(bestUpgradeGain, estimateTowerUpgradeDpsGain(tower, pathNumber, matchup))
            }
        }
    }

    for(var signature in signatureCounts) {
        var signatureTier = Number(signature[0]) + Number(signature[1]) + Number(signature[2])
        if(signatureCounts[signature] >= 2 && signatureTier <= 5) {
            lowSignatureDuplicates += signatureCounts[signature] - 1
        }
    }

    var averageTier = totalTier / sameTypeTowers.length
    var placementValue = estimatePlacementDpsByImage(image, matchup)
    var penalty = sameTypeTowers.length * 8 + lowTierCount * 14 + veryLowTierCount * 12 + lowSignatureDuplicates * 20
    if(lowTierCount >= 2) {
        penalty += 26 + (lowTierCount - 2) * 14
    }
    if(averageTier <= 4.2 && sameTypeTowers.length >= 2) {
        penalty += 22
    }
    if(stage == "early" && sameTypeTowers.length >= 1) {
        penalty += 22
    }
    if(stage == "early" && sameTypeTowers.length >= 2) {
        penalty += 30
    }
    if(bestUpgradeGain >= placementValue * 0.35) {
        penalty += stage == "early" ? 24 : 12
    }
    if(bestUpgradeGain >= placementValue * 0.6) {
        penalty += stage == "early" ? 30 : 18
    }
    if(bestUpgradeGain >= placementValue * 0.9) {
        penalty += stage == "early" ? 24 : 16
    }

    // True late game should allow duplicate scaling once the existing copies are already upgraded.
    if(visibleRound >= 28) {
        if(highTierCount >= 1 && averageTier >= 4.5) {
            penalty *= 0.22
        } else if(upgradedCount >= Math.min(2, sameTypeTowers.length) && averageTier >= 3) {
            penalty *= 0.5
        }
    }

    return penalty
}

function getRoleTargetTowerCount(role, matchup) {
    if(role == "farm") {
        var visibleRound = getCurrentVisibleRound()
        if(isAIFarmInvestmentWindow(matchup) == false) return 0
        if(visibleRound < 7) return 1
        if(visibleRound <= 12) return 2
        return 0
    }
    if(role == "core") {
        if(round < 18) return 1
        if(round < 34) return 2
        return 3
    }
    if(role == "antiMoab") {
        if(round < 10) return matchup.playerThreat.heavyCount >= 1 ? 1 : 0
        if(round < 26) return 1
        return 2
    }
    if(role == "support") {
        if(round < 8) return 0
        if(round < 26) return 1
        return 2
    }
    if(role == "elite") {
        if(round < 20) return 0
        if(round < 38) return 1
        return 2
    }
    return 1
}

function getAILoadoutRoleNeedBonus(side, image, matchup) {
    var role = getStrategyPlacementRoleForImage(image)
    var currentRoleCount = getSideTowersByStrategyRole(side, role).length
    var targetRoleCount = getRoleTargetTowerCount(role, matchup)
    var bonus = Math.max(0, targetRoleCount - currentRoleCount) * 18
    var towerType = getTowerTypeFromImage(image)
    if(matchup.dangerHigh && role == "core") {
        bonus += 12
    }
    if(matchup.playerThreat.heavyCount >= 1 && role == "antiMoab") {
        bonus += 18
    }
    if(role == "farm") {
        bonus += Math.max(-10, getAIFarmLifecycleScore(matchup) * 0.5)
    }
    if(matchup.playerCamo >= 1 && (towerType == "wizard" || towerType == "ninja" || towerType == "sniper")) {
        bonus += 10
    }
    if(currentRoleCount == 0 && role != "farm") {
        bonus += 8
    }
    return bonus
}

function getLearnedPlacementOption(side, image, matchup, defenseMath) {
    var towerConfig = LOADOUT_TOWER_CONFIG[image]
    if(!towerConfig) {
        return null
    }
    var role = getStrategyPlacementRoleForImage(image)
    var spotIndex = getSideTowersByStrategyRole(side, role).length
    var spot = findAISpot(side, towerConfig.radius, towerConfig.range, role, spotIndex, towerConfig.towerType)
    if(!spot) {
        return null
    }
    var price = getTowerPriceByImage(image)
    var dpsGain = estimatePlacementDpsByImage(image, matchup)
    if(defenseMath && defenseMath.requiredDps > 0 && towerConfig.towerType != "farm") {
        var hypotheticalTower = {
            x: spot.x,
            y: spot.y,
            range: towerConfig.range,
            towerType: towerConfig.towerType,
            playerSide: side,
            path1Upgrades: 0,
            path2Upgrades: 0,
            path3Upgrades: 0,
        }
        var threatBloons = getAIThreatBloonsForSide(side)
        var canEngageThreat = false
        var closeToFight = false
        for(var threatIndex = 0; threatIndex < threatBloons.length; threatIndex++) {
            if(canTowerReachBloonSoon(hypotheticalTower, threatBloons[threatIndex])) {
                canEngageThreat = true
                if(isBloonCloseToTowerFight(hypotheticalTower, threatBloons[threatIndex])) {
                    closeToFight = true
                    break
                }
            }
        }
        if(canEngageThreat == false) {
            dpsGain *= 0.12
        } else if(defenseMath.minTimeToExitSec <= 2.2 && closeToFight == false) {
            dpsGain *= 0.45
        }
    }
    var placementLearning = getAISpotScore(side, spot.x, spot.y, towerConfig.radius, towerConfig.range, role, spotIndex, towerConfig.towerType)
    var loadoutKey = getCurrentAILoadoutKey()
    var strategyId = getCurrentAIStrategyId()
    var timingLearning = 0
    if(loadoutKey && strategyId) {
        timingLearning = getAILearningScore(aiLearning.timingStats, getAITimingStatKey(loadoutKey, strategyId, towerConfig.towerType, role, getAIRoundTimingBucket()))
    }
    var score = dpsGain / Math.max(1, price) * 900
    score += getAILoadoutRoleNeedBonus(side, image, matchup)
    score += placementLearning * 0.36
    score += timingLearning * 72
    score += getAITowerStageUsageScore(towerConfig.towerType, role, matchup)
    score -= getAIEarlyTowerSpamPenalty(side)
    score -= getAIStrictPlacementPenalty(side, towerConfig.towerType, matchup)
    if(role == "antiMoab" && matchup.playerThreat.heavyCount >= 1) {
        score += 18
    }
    if(role == "core" && matchup.dangerHigh) {
        score += 12
    }
    if(image == "000farm.png") {
        score += getAIFarmLifecycleScore(matchup)
    }
    if(image == "000farm.png" && defenseMath && defenseMath.requiredDps > defenseMath.currentDps) {
        score -= 28
    }
    score += getAITacticalActionBonus(side, towerConfig.towerType == "farm" ? "farm" : "development", "place|" + towerConfig.towerType + "|" + role, matchup) * 24
    score -= getPlacementDuplicationPenalty(side, image, matchup)
    var decision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
        id: "place|" + towerConfig.towerType + "|" + role + "|" + Math.round(spot.x) + "|" + Math.round(spot.y),
        type: towerConfig.towerType,
        role: role,
        actionKey: "place|" + towerConfig.towerType + "|" + role,
        heuristic: score,
        heuristicScale: 110,
        cost: price,
        money: players[side].money,
        effect: dpsGain,
        effectScale: 80,
        x: spot.x,
        y: spot.y,
        count: getSideTowersByType(side, towerConfig.towerType).length,
        urgency: matchup.dangerHigh ? 1 : 0.3,
    }, matchup)
    return {
        type: "place",
        image: image,
        dpsGain: dpsGain,
        projectedDps: defenseMath ? defenseMath.currentDps + dpsGain : dpsGain,
        heuristicScore: score,
        score: decision.score,
        decisionSample: decision,
    }
}

function getBestPlacementOption(side, matchup, defenseMath, restrictToEmergency) {
    var strategy = getCurrentAIStrategy()
    var candidateImages = strategy.towers.filter(function(image) {
        return restrictToEmergency == false || getTowerTypeFromImage(image) != "farm"
    })
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

    return bestOption
}

function requestAIDefenseOption(side, option, priority) {
    if(!option) {
        return false
    }

    if(option.type == "upgrade") {
        return aiRequestUpgradeTower(side, option.tower, option.pathNumber, priority, option.decisionSample)
    }

    return aiRequestPlaceTowerImage(side, option.image, priority, option.decisionSample)
}

function tryPlaceEmergencyDefense(side, matchup) {
    var defenseMath = matchup.defenseMath
    if(matchup.dangerHigh == false || defenseMath.requiredDps <= defenseMath.currentDps * 1.02) {
        return false
    }

    var bestUpgrade = getBestTowerUpgradeOption(side, matchup, defenseMath)
    var bestPlacement = getBestPlacementOption(side, matchup, defenseMath, true)
    var chosenOption = null
    if(bestUpgrade && bestPlacement) {
        chosenOption = isAIDecisionScoreBetter(bestUpgrade.decisionSample, bestPlacement.decisionSample) ? bestUpgrade : bestPlacement
    } else {
        chosenOption = bestUpgrade || bestPlacement
    }

    if(chosenOption) {
        var immediateLethal = defenseMath.minTimeToExitSec <= 2.2 && defenseMath.requiredDps > defenseMath.currentDps
        if(immediateLethal == false) {
            var noOpFamily = chosenOption.decisionSample.familyIndex
            var noOpDecision = scoreAIDecisionCandidate(side, noOpFamily, {
                id: (noOpFamily == AI_DECISION_FAMILY.placement ? "placement" : "upgrade") + "|emergency-noop",
                type: "noop",
                actionKey: "noop",
                heuristic: -12,
                heuristicScale: noOpFamily == AI_DECISION_FAMILY.placement ? 110 : 90,
                noop: true,
                safety: matchup.dangerHigh ? 1 : 0,
            }, matchup)
            if(isAIDecisionScoreBetter(noOpDecision, chosenOption.decisionSample)) {
                recordAINoOpDecision(noOpDecision)
                return false
            }
        }
        return requestAIDefenseOption(side, chosenOption, AI_ACTION_PRIORITY.emergency)
    }

    return false
}

function getLoadoutDiscoveryPlacementOption(side, matchup) {
    var strategy = getCurrentAIStrategy()
    var visibleRound = getCurrentVisibleRound()

    if(strategy.buildPlan) {
        for(var stepIndex = 0; stepIndex < strategy.buildPlan.length; stepIndex++) {
            var step = strategy.buildPlan[stepIndex]
            if(visibleRound < step.round || getSideTowersByImage(side, step.image).length >= step.maxCount) {
                continue
            }

            var stepPrice = getTowerPriceByImage(step.image)
            if(players[side].money < stepPrice + step.buffer) {
                continue
            }

            var plannedOption = getLearnedPlacementOption(side, step.image, matchup, matchup.defenseMath)
            if(!plannedOption) {
                continue
            }

            var roundsLate = Math.max(0, visibleRound - step.round)
            plannedOption.heuristicScore += 34 + Math.min(30, roundsLate * 8)
            if(step.image == "000farm.png") {
                plannedOption.heuristicScore += visibleRound <= 6 ? 110 : 72
                if(matchup.dangerHigh) {
                    plannedOption.heuristicScore -= 90
                } else if(matchup.safeToGreed == false) {
                    plannedOption.heuristicScore -= 18
                }
            }
            plannedOption.decisionSample = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
                id: plannedOption.decisionSample.id,
                type: getTowerTypeFromImage(plannedOption.image),
                role: step.role,
                actionKey: "place|" + getTowerTypeFromImage(plannedOption.image) + "|" + step.role,
                heuristic: plannedOption.heuristicScore,
                heuristicScale: 110,
                cost: stepPrice,
                money: players[side].money,
                effect: plannedOption.dpsGain,
                effectScale: 80,
            }, matchup)
            plannedOption.score = plannedOption.decisionSample.score
            return plannedOption
        }
    }

    var bestOption = null
    for(var i = 0; i < strategy.towers.length; i++) {
        var image = strategy.towers[i]
        var price = getTowerPriceByImage(image)
        if(players[side].money < price) {
            continue
        }
        var option = getLearnedPlacementOption(side, image, matchup, matchup.defenseMath)
        if(!option) {
            continue
        }
        if(option.image == "000farm.png") {
            option.heuristicScore += isAIFarmInvestmentWindow(matchup) ? 6 : -18
        } else if(matchup.dangerHigh) {
            option.heuristicScore += 8
        }
        option.decisionSample = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.placement, {
            id: option.decisionSample.id,
            type: getTowerTypeFromImage(option.image),
            role: getStrategyPlacementRoleForImage(option.image),
            actionKey: "place|" + getTowerTypeFromImage(option.image),
            heuristic: option.heuristicScore,
            heuristicScale: 110,
            cost: price,
            money: players[side].money,
            effect: option.dpsGain,
            effectScale: 80,
        }, matchup)
        option.score = option.decisionSample.score
        if(!bestOption || option.score > bestOption.score) {
            bestOption = option
        }
    }
    return bestOption
}

function getBestNonEmergencyDefenseOption(side, matchup) {
    var defenseMath = matchup.defenseMath
    var bestUpgrade = getBestTowerUpgradeOption(side, matchup, defenseMath)
    var bestPlacement = getBestPlacementOption(side, matchup, defenseMath, false)
    var buildPlanOption = getLoadoutDiscoveryPlacementOption(side, matchup)
    var candidates = []
    if(bestUpgrade) {
        candidates.push(bestUpgrade)
    }
    if(bestPlacement) {
        candidates.push(bestPlacement)
    }
    if(buildPlanOption) {
        candidates.push(buildPlanOption)
    }
    if(candidates.length == 0) {
        return null
    }

    candidates.sort(function(a, b) {
        if(a.score != b.score) return b.score - a.score
        return a.decisionSample.id < b.decisionSample.id ? -1 : 1
    })
    var noOpFamily = candidates[0].decisionSample.familyIndex
    var noOp = scoreAIDecisionCandidate(side, noOpFamily, {
        id: (noOpFamily == AI_DECISION_FAMILY.placement ? "placement" : "upgrade") + "|noop",
        type: "noop",
        actionKey: "noop",
        heuristic: matchup.safeToGreed ? 8 : -12,
        heuristicScale: noOpFamily == AI_DECISION_FAMILY.placement ? 110 : 90,
        noop: true,
    }, matchup)
    if(isAIDecisionScoreBetter(noOp, candidates[0].decisionSample)) {
        recordAINoOpDecision(noOp)
        return null
    }
    return candidates[0]
}

function getAdaptiveUpgradePriority(tower, matchup) {
    var image = getStrategyImageForTowerType(tower.towerType)
    var strategy = getCurrentAIStrategy()
    var basePriority = strategy.upgradePrefs[image] ? strategy.upgradePrefs[image].slice(0) : [1, 2, 3]

    if(tower.towerType == "mortar") {
        return matchup.dangerHigh ? [2, 1, 3] : [2, 3, 1]
    }
    if(tower.towerType == "dartling") {
        return matchup.dangerHigh ? [2, 1, 3] : [1, 2, 3]
    }
    if(tower.towerType == "sniper") {
        return matchup.safeToGreed && round >= 20 ? [2, 3, 1] : [3, 2, 1]
    }
    if(tower.towerType == "ninja") {
        return matchup.dangerHigh ? [2, 1, 3] : basePriority
    }
    if(tower.towerType == "engi") {
        return matchup.dangerHigh ? [1, 2, 3] : basePriority
    }
    if(tower.towerType == "boomer") {
        return matchup.dangerHigh ? [1, 2, 3] : basePriority
    }
    if(tower.towerType == "cobra") {
        return matchup.enemyVulnerable ? [3, 2, 1] : basePriority
    }
    if(tower.towerType == "bomb" && matchup.playerThreat.heavyCount >= 1) {
        return [2, 3, 1]
    }

    return basePriority
}

function tryUpgradeTowerByPriority(side, tower, pathPriority) {
    for(var i = 0; i < pathPriority.length; i++) {
        if(aiRequestUpgradeTower(side, tower, pathPriority[i], AI_ACTION_PRIORITY.normal)) {
            return true
        }
    }

    return false
}

function runAIUpgrades(side, matchup) {
    var defenseMath = matchup.defenseMath
    for(var towerIndex = 0; towerIndex < towers.length; towerIndex++) {
        var tower = towers[towerIndex]
        if(tower.playerSide == side && tower.towerType == "farm" && tower.path2Upgrades >= 3 && tower.towerVar >= 1200 && aiRequestCollectFarm(side, tower, AI_ACTION_PRIORITY.support)) {
            return true
        }
    }

    var bestUpgrade = getBestTowerUpgradeOption(side, matchup, defenseMath)
    if(bestUpgrade) {
        return requestAIDefenseOption(side, bestUpgrade, AI_ACTION_PRIORITY.normal)
    }

    return false
}

function runAIDefense(side) {
    var farms = getSideTowersByType(side, "farm")
    var farmers = getSideTowersByType(side, "farmer")
    var matchup = getCurrentPlayerMatchupStyle(side)
    var bananaCoverageIssue = getBananaCoverageIssue(side)
    var farmCashout = getBestAIFarmCashoutCandidate(side, matchup)

    for(var i = 0; i < farms.length; i++) {
        if(farms[i].path2Upgrades >= 3 && farms[i].towerVar >= 1200) {
            if(aiRequestCollectFarm(side, farms[i], AI_ACTION_PRIORITY.support)) {
                return
            }
        }
    }

    if(farmCashout && aiRequestSellTower(side, farmCashout, matchup.dangerHigh ? AI_ACTION_PRIORITY.high : AI_ACTION_PRIORITY.support, farmCashout.aiSellDecisionSample)) {
        return
    }

    if(tryPlaceEmergencyDefense(side, matchup)) {
        return
    }

    if(aiProfile.currentAction && aiProfile.currentAction.priority >= AI_ACTION_PRIORITY.normal) {
        return
    }

    if(bananaCoverageIssue && bananaCoverageIssue.needsFarmer && aiRequestPlaceFarmerForFarm(bananaCoverageIssue.farm, AI_ACTION_PRIORITY.high)) {
        return
    }

    if(isSafeForAIBananaCollection(matchup)) {
        var bananaToCollect = chooseBananaForCursorCollection(side)
        if(bananaToCollect && aiRequestCollectBanana(side, bananaToCollect, AI_ACTION_PRIORITY.low)) {
            return
        }
    }

    if(farms.length > 0 && farmers.length == 0 && aiRequestPlaceFarmer(side, AI_ACTION_PRIORITY.support)) {
        return
    }

    if(bananaCoverageIssue && bananaCoverageIssue.needsFarmer && aiRequestPlaceFarmerForFarm(bananaCoverageIssue.farm, AI_ACTION_PRIORITY.support)) {
        return
    }

    var bestOption = getBestNonEmergencyDefenseOption(side, matchup)
    if(bestOption && requestAIDefenseOption(side, bestOption, AI_ACTION_PRIORITY.normal)) {
        return
    }
}

function shouldAIRush(side, matchup) {
    var strategy = getCurrentAIStrategy()
    var enemyTraits = getDefenseTraitsForSide(matchup.enemySide)
    var aggressiveRush = strategy.rushBias >= 0.72
    var weaknessScore = Math.max(0, 8 - enemyTraits.heavy * 1.25, 8 - enemyTraits.splash * 1.2)
    var adjustedRound = Math.max(10, strategy.rushRound - Math.round(matchup.playerGreedScore * 2))
    var adjustedMoney = Math.max(1800, strategy.rushMoney - matchup.playerGreedScore * 700 - (matchup.playerLives <= 80 ? 350 : 0) + (matchup.playerThreat.score >= 16 ? 900 : 0))

    if(aggressiveRush && matchup.enemyVulnerable) {
        adjustedRound = Math.max(8, adjustedRound - 3)
        adjustedMoney = Math.max(1400, adjustedMoney - 900)
    }
    if(weaknessScore >= 4.5) {
        adjustedRound = Math.max(8, adjustedRound - 1)
        adjustedMoney = Math.max(1400, adjustedMoney - 400)
    }

    if(gameNow() - aiProfile.lastRushAt < 9000) {
        return false
    }
    if(matchup.playerThreat.score >= 20 || players[side].lives <= 35) {
        return false
    }

    var heuristicEligible = getCurrentVisibleRound() >= adjustedRound && players[side].money >= adjustedMoney && (matchup.enemyVulnerable || matchup.aiPressure.maxPathPos >= 24 || aggressiveRush && weaknessScore >= 4.5)
    var stateFeatures = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.rush, matchup)
    var rushDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.rush, {
        id: "rush|gate",
        type: "rush",
        actionKey: "rush|gate",
        heuristic: heuristicEligible ? 12 : -12,
        heuristicScale: 12,
        cost: adjustedMoney,
        money: players[side].money,
        effect: weaknessScore,
        effectScale: 8,
        urgency: matchup.enemyVulnerable ? 1 : 0.25,
    }, matchup, stateFeatures)
    var noOpDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.rush, {
        id: "rush|noop",
        type: "noop",
        actionKey: "noop",
        heuristic: heuristicEligible ? -6 : 8,
        heuristicScale: 12,
        noop: true,
        safety: matchup.dangerHigh ? 1 : 0,
    }, matchup, stateFeatures)
    if(isAIDecisionScoreBetter(rushDecision, noOpDecision)) return true
    recordAINoOpDecision(noOpDecision)
    return false
}

function runAIOffense(side) {
    var matchup = getCurrentPlayerMatchupStyle(side)
    var strategy = getCurrentAIStrategy()

    if(shouldAIPauseEcoForPendingPurchase(side, matchup)) {
        players[side].autoEco = false
        return
    }

    aiSelectEcoSend(side, matchup)

    if(shouldAIRush(side, matchup)) {
        aiQueueRush(side, matchup)
    }

}

function runAIBoosts(side) {
    var matchup = getCurrentPlayerMatchupStyle(side)
    var boostChecks = [
        { type: "towerboost.png", family: "defenseBoost", useful: shouldAITowerBoost(side), effect: matchup.defenseMath.requiredDps - matchup.defenseMath.currentDps },
        { type: "lightningboost.png", family: "defenseBoost", useful: shouldAILightningBoost(side), effect: matchup.defenseMath.requiredDps - matchup.defenseMath.currentDps },
        { type: "slowboost.png", family: "offenseBoost", useful: shouldAISlowBoost(side), effect: matchup.offenseMath.requiredDps - matchup.offenseMath.currentDps },
        { type: "bloonboost.png", family: "offenseBoost", useful: shouldAIBloonBoost(side), effect: matchup.offenseMath.requiredDps - matchup.offenseMath.currentDps },
        { type: "ecoboost.png", family: "eco", useful: shouldAIEcoBoost(side), effect: players[side].eco },
    ]
    var stateFeatures = buildAIDecisionStateFeatures(side, AI_DECISION_FAMILY.boost, matchup)
    var bestBoost = null
    for(var i = 0; i < boostChecks.length; i++) {
        var candidate = boostChecks[i]
        var slot = getBoostSlotByType(side, candidate.type)
        if(slot == -1 || getBoostCount(side, slot) <= 0 || getBoostExpires(side, slot) + BOOST_SETTINGS.cooldownMs > gameNow()) {
            continue
        }
        var legacyBonus = getAITacticalActionBonus(side, candidate.family, "boost|" + candidate.type.replace(".png", ""), matchup)
        candidate.decisionSample = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.boost, {
            id: "boost|" + candidate.type,
            type: candidate.type,
            role: candidate.family,
            actionKey: "boost|" + candidate.type.replace(".png", ""),
            heuristic: (candidate.useful ? 16 : -12) + legacyBonus * 8,
            heuristicScale: 20,
            effect: candidate.effect,
            effectScale: 100,
            index: i,
            maxIndex: boostChecks.length - 1,
            count: getBoostCount(side, slot),
            countScale: BOOST_SETTINGS.charges,
            cooldownReady: true,
            urgency: matchup.dangerHigh && candidate.family == "defenseBoost" ? 1 : 0.3,
        }, matchup, stateFeatures)
        if(!bestBoost || isAIDecisionScoreBetter(candidate.decisionSample, bestBoost.decisionSample)) {
            bestBoost = candidate
        }
    }
    if(!bestBoost) {
        return
    }
    var immediateLethal = matchup.defenseMath.minTimeToExitSec <= 2.2 && matchup.defenseMath.requiredDps > matchup.defenseMath.currentDps
    var noOpDecision = scoreAIDecisionCandidate(side, AI_DECISION_FAMILY.boost, {
        id: "boost|noop",
        type: "noop",
        actionKey: "noop",
        heuristic: 2,
        heuristicScale: 20,
        noop: true,
        safety: immediateLethal ? -1 : 0,
    }, matchup, stateFeatures)
    if(immediateLethal == false && isAIDecisionScoreBetter(noOpDecision, bestBoost.decisionSample)) {
        recordAINoOpDecision(noOpDecision)
        return
    }
    aiTryUseBoostType(side, bestBoost.type, bestBoost.decisionSample)
}

function isAIPaidActionPending() {
    var action = aiProfile.currentAction
    return !!action && (action.type == "placeTower" || action.type == "placeFarmer" || action.type == "upgradeTower" || action.type == "sellTower")
}

function runAIGameplayDecisionCycle(side) {
    handleAIRoundStartBoosts(side)
    updateAIMatchTelemetry()
    settleAITacticalDecision(side, getCurrentPlayerMatchupStyle(side))
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
}

document.addEventListener("visibilitychange", updateAIPregameObservePauseState)
addEventListener("blur", updateAIPregameObservePauseState)
addEventListener("focus", handleAIWindowFocus)
