// AI Lab extension layered on top of the base AI menu/runtime.

var AI_TRAINING_BATCH_OPTIONS = [1, 50, 150, 400, 900]
var AI_TRAINING_GOAL_OPTIONS = [500, 2000, 5000, 15000, 40000]
var AI_TRAINING_AUTOSAVE_EPISODES = 10
var AI_TRAINING_FIXED_FRAME_MS = 1000 / 60
var AI_TRAINING_BASE_ANIMATION_DELAY_MS = 16
var AI_TRAINING_BASE_LOGIC_INTERVAL_MS = 250
var AI_TRAINING_BASE_CURSOR_INTERVAL_MS = 150
var AI_TRAINING_BASE_INTER_MATCH_DELAY_MS = 180
var AI_TRAINING_BASE_RUNTIME_TASK_BUDGET = 4000
var AI_TRAINING_TRUE_SELF_PLAY_SPEEDS = [
    {
        label: "Normal x1",
        runtimeClockMultiplier: 1,
    },
    {
        label: "Fast x2",
        runtimeClockMultiplier: 2,
    },
    {
        label: "Faster x4",
        runtimeClockMultiplier: 4,
    },
    {
        label: "Hyper x8",
        runtimeClockMultiplier: 8,
    },
    {
        label: "Turbo",
        runtimeClockMultiplier: 10,
    },
]
var AI_TRAINING_TRUE_SELF_PLAY_STALL_TIMEOUT_MS = 12000
var AI_TRAINING_TRUE_SELF_PLAY_PREGAME_STALL_TIMEOUT_MS = 10000
var AI_TRAINING_MODES = [
    {
        id: "selfplay",
        label: "Self-Play Lab",
        description: "Open loadout discovery through real AI versus AI matches with auto-rematch and accelerated scheduling.",
    },
]
var AI_TRAINING_PROFILES = [
    {
        id: "mixed",
        label: "Mixed Ladder",
        description: "Broad synthetic scrims across eco, pressure, and hybrid loadouts.",
        ecoBias: 0,
        pressureBias: 0,
        heavyBias: 0,
        lateBias: 0,
        supportBias: 0,
        camoBias: 0,
        ecoBoostBias: 0,
        defenseBoostBias: 0,
        offenseBoostBias: 0,
        hybridChance: 0.34,
        volatility: 0.08,
    },
    {
        id: "pressure",
        label: "Pressure Lab",
        description: "Stress-tests anti-rush choices, tempo lines, and offense boosts.",
        ecoBias: -0.05,
        pressureBias: 0.24,
        heavyBias: 0.1,
        lateBias: -0.08,
        supportBias: 0.04,
        camoBias: 0.08,
        ecoBoostBias: -0.08,
        defenseBoostBias: 0.06,
        offenseBoostBias: 0.2,
        hybridChance: 0.42,
        volatility: 0.1,
    },
    {
        id: "greed",
        label: "Eco Punish",
        description: "Targets greedy ladders so the AI learns when to punish economy-first loadouts.",
        ecoBias: 0.22,
        pressureBias: -0.06,
        heavyBias: 0.02,
        lateBias: 0.12,
        supportBias: -0.02,
        camoBias: 0,
        ecoBoostBias: 0.2,
        defenseBoostBias: -0.06,
        offenseBoostBias: 0.02,
        hybridChance: 0.26,
        volatility: 0.07,
    },
    {
        id: "late",
        label: "Late Game",
        description: "Biases toward heavy, camo, and scaling matchups to sharpen endgame plans.",
        ecoBias: 0.08,
        pressureBias: -0.02,
        heavyBias: 0.22,
        lateBias: 0.24,
        supportBias: 0.12,
        camoBias: 0.14,
        ecoBoostBias: 0.04,
        defenseBoostBias: 0.1,
        offenseBoostBias: -0.02,
        hybridChance: 0.3,
        volatility: 0.09,
    },
]

var aiTrainingRuntimeReady = false
var aiTrainingTowerPool = []
var aiTrainingBoostPool = []
var aiTrainingStrategySummaries = []
var aiContextsBySide = {}
var aiTrainingFrameSimulationMultiplier = 1
var aiTrainingLastSimulationFrameAt = 0
var aiTrainingHeadlessRenderContext = null

function createAITrainingState() {
    return {
        hotkeyLatch: false,
        returnState: "mode",
        running: false,
        modeIndex: 0,
        batchOptionIndex: 2,
        goalOptionIndex: 2,
        profileIndex: 0,
        startedAt: 0,
        activeMs: 0,
        currentRunStartedAt: 0,
        sessionEpisodes: 0,
        sessionWins: 0,
        sessionLosses: 0,
        sessionTies: 0,
        sessionCoachHits: 0,
        sessionRewardTotal: 0,
        sessionFeatureSums: aiCreateVector(AI_FEATURE_KEYS.length, 0),
        sessionStrategyPickCounts: aiCreateVector(AI_STRATEGY_LIBRARY.length, 0),
        sessionBestStrategyCounts: aiCreateVector(AI_STRATEGY_LIBRARY.length, 0),
        uniqueOpponentSignatures: {},
        uniqueOpponentCount: 0,
        recentAverageRewards: [],
        recentCoachRates: [],
        recentBatchSizes: [],
        trueSelfPlayActive: false,
        trueSelfPlayMatchFinalized: false,
        trueSelfPlayPendingRestartAt: 0,
        trueSelfPlayStopAfterCurrentGame: false,
        trueSelfPlayMatches: 0,
        trueSelfPlayLeftWins: 0,
        trueSelfPlayRightWins: 0,
        trueSelfPlayTies: 0,
        trueSelfPlayRoundTotal: 0,
        trueSelfPlayLastRound: 0,
        trueSelfPlayLastWinner: "",
        trueSelfPlayStallRecoveries: 0,
        trueSelfPlayDiscardCurrentMatch: false,
        candidateSide: PLAYER_SIDE.left,
        candidateResponds: true,
        candidateTrainingMatches: 0,
        evaluationActive: false,
        evaluationGames: 0,
        evaluationWins: 0,
        evaluationLosses: 0,
        evaluationTies: 0,
        lastEvaluationScore: 0,
        promotions: 0,
        rejectedCandidates: 0,
        opponentPolicyKind: "champion",
        trueSelfPlayProgressKey: "",
        trueSelfPlayProgressAt: 0,
        trueSelfPlayRecentRounds: [],
        trueSelfPlayRecentLeftWinRates: [],
        lastBatchEpisodes: 0,
        lastBatchReward: 0,
        lastBatchWins: 0,
        lastBatchLosses: 0,
        lastBatchTies: 0,
        lastBatchCoachHits: 0,
        lastBatchAt: 0,
        lastChosenStrategyIndex: 0,
        lastBestStrategyIndex: 0,
        pendingSaveEpisodes: 0,
        saveRequestedEpisodes: 0,
        saveQueued: false,
        lastSavedEpisode: 0,
        lastObservedSavedAt: 0,
        goalReachedAt: 0,
        resetConfirmStage: 0,
        resetConfirmUntil: 0,
        notice: "",
        noticeUntil: 0,
    }
}

var aiTrainingState = createAITrainingState()

function createAIProfileState() {
    return {
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
        currentAction: null,
        policySnapshot: null,
        learningEnabled: false,
        explorationEnabled: false,
        pendingTacticalDecision: null,
        tacticalTrace: [],
    }
}

function createAIContext(side, observedSide) {
    return {
        aiSide: side,
        humanSide: observedSide,
        aiProfile: createAIProfileState(),
        aiDesiredLoadoutTowers: [],
        aiDesiredLoadoutBoosts: [],
        aiCurrentStrategy: null,
        aiMatchTelemetry: null,
        aiStrategySelection: null,
        aiTickState: {
            lastLogicAt: gameNow(),
            lastCursorAt: gameNow(),
        },
    }
}

function getOpponentSide(side) {
    return side == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
}

function clearAIContexts() {
    aiContextsBySide = {}
}

function ensureAIContext(side, observedSide) {
    if(!aiContextsBySide[side]) {
        aiContextsBySide[side] = createAIContext(side, observedSide || getOpponentSide(side))
    }
    if(observedSide) {
        aiContextsBySide[side].humanSide = observedSide
    }
    return aiContextsBySide[side]
}

function captureActiveAIContextSnapshot() {
    return {
        humanSide: humanSide,
        aiSide: aiSide,
        aiProfile: aiProfile,
        aiDesiredLoadoutTowers: aiDesiredLoadoutTowers,
        aiDesiredLoadoutBoosts: aiDesiredLoadoutBoosts,
        aiCurrentStrategy: aiCurrentStrategy,
        aiMatchTelemetry: aiMatchTelemetry,
        aiStrategySelection: aiStrategySelection,
        aiTickState: aiTickState,
    }
}

function restoreAIContextSnapshot(snapshot) {
    humanSide = snapshot.humanSide
    aiSide = snapshot.aiSide
    aiProfile = snapshot.aiProfile
    aiDesiredLoadoutTowers = snapshot.aiDesiredLoadoutTowers
    aiDesiredLoadoutBoosts = snapshot.aiDesiredLoadoutBoosts
    aiCurrentStrategy = snapshot.aiCurrentStrategy
    aiMatchTelemetry = snapshot.aiMatchTelemetry
    aiStrategySelection = snapshot.aiStrategySelection
    aiTickState = snapshot.aiTickState
}

function activateAIContext(side) {
    var context = ensureAIContext(side, getOpponentSide(side))
    humanSide = context.humanSide
    aiSide = context.aiSide
    aiProfile = context.aiProfile
    aiDesiredLoadoutTowers = context.aiDesiredLoadoutTowers
    aiDesiredLoadoutBoosts = context.aiDesiredLoadoutBoosts
    aiCurrentStrategy = context.aiCurrentStrategy
    aiMatchTelemetry = context.aiMatchTelemetry
    aiStrategySelection = context.aiStrategySelection
    aiTickState = context.aiTickState
    return context
}

function storeActiveAIContext() {
    if(aiSide != PLAYER_SIDE.left && aiSide != PLAYER_SIDE.right) {
        return
    }
    var context = ensureAIContext(aiSide, humanSide)
    context.humanSide = humanSide
    context.aiSide = aiSide
    context.aiProfile = aiProfile
    context.aiDesiredLoadoutTowers = aiDesiredLoadoutTowers
    context.aiDesiredLoadoutBoosts = aiDesiredLoadoutBoosts
    context.aiCurrentStrategy = aiCurrentStrategy
    context.aiMatchTelemetry = aiMatchTelemetry
    context.aiStrategySelection = aiStrategySelection
    context.aiTickState = aiTickState
}

function withAIContext(side, callback) {
    var snapshot = captureActiveAIContextSnapshot()
    activateAIContext(side)
    try {
        return callback()
    } finally {
        storeActiveAIContext()
        restoreAIContextSnapshot(snapshot)
    }
}

function ensureAITrainingRuntimeInitialized() {
    if(aiTrainingRuntimeReady) {
        return true
    }
    if(typeof LOADOUT_TOWER_CONFIG == "undefined") {
        return false
    }

    aiTrainingRuntimeReady = true
    aiTrainingTowerPool = []
    aiTrainingBoostPool = []
    aiTrainingStrategySummaries = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        var strategy = AI_STRATEGY_LIBRARY[i]
        aiTrainingStrategySummaries.push(summarizeLoadoutSelection(strategy.towers, strategy.boosts))
        for(var towerIndex = 0; towerIndex < strategy.towers.length; towerIndex++) {
            if(aiTrainingTowerPool.indexOf(strategy.towers[towerIndex]) == -1) {
                aiTrainingTowerPool.push(strategy.towers[towerIndex])
            }
        }
        for(var boostIndex = 0; boostIndex < strategy.boosts.length; boostIndex++) {
            if(aiTrainingBoostPool.indexOf(strategy.boosts[boostIndex]) == -1) {
                aiTrainingBoostPool.push(strategy.boosts[boostIndex])
            }
        }
    }
    return true
}

function getAITrainingMode() {
    return AI_TRAINING_MODES[clamp(aiTrainingState.modeIndex, 0, AI_TRAINING_MODES.length - 1)]
}

function getAITrainingProfile() {
    return AI_TRAINING_PROFILES[aiTrainingState.profileIndex]
}

function getAITrainingSpeedOptionCount() {
    return getAITrainingMode().id == "selfplay" ? AI_TRAINING_TRUE_SELF_PLAY_SPEEDS.length : AI_TRAINING_BATCH_OPTIONS.length
}

function getAITrainingActiveSpeedIndex() {
    return clamp(aiTrainingState.batchOptionIndex, 0, getAITrainingSpeedOptionCount() - 1)
}

function getAITrainingBatchSize() {
    return AI_TRAINING_BATCH_OPTIONS[getAITrainingActiveSpeedIndex()]
}

function getAITrainingTrueSelfPlaySpeed() {
    return AI_TRAINING_TRUE_SELF_PLAY_SPEEDS[getAITrainingActiveSpeedIndex()]
}

function getAITrainingGoalEpisodes() {
    return AI_TRAINING_GOAL_OPTIONS[aiTrainingState.goalOptionIndex]
}

function isAITrainingTrueSelfPlayActive() {
    return !!aiTrainingState.trueSelfPlayActive
}

