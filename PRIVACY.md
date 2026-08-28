# Privacy

## Hosted Community Learning

The hosted game may submit bounded completed-match contributions when community learning is enabled. These records can include aggregate play-style features, selected loadout signatures, final lives, strategy choices, and capped tactical or placement observations.

The game does not intentionally include player names, email addresses, raw keyboard history, or full replay history in a contribution. The server uses short-lived same-origin tokens, contribution identifiers, deduplication, and per-address rate limits. Rate-limit state can include hashed network-address values and must be treated as private runtime data.

Standard hosted Local matches can contribute two aggregate human perspectives. Practice, boss, localhost, and file-based sessions are excluded. Localhost learning remains in memory for that session.

## Public Training Artifacts

GitHub Actions workers use AI-versus-AI matches only. Promotable checkpoints clone the public baseline model and copy only the selected policy; shard-learned statistics and stores are discarded. Public checkpoints and artifacts must not be initialized from hosted state containing contribution guards, identifiers, rate-limit records, secrets, or human-derived records. Runtime `data/` is excluded from Git.

## Repository Data

The repository does not require analytics or tracking to run locally. GitHub applies its own service privacy terms to repository visits and Actions usage.
