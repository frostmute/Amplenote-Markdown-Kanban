# Amplenote Markdown Kanban (AMK)

> **Status:** Scaffold-only in this local checkout. Production source is not
> yet public. This repo captures the architectural design and the audit
> foundation in preparation for the public release.

## What this is

AMK turns any Amplenote note into a kanban board backed by Markdown.
Headings become columns, tasks become cards, drag-and-drop updates the
underlying note. The note remains valid Markdown — copy-paste out, paste
back in, no migration, no proprietary state.

## Repo layout

```
docs/
  architecture/
    design-overview.md        what this plugin is and how it works
    audit-2026-08-20.md        risks and code audit (design-stage)
  reports/
    recommendations-2026-08-20.md
                             ordered, prioritized next steps
src/
  types/board.ts             BoardModel, CardModel, ColumnModel
  utils/
    board.ts                 pure operations on BoardModel
    md.ts                    parseBoard / serializeBoard
    host.ts                  typed window.callAmplenotePlugin wrapper
  components/
    Column.tsx               droppable column surface
    Card.tsx                 draggable card surface
  Board.tsx                  top-level embed surface
  embed-entry.tsx            iframe mount + DnD wiring
sandbox/plugin/              (build output lives here)
scripts/size-check.mjs       bundle-budget guard
vite.config.ts               single IIFE build
```

## Build

```bash
npm install
npm run build          # → sandbox/plugin/plugin.iife.js
npm run size-check     # 220 KB soft, 260 KB hard
npm test
```

## Source of truth

The complete design and rationale lives in
[`docs/architecture/design-overview.md`](docs/architecture/design-overview.md).
The audit findings that drive the implementation order live in
[`docs/reports/recommendations-2026-08-20.md`](docs/reports/recommendations-2026-08-20.md).

The shared Amplenote SDK primer lives in the Spaced-Repetition plugin repo
under `docs/amplenote-plugin-development.md`. Keep both in sync when
either plugin sees a host API change.
