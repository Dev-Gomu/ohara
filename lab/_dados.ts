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
