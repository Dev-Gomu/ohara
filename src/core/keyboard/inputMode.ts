import type { FocusChange } from './focus';

export type InputMode = 'teclado' | 'mouse' | 'toque';

// Mouse não é toque: só o dedo e a caneta aumentam alvos e mostram a bolha (qualidade de vida, D166).
export function inputModeOf(change: FocusChange): InputMode {
  if (change.type !== 'touch') return 'teclado';
  return change.pointer === 'mouse' ? 'mouse' : 'toque';
}
