// Bancada "icones-formatacao": o conjunto de ícones da barra, do menu Aa e do bloco Anotações.
// Linguagem do app (BlockIcon): grade 24, traço arredondado, cantos de 2. Tudo desenhado na mesma grade, com 3 de margem.
// (texto antigo) V1: traço 2, letras desenhadas (igual aos ícones de bloco). V2: traço 1,75, mais fino. V3: traço 2, letras em fonte (Nunito) em vez de desenho.
import { useState } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import { fable } from './fable';
import { LUCIDE } from './lucide';
import './icones.css';

export type Modo = 'v1' | 'v2' | 'v3';
const TRACO: Record<Modo, number> = { v1: 2, v2: 1.75, v3: 2 };
// Rodada do Fable (D147): V1 e V2 são o conjunto novo; V3 é o Lucide, para comparar.

// [nome, id, nome do ícone no Lucide]
export const BARRA: [string, string, string][] = [
  ['Título', 'titulo', 'heading'],
  ['Negrito', 'negrito', 'bold'],
  ['Itálico', 'italico', 'italic'],
  ['Marca-texto', 'marca', 'highlighter'],
  ['Lista com tópicos', 'topicos', 'list'],
  ['Lista numerada', 'numerada', 'list-ordered'],
  ['Tabela', 'tabela', 'table'],
  ['Sobrescrito', 'sobre', 'superscript'],
  ['Subscrito', 'sub', 'subscript'],
  ['Desfazer', 'desfazer', 'undo-2'],
  ['Mais estilos', 'aa', 'a-large-small'],
  ['Ampliar', 'expandir', 'maximize-2'],
  ['Opções', 'mais', 'ellipsis-vertical'],
];

export const MENU: [string, string, string][] = [
  ['Sublinhado', 'sublinhado', 'underline'],
  ['Tachado', 'tachado', 'strikethrough'],
  ['Link', 'link', 'link'],
  ['Lista de tarefas', 'tarefas', 'list-todo'],
  ['Aumentar recuo', 'recuo1', 'indent-increase'],
  ['Diminuir recuo', 'recuo2', 'indent-decrease'],
  ['Citação', 'citacao', 'quote'],
  ['Código', 'codigo', 'code'],
  ['Linha divisória', 'linha', 'minus'],
  ['Limpar formatação', 'limpar', 'remove-formatting'],
  ['Refazer', 'refazer', 'redo-2'],
  ['Bloco Anotações (caderno)', 'caderno', 'notebook'],
];

export function Icone({ id, modo }: { id: string; nome?: string; modo: Modo }) {
  const par = [...BARRA, ...MENU].find((x) => x[1] === id)!;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={TRACO[modo]} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {modo === 'v3' ? LUCIDE[par[2]] : (fable(TRACO[modo])[id] ?? LUCIDE[par[2]])}
    </svg>
  );
}

export function Pagina({ modo }: { modo: Modo }) {
  const [liga, setLiga] = useState(['negrito', 'marca']);
  const alterna = (id: string) =>
    setLiga((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const barra = BARRA.filter(([, id]) => id !== 'sub');
  return (
    <div className="ic-pagina">
      <h3>Na barra, em tamanho real</h3>
      <section className={`${bloco.bloco} ic-janela`} data-foco="dentro">
        <div className="ic-faixa" role="toolbar" aria-label="Formatação">
          {barra.map(([nome, id], i) => (
            <span
              key={id}
              className="ic-grupo"
              data-fim={id === 'mais' || id === 'expandir' ? id : undefined}
              data-pos={i}
            >
              <button
                type="button"
                className="ic-b"
                aria-pressed={liga.includes(id)}
                aria-label={nome}
                title={nome}
                onClick={() => alterna(id)}
              >
                <Icone id={id} modo={modo} />
              </button>
            </span>
          ))}
        </div>
        <div className={mesa.editor}>
          <div className={mesa.texto}>
            <h2>Tipo I (imediata)</h2>
            <p>
              O alérgeno liga a <b>IgE</b> presa ao mastócito.
            </p>
          </div>
        </div>
      </section>
      <h3>Na grade (guias: margem de 3, centro e meio)</h3>
      <div className="ic-grade">
        {[...BARRA, ...MENU].map(([nome, id]) => (
          <figure key={id} className="ic-cel">
            <span className="ic-guia">
              <Icone id={id} modo={modo} />
            </span>
            <figcaption>{nome}</figcaption>
          </figure>
        ))}
      </div>
      <h3>Menu Aa (ícone + nome)</h3>
      <div className="ic-menu" role="menu">
        {MENU.slice(0, 11).map(([nome, id]) => (
          <button key={id} type="button" role="menuitem">
            <Icone id={id} modo={modo} />
            <span>{nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
