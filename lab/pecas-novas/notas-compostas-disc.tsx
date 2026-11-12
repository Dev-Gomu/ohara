// Notas, degrau 3: cartão de bimestre e linha de avaliação. Ver notas-compostas.tsx.
import { Button } from '../../src/ui/components/Button';
import { De, META, Trio, fmt } from './notas-comp-base';
import type { Nota, Versao } from './notas-comp-base';

interface Av {
  nome: string;
  nota: Nota;
  max: number;
}
export interface Bim {
  nome: string;
  vale: number;
  avals: Av[];
}
export type Modo = 'cursor' | 'digitando';

export const av = (nome: string, nota: Nota, max: number): Av => ({ nome, nota, max });
const somaMax = (b: Bim) => b.avals.reduce((s, x) => s + x.max, 0);
export const converte = (b: Bim) => Math.abs(somaMax(b) - b.vale) > 0.01;
export function fracao(b: Bim): Nota {
  const feitas = b.avals.filter((x) => x.nota !== null);
  if (feitas.length === 0) return null;
  return feitas.reduce((s, x) => s + (x.nota ?? 0), 0) / feitas.reduce((s, x) => s + x.max, 0);
}
export const vezes = (n: Nota, k: number): Nota => (n === null ? null : n * k);
const Marca = ({ se }: { se: boolean }) => (se ? <i className="np-marca" /> : null);

// ---------- Linha de avaliação ----------
function Campo({ texto, max }: { texto: string; max: number }) {
  return (
    <span className="np-campo-par" data-v="b">
      <span className="np-campo" data-viva="">
        <span className="np-campo-num">
          {texto}
          <i className="np-caret" />
        </span>
        <De v={max} />
      </span>
    </span>
  );
}

export function Aval({ v, x, modo }: { v: Versao; x: Av; modo?: Modo }) {
  const baixa = x.nota !== null && x.nota / x.max < META / 10;
  const digitando = modo === 'digitando';
  const pendente = x.nota === null ? '' : undefined;
  return (
    <div
      className="nc-aval"
      data-v={v}
      data-cursor={modo === 'cursor' && v !== 'b' ? '' : undefined}
    >
      <span className="nc-aval-nome">
        <span>{x.nome}</span>
        {v === 'c' && <De v={x.max} />}
      </span>
      {digitando && <Campo texto="1," max={x.max} />}
      {!digitando && v === 'a' && (
        <span className="nc-par" data-pendente={pendente}>
          <Marca se={baixa} />
          <b>{fmt(x.nota)}</b> <De v={x.max} />
        </span>
      )}
      {!digitando && v === 'b' && (
        <>
          <Marca se={baixa} />
          <span className="nc-campo-fixo" data-cursor={modo === 'cursor' ? '' : undefined}>
            <b data-pendente={pendente}>{fmt(x.nota)}</b>
            <De v={x.max} />
          </span>
        </>
      )}
      {!digitando && v === 'c' && (
        <span className="nc-par" data-pendente={pendente}>
          <Marca se={baixa} />
          <b className="nc-aval-nota">{fmt(x.nota)}</b>
        </span>
      )}
    </div>
  );
}

const USO_AVAL: Record<Versao, string> = {
  a: 'Texto. Nome à esquerda, nota e "de 2.0" à direita. Enter na linha abre o campo no lugar da nota.',
  b: 'Campo à vista. A nota já mora dentro do campo; o cursor anda de campo em campo e é só digitar.',
  c: 'Duas linhas. O "de 2.0" desce para baixo do nome e a nota fica sozinha, maior, em coluna limpa.',
};

const AMOSTRAS: [Av, Modo?][] = [
  [av('Prova 1', 1.6, 2)],
  [av('Prova 2', 1.2, 2)],
  [av('Prova 3', null, 2)],
  [av('Trabalho', 0.8, 1), 'cursor'],
  [av('Relatório', 1.5, 2), 'digitando'],
];

