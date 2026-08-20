---
type: report
title: AMK — Recommendations (2026-08-20)
created: 2026-08-20
tags:
  - report
  - recommendations
  - amk
parent: '[[../architecture/audit-2026-08-20]]'
---

# Recommendations — AMK

## R1. Round-trip test harness (highest priority)

- **Where**: `tests/round-trip.test.ts` (new Vitest file).
- **What**: take a fixed corpus of notes (10–30 examples covering
  edge cases: empty notes, columns with WIP, completed tasks, no
  `<!--CARD:-->` markers, multi-line card text, emoji-laden headings)
  and assert that `parseBoard(serializeBoard(parseBoard(n)))` is
  stable for at minimum the **safe** shapes.
- **Driver**: pick a deliberate corpus with hand-curated RoundTripStable
  boolean markers.
- **Difficulty**: low.

## R2. Stable card-IDs in parser path

- **Where**: `src/utils/md.ts` parse path.
- **What**: card IDs only mint when `<!--CARD:…-->` is genuinely absent.
  When present, reuse the same string exactly.
- **Difficulty**: trivial.

## R3. Bundle guard in CI

- **Where**: `scripts/size-check.mjs` (already in scaffold).
- **What**: include in CI; fail > 220 KB soft, hard fail > 260 KB.
- **Difficulty**: trivial.

## R4. Typed `onEmbedCall` router

- **Where**: `src/utils/host.ts`.
- **What**: replace the open string union with a discriminated object —
  `{ action: 'columnReorder', from: string, to: number }` etc. Generate
  the wrapper from a Zod-style type to catch typos at build time.
- **Difficulty**: medium.

## R5. Host-state invalidation on focus

- **What**: when the embed iframe regains focus, re-fetch markdown and
  reconcile local `BoardModel`. Discard optimistic patches silently.
- **Difficulty**: medium.

## R6. Concurrent-edit safety

- **What**: before `replaceNoteContent`, read the current note; if our
  expected→current diff is non-zero, surface a conflict banner and pause
  saves.
- **Difficulty**: high (requires a strategy choice — fail closed refuses
  the user's last edit).

## R7. Public repo prep

- **What**: in `auto-annotated-portfolio`, switch the "Source" link on
  the project listing from implicit to an explicit
  `https://github.com/frostmute/Amplenote-Markdown-Kanban` once the repo
  is public.
- **Difficulty**: trivial.

## Done definition

- R1, R2, R3 ship in v1.
- R4, R5 ship in v1.1.
- R6 ships in v2 — it's an architectural shift with UX implications.

## Implementation order (suggested)

1. R1 — locks in parser correctness before anything else lands.
2. R2 — small refactor that prevents identity loss in the parser.
3. R3 — hardens build pipeline.
4. Write the embed's React components and wire `onEmbedCall`.
5. R4, R5 once embed surface is functional.
6. R6 is a v2 project.
