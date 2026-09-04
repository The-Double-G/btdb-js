# Distributed AI Training

## Architecture

Every generation starts from one immutable snapshot of the authoritative Hosted Model:

1. Prepare fetches and validates the schema-13 model and credential-free source manifest.
2. Deterministic Chromium workers train independent complete policy bundles from that exact snapshot.
3. The selector validates every unique shard against the same baseline and computes a deterministic policy average. A shard's normalized weight is proportional to `exp((built-in evaluation score - maximum shard score) * 8)`.
4. Materialization clones the hosted baseline and changes the aggregated policy bundle, strategy outcome records, generations, and bounded two-policy history. Neural tensors are score-weighted averages, each per-family training counter is the baseline count plus the sum of every shard's learned increment, and candidate-side strategy outcomes are accumulated across shards. Other shard stores are discarded.
5. Separate workers evaluate that exact candidate against the snapshot's frozen champion with learning and exploration disabled.
6. Aggregation requires balanced maps, candidate sides, and probe/responder roles, plus an absolute defensive-competence benchmark.
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

The hosted client recognizes InfinityFree's fixed AES browser challenge, derives its short-lived `__test` cookie locally, and retries the original same-origin request once. Other HTML responses and malformed challenges remain hard failures.

A healthy continuous run dispatches its successor before finishing. The watchdog reconciles at GitHub's five-minute scheduling minimum and starts training only when no default-branch generation is active. It refuses to start when an `ai-promotion/*` branch indicates an unresolved hosted/audit transaction. If GitHub holds a bot-created promotion PR for contributor approval, the trusted finalizer approves only the exact CI run whose workflow, bot actor, PR, base branch, promotion branch, and commit SHA match that transaction. After the squash merge, the finalizer dispatches and awaits CI on the new exact `main` SHA before successor handoff. If interruption leaves a verified checkpoint-only merge with no CI run, scheduled reconciliation creates that exact-SHA CI once; it does not retry a recorded CI failure. Three consecutive exact-SHA failures start a 30-minute cooldown measured from the latest completion; reconciliation automatically retries after the cooldown instead of permanently stopping.

Either enable variable is an immediate kill switch for automatic promotion, successor dispatch, and watchdog restarts. An already-running read-only generation may finish its report.

GitHub scheduling and hosted-runner availability are not real-time guarantees. The watchdog provides liveness recovery, not a permanent worker process.

## Trainer Status Publication

`Publish AI Training Status` receives the requested, in-progress, and completed `workflow_run` events for `Distributed AI Training` on `main`. Token-dispatched continuous runs also notify it explicitly, and a five-minute reconciliation schedule repairs missed notifications while refreshing worker progress. Manual dispatch with an optional training run ID provides the same repair path. The workflow runs only from current trusted `main` and never checks out a triggering revision.

The publisher creates the fixed `ai-status` branch from current `main` when it is absent, then publishes only `ai-training-status.json` there through the GitHub Contents API. Concurrent branch creation is accepted only after the fixed branch is confirmed to exist. The publisher never writes status commits to `main`, extracts an artifact into the workspace, or executes triggering code or artifact content.

The status document is an exact-key, versioned schema capped at 32 KiB. `current` identifies the newest accepted run attempt and projects its phase plus aggregate job, training-worker, and evaluation-worker counts when the attempt-specific jobs API is available. `latestEvaluation` and `latestPromotion` are independent retained records. A newer queued or running generation therefore does not erase the last validated frozen evaluation or hosted-promotion receipt.

Sources must identify the same repository, immutable training workflow ID and path, `workflow_dispatch` trigger, and `main` head branch. REST reconciliation does not trust the dynamic run title. Run number, run attempt, and lifecycle ordering prevent stale delivery from regressing the document. Reconciliation processes the newest completed run before the newest overall run, so completed evaluation and promotion evidence can advance without replacing a newer active generation. Completed-run artifacts are optional: the publisher reads only the allowlisted evaluation and receipt JSON members from bounded ZIP responses, validates them with the distributed-AI schemas, and preserves prior valid records when artifacts are absent, duplicated, malformed, oversized, stale, or mismatched. If the jobs API is unavailable, publication continues with a lifecycle-level phase and a null job projection.

## Promotion Safety

Continuous promotion requires:

- Fixed 58%/160-game minimums.
- Balanced map, side, and role coverage.
- Every map, side, and role score to meet the derived bucket floor, `minimum_score - 0.10`.
- Candidate survival to meet `minimum_score - 0.08` and severe collapses to stay at or below `1 - minimum_score - 0.15`. Survival means candidate lives remain above zero; a severe collapse means candidate lives reach zero while the opponent retains at least 75 lives.
- Absolute defense in frozen-champion responder matches: at least half the required games, at least 75% of responder matches finishing with 50 or more candidate lives, and no responder match finishing below 25 candidate lives.
- Exact baseline, candidate, and evaluation identities.
- Finite schema-13 policy parameters, the exact 31,048-parameter tensor contract, and size bounds.
- Browser, endpoint, distributed, deterministic replay, and exact-commit CI checks.
- A least-privilege policy-only credential.

Thresholds are rounded to 12 decimal places and clamped to `[0, 1]`. At the continuous 58% score gate, the bucket, survival, and severe-collapse gates are 48%, 50%, and 27%, respectively. Absolute defense requires 75% protected responder matches, at least 50 lives for protection, and a 25-life floor. Evaluation artifacts and trainer status retain these thresholds plus the observed worst bucket, survival rate, severe-collapse rate, average final lives, and responder protection rate.

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
- Workers fail on browser errors, hosted persistence, non-finite models, frame exhaustion, schema mismatch, more than three recoveries for one fairness slot, or aggregate recoveries above `max(3, ceil(matches / 8))`. A recovered attempt restarts the same fairness slot, remains visible in `metrics.stalls`, and is not counted as a game outcome.
- The model and hosted tooling enforce an 8 MiB maximum JSON size; public contributions remain capped at 128 KiB.
- Policy history is limited to two complete bundles.

Standard public-repository runner use is still subject to GitHub concurrency, job-duration, artifact, scheduling, and acceptable-use limits.
