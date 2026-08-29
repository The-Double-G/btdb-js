# Distributed AI Training

## Architecture

Each training run uses a generation-based population workflow:

1. Every worker loads the same committed champion checkpoint.
2. Workers receive unique PRNG seeds and train independent candidates in deterministic headless Chromium.
3. The selector validates every shard against that exact baseline and chooses one source policy with stable tie-breaking.
4. The selector materializes a policy-only checkpoint from the baseline model. Only the selected policy, generations, and bounded population history change; shard statistics and learned stores are discarded.
5. Separate workers evaluate that exact materialized checkpoint against the original frozen champion with learning and exploration disabled.
6. The report aggregates results by map, candidate side, and candidate responder role and requires balanced coverage.
7. A candidate is promotable only when the frozen evaluation passes strict identity, coverage, game-count, and score checks.

Workers do not average neural-network weights and do not write to the hosted PHP endpoint. Increasing the worker count increases candidate diversity without introducing concurrent model corruption.

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

Artifacts are public in a public repository and have short retention. They must never contain production guards, tokens, secrets, client hashes, or mutable hosted state.

## Continuous Operation

Set the repository Actions variable `AI_CONTINUOUS_TRAINING_ENABLED` to `true` to enable unattended operation. Set it to `false` to stop automatic promotion, successor dispatch, and watchdog restarts; an already-running read-only training generation may still finish and publish its report. Continuous runs are accepted only from the repository's default branch.

The **Continuous AI Training Watchdog** runs at minute 17 of each hour. It checks the 100 most recent default-branch training runs and starts a continuous run only when none is active. Default-branch training is serialized, so active work normally remains at the top of that list. A healthy continuous run queues its successor before it finishes, making the watchdog a liveness fallback rather than a source of overlapping work.

Continuous defaults use 20 training shards with 96 matches each and 20 evaluation shards with 16 matches each. This targets the 20-job standard-runner concurrency ceiling on GitHub Free; GitHub queues shards when other jobs consume part of that allowance. Each newly dispatched generation receives a deterministic seed block derived from its workflow run number; rerunning one generation intentionally reuses that block. Explicit seeds are rejected in continuous mode. The 32-bit allocator supports 42,934 workflow run numbers, after which configuration validation stops the chain rather than reusing seeds. Failed candidates leave `champion.json` unchanged and the next new generation explores a new block.

A passing continuous candidate is automatically promoted only after the fixed 56% score, 32-game minimum, balanced coverage, checkpoint identity, publication, endpoint, browser, and deterministic model checks pass against the staged candidate. Two narrowly scoped training jobs have repository write access, and neither runs repository JavaScript: the first accepts only the checksum validated by the read-only report job and pushes the exact checkpoint commit to a temporary branch for both CI jobs; the short finalizer rechecks the default-branch parent, optionally pushes that same commit to `main` while continuous mode remains enabled, and removes the temporary branch. Promotion updates the repository checkpoint only; it does not update or deploy hosted community state.

Protect `main` with the `validate` and `headless-smoke` CI jobs as required status checks. Promotion commits already carry those checks from their temporary branch before they reach `main`.

GitHub schedules can be delayed, and public-repository schedules can be disabled after prolonged repository inactivity. The hourly watchdog restarts a stopped chain, but GitHub Actions is not a guaranteed real-time service.

## Promote A Checkpoint

Manually dispatched non-continuous runs remain separate from promotion:

1. Review `evaluation.md` from a completed training run.
2. Copy the workflow run ID from its URL.
3. Open **Promote AI Checkpoint** in Actions.
4. Run it with that training run ID.

Manual promotion is disabled while `AI_CONTINUOUS_TRAINING_ENABLED` is `true`, preventing it from racing the automatic promotion transaction. Otherwise, the workflow accepts only a successful `workflow_dispatch` run of `.github/workflows/ai-training.yml` from the exact current default-branch commit. Its read-only job validates candidate and aggregate digests, requires balanced coverage, enforces at least 32 games and a 56% score regardless of training-run inputs, requires the candidate parent and evaluation baseline to match the current committed champion, stages the candidate, and runs repository, endpoint, and browser tests. A separate write-only job verifies the validated checksum and requires CI on the exact promotion commit before updating `main`. It does not deploy the checkpoint to the hosted game.

## Local Commands

Initialize a deterministic checkpoint:

```text
npm run ai:init -- --seed 253 --shard initial --output training/checkpoints/champion.json
```

Train one candidate:

```text
npm run ai:worker -- --mode train --checkpoint training/checkpoints/champion.json --seed 1000 --shard local --matches 96 --output training/output/train.json
```

Select and materialize a policy-only candidate from the baseline:

```text
npm run ai:select -- --results-dir training/output --baseline training/checkpoints/champion.json --output training/output/candidate.json
```

Run frozen evaluation:

```text
npm run ai:worker -- --mode evaluate --checkpoint training/output/candidate.json --baseline training/checkpoints/champion.json --seed 100000 --shard eval-local --matches 32 --output training/output/eval.json
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
