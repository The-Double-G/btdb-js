// Casual two-player online mode. Each peer owns its assigned side; the host also
// publishes shared match timing while both peers exchange semantic actions.
var MULTIPLAYER_PROTOCOL_VERSION = 1
var MULTIPLAYER_BUILD = "v2.6.0-multiplayer27"
var MULTIPLAYER_WEBSOCKET_URL = "wss://cursor-share-server.onrender.com/"
var MULTIPLAYER_DIRECTORY_ENDPOINT = "lobbies.php?protocol=1"
var MULTIPLAYER_SNAPSHOT_INTERVAL_MS = 100
var multiplayerState = {
    active: false,
    role: "",
    localSide: PLAYER_SIDE.left,
    remoteSide: PLAYER_SIDE.right,
    lobbyId: "",
    lobbyName: "",
    roomCode: "",
    participantToken: "",
    phase: "idle",
    socket: null,
    socketClosing: false,
    directoryHeartbeatTimer: null,
    spectatorPollTimer: null,
    spectatorSnapshotSequence: 0,
    spectatorPublishInFlight: false,
    spectatorTerminalPublishPending: false,
    lastSpectatorPublishAt: 0,
    lobbyListRequestInFlight: false,
    localReady: false,
    remoteReady: false,
    remoteLoadoutTowers: [],
    remoteLoadoutBoosts: [],
    localLoadoutKey: "",
    remoteLoadoutKey: "",
    matchStarted: false,
    snapshotSequence: 0,
    lastSnapshotSentAt: 0,
    lastSnapshotReceivedAt: 0,
    terminalSent: false,
    applyingSnapshot: false,
    applyingRemoteInput: false,
    inputSequence: 0,
    lastRemoteInputSequence: 0,
    lastCursorSentAt: 0,
    sideSnapshotSequence: 0,
    lastSideSnapshotReceivedSequence: 0,
    lastSideSnapshotSentAt: 0,
    lastSideSnapshotReceivedAt: 0,
    sideTerminalSent: false,
    remoteCursorTarget: null,
    remoteCursorLastUpdatedAt: 0,
    remoteEntityTargets: null,
    remoteEntityOrder: { bloons: [], towers: [], projectiles: [], bananas: [], subtowers: [] },
    remoteEntityRenderState: { bloons: {}, towers: {}, projectiles: {}, bananas: {}, subtowers: {} },
    authoritativeScalars: {},
    tabInactive: false,
    tabAutoPaused: false,
    gamePausedBeforeTab: false,
    status: "",
    error: "",
    overlay: null,
    spectatorBar: null,
}
var multiplayerTransientEntityIds = new WeakMap()
var multiplayerNextTransientEntityId = 1

function isMultiplayerActive() {
    return multiplayerState.active
}

function isMultiplayerSpectator() {
    return multiplayerState.active && multiplayerState.role == "spectator"
}

function isMultiplayerHost() {
    return multiplayerState.active && multiplayerState.role == "host"
}

function isMultiplayerHumanControlledSide(side) {
    if(!multiplayerState.active) return false
    if(multiplayerState.role == "spectator") return false
    return side == multiplayerState.localSide || multiplayerState.applyingRemoteInput
}

function isMultiplayerLocalSide(side) {
    return multiplayerState.active && multiplayerState.role != "spectator" && side == multiplayerState.localSide
}

function getMultiplayerRemoteSide() {
    return multiplayerState.localSide == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
}

function multiplayerDirectoryRequest(action, method, payload) {
    var url = MULTIPLAYER_DIRECTORY_ENDPOINT + "&action=" + encodeURIComponent(action)
    var controller = typeof AbortController == "function" ? new AbortController() : null
    var options = { method: method || "GET", credentials: "same-origin", cache: "no-store" }
    if(controller) options.signal = controller.signal
    if(payload != null) {
        options.headers = { "Content-Type": "application/json" }
        options.body = JSON.stringify(payload)
    }
    var timeoutId = nativeSetTimeout(function() {
        if(controller) controller.abort()
    }, 10000)
    return fetch(url, options).then(function(response) {
        return response.json().catch(function() { return null }).then(function(body) {
            if(response.ok == false) {
                var error = new Error(body && body.error && body.error.message ? body.error.message : "Lobby request failed: " + response.status)
                error.status = response.status
                error.code = body && body.error ? body.error.code : "http_" + response.status
                throw error
            }
            return body
        })
    }).finally(function() {
        nativeClearTimeout(timeoutId)
    })
}

function multiplayerSetStatus(status, error) {
    multiplayerState.status = String(status || "")
    multiplayerState.error = error ? String(error) : ""
    var overlay = multiplayerState.overlay
    if(!overlay) return
    var statusNode = overlay.querySelector("[data-multiplayer-status]")
    var errorNode = overlay.querySelector("[data-multiplayer-error]")
    if(statusNode) statusNode.textContent = multiplayerState.status
    if(errorNode) {
        errorNode.textContent = multiplayerState.error
        errorNode.hidden = multiplayerState.error == ""
    }
}

function multiplayerRenderLobbyList(lobbies) {
    var overlay = multiplayerCreateOverlay()
    var list = overlay.querySelector("[data-multiplayer-list]")
    var listStatus = overlay.querySelector("[data-multiplayer-list-status]")
    if(!list) return
    list.replaceChildren()
    if(!Array.isArray(lobbies) || lobbies.length == 0) {
        if(listStatus) listStatus.textContent = "No open lobbies. Create one to get started."
        return
    }
    if(listStatus) listStatus.textContent = lobbies.length + (lobbies.length == 1 ? " lobby open" : " lobbies open")
    for(var lobbyIndex = 0; lobbyIndex < lobbies.length; lobbyIndex++) {
        var lobby = lobbies[lobbyIndex]
        if(!lobby || !/^[a-f0-9]{16}$/.test(String(lobby.lobbyId || ""))) continue
        var spectatable = lobby.spectatable === true
        var item = document.createElement("div")
        item.className = "multiplayer-lobby-item"
        item.dataset.multiplayerLobbyItem = "true"
        item.setAttribute("role", "listitem")
        var details = document.createElement("div")
        var name = document.createElement("strong")
        var players = document.createElement("small")
        name.textContent = String(lobby.name || "Unnamed lobby")
        players.textContent = String(lobby.players || 1) + "/2 players"
        details.append(name, players)
        var join = document.createElement("button")
        join.type = "button"
        join.textContent = spectatable ? "Spectate" : "Join"
        join.dataset.lobbyId = lobby.lobbyId
        join.dataset.spectatable = spectatable ? "true" : "false"
        join.addEventListener("click", function(event) {
            if(event.currentTarget.dataset.spectatable === "true") multiplayerSpectateLobby(event.currentTarget.dataset.lobbyId)
            else multiplayerJoinLobby(event.currentTarget.dataset.lobbyId)
        })
        item.append(details, join)
        list.append(item)
    }
}

function multiplayerRefreshLobbyList() {
    if(multiplayerState.lobbyListRequestInFlight || multiplayerState.phase != "idle") return
    multiplayerState.lobbyListRequestInFlight = true
    var listStatus = multiplayerCreateOverlay().querySelector("[data-multiplayer-list-status]")
    if(listStatus) listStatus.textContent = "Refreshing lobbies..."
    multiplayerDirectoryRequest("list", "GET").then(function(result) {
        if(!result || result.ok !== true) throw new Error("Lobby list returned an invalid response.")
        multiplayerRenderLobbyList(result.lobbies)
    }).catch(function(error) {
        if(listStatus) listStatus.textContent = "Lobby list unavailable. Try Refresh."
        multiplayerSetStatus("Unable to load lobbies.", error)
    }).finally(function() {
        multiplayerState.lobbyListRequestInFlight = false
    })
}

