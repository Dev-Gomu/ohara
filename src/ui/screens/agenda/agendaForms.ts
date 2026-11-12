import { addEvent, addExam, addSlot } from '../../../core/study/create';
import { toIcs } from '../../../core/study/ics';
import type { EventKind, StudyData } from '../../../core/study/types';
import { dispatch, type BlockOption } from '../../keyboard/store';
import { ask } from '../../shell/PromptWindow';
import { storage, today } from '../../study/study';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function subjectOptions(data: StudyData) {
  const open = data.years.filter((year) => !year.archived).map((year) => year.id);
  return data.subjects
    .filter((subject) => open.includes(subject.yearId))
    .map((subject) => ({ value: subject.id, label: subject.name }));
}

function askExam(data: StudyData, date: string) {
  const options = subjectOptions(data);
  ask({
    title: 'Nova prova',
    action: 'Criar',
    fields: [
      { id: 'subject', label: 'Matéria', options, value: options[0]?.value },
      { id: 'date', label: 'Data', type: 'date', value: date },
      { id: 'time', label: 'Hora', type: 'time', value: '08:00' },
    ],
    onSubmit: ({ subject = '', date: day = date, time = '08:00' }) => {
      const exam = { id: crypto.randomUUID(), subjectId: subject, date: day, time };
      storage.write((current) => addExam(current, exam));
    },
  });
}

function askEvent(kind: EventKind, title: string, date: string) {
  ask({
    title,
    action: 'Criar',
    fields: [
      { id: 'name', label: 'Nome' },
      { id: 'date', label: 'Data', type: 'date', value: date },
      { id: 'start', label: 'Início', type: 'time', value: '08:00' },
      { id: 'end', label: 'Fim', type: 'time', value: '09:00' },
    ],
    onSubmit: ({ name = '', date: day = date, start = '08:00', end = '09:00' }) => {
      const id = crypto.randomUUID();
      storage.write((current) => addEvent(current, id, kind, name, day, start, end));
    },
  });
}

function askSlot(data: StudyData) {
  const options = subjectOptions(data);
  ask({
    title: 'Nova aula na Grade',
    action: 'Criar',
    fields: [
      { id: 'subject', label: 'Matéria', options, value: options[0]?.value },
      {
        id: 'weekday',
        label: 'Dia da semana',
        options: WEEKDAYS.map((label, index) => ({ value: String(index + 1), label })),
        value: '1',
      },
      { id: 'start', label: 'Início', type: 'time', value: '08:00' },
      { id: 'end', label: 'Fim', type: 'time', value: '10:00' },
      {
        id: 'every',
        label: 'Repetição',
        options: [
          { value: '1', label: 'Toda semana' },
          { value: '2', label: 'Quinzenal' },
        ],
        value: '1',
      },
      { id: 'label', label: 'Rótulo', value: 'Teoria' },
    ],
    onSubmit: (values) => {
      const slot = {
        id: crypto.randomUUID(),
        subjectId: values.subject ?? '',
        weekday: Number(values.weekday),
        start: values.start ?? '08:00',
        end: values.end ?? '10:00',
        every: values.every === '2' ? (2 as const) : (1 as const),
        anchor: today,
        label: values.label ?? '',
        room: '',
      };
      storage.write((current) => addSlot(current, slot));
    },
  });
}

// Completa data e hora de uma prova cadastrada só com a matéria (regras.md C3 e C4).
export function askCompleteExam(data: StudyData, examId: string) {
  const exam = data.exams.find((item) => item.id === examId);
  if (!exam) return;
  ask({
    title: 'Completar prova',
    action: 'Salvar',
    fields: [
      { id: 'date', label: 'Data', type: 'date', value: exam.date || today },
      { id: 'time', label: 'Hora', type: 'time', value: exam.time || '08:00' },
    ],
    onSubmit: ({ date = exam.date, time = exam.time }) => {
      storage.write((current) => ({
        ...current,
        exams: current.exams.map((item) => (item.id === examId ? { ...item, date, time } : item)),
      }));
    },
  });
}

function exportIcs(data: StudyData) {
  const url = URL.createObjectURL(new Blob([toIcs(data, today)], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ohara-agenda.ics';
  link.click();
  URL.revokeObjectURL(url);
}

export function agendaOptions(data: StudyData, day: string): readonly BlockOption[] {
  return [
    { id: 'prova', label: 'Nova prova', run: () => askExam(data, day) },
    {
      id: 'trabalho',
      label: 'Novo trabalho',
      run: () => askEvent('trabalho', 'Novo trabalho', day),
    },
    {
      id: 'compromisso',
      label: 'Novo compromisso',
      run: () => askEvent('compromisso', 'Novo compromisso', day),
    },
    { id: 'grade', label: 'Nova aula na Grade', run: () => askSlot(data) },
    {
      id: 'lembrete',
      label: 'Novo lembrete',
      keys: 'Alt I',
      run: () => dispatch({ type: 'quickReminder' }),
    },
    { id: 'ics', label: 'Exportar .ics', run: () => exportIcs(data) },
  ];
}
