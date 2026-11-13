// Partes comuns da bancada da barra de formatação. Só desenho; nada liga no teclado.
// Query extra: &foco=notas|fora (padrão notas) &estreito=1 (mostra também o bloco em 320 px) &sel=<ids> (ferramentas ativas).
import { useState, type ReactNode } from 'react';
import { Nota, Caixa, Icone, Key, mesa, estado, TOQUE } from '../mesa-blocos/_partes';
import './barra.css';

const pedido = new URLSearchParams(location.search);
export const ESTREITO = pedido.get('estreito') === '1';
export const SEL_INICIAL = (pedido.get('sel') ?? 'negrito,titulo2').split(',');

const T = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export interface Ferr { id: string; nome: string; tecla: string; icone: ReactNode; rotulo: ReactNode }

export const FERRAMENTAS: Ferr[][] = [
  [
    { id: 'negrito', nome: 'Negrito', tecla: 'Ctrl B', rotulo: <b>N</b>, icone: <T><path d="M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z" /></T> },
    { id: 'italico', nome: 'Itálico', tecla: 'Ctrl I', rotulo: <i>I</i>, icone: <T><path d="M10 5h7M7 19h7M14 5l-4 14" /></T> },
    { id: 'sublinhado', nome: 'Sublinhado', tecla: 'Ctrl U', rotulo: <u>S</u>, icone: <T><path d="M7 5v7a5 5 0 0010 0V5M6 20h12" /></T> },
    { id: 'marca', nome: 'Marca-texto', tecla: 'Ctrl Shift H', rotulo: <span className="bf-marca">M</span>, icone: <T><path d="M14 4l6 6-8 8H6v-6zM4 21h7" /></T> },
  ],
  [
    { id: 'sobrescrito', nome: 'Sobrescrito', tecla: 'Ctrl .', rotulo: <span>x<sup>2</sup></span>, icone: <T><path d="M5 9l7 9M12 9l-7 9M16 4.5a2 2 0 013.5 1.2c0 1.6-3.5 2.3-3.5 4h3.7" /></T> },
    { id: 'subscrito', nome: 'Subscrito', tecla: 'Ctrl ,', rotulo: <span>x<sub>2</sub></span>, icone: <T><path d="M5 5l7 9M12 5l-7 9M16 15.5a2 2 0 013.5 1.2c0 1.6-3.5 2.3-3.5 4h3.7" /></T> },
  ],
  [
    { id: 'titulo1', nome: 'Título 1', tecla: 'Ctrl Alt 1', rotulo: <b>T1</b>, icone: <T><path d="M5 5v14M13 5v14M5 12h8M17 9l2.5-1.5V19" /></T> },
    { id: 'titulo2', nome: 'Título 2', tecla: 'Ctrl Alt 2', rotulo: <b>T2</b>, icone: <T><path d="M4 5v14M12 5v14M4 12h8M16 9.5a2.3 2.3 0 014 1.4c0 2-4 3.5-4 6.1h4.2" /></T> },
  ],
  [
    { id: 'topicos', nome: 'Lista com tópicos', tecla: 'Ctrl Shift 8', rotulo: <span>•≡</span>, icone: <T><path d="M10 6h10M10 12h10M10 18h10M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></T> },
    { id: 'numerada', nome: 'Lista numerada', tecla: 'Ctrl Shift 7', rotulo: <span>1≡</span>, icone: <T><path d="M11 6h9M11 12h9M11 18h9M4 5l1.5-1v5M4 14.5a1.3 1.3 0 012.4.6c0 1-2.4 1.4-2.4 2.9h2.6" /></T> },
    { id: 'tarefas', nome: 'Lista de tarefas', tecla: 'Ctrl Shift 9', rotulo: <span>☐≡</span>, icone: <T><rect x="3.5" y="4" width="6" height="6" rx="1.5" /><path d="M4.8 15.5l1.7 1.7 2.8-3M13 7h7M13 17h7" /></T> },
  ],
];

export const TODAS = FERRAMENTAS.flat();

export function useSel() {
  const [sel, setSel] = useState<string[]>(SEL_INICIAL);
  const alterna = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return { sel, alterna };
}

interface BtnProps { f: Ferr; sel: boolean; alterna: (id: string) => void; modo: 'icone' | 'rotulo' | 'ambos' }
export function Btn({ f, sel, alterna, modo }: BtnProps) {
  return (
    <button
      type="button"
      className="bf-btn"
      data-sel={sel}
      aria-pressed={sel}
      aria-label={f.nome}
      title={`${f.nome} · ${f.tecla}`}
      onPointerDown={(e) => e.preventDefault()}
      onClick={() => alterna(f.id)}
    >
      {modo !== 'rotulo' && <span className="bf-ico">{f.icone}</span>}
      {modo !== 'icone' && <span className="bf-rot">{f.rotulo}</span>}
    </button>
  );
}

export function Cabeca() {
  const e = estado('notas');
  return (
    <header className="mb-fino">
      <Icone id="notas" />
      <span className="mb-nome">Anotações</span>
      <span className="mb-fim">{e !== 'fora' && <Key>A</Key>}</span>
    </header>
  );
}

// Bloco Anotações com a barra que cada versão passa. `largura` simula bloco estreito.
export function BlocoNotas({ barra, largura }: { barra: ReactNode; largura?: number }) {
  return (
    <div className="bf-quadro" style={largura ? { width: largura } : undefined}>
      <Caixa id="notas">
        <Cabeca />
        <Nota />
        {barra}
      </Caixa>
    </div>
  );
}

export function Pagina({ children }: { children: (largura?: number) => ReactNode }) {
  return (
    <>
      <div className="bf-pagina" data-toque={TOQUE ? '' : undefined}>
        <section>
          <h3 className="bf-leg">Bloco normal</h3>
          {children()}
        </section>
        <section>
          <h3 className="bf-leg">Bloco estreito (320 px)</h3>
          {children(320)}
        </section>
      </div>
    </>
  );
}
export { mesa };
