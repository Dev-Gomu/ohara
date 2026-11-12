// Notas (D113 e D114) como tela inteira, 1280 x 800, só com peças de src/ui/components.
// ?peca=notastela&v=geral | materia (sem v: as duas, uma sobre a outra). &foco=regua mostra o cursor na régua.
import type { ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { Field } from '../../src/ui/components/Controls';
import { FilterChip } from '../../src/ui/components/Filter';
import { Island, LevelIndicator, Tab } from '../../src/ui/components/Island';
import { ListItem } from '../../src/ui/components/ListItem';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Target } from '../../src/ui/components/Target';
import './notas-tela.css';

type Nota = number | null;
type Situacao = 'ok' | 'atencao' | null;
interface Materia {
  code: string;
  cor: number;
  // Valor de cada bimestre no esquema da matéria (5 + 5 ou 3 + 7).
  vale: [number, number];
  b: [Nota, Nota, Nota, Nota];
  media: Nota;
  falta: Nota;
  sit: Situacao;
}

export const MATERIAS: Materia[] = [
  {
    code: 'GEN',
    cor: 0,
    vale: [5, 5],
    b: [4.1, 3.8, 3.9, null],
    media: 7.9,
    falta: 2.3,
    sit: 'ok',
  },
  {
    code: 'IMU',
    cor: 2,
    vale: [3, 7],
    b: [2.0, 4.6, 1.9, null],
    media: 6.6,
    falta: 5.5,
    sit: 'atencao',
  },
  {
    code: 'PRO',
    cor: 1,
    vale: [3, 7],
    b: [2.4, 4.9, 1.8, null],
    media: 6.7,
    falta: 4.9,
    sit: 'atencao',
  },
  {
    code: 'APS',
    cor: 3,
    vale: [5, 5],
    b: [4.2, 3.8, 4.0, null],
    media: 8.0,
    falta: 2.0,
    sit: 'ok',
  },
  {
    code: 'MIC',
    cor: 4,
    vale: [3, 7],
    b: [2.4, 5.6, 2.4, null],
    media: 8.0,
    falta: 3.6,
    sit: 'ok',
  },
  {
    code: 'PSI',
    cor: 5,
    vale: [5, 5],
    b: [null, null, null, null],
    media: null,
    falta: null,
    sit: null,
  },
];

const TELAS = ['Hub', 'Mesa', 'Acervo', 'Agenda', 'Treino', 'Configs'];
export const f = (n: Nota) => (n === null ? '—' : n.toFixed(1).replace('.', ','));
export const soma = (a: Nota, b: Nota) => (a === null || b === null ? null : a + b);
export const baixa = (v: Nota, max: number) => v !== null && v / max < 0.7;
const pedido = new URLSearchParams(location.search);
const focoNaRegua = pedido.get('foco') === 'regua';

export function Barra() {
  return (
    <nav className="hz-topo">
      <Island label="Telas">
        {TELAS.map((nome, i) => (
          <Tab key={nome} number={i + 1} name={nome} current={nome === 'Agenda'} />
        ))}
      </Island>
      <h1 className="hz-titulo">Notas</h1>
      <div className="hz-fim">
        <LevelIndicator level="field" keys={['← → ↑ ↓', 'Enter abre', 'Esc sobe']} />
        <Island label="Ano">
          <Button variant="quiet" label="Ano anterior">
            ‹
          </Button>
          <b className="nb-ano">2026</b>
          <Button variant="quiet" label="Próximo ano">
            ›
          </Button>
        </Island>
        <Button>Aberto</Button>
        <Button shortcut="Esc">Agenda</Button>
      </div>
    </nav>
  );
}

// Régua: o que escolhe fica fora do que é escolhido. Marca da matéria, sigla e média na mesma peça.
export function Regua({ atual }: { atual: string | null }) {
  return (
    <Block id="nb.regua" fixed={focoNaRegua ? 'inside' : 'none'}>
      <div className="nb-regua">
        <FilterChip selected={atual === null} cursor={focoNaRegua && atual === null}>
          Boletim geral
        </FilterChip>
        {MATERIAS.map((m) => (
          <FilterChip
            key={m.code}
            subject={m.cor}
            selected={atual === m.code}
            cursor={focoNaRegua && atual === m.code}
          >
            {`${m.code}  ${f(m.media)}`}
          </FilterChip>
        ))}
        <div className="nb-busca">
          <Field label="Buscar matéria" shortcut="/" />
        </div>
      </div>
    </Block>
  );
}

