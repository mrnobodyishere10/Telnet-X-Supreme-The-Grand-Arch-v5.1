# /review Command

Perform a focused code review for current changes (staged + unstaged when relevant).

## Review Objectives
1. Detect correctness bugs and behavioral regressions.
2. Detect security risks and unsafe defaults.
3. Verify edge-case/error handling quality.
4. Verify tests cover new/modified behavior.
5. Verify code style and conventions from `.claude/rules/*`.

## Required Review Process
1. Inspect changed files and classify by risk area (CLI/network/AI/tests/config).
2. For each file, evaluate:
   - input validation and type safety
   - timeout/retry/failure behavior
   - backward compatibility with existing contracts
   - structured output stability (`--json` payloads)
3. Check test deltas:
   - are new features tested?
   - are negative paths tested?
4. Identify missing coverage and untested assumptions.
5. Produce a severity-ranked report.

## Output Format
- `High`: issues that can break production behavior, security, or data integrity.
- `Medium`: significant quality/reliability gaps that should be fixed soon.
- `Low`: maintainability/style/documentation gaps.

Then include:
- open questions/assumptions
- concise change summary
- recommended next fixes

## Rule
Do not provide only generic feedback. Every finding must cite concrete file paths and behavior evidence.
