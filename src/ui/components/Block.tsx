import { createContext, useContext, type ReactNode } from 'react';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { BlockIcon, type IconName } from './BlockIcon';
import { Dica } from './Dica';
import { Key } from './Key';
import styles from './Block.module.css';

// Bloco que o celular mostra agora. As telas maiores ignoram (D79).
export const PhoneBlock = createContext('');

interface BlockProps {
  id: string;
  title?: string;
  // Só na Mesa: o ícone toma o lugar do nome escrito (o nome fica em aria-label e title).
  icon?: IconName;
  // Nome na barra do celular, quando o título muda ou falta. Sem título nem rótulo, o bloco
  // é régua ou busca e fica sempre à vista no celular.
  label?: string;
  count?: string;
  shortcut?: string;
  tools?: ReactNode;
  menu?: boolean;
  // Estado fixo, sem o teclado: só para a vitrine do lab.
  fixed?: 'none' | 'block' | 'inside';
  className?: string;
  children: ReactNode;
}

export function Block(props: BlockProps) {
  const { id, title, icon, label, count, shortcut, tools, menu, fixed, className, children } =
    props;
  const { focus } = useKeyboardState();
  const phone = useContext(PhoneBlock);
  const page = label ?? title;
  const shown =
    page === undefined ? undefined : phone === '' || phone === id ? 'visivel' : 'oculto';
  const here = focus.block === id;
  const onBlock = fixed ? fixed === 'block' : here && focus.level === 'block';
  const inside = fixed
    ? fixed === 'inside'
    : // No menu, o último bloco usado segue aceso: é para ele que o Enter volta (D116).
      here && focus.level !== 'block';
  return (
    <section
      className={`${styles.bloco} ${className ?? ''}`}
      data-block={id}
      data-foco={onBlock ? 'bloco' : inside ? 'dentro' : undefined}
      data-pagina={page}
      data-celular={shown}
      aria-label={title ?? label}
    >
      {title !== undefined && (
        <header className={styles.titulo}>
          {icon ? (
            <h2 className={styles.nome} title={title}>
              <span className={styles.icone} aria-hidden="true">
                <BlockIcon name={icon} />
              </span>
              {title}
            </h2>
          ) : (
            <h2 className={styles.nome}>{title}</h2>
          )}
          {count !== undefined && <span className={styles.conta}>{count}</span>}
          <div className={`${styles.fim} ${icon ? styles.fimDiscreto : ''}`}>
            {tools}
            {shortcut !== undefined && <Key>{shortcut}</Key>}
            {menu && (
              <Dica content="Opções" shortcut="Alt O">
                <button
                  type="button"
                  className={styles.opcoes}
                  aria-label={`Opções de ${title}`}
                  onClick={() => dispatch({ type: 'openOptions' })}
                >
                  ⋮
                </button>
              </Dica>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
