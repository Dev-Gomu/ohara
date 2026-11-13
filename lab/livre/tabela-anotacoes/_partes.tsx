// Bancada "tabela-anotacoes": como a tabela ficaria dentro das Anotações. Só desenho; as células até editam (contentEditable).
import bloco from '../../../src/ui/components/Block.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import { FormatBar, type FormatTool } from '../../../src/ui/components/FormatBar';
import './tabela.css';

const LINHAS = [
  ['Tipo', 'Mediador', 'Tempo', 'Exemplo'],
  ['I · imediata', 'IgE e mastócito', 'minutos', 'Anafilaxia, rinite'],
  ['II · citotóxica', 'IgG ou IgM', 'horas', 'Anemia hemolítica'],
  ['III · imunocomplexos', 'Complexos e complemento', '4 a 10 h', 'Lúpus, glomerulonefrite'],
  ['IV · tardia', 'Linfócito T', '48 a 72 h', 'PPD, dermatite de contato'],
];

const FERR = ['+ Linha', '+ Coluna', '− Linha', '− Coluna', 'Igualar colunas', 'Apagar tabela'];

const nada = () => undefined;
const f = (id: string, label: string, glyph: string, priority: FormatTool['priority'], sel = false): FormatTool => ({ id, label, glyph, priority, sel, run: nada });
const GRUPOS = [
  [f('h', 'Título', 'H', 1)],
  [f('b', 'Negrito', 'B', 1), f('i', 'Itálico', 'I', 1), f('m', 'Marca-texto', '▰', 1)],
  [f('l', 'Lista com tópicos', '•', 1), f('d', 'Desfazer', '↶', 1)],
  [f('t', 'Tabela', '▦', 1, true)],
];

export function Janela({ variante, largura = 700 }: { variante: string; largura?: number }) {
  return (
    <section className={`${bloco.bloco} tb-janela ${variante}`} data-foco="dentro" style={{ width: largura, maxWidth: '100%' }} aria-label="Anotações">
      <FormatBar groups={GRUPOS} bar="top" onExpand={nada} onOptions={nada} />
      <div className={mesa.editor}>
        <div className={mesa.texto}>
          <h1>Hipersensibilidade</h1>
          <p>Resposta imune exagerada ou inadequada a um antígeno, que causa lesão no próprio tecido. A classificação de <b>Gell e Coombs</b> separa quatro tipos pelo mecanismo.</p>
          <h2>Comparação dos quatro tipos</h2>
          <div className="tb-envoltorio">
            <div className="tb-rolagem">
              <table className="tb-tabela">
                <thead>
                  <tr>{LINHAS[0]!.map((c) => <th key={c} contentEditable suppressContentEditableWarning>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {LINHAS.slice(1).map((l, i) => (
                    <tr key={i}>{l.map((c, j) => <td key={j} className={i === 1 && j === 1 ? 'tb-ativa' : undefined} contentEditable suppressContentEditableWarning>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tb-ferr" role="toolbar" aria-label="Tabela">
              {FERR.map((x) => <button key={x} type="button">{x}</button>)}
            </div>
          </div>
          <h2>Tipo I em detalhe</h2>
          <p>O alérgeno liga a <mark>IgE</mark> presa ao mastócito e provoca a degranulação.</p>
          <ul>
            <li>Fase imediata: minutos, histamina e triptase.</li>
            <li>Fase tardia: 6 a 24 horas, eosinófilos e leucotrienos.</li>
          </ul>
          <h2>Para lembrar</h2>
          <p>Tipos <b>I, II e III</b> são mediados por anticorpos. O <b>IV</b> é o único mediado por linfócito T.</p>
        </div>
      </div>
    </section>
  );
}
