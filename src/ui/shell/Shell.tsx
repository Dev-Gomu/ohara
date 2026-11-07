import { useEffect, useLayoutEffect, type ComponentType } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Level, Screen } from '../../core/keyboard/actions';
import { overlayOf } from '../../core/keyboard/focus';
import { startKeyboard } from '../keyboard/listener';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { Acervo, Agenda, Configs, Hub, Mesa, Treino } from '../screens/stubs';
import { HelpWindow } from './HelpWindow';
import { Palette } from './Palette';
import { ReminderWindow } from './ReminderWindow';
import styles from './Shell.module.css';

const SCREEN_VIEWS: Readonly<Record<Screen, ComponentType>> = {
  hub: Hub,
  mesa: Mesa,
  acervo: Acervo,
  treino: Treino,
  agenda: Agenda,
  configs: Configs,
};

const LEVEL_NAMES: Record<Level, string> = {
  menu: 'menu',
  block: 'bloco',
  field: 'campo',
  nav: 'campo navegável',
};

export function Shell() {
  const { focus, screen, lastAction } = useKeyboardState();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const overlay = overlayOf(focus);
  const View = SCREEN_VIEWS[screen];

  useEffect(startKeyboard, []);

  useLayoutEffect(() => {
    const field = document.querySelector<HTMLElement>(`[data-block="${focus.block}"] [data-field]`);
    if (focus.level === 'field' && overlay === 'none') {
      field?.focus();
    } else if (document.activeElement?.matches('[data-field]')) {
      (document.activeElement as HTMLElement).blur();
    }
  }, [focus.level, focus.block, overlay]);

  return (
    <>
      <View />
      <p className="so-leitor" role="status">
        Tela: <span data-testid="tela">{screen}</span>. Nível:{' '}
        <span data-testid="nivel">{LEVEL_NAMES[focus.level]}</span>. Bloco:{' '}
        <span data-testid="bloco">{focus.block}</span>. Última ação:{' '}
        <span data-testid="ultima-acao">{lastAction ?? 'nenhuma'}</span>
      </p>
      {focus.optionsOpen && (
        <div className={styles.aviso} data-testid="opcoes">
          <span>Opções do bloco</span>
          <button className={styles.botao} onClick={() => dispatch({ type: 'escape' })}>
            Fechar
          </button>
        </div>
      )}
      {needRefresh && (
        <div className={styles.aviso} role="status">
          <span>Há uma versão nova.</span>
          <button className={styles.botao} onClick={() => void updateServiceWorker(true)}>
            Atualizar
          </button>
        </div>
      )}
      <HelpWindow />
      <Palette />
      <ReminderWindow />
    </>
  );
}
