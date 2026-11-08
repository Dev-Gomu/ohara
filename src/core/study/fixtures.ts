import { addDays, parseDay } from './dates';
import type { Card, ClassEvent, Folder, Lesson, Slot, StudyData, Subject } from './types';

const YEAR = 'ano-2';

const SUBJECTS: [string, string, string, number][] = [
  ['gen', 'Genética', 'GEN', 0],
  ['imu', 'Imunologia', 'IMU', 1],
  ['pro', 'Propedêutica', 'PRO', 2],
  ['aps', 'Atenção Primária', 'APS', 3],
  ['far', 'Farmacologia', 'FAR', 4],
  ['fis', 'Fisiologia', 'FIS', 5],
  ['pat', 'Patologia Geral e Bases Moleculares da Doença', 'PAT', 6],
  ['bio', 'Bioética', 'BIO', 7],
];

// Título, dias antes de hoje, pasta (1, 2 ou 0 para sem pasta)
const IMU_LESSONS: [string, number, number][] = [
  ['Células do sistema imune', 87, 1],
  ['Imunidade inata', 80, 1],
  ['Antígenos e anticorpos', 73, 1],
  ['Sistema complemento', 29, 2],
  ['Citocinas e quimiocinas', 15, 2],
  ['Tolerância e autoimunidade', 8, 2],
  ['Resposta inflamatória aguda', 0, 2],
  ['Resumo para a prova', 2, 0],
  ['Dúvidas da monitoria', 5, 0],
];

const OTHER_LESSONS: Record<string, [string, number, number][]> = {
  gen: [
    ['Expressão gênica', 0, 2],
    ['Herança mendeliana', 30, 1],
    ['Mutações e reparo do DNA', 12, 2],
  ],
  pro: [
    ['Exame do abdome', 0, 2],
    ['Anamnese', 60, 1],
  ],
  aps: [['Territorialização', 0, 2]],
  far: [
    ['Farmacocinética', 40, 1],
    ['Receptores β-adrenérgicos e a resposta em órgãos-alvo: revisão completa', 10, 2],
  ],
  fis: Array.from({ length: 42 }, (_, index) => [
    `Aula ${index + 1} de fisiologia`,
    90 - index * 2,
    1,
  ]),
  pat: [['Lesão e morte celular', 20, 2]],
};

const IMU_CARDS: [string, string][] = [
  ['Qual receptor reconhece LPS?', 'TLR4'],
  ['Citocina que induz PCR no fígado', 'IL-6'],
  ['Quimiotático clássico de neutrófilos', 'IL-8 (CXCL8)'],
  ['Molécula do rolamento', 'Selectinas'],
  ['Via que libera IL-1β, IL-6 e TNF-α', 'NF-κB'],
  ['Mediador da febre no hipotálamo', 'PGE₂'],
];

const NOTES = [
  '<h1>Resposta inflamatória aguda</h1>',
  '<p>O macrófago reconhece o LPS pelo <mark>TLR4</mark>. A via segue por NF-κB e libera IL-1β, IL-6 e TNF-α.</p>',
  '<h2>Mediadores</h2>',
  '<ul><li><p>IL-1β e TNF-α: febre, via PGE₂ no hipotálamo.</p></li><li><p>IL-6: age no fígado, ↑ PCR e fibrinogênio.</p></li></ul>',
  '<p>Entre 6 e 24 horas predominam neutrófilos; entre 24 e 48 horas, monócitos. <mark>Cai na prova.</mark></p>',
].join('');

function foldersFor(subjectId: string): Folder[] {
  return [1, 2, 3].map((number) => ({
    id: `${subjectId}-b${number}`,
    subjectId,
    name: `${number}º bimestre`,
    order: number,
  }));
}

function lessonsFor(
  subjectId: string,
  rows: readonly [string, number, number][],
  today: string,
): Lesson[] {
  return rows.map(([title, daysAgo, folder], index) => ({
    id: `${subjectId}-a${index + 1}`,
    subjectId,
    folderId: folder === 0 ? null : `${subjectId}-b${folder}`,
    title,
    date: addDays(today, -daysAgo),
    notes: title === 'Resposta inflamatória aguda' ? NOTES : '',
  }));
}

function eventsFor(today: string, lessons: readonly Lesson[]): ClassEvent[] {
  const lessonOf = (title: string) => lessons.find((item) => item.title === title)?.id ?? null;
  const rows: [string, string, string, string][] = [
    ['gen', 'Expressão gênica', '08:00', '09:30'],
    ['aps', 'Territorialização', '10:00', '11:00'],
    ['imu', 'Resposta inflamatória aguda', '13:00', '15:00'],
    ['pro', 'Exame do abdome', '15:10', '17:00'],
  ];
  return rows.map(([subjectId, title, start, end], index) => ({
    id: `ev-${index}`,
    kind: 'aula',
    subjectId,
    lessonId: lessonOf(title),
    title,
    date: today,
    start,
    end,
  }));
}

