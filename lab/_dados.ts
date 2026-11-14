// Dados de mentira para os experimentos do lab livre: ninguém inventa dados de novo.
export const MATERIAS = [
  { sigla: 'GEN', cor: 0, nome: 'Genética' },
  { sigla: 'PRO', cor: 1, nome: 'Processos patológicos' },
  { sigla: 'IMU', cor: 2, nome: 'Imunologia' },
  { sigla: 'APS', cor: 3, nome: 'Atenção primária' },
  { sigla: 'FAR', cor: 4, nome: 'Farmacologia' },
  { sigla: 'HIS', cor: 5, nome: 'Histologia' },
] as const;

export const AULAS = [
  { id: 'a1', materia: 'IMU', titulo: 'Resposta imune inata', data: '2026-11-09' },
  { id: 'a2', materia: 'IMU', titulo: 'Complemento', data: '2026-11-11' },
  { id: 'a3', materia: 'PRO', titulo: 'Inflamação aguda', data: '2026-11-10' },
  { id: 'a4', materia: 'GEN', titulo: 'Heranças mendelianas', data: '2026-11-12' },
  { id: 'a5', materia: 'FAR', titulo: 'Farmacocinética', data: '2026-11-13' },
  { id: 'a6', materia: 'APS', titulo: 'Territorialização', data: '2026-11-16' },
] as const;

export const PROVAS = [
  { id: 'p1', materia: 'IMU', titulo: 'P1 de Imunologia', data: '2026-11-20' },
  { id: 'p2', materia: 'PRO', titulo: 'P2 de Processos', data: '2026-11-24' },
  { id: 'p3', materia: 'GEN', titulo: 'Prova de Genética', data: '2026-12-01' },
] as const;

export const NOTAS = [
  { materia: 'IMU', prova: 'P1', valor: 7.5 },
  { materia: 'PRO', prova: 'P1', valor: 8.25 },
  { materia: 'GEN', prova: 'P1', valor: 6.0 },
  { materia: 'FAR', prova: 'P1', valor: 9.0 },
] as const;

// Acervo (bancada R1): caso extremo com 12 matérias, nome longo e lista comprida.
export const ANOS = [
  { id: 'y1', nome: '1º ano', detalhe: 'arquivado · só consulta' },
  { id: 'y2', nome: '2º ano', detalhe: '12 matérias' },
  { id: 'y3', nome: '3º ano', detalhe: '0 matérias' },
] as const;

export const ACERVO_MATERIAS = [
  { sigla: 'GEN', cor: 0, nome: 'Genética', aulas: 3, cartoes: 21, prova: 7, acesso: 'hoje' },
  { sigla: 'IMU', cor: 2, nome: 'Imunologia', aulas: 14, cartoes: 96, prova: 11, acesso: 'ontem' },
  { sigla: 'PRO', cor: 1, nome: 'Propedêutica', aulas: 2, cartoes: 8, prova: 11, acesso: 'há 3 d' },
  { sigla: 'APS', cor: 3, nome: 'Atenção primária', aulas: 1, cartoes: 0, prova: 20, acesso: 'há 5 d' },
  { sigla: 'FAR', cor: 4, nome: 'Farmacologia', aulas: 2, cartoes: 14, prova: 25, acesso: 'há 2 d' },
  { sigla: 'FIS', cor: 5, nome: 'Fisiologia', aulas: 42, cartoes: 310, prova: null, acesso: 'hoje' },
  { sigla: 'PAT', cor: 6, nome: 'Patologia geral e bases moleculares da doença', aulas: 1, cartoes: 5, prova: null, acesso: 'há 9 d' },
  { sigla: 'HIS', cor: 7, nome: 'Histologia', aulas: 6, cartoes: 40, prova: 32, acesso: 'há 4 d' },
  { sigla: 'ANA', cor: 0, nome: 'Anatomia', aulas: 18, cartoes: 122, prova: 14, acesso: 'ontem' },
  { sigla: 'BQM', cor: 1, nome: 'Bioquímica', aulas: 9, cartoes: 57, prova: null, acesso: 'há 6 d' },
  { sigla: 'EPI', cor: 3, nome: 'Epidemiologia', aulas: 4, cartoes: 12, prova: 40, acesso: 'há 12 d' },
  { sigla: 'BIO', cor: 5, nome: 'Bioética', aulas: 0, cartoes: 0, prova: null, acesso: null },
] as const;

