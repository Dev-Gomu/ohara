import { addDays } from './dates';
import type { NoteVersion } from './types';

// Anotações do exemplo (HTML do editor). Só algumas aulas têm texto; as outras abrem vazias.
const INFLAMACAO = [
  '<h1>Resposta inflamatória aguda</h1>',
  '<p>O macrófago reconhece o LPS pelo <mark>TLR4</mark>. A via segue por NF-κB e libera IL-1β, IL-6 e TNF-α.</p>',
  '<h2>Mediadores</h2>',
  '<ul><li><p>IL-1β e TNF-α: febre, via PGE<sub>2</sub> no hipotálamo.</p></li><li><p>IL-6: age no fígado, ↑ PCR e fibrinogênio.</p></li></ul>',
  '<h2>Sequência celular</h2>',
  '<ol><li><p>Vasodilatação e aumento da permeabilidade.</p></li><li><p>Rolamento, adesão e transmigração.</p></li><li><p>Fagocitose e resolução.</p></li></ol>',
  '<table><tbody><tr><th><p>Janela</p></th><th><p>Célula predominante</p></th></tr><tr><td><p>6 a 24 h</p></td><td><p>Neutrófilos</p></td></tr><tr><td><p>24 a 48 h</p></td><td><p>Monócitos</p></td></tr></tbody></table>',
  '<p>Cai na prova: <mark>sinais cardinais</mark> e os mediadores da febre. Concentração de O<sub>2</sub> local cai no foco.</p>',
].join('');

const COMPLEMENTO = [
  '<h1>Sistema complemento</h1>',
  '<p>Três vias convergem em <strong>C3</strong>: clássica, alternativa e das lectinas.</p>',
  '<ul><li><p>C3b opsoniza.</p></li><li><p>C5a recruta neutrófilos.</p></li><li><p>C5b-9 forma o complexo de ataque.</p></li></ul>',
].join('');

const EXPRESSAO = [
  '<h1>Expressão gênica</h1>',
  '<p>Do DNA ao RNA mensageiro pela <em>RNA polimerase</em>; depois, tradução no ribossomo.</p>',
  '<p>Regulação: promotores, <u>enhancers</u> e fatores de transcrição.</p>',
].join('');

const FARMACOCINETICA = [
  '<h1>Farmacocinética</h1>',
  '<table><tbody><tr><th><p>Etapa</p></th><th><p>O que acontece</p></th></tr><tr><td><p>Absorção</p></td><td><p>Passagem para o sangue</p></td></tr><tr><td><p>Distribuição</p></td><td><p>Volume de distribuição</p></td></tr><tr><td><p>Metabolismo</p></td><td><p>Principalmente hepático</p></td></tr><tr><td><p>Excreção</p></td><td><p>Renal e biliar</p></td></tr></tbody></table>',
].join('');

export function sampleNotes(): Record<string, string> {
  return {
    'imu-a7': INFLAMACAO,
    'imu-a4': COMPLEMENTO,
    'gen-a1': EXPRESSAO,
    'far-a1': FARMACOCINETICA,
  };
}

const HOUR = 3_600_000;

// Duas versões antigas da aula principal, para o Histórico.
export function sampleVersions(today: string): NoteVersion[] {
  const base = new Date(`${addDays(today, -1)}T20:00:00`).getTime();
  return [
    {
      id: 'v-1',
      lessonId: 'imu-a7',
      at: base - 26 * HOUR,
      html: '<h1>Resposta inflamatória aguda</h1><p>Rascunho: reconhecimento do LPS.</p>',
    },
    {
      id: 'v-2',
      lessonId: 'imu-a7',
      at: base,
      html: '<h1>Resposta inflamatória aguda</h1><p>O macrófago reconhece o LPS pelo TLR4.</p><h2>Mediadores</h2><ul><li><p>IL-6: age no fígado.</p></li></ul>',
    },
  ];
}
