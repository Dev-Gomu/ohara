// Bancada "anexo-imagem": como indicar que o cartão tem imagens anexadas, na frente e no verso (inspirado no app antigo).
// Três casos na mesma página: sem imagem, uma na frente e duas no verso, e muitas. Clique para abrir e fechar.
import { useState, type ReactNode } from 'react';
import { CardBack, Inline } from '../../../src/ui/components/CardBack';
import './anexo.css';

export const FRENTE = 'Quem libera IL-6?';
export const VERSO = '# Efeitos\n- Febre\n- ↑ PCR no fígado\n# Origem\nMacrófago ativado';

export const Icone = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  </svg>
);

export const Mais = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const Xis = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
);

// Miniaturas de mentira: blocos chapados nas cores de matéria, sem gradiente.
const TONS = [2, 0, 3, 1, 4];
export function Mini({ i, tam }: { i: number; tam: number }) {
  return (
    <span className="ai-mini" style={{ width: tam * 1.4, height: tam, background: `var(--cor-materia-${TONS[i % 5]})` }}>
      <svg viewBox="0 0 28 20" width="60%" height="60%" fill="none" stroke="var(--cor-tinta)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" aria-hidden="true">
        <path d="M2 17 9 9l5 5 4-4 8 8" /><circle cx="20" cy="5" r="2" />
      </svg>
    </span>
  );
}

export const IconeMais = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 5h6M19 2v6" /><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /><circle cx="9" cy="9" r="2" />
  </svg>
);

/** Ícone discreto de "anexar imagem", mostrado quando o lado do cartão ainda não tem imagem. */
export const Vazio = ({ lado, onClick }: { lado: 'frente' | 'verso'; onClick?: () => void }) => (
  <button type="button" className={`ai-vazio ai-vazio-${lado}`} aria-label={`Anexar imagem na ${lado}`} onClick={onClick}>
    <IconeMais />
  </button>
);

export interface Caso { nome: string; f: number; v: number; aberto: Lado | null }
export type Lado = 'frente' | 'verso';
export const CASOS: Caso[] = [
  { nome: 'Sem imagem', f: 0, v: 0, aberto: null },
  { nome: 'Uma na frente, duas no verso', f: 1, v: 2, aberto: 'verso' },
  { nome: 'Muitas (4 na frente, 6 no verso)', f: 4, v: 6, aberto: 'frente' },
];

/** Cartão com encaixes: no topo da faixa, embaixo da pergunta (na faixa) e no fim do verso. */
export function Cartao({ topo, naFaixa, noVerso }: { topo?: ReactNode; naFaixa?: ReactNode; noVerso?: ReactNode }) {
  return (
    <article className="ai-card">
      <div className="ai-frente">
        <div className="ai-linha-frente">
          <span className="ai-rotulo-frente"><Inline text={FRENTE} /></span>
          {topo}
        </div>
        {naFaixa}
      </div>
      <div className="ai-verso">
        <CardBack back={VERSO} compact />
        {noVerso}
      </div>
    </article>
  );
}

export const plural = (n: number) => (n === 1 ? '1 imagem' : `${n} imagens`);

/** Linha do cartão na lista de salvos (D151), com o espaço do indicador à direita. */
export function Linha({ marca }: { marca?: ReactNode }) {
  return (
    <div className="ai-linha">
      <span className="ai-num">2</span>
      <span className="ai-textos">
        <b>Citocina que induz PCR no fígado</b>
        <span>IL-6</span>
      </span>
      {marca}
    </div>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="ai-secao">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}