function isAITrainingHeadlessModeEnabled() {
    return isAITrainingTrueSelfPlayActive() && getAITrainingRuntimeClockMultiplier() > 2
}

function getAITrainingHeadlessRenderContext() {
    if(aiTrainingHeadlessRenderContext) {
        return aiTrainingHeadlessRenderContext
    }

    var noop = function() {}
    var noopGradient = {
        addColorStop: noop,
    }
    aiTrainingHeadlessRenderContext = new Proxy({}, {
        get: function(target, prop) {
            if(prop == "measureText") {
                return function() {
                    return { width: 0 }
                }
            }
            if(prop == "createLinearGradient" || prop == "createRadialGradient") {
                return function() {
                    return noopGradient
                }
            }
            if(prop == "createPattern") {
                return function() {
                    return null
                }
            }
            if(prop == "canvas") {
                return canvas
            }
            if(target[prop] != null) {
                return target[prop]
            }
            return noop
        },
        set: function(target, prop, value) {
            target[prop] = value
            return true
        },
    })
    return aiTrainingHeadlessRenderContext
}

function getAITrainingSpeedLabel() {
    if(getAITrainingMode().id == "selfplay") {
        return getAITrainingTrueSelfPlaySpeed().label
    }
    var batchSize = getAITrainingBatchSize()
    return batchSize == 1 ? "Normal x1 episode / frame" : batchSize + " episodes / frame"
}

function getAITrainingScenarioLabel() {
    return getAITrainingProfile().label
}

function getAITrainingAnimationDelayMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(1, Math.round(AI_TRAINING_BASE_ANIMATION_DELAY_MS / Math.min(4, getAITrainingRuntimeClockMultiplier())))
    }
    return 50/3
}

function getAITrainingLogicIntervalMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(1, AI_TRAINING_BASE_LOGIC_INTERVAL_MS / getAITrainingRuntimeClockMultiplier())
    }
    return 250
}

function getAITrainingCursorIntervalMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(1, AI_TRAINING_BASE_CURSOR_INTERVAL_MS / getAITrainingRuntimeClockMultiplier())
    }
    return keyMsCooldown
}

function getAITrainingRuntimeClockMultiplier() {
    if(isAITrainingTrueSelfPlayActive()) {
        return getAITrainingTrueSelfPlaySpeed().runtimeClockMultiplier
    }
    return 1
}

function resetAITrainingSimulationFrameStep() {
    aiTrainingFrameSimulationMultiplier = 1
    aiTrainingLastSimulationFrameAt = gameNow()
}

function syncAITrainingSimulationFrameStep() {
    if(isAITrainingTrueSelfPlayActive() == false) {
        resetAITrainingSimulationFrameStep()
        return 1
    }
    var now = gameNow()
    var elapsedSimulationMs = aiTrainingLastSimulationFrameAt > 0 ? Math.max(0, now - aiTrainingLastSimulationFrameAt) : AI_TRAINING_FIXED_FRAME_MS
    aiTrainingFrameSimulationMultiplier = elapsedSimulationMs / AI_TRAINING_FIXED_FRAME_MS
    aiTrainingLastSimulationFrameAt = now
    return aiTrainingFrameSimulationMultiplier
}

function getAITrainingSimulationStepMultiplier() {
    if(isAITrainingTrueSelfPlayActive()) {
        return aiTrainingFrameSimulationMultiplier
    }
    return 1
}

function getAITrainingScaledSimulationValue(baseValue) {
    return baseValue * getAITrainingSimulationStepMultiplier()
}

function getAITrainingInterMatchDelayMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(1, AI_TRAINING_BASE_INTER_MATCH_DELAY_MS / getAITrainingRuntimeClockMultiplier())
    }
    return 120
}

function getAITrainingControllerCatchupLimit() {
    if(isAITrainingTrueSelfPlayActive()) {
        var dynamicLimit = Math.ceil(Math.max(getAITrainingRuntimeClockMultiplier(), getAITrainingSimulationStepMultiplier()))
        var minControllerInterval = Math.max(1, Math.min(getAITrainingLogicIntervalMs(), getAITrainingCursorIntervalMs()))
        var maxFrameCatchup = Math.ceil(getAITrainingMaxRuntimeAdvanceMs() / minControllerInterval)
        return Math.min(512, Math.max(dynamicLimit * 2, maxFrameCatchup))
    }
    return 1
}

function getAITrainingRuntimeTaskBudget() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(AI_TRAINING_BASE_RUNTIME_TASK_BUDGET, Math.round(AI_TRAINING_BASE_RUNTIME_TASK_BUDGET * Math.pow(getAITrainingRuntimeClockMultiplier(), 1.1)))
    }
    return 4000
}

function getAITrainingMaxRuntimeAdvanceMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return AI_TRAINING_FIXED_FRAME_MS
    }
    return 120
}

function isAITrainingBackgroundProgressActive() {
    if(isAITrainingTrueSelfPlayActive()) {
        return typeof document == "undefined" || document.hidden == false
    }
    return !!aiTrainingState.running
}

function setAITrainingNotice(message, durationMs) {
    aiTrainingState.notice = message
    aiTrainingState.noticeUntil = realNow() + durationMs
}

function syncAITrainingResetConfirmationState() {
    if(aiTrainingState.resetConfirmStage > 0 && realNow() > aiTrainingState.resetConfirmUntil) {
        aiTrainingState.resetConfirmStage = 0
        aiTrainingState.resetConfirmUntil = 0
    }
}

function clearAITrainingResetConfirmationState() {
    aiTrainingState.resetConfirmStage = 0
    aiTrainingState.resetConfirmUntil = 0
}

function getAITrainingResetSessionLabel() {
    syncAITrainingResetConfirmationState()
    if(aiTrainingState.resetConfirmStage <= 0) {
        return "Reset Session"
    }
    if(aiTrainingState.resetConfirmStage == 1) {
        return "Confirm 2 of 3"
    }
    return "Confirm 3 of 3"
}

function requestAITrainingSessionReset() {
    syncAITrainingResetConfirmationState()
    aiTrainingState.resetConfirmStage++
    aiTrainingState.resetConfirmUntil = realNow() + 6000
    if(aiTrainingState.resetConfirmStage < 3) {
        setAITrainingNotice("Reset session requires " + (3 - aiTrainingState.resetConfirmStage) + " more confirmation" + (aiTrainingState.resetConfirmStage == 1 ? "s" : "") + ".", 1800)
        return false
    }

    clearAITrainingResetConfirmationState()
    setAITrainingRunning(false)
    resetAITrainingSession()
    setAITrainingNotice("Training session metrics reset.", 1800)
    return true
}

function pushAITrainingHistoryValue(values, nextValue, maxLength) {
    values.push(nextValue)
    while(values.length > maxLength) {
        values.shift()
    }
}

function getAITrainingElapsedMs() {
    var elapsed = aiTrainingState.activeMs
    if(aiTrainingState.running && aiTrainingState.currentRunStartedAt > 0) {
        elapsed += Math.max(0, realNow() - aiTrainingState.currentRunStartedAt)
    }
    return elapsed
}

function getAITrainingEpisodesPerSecond() {
    var elapsedMs = getAITrainingElapsedMs()
    if(elapsedMs <= 0) {
        return 0
    }
    var progressCount = getAITrainingMode().id == "selfplay" ? aiTrainingState.trueSelfPlayMatches : aiTrainingState.sessionEpisodes
    return progressCount / Math.max(0.001, elapsedMs / 1000)
}

function resetAITrainingSession() {
    var nextState = createAITrainingState()
    nextState.hotkeyLatch = aiTrainingState.hotkeyLatch
    nextState.returnState = aiTrainingState.returnState
    nextState.modeIndex = aiTrainingState.modeIndex
    nextState.batchOptionIndex = aiTrainingState.batchOptionIndex
    nextState.goalOptionIndex = aiTrainingState.goalOptionIndex
    nextState.profileIndex = aiTrainingState.profileIndex
    aiTrainingState = nextState
    setAITrainingNotice("Training session metrics reset.", 1800)
}

function markAIHostedSaveFailure(error) {
    aiPersistenceState.backend = "php backend shared unavailable"
    aiPersistenceState.lastError = String(error)
    if(typeof console != "undefined" && console && typeof console.warn == "function") {
        console.warn("AI learning backend save failed.", error)
    }
}

function saveAITrainingLearningSnapshot() {
    if(aiPersistenceState.contributionEnabled) {
        return flushAIPublicContributionQueue()
    }
    return saveAILearningSnapshot()
}

var baseNormalizeAILearningData = normalizeAILearningData
normalizeAILearningData = function(candidate) {
    var normalized = baseNormalizeAILearningData(candidate)
    if(Array.isArray(normalized.placementStats)) {
        normalized.placementStats = {}
    }
    if(Array.isArray(normalized.crosspathStats)) {
        normalized.crosspathStats = {}
    }
    if(Array.isArray(normalized.loadoutCounterStats)) {
        normalized.loadoutCounterStats = {}
    }
    return normalized
}

function requestAITrainingSave(forceSave) {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        if(forceSave) {
            setAITrainingNotice("Session-only runtime: training progress stays in this session.", 2200)
        }
        return false
    }
    if(aiPersistenceState.contributionEnabled) {
        var progressCount = getAITrainingMode().id == "selfplay" ? aiTrainingState.trueSelfPlayMatches : aiTrainingState.sessionEpisodes
        flushAIPublicContributionQueue()
        aiTrainingState.pendingSaveEpisodes = 0
        aiTrainingState.saveRequestedEpisodes = 0
        aiTrainingState.lastSavedEpisode = progressCount
        if(forceSave) {
            var pendingCount = getAIPublicContributionQueue().length
            setAITrainingNotice(pendingCount > 0 ? pendingCount + " global contribution" + (pendingCount == 1 ? " is" : "s are") + " queued." : "Global contributions are synchronized.", 2200)
        }
        return true
    }
    if(aiPersistenceState.saveInFlight) {
        if(forceSave || aiTrainingState.pendingSaveEpisodes >= AI_TRAINING_AUTOSAVE_EPISODES) {
            aiTrainingState.saveQueued = true
        }
        if(forceSave) {
            setAITrainingNotice("Hosted save already in progress.", 1600)
        }
        return false
    }
    if(forceSave == false && aiTrainingState.pendingSaveEpisodes < AI_TRAINING_AUTOSAVE_EPISODES) {
        return false
    }

    aiTrainingState.saveRequestedEpisodes = aiTrainingState.pendingSaveEpisodes
    if(saveAILearning() == false) {
        aiTrainingState.saveRequestedEpisodes = 0
        if(forceSave) {
            setAITrainingNotice(aiPersistenceState.backend == "shared model read-only" ? "Shared model is read-only; training remains in this session." : "AI snapshot could not be saved.", 2200)
        }
        return false
    }
    setAITrainingNotice(forceSave ? "Saving AI training snapshot..." : "Autosaving AI training snapshot...", 1800)
    return true
}

function syncAITrainingSaveState() {
    if(aiPersistenceState.lastSavedAt > aiTrainingState.lastObservedSavedAt) {
        var progressCount = getAITrainingMode().id == "selfplay" ? aiTrainingState.trueSelfPlayMatches : aiTrainingState.sessionEpisodes
        aiTrainingState.lastObservedSavedAt = aiPersistenceState.lastSavedAt
        aiTrainingState.pendingSaveEpisodes = Math.max(0, aiTrainingState.pendingSaveEpisodes - aiTrainingState.saveRequestedEpisodes)
        aiTrainingState.saveRequestedEpisodes = 0
        aiTrainingState.lastSavedEpisode = Math.max(0, progressCount - aiTrainingState.pendingSaveEpisodes)
    }
}

