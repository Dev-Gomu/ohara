import type { ReactNode } from 'react';
import { Key } from './Key';
import styles from './Button.module.css';

interface ButtonProps {
  // 'primary': azul cheio, um por bloco. 'quiet': só texto, para ajuste menor.
  variant?: 'primary' | 'plain' | 'quiet';
  shortcut?: string;
  cursor?: boolean;
  // Item do menu do topo: `data-menu-item` e cursor em anel fino.
  menuItem?: boolean;
  // Desabilitado continua focável, para poder explicar o motivo.
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
  children: ReactNode;
}

export function Button(props: ButtonProps) {
  const { variant = 'plain', shortcut, cursor, menuItem, disabled, label, onPress, children } = props;
  return (
    <button
      type="button"
      className={menuItem && cursor ? `${styles.botao} anel-fino` : styles.botao}
      data-tipo={variant}
      data-menu-item={menuItem ? '' : undefined}
      data-cursor={cursor && !menuItem ? '' : undefined}
      aria-disabled={disabled || undefined}
      aria-label={label}
      onClick={disabled ? undefined : onPress}
    >
      {children}
      {shortcut !== undefined && <Key>{shortcut}</Key>}
    </button>
  );
}
