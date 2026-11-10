// Vitrine: todas as peças reais de src/ui/components, em estados fixos, nos dois temas.
// É a referência para copiar ao montar uma tela (diretrizes, seção 7).
// T troca o tema; ?tema=escuro e ?janela (abre a Janela) servem ao `npm run tela`.
import { createRoot } from 'react-dom/client';
import '../../src/ui/styles/fonts.css';
import '../../src/ui/styles/tokens.css';
import '../../src/ui/styles/base.css';
import './vitrine.css';
import { Button } from '../../src/ui/components/Button';
import { dispatch } from '../../src/ui/keyboard/store';
import { Controles } from './controles';
import { Estrutura } from './estrutura';
import { AgendaMesa } from './agenda-mesa';

const raiz = document.documentElement;
const pedido = new URLSearchParams(location.search);
const tema = pedido.get('tema');
if (tema) raiz.dataset.tema = tema;
if (pedido.has('janela')) dispatch({ type: 'openWindow', window: 'vitrine' });

function trocarTema() {
  raiz.dataset.tema = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
}

// Só no lab: no app, toda tecla passa pelo listener único.
document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') dispatch({ type: 'escape' });
  if (e.code === 'KeyT' && !(e.target instanceof HTMLInputElement)) trocarTema();
});

function Vitrine() {
  return (
    <main className="vitrine">
      <header className="v-topo">
        <h1 className="v-titulo">Vitrine</h1>
        <p className="v-uso">Todas as peças reais do app. Para montar uma tela, copie daqui.</p>
        <div className="v-fim">
          <Button shortcut="T" onPress={trocarTema}>
            Trocar tema
          </Button>
        </div>
      </header>
      <Estrutura />
      <Controles />
      <AgendaMesa />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Vitrine />);
