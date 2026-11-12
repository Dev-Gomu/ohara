import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useKeyboardState } from '../keyboard/store';

interface NavItemProps {
  block: string;
  index: number;
  className?: string;
  // 'anel' = controle pequeno (contorno fino de 2px); 'anel-interno' = item de lista (4px);
  // 'nenhum': a tela desenha o próprio sinal de foco; 'cursor': peças novas (data-cursor, base.css).
  ring?: 'anel' | 'anel-interno' | 'nenhum' | 'cursor';
  onOpen?: () => void;
  label?: string;
  color?: string;
  // Posição da cor da matéria (base.css resolve --cor-materia).
  subject?: number | undefined;
  children: ReactNode;
}

export function useSelectedIndex(block: string, count: number): number {
  const { focus } = useKeyboardState();
  return Math.max(0, Math.min(focus.items[block] ?? 0, count - 1));
}

// Cursor de peças que não são NavItem (Button): o item escolhido de um bloco em nível de navegação.
export function useNavCursor(block: string, index: number): boolean {
  const { focus } = useKeyboardState();
  return (focus.items[block] ?? 0) === index && focus.block === block && focus.level === 'nav';
}

// Item de campo navegável. Quem desenha a seleção é a tela, pelo atributo data-sel.
export function NavItem(props: NavItemProps) {
  const { block, index, className, ring, onOpen, label, color, subject, children } = props;
  const { focus } = useKeyboardState();
  const element = useRef<HTMLButtonElement>(null);
  const selected = (focus.items[block] ?? 0) === index;
  const focused = selected && focus.block === block && focus.level === 'nav';
  const ringClass =
    !focused || ring === 'nenhum' || ring === 'cursor'
      ? ''
      : ring === 'anel'
        ? 'anel-fino'
        : (ring ?? 'anel-interno');

  useLayoutEffect(() => {
    if (selected) element.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected]);

  return (
    <button
      ref={element}
      type="button"
      tabIndex={-1}
      className={`${className ?? ''} ${ringClass}`}
      data-nav-index={index}
      data-sel={selected}
      data-cor={color}
      data-materia={subject}
      data-cursor={focused && ring === 'cursor' ? '' : undefined}
      aria-current={selected}
      aria-label={label}
      onClick={onOpen}
    >
      {children}
    </button>
  );
}
