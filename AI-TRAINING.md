# AI Training v2.5.3

The AI uses a bounded candidate policy and trainable tactical residuals. Normal games use the frozen champion. Self-play alternates sides and maps, trains the candidate for 64 matches, then runs 32 no-learning evaluation matches against a frozen champion or historical policy.

Candidates scoring at least 56% are promoted. Candidates below 48% are reset. Intermediate candidates continue training. Tactical samples cover development, farming, eco sends, rush sends, and boost use.

Localhost and file-based sessions remain session-only. On the hosted website, every completed Vs AI or candidate self-play match submits a bounded contribution to the global community model. Completed standard Local matches submit two human demonstration perspectives. Later visitors load that shared model, and normal hosted matches use its live candidate policy.

## Global Community Contributions

Public browsers never upload or replace the full model. They submit one immutable match event containing bounded feature vectors, outcome lives, a strategy index, and capped tactical/placement observations. The PHP endpoint applies the event to the latest model while holding the model lock.

Local demonstrations contain only aggregate play-style features, selected loadout signatures, and final lives. They do not include keyboard input, names, identifiers, or replay history. They update player-style averages, loadout results, and opponent-loadout counter records without inventing an AI strategy choice or changing policy/game totals. Practice and boss matches are excluded from collection.

Contribution requests use short-lived same-origin tokens, unique IDs, per-address rate limits, strict schemas, store and body limits, revision-lag checks, deduplication, and atomic writes. Public events can update only the candidate policy and approved aggregate records. They cannot replace or promote the champion policy, change generations, or upload synthetic models.

Failed contributions remain in a small `localStorage` queue and retry automatically. The game-over screen reports whether the match is still syncing. The global candidate remains bounded, while the frozen champion provides an administrative rollback and self-play evaluation baseline.

Each match captures the global contribution epoch when it begins. An authenticated knowledge reset advances that epoch atomically, so queued or in-progress events from the previous model are discarded. Active tabs disable contributions while loading the new model before they can submit events for the new epoch.

## Hosted Trainer Key

The trainer key is optional for normal global learning. Generate one only for administrative full-model migration, recovery, or a trusted champion snapshot. Configure only the hash through the server environment variable `AI_TRAINER_KEY_SHA256`, or place the hash in the server-only file `data/ai-trainer-key.sha256`.

Set the plaintext key only for the active browser session:

```js
sessionStorage.setItem("aiTrainerKey", "your-plaintext-trainer-key")
location.reload()
```

Never put the plaintext key in JavaScript, a URL, source control, or the hosted data directory. The endpoint uses revisioned compare-and-swap commits, rejects stale snapshots, validates schema and finite parameters, and writes through an atomic rename.

## Knowledge Reset

Always download and retain the current `data/ai-learning-global.json` before resetting. Submit `action=reset` with the trainer key, the current `expectedRevision`, and a fresh schema-8 model created by `createDefaultAILearning()`. The endpoint accepts only a model with zero counters, empty learned stores, zero player features and strategy results, and no population policies.

The reset writes the fresh model, increments both the revision and contribution epoch, and clears contribution deduplication and rate-limit guards under the same exclusive lock. Remove `data/ai-trainer-key.sha256` immediately afterward, then verify that `writeEnabled` is false, the knowledge counters are zero, and a new-epoch contribution is accepted.

## Validation

```text
node tools/validate-balance.js
node tools/validate-ai.js
node tools/test-ai-endpoint.js
```

## Distributed Training

The public GitHub workflow runs deterministic AI-versus-AI candidates in isolated localhost Chromium workers. Every shard starts from the same committed checkpoint, uses a unique seed, and cannot access hosted persistence. Selection copies only the winning policy into a clone of the baseline model, synchronizes candidate and champion policy, advances the generation once, and discards all shard-learned stores and statistics. The exact materialized checkpoint is evaluated in balanced eight-match blocks by map, candidate side, and responder role before a separate manual promotion workflow can update the shared training checkpoint.

See `DISTRIBUTED-AI.md` for operation and safety details.
