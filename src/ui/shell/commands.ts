import { SCREENS } from '../../core/keyboard/actions';
import { SCREEN_NAMES } from '../../core/keyboard/keys';
import { dispatch } from '../keyboard/store';
import { toggleTheme } from '../theme';

export const CONSULT_WINDOWS = [
  { id: 'consulta-lembretes', title: 'Lembretes' },
  { id: 'consulta-dia', title: 'Agenda do dia' },
  { id: 'consulta-calendario', title: 'Calendário' },
  { id: 'consulta-provas', title: 'Próximas provas' },
] as const;

export interface Command {
  id: string;
  label: string;
  keys?: string;
  run: () => void;
}

export function commands(): Command[] {
  return [
    ...SCREENS.map((screen, index) => ({
      id: `tela-${screen}`,
      label: SCREEN_NAMES[screen],
      keys: `Alt ${index + 1}`,
      run: () => dispatch({ type: 'goToScreen', screen }),
    })),
    ...CONSULT_WINDOWS.map(({ id, title }) => ({
      id,
      label: title,
      run: () => dispatch({ type: 'openWindow', window: id }),
    })),
    { id: 'tema', label: 'Trocar tema', run: toggleTheme },
    {
      id: 'lembrete',
      label: 'Lembrete rápido',
      keys: 'Alt I',
      run: () => dispatch({ type: 'quickReminder' }),
    },
    { id: 'ajuda', label: 'Atalhos', keys: 'Alt /', run: () => dispatch({ type: 'openHelp' }) },
  ];
}