export const PASTAS = [
  { id: 'todas', nome: 'Todas', aulas: 14 },
  { id: 'b1', nome: '1º bimestre', aulas: 4 },
  { id: 'b2', nome: '2º bimestre', aulas: 9 },
  { id: 'b3', nome: '3º bimestre', aulas: 0 },
  { id: 'sem', nome: 'Sem bimestre', aulas: 1 },
] as const;

// Aulas de IMU na pasta "2º bimestre", da mais nova para a mais antiga.
export const ACERVO_AULAS = [
  { id: 'i1', titulo: 'Complemento', data: '11 nov', cartoes: 9 },
  { id: 'i2', titulo: 'Resposta imune inata', data: '09 nov', cartoes: 12 },
  { id: 'i3', titulo: 'Hipersensibilidades tipo I a IV e doenças autoimunes associadas', data: '04 nov', cartoes: 18 },
  { id: 'i4', titulo: 'Apresentação de antígenos e MHC', data: '02 nov', cartoes: 7 },
  { id: 'i5', titulo: 'Linfócitos T: ativação', data: '28 out', cartoes: 11 },
  { id: 'i6', titulo: 'Linfócitos B e anticorpos', data: '26 out', cartoes: 14 },
  { id: 'i7', titulo: 'Citocinas', data: '21 out', cartoes: 0 },
  { id: 'i8', titulo: 'Tolerância imunológica', data: '19 out', cartoes: 6 },
  { id: 'i9', titulo: 'Imunidade de mucosas', data: '14 out', cartoes: 4 },
] as const;

// Lixeira (bancada noite 14/11): só o que foi excluído direto (a raiz); `traz` é o que volta junto.
// `quando` = dias desde a exclusão (prazo de limpeza: 30 d).
export const LIXEIRA = [
  { id: 'x1', tipo: 'aula', titulo: 'Complemento', materia: 'IMU', cor: 2, quando: 0, traz: '9 cartões · anotações · slides' },
  { id: 'x2', tipo: 'cartao', titulo: 'Qual via do complemento depende de anticorpo?', materia: 'IMU', cor: 2, quando: 0, traz: '' },
  { id: 'x3', tipo: 'cartao', titulo: 'Onde fica o rim esquerdo?', materia: 'ANA', cor: 0, quando: 2, traz: '1 imagem' },
  { id: 'x4', tipo: 'prova', titulo: 'P2 de Processos', materia: 'PRO', cor: 1, quando: 3, traz: '' },
  { id: 'x5', tipo: 'pasta', titulo: '3º bimestre', materia: 'GEN', cor: 0, quando: 6, traz: '2 aulas · 14 cartões' },
  { id: 'x6', tipo: 'anexo', titulo: 'Abbas cap. 4 (livro).pdf', materia: 'IMU', cor: 2, quando: 9, traz: '' },
  { id: 'x7', tipo: 'lembrete', titulo: 'Levar jaleco na sexta', materia: '', cor: -1, quando: 12, traz: '' },
  { id: 'x8', tipo: 'materia', titulo: 'Bioética', materia: 'BIO', cor: 5, quando: 25, traz: '3 aulas · 2 horários · faltas' },
  { id: 'x9', tipo: 'aula', titulo: 'Hipersensibilidades tipo I a IV e doenças autoimunes associadas', materia: 'IMU', cor: 2, quando: 27, traz: '18 cartões · anotações' },
] as const;

