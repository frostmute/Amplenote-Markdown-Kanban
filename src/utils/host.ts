// Wrapper around the Amplenote embed host bridge.
// The host exposes a single global: window.callAmplenotePlugin.
// All embed <-> host traffic flows through these typed helpers.

export type HostMethod =
  | 'fetchNoteMarkdown'
  | 'replaceNoteMarkdown'
  | 'reloadFromNote'
  | 'columnReorderMd'
  | 'wipChange'
  | 'taskDoneChange';

type HostBridge = (method: HostMethod, payload?: unknown) => Promise<unknown>;

declare global {
  interface Window {
    callAmplenotePlugin?: HostBridge;
  }
}

export function host(): HostBridge {
  if (typeof window === 'undefined' || !window.callAmplenotePlugin) {
    throw new Error('AMK: Amplenote host bridge unavailable');
  }
  return window.callAmplenotePlugin;
}

export async function fetchNoteMarkdown(): Promise<string> {
  const r = await host()('fetchNoteMarkdown');
  return typeof r === 'string' ? r : '';
}

export async function replaceNoteMarkdown(md: string): Promise<void> {
  await host()('replaceNoteMarkdown', md);
}

export async function reloadFromNote(): Promise<string> {
  const r = await host()('reloadFromNote');
  return typeof r === 'string' ? r : '';
}