function multiplayerCreateOverlay() {
    if(multiplayerState.overlay) return multiplayerState.overlay
    var overlay = document.createElement("div")
    overlay.id = "multiplayer-lobby"
    overlay.hidden = true
    overlay.innerHTML = [
        "<div class=\"multiplayer-card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"multiplayer-title\">",
        "<h2 id=\"multiplayer-title\">Online Multiplayer</h2>",
        "<p class=\"multiplayer-copy\">Play a standard two-player match with a friend. One player hosts the simulation and both players keep their own loadout.</p>",
        "<p class=\"multiplayer-status\" data-multiplayer-status>Find an open lobby or create one.</p>",
        "<p class=\"multiplayer-error\" data-multiplayer-error hidden></p>",
        "<div class=\"multiplayer-actions\" data-multiplayer-entry>",
        "<label>Lobby name<input data-multiplayer-name maxlength=\"32\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"Friday match\"></label>",
        "<button type=\"button\" data-multiplayer-create data-host-side=\"1\">Host Left</button>",
        "<button type=\"button\" data-multiplayer-create data-host-side=\"2\">Host Right</button>",
        "<button type=\"button\" data-multiplayer-refresh>Refresh</button>",
        "<p class=\"multiplayer-list-status\" data-multiplayer-list-status>Refreshing lobbies...</p>",
        "<div class=\"multiplayer-list\" data-multiplayer-list role=\"list\"></div>",
        "</div>",
        "<div class=\"multiplayer-room\" data-multiplayer-room hidden>",
        "<span>You are in</span>",
        "<strong data-multiplayer-lobby-name></strong>",
        "<span data-multiplayer-lobby-players>Waiting for another player...</span>",
        "</div>",
        "<div class=\"multiplayer-notice\" data-multiplayer-notice hidden>",
        "<strong data-multiplayer-notice-title>Player left the game</strong>",
        "<p data-multiplayer-notice-message></p>",
        "<button type=\"button\" data-multiplayer-notice-ok>OK</button>",
        "</div>",
        "<div class=\"multiplayer-actions\" data-multiplayer-footer>",
        "<button type=\"button\" class=\"multiplayer-back\" data-multiplayer-back>Back</button>",
        "</div>",
        "</div>",
    ].join("")
    var style = document.createElement("style")
    style.textContent = [
        "#multiplayer-lobby{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:transparent;font-family:'Luckiest Guy',Arial,sans-serif}",
        "#multiplayer-lobby[hidden]{display:none}",
        ".multiplayer-card{width:min(700px,100%);max-height:88vh;overflow:auto;box-sizing:border-box;padding:14px 18px;color:#fff;text-align:center}",
        ".multiplayer-card h2,.multiplayer-copy{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
        ".multiplayer-status{min-height:22px;margin:12px 0;color:#fff;text-align:center;font-weight:bold;text-shadow:2px 2px 0 #000;font-size:clamp(15px,2.2vw,22px)}",
        ".multiplayer-error{margin:10px 0;color:#ffb3aa;text-align:center;line-height:1.35;text-shadow:2px 2px 0 #000;font-family:Arial,sans-serif}",
        ".multiplayer-actions{display:flex;gap:9px;align-items:end;justify-content:center;flex-wrap:wrap;margin:14px auto 0;max-width:620px}",
        ".multiplayer-actions[hidden],.multiplayer-room[hidden]{display:none}",
        ".multiplayer-actions button,.multiplayer-room button{border:4px solid #000;border-radius:0;padding:9px 15px;background:#4f8bc2;color:white;font-family:'Luckiest Guy',Arial,sans-serif;font-size:17px;text-shadow:2px 2px 0 #000;cursor:pointer}",
        ".multiplayer-actions button:hover,.multiplayer-room button:hover{filter:brightness(1.18)}",
        ".multiplayer-actions button:disabled{opacity:.5;cursor:wait}",
        ".multiplayer-actions label{display:grid;gap:5px;min-width:190px;color:#fff;font-family:'Luckiest Guy',Arial,sans-serif;font-size:15px;text-shadow:2px 2px 0 #000}",
        ".multiplayer-actions input{width:100%;box-sizing:border-box;border:4px solid #000;border-radius:0;padding:9px;background:rgba(30,30,30,.9);color:white;font-family:Arial,sans-serif;font-size:17px}",
        ".multiplayer-list{display:grid;gap:8px;width:100%;max-height:230px;overflow:auto;margin-top:8px;padding:4px}",
        ".multiplayer-list-status,.multiplayer-list{flex-basis:100%}",
        ".multiplayer-list-status{margin:8px 0;color:#fff;text-align:center;font-family:Arial,sans-serif;font-size:13px;text-shadow:2px 2px 0 #000}",
        ".multiplayer-lobby-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border:4px solid #000;background:rgba(70,70,70,.86);text-align:left}",
        ".multiplayer-lobby-item strong{display:block;overflow:hidden;color:#fff;font-size:19px;text-shadow:2px 2px 0 #000;text-overflow:ellipsis;white-space:nowrap}",
        ".multiplayer-lobby-item small{display:block;margin-top:3px;color:#fff;font-family:Arial,sans-serif;font-size:13px}",
        ".multiplayer-lobby-item button{flex:none;padding:8px 12px}",
        ".multiplayer-back{background:#8b4e54!important}",
        ".multiplayer-room{display:grid;gap:10px;justify-items:center;margin:18px auto;padding:14px;border:4px solid #000;background:rgba(70,70,70,.86);color:#fff}",
        ".multiplayer-room strong{font-size:28px;color:#fff;text-shadow:2px 2px 0 #000}",
        ".multiplayer-notice{display:grid;gap:12px;justify-items:center;margin:24px auto;padding:22px 24px;border:4px solid #000;background:rgba(70,70,70,.94);color:#fff;max-width:440px;text-align:center;text-shadow:2px 2px 0 #000}",
        ".multiplayer-notice[hidden]{display:none}",
        ".multiplayer-notice strong{font-size:28px}",
        ".multiplayer-notice p{margin:0;font-family:Arial,sans-serif;font-size:16px;line-height:1.4;text-shadow:1px 1px 0 #000}",
        ".multiplayer-notice button{border:4px solid #000;border-radius:0;padding:9px 28px;background:#4f8bc2;color:white;font-family:'Luckiest Guy',Arial,sans-serif;font-size:18px;text-shadow:2px 2px 0 #000;cursor:pointer}",
        "#multiplayer-spectator-bar{position:fixed;right:16px;bottom:16px;z-index:21;display:flex;align-items:center;gap:10px;padding:8px 10px;border:4px solid #000;background:rgba(70,70,70,.9);color:#fff;font-family:'Luckiest Guy',Arial,sans-serif;text-shadow:2px 2px 0 #000}",
        "#multiplayer-spectator-bar[hidden]{display:none}",
        "#multiplayer-spectator-bar button{border:3px solid #000;border-radius:0;padding:6px 10px;background:#8b4e54;color:#fff;font-family:'Luckiest Guy',Arial,sans-serif;text-shadow:2px 2px 0 #000;cursor:pointer}",
    ].join("")
    document.head.appendChild(style)
    document.body.appendChild(overlay)
    var spectatorBar = document.createElement("div")
    spectatorBar.id = "multiplayer-spectator-bar"
    spectatorBar.hidden = true
    spectatorBar.innerHTML = "<span data-multiplayer-spectator-label>SPECTATING</span><button type=\"button\" data-multiplayer-spectator-exit>Leave</button>"
    document.body.appendChild(spectatorBar)
    var createButtons = overlay.querySelectorAll("[data-multiplayer-create]")
    for(var createButtonIndex = 0; createButtonIndex < createButtons.length; createButtonIndex++) createButtons[createButtonIndex].addEventListener("click", function(event) {
        multiplayerCreateRoom(Number(event.currentTarget.dataset.hostSide))
    })
    overlay.querySelector("[data-multiplayer-refresh]").addEventListener("click", multiplayerRefreshLobbyList)
    overlay.querySelector("[data-multiplayer-back]").addEventListener("click", function() { multiplayerLeave(true) })
    overlay.querySelector("[data-multiplayer-notice-ok]").addEventListener("click", multiplayerDismissNotice)
    spectatorBar.querySelector("[data-multiplayer-spectator-exit]").addEventListener("click", function() { multiplayerLeave(true) })
    multiplayerState.overlay = overlay
    multiplayerState.spectatorBar = spectatorBar
    return overlay
}

function multiplayerShowOverlay() {
    var overlay = multiplayerCreateOverlay()
    overlay.hidden = false
    var entry = overlay.querySelector("[data-multiplayer-entry]")
    var room = overlay.querySelector("[data-multiplayer-room]")
    var footer = overlay.querySelector("[data-multiplayer-footer]")
    var notice = overlay.querySelector("[data-multiplayer-notice]")
    if(entry) entry.hidden = false
    if(room) room.hidden = true
    if(footer) footer.hidden = false
    if(notice) notice.hidden = true
    multiplayerSetStatus("Find an open lobby or create one.", "")
    multiplayerRefreshLobbyList()
}

function multiplayerHideOverlay() {
    if(multiplayerState.overlay) multiplayerState.overlay.hidden = true
}

function multiplayerShowNotice(message) {
    var overlay = multiplayerCreateOverlay()
    var entry = overlay.querySelector("[data-multiplayer-entry]")
    var room = overlay.querySelector("[data-multiplayer-room]")
    var footer = overlay.querySelector("[data-multiplayer-footer]")
    var notice = overlay.querySelector("[data-multiplayer-notice]")
    var messageNode = overlay.querySelector("[data-multiplayer-notice-message]")
    if(entry) entry.hidden = true
    if(room) room.hidden = true
    if(footer) footer.hidden = true
    if(messageNode) messageNode.textContent = String(message || "The other player left the game.")
    if(notice) notice.hidden = false
    overlay.hidden = false
    frontMenuState = "mode"
}

function multiplayerDismissNotice() {
    multiplayerHideOverlay()
    multiplayerState.phase = "idle"
    multiplayerState.status = ""
    multiplayerState.error = ""
    gameStarted = false
    gameOver = false
    frontMenuState = "mode"
    clearKeyState()
}

function multiplayerShowSpectatorBar() {
    if(!multiplayerState.spectatorBar) multiplayerCreateOverlay()
    if(multiplayerState.spectatorBar) multiplayerState.spectatorBar.hidden = false
}

function multiplayerHideSpectatorBar() {
    if(multiplayerState.spectatorBar) multiplayerState.spectatorBar.hidden = true
}

function multiplayerShowLobbyWaiting() {
    var overlay = multiplayerCreateOverlay()
    overlay.hidden = false
    var entry = overlay.querySelector("[data-multiplayer-entry]")
    var room = overlay.querySelector("[data-multiplayer-room]")
    var footer = overlay.querySelector("[data-multiplayer-footer]")
    var notice = overlay.querySelector("[data-multiplayer-notice]")
    if(entry) entry.hidden = true
    if(room) room.hidden = false
    if(footer) footer.hidden = false
    if(notice) notice.hidden = true
    var name = overlay.querySelector("[data-multiplayer-lobby-name]")
    if(name) name.textContent = multiplayerState.lobbyName
}

