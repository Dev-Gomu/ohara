// Ajustar largura e altura das células (V1 decidida, D149): a mini-barra vira uma linha única.
// Teclado: Alt R entra; ← → largura, ↑ ↓ altura mínima, Shift = passo grande, Enter ou Esc termina.
// Arrasto (mouse e dedo): pelas linhas azuis e pela alça. Três alças em estudo: a, b, c.
// Toque: − valor +. Para ver o toque no computador: acrescente &toque=1 ao endereço.
import { useEffect, useRef, useState, type PointerEvent as PE } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import { FormatBar, type FormatTool } from '../../../src/ui/components/FormatBar';
import './tabela.css';
import './enxuto.css';

const DADOS = [
  ['Tipo', 'Mediador', 'Tempo', 'Exemplo'],
  ['I · imediata', 'IgE e mastócito', 'minutos', 'Anafilaxia, rinite'],
  ['II · citotóxica', 'IgG ou IgM', 'horas', 'Anemia hemolítica'],
  ['III · imunocomplexos', 'Complexos e complemento', '4 a 10 h', 'Lúpus, glomerulonefrite'],
  ['IV · tardia', 'Linfócito T', '48 a 72 h', 'PPD, dermatite de contato'],
];
const nada = () => undefined;
const f = (id: string, label: string, glyph: string, sel = false): FormatTool => ({ id, label, glyph, priority: 1, sel, run: nada });
const GRUPOS = [
  [f('h', 'Título', 'H')],
  [f('b', 'Negrito', 'B'), f('i', 'Itálico', 'I'), f('m', 'Marca-texto', '▰')],
  [f('l', 'Lista', '•'), f('d', 'Desfazer', '↶')],
  [f('t', 'Tabela', '▦', true)],
];
const COMUNS = ['+ Linha', '+ Coluna', '− Linha', '− Coluna', 'Igualar colunas'];

const PASSO = 8;
const GRANDE = 24;
const MIN_L = 60;
const MIN_A = 28;
const COL = 1;
const LIN = 1;