export function Meta() {
  return (
    <div className="nb-meta">
      <span className="nb-apoio">Meta</span>
      <Button variant="quiet" label="Diminuir a meta">
        −
      </Button>
      <b>7,0</b>
      <Button variant="quiet" label="Aumentar a meta">
        +
      </Button>
    </div>
  );
}

function Valor({ v, max }: { v: Nota; max: number }) {
  if (v === null) return <span className="nb-vazio">—</span>;
  return <span className={baixa(v, max) ? 'nb-baixa' : undefined}>{f(v)}</span>;
}

function Geral() {
  const comNota = MATERIAS.filter((m) => m.sit !== null);
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="nb-tela" data-v="geral">
        <Regua atual={null} />
        <Block id="nb.resumo" title="Resumo do ano" fixed="none">
          <div className="nb-resumo">
            <span className="nb-numero">7,4</span>
            <div className="nb-pilha">
              <span className="nb-apoio">média geral</span>
              <span>{comNota.length} matérias com nota</span>
            </div>
            <div className="nb-contas">
              <StatePill state="ok">3 na meta</StatePill>
              <StatePill state="atencao">2 em atenção</StatePill>
              <span className="nb-apoio">1 sem notas</span>
            </div>
            <Meta />
          </div>
        </Block>
        <Block
          id="nb.boletim"
          title="Boletim geral"
          count="6 matérias"
          fixed={focoNaRegua ? 'none' : 'inside'}
        >
          <div className="nb-rola">
            <div className="nb-tabela">
              <div className="nb-faixas" aria-hidden>
                <i />
                <i />
                <i data-ano />
              </div>
              <div className="nb-linha nb-cab">
                <span className="nb-c1">Matéria</span>
                <span className="nb-s1">1º semestre</span>
                <span className="nb-s2">2º semestre</span>
                <span className="nb-an">Ano</span>
                <span className="nb-fa">Falta no 4º bim.</span>
                <span className="nb-si">Situação</span>
              </div>
              <div className="nb-linha nb-sub">
                <span />
                <span>1º bim.</span>
                <span>2º bim.</span>
                <span>Total</span>
                <span />
                <span>3º bim.</span>
                <span>4º bim.</span>
                <span>Total</span>
                <span />
                <span>Média</span>
              </div>
              {MATERIAS.map((m) => (
                <Target
                  key={m.code}
                  className="nb-linha nb-item"
                  cursor={!focoNaRegua && m.code === 'PRO'}
                  label={m.code}
                >
                  <span className="nb-c1">
                    <SubjectPill code={m.code} color={m.cor} />
                  </span>
                  <Valor v={m.b[0]} max={m.vale[0]} />
                  <Valor v={m.b[1]} max={m.vale[1]} />
                  <b className="nb-total">{f(soma(m.b[0], m.b[1]))}</b>
                  <span />
                  <Valor v={m.b[2]} max={m.vale[0]} />
                  <Valor v={m.b[3]} max={m.vale[1]} />
                  <b className="nb-total">{f(soma(m.b[2], m.b[3]))}</b>
                  <span />
                  <b className="nb-media">—</b>
                  <span />
                  <span className="nb-falta">
                    {m.falta === null ? (
                      <span className="nb-vazio">—</span>
                    ) : (
                      <>
                        <b>{f(m.falta)}</b> de {f(m.vale[1])}
                      </>
                    )}
                  </span>
                  <span className="nb-sit">
                    {m.sit === null ? (
                      <span className="nb-apoio">Sem notas</span>
                    ) : (
                      <StatePill state={m.sit}>{m.sit === 'ok' ? 'Na meta' : 'Atenção'}</StatePill>
                    )}
                  </span>
                </Target>
              ))}
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}