// Grade de segunda a sexta, fora do dia de hoje: hoje tem as aulas reais acima.
function slotsFor(today: string): Slot[] {
  const week: [string, string, string, string, string][] = [
    ['far', 'Teoria', '08:00', '10:00', 'Sala 12'],
    ['fis', 'Teoria', '10:15', '12:00', 'Sala 12'],
    ['pat', 'Prática', '14:00', '16:00', 'Laboratório 3'],
  ];
  const skip = parseDay(today).getDay();
  return [1, 2, 3, 4, 5]
    .filter((weekday) => weekday !== skip)
    .flatMap((weekday) =>
      week.map(([subjectId, label, start, end, room], index) => ({
        id: `g-${weekday}-${index}`,
        subjectId,
        weekday,
        start,
        end,
        every: 1 as const,
        anchor: today,
        label,
        room,
      })),
    );
}

function cardsFor(today: string, lessons: readonly Lesson[]): Card[] {
  const main = lessons.find((item) => item.title === 'Resposta inflamatória aguda');
  const imu = lessons.filter((item) => item.subjectId === 'imu').slice(0, 5);
  const firsts = ['gen', 'pro', 'far'].flatMap(
    (id) => lessons.find((item) => item.subjectId === id) ?? [],
  );
  const extra = [...imu, ...firsts];
  const featured = IMU_CARDS.map(([question, answer], index) => ({
    id: `c-${index}`,
    lessonId: main?.id ?? '',
    question,
    answer,
    due: today,
  }));
  const others = extra.flatMap((lesson, index) =>
    Array.from({ length: 4 + index }, (_, number) => ({
      id: `${lesson.id}-c${number}`,
      lessonId: lesson.id,
      question: `Pergunta ${number + 1} de ${lesson.title}`,
      answer: `Resposta ${number + 1}`,
      due: addDays(today, number),
    })),
  );
  return [...featured, ...others];
}

// Dados fictícios, com os casos extremos à vista: matéria vazia, nome longo, pasta vazia,
// matéria com muitas aulas e ano arquivado.
export function createFixtures(today: string): StudyData {
  const subjects: Subject[] = SUBJECTS.map(([id, name, code, color], index) => ({
    id,
    yearId: YEAR,
    name,
    code,
    color,
    lastAccess: id === 'bio' ? null : addDays(today, -index),
    classesFrom: id === 'far' ? addDays(today, -28) : null,
  }));
  const lessons = [
    ...lessonsFor('imu', IMU_LESSONS, today),
    ...Object.entries(OTHER_LESSONS).flatMap(([id, rows]) => lessonsFor(id, rows, today)),
  ];
  return {
    years: [
      { id: 'ano-1', name: '1º ano', archived: true },
      { id: YEAR, name: '2º ano', archived: false },
      { id: 'ano-3', name: '3º ano', archived: false },
    ],
    subjects: [
      ...subjects,
      {
        id: 'ana',
        yearId: 'ano-1',
        name: 'Anatomia',
        code: 'ANA',
        color: 2,
        lastAccess: null,
        classesFrom: null,
      },
    ],
    folders: subjects.flatMap((subject) => foldersFor(subject.id)),
    lessons,
    cards: cardsFor(today, lessons),
    exams: [
      ['gen', 7, '08:00'],
      ['imu', 11, '10:00'],
      ['pro', 11, '14:00'],
      ['pro', 14, '13:00'],
      ['aps', 20, '08:00'],
    ]
      .map(([subjectId, days, time], index) => ({
        id: `p-${index}`,
        subjectId: String(subjectId),
        date: addDays(today, Number(days)),
        time: String(time),
      }))
      .concat(
        { id: 'p-sem-data', subjectId: 'gen', date: '', time: '' },
        { id: 'p-sem-hora', subjectId: 'far', date: addDays(today, 25), time: '' },
      ),
    events: eventsFor(today, lessons),
    slots: slotsFor(today),
    reminders: [
      'Levar o jaleco para a Propedêutica.',
      'Revisar IL-6 e TNF-α antes da prova de Imunologia.',
      'Confirmar a sala do laboratório de Genética.',
    ].map((text, index) => ({ id: `l-${index}`, text, date: today, done: false })),
    files: [],
    attendance: [],
    vault: [],
    secrets: [],
    noteVersions: [],
  };
}
