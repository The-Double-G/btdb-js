# Distributed AI Training

## Architecture

Each training run uses a generation-based population workflow:

1. The prepare job fetches the authoritative Hosted Model once and packages it as an immutable baseline checkpoint and credential-free source manifest.
2. Workers receive unique PRNG seeds and train independent candidates in deterministic headless Chromium.
3. The selector validates every shard against that exact baseline and chooses one source policy with stable tie-breaking.
4. The selector materializes a policy-only checkpoint from the hosted baseline. Only the selected policy, generations, and bounded population history change; shard statistics and learned stores are discarded.
5. Separate workers evaluate that exact materialized checkpoint against the snapshot's frozen champion with learning and exploration disabled.
6. The report aggregates results by map, candidate side, and candidate responder role and requires balanced coverage.
7. A candidate is promotable only when the frozen evaluation passes strict identity, coverage, game-count, and score checks. A protected publisher then promotes its policy to the Hosted Model before the repository audit mirror is updated.

Workers do not average neural-network weights and cannot write to the hosted PHP endpoint. Increasing the worker count increases candidate diversity without introducing concurrent model corruption. Only the final protected publisher receives the policy-promotion credential.

## Run On GitHub

Open the repository's **Actions** tab, select **Distributed AI Training**, and choose **Run workflow**.

Inputs:

- `workers`: parallel candidate and evaluation shards.
- `training_matches`: exactly 96 self-play matches per candidate: one 64-train/32-evaluate cycle.
- `evaluation_matches`: frozen matches per evaluation shard; this must be a positive multiple of eight.
- `base_seed`: optional first deterministic seed; blank allocates a unique block from the workflow run number.
- `minimum_score`: frozen evaluation score required for promotion.
- `minimum_games`: minimum total frozen evaluation sample.
- `continuous`: queue another generation after completion and automatically promote a passing candidate.

The `ai-training-bundle` artifact contains:

- `candidate.json`
- `candidate.selection.json`
- `evaluation.json`
- `evaluation.md`
- `baseline.json`
- `hosted-source.json`

Artifacts are public in a public repository and have short retention. The baseline contains the publicly readable model, including aggregate human-derived records. The source manifest contains only model identity and revision metadata. Neither may contain contribution tokens, private state envelopes, guards, contribution identifiers, rate-limit records, client hashes, or secrets.

## Continuous Operation

Configure repository variable `AI_HOSTED_ENDPOINT` with the HTTPS `ai-learning.php?protocol=1` URL. Configure the protected `production-ai` environment secret `AI_POLICY_PROMOTION_KEY`, and set repository variable `AI_HOSTED_PROMOTION_ENABLED` to `true` only after the matching server-side key hash is installed.

Set `AI_CONTINUOUS_TRAINING_ENABLED` to `true` to enable unattended operation. Set either enable variable to `false` to stop automatic promotion, successor dispatch, and watchdog restarts; an already-running read-only generation may still finish and publish its report. Continuous runs are accepted only from the repository's default branch.

The **Continuous AI Training Watchdog** runs at minute 17 of each hour. It checks the 100 most recent default-branch training runs and starts a continuous run only when none is active. Default-branch training is serialized, so active work normally remains at the top of that list. A healthy continuous run queues its successor before it finishes, making the watchdog a liveness fallback rather than a source of overlapping work.

Continuous defaults use 20 training shards with 96 matches each and 20 evaluation shards with 16 matches each. This targets the 20-job standard-runner concurrency ceiling on GitHub Free; GitHub queues shards when other jobs consume part of that allowance. Each newly dispatched generation receives a deterministic seed block derived from its workflow run number; rerunning one generation intentionally reuses that block. Explicit seeds are rejected in continuous mode. The 32-bit allocator supports 42,934 workflow run numbers, after which configuration validation stops the chain rather than reusing seeds. Failed candidates leave `champion.json` unchanged and the next new generation explores a new block.

A passing continuous candidate is promoted only after the fixed 56% score, 32-game minimum, balanced coverage, checkpoint identity, endpoint, browser, and deterministic checks pass. A write-scoped job creates a checkpoint-only temporary commit and requires CI on that exact SHA. The protected read-only publisher revalidates the bundle and applies only the policy promotion to the Hosted Model. The finalizer then pushes the same checked commit to `main` as the audit mirror and removes the temporary branch.

