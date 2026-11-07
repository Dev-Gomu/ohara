import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useKeyboardState } from '../keyboard/store';

interface NavItemProps {
  block: string;
  index: number;
  className?: string;
  ring?: 'anel' | 'anel-interno';
  onOpen?: () => void;
  label?: string;
  color?: string;
  children: ReactNode;
}

export function useSelectedIndex(block: string, count: number): number {
  const { focus } = useKeyboardState();
  return Math.max(0, Math.min(focus.items[block] ?? 0, count - 1));
}

// Item de campo navegável. Quem desenha a seleção é a tela, pelo atributo data-sel.
export function NavItem(props: NavItemProps) {
  const { block, index, className, ring, onOpen, label, color, children } = props;
  const { focus } = useKeyboardState();
  const element = useRef<HTMLButtonElement>(null);
  const selected = (focus.items[block] ?? 0) === index;
  const focused = selected && focus.block === block && focus.level === 'nav';

  useLayoutEffect(() => {
    if (selected) element.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected]);

  return (
    <button
      ref={element}
      type="button"
      tabIndex={-1}
      className={`${className ?? ''} ${focused ? (ring ?? 'anel-interno') : ''}`}
      data-nav-index={index}
      data-sel={selected}
      data-cor={color}
      aria-current={selected}
      aria-label={label}
      onClick={onOpen}
    >
      {children}
    </button>
  );
}