export function Avaliacoes() {
  return (
    <Trio nome="Avaliação" largura={4} uso={USO_AVAL}>
      {(v) => (
        <>
          <div className="nc-cartao">
            {AMOSTRAS.map(([x, modo]) => (
              <Aval key={x.nome} v={v} x={x} {...(modo && { modo })} />
            ))}
          </div>
          <p className="v-legenda">
            De cima para baixo: normal, abaixo da meta, pendente, com cursor, digitando.
          </p>
        </>
      )}
    </Trio>
  );
}

// ---------- Cartão de bimestre ----------
const BIMS: [string, Bim, number?][] = [
  ['Nota já em pontos', { nome: '1º bim.', vale: 3, avals: [av('Prova', 1.6, 2), av('Relatório', 0.8, 1)] }],
  [
    'Com conversão, abaixo da meta, cursor',
    { nome: '2º bim.', vale: 6, avals: [av('Prova', 6.0, 10), av('Trabalho', 7.0, 10)] },
    0,
  ],
  ['Sem notas ainda', { nome: '4º bim.', vale: 7, avals: [av('Prova', null, 10), av('Trabalho', null, 10)] }],
  ['Sem avaliações', { nome: '3º bim.', vale: 3, avals: [] }],
];

export function Cartao({ v, b, cursor }: { v: Versao; b: Bim; cursor?: number }) {
  const fr = fracao(b);
  const pts = vezes(fr, b.vale);
  const baixa = fr !== null && fr < META / 10;
  const nota = converte(b) && fr !== null ? <small className="nc-de">nota {fmt(fr * 10)}</small> : null;
  const par = (
    <span className="nc-par" data-pendente={pts === null ? '' : undefined}>
      <Marca se={baixa} />
      <b>{fmt(pts)}</b> <De v={b.vale} />
    </span>
  );
  return (
    <div className="nc-cartao" data-v={v}>
      <div className="nc-cartao-topo">
        <b>{b.nome}</b>
        {v === 'b' ? par : <small className="nc-de">vale {fmt(b.vale)}</small>}
      </div>
      {v === 'a' && (
        <div className="nc-cartao-num" data-pendente={pts === null ? '' : undefined}>
          <Marca se={baixa} />
          <b>{fmt(pts)}</b>
          {nota}
        </div>
      )}
      {v === 'b' && nota && <div className="nc-cartao-sub">{nota}</div>}
      {b.avals.map((x, i) => (
        <Aval key={x.nome} v="a" x={x} {...(cursor === i && { modo: 'cursor' as const })} />
      ))}
      {b.avals.length === 0 && <p className="nc-de nc-vazio">Nenhuma avaliação ainda.</p>}
      {v === 'c' && b.avals.length > 0 && (
        <div className="nc-cartao-pe">
          <span>Total</span>
          {nota}
          {par}
        </div>
      )}
      <Button variant="quiet">Nova avaliação</Button>
    </div>
  );
}

const USO_CARTAO: Record<Versao, string> = {
  a: 'Número grande. Nome e "vale" no topo, os pontos em letra de voz e a nota convertida ao lado; atividades embaixo.',
  b: 'Compacto. Os pontos vão no topo, ao lado do nome ("3.9 de 6.0"); o cartão fica mais baixo e as atividades sobem.',
  c: 'Soma no pé. As atividades vêm primeiro e o total fecha o cartão, como a conta do professor.',
};

export function Cartoes() {
  return (
    <Trio nome="Cartão de bimestre" largura={12} uso={USO_CARTAO}>
      {(v) => (
        <div className="nc-cartoes">
          {BIMS.map(([estado, b, cursor]) => (
            <div key={estado} className="v-amostra">
              <Cartao v={v} b={b} {...(cursor !== undefined && { cursor })} />
              <span className="v-legenda">{estado}</span>
            </div>
          ))}
        </div>
      )}
    </Trio>
  );
}
