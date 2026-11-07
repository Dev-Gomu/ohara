import { useSyncExternalStore, type ReactNode } from 'react';
import { SCREENS } from '../../core/keyboard/actions';
import { SCREEN_NAMES } from '../../core/keyboard/keys';
import { PhoneBlock } from '../components/Block';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { openFaults, openNotes } from '../study/navigation';
import { storage } from '../study/study';
import styles from './ScreenFrame.module.css';

interface ScreenFrameProps {
  title: ReactNode;
  caps?: boolean;
  bar?: ReactNode;
  end?: ReactNode;
  children: ReactNode;
}

interface Page {
  id: string;
  label: string;
}

// Uma tela por vez no app, então basta observar o documento.
function subscribePages(notify: () => void): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributeFilter: ['data-pagina'],
  });
  return () => observer.disconnect();
}

const readPages = (): string =>
  [...document.querySelectorAll<HTMLElement>('[data-pagina]')]
    .map((element) => `${element.dataset.block ?? ''}\t${element.dataset.pagina ?? ''}`)
    .join('\n');

// Celular: um bloco por vez, trocado pela barra de baixo, seguindo o foco do teclado (no
// nível menu o foco guarda o último bloco). Os blocos são lidos do que a tela desenhou.
function usePhonePages(focusBlock: string) {
  const snapshot = useSyncExternalStore(subscribePages, readPages, () => '');
  const pages: Page[] = snapshot
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [id = '', label = ''] = line.split('\t');
      return { id, label };
    });
  const current = pages.some((page) => page.id === focusBlock) ? focusBlock : (pages[0]?.id ?? '');
  return { pages, current };
}

export function ScreenFrame({ title, caps = true, bar, end, children }: ScreenFrameProps) {
  const { focus, screen } = useKeyboardState();
  const phone = usePhonePages(focus.block);
  const ringAt = (index: number) =>
    focus.level === 'menu' && focus.menuIndex === index ? 'anel' : '';

  return (
    <main className={styles.tela}>
      <nav className={styles.topo} data-menu aria-label="Telas">
        {SCREENS.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`${styles.numero} ${ringAt(index)}`}
            data-menu-item
            data-sel={id === screen}
            aria-label={SCREEN_NAMES[id]}
            aria-current={id === screen ? 'page' : undefined}
            onClick={() => dispatch({ type: 'goToScreen', screen: id })}
          >
            {index + 1}
          </button>
        ))}
        {bar}
        <h1 className={styles.titulo} data-caps={caps}>
          {title}
        </h1>
        <div className={styles.fim}>
          {end}
          {!storage.persistent && <span className={styles.aviso}>Dados de exemplo</span>}
          <button
            type="button"
            className={`${styles.notas} ${ringAt(SCREENS.length)}`}
            data-menu-item
            onClick={openFaults}
          >
            Faltas
          </button>
          <button
            type="button"
            className={`${styles.notas} ${ringAt(SCREENS.length + 1)}`}
            data-menu-item
            onClick={openNotes}
          >
            Notas
          </button>
          <button
            type="button"
            className={`${styles.numero} ${ringAt(SCREENS.length + 2)}`}
            data-menu-item
            aria-label="Ajuda"
            onClick={() => dispatch({ type: 'openHelp' })}
          >
            ?
          </button>
        </div>
      </nav>
      <div className={styles.corpo}>
        <PhoneBlock.Provider value={phone.current}>{children}</PhoneBlock.Provider>
      </div>
      {phone.pages.length > 1 && (
        <nav className={styles.barraCelular} aria-label="Blocos">
          {phone.pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={styles.paginaCelular}
              data-sel={page.id === phone.current}
              aria-current={page.id === phone.current}
              onClick={() => dispatch({ type: 'jump', block: page.id, level: 'block' })}
            >
              {page.label}
            </button>
          ))}
        </nav>
      )}
    </main>
  );
}