// Notas extras (bancada notas-extras, noite 14/11): 12 matérias para a busca valer a pena,
// esquema em pontos por bimestre (D113) e avaliações com nota máxima. null = pendente.
type Av = { nome: string; nota: number | null; max: number };
export const NOTAS_BOLETIM: readonly {
  sigla: string;
  cor: number;
  nome: string;
  vale: readonly [number, number, number, number];
  bim: readonly [readonly Av[], readonly Av[], readonly Av[], readonly Av[]];
}[] = [
  { sigla: 'IMU', cor: 2, nome: 'Imunologia', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 6, max: 10 }], [{ nome: 'Seminário', nota: 0.9, max: 1 }, { nome: 'P2', nota: null, max: 4 }], [], []] },
  { sigla: 'PRO', cor: 1, nome: 'Propedêutica', vale: [3, 7, 3, 7], bim: [[{ nome: 'OSCE 1', nota: 2.7, max: 3 }], [{ nome: 'P2', nota: null, max: 7 }], [], []] },
  { sigla: 'GEN', cor: 0, nome: 'Genética', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 2, max: 5 }], [{ nome: 'P2', nota: null, max: 5 }], [], []] },
  { sigla: 'EPI', cor: 3, nome: 'Epidemiologia', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 1, max: 5 }], [{ nome: 'P2', nota: null, max: 5 }], [], []] },
  { sigla: 'FAR', cor: 4, nome: 'Farmacologia', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 4.5, max: 5 }], [{ nome: 'P2', nota: 4.6, max: 5 }], [{ nome: 'P3', nota: 4.5, max: 5 }], [{ nome: 'P4', nota: null, max: 5 }]] },
  { sigla: 'FIS', cor: 5, nome: 'Fisiologia', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 3.8, max: 5 }], [{ nome: 'P2', nota: 3.1, max: 5 }], [{ nome: 'P3', nota: 2.9, max: 5 }], [{ nome: 'P4', nota: null, max: 5 }]] },
  { sigla: 'PAT', cor: 6, nome: 'Patologia geral', vale: [4, 6, 4, 6], bim: [[{ nome: 'P1', nota: 3.2, max: 4 }], [{ nome: 'P2', nota: null, max: 6 }], [], []] },
  { sigla: 'HIS', cor: 7, nome: 'Histologia', vale: [5, 5, 5, 5], bim: [[{ nome: 'Prática', nota: null, max: 2 }, { nome: 'P1', nota: null, max: 3 }], [], [], []] },
  { sigla: 'ANA', cor: 0, nome: 'Anatomia', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 3.5, max: 5 }], [{ nome: 'P2', nota: 3.6, max: 5 }], [], []] },
  { sigla: 'BQM', cor: 1, nome: 'Bioquímica', vale: [5, 5, 5, 5], bim: [[{ nome: 'P1', nota: 3.9, max: 5 }], [{ nome: 'P2', nota: null, max: 5 }], [], []] },
  { sigla: 'APS', cor: 3, nome: 'Atenção primária', vale: [5, 5, 5, 5], bim: [[{ nome: 'Portfólio', nota: 4.8, max: 5 }], [{ nome: 'Portfólio 2', nota: null, max: 5 }], [], []] },
  { sigla: 'BIO', cor: 5, nome: 'Bioética', vale: [5, 5, 5, 5], bim: [[], [], [], []] },
];

// Bancada agenda-acoes: um mês do Hub com aulas, provas, entrega e apresentação.
export const AGENDA_ACOES = {
  hoje: '2026-11-13',
  aulasDoDia: [
    { id: 'x1', sigla: 'IMU', cor: 2, titulo: 'Complemento', inicio: '08:00', fim: '10:00', conteudo: true },
    { id: 'x2', sigla: 'FAR', cor: 4, titulo: 'Farmacocinética', inicio: '10:20', fim: '12:00', conteudo: false },
    { id: 'x3', sigla: 'APS', cor: 3, titulo: 'Tutoria', inicio: '14:00', fim: '16:00', conteudo: false },
  ],
  avaliacoes: [
    { dia: '2026-11-17', itens: [{ sigla: 'IMU', cor: 2, tipo: 'prova' }] },
    { dia: '2026-11-19', itens: [{ sigla: 'APS', cor: 3, tipo: 'apresentacao' }] },
    { dia: '2026-11-24', itens: [{ sigla: 'PRO', cor: 1, tipo: 'prova' }, { sigla: 'GEN', cor: 0, tipo: 'trabalho' }] },
    { dia: '2026-11-27', itens: [{ sigla: 'FAR', cor: 4, tipo: 'apresentacao' }, { sigla: 'HIS', cor: 5, tipo: 'prova' }] },
  ],
} as const;
