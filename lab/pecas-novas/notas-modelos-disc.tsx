// Tela da disciplina: três formas de organizar pesos, notas e atividades. Ver notas-modelos.tsx.
import { Button } from '../../src/ui/components/Button';
import { SubjectPill } from '../../src/ui/components/Pill';
import { RulerPill } from '../../src/ui/components/Ruler';
import { Ficha, Secao } from '../vitrine/moldura';
import { DISCIPLINAS, META, falta, fmt, fracao, media, pontos, semestre } from './notas-modelos';
import type { Avaliacao, Bimestre, Disciplina } from './notas-modelos';

type Versao = 'a' | 'b' | 'c';
const nomeBim = (i: number) => `${i + 1}º bim.`;
const somaMax = (b: Bimestre) => b.avals.reduce((s, x) => s + x.max, 0);
// A nota do professor está em outra escala e precisa ser convertida para os pontos do bimestre.
const converte = (b: Bimestre) => Math.abs(somaMax(b) - b.vale) > 0.01;
const escala = (b: Bimestre) => {
  const fr = fracao(b);
  return fr === null ? null : fr * 10;
};
const De = ({ v }: { v: number }) => <small className="nx-de">de {fmt(v)}</small>;

function Aval({ x, cursor, pts }: { x: Avaliacao; cursor?: boolean; pts?: number | null }) {
  return (
    <button type="button" tabIndex={-1} className="nx-aval" data-cursor={cursor ? '' : undefined}>
      <span className="nx-aval-nome">{x.nome}</span>
      <span className="nx-par" data-pendente={x.nota === null ? '' : undefined}>
        <b>{fmt(x.nota)}</b> <De v={x.max} />
      </span>
      {pts !== undefined && <b className="nx-pts">{fmt(pts)}</b>}
    </button>
  );
}

function Precisa({ d }: { d: Disciplina }) {
  const b4 = d.bims[3];
  const f = falta(d);
  return (
    <p className="nx-precisa">
      Para fechar o ano com {fmt(META)}, precisa de{' '}
      <b>
        {fmt(f)} <De v={b4.vale} />
      </b>{' '}
      no 4º bim.
      {converte(b4) && <> Isso é nota {fmt((f / b4.vale) * 10)} nas avaliações.</>}
    </p>
  );
}

function TotalSem({ d, s }: { d: Disciplina; s: 0 | 1 }) {
  const sem = semestre(d, s);
  return (
    <div className="nx-total">
      <span>{s + 1}º semestre</span>
      {sem.aberto ? (
        <small className="nx-de">em aberto</small>
      ) : (
        <span className="nx-par">
          <b>{fmt(sem.valor)}</b> <De v={10} />
        </span>
      )}
    </div>
  );
}

// A. Um cartão por bimestre, com as atividades dentro.
function Cartoes({ d }: { d: Disciplina }) {
  return (
    <div className="nx-cartoes">
      {([0, 1] as const).map((s) => (
        <div key={s} className="nx-sem">
          {[s * 2, s * 2 + 1].map((i) => {
            const b = d.bims[i]!;
            return (
              <div key={i} className="nx-cartao">
                <div className="nx-cartao-topo">
                  <b>{nomeBim(i)}</b>
                  <small className="nx-de">vale {fmt(b.vale)}</small>
                </div>
                <div className="nx-cartao-num">
                  <b>{fmt(pontos(b))}</b>
                  {converte(b) && pontos(b) !== null && (
                    <small className="nx-de">nota {fmt(escala(b))}</small>
                  )}
                </div>
                {b.avals.map((x, j) => (
                  <Aval key={j} x={x} cursor={i === 2 && j === 0} />
                ))}
              </div>
            );
          })}
          <TotalSem d={d} s={s} />
        </div>
      ))}
    </div>
  );
}

