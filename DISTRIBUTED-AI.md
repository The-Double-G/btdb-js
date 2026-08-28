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
- `base_seed`: first deterministic seed allocated to the run.
- `minimum_score`: frozen evaluation score required for promotion.
- `minimum_games`: minimum total frozen evaluation sample.

The `ai-training-bundle` artifact contains:

- `candidate.json`
- `candidate.selection.json`
- `evaluation.json`
- `evaluation.md`

Artifacts are public in a public repository and have short retention. They must never contain production guards, tokens, secrets, client hashes, or mutable hosted state.

## Promote A Checkpoint

Promotion is intentionally separate from training:

1. Review `evaluation.md` from a completed training run.
2. Copy the workflow run ID from its URL.
3. Open **Promote AI Checkpoint** in Actions.
4. Run it with that training run ID.

The promotion workflow accepts only a successful `workflow_dispatch` run of `.github/workflows/ai-training.yml` from the current default branch whose commit is an ancestor of the checked-out branch. It validates candidate and aggregate digests, requires balanced coverage, enforces at least 32 games and a 56% score regardless of training-run inputs, and requires the candidate parent and evaluation baseline to match the current committed champion. It runs repository and endpoint tests before committing only `training/checkpoints/champion.json`. It does not deploy the checkpoint to the hosted game.

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
- `Math.random` and `Date.now` are replaced before game scripts load.
- Browser timers are disabled; the worker advances the game at fixed `1000 / 60` millisecond steps.
- Rendering uses a no-op canvas context.
- The local server rejects `data/`, hidden files, non-loopback clients, and write methods.
- Workers fail on hosted persistence, browser errors, non-finite models, stalls, discarded matches, frame exhaustion, or schema mismatches.
- Match scheduling covers both maps, both candidate sides, and both candidate responder roles over eight matches. Promotion requires balanced aggregate coverage for all three dimensions.

## Scaling

Start with two workers and short runs. A normal match currently takes roughly 20 to 30 seconds on a typical desktop Chromium runner, although GitHub performance varies. Increase worker and match counts only after several successful runs.

Standard public GitHub-hosted runners do not consume the private-repository monthly minute allowance, but GitHub concurrency, six-hour job duration, artifact storage, and acceptable-use limits still apply.
