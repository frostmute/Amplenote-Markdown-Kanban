import { useEffect, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { Board } from './Board.js';
import { Column } from './components/Column.js';
import { Card } from './components/Card.js';
import { parseBoard, serializeBoard } from './utils/md.js';
import { moveCard, toggleCardDone, addColumn, removeColumn, reorderColumn } from './utils/board.js';
import { fetchNoteMarkdown, replaceNoteMarkdown } from './utils/host.js';
import type { BoardModel } from './types/board.js';

function mount(target: HTMLElement): void {
  // Wrap render in a tiny adapter so the iframe's actual DOM tree is
  // anchored at #__amk_root. This keeps CSS scoped and React's strict
  // hydration hints inert.
  const root = document.createElement('div');
  root.id = '__amk_root';
  target.appendChild(root);

  function App() {
    const [board, setBoard] = useState<BoardModel | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
      fetchNoteMarkdown()
        .then((md) => setBoard(parseBoard(md)))
        .catch((e) => setErr(String(e)));
    }, []);

    async function persist(next: BoardModel) {
      setBoard(next);
      try {
        await replaceNoteMarkdown(serializeBoard(next));
      } catch (e) {
        setErr(String(e));
      }
    }

    function onDragEnd(event: DragEndEvent) {
      if (!board) return;
      const { active, over } = event;
      if (!over) return;
      const cardId = String(active.id);
      const toColumnId = String(over.data.current?.columnId ?? over.id);
      const toIndex = Number(over.data.current?.index ?? 0);
      persist(moveCard(board, cardId, toColumnId, toIndex));
    }

    async function onAddColumn() {
      if (!board) return;
      const title = window.prompt('New column heading');
      if (!title) return;
      persist(addColumn(board, title));
    }

    async function onDoneToggle(cardId: string) {
      if (!board) return;
      persist(toggleCardDone(board, cardId));
    }

    async function onRemoveColumn(columnId: string) {
      if (!board) return;
      persist(removeColumn(board, columnId));
    }

    async function onReorderColumn(columnId: string, toIndex: number) {
      if (!board) return;
      persist(reorderColumn(board, columnId, toIndex));
    }

    if (err) {
      return (
        <div style={{ padding: 16, color: '#b91c1c' }}>
          AMK error: {err}
        </div>
      );
    }
    if (!board) {
      return <Board loading />;
    }

    return (
      <DndContext onDragEnd={onDragEnd}>
        <Board>
          <button onClick={onAddColumn} style={{ marginRight: 8 }}>
            + Column
          </button>
          {board.columns.map((col, idx) => (
            <Column
              key={col.id}
              column={col}
              index={idx}
              onDoneToggle={onDoneToggle}
              onRemove={() => onRemoveColumn(col.id)}
              onReorder={(toIdx) => onReorderColumn(col.id, toIdx)}
            >
              {col.cards.map((c, i) => (
                <Card key={c.id} card={c} index={i} columnId={col.id} />
              ))}
            </Column>
          ))}
        </Board>
      </DndContext>
    );
  }

  // Standalone React mount — no createRoot behind a sandbox requires an
  // outside mount, but our iframe scope is our own so ReactDOM.createRoot
  // works without any host modification.
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(root).render(<App />);
  });
}

// Auto-mount when the embed script tag is loaded inside the Amplenote iframe.
if (typeof document !== 'undefined') {
  const target = document.getElementById('__amk_target') ?? document.body;
  mount(target as HTMLElement);
}
