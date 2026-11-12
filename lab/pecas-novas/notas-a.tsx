// Notas, proposta A: peças NOVAS onde a tela pede. Duas peças nascem aqui, ambas para o mesmo problema
// ("quanto da nota o bimestre valia eu tirei, e onde está a meta?"), que hoje só aparece como número:
//   - NotaMedida: a nota dentro de uma pílula que se enche até a fração tirada (substitui a pílula cinza do total e a rosa de atenção).
//   - Medidor: pílula fina com o enchimento e um risquinho na meta (cartão de bimestre, "quanto preciso").
// ?peca=notasa&v=geral|materia, &foco=regua. Sem v: as duas.
import type { CSSProperties, ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Target } from '../../src/ui/components/Target';
import { Barra, MATERIAS, Meta, Regua, f, soma } from './notas-tela';
import './notas-a.css';

const pedido = new URLSearchParams(location.search);
const foco = pedido.get('foco') === 'regua';
const META = 0.7;

type Tam = 'p' | 'm' | 'g' | 'linha';

// Peça nova 1: a nota com o seu medidor embaixo (ou ao lado, em `linha`). Vazia, vira só um traço.
function NotaMedida({ v, max, tam = 'p' }: { v: number | null; max: number; tam?: Tam }) {
  if (v === null)
    return (
      <span className="na-nota" data-tam={tam} data-vazia>
        <b>—</b>
      </span>
    );
  return (
    <span className="na-nota" data-tam={tam}>
      <b>{f(v)}</b>
      <Medidor v={v} max={max} />
    </span>
  );
}

// Peça nova 2: medidor fino, com o risquinho da meta. `marca` desenha outro risco (o que preciso tirar).
function Medidor({ v, max, marca, neutro }: { v: number | null; max: number; marca?: number; neutro?: boolean }) {
  const style = {
    '--frac': v === null ? 0 : Math.min(1, v / max),
    '--meta': marca ?? META,
  } as CSSProperties;
  return (
    <span
      className="na-medidor"
      data-baixa={!neutro && v !== null && v / max < META}
      style={style}
      aria-hidden
    >
      <i />
      <u />
    </span>
  );
}

function Cabecalho() {
  const sub = ['1º bim.', '2º bim.', 'Total', '3º bim.', '4º bim.', 'Total', 'até agora'];
  return (
    <div className="na-grade na-cab">
      <span className="na-sem" data-g="1">
        1º semestre <small>sobre 10</small>
      </span>
      <span className="na-sem" data-g="2">
        2º semestre <small>sobre 10</small>
      </span>
      <span className="na-sem" data-g="ano">
        Média
      </span>
      {sub.map((t, i) => (
        <span key={i} className="na-sub" data-c={i}>
          {t}
        </span>
      ))}
      <span className="na-sub" data-c="falta">
        Falta no 4º bim.
      </span>
      <span className="na-sub" data-c="sit">
        Situação
      </span>
    </div>
  );
}

function Linha({ i }: { i: number }) {
  const m = MATERIAS[i]!;
  const falta = m.falta;
  return (
    <Target className="na-grade na-linha" cursor={!foco && m.code === 'PRO'} label={m.code}>
      <span className="na-mat">
        <SubjectPill code={m.code} color={m.cor} />
      </span>
      <NotaMedida v={m.b[0]} max={m.vale[0]} />
      <NotaMedida v={m.b[1]} max={m.vale[1]} />
      <NotaMedida v={soma(m.b[0], m.b[1])} max={10} tam="m" />
      <NotaMedida v={m.b[2]} max={m.vale[0]} />
      <NotaMedida v={m.b[3]} max={m.vale[1]} />
      <NotaMedida v={soma(m.b[2], m.b[3])} max={10} tam="m" />
      <NotaMedida v={m.media} max={10} tam="g" />
      <span className="na-falta">
        {falta === null ? (
          <span className="na-vazio">—</span>
        ) : (
          <>
            <span>
              <b>{f(falta)}</b> de {f(m.vale[1])}
            </span>
            <Medidor v={falta} max={m.vale[1]} marca={1} neutro />
          </>
        )}
      </span>
      <span className="na-sit">
        {m.sit === null ? (
          <span className="na-apoio">Sem notas</span>
        ) : (
          <StatePill state={m.sit}>{m.sit === 'ok' ? 'Na meta' : 'Atenção'}</StatePill>
        )}
      </span>
    </Target>
  );
}

function Resumo() {
  return (
    <div className="na-resumo">
      <NotaMedida v={7.4} max={10} tam="linha" />
      <span className="na-apoio">média geral</span>
      <StatePill state="ok">3 na meta</StatePill>
      <StatePill state="atencao">2 em atenção</StatePill>
      <span className="na-apoio">1 sem notas</span>
      <Meta />
    </div>
  );
}

function Geral() {
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="na-tela" data-v="geral">
        <Regua atual={null} />
        <Block
          id="na.boletim"
          title="Boletim geral"
          count="6 matérias"
          tools={<Resumo />}
          fixed={foco ? 'none' : 'inside'}
        >
          <div className="na-boletim">
            <Cabecalho />
            <div className="na-corpo">
              <div className="na-faixas na-grade" aria-hidden>
                <i data-g="1" />
                <i data-g="2" />
                <i data-g="ano" />
              </div>
              {MATERIAS.map((m, i) => (
                <Linha key={m.code} i={i} />
              ))}
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}

