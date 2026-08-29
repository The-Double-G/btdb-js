"use strict"

const assert = require("node:assert/strict")
const { assertRuntimeClean, closeRuntime, openRuntime } = require("./distributed-ai/run-worker")

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
            let cumulativeFollowStarted = false
            let prematureFollowStarted = false
            for(const shift of [14, 28, 43]) {
                aimBloon.x = aimX + shift
                runAIAiming(aiSide)
                if(aiProfile.manualAimAction && aiProfile.manualAimAction.type == "follow") {
                    if(shift < 42) {
                        prematureFollowStarted = true
                    } else {
                        cumulativeFollowStarted = true
                    }
                    break
                }
            }

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
            AI_CROSS_MATCH_LEARNING_ENABLED = true
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

            const decisionPolicy = cloneAIPolicy(migratedModel.policy)
            const decisionState = Array.from({ length: 48 }, (_, index) => (index % 9 - 4) / 4)
            const decisionCandidate = Array.from({ length: 32 }, (_, index) => (index % 7 - 3) / 3)
            const decisionBefore = aiDecisionForward(decisionState, decisionCandidate, AI_DECISION_FAMILY.upgrade, decisionPolicy).score
            const decisionTarget = decisionBefore >= 0 ? -0.8 : 0.8
            let decisionTrainSucceeded = true
            for(let trainIndex = 0; trainIndex < 12; trainIndex++) {
                decisionTrainSucceeded = trainAIDecision(decisionState, decisionCandidate, AI_DECISION_FAMILY.upgrade, decisionTarget, decisionPolicy) && decisionTrainSucceeded
            }
            const decisionAfter = aiDecisionForward(decisionState, decisionCandidate, AI_DECISION_FAMILY.upgrade, decisionPolicy).score
            const decisionTraining = {
                before: decisionBefore,
                after: decisionAfter,
                familySamples: decisionPolicy.decision.trainingSamples[AI_DECISION_FAMILY.upgrade],
                target: decisionTarget,
                succeeded: decisionTrainSucceeded,
                valid: isValidAIPolicy(decisionPolicy),
            }

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

            aiProfile.policySnapshot = null
            aiProfile.learningEnabled = false
            aiLearning.policy.decision.familyBias[AI_DECISION_FAMILY.upgrade] = 0.25
            aiLearning.championPolicy.decision.familyBias[AI_DECISION_FAMILY.upgrade] = -0.25
            const unsnapshottedInferenceUsesCandidate = getAIPolicyForDecision() == aiLearning.policy

            aiProfile.tacticalTrace = Array.from({ length: 40 }, (_, index) => ({
                familyIndex: index % AI_DECISION_FAMILY_COUNT,
                stateFeatures: Array.from({ length: 48 }, (__, featureIndex) => ((index + featureIndex) % 11 - 5) / 5),
                candidateFeatures: Array.from({ length: 32 }, (__, featureIndex) => ((index + featureIndex) % 9 - 4) / 4),
                localReward: (index % 5 - 2) / 2,
                recordedAt: gameNow(),
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
                exactKeys: boundedContribution ? boundedContribution.decisionSamples.every(sample => JSON.stringify(Object.keys(sample)) == JSON.stringify(["familyIndex", "stateFeatures", "candidateFeatures", "localReward", "age"])) : false,
                bounded: boundedContribution ? boundedContribution.decisionSamples.every(sample => sample.stateFeatures.length == 48 && sample.candidateFeatures.length == 32 && sample.stateFeatures.every(value => value >= -1 && value <= 1) && sample.candidateFeatures.every(value => value >= -1 && value <= 1) && sample.localReward >= -1 && sample.localReward <= 1 && sample.age >= 0) : false,
                ageRange: boundedContribution ? [Math.min(...boundedContribution.decisionSamples.map(sample => sample.age)), Math.max(...boundedContribution.decisionSamples.map(sample => sample.age))] : [],
                familyCounts: boundedContribution ? Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => boundedContribution.decisionSamples.filter(sample => sample.familyIndex == familyIndex).length) : [],
                hasModel: boundedContribution ? Object.prototype.hasOwnProperty.call(boundedContribution, "model") : true,
            }

            aiProfile.tacticalTrace = []
            const makeTraceEntry = familyIndex => ({
                familyIndex,
                stateFeatures: Array(48).fill(0),
                candidateFeatures: Array(32).fill(0),
                localReward: 0,
                recordedAt: gameNow(),
            })
            for(let familyIndex = 0; familyIndex < 3; familyIndex++) appendAIDecisionTraceEntry(makeTraceEntry(familyIndex))
            for(let traceIndex = 0; traceIndex < 200; traceIndex++) appendAIDecisionTraceEntry(makeTraceEntry(3 + traceIndex % 5))
            const retainedTraceFamilyCounts = Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => aiProfile.tacticalTrace.filter(sample => sample.familyIndex == familyIndex).length)
            const retainedContributionSamples = collectAIDecisionSamples(aiSide, 1, AI_MAX_PUBLIC_DECISION_SAMPLES)
            const retainedSampleFamilyCounts = Array.from({ length: AI_DECISION_FAMILY_COUNT }, (_, familyIndex) => retainedContributionSamples.filter(sample => sample.familyIndex == familyIndex).length)
            const retainedSparseAges = retainedContributionSamples.filter(sample => sample.familyIndex < 3).map(sample => sample.age)

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
                cumulativeFollowStarted,
                emptyTrainingStrategyCount,
                hostedRefreshDuringSession,
                acceptedContributionMessage,
                authenticatedSaveState,
                goalCompleteStartDisabled,
                ineligibleContributionMessage,
                labOpenedByPointer,
                lastEvaluation,
                liveEvaluation,
                localSaveState,
                lockStartedThroughRunAiming,
                modeButtonIds,
                monotonicRefresh,
                migrationDeterministic: JSON.stringify(migratedPolicy) == JSON.stringify(repeatedMigratedPolicy),
                migrationMaxOutputDelta,
                migrationRetention,
                normalDelta: { x: normalEnd.x - normalStart.x, y: normalEnd.y - normalStart.y },
                normalDirectMode,
                overviewLabels,
                policyContract,
                olderEpochRefresh,
                pendingContributionFlushes,
                pendingContributionSaveState,
                pendingContributionSyncStarted,
                prematureFollowStarted,
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
                decisionEncodeCalls,
                decisionTraining,
                retainedSampleFamilyCounts,
                retainedSparseAges,
                retainedTraceFamilyCounts,
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
        assert.equal(result.prematureFollowStarted, false)
        assert.equal(result.cumulativeFollowStarted, true)
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
            placementStoreRetained: true,
            populationSize: 2,
        })
        assert.deepEqual(result.policyContract, {
            version: 9,
            modelFamily: "shared-neural-controller-v1",
            formatVersion: 2,
            policyKeys: ["formatVersion", "strategyLearningRate", "decisionLearningRate", "strategy", "decision"],
            strategyKeys: ["hiddenSize1", "hiddenSize2", "W1", "b1", "W2", "b2", "W3", "b3"],
            decisionKeys: ["stateInputSize", "candidateInputSize", "stateHiddenSize", "candidateHiddenSize", "embeddingSize", "trainingSamples", "WState1", "bState1", "WState2", "bState2", "WCandidate1", "bCandidate1", "WCandidate2", "bCandidate2", "familyBias"],
            familyIndices: [0, 1, 2, 3, 4, 5, 6, 7],
            strategyDimensions: [64, 17, 32, 64, 75, 32],
            decisionDimensions: [96, 48, 48, 96, 48, 32, 48, 48, 8],
            parameterCount: 19011,
            valid: true,
        })
        assert.equal(result.decisionTraining.succeeded, true)
        assert.equal(result.decisionTraining.valid, true)
        assert.equal(result.decisionTraining.familySamples, 12)
        assert.ok(Math.abs(result.decisionTraining.target - result.decisionTraining.after) < Math.abs(result.decisionTraining.target - result.decisionTraining.before))
        assert.equal(result.decisionEncodeCalls, 4)
        assert.equal(result.unsnapshottedInferenceUsesCandidate, true)
        assert.equal(result.retainedTraceFamilyCounts.reduce((sum, count) => sum + count, 0), 128)
        assert.deepEqual(result.retainedTraceFamilyCounts.slice(0, 3), [1, 1, 1])
        assert.deepEqual(result.retainedSampleFamilyCounts.slice(0, 3), [1, 1, 1])
        assert.deepEqual(result.retainedSparseAges, [202, 201, 200])
        assert.deepEqual(result.contributionContract, {
            exists: true,
            count: 32,
            exactKeys: true,
            bounded: true,
            ageRange: [0, 31],
            familyCounts: [4, 4, 4, 4, 4, 4, 4, 4],
            hasModel: false,
        })
        assert.deepEqual(result.overviewLabels, ["Hosted Champion", "Match Perspectives", "Human Demos", "Decision Samples", "Loadout Samples", "Counter Records"])
        assert.match(result.queuedContributionMessage, /finishes syncing/)
        assert.match(result.acceptedContributionMessage, /accepted/)
        assert.match(result.ineligibleContributionMessage, /No global AI contribution/)

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
