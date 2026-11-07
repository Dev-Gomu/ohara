# Ohara: plano de etapas

**Status:** versão 1, rascunho para aprovação. Data: 05/11/2026.
**Regra de ouro:** só a **etapa atual** é detalhada em `etapa-XX.md`. As demais são intenções de uma linha e podem mudar. Ao terminar uma etapa, o usuário e o Claude (chat) escrevem a seguinte.

**Como cada etapa funciona:**
- Uma etapa por sessão do Claude Code. `/clear` entre etapas (D53).
- Termina quando **todos os critérios de pronto** passam e o usuário cumpre o **roteiro de 5 minutos**.
- Ideia nova vai para `backlog.md`, não para a etapa em curso (D55).
- O Claude Code acrescenta no máximo 5 linhas em `decisoes.md` por etapa.

## Fase 0: preparação (fora do Claude Code)

| Etapa | O que | Quem | Pronto quando |
|---|---|---|---|
| 0 | Refazer o **protótipo da Mesa** com log de teclas (salvando o código) e escrever `teclado.md`. Fecha D20 | Usuário + Claude (chat) | `teclado.md` aprovado, com a tabela de atalhos testada nos aparelhos reais |

Em paralelo, a qualquer momento antes da Etapa 8: sessão separada extrai `regras.md` do legado (D05), aprovado pelo usuário.

## Ordem de execução (07/11/2026)

**Prioridade do usuário:** tudo que aparece no front-end vem antes. As etapas 3 a 6 são só front-end, com dados fictícios, e vêm primeiro. A etapa 7 (banco) é a única que não aparece na tela, mas as etapas 8 a 10 não podem mostrar dado real sem ela.

| Ordem | Etapa | Modelo ideal | Motivo |
|---|---|---|---|
| 1 | **3** Casca de navegação | **Opus 5.5** | Decide a Paleta (D13) e aplica D70 a D74. Erro aqui se propaga |
| 2 | **4** Mosaico e Mesa | **Opus 5.5** | Motor dwindle, vizinhos declarados (D73) e layout da Mesa. Julgamento de design |
| 3 | **5** Fixtures e telas de leitura | **Sonnet 5.5** | Trabalho repetitivo: dados de exemplo e ligação com as telas, já desenhadas |
| 4 | **6** Treino, Agenda, Configs e janelas | **Opus 5.5** | Desenho do Treino (foco único) e checkpoint de atalhos (D77, D78) |
| 5 | **7** Banco | **Opus 5.5** | Modo de plano. Modelo de dados e falhas do OPFS, sem margem para erro |
| 6 | **8** Acervo e Anotações reais | **Opus 5.5** para Tiptap e histórico; Sonnet 5.5 para o resto | Editor e versões são o ponto mais sensível de perda de dados |
| 7 | **9** Agenda, Grade e Lembretes reais | **Sonnet 5.5** | Regras já escritas em `regras.md`; .ics é formato fechado |
| 8 | **10** Slides e Cartões | **Sonnet 5.5** | PDFs no OPFS e formulários. Revisão final pelo Opus |
| 9 | **11** Treino real com FSRS | **Opus 5.5** | Algoritmo de repetição: o erro é silencioso e afeta estudo real |
| 10 | **12** Sincronização | **Opus 5.5** | Modo de plano. Fila offline, conflitos e teste Drive contra Dropbox |
| 11 | **13** Notas cifradas | **Opus 5.5** | Segurança. Testes de cifra obrigatórios e revisão de cada linha |

**Etapas 1 e 2:** já concluídas.

**Feitas em 07/11/2026, sem teste do usuário:** etapas 3, 4, 5 e 6, e a parte de tela das etapas 8 e 9, no branch `telas-3-a-9`. Situação em `loop-telas.md`. **Rodada 2 (Opus, 07/11):** escolha do Treino, editor de cartões na Mesa e celular com um bloco por vez (ver `loop-telas.md`). **Sessão da Agenda (07/11):** `regras.md` escrito e layout B aplicado (D82), sem teste do usuário. Troca de tela ficou sem animação (D83). **Próxima: Etapa 7, banco**, executada pelo Sonnet a partir do plano do Opus (a coluna "Modelo ideal" acima foi trocada pela fila abaixo). Foco em tablet (1280×800) e PC; celular fora de foco.

**Planos do Opus (07/11/2026):** as Etapas 7, 10, 11, 12 e 13 estão detalhadas em `etapa-XX.md`, com decisões D84 a D88. Nesta etapa da Fase B, essas cinco são exceção à regra de ouro. **Aprovados pelo usuário em 07/11/2026.** Só sobra com o Opus: **cores** (adiado; pedir referências ao usuário antes de prototipar) e a revisão final de cada etapa, se o usuário quiser.

