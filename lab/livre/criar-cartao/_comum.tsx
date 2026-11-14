import { useState, type ReactNode } from 'react';
import './cc.css';

export type Estado = 'vazio' | 'simples' | 'cloze';
export const FRASE = 'A {{c1::IL-6}} induz a síntese de PCR no fígado, e a {{c2::IL-1}} causa febre.';
export const PERGUNTA = 'Qual citocina induz a síntese de PCR no fígado?';
export const VERSO: [string, string[]][] = [['Resposta', ['IL-6, produzida por macrófagos ativados', 'Age nos hepatócitos']]];

/** Texto cru: as lacunas {{cN::x}} viram pílula e o cursor aparece no fim. */
export function Cru({ texto, cursor = true }: { texto: string; cursor?: boolean }) {
  const partes = texto.split(/(\{\{c\d+::.+?\}\})/g);
  return (
    <span className="cc-cru">
      {partes.map((p, i) => (/^\{\{c\d+::/.test(p) ? <span key={i} className="cc-lac">{p}</span> : <span key={i}>{p}</span>))}
      {cursor && <i className="cc-cursor" />}
    </span>
  );
}

export function VersoSimples() {
  return (
    <div className="cc-verso">
      {VERSO.map(([t, itens]) => (
        <div key={t}>
          <h3>{t}</h3>
          {itens.map((x) => <p key={x}>• {x}</p>)}
        </div>
      ))}
    </div>
  );
}

export function Palco({ titulo, children, inicial = 'cloze' }: { titulo: string; children: (e: Estado) => ReactNode; inicial?: Estado }) {
  const [e, setE] = useState<Estado>(() => (new URLSearchParams(location.search).get('estado') as Estado | null) ?? inicial);
  return (
    <section className="cc">
      <div className="cc-topo">
        <h2>{titulo}</h2>
        <div className="cc-estados" role="group" aria-label="Estado mostrado">
          {(['vazio', 'simples', 'cloze'] as Estado[]).map((x) => (
            <button key={x} data-on={e === x} onClick={() => setE(x)}>{x === 'vazio' ? 'Cartão vazio' : x === 'simples' ? 'Escrevendo simples' : 'Escrevendo cloze'}</button>
          ))}
        </div>
      </div>
      {children(e)}
      <div className="cc-rodape">
        <span>Ctrl Enter salva · Alt N cartão novo</span>
        <button className="cc-salvar">Salvar</button>
      </div>
    </section>
  );
}
