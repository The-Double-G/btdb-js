# Security Policy

## Reporting

Report security vulnerabilities through GitHub private vulnerability reporting when it is available. Do not post credentials, tokens, production model state, client hashes, or exploit details in a public issue.

## Secrets

Never commit FTP passwords, trainer or policy-promotion keys, key hashes, contribution secrets, private production state envelopes, `.env` files, or browser automation snapshots. Rotate any credential that has been pasted into a chat, terminal transcript, issue, artifact, or workflow log.

Training and evaluation jobs are read-only and receive no production credential. They consume one sanitized, immutable Hosted Model snapshot artifact and cannot contact the hosted endpoint from Chromium. The protected `publish-hosted` job receives only `AI_POLICY_PROMOTION_KEY`, which authorizes policy promotion but not full commits or resets.

Promotion is bound to the source knowledge epoch, frozen champion identity, evaluated candidate, exact checkpoint-only commit, and required CI result. The endpoint applies it under the model lock, preserves concurrent contribution records, and retains a human-updated live candidate policy when it changed after the snapshot. Only after hosted publication succeeds may the exact `training/checkpoints/champion.json` audit commit reach the default branch.

Because hosted publication and Git cannot be atomic, uncertain failures retain the exact CI-tested temporary branch for reconciliation. Promotion replay is idempotent, and receipt artifact upload is best-effort rather than a publication gate.

## Supported Version

Security fixes target the current release shown in `changelog.txt`.
