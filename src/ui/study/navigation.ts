import { monthGrid } from '../../core/study/dates';
import { dispatch } from '../keyboard/store';
import { setScreenMemory } from './screenMemory';

export const MESA_LESSON = 'mesa.aula';

export function openLesson(lessonId: string): void {
  setScreenMemory(MESA_LESSON, lessonId);
  dispatch({ type: 'goToScreen', screen: 'mesa' });
  dispatch({ type: 'jump', block: 'mesa.notes', level: 'field' });
}

export const AGENDA_MONTH = 'agenda.mes';
export const AGENDA_VIEWS = 'agenda.visao';

// Abre o Mês já no dia pedido.
export function openDay(day: string): void {
  dispatch({ type: 'goToScreen', screen: 'agenda' });
  dispatch({
    type: 'jump',
    block: AGENDA_MONTH,
    level: 'nav',
    items: { [AGENDA_VIEWS]: 1, [AGENDA_MONTH]: monthGrid(day).indexOf(day) },
  });
}