function rebuildPregameUIAssets() {
    UITowers = []
    UIBoosts = []
    images = []
    boostIcons = []
    displayBloons = []
    cursor = []

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

    images.push(new Images(canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp1.png", -1, ""))
    images.push(new Images(3*canvas.width/4, 3*canvas.height/4, canvas.height/4, "controlsp2.png", -1, ""))
    cursor.push(new Cursor(canvas.width/4, canvas.height/2, 1))
    cursor.push(new Cursor(3*canvas.width/4, canvas.height/2, 2))
}

function clearAITrainingGameplayRuntimeTasks() {
    runtimeTasks = {}
    runtimeTaskScheduleBaseAt = 0
    gameTimeNow = realNow()
    runtimeLastTick = realNow()
}

function resetAITrainingTrueSelfPlayMatchState() {
    setGamePaused(false)
    clearAITrainingGameplayRuntimeTasks()
    resetAITrainingSimulationFrameStep()
    money = ECONOMY_SETTINGS.startingMoney
    eco = ECONOMY_SETTINGS.startingEco
    lives = ECONOMY_SETTINGS.startingLives
    p1money = ECONOMY_SETTINGS.startingMoney
    p2money = ECONOMY_SETTINGS.startingMoney
    p1eco = ECONOMY_SETTINGS.startingEco
    p2eco = ECONOMY_SETTINGS.startingEco
    p1lives = ECONOMY_SETTINGS.startingLives
    p2lives = ECONOMY_SETTINGS.startingLives
    timeRoundEnded = 0
    timeGameStarted = gameNow()
    round = 0
    gameOver = false
    gameStarted = false
    roundReady = true
    bloonsToSpawn = false
    endOfRoundGiven = true
    counter = 0
    maxCounter = 0
    moneyFactor = 1
    autostart = true
    moabCount = 0
    bfbCount = 0
    zomgCount = 0
    bossSpawned = false
    p1Towers = []
    p2Towers = []
    p1BloonQueue = []
    p2BloonQueue = []
    p1SelectedBloon = 0
    p2SelectedBloon = 10
    p1Boost1Count = BOOST_SETTINGS.charges
    p2Boost1Count = BOOST_SETTINGS.charges
    p1Boost2Count = BOOST_SETTINGS.charges
    p2Boost2Count = BOOST_SETTINGS.charges
    p1Boost1Expires = 0
    p2Boost1Expires = 0
    p1Boost2Expires = 0
    p2Boost2Expires = 0
    p1TowerBoostVisual = 0
    p2TowerBoostVisual = 0
    p1BloonBoostVisual = 0
    p2BloonBoostVisual = 0
    p1SlowBoostVisual = 0
    p2SlowBoostVisual = 0
    p1LightningBoostTicksRemaining = 0
    p2LightningBoostTicksRemaining = 0
    p1LightningBoostNextTick = 0
    p2LightningBoostNextTick = 0
    p1BoostTypes = []
    p2BoostTypes = []
    p1TotalPopCount = 0
    p2TotalPopCount = 0
    p1TotalCashGenerated = 0
    p2TotalCashGenerated = 0
    p1CashGenWithEco = 0
    p2CashGenWithEco = 0
    p1AutoEco = false
    p2AutoEco = false
    practiceMode = false
    nonPlayableSide = 0
    bloons = []
    towers = []
    projectiles = []
    pathObjects = []
    bananas = []
    moneyText = []
    images2 = []
    boostIcons = []
    displayBloons = []
    subtowers = []
    mapNumber = aiTrainingState.trueSelfPlayMatches % 2
    for(var i = 0; i < keyCooldowns.length; i++) {
        keyCooldowns[i] = 0
    }
    rebuildPregameUIAssets()
}

function resetAITrainingTrueSelfPlayProgressWatchdog() {
    aiTrainingState.trueSelfPlayProgressKey = ""
    aiTrainingState.trueSelfPlayProgressAt = realNow()
}

function getAITrainingTrueSelfPlayProgressKey() {
    return [
        gameStarted ? 1 : 0,
        round,
        roundReady ? 1 : 0,
        bloonsToSpawn ? 1 : 0,
        p1lives == Infinity ? 150 : Math.max(0, Math.floor(p1lives)),
        p2lives == Infinity ? 150 : Math.max(0, Math.floor(p2lives)),
        bloons.length,
        projectiles.length,
        bananas.length,
        towers.length,
        subtowers.length,
        p1BloonQueue.length,
        p2BloonQueue.length,
        Math.floor((p1TotalPopCount + p2TotalPopCount) / 25),
        Math.floor((timeRoundEnded || 0) / 500),
    ].join("|")
}

function syncAITrainingTrueSelfPlayProgressWatchdog() {
    if(isAITrainingTrueSelfPlayActive() == false || gameOver) {
        return
    }
    var progressKey = getAITrainingTrueSelfPlayProgressKey()
    if(progressKey != aiTrainingState.trueSelfPlayProgressKey) {
        aiTrainingState.trueSelfPlayProgressKey = progressKey
        aiTrainingState.trueSelfPlayProgressAt = realNow()
        return
    }
    var stallTimeout = gameStarted ? AI_TRAINING_TRUE_SELF_PLAY_STALL_TIMEOUT_MS : AI_TRAINING_TRUE_SELF_PLAY_PREGAME_STALL_TIMEOUT_MS
    if(realNow() < aiTrainingState.trueSelfPlayProgressAt + stallTimeout) {
        return
    }
    aiTrainingState.trueSelfPlayProgressAt = realNow()
    aiTrainingState.trueSelfPlayStallRecoveries++
    aiTrainingState.trueSelfPlayDiscardCurrentMatch = true
    aiTrainingState.trueSelfPlayLastWinner = "Recovered stall"
    gameOver = true
    setAITrainingNotice("Recovered a stalled self-play match.", 1800)
}

function getAITrainingAverageFeatureValue(featureIndex) {
    if(aiTrainingState.sessionEpisodes <= 0) {
        return aiLearning.playerProfile.features[featureIndex]
    }
    return aiTrainingState.sessionFeatureSums[featureIndex] / aiTrainingState.sessionEpisodes
}

function getAITrainingTopStrategyIndices(limit, counts) {
    var indices = []
    for(var i = 0; i < counts.length; i++) {
        indices.push(i)
    }
    indices.sort(function(a, b) {
        if(counts[b] != counts[a]) {
            return counts[b] - counts[a]
        }
        return aiLearning.strategyStats[b].lastReward - aiLearning.strategyStats[a].lastReward
    })
    return indices.slice(0, limit)
}

function drawAITrainingWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || "").split(/\s+/)
    var lines = []
    var currentLine = ""
    for(var i = 0; i < words.length; i++) {
        var nextLine = currentLine ? currentLine + " " + words[i] : words[i]
        if(currentLine && ctx.measureText(nextLine).width > maxWidth) {
            lines.push(currentLine)
            currentLine = words[i]
        } else {
            currentLine = nextLine
        }
    }
    if(currentLine) {
        lines.push(currentLine)
    }
    if(lines.length > maxLines) {
        lines = lines.slice(0, maxLines)
        lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s.]*$/, "") + "..."
    }
    for(var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        ctx.fillText(lines[lineIndex], x, y + lineIndex * lineHeight, maxWidth)
    }
}

function drawAITrainingTrendChart(x, y, width, height) {
    if(height <= 18) {
        return
    }
    var selfPlayMode = getAITrainingMode().id == "selfplay"
    var rewardSeries = selfPlayMode ? aiTrainingState.trueSelfPlayRecentRounds : aiTrainingState.recentAverageRewards
    var supportSeries = selfPlayMode ? aiTrainingState.trueSelfPlayRecentLeftWinRates : aiTrainingState.recentCoachRates
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
    ctx.strokeRect(x, y, width, height)
    if(rewardSeries.length <= 0) {
        ctx.fillStyle = "rgba(198, 210, 233, 0.82)"
        ctx.font = "13px Arial"
        ctx.textAlign = "center"
        ctx.fillText(selfPlayMode ? "Finish a few self-play matches to build the trend." : "Run a few batches to build the reward trend.", x + width / 2, y + height / 2 + 4, width * 0.9)
        return
    }

    var rewardTop = y + 8
    var rewardZeroY = y + height * 0.56
    var rewardMaxHeight = Math.max(8, rewardZeroY - rewardTop - 4)
    var supportAreaY = y + height * 0.76
    var supportAreaHeight = Math.max(5, height * 0.12)
    var barWidth = width / Math.max(1, rewardSeries.length)
    for(var i = 0; i < rewardSeries.length; i++) {
        var rewardValue = selfPlayMode ? rewardSeries[i] / 40 : rewardSeries[i]
        var supportRate = supportSeries[i] || 0
        var normalizedHeight = clamp(Math.abs(rewardValue) / 1.2, 0.06, 1)
        var columnHeight = normalizedHeight * rewardMaxHeight
        var columnX = x + i * barWidth + Math.max(1, barWidth * 0.14)
        var columnWidth = Math.max(3, barWidth * 0.68)
        ctx.fillStyle = selfPlayMode ? "rgba(118, 225, 167, 0.92)" : rewardValue >= 0 ? "rgba(118, 225, 167, 0.92)" : "rgba(255, 145, 133, 0.92)"
        if(rewardValue >= 0) {
            ctx.fillRect(columnX, rewardZeroY - columnHeight, columnWidth, columnHeight)
        } else {
            ctx.fillRect(columnX, rewardZeroY, columnWidth, columnHeight)
        }
        ctx.fillStyle = "rgba(98, 197, 255, 0.9)"
        ctx.fillRect(columnX, supportAreaY, columnWidth, clamp(supportRate, 0, 1) * supportAreaHeight)
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)"
    ctx.beginPath()
    ctx.moveTo(x + 6, rewardZeroY)
    ctx.lineTo(x + width - 6, rewardZeroY)
    ctx.stroke()
}

function getAITrainingProfileForSelfPlay() {
    return AI_TRAINING_PROFILES[aiTrainingState.profileIndex]
}

function pickAITrainingRandomItem(values) {
    return values[Math.floor(Math.random() * values.length)]
}

function scoreAITrainingTemplateStrategy(strategyIndex, profile) {
    var strategy = AI_STRATEGY_LIBRARY[strategyIndex]
    var summary = aiTrainingStrategySummaries[strategyIndex]
    var score = Math.random() * 0.12 + strategy.baseBias
    if(profile.id == "pressure") {
        score += summary.pressure * 0.85 + strategy.rushBias * 0.55 + summary.offenseBoost * 0.22
    } else if(profile.id == "greed") {
        score += summary.eco * 0.95 + summary.late * 0.38 + summary.ecoBoost * 0.25 - summary.pressure * 0.12
    } else if(profile.id == "late") {
        score += summary.late * 0.88 + summary.heavy * 0.46 + summary.support * 0.18 + summary.camo * 0.2
    } else {
        score += summary.eco * 0.24 + summary.pressure * 0.24 + summary.heavy * 0.18 + summary.late * 0.18
    }
    return score
}

function isAITrainingStrategyExcluded(excludedStrategyIndices, strategyIndex) {
    if(excludedStrategyIndices == null) {
        return false
    }
    if(Array.isArray(excludedStrategyIndices)) {
        for(var i = 0; i < excludedStrategyIndices.length; i++) {
            if(isAITrainingStrategyExcluded(excludedStrategyIndices[i], strategyIndex)) {
                return true
            }
        }
        return false
    }
    return excludedStrategyIndices == strategyIndex
}

function pickAITrainingTemplateStrategyIndex(profile, excludedStrategyIndices) {
    var bestIndex = 0
    var bestScore = -Infinity
    for(var i = 0; i < 8; i++) {
        var candidateIndex = Math.floor(Math.random() * AI_STRATEGY_LIBRARY.length)
        if(AI_STRATEGY_LIBRARY.length > 1 && isAITrainingStrategyExcluded(excludedStrategyIndices, candidateIndex)) {
            continue
        }
        var candidateScore = scoreAITrainingTemplateStrategy(candidateIndex, profile)
        if(candidateScore > bestScore) {
            bestScore = candidateScore
            bestIndex = candidateIndex
        }
    }
    if(AI_STRATEGY_LIBRARY.length > 1 && isAITrainingStrategyExcluded(excludedStrategyIndices, bestIndex)) {
        for(var strategyIndex = 0; strategyIndex < AI_STRATEGY_LIBRARY.length; strategyIndex++) {
            if(isAITrainingStrategyExcluded(excludedStrategyIndices, strategyIndex) == false) {
                bestIndex = strategyIndex
                break
            }
        }
    }
    return bestIndex
}

function createAITrainingHybridLoadout(primaryStrategy, secondaryStrategy) {
    var towers = []
    var boosts = []
    while(towers.length < 3) {
        var towerPool = (Math.random() < 0.65 ? primaryStrategy : secondaryStrategy).towers
        var towerImage = pickAITrainingRandomItem(towerPool)
        if(towers.indexOf(towerImage) == -1) {
            towers.push(towerImage)
        }
    }
    while(towers.length < 3) {
        var randomTower = pickAITrainingRandomItem(aiTrainingTowerPool)
        if(towers.indexOf(randomTower) == -1) {
            towers.push(randomTower)
        }
    }
    while(boosts.length < 2) {
        var boostPool = (Math.random() < 0.65 ? primaryStrategy : secondaryStrategy).boosts
        var boostImage = pickAITrainingRandomItem(boostPool)
        if(boosts.indexOf(boostImage) == -1) {
            boosts.push(boostImage)
        }
    }
    while(boosts.length < 2) {
        var randomBoost = pickAITrainingRandomItem(aiTrainingBoostPool)
        if(boosts.indexOf(randomBoost) == -1) {
            boosts.push(randomBoost)
        }
    }
    return { towers: towers, boosts: boosts }
}

function applyAITrainingProfileBias(summary, profile) {
    summary.eco = clamp(summary.eco + profile.ecoBias + aiRandomWeight(profile.volatility), 0, 1)
    summary.pressure = clamp(summary.pressure + profile.pressureBias + aiRandomWeight(profile.volatility), 0, 1)
    summary.heavy = clamp(summary.heavy + profile.heavyBias + aiRandomWeight(profile.volatility * 0.8), 0, 1)
    summary.late = clamp(summary.late + profile.lateBias + aiRandomWeight(profile.volatility * 0.75), 0, 1)
    summary.support = clamp(summary.support + profile.supportBias + aiRandomWeight(profile.volatility * 0.6), 0, 1)
    summary.camo = clamp(summary.camo + profile.camoBias + aiRandomWeight(profile.volatility * 0.55), 0, 1)
    summary.ecoBoost = clamp(summary.ecoBoost + profile.ecoBoostBias, 0, 1)
    summary.defenseBoost = clamp(summary.defenseBoost + profile.defenseBoostBias, 0, 1)
    summary.offenseBoost = clamp(summary.offenseBoost + profile.offenseBoostBias, 0, 1)
    summary.selectionRatio = clamp(summary.selectionRatio, 0.82, 1)
    summary.hasAnySelection = true
    return summary
}

