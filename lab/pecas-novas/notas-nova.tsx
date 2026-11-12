// Notas refeita do zero na linguagem do app: mesmo layout (régua, resumo, boletim em faixas por semestre;
// disciplina com bimestres, avaliações e "quanto preciso"), mas a hierarquia sai das TRÊS ALTURAS e dos TRÊS
// DEGRAUS de letra, sem pílula escura. ?peca=notasnova&v=geral|materia (sem v: as duas), &foco=regua.
import type { ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { ListItem } from '../../src/ui/components/ListItem';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Target } from '../../src/ui/components/Target';
import { Barra, MATERIAS, Meta, Regua, baixa, f, soma } from './notas-tela';
import './notas-nova.css';

const pedido = new URLSearchParams(location.search);
const foco = pedido.get('foco') === 'regua';

// Cabeçalho do semestre: o título é voz sobre o bloco (não sobre a faixa); os bimestres ficam em apoio.
function Cabecalho() {
  return (
    <div className="nv-grade nv-cab">
      <span className="nv-sem" data-g="1">
        1º semestre
      </span>
      <span className="nv-sem" data-g="2">
        2º semestre
      </span>
      <span className="nv-sem" data-g="ano">
        Média
      </span>
      {['1º bim.', '2º bim.', 'Total', '3º bim.', '4º bim.', 'Total', 'até agora'].map((t, i) => (
        <span key={i} className="nv-sub" data-c={i}>
          {t}
        </span>
      ))}
      <span className="nv-sub" data-c="falta">
        Falta no 4º bim.
      </span>
      <span className="nv-sub" data-c="sit">
        Situação
      </span>
    </div>
  );
}

function Nota({ v, max }: { v: number | null; max: number }) {
  if (v === null) return <span className="nv-vazio">—</span>;
  return <span className={baixa(v, max) ? 'nv-baixa' : undefined}>{f(v)}</span>;
}

// Total vazio vira só um traço: pílula cinza vazia pesa à toa.
function Total({ v }: { v: number | null }) {
  return v === null ? <span className="nv-vazio">—</span> : <b className="nv-total">{f(v)}</b>;
}

function Linha({ i }: { i: number }) {
  const m = MATERIAS[i]!;
  return (
    <Target className="nv-grade nv-linha" cursor={!foco && m.code === 'PRO'} label={m.code}>
      <span className="nv-mat">
        <SubjectPill code={m.code} color={m.cor} />
      </span>
      <Nota v={m.b[0]} max={m.vale[0]} />
      <Nota v={m.b[1]} max={m.vale[1]} />
      <Total v={soma(m.b[0], m.b[1])} />
      <Nota v={m.b[2]} max={m.vale[0]} />
      <Nota v={m.b[3]} max={m.vale[1]} />
      <Total v={soma(m.b[2], m.b[3])} />
      <b className="nv-media">{f(m.media)}</b>
      <span className="nv-falta">
        {m.falta === null ? (
          <span className="nv-vazio">—</span>
        ) : (
          <>
            <b>{f(m.falta)}</b> de {f(m.vale[1])}
          </>
        )}
      </span>
      <span className="nv-sit">
        {m.sit === null ? (
          <span className="nb-apoio">Sem notas</span>
        ) : (
          <StatePill state={m.sit}>{m.sit === 'ok' ? 'Na meta' : 'Atenção'}</StatePill>
        )}
      </span>
    </Target>
  );
}

function Resumo() {
  return (
    <div className="nv-resumo">
      <b className="nv-geral">7,4</b>
      <span className="nb-apoio">média geral</span>
      <StatePill state="ok">3 na meta</StatePill>
      <StatePill state="atencao">2 em atenção</StatePill>
      <span className="nb-apoio">1 sem notas</span>
      <Meta />
    </div>
  );
}