interface CartaoProps {
  nome: string;
  v: number | null;
  max: number;
  apoio: ReactNode;
  escolhido?: boolean;
  total?: boolean;
  marca?: number;
}

// Cartão de bimestre com medidor: o número, a barra com a meta e uma linha de apoio que diz o que a meta pede.
function Cartao({ nome, v, max, apoio, escolhido, total, marca }: CartaoProps) {
  const baixa = !total && v !== null && v / max < META;
  return (
    <Target
      className={total ? 'na-cartao na-viva' : 'na-cartao'}
      selected={escolhido}
      cursor={escolhido && !foco}
      label={nome}
    >
      <span className="na-rotulo">{nome}</span>
      <b className="na-numero">{f(v)}</b>
      <Medidor v={v} max={max} {...(marca !== undefined && { marca })} />
      <span className="na-apoio">{apoio}</span>
      {baixa && <StatePill state="atencao">Abaixo da meta</StatePill>}
    </Target>
  );
}

function Semestre({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <section className="na-semestre">
      <h3 className="na-titulo">
        {nome} <small>sobre 10</small>
      </h3>
      <div className="na-cartoes">{children}</div>
    </section>
  );
}

function Avaliacao({ nome, vale, data }: { nome: string; vale: number; data: string }) {
  return (
    <Target className="na-aval" label={nome}>
      <span className="na-aval-texto">
        <strong>{nome}</strong>
        <span className="na-apoio">{data}</span>
      </span>
      <span className="na-vale">
        vale <b>{f(vale)}</b>
      </span>
      <span className="na-slot">—</span>
    </Target>
  );
}

function Disciplina() {
  const m = MATERIAS[2]!;
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="na-tela" data-v="materia">
        <Regua atual={m.code} />
        <Block
          id="na.bimestres"
          title="Propedêutica"
          count="esquema 3 + 7"
          fixed={foco ? 'none' : 'inside'}
          tools={
            <div className="na-resumo">
              <SubjectPill code={m.code} color={m.cor} />
              <span className="na-apoio">Ano</span>
              <NotaMedida v={m.media} max={10} tam="linha" />
              <span className="na-apoio">média até agora</span>
              <StatePill state="atencao">Atenção</StatePill>
            </div>
          }
        >
          <div className="na-semestres">
            <Semestre nome="1º semestre">
              <Cartao nome="1º bim." v={m.b[0]} max={3} apoio="de 3,0 · meta 2,1" />
              <Cartao nome="2º bim." v={m.b[1]} max={7} apoio="de 7,0 · meta 4,9" />
              <Cartao
                nome="Total"
                v={soma(m.b[0], m.b[1])}
                max={10}
                apoio="de 10,0 · meta 7,0"
                total
              />
            </Semestre>
            <Semestre nome="2º semestre">
              <Cartao nome="3º bim." v={m.b[2]} max={3} apoio="de 3,0 · meta 2,1" />
              <Cartao
                nome="4º bim."
                v={m.b[3]}
                max={7}
                apoio="precisa de 4,9"
                marca={0.7}
                escolhido
              />
              <Cartao nome="Total" v={null} max={10} apoio="de 10,0 · meta 7,0" total />
            </Semestre>
          </div>
        </Block>
        <div className="na-baixo">
          <Block
            id="na.avaliacoes"
            title="Avaliações do 4º bimestre"
            count="3 · somam 7,0 de 7,0"
            tools={
              <Button variant="primary" shortcut="Alt N">
                Nova avaliação
              </Button>
            }
            fixed="none"
          >
            <div className="na-lista">
              <Avaliacao nome="Prova teórica" vale={4} data="24 de novembro" />
              <Avaliacao nome="Prova prática" vale={2} data="27 de novembro" />
              <Avaliacao nome="Seminário" vale={1} data="sem data" />
            </div>
            <p className="na-dica na-apoio">Enter na avaliação lança a nota.</p>
          </Block>
          <Block id="na.preciso" title="Quanto preciso tirar" tools={<Meta />} fixed="none">
            <div className="na-preciso">
              <div className="na-alvo">
                <div className="na-alvo-topo">
                  <b className="na-grande">4,9</b>
                  <span>de 7,0 no 4º bimestre</span>
                </div>
                <Medidor v={4.9} max={7} marca={1} neutro />
                <span className="na-apoio">
                  para fechar o ano em 7,0 · 70% do que o bimestre vale
                </span>
              </div>
              <div className="na-conta">
                <span>Fechar o 2º semestre em 7,0</span>
                <b>5,2</b>
              </div>
              <div className="na-conta">
                <span>Máximo que o ano ainda alcança</span>
                <b>8,2</b>
              </div>
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
}

export function NotasA() {
  const v = pedido.get('v');
  return (
    <>
      {v !== 'materia' && <Geral />}
      {v !== 'geral' && <Disciplina />}
    </>
  );
}
