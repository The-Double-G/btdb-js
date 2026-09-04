# Privacy

## Hosted Community Learning

The hosted game may submit bounded completed-match contributions when community learning is enabled. AI and Browser Lab records can include aggregate play-style features, selected loadout signatures, final lives, strategy choices, capped tactical or placement observations, and at most 12 normalized neural decision samples. A decision sample contains bounded state, chosen-candidate, recurrent-memory input, successor-state, and successor-memory vectors plus an action-family index, simulation timestamps, factual interval outcome, and terminal flag; it is not a screen recording or replay.

The game does not intentionally include player names, email addresses, raw keyboard history, or full replay history in a contribution. The server requires an explicit same-host Origin and uses short-lived same-origin tokens, contribution identifiers, deduplication, and per-address rate limits. Rate-limit state can include hashed network-address values and must be treated as private runtime data.

Standard hosted Local matches can contribute two `human-demo-v1` perspectives. These contain aggregate match features, loadout signatures, final lives, map, bounded duration, and at most 128 quantized chronological semantic events for successful placements, upgrades, sales, sends, eco changes, collections, aiming changes, boosts, and derived waits. Human demonstrations never contain neural vectors; after server-side chronology and lifecycle validation, candidate-backed semantic actions update bounded `tacticalFamilyStats` priors and every accepted demonstration updates the dedicated count. Standard target-priority events and waits do not produce priors until equivalent actor candidates exist. Demonstrations update no neural, loadout, counter, or general tactical learning state. Practice, boss, localhost, and file-based sessions are excluded. Localhost learning remains in memory for that session.

## Public Training Artifacts

GitHub Actions workers use AI-versus-AI matches only. Each generation uses an immutable snapshot of the publicly readable Hosted Model, which can include bounded human-derived `tacticalFamilyStats` priors and policies. Promotable checkpoints clone that snapshot and copy only the deterministic score-weighted aggregate of validated shard policies; shard-learned statistics and stores are discarded.

Public artifacts include the model snapshot and a credential-free source manifest. They must never contain player-profile records, contribution tokens, guards, contribution identifiers, rate-limit records, network-address hashes, trainer or promotion credentials, or the private runtime state envelope. Runtime `data/` is excluded from Git.

## Repository Data

The repository does not require analytics or tracking to run locally. GitHub applies its own service privacy terms to repository visits and Actions usage.
