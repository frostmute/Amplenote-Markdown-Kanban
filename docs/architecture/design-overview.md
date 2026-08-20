---
type: design
title: AMK — Design Overview
created: 2026-08-20
tags:
  - design
  - architecture
  - amk
parent: '[[audit-2026-08-20]]'
---

# Design Overview — Amplenote Markdown Kanban (AMK)

## What this plugin is

AMK turns any Amplenote note into a kanban board **without changing the
note's data model**. It treats user-authored Markdown as the database and
renders a drag-and-drop UI as a derived view inside the Amplenote
sidebar.

The user never sees that there's a plugin. They write headings, they
write tasks, the plugin overlays a board. The note's source stays valid
Markdown, copied-pasteable into any other tool.

## Goals (and non-goals)

**Goals**

1. Heading → column. Tasks → cards. Done → checked.
2. Drag-and-drop reordering within a single note.
3. WIP limits visible in both the embed and the raw note.
4. Whole-note overwrite is the only mutating path; round-trip must be
   stable.
5. Single-bundle embed, ≤ 220 KB soft, ≤ 260 KB hard.

**Non-goals**

1. Multi-board / multi-note coordination.
2. Touch-first drag experience.
3. Rich text editing inside cards (use the note for that).
4. Block-precise API reliance.

## Allowed shapes

```
# <note title>
## <column title>
<!--WIP:N-->
- [ ] <card text> <!--CARD:UUID-->
- [x] <done card text> <!--CARD:UUID-->
## <another column>
- [ ] ...
```

The serializer must produce this; the parser must accept this plus a
lenient subset (no WIP comment is fine; no CARD markers are fine — IDs
are then re-minted). Anything outside this shape is treated as ordinary
note content and rendered as Markdown in the note itself.

## Components

```
src/
  embed-entry.tsx          iframe mount + dnd wiring
  Board.tsx                top-level embed surface (loading + board list)
  components/
    Column.tsx             droppable column surface
    Card.tsx               draggable card surface
  utils/
    board.ts               pure board operations (moveCard, ... )
    md.ts                  parseBoard / serializeBoard
    host.ts                typed window.callAmplenotePlugin wrapper
  types/
    board.ts               BoardModel, CardModel, ColumnModel
```

Pure modules (`utils/board.ts`, `utils/md.ts`, `types/board.ts`) have **no
runtime imports** beyond each other and are fully unit-testable without
the Amplenote host. Components pull `react`/`@dnd-kit` only and stay
side-effect-free beyond rendering.

## Data-flow

```
Note Markdown
   │
   ▼
parseBoard(md)  ─────────────►  BoardModel
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
     <Cards>                  <Columns>                 <DnD events>
        │                         │                         │
        └─────────► user actions ◄┘                         │
                                  │                         │
                                  ▼                         │
                serializeBoard(next) ───────────────────────┘
                                  │
                                  ▼
                  app.replaceNoteContent({ uuid }, md)
```

The router is intentionally linear: any mutation produces a new
`BoardModel`, then a single `serializeBoard` produces one string, then
one `replaceNoteContent` writes it back. There is no parallel state
cache because Amplenote doesn't need one.

## Failure model

| Failure | Behavior |
| --- | --- |
| `replaceNoteContent` returns silently after partial write | Round-trip the new note and validate; rollback if shape diverges |
| Concurrent user edit while we hold state | Re-fetch markdown on next focus and re-derive |
| Drag into a column whose WIP is exceeded | Visual warning (`border: 1px solid #dc2626`); allow drop, completion shows overage |
| Resize below viewport | Horizontal scroll on board, vertical scroll on column |
| `window.callAmplenotePlugin` unavailable | Render an error boundary with a "Reload embed" action |

## Open questions for next iteration

1. Should completed cards auto-archive to a "Done" column? Portfolio
   says "completed-column behavior" is a target feature. Decide before
   shipping v1.
2. Should `<!--CARD:…-->` IDs be added immediately, or only when the
   user's first edit requires stable identity?
3. Should the embed surface handle a "no headings" state by synthetically
   creating one column, or by failing-fast with guidance?
