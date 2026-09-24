# BTD Battles JS

A browser tower-defense game with adaptive AI, deterministic self-play, and distributed candidate evaluation.

The current game release is `v2.6.0`. One authoritative Hosted Model combines bounded public match contributions, semantic Local human tactical priors, Browser Lab contributions, and verified GitHub self-play promotions. Its schema-14 `semantic-intent-spatial-recurrent-actor-critic-v6` policy has 33,450 parameters, ranks 128-value decision states and legal candidates across loadouts, placements, upgrades, sales, sends, and boosts, and learns credit-version-4 four-step value, economy, catastrophe, and final-life survival targets.

## Run Locally

Serve the repository over localhost and open `index.html`. Localhost sessions deliberately use session-only AI learning and never contact the hosted model.

```text
php -S 127.0.0.1:8000
```

Open `http://127.0.0.1:8000/`.

## Validation

```text
npm ci
npm test
npm run test:endpoint
```

The endpoint integration test also requires PHP on `PATH`.

## Distributed AI

GitHub Actions can run deterministic Chromium self-play without a laptop remaining online. Each generation fetches one immutable snapshot of the Hosted Model, and all workers train independent complete policy bundles from that exact snapshot with unique seeds. Their validated policies are combined into one deterministic score-weighted aggregate. A balanced frozen evaluation gates a policy-only hosted promotion; `training/checkpoints/champion.json` records the checked promotion as an audit mirror.

See [DISTRIBUTED-AI.md](DISTRIBUTED-AI.md) for operation, checkpoint promotion, limits, and safety guarantees.

## Online Multiplayer

The Multiplayer menu supports casual two-player standard matches. Players can create or browse named public lobbies; active matches remain listed for read-only spectators. `lobbies.php` maintains the lobby directory and spectator snapshots over HTTPS, while the Render-hosted secure WebSocket relay at `wss://cursor-share-server.onrender.com/` carries player traffic over HTTPS-compatible port 443 for restrictive networks such as school networks. The six-digit WebSocket key stays internal to the lobby service. Each peer owns its assigned side, while the host also publishes shared match timing and referee state; spectators receive snapshots with all input disabled. Both players choose three towers and two boosts locally. Online pause, boss mode, mastery, and host migration are intentionally not enabled in this v1 mode.

## Repository Safety

Runtime files under `data/`, browser automation captures, production credentials, and local screenshots are excluded from Git. Distributed workers run only on `127.0.0.1`, block hosted writes, and have read-only repository access. Only the protected publisher job receives a policy-promotion credential; it cannot perform full-model commits or resets.

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Notice

This is an unofficial fan project and is not affiliated with or endorsed by Ninja Kiwi. Bloons and related names and assets belong to their respective owners. No repository license is granted for third-party material; confirm redistribution rights before reusing code or assets.
