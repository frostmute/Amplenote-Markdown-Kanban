import type { BoardModel, CardModel, ColumnModel } from '../types/board.js';

export function createCard(text: string, opts: Partial<CardModel> = {}): CardModel {
  const id =
    opts.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `c_${Math.random().toString(36).slice(2, 10)}`);
  return {
    id,
    text: text.trim(),
    done: opts.done ?? false,
    ...opts,
  };
}

export function createColumn(title: string, opts: Partial<ColumnModel> = {}): ColumnModel {
  const id =
    opts.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `col_${Math.random().toString(36).slice(2, 10)}`);
  return {
    id,
    title: title.trim(),
    order: opts.order ?? 0,
    cards: opts.cards ?? [],
    ...opts,
  };
}

export function emptyBoard(): BoardModel {
  return { columns: [] };
}

export function moveCard(
  board: BoardModel,
  cardId: string,
  toColumnId: string,
  toIndex: number
): BoardModel {
  const fromCol = board.columns.find((c) => c.cards.some((k) => k.id === cardId));
  if (!fromCol) return board;
  const toCol = board.columns.find((c) => c.id === toColumnId);
  if (!toCol) return board;

  const card = fromCol.cards.find((k) => k.id === cardId);
  if (!card) return board;

  const newFrom: ColumnModel = {
    ...fromCol,
    cards: fromCol.cards.filter((k) => k.id !== cardId),
  };
  const newTo: ColumnModel = { ...toCol, cards: [...toCol.cards] };
  const safeIndex = Math.max(0, Math.min(toIndex, newTo.cards.length));
  newTo.cards.splice(safeIndex, 0, card);

  return {
    columns: board.columns.map((c) => {
      if (c.id === fromCol.id) return newFrom;
      if (c.id === toCol.id) return newTo;
      return c;
    }),
  };
}

export function reorderColumn(board: BoardModel, columnId: string, toIndex: number): BoardModel {
  const columns = [...board.columns];
  const idx = columns.findIndex((c) => c.id === columnId);
  if (idx === -1) return board;
  const [col] = columns.splice(idx, 1);
  columns.splice(Math.max(0, Math.min(toIndex, columns.length)), 0, col);
  return {
    columns: columns.map((c, i) => ({ ...c, order: i })),
  };
}

export function addColumn(board: BoardModel, title: string): BoardModel {
  const col = createColumn(title, { order: board.columns.length });
  return { columns: [...board.columns, col] };
}

export function removeColumn(board: BoardModel, columnId: string): BoardModel {
  return { columns: board.columns.filter((c) => c.id !== columnId) };
}

export function toggleCardDone(board: BoardModel, cardId: string): BoardModel {
  return {
    columns: board.columns.map((c) => ({
      ...c,
      cards: c.cards.map((k) => (k.id === cardId ? { ...k, done: !k.done } : k)),
    })),
  };
}