function createAITrainingOpponentSummary(profile, excludedStrategyIndices) {
    var primaryIndex = pickAITrainingTemplateStrategyIndex(profile, excludedStrategyIndices)
    var secondaryIndex = pickAITrainingTemplateStrategyIndex(profile, [excludedStrategyIndices, primaryIndex])
    var primaryStrategy = AI_STRATEGY_LIBRARY[primaryIndex]
    var secondaryStrategy = AI_STRATEGY_LIBRARY[secondaryIndex]
    var towerImages = primaryStrategy.towers.slice(0)
    var boostImages = primaryStrategy.boosts.slice(0)
    if(Math.random() < profile.hybridChance) {
        var hybridLoadout = createAITrainingHybridLoadout(primaryStrategy, secondaryStrategy)
        towerImages = hybridLoadout.towers
        boostImages = hybridLoadout.boosts
    }
    var summary = applyAITrainingProfileBias(summarizeLoadoutSelection(towerImages, boostImages), profile)
    summary.sourceStrategyIndex = primaryIndex
    summary.sourceSecondaryStrategyIndex = secondaryIndex
    return summary
}

function createAITrainingMatchFeatures(observedLoadoutSummary, profile) {
    var vector = getObservedLoadoutFeatureVector(observedLoadoutSummary)
    var farmIndex = getFeatureIndex("farm")
    var ecoIndex = getFeatureIndex("eco")
    var rushIndex = getFeatureIndex("rush")
    var heavyIndex = getFeatureIndex("heavy")
    var lateIndex = getFeatureIndex("late")
    var supportIndex = getFeatureIndex("support")
    var camoIndex = getFeatureIndex("camo")
    var greedIndex = getFeatureIndex("greed")
    var noise = profile.volatility

    vector[farmIndex] = clamp(observedLoadoutSummary.eco * 0.82 + observedLoadoutSummary.ecoBoost * 0.2 - observedLoadoutSummary.pressure * 0.18 + aiRandomWeight(noise), 0, 1)
    vector[ecoIndex] = clamp(observedLoadoutSummary.eco * 0.78 + observedLoadoutSummary.ecoBoost * 0.24 + observedLoadoutSummary.late * 0.08 + aiRandomWeight(noise), 0, 1)
    vector[rushIndex] = clamp(observedLoadoutSummary.pressure * 0.82 + observedLoadoutSummary.offenseBoost * 0.24 + observedLoadoutSummary.camo * 0.06 + aiRandomWeight(noise), 0, 1)
    vector[heavyIndex] = clamp(observedLoadoutSummary.heavy * 0.76 + observedLoadoutSummary.late * 0.18 + observedLoadoutSummary.defenseBoost * 0.08 + aiRandomWeight(noise * 0.8), 0, 1)
    vector[lateIndex] = clamp(observedLoadoutSummary.late * 0.76 + observedLoadoutSummary.eco * 0.18 + observedLoadoutSummary.support * 0.08 + aiRandomWeight(noise * 0.8), 0, 1)
    vector[supportIndex] = clamp(observedLoadoutSummary.support * 0.82 + observedLoadoutSummary.defenseBoost * 0.2 + aiRandomWeight(noise * 0.7), 0, 1)
    vector[camoIndex] = clamp(observedLoadoutSummary.camo * 0.84 + observedLoadoutSummary.pressure * 0.08 + aiRandomWeight(noise * 0.55), 0, 1)
    vector[greedIndex] = clamp(Math.max(observedLoadoutSummary.eco * 0.88, observedLoadoutSummary.ecoBoost * 0.92) - observedLoadoutSummary.pressure * 0.12 + aiRandomWeight(noise * 0.75), 0, 1)
    return vector
}

function getAITrainingCoachScore(strategyIndex, observedLoadoutSummary, matchFeatures, profile) {
    var strategy = AI_STRATEGY_LIBRARY[strategyIndex]
    var strategySummary = aiTrainingStrategySummaries[strategyIndex]
    var farmValue = matchFeatures[getFeatureIndex("farm")]
    var ecoValue = matchFeatures[getFeatureIndex("eco")]
    var rushValue = matchFeatures[getFeatureIndex("rush")]
    var heavyValue = matchFeatures[getFeatureIndex("heavy")]
    var lateValue = matchFeatures[getFeatureIndex("late")]
    var supportValue = matchFeatures[getFeatureIndex("support")]
    var camoValue = matchFeatures[getFeatureIndex("camo")]
    var greedValue = matchFeatures[getFeatureIndex("greed")]
    var score = getStrategyLoadoutCounterHeuristicBonus(strategy, observedLoadoutSummary)
    score += strategySummary.eco * (farmValue * 0.48 + ecoValue * 0.26 + greedValue * 0.2)
    score += strategySummary.pressure * (rushValue * 0.62 + observedLoadoutSummary.offenseBoost * 0.14)
    score += strategySummary.heavy * (heavyValue * 0.48 + lateValue * 0.14)
    score += strategySummary.late * (lateValue * 0.42 + supportValue * 0.08)
    score += strategySummary.support * (supportValue * 0.34 + camoValue * 0.06)
    score += strategySummary.camo * camoValue * 0.32
    score += (1 - Math.abs(strategy.rushBias - rushValue)) * 0.16
    if(strategy.towers.indexOf("000farm.png") != -1) {
        score += greedValue * 0.22 - rushValue * 0.14
    }
    if(strategy.towers.indexOf("000cobra.png") != -1) {
        score += rushValue * 0.2 + observedLoadoutSummary.eco * 0.16
    }
    if(strategy.towers.indexOf("000bomb.png") != -1) {
        score += heavyValue * 0.16 + observedLoadoutSummary.heavy * 0.12
    }
    if(profile.id == "pressure") {
        score += strategy.rushBias * 0.24 + strategySummary.pressure * 0.16
    } else if(profile.id == "greed") {
        score += strategySummary.eco * 0.2 + strategySummary.late * 0.08
    } else if(profile.id == "late") {
        score += strategySummary.late * 0.22 + strategySummary.heavy * 0.14 + strategySummary.support * 0.06
    }
    score += getStrategyPerformanceBonus(strategyIndex) * 0.28
    score += getLoadoutCounterLearningBonus(strategyIndex, observedLoadoutSummary) * 0.22
    return score
}

function getAITrainingRewardForSelection(chosenIndex, strategyScores) {
    var totalScore = 0
    var bestIndex = 0
    var bestScore = -Infinity
    var secondBestScore = -Infinity
    for(var i = 0; i < strategyScores.length; i++) {
        totalScore += strategyScores[i]
        if(strategyScores[i] > bestScore) {
            secondBestScore = bestScore
            bestScore = strategyScores[i]
            bestIndex = i
        } else if(strategyScores[i] > secondBestScore) {
            secondBestScore = strategyScores[i]
        }
    }

    var chosenScore = strategyScores[chosenIndex]
    var averageScore = totalScore / Math.max(1, strategyScores.length)
    var reward = (chosenScore - averageScore) * 0.72 - (bestScore - chosenScore) * 0.5 + aiRandomWeight(0.05)
    if(chosenIndex == bestIndex) {
        reward += 0.24
    } else if(chosenScore >= secondBestScore - 0.03) {
        reward += 0.08
    }
    return { reward: clamp(reward, -1.35, 1.35), bestIndex: bestIndex }
}

function buildAITrainingEpisodeFeatures(selectionFeatures, matchFeatures) {
    var trainingFeatures = []
    for(var i = 0; i < AI_FEATURE_KEYS.length; i++) {
        if(AI_FEATURE_KEYS[i].indexOf("pre") == 0) {
            trainingFeatures.push(selectionFeatures[i] * 0.55 + matchFeatures[i] * 0.45)
        } else {
            trainingFeatures.push(selectionFeatures[i] * 0.4 + matchFeatures[i] * 0.6)
        }
    }
    return trainingFeatures
}

function getAITrainingPlacementBucketForRole(strategy, role, towerIndex) {
    var xBase = 3
    if(role == "farm") {
        xBase = strategy.placementProfile == "aggressive" ? 2 : 1
    } else if(strategy.placementProfile == "safe") {
        xBase = 4
    } else if(strategy.placementProfile == "aggressive") {
        xBase = 2
    }
    var yBase = 2
    if(role == "support") {
        yBase = 4
    } else if(role == "antiMoab") {
        yBase = 3
    } else if(role == "elite") {
        yBase = 2
    } else if(role == "farm") {
        yBase = 0
    }
    return { x: clamp(xBase + (towerIndex % 2), 0, 6), y: clamp(yBase + Math.floor(towerIndex / 2), 0, 5) }
}

function getAITrainingCrosspathContext(matchFeatures, strategy) {
    var heavyValue = matchFeatures[getFeatureIndex("heavy")]
    var rushValue = matchFeatures[getFeatureIndex("rush")]
    var greedValue = matchFeatures[getFeatureIndex("greed")]
    if(heavyValue >= 0.58) return "heavy"
    if(rushValue >= 0.6) return strategy.rushBias >= 0.68 ? "pressure" : "swarm"
    if(greedValue >= 0.55) return "greed"
    return "balanced"
}

function getAITrainingUpgradeSignature(strategy, image, towerType) {
    var preferredUpgrade = strategy.upgradePrefs[image]
    if(preferredUpgrade && preferredUpgrade.length == 3) {
        return String(preferredUpgrade[0]) + String(preferredUpgrade[1]) + String(preferredUpgrade[2])
    }
    var candidates = getCrosspathCandidatesForTowerType(towerType)
    if(candidates.length <= 0) {
        return "320"
    }
    return String(candidates[0][0]) + String(candidates[0][1]) + String(candidates[0][2])
}

function applyAITrainingTowerSignals(strategyIndex, matchFeatures, reward) {
    var strategy = AI_STRATEGY_LIBRARY[strategyIndex]
    var contextKey = getAITrainingCrosspathContext(matchFeatures, strategy)
    for(var towerIndex = 0; towerIndex < strategy.towers.length; towerIndex++) {
        var towerImage = strategy.towers[towerIndex]
        var towerType = getTowerTypeFromImage(towerImage)
        var role = strategy.placementRoles[towerImage] || "core"
        var bucket = getAITrainingPlacementBucketForRole(strategy, role, towerIndex)
        var placementReward = clamp(reward + (role == "farm" ? matchFeatures[getFeatureIndex("greed")] * 0.2 + (1 - matchFeatures[getFeatureIndex("late")]) * 0.12 - matchFeatures[getFeatureIndex("rush")] * 0.1 - matchFeatures[getFeatureIndex("heavy")] * 0.08 : matchFeatures[getFeatureIndex("rush")] * 0.06), -0.45, 1.15)
        updateAILearningScore(aiLearning.placementStats, getAIPlacementStatKey(mapNumber, towerType, role, bucket), placementReward)
        updateAILearningScore(aiLearning.crosspathStats, getAICrosspathStatKey(towerType, contextKey, getAITrainingUpgradeSignature(strategy, towerImage, towerType)), placementReward)
    }
}

function runAITrainingEpisode(profile) {
    var observedLoadoutSummary = null
    var selectionFeatures = null
    var selection = null
    for(var matchupAttempt = 0; matchupAttempt < 3; matchupAttempt++) {
        observedLoadoutSummary = createAITrainingOpponentSummary(profile, selection ? selection.index : null)
        selectionFeatures = buildAIStrategySelectionFeatures(observedLoadoutSummary)
        selection = chooseAIStrategyFromFeaturesWithObservation(selectionFeatures, observedLoadoutSummary)
        if(AI_STRATEGY_LIBRARY.length <= 1 || (selection.index != observedLoadoutSummary.sourceStrategyIndex && selection.index != observedLoadoutSummary.sourceSecondaryStrategyIndex)) {
            break
        }
    }
    var matchFeatures = createAITrainingMatchFeatures(observedLoadoutSummary, profile)
    var strategyScores = []
    for(var i = 0; i < AI_STRATEGY_LIBRARY.length; i++) {
        strategyScores.push(getAITrainingCoachScore(i, observedLoadoutSummary, matchFeatures, profile))
    }
    var rewardSummary = getAITrainingRewardForSelection(selection.index, strategyScores)
    var reward = rewardSummary.reward
    var trainingFeatures = buildAITrainingEpisodeFeatures(selection.features, matchFeatures)

    trainAIPolicy(trainingFeatures, selection.index, reward)
    if(observedLoadoutSummary.hasAnySelection && observedLoadoutSummary.signature != "||") {
        updateAILearningScore(aiLearning.loadoutCounterStats, getLoadoutCounterStatKey(observedLoadoutSummary.signature, selection.index), reward)
    }
    applyAITrainingTowerSignals(selection.index, matchFeatures, reward)

    var stats = aiLearning.strategyStats[selection.index]
    stats.syntheticEpisodes++
    stats.lastReward = reward
    aiLearning.totalSyntheticEpisodes++
    aiLearning.totalPolicySamples++

    return {
        chosenIndex: selection.index,
        bestIndex: rewardSummary.bestIndex,
        reward: reward,
        matchFeatures: matchFeatures,
        observedLoadoutSummary: observedLoadoutSummary,
        win: reward > 0.18,
        loss: reward < -0.18,
    }
}