**Fila do Sonnet (uma por sessão, `/clear` entre elas, nesta ordem):**
1. ~~**Etapa 7**, banco (`etapa-07.md`).~~ **Feita em 07/11/2026**, sem teste do usuário (D89 a D91).
2. ~~**Pendências pequenas:** renomear e excluir matéria, pasta e aula, com Lixeira (exclusão lógica da Etapa 7); editar e excluir cartões salvos; Alt T, Alt B, Alt , e Alt . levando o foco à barra de formatação. Itens no `backlog.md`, sem arquivo de etapa: o Sonnet escreve os critérios no começo.~~ **Feitas em 07/11/2026**, sem teste do usuário (D92 e D93).
3. **Etapa 10**, slides e livros em PDF (`etapa-10.md`).
4. **Etapa 11**, FSRS (`etapa-11.md`).
5. **Etapa 12**, sincronização (`etapa-12.md`). O usuário acrescenta as origens no Google Cloud antes.
6. **Etapa 13**, notas cifradas (`etapa-13.md`). Começa perguntando onde fica a tela.

Cada sessão do Sonnet: lê `CLAUDE.md`, este índice e o arquivo da etapa; não refaz o desenho; roda `check` e `e2e`; commita em `telas-3-a-9`; atualiza esta fila; entrega o roteiro de 5 minutos.

**Regra de troca:** se uma etapa de Sonnet encontrar decisão de produto ou de segurança, para e pergunta. Não decide sozinha.

## Fase A: interface com dados fictícios (sem banco)

| Etapa | O que | Obs. |
|---|---|---|
| **1** | **Fundação:** repositório, Vite, TypeScript, lint, `npm run check`, CI, deploy no GitHub Pages, PWA mínima com aviso de versão, camadas e isolamento do app antigo | **Concluída** |
| 2 | **Teclado:** resolvedor puro, tabela de teclas como dado, listener único, níveis de foco, ajuda gerada | **Concluída.** Modo de plano. Detalhada em `etapa-02.md` |
| 3 | **Casca de navegação:** seis telas vazias, Alt+1 a 6, Paleta (decide D13), tema claro/escuro, diretrizes visuais | Precisa de `telas.md` e `diretrizes-visuais.md` |
| 4 | **Mosaico e Mesa:** motor dwindle genérico e a Mesa com blocos de mentira, arranjo por aula | Toque e teclado. Usa D73 |
| 5 | **Fixtures e telas de leitura:** dados fictícios (inclui casos extremos) alimentando Acervo e Hub | Define o conjunto de fixtures com o usuário |
| 6 | **Treino, Agenda e Configs** com dados fictícios, mais janelas de consulta. **Checkpoint: escopo congelado, atalhos congelados** | Usuário revisa tudo antes de seguir. Inclui D77 e D78 |

## Fase B: dados reais

| Etapa | O que | Obs. |
|---|---|---|
| 7 | **Banco:** SQLite no OPFS em Worker, migrações, repositórios, diagnóstico de falhas | Modo de plano. Fecha o modelo de dados |
| 8 | **Acervo e Anotações reais:** matérias, aulas, Tiptap, histórico de versões, busca | |
| 9 | **Agenda, Grade e Lembretes reais**, com exportação .ics | Precisa de `regras.md` |
| 10 | **Slides e Cartões:** PDFs/imagens no OPFS, criação e edição de cartões | |
| 11 | **Treino real com FSRS** (ts-fsrs); verifica o otimizador (D44) | |
| 12 | **Sincronização:** `SyncProvider`, Google Drive, fila offline, PDFs por hash, teste Drive vs Dropbox | Modo de plano |
| 13 | **Notas do boletim cifradas** (frase, código de recuperação, PIN opcional); fecha D37 | Testes de cifra obrigatórios |

## Depois do essencial

Ver `backlog.md`: Sala de Foco, integração com Anki, gerador de revisões (1, 7 e 30 dias).

## Pendências que travam etapas

| Item | Trava | Resolve-se em |
|---|---|---|
| `teclado.md` e D20 | Etapa 2 | Etapa 0 |
| `telas.md` e diretrizes visuais | Etapa 3 | Antes da Etapa 3 |
| D13 (Paleta) | Etapa 3 | Etapa 3 |
| `regras.md` | Etapa 9 | Em paralelo à Fase A |
| D33, D44 | Ver `decisoes.md` | Nas etapas indicadas lá |

**Nota:** a numeração e a divisão das etapas 2 a 13 são **proposta**. O que está fixado em outros documentos: modo de plano nas Etapas 2, 7 e 12; fixtures na 5; checkpoint na 6; banco na 7; teste Drive vs Dropbox na 12; boletim cifrado na 13.

## Acréscimo (05/11/2026): fontes para `regras.md` e `telas.md`
O legado está congelado e há um kit de consulta em `referencia-legado/` (resumo, capturas das 6 telas, tokens, atalhos, `DECISOES-legado.md` para `grep`). A sessão que extrai `regras.md` e a que escreve `telas.md` podem partir dele e consultar o projeto antigo (`../PROJETO ESTUDO`, somente leitura) só onde faltar detalhe. Backlog novo: importar o backup .zip do app antigo (ver B09 em `backlog.md`).
