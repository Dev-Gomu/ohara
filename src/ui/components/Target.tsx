import type { ReactNode } from 'react';
import { NavItem } from './NavItem';

// Onde a peça vive: `nav` liga ao teclado (campo navegável); sem ele, a tela informa
// escolhido e cursor (abas do menu, vitrine do lab).
export interface TargetProps {
  nav?: { block: string; index: number } | undefined;
  selected?: boolean | undefined;
  cursor?: boolean | undefined;
  onOpen?: (() => void) | undefined;
  label?: string | undefined;
  // Item do menu do topo: o teclado o acha por `data-menu-item` e o cursor vira anel fino.
  menuItem?: boolean | undefined;
}

interface Props extends TargetProps {
  className?: string | undefined;
  subject?: number | undefined;
  children: ReactNode;
}

export function Target(props: Props) {
  const { nav, selected, cursor, onOpen, label, className, subject, menuItem, children } = props;
  if (nav !== undefined) {
    return (
      <NavItem
        block={nav.block}
        index={nav.index}
        ring="cursor"
        {...(className !== undefined && { className })}
        {...(onOpen !== undefined && { onOpen })}
        {...(label !== undefined && { label })}
        subject={subject}
      >
        {children}
      </NavItem>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      className={menuItem && cursor ? `${className ?? ''} anel-fino` : className}
      data-menu-item={menuItem ? '' : undefined}
      data-sel={selected ?? false}
      data-materia={subject}
      data-cursor={cursor && !menuItem ? '' : undefined}
      aria-current={selected ?? false}
      aria-label={label}
      onClick={onOpen}
    >
      {children}
    </button>
  );
}
