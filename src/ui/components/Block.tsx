import type { ReactNode } from 'react';
import { dispatch, useKeyboardState } from '../keyboard/store';
import styles from './Block.module.css';

interface BlockProps {
  id: string;
  title?: string;
  count?: string;
  shortcut?: string;
  tools?: ReactNode;
  menu?: boolean;
  className?: string;
  children: ReactNode;
}

export function Block(props: BlockProps) {
  const { id, title, count, shortcut, tools, menu, className, children } = props;
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
          <div className={styles.fim}>
            {tools}
            {shortcut !== undefined && <kbd className={styles.tecla}>{shortcut}</kbd>}
            {menu && (
              <button
                type="button"
                className={styles.opcoes}
                aria-label={`Opções de ${title}`}
                onClick={() => dispatch({ type: 'openOptions' })}
              >
                ⋮
              </button>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
