// Runtime scheduler and pause helpers.
// Use `gameNow()` for gameplay timers that must freeze while paused.
// Use `realNow()` only for pause/menu/runtime controls that must keep working while paused.
// Use `nativeSetTimeout` / `nativeSetInterval` only for real-time UI/runtime loops.
// Use normal `setTimeout` / `setInterval` for gameplay work that should freeze while paused.

var nativeDateNow = Date.now.bind(Date)
// Native timers bypass the pause-aware runtime. Only use them for real-time control flow.
var nativeSetTimeout = window.setTimeout.bind(window)
var nativeClearTimeout = window.clearTimeout.bind(window)
// Native intervals also bypass pause. Keep them out of gameplay systems.
var nativeSetInterval = window.setInterval.bind(window)
var nativeClearInterval = window.clearInterval.bind(window)
var nativeRequestAnimationFrame = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(callback) {
    return nativeSetTimeout(callback, 16)
}

var gameTimeNow = nativeDateNow()
var runtimeTasks = {}
var runtimeTaskId = 1
var runtimeLastTick = nativeDateNow()
var runtimeTaskScheduleBaseAt = 0
var gamePaused = false
var lastPauseToggleAt = 0
var pauseToggleCooldownMs = 150
var pauseMenuButton = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
}

// Pause-aware gameplay clock.
function gameNow() {
    return gameTimeNow
}

// Real wall-clock time for pause toggles and runtime internals.
function realNow() {
    return nativeDateNow()
}

Date.now = gameNow

function runtimeSetTimeout(callback, delay) {
    var scheduleBaseAt = runtimeTaskScheduleBaseAt > 0 ? runtimeTaskScheduleBaseAt : gameTimeNow
    var taskId = runtimeTaskId++
    runtimeTasks[taskId] = {
        callback: callback,
        delay: delay,
        nextRunAt: scheduleBaseAt + Math.max(0, delay || 0),
        repeating: false,
    }
    return taskId
}

function runtimeSetInterval(callback, delay) {
    var scheduleBaseAt = runtimeTaskScheduleBaseAt > 0 ? runtimeTaskScheduleBaseAt : gameTimeNow
    var taskId = runtimeTaskId++
    runtimeTasks[taskId] = {
        callback: callback,
        delay: Math.max(1, delay || 0),
        nextRunAt: scheduleBaseAt + Math.max(1, delay || 0),
        repeating: true,
    }
    return taskId
}

function runtimeClearTask(taskId) {
    delete runtimeTasks[taskId]
}

window.setTimeout = runtimeSetTimeout
window.clearTimeout = runtimeClearTask
window.setInterval = runtimeSetInterval
window.clearInterval = runtimeClearTask

function runDueRuntimeTasks() {
    var runtimeTaskBudget = typeof getAITrainingRuntimeTaskBudget == "function" ? getAITrainingRuntimeTaskBudget() : 4000
    var runtimeSafetyCounter = 0
    while(runtimeSafetyCounter < runtimeTaskBudget) {
        var dueTaskIds = []

        for(var taskId in runtimeTasks) {
            if(runtimeTasks[taskId].nextRunAt <= gameTimeNow) {
                dueTaskIds.push(Number(taskId))
            }
        }

        if(dueTaskIds.length <= 0) {
            return
        }

        dueTaskIds.sort(function(a, b) {
            return runtimeTasks[a].nextRunAt - runtimeTasks[b].nextRunAt
        })

        for(var i = 0; i < dueTaskIds.length; i++) {
            var activeTask = runtimeTasks[dueTaskIds[i]]
            if(!activeTask) {
                continue
            }
            var scheduledRunAt = activeTask.nextRunAt

            if(activeTask.repeating) {
                activeTask.nextRunAt += activeTask.delay
            } else {
                delete runtimeTasks[dueTaskIds[i]]
            }

            var previousScheduleBaseAt = runtimeTaskScheduleBaseAt
            var previousGameTimeNow = gameTimeNow
            runtimeTaskScheduleBaseAt = scheduledRunAt
            gameTimeNow = scheduledRunAt
            try {
                activeTask.callback()
            } finally {
                gameTimeNow = previousGameTimeNow
                runtimeTaskScheduleBaseAt = previousScheduleBaseAt
            }
            runtimeSafetyCounter++
            if(runtimeSafetyCounter >= runtimeTaskBudget) {
                return
            }
        }
    }
}

