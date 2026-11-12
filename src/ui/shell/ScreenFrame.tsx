import { useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { SCREENS } from '../../core/keyboard/actions';
import { SCREEN_NAMES } from '../../core/keyboard/keys';
import { PhoneBlock } from '../components/Block';
import { Button } from '../components/Button';
import { Island, LevelIndicator, Tab } from '../components/Island';
import { ScreenIcon } from '../components/ScreenIcon';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { openFaults, openNotes } from '../study/navigation';
import { storage } from '../study/study';
import styles from './ScreenFrame.module.css';
import { placeTopBar } from './topAnimation';
import { useTopTabs } from './topTabs';

interface ScreenFrameProps {
  title: ReactNode;
  caps?: boolean;
  bar?: ReactNode;
  end?: ReactNode;
  // Falso quando um modo passageiro (Redimensionar) toma o lugar do indicador de nível.
  level?: boolean;
  children: ReactNode;
}

const LEVEL_KEYS = {
  menu: ['Enter entra'],
  block: ['Enter entra', 'Esc sobe'],
  field: ['Esc sobe'],
};

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

export function ScreenFrame({ title, caps = true, bar, end, level = true, children }: ScreenFrameProps) {
  const { focus, screen } = useKeyboardState();
  const phone = usePhonePages(focus.block);
  const cursorAt = (index: number) => focus.level === 'menu' && focus.menuIndex === index;
  const levelName: keyof typeof LEVEL_KEYS = focus.level === 'nav' ? 'field' : focus.level;
  const bar_ = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const tabs = useTopTabs();

  useLayoutEffect(() => {
    const numbers = [...(bar_.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])].slice(
      0,
      SCREENS.length,
    );
    if (indicator.current) {
      placeTopBar(
        { indicator: indicator.current, numbers, title: heading.current },
        SCREENS.indexOf(screen),
      );
    }
  }, [screen, tabs]);

  return (
    <main className={styles.tela}>
      <nav ref={bar_} className={styles.topo} data-menu aria-label="Telas">
        <Island label="Telas" slides>
          <i ref={indicator} className={styles.indicador} aria-hidden="true" />
          {SCREENS.map((id, index) => (
            <Tab
              key={id}
              number={index + 1}
              name={SCREEN_NAMES[id]}
              current={id === screen}
              cursor={cursorAt(index)}
              menuItem
              show={tabs}
              icon={<ScreenIcon screen={id} />}
              onOpen={() => dispatch({ type: 'goToScreen', screen: id })}
            />
          ))}
        </Island>
        {bar}
        <h1 ref={heading} className={styles.titulo} data-caps={caps}>
          {title}
        </h1>
        <div className={styles.fim}>
          {end}
          {level && <LevelIndicator level={levelName} keys={LEVEL_KEYS[levelName]} />}
          {!storage.persistent && <span className={styles.aviso}>Dados de exemplo</span>}
          <Button variant="quiet" menuItem cursor={cursorAt(SCREENS.length)} onPress={openFaults}>
            Faltas
          </Button>
          <Button variant="quiet" menuItem cursor={cursorAt(SCREENS.length + 1)} onPress={openNotes}>
            Notas
          </Button>
          <Button
            variant="quiet"
            menuItem
            cursor={cursorAt(SCREENS.length + 2)}
            label="Ajuda"
            onPress={() => dispatch({ type: 'openHelp' })}
          >
            ?
          </Button>
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
