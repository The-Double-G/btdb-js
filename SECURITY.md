# Security Policy

## Reporting

Report security vulnerabilities through GitHub private vulnerability reporting when it is available. Do not post credentials, tokens, production model state, client hashes, or exploit details in a public issue.

## Secrets

Never commit FTP passwords, trainer keys, key hashes, contribution secrets, production AI state, `.env` files, or browser automation snapshots. Training workflows require no production credentials. Rotate any credential that has been pasted into a chat, terminal transcript, issue, artifact, or workflow log.

Checkpoint promotion accepts only a verified default-branch distributed-training run, binds the candidate and evaluation to the current committed baseline, and runs publication and endpoint checks before committing. It never deploys production data or uses production credentials.

## Supported Version

Security fixes target the current release shown in `changelog.txt`.
