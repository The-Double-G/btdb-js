# AI Training v2.6.0

The authoritative Hosted Model uses schema 9 and the `shared-neural-controller-v1` family. Each candidate and champion is one atomic 19,011-parameter policy bundle:

- A widened `17 -> 64 -> 32 -> 75` strategy network.
- A shared dual-encoder scorer with 48 state inputs, 32 legal-candidate inputs, and 48-value embeddings.
- Per-family decision-training counters that travel with the policy and determine its exact bootstrap behavior.

The scorer ranks legal candidates across loadout, strategy, placement, upgrade, sale, eco, rush, and boost families. Deterministic code remains for legality, affordability, collision/path rules, cooldowns, execution, and immediate-lethal safety. Existing heuristics provide a cold-start bootstrap that fades independently for each family over its first 5,000 neural decision samples; after that, the network supplies the ranking. Large loadout and placement spaces use deterministic, non-heuristic shortlists after bootstrap rather than permanently excluding candidates by legacy rank.

## Match Learning

Hosted Vs AI and candidate self-play matches train and run inference from the live candidate unless a frozen evaluation or opponent snapshot is explicit. Strategy learning uses the terminal match result. Selected neural actions, including selected no-ops, record bounded state/candidate vectors and combine local outcome change with a decayed terminal reward. Contribution samples are selected across action families before recent samples fill remaining capacity, so early loadout and strategy choices are not displaced by frequent tactical actions. Parameters and features are finite, bounded, and validated after every update.

Completed standard Local matches submit two human demonstration perspectives. Demonstrations contain aggregate play-style features, loadout signatures, and final lives. They do not contain names, input history, or replay history, and they do not invent an AI action or directly update the neural policy.

Localhost and file-based sessions remain session-only.

## Public Contributions

Public browsers never upload a model or gradient. A normal contribution contains outcome data, the chosen strategy, approved aggregate observations, and at most 32 selected neural decision samples. The server derives each sample's terminal component from final lives, replays SGD into only the current candidate under the model lock, and clips the aggregate policy-parameter delta from the complete contribution to an L2 norm of 0.35.

Contribution requests require an explicit same-host Origin and use short-lived same-origin tokens, unique IDs, per-address rate limits, strict dimensions and schemas, 128 KiB body limits, revision-lag checks, epoch checks, deduplication, and atomic writes. Public events cannot replace or promote the champion, change generations, reset knowledge, or upload synthetic checkpoints.

Failed contributions remain in a bounded `localStorage` queue and retry automatically. A reset advances the contribution epoch so queued or in-progress events from the previous model are discarded.

## Browser Lab

The Browser Lab trains a Temporary Lab Copy. It cannot replace the Hosted Model, even when trainer credentials exist. Completed learning matches may publish only bounded contributions.

One Lab generation consists of:

- 128 learning matches with exploration enabled for the candidate.
- 64 internal frozen evaluation matches with learning and exploration disabled.
- Balanced rotation across both maps, both candidate sides, and probe/responder roles.

The candidate plays the frozen champion or a bounded historical policy. Probe and responder loadouts are selected by their assigned policy rather than forced by the harness. A score of at least 58% promotes inside the temporary Lab copy. A score below 48% resets the temporary candidate to its champion. Intermediate candidates continue learning. The full policy bundle, including both neural networks and per-family training progress, is frozen and evaluated together.

## Hosted Trainer Key

The trainer key is optional for normal learning. Generate one only for administrative full-model recovery, commit, or reset. Configure only its hash through `AI_TRAINER_KEY_SHA256` or `data/ai-trainer-key.sha256`.

Set plaintext only for an active trusted browser session:

```js
sessionStorage.setItem("aiTrainerKey", "your-plaintext-trainer-key")
location.reload()
```

Never put plaintext keys in JavaScript, URLs, source control, logs, or hosted data files.

## GitHub Promotion Key

Distributed self-play uses a separate least-privilege key. Configure its server hash through `AI_POLICY_PROMOTION_KEY_SHA256` or `data/ai-policy-promotion-key.sha256`, and store plaintext only as `AI_POLICY_PROMOTION_KEY` in the protected `production-ai` GitHub environment.

The `action=promote` route accepts only a complete validated policy bundle. It compares the source contribution epoch and frozen champion identity, then updates the champion and bounded history under the model lock. Current aggregates are retained. If public learning changed the live candidate during training, that newer candidate remains live.

## Migration And Reset

The endpoint migrates a valid schema-8 model to schema 9 once under the exclusive lock. Migration expands each strategic policy without changing its initial logits, initializes the decision scorer with the same canonical values used by the browser, preserves aggregate knowledge and generations, retains the contribution epoch, and increments the revision once.

A knowledge reset is different and destructive. Always back up `data/ai-learning-global.json` first. Submit `action=reset` with a fresh schema-9 model, trainer key, and exact revision. A reset advances both revision and epoch and clears contribution guards.

## Validation

```text
npm test
npm run ai:verify -- training/checkpoints/champion.json
```

See `DISTRIBUTED-AI.md` for continuous operation and promotion details.
