# AI Checkpoints

`champion.json` is the repository's schema-compatible distributed baseline and audit mirror. A schema migration preserves compatible learned state and records the preceding checkpoint as its parent; `npm run ai:migrate -- --checkpoint <source> --seed 0 --shard <id> --output <target>` reproduces that transition. It is not the training authority.

Each training generation starts from one immutable Hosted Model snapshot artifact. Distributed selection replaces only the deterministic score-weighted aggregate of validated schema-11 policy bundles, generation metadata, and bounded two-policy population history in that snapshot; shard-learned stores are not promoted. The 24,904-parameter bundle contains 5,707 strategy parameters and 19,197 parameters for the semantic recurrent actor, value, and survival heads. This audit checkpoint can therefore contain the public aggregate model fields present in the hosted GET response.

Never copy the private production state envelope into this directory. Contribution guards, identifiers, rate-limit records, tokens, secrets, and trainer or promotion authorization are prohibited.

Manual and continuous promotion replace only `champion.json` after the exact hosted snapshot and candidate pass frozen evaluation, hosted publication, and exact-commit CI.
