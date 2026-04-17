# CLAUDE.md

## Project Overview
Telnet-X-Supreme-The-Grand-Arch is a Node.js CLI toolkit for telnet connectivity checks, target batch audits, and structured operational output.
The repository also contains a TypeScript AI module (`bedrock-claude`) that integrates Anthropic Claude with runtime guardrails (timeouts, retries, validation).
Primary users are operators and developers running automation tasks in constrained Linux environments (including Termux + proot Ubuntu).

## Tech Stack
- Runtime: Node.js 20+
- Languages: JavaScript (ESM, ES2022) and TypeScript (strict mode)
- Package manager: npm (lockfile committed)
- Testing: Vitest (unit/integration/e2e)
- Linting: `node --check` for root JS syntax checks
- Hooks/formatting: Husky + lint-staged + Prettier
- AI SDK: `@anthropic-ai/sdk`
- Env management: `dotenv`
- CI: GitHub Actions

## Architecture & Directory Structure
- `src/`
  - `cli.js`: Main command-line entrypoint. Handles `CONNECT` and `BATCH` command flow, JSON/text output modes, and process exit semantics.
  - `services/telnetClient.js`: Socket connection primitives and retry/backoff orchestration (`createTelnetClient`, `connectWithRetry`).
  - `utils/parser.js`: CLI/token parsing and option validation (`--timeout`, `--retries`, `--json`, `--concurrency`, `--out`).
  - `utils/validation.js`: Host/port validation logic for IPv4/IPv6/FQDN safety checks.
- `tests/`
  - `unit/`: Parser/validation correctness and edge cases.
  - `integration/`: Service-level behavior (connectivity, retry behavior, failure semantics).
  - `e2e/`: CLI behavior as invoked by shell.
- `bedrock-claude/`
  - `src/agents/claudeAgent.ts`: Claude abstraction with env validation, timeout/retry policy, and response sanity checks.
  - `src/index.ts`: executable module supporting prompt mode and healthcheck mode.
  - `dist/`: compiled TypeScript output.
- `.github/workflows/`: CI jobs for root and TS subpackage validation.
- `.claude/rules/`: persistent coding/testing/security rules for agent operations.

## Development Commands
- Root:
  - `npm install` or `npm ci`
  - `npm start`
  - `npm test`
  - `npm run coverage`
  - `npm run lint`
- Bedrock module:
  - `cd bedrock-claude && npm install`
  - `npm run dev -- "your prompt"`
  - `npm run dev -- --healthcheck`
  - `npm run dev -- --healthcheck --json`
  - `npm run build`
  - `npm start`

## Coding Conventions & Constraints
- JavaScript/TypeScript:
  - Prefer small pure helpers for parsing/validation branches.
  - Use explicit error messages that indicate failing stage (`parse`, `validate`, `io`, `connect`, `chat`).
  - Avoid implicit coercion for config and CLI flags; validate types/ranges first.
- CLI behavior:
  - Keep machine-readable output stable when `--json` is requested.
  - Keep plain text mode human-readable and concise.
  - Exit code must reflect operational success (`0`) or failure (`1`).
- Networking:
  - Any network operation must have timeout boundaries.
  - Retry only transient failures; avoid unbounded retry loops.
- Test policy:
  - Any new feature/change requires updated or added tests.
  - Cover happy path and at least one negative path.
- Documentation:
  - Update README/docs when introducing flags, env vars, or output schema changes.

## Critical Rules
- **IMPORTANT:** Never commit secrets or tokens (`.env`, API keys, credentials).
- **IMPORTANT:** Always validate external input (CLI args, file targets, env vars, network responses).
- **IMPORTANT:** Any new feature must include tests that prove expected behavior and failure handling.
- **IMPORTANT:** Do not remove safety guards (timeout, retries cap, input validation) without explicit user approval.
- **IMPORTANT:** Keep backward compatibility for existing CLI contracts unless user explicitly requests breaking changes.
