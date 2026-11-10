// Bancada das peças que faltam (fila de 10/11): filtro de matérias, célula de dia,
// alternadores e abas de bloco, aviso de redimensionar. Três versões (A, B, C) de cada.
// ?tema=escuro e ?peca=filtro|dia|blocos|aviso|provas|barra servem ao `npm run tela`. T troca o tema.
import { createRoot } from 'react-dom/client';
import '../../src/ui/styles/fonts.css';
import '../../src/ui/styles/tokens.css';
import '../../src/ui/styles/base.css';
import '../vitrine/vitrine.css';
import './pecas.css';
import { Secao } from '../vitrine/moldura';
import { Filtro } from './filtro';
import { Dia } from './dia';
import { Blocos } from './blocos';
import { Aviso } from './aviso';
import { Agenda } from './agenda';
import { Provas } from './provas';
import { BarraTopo } from './barra';
import { Avaliacoes } from './avaliacoes';

const raiz = document.documentElement;
const pedido = new URLSearchParams(location.search);
const tema = pedido.get('tema');
if (tema) raiz.dataset.tema = tema;
const peca = pedido.get('peca');

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyT') raiz.dataset.tema = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
});

const PECAS = { filtro: Filtro, dia: Dia, blocos: Blocos, aviso: Aviso, provas: Provas, barra: BarraTopo, avaliacoes: Avaliacoes };

function Bancada() {
  const lista = peca === 'agenda' ? [['agenda', Agenda] as const] : Object.entries(PECAS).filter(([nome]) => !peca || nome === peca);
  return (
    <main className="vitrine">
      {!peca && <Secao>Peças que faltam: três versões de cada</Secao>}
      {lista.map(([nome, Peca]) => (
        <Peca key={nome} />
      ))}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Bancada />);