function tickSyntheticTrainingMode() {
    if(getAITrainingMode().id != "synthetic") {
        return
    }
    syncAITrainingSaveState()
    if(frontMenuState != "training" || aiTrainingState.running == false) {
        return
    }
    if(ensureAITrainingRuntimeInitialized() == false) {
        return
    }
    ensureAILearningLoaded()

    var profile = getAITrainingProfile()
    var batchEpisodes = getAITrainingBatchSize()
    var batchReward = 0
    var batchWins = 0
    var batchLosses = 0
    var batchTies = 0
    var batchCoachHits = 0
    for(var episodeIndex = 0; episodeIndex < batchEpisodes; episodeIndex++) {
        if(aiTrainingState.sessionEpisodes >= getAITrainingGoalEpisodes()) {
            break
        }
        var result = runAITrainingEpisode(profile)
        aiTrainingState.sessionEpisodes++
        aiTrainingState.sessionRewardTotal += result.reward
        aiTrainingState.sessionStrategyPickCounts[result.chosenIndex]++
        aiTrainingState.sessionBestStrategyCounts[result.bestIndex]++
        aiTrainingState.lastChosenStrategyIndex = result.chosenIndex
        aiTrainingState.lastBestStrategyIndex = result.bestIndex
        if(result.observedLoadoutSummary.signature && aiTrainingState.uniqueOpponentSignatures[result.observedLoadoutSummary.signature] == null) {
            aiTrainingState.uniqueOpponentSignatures[result.observedLoadoutSummary.signature] = true
            aiTrainingState.uniqueOpponentCount++
        }
        for(var featureIndex = 0; featureIndex < AI_FEATURE_KEYS.length; featureIndex++) {
            aiTrainingState.sessionFeatureSums[featureIndex] += result.matchFeatures[featureIndex]
        }
        if(result.win) {
            aiTrainingState.sessionWins++
            batchWins++
        } else if(result.loss) {
            aiTrainingState.sessionLosses++
            batchLosses++
        } else {
            aiTrainingState.sessionTies++
            batchTies++
        }
        if(result.chosenIndex == result.bestIndex) {
            aiTrainingState.sessionCoachHits++
            batchCoachHits++
        }
        aiTrainingState.pendingSaveEpisodes++
        batchReward += result.reward
    }

    aiTrainingState.lastBatchEpisodes = batchWins + batchLosses + batchTies
    aiTrainingState.lastBatchReward = aiTrainingState.lastBatchEpisodes > 0 ? batchReward / aiTrainingState.lastBatchEpisodes : 0
    aiTrainingState.lastBatchWins = batchWins
    aiTrainingState.lastBatchLosses = batchLosses
    aiTrainingState.lastBatchTies = batchTies
    aiTrainingState.lastBatchCoachHits = batchCoachHits
    aiTrainingState.lastBatchAt = realNow()
    if(aiTrainingState.lastBatchEpisodes > 0) {
        pushAITrainingHistoryValue(aiTrainingState.recentAverageRewards, aiTrainingState.lastBatchReward, 22)
        pushAITrainingHistoryValue(aiTrainingState.recentCoachRates, batchCoachHits / aiTrainingState.lastBatchEpisodes, 22)
        pushAITrainingHistoryValue(aiTrainingState.recentBatchSizes, aiTrainingState.lastBatchEpisodes, 22)
    }

    requestAITrainingSave(false)
    if(aiTrainingState.sessionEpisodes >= getAITrainingGoalEpisodes()) {
        aiTrainingState.goalReachedAt = realNow()
        aiTrainingState.activeMs += Math.max(0, realNow() - aiTrainingState.currentRunStartedAt)
        aiTrainingState.currentRunStartedAt = 0
        aiTrainingState.running = false
        requestAITrainingSave(true)
        setAITrainingNotice("Training goal reached.", 2200)
    }
}

function tickAIControllerForSide(side) {
    withAIContext(side, function() {
        var now = gameNow()
        var logicInterval = Math.max(1, getAITrainingLogicIntervalMs())
        var cursorInterval = Math.max(1, getAITrainingCursorIntervalMs())
        var catchupLimit = Math.max(1, getAITrainingControllerCatchupLimit())
        var remainingLogicTicks = catchupLimit
        while(now >= aiTickState.lastLogicAt + logicInterval && remainingLogicTicks > 0) {
            aiTickState.lastLogicAt += logicInterval
            runAIForActiveContext()
            remainingLogicTicks--
            if(gameOver || gamePaused || gameStarted == false) {
                break
            }
        }
        var remainingCursorTicks = catchupLimit
        while(now >= aiTickState.lastCursorAt + cursorInterval && remainingCursorTicks > 0) {
            aiTickState.lastCursorAt += cursorInterval
            runAICursor()
            remainingCursorTicks--
        }
    })
}

function runAIForActiveContext() {
    if(aiEnabled == false) {
        return
    }
    if(gameOver || gamePaused) {
        return
    }
    if(gameStarted == false) {
        runAIPregameSelection(aiSide)
        return
    }
    runAIGameplayDecisionCycle(aiSide)
}

function chooseAITrainingDistinctStrategySelection(observedLoadoutSummary, excludedStrategyIndex, loadoutKey) {
    return chooseAIArchetypeFromFeatures(buildAIStrategySelectionFeatures(observedLoadoutSummary), excludedStrategyIndex, loadoutKey)
}

function isAITrainingLoadoutExcluded(excludedLoadoutKeys, loadoutKey) {
    if(!excludedLoadoutKeys) {
        return false
    }
    if(Array.isArray(excludedLoadoutKeys)) {
        return excludedLoadoutKeys.indexOf(loadoutKey) != -1
    }
    return excludedLoadoutKeys == loadoutKey
}

function chooseAITrainingBestLoadout(observedLoadoutSummary, excludedLoadoutKeys) {
    if(ensureAILoadoutLibraryInitialized() == false || aiLoadoutLibrary.length <= 0) {
        return null
    }
    ensureAILearningLoaded()
    var bestLoadout = null
    var bestScore = -Infinity
    for(var i = 0; i < aiLoadoutLibrary.length; i++) {
        var loadout = aiLoadoutLibrary[i]
        if(isAITrainingLoadoutExcluded(excludedLoadoutKeys, loadout.key)) {
            continue
        }
        var score = getAILoadoutCounterHeuristicBonus(loadout.summary, observedLoadoutSummary)
        score += getAILoadoutCounterLearningBonus(loadout.key, observedLoadoutSummary)
        score += getAILoadoutPerformanceBonus(loadout.key)
        if(score > bestScore) {
            bestScore = score
            bestLoadout = loadout
        }
    }
    return bestLoadout || aiLoadoutLibrary[0]
}

function chooseAITrainingRandomLoadout(excludedLoadoutKeys) {
    if(ensureAILoadoutLibraryInitialized() == false || aiLoadoutLibrary.length <= 0) {
        return null
    }
    var candidateLoadouts = []
    for(var i = 0; i < aiLoadoutLibrary.length; i++) {
        if(isAITrainingLoadoutExcluded(excludedLoadoutKeys, aiLoadoutLibrary[i].key) == false) {
            candidateLoadouts.push(aiLoadoutLibrary[i])
        }
    }
    if(candidateLoadouts.length <= 0) {
        candidateLoadouts = aiLoadoutLibrary
    }
    return candidateLoadouts[Math.floor(Math.random() * candidateLoadouts.length)]
}

function prepareAITrainingStrategyForMatch(observedLoadoutSummary, excludedSelection, forcedLoadout) {
    ensureAILearningLoaded()
    ensureAILoadoutLibraryInitialized()
    var chosenLoadout = forcedLoadout || chooseAILoadoutForMatch(observedLoadoutSummary, excludedSelection && excludedSelection.loadoutKey ? excludedSelection.loadoutKey : null)
    aiStrategySelection = excludedSelection && excludedSelection.archetypeIndex != null ? chooseAITrainingDistinctStrategySelection(observedLoadoutSummary, excludedSelection.archetypeIndex, chosenLoadout.key) : chooseAIArchetypeFromFeatures(buildAIStrategySelectionFeatures(observedLoadoutSummary), null, chosenLoadout.key)
    aiStrategySelection.loadoutKey = chosenLoadout.key
    aiStrategySelection.loadoutSummary = chosenLoadout.summary
    aiCurrentStrategy = createAIRuntimeStrategyForLoadout(chosenLoadout, AI_STRATEGY_LIBRARY[aiStrategySelection.index], observedLoadoutSummary)
    aiDesiredLoadoutTowers = chosenLoadout.towers.slice(0)
    aiDesiredLoadoutBoosts = chosenLoadout.boosts.slice(0)
    aiMatchTelemetry = createAIMatchTelemetry(aiStrategySelection.index, aiStrategySelection.features, observedLoadoutSummary)
    aiMatchTelemetry.aiLoadoutKey = chosenLoadout.key
    aiMatchTelemetry.aiLoadoutSummary = chosenLoadout.summary
    aiProfile.loadoutPlanReady = true
}

function primeAITrainingTrueSelfPlayContext(side, observedLoadoutSummary, excludedSelection, forcedLoadout, policyConfig) {
    var snapshot = captureActiveAIContextSnapshot()
    var chosenSummary = createEmptyLoadoutSummary()
    aiContextsBySide[side] = createAIContext(side, getOpponentSide(side))
    activateAIContext(side)
    aiCurrentStrategy = null
    aiMatchTelemetry = null
    aiStrategySelection = null
    aiDesiredLoadoutTowers = []
    aiDesiredLoadoutBoosts = []
    resetAIProfile()
    aiProfile.policySnapshot = policyConfig && policyConfig.policySnapshot ? cloneAIPolicy(policyConfig.policySnapshot) : null
    aiProfile.learningEnabled = !!(policyConfig && policyConfig.learningEnabled)
    aiProfile.explorationEnabled = !!(policyConfig && policyConfig.explorationEnabled)
    prepareAITrainingStrategyForMatch(observedLoadoutSummary, excludedSelection, forcedLoadout)
    aiProfile.loadoutFilled = true
    aiProfile.currentAction = null
    aiTickState.lastLogicAt = gameNow()
    aiTickState.lastCursorAt = gameNow()
    chosenSummary = summarizeLoadoutSelection(aiDesiredLoadoutTowers, aiDesiredLoadoutBoosts)
    storeActiveAIContext()
    restoreAIContextSnapshot(snapshot)
    return chosenSummary
}

function registerAITrainingTrueSelfPlaySelections() {
    var leftContext = aiContextsBySide[PLAYER_SIDE.left]
    var rightContext = aiContextsBySide[PLAYER_SIDE.right]
    if(leftContext && leftContext.aiStrategySelection) {
        aiTrainingState.sessionStrategyPickCounts[leftContext.aiStrategySelection.index]++
    }
    if(rightContext && rightContext.aiStrategySelection) {
        aiTrainingState.sessionStrategyPickCounts[rightContext.aiStrategySelection.index]++
    }
}

function rollbackAITrainingTrueSelfPlaySelections() {
    var leftContext = aiContextsBySide[PLAYER_SIDE.left]
    var rightContext = aiContextsBySide[PLAYER_SIDE.right]
    if(leftContext && leftContext.aiStrategySelection) {
        aiTrainingState.sessionStrategyPickCounts[leftContext.aiStrategySelection.index] = Math.max(0, aiTrainingState.sessionStrategyPickCounts[leftContext.aiStrategySelection.index] - 1)
    }
    if(rightContext && rightContext.aiStrategySelection) {
        aiTrainingState.sessionStrategyPickCounts[rightContext.aiStrategySelection.index] = Math.max(0, aiTrainingState.sessionStrategyPickCounts[rightContext.aiStrategySelection.index] - 1)
    }
}

function recordAITrainingTrueSelfPlayWinningStrategy(side) {
    var context = aiContextsBySide[side]
    if(!context || !context.aiStrategySelection) {
        return
    }
    aiTrainingState.sessionBestStrategyCounts[context.aiStrategySelection.index]++
    aiTrainingState.lastBestStrategyIndex = context.aiStrategySelection.index
}

function finishAITrainingEvaluation() {
    var games = Math.max(1, aiTrainingState.evaluationGames)
    var score = (aiTrainingState.evaluationWins + aiTrainingState.evaluationTies * 0.5) / games
    aiTrainingState.lastEvaluationScore = score
    if(score >= 0.56) {
        if(isValidAIPolicy(aiLearning.championPolicy)) {
            aiLearning.populationPolicies.push(cloneAIPolicy(aiLearning.championPolicy))
            if(aiLearning.populationPolicies.length > 4) {
                aiLearning.populationPolicies.shift()
            }
        }
        aiLearning.championPolicy = cloneAIPolicy(aiLearning.policy)
        aiLearning.championGeneration++
        aiLearning.candidateGeneration = aiLearning.championGeneration
        aiLearning.policy = cloneAIPolicy(aiLearning.championPolicy)
        aiTrainingState.promotions++
        setAITrainingNotice("Candidate promoted at " + Math.round(score * 100) + "% evaluation score.", 2600)
    } else if(score < 0.48) {
        aiLearning.policy = cloneAIPolicy(aiLearning.championPolicy)
        aiLearning.candidateGeneration = aiLearning.championGeneration
        aiTrainingState.rejectedCandidates++
        setAITrainingNotice("Candidate rejected at " + Math.round(score * 100) + "% and reset.", 2600)
    } else {
        setAITrainingNotice("Evaluation inconclusive at " + Math.round(score * 100) + "% training continues.", 2600)
    }
    aiTrainingState.candidateTrainingMatches = 0
    aiTrainingState.evaluationActive = false
    aiTrainingState.evaluationGames = 0
    aiTrainingState.evaluationWins = 0
    aiTrainingState.evaluationLosses = 0
    aiTrainingState.evaluationTies = 0
    aiTrainingState.pendingSaveEpisodes++
}

