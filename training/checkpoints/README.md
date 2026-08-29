# AI Checkpoints

`champion.json` is the shared starting checkpoint for distributed training runs.

Only sanitized AI-versus-AI model data belongs here. Distributed promotion clones this baseline and replaces only the selected policy, generation metadata, and bounded population history; shard-learned stores are not promoted. Never copy a production state envelope into this directory. Production contribution guards, identifiers, rate-limit records, tokens, secrets, and trainer authorization are prohibited.

Manual and continuous promotion replace only `champion.json` after a frozen evaluation passes the fixed gate against the exact current baseline.
