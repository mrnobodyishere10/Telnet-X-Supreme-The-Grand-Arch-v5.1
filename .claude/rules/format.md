# Code Formatting Rules

## Purpose
These rules standardize readability, maintainability, and predictable diffs across root JavaScript and `bedrock-claude` TypeScript code.

## Base Formatting
- Indentation: 2 spaces (no tabs).
- Max line length: 100 chars (prefer wrapping long expressions).
- UTF-8 text, Unix newlines (`\n`).
- Keep one statement per line unless concise guard return.

## Naming Conventions
- Variables/functions: `camelCase`.
- Classes/types/interfaces: `PascalCase`.
- Constants and env-like values: `UPPER_SNAKE_CASE`.
- File names:
  - Runtime files: `camelCase.js` / `camelCase.ts`.
  - Tests: `*.test.js`.
- Directory names: `kebab-case` or existing project convention (do not rename large trees without request).

## Imports/Exports
- Group order:
  1. Node built-ins (`node:*`)
  2. External packages
  3. Internal project imports
- Keep import blocks sorted by source path within each group when practical.
- Prefer named exports for reusable functions.
- Avoid default export churn in utility modules.

## JavaScript/TypeScript Style
- Prefer early returns for validation failures.
- Use `const` by default; use `let` only when reassignment is required.
- Avoid deeply nested conditionals; extract helpers when a block exceeds ~20 lines.
- Do not use `any` in TypeScript unless unavoidable and justified.
- Use explicit return types on exported TypeScript functions when non-trivial.

## Error Handling Format
- Errors must be actionable and specific.
- Format: `<context>: <concrete issue>` or clear standalone error string.
- Avoid vague messages like "something went wrong".
- Preserve original error context where possible.

## Comments
- Comment only when intent is not obvious from code.
- Prefer short explanatory comments above complex logic.
- Do not narrate trivial lines.
- Keep comments updated when code behavior changes.

## CLI Output Formatting
- Human mode: concise, readable lines.
- JSON mode:
  - valid JSON object
  - stable key naming (`status`, `stage`, `error`, `errorCode`, etc.)
  - no extra text/noise around JSON payload

## Test File Formatting
- Arrange tests by feature area (`describe` blocks).
- Use clear test names:
  - "parses valid ..."
  - "throws when ..."
  - "returns structured ...".
- Keep assertions focused and deterministic.

## Gold Standard Example
```js
import fs from "node:fs/promises";
import { validateHost, validatePort } from "../utils/validation.js";

const DEFAULT_TIMEOUT_MS = 5000;

export async function loadTarget(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const [host, portText] = raw.trim().split(/\s+/);
  const port = Number(portText);

  if (!validateHost(host) || !validatePort(port)) {
    throw new Error(`Invalid target entry: ${raw.trim()}`);
  }

  return { host, port, timeoutMs: DEFAULT_TIMEOUT_MS };
}
```
