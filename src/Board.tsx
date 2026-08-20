import type { ReactNode } from 'react';

export function Board(props: { children?: ReactNode; loading?: boolean }) {
  if (props.loading) {
    return (
      <div style={{ padding: 16, color: '#6b7280' }}>Loading kanban…</div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        background: '#0f1117',
        color: '#e5e7eb',
        minHeight: '100%',
        overflowX: 'auto',
      }}
    >
      {props.children}
    </div>
  );
}
