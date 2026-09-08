# AI Training v2.6.0

The authoritative Hosted Model uses schema 14 and the `semantic-intent-spatial-recurrent-actor-critic-v6` family. Each candidate and champion is one atomic 33,450-parameter policy bundle: 5,707 strategy parameters and 27,743 decision parameters.

- A widened `17 -> 64 -> 32 -> 75` strategy network.
- A `128 -> 96 -> 48` state encoder and `128 -> 48 -> 48` legal-candidate encoder.
- A 16-value recurrent memory, scalar match/economy/catastrophe value heads, and a four-class final-life survival head.
- Per-family decision-training counters that travel with the policy and determine its learning-rate schedule.

The actor ranks legal candidates across loadout, strategy, placement, upgrade, sale, eco, rush, and boost families. Deterministic code remains for legality, affordability, collision/path rules, cooldowns, factual action prerequisites, and execution, but it does not add a handcrafted value to an actor score. Loadout selection evaluates the complete legal library. When an opponent loadout has been observed, confidence-weighted outcomes learned for that exact opponent/loadout pairing adjust the neural ranking; no handcrafted counter table is applied. Loadout selection also applies three bounded learned bonuses derived from `loadoutStats`—confidence-weighted win-rate exploitation, UCB exploration, and a dominant bonus for unseen legal loadouts—to guarantee eventual sampling of all 5,600 legal tower/boost combinations while still ranking by neural and counter-learning signals. Placement selection evaluates the complete legal grid at its fixed search resolution, filters combat positions to those covering path geometry when available, and applies a small bounded learned spatial bonus. Upgrade, sale, send, boost, and aiming choices enumerate their eligible legal candidates. Sale candidates use the same sale execution as human input, but newly placed or recently upgraded towers are protected from routine sale; emergency farm liquidation remains available. Exploration noise is enabled only for learning matches. The fixed runtime cycle invokes aiming, defense/economy utility, offense, and boosts in that order; the actor ranks candidates within each invoked family, compares defense, upgrade, placement, and economy candidates against learned no-ops, and does not select which top-level family is invoked next.

The 128-value state has up to 40 core match values, 24 permutation-invariant factual entity aggregates, 32 per-tower-type composition values (16 types × 2 sides at 80-111), and a 16-value schema-14 context suffix at 112-127. Core values encode round, money, eco, lives, tower/farm counts, queue pressure, auto-eco, action occupancy, bananas, matchup danger/safe-to-greed, roundReady/pending-round-payout, and for in-match families farm-bank, banana cash/expiry and payout timing. Per-type composition gives bit-perfect tower-count awareness per side. Entity aggregates summarize tower cost/tiers/positions and bloon health/paths per side without imposing order. The 128-value candidate has eight action-family flags and 24 generic action facts in columns 0-31, followed by 32 semantic capability values in columns 32-63, eight reserved zero intent slots in columns 64-71, eight loadout-role or placement-geometry values in 72-79, 16 tower-type one-hot values at 80-95, 16 detailed tier/cost/send/boost context values at 96-111, and a 16-value schema-14 context suffix at 112-127. The suffix contains map identity, placement coverage/span, cooldown and time-to-impact, target progress/health, expected output, and selected capability facts. Loadout-role features occupy 72-79 for loadout candidates, placement geometry occupies 72-79 for placement candidates, and other families leave them zero; the 80-111 extension provides bit-perfect tower-type and upgrade separation. Semantic capability values are factual, non-diluted loadout aggregates of runtime-observed damage, pierce, volley behavior, range, projectile motion, area and duration, ricochet and secondary effects, damage over time, slow/stun/knockback, timed economy (cobra/buccaneer/farm intervals), attack/range modifiers, traps, sends, and manual aiming. Stable IDs are used only for execution, telemetry, and deterministic tie-breaking; they are not neural inputs. Memory advances exactly once after a selected decision, and scoring unselected candidates never mutates recurrent state.

## Sale Decision Learning

Every legal tower sale remains available to the actor, including immediately after placement or upgrade. This supersedes the older timing-hold wording in the actor overview. The policy learns sale timing from the selected sale versus learned no-op outcome: realized cash, sellback loss, tower output, and survival are factual reward signals, not deterministic timing holds.

