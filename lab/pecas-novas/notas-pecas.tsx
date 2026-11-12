// Notas, degrau 2 (peças simples isoladas): célula de nota, título de semestre, rótulo de coluna,
// campo de nota e ajuste da meta. Três versões de cada, com o cursor testado.
// ?peca=notaspecas, &so=celula|semestre|coluna|campo|meta mostra uma peça só.
import type { ReactNode } from 'react';
import { formatGrade } from '../../src/core/grades/grades';
import { Button } from '../../src/ui/components/Button';
import { StatePill } from '../../src/ui/components/Pill';
import { Amostra, Ficha, Linha, Secao } from '../vitrine/moldura';
import './notas-pecas.css';

type Versao = 'a' | 'b' | 'c';
const VERSOES = ['a', 'b', 'c'] as const;
const fmt = formatGrade;
const so = new URLSearchParams(location.search).get('so');

function Trio({
  nome,
  uso,
  children,
}: {
  nome: string;
  uso: Record<Versao, string>;
  children: (v: Versao) => ReactNode;
}) {
  return (
    <>
      {VERSOES.map((v) => (
        <Ficha key={v} nome={`${nome} ${v.toUpperCase()}`} arquivo="Notas" largura={4} uso={uso[v]}>
          {children(v)}
        </Ficha>
      ))}
    </>
  );
}

// ---------- 1. Célula de nota ----------
type Estado = 'normal' | 'baixa' | 'pendente' | 'total' | 'aberto';

function Celula({
  v,
  valor,
  estado = 'normal',
  cursor,
}: {
  v: Versao;
  valor: number | null;
  estado?: Estado;
  cursor?: boolean;
}) {
  return (
    <span className="np-cel" data-v={v} data-estado={estado} data-cursor={cursor ? '' : undefined}>
      {estado === 'baixa' && v !== 'a' && <i className="np-marca" />}
      {fmt(valor)}
    </span>
  );
}

const USO_CELULA: Record<Versao, string> = {
  a: 'Fundo. Abaixo da meta ganha fundo de atenção; o total fica em pílula de peça.',
  b: 'Marca. Abaixo da meta ganha a marca alongada, como a pílula de estado; o total é só letra de voz.',
  c: 'Mista. Marca para abaixo da meta e pílula de peça para o total.',
};

function Celulas() {
  return (
    <Trio nome="Célula" uso={USO_CELULA}>
      {(v) => (
        <Linha>
          <Amostra estado="Normal">
            <Celula v={v} valor={4.1} />
          </Amostra>
          <Amostra estado="Abaixo da meta">
            <Celula v={v} valor={2} estado="baixa" />
          </Amostra>
          <Amostra estado="Pendente">
            <Celula v={v} valor={null} estado="pendente" />
          </Amostra>
          <Amostra estado="Total">
            <Celula v={v} valor={7.9} estado="total" />
          </Amostra>
          <Amostra estado="Em aberto">
            <Celula v={v} valor={4.1} estado="aberto" />
          </Amostra>
          <Amostra estado="Com cursor">
            <Celula v={v} valor={2} estado="baixa" cursor />
          </Amostra>
        </Linha>
      )}
    </Trio>
  );
}

// ---------- 2. Título de semestre sobre os bimestres ----------
const USO_SEMESTRE: Record<Versao, string> = {
  a: 'Rótulo. O semestre é escrito como rótulo de bloco: caixa-alta apagada. Os bimestres ficam em letra de apoio.',
  b: 'Sem título. O nome do semestre vai na coluna do total, no lugar de "Total". Uma linha de cabeçalho a menos.',
  c: 'Na faixa. Título em letra de conteúdo, à esquerda, com "de 10.0" ao lado.',
};

function Semestre({ v }: { v: Versao }) {
  const linhas = [
    [4.1, 3.8, 7.9],
    [2, 4.6, 6.6],
  ] as const;
  return (
    <div className="np-sem" data-v={v}>
      {v === 'a' && <span className="np-sem-titulo">1º semestre</span>}
      {v === 'c' && (
        <span className="np-sem-titulo">
          1º semestre <small>de 10.0</small>
        </span>
      )}
      <div className="np-sem-grade">
        <span className="np-rot">1º bim.</span>
        <span className="np-rot">2º bim.</span>
        <span className="np-rot" data-total>
          {v === 'b' ? '1º sem.' : 'Total'}
        </span>
      </div>
      {linhas.map((l, i) => (
        <div key={i} className="np-sem-grade np-sem-linha" data-cursor={i === 1 ? '' : undefined}>
          <span>{fmt(l[0])}</span>
          <span>{fmt(l[1])}</span>
          <b>{fmt(l[2])}</b>
        </div>
      ))}
    </div>
  );
}

// ---------- 3. Rótulo de coluna (com o quanto vale) ----------
const USO_COLUNA: Record<Versao, string> = {
  a: 'Uma linha. Só o nome; quanto vale não aparece no rótulo.',
  b: 'Duas linhas. Nome em cima e "de 3.0" embaixo, menor.',
  c: 'Na mesma linha. Nome em letra de conteúdo e "de 3.0" apagado ao lado.',
};

function Coluna({
  v,
  nome,
  vale,
  valor,
}: {
  v: Versao;
  nome: string;
  vale?: number;
  valor: number;
}) {
  return (
    <div className="np-col" data-v={v}>
      <span className="np-col-rot">
        <span>{nome}</span>
        {v !== 'a' && vale !== undefined && <small>de {fmt(vale)}</small>}
      </span>
      <b className="np-col-valor">{fmt(valor)}</b>
    </div>
  );
}

