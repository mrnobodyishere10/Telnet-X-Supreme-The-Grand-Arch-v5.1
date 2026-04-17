# /docs Command

Audit and improve documentation quality for public-facing APIs and operational workflows.

## Scope
- Root CLI behavior:
  - commands (`CONNECT`, `BATCH`)
  - options (`--timeout`, `--retries`, `--json`, `--concurrency`, `--out`)
  - output schema and exit semantics
- Bedrock Claude module:
  - env vars and defaults
  - prompt mode and `--healthcheck`
  - failure modes and troubleshooting notes

## Required Tasks
1. Scan source files for exported/public functions without clear docs.
2. Add or improve inline docs (JSDoc/doc comments) where behavior is non-obvious.
3. Update README sections when interfaces/config changed.
4. Ensure examples are executable and match current CLI/API.
5. Add migration notes if behavior changed from earlier versions.

## Output Requirements
- List what was documented, where, and why.
- Flag any remaining documentation debt.
- Keep docs concise but operationally useful.