## Learned Boundary

The in-match actor arbitrates between defense, placement, upgrades, sales, economy, rushes, boosts, and no-op outcomes through learned candidate scores. Runtime ordering, cursor movement, affordability, cooldowns, collision rules, and target ownership remain execution mechanics only; they do not choose a strategic family.

Placement intent is selected by the policy from every structurally valid three-path upgrade signature. The selected intent is carried through the placement candidate, tower lifecycle, later upgrade choices, and map/tower/loadout/strategy placement statistics. Location remains a learned ranking over legal grid candidates with factual path geometry as input; geometry is not used to remove legal strategic choices. This supersedes the older overview wording that described filtering combat positions before policy scoring.

The policy tensors learn strategy and candidate rankings from terminal match results, factual interval rewards, four-step TD targets, and final-life survival classes. Factual rewards combine bounded life, pop, and money outcomes; paid placement, upgrade, and send actions neutralize their known spend, collection actions retain realized income, and sales remove proceeds while exposing sellback loss. No hosted or session player-profile object is persisted; strategy selection uses the current observed loadout and the policy. `loadoutCounterStats` contributes a bounded learned bonus for an observed opponent/loadout pairing, `tacticalFamilyStats` contributes a bounded bonus only for validated `human|` demonstration keys with at least four samples, and `loadoutStats` now contributes three bounded bonuses for the actor's own loadout—performance exploitation, UCB exploration, and dominant unseen-loadout coverage—to ensure the enumerated library is learnably explored. `strategyStats` records hosted outcomes plus accepted candidate-side GitHub training outcomes and supplies the strategy learning-rate sample count.

The remaining timing, crosspath, general tactical, and non-`human|` tactical stores are still maintained for aggregate observations, migration, UI, or compatibility. `placementStats` and `loadoutPlacementStats` contribute a small bounded spatial-learning bonus after factual path-coverage filtering. Hardcoded tower/loadout capability labels and factual prerequisite gates define candidate meaning and safety; they are not strategic value scores. Factual tower capabilities are inspected from live runtime construction and include timed income intervals for cobra, buccaneer, and farm banks; loadout aggregates preserve max-valued range/area/timing signals instead of diluting them across unrelated slots; farm sell candidates preserve bank proceeds and economy state now exposes stored bank, collectible banana cash/expiry, and matchup/timing context.

## Match Learning

Hosted Vs AI and candidate self-play matches train and run inference from the live candidate unless a frozen evaluation or opponent snapshot is explicit. Self-play uses the same bounded cursor movement, tower selection, manual aiming, input cooldown state machines, and 250 ms simulation-time decision cadence as normal gameplay; acceleration advances simulation time without teleporting or oversampling actions. Strategy learning uses the terminal match result. Selected neural actions, including selected no-ops, record bounded state, chosen-candidate, and memory-input vectors plus chronological simulation timestamps, factual interval/economy/catastrophe targets, successor state/memory, and terminal status. Credit-version-4 four-step TD credit discounts each transition by `0.99^(milliseconds/1000)`, bootstraps from the final successor when no terminal was reached, and uses the server-derived terminal reward at match end. Decision training runs only after the terminal transition is settled. Final-life survival classes are trained only when the completed-match outcome is observable. Placement decisions also retain an independent bounded outcome sample containing the original state, chosen candidate, memory input, and delayed observed reward; these samples train directly and do not require recurrent-chain contiguity. Up to 12 recurrent transitions and 24 placement-outcome samples may be contributed. Parameters and features are finite, bounded, and validated after every update.

Actor learning updates only the selected action, using its TD advantage against the state-value estimate. It does not upload or train rejected alternatives and does not fabricate emergency labels. Browser Lab counterfactual training is deferred until the runtime has rewindable seeded randomness and clocks, synchronous gameplay stepping, timer and network isolation, identity-preserving restoration of every mutable object and reference, and post-restore state-hash verification for every initially supported action family. Frozen evaluation remains the authority for promotion.

## Curriculum And Hard Cases