function prepareAITrainingTrueSelfPlayContexts() {
    clearAIContexts()
    ensureAILearningLoaded()
    aiTrainingState.evaluationActive = aiTrainingState.candidateTrainingMatches >= 64
    var scenarioIndex = aiTrainingState.trueSelfPlayMatches % 8
    var candidateSide = Math.floor(scenarioIndex / 2) % 2 == 0 ? PLAYER_SIDE.left : PLAYER_SIDE.right
    var opponentSide = getOpponentSide(candidateSide)
    aiTrainingState.candidateSide = candidateSide

    var opponentPolicy = aiLearning.championPolicy
    aiTrainingState.opponentPolicyKind = "champion"
    if(aiTrainingState.evaluationActive == false && aiLearning.populationPolicies.length > 0 && Math.random() < 0.35) {
        opponentPolicy = aiLearning.populationPolicies[Math.floor(Math.random() * aiLearning.populationPolicies.length)]
        aiTrainingState.opponentPolicyKind = "population"
    }

    var probeLoadout = chooseAITrainingRandomLoadout(null)
    var probeSummary = probeLoadout ? probeLoadout.summary : null
    var responderLoadout = chooseAITrainingBestLoadout(probeSummary, probeLoadout ? probeLoadout.key : null)
    var responderSummary = responderLoadout ? responderLoadout.summary : null
    var candidateResponds = Math.floor(scenarioIndex / 4) % 2 == 0
    aiTrainingState.candidateResponds = candidateResponds
    var candidateLoadout = candidateResponds ? responderLoadout : probeLoadout
    var opponentLoadout = candidateResponds ? probeLoadout : responderLoadout
    var candidateObserved = candidateResponds ? probeSummary : responderSummary
    var opponentObserved = candidateResponds ? responderSummary : probeSummary

    primeAITrainingTrueSelfPlayContext(candidateSide, candidateObserved, null, candidateLoadout, {
        policySnapshot: aiTrainingState.evaluationActive ? aiLearning.policy : null,
        learningEnabled: aiTrainingState.evaluationActive == false,
        explorationEnabled: aiTrainingState.evaluationActive == false,
    })
    primeAITrainingTrueSelfPlayContext(opponentSide, opponentObserved, null, opponentLoadout, {
        policySnapshot: opponentPolicy,
        learningEnabled: false,
        explorationEnabled: false,
    })
    registerAITrainingTrueSelfPlaySelections()
}

function launchAITrainingTrueSelfPlayMatch() {
    resetAITrainingTrueSelfPlayMatchState()
    resetAITrainingTrueSelfPlayProgressWatchdog()
    prepareAITrainingTrueSelfPlayContexts()
    var leftContext = aiContextsBySide[PLAYER_SIDE.left]
    var rightContext = aiContextsBySide[PLAYER_SIDE.right]
    p1Towers = leftContext.aiDesiredLoadoutTowers.slice(0)
    p2Towers = rightContext.aiDesiredLoadoutTowers.slice(0)
    p1BoostTypes = leftContext.aiDesiredLoadoutBoosts.slice(0)
    p2BoostTypes = rightContext.aiDesiredLoadoutBoosts.slice(0)
    selectedMenuMode = "training-self-play"
    frontMenuState = "pregame"
    aiEnabled = true
    humanSide = PLAYER_SIDE.left
    aiSide = PLAYER_SIDE.right
    activateAIContext(PLAYER_SIDE.left)
    humanSide = 0
    aiTrainingState.trueSelfPlayDiscardCurrentMatch = false
    aiTrainingState.trueSelfPlayMatchFinalized = false
    aiTrainingState.trueSelfPlayPendingRestartAt = 0
}

function recordAITrainingTrueSelfPlayMatchResult() {
    var leftLives = players[PLAYER_SIDE.left].lives == Infinity ? 150 : Math.max(0, players[PLAYER_SIDE.left].lives)
    var rightLives = players[PLAYER_SIDE.right].lives == Infinity ? 150 : Math.max(0, players[PLAYER_SIDE.right].lives)
    aiTrainingState.trueSelfPlayMatches++
    aiTrainingState.trueSelfPlayLastRound = Math.max(1, Math.floor(round / 2))
    aiTrainingState.trueSelfPlayRoundTotal += aiTrainingState.trueSelfPlayLastRound
    if(leftLives > rightLives) {
        aiTrainingState.trueSelfPlayLeftWins++
        aiTrainingState.trueSelfPlayLastWinner = "Left AI"
        recordAITrainingTrueSelfPlayWinningStrategy(PLAYER_SIDE.left)
    } else if(rightLives > leftLives) {
        aiTrainingState.trueSelfPlayRightWins++
        aiTrainingState.trueSelfPlayLastWinner = "Right AI"
        recordAITrainingTrueSelfPlayWinningStrategy(PLAYER_SIDE.right)
    } else {
        aiTrainingState.trueSelfPlayTies++
        aiTrainingState.trueSelfPlayLastWinner = "Tie"
    }
    var candidateLives = aiTrainingState.candidateSide == PLAYER_SIDE.left ? leftLives : rightLives
    var opponentLives = aiTrainingState.candidateSide == PLAYER_SIDE.left ? rightLives : leftLives
    if(aiTrainingState.evaluationActive) {
        aiTrainingState.evaluationGames++
        if(candidateLives > opponentLives) {
            aiTrainingState.evaluationWins++
        } else if(candidateLives < opponentLives) {
            aiTrainingState.evaluationLosses++
        } else {
            aiTrainingState.evaluationTies++
        }
        if(aiTrainingState.evaluationGames >= 32) {
            finishAITrainingEvaluation()
        }
    } else {
        aiTrainingState.candidateTrainingMatches++
    }
    pushAITrainingHistoryValue(aiTrainingState.trueSelfPlayRecentRounds, aiTrainingState.trueSelfPlayLastRound, 22)
    pushAITrainingHistoryValue(aiTrainingState.trueSelfPlayRecentLeftWinRates, leftLives > rightLives ? 1 : rightLives > leftLives ? 0 : 0.5, 22)
}

var baseFinalizeAIMatchLearning = finalizeAIMatchLearning
finalizeAIMatchLearning = function() {
    var gamesBefore = aiLearning ? aiLearning.totalGames : 0
    baseFinalizeAIMatchLearning()
    if(isAITrainingTrueSelfPlayActive() && aiLearning && aiLearning.totalGames > gamesBefore) {
        aiTrainingState.pendingSaveEpisodes++
    }
}

function finalizeAIControllersOnGameOver() {
    if(aiEnabled == false) {
        return
    }
    if(isAITrainingTrueSelfPlayActive()) {
        if(aiTrainingState.trueSelfPlayMatchFinalized) {
            return
        }
        if(aiTrainingState.trueSelfPlayDiscardCurrentMatch) {
            rollbackAITrainingTrueSelfPlaySelections()
            aiTrainingState.trueSelfPlayMatchFinalized = true
            aiTrainingState.trueSelfPlayPendingRestartAt = realNow() + getAITrainingInterMatchDelayMs()
            return
        }
        withAIContext(PLAYER_SIDE.left, function() {
            finalizeAIMatchLearning()
        })
        withAIContext(PLAYER_SIDE.right, function() {
            finalizeAIMatchLearning()
        })
        recordAITrainingTrueSelfPlayMatchResult()
        aiTrainingState.trueSelfPlayMatchFinalized = true
        aiTrainingState.trueSelfPlayPendingRestartAt = realNow() + getAITrainingInterMatchDelayMs()
        requestAITrainingSave(false)
        return
    }
    finalizeAIMatchLearning()
}

function stopAITrainingTrueSelfPlay(openDashboardAfterStop) {
    if(aiTrainingState.trueSelfPlayActive == false) {
        if(openDashboardAfterStop) {
            frontMenuState = "training"
        }
        return true
    }
    if(aiTrainingState.running && aiTrainingState.currentRunStartedAt > 0) {
        aiTrainingState.activeMs += Math.max(0, realNow() - aiTrainingState.currentRunStartedAt)
    }
    aiTrainingState.currentRunStartedAt = 0
    aiTrainingState.running = false
    aiTrainingState.trueSelfPlayActive = false
    aiTrainingState.trueSelfPlayMatchFinalized = false
    aiTrainingState.trueSelfPlayDiscardCurrentMatch = false
    aiTrainingState.trueSelfPlayPendingRestartAt = 0
    aiTrainingState.trueSelfPlayStopAfterCurrentGame = false
    resetAITrainingSimulationFrameStep()
    resetAITrainingTrueSelfPlayProgressWatchdog()
    clearAIContexts()
    aiEnabled = false
    resetAITrainingTrueSelfPlayMatchState()
    selectedMenuMode = ""
    requestAITrainingSave(true)
    setAITrainingNotice("True self-play paused.", 1600)
    frontMenuState = openDashboardAfterStop ? "training" : "mode"
    return true
}

function startAITrainingTrueSelfPlay() {
    ensureAILearningLoaded()
    if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.restoreComplete == false && aiPersistenceState.loadInFlight) {
        setAITrainingNotice("Wait for hosted AI data to finish loading.", 1800)
        return false
    }
    if(aiTrainingState.startedAt <= 0) {
        aiTrainingState.startedAt = realNow()
    }
    aiTrainingState.currentRunStartedAt = realNow()
    aiTrainingState.running = true
    aiTrainingState.trueSelfPlayActive = true
    aiTrainingState.goalReachedAt = 0
    aiTrainingState.trueSelfPlayStopAfterCurrentGame = false
    launchAITrainingTrueSelfPlayMatch()
    return true
}

function tickAITrainingTrueSelfPlayLifecycle() {
    syncAITrainingSaveState()
    if(isAITrainingTrueSelfPlayActive() == false) {
        return
    }
    syncAITrainingTrueSelfPlayProgressWatchdog()
    if(gameOver == false) {
        return
    }
    if(aiTrainingState.trueSelfPlayMatchFinalized == false) {
        finalizeAIControllersOnGameOver()
    }
    if(aiTrainingState.trueSelfPlayDiscardCurrentMatch) {
        if(aiTrainingState.trueSelfPlayPendingRestartAt > 0 && realNow() >= aiTrainingState.trueSelfPlayPendingRestartAt) {
            launchAITrainingTrueSelfPlayMatch()
        }
        return
    }
    if(aiTrainingState.trueSelfPlayStopAfterCurrentGame) {
        stopAITrainingTrueSelfPlay(true)
        setAITrainingNotice("True self-play stopped after the current match.", 2200)
        return
    }
    if(aiTrainingState.trueSelfPlayMatches >= getAITrainingGoalEpisodes()) {
        aiTrainingState.goalReachedAt = realNow()
        stopAITrainingTrueSelfPlay(true)
        setAITrainingNotice("True self-play goal reached.", 2200)
        return
    }
    if(aiTrainingState.trueSelfPlayPendingRestartAt > 0 && realNow() >= aiTrainingState.trueSelfPlayPendingRestartAt) {
        launchAITrainingTrueSelfPlayMatch()
    }
}

function setAITrainingRunning(nextRunning) {
    if(getAITrainingMode().id == "selfplay") {
        if(nextRunning) {
            return startAITrainingTrueSelfPlay()
        }
        return stopAITrainingTrueSelfPlay(false)
    }

    if(nextRunning) {
        ensureAILearningLoaded()
        if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.restoreComplete == false && aiPersistenceState.loadInFlight) {
            setAITrainingNotice("Wait for hosted AI data to finish loading.", 1800)
            return false
        }
        if(aiTrainingState.running) {
            return true
        }
        if(aiTrainingState.startedAt <= 0) {
            aiTrainingState.startedAt = realNow()
        }
        aiTrainingState.currentRunStartedAt = realNow()
        aiTrainingState.running = true
        aiTrainingState.goalReachedAt = 0
        setAITrainingNotice("Trainer running " + getAITrainingProfile().label.toLowerCase() + ".", 1500)
        return true
    }

    if(aiTrainingState.running) {
        aiTrainingState.activeMs += Math.max(0, realNow() - aiTrainingState.currentRunStartedAt)
        aiTrainingState.currentRunStartedAt = 0
        aiTrainingState.running = false
        requestAITrainingSave(false)
        setAITrainingNotice("Trainer paused.", 1200)
    }
    return true
}

