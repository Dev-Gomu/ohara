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

## Fase A: interface com dados fictícios (sem banco)

| Etapa | O que | Obs. |
|---|---|---|
| **1** | **Fundação:** repositório, Vite, TypeScript, lint, `npm run check`, CI, deploy no GitHub Pages, PWA mínima com aviso de versão, camadas e isolamento do app antigo | **Detalhada em `etapa-01.md`** |
| 2 | **Teclado:** resolvedor puro, tabela de teclas como dado, listener único, níveis de foco, ajuda gerada | Modo de plano. **Detalhada em `etapa-02.md`** |
| 3 | **Casca de navegação:** seis telas vazias, Alt+1 a 6, Paleta (decide D13), tema claro/escuro, diretrizes visuais | Precisa de `telas.md` e diretrizes visuais |
| 4 | **Mosaico e Mesa:** motor dwindle genérico e a Mesa com blocos de mentira, arranjo por aula | Toque e teclado |
| 5 | **Fixtures e telas de leitura:** dados fictícios (inclui casos extremos) alimentando Acervo e Hub | Define o conjunto de fixtures com o usuário |
| 6 | **Treino, Agenda e Configs** com dados fictícios, mais janelas de consulta. **Checkpoint: escopo congelado, atalhos congelados** | Usuário revisa tudo antes de seguir |

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
| Conceito de **Livro** (B08) | Etapas 8 e 10 | Antes da Etapa 8 |
| `regras.md` | Etapa 9 | Em paralelo à Fase A |
| D33, D37, D44, D54 | Ver `decisoes.md` | Nas etapas indicadas lá |

**Nota:** a numeração e a divisão das etapas 2 a 13 são **proposta**. O que está fixado em outros documentos: modo de plano nas Etapas 2, 7 e 12; fixtures na 5; checkpoint na 6; banco na 7; teste Drive vs Dropbox na 12; boletim cifrado na 13.

## Acréscimo (05/11/2026): fontes para `regras.md` e `telas.md`
O legado está congelado e há um kit de consulta em `referencia-legado/` (resumo, capturas das 6 telas, tokens, atalhos, `DECISOES-legado.md` para `grep`). A sessão que extrai `regras.md` e a que escreve `telas.md` podem partir dele e consultar o projeto antigo (`../PROJETO ESTUDO`, somente leitura) só onde faltar detalhe. Backlog novo: importar o backup .zip do app antigo (ver B09 em `backlog.md`).
