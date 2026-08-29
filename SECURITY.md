# Security Policy

## Reporting

Report security vulnerabilities through GitHub private vulnerability reporting when it is available. Do not post credentials, tokens, production model state, client hashes, or exploit details in a public issue.

## Secrets

Never commit FTP passwords, trainer keys, key hashes, contribution secrets, production AI state, `.env` files, or browser automation snapshots. Training workflows require no production credentials. Rotate any credential that has been pasted into a chat, terminal transcript, issue, artifact, or workflow log.

Checkpoint promotion accepts only a verified exact-current-commit distributed-training run, binds the candidate and evaluation to the current committed baseline, and runs publication, endpoint, and browser checks before committing. Training and evaluation jobs are read-only. Narrowly scoped promotion jobs can write only the checked `training/checkpoints/champion.json` commit and temporary promotion branch, and they run no repository JavaScript. They never deploy production data or use production credentials.

## Supported Version

Security fixes target the current release shown in `changelog.txt`.
