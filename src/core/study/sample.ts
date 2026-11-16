import { addDays, parseDay } from './dates';
import { SAMPLE_IMAGES, sampleCards } from './sampleCards';
import { sampleNotes, sampleVersions } from './sampleNotes';
import type {
  Attendance,
  ClassEvent,
  Exam,
  Folder,
  Lesson,
  Reminder,
  Slot,
  StudyData,
  Subject,
} from './types';

// Dados do modo exemplo (?exemplo): um semestre inteiro de mentira, com todos os casos que o app
// trata. Os testes unitários usam `fixtures.ts`, que é menor e fica parado.
// Casos cobertos: ano arquivado e ano vazio, matéria vazia, nome longo, pasta vazia, 42 aulas,
// aula sem bimestre, cartões simples, com marcas, cloze e imagem, provas incompletas, aula agora,
// trabalho, compromisso, grade quinzenal, faltas, aula cancelada, lembretes atrasados e feitos.

const CURRENT = 'ano-2';
const OLD = 'ano-1';
const NEXT = 'ano-3';

// id, nome, sigla, cor, ano
const SUBJECTS: [string, string, string, number, string][] = [
  ['gen', 'Genética', 'GEN', 0, CURRENT],
  ['imu', 'Imunologia', 'IMU', 1, CURRENT],
  ['pro', 'Propedêutica', 'PRO', 2, CURRENT],
  ['aps', 'Atenção Primária', 'APS', 3, CURRENT],
  ['far', 'Farmacologia', 'FAR', 4, CURRENT],
  ['fis', 'Fisiologia', 'FIS', 5, CURRENT],
  ['pat', 'Patologia Geral e Bases Moleculares da Doença', 'PAT', 6, CURRENT],
  ['bio', 'Bioética', 'BIO', 7, CURRENT],
  ['ana', 'Anatomia', 'ANA', 2, OLD],
  ['bqm', 'Bioquímica', 'BQM', 0, OLD],
  ['cir', 'Técnica Cirúrgica', 'CIR', 4, NEXT],
];

// Título, dias antes de hoje, bimestre (1, 2 ou 0 para sem bimestre)
type Row = [string, number, number];

const LESSONS: Record<string, Row[]> = {
  imu: [
    ['Células do sistema imune', 87, 1],
    ['Imunidade inata', 80, 1],
    ['Antígenos e anticorpos', 73, 1],
    ['Sistema complemento', 29, 2],
    ['Citocinas e quimiocinas', 15, 2],
    ['Tolerância e autoimunidade', 8, 2],
    ['Resposta inflamatória aguda', 0, 2],
    ['Resumo para a prova', 2, 0],
    ['Dúvidas da monitoria', 5, 0],
  ],
  gen: [
    ['Expressão gênica', 0, 2],
    ['Herança mendeliana', 30, 1],
    ['Mutações e reparo do DNA', 12, 2],
  ],
  pro: [
    ['Exame do abdome', 0, 2],
    ['Anamnese', 60, 1],
    ['Ausculta cardíaca', 21, 2],
  ],
  aps: [
    ['Territorialização', 0, 2],
    ['Visita domiciliar', 14, 2],
  ],
  far: [
    ['Farmacocinética', 40, 1],
    ['Receptores β-adrenérgicos e a resposta em órgãos-alvo: revisão completa', 10, 2],
    ['Interações medicamentosas', 3, 0],
  ],
  fis: Array.from({ length: 42 }, (_, index): Row => [
    `Aula ${index + 1} de fisiologia`,
    90 - index * 2,
    1,
  ]),
  pat: [
    ['Lesão e morte celular', 20, 2],
    ['Adaptações celulares', 45, 1],
  ],
  ana: [
    ['Membro superior', 200, 1],
    ['Cintura escapular', 190, 2],
  ],
  bqm: [['Glicólise', 210, 1]],
};

function folders(): Folder[] {
  return SUBJECTS.filter(([, , , , year]) => year !== NEXT).flatMap(([id]) =>
    [1, 2, 3].map((number) => ({
      id: `${id}-b${number}`,
      subjectId: id,
      name: `${number}º bimestre`,
      order: number,
    })),
  );
}

function lessons(today: string): Lesson[] {
  const notes = sampleNotes();
  return Object.entries(LESSONS).flatMap(([subjectId, rows]) =>
    rows.map(([title, daysAgo, folder], index) => {
      const id = `${subjectId}-a${index + 1}`;
      return {
        id,
        subjectId,
        folderId: folder === 0 ? null : `${subjectId}-b${folder}`,
        title,
        date: addDays(today, -daysAgo),
        notes: notes[id] ?? '',
      };
    }),
  );
}

