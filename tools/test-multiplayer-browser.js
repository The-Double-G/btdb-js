const assert = require("node:assert/strict")
const net = require("node:net")
const { spawn } = require("node:child_process")
const { chromium } = require("playwright")

const root = require("node:path").resolve(__dirname, "..")

async function reservePort() {
    const server = net.createServer()
    await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject))
    const port = server.address().port
    await new Promise(resolve => server.close(resolve))
    return port
}

async function main() {
    const port = await reservePort()
    const baseUrl = `http://127.0.0.1:${port}`
    const endpoint = `${baseUrl}/index.html`
    const server = spawn("php", ["-S", `127.0.0.1:${port}`, "-t", root], { stdio: ["ignore", "pipe", "pipe"] })
    let serverErrors = ""
    server.stderr.on("data", chunk => { serverErrors += chunk.toString() })
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const host = await context.newPage()
    const guest = await context.newPage()
    const spectator = await context.newPage()
    const expectedLobbyName = `Browser Test ${Date.now().toString(36)}`
    const pageErrors = []
    host.on("pageerror", error => pageErrors.push(`host: ${error.message}`))
    guest.on("pageerror", error => pageErrors.push(`guest: ${error.message}`))
    spectator.on("pageerror", error => pageErrors.push(`spectator: ${error.message}`))

    try {
        for(let attempt = 0; attempt < 80; attempt++) {
            try {
                const response = await fetch(endpoint)
                if(response.status > 0) break
            } catch(error) {}
            await new Promise(resolve => setTimeout(resolve, 100))
            if(attempt == 79) throw new Error("Multiplayer browser PHP server did not start")
        }
        await Promise.all([
            host.goto(`${baseUrl}/index.html?multiplayer-test=host`),
            guest.goto(`${baseUrl}/index.html?multiplayer-test=guest`),
            spectator.goto(`${baseUrl}/index.html?multiplayer-test=spectator`),
        ])
        await host.evaluate(() => openMultiplayerMenu())
        await host.locator("[data-multiplayer-name]").fill(expectedLobbyName)
        assert.deepEqual(await host.locator("[data-multiplayer-create]").allTextContents(), ["Host Left", "Host Right"])
        await host.locator('[data-multiplayer-create][data-host-side="2"]').click()
        await host.locator("[data-multiplayer-lobby-name]").waitFor({ timeout: 60000 })
        const lobbyName = await host.locator("[data-multiplayer-lobby-name]").textContent()
        assert.equal(lobbyName, expectedLobbyName)

        await guest.evaluate(() => openMultiplayerMenu())
        const guestLobby = guest.locator("[data-multiplayer-lobby-item]").filter({ hasText: expectedLobbyName })
        await guestLobby.waitFor({ timeout: 60000 })
        await guestLobby.locator("button").click()

        await Promise.all([
            host.waitForFunction(() => multiplayerState.active && multiplayerState.socket && multiplayerState.socket.readyState == WebSocket.OPEN, null, { timeout: 60000 }),
            guest.waitForFunction(() => multiplayerState.active && multiplayerState.socket && multiplayerState.socket.readyState == WebSocket.OPEN, null, { timeout: 60000 }),
        ])
        assert.deepEqual(await host.evaluate(() => ({ local: multiplayerState.localSide, remote: multiplayerState.remoteSide })), { local: 2, remote: 1 })
        assert.deepEqual(await guest.evaluate(() => ({ local: multiplayerState.localSide, remote: multiplayerState.remoteSide })), { local: 1, remote: 2 })

        const unauthorizedGuestCursor = await guest.evaluate(() => {
            const before = players[PLAYER_SIDE.right].cursor.x
            onkeydown({ keyCode: KEY_CODES.p2Left, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p2Left, type: "keyup" })
            return { before, after: players[PLAYER_SIDE.right].cursor.x }
        })
        assert.equal(unauthorizedGuestCursor.after, unauthorizedGuestCursor.before)
        const unauthorizedHostCursor = await host.evaluate(() => {
            const before = players[PLAYER_SIDE.left].cursor.x
            onkeydown({ keyCode: KEY_CODES.p1Right, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1Right, type: "keyup" })
            return { before, after: players[PLAYER_SIDE.left].cursor.x }
        })
        assert.equal(unauthorizedHostCursor.after, unauthorizedHostCursor.before)

        await host.evaluate(() => {
            const item = UITowers.find(entry => entry.image == "000dart.png" && entry.x > canvas.width / 2)
            selectPregameItemsAt(PLAYER_SIDE.right, item.x, item.y)
        })
        await guest.waitForFunction(() => p2Towers.length == 1)
        await guest.waitForFunction(() => !UITowers.some(entry => entry.image == "000dart.png" && entry.x > canvas.width / 2))
        await guest.evaluate(() => {
            const select = (collection, image) => {
                const item = collection.find(entry => entry.image == image && entry.x < canvas.width / 2)
                selectPregameItemsAt(PLAYER_SIDE.left, item.x, item.y)
            }
            ;["000dart.png", "000tack.png", "000bomb.png"].forEach(image => select(UITowers, image))
            ;["towerboost.png", "bloonboost.png"].forEach(image => select(UIBoosts, image))
        })
        await host.waitForFunction(() => p1Towers.length == 3 && p1BoostTypes.length == 2)
        await host.evaluate(() => {
            const select = (collection, image) => {
                const item = collection.find(entry => entry.image == image && entry.x > canvas.width / 2)
                selectPregameItemsAt(PLAYER_SIDE.right, item.x, item.y)
            }
            ;["000tack.png", "000bomb.png"].forEach(image => select(UITowers, image))
            ;["towerboost.png", "bloonboost.png"].forEach(image => select(UIBoosts, image))
        })

        await Promise.all([
            host.waitForFunction(() => multiplayerState.matchStarted && gameStarted),
            guest.waitForFunction(() => multiplayerState.matchStarted && gameStarted),
        ])

        await guest.evaluate(() => {
            p1money = 650
            p1eco = 0
            p1lives = 150
            players[PLAYER_SIDE.left].cursor.x = canvas.width / 4
            players[PLAYER_SIDE.left].cursor.y = canvas.height * 0.15
        })
        await host.evaluate(() => {
            p1money = 10000
            p1eco = 42
            p1lives = 99
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => p1money == 10000 && p1eco == 42 && p1lives == 99)
        await guest.evaluate(() => {
            p1money = 1
            p1eco = 0
            p1lives = 1
            multiplayerSendSideSnapshotIfDue()
        })
        await host.waitForTimeout(250)
        assert.deepEqual(await host.evaluate(() => ({ money: p1money, eco: p1eco, lives: p1lives })), { money: 10000, eco: 42, lives: 99 })
        await host.evaluate(() => {
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => p1money == 10000 && p1eco == 42 && p1lives == 99)
        await guest.evaluate(() => {
            onkeydown({ keyCode: KEY_CODES.p1Path1, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1Path1, type: "keyup" })
        })
        await host.waitForFunction(() => towers.some(tower => tower && tower.playerSide == PLAYER_SIDE.left && tower.towerType == "dart"))
        await guest.waitForFunction(() => Object.values(multiplayerState.remoteEntityTargets?.towers || {}).some(tower => tower[3] == multiplayerState.localSide && tower[4] == "dart"))
        let moneyConverged = false
        for(let moneyAttempt = 0; moneyAttempt < 40; moneyAttempt++) {
            const moneyPair = await Promise.all([host.evaluate(() => p1money), guest.evaluate(() => p1money)])
            if(moneyPair[0] == moneyPair[1]) {
                moneyConverged = true
                break
            }
            await guest.waitForTimeout(100)
        }
        assert.equal(moneyConverged, true)
        const guestLocalRender = await guest.evaluate(() => {
            const localTower = towers.find(tower => tower && tower.playerSide == multiplayerState.localSide && tower.towerType == "dart")
            const remoteTargets = Object.values(multiplayerState.remoteEntityTargets?.towers || {})
            return {
                localRuntimeTower: !!localTower,
                localEchoedByHost: remoteTargets.some(tower => tower[3] == multiplayerState.localSide),
            }
        })
        assert.equal(guestLocalRender.localRuntimeTower, false)
        assert.equal(guestLocalRender.localEchoedByHost, true)

        const selectableTowers = await host.evaluate(() => {
            const secondTower = new Tower(canvas.width / 3, canvas.height * 0.3, 30, 125, "tack", PLAYER_SIDE.left)
            secondTower.path1Upgrades = 2
            towers.push(secondTower)
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
            return towers.filter(tower => tower && tower.playerSide == PLAYER_SIDE.left).slice(-2).map(tower => ({ id: String(tower.towerID), x: tower.x, y: tower.y }))
        })
        await guest.waitForFunction(ids => ids.every(id => multiplayerState.remoteEntityTargets.towers[id]), selectableTowers.map(tower => tower.id))
        for(let towerIndex = 0; towerIndex < selectableTowers.length; towerIndex++) {
            if(towerIndex > 0) await host.waitForTimeout(350)
            const selectedTower = selectableTowers[towerIndex]
            const optimisticSelection = await guest.evaluate(tower => {
                players[PLAYER_SIDE.left].cursor.x = tower.x
                players[PLAYER_SIDE.left].cursor.y = tower.y
                onkeydown({ keyCode: KEY_CODES.p1Select, type: "keydown" })
                onkeyup({ keyCode: KEY_CODES.p1Select, type: "keyup" })
                return Object.keys(multiplayerState.remoteEntityTargets.towers).filter(id => multiplayerState.remoteEntityTargets.towers[id][7] === true)
            }, selectedTower)
            assert.deepEqual(optimisticSelection, [selectedTower.id])
            await host.waitForFunction(id => towers.some(tower => tower && String(tower.towerID) == id && tower.selected), selectedTower.id)
            await guest.waitForFunction(id => Object.keys(multiplayerState.remoteEntityTargets.towers).filter(towerId => multiplayerState.remoteEntityTargets.towers[towerId][7] === true).join(",") == id, selectedTower.id)
        }
        assert.deepEqual(await guest.evaluate(() => {
            const proxy = multiplayerCreateGuestSelectionDisplayProxy()
            return proxy && { type: proxy.towerType, path1: proxy.path1Upgrades, selected: proxy.selected, side: proxy.playerSide }
        }), { type: "tack", path1: 2, selected: true, side: 1 })

        const remoteRenderProfile = await guest.evaluate(() => {
            const emptyEntities = () => ({ towers: [], projectiles: [], bananas: [], subtowers: [] })
            const bloon = (id, x, y, pathPos) => [id, x, y, pathPos, 1, 25, 25, "red.png", PLAYER_SIDE.left, 1, 1, 0, 0, 0, false]
            multiplayerStoreCompactEntities(Object.assign({ bloons: [bloon("first", 100, 100, 1), bloon("pre-track", -1000, 0, 0), bloon("last", 300, 300, 1)] }, emptyEntities()))
            const order = multiplayerRemoteEntityIdsForDraw("bloons")
            const preTrackHidden = !multiplayerState.remoteEntityRenderState.bloons["pre-track"]
            const interpolation = { fromX: 0, fromY: 0, toX: 100, toY: 50, fromRotationAngle: 0, toRotationAngle: 0, receivedAt: 0 }
            multiplayerInterpolateRemoteEntity(interpolation, MULTIPLAYER_REMOTE_INTERPOLATION_MS / 2)
            multiplayerStoreCompactEntities(Object.assign({ bloons: [bloon("pre-track", 420, 260, 1)] }, emptyEntities()))
            const firstVisiblePosition = multiplayerState.remoteEntityRenderState.bloons["pre-track"]
            return {
                order,
                preTrackHidden,
                interpolation: { x: interpolation.x, y: interpolation.y },
                firstVisiblePosition: { x: firstVisiblePosition.x, y: firstVisiblePosition.y },
            }
        })
        assert.deepEqual(remoteRenderProfile.order, ["last", "pre-track", "first"])
        assert.equal(remoteRenderProfile.preTrackHidden, true)
        assert.deepEqual(remoteRenderProfile.interpolation, { x: 50, y: 25 })
        assert.deepEqual(remoteRenderProfile.firstVisiblePosition, { x: 420, y: 260 })

        const popEventID = await host.evaluate(() => {
            images.push(new Images(321, 222, 25, "pop.png", gameNow() + 100, ""))
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
            return multiplayerState.popEffects[multiplayerState.popEffects.length - 1].id
        })
        await guest.waitForFunction(id => images.some(image => image.multiplayerRemotePop === true && image.x == 321 && image.y == 222) && multiplayerState.receivedPopEffects[id], popEventID)
        assert.equal(await host.evaluate(() => images.some(image => image.multiplayerRemotePop === true)), false)
        await host.evaluate(() => {
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForTimeout(25)
        assert.equal(await guest.evaluate(() => images.filter(image => image.multiplayerRemotePop === true && image.x == 321 && image.y == 222).length), 1)

        await spectator.evaluate(() => openMultiplayerMenu())
        const spectatorLobby = spectator.locator("[data-multiplayer-lobby-item]").filter({ hasText: expectedLobbyName })
        await spectatorLobby.waitFor({ timeout: 60000 })
        assert.match(await spectatorLobby.innerText(), /Spectate/)
        await spectatorLobby.locator("button").click()
        await spectator.waitForFunction(() => multiplayerState.role == "spectator" && multiplayerState.active && multiplayerState.lastSnapshotReceivedAt > 0 && gameStarted, null, { timeout: 60000 })
        const spectatorInput = await spectator.evaluate(() => {
            const before = players[PLAYER_SIDE.left].cursor.x
            onkeydown({ keyCode: KEY_CODES.p1Right, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1Right, type: "keyup" })
            return { before, after: players[PLAYER_SIDE.left].cursor.x }
        })
        assert.equal(spectatorInput.after, spectatorInput.before)
        const snapshotProfile = await host.evaluate(() => {
            const snapshot = multiplayerCreateSnapshot(null, true, null)
            return { bytes: JSON.stringify({ v: 1, type: "snapshot", snapshot }).length, bloons: snapshot.entities.bloons.length }
        })
        assert.equal(snapshotProfile.bytes < 100000, true)
        await guest.waitForFunction(() => multiplayerState.remoteEntityTargets && multiplayerState.remoteEntityTargets.bloons)
        if(snapshotProfile.bloons > 0) await guest.waitForFunction(count => Object.keys(multiplayerState.remoteEntityTargets.bloons).length >= count, snapshotProfile.bloons)
        const guestEntityProfile = await guest.evaluate(() => ({
            remoteSide: multiplayerState.remoteSide,
            bloonSides: Object.values(multiplayerState.remoteEntityTargets.bloons).map(bloon => bloon[8]),
            towerSides: Object.values(multiplayerState.remoteEntityTargets.towers).map(tower => tower[3]),
        }))
        assert.equal(guestEntityProfile.bloonSides.every(side => side == 1 || side == 2), true)
        assert.equal(guestEntityProfile.towerSides.every(side => side == 1 || side == 2), true)

        await host.evaluate(() => {
            bloons.push(new Bloon(-1000, 0, 25, 0, 1, 1, 1, 1, PLAYER_SIDE.left, true, false, 0, 0, 0, 0, 0, 0))
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => Object.values(multiplayerState.remoteEntityTargets.bloons || {}).some(bloon => bloon[8] == PLAYER_SIDE.left && bloon[14] === true))

        await host.evaluate(() => {
            const upgradedTower = new Tower(canvas.width * 3 / 4, canvas.height / 2, 30, 125, "dart", PLAYER_SIDE.right)
            upgradedTower.path1Upgrades = 1
            towers.push(upgradedTower)
        })
        await guest.waitForFunction(() => Object.values(multiplayerState.remoteEntityTargets.towers || {}).some(tower => tower[6] == "100dart.png"))

        await host.evaluate(() => {
            p1BoostTypes = ["towerboost.png", "bloonboost.png"]
            p1Boost1Count = 1
            p1Boost1Expires = -100000
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => p1Boost1Count == 1)
        await guest.evaluate(() => {
            onkeydown({ keyCode: KEY_CODES.p1Boost1, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1Boost1, type: "keyup" })
        })
        try {
            await host.waitForFunction(() => p1Boost1Count == 0 && p1TowerBoostVisual > 0)
        } catch(error) {
            const boostDiagnostic = await Promise.all([
                host.evaluate(() => ({ p1Boost1Count, p1TowerBoostVisual, p1Boost1Expires, cache: multiplayerState.authoritativeScalars.p1Boost1Count })),
                guest.evaluate(() => ({ p1Boost1Count, p1TowerBoostVisual, p1Boost1Expires, cache: multiplayerState.authoritativeScalars.p1Boost1Count })),
            ])
            throw new Error(`${error.message}; boost diagnostic: ${JSON.stringify(boostDiagnostic)}`)
        }

        const tabPause = await host.evaluate(() => {
            const before = gameNow()
            multiplayerSetTabInactive(true)
            return { before, paused: gamePaused, inactive: multiplayerState.tabInactive }
        })
        assert.equal(tabPause.paused, true)
        assert.equal(tabPause.inactive, true)
        await host.waitForTimeout(250)
        const tabAfter = await host.evaluate(() => gameNow())
        assert.equal(tabAfter - tabPause.before < 50, true)
        await host.evaluate(() => multiplayerSetTabInactive(false))
        await host.evaluate(() => {
            gameOver = false
            p1lives = Infinity
            p2lives = Infinity
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => p2lives === Infinity && p1lives === Infinity)

        const guestCursorAfter = await guest.evaluate(() => {
            onkeydown({ keyCode: KEY_CODES.p1Left, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1Left, type: "keyup" })
            return players[PLAYER_SIDE.left].cursor.x
        })
        await host.waitForFunction(target => Math.abs(players[PLAYER_SIDE.left].cursor.x - target) < 1, guestCursorAfter)

        const guestBloonBefore = await host.evaluate(() => p1SelectedBloon)
        await guest.evaluate(() => {
            onkeydown({ keyCode: KEY_CODES.p1BloonNext, type: "keydown" })
            onkeyup({ keyCode: KEY_CODES.p1BloonNext, type: "keyup" })
        })
        await guest.waitForFunction(before => p1SelectedBloon != before, guestBloonBefore)
        const guestBloonAfter = await guest.evaluate(() => p1SelectedBloon)
        await host.waitForFunction(target => p1SelectedBloon == target, guestBloonAfter)

        await guest.waitForFunction(() => multiplayerState.lastSnapshotReceivedAt > 0 && multiplayerState.snapshotSequence > 0)
        const snapshotState = await Promise.all([
            host.evaluate(() => ({ lives: p2lives, round, gameStarted, gameOver })),
            guest.evaluate(() => ({ lives: p2lives, round, gameStarted, gameOver, snapshots: multiplayerState.snapshotSequence })),
        ])
        assert.equal(snapshotState[1].lives, snapshotState[0].lives)
        assert.equal(snapshotState[1].round, snapshotState[0].round)
        assert.equal(snapshotState[1].gameStarted, true)
        assert.equal(snapshotState[1].snapshots > 0, true)

        await host.evaluate(() => {
            p1lives = 0
            gameOver = true
            multiplayerState.lastSnapshotSentAt = 0
            multiplayerSendSnapshotIfDue()
        })
        await guest.waitForFunction(() => gameOver && p1lives == 0)

        const finalState = await guest.evaluate(() => ({ gameOver, p1lives, p2lives, message: multiplayerState.error || "" }))
        assert.equal(finalState.gameOver, true)
        assert.equal(finalState.p1lives, 0)
        assert.equal(finalState.message, "")

        try {
            await spectator.waitForFunction(() => gameOver, null, { timeout: 60000 })
        } catch(error) {
            const diagnostic = await Promise.all([
                host.evaluate(() => ({ phase: multiplayerState.phase, active: multiplayerState.active, gameOver, p1lives, p2lives, snapshotSequence: multiplayerState.snapshotSequence, lastPublish: multiplayerState.lastSpectatorPublishAt })),
                spectator.evaluate(() => ({ phase: multiplayerState.phase, active: multiplayerState.active, role: multiplayerState.role, gameOver, gameStarted, p1lives, p2lives, snapshotSequence: multiplayerState.snapshotSequence, spectatorSequence: multiplayerState.spectatorSnapshotSequence, authoritative: multiplayerState.authoritativeScalars })),
            ])
            throw new Error(`${error.message}; spectator terminal diagnostic: ${JSON.stringify(diagnostic)}`)
        }
        await spectator.locator("[data-multiplayer-spectator-exit]").click()
        await spectator.waitForFunction(() => multiplayerState.role == "" && multiplayerState.active == false && frontMenuState == "mode" && gameStarted == false && gameOver == false)
        await spectator.waitForTimeout(400)
        assert.equal(await spectator.locator("#multiplayer-spectator-bar").isHidden(), true)

        await host.evaluate(() => {
            multiplayerSendTransportMessage({ type: "leave" })
            multiplayerOnPeerDisconnected("The other player left the game.")
        })
        await host.waitForFunction(() => frontMenuState == "mode" && gameStarted == false && gameOver == false && multiplayerState.phase == "disconnected")
        const notice = host.locator("[data-multiplayer-notice]")
        await notice.waitFor()
        assert.equal(await notice.locator("[data-multiplayer-notice-title]").textContent(), "Player left the game")
        assert.equal(await notice.locator("[data-multiplayer-notice-message]").textContent(), "The other player left the game.")
        await notice.locator("[data-multiplayer-notice-ok]").click()
        await host.waitForFunction(() => multiplayerState.phase == "idle" && frontMenuState == "mode" && gameStarted == false && gameOver == false && multiplayerState.overlay.hidden)
        await guest.waitForFunction(() => frontMenuState == "mode" && gameStarted == false && gameOver == false)
        await guest.evaluate(() => multiplayerDismissNotice())
        if(serverErrors.includes("Fatal error") || serverErrors.includes("Parse error")) throw new Error(serverErrors)
        if(pageErrors.length > 0) throw new Error(`Multiplayer browser page errors: ${pageErrors.join(" | ")}`)
        console.log("Multiplayer browser tests passed: room handshake, loadouts, match start, remote input, snapshots, terminal state, and cleanup.")
    } finally {
        await browser.close()
        server.kill()
    }
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
