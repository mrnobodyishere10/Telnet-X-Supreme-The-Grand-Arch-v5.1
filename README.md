# Telnet-X-Supreme-The-Grand-Arch v5.1

A modular framework for Telnet-based network auditing and AI-assisted orchestration. Provides a CLI tool, a programmatic JavaScript API, and a TypeScript AI-agent layer powered by the Anthropic Claude SDK.

## Requirements

- Node.js 20+
- npm 10+

## Quick Start

```bash
# Clone and install
npm install

# Run the CLI
npm start -- CONNECT 192.168.1.1 23

# Run tests with coverage
npm run coverage
```

## Repository Structure

```
├── src/                      # Root JS package (ESM, Node.js)
│   ├── cli.js                # CLI entry point
│   ├── index.js              # Public API exports
│   ├── services/
│   │   └── telnetClient.js   # Low-level Telnet socket client
│   └── utils/
│       ├── parser.js         # Command argument parser
│       └── validation.js     # Host and port validators
├── bedrock-claude/           # TypeScript AI-agent subpackage
│   └── src/
│       ├── index.ts          # Entry point
│       └── agents/
│           └── claudeAgent.ts # Anthropic SDK agent factory
├── tests/
│   ├── unit/                 # Unit tests (mocked I/O)
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
├── .claude/                  # Claude Code configuration
├── .github/                  # CI/CD workflows and templates
├── vitest.config.js          # Vitest configuration
└── settings.local.json       # Claude Code workspace permissions
```

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Run the Telnet CLI |
| `npm test` | Run tests with Node built-in test runner |
| `npm run test:watch` | Watch mode via Vitest |
| `npm run coverage` | Run tests and generate coverage report |

## AI Agent (bedrock-claude)

The `bedrock-claude/` subpackage provides a Claude-powered AI agent. See [`bedrock-claude/README.md`](bedrock-claude/README.md) for setup instructions.