Learning matches rotate through four deterministic data-distribution stages: foundation, diverse historical opponents, pressure-heavy situations, and hard-case coverage. The stage changes only opponent-policy sampling and exploration intensity; it never selects a loadout, tower, upgrade, sale, send, or boost for the actor. The canonical eight-case map, side, and probe/responder schedule is recorded in the distributed scenario manifest; frozen holdout evaluation uses a disjoint seed block and disables both learning and exploration.

Decision updates use bounded outcome prioritization without changing the contribution schema. Terminal transitions, low-life finishes, and large factual interval errors receive more gradient weight; ordinary transitions remain in the update stream. Browser Lab and the PHP contribution trainer use the same formula, while model parameters and per-family counters remain bounded.

## Gameplay Quality Gate

Every distributed evaluation runs the candidate and the frozen champion as separate deterministic evaluations over the same seed and fairness schedule. The quality artifact compares survival, severe-collapse rate, average lives, responder defense, responder score, and worst-bucket score. Promotion rejects a candidate when any safety metric regresses beyond its recorded tolerance, even if its overall win score passes. The paired champion run uses the actual champion policy and the same Browser Lab runtime, so high-volume headless training cannot silently introduce a gameplay-only divergence.

Completed standard Local matches can submit two `human-demo-v1` perspectives. Each demonstration contains aggregate play-style features, loadout signatures, final lives, map, bounded duration, and at most 128 quantized chronological semantic events such as placement, upgrade, sale, send, eco, collection, aiming, boost, and derived waits. It contains no neural vectors, names, raw input history, or replay history. The endpoint validates event chronology and tower lifecycles, deduplicates semantic keys backed by current actor candidates, updates `tacticalFamilyStats`, and increments only the dedicated `totalHumanDemonstrations` accounting counter. Follow/lock aiming and eco toggles have matching candidates; standard target-priority changes and waits remain validation context until equivalent actor candidates exist. Runtime priors require at least four samples and add at most `+/-0.05` to candidate ranking; demonstrations never update policy tensors, loadout outcomes, general tactical counts, or loadout counters.

Localhost and file-based sessions remain session-only.

The hosted Stats panel validates the published `ai-status` document first. While its current run is active, the browser may fetch that exact run attempt's public GitHub jobs, validate every job against the published run identity, and overlay only phase and worker projection. Failed, incomplete, oversized, mismatched, or rate-limited job responses fall back to the published status and are visibly labeled; an open Stats view refreshes every two minutes.

## Public Contributions

Public browsers never upload a model or gradient. A normal contribution contains outcome data, the chosen strategy, approved aggregate observations, at most 12 selected recurrent decision samples, and at most 24 independent placement-outcome samples. Before queuing, the browser trims observations and then neural samples until the serialized UTF-8 request is at most 128 KiB. The server derives terminal reward and survival class from final lives, replays the selected-action four-step actor-critic update for recurrent samples, applies the factual placement reward directly for independent placement samples, and clips the aggregate policy-parameter delta from the complete contribution to an L2 norm of 0.35. Legacy 40-value candidate samples remain valid for transport compatibility but are excluded from actor training.

Contribution requests require an explicit same-host Origin and use short-lived same-origin tokens, unique IDs, per-address rate limits, strict dimensions and schemas, 128 KiB body limits, revision-lag checks, epoch checks, deduplication, and atomic writes. Public events cannot replace or promote the champion, change generations, reset knowledge, or upload synthetic checkpoints.

Retryable failed contributions remain in a bounded `localStorage` queue and retry automatically. Permanent HTTP 400 and 422 failures are discarded. A reset advances the contribution epoch so queued or in-progress events from the previous model are discarded.

## Browser Lab

The Browser Lab trains a Temporary Lab Copy. It cannot replace the Hosted Model, even when trainer credentials exist. On the hosted site, each eligible completed learning perspective may publish the same bounded, server-validated contribution used by normal play; localhost, file-based, and explicitly session-only runs do not publish.

## AI Lab Overview

The AI Training Lab reports the temporary browser-session candidate, not the Hosted Model. Its status values mean:

