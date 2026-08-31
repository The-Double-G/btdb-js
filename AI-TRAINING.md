# AI Training v2.6.0

The authoritative Hosted Model uses schema 11 and the `semantic-recurrent-actor-critic-v3` family. Each candidate and champion is one atomic 24,904-parameter policy bundle: 5,707 strategy parameters and 19,197 decision parameters.

- A widened `17 -> 64 -> 32 -> 75` strategy network.
- A `72 -> 96 -> 48` state encoder and `64 -> 48 -> 48` legal-candidate encoder.
- A 16-value recurrent memory, a scalar value head, and a four-class final-life survival head.
- Per-family decision-training counters that travel with the policy and determine its learning-rate schedule.

The actor ranks legal candidates across loadout, strategy, placement, upgrade, sale, eco, rush, and boost families. Deterministic code remains for legality, affordability, collision/path rules, cooldowns, and execution, but it does not add a handcrafted value to an actor score. Loadout selection evaluates the complete legal library. When an opponent loadout has been observed, confidence-weighted outcomes learned for that exact opponent/loadout pairing adjust the neural ranking; no handcrafted counter table is applied. Placement selection evaluates the complete legal grid at its fixed search resolution. Upgrade, sale, send, boost, and aiming choices enumerate every currently legal candidate. Exploration noise is enabled only for learning matches. Upgrade, placement, and sale/collect families each compare their best legal action with their own learned no-op before the surviving actions are compared across families.

The 72-value state has 48 core match values followed by 24 permutation-invariant factual entity aggregates across both sides. The 64-value candidate has eight action-family flags and 24 generic action facts in columns 0-31, followed by 32 semantic capability values in columns 32-63. Those semantic values describe runtime-observed damage, pierce, volley behavior, range, projectile motion, area and duration, ricochet and secondary effects, damage over time, slow/stun/knockback, economy, attack/range modifiers, traps, sends, and manual aiming. Stable IDs are used only for execution, telemetry, and deterministic tie-breaking; they are not neural inputs. Memory advances exactly once after a selected decision, and scoring unselected candidates never mutates recurrent state.

## Match Learning

Hosted Vs AI and candidate self-play matches train and run inference from the live candidate unless a frozen evaluation or opponent snapshot is explicit. Strategy learning uses the terminal match result. Selected neural actions, including selected no-ops, record bounded state, chosen-candidate, and memory-input vectors plus chronological simulation timestamps, factual interval reward, successor state/memory, and terminal status. Four-step TD credit discounts each transition by `0.99^(milliseconds/1000)`, bootstraps from the final successor when no terminal was reached, and uses the server-derived terminal reward at match end. Decision training runs only after the terminal transition is settled. Final-life survival classes are trained only when the completed-match outcome is observable. Contribution training uses at most the latest 12 contiguous transitions so every successor state and recurrent memory exactly matches the next selected transition. Parameters and features are finite, bounded, and validated after every update.

Actor learning updates only the selected action, using its TD advantage against the state-value estimate. It does not upload or train rejected alternatives and does not fabricate emergency labels. Exact counterfactual rollout from a complete pre-action game snapshot is deferred: the current game does not yet expose a compact deterministic snapshot/restore boundary for every legal action family. Frozen evaluation remains the authority for promotion.

Completed standard Local matches submit two human demonstration perspectives. Demonstrations contain aggregate play-style features, loadout signatures, and final lives. They do not contain names, input history, or replay history, and they do not invent an AI action or directly update the neural policy.

Localhost and file-based sessions remain session-only.

## Public Contributions

Public browsers never upload a model or gradient. A normal contribution contains outcome data, the chosen strategy, approved aggregate observations, and at most 12 selected neural decision samples. Before queuing, the browser trims observations and then decision samples until the serialized UTF-8 request is at most 128 KiB. The server derives terminal reward and survival class from final lives, replays the same selected-action four-step actor-critic update into only the current candidate under the model lock, and clips the aggregate policy-parameter delta from the complete contribution to an L2 norm of 0.35. Legacy 40-value candidate samples remain valid for transport compatibility but are excluded from actor training.

Contribution requests require an explicit same-host Origin and use short-lived same-origin tokens, unique IDs, per-address rate limits, strict dimensions and schemas, 128 KiB body limits, revision-lag checks, epoch checks, deduplication, and atomic writes. Public events cannot replace or promote the champion, change generations, reset knowledge, or upload synthetic checkpoints.

Retryable failed contributions remain in a bounded `localStorage` queue and retry automatically. Permanent HTTP 400 and 422 failures are discarded. A reset advances the contribution epoch so queued or in-progress events from the previous model are discarded.

## Browser Lab

The Browser Lab trains a Temporary Lab Copy. It cannot replace the Hosted Model, even when trainer credentials exist. On the hosted site, each eligible completed learning perspective may publish the same bounded, server-validated contribution used by normal play; localhost, file-based, and explicitly session-only runs do not publish.

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

The endpoint migrates every valid schema-9 or schema-10 candidate, champion, and retained history policy to schema 11 once under the exclusive lock. Schema-10 migration preserves strategy, state, recurrent, value, and survival tensors while replacing the candidate encoder with the canonical 64-value semantic encoder and resetting per-family actor bias/counters. Schema-9 migration preserves its strategy and state tensors while initializing the recurrent, semantic-candidate, value, and survival portions canonically. Aggregate knowledge and generations are preserved, while incompatible decision samples are reset. Migration increments both revision and contribution epoch and clears contribution guards so stale samples cannot update schema 11. Valid schema-8 stores can still migrate directly to the current contract.

A knowledge reset is different and destructive. Always back up `data/ai-learning-global.json` first. Submit `action=reset` with a fresh schema-11 model, trainer key, and exact revision. A reset advances both revision and epoch and clears contribution guards.

## Continuous Coordination

The continuous-training watchdog is the only automatic dispatcher. It starts one 20-shard run only after CI succeeds for the exact commit currently at `main`, and the training workflow independently validates that commit through its `expected_sha` input before any shard starts. A normal `main` update cancels and waits for obsolete continuous runs unless one has entered a promotion transaction. A checkpoint-only promotion waits for its creating transaction to finish instead of cancelling it; the transaction-completion event then lets the watchdog dispatch the successor without a second dispatcher racing it. Any retained `ai-promotion/*` branch blocks automatic training until it is reconciled or removed.

## Validation

```text
npm test
npm run ai:verify -- training/checkpoints/champion.json
```

See `DISTRIBUTED-AI.md` for continuous operation and promotion details.
