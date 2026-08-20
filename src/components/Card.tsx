import { useDraggable } from '@dnd-kit/core';
import type { CardModel } from '../types/board.js';

type Props = {
  card: CardModel;
  index: number;
  columnId: string;
};

export function Card({ card }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: { columnId: card.id },
  });
  const style: React.CSSProperties = {
    background: '#0b0e15',
    border: '1px solid #2d3142',
    borderRadius: 8,
    padding: 10,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: 'grab',
    textDecoration: card.done ? 'line-through' : 'none',
    opacity: card.done ? 0.6 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <span style={{ marginRight: 6 }}>{card.done ? '✅' : '⬜'}</span>
      {card.text}
    </div>
  );
}
