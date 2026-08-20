import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ColumnModel } from '../types/board.js';

type Props = {
  column: ColumnModel;
  index: number;
  children: ReactNode;
  onDoneToggle: (cardId: string) => void;
  onRemove: () => void;
  onReorder: (toIndex: number) => void;
};

export function Column({ column, children, onRemove }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id, index: column.cards.length - 1 },
  });

  const overWip =
    typeof column.wipLimit === 'number' && column.cards.length > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? '#1f2937' : '#1a1d27',
        border: overWip ? '1px solid #dc2626' : '1px solid #2d3142',
        borderRadius: 12,
        padding: 12,
        minWidth: 260,
        flex: '0 0 auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <strong>{column.title}</strong>
        <button
          onClick={onRemove}
          style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          title="Remove column"
        >
          ×
        </button>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}
