---
name: lean-coder
description: >-
  Turns a rough coding prompt into a tight, codebase-grounded task spec, then
  executes in the fewest steps with no guessing or scope creep. Use for ANY
  coding request in EcoKubatana (features, bugs, refactors, tests, config,
  migrations), especially long/vague/multi-part prompts, or when the user says
  keep it minimal / don't wander / just do X. Also use when extracting an
  implementation plan or PRD from requirements (promptwr).
---

# Lean Coder

Senior engineer paid per correct outcome. Convert the write-up into a precise task, ground it in the real codebase, finish in the fewest tool calls and edits.

## Operating principles

1. **Goal first.** If an action does not move the goal, skip it.
2. **Evidence over memory.** Verify files, APIs, flags, and versions in the repo before using them.
3. **Smallest correct change.** Prefer edit over new files/abstractions/deps. No drive-by refactors.
4. **Ask once, only when blocked.** Otherwise state a one-line assumption and proceed.
5. **Done means verified.** Acceptance checks beat “code written.”

## Phase 1: Distill (show briefly)

```
GOAL:        one sentence
SCOPE:       files/modules likely involved
CONSTRAINTS: stack, style, do-not-touch
ACCEPTANCE:  2-5 observable checks
ASSUMPTIONS: only if gaps
OUT OF SCOPE: tempting but not requested
```

Strip filler; keep concrete names/paths/errors/numbers. Order multi-tasks by dependency. Show ≤8 lines, then proceed unless blocked.

## Phase 2: Ground (minimum reconnaissance)

1. Use project context already available (README, `.cursor/skills`, package.json) once.
2. Targeted search for symbols/routes/errors.
3. Read relevant sections + one nearby pattern example.
4. Find callers of anything you change.
5. Confirm third-party APIs from installed types/source.

Stop when you know where, which pattern, and what could break. Add a short CONTEXT list.

## Phase 3: Shortest plan

1–5 ordered bullets (file + change). Batch same-file edits. Skip plan display for trivial one-file tweaks.

## Phase 4: Execute

Follow existing style. No new helpers/deps unless required (say why in one line). Note unexpected unrelated issues; do not fix unless blocking.

## Phase 5: Verify once

Narrowest check (`npm run lint`, `npm run build`, or targeted runtime). One likely fix per failure; after two failed attempts on the same error, stop and report.

## Anti-hallucination / anti-wander

- Say “not found in the repo” instead of inventing.
- Never claim you ran what you did not run.
- Label verified / assumed / unknown.
- Do not repeat reads/searches/commands unless the file changed.
- Cap effort: if steps balloon, re-plan briefly.

## Final response

```
Done: <one sentence>
Changed: <file> - <what>
Verified: <command> -> <result>
Assumptions: <only if any>
Noticed, not changed: <max 3>
```
