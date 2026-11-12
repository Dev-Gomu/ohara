import { useSyncExternalStore } from 'react';
import { restoreRemoved } from '../../core/study/edit';
import type { StudyData } from '../../core/study/types';
import { storage } from './study';

const WINDOW_MS = 10_000;

interface Pending {
  label: string;
  before: StudyData;
  after: StudyData;
}

let pending: Pending | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: Pending | null): void {
  pending = next;
  clearTimeout(timer);
  if (next) timer = setTimeout(() => set(null), WINDOW_MS);
  listeners.forEach((listener) => listener());
}

// D: exclusão é lógica no banco e tem Desfazer (regras.md G8). `label` aparece no aviso.
export function removeWithUndo(label: string, change: (data: StudyData) => StudyData): void {
  const before = storage.read();
  storage.write(change);
  set({ label, before, after: storage.read() });
}

export function runUndo(): void {
  if (!pending) return;
  const { before, after } = pending;
  storage.write((data) => restoreRemoved(data, before, after));
  set(null);
}

export function useUndoLabel(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pending?.label ?? null,
  );
}
