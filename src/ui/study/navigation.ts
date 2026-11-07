import { monthGrid } from '../../core/study/dates';
import { dispatch } from '../keyboard/store';
import { setScreenMemory } from './screenMemory';

export const MESA_LESSON = 'mesa.aula';
export const ACERVO_SUBJECT = 'acervo.materia';

export function openLesson(lessonId: string): void {
  setScreenMemory(MESA_LESSON, lessonId);
  dispatch({ type: 'goToScreen', screen: 'mesa' });
  dispatch({ type: 'jump', block: 'mesa.notes', level: 'field' });
}

// O bloco vazio faz a matéria aplicar o foco de chegada, com a pasta inicial da D76.
export function openSubject(subjectId: string): void {
  setScreenMemory(ACERVO_SUBJECT, subjectId);
  dispatch({ type: 'goToScreen', screen: 'acervo' });
  dispatch({ type: 'jump', block: '', level: 'block' });
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
