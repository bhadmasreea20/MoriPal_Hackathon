import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'moripal-theme';
let current: Theme = 'light';
const listeners = new Set<() => void>();

function apply(theme: Theme, persist: boolean) {
  current = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (persist) { try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage unavailable */ } }
  }
  listeners.forEach(l => l());
}

/** Read the saved preference once on the client; call from a useEffect. */
export function initTheme() {
  if (typeof window === 'undefined') return;
  let stored: string | null = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* storage unavailable */ }
  apply(stored === 'dark' ? 'dark' : 'light', false);
}

export function toggleTheme() {
  apply(current === 'dark' ? 'light' : 'dark', true);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => current,
    () => 'light',
  );
}
