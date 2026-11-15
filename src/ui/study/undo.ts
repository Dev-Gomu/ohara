import { useSyncExternalStore } from 'react';
import { restoreRemoved } from '../../core/study/edit';
import { markAll, markFrom, restorePlan, withoutItems, withRestored } from '../../core/study/trash';
import type { StudyData } from '../../core/study/types';
import { storage } from './study';

const WINDOW_MS = 10_000;

interface Pending {
  label: string;
  // Exclusão mostra "Ver lixeira" no aviso; restaurar, não.
  removal: boolean;
  undo: () => void;
}

let pending: Pending | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let remaining = WINDOW_MS;
let startedAt = 0;
const listeners = new Set<() => void>();

function arm(): void {
  clearTimeout(timer);
  startedAt = Date.now();
  timer = setTimeout(() => set(null), remaining);
}

function set(next: Pending | null): void {
  pending = next;
  clearTimeout(timer);
  remaining = WINDOW_MS;
  if (next && !isHidden()) arm();
  listeners.forEach((listener) => listener());
}

function isHidden(): boolean {
  return typeof document !== 'undefined' && document.hidden;
}

// Com o app oculto o prazo para; ao voltar, segue com o que faltava.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!pending) return;
    if (document.hidden) {
      clearTimeout(timer);
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    } else {
      arm();
    }
  });
}

// D: exclusão é lógica no banco e tem Desfazer (regras.md G8). `label` aparece no aviso.
// `root` é o item que a pessoa excluiu: tudo que sai junto vai à Lixeira com essa raiz (D164).
export function removeWithUndo(
  label: string,
  change: (data: StudyData) => StudyData,
  root: string,
): void {
  const before = storage.read();
  storage.write(change, markAll(root, new Date().toISOString()));
  const after = storage.read();
  set({
    label,
    removal: true,
    undo: () => storage.write((data) => restoreRemoved(data, before, after)),
  });
}

// Restaurar da Lixeira: volta o grupo da raiz (e o do pai, se ele também estava lá).
// Desfazer devolve à Lixeira com a raiz e a data de antes.
export function restoreWithUndo(label: string, root: string): void {
  const plan = restorePlan(storage.readTrash(), root);
  if (plan.length === 0) return;
  storage.write((data) => withRestored(data, plan));
  set({
    label,
    removal: false,
    undo: () => storage.write((data) => withoutItems(data, plan), markFrom(plan)),
  });
}

export function runUndo(): void {
  if (!pending) return;
  const { undo } = pending;
  set(null);
  undo();
}

export function useUndo(): Pick<Pending, 'label' | 'removal'> | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pending,
  );
}