function multiplayerResetConnection() {
    var socket = multiplayerState.socket
    multiplayerState.socketClosing = true
    if(multiplayerState.directoryHeartbeatTimer) nativeClearInterval(multiplayerState.directoryHeartbeatTimer)
    if(multiplayerState.spectatorPollTimer) nativeClearInterval(multiplayerState.spectatorPollTimer)
    multiplayerState.directoryHeartbeatTimer = null
    multiplayerState.spectatorPollTimer = null
    multiplayerHideSpectatorBar()
    if(socket && socket.readyState == WebSocket.OPEN) {
        try { socket.close() } catch(error) {}
    }
    multiplayerState.socket = null
    multiplayerState.active = false
    multiplayerState.role = ""
    multiplayerState.phase = "idle"
    multiplayerState.localReady = false
    multiplayerState.remoteReady = false
    multiplayerState.remoteLoadoutTowers = []
    multiplayerState.remoteLoadoutBoosts = []
    multiplayerState.localLoadoutKey = ""
    multiplayerState.remoteLoadoutKey = ""
    multiplayerState.matchStarted = false
    multiplayerState.snapshotSequence = 0
    multiplayerState.lastSnapshotSentAt = 0
    multiplayerState.lastSnapshotReceivedAt = 0
    multiplayerState.terminalSent = false
    multiplayerState.applyingSnapshot = false
    multiplayerState.applyingRemoteInput = false
    multiplayerState.inputSequence = 0
    multiplayerState.lastRemoteInputSequence = 0
    multiplayerState.lastCursorSentAt = 0
    multiplayerState.sideSnapshotSequence = 0
    multiplayerState.lastSideSnapshotReceivedSequence = 0
    multiplayerState.lastSideSnapshotSentAt = 0
    multiplayerState.lastSideSnapshotReceivedAt = 0
    multiplayerState.sideTerminalSent = false
    multiplayerState.spectatorSnapshotSequence = 0
    multiplayerState.spectatorPublishInFlight = false
    multiplayerState.spectatorTerminalPublishPending = false
    multiplayerState.lastSpectatorPublishAt = 0
    multiplayerState.remoteCursorTarget = null
    multiplayerState.remoteCursorLastUpdatedAt = 0
    multiplayerState.remoteEntityTargets = null
    multiplayerState.remoteEntityOrder = { bloons: [], towers: [], projectiles: [], bananas: [], subtowers: [] }
    multiplayerState.remoteEntityRenderState = { bloons: {}, towers: {}, projectiles: {}, bananas: {}, subtowers: {} }
    multiplayerState.authoritativeScalars = {}
    multiplayerState.tabInactive = false
    multiplayerState.tabAutoPaused = false
    multiplayerState.gamePausedBeforeTab = false
}

function multiplayerLeave(returnToMode) {
    var lobbyId = multiplayerState.lobbyId
    var participantToken = multiplayerState.participantToken
    multiplayerSendTransportMessage({ type: "leave" })
    if(lobbyId && participantToken) multiplayerDirectoryRequest("close", "POST", { lobbyId: lobbyId, participantToken: participantToken }).catch(function() {})
    multiplayerResetConnection()
    multiplayerState.lobbyId = ""
    multiplayerState.lobbyName = ""
    multiplayerState.roomCode = ""
    multiplayerState.participantToken = ""
    multiplayerState.status = ""
    multiplayerState.error = ""
    multiplayerHideOverlay()
    if(returnToMode) {
        gameStarted = false
        gameOver = false
        frontMenuState = "mode"
        clearKeyState()
    }
}

function multiplayerCreateRoom(hostSide) {
    if(multiplayerState.phase != "idle") return
    if(hostSide != PLAYER_SIDE.left && hostSide != PLAYER_SIDE.right) return
    var nameInput = multiplayerCreateOverlay().querySelector("[data-multiplayer-name]")
    var lobbyName = nameInput ? nameInput.value.trim() : ""
    if(lobbyName == "") {
        multiplayerSetStatus("Give your lobby a name first.", "")
        if(nameInput) nameInput.focus()
        return
    }
    multiplayerState.phase = "creating"
    multiplayerSetStatus("Creating lobby...", "")
    multiplayerDirectoryRequest("create", "POST", { name: lobbyName, hostSide: hostSide }).then(function(result) {
        if(!result || result.ok !== true || !result.lobby || !result.roomCode || !result.participantToken) throw new Error("Lobby creation returned an invalid response.")
        multiplayerState.lobbyId = result.lobby.lobbyId
        multiplayerState.lobbyName = result.lobby.name
        multiplayerState.roomCode = result.roomCode
        multiplayerState.participantToken = result.participantToken
        multiplayerState.role = "host"
        multiplayerState.localSide = result.hostSide == PLAYER_SIDE.right ? PLAYER_SIDE.right : PLAYER_SIDE.left
        multiplayerState.remoteSide = getMultiplayerRemoteSide()
        multiplayerState.phase = "connecting"
        multiplayerShowLobbyWaiting()
        return multiplayerConnectSocket()
    }).then(function() {
        multiplayerSendTransportMessage({ type: "join", code: multiplayerState.roomCode })
        multiplayerState.phase = "waiting"
        multiplayerSetStatus("Lobby created. Waiting for another player...", "")
        multiplayerStartDirectoryHeartbeat()
    }).catch(function(error) {
        multiplayerState.phase = "idle"
        multiplayerShowOverlay()
        multiplayerSetStatus("Unable to create lobby.", error)
    })
}

function multiplayerJoinLobby(lobbyId) {
    if(multiplayerState.phase != "idle") return
    if(!/^[a-f0-9]{16}$/.test(String(lobbyId || ""))) return
    multiplayerState.phase = "joining"
    multiplayerSetStatus("Joining lobby...", "")
    multiplayerDirectoryRequest("join", "POST", { lobbyId: lobbyId }).then(function(result) {
        if(!result || result.ok !== true || !result.lobby || !result.roomCode || !result.participantToken) throw new Error("Lobby join returned an invalid response.")
        multiplayerState.lobbyId = result.lobby.lobbyId
        multiplayerState.lobbyName = result.lobby.name
        multiplayerState.roomCode = result.roomCode
        multiplayerState.participantToken = result.participantToken
        multiplayerState.role = "guest"
        multiplayerState.remoteSide = result.hostSide == PLAYER_SIDE.right ? PLAYER_SIDE.right : PLAYER_SIDE.left
        multiplayerState.localSide = multiplayerState.remoteSide == PLAYER_SIDE.left ? PLAYER_SIDE.right : PLAYER_SIDE.left
        multiplayerState.phase = "connecting"
        multiplayerShowLobbyWaiting()
        return multiplayerConnectSocket()
    }).then(function() {
        multiplayerSendTransportMessage({ type: "join", code: multiplayerState.roomCode })
        multiplayerState.phase = "waiting"
        multiplayerSetStatus("Joined lobby. Connecting to the host...", "")
        multiplayerStartDirectoryHeartbeat()
    }).catch(function(error) {
        multiplayerState.phase = "idle"
        multiplayerShowOverlay()
        multiplayerSetStatus("Unable to join lobby.", error)
    })
}

function multiplayerSpectateLobby(lobbyId) {
    if(multiplayerState.phase != "idle") return
    if(!/^[a-f0-9]{16}$/.test(String(lobbyId || ""))) return
    multiplayerState.active = true
    multiplayerState.role = "spectator"
    multiplayerState.localSide = PLAYER_SIDE.left
    multiplayerState.remoteSide = PLAYER_SIDE.right
    multiplayerState.lobbyId = lobbyId
    multiplayerState.phase = "spectating"
    frontMenuState = "pregame"
    multiplayerShowLobbyWaiting()
    var playerStatus = multiplayerCreateOverlay().querySelector("[data-multiplayer-lobby-players]")
    if(playerStatus) playerStatus.textContent = "Spectating - input disabled"
    multiplayerSetStatus("Loading the live match...", "")
    multiplayerHideOverlay()
    multiplayerShowSpectatorBar()
    multiplayerStartSpectatorPolling()
}

function multiplayerStartSpectatorPolling() {
    if(multiplayerState.spectatorPollTimer) nativeClearInterval(multiplayerState.spectatorPollTimer)
    multiplayerPollSpectatorState()
    multiplayerState.spectatorPollTimer = nativeSetInterval(multiplayerPollSpectatorState, 250)
}

function multiplayerPollSpectatorState() {
    if(multiplayerState.role != "spectator" || !multiplayerState.lobbyId) return
    var requestedLobbyId = multiplayerState.lobbyId
    multiplayerDirectoryRequest("spectate", "POST", { lobbyId: requestedLobbyId }).then(function(result) {
        if(multiplayerState.role != "spectator" || multiplayerState.lobbyId != requestedLobbyId) return
        if(!result || result.ok !== true) throw new Error("Spectator state returned an invalid response.")
        if(result.lobby && result.lobby.name) multiplayerState.lobbyName = result.lobby.name
        var sequence = Number(result.sequence) || 0
        if(result.snapshot && sequence > multiplayerState.spectatorSnapshotSequence) {
            multiplayerState.spectatorSnapshotSequence = sequence
            multiplayerApplySnapshot(result.snapshot, true, true)
            frontMenuState = "pregame"
            multiplayerHideOverlay()
            multiplayerShowSpectatorBar()
        }
    }).catch(function(error) {
        if(multiplayerState.role == "spectator") multiplayerSetStatus("Spectator connection is retrying...", error)
    })
}