function Geral() {
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="nv-tela" data-v="geral">
        <Regua atual={null} />
        <Block
          id="nv.boletim"
          title="Boletim geral"
          count="6 matérias"
          tools={<Resumo />}
          fixed={foco ? 'none' : 'inside'}
        >
          <div className="nv-boletim">
            <Cabecalho />
            <div className="nv-corpo">
              <div className="nv-faixas nv-grade" aria-hidden>
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

interface BimProps {
  nome: string;
  v: number | null;
  max: number;
  apoio?: string;
  escolhido?: boolean;
  total?: boolean;
}

// Uma peça por bimestre: rótulo, número em voz, apoio. O total do semestre sobe uma altura (peça viva).
function Peca({ nome, v, max, apoio, escolhido, total }: BimProps) {
  const alerta = !total && baixa(v, max);
  return (
    <Target
      className={total ? 'nv-peca nv-viva' : 'nv-peca'}
      selected={escolhido}
      cursor={escolhido && !foco}
      label={nome}
    >
      <span className="nv-rotulo">{nome}</span>
      <b className="nv-numero">{f(v)}</b>
      <span className="nb-apoio">de {f(max)}</span>
      {alerta && <StatePill state="atencao">Atenção</StatePill>}
      {apoio !== undefined && <span className="nb-apoio">{apoio}</span>}
    </Target>
  );
}

function Semestre({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <section className="nv-semestre">
      <h3 className="nv-titulo">{nome}</h3>
      <div className="nv-pecas">{children}</div>
    </section>
  );
}

function Disciplina() {
  const m = MATERIAS[2]!;
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="nv-tela" data-v="materia">
        <Regua atual={m.code} />
        <Block
          id="nv.bimestres"
          title="Propedêutica"
          count="esquema 3 + 7"
          fixed={foco ? 'none' : 'inside'}
          tools={
            <div className="nv-ano">
              <SubjectPill code={m.code} color={m.cor} />
              <span className="nb-apoio">Ano</span>
              <b className="nv-geral">{f(m.media)}</b>
              <span className="nb-apoio">média até agora</span>
              <StatePill state="atencao">Atenção</StatePill>
            </div>
          }
        >
          <div className="nv-semestres">
            <Semestre nome="1º semestre">
              <Peca nome="1º bim." v={m.b[0]} max={3} />
              <Peca nome="2º bim." v={m.b[1]} max={7} />
              <Peca nome="Total" v={soma(m.b[0], m.b[1])} max={10} total />
            </Semestre>
            <Semestre nome="2º semestre">
              <Peca nome="3º bim." v={m.b[2]} max={3} />
              <Peca nome="4º bim." v={m.b[3]} max={7} apoio="em aberto" escolhido />
              <Peca nome="Total" v={null} max={10} total />
            </Semestre>
          </div>
        </Block>
        <div className="nv-baixo">
          <Block
            id="nv.avaliacoes"
            title="Avaliações do 4º bimestre"
            count="3 · somam 7,0 de 7,0"
            tools={
              <Button variant="primary" shortcut="Alt N">
                Nova avaliação
              </Button>
            }
            fixed="none"
          >
            <div className="nv-lista">
              <ListItem title="Prova teórica" detail="vale 4,0 · 24 de novembro">
                <span className="nv-nota nv-vazio">—</span>
              </ListItem>
              <ListItem title="Prova prática" detail="vale 2,0 · 27 de novembro">
                <span className="nv-nota nv-vazio">—</span>
              </ListItem>
              <ListItem title="Seminário" detail="vale 1,0 · sem data">
                <span className="nv-nota nv-vazio">—</span>
              </ListItem>
            </div>
            <p className="nv-dica nb-apoio">Enter na avaliação lança a nota.</p>
          </Block>
          <Block id="nv.preciso" title="Quanto preciso tirar" tools={<Meta />} fixed="none">
            <div className="nv-preciso">
              <div className="nv-alvo">
                <b className="nv-grande">4,9</b>
                <div className="nv-pilha">
                  <span>de 7,0 no 4º bimestre</span>
                  <span className="nb-apoio">para fechar o ano em 7,0</span>
                </div>
              </div>
              <div className="nv-conta">
                <span>Fechar o 2º semestre em 7,0</span>
                <b>5,2</b>
              </div>
              <div className="nv-conta">
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

export function NotasNova() {
  const v = pedido.get('v');
  return (
    <>
      {v !== 'materia' && <Geral />}
      {v !== 'geral' && <Disciplina />}
    </>
  );
}
