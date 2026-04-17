# Testing Guidelines

## Test Stack
- Primary framework: Vitest.
- Assertion style: `expect(...)` with explicit matcher intent.
- Scope: unit + integration + e2e in `tests/`.

## File/Structure Conventions
- Test file pattern: `*.test.js`.
- Folder mapping:
  - `tests/unit/` for isolated logic.
  - `tests/integration/` for service-level behavior.
  - `tests/e2e/` for CLI shell behavior.
- Group tests by function/feature using `describe`.

## Coverage Requirements
- Keep or exceed current repository thresholds:
  - lines: 80%
  - functions: 80%
  - statements: 80%
  - branches: 70%
- Do not add new feature code without corresponding tests.

## What Must Be Tested
- Any new CLI option:
  - valid usage
  - invalid usage/error message
  - JSON mode behavior (if relevant)
- Any network behavior:
  - timeout handling
  - retry policy
  - final failure semantics and exit codes
- Any parser/validation change:
  - happy path
  - edge-case input
  - malformed input
- Any AI path changes:
  - env validation
  - retry/timeout behavior
  - response shape validation

## Unit Test Rules
- Mock external dependencies where possible.
- Keep one primary behavior expectation per test.
- Avoid asserting implementation details unless contract-critical.
- Prefer deterministic tests; avoid real-time dependence unless necessary.

## Integration/E2E Rules
- Use local resources (ephemeral server/socket) for network simulation.
- No external network dependency in tests.
- Use command execution (`execSync`/spawn) for CLI contract validation.
- Assert both process behavior and output contract.

## Regression Policy
- Every bug fix must include a regression test.
- Test names should describe the prior failure mode.

## Example Test Shape
```js
import { describe, expect, it } from "vitest";
import { parseCliArgs } from "../../src/utils/parser.js";

describe("parseCliArgs", () => {
  it("throws when timeout is invalid", () => {
    expect(() =>
      parseCliArgs(["CONNECT", "localhost", "23", "--timeout", "0"]),
    ).toThrow("--timeout must be a positive integer.");
  });
});
```