function multiplayerSendTransportMessage(message) {
    var socket = multiplayerState.socket
    if(!socket || socket.readyState != WebSocket.OPEN) return false
    try {
        socket.send(JSON.stringify(message))
        return true
    } catch(error) {
        multiplayerOnPeerDisconnected("Unable to send multiplayer data.")
        return false
    }
}

function multiplayerConnectSocket() {
    return new Promise(function(resolve, reject) {
        if(typeof WebSocket != "function") {
            reject(new Error("This browser does not support WebSocket multiplayer."))
            return
        }
        var socket
        try {
            socket = new WebSocket(MULTIPLAYER_WEBSOCKET_URL)
        } catch(error) {
            reject(error)
            return
        }
        multiplayerState.socket = socket
        multiplayerState.socketClosing = false
        var settled = false
        socket.onopen = function() {
            settled = true
            resolve(true)
        }
        socket.onmessage = function(event) { multiplayerHandleSocketMessage(event.data) }
        socket.onerror = function() {
            if(!settled) reject(new Error("The lobby server could not be reached."))
            else if(multiplayerState.phase != "idle") multiplayerSetStatus("Lobby connection is unstable.", "")
        }
        socket.onclose = function() {
            if(multiplayerState.socket == socket) multiplayerState.socket = null
            if(!multiplayerState.socketClosing && multiplayerState.phase != "idle") multiplayerOnPeerDisconnected("The lobby connection closed.")
        }
    })
}

function isMultiplayerTabInactive() {
    return multiplayerState.active && multiplayerState.tabInactive
}

function multiplayerSetTabInactive(inactive) {
    if(!multiplayerState.active) return
    multiplayerState.tabInactive = inactive === true
    clearKeyState()
    if(multiplayerState.role == "host" && gameStarted && gameOver == false) {
        if(multiplayerState.tabInactive && !multiplayerState.tabAutoPaused) {
            multiplayerState.gamePausedBeforeTab = gamePaused
            multiplayerState.tabAutoPaused = true
            gamePaused = true
        } else if(!multiplayerState.tabInactive && multiplayerState.tabAutoPaused) {
            gamePaused = multiplayerState.gamePausedBeforeTab
            multiplayerState.tabAutoPaused = false
        }
        runtimeLastTick = realNow()
        multiplayerSendMessage("tabState", { paused: gamePaused, hidden: multiplayerState.tabInactive })
    }
}

function multiplayerStartDirectoryHeartbeat() {
    if(multiplayerState.directoryHeartbeatTimer) nativeClearInterval(multiplayerState.directoryHeartbeatTimer)
    multiplayerDirectoryHeartbeat()
    multiplayerState.directoryHeartbeatTimer = nativeSetInterval(multiplayerDirectoryHeartbeat, 15000)
}

function multiplayerDirectoryHeartbeat() {
    if(!multiplayerState.lobbyId || !multiplayerState.participantToken) return
    multiplayerDirectoryRequest("heartbeat", "POST", {
        lobbyId: multiplayerState.lobbyId,
        participantToken: multiplayerState.participantToken,
        phase: multiplayerState.matchStarted ? "active" : "waiting",
    }).catch(function(error) {
        if(multiplayerState.phase != "idle") multiplayerSetStatus("Lobby directory is retrying...", error)
    })
}

function multiplayerActivateRoom() {
    if(multiplayerState.active) return
    multiplayerState.active = true
    multiplayerState.phase = "connected"
    multiplayerState.remoteSide = getMultiplayerRemoteSide()
    multiplayerEnterPregame()
    var remoteCursorIndex = multiplayerState.remoteSide == PLAYER_SIDE.left ? 0 : 1
    multiplayerState.remoteCursorTarget = { x: cursor[remoteCursorIndex].x, y: cursor[remoteCursorIndex].y }
    multiplayerSendMessage("hello", { build: MULTIPLAYER_BUILD, role: multiplayerState.role })
    multiplayerSetStatus("Connected. Choose three towers and two boosts.", "")
    multiplayerHideOverlay()
}

function multiplayerHandleSocketMessage(raw) {
    if(typeof raw != "string" || raw.length > 1048576) return
    var message
    try { message = JSON.parse(raw) } catch(error) { return }
    if(!message || typeof message.type != "string") return
    if(message.type == "joined") {
        if(Number(message.players) >= 2) multiplayerActivateRoom()
        else multiplayerSetStatus("Lobby created. Waiting for another player...", "")
        return
    }
    if(message.type == "peer_joined") {
        multiplayerActivateRoom()
        return
    }
    if(message.type == "leave" || message.type == "leaveGame") {
        multiplayerOnPeerDisconnected("The other player disconnected.")
        return
    }
    multiplayerHandleMessage(raw)
}

function multiplayerOnPeerDisconnected(message) {
    if(multiplayerState.phase == "idle") return
    var wasActive = multiplayerState.active
    var wasInGame = gameStarted
    multiplayerState.phase = "disconnected"
    multiplayerState.active = false
    multiplayerResetConnection()
    multiplayerState.phase = "disconnected"
    gameStarted = false
    gameOver = false
    frontMenuState = "mode"
    clearKeyState()
    if(wasActive || wasInGame) multiplayerShowNotice(message || "The other player left the game.")
}

function multiplayerSendMessage(type, payload) {
    var socket = multiplayerState.socket
    if(!socket || socket.readyState != WebSocket.OPEN) return false
    if(type == "snapshot" && socket.bufferedAmount > 2097152) return false
    var message = Object.assign({ v: MULTIPLAYER_PROTOCOL_VERSION, type: type, seq: ++multiplayerState.inputSequence }, payload || {})
    return multiplayerSendTransportMessage(message)
}

function multiplayerHandleMessage(raw) {
    if(typeof raw != "string" || raw.length > 1048576) return
    var message
    try { message = JSON.parse(raw) } catch(error) { return }
    if(!message || message.v !== MULTIPLAYER_PROTOCOL_VERSION || typeof message.type != "string") return
    if(Number.isFinite(Number(message.seq)) && Number(message.seq) <= multiplayerState.lastRemoteInputSequence && message.type == "key") return
    if(message.type == "hello") {
        if(message.build != MULTIPLAYER_BUILD) multiplayerOnPeerDisconnected("Players are using different game builds.")
        return
    }
    if(message.type == "tabState" && multiplayerState.role == "guest") {
        gamePaused = message.paused === true
        multiplayerState.authoritativeScalars.gamePaused = gamePaused
        runtimeLastTick = realNow()
        return
    }
    if(message.type == "loadout") {
        multiplayerApplyRemoteLoadout(message.towers, message.boosts)
        return
    }
    if(message.type == "ready") {
        var remoteLoadout = multiplayerCurrentLoadout(multiplayerState.remoteSide)
        multiplayerState.remoteReady = message.ready === true && multiplayerValidLoadout(remoteLoadout.towers, remoteLoadout.boosts)
        multiplayerMaybeStartMatch()
        return
    }
    if(message.type == "start") {
        if(multiplayerState.role == "guest" && Number(message.map) >= 0 && Number(message.map) <= 1) {
            mapNumber = Math.floor(Number(message.map))
            multiplayerState.matchStarted = true
            frontMenuState = "pregame"
        }
        return
    }
    if(message.type == "key") {
        multiplayerState.lastRemoteInputSequence = Math.max(multiplayerState.lastRemoteInputSequence, Number(message.seq) || 0)
        multiplayerApplyRemoteKey(message.control, message.down === true)
        return
    }
    if(message.type == "cursor") {
        if(message.side != multiplayerState.remoteSide) return
        var cursorX = Number(message.x)
        var cursorY = Number(message.y)
        if(!Number.isFinite(cursorX) || !Number.isFinite(cursorY)) return
        multiplayerState.remoteCursorTarget = {
            x: clamp(cursorX, 0, canvas.width),
            y: clamp(cursorY, 0, canvas.height),
        }
        multiplayerState.remoteCursorLastUpdatedAt = realNow()
        return
    }
    if(message.type == "snapshot" && multiplayerState.role == "guest" && message.side == multiplayerState.remoteSide) {
        multiplayerApplySnapshot(message.snapshot, true, true)
        return
    }
    if(message.type == "sideSnapshot" && message.side == multiplayerState.remoteSide) {
        multiplayerApplySnapshot(message.snapshot, false, false, message.terminal === true)
        return
    }
    if(message.type == "end") {
        multiplayerApplyTerminal(message.winner, message.reason)
    }
}

function multiplayerEnterPregame() {
    clearKeyState()
    aiEnabled = false
    practiceMode = false
    bossMode = false
    humanSide = multiplayerState.localSide
    aiSide = 0
    selectedMenuMode = "multiplayer"
    frontMenuState = "pregame"
    if(typeof resetAITrainingTrueSelfPlayMatchState == "function") resetAITrainingTrueSelfPlayMatchState()
    selectedMenuMode = "multiplayer"
    frontMenuState = "pregame"
    multiplayerState.localReady = false
    multiplayerState.remoteReady = false
    multiplayerState.matchStarted = false
    multiplayerState.terminalSent = false
}

