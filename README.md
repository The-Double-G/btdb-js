# BTD Battles JS

A browser tower-defense game with adaptive AI, deterministic self-play, and distributed candidate evaluation.

The current game release is `v2.5.3`. The hosted AI uses bounded public match contributions, revisioned model storage, contribution epochs, and authenticated administrative resets.

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

GitHub Actions can run deterministic Chromium self-play without a laptop remaining online. Workers start from one shared checkpoint and train independent policies with unique seeds. Selection materializes only the winning policy into a clone of the baseline model, and a balanced frozen evaluation compares that exact checkpoint with the current champion. An hourly watchdog keeps a bounded continuous generation loop alive; only passing, current-branch candidates can advance the committed champion.

See [DISTRIBUTED-AI.md](DISTRIBUTED-AI.md) for operation, checkpoint promotion, limits, and safety guarantees.

## Repository Safety

Runtime files under `data/`, browser automation captures, production credentials, and local screenshots are excluded from Git. Distributed workers run only on `127.0.0.1`, block hosted writes, and have read-only repository access. Separate least-privilege promotion jobs can commit only a verified checkpoint; no workflow can deploy a model or access production.

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Notice

This is an unofficial fan project and is not affiliated with or endorsed by Ninja Kiwi. Bloons and related names and assets belong to their respective owners. No repository license is granted for third-party material; confirm redistribution rights before reusing code or assets.
