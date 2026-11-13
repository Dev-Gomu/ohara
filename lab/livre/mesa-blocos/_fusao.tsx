// Rodada 5 (13/11): refeita com a leitura certa. O ☰ da referência é o botão do menu de estilos (hoje o Aa), NÃO o ícone do bloco.
// O bloco Anotações ganha o ícone de caderno (sem caneta). A barra é a decidida em D145 (barra-8, V2).
// V1: minimalista, ícone + barra na mesma linha (fundida). V2: faixa aninhada sem ícone (D142). V3: ícone + barra fundida numa pílula.
import { useState } from 'react';
import { LUCIDE } from '../icones-formatacao/lucide';
import {
  Abas,
  Caixa,
  CartoesCorpo,
  Icone,
  INFO,
  Key,
  Mais,
  Nota,
  Passos,
  SalvarBtn,
  Slide,
  Tela,
  estado,
  BARRA,
  MODO,
  TOQUE,
  mesa,
  type Id,
} from './_partes';

type Forma = 'fundida' | 'faixa' | 'pilula';

const BOTOES: [string, string][] = [
  ['Título', 'heading'],
  ['Negrito', 'bold'],
  ['Itálico', 'italic'],
  ['Marca-texto', 'highlighter'],
  ['Lista com tópicos', 'list'],
  ['Lista numerada', 'list-ordered'],
  ['Tabela', 'table'],
  ['Sobrescrito', 'superscript'],
  ['Desfazer', 'undo-2'],
  ['Mais estilos', 'a-large-small'],
];

const Ic = ({ nome }: { nome: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {LUCIDE[nome]}
  </svg>
);

function Ferramentas({ comAcoes }: { comAcoes: boolean }) {
  const [liga, setLiga] = useState(['Negrito']);
  const alterna = (n: string) =>
    setLiga((v) => (v.includes(n) ? v.filter((x) => x !== n) : [...v, n]));
  return (
    <span className="mb-barra" role="toolbar" aria-label="Formatação">
      {BOTOES.map(([nome, ic]) => (
        <button
          key={nome}
          type="button"
          className="mb-fb"
          aria-pressed={liga.includes(nome)}
          aria-label={nome}
          title={nome}
          onClick={() => alterna(nome)}
        >
          <Ic nome={ic} />
        </button>
      ))}
      {comAcoes && (
        <span className="mb-fim-barra">
          <button type="button" className="mb-fb" aria-label="Ampliar bloco" title="Ampliar">
            <Ic nome="maximize-2" />
          </button>
          <button type="button" className="mb-fb" aria-label="Opções de Anotações" title="Opções">
            <Ic nome="ellipsis-vertical" />
          </button>
        </span>
      )}
    </span>
  );
}

const Caderno = () => (
  <span className="mb-icone">
    <Ic nome="notebook" />
  </span>
);

function Cab({ id, meio, forma }: { id: Id; meio?: React.ReactNode; forma: Forma }) {
  const e = estado(id);
  if (id === 'notas') {
    const ativo = e === 'dentro' || BARRA;
    if (forma === 'faixa') {
      return (
        <header className="mb-faixa-ninho">
          {ativo ? (
            <Ferramentas comAcoes />
          ) : (
            <>
              <Caderno />
              <span className="mb-nome">{INFO.notas.nome}</span>
              <span className="mb-fim">{TOQUE && <Mais id={id} />}</span>
            </>
          )}
        </header>
      );
    }
    return (
      <header className={`mb-fino mb-folga ${forma === 'pilula' ? 'mb-j3' : 'mb-j1'}`}>
        <Caderno />
        {ativo ? (
          <Ferramentas comAcoes={false} />
        ) : (
          <span className="mb-nome">{INFO.notas.nome}</span>
        )}
        <span className="mb-fim">{(ativo || e !== 'fora' || TOQUE) && <Mais id={id} />}</span>
      </header>
    );
  }
  return (
    <header className={`mb-fino mb-folga ${forma === 'pilula' ? 'mb-j3' : 'mb-j1'}`}>
      <Icone id={id} />
      <span className="mb-nome">{INFO[id].nome}</span>
      {meio}
      <span className="mb-fim">
        {id === 'cartoes' && MODO === 'novo' && (
          <span className="mb-salvar-topo">
            <SalvarBtn />
          </span>
        )}
        {e !== 'fora' && <Key>{INFO[id].tecla.replace('Alt ', '')}</Key>}
        {(e !== 'fora' || TOQUE) && <Mais id={id} />}
      </span>
    </header>
  );
}

export function Fusao({ forma }: { forma: Forma }) {
  return (
    <Tela>
      <Caixa id="slides">
        <Cab
          id="slides"
          forma={forma}
          meio={
            <span className="mb-meio">
              <Passos grande={TOQUE} />
            </span>
          }
        />
        <div className={mesa.pagina}>
          <Slide />
        </div>
      </Caixa>
      <Caixa id="cartoes">
        <Cab
          id="cartoes"
          forma={forma}
          meio={
            <span className="mb-meio">
              <Abas />
            </span>
          }
        />
        <CartoesCorpo />
      </Caixa>
      <Caixa id="notas">
        <Cab id="notas" forma={forma} />
        <Nota />
      </Caixa>
    </Tela>
  );
}