function multiplayerLoadoutKey(towersForSide, boostsForSide) {
    return (Array.isArray(towersForSide) ? towersForSide.join(",") : "") + "|" + (Array.isArray(boostsForSide) ? boostsForSide.join(",") : "")
}

function multiplayerValidLoadout(towersForSide, boostsForSide) {
    if(!Array.isArray(towersForSide) || towersForSide.length != 3 || !Array.isArray(boostsForSide) || boostsForSide.length != 2) return false
    var seenTowers = {}
    for(var towerIndex = 0; towerIndex < towersForSide.length; towerIndex++) {
        var towerImage = String(towersForSide[towerIndex])
        if(!LOADOUT_TOWER_CONFIG[towerImage] || seenTowers[towerImage]) return false
        seenTowers[towerImage] = true
    }
    var seenBoosts = {}
    for(var boostIndex = 0; boostIndex < boostsForSide.length; boostIndex++) {
        var boostImage = String(boostsForSide[boostIndex])
        if(AI_BOOST_IMAGES.indexOf(boostImage) < 0 || seenBoosts[boostImage]) return false
        seenBoosts[boostImage] = true
    }
    return true
}

function multiplayerValidLoadoutSelection(towersForSide, boostsForSide) {
    if(!Array.isArray(towersForSide) || towersForSide.length > 3 || !Array.isArray(boostsForSide) || boostsForSide.length > 2) return false
    var seenTowers = {}
    for(var towerIndex = 0; towerIndex < towersForSide.length; towerIndex++) {
        var towerImage = String(towersForSide[towerIndex])
        if(!LOADOUT_TOWER_CONFIG[towerImage] || seenTowers[towerImage]) return false
        seenTowers[towerImage] = true
    }
    var seenBoosts = {}
    for(var boostIndex = 0; boostIndex < boostsForSide.length; boostIndex++) {
        var boostImage = String(boostsForSide[boostIndex])
        if(AI_BOOST_IMAGES.indexOf(boostImage) < 0 || seenBoosts[boostImage]) return false
        seenBoosts[boostImage] = true
    }
    return true
}

function multiplayerRemovePregameItems(side, towersForSide, boostsForSide) {
    var leftSide = side == PLAYER_SIDE.left
    var selectedTowers = Array.isArray(towersForSide) ? towersForSide : []
    var selectedBoosts = Array.isArray(boostsForSide) ? boostsForSide : []
    for(var towerIndex = 0; towerIndex < selectedTowers.length; towerIndex++) {
        for(var uiTowerIndex = 0; uiTowerIndex < UITowers.length; uiTowerIndex++) {
            var uiTower = UITowers[uiTowerIndex]
            if(uiTower && uiTower.image == selectedTowers[towerIndex] && (uiTower.x < canvas.width / 2) == leftSide) {
                UITowers.splice(uiTowerIndex, 1)
                break
            }
        }
    }
    for(var boostIndex = 0; boostIndex < selectedBoosts.length; boostIndex++) {
        for(var uiBoostIndex = 0; uiBoostIndex < UIBoosts.length; uiBoostIndex++) {
            var uiBoost = UIBoosts[uiBoostIndex]
            if(uiBoost && uiBoost.image == selectedBoosts[boostIndex] && (uiBoost.x < canvas.width / 2) == leftSide) {
                UIBoosts.splice(uiBoostIndex, 1)
                break
            }
        }
    }
}

function multiplayerCurrentLoadout(side) {
    return {
        towers: players[side].towers.slice(0),
        boosts: players[side].boostTypes.slice(0),
    }
}

function multiplayerSendLocalLoadoutIfChanged() {
    if(!multiplayerState.active || !multiplayerState.socket || multiplayerState.socket.readyState != WebSocket.OPEN) return
    var loadout = multiplayerCurrentLoadout(multiplayerState.localSide)
    var key = multiplayerLoadoutKey(loadout.towers, loadout.boosts)
    if(key == multiplayerState.localLoadoutKey) return
    multiplayerState.localLoadoutKey = key
    multiplayerSendMessage("loadout", { towers: loadout.towers, boosts: loadout.boosts })
    var ready = multiplayerValidLoadout(loadout.towers, loadout.boosts)
    if(ready != multiplayerState.localReady) {
        multiplayerState.localReady = ready
        multiplayerSendMessage("ready", { ready: ready })
    }
    multiplayerMaybeStartMatch()
}

function multiplayerApplyRemoteLoadout(towersForSide, boostsForSide) {
    if(!multiplayerValidLoadoutSelection(towersForSide, boostsForSide)) return
    var side = multiplayerState.remoteSide
    multiplayerRemovePregameItems(side, towersForSide, boostsForSide)
    if(side == PLAYER_SIDE.left) {
        p1Towers = towersForSide.slice(0)
        p1BoostTypes = boostsForSide.slice(0)
    } else {
        p2Towers = towersForSide.slice(0)
        p2BoostTypes = boostsForSide.slice(0)
    }
    multiplayerState.remoteLoadoutTowers = towersForSide.slice(0)
    multiplayerState.remoteLoadoutBoosts = boostsForSide.slice(0)
    multiplayerState.remoteLoadoutKey = multiplayerLoadoutKey(towersForSide, boostsForSide)
    multiplayerState.remoteReady = multiplayerValidLoadout(towersForSide, boostsForSide)
    multiplayerMaybeStartMatch()
}

function multiplayerMaybeStartMatch() {
    if(!isMultiplayerHost() || multiplayerState.matchStarted || !multiplayerState.localReady || !multiplayerState.remoteReady) return
    var local = multiplayerCurrentLoadout(multiplayerState.localSide)
    var remote = multiplayerCurrentLoadout(multiplayerState.remoteSide)
    if(!multiplayerValidLoadout(local.towers, local.boosts) || !multiplayerValidLoadout(remote.towers, remote.boosts)) return
    if(mapNumber != 0 && mapNumber != 1) mapNumber = 0
    multiplayerState.matchStarted = true
    multiplayerSendMessage("start", { map: mapNumber })
}

var multiplayerBaseSelectPregameItemsAt = typeof selectPregameItemsAt == "function" ? selectPregameItemsAt : null
if(multiplayerBaseSelectPregameItemsAt) {
    selectPregameItemsAt = function(side, x, y) {
        var result = multiplayerBaseSelectPregameItemsAt.apply(this, arguments)
        if(result && multiplayerState.active && side == multiplayerState.localSide) multiplayerSendLocalLoadoutIfChanged()
        return result
    }
}

function multiplayerControlForKey(side, keyCode) {
    var names = ["Up", "Left", "Down", "Right"]
    for(var directionIndex = 0; directionIndex < names.length; directionIndex++) if(keyCode == KEY_CODES[(side == PLAYER_SIDE.left ? "p1" : "p2") + names[directionIndex]]) return names[directionIndex].toLowerCase()
    var controls = [
        ["Select", "select"], ["Path1", "path1"], ["Path2", "path2"], ["Path3", "path3"], ["Sell", "sell"],
        ["TargetPrev", "targetPrev"], ["TargetNext", "targetNext"], ["Boost1", "boost1"], ["Boost2", "boost2"],
        ["BloonNext", "bloonNext"], ["BloonPrev", "bloonPrev"], ["Send", "send"], ["AutoEco", "autoEco"],
    ]
    for(var controlIndex = 0; controlIndex < controls.length; controlIndex++) if(keyCode == KEY_CODES[(side == PLAYER_SIDE.left ? "p1" : "p2") + controls[controlIndex][0]]) return controls[controlIndex][1]
    return null
}

function multiplayerKeyCodeForSide(side, control) {
    var prefix = side == PLAYER_SIDE.left ? "p1" : "p2"
    var names = { up: "Up", left: "Left", down: "Down", right: "Right", select: "Select", path1: "Path1", path2: "Path2", path3: "Path3", sell: "Sell", targetPrev: "TargetPrev", targetNext: "TargetNext", boost1: "Boost1", boost2: "Boost2", bloonNext: "BloonNext", bloonPrev: "BloonPrev", send: "Send", autoEco: "AutoEco" }
    return names[control] ? KEY_CODES[prefix + names[control]] : -1
}

function multiplayerIsCursorControl(control) {
    return control == "up" || control == "left" || control == "down" || control == "right"
}

function multiplayerApplyRemoteCursorTarget() {
    if(!multiplayerState.remoteCursorTarget) return
    var remoteCursorIndex = multiplayerState.remoteSide == PLAYER_SIDE.left ? 0 : 1
    cursor[remoteCursorIndex].x = multiplayerState.remoteCursorTarget.x
    cursor[remoteCursorIndex].y = multiplayerState.remoteCursorTarget.y
}

function multiplayerSmoothRemoteCursor() {
    if(!multiplayerState.remoteCursorTarget) return
    var remoteCursorIndex = multiplayerState.remoteSide == PLAYER_SIDE.left ? 0 : 1
    var activeCursor = cursor[remoteCursorIndex]
    activeCursor.x += (multiplayerState.remoteCursorTarget.x - activeCursor.x) * 0.35
    activeCursor.y += (multiplayerState.remoteCursorTarget.y - activeCursor.y) * 0.35
}

