import { useEffect, useLayoutEffect, type ComponentType } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Level, Screen } from '../../core/keyboard/actions';
import { overlayOf } from '../../core/keyboard/focus';
import { startKeyboard } from '../keyboard/listener';
import { useKeyboardState } from '../keyboard/store';
import { Mesa } from '../screens/mesa/Mesa';
import { Acervo } from '../screens/acervo/Acervo';
import { Hub } from '../screens/hub/Hub';
import { Agenda } from '../screens/agenda/Agenda';
import { Configs } from '../screens/configs/Configs';
import { Treino } from '../screens/treino/Treino';
import { ConsultWindows } from './ConsultWindows';
import { HelpWindow } from './HelpWindow';
import { OptionsWindow } from './OptionsWindow';
import { Palette } from './Palette';
import { PromptWindow } from './PromptWindow';
import { UndoBar } from './UndoBar';
import { ReminderWindow } from './ReminderWindow';
import { FAULTS_OPEN, NOTES_OPEN } from '../study/navigation';
import { setScreenMemory } from '../study/screenMemory';
import { storage } from '../study/study';
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

  // D25: trocar de tela grava o que estiver na fila.
  useEffect(() => {
    void storage.flush();
    if (screen !== 'agenda') {
      setScreenMemory(NOTES_OPEN, false);
      setScreenMemory(FAULTS_OPEN, false);
    }
  }, [screen]);

  useLayoutEffect(() => {
    const field = document.querySelector<HTMLElement>(`[data-block="${focus.block}"] [data-field]`);
    if (focus.level === 'field' && overlay === 'none') {
      field?.focus();
    } else if (document.activeElement?.matches('[data-field]')) {
      (document.activeElement as HTMLElement).blur();
    }
    const bar = document.activeElement?.closest('[data-bar]');
    if (bar && !bar.closest(`[data-block="${focus.block}"]`)) (document.activeElement as HTMLElement).blur();
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
      <OptionsWindow />
      <ConsultWindows />
      <PromptWindow />
      <UndoBar />
    </>
  );
}
