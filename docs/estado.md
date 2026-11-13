# Estado do Ohara (atualizado em 12/11/2026)

**Leia só este arquivo para retomar.** Detalhes de cada sessão: `docs/plano/faxina.md`. Fila: `docs/plano/_indice.md`.

## Onde estamos
- Publicado no main (PR 2, 12/11/2026): https://dev-gomu.github.io/ohara/. Etapas 1 a 10 e 13 (sem sincronização) feitas; Hub Refinado, Agenda B, Faltas, Notas e menu de telas já no app (D121 a D129).
- Identidade única (formas e peças): **Ardósia refinada** (D130). Cores: três paletas, **Gelo suave** (padrão), Gelo e Índigo (D132).
- Faxina: sessões 1 a 4 feitas (papel, visual, paletas, publicação). Na 4 saíram dois defeitos reais: Paleta reabria com a busca velha e carregar a aula apagava a versão do Histórico criada durante o carregamento. `lab/` só tem índice, sala, vitrine (agora com DayItem e FaultCell) e `provas-dias.html`; `diretrizes-visuais.md` virou resumo de uma página.

## Próximo passo

**Propostas visuais de 13/11: parecer do usuário (só bancada, nada aplicado; pastas em `lab/livre/<ideia>/`)**
- **Aplicados em 13/11 (D140, D142, D144):** raios novos (bloco 22, botão 12, item 10, campo 12); faixa de formatação aninhada no topo das Anotações (peça `FormatBar`, na vitrine; ☰ lista o que some no estreito; bolha só no toque; Alt T e Alt B vão à faixa); Salvar no cabeçalho dos Cartões, sem rodapé; padrão de janela V2 (contexto, X, rodapé de metades iguais); Configs com valor na linha. Bancadas apagadas.
- **Aplicados em 13/11 (Sonnet, D146 e D148):** Agenda (mês com "+N itens"; prévia do dia com sigla à esquerda e título inteiro, via `lead` no `ListItem`) e janela de atalhos em cartões (três listas Só desta tela, Universais e Todos; campo `screens` na tabela de teclas; `helpLines`/`linesOf` no core, com testes). Bancadas `agenda-ajustes` e `atalhos` apagadas. **Falta:** trocar de lista com ← → pelo resolvedor (hoje só toque, Tab e Enter); anotado no backlog. Conferido só na Agenda vazia e na Mesa; o mês com muitos itens só na bancada.

- **treino-cartao: V1 da rodada 6 DECIDIDA (D150, 13/11), a aplicar depois da Etapa 11:** frente cheia no azul de ação; ao revelar, a frente encolhe para o topo da tela e o verso vem num cartão abaixo em duas colunas; notas em contorno com Bom preenchido; regra de pergunta longa. Testada pelo usuário no tablet. Modelo: `lab/livre/treino-cartao/_ref.tsx` (`topo="cartao"`). Só de teste, saem ao aplicar: `lab/t.html`, `&cheia=1`, botão "Tela cheia" e a configuração `ohara-rede` em `.claude/launch.json`.
- **Barra nova aplicada (D153, 13/11):** ícones D147, barra D145 e barra estreita D152 no app; bancadas saíram. **Falta da Mesa (D146):** cabeçalho minimalista de Slides e Cartões com nome (`lab/livre/mesa-blocos/` fica). **Tabela aplicada (D154, 14/11):** mini-barra, arrasto das linhas sem alça e modo Ajustar (Alt R, setas; − valor + no toque); `lab/livre/tabela-anotacoes/` apagada. Falta só testar o arrasto com dedo no tablet. e2e:curto: 2 falhas (Acervo "3ª aula" e backup do `banco.spec`) que já existiam antes da barra nova (conferido em 513aee2); a da Agenda passou.
- **cartoes-salvos: V2 DECIDIDA (D151, 13/11), a aplicar junto com os Cartões (D138/D139, adiados):** aba "Salvos" da Mesa vira lista; cada linha tem número, pergunta (até duas linhas) e o começo do verso em cinza; Enter ou toque abre o cartão da D138 no lugar da linha; marca-texto não pinta na linha. Modelo: `lab/livre/cartoes-salvos/` (`_partes.tsx`, modelo `duas`; usa `ler`, `agrupar` e `html` de `lab/livre/mesa-flashcard/_partes.tsx`). A pasta sai ao aplicar.
- **Estilo "Contido" (D143):** não é bancada (os valores já estão decididos), é aplicação no app e a decisão diz "última tarefa". O usuário pediu para fazer em 13/11: aguarda ele confirmar se antecipa (sessão própria).
Auditoria concluída (12/11): lab livre (`lab/livre.html`), cartão de peças (`docs/pecas.md`, `npm run pecas`) e fechamento enxuto (D133 a D135). Agora:
**Sessão R: refinos das telas** (`plano/faxina.md`). **R1 Acervo aplicada (D136, 12/11):** matéria aberta com contagem nas pastas, linha da aula só com data, abas Aulas/Cartões no cabeçalho da lista, capa menor com começo da anotação e `Button` no "Abrir na Mesa"; `Grades.module.css` dividido em três (Celulas, Linhas, Disciplina); `lab/livre/acervo/` apagado. **R3 Mesa: barra do topo aprovada (D137, V2 de `lab/livre/mesa/`), a aplicar** (Opus; o menu Faltas/Notas/Ajuda vale para todas as telas). Faltam duas bancadas, uma por sessão, no Fable: **Cartões: bancada aprovada em 13/11 (D138, D139)** em `lab/cartao-flashcard.html` e `lab/livre/mesa-flashcard/`; **aplicação adiada, fica pendente por escolha do usuário (13/11)**; quando voltar, 4 etapas, uma por sessão: (1) core: `##`, `->`, marcas inline e tabela de símbolos, com testes; (2) teclas Ctrl . e Ctrl , e atalhos no editor de cartões; (3) visual do `CardBack` e do editor + itens no menu ⋮ do bloco; (4) conversão para o Anki (B02, só preparar). `lab/livre/mesa-cartoes/` sai ao aplicar. Na lista de salvos: virar lista de fato (backlog, 13/11) e **barra de formatação** (o usuário acha feia; pedir a lista de mudanças). Próximo: R2 Configs. Treino só depois da Etapa 11. Depois: Sessão 5 (Etapa 11), Sessão 6 (sincronização, só se houver necessidade).