function Colunas() {
  return (
    <Trio nome="Rótulo" uso={USO_COLUNA}>
      {(v) => (
        <>
          <Linha>
            <Coluna v={v} nome="1º bim." vale={3} valor={2.4} />
            <Coluna v={v} nome="2º bim." vale={7} valor={4.9} />
            <Coluna v={v} nome="Total" valor={7.3} />
            <Coluna v={v} nome="Falta no 4º bim." vale={7} valor={4.9} />
          </Linha>
          <p className="v-legenda">Não recebe cursor: é só texto.</p>
        </>
      )}
    </Trio>
  );
}

// ---------- 4. Campo de nota ----------
const USO_CAMPO: Record<Versao, string> = {
  a: 'Curto. Campo igual ao de busca, estreito; "de 3.0" fica fora, à direita.',
  b: 'Com o máximo dentro. "de 3.0" apagado dentro do campo.',
  c: 'Grande. Número em letra de voz e "de 3.0" embaixo, dentro do campo.',
};

function Campo({ v, texto, modo }: { v: Versao; texto: string; modo?: 'digitando' | 'cursor' }) {
  return (
    <span className="np-campo-par" data-v={v}>
      <span
        className="np-campo"
        data-viva={modo === 'digitando' ? '' : undefined}
        data-cursor={modo === 'cursor' ? '' : undefined}
      >
        <span className="np-campo-num" data-vazio={texto === '' ? '' : undefined}>
          {texto === '' && modo !== 'digitando' ? '—' : texto}
          {modo === 'digitando' && <i className="np-caret" />}
        </span>
        {v !== 'a' && <small>de 3.0</small>}
      </span>
      {v === 'a' && <small>de 3.0</small>}
    </span>
  );
}

function Campos() {
  return (
    <Trio nome="Campo de nota" uso={USO_CAMPO}>
      {(v) => (
        <Linha>
          <Amostra estado="Vazio">
            <Campo v={v} texto="" />
          </Amostra>
          <Amostra estado="Preenchido">
            <Campo v={v} texto="2.4" />
          </Amostra>
          <Amostra estado="Com cursor">
            <Campo v={v} texto="2.4" modo="cursor" />
          </Amostra>
          <Amostra estado="Digitando">
            <Campo v={v} texto="2," modo="digitando" />
          </Amostra>
          <Amostra estado="Acima do máximo: avisa, não bloqueia">
            <span className="np-aviso">
              <Campo v={v} texto="3.5" />
              <StatePill state="atencao">Acima de 3.0</StatePill>
            </span>
          </Amostra>
        </Linha>
      )}
    </Trio>
  );
}

// ---------- 5. Ajuste da meta ----------
const USO_META: Record<Versao, string> = {
  a: 'Ilha. Menos, número e mais dentro de uma pílula recuada, como as ilhas do topo.',
  b: 'Solto. Número em letra de voz e dois botões comuns.',
  c: 'Campo. O mesmo campo de nota: Enter e digita a meta. Sem botões.',
};

export function Meta({ v, cursor }: { v: Versao; cursor?: boolean }) {
  if (v === 'a') {
    return (
      <span className="np-meta" data-v="a">
        <span className="np-meta-nome">Meta</span>
        <button type="button" tabIndex={-1} className="np-passo" aria-label="Diminuir a meta">
          −
        </button>
        <b>7.0</b>
        <button
          type="button"
          tabIndex={-1}
          className="np-passo"
          aria-label="Aumentar a meta"
          data-cursor={cursor ? '' : undefined}
        >
          +
        </button>
      </span>
    );
  }
  if (v === 'b') {
    return (
      <span className="np-meta" data-v="b">
        <span className="np-meta-nome">Meta</span>
        <b>7.0</b>
        <Button label="Diminuir a meta">−</Button>
        <Button label="Aumentar a meta" {...(cursor && { cursor })}>
          +
        </Button>
      </span>
    );
  }
  return (
    <span className="np-meta" data-v="c">
      <span className="np-meta-nome">Meta</span>
      <span className="np-campo-par" data-v="a">
        <span className="np-campo" data-cursor={cursor ? '' : undefined}>
          <span className="np-campo-num">7.0</span>
        </span>
      </span>
    </span>
  );
}

function Metas() {
  return (
    <Trio nome="Meta" uso={USO_META}>
      {(v) => (
        <Linha>
          <Amostra estado="Normal">
            <Meta v={v} />
          </Amostra>
          <Amostra estado="Com cursor">
            <Meta v={v} cursor />
          </Amostra>
        </Linha>
      )}
    </Trio>
  );
}

const PECAS: [string, string, () => ReactNode][] = [
  ['celula', '1. Célula de nota', Celulas],
  [
    'semestre',
    '2. Título de semestre (sobre os bimestres)',
    () => (
      <Trio nome="Semestre" uso={USO_SEMESTRE}>
        {(v) => <Semestre v={v} />}
      </Trio>
    ),
  ],
  ['coluna', '3. Rótulo de coluna', Colunas],
  ['campo', '4. Campo de nota', Campos],
  ['meta', '5. Ajuste da meta', Metas],
];

export function NotasPecas() {
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