function openAITrainingDashboard() {
    if(ensureAITrainingRuntimeInitialized() == false) {
        return
    }
    if(isAITrainingTrueSelfPlayActive()) {
        stopAITrainingTrueSelfPlay(false)
    }
    ensureAILearningLoaded()
    if(frontMenuState != "training") {
        aiTrainingState.returnState = frontMenuState
    }
    frontMenuState = "training"
    if(aiTrainingState.startedAt <= 0) {
        aiTrainingState.startedAt = realNow()
    }
    setAITrainingNotice("Training lab unlocked. Start self-play to discover and rank loadouts.", 2200)
}

function closeAITrainingDashboard() {
    setAITrainingRunning(false)
    requestAITrainingSave(true)
    frontMenuState = aiTrainingState.returnState && aiTrainingState.returnState != "training" ? aiTrainingState.returnState : "mode"
}

function handleAITrainingHiddenHotkey(event) {
    if(ensureAITrainingRuntimeInitialized() == false) {
        return false
    }
    if(event.keyCode == 16 || event.keyCode == 32) {
        if(event.type == "keyup") {
            aiTrainingState.hotkeyLatch = false
        }
    }
    if(event.type != "keydown") {
        return false
    }
    if((event.keyCode == 32 || event.code == "Space" || event.key == " ") && event.shiftKey) {
        if(aiTrainingState.hotkeyLatch) {
            if(event.preventDefault) event.preventDefault()
            return true
        }
        aiTrainingState.hotkeyLatch = true
        if(isAITrainingTrueSelfPlayActive()) {
            stopAITrainingTrueSelfPlay(true)
            if(event.preventDefault) event.preventDefault()
            return true
        }
        if(gameStarted && isAITrainingTrueSelfPlayActive() == false) {
            return false
        }
        openAITrainingDashboard()
        if(event.preventDefault) event.preventDefault()
        return true
    }
    return false
}

function getAITrainingTrueSelfPlayOverlayButtons() {
    if(isAITrainingTrueSelfPlayActive() == false) {
        return []
    }
    var buttonWidth = canvas.width * 0.19
    var buttonHeight = canvas.height * 0.048
    var x = canvas.width - buttonWidth - canvas.width * 0.022
    var startY = canvas.height * 0.07
    var gap = canvas.height * 0.012
    return [
        { id: "stop-after-game", x: x, y: startY, width: buttonWidth, height: buttonHeight, label: aiTrainingState.trueSelfPlayStopAfterCurrentGame ? "Stop After Game: On" : "Stop After Game" },
        { id: "stop-now", x: x, y: startY + buttonHeight + gap, width: buttonWidth, height: buttonHeight, label: "Stop Now" },
    ]
}

function drawAITrainingTrueSelfPlayOverlay() {
    var buttons = getAITrainingTrueSelfPlayOverlayButtons()
    if(buttons.length <= 0) {
        return
    }
    ctx.textAlign = "left"
    ctx.font = "12px Arial"
    ctx.fillStyle = "rgba(208, 220, 245, 0.88)"
    ctx.fillText("True Self-Play", buttons[0].x, buttons[0].y - 8, buttons[0].width)
    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i]
        var fillStyle = button.id == "stop-now" ? "rgba(154, 73, 67, 0.92)" : aiTrainingState.trueSelfPlayStopAfterCurrentGame ? "rgba(166, 127, 58, 0.92)" : "rgba(76, 109, 160, 0.92)"
        drawFrontMenuButton(button, fillStyle)
    }
}

function handleAITrainingTrueSelfPlayOverlayClick(x, y) {
    var buttons = getAITrainingTrueSelfPlayOverlayButtons()
    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i]
        if(x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
            if(button.id == "stop-after-game") {
                aiTrainingState.trueSelfPlayStopAfterCurrentGame = !aiTrainingState.trueSelfPlayStopAfterCurrentGame
                setAITrainingNotice(aiTrainingState.trueSelfPlayStopAfterCurrentGame ? "Self-play will stop after the current match." : "Self-play will continue after this match.", 1800)
            } else if(button.id == "stop-now") {
                stopAITrainingTrueSelfPlay(true)
            }
            return true
        }
    }
    return false
}

function drawAITrainingScreen() {
    if(ensureAITrainingRuntimeInitialized() == false) {
        return
    }

    tickSyntheticTrainingMode()
    syncAITrainingSaveState()
    ensureAILearningLoaded()

    var trainingMode = getAITrainingMode()
    var panelX = canvas.width * 0.05
    var panelY = canvas.height * 0.05
    var panelWidth = canvas.width * 0.9
    var panelHeight = canvas.height * 0.69
    var panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight)
    panelGradient.addColorStop(0, "rgba(13, 16, 32, 0.96)")
    panelGradient.addColorStop(1, "rgba(18, 34, 58, 0.96)")
    ctx.fillStyle = panelGradient
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)"
    ctx.lineWidth = 5
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)
    ctx.fillStyle = "rgba(111, 194, 255, 0.14)"
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight * 0.14)

    ctx.textAlign = "center"
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 7
    ctx.font = "36px Luckiest Guy"
    ctx.strokeText("AI Training Lab", canvas.width / 2, panelY + panelHeight * 0.08, panelWidth * 0.5)
    ctx.fillText("AI Training Lab", canvas.width / 2, panelY + panelHeight * 0.08, panelWidth * 0.5)
    ctx.font = "15px Arial"
    ctx.fillStyle = "rgba(214, 228, 255, 0.86)"
    ctx.fillText("Candidate training against frozen champion and historical policy snapshots.", canvas.width / 2, panelY + panelHeight * 0.125, panelWidth * 0.78)
    if(aiTrainingState.noticeUntil > realNow()) {
        ctx.font = "14px Arial"
        ctx.fillStyle = "#ffd774"
        ctx.fillText(aiTrainingState.notice, canvas.width / 2, panelY + panelHeight * 0.165, panelWidth * 0.72)
    }

    var innerPadding = panelWidth * 0.025
    var contentX = panelX + innerPadding
    var contentWidth = panelWidth - innerPadding * 2
    var contentTop = panelY + panelHeight * 0.23
    var sectionGap = panelWidth * 0.018

    var profile = getAITrainingProfile()
    var goalEpisodes = getAITrainingGoalEpisodes()
    var progressCount = trainingMode.id == "selfplay" ? aiTrainingState.trueSelfPlayMatches : aiTrainingState.sessionEpisodes
    var goalProgress = clamp(progressCount / Math.max(1, goalEpisodes), 0, 1)
    var coachRate = aiTrainingState.sessionEpisodes > 0 ? aiTrainingState.sessionCoachHits / aiTrainingState.sessionEpisodes : 0
    var averageReward = aiTrainingState.sessionEpisodes > 0 ? aiTrainingState.sessionRewardTotal / aiTrainingState.sessionEpisodes : 0
    var averageSelfPlayRound = aiTrainingState.trueSelfPlayMatches > 0 ? aiTrainingState.trueSelfPlayRoundTotal / aiTrainingState.trueSelfPlayMatches : 0
    var runtimeLabel = aiTrainingState.running ? "Running" : "Idle"
    if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.loadInFlight && aiPersistenceState.restoreComplete == false) {
        runtimeLabel = "Loading hosted data"
    } else if(AI_CROSS_MATCH_LEARNING_ENABLED && (aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight)) {
        runtimeLabel = aiTrainingState.running ? "Running + syncing" : "Syncing"
    }

    var summaryGap = contentWidth * 0.012
    var summaryMetricWidth = (contentWidth - summaryGap * 5) / 6
    var summaryMetricHeight = 42
    var summaryMetrics = trainingMode.id == "selfplay" ? [
        { label: "Matches", value: aiTrainingState.trueSelfPlayMatches.toLocaleString(), color: "#62c5ff" },
        { label: "Phase", value: aiTrainingState.evaluationActive ? "Eval " + aiTrainingState.evaluationGames + "/32" : "Train " + aiTrainingState.candidateTrainingMatches + "/64", color: "#7fe0a2" },
        { label: "Eval Score", value: Math.round(aiTrainingState.lastEvaluationScore * 100) + "%", color: "#f7c76d" },
        { label: "Promoted", value: aiTrainingState.promotions.toLocaleString(), color: "#87f0ad" },
        { label: "Rejected", value: aiTrainingState.rejectedCandidates.toLocaleString(), color: "#ff9f8f" },
        { label: "Avg Round", value: averageSelfPlayRound.toFixed(1), color: "#7bd8d4" },
    ] : [
        { label: "Episodes", value: aiTrainingState.sessionEpisodes.toLocaleString(), color: "#62c5ff" },
        { label: "Goal", value: goalEpisodes.toLocaleString(), color: "#7fe0a2" },
        { label: "Eps/Sec", value: getAITrainingEpisodesPerSecond().toFixed(1), color: "#f7c76d" },
        { label: "Avg Reward", value: averageReward.toFixed(2), color: averageReward >= 0 ? "#87f0ad" : "#ff9f8f" },
        { label: "Oracle", value: Math.round(coachRate * 100) + "%", color: "#b698ff" },
        { label: "Opponents", value: aiTrainingState.uniqueOpponentCount.toLocaleString(), color: "#7bd8d4" },
    ]
    for(var summaryIndex = 0; summaryIndex < summaryMetrics.length; summaryIndex++) {
        drawAIStatsMetricCell(contentX + summaryIndex * (summaryMetricWidth + summaryGap), contentTop, summaryMetricWidth, summaryMetricHeight, summaryMetrics[summaryIndex].label, summaryMetrics[summaryIndex].value, summaryMetrics[summaryIndex].color)
    }

    var middleY = contentTop + summaryMetricHeight + 18
    var middleHeight = panelHeight * 0.27
    var statusWidth = contentWidth * 0.34
    var trendWidth = contentWidth - statusWidth - sectionGap
    var trendX = contentX + statusWidth + sectionGap
    drawAIStatsCard(contentX, middleY, statusWidth, middleHeight, "Run Status", "rgba(98, 197, 255, 0.92)")
    drawAIStatsCard(trendX, middleY, trendWidth, middleHeight, trainingMode.id == "selfplay" ? "Self-Play Trend" : "Reward Trend", "rgba(255, 189, 92, 0.92)")

    var bottomY = middleY + middleHeight + sectionGap
    var bottomHeight = panelY + panelHeight - bottomY - 14
    var strategyWidth = contentWidth * 0.38
    var featureWidth = contentWidth - strategyWidth - sectionGap
    var featureX = contentX + strategyWidth + sectionGap
    drawAIStatsCard(contentX, bottomY, strategyWidth, bottomHeight, "Top Archetypes", "rgba(255, 189, 92, 0.92)")
    drawAIStatsCard(featureX, bottomY, featureWidth, bottomHeight, "Feature Pulse", "rgba(116, 232, 170, 0.92)")

    ctx.textAlign = "left"
    var statusTextX = contentX + statusWidth * 0.06
    var statusTextWidth = statusWidth * 0.86
    var progressX = statusTextX
    var progressY = middleY + middleHeight - 22
    var progressWidth = statusWidth * 0.88
    var compactBackendLabel = aiPersistenceState.backend == "session only" ? "session only" : aiPersistenceState.backend.replace("php backend shared", "shared").replace(" unavailable", " down")
    var statusLines = [
        "Mode: " + trainingMode.label,
        "Status: " + runtimeLabel,
        (trainingMode.id == "selfplay" ? "Auto rematch" : getAITrainingScenarioLabel()) + "  |  " + getAITrainingSpeedLabel(),
        "Backend: " + compactBackendLabel,
    ]
    if(trainingMode.id == "selfplay") {
        statusLines.push("Candidate: " + (aiTrainingState.evaluationActive ? "frozen evaluation" : "learning") + "  |  Opponent: " + aiTrainingState.opponentPolicyKind)
        statusLines.push("Champion generation: " + aiLearning.championGeneration.toLocaleString())
        statusLines.push("Recovered stalls: " + aiTrainingState.trueSelfPlayStallRecoveries.toLocaleString())
    }
    var statusTextY = middleY + 40
    var statusLineHeight = 11
    ctx.font = "10px Arial"
    ctx.fillStyle = "rgba(214, 226, 255, 0.92)"
    for(var statusLineIndex = 0; statusLineIndex < statusLines.length; statusLineIndex++) {
        ctx.fillText(statusLines[statusLineIndex], statusTextX, statusTextY + statusLineIndex * statusLineHeight, statusTextWidth)
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    ctx.fillRect(progressX, progressY, progressWidth, 12)
    ctx.fillStyle = "#62c5ff"
    ctx.fillRect(progressX, progressY, progressWidth * goalProgress, 12)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.strokeRect(progressX, progressY, progressWidth, 12)

    var trendMetricWidth = trendWidth * 0.215
    var trendMetricGap = trendWidth * 0.018
    var trendMetricY = middleY + 48
    var trendMetricHeight = 32
    if(trainingMode.id == "selfplay") {
        drawAIStatsMetricCell(trendX + trendWidth * 0.04, trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Wins", aiTrainingState.evaluationWins.toLocaleString(), "#7fe0a2")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap), trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Loss", aiTrainingState.evaluationLosses.toLocaleString(), "#ff9f8f")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 2, trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Ties", aiTrainingState.evaluationTies.toLocaleString(), "#62c5ff")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 3, trendMetricY, trendMetricWidth, trendMetricHeight, "Champion", "v" + aiLearning.championGeneration, "#f7c76d")
    } else {
        drawAIStatsMetricCell(trendX + trendWidth * 0.04, trendMetricY, trendMetricWidth, trendMetricHeight, "Positive", aiTrainingState.sessionWins.toLocaleString(), "#7fe0a2")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap), trendMetricY, trendMetricWidth, trendMetricHeight, "Negative", aiTrainingState.sessionLosses.toLocaleString(), "#ff9f8f")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 2, trendMetricY, trendMetricWidth, trendMetricHeight, "Ties", aiTrainingState.sessionTies.toLocaleString(), "#62c5ff")
        drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 3, trendMetricY, trendMetricWidth, trendMetricHeight, "Last Batch", aiTrainingState.lastBatchEpisodes.toLocaleString(), "#f7c76d")
    }
    var trendChartY = trendMetricY + trendMetricHeight + 8
    var trendChartHeight = Math.max(0, middleY + middleHeight - 12 - trendChartY)
    drawAITrainingTrendChart(trendX + trendWidth * 0.04, trendChartY, trendWidth * 0.92, trendChartHeight)

    var topStrategyIndices = getAITrainingTopStrategyIndices(clamp(Math.floor((bottomHeight - 92) / 34), 2, 3), aiTrainingState.sessionStrategyPickCounts)
    var highlightedStrategyIndex = trainingMode.id == "selfplay" ? aiTrainingState.lastBestStrategyIndex : aiTrainingState.lastChosenStrategyIndex
    var rowBaseY = bottomY + 48
    var rowHeight = 28
    var rowGap = 6
    var listX = contentX + strategyWidth * 0.05
    var listWidth = strategyWidth * 0.9
    for(var topIndex = 0; topIndex < topStrategyIndices.length; topIndex++) {
        var strategyIndex = topStrategyIndices[topIndex]
        var strategyRowY = rowBaseY + topIndex * (rowHeight + rowGap)
        var pickCount = aiTrainingState.sessionStrategyPickCounts[strategyIndex]
        var bestCount = aiTrainingState.sessionBestStrategyCounts[strategyIndex]
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
        ctx.lineWidth = 2
        ctx.fillRect(listX, strategyRowY, listWidth, rowHeight)
        ctx.strokeRect(listX, strategyRowY, listWidth, rowHeight)
        ctx.fillStyle = strategyIndex == highlightedStrategyIndex ? "rgba(98, 197, 255, 0.22)" : "rgba(255, 189, 92, 0.14)"
        ctx.fillRect(listX, strategyRowY, 34, rowHeight)
        ctx.fillStyle = "white"
        ctx.font = "14px Luckiest Guy"
        ctx.textAlign = "center"
        ctx.fillText(String(topIndex + 1), listX + 17, strategyRowY + 19, 28)
        ctx.textAlign = "left"
        ctx.font = "bold 12px Arial"
        ctx.fillText(getStrategyDisplayName(AI_STRATEGY_LIBRARY[strategyIndex]), listX + 44, strategyRowY + 14, listWidth * 0.62)
        ctx.font = "10px Arial"
        ctx.fillStyle = "rgba(214, 226, 255, 0.82)"
        ctx.fillText("Picked " + pickCount + (trainingMode.id == "selfplay" ? "  Match wins " : "  Coach best ") + bestCount, listX + 44, strategyRowY + 24, listWidth * 0.72)
    }

    ctx.textAlign = "left"
    ctx.font = "12px Arial"
    ctx.fillStyle = "rgba(214, 226, 255, 0.88)"
    if(trainingMode.id == "selfplay") {
        ctx.fillText("Last winner: " + (aiTrainingState.trueSelfPlayLastWinner || "None yet"), listX, bottomY + bottomHeight - 40, listWidth)
        ctx.fillText("Avg round: " + averageSelfPlayRound.toFixed(1), listX, bottomY + bottomHeight - 22, listWidth)
    } else {
        ctx.fillText("Last batch avg reward: " + aiTrainingState.lastBatchReward.toFixed(2), listX, bottomY + bottomHeight - 40, listWidth)
        ctx.fillText("Coach matches last batch: " + aiTrainingState.lastBatchCoachHits, listX, bottomY + bottomHeight - 22, listWidth)
    }

    var featureColumns = 3
    var featureInnerWidth = featureWidth * 0.9
    var featureColumnGap = featureWidth * 0.03
    var featureColumnWidth = (featureInnerWidth - featureColumnGap * (featureColumns - 1)) / featureColumns
    var featureBaseX = featureX + featureWidth * 0.05
    var featureBaseY = bottomY + 48
    var featureRows = Math.ceil(AI_FEATURE_KEYS.length / featureColumns)
    var featureRowHeight = clamp((bottomHeight - 68) / Math.max(1, featureRows), 18, 23)
    var featurePalette = ["#62c5ff", "#7fe0a2", "#f7c76d", "#f08ba7", "#b698ff", "#7bd8d4"]
    for(var featureIndex = 0; featureIndex < AI_FEATURE_KEYS.length; featureIndex++) {
        var featureColumn = Math.floor(featureIndex / featureRows)
        var featureRow = featureIndex % featureRows
        drawAIStatsFeatureBar(featureBaseX + featureColumn * (featureColumnWidth + featureColumnGap), featureBaseY + featureRow * featureRowHeight, featureColumnWidth, AI_FEATURE_LABELS[AI_FEATURE_KEYS[featureIndex]], getAITrainingAverageFeatureValue(featureIndex), featurePalette[featureIndex % featurePalette.length])
    }
}

