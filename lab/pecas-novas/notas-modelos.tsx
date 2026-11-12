// Notas: como mostrar disciplinas com pesos e escalas diferentes (pontos direto, 5 + 5, nota de 0 a 10
// convertida). Três propostas para o Boletim geral e três para a tela da disciplina.
// ?peca=notasmodelos, &so=geral|disciplina, &mat=IMU|PRO|GEN (disciplina mostrada).
import type { ReactNode } from 'react';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Ficha, Secao } from '../vitrine/moldura';
import { Disciplinas } from './notas-modelos-disc';
import './notas-pecas.css';
import './notas-modelos.css';

export type Nota = number | null;
export interface Avaliacao {
  nome: string;
  nota: Nota;
  max: number;
}
export interface Bimestre {
  vale: number;
  avals: Avaliacao[];
}
export interface Disciplina {
  code: string;
  cor: number;
  modelo: string;
  bims: [Bimestre, Bimestre, Bimestre, Bimestre];
}

const a = (nome: string, nota: Nota, max: number): Avaliacao => ({ nome, nota, max });

export const DISCIPLINAS: Disciplina[] = [
  {
    code: 'PRO',
    cor: 1,
    modelo: 'Pesos 3 e 7; a nota já vem em pontos',
    bims: [
      { vale: 3, avals: [a('Prova', 1.6, 2), a('Relatório', 0.8, 1)] },
      {
        vale: 7,
        avals: [
          a('Prova 1', 1.5, 2),
          a('Prova 2', 1.4, 2),
          a('Prova 3', 1.2, 2),
          a('Trabalho', 0.8, 1),
        ],
      },
      { vale: 3, avals: [a('Prova', 1.2, 2), a('Relatório', 0.6, 1)] },
      {
        vale: 7,
        avals: [
          a('Prova 1', null, 2),
          a('Prova 2', null, 2),
          a('Prova 3', null, 2),
          a('Trabalho', null, 1),
        ],
      },
    ],
  },
  {
    code: 'GEN',
    cor: 0,
    modelo: 'Pesos iguais: 5 em cada bimestre',
    bims: [
      { vale: 5, avals: [a('Prova', 8.2, 10)] },
      { vale: 5, avals: [a('Prova', 7.6, 10)] },
      { vale: 5, avals: [a('Prova', 7.8, 10)] },
      { vale: 5, avals: [a('Prova', null, 10)] },
    ],
  },
  {
    code: 'IMU',
    cor: 2,
    modelo: 'Pesos 4, 6, 3 e 7; nota de 0 a 10, convertida',
    bims: [
      { vale: 4, avals: [a('Prova', 8.5, 10), a('Seminário', 7.5, 10)] },
      { vale: 6, avals: [a('Prova', 6.0, 10), a('Trabalho', 7.0, 10)] },
      { vale: 3, avals: [a('Prova', 9.0, 10)] },
      { vale: 7, avals: [a('Prova', null, 10), a('Trabalho', null, 10)] },
    ],
  },
];

export const META = 7;
export const fmt = (n: Nota) => (n === null ? '—' : n.toFixed(1));

// Aproveitamento do bimestre, de 0 a 1 (só o que já tem nota).
export function fracao(b: Bimestre): Nota {
  const feitas = b.avals.filter((x) => x.nota !== null);
  if (feitas.length === 0) return null;
  return feitas.reduce((s, x) => s + (x.nota ?? 0), 0) / feitas.reduce((s, x) => s + x.max, 0);
}
export const pontos = (b: Bimestre): Nota => {
  const fr = fracao(b);
  return fr === null ? null : fr * b.vale;
};
const mult = (n: Nota, k: number): Nota => (n === null ? null : n * k);

// Semestre: soma dos bimestres; `aberto` quando falta nota.
export function semestre(d: Disciplina, s: 0 | 1): { valor: Nota; aberto: boolean } {
  const [x, y] = [d.bims[s * 2]!, d.bims[s * 2 + 1]!];
  const [px, py] = [pontos(x), pontos(y)];
  if (px !== null && py !== null) return { valor: px + py, aberto: false };
  const feito = px !== null ? x : py !== null ? y : null;
  return { valor: feito === null ? null : mult(fracao(feito), 10), aberto: true };
}
export function media(d: Disciplina): Nota {
  const vs = [semestre(d, 0).valor, semestre(d, 1).valor].filter((v) => v !== null);
  return vs.length === 0 ? null : vs.reduce((s, v) => s + v, 0) / vs.length;
}
// Pontos que faltam no 4º bimestre para a média do ano bater a meta.
export function falta(d: Disciplina): number {
  return META * 2 - (semestre(d, 0).valor ?? 0) - (pontos(d.bims[2]) ?? 0);
}

type Versao = 'a' | 'b' | 'c';