// a: pílula fina sobre cada linha, na célula. b: aba com setas fora da tabela. c: um canto só, puxa os dois.
export type Alca = 'nenhuma' | 'a' | 'b' | 'c';
type Eixo = 'l' | 'a';
type Pega = Eixo | 'la';

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Seta = ({ eixo }: { eixo: Eixo }) => (
  <svg className="ex-seta" width="20" height="20" {...svg}>
    {eixo === 'l' ? <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" /> : <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />}
  </svg>
);
const Pontas = ({ tipo }: { tipo: Pega }) => (
  <svg width="16" height="16" {...svg} strokeWidth={2.5}>
    {tipo === 'l' && <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />}
    {tipo === 'a' && <path d="M7 9l5-5 5 5M7 15l5 5 5-5" />}
    {tipo === 'la' && <path d="M6 6l12 12M6 11V6h5M18 13v5h-5" />}
  </svg>
);

function Passo({ eixo, valor, muda }: { eixo: Eixo; valor: number; muda: (d: number, e: Eixo) => void }) {
  const nome = eixo === 'l' ? 'largura' : 'altura';
  return (
    <span className="ex-par" role="group" aria-label={nome}>
      <button type="button" aria-label={`Diminuir ${nome}`} onClick={() => muda(-PASSO, eixo)}>−</button>
      <b>{valor}</b>
      <button type="button" aria-label={`Aumentar ${nome}`} onClick={() => muda(PASSO, eixo)}>+</button>
    </span>
  );
}

export function Enxuto({ alca }: { alca: Alca }) {
  const [largura, setLargura] = useState([150, 190, 90, 190]);
  const [altura, setAltura] = useState([36, 52, 36, 36]);
  const [ativo, setAtivo] = useState(true);

  const poe = (l: number | null, a: number | null) => {
    if (l !== null) setLargura((v) => v.map((x, i) => (i === COL ? Math.max(MIN_L, Math.round(l)) : x)));
    if (a !== null) setAltura((v) => v.map((x, i) => (i === LIN ? Math.max(MIN_A, Math.round(a)) : x)));
  };
  const muda = (delta: number, e: Eixo) => (e === 'l' ? poe(largura[COL]! + delta, null) : poe(null, altura[LIN]! + delta));

  useEffect(() => {
    if (new URLSearchParams(location.search).get('toque')) document.documentElement.dataset.entrada = 'toque';
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (!ativo) {
        if (e.altKey && e.code === 'KeyR') { setAtivo(true); e.preventDefault(); }
        return;
      }
      const passo = e.shiftKey ? GRANDE : PASSO;
      if (e.code === 'ArrowRight') muda(passo, 'l');
      else if (e.code === 'ArrowLeft') muda(-passo, 'l');
      else if (e.code === 'ArrowDown') muda(passo, 'a');
      else if (e.code === 'ArrowUp') muda(-passo, 'a');
      else if (e.code === 'Enter' || e.code === 'Escape') setAtivo(false);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    // Fase de captura: as setas da moldura do lab (troca de versão) não chegam.
    window.addEventListener('keydown', tecla, true);
    return () => window.removeEventListener('keydown', tecla, true);
  }, [ativo, largura, altura]);

  // Arrasto: pela alça (data-al) ou direto pela linha azul (perto da borda da coluna ou da linha).
  const arrasto = useRef<{ pega: Pega; x: number; y: number; l: number; a: number } | null>(null);
  const perto = (e: PE<HTMLTableElement>): Pega | null => {
    const naAlca = (e.target as HTMLElement).closest<HTMLElement>('[data-al]')?.dataset.al as Pega | undefined;
    if (naAlca) return naAlca;
    const col = e.currentTarget.querySelector('th.ex-col')?.getBoundingClientRect();
    const lin = e.currentTarget.querySelector('tr.ex-lin')?.getBoundingClientRect();
    const folga = e.pointerType === 'mouse' ? 6 : 16;
    if (col && Math.abs(e.clientX - col.right) <= folga) return 'l';
    if (lin && Math.abs(e.clientY - lin.bottom) <= folga) return 'a';
    return null;
  };
  const cursor = (p: Pega | null) => (p === 'l' ? 'col-resize' : p === 'a' ? 'row-resize' : p === 'la' ? 'nwse-resize' : '');
  const pega = (e: PE<HTMLTableElement>) => {
    const qual = ativo ? perto(e) : null;
    if (!qual) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.perto = qual;
    arrasto.current = { pega: qual, x: e.clientX, y: e.clientY, l: largura[COL]!, a: altura[LIN]! };
  };
  const move = (e: PE<HTMLTableElement>) => {
    const a = arrasto.current;
    if (!a) {
      const qual = ativo ? perto(e) : null;
      e.currentTarget.style.cursor = cursor(qual);
      e.currentTarget.dataset.perto = (e.pointerType === 'mouse' && qual) || '';
      return;
    }
    poe(a.pega.includes('l') ? a.l + e.clientX - a.x : null, a.pega.includes('a') ? a.a + e.clientY - a.y : null);
  };
  const solta = (e: PE<HTMLTableElement>) => {
    arrasto.current = null;
    e.currentTarget.dataset.perto = '';
  };
  const puxador = (tipo: Pega, nome: string) => (
    <i className={`ex-alca ex-alca-${alca} ex-alca-${alca}-${tipo}`} data-al={tipo} role="separator" aria-label={nome}>
      {alca !== 'a' && <Pontas tipo={tipo} />}
    </i>
  );
  // Onde cada alça mora: a e c na célula ativa; b no cabeçalho da coluna e na ponta direita da linha.
  const alcasDe = (i: number, j: number) => {
    if (!ativo) return null;
    const celula = i === LIN && j === COL;
    if (alca === 'a' && celula) return <>{puxador('l', 'Arrastar a largura da coluna')}{puxador('a', 'Arrastar a altura da linha')}</>;
    if (alca === 'c' && celula) return puxador('la', 'Arrastar largura e altura');
    if (alca === 'b' && i === -1 && j === COL) return puxador('l', 'Arrastar a largura da coluna');
    if (alca === 'b' && i === LIN && j === DADOS[0]!.length - 1) return puxador('a', 'Arrastar a altura da linha');
    return null;
  };

  return (
    <section className={`${bloco.bloco} tb-janela tb-2`} data-foco="dentro" style={{ width: 700, maxWidth: '100%' }} aria-label="Anotações">
      <FormatBar groups={GRUPOS} bar="top" onExpand={nada} onOptions={nada} />
      <div className={mesa.editor}>
        <div className={mesa.texto}>
          <h2>Comparação dos quatro tipos</h2>
          <div className="tb-envoltorio">
            <div className="tb-rolagem">
              <table className="tb-tabela ex-tabela" data-eixos={ativo ? 'la' : undefined} onPointerDown={pega} onPointerMove={move} onPointerUp={solta} onPointerCancel={solta}>
                <colgroup>{largura.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                <thead>
                  <tr>{DADOS[0]!.map((c, j) => <th key={c} className={j === COL ? 'ex-col' : undefined}>{c}{alcasDe(-1, j)}</th>)}</tr>
                </thead>
                <tbody>
                  {DADOS.slice(1).map((l, i) => (
                    <tr key={i} style={{ height: altura[i] }} className={i === LIN ? 'ex-lin' : undefined}>
                      {l.map((c, j) => (
                        <td key={j} className={[j === COL ? 'ex-col' : '', i === LIN && j === COL ? 'tb-ativa' : ''].join(' ')}>{c}{alcasDe(i, j)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ativo ? (
              <div className="ex-linha" role="toolbar" aria-label="Ajustar tabela">
                <Seta eixo="l" /><Passo eixo="l" valor={largura[COL]!} muda={muda} />
                <Seta eixo="a" /><Passo eixo="a" valor={altura[LIN]!} muda={muda} />
                <button type="button" className="ex-pronto" onClick={() => setAtivo(false)}>Pronto</button>
              </div>
            ) : (
              <div className="tb-ferr" role="toolbar" aria-label="Tabela">
                {COMUNS.map((x) => <button key={x} type="button">{x}</button>)}
                <button type="button" onClick={() => setAtivo(true)}>Ajustar <kbd>Alt R</kbd></button>
              </div>
            )}
          </div>
          <p>Depois da tabela o texto continua normal.</p>
        </div>
      </div>
    </section>
  );
}
