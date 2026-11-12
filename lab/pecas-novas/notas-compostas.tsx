// Notas, degrau 3 (peças compostas): linha do boletim de 0 a 10, cartão de bimestre, linha de
// avaliação, resumo da disciplina e "quanto preciso". Três versões de cada, com o cursor testado.
// ?peca=notascomp, &so=linha|cartao|aval|resumo|precisa mostra uma peça só.
import type { ReactNode } from 'react';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Secao } from '../vitrine/moldura';
import { Cel, META, Sinal, Trio, fmt } from './notas-comp-base';
import type { Nota, Versao } from './notas-comp-base';
import { Avaliacoes, Cartoes } from './notas-compostas-disc';
import { Precisas, Resumos } from './notas-compostas-resumo';
import './notas-pecas.css';
import './notas-compostas.css';

export interface Row {
  code: string;
  cor: number;
  b: [Nota, Nota, Nota, Nota];
  s: [Nota, Nota];
  aberto: [boolean, boolean];
  // Nota de 0 a 10 que precisa no 4º bim.; 'ok' já alcançou; 'nao' nem com a máxima.
  precisa: number | 'ok' | 'nao' | null;
}

export const ROWS: Row[] = [
  { code: 'GEN', cor: 0, b: [8.2, 7.6, 7.8, null], s: [7.9, 7.8], aberto: [false, true], precisa: 4.4 },
  { code: 'PRO', cor: 1, b: [8.0, 7.0, 6.0, null], s: [7.3, 6.0], aberto: [false, true], precisa: 7.0 },
  { code: 'IMU', cor: 2, b: [8.0, 6.5, 9.0, null], s: [7.1, 9.0], aberto: [false, true], precisa: 6.0 },
  { code: 'ANA', cor: 3, b: [9.4, 9.8, 9.2, null], s: [9.6, 9.2], aberto: [false, true], precisa: 'ok' },
  { code: 'FIS', cor: 4, b: [3.0, 4.0, 2.0, null], s: [3.5, 2.0], aberto: [false, true], precisa: 'nao' },
  { code: 'HIS', cor: 5, b: [null, null, null, null], s: [null, null], aberto: [true, true], precisa: null },
];

export function media(r: Row): Nota {
  const vs = r.s.filter((x) => x !== null);
  return vs.length === 0 ? null : vs.reduce((t, x) => t + x, 0) / vs.length;
}

const Rot = ({ children, forte }: { children: string; forte?: boolean }) => (
  <span className="nc-rot" data-forte={forte ? '' : undefined}>
    {children}
  </span>
);

export function Cabecalho({ v }: { v: Versao }) {
  return (
    <div className="nc-linha nc-cab" data-v={v}>
      <span />
      {[1, 2].map((n) => (
        <div key={n} className="nc-faixa">
          <Rot>{`${n * 2 - 1}º bim.`}</Rot>
          <Rot>{`${n * 2}º bim.`}</Rot>
          <Rot forte>{`${n}º sem.`}</Rot>
        </div>
      ))}
      <Rot forte>Média</Rot>
      <Rot>Precisa no 4º bim.</Rot>
      {v !== 'c' && <Rot>Situação</Rot>}
    </div>
  );
}

function Precisa({ p }: { p: Row['precisa'] }) {
  if (p === null) return <span className="nc-de">—</span>;
  if (p === 'ok') return <Sinal tipo="ok">Aprovado</Sinal>;
  if (p === 'nao') return <Sinal tipo="atencao">Não alcança</Sinal>;
  return <b className="nc-num">{fmt(p)}</b>;
}

function Situacao({ r }: { r: Row }) {
  const m = media(r);
  if (m === null) return <span className="nc-de">Sem notas</span>;
  return r.precisa === 'nao' || m < META ? (
    <StatePill state="atencao">Atenção</StatePill>
  ) : (
    <StatePill state="ok">Na meta</StatePill>
  );
}

export function LinhaBoletim({ r, v, cursor }: { r: Row; v: Versao; cursor: boolean }) {
  const cel = v === 'b' ? 'b' : 'c';
  return (
    <div className="nc-linha" data-v={v} data-cursor={cursor ? '' : undefined}>
      <SubjectPill code={r.code} color={r.cor} />
      {([0, 1] as const).map((i) => (
        <div key={i} className="nc-faixa">
          <Cel v={cel} valor={r.b[i * 2] ?? null} />
          <Cel v={cel} valor={r.b[i * 2 + 1] ?? null} />
          <Cel v={cel} valor={r.aberto[i] ? null : r.s[i]} tipo="total" />
        </div>
      ))}
      <Cel v={cel} valor={media(r)} tipo={r.aberto.some(Boolean) ? 'aberto' : 'total'} />
      <Precisa p={r.precisa} />
      {v !== 'c' && <Situacao r={r} />}
    </div>
  );
}

const USO_LINHA: Record<Versao, string> = {
  a: 'Faixas. O semestre é uma faixa contínua que atravessa as linhas; a Situação tem coluna própria.',
  b: 'Cartões. Cada disciplina é um cartão de uma peça; sem faixa, o total do semestre vai em letra de voz.',
  c: 'Sem Situação. Igual à A, sem a última coluna: a marca na nota e o "Aprovado" ou "Não alcança" já dizem a situação.',
};

function Linhas() {
  return (
    <Trio nome="Linha do boletim" largura={12} uso={USO_LINHA}>
      {(v) => (
        <>
          <div className="nc-boletim" data-v={v}>
            <Cabecalho v={v} />
            {ROWS.map((r) => (
              <LinhaBoletim key={r.code} r={r} v={v} cursor={r.code === 'IMU'} />
            ))}
          </div>
          <p className="v-legenda">
            De cima para baixo: na meta, bimestre abaixo da meta, com cursor, já aprovado, não
            alcança, sem notas.
          </p>
        </>
      )}
    </Trio>
  );
}

const PECAS: [string, string, () => ReactNode][] = [
  ['linha', '1. Linha do boletim (tudo de 0 a 10)', Linhas],
  ['cartao', '2. Cartão de bimestre', Cartoes],
  ['aval', '3. Linha de avaliação', Avaliacoes],
  ['resumo', '4. Resumo da disciplina', Resumos],
  ['precisa', '5. Quanto preciso tirar', Precisas],
];

export function NotasCompostas() {
  const so = new URLSearchParams(location.search).get('so');
  return (
    <main className="vitrine">
      {PECAS.filter(([id]) => !so || id === so).map(([id, titulo, Peca]) => (
        <div key={id} className="np-secao">
          <Secao>{titulo}</Secao>
          <Peca />
        </div>
      ))}
    </main>
  );
}