- `Matches`: completed self-play matches in this Lab session, including learning and frozen-evaluation matches.
- `Phase`: the current generation phase, with 128 learning matches followed by 64 frozen evaluation matches.
- `Eval`: the active or most recently completed frozen evaluation score; its wins, losses, and ties are retained after the evaluation finishes.
- `Lab Promotions`: candidates promoted inside this temporary session copy after passing its score gate.
- `Rejected`: candidates reset to the session champion after failing the rejection gate.
- `Avg Round`: the average final round reached by completed session matches.
- `Top Training Archetypes`: candidate-side strategy selections and wins from learning matches only; frozen opponents are excluded.
- `Decision Training`: the live session policy's update count split across loadout, strategy, placement, upgrade, sale, eco, rush, and boost families.
- `Hosted Outcome Records`: combined public-match outcomes and accepted candidate-side GitHub training outcomes stored in the Hosted Model.
- `GitHub Trainer` values: authoritative workflow, evaluation, and promotion status, refreshed separately from the temporary Lab session.

One Lab generation consists of:

- 128 learning matches with exploration enabled for the candidate.
- 64 internal frozen evaluation matches with learning and exploration disabled.
- Balanced rotation across both maps, both candidate sides, and probe/responder roles.

The candidate plays the frozen champion or a bounded historical policy. Probe and responder loadouts are selected by their assigned policy rather than forced by the harness. A score of at least 58% promotes inside the temporary Lab copy. A score below 48% resets the temporary candidate to its champion. Intermediate candidates continue learning. The full policy bundle, including both neural networks and per-family training progress, is frozen and evaluated together. Distributed promotion additionally requires the candidate's responder matches to include at least 75% finishing with at least 50 lives, with no responder match below 25 lives.

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

The endpoint migrates every valid schema-8, schema-9, schema-10, schema-11, schema-12, or schema-13 model to schema 14 once under the exclusive lock after verifying the persisted model digest. Schema-13 migration preserves all existing tensors and stores while appending 16 zero columns to `WState1` and 16 zero columns to `WCandidate1` (112→128); the new map, route, incoming-composition, timing, target, and capability context is initially neutral and then learned. Schema-12 migration appends 48/48 zero columns (80→128, 80→128), and schema-11 migration appends 56/64 zero columns (72→128, 64→128). Schema-10/9 migrations are as before with larger padding. Older incompatible stores and reserved `human|` priors are reset as required by their existing migration contracts; schema-13 stores remain preserved. Incompatible decision samples are reset. Migration increments revision and epoch and clears guards so stale pre-schema-14 samples cannot update the model. No destructive hosted reset is required for this release; clients must refresh before submitting credit-version-4, 128-value samples.

A knowledge reset is different and destructive. Always back up `data/ai-learning-global.json` first. Submit `action=reset` with a fresh schema-14 model, trainer key, and exact revision. A reset advances both revision and epoch and clears contribution guards.

## Continuous Coordination

The continuous-training watchdog is the only automatic dispatcher. It starts one 20-shard run only after CI succeeds for the exact commit currently at `main`, and the training workflow independently validates that commit through its `expected_sha` input before any shard starts. It treats every active default-branch training-workflow run, including manual runs, as active regardless of display title; manual or externally coordinated runs make it wait rather than cancel. A normal `main` update cancels and waits for obsolete continuous runs unless one has entered a promotion transaction. A checkpoint-only promotion waits for its creating transaction to finish instead of cancelling it. Because GitHub gives a squash merge a new commit identity, each promotion finalizer explicitly runs CI on that exact merged `main` SHA before handoff or scheduled reconciliation can dispatch the successor. If finalization is interrupted after the merge but before CI is created, the watchdog validates the checkpoint-only commit, completed source run, and successful promotion jobs, then dispatches the missing CI once; an existing failed CI remains a hard stop. Uncertain retained `ai-promotion/*` branches block automatic training until they are reconciled; branches whose completed publish log explicitly proves a non-publishing validation failure are removed automatically. Scheduled reconciliation runs at GitHub's five-minute minimum. After three consecutive exact-SHA failures it waits 30 minutes from the latest completion, then automatically tries again instead of permanently stopping.

## Validation

```text
npm test
npm run ai:verify -- training/checkpoints/champion.json
```

See `DISTRIBUTED-AI.md` for continuous operation and promotion details.
