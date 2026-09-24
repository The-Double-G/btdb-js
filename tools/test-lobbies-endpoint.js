const assert = require("node:assert/strict")
const fs = require("node:fs")
const net = require("node:net")
const os = require("node:os")
const path = require("node:path")
const { spawn } = require("node:child_process")

const root = path.resolve(__dirname, "..")

async function reservePort() {
    const server = net.createServer()
    await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject))
    const port = server.address().port
    await new Promise(resolve => server.close(resolve))
    return port
}

async function request(endpoint, action, method, body, query) {
    const url = new URL(`${endpoint}?protocol=1&action=${action}`)
    for(const [key, value] of Object.entries(query || {})) url.searchParams.set(key, String(value))
    const response = await fetch(url, {
        method,
        headers: body == null ? {} : { "Content-Type": "application/json" },
        body: body == null ? undefined : JSON.stringify(body),
    })
    return { status: response.status, body: await response.json() }
}

async function waitForServer(url) {
    for(let attempt = 0; attempt < 80; attempt++) {
        try {
            const response = await fetch(url)
            if(response.status > 0) return
        } catch(error) {}
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error("Lobby PHP server did not start")
}

async function main() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "btdb-lobbies-"))
    fs.mkdirSync(path.join(tempRoot, "data"))
    fs.copyFileSync(path.join(root, "lobbies.php"), path.join(tempRoot, "lobbies.php"))
    const port = await reservePort()
    const endpoint = `http://127.0.0.1:${port}/lobbies.php`
    const server = spawn("php", ["-S", `127.0.0.1:${port}`, "-t", tempRoot], { stdio: ["ignore", "pipe", "pipe"] })
    let stderr = ""
    server.stderr.on("data", chunk => { stderr += chunk.toString() })

    try {
        await waitForServer(`${endpoint}?protocol=1&action=list`)
        const initial = await request(endpoint, "list", "GET")
        assert.equal(initial.status, 200)
        assert.deepEqual(initial.body.lobbies, [])

        const invalid = await request(endpoint, "create", "POST", { name: "" })
        assert.equal(invalid.status, 400)
        assert.equal(invalid.body.error.code, "invalid_lobby_name")

        const invalidSide = await request(endpoint, "create", "POST", { name: "Invalid Side", hostSide: 3 })
        assert.equal(invalidSide.status, 400)
        assert.equal(invalidSide.body.error.code, "invalid_host_side")

        const created = await request(endpoint, "create", "POST", { name: "Friday Match", hostSide: 2 })
        assert.equal(created.status, 200)
        assert.equal(created.body.role, "host")
        assert.equal(created.body.hostSide, 2)
        assert.match(created.body.lobby.lobbyId, /^[a-f0-9]{16}$/)
        assert.match(created.body.roomCode, /^\d{6}$/)
        assert.match(created.body.participantToken, /^[a-f0-9]{64}$/)
        const host = { lobbyId: created.body.lobby.lobbyId, participantToken: created.body.participantToken }

        const listed = await request(endpoint, "list", "GET")
        assert.equal(listed.body.lobbies.length, 1)
        assert.equal(listed.body.lobbies[0].name, "Friday Match")
        assert.equal("roomCode" in listed.body.lobbies[0], false)

        const joined = await request(endpoint, "join", "POST", { lobbyId: host.lobbyId })
        assert.equal(joined.status, 200)
        assert.equal(joined.body.role, "guest")
        assert.equal(joined.body.hostSide, 2)
        assert.equal(joined.body.lobby.players, 2)
        assert.match(joined.body.roomCode, /^\d{6}$/)
        const guest = { lobbyId: host.lobbyId, participantToken: joined.body.participantToken }

        const publishedSnapshot = { v: 1, build: "test", sequence: 1, scalars: [], entities: [] }
        const published = await request(endpoint, "publish", "POST", { ...host, snapshot: publishedSnapshot })
        assert.equal(published.status, 200)
        assert.equal(published.body.sequence, 1)

        const activeList = await request(endpoint, "list", "GET")
        assert.equal(activeList.body.lobbies.length, 1)
        assert.equal(activeList.body.lobbies[0].players, 2)
        assert.equal(activeList.body.lobbies[0].spectatable, true)

        const spectated = await request(endpoint, "spectate", "POST", { lobbyId: host.lobbyId })
        assert.equal(spectated.status, 200)
        assert.deepEqual(spectated.body.snapshot, publishedSnapshot)

        const guestPublish = await request(endpoint, "publish", "POST", { ...guest, snapshot: publishedSnapshot })
        assert.equal(guestPublish.status, 403)

        const full = await request(endpoint, "join", "POST", { lobbyId: host.lobbyId })
        assert.equal(full.status, 409)
        assert.equal(full.body.error.code, "lobby_full")

        const activeAfterFull = await request(endpoint, "list", "GET")
        assert.equal(activeAfterFull.body.lobbies.length, 1)
        assert.equal(activeAfterFull.body.lobbies[0].spectatable, true)

        const heartbeat = await request(endpoint, "heartbeat", "POST", { ...host, phase: "active" })
        assert.equal(heartbeat.status, 200)
        assert.equal(heartbeat.body.lobby.players, 2)

        const invalidToken = await request(endpoint, "heartbeat", "POST", { lobbyId: host.lobbyId, participantToken: "0".repeat(64) })
        assert.equal(invalidToken.status, 403)

        const guestClosed = await request(endpoint, "close", "POST", guest)
        assert.equal(guestClosed.status, 200)
        const reopened = await request(endpoint, "list", "GET")
        assert.equal(reopened.body.lobbies.length, 1)
        assert.equal(reopened.body.lobbies[0].spectatable, false)

        const hostClosed = await request(endpoint, "close", "POST", host)
        assert.equal(hostClosed.status, 200)
        const empty = await request(endpoint, "list", "GET")
        assert.deepEqual(empty.body.lobbies, [])

        if(stderr.includes("Fatal error") || stderr.includes("Parse error")) throw new Error(stderr)
        console.log("Lobby directory tests passed: creation, listing, hidden room keys, joining, token checks, heartbeats, reopening, and cleanup.")
    } finally {
        server.kill()
        fs.rmSync(tempRoot, { recursive: true, force: true })
    }
}

main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
})
