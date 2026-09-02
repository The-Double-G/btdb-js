// AI Lab extension layered on top of the base AI menu/runtime.

var AI_TRAINING_GOAL_OPTIONS = [500, 2000, 5000, 15000, 40000]
var AI_TRAINING_AUTOSAVE_EPISODES = 10
var AI_TRAINING_FIXED_FRAME_MS = 1000 / 60
var AI_TRAINING_BASE_ANIMATION_DELAY_MS = 16
var AI_TRAINING_BASE_LOGIC_INTERVAL_MS = 250
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
var aiTrainingRuntimeReady = false
var aiContextsBySide = {}
var aiTrainingFrameSimulationMultiplier = 1
var aiTrainingLastSimulationFrameAt = 0
var aiTrainingHeadlessRenderContext = null
var aiTrainingSessionLearning = null
var aiTrainingHostedLearning = null
var aiTrainingSessionModelActive = false

function createAITrainingState() {
    return {
        hotkeyLatch: false,
        returnState: "mode",
        running: false,
        modeIndex: 0,
        batchOptionIndex: 2,
        goalOptionIndex: 2,
        startedAt: 0,
        activeMs: 0,
        currentRunStartedAt: 0,
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
        persistenceMode: "",
        trueSelfPlayProgressKey: "",
        trueSelfPlayProgressAt: 0,
        trueSelfPlayRecentRounds: [],
        trueSelfPlayRecentLeftWinRates: [],
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

function cloneAITrainingLearning(model) {
    return normalizeAILearningData(JSON.parse(JSON.stringify(model)))
}

function installAITrainingHostedLearning(model) {
    if(aiTrainingSessionModelActive == false) {
        return false
    }
    aiTrainingHostedLearning = model
    return true
}

function activateAITrainingSessionModel() {
    if(aiTrainingSessionModelActive) {
        return true
    }
    ensureAILearningLoaded()
    if(!aiLearning) {
        return false
    }
    aiTrainingHostedLearning = aiLearning
    if(!aiTrainingSessionLearning) {
        aiTrainingSessionLearning = cloneAITrainingLearning(aiLearning)
    }
    aiLearning = aiTrainingSessionLearning
    aiTrainingSessionModelActive = true
    return true
}

function deactivateAITrainingSessionModel() {
    if(aiTrainingSessionModelActive == false) {
        return false
    }
    aiTrainingSessionLearning = aiLearning
    aiLearning = aiTrainingHostedLearning || aiLearning
    aiTrainingHostedLearning = null
    aiTrainingSessionModelActive = false
    return true
}

function syncAITrainingCommittedLearning(model) {
    var committedLearning = cloneAITrainingLearning(model)
    if(aiTrainingSessionModelActive) {
        aiTrainingHostedLearning = committedLearning
    } else {
        aiTrainingHostedLearning = null
        aiLearning = committedLearning
    }
}

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
        decisionMemory: aiCreateVector(AI_DECISION_MEMORY_SIZE, 0),
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
    return true
}

function getAITrainingMode() {
    return AI_TRAINING_MODES[clamp(aiTrainingState.modeIndex, 0, AI_TRAINING_MODES.length - 1)]
}

function getAITrainingSpeedOptionCount() {
    return AI_TRAINING_TRUE_SELF_PLAY_SPEEDS.length
}

function getAITrainingTrueSelfPlaySpeed() {
    return AI_TRAINING_TRUE_SELF_PLAY_SPEEDS[clamp(aiTrainingState.batchOptionIndex, 0, getAITrainingSpeedOptionCount() - 1)]
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
    return getAITrainingTrueSelfPlaySpeed().label
}

function getAITrainingAnimationDelayMs() {
    if(isAITrainingTrueSelfPlayActive()) {
        return Math.max(1, Math.round(AI_TRAINING_BASE_ANIMATION_DELAY_MS / Math.min(4, getAITrainingRuntimeClockMultiplier())))
    }
    return 50/3
}

function getAITrainingLogicIntervalMs() {
    return AI_TRAINING_BASE_LOGIC_INTERVAL_MS
}

function getAITrainingCursorIntervalMs() {
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
        return "Reset Metrics"
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
    var progressCount = aiTrainingState.trueSelfPlayMatches
    return progressCount / Math.max(0.001, elapsedMs / 1000)
}

function resetAITrainingSession() {
    var nextState = createAITrainingState()
    nextState.hotkeyLatch = aiTrainingState.hotkeyLatch
    nextState.returnState = aiTrainingState.returnState
    nextState.modeIndex = aiTrainingState.modeIndex
    nextState.batchOptionIndex = aiTrainingState.batchOptionIndex
    nextState.goalOptionIndex = aiTrainingState.goalOptionIndex
    nextState.persistenceMode = aiTrainingState.persistenceMode
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
    if(shouldAITrainingPublishContributions()) {
        return flushAIPublicContributionQueue()
    }
    return shouldAITrainingUseSnapshotPersistence() ? saveAILearningSnapshot() : false
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
    if(getAITrainingPersistenceMode() == "session") {
        if(forceSave) {
            setAITrainingNotice("Session-only training progress stays in this browser tab.", 2200)
        }
        return false
    }
    if(shouldAITrainingPublishContributions()) {
        if(aiPersistenceState.contributionEnabled == false) {
            if(forceSave) {
                setAITrainingNotice("Global contribution sync is unavailable.", 2200)
            }
            return false
        }
        var progressCount = aiTrainingState.trueSelfPlayMatches
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

function canAITrainingCommitSnapshot() {
    return shouldAITrainingUseSnapshotPersistence() && aiPersistenceState.writeEnabled && getAITrainerKey() != ""
}

function getAITrainingPersistenceMode() {
    if(aiTrainingState.persistenceMode) {
        return aiTrainingState.persistenceMode
    }
    return AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.contributionEnabled ? "contributions" : "session"
}

function shouldAITrainingUseSnapshotPersistence() {
    return getAITrainingPersistenceMode() == "snapshot"
}

function shouldAITrainingPublishContributions() {
    return getAITrainingPersistenceMode() == "contributions"
}

function getAITrainingSaveButtonState() {
    if(AI_CROSS_MATCH_LEARNING_ENABLED == false) {
        return { label: "Session Only", disabled: true, action: "none" }
    }
    if(aiPersistenceState.loadInFlight) {
        return { label: "Refreshing...", disabled: true, action: "none" }
    }
    if(aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight) {
        return { label: "Syncing...", disabled: true, action: "none" }
    }
    if(aiPersistenceState.pendingContributions > 0) {
        return aiPersistenceState.contributionEnabled ? { label: "Sync " + aiPersistenceState.pendingContributions + " Queued", disabled: false, action: "contributions" } : { label: "Sync Unavailable", disabled: true, action: "none" }
    }
    if(shouldAITrainingPublishContributions() && aiPersistenceState.contributionEnabled) {
        return { label: "Hosted Contributions Synced", disabled: true, action: "none" }
    }
    if(getAITrainingPersistenceMode() == "session") {
        return { label: "Session Only", disabled: true, action: "none" }
    }
    return { label: "Sync Unavailable", disabled: true, action: "none" }
}

function requestAITrainingControlSave() {
    var saveState = getAITrainingSaveButtonState()
    if(saveState.action == "contributions") {
        flushAIPublicContributionQueue()
        setAITrainingNotice("Saving...", 2200)
        return true
    }
    return false
}

function syncAITrainingSaveState() {
    if(aiPersistenceState.lastSavedAt > aiTrainingState.lastObservedSavedAt) {
        var progressCount = aiTrainingState.trueSelfPlayMatches
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
    var bloonPathProgress = 0
    for(var i = 0; i < bloons.length; i++) {
        var pathProgress = Number(bloons[i].pathPos)
        if(Number.isFinite(pathProgress)) {
            bloonPathProgress += pathProgress
        }
    }
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
        Math.floor(bloonPathProgress * 10),
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
    return aiLearning.playerProfile.features[featureIndex]
}

function getAITrainingEvaluationDisplay() {
    if(aiTrainingState.evaluationGames > 0) {
        return {
            label: "Live Eval",
            score: (aiTrainingState.evaluationWins + aiTrainingState.evaluationTies * 0.5) / aiTrainingState.evaluationGames,
        }
    }
    return {
        label: "Last Eval",
        score: aiTrainingState.lastEvaluationScore,
    }
}

function getAITrainingTopStrategyIndices(limit, counts) {
    var indices = []
    for(var i = 0; i < counts.length; i++) {
        if(counts[i] > 0) {
            indices.push(i)
        }
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
    var rewardSeries = aiTrainingState.trueSelfPlayRecentRounds
    var supportSeries = aiTrainingState.trueSelfPlayRecentLeftWinRates
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
    ctx.strokeRect(x, y, width, height)
    if(rewardSeries.length <= 0) {
        ctx.fillStyle = "rgba(198, 210, 233, 0.82)"
        ctx.font = "13px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Finish a few self-play matches to build the trend.", x + width / 2, y + height / 2 + 4, width * 0.9)
        return
    }

    var rewardTop = y + 8
    var rewardZeroY = y + height * 0.56
    var rewardMaxHeight = Math.max(8, rewardZeroY - rewardTop - 4)
    var supportAreaY = y + height * 0.76
    var supportAreaHeight = Math.max(5, height * 0.12)
    var barWidth = width / Math.max(1, rewardSeries.length)
    for(var i = 0; i < rewardSeries.length; i++) {
        var rewardValue = rewardSeries[i] / 40
        var supportRate = supportSeries[i] || 0
        var normalizedHeight = clamp(Math.abs(rewardValue) / 1.2, 0.06, 1)
        var columnHeight = normalizedHeight * rewardMaxHeight
        var columnX = x + i * barWidth + Math.max(1, barWidth * 0.14)
        var columnWidth = Math.max(3, barWidth * 0.68)
        ctx.fillStyle = "rgba(118, 225, 167, 0.92)"
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
        if(now >= aiTickState.lastCursorAt + cursorInterval) {
            aiTickState.lastCursorAt = now
            runAICursor()
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

function prepareAITrainingStrategyForMatch(observedLoadoutSummary, excludedSelection) {
    ensureAILearningLoaded()
    ensureAILoadoutLibraryInitialized()
    var chosenLoadout = chooseAILoadoutForMatch(observedLoadoutSummary, excludedSelection && excludedSelection.loadoutKey ? excludedSelection.loadoutKey : null)
    var loadoutDecisionSample = chosenLoadout.decisionSample || scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.loadout, {
        id: chosenLoadout.key,
        type: chosenLoadout.summary.towerTypes.join(","),
        role: chosenLoadout.summary.boostImages.join(","),
        actionKey: "loadout|" + chosenLoadout.key,
        heuristic: getAILoadoutCounterHeuristicBonus(chosenLoadout.summary, observedLoadoutSummary),
        heuristicScale: 0.75,
        effect: chosenLoadout.summary.eco + chosenLoadout.summary.pressure + chosenLoadout.summary.heavy + chosenLoadout.summary.late,
        effectScale: 4,
        count: chosenLoadout.summary.filledTowerSlots + chosenLoadout.summary.filledBoostSlots,
        countScale: 5,
        loadoutSummary: chosenLoadout.summary,
        capabilityFacts: getAILoadoutCapabilityFacts(chosenLoadout.towers, chosenLoadout.boosts, 1),
    }, null, buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.loadout, null, observedLoadoutSummary ? getObservedLoadoutFeatureVector(observedLoadoutSummary) : null))
    recordAIDecisionTraceSample(loadoutDecisionSample, 0)
    aiStrategySelection = excludedSelection && excludedSelection.archetypeIndex != null ? chooseAITrainingDistinctStrategySelection(observedLoadoutSummary, excludedSelection.archetypeIndex, chosenLoadout.key) : chooseAIArchetypeFromFeatures(buildAIStrategySelectionFeatures(observedLoadoutSummary), null, chosenLoadout.key)
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

function primeAITrainingTrueSelfPlayContext(side, observedLoadoutSummary, excludedSelection, policyConfig) {
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
    prepareAITrainingStrategyForMatch(observedLoadoutSummary, excludedSelection)
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
    if(score >= 0.58) {
        if(isValidAIPolicy(aiLearning.championPolicy)) {
            aiLearning.populationPolicies.push(cloneAIPolicy(aiLearning.championPolicy))
            if(aiLearning.populationPolicies.length > 2) {
                aiLearning.populationPolicies.shift()
            }
        }
        aiLearning.championPolicy = cloneAIPolicy(aiLearning.policy)
        aiLearning.championGeneration++
        aiLearning.candidateGeneration = aiLearning.championGeneration
        aiLearning.policy = cloneAIPolicy(aiLearning.championPolicy)
        aiTrainingState.promotions++
        setAITrainingNotice("Candidate promoted within the temporary Lab copy at " + Math.round(score * 100) + "%.", 2800)
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
    aiTrainingState.evaluationActive = aiTrainingState.candidateTrainingMatches >= 128
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

    var candidateResponds = Math.floor(scenarioIndex / 4) % 2 == 0
    aiTrainingState.candidateResponds = candidateResponds
    var candidatePolicyConfig = {
        policySnapshot: aiTrainingState.evaluationActive ? aiLearning.policy : null,
        learningEnabled: aiTrainingState.evaluationActive == false,
        explorationEnabled: aiTrainingState.evaluationActive == false,
    }
    var opponentPolicyConfig = {
        policySnapshot: opponentPolicy,
        learningEnabled: false,
        explorationEnabled: false,
    }
    var probeSide = candidateResponds ? opponentSide : candidateSide
    var responderSide = getOpponentSide(probeSide)
    var probePolicyConfig = probeSide == candidateSide ? candidatePolicyConfig : opponentPolicyConfig
    var responderPolicyConfig = responderSide == candidateSide ? candidatePolicyConfig : opponentPolicyConfig
    var probeSummary = primeAITrainingTrueSelfPlayContext(probeSide, null, null, probePolicyConfig)
    primeAITrainingTrueSelfPlayContext(responderSide, probeSummary, { loadoutKey: probeSummary.signature }, responderPolicyConfig)
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
        if(aiTrainingState.evaluationGames >= 64) {
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
    if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.loadInFlight) {
        setAITrainingNotice("Wait for hosted AI data to finish loading.", 1800)
        return false
    }
    var persistenceMode = getAITrainingPersistenceMode()
    if(persistenceMode == "snapshot" && (aiPersistenceState.contributionInFlight || getAIPublicContributionQueue().length > 0)) {
        flushAIPublicContributionQueue()
        setAITrainingNotice("Saving...", 2000)
        return false
    }
    aiTrainingState.persistenceMode = persistenceMode
    if(activateAITrainingSessionModel() == false) {
        setAITrainingNotice("Training model is not ready yet.", 1800)
        return false
    }
    if(aiTrainingState.trueSelfPlayMatches >= getAITrainingGoalEpisodes()) {
        setAITrainingNotice("Increase the match goal or reset metrics before starting again.", 2200)
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
    if(nextRunning) {
        return startAITrainingTrueSelfPlay()
    }
    return stopAITrainingTrueSelfPlay(false)
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
    if(aiTrainingSessionLearning || aiPersistenceState.restoreComplete) {
        activateAITrainingSessionModel()
    } else {
        waitForAILearningRefreshIdle().then(function() {
            if(frontMenuState == "training") {
                activateAITrainingSessionModel()
            }
        })
    }
    if(aiTrainingState.startedAt <= 0) {
        aiTrainingState.startedAt = realNow()
    }
    setAITrainingNotice("Training lab unlocked. Start self-play to discover and rank loadouts.", 2200)
}

function closeAITrainingDashboard() {
    setAITrainingRunning(false)
    requestAITrainingSave(true)
    deactivateAITrainingSessionModel()
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
        { id: "stop-after-game", x: x, y: startY, width: buttonWidth, height: buttonHeight, label: aiTrainingState.trueSelfPlayStopAfterCurrentGame ? "Pause After Match: On" : "Pause After Match" },
        { id: "stop-now", x: x, y: startY + buttonHeight + gap, width: buttonWidth, height: buttonHeight, label: "Pause + Discard Match" },
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
    ctx.fillText("Browser-session candidates train against a frozen session champion; community sync is reported separately.", canvas.width / 2, panelY + panelHeight * 0.125, panelWidth * 0.82)
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

    var goalEpisodes = getAITrainingGoalEpisodes()
    var progressCount = aiTrainingState.trueSelfPlayMatches
    var goalProgress = clamp(progressCount / Math.max(1, goalEpisodes), 0, 1)
    var averageSelfPlayRound = aiTrainingState.trueSelfPlayMatches > 0 ? aiTrainingState.trueSelfPlayRoundTotal / aiTrainingState.trueSelfPlayMatches : 0
    var evaluationDisplay = getAITrainingEvaluationDisplay()
    var runtimeLabel = aiTrainingState.running ? "Running" : "Idle"
    if(AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.loadInFlight && aiPersistenceState.restoreComplete == false) {
        runtimeLabel = "Loading hosted data"
    } else if(AI_CROSS_MATCH_LEARNING_ENABLED && (aiPersistenceState.saveInFlight || aiPersistenceState.contributionInFlight)) {
        runtimeLabel = aiTrainingState.running ? "Running + syncing" : "Syncing"
    }

    var summaryGap = contentWidth * 0.012
    var summaryMetricWidth = (contentWidth - summaryGap * 5) / 6
    var summaryMetricHeight = 42
    var summaryMetrics = [
        { label: "Matches", value: aiTrainingState.trueSelfPlayMatches.toLocaleString(), color: "#62c5ff" },
        { label: "Phase", value: aiTrainingState.evaluationActive ? "Eval " + aiTrainingState.evaluationGames + "/64" : "Train " + aiTrainingState.candidateTrainingMatches + "/128", color: "#7fe0a2" },
        { label: evaluationDisplay.label, value: Math.round(evaluationDisplay.score * 100) + "%", color: "#f7c76d" },
        { label: "Lab Promotions", value: aiTrainingState.promotions.toLocaleString(), color: "#87f0ad" },
        { label: "Rejected", value: aiTrainingState.rejectedCandidates.toLocaleString(), color: "#ff9f8f" },
        { label: "Avg Round", value: averageSelfPlayRound.toFixed(1), color: "#7bd8d4" },
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
    drawAIStatsCard(trendX, middleY, trendWidth, middleHeight, "Self-Play Trend", "rgba(255, 189, 92, 0.92)")

    var bottomY = middleY + middleHeight + sectionGap
    var bottomHeight = panelY + panelHeight - bottomY - 14
    var strategyWidth = contentWidth * 0.38
    var featureWidth = contentWidth - strategyWidth - sectionGap
    var featureX = contentX + strategyWidth + sectionGap
    drawAIStatsCard(contentX, bottomY, strategyWidth, bottomHeight, "Top Archetypes", "rgba(255, 189, 92, 0.92)")
    drawAIStatsCard(featureX, bottomY, featureWidth, bottomHeight, "Session Player Profile", "rgba(116, 232, 170, 0.92)")

    ctx.textAlign = "left"
    var statusTextX = contentX + statusWidth * 0.06
    var statusTextWidth = statusWidth * 0.86
    var progressX = statusTextX
    var progressY = middleY + middleHeight - 22
    var progressWidth = statusWidth * 0.88
    var compactBackendLabel = aiPersistenceState.backend == "session only" ? "session only" : aiPersistenceState.backend.replace("php backend shared", "shared").replace(" unavailable", " down")
    var publishingLabel = getAITrainingPersistenceMode() == "contributions" ? "Hosted contributions" : "Session only"
    var statusLines = [
        "Mode: " + trainingMode.label,
        "Status: " + runtimeLabel,
        "Model: Temporary 26,440-Parameter Intent-Spatial AC",
        "Publishing: " + publishingLabel,
        "Goal " + progressCount.toLocaleString() + "/" + goalEpisodes.toLocaleString() + "  |  " + getAITrainingSpeedLabel(),
        "Backend: " + compactBackendLabel,
    ]
    statusLines.push("Candidate: " + (aiTrainingState.evaluationActive ? "frozen evaluation" : "learning") + "  |  Opponent: " + aiTrainingState.opponentPolicyKind)
    statusLines.push("Lab champion generation: " + aiLearning.championGeneration.toLocaleString())
    statusLines.push("Decision samples: " + aiLearning.totalDecisionSamples.toLocaleString())
    statusLines.push("Recovered stalls: " + aiTrainingState.trueSelfPlayStallRecoveries.toLocaleString())
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
    drawAIStatsMetricCell(trendX + trendWidth * 0.04, trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Wins", aiTrainingState.evaluationWins.toLocaleString(), "#7fe0a2")
    drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap), trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Losses", aiTrainingState.evaluationLosses.toLocaleString(), "#ff9f8f")
    drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 2, trendMetricY, trendMetricWidth, trendMetricHeight, "Eval Ties", aiTrainingState.evaluationTies.toLocaleString(), "#62c5ff")
    drawAIStatsMetricCell(trendX + trendWidth * 0.04 + (trendMetricWidth + trendMetricGap) * 3, trendMetricY, trendMetricWidth, trendMetricHeight, "Lab Champion", "v" + aiLearning.championGeneration, "#f7c76d")
    var trendChartY = trendMetricY + trendMetricHeight + 8
    var trendChartHeight = Math.max(0, middleY + middleHeight - 12 - trendChartY)
    drawAITrainingTrendChart(trendX + trendWidth * 0.04, trendChartY, trendWidth * 0.92, trendChartHeight)

    var topStrategyIndices = getAITrainingTopStrategyIndices(clamp(Math.floor((bottomHeight - 92) / 34), 2, 3), aiTrainingState.sessionStrategyPickCounts)
    var highlightedStrategyIndex = aiTrainingState.lastBestStrategyIndex
    var rowBaseY = bottomY + 48
    var rowHeight = 28
    var rowGap = 6
    var listX = contentX + strategyWidth * 0.05
    var listWidth = strategyWidth * 0.9
    if(topStrategyIndices.length == 0) {
        ctx.textAlign = "center"
        ctx.font = "12px Arial"
        ctx.fillStyle = "rgba(214, 226, 255, 0.78)"
        ctx.fillText("No session matches recorded yet.", contentX + strategyWidth / 2, rowBaseY + 24, strategyWidth * 0.8)
    }
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
        ctx.fillText("Picked " + pickCount + "  Match wins " + bestCount, listX + 44, strategyRowY + 24, listWidth * 0.72)
    }

    ctx.textAlign = "left"
    ctx.font = "12px Arial"
    ctx.fillStyle = "rgba(214, 226, 255, 0.88)"
    ctx.fillText("Last winner: " + (aiTrainingState.trueSelfPlayLastWinner || "None yet"), listX, bottomY + bottomHeight - 40, listWidth)
    ctx.fillText("Avg round: " + averageSelfPlayRound.toFixed(1), listX, bottomY + bottomHeight - 22, listWidth)

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
        var trainingSaveState = getAITrainingSaveButtonState()
        buttons.push({ id: "training-toggle", x: trainingStartX, y: trainingRow1Y, width: trainingButtonWidth, height: trainingButtonHeight, label: aiTrainingState.running ? "Stop Trainer" : "Start Trainer" })
        buttons.push({ id: "training-save", x: trainingStartX + (trainingButtonWidth + trainingGapX), y: trainingRow1Y, width: trainingButtonWidth, height: trainingButtonHeight, label: trainingSaveState.label })
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
        return getAITrainingSaveButtonState().disabled
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
        return AI_CROSS_MATCH_LEARNING_ENABLED && aiPersistenceState.loadInFlight || aiTrainingState.running == false && aiTrainingState.trueSelfPlayMatches >= getAITrainingGoalEpisodes()
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
            requestAITrainingControlSave()
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
