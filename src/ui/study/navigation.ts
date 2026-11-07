import { dispatch } from '../keyboard/store';
import { setScreenMemory } from './screenMemory';

export const MESA_LESSON = 'mesa.aula';

export function openLesson(lessonId: string): void {
  setScreenMemory(MESA_LESSON, lessonId);
  dispatch({ type: 'goToScreen', screen: 'mesa' });
  dispatch({ type: 'jump', block: 'mesa.notes', level: 'field' });
}
