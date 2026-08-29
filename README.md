# BTD Battles JS

A browser tower-defense game with adaptive AI, deterministic self-play, and distributed candidate evaluation.

The current game release is `v2.6.0`. One authoritative Hosted Model combines bounded public match contributions, Browser Lab contributions, and verified GitHub self-play promotions. Its schema-9 policy is a 19,011-parameter shared neural controller that ranks strategy and legal candidates across loadouts, placements, upgrades, sales, sends, and boosts.

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

GitHub Actions can run deterministic Chromium self-play without a laptop remaining online. Each generation fetches one immutable snapshot of the Hosted Model, and all workers train independent complete policy bundles from that exact snapshot with unique seeds. A balanced frozen evaluation gates a policy-only hosted promotion; `training/checkpoints/champion.json` records the checked promotion as an audit mirror.

See [DISTRIBUTED-AI.md](DISTRIBUTED-AI.md) for operation, checkpoint promotion, limits, and safety guarantees.

## Repository Safety

Runtime files under `data/`, browser automation captures, production credentials, and local screenshots are excluded from Git. Distributed workers run only on `127.0.0.1`, block hosted writes, and have read-only repository access. Only the protected publisher job receives a policy-promotion credential; it cannot perform full-model commits or resets.

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Notice

This is an unofficial fan project and is not affiliated with or endorsed by Ninja Kiwi. Bloons and related names and assets belong to their respective owners. No repository license is granted for third-party material; confirm redistribution rights before reusing code or assets.
