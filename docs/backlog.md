# Ohara: backlog

**Status:** versão 1. Data: 05/11/2026. Dono: o usuário (Product Owner).

Lista curta do que foi **adiado ou ainda não decidido**. O que está no plano de etapas não entra aqui.

**Regras:**
- Ideia nova durante uma etapa vem para cá, em **uma linha**, e **não** é feita na etapa em curso.
- O escopo é **congelado no checkpoint da Etapa 6**. Depois dele, só entra no plano o que o usuário aprovar.
- Para o item sair daqui: o usuário aprova e ele ganha etapa em `plano/`.

## Adiados (entram no fim do projeto, nesta ordem)

| ID | Item | Observação |
|---|---|---|
| B01 | **Sala de Foco** | Escopo ainda por definir com o usuário |
| B02 | **Integração com Anki** | Importar e/ou exportar cartões. Formato a definir |
| B03 | **Gerador automático de revisões** (1, 7 e 30 dias) | Por último, depois do Anki |

## Condicionais e técnicos

| ID | Item | Reavaliar quando |
|---|---|---|
| B04 | **Dropbox como provedor de sincronização** | Etapa 12, só se o teste Drive vs Dropbox favorecer (ver D32, D33) |
| B05 | **Migrar para TypeScript 7.x** | Quando o 7.1 e o typescript-eslint o suportarem (ver D06) |
| B06 | **Otimizador de parâmetros do FSRS no navegador** | Etapa 11, se for viável rodar sem servidor (ver D44) |
| B07 | **Novos blocos de mosaico** (ex.: Lembretes ou Agenda como bloco da Mesa) | Depois do checkpoint da Etapa 6, se as janelas de consulta não bastarem |

## Propostas visuais pedidas (13/11/2026, o usuário vai mandar o prompt; bancadas de até 3 versões, claro e escuro)

- **Tela de Configs/ajustes:** hoje só texto puro.
- **Janelas de cada mosaico** (opções ⋮, consulta, diálogos).
- **Barra de formatação do editor de anotações:** os botões parecem infantis.
- **Treino (revisão):** o cartão dentro do treino segue o visual do cartão novo (D138).
- **Erros visuais da Agenda:** título do painel do dia ("Sexta, 13") sem margem, vazando a borda do bloco; na visão de mês, os itens passam do tamanho do quadradinho e vazam (precisa limitar, por exemplo "+N").
- **Janela de atalhos (Alt /):** abre nos atalhos da tela atual, com navegação entre Todos, Só desta tela e Universais (os de toda tela, que não são todos os atalhos do app), tudo dividido por seção.
- **Aplicação do cartão novo (D138, D139):** adiada, ver `estado.md`.

## Conceitos a esclarecer

| ID | Item | Pergunta |
|---|---|---|

## Cortados (não voltam sem decisão explícita do usuário)

- Painel de estudo.
- Metas.
- Sequência de dias.

## Ideias novas

