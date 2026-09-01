"use strict"

const assert = require("node:assert/strict")
const { assertRuntimeClean, closeRuntime, openRuntime, stepUntilMatches } = require("./distributed-ai/run-worker")

async function main() {
    const runtime = await openRuntime(253)
    try {
        const result = await runtime.page.evaluate(async () => {
            aiEnabled = true
            aiSide = PLAYER_SIDE.right
            humanSide = PLAYER_SIDE.left
            gameStarted = true
            gameOver = false
            gamePaused = false
            frontMenuState = "pregame"
            aiTrainingState.trueSelfPlayActive = false

            towers.length = 0
            players[aiSide].cursor.x = canvas.width / 2 + 60
            players[aiSide].cursor.y = 180
            aiProfile.currentAction = {
                type: "deselectTower",
                side: aiSide,
                targetX: canvas.width / 2 + 240,
                targetY: 360,
                priority: AI_ACTION_PRIORITY.low,
                attempts: 0,
            }
            const normalStart = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            runAICursor()
            const normalEnd = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            const normalDirectMode = isAITrainingDirectAIActionMode()

            aiTrainingState.trueSelfPlayActive = true
            players[aiSide].cursor.x = normalStart.x
            players[aiSide].cursor.y = normalStart.y
            aiProfile.currentAction = {
                type: "deselectTower",
                side: aiSide,
                targetX: canvas.width / 2 + 240,
                targetY: 360,
                priority: AI_ACTION_PRIORITY.low,
                attempts: 0,
            }
            runAICursor()
            const trainingEnd = { x: players[aiSide].cursor.x, y: players[aiSide].cursor.y }
            const trainingDirectMode = isAITrainingDirectAIActionMode()

            aiTrainingState.trueSelfPlayActive = false
            aiProfile.currentAction = {
                type: "upgradeTower",
                side: aiSide,
                towerID: -1,
                pathNumber: 1,
                targetX: players[aiSide].cursor.x,
                targetY: players[aiSide].cursor.y,
                priority: AI_ACTION_PRIORITY.normal,
                attempts: 0,
            }
            runAICursor()
            const staleActionRetried = aiProfile.currentAction != null && aiProfile.currentAction.attempts == 1
            runAICursor()
            const staleActionCleared = aiProfile.currentAction == null

            aiProfile.currentAction = null
            aiProfile.manualAimAction = null
            function createAimTower(towerType, towerID, x, y, path3Upgrades, targetPrio) {
                return {
                    playerSide: aiSide,
                    towerType,
                    towerID,
                    x,
                    y,
                    targetPrio,
                    targetX: 0,
                    targetY: 0,
                    target: -1,
                    path3Upgrades,
                    selected: false,
                    clicked(cursorX, cursorY) {
                        return Math.sqrt((this.x - cursorX) ** 2 + (this.y - cursorY) ** 2) <= 30
                    },
                    findTarget() {
                        this.target = -1
                    },
                }
            }
            const aimTowers = [
                createAimTower("dartling", 999991, canvas.width / 2 + 120, 240, 0, 0),
                createAimTower("mortar", 999992, canvas.width / 2 + 180, 300, 0, 0),
                createAimTower("mortar", 999993, canvas.width / 2 + 240, 240, 1, 4),
            ]
            towers.push(...aimTowers)
            players[aiSide].cursor.x = canvas.width / 2 + 60
            players[aiSide].cursor.y = 180
            const aimX = canvas.width / 2 + 300
            const aimY = 390
            bloons.length = 0
            const aimBloon = {
                playerSide: aiSide,
                isBoss: false,
                pathPos: 60,
                health: 1,
                x: aimX,
                y: aimY,
                speed: 1,
                bloonBoosted: 1,
            }
            bloons.push(aimBloon)
            for(let tick = 0; tick < 40 && !aiProfile.manualAimAction; tick++) {
                runAIAiming(aiSide)
                window.__distributedAI.advance(keyMsCooldown)
                advanceRuntimeClock()
            }
            const lockStartedThroughRunAiming = aiProfile.manualAimAction && aiProfile.manualAimAction.type == "lock"

            const selectedAt = {}
            const lockInputAt = {}
            const lockInputSelected = {}
            let changedBeforeCooldown = false
            for(let tick = 0; tick < 240 && aiProfile.manualAimAction; tick++) {
                const previousPriorities = aimTowers.map(tower => tower.targetPrio)
                advanceAIManualAimAction(aiSide)
                for(let index = 0; index < aimTowers.length; index++) {
                    const tower = aimTowers[index]
                    if(tower.selected && selectedAt[tower.towerID] == null) {
                        selectedAt[tower.towerID] = gameNow()
                        const selectedPriority = tower.targetPrio
                        advanceAIManualAimAction(aiSide)
                        changedBeforeCooldown ||= tower.targetPrio != selectedPriority
                    }
                    const transientPriority = getManualAimLockPriority(tower) - 1
                    if(tower.targetPrio == transientPriority && previousPriorities[index] != transientPriority) {
                        lockInputAt[tower.towerID] = gameNow()
                        lockInputSelected[tower.towerID] = tower.selected
                    }
                }
                updateManualAimTowerTargets()
                window.__distributedAI.advance(keyMsCooldown)
                advanceRuntimeClock()
            }
            const initialAimActionCompleted = aiProfile.manualAimAction == null
            const originalDecisionScorer = scoreAIDecisionCandidate
            scoreAIDecisionCandidate = function(side, familyIndex, metadata, matchup, stateFeatures, policyOverride) {
                const decision = originalDecisionScorer(side, familyIndex, metadata, matchup, stateFeatures, policyOverride)
                decision.score = metadata && metadata.id == "aim|follow" ? 2 : -2
                return decision
            }
            aimBloon.x = aimX + 14
            runAIAiming(aiSide)
            const neuralFollowStarted = !!aiProfile.manualAimAction && aiProfile.manualAimAction.type == "follow"
            scoreAIDecisionCandidate = originalDecisionScorer

            gameStarted = false
            aiEnabled = false
            aiTrainingState = createAITrainingState()
            frontMenuState = "mode"
            function dispatchCanvasPointer(button) {
                const rect = canvas.getBoundingClientRect()
                dispatchEvent(new PointerEvent("pointerdown", {
                    clientX: rect.left + (button.x + button.width / 2) * rect.width / canvas.width,
                    clientY: rect.top + (button.y + button.height / 2) * rect.height / canvas.height,
                }))
            }
            const modeButtonIds = getFrontMenuButtons().map(button => button.id)
            const labButton = getFrontMenuButtons().find(button => button.id == "ai-lab")
            dispatchCanvasPointer(labButton)
            const labOpenedByPointer = frontMenuState == "training"
            const trainingButtons = getFrontMenuButtons()
            const localSaveButton = trainingButtons.find(button => button.id == "training-save")
            const localSaveState = { label: localSaveButton.label, disabled: isFrontMenuButtonDisabled(localSaveButton) }
            const emptyTrainingStrategyCount = getAITrainingTopStrategyIndices(3, aiTrainingState.sessionStrategyPickCounts).length
            aiTrainingState.trueSelfPlayMatches = getAITrainingGoalEpisodes()
            const startButton = getFrontMenuButtons().find(button => button.id == "training-toggle")
            const goalCompleteStartDisabled = isFrontMenuButtonDisabled(startButton)
            aiTrainingState.evaluationGames = 4
            aiTrainingState.evaluationWins = 2
            aiTrainingState.evaluationLosses = 1
            aiTrainingState.evaluationTies = 1
            const liveEvaluation = getAITrainingEvaluationDisplay()
            aiTrainingState.evaluationGames = 0
            aiTrainingState.lastEvaluationScore = 0.58
            const lastEvaluation = getAITrainingEvaluationDisplay()

            closeAITrainingDashboard()
            frontMenuState = "stats"
            const statsButtonIds = getFrontMenuButtons().map(button => button.id)

            function createRefreshModel(totalGames, generation) {
                const model = normalizeAILearningData(createDefaultAILearning())
                model.strategyStats[0].games = totalGames
                model.strategyStats[0].wins = totalGames
                model.strategyStats[0].lastReward = 1
                model.totalGames = totalGames
                model.totalPolicySamples = totalGames
                model.championGeneration = generation
                model.candidateGeneration = generation
                return model
            }
            function createEnvelope(revision, epoch, model) {
                return {
                    ok: true,
                    revision,
                    contributionEpoch: epoch,
                    modelDigest: "sha256:test-" + revision,
                    updatedAt: "2026-08-29T00:00:00Z",
                    writeEnabled: false,
                    contributionEnabled: true,
                    contributionToken: "1.test",
                    model,
                }
            }

            const originalFetch = window.fetch
            const originalCrossMatchLearning = AI_CROSS_MATCH_LEARNING_ENABLED
            const originalLocalRuntime = AI_IS_LOCAL_RUNTIME
            function trainerCounts(total, queued, inProgress, succeeded, failed, cancelled, skipped) {
                return { total, queued, inProgress, succeeded, failed, cancelled, skipped }
            }
            const trainerStatus = {
                kind: "btdb-ai-training-status",
                formatVersion: 1,
                repository: "The-Double-G/btdb-js",
                branch: "main",
                publishedAt: "2026-08-29T19:30:00.000Z",
                current: {
                    runId: 33270691652,
                    runNumber: 7,
                    runAttempt: 1,
                    state: "in_progress",
                    conclusion: null,
                    headSha: "2f9820862963685e48d8516b2034b51391015c0d",
                    url: "https://github.com/The-Double-G/btdb-js/actions/runs/33270691652",
                    createdAt: "2026-08-29T19:22:05.000Z",
                    startedAt: "2026-08-29T19:22:09.000Z",
                    updatedAt: "2026-08-29T19:30:00.000Z",
                    phase: "training",
                    projection: {
                        jobs: { total: 21, queued: 0, inProgress: 20, completed: 1, succeeded: 1, failed: 0, cancelled: 0, skipped: 0 },
                        workers: {
                            training: trainerCounts(20, 0, 20, 0, 0, 0, 0),
                            evaluation: trainerCounts(20, 20, 0, 0, 0, 0, 0),
                        },
                    },
                },
                latestEvaluation: {
                    runId: 33200000000,
                    runNumber: 6,
                    runAttempt: 1,
                    aggregateId: "sha256:" + "1".repeat(64),
                    candidateCheckpointId: "sha256:" + "2".repeat(64),
                    baselineCheckpointId: "sha256:" + "3".repeat(64),
                    passed: true,
                    games: 320,
                    wins: 190,
                    losses: 118,
                    ties: 12,
                    score: 0.6125,
                    minimumScore: 0.58,
                    minimumGames: 160,
                    minimumBucketScore: 0.48,
                    worstBucketScore: 0.59,
                    survivalRate: 0.63125,
                    minimumSurvivalRate: 0.5,
                    severeCollapseRate: 0.1,
                    maximumSevereCollapseRate: 0.27,
                },
                latestPromotion: {
                    runId: 33200000000,
                    runNumber: 6,
                    runAttempt: 1,
                    snapshotId: "sha256:" + "4".repeat(64),
                    promotionId: "sha256:" + "2".repeat(64),
                    duplicate: false,
                    revision: 29,
                    modelDigest: "sha256:" + "5".repeat(64),
                    contributionEpoch: 2,
                    championGeneration: 5,
                    promotedPolicyDigest: "sha256:" + "6".repeat(64),
                    candidatePolicyPreserved: false,
                },
            }
            let trainerFetchRequest = null
            AI_IS_LOCAL_RUNTIME = false
            aiTrainerStatusState = { status: null, loadInFlight: false, lastLoadedAt: 0, lastError: "" }
            window.fetch = async (url, options) => {
                trainerFetchRequest = { url, options }
                return { ok: true, status: 200, text: async () => JSON.stringify(trainerStatus) }
            }
            const trainerStatusSucceeded = await refreshAITrainerStatus(true)
            const trainerMetrics = getAITrainerStatusMetrics().map(metric => ({ label: metric.label, value: metric.value }))
            const trainerStatusBeforeFailure = JSON.stringify(aiTrainerStatusState.status)
            const modelErrorBeforeTrainerFailure = aiPersistenceState.lastError
            window.fetch = async () => ({ ok: true, status: 200, text: async () => "{}" })
            const invalidTrainerStatusSucceeded = await refreshAITrainerStatus(true)
            const trainerFailureIsolation = {
                preserved: JSON.stringify(aiTrainerStatusState.status) == trainerStatusBeforeFailure,
                modelErrorUnchanged: aiPersistenceState.lastError == modelErrorBeforeTrainerFailure,
                hasOwnError: aiTrainerStatusState.lastError.length > 0,
            }
            let localTrainerFetches = 0
            AI_IS_LOCAL_RUNTIME = true
            window.fetch = async () => { localTrainerFetches++; throw new Error("Local trainer fetch should not run") }
            const localTrainerStatusSucceeded = await refreshAITrainerStatus(true)
            AI_IS_LOCAL_RUNTIME = originalLocalRuntime
            window.fetch = originalFetch
            AI_CROSS_MATCH_LEARNING_ENABLED = true
            localStorage.setItem("aiPendingContributionsV1", JSON.stringify([{ contributionId: "obsolete-schema-11" }]))
            getAIPublicContributionQueue()
            const legacyContributionQueueRemoved = localStorage.getItem("aiPendingContributionsV1") == null
            aiPersistenceState.loadInFlight = true
            const refreshingSaveState = getAITrainingSaveButtonState()
            const matchesBeforeRefreshControlProbe = aiTrainingState.trueSelfPlayMatches
            aiTrainingState.trueSelfPlayMatches = 0
            const refreshingStartDisabled = isFrontMenuButtonDisabled({ id: "training-toggle" })
            aiTrainingState.trueSelfPlayMatches = matchesBeforeRefreshControlProbe
            aiPersistenceState.loadInFlight = false
            aiLearning = createRefreshModel(1, 1)
            aiPersistenceState.revision = 3
            aiPersistenceState.contributionEpoch = 1
            let nextEnvelope = createEnvelope(4, 1, createRefreshModel(7, 4))
            window.fetch = async () => ({ ok: true, json: async () => nextEnvelope })
            const sameEpochRefreshSucceeded = await refreshAILearningFromBackend(true)
            const sameEpochRefresh = {
                games: aiLearning.totalGames,
                generation: aiLearning.championGeneration,
                revision: aiPersistenceState.revision,
            }
            nextEnvelope = createEnvelope(5, 2, createRefreshModel(9, 5))
            const resetEpochRefreshSucceeded = await requestAIPublicContributionToken()
            const resetEpochRefresh = {
                epoch: aiPersistenceState.contributionEpoch,
                games: aiLearning.totalGames,
                generation: aiLearning.championGeneration,
            }
            aiLearning = createRefreshModel(20, 20)
            aiPersistenceState.revision = 20
            aiPersistenceState.contributionEpoch = 2
            const olderEpochRefreshSucceeded = applyAILearningEnvelope(createEnvelope(21, 1, createRefreshModel(21, 21)), true)
            const olderEpochRefresh = {
                epoch: aiPersistenceState.contributionEpoch,
                generation: aiLearning.championGeneration,
                revision: aiPersistenceState.revision,
                succeeded: olderEpochRefreshSucceeded,
            }

            let resolveStaleRefresh
            let raceFetchCount = 0
            aiLearning = createRefreshModel(10, 10)
            aiPersistenceState.revision = 10
            aiPersistenceState.contributionEpoch = 2
            window.fetch = () => {
                raceFetchCount++
                const envelope = raceFetchCount == 1 ? createEnvelope(10, 2, createRefreshModel(10, 10)) : createEnvelope(12, 2, createRefreshModel(12, 12))
                if(raceFetchCount == 1) {
                    return new Promise(resolve => { resolveStaleRefresh = () => resolve({ ok: true, json: async () => envelope }) })
                }
                return Promise.resolve({ ok: true, json: async () => envelope })
            }
            const staleRefreshPromise = refreshAILearningFromBackend(true)
            aiLearning = createRefreshModel(11, 11)
            aiPersistenceState.revision = 11
            const queuedRefreshPromise = refreshAILearningFromBackend(true)
            resolveStaleRefresh()
            const raceRefreshResults = await Promise.all([staleRefreshPromise, queuedRefreshPromise])
            const monotonicRefresh = {
                fetches: raceFetchCount,
                games: aiLearning.totalGames,
                generation: aiLearning.championGeneration,
                results: raceRefreshResults,
                revision: aiPersistenceState.revision,
            }

            setAIPublicContributionQueue([{ contributionId: "retry-probe", contributionEpoch: 2 }])
            aiPersistenceState.contributionEnabled = true
            aiPersistenceState.contributionToken = ""
            aiPersistenceState.contributionRetryAt = 0
            let failedRefreshFetches = 0
            window.fetch = async () => {
                failedRefreshFetches++
                throw new Error("probe refresh outage")
            }
            flushAIPublicContributionQueue()
            await waitForAILearningRefreshIdle()
            const refreshFailureBackoff = {
                fetches: failedRefreshFetches,
                retryScheduled: aiPersistenceState.contributionRetryAt > realNow(),
            }
            const retryAtBeforeSuccessfulRefresh = aiPersistenceState.contributionRetryAt
            const refreshDuringBackoffSucceeded = applyAILearningEnvelope(createEnvelope(12, 2, createRefreshModel(12, 12)), true)
            const successfulRefreshPreservedBackoff = refreshDuringBackoffSucceeded && aiPersistenceState.contributionRetryAt == retryAtBeforeSuccessfulRefresh
            setAIPublicContributionQueue([])
            aiPersistenceState.contributionEnabled = false

            setAIPublicContributionQueue([
                { contributionId: "stale-metadata-1", contributionEpoch: 2 },
                { contributionId: "stale-metadata-2", contributionEpoch: 2 },
            ])
            aiPersistenceState.contributionEnabled = true
            aiPersistenceState.contributionToken = "2.test"
            aiPersistenceState.contributionRetryAt = 0
            aiPersistenceState.revision = 12
            aiPersistenceState.contributionEpoch = 2
            aiPersistenceState.modelDigest = "sha256:revision-12"
            window.fetch = async () => ({
                ok: true,
                json: async () => ({ ok: true, revision: 11, contributionEpoch: 1, modelDigest: "sha256:stale-11" }),
            })
            flushAIPublicContributionQueue()
            for(let settleIndex = 0; settleIndex < 20 && aiPersistenceState.contributionInFlight; settleIndex++) {
                await Promise.resolve()
            }
            const staleContributionMetadata = {
                digest: aiPersistenceState.modelDigest,
                epoch: aiPersistenceState.contributionEpoch,
                revision: aiPersistenceState.revision,
            }
            setAIPublicContributionQueue([])

            aiContextsBySide = {
                [PLAYER_SIDE.right]: { aiMatchTelemetry: { contributionId: "context-probe", contributionStatus: "queued" } },
            }
            aiMatchTelemetry = { contributionId: "different-probe", contributionStatus: "queued" }
            markAIPublicContributionStatus("context-probe", "accepted")
            const contextContributionStatus = aiContextsBySide[PLAYER_SIDE.right].aiMatchTelemetry.contributionStatus
            aiEnabled = true
            selectedMenuMode = "training-self-play"
            aiTrainingState.trueSelfPlayActive = true
            aiTrainingState.candidateSide = PLAYER_SIDE.right
            const candidateContributionStatus = getCompletedMatchAIContributionStatus()
            aiTrainingState.trueSelfPlayActive = false
            aiEnabled = false
            selectedMenuMode = ""

            aiTrainingState.persistenceMode = "session"
            aiPersistenceState.contributionEnabled = true
            aiMatchTelemetry = {
                aiLoadoutKey: "",
                contributionEpoch: 2,
                observedLoadoutSummary: null,
                selectionFeatures: Array(AI_FEATURE_KEYS.length).fill(0.5),
                strategyIndex: 0,
                tacticalTrace: [],
            }
            const recoveredSessionContribution = createAIPublicMatchContribution(150, 0, 1, [], true)
            setAIPublicContributionQueue([{ contributionId: "session-sync", contributionEpoch: 2 }])
            const recoveredSessionQueuedSaveState = getAITrainingSaveButtonState()
            const originalSessionFlush = flushAIPublicContributionQueue
            let recoveredSessionFlushes = 0
            flushAIPublicContributionQueue = () => { recoveredSessionFlushes++; return true }
            const recoveredSessionSyncStarted = requestAITrainingControlSave()
            flushAIPublicContributionQueue = originalSessionFlush
            setAIPublicContributionQueue([])
            const recoveredSessionSaveState = getAITrainingSaveButtonState()
            const recoveredSessionSaveStarted = requestAITrainingSave(true)
            aiTrainingState.persistenceMode = ""

            nextEnvelope = createEnvelope(13, 2, createRefreshModel(13, 13))
            window.fetch = async () => ({ ok: true, json: async () => nextEnvelope })
            aiPersistenceState.contributionEnabled = true
            openAITrainingDashboard()
            aiLearning.championGeneration = 99
            aiLearning.candidateGeneration = 99
            const hostedRefreshDuringSession = await refreshAILearningFromBackend(true)
            const sessionGenerationAfterHostedRefresh = aiLearning.championGeneration
            closeAITrainingDashboard()
            const communityGenerationAfterSessionClose = aiLearning.championGeneration
            openAITrainingDashboard()
            const restoredSessionGeneration = aiLearning.championGeneration
            closeAITrainingDashboard()

            sessionStorage.setItem("aiTrainerKey", "test-trainer-key")
            aiPersistenceState.writeEnabled = true
            aiPersistenceState.contributionEnabled = true
            setAIPublicContributionQueue([{ contributionId: "snapshot-priority", contributionEpoch: 2 }])
            const pendingContributionSaveState = getAITrainingSaveButtonState()
            const originalFlushContributions = flushAIPublicContributionQueue
            let pendingContributionFlushes = 0
            flushAIPublicContributionQueue = () => { pendingContributionFlushes++; return true }
            const pendingContributionSyncStarted = requestAITrainingControlSave()
            flushAIPublicContributionQueue = originalFlushContributions
            setAIPublicContributionQueue([])
            openAITrainingDashboard()
            const authenticatedSaveState = getAITrainingSaveButtonState()
            aiMatchTelemetry = {
                aiLoadoutKey: "",
                contributionEpoch: 2,
                observedLoadoutSummary: null,
                selectionFeatures: Array(AI_FEATURE_KEYS.length).fill(0.5),
                strategyIndex: 0,
                tacticalTrace: [],
            }
            const credentialedLabContribution = createAIPublicMatchContribution(150, 0, 1, [], true)
            aiLearning.championGeneration = 22
            aiLearning.candidateGeneration = 22
            let credentialedLabFetches = 0
            window.fetch = async () => { credentialedLabFetches++; throw new Error("Lab attempted a full-model request") }
            const credentialedLabSyncStarted = requestAITrainingSave(true)
            const credentialedLabControlStarted = requestAITrainingControlSave()
            closeAITrainingDashboard()
            const credentialedLabPersistence = {
                controlStarted: credentialedLabControlStarted,
                fetches: credentialedLabFetches,
                hostedGeneration: aiLearning.championGeneration,
                syncStarted: credentialedLabSyncStarted,
            }
            sessionStorage.removeItem("aiTrainerKey")
            aiPersistenceState.writeEnabled = false
            aiPersistenceState.contributionEnabled = true

            function createSchema8Policy() {
                return {
                    hiddenSize1: 12,
                    hiddenSize2: 8,
                    learningRate: 0.07,
                    W1: Array.from({ length: 12 }, (_, row) => Array.from({ length: AI_FEATURE_KEYS.length }, (_, col) => ((row * 17 + col) % 19 - 9) / 80)),
                    b1: Array.from({ length: 12 }, (_, index) => (index - 5) / 100),
                    W2: Array.from({ length: 8 }, (_, row) => Array.from({ length: 12 }, (_, col) => ((row * 12 + col) % 17 - 8) / 70)),
                    b2: Array.from({ length: 8 }, (_, index) => (index - 3) / 90),
                    W3: Array.from({ length: AI_STRATEGY_LIBRARY.length }, (_, row) => Array.from({ length: 8 }, (_, col) => ((row * 8 + col) % 23 - 11) / 85)),
                    b3: Array.from({ length: AI_STRATEGY_LIBRARY.length }, (_, index) => (index % 11 - 5) / 30),
                }
            }
            function schema8Forward(policy, inputs) {
                const hidden1 = policy.W1.map((weights, row) => Math.tanh(policy.b1[row] + weights.reduce((sum, weight, col) => sum + weight * inputs[col], 0)))
                const hidden2 = policy.W2.map((weights, row) => Math.tanh(policy.b2[row] + weights.reduce((sum, weight, col) => sum + weight * hidden1[col], 0)))
                return policy.W3.map((weights, row) => policy.b3[row] + weights.reduce((sum, weight, col) => sum + weight * hidden2[col], 0))
            }
            const schema8Policy = createSchema8Policy()
            const migrationFeatures = Array.from({ length: AI_FEATURE_KEYS.length }, (_, index) => (index + 1) / AI_FEATURE_KEYS.length)
            const expectedSchema8Outputs = schema8Forward(schema8Policy, migrationFeatures)
            const migratedPolicy = migrateAIPolicy(schema8Policy)
            const repeatedMigratedPolicy = migrateAIPolicy(schema8Policy)
            const migratedOutputs = aiPolicyForward(migrationFeatures, migratedPolicy).outputs
            const migrationMaxOutputDelta = Math.max(...migratedOutputs.map((value, index) => Math.abs(value - expectedSchema8Outputs[index])))

            const schema8Model = createDefaultAILearning()
            schema8Model.version = 8
            schema8Model.modelFamily = "bounded-contextual-bandit-v1"
            schema8Model.policy = schema8Policy
            schema8Model.championPolicy = JSON.parse(JSON.stringify(schema8Policy))
            schema8Model.populationPolicies = Array.from({ length: 3 }, () => JSON.parse(JSON.stringify(schema8Policy)))
            schema8Model.totalGames = 77
            schema8Model.totalSyntheticEpisodes = 11
            schema8Model.totalPolicySamples = 99
            schema8Model.totalLoadoutSamples = 42
            schema8Model.totalTacticalSamples = 13
            schema8Model.totalHumanDemonstrations = 9
            schema8Model.candidateGeneration = 6
            schema8Model.championGeneration = 5
            schema8Model.tacticalStats = { retained: { samples: 2, mean: 0.25 } }
            schema8Model.placementStats = { retained: { samples: 3, mean: 0.5 } }
            const migratedModel = normalizeAILearningData(schema8Model)
            const policyContract = {
                version: migratedModel.version,
                modelFamily: migratedModel.modelFamily,
                formatVersion: migratedModel.policy.formatVersion,
                policyKeys: Object.keys(migratedModel.policy),
                strategyKeys: Object.keys(migratedModel.policy.strategy),
                decisionKeys: Object.keys(migratedModel.policy.decision),
                familyIndices: Object.keys(AI_DECISION_FAMILY).map(key => AI_DECISION_FAMILY[key]),
                strategyDimensions: [
                    migratedModel.policy.strategy.W1.length,
                    migratedModel.policy.strategy.W1[0].length,
                    migratedModel.policy.strategy.W2.length,
                    migratedModel.policy.strategy.W2[0].length,
                    migratedModel.policy.strategy.W3.length,
                    migratedModel.policy.strategy.W3[0].length,
                ],
                decisionDimensions: [
                    migratedModel.policy.decision.WState1.length,
                    migratedModel.policy.decision.WState1[0].length,
                    migratedModel.policy.decision.WState2.length,
                    migratedModel.policy.decision.WState2[0].length,
                    migratedModel.policy.decision.WCandidate1.length,
                    migratedModel.policy.decision.WCandidate1[0].length,
                    migratedModel.policy.decision.WCandidate2.length,
                    migratedModel.policy.decision.WCandidate2[0].length,
                    migratedModel.policy.decision.WStateToMemory.length,
                    migratedModel.policy.decision.WStateToMemory[0].length,
                    migratedModel.policy.decision.WMemoryToMemory.length,
                    migratedModel.policy.decision.WMemoryToMemory[0].length,
                    migratedModel.policy.decision.WMemoryToState.length,
                    migratedModel.policy.decision.WMemoryToState[0].length,
                    migratedModel.policy.decision.WSurvival.length,
                    migratedModel.policy.decision.WSurvival[0].length,
                    migratedModel.policy.decision.familyBias.length,
                ],
                parameterCount: getAIPolicyParameterCount(migratedModel.policy),
                valid: isValidAIPolicy(migratedModel.policy),
            }
            const migrationRetention = {
                totalGames: migratedModel.totalGames,
                totalSyntheticEpisodes: migratedModel.totalSyntheticEpisodes,
                totalPolicySamples: migratedModel.totalPolicySamples,
                totalLoadoutSamples: migratedModel.totalLoadoutSamples,
                totalTacticalSamples: migratedModel.totalTacticalSamples,
                totalDecisionSamples: migratedModel.totalDecisionSamples,
                totalHumanDemonstrations: migratedModel.totalHumanDemonstrations,
                candidateGeneration: migratedModel.candidateGeneration,
                championGeneration: migratedModel.championGeneration,
                tacticalStoreRetained: !!migratedModel.tacticalStats.retained,
                placementStoreRetained: !!migratedModel.placementStats.retained,
                populationSize: migratedModel.populationPolicies.length,
            }

            const schema11Policy = cloneAIPolicy(migratedModel.policy)
            schema11Policy.decision.stateInputSize = 72
            schema11Policy.decision.candidateInputSize = 64
            schema11Policy.decision.WState1 = schema11Policy.decision.WState1.map(row => row.slice(0, 72))
            schema11Policy.decision.WCandidate1 = schema11Policy.decision.WCandidate1.map(row => row.slice(0, 64))
            schema11Policy.decision.WState1[0][0] = 0.123
            schema11Policy.decision.WCandidate1[0][0] = -0.456
            schema11Policy.decision.WStateToMemory[0][0] = -0.234
            schema11Policy.decision.WValue[0] = 0.345
            schema11Policy.decision.familyBias[AI_DECISION_FAMILY.upgrade] = 0.25
            schema11Policy.decision.trainingSamples[AI_DECISION_FAMILY.upgrade] = 7
            const schema12Policy = migrateAIPolicy(schema11Policy)
            const repeatedSchema12Policy = migrateAIPolicy(schema11Policy)
            const schema11State = Array.from({ length: 72 }, (_, index) => (index % 9 - 4) / 4)
            const schema11Candidate = Array.from({ length: 64 }, (_, index) => (index % 7 - 3) / 3)
            const schema12State = schema11State.concat(Array(8).fill(0.75))
            const schema12Candidate = schema11Candidate.concat(Array(16).fill(-0.75))
            const oldStateEmbedding = aiDecisionEncode(schema11State, schema11Policy.decision.WState1, schema11Policy.decision.bState1, schema11Policy.decision.WState2, schema11Policy.decision.bState2).embedding
            const newStateEmbedding = aiDecisionEncode(schema12State, schema12Policy.decision.WState1, schema12Policy.decision.bState1, schema12Policy.decision.WState2, schema12Policy.decision.bState2).embedding
            const oldCandidateEmbedding = aiDecisionEncode(schema11Candidate, schema11Policy.decision.WCandidate1, schema11Policy.decision.bCandidate1, schema11Policy.decision.WCandidate2, schema11Policy.decision.bCandidate2).embedding
            const newCandidateEmbedding = aiDecisionEncode(schema12Candidate, schema12Policy.decision.WCandidate1, schema12Policy.decision.bCandidate1, schema12Policy.decision.WCandidate2, schema12Policy.decision.bCandidate2).embedding
            const schema11Model = JSON.parse(JSON.stringify(migratedModel))
            schema11Model.version = 11
            schema11Model.modelFamily = "semantic-recurrent-actor-critic-v3"
            schema11Model.policy = schema11Policy
            schema11Model.championPolicy = cloneAIPolicy(schema11Policy)
            schema11Model.populationPolicies = [cloneAIPolicy(schema11Policy)]
            schema11Model.totalDecisionSamples = 321
            schema11Model.placementStats = { stale: { samples: 2, mean: 0.5 } }
            schema11Model.loadoutPlacementStats = { stale: { samples: 2, mean: 0.5 } }
            schema11Model.tacticalFamilyStats["human|placement|place|dart"] = { samples: 5, score: 1, mean: 1, m2: 0 }
            const normalizedSchema11Model = normalizeAILearningData(schema11Model)
            const schema11Migration = {
                valid: isValidAIPolicy(schema12Policy),
                deterministic: JSON.stringify(schema12Policy) == JSON.stringify(repeatedSchema12Policy),
                strategyPreserved: JSON.stringify(schema12Policy.strategy) == JSON.stringify(schema11Policy.strategy),
                statePrefixPreserved: schema12Policy.decision.WState1.every((row, index) => JSON.stringify(row.slice(0, 72)) == JSON.stringify(schema11Policy.decision.WState1[index])),
                candidatePrefixPreserved: schema12Policy.decision.WCandidate1.every((row, index) => JSON.stringify(row.slice(0, 64)) == JSON.stringify(schema11Policy.decision.WCandidate1[index])),
                newColumnsZero: schema12Policy.decision.WState1.every(row => row.slice(72).every(value => value == 0)) && schema12Policy.decision.WCandidate1.every(row => row.slice(64).every(value => value == 0)),
                outputPreserved: oldStateEmbedding.every((value, index) => Math.abs(value - newStateEmbedding[index]) < 1e-12) && oldCandidateEmbedding.every((value, index) => Math.abs(value - newCandidateEmbedding[index]) < 1e-12),
                recurrentValueSurvivalPreserved: JSON.stringify(schema12Policy.decision.WStateToMemory) == JSON.stringify(schema11Policy.decision.WStateToMemory) && JSON.stringify(schema12Policy.decision.WValue) == JSON.stringify(schema11Policy.decision.WValue) && JSON.stringify(schema12Policy.decision.WSurvival) == JSON.stringify(schema11Policy.decision.WSurvival),
                familyTrainingPreserved: JSON.stringify(schema12Policy.decision.trainingSamples) == JSON.stringify(schema11Policy.decision.trainingSamples) && JSON.stringify(schema12Policy.decision.familyBias) == JSON.stringify(schema11Policy.decision.familyBias),
                totalDecisionSamplesPreserved: normalizedSchema11Model.totalDecisionSamples == 321,
                spatialStoresReset: Object.keys(normalizedSchema11Model.placementStats).length == 0 && Object.keys(normalizedSchema11Model.loadoutPlacementStats).length == 0,
                reservedHumanPriorsReset: Object.keys(normalizedSchema11Model.tacticalFamilyStats).every(key => key.indexOf("human|") != 0),
            }

            const schema10Policy = cloneAIPolicy(schema11Policy)
            schema10Policy.decision.candidateInputSize = 40
            schema10Policy.decision.WCandidate1 = schema10Policy.decision.WCandidate1.map(row => row.slice(0, 40))
            schema10Policy.decision.WCandidate2[0][0] = 0.567
            const schema12From10Policy = migrateAIPolicy(schema10Policy)
            const repeatedSchema12From10Policy = migrateAIPolicy(schema10Policy)
            const defaultDecision = createDefaultAIDecisionPolicy()
            const schema10Migration = {
                valid: isValidAIPolicy(schema12From10Policy),
                deterministic: JSON.stringify(schema12From10Policy) == JSON.stringify(repeatedSchema12From10Policy),
                strategyPreserved: JSON.stringify(schema12From10Policy.strategy) == JSON.stringify(schema10Policy.strategy),
                statePreserved: schema12From10Policy.decision.WState1.every((row, index) => JSON.stringify(row.slice(0, 72)) == JSON.stringify(schema10Policy.decision.WState1[index]) && row.slice(72).every(value => value == 0)),
                recurrentPreserved: JSON.stringify(schema12From10Policy.decision.WStateToMemory) == JSON.stringify(schema10Policy.decision.WStateToMemory),
                valuePreserved: JSON.stringify(schema12From10Policy.decision.WValue) == JSON.stringify(schema10Policy.decision.WValue),
                candidateReset: JSON.stringify(schema12From10Policy.decision.WCandidate1) == JSON.stringify(defaultDecision.WCandidate1) && JSON.stringify(schema12From10Policy.decision.WCandidate2) == JSON.stringify(defaultDecision.WCandidate2),
                familyTrainingReset: schema12From10Policy.decision.trainingSamples.every(value => value == 0) && schema12From10Policy.decision.familyBias.every((value, index) => value == defaultDecision.familyBias[index]),
            }

            const decisionPolicy = cloneAIPolicy(migratedModel.policy)
            const decisionState = Array.from({ length: AI_DECISION_STATE_INPUT_SIZE }, (_, index) => (index % 9 - 4) / 4)
            const decisionCandidate = Array.from({ length: AI_DECISION_CANDIDATE_INPUT_SIZE }, (_, index) => (index % 7 - 3) / 3)
            const rejectedCandidate = Array.from({ length: AI_DECISION_CANDIDATE_INPUT_SIZE }, (_, index) => (3 - index % 7) / 3)
            const decisionMemory = Array.from({ length: AI_DECISION_MEMORY_SIZE }, (_, index) => (index % 5 - 2) / 4)
            const decisionBeforeForward = aiDecisionForward(decisionState, decisionCandidate, AI_DECISION_FAMILY.upgrade, decisionMemory, decisionPolicy)
            const rejectedBeforeForward = aiDecisionForward(decisionState, rejectedCandidate, AI_DECISION_FAMILY.upgrade, decisionMemory, decisionPolicy)
            const decisionBefore = decisionBeforeForward.actorLogit - rejectedBeforeForward.actorLogit
            const decisionTarget = 0.8
            let decisionTrainSucceeded = true
            for(let trainIndex = 0; trainIndex < 12; trainIndex++) {
                decisionTrainSucceeded = trainAIDecision({
                    familyIndex: AI_DECISION_FAMILY.upgrade,
                    stateFeatures: decisionState,
                    chosenCandidateFeatures: decisionCandidate,
                    rejectedCandidateFeatures: rejectedCandidate,
                    memoryIn: decisionMemory,
                    localReward: decisionTarget,
                    age: 0,
                }, decisionTarget, 3, decisionPolicy) && decisionTrainSucceeded
            }
            const decisionAfterForward = aiDecisionForward(decisionState, decisionCandidate, AI_DECISION_FAMILY.upgrade, decisionMemory, decisionPolicy)
            const rejectedAfterForward = aiDecisionForward(decisionState, rejectedCandidate, AI_DECISION_FAMILY.upgrade, decisionMemory, decisionPolicy)
            const decisionAfter = decisionAfterForward.actorLogit - rejectedAfterForward.actorLogit
            const decisionTraining = {
                before: decisionBefore,
                after: decisionAfter,
                familySamples: decisionPolicy.decision.trainingSamples[AI_DECISION_FAMILY.upgrade],
                target: decisionTarget,
                succeeded: decisionTrainSucceeded,
                valid: isValidAIPolicy(decisionPolicy),
                valueChanged: decisionAfterForward.value != decisionBeforeForward.value,
                survivalChanged: decisionPolicy.decision.bSurvival.some(value => value != 0),
            }
            const rejectedVariantA = cloneAIPolicy(migratedModel.policy)
            const rejectedVariantB = cloneAIPolicy(migratedModel.policy)
            trainAIDecision({ familyIndex: AI_DECISION_FAMILY.upgrade, stateFeatures: decisionState, chosenCandidateFeatures: decisionCandidate, rejectedCandidateFeatures: rejectedCandidate, memoryIn: decisionMemory }, decisionTarget, 3, rejectedVariantA)
            trainAIDecision({ familyIndex: AI_DECISION_FAMILY.upgrade, stateFeatures: decisionState, chosenCandidateFeatures: decisionCandidate, rejectedCandidateFeatures: rejectedCandidate.map(value => -value), memoryIn: decisionMemory }, decisionTarget, 3, rejectedVariantB)
            decisionTraining.rejectedCandidateIgnored = JSON.stringify(rejectedVariantA) == JSON.stringify(rejectedVariantB)

            const originalDecisionEncode = aiDecisionEncode
            let decisionEncodeCalls = 0
            aiDecisionStateCache = null
            aiDecisionEncode = function() {
                decisionEncodeCalls++
                return originalDecisionEncode.apply(this, arguments)
            }
            for(let candidateIndex = 0; candidateIndex < 3; candidateIndex++) {
                scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.upgrade, { id: `cache-${candidateIndex}` }, null, decisionState, decisionPolicy)
            }
            aiDecisionEncode = originalDecisionEncode
            aiDecisionStateCache = null

            const factualFeaturesBefore = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.upgrade, null).slice(48, 72)
            towers.reverse()
            bloons.reverse()
            const factualFeaturesAfter = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.upgrade, null).slice(48, 72)
            towers.reverse()
            bloons.reverse()
            const relationshipFeaturesLowHeuristic = buildAIDecisionCandidateFeatures(aiSide, AI_DECISION_FAMILY.upgrade, { id: "factual-relation", type: "wizard", x: 100, y: 200, cost: 300, money: 1000, heuristic: -100 }).slice(32)
            const relationshipFeaturesHighHeuristic = buildAIDecisionCandidateFeatures(aiSide, AI_DECISION_FAMILY.upgrade, { id: "factual-relation", type: "wizard", x: 100, y: 200, cost: 300, money: 1000, heuristic: 100 }).slice(32)
            const candidateFeatureContracts = Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => {
                const metadata = {
                    id: `candidate-${familyIndex}-a`,
                    type: "wizard",
                    cost: 300,
                    money: 1000,
                    x: 100,
                    y: 200,
                    capabilityFacts: { directDamage: 3, range: 250 },
                    manualFollow: true,
                    manualLock: true,
                }
                const action = buildAIDecisionCandidateFeatures(aiSide, familyIndex, metadata)
                const renamed = buildAIDecisionCandidateFeatures(aiSide, familyIndex, { ...metadata, id: `candidate-${familyIndex}-b` })
                const noop = buildAIDecisionCandidateFeatures(aiSide, familyIndex, { ...metadata, noop: true })
                return {
                    bounded: [action, noop].every(vector => vector.length == 80 && vector.every(value => Number.isFinite(value) && value >= -1 && value <= 1)),
                    familyOneHot: action.slice(0, AI_DECISION_FAMILY_COUNT).every((value, index) => value == (index == familyIndex ? 1 : 0)),
                    stableIdIndependent: action.every((value, index) => value == renamed[index]),
                    noopMarked: action[21] == 0 && noop[21] == 1,
                    manualCapabilities: action[62] == 1 && action[63] == 1,
                }
            })
            const previousStrategy = aiCurrentStrategy
            const intentStrategy = { rushRound: 20, rushMoney: 4000, ecoFloor: 2500, rushBias: 0.575, placementProfile: "aggressive" }
            aiCurrentStrategy = intentStrategy
            const stateIntent = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.rush, null).slice(72)
            const candidateIntent = buildAIDecisionCandidateFeatures(aiSide, AI_DECISION_FAMILY.strategy, { strategyIntent: intentStrategy }).slice(64, 72)
            aiCurrentStrategy = previousStrategy
            const leftBounds = getSideBounds(PLAYER_SIDE.left, 0)
            const rightBounds = getSideBounds(PLAYER_SIDE.right, 0)
            const leftX = leftBounds.minX + (leftBounds.maxX - leftBounds.minX) * 0.25
            const rightX = rightBounds.maxX - (rightBounds.maxX - rightBounds.minX) * 0.25
            const placementFeatures = buildAIDecisionCandidateFeatures(PLAYER_SIDE.left, AI_DECISION_FAMILY.placement, { x: leftX, y: canvas.height * 0.5, range: 200, placementGeometry: true })
            const manualAimFeatures = buildAIDecisionCandidateFeatures(PLAYER_SIDE.left, AI_DECISION_FAMILY.placement, { x: leftX, y: canvas.height * 0.5, manualLock: true })
            const placementFeatureContract = {
                stateIntent,
                candidateIntent,
                mirroredPerspectiveX: getAIPerspectivePlacementX(PLAYER_SIDE.left, leftX) == getAIPerspectivePlacementX(PLAYER_SIDE.right, rightX),
                mirroredBucket: getAIPlacementBucket(PLAYER_SIDE.left, leftX, canvas.height * 0.5).x == getAIPlacementBucket(PLAYER_SIDE.right, rightX, canvas.height * 0.5).x,
                geometryPresent: placementFeatures.slice(72).some(value => value != 0),
                placementIntentEmpty: placementFeatures.slice(64, 72).every(value => value == 0),
                manualAimGeometryEmpty: manualAimFeatures.slice(72).every(value => value == 0),
                strategyGeometryEmpty: buildAIDecisionCandidateFeatures(aiSide, AI_DECISION_FAMILY.strategy, { strategyIntent: intentStrategy }).slice(72).every(value => value == 0),
            }

            const savedFarmerProbe = {
                action: aiProfile.currentAction,
                bananas: bananas.slice(),
                gameStarted,
                money: players[aiSide].money,
                round,
                towers: towers.slice(),
            }
            let farmerPriceContract
            try {
                towers.length = 0
                bananas.length = 0
                gameStarted = false
                players[aiSide].money = 0
                round = 2
                aiProfile.currentAction = null
                const rejectedWithoutFarm = getLearnedFarmerPlacementOption(aiSide, null) == null
                const farmSpot = findAISpot(aiSide, 45, 200, "farm", 0, "farm")
                const directPlacementRejectedWithoutFarm = aiPlaceFarmer(aiSide, farmSpot.x, farmSpot.y) == null
                const farm = new Tower(farmSpot.x, farmSpot.y, 45, 200, "farm", aiSide)
                farm.aiPlacedAt = gameNow()
                farm.aiPlacedRound = getCurrentVisibleRound()
                towers.push(farm)
                const option = getLearnedFarmerPlacementOption(aiSide, null)
                const requested = requestAIDefenseOption(aiSide, option, AI_ACTION_PRIORITY.normal)
                const scoredTargetPreserved = requested && aiProfile.currentAction.targetX == option.targetX && aiProfile.currentAction.targetY == option.targetY
                aiProfile.currentAction = null
                const moneyBefore = players[aiSide].money
                const farmer = aiPlaceFarmer(aiSide, option.targetX, option.targetY)
                const directSameRoundSaleBlocked = aiTrySellTower(aiSide, farmer) == false
                const requestedSameRoundSaleBlocked = aiRequestSellTower(aiSide, farmer, AI_ACTION_PRIORITY.normal) == false
                const sameRoundSaleBlocked = getBestAIEconomyUtilityOption(aiSide, null) == null
                const redundantFarmerPlacementBlocked = getLearnedFarmerPlacementOption(aiSide, null) == null
                round++
                const nextRoundUtility = getBestAIEconomyUtilityOption(aiSide, null)
                const nextRoundFarmerSaleExcluded = !nextRoundUtility || nextRoundUtility.tower != farmer
                aiProfile.currentAction = { type: "placeFarmer" }
                const freeActionDoesNotPauseEco = isAIPaidActionPending() == false
                aiProfile.currentAction = null
                farmerPriceContract = {
                    basePrice: getBaseTowerPriceByType("farmer"),
                    candidateFinite: option.decisionSample.candidateFeatures.every(Number.isFinite),
                    freeActionDoesNotPauseEco,
                    moneyUnchanged: players[aiSide].money == moneyBefore,
                    placed: !!farmer,
                    rejectedWithoutFarm,
                    directPlacementRejectedWithoutFarm,
                    sameRoundSaleBlocked,
                    directSameRoundSaleBlocked,
                    requestedSameRoundSaleBlocked,
                    redundantFarmerPlacementBlocked,
                    nextRoundFarmerSaleExcluded,
                    scoredTargetPreserved,
                    sellValue: getAITowerSellValueEstimate(farmer),
                    totalCost: farmer && farmer.totalCost,
                    upgradeable: farmer && canTowerUpgradePathNow(aiSide, farmer, 1),
                }
            } finally {
                towers.splice(0, towers.length, ...savedFarmerProbe.towers)
                bananas.splice(0, bananas.length, ...savedFarmerProbe.bananas)
                gameStarted = savedFarmerProbe.gameStarted
                players[aiSide].money = savedFarmerProbe.money
                round = savedFarmerProbe.round
                aiProfile.currentAction = savedFarmerProbe.action
                aiDecisionStateCache = null
            }

            ensureAILoadoutLibraryInitialized()
            const originalLoadoutLibrary = aiLoadoutLibrary
            const originalLoadoutsByKey = aiLoadoutsByKey
            const originalLoadoutCounterStats = aiLearning.loadoutCounterStats
            const originalLoadoutScorer = scoreAIDecisionCandidate
            let loadoutCounterSelection
            try {
                const counterCandidates = originalLoadoutLibrary.slice(0, 2)
                const observedLoadoutSummary = originalLoadoutLibrary[2].summary
                aiLoadoutLibrary = counterCandidates
                aiLoadoutsByKey = Object.fromEntries(counterCandidates.map(loadout => [loadout.key, loadout]))
                aiLearning.loadoutCounterStats = {}
                scoreAIDecisionCandidate = (side, familyIndex, metadata) => ({
                    id: metadata.id,
                    familyIndex,
                    neuralScore: metadata.id == counterCandidates[0].key ? 0.2 : 0.1,
                    score: metadata.id == counterCandidates[0].key ? 0.2 : 0.1,
                })
                const baselineLoadout = chooseAILoadoutForMatch(observedLoadoutSummary, null)
                aiLearning.loadoutCounterStats[getAILoadoutSelectionStatKey(observedLoadoutSummary.signature, counterCandidates[0].key)] = { samples: 64, score: -1, mean: -1, m2: 0 }
                aiLearning.loadoutCounterStats[getAILoadoutSelectionStatKey(observedLoadoutSummary.signature, counterCandidates[1].key)] = { samples: 64, score: 1, mean: 1, m2: 0 }
                const learnedLoadout = chooseAILoadoutForMatch(observedLoadoutSummary, null)
                loadoutCounterSelection = {
                    baselineKey: baselineLoadout.key,
                    learnedKey: learnedLoadout.key,
                    baselineExpectedKey: counterCandidates[0].key,
                    learnedExpectedKey: counterCandidates[1].key,
                    learnedBonus: learnedLoadout.decisionSample.counterLearningBonus,
                }
            } finally {
                aiLoadoutLibrary = originalLoadoutLibrary
                aiLoadoutsByKey = originalLoadoutsByKey
                aiLearning.loadoutCounterStats = originalLoadoutCounterStats
                scoreAIDecisionCandidate = originalLoadoutScorer
            }

            aiProfile.decisionMemory = Array(AI_DECISION_MEMORY_SIZE).fill(0)
            const memoryState = buildAIDecisionStateFeatures(aiSide, AI_DECISION_FAMILY.upgrade, null)
            const memoryCandidateA = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.upgrade, { id: "memory-a", type: "wizard" }, null, memoryState)
            const memoryCandidateB = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.upgrade, { id: "memory-b", type: "bomb" }, null, memoryState)
            const selectedMemoryCandidate = isAIDecisionScoreBetter(memoryCandidateA, memoryCandidateB) ? memoryCandidateA : memoryCandidateB
            const memoryBeforeCommit = aiProfile.decisionMemory.slice()
            recordAIDecisionTraceSample(selectedMemoryCandidate, 0)
            const memoryAfterFirstCommit = aiProfile.decisionMemory.slice()
            recordAIDecisionTraceSample(selectedMemoryCandidate, 0)
            const memoryAfterSecondCommit = aiProfile.decisionMemory.slice()
            const memoryLifecycle = {
                scoringDidNotCommit: memoryBeforeCommit.every(value => value == 0),
                selectedOutputCommitted: memoryAfterFirstCommit.every((value, index) => value == selectedMemoryCandidate.memoryOut[index]),
                committedOnce: memoryAfterSecondCommit.every((value, index) => value == memoryAfterFirstCommit[index]),
            }

            const transitionProfile = aiProfile
            aiProfile = createAIProfileState()
            const firstTransition = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.strategy, { id: "terminal-first", type: "strategy" })
            beginAIDecisionTransition(aiSide, "strategy", "terminal-first", null, firstTransition, 0)
            window.__distributedAI.advance(250)
            advanceRuntimeClock()
            const secondTransition = scoreAIDecisionCandidate(aiSide, AI_DECISION_FAMILY.upgrade, { id: "terminal-second", type: "wizard" })
            beginAIDecisionTransition(aiSide, "development", "terminal-second", null, secondTransition, 0)
            window.__distributedAI.advance(500)
            advanceRuntimeClock()
            const terminalSamples = collectAIDecisionSamples(aiSide, 1, null)
            const terminalSettlement = {
                count: terminalSamples.length,
                firstTerminal: terminalSamples[0] && terminalSamples[0].terminal,
                lastTerminal: terminalSamples[1] && terminalSamples[1].terminal,
                chronological: terminalSamples.length == 2 && terminalSamples[0].settledAtMs == terminalSamples[1].startedAtMs && terminalSamples[1].settledAtMs >= terminalSamples[1].startedAtMs && JSON.stringify(terminalSamples[0].successorStateFeatures) == JSON.stringify(terminalSamples[1].stateFeatures) && JSON.stringify(terminalSamples[0].successorMemory) == JSON.stringify(terminalSamples[1].memoryIn),
                pendingCleared: aiProfile.pendingTacticalDecision == null,
            }
            aiProfile = transitionProfile
            aiDecisionStateCache = null

            const originalBestTowerUpgradeOption = getBestTowerUpgradeOption
            const originalBestPlacementOption = getBestPlacementOption
            const originalBestEconomyUtilityOption = getBestAIEconomyUtilityOption
            const originalScoreDecisionCandidate = scoreAIDecisionCandidate
            let crossFamilyNoOp
            try {
                const option = (type, familyIndex, score) => ({
                    type,
                    score,
                    decisionSample: { id: `${type}|test`, familyIndex, score, stateFeatures: [] },
                })
                getBestTowerUpgradeOption = () => option("upgrade", AI_DECISION_FAMILY.upgrade, 0.8)
                getBestPlacementOption = () => option("place", AI_DECISION_FAMILY.placement, 0.7)
                getBestAIEconomyUtilityOption = () => option("sell", AI_DECISION_FAMILY.sell, 0.6)
                scoreAIDecisionCandidate = (side, familyIndex) => ({
                    id: `noop|${familyIndex}`,
                    familyIndex,
                    score: familyIndex == AI_DECISION_FAMILY.placement ? 0.2 : 0.9,
                    stateFeatures: [],
                })
                const selectedCrossFamilyOption = getBestNonEmergencyDefenseOption(aiSide, {})
                crossFamilyNoOp = {
                    familyIndex: selectedCrossFamilyOption && selectedCrossFamilyOption.decisionSample.familyIndex,
                    type: selectedCrossFamilyOption && selectedCrossFamilyOption.type,
                }
            } finally {
                getBestTowerUpgradeOption = originalBestTowerUpgradeOption
                getBestPlacementOption = originalBestPlacementOption
                getBestAIEconomyUtilityOption = originalBestEconomyUtilityOption
                scoreAIDecisionCandidate = originalScoreDecisionCandidate
            }

            aiProfile.policySnapshot = null
            aiProfile.learningEnabled = false
            aiLearning.policy.decision.familyBias[AI_DECISION_FAMILY.upgrade] = 0.25
            aiLearning.championPolicy.decision.familyBias[AI_DECISION_FAMILY.upgrade] = -0.25
            const unsnapshottedInferenceUsesCandidate = getAIPolicyForDecision() == aiLearning.policy

            aiProfile.tacticalTrace = Array.from({ length: 40 }, (_, index) => ({
                creditVersion: AI_DECISION_CREDIT_VERSION,
                familyIndex: index % AI_DECISION_FAMILY_COUNT,
                stateFeatures: Array.from({ length: AI_DECISION_STATE_INPUT_SIZE }, (__, featureIndex) => ((index + featureIndex) % 11 - 5) / 5),
                chosenCandidateFeatures: Array.from({ length: AI_DECISION_CANDIDATE_INPUT_SIZE }, (__, featureIndex) => ((index + featureIndex) % 9 - 4) / 4),
                memoryIn: Array.from({ length: AI_DECISION_MEMORY_SIZE }, (__, featureIndex) => ((index + featureIndex) % 5 - 2) / 2),
                startedAtMs: index * 100,
                settledAtMs: (index + 1) * 100,
                intervalReward: (index % 5 - 2) / 2,
                successorStateFeatures: Array.from({ length: AI_DECISION_STATE_INPUT_SIZE }, (__, featureIndex) => ((index + featureIndex + 1) % 11 - 5) / 5),
                successorMemory: Array.from({ length: AI_DECISION_MEMORY_SIZE }, (__, featureIndex) => ((index + featureIndex + 1) % 5 - 2) / 2),
                terminal: false,
            }))
            aiProfile.pendingTacticalDecision = null
            aiMatchTelemetry = {
                aiLoadoutKey: "",
                contributionEpoch: 2,
                observedLoadoutSummary: null,
                selectionFeatures: Array(AI_FEATURE_KEYS.length).fill(0.5),
                strategyIndex: 0,
                tacticalTrace: aiProfile.tacticalTrace,
            }
            const boundedContribution = createAIPublicMatchContribution(150, 0, 1, Array(AI_FEATURE_KEYS.length).fill(0.5), false)
            const contributionContract = {
                exists: !!boundedContribution,
                count: boundedContribution ? boundedContribution.decisionSamples.length : -1,
                exactKeys: boundedContribution ? boundedContribution.decisionSamples.every(sample => JSON.stringify(Object.keys(sample)) == JSON.stringify(["creditVersion", "familyIndex", "stateFeatures", "chosenCandidateFeatures", "memoryIn", "startedAtMs", "settledAtMs", "intervalReward", "successorStateFeatures", "successorMemory", "terminal"])) : false,
                bounded: boundedContribution ? boundedContribution.decisionSamples.every(sample => sample.stateFeatures.length == AI_DECISION_STATE_INPUT_SIZE && sample.chosenCandidateFeatures.length == AI_DECISION_CANDIDATE_INPUT_SIZE && sample.memoryIn.length == AI_DECISION_MEMORY_SIZE && sample.successorStateFeatures.length == AI_DECISION_STATE_INPUT_SIZE && sample.successorMemory.length == AI_DECISION_MEMORY_SIZE && [sample.stateFeatures, sample.chosenCandidateFeatures, sample.memoryIn, sample.successorStateFeatures, sample.successorMemory].every(vector => vector.every(value => value >= -1 && value <= 1)) && sample.intervalReward >= -1 && sample.intervalReward <= 1 && sample.startedAtMs >= 0 && sample.settledAtMs >= sample.startedAtMs && typeof sample.terminal == "boolean") : false,
                contiguous: boundedContribution ? boundedContribution.decisionSamples.slice(1).every((sample, index) => sample.startedAtMs == boundedContribution.decisionSamples[index].settledAtMs && JSON.stringify(sample.stateFeatures) == JSON.stringify(boundedContribution.decisionSamples[index].successorStateFeatures) && JSON.stringify(sample.memoryIn) == JSON.stringify(boundedContribution.decisionSamples[index].successorMemory)) : false,
                timeRange: boundedContribution ? [Math.min(...boundedContribution.decisionSamples.map(sample => sample.startedAtMs)), Math.max(...boundedContribution.decisionSamples.map(sample => sample.settledAtMs))] : [],
                familyCounts: boundedContribution ? Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => boundedContribution.decisionSamples.filter(sample => sample.familyIndex == familyIndex).length) : [],
                hasModel: boundedContribution ? Object.prototype.hasOwnProperty.call(boundedContribution, "model") : true,
                byteLength: boundedContribution ? new TextEncoder().encode(JSON.stringify(boundedContribution)).byteLength : Infinity,
            }

            aiProfile.tacticalTrace = []
            let syntheticStartedAt = 0
            const makeTraceEntry = familyIndex => ({
                creditVersion: AI_DECISION_CREDIT_VERSION,
                familyIndex,
                stateFeatures: Array(AI_DECISION_STATE_INPUT_SIZE).fill(0),
                chosenCandidateFeatures: Array(AI_DECISION_CANDIDATE_INPUT_SIZE).fill(0),
                memoryIn: Array(AI_DECISION_MEMORY_SIZE).fill(0),
                startedAtMs: syntheticStartedAt++,
                settledAtMs: syntheticStartedAt,
                intervalReward: 0,
                successorStateFeatures: Array(AI_DECISION_STATE_INPUT_SIZE).fill(0),
                successorMemory: Array(AI_DECISION_MEMORY_SIZE).fill(0),
                terminal: false,
            })
            for(let familyIndex = 0; familyIndex < 3; familyIndex++) appendAIDecisionTraceEntry(makeTraceEntry(familyIndex))
            for(let traceIndex = 0; traceIndex < 200; traceIndex++) appendAIDecisionTraceEntry(makeTraceEntry(3 + traceIndex % 5))
            const retainedTraceFamilyCounts = Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => aiProfile.tacticalTrace.filter(sample => sample.familyIndex == familyIndex).length)
            const retainedContributionSamples = collectAIDecisionSamples(aiSide, 1, AI_MAX_PUBLIC_DECISION_SAMPLES)
            const retainedSampleFamilyCounts = Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => retainedContributionSamples.filter(sample => sample.familyIndex == familyIndex).length)
            const retainedSparseStarts = retainedContributionSamples.filter(sample => sample.familyIndex < 3).map(sample => sample.startedAtMs)

            const overviewLabels = getAIStatsOverviewMetrics().map(metric => metric.label)
            window.fetch = originalFetch
            AI_CROSS_MATCH_LEARNING_ENABLED = originalCrossMatchLearning

            aiEnabled = true
            aiMatchTelemetry = { contributionStatus: "queued" }
            const queuedContributionMessage = getCompletedMatchAIRematchMessage()
            aiMatchTelemetry.contributionStatus = "accepted"
            const acceptedContributionMessage = getCompletedMatchAIRematchMessage()
            aiMatchTelemetry.contributionStatus = "not-eligible"
            const ineligibleContributionMessage = getCompletedMatchAIRematchMessage()

            const originalCaptureEnvironment = {
                aiEnabled,
                bossMode,
                gameOver,
                gameStarted,
                localMatchCollectionState,
                mapNumber,
                practiceMode,
                round,
                selectedMenuMode,
                timeGameStarted,
                leftAutoEco: players[PLAYER_SIDE.left].autoEco,
                leftCursor: { x: players[PLAYER_SIDE.left].cursor.x, y: players[PLAYER_SIDE.left].cursor.y },
                leftSelectedBloon: players[PLAYER_SIDE.left].selectedBloon,
            }
            let humanTacticalCapture
            try {
                selectedMenuMode = "local"
                aiEnabled = false
                practiceMode = false
                bossMode = false
                gameStarted = true
                gameOver = false
                mapNumber = 7
                round = 2
                timeGameStarted = gameNow() - 5000
                players[PLAYER_SIDE.left].selectedBloon = 2
                players[PLAYER_SIDE.left].autoEco = true
                players[PLAYER_SIDE.left].cursor.x = 180
                players[PLAYER_SIDE.left].cursor.y = 240
                resetLocalMatchCollection()

                const capturedTower = {
                    playerSide: PLAYER_SIDE.left,
                    towerType: "dart",
                    x: 140,
                    y: 180,
                    path1Upgrades: 0,
                    path2Upgrades: 0,
                    path3Upgrades: 0,
                    targetPrio: 0,
                }
                const placed = recordLocalHumanTowerPlacement(capturedTower)
                window.__distributedAI.advance(3250)
                advanceRuntimeClock()
                capturedTower.path1Upgrades = 1
                const upgraded = recordLocalHumanTowerUpgrade(capturedTower, 1)
                const sentFirst = recordLocalHumanBloonSend(PLAYER_SIDE.left, "manual")
                const sentSecond = recordLocalHumanBloonSend(PLAYER_SIDE.left, "manual")
                const ecoToggled = recordLocalHumanEcoToggle(PLAYER_SIDE.left)
                const collectedFirst = recordLocalHumanCollection(capturedTower, "banana")
                const collectedSecond = recordLocalHumanCollection(capturedTower, "banana")
                const aimed = recordLocalHumanAim(capturedTower)
                const boosted = recordLocalHumanBoost(PLAYER_SIDE.left, "towerboost.png")
                window.__distributedAI.advance(40250)
                advanceRuntimeClock()
                const sold = recordLocalHumanTowerSale(capturedTower)
                const subjectSummary = summarizeLoadoutSelection(["000dart.png", "000farm.png", "000wizard.png"], ["bloonboost.png", "towerboost.png"])
                const opponentSummary = summarizeLoadoutSelection(["000bomb.png", "000farm.png", "000ninja.png"], ["ecoboost.png", "towerboost.png"])
                const demonstration = createLocalHumanDemonstration(PLAYER_SIDE.left, PLAYER_SIDE.right, subjectSummary, opponentSummary)
                const expectedEventKeys = {
                    aim: ["id", "k", "mode", "r", "t", "x", "y"],
                    boost: ["boost", "k", "r", "t"],
                    collect: ["count", "id", "k", "r", "source", "t"],
                    eco: ["enabled", "k", "r", "slot", "t"],
                    place: ["id", "k", "r", "t", "tower", "x", "y"],
                    sell: ["id", "k", "r", "t"],
                    send: ["groups", "k", "r", "slot", "source", "t"],
                    upgrade: ["id", "k", "path", "r", "t", "tier"],
                    wait: ["k", "ms", "r", "t"],
                }
                const exactEventKeys = demonstration.events.every(event => JSON.stringify(Object.keys(event).sort()) == JSON.stringify(expectedEventKeys[event.k]))
                const chronologicalEvents = demonstration.events.every((event, index) => event.t % 250 == 0 && event.t <= demonstration.durationMs && (index == 0 || event.t >= demonstration.events[index - 1].t && event.r >= demonstration.events[index - 1].r))
                const capturedActions = { placed, upgraded, sentFirst, sentSecond, ecoToggled, collectedFirst, collectedSecond, aimed, boosted, sold }

                aiEnabled = true
                const ineligibleCaptureRejected = recordLocalHumanBoost(PLAYER_SIDE.left, "towerboost.png") == false
                aiEnabled = false
                resetLocalMatchCollection()
                const towerIdResults = []
                for(let towerIndex = 0; towerIndex < 65; towerIndex++) {
                    towerIdResults.push(recordLocalHumanTowerPlacement({
                        playerSide: PLAYER_SIDE.right,
                        towerType: "dart",
                        x: 900,
                        y: 180,
                    }))
                }

                resetLocalMatchCollection()
                let capRejected = false
                for(let eventIndex = 0; eventIndex <= AI_MAX_CAPTURED_HUMAN_ACTIONS; eventIndex++) {
                    const recorded = recordLocalHumanTacticalEvent(PLAYER_SIDE.left, { k: "eco", enabled: true, slot: 2 })
                    if(eventIndex == AI_MAX_CAPTURED_HUMAN_ACTIONS) capRejected = recorded == false
                }
                const cappedActions = localMatchCollectionState.sides[PLAYER_SIDE.left].tacticalEvents.length
                const cappedUploadEvents = getLocalHumanTacticalEventsForUpload(PLAYER_SIDE.left).length

                const originalTacticalFamilyStats = aiLearning.tacticalFamilyStats
                aiLearning.tacticalFamilyStats = {
                    "human|upgrade|upgrade|dart|1": { samples: 3, score: 1, mean: 1, m2: 0 },
                }
                const belowThresholdBonus = getAIHumanTacticalCandidateBonus(PLAYER_SIDE.left, AI_DECISION_FAMILY.upgrade, { actionKey: "upgrade|dart|1" })
                aiLearning.tacticalFamilyStats["human|upgrade|upgrade|dart|1"] = { samples: 1000000, score: 10, mean: 10, m2: 0 }
                const positiveCappedBonus = getAIHumanTacticalCandidateBonus(PLAYER_SIDE.left, AI_DECISION_FAMILY.upgrade, { actionKey: "upgrade|dart|1" })
                aiLearning.tacticalFamilyStats["human|upgrade|upgrade|dart|1"] = { samples: 1000000, score: -10, mean: -10, m2: 0 }
                const negativeCappedBonus = getAIHumanTacticalCandidateBonus(PLAYER_SIDE.left, AI_DECISION_FAMILY.upgrade, { actionKey: "upgrade|dart|1" })
                aiLearning.tacticalFamilyStats = originalTacticalFamilyStats
                const ecoSendHumanKeys = getAIHumanTacticalCandidateKeys(PLAYER_SIDE.left, AI_DECISION_FAMILY.eco, { actionKey: "send|3" })
                const ecoStopHumanKeys = getAIHumanTacticalCandidateKeys(PLAYER_SIDE.left, AI_DECISION_FAMILY.eco, { actionKey: "auto|0" })

                humanTacticalCapture = {
                    capturedActions,
                    payloadKeys: Object.keys(demonstration),
                    eventKinds: demonstration.events.map(event => event.k),
                    exactEventKeys,
                    chronologicalEvents,
                    sendGroups: demonstration.events.find(event => event.k == "send").groups,
                    collectionCount: demonstration.events.find(event => event.k == "collect").count,
                    waits: demonstration.events.filter(event => event.k == "wait").map(event => event.ms),
                    boundedPayload: demonstration.map >= 0 && demonstration.map <= 20 && demonstration.durationMs >= demonstration.events[demonstration.events.length - 1].t && demonstration.matchFeatures.length == AI_FEATURE_KEYS.length && demonstration.matchFeatures.every(value => value >= 0 && value <= 1),
                    excludesNeuralData: !Object.prototype.hasOwnProperty.call(demonstration, "model") && !Object.prototype.hasOwnProperty.call(demonstration, "decisionSamples") && !Object.prototype.hasOwnProperty.call(demonstration, "observations"),
                    ineligibleCaptureRejected,
                    towerIdBounded: towerIdResults.slice(0, 64).every(Boolean) && towerIdResults[64] == false,
                    cappedActions,
                    cappedUploadEvents,
                    capRejected,
                    belowThresholdBonus,
                    positiveCappedBonus,
                    negativeCappedBonus,
                    ecoSendHumanKeys,
                    ecoStopHumanKeys,
                }
            } finally {
                aiEnabled = originalCaptureEnvironment.aiEnabled
                bossMode = originalCaptureEnvironment.bossMode
                gameOver = originalCaptureEnvironment.gameOver
                gameStarted = originalCaptureEnvironment.gameStarted
                localMatchCollectionState = originalCaptureEnvironment.localMatchCollectionState
                mapNumber = originalCaptureEnvironment.mapNumber
                practiceMode = originalCaptureEnvironment.practiceMode
                round = originalCaptureEnvironment.round
                selectedMenuMode = originalCaptureEnvironment.selectedMenuMode
                timeGameStarted = originalCaptureEnvironment.timeGameStarted
                players[PLAYER_SIDE.left].autoEco = originalCaptureEnvironment.leftAutoEco
                players[PLAYER_SIDE.left].cursor.x = originalCaptureEnvironment.leftCursor.x
                players[PLAYER_SIDE.left].cursor.y = originalCaptureEnvironment.leftCursor.y
                players[PLAYER_SIDE.left].selectedBloon = originalCaptureEnvironment.leftSelectedBloon
            }

            const originalProgressBloons = bloons
            let progressKeyTracksBloonMovement = false
            try {
                bloons = [{ pathPos: 10 }]
                const progressKeyBeforeMovement = getAITrainingTrueSelfPlayProgressKey()
                bloons[0].pathPos = 10.25
                progressKeyTracksBloonMovement = getAITrainingTrueSelfPlayProgressKey() != progressKeyBeforeMovement
            } finally {
                bloons = originalProgressBloons
            }

            return {
                aimActionCompleted: initialAimActionCompleted,
                aimTarget: { x: aimX, y: aimY },
                aimTowers: aimTowers.map(tower => ({
                    lockDelay: lockInputAt[tower.towerID] - selectedAt[tower.towerID],
                    lockInputSelected: lockInputSelected[tower.towerID],
                    targetPrio: tower.targetPrio,
                    targetX: tower.targetX,
                    targetY: tower.targetY,
                })),
                changedBeforeCooldown,
                communityGenerationAfterSessionClose,
                candidateContributionStatus,
                contextContributionStatus,
                neuralFollowStarted,
                emptyTrainingStrategyCount,
                hostedRefreshDuringSession,
                humanTacticalCapture,
                acceptedContributionMessage,
                authenticatedSaveState,
                goalCompleteStartDisabled,
                ineligibleContributionMessage,
                labOpenedByPointer,
                lastEvaluation,
                legacyContributionQueueRemoved,
                liveEvaluation,
                localSaveState,
                lockStartedThroughRunAiming,
                modeButtonIds,
                monotonicRefresh,
                migrationDeterministic: JSON.stringify(migratedPolicy) == JSON.stringify(repeatedMigratedPolicy),
                migrationMaxOutputDelta,
                migrationRetention,
                schema11Migration,
                schema10Migration,
                normalDelta: { x: normalEnd.x - normalStart.x, y: normalEnd.y - normalStart.y },
                normalDirectMode,
                overviewLabels,
                policyContract,
                progressKeyTracksBloonMovement,
                candidateFeatureContracts,
                placementFeatureContract,
                farmerPriceContract,
                factualFeaturesPermutationInvariant: factualFeaturesBefore.every((value, index) => value == factualFeaturesAfter[index]),
                relationshipFeaturesHeuristicIndependent: relationshipFeaturesLowHeuristic.every((value, index) => value == relationshipFeaturesHighHeuristic[index]),
                memoryLifecycle,
                olderEpochRefresh,
                pendingContributionFlushes,
                pendingContributionSaveState,
                pendingContributionSyncStarted,
                queuedContributionMessage,
                resetEpochRefresh,
                resetEpochRefreshSucceeded,
                refreshFailureBackoff,
                refreshingSaveState,
                refreshingStartDisabled,
                recoveredSessionContribution,
                recoveredSessionFlushes,
                recoveredSessionQueuedSaveState,
                recoveredSessionSaveStarted,
                recoveredSessionSaveState,
                recoveredSessionSyncStarted,
                restoredSessionGeneration,
                sameEpochRefresh,
                sameEpochRefreshSucceeded,
                sessionGenerationAfterHostedRefresh,
                credentialedLabContribution,
                credentialedLabPersistence,
                staleContributionMetadata,
                successfulRefreshPreservedBackoff,
                staleActionCleared,
                staleActionRetried,
                statsButtonIds,
                trainingDirectMode,
                trainingEnd,
                contributionContract,
                crossFamilyNoOp,
                decisionEncodeCalls,
                decisionTraining,
                invalidTrainerStatusSucceeded,
                localTrainerFetches,
                localTrainerStatusSucceeded,
                loadoutCounterSelection,
                retainedSampleFamilyCounts,
                retainedSparseStarts,
                retainedTraceFamilyCounts,
                trainerFailureIsolation,
                trainerFetchRequest: {
                    credentials: trainerFetchRequest.options.credentials,
                    mode: trainerFetchRequest.options.mode,
                    referrerPolicy: trainerFetchRequest.options.referrerPolicy,
                    url: trainerFetchRequest.url,
                },
                trainerMetrics,
                trainerStatusSucceeded,
                terminalSettlement,
                unsnapshottedInferenceUsesCandidate,
                trainingTarget: { x: canvas.width / 2 + 240, y: 360 },
            }
        })

        assert.equal(result.normalDirectMode, false)
        assert.ok(result.normalDelta.x > 0 || result.normalDelta.y > 0)
        assert.ok(Math.abs(result.normalDelta.x) <= 15)
        assert.ok(Math.abs(result.normalDelta.y) <= 15)
        assert.equal(result.trainingDirectMode, true)
        assert.deepEqual(result.trainingEnd, result.trainingTarget)
        assert.equal(result.staleActionRetried, true)
        assert.equal(result.staleActionCleared, true)
        assert.equal(result.lockStartedThroughRunAiming, true)
        assert.equal(result.changedBeforeCooldown, false)
        for(const tower of result.aimTowers) {
            assert.equal(tower.lockInputSelected, true)
            assert.ok(tower.lockDelay >= 150)
            assert.ok(tower.targetPrio == 2 || tower.targetPrio == 6)
            assert.deepEqual({ x: tower.targetX, y: tower.targetY }, result.aimTarget)
        }
        assert.equal(result.aimActionCompleted, true)
        assert.equal(result.neuralFollowStarted, true)
        assert.ok(result.modeButtonIds.includes("ai-lab"))
        assert.equal(result.labOpenedByPointer, true)
        assert.deepEqual(result.statsButtonIds, ["ai-refresh", "back"])
        assert.deepEqual(result.localSaveState, { label: "Session Only", disabled: true })
        assert.equal(result.emptyTrainingStrategyCount, 0)
        assert.equal(result.goalCompleteStartDisabled, true)
        assert.equal(result.liveEvaluation.label, "Live Eval")
        assert.equal(result.liveEvaluation.score, 0.625)
        assert.equal(result.lastEvaluation.label, "Last Eval")
        assert.equal(result.lastEvaluation.score, 0.58)
        assert.equal(result.legacyContributionQueueRemoved, true)
        assert.equal(result.progressKeyTracksBloonMovement, true)
        assert.equal(result.sameEpochRefreshSucceeded, true)
        assert.deepEqual(result.sameEpochRefresh, { games: 7, generation: 4, revision: 4 })
        assert.equal(result.resetEpochRefreshSucceeded, true)
        assert.deepEqual(result.resetEpochRefresh, { epoch: 2, games: 9, generation: 5 })
        assert.deepEqual(result.olderEpochRefresh, { epoch: 2, generation: 20, revision: 20, succeeded: false })
        assert.deepEqual(result.monotonicRefresh, {
            fetches: 2,
            games: 12,
            generation: 12,
            results: [true, true],
            revision: 12,
        })
        assert.deepEqual(result.refreshFailureBackoff, { fetches: 1, retryScheduled: true })
        assert.equal(result.successfulRefreshPreservedBackoff, true)
        assert.deepEqual(result.refreshingSaveState, { label: "Refreshing...", disabled: true, action: "none" })
        assert.equal(result.refreshingStartDisabled, true)
        assert.equal(result.contextContributionStatus, "accepted")
        assert.equal(result.candidateContributionStatus, "accepted")
        assert.deepEqual(result.staleContributionMetadata, { digest: "sha256:revision-12", epoch: 2, revision: 12 })
        assert.equal(result.recoveredSessionContribution, null)
        assert.deepEqual(result.recoveredSessionQueuedSaveState, { label: "Sync 1 Queued", disabled: false, action: "contributions" })
        assert.equal(result.recoveredSessionSyncStarted, true)
        assert.equal(result.recoveredSessionFlushes, 1)
        assert.equal(result.recoveredSessionSaveStarted, false)
        assert.deepEqual(result.recoveredSessionSaveState, { label: "Session Only", disabled: true, action: "none" })
        assert.equal(result.hostedRefreshDuringSession, true)
        assert.equal(result.sessionGenerationAfterHostedRefresh, 99)
        assert.equal(result.communityGenerationAfterSessionClose, 13)
        assert.equal(result.restoredSessionGeneration, 99)
        assert.deepEqual(result.pendingContributionSaveState, { label: "Sync 1 Queued", disabled: false, action: "contributions" })
        assert.equal(result.pendingContributionSyncStarted, true)
        assert.equal(result.pendingContributionFlushes, 1)
        assert.deepEqual(result.authenticatedSaveState, { label: "Hosted Contributions Synced", disabled: true, action: "none" })
        assert.ok(result.credentialedLabContribution)
        assert.deepEqual(result.credentialedLabPersistence, {
            controlStarted: false,
            fetches: 0,
            hostedGeneration: 13,
            syncStarted: true,
        })
        assert.equal(result.migrationDeterministic, true)
        assert.ok(result.migrationMaxOutputDelta < 1e-12)
        assert.deepEqual(result.migrationRetention, {
            totalGames: 77,
            totalSyntheticEpisodes: 11,
            totalPolicySamples: 99,
            totalLoadoutSamples: 42,
            totalTacticalSamples: 13,
            totalDecisionSamples: 0,
            totalHumanDemonstrations: 9,
            candidateGeneration: 6,
            championGeneration: 5,
            tacticalStoreRetained: true,
            placementStoreRetained: false,
            populationSize: 2,
        })
        assert.deepEqual(result.schema11Migration, {
            valid: true,
            deterministic: true,
            strategyPreserved: true,
            statePrefixPreserved: true,
            candidatePrefixPreserved: true,
            newColumnsZero: true,
            outputPreserved: true,
            recurrentValueSurvivalPreserved: true,
            familyTrainingPreserved: true,
            totalDecisionSamplesPreserved: true,
            spatialStoresReset: true,
            reservedHumanPriorsReset: true,
        })
        assert.deepEqual(result.schema10Migration, {
            valid: true,
            deterministic: true,
            strategyPreserved: true,
            statePreserved: true,
            recurrentPreserved: true,
            valuePreserved: true,
            candidateReset: true,
            familyTrainingReset: true,
        })
        assert.deepEqual(result.policyContract, {
            version: 12,
            modelFamily: "semantic-intent-spatial-recurrent-actor-critic-v4",
            formatVersion: 2,
            policyKeys: ["formatVersion", "strategyLearningRate", "decisionLearningRate", "strategy", "decision"],
            strategyKeys: ["hiddenSize1", "hiddenSize2", "W1", "b1", "W2", "b2", "W3", "b3"],
            decisionKeys: ["stateInputSize", "candidateInputSize", "stateHiddenSize", "candidateHiddenSize", "embeddingSize", "memorySize", "survivalClassCount", "trainingSamples", "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2", "WStateToMemory", "WMemoryToMemory", "bMemory", "WMemoryToState", "WValue", "bValue", "WSurvival", "bSurvival", "familyBias"],
            familyIndices: [0, 1, 2, 3, 4, 5, 6, 7],
            strategyDimensions: [64, 17, 32, 64, 75, 32],
            decisionDimensions: [96, 80, 48, 96, 48, 80, 48, 48, 16, 48, 16, 16, 48, 16, 4, 48, 8],
            parameterCount: 26440,
            valid: true,
        })
        assert.equal(result.decisionTraining.succeeded, true)
        assert.equal(result.decisionTraining.valid, true)
        assert.equal(result.decisionTraining.familySamples, 12)
        assert.ok(result.decisionTraining.after > result.decisionTraining.before)
        assert.equal(result.decisionTraining.valueChanged, true)
        assert.equal(result.decisionTraining.survivalChanged, true)
        assert.equal(result.decisionTraining.rejectedCandidateIgnored, true)
        assert.equal(result.decisionEncodeCalls, 4)
        assert.equal(result.candidateFeatureContracts.length, 8)
        for(const contract of result.candidateFeatureContracts) {
            assert.deepEqual(contract, {
                bounded: true,
                familyOneHot: true,
                stableIdIndependent: true,
                noopMarked: true,
                manualCapabilities: true,
            })
        }
        assert.deepEqual(result.placementFeatureContract, {
            stateIntent: [0.4, 0.4, 0.25, 0.5, 0, 0, 0, 1],
            candidateIntent: [0.4, 0.4, 0.25, 0.5, 0, 0, 0, 1],
            mirroredPerspectiveX: true,
            mirroredBucket: true,
            geometryPresent: true,
            placementIntentEmpty: true,
            manualAimGeometryEmpty: true,
            strategyGeometryEmpty: true,
        })
        assert.deepEqual(result.farmerPriceContract, {
            basePrice: 0,
            candidateFinite: true,
            freeActionDoesNotPauseEco: true,
            moneyUnchanged: true,
            placed: true,
            rejectedWithoutFarm: true,
            directPlacementRejectedWithoutFarm: true,
            sameRoundSaleBlocked: true,
            directSameRoundSaleBlocked: true,
            requestedSameRoundSaleBlocked: true,
            redundantFarmerPlacementBlocked: true,
            nextRoundFarmerSaleExcluded: true,
            scoredTargetPreserved: true,
            sellValue: 0,
            totalCost: 0,
            upgradeable: false,
        })
        assert.deepEqual(result.humanTacticalCapture.capturedActions, {
            placed: true,
            upgraded: true,
            sentFirst: true,
            sentSecond: true,
            ecoToggled: true,
            collectedFirst: true,
            collectedSecond: true,
            aimed: true,
            boosted: true,
            sold: true,
        })
        assert.deepEqual(result.humanTacticalCapture.payloadKeys, ["protocolVersion", "eventType", "contributionId", "baseRevision", "contributionEpoch", "map", "durationMs", "matchFeatures", "aiLives", "enemyLives", "loadoutKey", "opponentLoadoutKey", "events"])
        assert.deepEqual(result.humanTacticalCapture.eventKinds, ["wait", "place", "wait", "upgrade", "send", "eco", "collect", "aim", "boost", "wait", "sell"])
        assert.equal(result.humanTacticalCapture.exactEventKeys, true)
        assert.equal(result.humanTacticalCapture.chronologicalEvents, true)
        assert.equal(result.humanTacticalCapture.sendGroups, 2)
        assert.equal(result.humanTacticalCapture.collectionCount, 2)
        assert.deepEqual(result.humanTacticalCapture.waits, [5000, 3250, 40250])
        assert.equal(result.humanTacticalCapture.boundedPayload, true)
        assert.equal(result.humanTacticalCapture.excludesNeuralData, true)
        assert.equal(result.humanTacticalCapture.ineligibleCaptureRejected, true)
        assert.equal(result.humanTacticalCapture.towerIdBounded, true)
        assert.equal(result.humanTacticalCapture.cappedActions, 96)
        assert.ok(result.humanTacticalCapture.cappedUploadEvents <= 128)
        assert.equal(result.humanTacticalCapture.capRejected, true)
        assert.equal(result.humanTacticalCapture.belowThresholdBonus, 0)
        assert.ok(result.humanTacticalCapture.positiveCappedBonus > 0 && result.humanTacticalCapture.positiveCappedBonus <= 0.05)
        assert.ok(result.humanTacticalCapture.negativeCappedBonus < 0 && result.humanTacticalCapture.negativeCappedBonus >= -0.05)
        assert.deepEqual(result.humanTacticalCapture.ecoSendHumanKeys, ["human|eco|send|3", "human|eco|auto|1"])
        assert.deepEqual(result.humanTacticalCapture.ecoStopHumanKeys, ["human|eco|auto|0"])
        assert.deepEqual(result.terminalSettlement, {
            count: 2,
            firstTerminal: false,
            lastTerminal: true,
            chronological: true,
            pendingCleared: true,
        })
        assert.deepEqual(result.crossFamilyNoOp, { familyIndex: 2, type: "place" })
        assert.equal(result.unsnapshottedInferenceUsesCandidate, true)
        assert.equal(result.loadoutCounterSelection.baselineKey, result.loadoutCounterSelection.baselineExpectedKey)
        assert.equal(result.loadoutCounterSelection.learnedKey, result.loadoutCounterSelection.learnedExpectedKey)
        assert.ok(result.loadoutCounterSelection.learnedBonus > 0)
        assert.equal(result.retainedTraceFamilyCounts.reduce((sum, count) => sum + count, 0), 128)
        assert.deepEqual(result.retainedTraceFamilyCounts.slice(0, 3), [1, 1, 1])
        assert.deepEqual(result.retainedSampleFamilyCounts.slice(0, 3), [0, 0, 0])
        assert.deepEqual(result.retainedSparseStarts, [])
        assert.deepEqual(result.contributionContract, {
            exists: true,
            count: 12,
            exactKeys: true,
            bounded: true,
            contiguous: true,
            timeRange: [2800, 4000],
            familyCounts: [1, 1, 1, 1, 2, 2, 2, 2],
            hasModel: false,
            byteLength: result.contributionContract.byteLength,
        })
        assert.ok(result.contributionContract.byteLength <= 131072)
        assert.equal(result.trainerStatusSucceeded, true)
        assert.equal(result.invalidTrainerStatusSucceeded, false)
        assert.deepEqual(result.trainerFailureIsolation, { preserved: true, modelErrorUnchanged: true, hasOwnError: true })
        assert.equal(result.localTrainerStatusSucceeded, false)
        assert.equal(result.localTrainerFetches, 0)
        assert.equal(result.trainerFetchRequest.credentials, "omit")
        assert.equal(result.trainerFetchRequest.mode, "cors")
        assert.equal(result.trainerFetchRequest.referrerPolicy, "no-referrer")
        assert.match(result.trainerFetchRequest.url, /^https:\/\/raw\.githubusercontent\.com\/The-Double-G\/btdb-js\/ai-status\/ai-training-status\.json\?t=\d+$/)
        assert.deepEqual(result.trainerMetrics, [
            { label: "GitHub Trainer", value: "Training" },
            { label: "Run", value: "#7 · training" },
            { label: "Workers", value: "0/20 (20 live)" },
            { label: "Frozen Eval", value: "61.3% / S63.1% / 320" },
            { label: "Promotion", value: "Champion v5" },
        ])
        assert.deepEqual(result.overviewLabels, ["Hosted Champion", "Match Perspectives", "Human Demos", "Decision Samples", "Loadout Samples", "Counter Records"])
        assert.match(result.queuedContributionMessage, /finishes syncing/)
        assert.match(result.acceptedContributionMessage, /accepted/)
        assert.match(result.ineligibleContributionMessage, /No global AI contribution/)

        const recoveryPolicy = await runtime.page.evaluate(() => {
            if(aiTrainingSessionModelActive) deactivateAITrainingSessionModel()
            aiTrainingSessionLearning = null
            aiTrainingHostedLearning = null
            return cloneAIPolicy(aiLearning.policy)
        })
        const forceRecoveries = async (page, count) => page.evaluate(forcedRecoveries => {
            const baseWatchdog = window.__daiBaseRecoveryWatchdog || syncAITrainingTrueSelfPlayProgressWatchdog
            const recoveredMatches = new Set()
            window.__daiBaseRecoveryWatchdog = baseWatchdog
            syncAITrainingTrueSelfPlayProgressWatchdog = function() {
                if(isAITrainingTrueSelfPlayActive() && !gameOver && !aiTrainingState.trueSelfPlayDiscardCurrentMatch) {
                    const matchIndex = aiTrainingState.trueSelfPlayMatches
                    if(recoveredMatches.size < forcedRecoveries && !recoveredMatches.has(matchIndex)) {
                        recoveredMatches.add(matchIndex)
                        aiTrainingState.trueSelfPlayStallRecoveries++
                        aiTrainingState.trueSelfPlayDiscardCurrentMatch = true
                        aiTrainingState.trueSelfPlayLastWinner = "Forced recovery test"
                        gameOver = true
                        return
                    }
                    p1lives = 150
                    p2lives = 0
                    players[PLAYER_SIDE.left].lives = 150
                    players[PLAYER_SIDE.right].lives = 0
                    gameOver = true
                    return
                }
                return baseWatchdog.apply(this, arguments)
            }
        }, count)
        const recoveredExecution = await stepUntilMatches(
            runtime,
            "evaluate",
            { model: { policy: recoveryPolicy } },
            { model: { championPolicy: recoveryPolicy } },
            32,
            10000,
            page => forceRecoveries(page, 4),
        )
        assert.equal(recoveredExecution.stallRecoveries, 4)
        assert.equal(recoveredExecution.matches.length, 32)
        assert.equal(recoveredExecution.matches[0].index, 0)
        assert.deepEqual(recoveredExecution.model.policy, recoveryPolicy)
        await assert.rejects(stepUntilMatches(
            runtime,
            "evaluate",
            { model: { policy: recoveryPolicy } },
            { model: { championPolicy: recoveryPolicy } },
            32,
            10000,
            page => forceRecoveries(page, 5),
        ), /Stall recovery limit exceeded for the worker result/)
        await runtime.page.evaluate(() => {
            stopAITrainingTrueSelfPlay(false)
            syncAITrainingTrueSelfPlayProgressWatchdog = window.__daiBaseRecoveryWatchdog
            delete window.__daiBaseRecoveryWatchdog
        })

        await runtime.page.setViewportSize({ width: 390, height: 844 })
        const portraitCanvas = await runtime.page.evaluate(() => {
            const rect = canvas.getBoundingClientRect()
            return { width: rect.width, height: rect.height, top: rect.top }
        })
        assert.ok(Math.abs(portraitCanvas.width / portraitCanvas.height - 1366 / 768) < 0.01)
        assert.ok(portraitCanvas.width <= 390)
        assert.ok(portraitCanvas.height <= 844)
        assert.ok(portraitCanvas.top > 0)

        await runtime.page.setViewportSize({ width: 844, height: 390 })
        const landscapeCanvas = await runtime.page.evaluate(() => {
            const rect = canvas.getBoundingClientRect()
            return { width: rect.width, height: rect.height, left: rect.left }
        })
        assert.ok(Math.abs(landscapeCanvas.width / landscapeCanvas.height - 1366 / 768) < 0.01)
        assert.ok(landscapeCanvas.width <= 844)
        assert.ok(landscapeCanvas.height <= 390)
        assert.ok(landscapeCanvas.left > 0)

        assertRuntimeClean(runtime)
        console.log("AI browser regression passed: neural migration, decision training, Lab isolation, cursor aiming, and bounded contributions are consistent.")
    } finally {
        await closeRuntime(runtime)
    }
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