var baseGetFrontMenuButtons = getFrontMenuButtons
getFrontMenuButtons = function() {
    if(frontMenuState == "training") {
        var buttons = []
        var trainingButtonWidth = canvas.width * 0.18
        var trainingButtonHeight = canvas.height * 0.043
        var trainingGapX = canvas.width * 0.018
        var trainingGapY = canvas.height * 0.012
        var trainingStartX = (canvas.width - (trainingButtonWidth * 3 + trainingGapX * 2)) / 2
        var trainingRow1Y = canvas.height * 0.755
        var trainingRow2Y = trainingRow1Y + trainingButtonHeight + trainingGapY
        var trainingRow3Y = trainingRow2Y + trainingButtonHeight + trainingGapY
        buttons.push({ id: "training-toggle", x: trainingStartX, y: trainingRow1Y, width: trainingButtonWidth, height: trainingButtonHeight, label: aiTrainingState.running ? "Stop Trainer" : "Start Trainer" })
        buttons.push({ id: "training-save", x: trainingStartX + (trainingButtonWidth + trainingGapX), y: trainingRow1Y, width: trainingButtonWidth, height: trainingButtonHeight, label: AI_CROSS_MATCH_LEARNING_ENABLED ? (aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight ? "Syncing..." : aiPersistenceState.contributionEnabled ? "Sync Global" : "Save Snapshot") : "Session Save" })
        buttons.push({ id: "training-reset-session", x: trainingStartX + (trainingButtonWidth + trainingGapX) * 2, y: trainingRow1Y, width: trainingButtonWidth, height: trainingButtonHeight, label: getAITrainingResetSessionLabel() })
        buttons.push({ id: "training-speed-down", x: trainingStartX, y: trainingRow2Y, width: trainingButtonWidth, height: trainingButtonHeight, label: "Slower" })
        buttons.push({ id: "training-speed-up", x: trainingStartX + (trainingButtonWidth + trainingGapX), y: trainingRow2Y, width: trainingButtonWidth, height: trainingButtonHeight, label: "Faster" })
        buttons.push({ id: "training-goal-down", x: trainingStartX + (trainingButtonWidth + trainingGapX) * 2, y: trainingRow2Y, width: trainingButtonWidth, height: trainingButtonHeight, label: "Goal -" })
        buttons.push({ id: "training-goal-up", x: trainingStartX, y: trainingRow3Y, width: trainingButtonWidth, height: trainingButtonHeight, label: "Goal +" })
        buttons.push({ id: "back", x: trainingStartX + (trainingButtonWidth + trainingGapX), y: trainingRow3Y, width: trainingButtonWidth, height: trainingButtonHeight, label: "Close" })
        return buttons
    }
    return baseGetFrontMenuButtons()
}

var baseIsFrontMenuButtonDisabled = isFrontMenuButtonDisabled
isFrontMenuButtonDisabled = function(button) {
    if(button.id == "training-save") {
        return AI_CROSS_MATCH_LEARNING_ENABLED && (aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight)
    }
    if(button.id == "training-speed-down") {
        return aiTrainingState.batchOptionIndex <= 0
    }
    if(button.id == "training-speed-up") {
        return aiTrainingState.batchOptionIndex >= getAITrainingSpeedOptionCount() - 1
    }
    if(button.id == "training-goal-down") {
        return aiTrainingState.goalOptionIndex <= 0
    }
    if(button.id == "training-goal-up") {
        return aiTrainingState.goalOptionIndex >= AI_TRAINING_GOAL_OPTIONS.length - 1
    }
    if(button.id == "training-toggle") {
        return AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.restoreComplete == false && aiPersistenceState.loadInFlight
    }
    return baseIsFrontMenuButtonDisabled(button)
}

var baseHandleFrontMenuClick = handleFrontMenuClick
handleFrontMenuClick = function(x, y) {
    if(frontMenuState == "training") {
        var button = frontMenuButtonAt(x, y)
        if(!button) {
            return false
        }
        if(isFrontMenuButtonDisabled(button)) {
            return true
        }
        if(button.id != "training-reset-session") {
            clearAITrainingResetConfirmationState()
        }
        if(button.id == "training-toggle") {
            setAITrainingRunning(aiTrainingState.running == false)
        } else if(button.id == "training-speed-down") {
            aiTrainingState.batchOptionIndex = Math.max(0, aiTrainingState.batchOptionIndex - 1)
            setAITrainingNotice("Training speed set to " + getAITrainingSpeedLabel() + ".", 1700)
        } else if(button.id == "training-speed-up") {
            aiTrainingState.batchOptionIndex = Math.min(getAITrainingSpeedOptionCount() - 1, aiTrainingState.batchOptionIndex + 1)
            setAITrainingNotice("Training speed set to " + getAITrainingSpeedLabel() + ".", 1700)
        } else if(button.id == "training-goal-down") {
            aiTrainingState.goalOptionIndex = Math.max(0, aiTrainingState.goalOptionIndex - 1)
            setAITrainingNotice("Training goal set to " + getAITrainingGoalEpisodes().toLocaleString() + " matches.", 1700)
        } else if(button.id == "training-goal-up") {
            aiTrainingState.goalOptionIndex = Math.min(AI_TRAINING_GOAL_OPTIONS.length - 1, aiTrainingState.goalOptionIndex + 1)
            setAITrainingNotice("Training goal set to " + getAITrainingGoalEpisodes().toLocaleString() + " matches.", 1700)
        } else if(button.id == "training-save") {
            requestAITrainingSave(true)
        } else if(button.id == "training-reset-session") {
            requestAITrainingSessionReset()
        } else if(button.id == "back") {
            closeAITrainingDashboard()
        }
        return true
    }
    return baseHandleFrontMenuClick(x, y)
}

var baseDrawFrontMenu = drawFrontMenu
drawFrontMenu = function() {
    if(frontMenuState == "training") {
        ctx.fillStyle = "#355f2a"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawAsset(frontMenuBackgroundAsset, 0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "rgba(18, 22, 52, 0.12)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawAITrainingScreen()
        var trainingButtons = getFrontMenuButtons()
        for(var i = 0; i < trainingButtons.length; i++) {
            var trainingFill = "rgba(72, 118, 162, 0.92)"
            if(trainingButtons[i].id == "training-toggle") {
                trainingFill = aiTrainingState.running ? "rgba(168, 77, 72, 0.92)" : "rgba(66, 146, 84, 0.92)"
            } else if(trainingButtons[i].id == "training-goal-down" || trainingButtons[i].id == "training-goal-up") {
                trainingFill = "rgba(160, 124, 56, 0.92)"
            } else if(trainingButtons[i].id == "training-reset-session") {
                trainingFill = "rgba(138, 84, 57, 0.92)"
            } else if(trainingButtons[i].id == "back") {
                trainingFill = "rgba(143, 77, 62, 0.92)"
            }
            if(isFrontMenuButtonDisabled(trainingButtons[i])) {
                trainingFill = "rgba(78, 78, 90, 0.92)"
            }
            drawFrontMenuButton(trainingButtons[i], trainingFill)
        }
        return
    }
    baseDrawFrontMenu()
}

var baseStartLocalGameSetup = startLocalGameSetup
startLocalGameSetup = function() {
    stopAITrainingTrueSelfPlay(false)
    clearAIContexts()
    rebuildPregameUIAssets()
    baseStartLocalGameSetup()
}

var baseStartVsAIGameSetup = startVsAIGameSetup
startVsAIGameSetup = function(side) {
    stopAITrainingTrueSelfPlay(false)
    clearAIContexts()
    rebuildPregameUIAssets()
    baseStartVsAIGameSetup(side)
}

var baseTickAIControllers = tickAIControllers
tickAIControllers = function() {
    if(aiEnabled == false) {
        return
    }
    if(isAITrainingTrueSelfPlayActive()) {
        updateAITowerDamageRates()
        tickAIControllerForSide(PLAYER_SIDE.left)
        tickAIControllerForSide(PLAYER_SIDE.right)
        return
    }
    baseTickAIControllers()
}