function advanceRuntimeClock() {
    var currentRealNow = realNow()
    if(gamePaused == false) {
        var runtimeClockMultiplier = typeof getAITrainingRuntimeClockMultiplier == "function" ? getAITrainingRuntimeClockMultiplier() : 1
        var gameDelta = Math.max(0, currentRealNow - runtimeLastTick) * runtimeClockMultiplier
        var maxAdvanceStep = typeof getAITrainingMaxRuntimeAdvanceMs == "function" ? getAITrainingMaxRuntimeAdvanceMs() : 120
        if(gameDelta <= 0) {
            runDueRuntimeTasks()
        }
        while(gameDelta > 0) {
            var step = Math.min(gameDelta, maxAdvanceStep)
            gameTimeNow += step
            runDueRuntimeTasks()
            gameDelta -= step
        }
    }
    runtimeLastTick = currentRealNow
    if(typeof isAITrainingBackgroundProgressActive == "function" && isAITrainingBackgroundProgressActive() && typeof document != "undefined" && document.hidden) {
        nativeSetTimeout(advanceRuntimeClock, 0)
    } else {
        nativeRequestAnimationFrame(advanceRuntimeClock)
    }
}

function canPauseGame() {
    return typeof gameStarted != "undefined" && gameStarted && typeof gameOver != "undefined" && gameOver == false
}

function setGamePaused(shouldPause) {
    if(shouldPause && canPauseGame() == false) {
        return false
    }

    gamePaused = shouldPause
    runtimeLastTick = realNow()
    if(typeof resetAITrainingSimulationFrameStep == "function") {
        resetAITrainingSimulationFrameStep()
    }
    if(typeof isAITrainingTrueSelfPlayActive == "function" && isAITrainingTrueSelfPlayActive() && typeof resetAITrainingTrueSelfPlayProgressWatchdog == "function") {
        resetAITrainingTrueSelfPlayProgressWatchdog()
    }
    return true
}

function toggleGamePaused() {
    return setGamePaused(!gamePaused)
}

function pauseToggleReady() {
    return realNow() >= lastPauseToggleAt + pauseToggleCooldownMs
}

function markPauseToggleUsed() {
    lastPauseToggleAt = realNow()
}

function getCanvasPointFromEvent(event) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
    }
}

function pauseMenuContainsPoint(x, y) {
    return x >= pauseMenuButton.x && x <= pauseMenuButton.x + pauseMenuButton.width && y >= pauseMenuButton.y && y <= pauseMenuButton.y + pauseMenuButton.height
}

function drawPauseOverlay() {
    pauseMenuButton.width = canvas.width / 5
    pauseMenuButton.height = canvas.height / 10
    pauseMenuButton.x = canvas.width / 2 - pauseMenuButton.width / 2
    pauseMenuButton.y = canvas.height / 2 + canvas.height / 12

    ctx.fillStyle = "rgba(45, 45, 45, 0.82)"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 8
    ctx.fillRect(canvas.width / 3, canvas.height / 4, canvas.width / 3, canvas.height / 2)
    ctx.strokeRect(canvas.width / 3, canvas.height / 4, canvas.width / 3, canvas.height / 2)

    ctx.textAlign = "center"
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 8
    ctx.font = "56px Luckiest Guy"
    ctx.strokeText("Paused", canvas.width / 2, canvas.height / 2 - canvas.height / 10, canvas.width / 4)
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2 - canvas.height / 10, canvas.width / 4)

    ctx.font = "24px Luckiest Guy"
    ctx.strokeText("Press Esc to resume", canvas.width / 2, canvas.height / 2, canvas.width / 4)
    ctx.fillText("Press Esc to resume", canvas.width / 2, canvas.height / 2, canvas.width / 4)

    ctx.fillStyle = "#3d8b40"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 6
    ctx.fillRect(pauseMenuButton.x, pauseMenuButton.y, pauseMenuButton.width, pauseMenuButton.height)
    ctx.strokeRect(pauseMenuButton.x, pauseMenuButton.y, pauseMenuButton.width, pauseMenuButton.height)

    ctx.fillStyle = "white"
    ctx.font = "30px Luckiest Guy"
    ctx.strokeText("Resume", canvas.width / 2, pauseMenuButton.y + pauseMenuButton.height * 0.66, pauseMenuButton.width)
    ctx.fillText("Resume", canvas.width / 2, pauseMenuButton.y + pauseMenuButton.height * 0.66, pauseMenuButton.width)
}

advanceRuntimeClock()
