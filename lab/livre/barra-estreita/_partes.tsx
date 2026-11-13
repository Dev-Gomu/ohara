// Barra de formatação (D145) no cabeçalho do bloco Anotações (D146, V1) quando o bloco estreita.
// Ícones do conjunto aprovado (D147). A barra mostra o que cabe, na ordem de prioridade; o resto vai para um menu.
// V1 "junto": o que sobra entra no topo do menu Aa (um botão só). V2 "bandeja": botão » próprio abre só os ícones que sobraram.
import { useState, type ReactNode } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import { fable } from '../icones-formatacao/fable';
import './barra.css';

const IC = fable(2);
const Ic = ({ id, children }: { id?: string; children?: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {id ? IC[id] : children}
  </svg>
);

// Ordem de prioridade: os primeiros ficam na barra por mais tempo.
const BARRA: [string, string][] = [
  ['titulo', 'Título'],
  ['negrito', 'Negrito'],
  ['italico', 'Itálico'],
  ['marca', 'Marca-texto'],
  ['topicos', 'Lista com tópicos'],
  ['numerada', 'Lista numerada'],
  ['tabela', 'Tabela'],
  ['sobre', 'Sobrescrito / Subscrito'],
  ['desfazer', 'Desfazer'],
];
const ESTILOS: [string, string][] = [
  ['sublinhado', 'Sublinhado'],
  ['tachado', 'Tachado'],
  ['link', 'Link'],
  ['tarefas', 'Tarefas'],
  ['recuo1', 'Recuar mais'],
  ['recuo2', 'Recuar menos'],
  ['citacao', 'Citação'],
  ['codigo', 'Código'],
  ['linha', 'Divisória'],
  ['limpar', 'Limpar'],
  ['refazer', 'Refazer'],
];

export type Modelo = 'junto' | 'bandeja';
type Aberto = 'aa' | 'sobra' | null;

// Quantos botões cabem: largura do bloco menos caderno, ⋮ e margens; cada botão ocupa 36 + 2 de vão.
function vagas(largura: number): number {
  return Math.floor((largura - 24 - 26 - 40 + 2) / 38);
}

export function Bloco({
  modelo,
  largura,
  altura,
  aberto: inicial,
}: {
  modelo: Modelo;
  largura: number;
  altura: number;
  aberto: Aberto;
}) {
  const [ligados, setLigados] = useState(['negrito']);
  const [aberto, setAberto] = useState<Aberto>(inicial);
  const alterna = (id: string) =>
    setLigados((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const n = vagas(largura);
  const tudoCabe = n >= BARRA.length + 1;
  // Fixos no fim da barra: Aa (sempre) e, na bandeja, o botão » quando algo sobra.
  const fixos = tudoCabe ? 1 : modelo === 'bandeja' ? 2 : 1;
  const visiveis = tudoCabe ? BARRA : BARRA.slice(0, Math.max(0, n - fixos));
  const sobra = BARRA.slice(visiveis.length);

  const botao = ([id, nome]: [string, string]) => (
    <button
      key={id}
      type="button"
      className="be-b"
      aria-pressed={ligados.includes(id)}
      aria-label={nome}
      title={nome}
      onClick={() => alterna(id)}
    >
      <Ic id={id} />
    </button>
  );
  const linha = ([id, nome]: [string, string]) => (
    <button
      key={id}
      type="button"
      role="menuitem"
      className="be-linha"
      aria-pressed={ligados.includes(id)}
      onClick={() => alterna(id)}
    >
      <Ic id={id} />
      <span>{nome}</span>
    </button>
  );

  return (
    <section
      className={`${bloco.bloco} be-bloco`}
      data-foco="dentro"
      aria-label="Anotações"
      style={{ width: largura, height: altura }}
    >
      <header className="be-cab">
        <span className="be-caderno">
          <Ic id="caderno" />
        </span>
        <span className="be-barra" role="toolbar" aria-label="Formatação">
          {visiveis.map(botao)}
          {modelo === 'bandeja' && sobra.length > 0 && (
            <button
              type="button"
              className="be-b"
              aria-expanded={aberto === 'sobra'}
              aria-label={`Mais ${sobra.length} botões da barra`}
              title="O que não coube"
              onClick={() => setAberto(aberto === 'sobra' ? null : 'sobra')}
            >
              <Ic>
                <path d="M6.5 7l5 5-5 5M12.5 7l5 5-5 5" />
              </Ic>
            </button>
          )}
          <button
            type="button"
            className="be-b"
            aria-expanded={aberto === 'aa'}
            aria-label="Mais estilos"
            title="Mais estilos"
            onClick={() => setAberto(aberto === 'aa' ? null : 'aa')}
          >
            <Ic id="aa" />
          </button>
        </span>
        <button
          type="button"
          className="be-b be-opcoes"
          aria-label="Opções de Anotações"
          title="Opções"
        >
          <Ic id="mais" />
        </button>

        {aberto === 'sobra' && (
          <div className="be-menu be-bandeja" role="menu" aria-label="O que não coube na barra">
            {sobra.map(botao)}
          </div>
        )}
        {aberto === 'aa' && (
          <div className="be-menu" role="menu" aria-label="Mais estilos">
            {modelo === 'junto' && sobra.length > 0 && (
              <>
                <div className="be-fileira">{sobra.map(botao)}</div>
                <div className="be-vao" />
              </>
            )}
            <div className="be-lista">{ESTILOS.map(linha)}</div>
          </div>
        )}
      </header>
      <div className={mesa.editor}>
        <div className={mesa.texto}>
          <h2>Tipo I (imediata)</h2>
          <p>
            O alérgeno liga a <b>IgE</b> presa ao mastócito e provoca a degranulação. A concentração
            de Ca<sup>2+</sup> sobe dentro da célula.
          </p>
          <ul>
            <li>Fase imediata: minutos.</li>
            <li>Fase tardia: 6 a 24 horas.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Pagina({ modelo }: { modelo: Modelo }) {
  const menu: Aberto = modelo === 'junto' ? 'aa' : 'sobra';
  return (
    <div className="be-pagina">
      <div className="be-fila">
        <Amostra titulo="Bloco largo (640): tudo cabe">
          <Bloco modelo={modelo} largura={640} altura={190} aberto={null} />
        </Amostra>
        <Amostra titulo="Bloco médio (440)">
          <Bloco modelo={modelo} largura={440} altura={190} aberto={null} />
        </Amostra>
      </div>
      <div className="be-fila">
        <Amostra titulo="Estreito (320), fechado">
          <Bloco modelo={modelo} largura={320} altura={500} aberto={null} />
        </Amostra>
        <Amostra titulo={modelo === 'junto' ? 'Estreito, menu Aa aberto' : 'Estreito, » aberto'}>
          <Bloco modelo={modelo} largura={320} altura={500} aberto={menu} />
        </Amostra>
        {modelo === 'bandeja' && (
          <Amostra titulo="Estreito, Aa aberto">
            <Bloco modelo={modelo} largura={320} altura={500} aberto="aa" />
          </Amostra>
        )}
      </div>
    </div>
  );
}

function Amostra({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="be-amostra">
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}
