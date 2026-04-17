---
name: debug
description: Systematic workflow for reproducing, isolating, fixing, and verifying bugs with regression safety.
---

## Workflow

1. Reproduce
- Capture exact command, input, environment, and observed output.
- Confirm whether the issue is deterministic or intermittent.
- Record expected vs actual behavior.

2. Isolate
- Narrow to minimal failing path (single command/module/test).
- Separate parser, validation, network, and output layers.
- Disable unrelated moving parts while testing hypothesis.

3. Diagnose
- Inspect logs/errors first, then code path.
- Validate assumptions around:
  - input type/range
  - timeout/retry boundaries
  - async error propagation
  - JSON contract stability
- Identify first bad state, not just final crash point.

4. Fix
- Apply smallest safe change that resolves root cause.
- Preserve backward compatibility unless explicit migration requested.
- Improve error messaging for future diagnosis.

5. Verify
- Run targeted test(s), then broader suite.
- Add regression test reproducing original failure.
- Confirm no lint/build regressions.

## Stack Trace and Logging Guidance
- Prefer stage-based logs (`parse`, `validate`, `io`, `connect`, `chat`).
- Surface concise diagnostics; do not log secrets.
- When stack trace is noisy, identify first project frame where behavior diverges.

## Regression Test Rule
- No bug fix is complete without a regression test.
- Regression test name should reflect user-facing failure mode.
