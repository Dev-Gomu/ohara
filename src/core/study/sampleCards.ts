import { addDays } from './dates';
import { expandCloze } from './cloze';
import type { Card, CardImage, Lesson } from './types';

// Cartões do exemplo: [frente, verso, dias até vencer]. Negativo = atrasado; 0 = hoje.
// O verso usa as marcas do editor: "# ", "## ", "+ ", "-- ", "? ", listas e **negrito**.
type Row = readonly [string, string, number];

export const IMG_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAACWCAIAAABvmpKCAAADNElEQVR42u3dwU3DQBAFUMqmEsqhCIpA3Dhx4UQHwXYcZ+f/J/17vDtPI2sV77x8ff+KxOTFFgjQIkCLAC0CtAAtArQI0CJAiwAtQIsALd+/r2+f98c2Aj0eMdxAxyKGG+hkx2QDHUsZa6DTHJMN9KWU3z9+7gnWQD9Z852CT/StcEAfp/xQx/fIVkSgd1C+2PFh2UDTvDrlvayBRnkAZayBPq55Wcq7WANN8wzK21kDjfLIYF0HOlgz03Wg4zUzXQS6gfJG1kDTzDTQNDMNNM1MA00z0wWgUd7IGmiggQaaZqaBppnpdtA0M50PGuItpoGmmWmgvWx48QBae9aku0DTzHQ4aFgPmwZae9akgaaZaaCBBjoZNM1MAy1AO9xw3AG09qxJA609a9KVoLVnTToc9MTrbkc8NtDVoJ81cAjowaBHz4uYOPUC6Lr2fOLoQU0a6M8YzWsuB+gW0A+dEgt0BegSzUwDDTTQQC+seanVAZ0M+jLN6ywQ6NgT6Is1r7NGoLVnTRrotUE/RfMiKwUaaKCBBhpooOM1r7BYoIEGGmiggQYaaKCBBhpooIEGGmiggQYaaKCBBhpooIEGGmiggQYaaKCBBtq/7YAGGmiggQYaaN8U+qYQaF99++rbvRzu5XAvB9BuTgLa3XbutgMaaKCBdj80zUC7wR9ooM1YAbrrNNoULKDDm7Q5hUAHgjZJFuictw6zvoFObtIBoCfCyAHNtPY8GLQmrT3ng2a6vD0DLUAzTTPQQAMNNNM094F23OFwIx80053tOQQ00zRXgGZ673+ngNaktWegmaYZaC8eXjbqQDNdrjkQNNPNmjNBM12rGWiggR5uuo31jX2IrHssaKYLNYeDLjddqDkfdK3pTs0VoAtN12puAX3bdBLr28tsKHQL6AbTNHeBzjZNcyPoSNYot4P+1/QU1v+uorCypaC3mF6Z9ZaH7yxrL+ihrFEG+gTTg6ZelFcT6H2sV54urohAH2f9aNm7nkThgD7H9Im+D/+ukgH9QNZXRpmATpCtKECHsFYIoBNk23agx+O2vUCPx20bgRYBWoAWAVoEaBGgRYAWoEWAFgFaBGipzx+nx8vogXmABgAAAABJRU5ErkJggg==';

export const SAMPLE_IMAGES: CardImage[] = [
  {
    id: 'img-1',
    lessonId: 'imu-a7',
    side: 'verso',
    mime: 'image/png',
    width: 240,
    height: 150,
    data: IMG_SRC,
  },
  {
    id: 'img-2',
    lessonId: 'imu-a1',
    side: 'frente',
    mime: 'image/png',
    width: 240,
    height: 150,
    data: IMG_SRC,
  },
];

const IMU_INFLAMACAO: Row[] = [
  ['Qual receptor reconhece o LPS?', 'TLR4', 0],
  ['Citocina que induz PCR no fígado', '**IL-6**\n+ também aumenta o fibrinogênio', 0],
  ['Quimiotático clássico de neutrófilos', 'IL-8 (CXCL8)', -2],
  ['Molécula do rolamento', 'Selectinas', 0],
  ['Via que libera IL-1β, IL-6 e TNF-α', 'NF-κB', 3],
  ['Mediador da febre no hipotálamo', 'PGE~2~', 0],
  [
    'Sinais cardinais da inflamação',
    '# Os cinco\n1. Rubor\n2. Calor\n3. Tumor\n4. Dor\n5. Perda de função',
    1,
  ],
  [
    'Fases da resposta aguda',
    '## Em ordem\n- vasodilatação\n- extravasamento de plasma\n- migração de leucócitos\n? onde entram as selectinas?',
    0,
  ],
  [
    'Predomínio celular nas primeiras horas',
    '{img:img-1}\nEntre 6 e 24 h: **neutrófilos**; entre 24 e 48 h: monócitos.',
    0,
  ],
  ['{{c1::Neutrófilos}} predominam entre 6 e 24 h; {{c2::monócitos}}, entre 24 e 48 h.', '', 0],
  ['TNF-α e IL-1β causam {{c1::febre}} por meio da {{c1::PGE₂}}.', '', 2],
];

