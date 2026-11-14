import { SCREEN_NAMES } from '../../core/keyboard/keys';
import { groupLines, linesOf, type HelpTab } from '../../core/keyboard/keyTools';
import { BlockTab, ToggleGroup } from '../components/Toggles';
import { Window } from '../components/Window';
import { dispatch, getKeyboardState, useKeyboardState } from '../keyboard/store';
import styles from './HelpWindow.module.css';

const TABS: readonly HelpTab[] = ['screen', 'universal', 'all'];

// A lista vive no estado de foco; tocar numa aba anda de uma em uma até chegar nela.
function goTo(id: HelpTab): void {
  const gap = (TABS.indexOf(id) - getKeyboardState().focus.helpTab + TABS.length) % TABS.length;
  if (gap !== 0) dispatch({ type: 'helpTab', step: gap === 1 ? 1 : -1 });
}

export function HelpWindow() {
  const { screen, focus } = useKeyboardState();
  const tab = TABS[focus.helpTab] ?? 'screen';
  const name = SCREEN_NAMES[screen];
  const names: Record<HelpTab, string> = { screen: `Só ${name}`, universal: 'Universais', all: 'Todos' };
  const lines = linesOf(tab, screen);
  return (
    <Window id="help" context={`Ajuda · você está em ${name}`} title="Atalhos" testId="ajuda" wide>
      {focus.window === 'help' && (
        <>
          <div className={styles.abas}>
            <ToggleGroup label="Listas de atalhos">
              {TABS.map((id) => (
                <BlockTab
                  key={id}
                  selected={tab === id}
                  count={linesOf(id, screen).length}
                  onPress={() => goTo(id)}
                >
                  {names[id]}
                </BlockTab>
              ))}
            </ToggleGroup>
          </div>
          {lines.length === 0 && (
            <p className={styles.vazio} data-testid="ajuda-vazia">
              <b>{name} não tem atalhos só dela.</b> Aqui valem os Universais: navegar entre telas,
              mover o foco, paleta e lembrete.
            </p>
          )}
          <div className={styles.corpo}>
            {groupLines(lines).map((section) => (
              <section key={section.group} className={styles.cartao}>
                <h3 className={styles.grupo}>{section.group}</h3>
                <dl className={styles.lista}>
                  {section.lines.map((line) => (
                    <div key={line.text} className={styles.linha} data-testid="atalho">
                      <dd className={styles.texto}>{line.text}</dd>
                      <dt className={styles.teclas}>
                        {line.labels.map((label) => (
                          <kbd key={label} className={styles.tecla}>
                            {label}
                          </kbd>
                        ))}
                      </dt>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </>
      )}
    </Window>
  );
}
