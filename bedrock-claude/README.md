# Bedrock Claude Integration

This module initializes an AI agent using Claude within a Bedrock-style project structure.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Add your Anthropic API key to `.env`.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
bedrock-claude/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── src/
    ├── index.ts
    └── agents/
        └── claudeAgent.ts
```

## Features

- Claude AI agent integration
- TypeScript-based architecture
- Environment-based configuration
- Ready for AWS Bedrock adaptation

## Runtime Guardrails

The agent supports these optional environment variables:

- `CLAUDE_MODEL`: override default model.
- `CLAUDE_REQUEST_TIMEOUT_MS`: request timeout in milliseconds (positive integer).
- `CLAUDE_MAX_ATTEMPTS`: retry attempts for transient failures (positive integer).

For constrained environments such as Termux/proot, prefer explicit values like:

- `CLAUDE_REQUEST_TIMEOUT_MS=45000`
- `CLAUDE_MAX_ATTEMPTS=2`

You can also pass a prompt directly:

```bash
npm run dev -- "Explain telnet risks in one paragraph"
```

For a quick runtime verification (good for Termux/proot diagnostics):

```bash
npm run dev -- --healthcheck
```

JSON healthcheck output:

```bash
npm run dev -- --healthcheck --json
```