The endpoint compares the source contribution epoch and frozen champion identity, not the constantly changing hosted revision. Ordinary contributions may therefore continue during training. Promotion preserves current statistics and stores; if public play changed the live candidate policy after the snapshot, that newer candidate is retained while the verified GitHub policy becomes the new `championPolicy`. A reset or competing promotion causes a conflict instead of an overwrite. Replaying the same successful promotion is idempotent.

Hosted publication and the Git push cannot form one atomic transaction. The endpoint operation is idempotent, receipt upload is best-effort, the training bundle is retained for 90 days, and the exact CI-tested temporary branch is deleted only after its audit commit reaches the default branch. If publication or finalization becomes uncertain, the branch is retained. Disable continuous training, run **Promote AI Checkpoint** with the original training run ID, and enable `reconcile_hosted_promotion`. Reconciliation performs no endpoint write: it advances the audit mirror only when the current hosted champion and contribution epoch exactly match the evaluated candidate and source epoch.

Protect `main` with the `validate` and `headless-smoke` CI jobs as required status checks. Promotion commits already carry those checks from their temporary branch before they reach `main`.

GitHub schedules can be delayed, and public-repository schedules can be disabled after prolonged repository inactivity. The hourly watchdog restarts a stopped chain, but GitHub Actions is not a guaranteed real-time service.

## Promote A Checkpoint

Manually dispatched non-continuous runs remain separate from promotion:

1. Review `evaluation.md` from a completed training run.
2. Copy the workflow run ID from its URL.
3. Open **Promote AI Checkpoint** in Actions.
4. Run it with that training run ID.

Manual promotion is disabled while `AI_CONTINUOUS_TRAINING_ENABLED` is `true`, preventing it from racing the automatic transaction. Normally the workflow accepts only a successful `workflow_dispatch` training run from the exact current default-branch commit. It validates the candidate against the bundled hosted baseline, requires at least 32 balanced games and a 56% score, requires CI on the exact checkpoint-only commit, publishes through the same protected hosted policy endpoint, and only then updates the audit mirror on `main`. Reconciliation mode also accepts a completed failed run from an ancestor commit, but only the read-only exact hosted-champion check described above can authorize its audit update.

## Local Commands

Fetch an immutable hosted baseline:

```text
npm run ai:hosted -- --mode fetch --endpoint "https://example.invalid/ai-learning.php?protocol=1" --output training/output/baseline.json --manifest training/output/hosted-source.json
```

Train one candidate:

```text
npm run ai:worker -- --mode train --checkpoint training/output/baseline.json --seed 1000 --shard local --matches 96 --output training/output/train.json
```

Select and materialize a policy-only candidate from the baseline:

```text
npm run ai:select -- --results-dir training/output --baseline training/output/baseline.json --output training/output/candidate.json
```

Run frozen evaluation:

```text
npm run ai:worker -- --mode evaluate --checkpoint training/output/candidate.json --baseline training/output/baseline.json --seed 100000 --shard eval-local --matches 32 --output training/output/eval.json
```

## Determinism And Safety

- Playwright and Chromium are pinned through `package-lock.json`.
- Third-party GitHub Actions are pinned to immutable commit SHAs.
- `Math.random` and `Date.now` are replaced before game scripts load.
- Browser timers are disabled; the worker advances the game at fixed `1000 / 60` millisecond steps.
- Rendering uses a no-op canvas context.
- The local server rejects `data/`, hidden files, non-loopback clients, and write methods.
- Workers fail on hosted persistence, browser errors, non-finite models, stalls, discarded matches, frame exhaustion, or schema mismatches.
- Match scheduling covers both maps, both candidate sides, and both candidate responder roles over eight matches. Promotion requires balanced aggregate coverage for all three dimensions.

## Scaling

The continuous loop uses 20 workers, totaling 1,920 training matches and 320 frozen evaluation matches per generation. The first hosted two-worker generation took about 74 minutes wall-clock; 20 workers primarily increase candidate diversity and total runner use rather than making one candidate train faster. GitHub performance and account-wide runner availability determine how many shards start immediately.

Standard public GitHub-hosted runners do not consume the private-repository monthly minute allowance, but GitHub concurrency, six-hour job duration, artifact storage, and acceptable-use limits still apply.
