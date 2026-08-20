import type { BoardModel } from '../types/board.js';

export type SerializedBoard = string;

export function serializeBoard(board: BoardModel): SerializedBoard {
  const out: string[] = [];
  for (const col of [...board.columns].sort((a, b) => a.order - b.order)) {
    out.push(`## ${col.title}`);
    if (typeof col.wipLimit === 'number' && col.wipLimit > 0) {
      out.push(`<!--WIP:${col.wipLimit}-->`);
    }
    for (const card of col.cards) {
      const marker = card.done ? '[x]' : '[ ]';
      const flags: string[] = [];
      if (card.marked?.important) flags.push('!');
      if (card.marked?.urgent) flags.push('!!');
      out.push(`- ${flags.join('')} ${marker} ${card.text} <!--CARD:${card.id}-->`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd() + '\n';
}

const HEADING_RE = /^##\s+(.*)$/;
const TASK_RE = /^-\s+(\[( |x)\])\s+(.*?)\s*(?:<!--CARD:(.*?)-->)?\s*$/;
const WIP_RE = /^<!--WIP:(\d+)-->$/;

export function parseBoard(markdown: string): BoardModel {
  const lines = markdown.split('\n');
  const columns: { id: string; title: string; order: number; wipLimit: number | null; cards: { id: string; text: string; done: boolean }[] }[] = [];
  let current: typeof columns[number] | null = null;
  let order = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = line.match(HEADING_RE);
    if (h) {
      if (current) {
        // close prev
        columns.push(current);
      }
      current = {
        id: `col_${order}_${h[1].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: h[1].trim(),
        order: order++,
        wipLimit: null,
        cards: [],
      };
      continue;
    }
    if (!current) continue;

    const wip = line.match(WIP_RE);
    if (wip) {
      current.wipLimit = parseInt(wip[1], 10);
      continue;
    }

    const task = line.match(TASK_RE);
    if (task) {
      const done = task[2] === 'x';
      const rest = task[3] ?? '';
      const id = task[4] ?? `task_${Math.random().toString(36).slice(2, 10)}`;
      current.cards.push({ id, text: rest.trim(), done });
    }
  }
  if (current) columns.push(current);

  return {
    columns: columns.map((c) => ({
      id: c.id,
      title: c.title,
      order: c.order,
      wipLimit: c.wipLimit,
      cards: c.cards,
    })),
  };
}
