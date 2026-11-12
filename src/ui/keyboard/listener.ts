import { overlayOf, type TouchTarget } from '../../core/keyboard/focus';
import { resolve, type KeyInput } from '../../core/keyboard/resolve';
import { disarmBar } from './bars';
import { dispatch, getKeyboardState } from './store';

function inputOf(event: KeyboardEvent): KeyInput {
  return {
    code: event.code,
    key: event.key,
    alt: event.altKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    altGraph: event.getModifierState('AltGraph'),
    isComposing: event.isComposing,
    repeat: event.repeat,
  };
}

function onKeyDown(event: KeyboardEvent): void {
  const { focus } = getKeyboardState();
  const context = { level: focus.level, overlay: overlayOf(focus) };
  const resolved = resolve(inputOf(event), context);
  if (!resolved) return;
  event.preventDefault();
  event.stopPropagation();
  if (resolved.type !== 'swallow') dispatch(resolved, event.repeat);
}

function touchTargetOf(target: EventTarget | null): TouchTarget {
  if (!(target instanceof Element)) return { kind: 'outside' };
  // Painel flutuante de um campo (a bolha das Anotações): tocar nele mantém o cursor no texto.
  const keep = target.closest<HTMLElement>('[data-keep-field]')?.dataset.keepField;
  if (keep !== undefined) return { kind: 'field', block: keep };
  const block = target.closest<HTMLElement>('[data-block]')?.dataset.block;
  if (block !== undefined) {
    const item = target.closest<HTMLElement>('[data-nav-index]')?.dataset.navIndex;
    if (item !== undefined) return { kind: 'item', block, index: Number(item) };
    return target.closest('[data-field]') ? { kind: 'field', block } : { kind: 'block', block };
  }
  return target.closest('[data-menu]') ? { kind: 'menu' } : { kind: 'outside' };
}

function onPointerDown(event: PointerEvent): void {
  disarmBar();
  dispatch({ type: 'touch', target: touchTargetOf(event.target) });
}

// O foco chega ao campo também sem toque, como no retorno de outro aplicativo.
function onFocusIn(event: FocusEvent): void {
  const target = touchTargetOf(event.target);
  if (target.kind === 'field') dispatch({ type: 'touch', target });
}

// Único ponto do app que escuta teclas (D15). O lint barra qualquer outro.
export function startKeyboard(): () => void {
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('focusin', onFocusIn, true);
  };
}
