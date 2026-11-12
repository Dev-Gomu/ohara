// Notas, degrau 3: resumo da disciplina e "quanto preciso tirar". Ver notas-compostas.tsx.
import type { ReactNode } from 'react';
import { Amostra } from '../vitrine/moldura';
import { De, META, Sinal, Trio, fmt } from './notas-comp-base';
import type { Versao } from './notas-comp-base';
import { Meta } from './notas-pecas';

// ---------- Resumo ----------
const USO_RESUMO: Record<Versao, string> = {
  a: 'Colunas. Rótulo em cima e número embaixo, lado a lado; a meta fica na ilha, à direita.',
  b: 'Lista. Cartão de peça com uma linha por dado, rótulo à esquerda e número à direita.',
  c: 'Média na frente. A média em letra de voz grande; os semestres menores ao lado.',
};

const Aberto = () => <small className="nc-de">em aberto</small>;

export function Resumo({ v }: { v: Versao }) {
  const meta = <Meta v="a" cursor />;
  if (v === 'a') {
    return (
      <div className="nc-resumo" data-v="a">
        <div className="nc-dado">
          <span className="nc-de">1º sem.</span>
          <b>{fmt(7.1)}</b>
        </div>
        <div className="nc-dado">
          <span className="nc-de">2º sem.</span>
          <Aberto />
        </div>
        <div className="nc-dado">
          <span className="nc-de">Média até agora</span>
          <b>{fmt(8.1)}</b>
        </div>
        {meta}
      </div>
    );
  }
  if (v === 'b') {
    return (
      <div className="nc-resumo nc-cartao" data-v="b">
        <div className="nc-par-linha">
          <span>1º semestre</span>
          <b>{fmt(7.1)}</b>
        </div>
        <div className="nc-par-linha">
          <span>2º semestre</span>
          <Aberto />
        </div>
        <div className="nc-par-linha">
          <span>Média até agora</span>
          <b>{fmt(8.1)}</b>
        </div>
        <div className="nc-par-linha">
          <span />
          {meta}
        </div>
      </div>
    );
  }
  return (
    <div className="nc-resumo" data-v="c">
      <div className="nc-dado" data-grande="">
        <span className="nc-de">Média até agora</span>
        <b>{fmt(8.1)}</b>
      </div>
      <div className="nc-lado">
        <span className="nc-par">
          <span className="nc-de">1º sem.</span> <b>{fmt(7.1)}</b>
        </span>
        <span className="nc-par">
          <span className="nc-de">2º sem.</span> <Aberto />
        </span>
      </div>
      {meta}
    </div>
  );
}

export function Resumos() {
  return (
    <Trio nome="Resumo" largura={4} uso={USO_RESUMO}>
      {(v) => (
        <>
          <Resumo v={v} />
          <p className="v-legenda">O cursor só entra na meta (aqui, no +).</p>
        </>
      )}
    </Trio>
  );
}

// ---------- Quanto preciso ----------
export type Caso =
  | { tipo: 'numero'; pts: number; vale: number; nota?: number }
  | { tipo: 'ok' | 'nao'; vale: number };

const CASOS: [string, Caso][] = [
  ['Nota já em pontos', { tipo: 'numero', pts: 4.9, vale: 7 }],
  ['Com conversão', { tipo: 'numero', pts: 4.2, vale: 7, nota: 6.0 }],
  ['Já alcançou', { tipo: 'ok', vale: 7 }],
  ['Não alcança mais', { tipo: 'nao', vale: 7 }],
];

const sinal = (c: Caso): ReactNode =>
  c.tipo === 'ok' ? (
    <Sinal tipo="ok">Aprovado</Sinal>
  ) : (
    <Sinal tipo="atencao">Não alcança</Sinal>
  );
const frase = (c: Caso) =>
  c.tipo === 'ok'
    ? `Já fechou o ano com ${fmt(META)} ou mais.`
    : `Nem com ${fmt(c.vale)} no 4º bim. o ano fecha em ${fmt(META)}.`;

export function Quanto({ v, c }: { v: Versao; c: Caso }) {
  if (v === 'a') {
    return c.tipo === 'numero' ? (
      <p className="nc-frase">
        Para fechar o ano com {fmt(META)}, precisa de{' '}
        <b>
          {fmt(c.pts)} <De v={c.vale} />
        </b>{' '}
        no 4º bim.{c.nota !== undefined && <> Isso é nota {fmt(c.nota)} nas avaliações.</>}
      </p>
    ) : (
      <p className="nc-frase" data-sinal="">
        {sinal(c)} {frase(c)}
      </p>
    );
  }
  if (v === 'b') {
    return (
      <div className="nc-quanto" data-v="b">
        <span className="nc-de">Precisa no 4º bim.</span>
        {c.tipo === 'numero' ? (
          <span className="nc-quanto-num">
            <b>{fmt(c.pts)}</b> <De v={c.vale} />
          </span>
        ) : (
          sinal(c)
        )}
        <span className="nc-de">
          {c.tipo !== 'numero'
            ? frase(c)
            : c.nota !== undefined
              ? `Nota ${fmt(c.nota)} nas avaliações.`
              : `Para fechar o ano com ${fmt(META)}.`}
        </span>
      </div>
    );
  }
  return (
    <div className="nc-quanto nc-cartao" data-v="c">
      <div className="nc-par-linha">
        <span>Precisa no 4º bim.</span>
        {c.tipo === 'numero' ? (
          <span className="nc-par">
            <b>{fmt(c.pts)}</b> <De v={c.vale} />
          </span>
        ) : (
          sinal(c)
        )}
      </div>
      {c.tipo === 'numero' && c.nota !== undefined && (
        <div className="nc-par-linha">
          <span>Nota nas avaliações</span>
          <b>{fmt(c.nota)}</b>
        </div>
      )}
    </div>
  );
}

const USO_PRECISA: Record<Versao, string> = {
  a: 'Frase. Texto corrido, com o número em negrito no meio.',
  b: 'Número na frente. Rótulo em cima, o número em letra de voz e a explicação embaixo, apagada.',
  c: 'Linha de cartão. Rótulo à esquerda e número à direita, como as linhas do resumo.',
};

export function Precisas() {
  return (
    <Trio nome="Quanto preciso" largura={4} uso={USO_PRECISA}>
      {(v) => (
        <>
          {CASOS.map(([estado, c]) => (
            <Amostra key={estado} estado={estado}>
              <Quanto v={v} c={c} />
            </Amostra>
          ))}
          <p className="v-legenda">Não recebe cursor: é só texto.</p>
        </>
      )}
    </Trio>
  );
}
