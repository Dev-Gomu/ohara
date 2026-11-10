// Mesa: alternadores de bloco (barra do topo) e abas dentro do bloco (Cartões: Novo, Salvos).
// Rodada 2: misturas da A (ilha com teclas) com a B (interruptor por marca).
// Estado: Slides e Anotações abertos, Cartões fechado; cursor em Cartões. Aba atual: Novo.
import { Key } from '../../src/ui/components/Key';
import { Amostra, Ficha, Secao } from '../vitrine/moldura';

type Versao = 'ab1' | 'ab2' | 'ab3';

const USO: Record<Versao, string> = {
  ab1: 'Ilha, marca e tecla. Aberto: fundo de escolhido e marca cheia. Fechado: marca só no contorno.',
  ab2: 'Ilha sem fundo no aberto. Só a marca cheia e o texto pleno dizem que está aberto; abas em trilho.',
  ab3: 'A tecla é a marca. Aberto: fundo de escolhido e tecla cheia de ação. Fechado: tecla vazada.',
};

const BLOCOS = [
  { nome: 'Slides', tecla: 'S', aberto: true },
  { nome: 'Anotações', tecla: 'A', aberto: true },
  { nome: 'Cartões', tecla: 'C', aberto: false },
];

function Alternadores({ v }: { v: Versao }) {
  return (
    <div className={`b-alt b-ilha b-${v}`} role="group" aria-label="Blocos">
      {BLOCOS.map((b) => (
        <button
          key={b.nome}
          type="button"
          tabIndex={-1}
          className="b-item"
          aria-pressed={b.aberto}
          data-sel={b.aberto}
          data-cursor={b.nome === 'Cartões' ? '' : undefined}
        >
          {v !== 'ab3' && <i className="b-marca" />}
          {b.nome}
          <Key>{b.tecla}</Key>
        </button>
      ))}
    </div>
  );
}

function Abas({ v }: { v: Versao }) {
  return (
    <div className={`b-abas b-ilha b-${v}`} role="tablist">
      {[
        { nome: 'Novo', n: undefined, atual: true },
        { nome: 'Salvos', n: 12, atual: false },
      ].map((a) => (
        <button
          key={a.nome}
          type="button"
          tabIndex={-1}
          role="tab"
          className="b-aba"
          aria-selected={a.atual}
          data-sel={a.atual}
        >
          {a.nome}
          {a.n !== undefined && <span className="b-num">{a.n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Blocos() {
  return (
    <>
      <Secao>3. Alternadores e abas de bloco (Mesa): misturas de A e B</Secao>
      {(['ab1', 'ab2', 'ab3'] as const).map((v) => (
        <Ficha key={v} nome={`Blocos ${v.toUpperCase()}`} arquivo="Mesa" largura={4} uso={USO[v]}>
          <Amostra estado="alternadores no topo (cursor em Cartões, fechado)">
            <Alternadores v={v} />
          </Amostra>
          <Amostra estado="abas do bloco Cartões">
            <Abas v={v} />
          </Amostra>
        </Ficha>
      ))}
    </>
  );
}
