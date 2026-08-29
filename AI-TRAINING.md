# AI Training v2.6.0

The authoritative Hosted Model uses schema 10 and the `shared-recurrent-actor-critic-v2` family. Each candidate and champion is one atomic 23,752-parameter policy bundle:

- A widened `17 -> 64 -> 32 -> 75` strategy network.
- A `72 -> 96 -> 48` state encoder and `40 -> 48 -> 48` legal-candidate encoder.
- A 16-value recurrent memory, a scalar value head, and a four-class final-life survival head.
- Per-family decision-training counters that travel with the policy and determine its exact bootstrap behavior.

The actor ranks legal candidates across loadout, strategy, placement, upgrade, sale, eco, rush, and boost families. Deterministic code remains for legality, affordability, collision/path rules, cooldowns, and execution, but it does not add a handcrafted value to an actor score. Loadout selection evaluates the complete legal library, and placement selection evaluates the complete legal grid at its fixed search resolution. Upgrade, sale, send, boost, and aiming choices enumerate every currently legal candidate. Exploration noise is enabled only for learning matches. Upgrade, placement, and sale/collect families each compare their best legal action with their own learned no-op before the surviving actions are compared across families.

The first 48 state and 32 candidate columns retain the schema-9 meaning. Schema 10 appends 24 permutation-invariant factual entity aggregates across both sides and eight factual candidate relationships. The appended columns use observed entities, positions, tiers, ownership, affordability, and candidate relations rather than heuristic scores. Memory advances exactly once after a selected decision; scoring rejected candidates never mutates recurrent state.

## Match Learning

Hosted Vs AI and candidate self-play matches train and run inference from the live candidate unless a frozen evaluation or opponent snapshot is explicit. Strategy learning uses the terminal match result. Selected neural actions, including selected no-ops, record bounded state, chosen-candidate, rejected-candidate, and memory-input vectors. Local rewards use only observed life and pop changes; the value target combines that local result with a decayed terminal result. Final-life survival classes are trained only when the completed-match outcome is observable. Contribution samples are selected across action families before recent samples fill remaining capacity, so early loadout and strategy choices are not displaced by frequent tactical actions. Parameters and features are finite, bounded, and validated after every update.

Pairwise actor learning uses factual alternatives from the scored candidate batch and a bounded shadow continue alternative when no second candidate is available. It does not fabricate emergency labels. Exact counterfactual rollout from a complete pre-action game snapshot is deferred: the current game does not yet expose a compact deterministic snapshot/restore boundary for every legal action family. Frozen evaluation remains the authority for promotion.

Completed standard Local matches submit two human demonstration perspectives. Demonstrations contain aggregate play-style features, loadout signatures, and final lives. They do not contain names, input history, or replay history, and they do not invent an AI action or directly update the neural policy.

Localhost and file-based sessions remain session-only.

## Public Contributions

Public browsers never upload a model or gradient. A normal contribution contains outcome data, the chosen strategy, approved aggregate observations, and at most 12 selected neural decision samples. Before queuing, the browser trims observations and then decision samples until the serialized UTF-8 request is at most 128 KiB. The server derives each sample's terminal and survival targets from final lives, replays the same pairwise actor-critic update into only the current candidate under the model lock, and clips the aggregate policy-parameter delta from the complete contribution to an L2 norm of 0.35.

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

The endpoint migrates every valid schema-9 candidate, champion, and retained history policy to schema 10 once under the exclusive lock. Migration preserves all strategy tensors and old actor columns, appends zero input columns, initializes recurrent tensors with the browser's canonical deterministic values, and zeros the memory-to-state, value, and survival heads so initial actor logits are unchanged. Aggregate knowledge and generations are preserved. The migration increments both revision and contribution epoch and clears contribution guards so stale schema-9 samples cannot update schema 10. Valid schema-8 stores can still migrate directly to the current contract.

A knowledge reset is different and destructive. Always back up `data/ai-learning-global.json` first. Submit `action=reset` with a fresh schema-10 model, trainer key, and exact revision. A reset advances both revision and epoch and clears contribution guards.

## Continuous Coordination

The continuous-training watchdog is the only automatic dispatcher. It starts one 20-shard run only after CI succeeds for the exact commit currently at `main`, and the training workflow independently validates that commit through its `expected_sha` input before any shard starts. A normal `main` update cancels and waits for obsolete continuous runs unless one has entered a promotion transaction. A checkpoint-only promotion waits for its creating transaction to finish instead of cancelling it; the transaction-completion event then lets the watchdog dispatch the successor without a second dispatcher racing it. Any retained `ai-promotion/*` branch blocks automatic training until it is reconciled or removed.

## Validation

```text
npm test
npm run ai:verify -- training/checkpoints/champion.json
```

See `DISTRIBUTED-AI.md` for continuous operation and promotion details.
