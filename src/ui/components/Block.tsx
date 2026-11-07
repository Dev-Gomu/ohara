import type { ReactNode } from 'react';
import { useKeyboardState } from '../keyboard/store';
import styles from './Block.module.css';

interface BlockProps {
  id: string;
  title?: string;
  count?: string;
  shortcut?: string;
  className?: string;
  children: ReactNode;
}

export function Block({ id, title, count, shortcut, className, children }: BlockProps) {
  const { focus } = useKeyboardState();
  const here = focus.block === id;
  const onBlock = here && focus.level === 'block';
  const inside = here && (focus.level === 'field' || focus.level === 'nav');
  return (
    <section
      className={`${styles.bloco} ${onBlock ? 'anel' : ''} ${className ?? ''}`}
      data-block={id}
      data-foco={onBlock ? 'bloco' : inside ? 'dentro' : undefined}
      aria-label={title}
    >
      {title !== undefined && (
        <header className={styles.titulo}>
          <h2 className={styles.nome}>{title}</h2>
          {count !== undefined && <span className={styles.conta}>{count}</span>}
          {shortcut !== undefined && <kbd className={styles.tecla}>{shortcut}</kbd>}
        </header>
      )}
      {children}
    </section>
  );
}
