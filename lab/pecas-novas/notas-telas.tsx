// Notas, degrau 4: telas inteiras só com as peças aprovadas (D121 a D124).
// ?peca=notastelas&v=geral|materia|travado|semcofre|vazia|erro  &foco=regua  &tema=escuro  &larg=820 (tablet)
import { useEffect, useState, type ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { Field } from '../../src/ui/components/Controls';
import { FilterChip } from '../../src/ui/components/Filter';
import { StatePill } from '../../src/ui/components/Pill';
import { Meta } from './notas-pecas';
import { Barra } from './notas-tela';
import { Cabecalho, LinhaBoletim, ROWS, media } from './notas-compostas';
import { Aval, av, converte, fracao, vezes } from './notas-compostas-disc';
import type { Bim } from './notas-compostas-disc';
import { Quanto, Resumo } from './notas-compostas-resumo';
import { De, META, fmt } from './notas-comp-base';
import './notas-pecas.css';
import './notas-compostas.css';
import './notas-tela.css';
import './notas-telas.css';

const pedido = new URLSearchParams(location.search);
const foco = pedido.get('foco') === 'regua';
const larg = pedido.get('larg');

const BIMS: Bim[] = [
  { nome: '1º bim.', vale: 3, avals: [av('Prova', 1.6, 2), av('Relatório', 0.4, 1)] },
  { nome: '2º bim.', vale: 7, avals: [av('Prova teórica', 3.2, 5), av('Prova prática', 1.4, 2)] },
  { nome: '3º bim.', vale: 3, avals: [av('Prova', 1.9, 3)] },
  {
    nome: '4º bim.',
    vale: 7,
    avals: [
      av('Prova teórica', null, 4),
      av('Prova prática', null, 2),
      av('Seminário', null, 1),
      av('Estudo dirigido 1', null, 0.5),
      av('Estudo dirigido 2', null, 0.5),
      av('Estudo dirigido 3', null, 0.5),
      av('Relatório de aula prática', null, 0.5),
      av('Participação', null, 0.5),
    ],
  },
];
const FOCO = 3;

function Regua({ atual }: { atual: string | null }) {
  return (
    <Block id="nt.regua" fixed={foco ? 'inside' : 'none'}>
      <div className="nb-regua">
        <FilterChip selected={atual === null} cursor={foco && atual === null}>
          Boletim geral
        </FilterChip>
        {ROWS.map((r) => (
          <FilterChip
            key={r.code}
            subject={r.cor}
            selected={atual === r.code}
            cursor={foco && atual === r.code}
          >
            {`${r.code}  ${fmt(media(r))}`}
          </FilterChip>
        ))}
        <div className="nb-busca">
          <Field label="Buscar matéria" shortcut="/" />
        </div>
      </div>
    </Block>
  );
}

function Moldura({ v, children }: { v: string; children: ReactNode }) {
  return (
    <div className="hz-app nb-app" style={larg ? { width: `${larg}px` } : undefined}>
      <Barra />
      <div className="nb-tela" data-v={v}>
        {children}
      </div>
    </div>
  );
}

function Geral() {
  return (
    <Moldura v="geral">
      <Regua atual={null} />
      <Block
        id="nt.boletim"
        title="Boletim geral"
        count={`${ROWS.length} matérias`}
        fixed={foco ? 'none' : 'inside'}
        tools={<Meta v="a" />}
      >
        <div className="nt-rola">
          <div className="nc-boletim" data-v="c">
            <Cabecalho v="c" />
            {ROWS.map((r) => (
              <LinhaBoletim key={r.code} r={r} v="c" cursor={!foco && r.code === 'IMU'} />
            ))}
          </div>
          <p className="nb-apoio">
            Tudo de 0 a 10. Enter abre a disciplina; pesos e pontos ficam lá dentro.
          </p>
        </div>
      </Block>
    </Moldura>
  );
}

const Marca = ({ se }: { se: boolean }) => (se ? <i className="np-marca" /> : null);

// Bimestre como seletor: não lista avaliações, só diz quanto vale e quanto já fez.
function Ficha({ b, sel, cursor }: { b: Bim; sel: boolean; cursor: boolean }) {
  const fr = fracao(b);
  const pts = vezes(fr, b.vale);
  return (
    <div className="nt-ficha" data-sel={sel ? '' : undefined} data-cursor={cursor ? '' : undefined}>
      <div className="nc-cartao-topo">
        <b>{b.nome}</b>
        <small className="nc-de">vale {fmt(b.vale)}</small>
      </div>
      <div className="nc-cartao-num" data-pendente={pts === null ? '' : undefined}>
        <Marca se={fr !== null && fr < META / 10} />
        <b>{fmt(pts)}</b>
        {converte(b) && fr !== null && <small className="nc-de">nota {fmt(fr * 10)}</small>}
      </div>
    </div>
  );
}

function Semestre({ n, total, children }: { n: 1 | 2; total: number | null; children: ReactNode }) {
  return (
    <div className="nt-sem">
      <span className="nt-sem-nome">{n}º semestre</span>
      <div className="nt-sem-fichas">
        {children}
        <div className="nt-total">
          <small className="nc-de">Total</small>
          <b>{fmt(total)}</b>
          <De v={10} />
        </div>
      </div>
    </div>
  );
}

function ListaAval({ b }: { b: Bim }) {
  return (
    <Block
      id="nt.avaliacoes"
      title={`Avaliações do ${b.nome}`}
      count={`${b.avals.length} · vale ${fmt(b.vale)}`}
      fixed={foco ? 'none' : 'inside'}
      tools={<Button variant="primary" shortcut="Alt N">Nova avaliação</Button>}
    >
      <div className="nt-lista">
        {b.avals.map((x, i) => (
          <Aval key={x.nome} v="a" x={x} {...(!foco && i === 1 && { modo: 'cursor' as const })} />
        ))}
      </div>
    </Block>
  );
}

function Lado() {
  return (
    <div className="nt-lado">
      <Block id="nt.resumo" title="Resumo" fixed="none">
        <div className="nt-pad">
          <Resumo v="b" />
        </div>
      </Block>
      <Block id="nt.preciso" title="Quanto preciso tirar" fixed="none">
        <div className="nt-pad">
          <Quanto v="c" c={{ tipo: 'numero', pts: 4.9, vale: 7 }} />
        </div>
      </Block>
    </div>
  );
}

// Versão 1: bimestres em faixas por semestre, no alto; a lista do bimestre em foco embaixo.
function Materia1() {
  const f = (i: number) => <Ficha key={i} b={BIMS[i]!} sel={i === FOCO} cursor={foco ? false : i === FOCO && false} />;
  return (
    <Moldura v="materia">
      <Regua atual="IMU" />
      <div className="nt-m1">
        <Block id="nt.faixas" title="Imunologia" count="esquema 3 + 7" fixed="none" menu>
          <div className="nt-faixas">
            <Semestre n={1} total={7.1}>
              {f(0)}
              {f(1)}
            </Semestre>
            <Semestre n={2} total={null}>
              {f(2)}
              {f(3)}
            </Semestre>
          </div>
        </Block>
        <ListaAval b={BIMS[FOCO]!} />
        <Lado />
      </div>
    </Moldura>
  );
}

// Versão 2: bimestres empilhados à esquerda (como uma régua vertical); lista no meio e contas à direita.
function Materia2() {
  return (
    <Moldura v="materia">
      <Regua atual="IMU" />
      <div className="nt-m2">
        <Block id="nt.bimestres" title="Bimestres" fixed="none">
          <div className="nt-pilha">
            {BIMS.map((b, i) => (
              <Ficha key={b.nome} b={b} sel={i === FOCO} cursor={false} />
            ))}
          </div>
        </Block>
        <ListaAval b={BIMS[FOCO]!} />
        <Lado />
      </div>
    </Moldura>
  );
}

function Aviso({ titulo, texto, acoes }: { titulo: string; texto: string; acoes: string[] }) {
  return (
    <Moldura v="vazio">
      <Block id="nt.aviso" title={titulo} fixed="inside">
        <div className="nt-aviso">
          <p>{texto}</p>
          {acoes.map((a, i) => (
            <Button key={a} variant={i === 0 ? 'primary' : 'quiet'}>
              {a}
            </Button>
          ))}
        </div>
      </Block>
    </Moldura>
  );
}

function Erro() {
  return (
    <Moldura v="erro">
      <Regua atual="IMU" />
      <Block id="nt.erro" title="Imunologia" fixed="inside">
        <div className="nt-aviso">
          <StatePill state="atencao">2 registros não abriram</StatePill>
          <p>
            Esta chave não consegue ler 2 avaliações. Elas foram deixadas de fora da conta e
            continuam guardadas. Se você trocou a frase de acesso, abra com a frase antiga.
          </p>
          <Button variant="primary">Ver as outras avaliações</Button>
        </div>
      </Block>
    </Moldura>
  );
}

const ORDEM = ['geral', 'materia', 'materia2', 'erro', 'travado', 'semcofre', 'vazia'];

export function NotasTelas() {
  const [v, setV] = useState(pedido.get('v') ?? 'geral');
  useEffect(() => {
    const ir = (e: KeyboardEvent) => {
      const passo = e.code === 'ArrowRight' ? 1 : e.code === 'ArrowLeft' ? -1 : 0;
      if (!passo || e.altKey || e.ctrlKey || e.metaKey) return;
      setV((atual) => {
        const prox = ORDEM[(ORDEM.indexOf(atual) + passo + ORDEM.length) % ORDEM.length] ?? 'geral';
        pedido.set('v', prox);
        history.replaceState(null, '', `?${pedido.toString()}`);
        return prox;
      });
    };
    document.addEventListener('keydown', ir);
    return () => document.removeEventListener('keydown', ir);
  }, []);
  if (v === 'materia') return <Materia1 />;
  if (v === 'materia2') return <Materia2 />;
  if (v === 'erro') return <Erro />;
  if (v === 'travado')
    return (
      <Aviso
        titulo="Notas do boletim"
        texto="As notas estão travadas. Elas se travam sozinhas depois de 2 minutos sem uso."
        acoes={['Abrir com a frase', 'Abrir com o PIN', 'Esqueci a frase: usar o código']}
      />
    );
  if (v === 'semcofre')
    return (
      <Aviso
        titulo="Notas do boletim"
        texto="As notas ficam cifradas: só abrem com a sua frase de acesso, e nunca aparecem na Agenda, no Hub nem na Mesa."
        acoes={['Criar a frase de acesso']}
      />
    );
  if (v === 'vazia')
    return (
      <Aviso
        titulo="Boletim geral"
        texto="Ainda não há matérias neste ano. Crie uma matéria no Acervo e as notas aparecem aqui."
        acoes={['Ir para o Acervo']}
      />
    );
  return <Geral />;
}