function Bimestre(p: {
  nome: string;
  v: Nota;
  max: number;
  selected?: boolean;
  cursor?: boolean;
  nota?: string;
}) {
  return (
    <Target className="nm-bim" selected={p.selected} cursor={p.cursor} label={p.nome}>
      <span className="nm-rotulo">{p.nome}</span>
      <b className="nm-numero">{f(p.v)}</b>
      <span className="nb-apoio">de {f(p.max)}</span>
      {baixa(p.v, p.max) && <StatePill state="atencao">Atenção</StatePill>}
      {p.nota !== undefined && <span className="nb-apoio">{p.nota}</span>}
    </Target>
  );
}

function Semestre({ nome, total, children }: { nome: string; total: Nota; children: ReactNode }) {
  return (
    <div className="nm-sem">
      <span className="nm-rotulo nm-nome">{nome}</span>
      {children}
      <div className="nm-total">
        <span className="nm-rotulo">Total</span>
        <b className="nm-numero">{f(total)}</b>
        <span className="nb-apoio">de 10,0</span>
      </div>
    </div>
  );
}

function PorMateria() {
  const m = MATERIAS[2]!;
  return (
    <div className="hz-app nb-app">
      <Barra />
      <div className="nb-tela" data-v="materia">
        <Regua atual={m.code} />
        <Block
          id="nm.faixas"
          title="Propedêutica"
          count="esquema 3 + 7"
          fixed={focoNaRegua ? 'none' : 'inside'}
          menu
        >
          <div className="nm-faixas">
            <Semestre nome="1º semestre" total={soma(m.b[0], m.b[1])}>
              <Bimestre nome="1º bim." v={m.b[0]} max={3} />
              <Bimestre nome="2º bim." v={m.b[1]} max={7} />
            </Semestre>
            <Semestre nome="2º semestre" total={null}>
              <Bimestre nome="3º bim." v={m.b[2]} max={3} />
              <Bimestre
                nome="4º bim."
                v={m.b[3]}
                max={7}
                selected
                cursor={!focoNaRegua}
                nota="em aberto"
              />
            </Semestre>
            <div className="nm-ano">
              <span className="nm-rotulo">
                <SubjectPill code={m.code} color={m.cor} /> Ano
              </span>
              <b className="nm-grande">{f(m.media)}</b>
              <span className="nb-apoio">média até agora</span>
              <StatePill state="atencao">Atenção</StatePill>
            </div>
          </div>
        </Block>
        <div className="nm-baixo">
          <Block
            id="nm.avaliacoes"
            title="Avaliações do 4º bimestre"
            count="3 · somam 7,0 de 7,0"
            fixed="none"
          >
            <div className="nm-lista">
              <ListItem title="Prova teórica" detail="vale 4,0 · 24 de novembro">
                <span className="nm-nota nb-vazio">—</span>
              </ListItem>
              <ListItem title="Prova prática" detail="vale 2,0 · 27 de novembro">
                <span className="nm-nota nb-vazio">—</span>
              </ListItem>
              <ListItem title="Seminário" detail="vale 1,0 · sem data">
                <span className="nm-nota nb-vazio">—</span>
              </ListItem>
            </div>
            <div className="nm-pe">
              <Button variant="primary" shortcut="Alt N">
                Nova avaliação
              </Button>
              <span className="nb-apoio">Enter na avaliação lança a nota</span>
            </div>
          </Block>
          <Block id="nm.preciso" title="Quanto preciso tirar" tools={<Meta />} fixed="none">
            <div className="nm-preciso">
              <div className="nm-alvo">
                <b className="nm-grande">4,9</b>
                <div className="nb-pilha">
                  <span>de 7,0 no 4º bimestre</span>
                  <span className="nb-apoio">para fechar o ano em 7,0</span>
                </div>
              </div>
              <div className="nm-conta">
                <span>Fechar o 2º semestre em 7,0</span>
                <b>5,2</b>
              </div>
              <div className="nm-conta">
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

export function NotasTela() {
  const v = pedido.get('v');
  return (
    <>
      {v !== 'materia' && <Geral />}
      {v !== 'geral' && <PorMateria />}
    </>
  );
}