// Aulas de hoje (a de IMU é a "agora", pelas 13:42 fixas da tela) e as dos próximos dias.
function events(today: string, all: readonly Lesson[]): ClassEvent[] {
  const lessonOf = (title: string) => all.find((item) => item.title === title)?.id ?? null;
  const classes: [string, string, number, string, string][] = [
    ['gen', 'Expressão gênica', 0, '08:00', '09:30'],
    ['aps', 'Territorialização', 0, '10:00', '11:00'],
    ['imu', 'Resposta inflamatória aguda', 0, '13:00', '15:00'],
    ['pro', 'Exame do abdome', 0, '15:10', '17:00'],
    ['imu', 'Sistema complemento', -1, '14:00', '15:30'],
    ['fis', 'Aula 20 de fisiologia', 1, '08:00', '10:00'],
    ['far', 'Interações medicamentosas', 1, '10:15', '12:00'],
    ['pat', 'Lesão e morte celular', 2, '14:00', '16:00'],
    ['gen', 'Mutações e reparo do DNA', 3, '08:00', '09:30'],
  ];
  const rows: ClassEvent[] = classes.map(([subjectId, title, offset, start, end], index) => ({
    id: `ev-${index}`,
    kind: 'aula',
    subjectId,
    lessonId: lessonOf(title),
    title,
    date: addDays(today, offset),
    start,
    end,
  }));
  const others: [ClassEvent['kind'], string, string, number, string, string][] = [
    ['trabalho', 'far', 'Relatório de caso', 7, '18:00', '19:00'],
    ['trabalho', 'fis', 'Seminário', 17, '18:00', '19:00'],
    ['trabalho', 'imu', 'Resenha sobre autoimunidade', 4, '23:00', '23:59'],
    ['compromisso', '', 'Consulta no dentista', 1, '16:30', '17:30'],
    ['compromisso', '', 'Grupo de estudo', 3, '19:00', '21:00'],
    ['compromisso', '', 'Plantão voluntário', 3, '07:00', '13:00'],
    ['compromisso', '', 'Aniversário da Ana', 3, '20:00', '22:00'],
    ['compromisso', '', 'Monitoria de anatomia', 3, '14:00', '15:00'],
  ];
  return rows.concat(
    others.map(([kind, subjectId, title, offset, start, end], index) => ({
      id: `ev-x${index}`,
      kind,
      subjectId,
      lessonId: null,
      title,
      date: addDays(today, offset),
      start,
      end,
    })),
  );
}

// Grade de segunda a sexta, fora do dia de hoje (hoje valem as aulas reais). APS é quinzenal.
function slots(today: string): Slot[] {
  const week: [string, string, string, string, string, 1 | 2][] = [
    ['far', 'Teoria', '08:00', '10:00', 'Sala 12', 1],
    ['fis', 'Teoria', '10:15', '12:00', 'Sala 12', 1],
    ['pat', 'Prática', '14:00', '16:00', 'Laboratório 3', 1],
    ['aps', 'Campo', '16:15', '18:00', 'UBS Centro', 2],
  ];
  const skip = parseDay(today).getDay();
  return [1, 2, 3, 4, 5]
    .filter((weekday) => weekday !== skip)
    .flatMap((weekday) =>
      week.map(([subjectId, label, start, end, room, every], index) => ({
        id: `g-${weekday}-${index}`,
        subjectId,
        weekday,
        start,
        end,
        every,
        anchor: today,
        label,
        room,
      })),
    );
}

// Provas: com data e hora, sem hora e sem data (as duas últimas vão para "A completar").
function exams(today: string): Exam[] {
  const rows: [string, number | null, string][] = [
    ['gen', 7, '08:00'],
    ['imu', 11, '10:00'],
    ['pro', 11, '14:00'],
    ['pro', 14, '13:00'],
    ['aps', 20, '08:00'],
    ['far', 25, ''],
    ['gen', null, ''],
  ];
  return rows.map(([subjectId, days, time], index) => ({
    id: `p-${index}`,
    subjectId,
    date: days === null ? '' : addDays(today, days),
    time,
  }));
}

// Faltas de FIS (matéria com contagem de presença; FAR também conta, mas sem faltas): horas perdidas e uma aula cancelada.
function attendance(today: string): Attendance[] {
  const days = Array.from({ length: 28 }, (_, index) => addDays(today, -28 + index));
  const weekdays = days.filter((day) => parseDay(day).getDay() >= 1 && parseDay(day).getDay() <= 5);
  return weekdays
    .filter((_, index) => index % 6 === 2 || index === 9)
    .map((date, index) => ({
      id: `f-${index}`,
      subjectId: 'fis',
      date,
      start: '10:15',
      missed: index === 3 ? 0 : index % 2 === 0 ? 2 : 1,
      cancelled: index === 3,
    }));
}

function reminders(today: string): Reminder[] {
  const rows: [string, number, boolean][] = [
    ['Entregar a lista de exercícios de Genética', -3, false],
    ['Comprar luvas para a prática', -1, false],
    ['Levar o jaleco para a Propedêutica', 0, false],
    ['Revisar IL-6 e TNF-α antes da prova de Imunologia', 0, false],
    ['Confirmar a sala do laboratório de Genética', 0, false],
    ['Renovar o cartão da biblioteca', 0, true],
    ['Imprimir o artigo de Farmacologia', 2, false],
    ['Reservar o consultório para a visita domiciliar', 5, false],
    ['Pagar a inscrição do congresso', -1, true],
    ['Devolver o livro de Anatomia', -6, true],
  ];
  return rows.map(([text, offset, done], index) => ({
    id: `l-${index}`,
    text,
    date: addDays(today, offset),
    done,
  }));
}

export function createSample(today: string): StudyData {
  const subjects: Subject[] = SUBJECTS.map(([id, name, code, color, yearId], index) => ({
    id,
    yearId,
    name,
    code,
    color,
    lastAccess: id === 'bio' || id === 'cir' ? null : addDays(today, -index),
    classesFrom: id === 'far' || id === 'fis' ? addDays(today, -28) : null,
  }));
  const allLessons = lessons(today);
  return {
    years: [
      { id: OLD, name: '1º ano', archived: true },
      { id: CURRENT, name: '2º ano', archived: false },
      { id: NEXT, name: '3º ano', archived: false },
    ],
    subjects,
    folders: folders(),
    lessons: allLessons,
    cards: sampleCards(today, allLessons),
    exams: exams(today),
    events: events(today, allLessons),
    slots: slots(today),
    reminders: reminders(today),
    files: [],
    attendance: attendance(today),
    cardImages: SAMPLE_IMAGES,
    vault: [],
    secrets: [],
    reviews: [],
    settings: [],
    noteVersions: sampleVersions(today),
  };
}
