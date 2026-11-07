import { SCREENS } from '../../core/keyboard/actions';
import { SCREEN_NAMES } from '../../core/keyboard/keys';
import type { StudyData } from '../../core/study/types';
import { dispatch } from '../keyboard/store';
import { openLesson, openNotes, openSubject } from '../study/navigation';
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

export function commands(data: StudyData): Command[] {
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
    { id: 'notas', label: 'Notas do boletim', run: openNotes },
    { id: 'tema', label: 'Trocar tema', run: toggleTheme },
    {
      id: 'lembrete',
      label: 'Lembrete rápido',
      keys: 'Alt I',
      run: () => dispatch({ type: 'quickReminder' }),
    },
    { id: 'ajuda', label: 'Atalhos', keys: 'Alt /', run: () => dispatch({ type: 'openHelp' }) },
    ...data.subjects.map((subject) => ({
      id: `materia-${subject.id}`,
      label: subject.name,
      keys: subject.code,
      run: () => openSubject(subject.id),
    })),
    ...data.lessons.map((lesson) => ({
      id: `aula-${lesson.id}`,
      label: lesson.title,
      run: () => openLesson(lesson.id),
    })),
  ];
}
