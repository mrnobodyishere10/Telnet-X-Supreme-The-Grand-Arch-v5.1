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