- **Tabela nas Anotações: APLICADA (D154, 14/11)**; histórico em D149.
- **Barra de formatação: DECIDIDA (D145, `lab/livre/barra-8/` V2), a aplicar.** Título, Negrito, Itálico, Marca-texto, Tópicos, Numerada, Tabela, Sobrescrito/Subscrito (botão duplo), Desfazer, Aa. Falta decidir só os ícones: bloco Anotações (sem caneta; recomendado caderno) e menu de estilos (recomendado Aa). O ☰ da referência é o botão do menu de estilos, não o ícone do bloco. Sobrescrito e subscrito exigem as extensões do Tiptap; a tabela exige a extensão de tabela.

- **Ícones da barra de formatação: conjunto completo DECIDIDO (D147, 13/11):** V1 de `lab/livre/icones-formatacao/` (conjunto próprio em `fable.tsx`, traço 2): os 13 da barra, os 11 do menu Aa e o caderno; "Mais estilos" = A em arco + "a" redondo. A aplicar junto com a barra (D145) e o cabeçalho da Mesa (D146), em outra sessão; ao aplicar, saem as pastas `icones-formatacao`, `aa-icone`, `barra-8` e `botoes-formatacao`. Histórico: Queixa do usuário: a **desproporção entre os botões**, uns maiores ou mais pesados que outros; nada aprovado. Tentativas: ícones desenhados à mão (traço 2, 1,75 e letras em fonte) e depois o Lucide (ISC, v0.468.0, copiado em `lab/livre/icones-formatacao/lucide.tsx`, traço 2, 1,75 e 1,5): ainda desproporcionais entre si. Aa: três versões em `lab/livre/aa-icone/` (arco, alto e curvo, letra em fonte), sem escolha. Pedido: conjunto único e equilibrado (mesmo peso, mesma altura óptica, mesma margem na grade 24, alinhamento no centro) para os 13 da barra e os 12 do menu Aa e bloco Anotações (caderno). Regras: traço dos ícones de bloco do app, sem fundo quente, tokens `--cor-*`, dois temas.

## A conferir (aplicado em 13/11, só check e e2e)
- Faixa das Anotações no bloco estreito (320 px) e no toque; ◦ botão Marcador/Aa e função do ⋮ extra ficaram de fora. Estilo "Contido" (D143) segue como última tarefa. Falha antiga no e2e: "Acervo: a 3ª aula do 2º bimestre" (do R1, não desta sessão).

## Esperando o usuário
- Antes da sessão 6: cadastrar as origens no Google Cloud.
- Teste de backup (`banco.spec.ts`, download) falhou uma vez no CI e passou ao repetir: se voltar, investigar.

## Iniciativas abertas (máx. 3)
1. Refinos das telas (Sessão R).
2. Etapa 11, Treino com FSRS.
3. Etapa 12, sincronização.
