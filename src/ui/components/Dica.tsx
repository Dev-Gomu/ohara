import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { useDicaGroup } from './DicaGrupo';
import type { DicaPayload } from './dicaController';
import styles from './Dica.module.css';

// Envolve um botão: mostra nome e atalho num balão. Só recebe `aria-describedby`; clique e foco do botão ficam como estão.
// Sem keydown (D15): o foco do teclado abre e a saída do foco fecha.
interface DicaProps {
  content: string;
  shortcut?: string;
  side?: 'top' | 'bottom';
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

const LONG_PRESS_MS = 500;
const HOLD_SLOP = 10;
const GAP = 8;

export function Dica({ content, shortcut, side = 'top', children }: DicaProps) {
  const group = useDicaGroup();
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<{
    open?: ReturnType<typeof setTimeout>;
    press?: ReturnType<typeof setTimeout>;
  }>({});
  const press = useRef<{ x: number; y: number; id: number } | null>(null);
  const swallow = useRef(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!group) return undefined;
    const sync = () =>
      setActive(group.controller.view.current?.id === id && group.controller.view.state === 'open');
    return group.controller.subscribe(sync);
  }, [group, id]);

  useEffect(
    () => () => {
      clearTimeout(timers.current.open);
      clearTimeout(timers.current.press);
    },
    [],
  );

  if (!group) return children;
  const { controller } = group;

  const payload = (): DicaPayload | null =>
    triggerRef.current && {
      id,
      trigger: triggerRef.current,
      content,
      shortcut,
      side,
      gap: GAP,
      warmWindow: group.warmWindow,
    };
  const open = (mode: 'cold' | 'warm' | 'instant') => {
    const data = payload();
    if (data) controller.show(data, mode);
  };
  const hide = (instant: boolean) => {
    clearTimeout(timers.current.open);
    controller.hide(id, instant);
  };
  const cancelPress = () => {
    clearTimeout(timers.current.press);
    press.current = null;
  };

  return (
    <span
      ref={triggerRef}
      className={styles.gatilho}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch' || e.buttons !== 0) return;
        if (controller.isWarm()) open('warm');
        else timers.current.open = setTimeout(() => open('cold'), group.delay);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') hide(false);
      }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') {
          hide(false);
          return;
        }
        press.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        timers.current.press = setTimeout(() => {
          swallow.current = true;
          press.current = null;
          open('cold');
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(e) => {
        const p = press.current;
        if (p && p.id === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > HOLD_SLOP)
          cancelPress();
      }}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onClickCapture={(e) => {
        if (!swallow.current) return;
        swallow.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      onFocus={(e) => {
        if (e.target.matches(':focus-visible')) open('instant');
      }}
      onBlur={() => hide(true)}
    >
      {cloneElement(children, {
        'aria-describedby': active ? group.id : children.props['aria-describedby'],
      })}
    </span>
  );
}
