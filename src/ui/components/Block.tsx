import { createContext, useContext, type ReactNode } from 'react';
import { dispatch, useKeyboardState } from '../keyboard/store';
import styles from './Block.module.css';

// Bloco que o celular mostra agora. As telas maiores ignoram (D79).
export const PhoneBlock = createContext('');

interface BlockProps {
  id: string;
  title?: string;
  // Nome na barra do celular, quando o título muda ou falta. Sem título nem rótulo, o bloco
  // é régua ou busca e fica sempre à vista no celular.
  label?: string;
  count?: string;
  shortcut?: string;
  tools?: ReactNode;
  menu?: boolean;
  className?: string;
  children: ReactNode;
}

export function Block(props: BlockProps) {
  const { id, title, label, count, shortcut, tools, menu, className, children } = props;
  const { focus } = useKeyboardState();
  const phone = useContext(PhoneBlock);
  const page = label ?? title;
  const shown =
    page === undefined ? undefined : phone === '' || phone === id ? 'visivel' : 'oculto';
  const here = focus.block === id;
  const onBlock = here && focus.level === 'block';
  const inside = here && (focus.level === 'field' || focus.level === 'nav');
  return (
    <section
      className={`${styles.bloco} ${onBlock ? 'anel' : ''} ${className ?? ''}`}
      data-block={id}
      data-foco={onBlock ? 'bloco' : inside ? 'dentro' : undefined}
      data-pagina={page}
      data-celular={shown}
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