function multiplayerSendLocalCursor(force) {
    if(!multiplayerState.active || multiplayerState.role == "spectator" || !multiplayerState.socket || multiplayerState.socket.readyState != WebSocket.OPEN) return
    var now = realNow()
    if(!force && now < multiplayerState.lastCursorSentAt + 33) return
    multiplayerState.lastCursorSentAt = now
    var localCursorIndex = multiplayerState.localSide == PLAYER_SIDE.left ? 0 : 1
    multiplayerSendMessage("cursor", {
        side: multiplayerState.localSide,
        x: cursor[localCursorIndex].x,
        y: cursor[localCursorIndex].y,
    })
}

function multiplayerSendLocalKey(event) {
    if(!multiplayerState.active || multiplayerState.role == "spectator" || multiplayerState.applyingRemoteInput || !multiplayerState.socket || multiplayerState.socket.readyState != WebSocket.OPEN) return
    if(!gameStarted || gameOver) return
    var control = multiplayerControlForKey(multiplayerState.localSide, event.keyCode)
    if(control) {
        multiplayerSendLocalCursor(true)
        multiplayerSendMessage("key", { control: control, down: event.type == "keydown" })
    }
}

var multiplayerBaseKeydown = typeof onkeydown == "function" ? onkeydown : null
var multiplayerBaseKeyup = typeof onkeyup == "function" ? onkeyup : null
if(multiplayerBaseKeydown && multiplayerBaseKeyup) {
    onkeydown = function(event) {
        if(multiplayerState.active && multiplayerControlForKey(multiplayerState.remoteSide, event.keyCode)) return false
        var result = multiplayerBaseKeydown.call(this, event)
        multiplayerSendLocalKey(event)
        return result
    }
    onkeyup = function(event) {
        if(multiplayerState.active && multiplayerControlForKey(multiplayerState.remoteSide, event.keyCode)) return false
        var result = multiplayerBaseKeyup.call(this, event)
        multiplayerSendLocalKey(event)
        return result
    }
}

function multiplayerApplyRemoteKey(control, down) {
    if(multiplayerIsCursorControl(control)) return
    var keyCode = multiplayerKeyCodeForSide(multiplayerState.remoteSide, control)
    if(keyCode < 0) return
    multiplayerApplyRemoteCursorTarget()
    if(down && (control == "boost1" || control == "boost2" || control == "bloonNext" || control == "bloonPrev" || control == "send" || control == "autoEco")) {
        var remoteSide = multiplayerState.remoteSide
        if(control == "boost1" || control == "boost2") {
            keyState[keyCode] = true
            tryUseBoost(remoteSide, control == "boost1" ? 0 : 1, keyCode)
            keyState[keyCode] = false
        }
        else if(control == "bloonNext" || control == "bloonPrev") cycleSelectedBloon(remoteSide, control == "bloonNext" ? 1 : -1)
        else if(control == "send") {
            keyState[keyCode] = true
            tryQueueSelectedBloon(remoteSide, keyCode)
            keyState[keyCode] = false
        } else {
            players[remoteSide].autoEco = !players[remoteSide].autoEco
        }
        return
    }
    multiplayerState.applyingRemoteInput = true
    try {
        var event = { keyCode: keyCode, type: down ? "keydown" : "keyup" }
        if(down && multiplayerBaseKeydown) multiplayerBaseKeydown.call(window, event)
        else if(!down && multiplayerBaseKeyup) multiplayerBaseKeyup.call(window, event)
    } finally {
        multiplayerState.applyingRemoteInput = false
    }
}

function multiplayerEncodeValue(value, seen) {
    if(typeof value == "number") {
        if(value === Infinity) return { __multiplayerNumber: "Infinity" }
        if(value === -Infinity) return { __multiplayerNumber: "-Infinity" }
        if(Number.isNaN(value)) return { __multiplayerNumber: "NaN" }
        return value
    }
    if(value == null || typeof value == "string" || typeof value == "boolean") return value
    if(typeof value == "function") return null
    seen = seen || []
    if(seen.indexOf(value) >= 0) return null
    seen.push(value)
    var result
    if(Array.isArray(value)) {
        result = value.map(function(item) { return multiplayerEncodeValue(item, seen) })
    } else {
        result = {}
        var keys = Object.keys(value)
        for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
            var key = keys[keyIndex]
            if(typeof value[key] != "function") result[key] = multiplayerEncodeValue(value[key], seen)
        }
    }
    seen.pop()
    return result
}

function multiplayerDecodeValue(value) {
    if(value == null || typeof value == "string" || typeof value == "boolean" || typeof value == "number") {
        if(value && typeof value == "object" && value.__multiplayerNumber) return multiplayerDecodeValue(value)
        return value
    }
    if(value.__multiplayerNumber == "Infinity") return Infinity
    if(value.__multiplayerNumber == "-Infinity") return -Infinity
    if(value.__multiplayerNumber == "NaN") return NaN
    if(Array.isArray(value)) return value.map(multiplayerDecodeValue)
    var result = {}
    var keys = Object.keys(value)
    for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) result[keys[keyIndex]] = multiplayerDecodeValue(value[keys[keyIndex]])
    return result
}

var MULTIPLAYER_SNAPSHOT_SCALARS = [
    "mapNumber", "gameStarted", "gameOver", "gamePaused", "round", "roundReady", "bloonsToSpawn", "endOfRoundGiven", "counter", "maxCounter", "moneyFactor", "autostart", "moabCount", "bfbCount", "zomgCount", "bossSpawned", "p1money", "p2money", "p1eco", "p2eco", "p1lives", "p2lives", "timeRoundEnded", "timeGameStarted", "p1SelectedBloon", "p2SelectedBloon", "p1Boost1Count", "p2Boost1Count", "p1Boost2Count", "p2Boost2Count", "p1Boost1Expires", "p2Boost1Expires", "p1Boost2Expires", "p2Boost2Expires", "p1TowerBoostVisual", "p2TowerBoostVisual", "p1BloonBoostVisual", "p2BloonBoostVisual", "p1SlowBoostVisual", "p2SlowBoostVisual", "p1LightningBoostTicksRemaining", "p2LightningBoostTicksRemaining", "p1LightningBoostNextTick", "p2LightningBoostNextTick", "p1TotalPopCount", "p2TotalPopCount", "p1TotalCashGenerated", "p2TotalCashGenerated", "p1CashGenWithEco", "p2CashGenWithEco", "p1AutoEco", "p2AutoEco", "p1BloonSendRound", "p2BloonSendRound",
]

function multiplayerQuantize(value, precision) {
    var number = Number(value)
    if(!Number.isFinite(number)) return 0
    var factor = precision || 10
    return Math.round(number * factor) / factor
}

function multiplayerTransientEntityId(entity, prefix) {
    var id = multiplayerTransientEntityIds.get(entity)
    if(!id) {
        id = prefix + multiplayerNextTransientEntityId++
        multiplayerTransientEntityIds.set(entity, id)
    }
    return id
}

function multiplayerCreateCompactEntities(side) {
    return {
        bloons: bloons.filter(function(bloon) { return !side || bloon.playerSide == side }).map(function(bloon) {
            return [bloon.bloonID, multiplayerQuantize(bloon.x), multiplayerQuantize(bloon.y), multiplayerQuantize(bloon.pathPos, 100), multiplayerQuantize(bloon.health, 1), multiplayerQuantize(bloon.radius), multiplayerQuantize(bloon.drawRad), bloon.image, bloon.playerSide, multiplayerQuantize(bloon.iced), multiplayerQuantize(bloon.glued), multiplayerQuantize(bloon.stunned), multiplayerQuantize(bloon.dpsTicks, 1), bloon.dpsType, bloon.isAI === true]
        }),
        towers: towers.filter(function(tower) { return !side || tower.playerSide == side }).map(function(tower) {
            return [tower.towerID, multiplayerQuantize(tower.x), multiplayerQuantize(tower.y), tower.playerSide, tower.towerType, multiplayerQuantize(tower.radius), typeof tower.getImagePath == "function" ? tower.getImagePath() : "000" + tower.towerType + ".png", tower.selected === true, tower.path1Upgrades, tower.path2Upgrades, tower.path3Upgrades, multiplayerQuantize(tower.rotationAngle, 100)]
        }),
        projectiles: projectiles.filter(function(projectile) { return !side || projectile.playerSide == side }).map(function(projectile) {
            return [multiplayerTransientEntityId(projectile, "projectile-"), multiplayerQuantize(projectile.x), multiplayerQuantize(projectile.y), multiplayerQuantize(projectile.radius), projectile.image, multiplayerQuantize(projectile.rotationAngle, 100), projectile.playerSide]
        }),
        bananas: bananas.filter(function(banana) { return !side || banana.playerSide == side }).map(function(banana) {
            return [multiplayerTransientEntityId(banana, "banana-"), multiplayerQuantize(banana.x), multiplayerQuantize(banana.y), multiplayerQuantize(banana.radius), banana.image, banana.playerSide]
        }),
        subtowers: subtowers.filter(function(subtower) { return !side || subtower.playerSide == side }).map(function(subtower) {
            return [multiplayerTransientEntityId(subtower, "subtower-"), multiplayerQuantize(subtower.x), multiplayerQuantize(subtower.y), multiplayerQuantize(subtower.radius), subtower.towerType, multiplayerQuantize(subtower.rotationAngle, 100), subtower.playerSide]
        }),
    }
}

