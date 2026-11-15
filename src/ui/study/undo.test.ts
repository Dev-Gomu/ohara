import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const write = vi.hoisted(() => vi.fn());
const doc = vi.hoisted(() => {
  const target = new EventTarget() as EventTarget & { hidden: boolean };
  target.hidden = false;
  return target;
});

vi.stubGlobal('document', doc);
vi.mock('./study', () => ({ storage: { read: () => ({}), readTrash: () => [], write } }));

const { removeWithUndo, runUndo } = await import('./undo');

function setHidden(hidden: boolean): void {
  doc.hidden = hidden;
  doc.dispatchEvent(new Event('visibilitychange'));
}

// A exclusão grava uma vez; o Desfazer grava de novo.
function undoStillThere(): boolean {
  write.mockClear();
  runUndo();
  return write.mock.calls.length > 0;
}

describe('prazo do Desfazer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    write.mockClear();
  });
  afterEach(() => {
    setHidden(false);
    vi.useRealTimers();
  });

  it('vence depois de 10 s com o app à vista', () => {
    removeWithUndo('x', (d) => d, 'r');
    vi.advanceTimersByTime(10_001);
    expect(undoStillThere()).toBe(false);
  });

  it('para com o app oculto e segue com o que faltava ao voltar', () => {
    removeWithUndo('x', (d) => d, 'r');
    vi.advanceTimersByTime(4_000);
    setHidden(true);
    vi.advanceTimersByTime(30_000);
    setHidden(false);
    vi.advanceTimersByTime(5_000);
    expect(undoStillThere()).toBe(true);
  });

  it('some quando passa o resto do prazo depois de voltar', () => {
    removeWithUndo('x', (d) => d, 'r');
    vi.advanceTimersByTime(4_000);
    setHidden(true);
    vi.advanceTimersByTime(30_000);
    setHidden(false);
    vi.advanceTimersByTime(6_001);
    expect(undoStillThere()).toBe(false);
  });
});
