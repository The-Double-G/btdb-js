# Privacy

## Hosted Community Learning

The hosted game may submit bounded completed-match contributions when community learning is enabled. These records can include aggregate play-style features, selected loadout signatures, final lives, strategy choices, and capped tactical or placement observations.

The game does not intentionally include player names, email addresses, raw keyboard history, or full replay history in a contribution. The server uses short-lived same-origin tokens, contribution identifiers, deduplication, and per-address rate limits. Rate-limit state can include hashed network-address values and must be treated as private runtime data.

Standard hosted Local matches can contribute two aggregate human perspectives. Practice, boss, localhost, and file-based sessions are excluded. Localhost learning remains in memory for that session.

## Public Training Artifacts

GitHub Actions workers use AI-versus-AI matches only. Each generation uses an immutable snapshot of the publicly readable Hosted Model, which can include aggregate human-derived statistics and policies. Promotable checkpoints clone that snapshot and copy only the selected policy; shard-learned statistics and stores are discarded.

Public artifacts include the model snapshot and a credential-free source manifest. They must never contain contribution tokens, guards, contribution identifiers, rate-limit records, network-address hashes, trainer or promotion credentials, or the private runtime state envelope. Runtime `data/` is excluded from Git.

## Repository Data

The repository does not require analytics or tracking to run locally. GitHub applies its own service privacy terms to repository visits and Actions usage.
