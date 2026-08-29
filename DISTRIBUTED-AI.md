# Distributed AI Training

## Architecture

Every generation starts from one immutable snapshot of the authoritative Hosted Model:

1. Prepare fetches and validates the schema-9 model and credential-free source manifest.
2. Deterministic Chromium workers train independent complete policy bundles from that exact snapshot.
3. The selector chooses one whole bundle with stable tie-breaking; weights are not averaged.
4. Materialization clones the hosted baseline and changes only the selected bundle, generations, and bounded two-policy history. Per-family bootstrap progress is part of that bundle; shard statistics and stores are discarded.
5. Separate workers evaluate that exact candidate against the snapshot's frozen champion with learning and exploration disabled.
6. Aggregation requires balanced maps, candidate sides, and probe/responder roles.
7. Exact-commit CI runs before a protected publisher can atomically promote the bundle to the Hosted Model.
8. `training/checkpoints/champion.json` advances only after hosted publication; it remains an audit mirror, not the authority.

Training and evaluation receive no production credential and cannot contact hosted persistence. Only the final `production-ai` publisher receives the policy-promotion key.

## Generation Size

Each training shard runs exactly 192 Browser Lab matches:

- 128 learning matches.
- 64 internal frozen evaluation matches.

Continuous operation uses 20 training shards, totaling 3,840 self-play matches per generation. External frozen evaluation uses 20 shards with 16 matches each, totaling 320 matches. A continuous candidate needs at least a 58% score over at least 160 balanced frozen games.

Manual defaults use eight shards, 192 training matches and 16 external evaluation matches per shard. Manual minimums default to 58% and 64 total games.

## Workflow Inputs

- `workers`: parallel training and evaluation shards.
- `training_matches`: exactly 192.
- `evaluation_matches`: a positive multiple of eight per shard.
- `base_seed`: optional deterministic first seed; continuous runs allocate their own block.
- `minimum_score`: frozen score gate.
- `minimum_games`: aggregate frozen sample gate.
- `continuous`: promote passing candidates and queue the next generation.

The retained `ai-training-bundle` artifact contains candidate, selection, evaluation, baseline, and hosted-source documents. Public artifacts may contain the publicly readable model and aggregate records, but never contribution tokens, guards, identifiers, address hashes, runtime envelopes, or credentials.

## 24/7 Operation

Required repository variables:

- `AI_HOSTED_ENDPOINT=https://btdbjs.rf.gd/ai-learning.php?protocol=1`
- `AI_HOSTED_PROMOTION_ENABLED=true`
- `AI_CONTINUOUS_TRAINING_ENABLED=true`

Required protected environment:

- Environment: `production-ai`
- Secret: `AI_POLICY_PROMOTION_KEY`

The matching server-side SHA-256 hash must be installed before hosted promotion is enabled.

A healthy continuous run dispatches its successor before finishing. The watchdog checks four times per hour and starts training only when no default-branch generation is active. It refuses to start when an `ai-promotion/*` branch indicates an unresolved hosted/audit transaction. A circuit breaker opens after three consecutive failed training runs instead of retrying forever.

Either enable variable is an immediate kill switch for automatic promotion, successor dispatch, and watchdog restarts. An already-running read-only generation may finish its report.

GitHub scheduling and hosted-runner availability are not real-time guarantees. The watchdog provides liveness recovery, not a permanent worker process.

## Promotion Safety

Continuous promotion requires:

- Fixed 58%/160-game minimums.
- Balanced map, side, and role coverage.
- Exact baseline, candidate, and evaluation identities.
- Finite schema-9 policy parameters and size bounds.
- Browser, endpoint, distributed, deterministic replay, and exact-commit CI checks.
- A least-privilege policy-only credential.

Ordinary contributions may continue while GitHub trains. Promotion conflicts only when the source epoch or frozen champion identity changed. Current aggregate records are preserved, and an independently changed live candidate is not overwritten. Replaying the same promotion is idempotent.

Hosted publication and Git cannot be atomic. If publication or finalization is uncertain, the exact tested temporary branch remains. Disable continuous operation and run **Promote AI Checkpoint** with reconciliation enabled. Reconciliation performs no hosted write; it advances the audit mirror only when the current hosted epoch and champion identity exactly match the evaluated candidate.

## Local Commands

```text
npm run ai:hosted -- --mode fetch --endpoint "https://btdbjs.rf.gd/ai-learning.php?protocol=1" --output training/output/baseline.json --manifest training/output/hosted-source.json
npm run ai:worker -- --mode train --checkpoint training/output/baseline.json --seed 1000 --shard local --matches 192 --output training/output/train.json
npm run ai:select -- --results-dir training/output --baseline training/output/baseline.json --output training/output/candidate.json
npm run ai:worker -- --mode evaluate --checkpoint training/output/candidate.json --baseline training/output/baseline.json --seed 100000 --shard eval-local --matches 32 --output training/output/eval.json
```

## Determinism And Limits

- Playwright and Chromium are pinned.
- Third-party Actions use immutable commit SHAs.
- Workers replace `Math.random` and `Date.now`, disable timers, and advance fixed 60 Hz frames.
- Rendering uses a no-op canvas.
- The local server rejects hidden/runtime data, non-loopback clients, and writes.
- Workers fail on browser errors, hosted persistence, non-finite models, stalls, discarded matches, frame exhaustion, or schema mismatch.
- The model and hosted tooling enforce an 8 MiB maximum JSON size; public contributions remain capped at 128 KiB.
- Policy history is limited to two complete bundles.

Standard public-repository runner use is still subject to GitHub concurrency, job-duration, artifact, scheduling, and acceptable-use limits.