function multiplayerStoreCompactEntities(entities) {
    if(!entities || typeof entities != "object") return
    var targets = { bloons: {}, towers: {}, projectiles: {}, bananas: {}, subtowers: {} }
    var order = { bloons: [], towers: [], projectiles: [], bananas: [], subtowers: [] }
    var categories = ["bloons", "towers", "projectiles", "bananas", "subtowers"]
    for(var categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
        var category = categories[categoryIndex]
        var values = Array.isArray(entities[category]) ? entities[category] : []
        for(var valueIndex = 0; valueIndex < values.length; valueIndex++) {
            var value = values[valueIndex]
            if(!Array.isArray(value) || value[0] == null) continue
            var id = String(value[0])
            targets[category][id] = value
            order[category].push(id)
        }
    }
    multiplayerState.remoteEntityTargets = targets
    multiplayerState.remoteEntityOrder = order
}

function multiplayerShouldSuppressRemoteEntityDraw(entity) {
    if(!multiplayerState.active || !entity) return false
    if(multiplayerState.role == "spectator") return true
    return multiplayerState.role == "guest"
}

function multiplayerDrawRemoteEntities(categoryFilter) {
    if(!multiplayerState.active || !multiplayerState.remoteEntityTargets || gameOver) return
    var categories = categoryFilter ? [categoryFilter] : ["bloons", "towers", "projectiles", "bananas", "subtowers"]
    var renderState = multiplayerState.remoteEntityRenderState
    for(var categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
        var category = categories[categoryIndex]
        var targets = multiplayerState.remoteEntityTargets[category] || {}
        var current = renderState[category]
        var targetIds = multiplayerState.remoteEntityOrder[category] || Object.keys(targets)
        for(var targetIndex = 0; targetIndex < targetIds.length; targetIndex++) {
            var id = targetIds[targetIndex]
            var target = targets[id]
            if(!Array.isArray(target)) continue
            var position = current[id]
            if(!position) {
                position = { x: Number(target[1]) || 0, y: Number(target[2]) || 0 }
                current[id] = position
            }
            position.x += ((Number(target[1]) || 0) - position.x) * 0.45
            position.y += ((Number(target[2]) || 0) - position.y) * 0.45
            if(category == "bloons") {
                drawCenteredAsset(String(target[7] || "red.png"), position.x, position.y, Number(target[5]) || 25)
            } else if(category == "towers") {
                drawRotatedCenteredAsset(String(target[6] || "000" + target[4] + ".png"), position.x, position.y, Number(target[5]) || 30, Number(target[11]) || 0)
            } else if(category == "projectiles") {
                drawRotatedCenteredAsset(String(target[4] || ""), position.x, position.y, Number(target[3]) || 10, Number(target[5]) || 0)
            } else if(category == "bananas") {
                drawCenteredAsset(String(target[4] || "banana.png"), position.x, position.y, Number(target[3]) || 15)
            } else if(category == "subtowers") {
                drawRotatedCenteredAsset(String(target[4] || ""), position.x, position.y, Number(target[3]) || 15, Number(target[5]) || 0)
            }
        }
        var renderedIds = Object.keys(current)
        for(var renderedIndex = 0; renderedIndex < renderedIds.length; renderedIndex++) if(!Object.prototype.hasOwnProperty.call(targets, renderedIds[renderedIndex])) delete current[renderedIds[renderedIndex]]
    }
}

function multiplayerSnapshotIncludesScalar(key, side, includeShared) {
    if(key == "p1lives") return includeShared === true || side == PLAYER_SIDE.left
    if(key == "p2lives") return includeShared === true || side == PLAYER_SIDE.right
    if(key.indexOf("p1") == 0) return side == null || side == PLAYER_SIDE.left
    if(key.indexOf("p2") == 0) return side == null || side == PLAYER_SIDE.right
    return includeShared === true
}

function multiplayerShouldApplySnapshotScalar(key, isWorldSnapshot) {
    return true
}

function multiplayerRestoreAuthoritativeScalarsForDisplay() {
    var keys = Object.keys(multiplayerState.authoritativeScalars || {})
    for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) window[keys[keyIndex]] = multiplayerState.authoritativeScalars[keys[keyIndex]]
}

function multiplayerPrepareAuthoritativeDisplayScalars() {
    var runtimeValues = {}
    var keys = Object.keys(multiplayerState.authoritativeScalars || {})
    for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex]
        runtimeValues[key] = window[key]
        window[key] = multiplayerState.authoritativeScalars[key]
    }
    return runtimeValues
}

function multiplayerRestoreRuntimeScalars(runtimeValues) {
    var keys = Object.keys(runtimeValues || {})
    for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) window[keys[keyIndex]] = runtimeValues[keys[keyIndex]]
}

function multiplayerCreateSnapshot(side, includeShared, entitySide) {
    if(includeShared == null) includeShared = true
    var values = {}
    for(var scalarIndex = 0; scalarIndex < MULTIPLAYER_SNAPSHOT_SCALARS.length; scalarIndex++) {
        var key = MULTIPLAYER_SNAPSHOT_SCALARS[scalarIndex]
        if(!multiplayerSnapshotIncludesScalar(key, side, includeShared)) continue
        values[key] = multiplayerEncodeValue(window[key])
    }
    return {
        v: MULTIPLAYER_PROTOCOL_VERSION,
        build: MULTIPLAYER_BUILD,
        sequence: ++multiplayerState.snapshotSequence,
        side: side,
        scalars: values,
        loadouts: {
            p1Towers: p1Towers.slice(0),
            p2Towers: p2Towers.slice(0),
            p1BoostTypes: p1BoostTypes.slice(0),
            p2BoostTypes: p2BoostTypes.slice(0),
        },
        cursors: [{ x: cursor[0].x, y: cursor[0].y }, { x: cursor[1].x, y: cursor[1].y }],
        entities: multiplayerCreateCompactEntities(entitySide),
    }
}

function multiplayerCreateSideSnapshot(side) {
    var values = {}
    for(var scalarIndex = 0; scalarIndex < MULTIPLAYER_SNAPSHOT_SCALARS.length; scalarIndex++) {
        var key = MULTIPLAYER_SNAPSHOT_SCALARS[scalarIndex]
        if(!multiplayerSnapshotIncludesScalar(key, side, false)) continue
        values[key] = multiplayerEncodeValue(window[key])
    }
    return {
        v: MULTIPLAYER_PROTOCOL_VERSION,
        build: MULTIPLAYER_BUILD,
        sequence: ++multiplayerState.sideSnapshotSequence,
        side: side,
        scalars: values,
        entities: multiplayerCreateCompactEntities(side),
    }
}

function multiplayerApplySnapshot(snapshot, isWorldSnapshot, applyEntities, terminalOverride) {
    if(!snapshot || snapshot.v !== MULTIPLAYER_PROTOCOL_VERSION || snapshot.build != MULTIPLAYER_BUILD || !snapshot.scalars) return
    var sequence = Number(snapshot.sequence) || 0
    var lastSequenceKey = isWorldSnapshot ? "snapshotSequence" : "lastSideSnapshotReceivedSequence"
    if(sequence <= (multiplayerState[lastSequenceKey] || 0)) return
    multiplayerState[lastSequenceKey] = sequence
    if(isWorldSnapshot) multiplayerState.lastSnapshotReceivedAt = realNow()
    else multiplayerState.lastSideSnapshotReceivedAt = realNow()
    if(applyEntities !== false) multiplayerStoreCompactEntities(snapshot.entities)
    if(multiplayerState.role == "spectator" && snapshot.loadouts) {
        if(Array.isArray(snapshot.loadouts.p1Towers)) p1Towers = snapshot.loadouts.p1Towers.slice(0)
        if(Array.isArray(snapshot.loadouts.p2Towers)) p2Towers = snapshot.loadouts.p2Towers.slice(0)
        if(Array.isArray(snapshot.loadouts.p1BoostTypes)) p1BoostTypes = snapshot.loadouts.p1BoostTypes.slice(0)
        if(Array.isArray(snapshot.loadouts.p2BoostTypes)) p2BoostTypes = snapshot.loadouts.p2BoostTypes.slice(0)
        frontMenuState = "pregame"
    }
    if(multiplayerState.role == "spectator" && Array.isArray(snapshot.cursors)) {
        for(var cursorIndex = 0; cursorIndex < 2; cursorIndex++) if(snapshot.cursors[cursorIndex]) {
            cursor[cursorIndex].x = Number(snapshot.cursors[cursorIndex].x) || 0
            cursor[cursorIndex].y = Number(snapshot.cursors[cursorIndex].y) || 0
        }
    }
    multiplayerState.applyingSnapshot = true
    try {
        var previousMap = mapNumber
        var scalarKeys = Object.keys(snapshot.scalars)
        for(var scalarIndex = 0; scalarIndex < scalarKeys.length; scalarIndex++) {
            var scalarKey = scalarKeys[scalarIndex]
            if(multiplayerShouldApplySnapshotScalar(scalarKey, isWorldSnapshot) == false) continue
            var scalarValue = multiplayerDecodeValue(snapshot.scalars[scalarKey])
            if(scalarKey == "gameStarted" && scalarValue === true && gameStarted == false) continue
            window[scalarKey] = scalarValue
            multiplayerState.authoritativeScalars[scalarKey] = scalarValue
        }
        if(!isWorldSnapshot && snapshot.side == multiplayerState.remoteSide) {
            var remoteLives = multiplayerState.remoteSide == PLAYER_SIDE.left ? p1lives : p2lives
            if(terminalOverride === true || snapshot.terminal === true || Number(remoteLives) <= 0) {
                gameStarted = true
                gameOver = true
                multiplayerState.authoritativeScalars.gameStarted = true
                multiplayerState.authoritativeScalars.gameOver = true
                if(multiplayerState.remoteSide == PLAYER_SIDE.left) p1lives = 0
                else p2lives = 0
                multiplayerState.authoritativeScalars.p1lives = p1lives
                multiplayerState.authoritativeScalars.p2lives = p2lives
            }
        }
        if(previousMap != mapNumber && typeof layPathObjects == "function") layPathObjects()
    } finally {
        multiplayerState.applyingSnapshot = false
    }
}