const IMU_OUTRAS: Record<string, Row[]> = {
  'imu-a1': [
    ['Célula apresentadora de antígeno profissional', '{img:img-2}\nCélula dendrítica', 0],
    ['Linfócito que produz anticorpos', 'Plasmócito (linfócito B diferenciado)', -1],
    ['Célula que mata sem sensibilização prévia', 'NK (natural killer)', 4],
  ],
  'imu-a2': [
    ['Primeira barreira da imunidade inata', 'Pele e mucosas', 0],
    ['Receptores que reconhecem padrões microbianos', '**PRRs** (por exemplo, os TLRs)', 0],
    ['Fagocitose facilitada por anticorpo ou complemento', 'Opsonização', 5],
  ],
  'imu-a3': [
    ['Classe de anticorpo da resposta primária', 'IgM', 0],
    ['Classe que atravessa a placenta', 'IgG', -3],
    ['Classe das mucosas e do leite', 'IgA secretora', 2],
    ['{{c1::IgE}} se liga a mastócitos nas alergias imediatas.', '', 0],
  ],
  'imu-a4': [
    [
      'Vias de ativação do complemento',
      '# Três vias\n- clássica\n- alternativa\n- das lectinas',
      0,
    ],
    ['Componente central das três vias', 'C3', 0],
    ['Complexo de ataque à membrana', 'C5b-9 (MAC)', 3],
    ['Fragmento anafilatoxina mais potente', 'C5a', -1],
  ],
  'imu-a5': [
    ['Citocina pró-inflamatória que age em linfócitos T', 'IL-2', 0],
    ['Citocina anti-inflamatória clássica', 'IL-10 e TGF-β', 0],
    ['Interferon-γ é produzido principalmente por', 'Th1 e células NK', 6],
  ],
  'imu-a6': [
    ['Tolerância central ocorre em', 'Timo (T) e medula óssea (B)', 0],
    ['Gene que expressa antígenos próprios no timo', '**AIRE**', 0],
  ],
};

const OUTRAS: Record<string, Row[]> = {
  'gen-a1': [
    ['Dogma central da biologia molecular', 'DNA → RNA → proteína', 0],
    ['Enzima que sintetiza RNA a partir do DNA', 'RNA polimerase', 0],
    ['Parte do gene removida no processamento', 'Íntrons', -2],
    ['O {{c1::promotor}} é a região onde a RNA polimerase se liga.', '', 0],
  ],
  'gen-a2': [
    ['Proporção fenotípica do cruzamento Aa × Aa', '3 : 1', 0],
    ['Heterozigoto para alelo recessivo', 'Portador', 4],
  ],
  'gen-a3': [['Reparo que corrige bases mal pareadas', 'Mismatch repair', 0]],
  'pro-a1': [
    [
      'Ordem do exame do abdome',
      '# Sequência\n1. Inspeção\n2. Ausculta\n3. Percussão\n4. Palpação',
      0,
    ],
    ['Sinal de Murphy sugere', 'Colecistite aguda', 0],
    ['Dor no ponto de McBurney', 'Apendicite', -1],
  ],
  'pro-a2': [
    [
      'Elementos da anamnese',
      'Identificação, queixa principal, HDA, antecedentes, hábitos, revisão de sistemas',
      2,
    ],
  ],
  'far-a1': [
    ['Biodisponibilidade', 'Fração da dose que chega à circulação sistêmica', 0],
    ['Efeito de primeira passagem ocorre no', 'Fígado', 0],
    ['Meia-vida depende de', 'Volume de distribuição e depuração', -4],
    ['Vias de excreção mais comuns', '- renal\n- biliar\n- pulmonar', 7],
  ],
  'far-a2': [
    ['Receptor β1 predomina no', 'Coração', 0],
    ['Receptor β2 causa', 'Broncodilatação e vasodilatação muscular', 0],
  ],
  'pat-a1': [
    ['Marca da necrose coagulativa', 'Preservação da arquitetura tecidual', 0],
    ['Apoptose: inflamação associada?', 'Não', 3],
  ],
  'ana-a1': [
    ['Ossos do carpo (fileira proximal)', 'Escafoide, semilunar, piramidal, pisiforme', -10],
    ['Nervo que passa pelo túnel do carpo', 'Mediano', -6],
  ],
  'ana-a2': [
    [
      'Músculos do manguito rotador',
      'Supraespinhal, infraespinhal, redondo menor e subescapular',
      -3,
    ],
  ],
  'bqm-a1': [
    ['Produto líquido da glicólise (por glicose)', '2 ATP + 2 NADH + 2 piruvato', 0],
    ['Enzima limitante da glicólise', 'Fosfofrutoquinase-1', 0],
  ],
  'fis-a1': [['Potencial de repouso do neurônio', 'Cerca de −70 mV', 0]],
  'fis-a2': [['Íon que dispara a liberação de neurotransmissor', 'Ca²⁺', 0]],
  'fis-a3': [['Bomba que mantém o gradiente de Na⁺ e K⁺', 'Na⁺/K⁺-ATPase', -1]],
};

function expand(front: string, back: string): [string, string][] {
  const clozes = expandCloze(front);
  return clozes.length > 0 ? clozes.map((text) => [text, back]) : [[front, back]];
}

export function sampleCards(today: string, lessons: readonly Lesson[]): Card[] {
  const sets: [string, Row[]][] = [
    ['imu-a7', IMU_INFLAMACAO],
    ...Object.entries(IMU_OUTRAS),
    ...Object.entries(OUTRAS),
  ];
  return sets.flatMap(([lessonId, rows]) => {
    if (!lessons.some((lesson) => lesson.id === lessonId)) return [];
    return rows.flatMap(([front, back, due], at) =>
      expand(front, back).map(([question, answer], part) => ({
        id: `${lessonId}-c${at}${part === 0 ? '' : `-${part}`}`,
        lessonId,
        question,
        answer,
        due: addDays(today, due),
      })),
    );
  });
}
