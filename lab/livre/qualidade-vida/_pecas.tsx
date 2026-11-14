// Itens 4 e 5: "Hoje" usa o CSS real das telas; "Proposta" usa só as peças da vitrine.
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { RulerCreate, RulerPill } from '../../../src/ui/components/Ruler';
import shell from '../../../src/ui/shell/Shell.module.css';
import erro from '../../../src/ui/shell/ErrorScreen.module.css';

function Avisos({ nova }: { nova: boolean }) {
  return (
    <div className="qv-tela">
      {nova ? (
        <div className="qv-pilha">
          <div className="qv-aviso">
            <span>Há uma versão nova.</span>
            <Button variant="primary">Atualizar</Button>
          </div>
          <div className="qv-aviso">
            <span>Aula excluída.</span>
            <Button variant="primary" shortcut="Alt Z">
              Desfazer
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="qv-aviso">
            <span>Há uma versão nova.</span>
            <button type="button" className={shell.botao}>
              Atualizar
            </button>
          </div>
          <div className="qv-aviso" style={{ bottom: 'calc(var(--e3) + 6px)' }}>
            <span>Aula excluída.</span>
            <button type="button" className={shell.botao}>
              Desfazer <Key>Alt Z</Key>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function SecaoBotoes() {
  return (
    <section className="qv-secao">
      <h2>4. Botões fora da vitrine (e um quarto: Desfazer)</h2>
      <p>
        Atualizar e Desfazer usam um botão próprio do Shell; a tela de erro tem o seu; "Criar" da
        régua é um botão cru dentro da peça Ruler. Proposta: todos viram Button (primary para a ação
        do aviso, plain para a segunda ação). O Button ganha só a prop autoFocus, que a tela de erro
        precisa.
      </p>
      <div className="qv-par">
        <div className="qv-lado">
          <span className="qv-rotulo">Hoje · avisos (Shell)</span>
          <Avisos nova={false} />
        </div>
        <div className="qv-lado">
          <span className="qv-rotulo">Proposta · avisos</span>
          <Avisos nova />
        </div>
        <div className="qv-lado">
          <span className="qv-rotulo">Hoje · tela de erro</span>
          <div className="qv-erro">
            <h3>Algo inesperado aconteceu ao abrir os dados.</h3>
            <div className={erro.botoes}>
              <button type="button" className={erro.botao}>
                Exportar banco
              </button>
              <button type="button" className={erro.botao}>
                Tentar de novo
              </button>
            </div>
          </div>
        </div>
        <div className="qv-lado">
          <span className="qv-rotulo">Proposta · tela de erro</span>
          <div className="qv-erro">
            <h3>Algo inesperado aconteceu ao abrir os dados.</h3>
            <div className="qv-linha">
              <Button variant="primary">Exportar banco</Button>
              <Button>Tentar de novo</Button>
            </div>
          </div>
        </div>
        <div className="qv-lado">
          <span className="qv-rotulo">Hoje · régua com Criar</span>
          <div className="qv-linha">
            <RulerPill title="Todas" detail="12" />
            <RulerPill title="Pasta 1" detail="4" />
            <RulerCreate label="Nova pasta" />
          </div>
        </div>
        <div className="qv-lado">
          <span className="qv-rotulo">Proposta · régua com Criar</span>
          <div className="qv-linha">
            <RulerPill title="Todas" detail="12" />
            <RulerPill title="Pasta 1" detail="4" />
            <Button variant="quiet">+ Nova pasta</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const ACHADOS: [string, string, string][] = [
  [
    '5a. Avisos um em cima do outro',
    'Aviso de versão nova e Desfazer (ou um aviso comum) usam a mesma posição fixa no rodapé, mesma camada: o de baixo some atrás do outro. Veja "Hoje · avisos" acima.',
    'Uma pilha só de avisos no Shell (coluna, o mais novo embaixo).',
  ],
  [
    '5b. Bolha das Anotações aparece com mouse',
    'A bolha é "só no toque" (D142), mas confere data-entrada === "toque", que hoje também vale para mouse. No PC, selecionar texto com o mouse abre a bolha.',
    'Some com a correção do item 3, sem mexer no NotesBlock.',
  ],
  [
    '5c. Desfazer vence com o app oculto',
    'O prazo de 10 s do Desfazer corre mesmo com o app em segundo plano: no tablet, excluir, trocar de app e voltar já perdeu o Desfazer.',
    'Pausar o prazo enquanto document.hidden (evento visibilitychange no módulo undo.ts, não é tecla).',
  ],
  [
    '5d. Ajuda reabre na última lista',
    'A lista escolhida fica guardada no componente montado: reabrir a Ajuda em outra tela mostra "Todos" ou "Universais" em vez de "Só <tela>".',
    'Resolvido junto do item 1 (a lista passa a viver no estado de foco e zera ao abrir).',
  ],
];

export function SecaoAchados() {
  return (
    <section className="qv-secao">
      <h2>5. Outros atritos encontrados</h2>
      <div className="qv-par">
        {ACHADOS.map(([t, causa, saida]) => (
          <div key={t} className="qv-lado">
            <span className="qv-rotulo">{t}</span>
            <p className="qv-saida">{causa}</p>
            <p className="qv-dica">Correção: {saida}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
