import type { KeyAction } from '../../core/keyboard/actions';
import { dispatch, getKeyboardState } from './store';

// Barras de um bloco: a de cima é o cabeçalho (abas, ferramentas) e a de baixo é o rodapé
// (salvar, formatação). A tela marca o contêiner com data-bar; o teclado só sabe ir até lá.
// Com o foco numa barra, o nível continua "bloco": setas e H L andam entre os botões, Enter
// aperta, Esc volta ao bloco visto de fora.
export type Bar = 'top' | 'bottom';

type Handler = (change: KeyAction) => boolean | void;

const buttonsOf = (root: ParentNode): HTMLButtonElement[] => [
  ...root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
];

// Só vale a barra que o teclado abriu: um clique deixa o foco do navegador num botão, mas o
// Enter seguinte ainda é do bloco.
let armed = false;

export const disarmBar = (): void => {
  armed = false;
};

const barOf = (): Element | null =>
  armed ? (document.activeElement?.closest('[data-bar]') ?? null) : null;

// Devolve falso se o bloco não tem a barra, para a tecla seguir o caminho normal.
export function focusBar(block: string, bar: Bar): boolean {
  const container = document.querySelector(`[data-block="${block}"] [data-bar="${bar}"]`);
  const buttons = container ? buttonsOf(container) : [];
  const first =
    buttons.find((button) => button.matches('[data-sel="true"], [aria-pressed="true"]')) ??
    buttons[0];
  if (!first) return false;
  armed = true;
  dispatch({ type: 'jump', block, level: 'block' });
  // Ao mudar de nível, o campo de texto perde o foco do navegador; este passo vem depois.
  setTimeout(() => first.focus(), 0);
  return true;
}

export function stepBar(step: -1 | 1, wrap = true): boolean {
  const container = barOf();
  if (!container) return false;
  const buttons = buttonsOf(container);
  const at = buttons.findIndex((button) => button === document.activeElement);
  if (at < 0) return false;
  const next = wrap ? (at + step + buttons.length) % buttons.length : at + step;
  buttons[next]?.focus();
  return true;
}

// Abas (data-bar-follow) escolhem ao receber o foco, como as réguas: a seleção segue o foco.
const moveFocus: Handler = (change) => {
  if (change.type !== 'moveFocus' || change.step !== true || !barOf()) return false;
  const step = change.direction === 'left' ? -1 : change.direction === 'right' ? 1 : 0;
  if (step === 0) return false;
  const follow = barOf()?.hasAttribute('data-bar-follow') ?? false;
  const before = document.activeElement;
  stepBar(step, false);
  if (follow && document.activeElement !== before) (document.activeElement as HTMLElement).click();
};

const enter: Handler = () => {
  const button = document.activeElement;
  if (!(button instanceof HTMLButtonElement) || !barOf()) return false;
  button.click();
  // Um botão que devolve o foco ao texto (formatação) leva o nível junto.
  setTimeout(() => {
    const { block } = getKeyboardState().focus;
    if (!barOf()) dispatch({ type: 'jump', block, level: 'field' });
  }, 0);
};

const escape: Handler = () => {
  if (!barOf()) return false;
  (document.activeElement as HTMLElement).blur();
  disarmBar();
};

// Para a tela que tem barras juntar às próprias ações, sem trocar as que já existem.
export function withBarActions(
  base: Partial<Record<KeyAction['type'], Handler>>,
): Partial<Record<KeyAction['type'], Handler>> {
  // Sem tratamento próprio nem anterior, devolver falso deixa a tecla seguir o caminho normal.
  const chain = (own: Handler, existing: Handler | undefined): Handler => (change) =>
    own(change) === false ? (existing ? existing(change) : false) : true;
  return {
    ...base,
    moveFocus: chain(moveFocus, base.moveFocus),
    enter: chain(enter, base.enter),
    escape: chain(escape, base.escape),
  };
}
