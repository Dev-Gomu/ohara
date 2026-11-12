import type { ReactNode } from 'react';
import { Key } from './Key';
import styles from './Toggles.module.css';

// Grupo de alternadores ou de abas: a mesma ilha recuada da barra do topo.
export function ToggleGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.grupo} role="group" aria-label={label}>
      {children}
    </div>
  );
}

interface BlockToggleProps {
  name: string;
  // Letra do atalho (Alt + letra), mostrada na tecla.
  letter: string;
  open: boolean;
  cursor?: boolean;
  onToggle: () => void;
}

// Alternador de bloco: mostra ou esconde um bloco. Aberto = fundo de escolhido e marca cheia.
export function BlockToggle({ name, letter, open, cursor, onToggle }: BlockToggleProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={styles.item}
      data-sel={open}
      data-cursor={cursor ? '' : undefined}
      aria-pressed={open}
      title={`Alt ${letter}`}
      onClick={onToggle}
    >
      <i className={styles.marca} />
      {name}
      <Key>{letter}</Key>
    </button>
  );
}

interface BlockTabsProps {
  label: string;
  children: ReactNode;
}

// Abas dentro do cabeçalho de um bloco. É barra do topo do bloco (Alt T chega nela).
export function BlockTabs({ label, children }: BlockTabsProps) {
  return (
    <div className={styles.grupo} role="group" aria-label={label} data-bar="top" data-bar-follow>
      {children}
    </div>
  );
}

interface BlockTabProps {
  selected: boolean;
  count?: number;
  onPress: () => void;
  children: string;
}

export function BlockTab({ selected, count, onPress, children }: BlockTabProps) {
  return (
    <button type="button" className={styles.aba} data-sel={selected} onClick={onPress}>
      {children}
      {count !== undefined && <span className={styles.numero}>{count}</span>}
    </button>
  );
}