function Cel({ v, max, tipo }: { v: Nota; max?: number; tipo?: 'total' | 'aberto' }) {
  const baixa = v !== null && max !== undefined && v / max < META / 10;
  const estado = v === null ? 'pendente' : (tipo ?? (baixa ? 'baixa' : 'normal'));
  return (
    <span className="np-cel" data-v="c" data-estado={estado}>
      {estado === 'baixa' && <i className="np-marca" />}
      {fmt(v)}
    </span>
  );
}

function Faixa({ children, n }: { children: ReactNode; n: number }) {
  return (
    <div className="nx-faixa" style={{ gridTemplateColumns: `repeat(${n}, 76px)` }}>
      {children}
    </div>
  );
}

const Rot = ({ children, forte }: { children: string; forte?: boolean }) => (
  <span className="nx-rot" data-forte={forte ? '' : undefined}>
    {children}
  </span>
);

function Sem({ d, s, v }: { d: Disciplina; s: 0 | 1; v: Versao }) {
  const sem = semestre(d, s);
  const total = (
    <Cel v={sem.aberto && v !== 'c' ? null : sem.valor} tipo={sem.aberto ? 'aberto' : 'total'} />
  );
  if (v === 'c') return total;
  const [x, y] = [d.bims[s * 2]!, d.bims[s * 2 + 1]!];
  return (
    <Faixa n={3}>
      {v === 'a' ? <Cel v={pontos(x)} max={x.vale} /> : <Cel v={mult(fracao(x), 10)} max={10} />}
      {v === 'a' ? <Cel v={pontos(y)} max={y.vale} /> : <Cel v={mult(fracao(y), 10)} max={10} />}
      {total}
    </Faixa>
  );
}

function Cabecalho({ v }: { v: Versao }) {
  const sem = (n: number) =>
    v === 'c' ? (
      <Rot forte>{`${n}º sem.`}</Rot>
    ) : (
      <Faixa n={3}>
        <Rot>{`${n * 2 - 1}º bim.`}</Rot>
        <Rot>{`${n * 2}º bim.`}</Rot>
        <Rot forte>{`${n}º sem.`}</Rot>
      </Faixa>
    );
  return (
    <div className="nx-linha nx-cab" data-v={v}>
      <span />
      {sem(1)}
      {sem(2)}
      <Rot forte>Média</Rot>
      <Rot>{v === 'a' ? 'Falta no 4º bim.' : 'Precisa no 4º bim.'}</Rot>
      <Rot>Situação</Rot>
    </div>
  );
}

function Linha({ d, v, cursor }: { d: Disciplina; v: Versao; cursor: boolean }) {
  const m = media(d);
  const f = falta(d);
  const vale4 = d.bims[3].vale;
  return (
    <div className="nx-linha" data-v={v} data-cursor={cursor ? '' : undefined}>
      <SubjectPill code={d.code} color={d.cor} />
      <Sem d={d} s={0} v={v} />
      <Sem d={d} s={1} v={v} />
      <Cel v={m} tipo="aberto" />
      <span className="nx-falta">
        {v === 'a' ? (
          <>
            <b>{fmt(f)}</b> <small>de {fmt(vale4)}</small>
          </>
        ) : (
          <b>{fmt((f / vale4) * 10)}</b>
        )}
      </span>
      {m !== null && m >= META ? (
        <StatePill state="ok">Na meta</StatePill>
      ) : (
        <StatePill state="atencao">Atenção</StatePill>
      )}
    </div>
  );
}

const GERAL: Record<Versao, [string, string]> = {
  a: [
    'A. Em pontos',
    'Cada bimestre mostra os pontos ganhos, como o professor soma. Os bimestres somam o semestre, mas 2.4 pode ser nota boa (de 3.0) ou ruim (de 7.0): só a marca avisa.',
  ],
  b: [
    'B. Tudo de 0 a 10',
    'Todo número da tela está na mesma escala, seja qual for o peso. Abaixo de 7.0 é abaixo da meta, sempre. Os pesos ficam só dentro da disciplina.',
  ],
  c: [
    'C. Só semestres',
    'O boletim mostra só o que é igual em toda disciplina: semestre, média e quanto precisa. Os bimestres ficam dentro da disciplina.',
  ],
};

function Geral() {
  return (
    <>
      <Secao>Boletim geral: três formas de mostrar as notas</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={GERAL[v][0]} arquivo="Boletim geral" largura={12} uso={GERAL[v][1]}>
          <div className="nx-boletim">
            <Cabecalho v={v} />
            {DISCIPLINAS.map((d) => (
              <Linha key={d.code} d={d} v={v} cursor={d.code === 'IMU'} />
            ))}
          </div>
        </Ficha>
      ))}
    </>
  );
}

export function NotasModelos() {
  const so = new URLSearchParams(location.search).get('so');
  return (
    <main className="vitrine">
      {so !== 'disciplina' && <Geral />}
      {so !== 'geral' && <Disciplinas />}
    </main>
  );
}