// B. Régua de bimestres em cima; embaixo, as atividades do bimestre escolhido e a conta.
function Regua({ d }: { d: Disciplina }) {
  const atual = 2;
  const b = d.bims[atual]!;
  return (
    <>
      <div className="nx-regua">
        {d.bims.map((x, i) => (
          <RulerPill
            key={i}
            title={nomeBim(i)}
            detail={`${fmt(pontos(x))} de ${fmt(x.vale)}`}
            selected={i === atual}
          />
        ))}
      </div>
      <div className="nx-duas">
        <div className="nx-lista">
          {b.avals.map((x, j) => (
            <Aval key={j} x={x} cursor={j === 0} />
          ))}
          <Button variant="quiet">Nova avaliação</Button>
        </div>
        <div className="nx-conta">
          {converte(b) && (
            <div className="nx-total">
              <span>Nota nas avaliações</span>
              <span className="nx-par">
                <b>{fmt(escala(b))}</b> <De v={10} />
              </span>
            </div>
          )}
          <div className="nx-total">
            <span>Pontos no {nomeBim(atual)}</span>
            <span className="nx-par">
              <b>{fmt(pontos(b))}</b> <De v={b.vale} />
            </span>
          </div>
          <TotalSem d={d} s={1} />
          <div className="nx-total">
            <span>Média até agora</span>
            <b>{fmt(media(d))}</b>
          </div>
        </div>
      </div>
    </>
  );
}

// C. Extrato: o ano inteiro em uma lista, cada atividade com os pontos que rendeu.
function Extrato({ d }: { d: Disciplina }) {
  return (
    <div className="nx-cartoes">
      {([0, 1] as const).map((s) => (
        <div key={s} className="nx-extrato">
          {[s * 2, s * 2 + 1].map((i) => {
            const b = d.bims[i]!;
            return (
              <div key={i} className="nx-grupo">
                <div className="nx-grupo-topo">
                  <b>{nomeBim(i)}</b>
                  <small className="nx-de">vale {fmt(b.vale)}</small>
                  <b className="nx-pts">{fmt(pontos(b))}</b>
                </div>
                {b.avals.map((x, j) => (
                  <Aval
                    key={j}
                    x={x}
                    cursor={i === 2 && j === 0}
                    {...(converte(b) && {
                      pts: x.nota === null ? null : (x.nota / somaMax(b)) * b.vale,
                    })}
                  />
                ))}
              </div>
            );
          })}
          <TotalSem d={d} s={s} />
        </div>
      ))}
    </div>
  );
}

const TEXTO: Record<Versao, [string, string]> = {
  a: [
    'A. Cartões',
    'Um cartão por bimestre, lado a lado: quanto vale, quanto fez e as atividades dentro. O ano inteiro à vista, sem trocar de tela.',
  ],
  b: [
    'B. Régua de bimestres',
    'Escolhe o bimestre na régua (← →); embaixo ficam só as atividades dele e a conta passo a passo. Mais espaço, um bimestre por vez.',
  ],
  c: [
    'C. Extrato',
    'O ano em uma lista só, como extrato: cada atividade com a nota do professor e, quando há conversão, os pontos que ela rendeu.',
  ],
};
const CORPO = { a: Cartoes, b: Regua, c: Extrato };

export function Disciplinas() {
  const pedido = new URLSearchParams(location.search).get('mat') ?? 'IMU';
  const d = DISCIPLINAS.find((x) => x.code === pedido) ?? DISCIPLINAS[2]!;
  return (
    <>
      <Secao>Dentro da disciplina: três formas de organizar</Secao>
      {(['a', 'b', 'c'] as const).map((v) => {
        const Corpo = CORPO[v];
        return (
          <Ficha key={v} nome={TEXTO[v][0]} arquivo="Disciplina" largura={12} uso={TEXTO[v][1]}>
            <div className="nx-quem">
              <SubjectPill code={d.code} color={d.cor} />
              <small className="nx-de">{d.modelo}</small>
            </div>
            <Corpo d={d} />
            <Precisa d={d} />
          </Ficha>
        );
      })}
    </>
  );
}
