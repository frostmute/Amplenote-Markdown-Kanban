export type CardId = string;
export type ColumnId = string;

export type CardModel = {
  id: CardId;
  text: string;
  done: boolean;
  marked?: { important?: boolean; urgent?: boolean };
  wipLimit?: number | null;
};

export type ColumnModel = {
  id: ColumnId;
  title: string;
  order: number;
  wipLimit?: number | null;
  cards: CardModel[];
};

export type BoardModel = {
  columns: ColumnModel[];
};

export type MoveDirection = 'forward' | 'backward';
