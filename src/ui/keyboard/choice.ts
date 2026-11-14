import type { FocusState } from '../../core/keyboard/focus';

// A linha acesa tem opções curtas (D160)? A tela marca o item com data-choice; o listener precisa saber na hora da tecla.
export function isChoosing(focus: FocusState): boolean {
  if (focus.level !== 'nav') return false;
  const index = focus.items[focus.block] ?? 0;
  const block = document.querySelector(`[data-block="${CSS.escape(focus.block)}"]`);
  return block?.querySelector(`[data-nav-index="${index}"][data-choice]`) != null;
}
