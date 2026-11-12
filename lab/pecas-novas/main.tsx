// Bancada das peças que faltam (fila de 10/11): filtro de matérias, célula de dia,
// alternadores e abas de bloco, aviso de redimensionar. Três versões (A, B, C) de cada.
// ?tema=escuro e ?peca=filtro|dia|blocos|aviso|provas|barra|hoje|lixeira|notas|provashub servem ao `npm run tela`. T troca o tema.
import { createRoot } from 'react-dom/client';
import '../../src/ui/styles/fonts.css';
import '../../src/ui/styles/tokens.css';
import '../../src/ui/styles/base.css';
import '../vitrine/vitrine.css';
import './pecas.css';
import './ideias.css';
import { Secao } from '../vitrine/moldura';
import { Filtro } from './filtro';
import { Dia } from './dia';
import { Blocos } from './blocos';
import { Aviso } from './aviso';
import { Agenda } from './agenda';
import { Provas } from './provas';
import { BarraTopo } from './barra';
import { Avaliacoes } from './avaliacoes';
import { HubLayout } from './hub-layouts';
import { Hoje } from './ideias-hoje';
import { Lixeira } from './ideias-lixeira';
import { Notas } from './ideias-notas';
import { NotasTela } from './notas-tela';
import { NotasNova } from './notas-nova';
import { NotasA } from './notas-a';
import { NotasDados } from './notas-dados';
import { NotasPecas } from './notas-pecas';
import { NotasModelos } from './notas-modelos';
import { NotasCompostas } from './notas-compostas';
import { NotasTelas } from './notas-telas';
import { ProvasHub } from './ideias-provas';

const raiz = document.documentElement;
const pedido = new URLSearchParams(location.search);
const tema = pedido.get('tema');
if (tema) raiz.dataset.tema = tema;
const peca = pedido.get('peca');

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyT') raiz.dataset.tema = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
});

const PECAS = { filtro: Filtro, dia: Dia, blocos: Blocos, aviso: Aviso, provas: Provas, barra: BarraTopo, avaliacoes: Avaliacoes, hoje: Hoje, lixeira: Lixeira, notas: Notas, provashub: ProvasHub, hublayout: HubLayout };

function Bancada() {
  const lista = peca === 'agenda' ? [['agenda', Agenda] as const] : Object.entries(PECAS).filter(([nome]) => !peca || nome === peca);
  if (peca === 'hublayout') return <HubLayout />;
  if (peca === 'notastela') return <NotasTela />;
  if (peca === 'notasnova') return <NotasNova />;
  if (peca === 'notasa') return <NotasA />;
  if (peca === 'notasb') return <NotasNova />;
  if (peca === 'notasdados') return <NotasDados />;
  if (peca === 'notaspecas') return <NotasPecas />;
  if (peca === 'notasmodelos') return <NotasModelos />;
  if (peca === 'notascomp') return <NotasCompostas />;
  if (peca === 'notastelas') return <NotasTelas />;
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
