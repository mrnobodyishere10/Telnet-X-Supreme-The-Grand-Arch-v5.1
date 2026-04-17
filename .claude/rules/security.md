# Security Guardrails

## Non-Negotiable Rules
- Never hardcode secrets, keys, or tokens in source files.
- Never commit `.env` or credential-bearing artifacts.
- Validate all external input before use.
- Any network operation must include timeout boundaries.

## Input Validation
- Validate CLI args (`--timeout`, `--retries`, `--concurrency`, `--out`) for type and range.
- Validate target-file entries (`<host> <port>`) and reject malformed rows with line numbers.
- Validate env vars for AI module (`CLAUDE_REQUEST_TIMEOUT_MS`, `CLAUDE_MAX_ATTEMPTS`) as positive integers.

## Auth & Secrets
- API keys only from environment variables.
- Do not print secrets in logs or error output.
- When reporting runtime errors, redact tokens and sensitive strings.

## Network Safety
- Telnet and AI requests must use explicit timeout and capped retry strategy.
- Retry only transient failures.
- Avoid infinite loops and uncontrolled backoff growth.
- Prefer deterministic failure over hanging processes.

## File System Safety
- Writes must target user-requested or project-local files only.
- Avoid deleting files unless explicitly requested.
- For output export paths, fail clearly if write cannot be completed.

## Dependency Hygiene
- Use lockfiles and avoid undocumented dependency additions.
- Run `npm audit` periodically and track critical vulnerabilities.
- Prefer latest stable dependency updates when adding new packages.

## Common Vulnerability Prevention
- Injection prevention: never execute unsanitized shell fragments from user input.
- Path safety: avoid unsafe path joins that can escape intended directories.
- Output safety: JSON mode should not include stack traces by default.
- Error handling: do not leak internal state that can expose secrets.

## Logging and Observability
- Log stage-based operational context (`parse`, `validate`, `io`, `connect`, `chat`).
- Keep logs concise and non-sensitive.
- Use structured output (`--json`) for automation and security tooling.