function multiplayerSendSnapshotIfDue() {
    if(!isMultiplayerHost() || !multiplayerState.matchStarted || !multiplayerState.socket || multiplayerState.socket.readyState != WebSocket.OPEN) return
    var now = realNow()
    if(now < multiplayerState.lastSnapshotSentAt + MULTIPLAYER_SNAPSHOT_INTERVAL_MS) return
    multiplayerState.lastSnapshotSentAt = now
    multiplayerSendMessage("snapshot", { side: multiplayerState.localSide, snapshot: multiplayerCreateSnapshot(null, true, null) })
}

function multiplayerSendSideSnapshotIfDue() {
    if(!multiplayerState.active || multiplayerState.role != "guest" || !multiplayerState.socket || multiplayerState.socket.readyState != WebSocket.OPEN) return
    var now = realNow()
    var localLives = multiplayerState.localSide == PLAYER_SIDE.left ? p1lives : p2lives
    var terminal = gameOver === true || Number(localLives) <= 0
    if(!terminal && now < multiplayerState.lastSideSnapshotSentAt + MULTIPLAYER_SNAPSHOT_INTERVAL_MS) return
    if(terminal && multiplayerState.sideTerminalSent) return
    multiplayerState.lastSideSnapshotSentAt = now
    multiplayerSendMessage("sideSnapshot", { side: multiplayerState.localSide, terminal: terminal, snapshot: multiplayerCreateSideSnapshot(multiplayerState.localSide) })
    if(terminal) multiplayerState.sideTerminalSent = true
}

function multiplayerPublishSpectatorSnapshotIfDue(force) {
    if(!isMultiplayerHost() || !multiplayerState.lobbyId || !multiplayerState.participantToken) return
    if(multiplayerState.spectatorPublishInFlight) {
        if(force === true) multiplayerState.spectatorTerminalPublishPending = true
        return
    }
    var now = realNow()
    if(force !== true && now < multiplayerState.lastSpectatorPublishAt + 250) return
    multiplayerState.lastSpectatorPublishAt = now
    multiplayerState.spectatorPublishInFlight = true
    multiplayerDirectoryRequest("publish", "POST", {
        lobbyId: multiplayerState.lobbyId,
        participantToken: multiplayerState.participantToken,
        snapshot: multiplayerCreateSnapshot(null, true, null),
    }).catch(function(error) {
        if(multiplayerState.active) multiplayerSetStatus("Spectator stream is retrying...", error)
    }).finally(function() {
        multiplayerState.spectatorPublishInFlight = false
        if(multiplayerState.spectatorTerminalPublishPending && multiplayerState.active) {
            multiplayerState.spectatorTerminalPublishPending = false
            multiplayerPublishSpectatorSnapshotIfDue(true)
        }
    })
}

function multiplayerApplyTerminal(winner, reason) {
    if(multiplayerState.role != "guest") return
    if(winner == "tie") {
        gameOver = true
        gameStarted = true
        p1lives = 0
        p2lives = 0
        multiplayerState.authoritativeScalars.gameOver = true
        multiplayerState.authoritativeScalars.gameStarted = true
        multiplayerState.authoritativeScalars.p1lives = 0
        multiplayerState.authoritativeScalars.p2lives = 0
        multiplayerState.terminalSent = true
        return
    }
    var winningSide = winner == "right" || winner == PLAYER_SIDE.right ? PLAYER_SIDE.right : PLAYER_SIDE.left
    gameOver = true
    gameStarted = true
    if(winningSide == PLAYER_SIDE.left) { p1lives = Math.max(1, p1lives); p2lives = 0 }
    else { p2lives = Math.max(1, p2lives); p1lives = 0 }
    multiplayerState.authoritativeScalars.gameOver = true
    multiplayerState.authoritativeScalars.gameStarted = true
    multiplayerState.authoritativeScalars.p1lives = p1lives
    multiplayerState.authoritativeScalars.p2lives = p2lives
    multiplayerState.terminalSent = true
}

function multiplayerSendTerminalIfDue() {
    if(!isMultiplayerHost() || !multiplayerState.matchStarted || !gameOver || multiplayerState.terminalSent) return
    var winner = p1lives > p2lives ? "left" : p2lives > p1lives ? "right" : "tie"
    multiplayerState.terminalSent = true
    multiplayerSendMessage("end", { winner: winner, reason: "lives" })
}

function getMultiplayerMenuButtons() {
    return [{ id: "back", x: canvas.width / 2 - canvas.width / 10, y: canvas.height * 0.86, width: canvas.width / 5, height: canvas.height / 11, label: "Back" }]
}

function drawMultiplayerMenu() {
    ctx.fillStyle = "rgba(11, 18, 39, 0.88)"
    ctx.fillRect(canvas.width * 0.15, canvas.height * 0.16, canvas.width * 0.7, canvas.height * 0.68)
    ctx.strokeStyle = "rgba(151, 208, 255, 0.65)"
    ctx.lineWidth = 5
    ctx.strokeRect(canvas.width * 0.15, canvas.height * 0.16, canvas.width * 0.7, canvas.height * 0.68)
    ctx.textAlign = "center"
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.lineWidth = 7
    ctx.font = "42px Luckiest Guy"
    ctx.strokeText("Online Multiplayer", canvas.width / 2, canvas.height * 0.3, canvas.width * 0.6)
    ctx.fillText("Online Multiplayer", canvas.width / 2, canvas.height * 0.3, canvas.width * 0.6)
    ctx.font = "18px Arial"
    ctx.fillStyle = "rgba(220, 232, 250, 0.9)"
    var lobbyOverlayOpen = typeof multiplayerState != "undefined" && multiplayerState.overlay && !multiplayerState.overlay.hidden
    if(!lobbyOverlayOpen) {
        ctx.fillText("Browse open lobbies or create one below.", canvas.width / 2, canvas.height * 0.38, canvas.width * 0.7)
        ctx.fillText("Standard two-player mode. Pause is disabled online.", canvas.width / 2, canvas.height * 0.43, canvas.width * 0.7)
    }
    var button = getMultiplayerMenuButtons()[0]
    if(typeof multiplayerState == "undefined" || !multiplayerState.overlay || multiplayerState.overlay.hidden) drawFrontMenuButton(button, "rgba(143, 77, 62, 0.92)")
}

function multiplayerTick() {
    if(!multiplayerState.active || multiplayerState.role == "spectator") return
    multiplayerSendLocalCursor(false)
    multiplayerSmoothRemoteCursor()
    multiplayerSendLocalLoadoutIfChanged()
    multiplayerMaybeStartMatch()
}

var multiplayerBaseAnimate = typeof animate == "function" ? animate : null
if(multiplayerBaseAnimate) {
    animate = function() {
        multiplayerTick()
        if(gameOver && typeof multiplayerRestoreAuthoritativeScalarsForDisplay == "function") multiplayerRestoreAuthoritativeScalarsForDisplay()
        if(multiplayerState.tabInactive) {
            if(isMultiplayerHost()) multiplayerSendSnapshotIfDue()
            else multiplayerSendSideSnapshotIfDue()
            multiplayerPublishSpectatorSnapshotIfDue()
            nativeSetTimeout(animate, 100)
            return
        }
        var result = multiplayerBaseAnimate.apply(this, arguments)
        multiplayerSendSnapshotIfDue()
        multiplayerSendSideSnapshotIfDue()
        multiplayerSendTerminalIfDue()
        multiplayerPublishSpectatorSnapshotIfDue(gameOver === true)
        return result
    }
}

addEventListener("beforeunload", function() {
    multiplayerSendTransportMessage({ type: "leave" })
    if(multiplayerState.lobbyId && multiplayerState.participantToken && navigator.sendBeacon) {
        var body = new Blob([JSON.stringify({ lobbyId: multiplayerState.lobbyId, participantToken: multiplayerState.participantToken })], { type: "application/json" })
        navigator.sendBeacon(MULTIPLAYER_DIRECTORY_ENDPOINT + "&action=close", body)
    }
})

function openMultiplayerMenu() {
    if(multiplayerState.phase != "idle" && multiplayerState.phase != "disconnected") multiplayerLeave(false)
    multiplayerCreateOverlay()
    multiplayerState.phase = "idle"
    frontMenuState = "multiplayer"
    multiplayerShowOverlay()
}