*(vazio; acrescente uma linha por ideia, com data)*
- 2026-11-05: **B09 Importar o backup .zip do app antigo** (matérias, aulas, anotações, cartões, provas) para o app novo, sem migrar código. Só depois da Fase B.
- 2026-11-05: Ideias que sobraram do legado, sem decisão: cloze nos cartões, suspender cartão, estudar só uma prova, limite de novos por dia, pomodoro, paleta de comandos no gerenciador de cartões, escolha do ícone de atalhos (o "?" do legado não agradou).
- 2026-11-05: Manter o app antigo no ar até o novo ter tudo o que o usuário usa.
- 2026-11-07: **Agenda (Etapa 9, regras em `regras.md`):** Mover e Sem aula na Prévia, aula avulsa, inverter quinzenal, editar a Grade pelo cronograma, prova só com a matéria, campos de prova (bimestre, conteúdo, local, observação), atrasados no topo da Lista, importar .ics como atalho da Grade.
- 2026-11-07: **Busca FTS** do SQLite quando a busca em memória ficar lenta. Fora da Etapa 7.
- 2026-11-07: **Busca dentro do PDF.** Fora da Etapa 10. (Anotar sobre o PDF: descartado pelo usuário.)
- 2026-11-07: **Lixeira visível:** hoje o que se exclui some da tela e fica marcado no banco (`deleted = 1`), com Desfazer por 10 s (Alt Z). Falta uma tela para ver e restaurar depois disso. Também falta o ⋮ por toque na régua de pastas (hoje só Alt O).
- 2026-11-07: **Ler o livro numa tela:** hoje o livro só se anexa e remove pelo ⋮ da matéria. Recomendação: janela de consulta. Também: anexar capítulo a uma aula.
- 2026-11-08: **Situação nova (No ritmo, Fora do alcance)** do ClaudeWeb: usuário ficou com a atual por ora. Reavaliar se a pergunta "ainda dá para salvar a matéria?" fizer falta.
- Tipo "Apresentação" na Agenda (hoje só aula, trabalho e compromisso), para aparecer no bloco de avaliações do Hub (D120).
- Notas: busca `/` na régua, metas por semestre ("Precisa no 2º bim."), janela de esquema com modelos 5 + 5 / 3 + 7 e "Mais opções" (D114) ainda não levadas ao app.
- 2026-11-12: Botões "Registrar falta" e "Novo evento" no calendário do Hub.
- 2026-11-13: Lista de cartões criados (aba "Salvos" da Mesa) virar uma lista de fato, não mais grade de cartões coloridos. Formato a definir em bancada, depois do editor de cartão novo.
- 2026-11-12: Três botões fora das peças da vitrine (Atualizar, ErrorScreen, Criar): trocar por peças. → aprovado na D166, a aplicar.
- 2026-11-13: Estilo de cantos "Contido" (bloco 16) como opção nas Configs (D143). Última tarefa do app, depois de todas as outras.

- Ajuda (Alt /): trocar de lista com ← → e Esc em dois passos pelo resolvedor central (hoje as abas só respondem a toque e Tab+Enter) (13/11). → aprovado na D166, a aplicar.
- Tabela nas Anotações: comandos da mini-barra (+ Linha etc.) só com mouse e toque; falta tecla para eles. Arrasto das linhas ainda sem teste com dedo no tablet (14/11). → aprovado na D166, a aplicar.
- Pré-existente: no primeiro clique depois de usar o teclado, `data-entrada` vira `toque` e os botões da faixa crescem no meio do clique (o clique pode cair no vizinho). Ver se vale só mudar para toque com `pointerType` de toque (14/11). → aprovado na D166, a aplicar.
- Cartão cloze (14/11): **superado pela D159** (letra de leitura, sem negrito pesado, verso claro com a frase). Histórico: melhor visual até agora = clássico B (`lab/livre/cloze-cartao/`, rodada 8): frente azul cheia com texto branco, `[…]` em azul-gelo e negrito, toda a frase em negrito na letra de voz; verso claro com a resposta no azul da frente, em negrito. Escrita `{{c1::resposta}}` (igual ao Anki). Aplicar em etapa própria (editor, Salvos, Treino, exportação Anki). Decidido na D157.
- Anexo de imagem (D161): limpar do banco as imagens de rascunhos descartados e de cartões apagados (`unusedImages` em `core/study/cardImages.ts` já acha quais) (14/11).
- ~~Vitrine não abre (erro no `FormatBar`)~~ corrigido na sessão da Lixeira (14/11).
- Lixeira (D164): avaliações do boletim excluídas não aparecem na lista (o título é cifrado; ficam lá 30 dias e saem). Imagem tirada de um cartão também não aparece (sem a linha `{img:}` ela não teria onde voltar) (14/11).
- Lixeira: ⋮ de toque (`MoreButton`, 44 px) em todo item escolhido que já tem Alt O, começando pela régua de pastas (LEIA-ME da bancada, 14/11).
- Tirar o painel de teste do FSRS do Treino (`treino/FsrsPanel.tsx`) quando acabar a fase de teste (pedido 15/11).
