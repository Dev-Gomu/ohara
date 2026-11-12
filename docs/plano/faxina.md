# Plano de faxina e retomada (12/11/2026)

**Status:** aprovado pelo usuário em 12/11/2026. Sessão 1 feita em 12/11/2026.
**Origem:** duas auditorias (consumo de créditos e pendências acumuladas). Este arquivo basta: não refaça as auditorias.
**Regra:** uma sessão por vez, na ordem. Ao fechar cada uma: marcar aqui como feita, `npm run salvar`, `/clear`.

## Por que (resumo das medições, 44 sessões)

- O gasto vem do tamanho da conversa, relida a cada passo: média de 176 mil tokens por passo; 92% dos tokens de entrada em passos acima de 100 mil. Sessão nova começa em ~65 mil (CLAUDE.md e memória são só ~4 mil disso).
- Logo: sessões curtas, retomada barata (um arquivo de estado) e menos papel velho para reler.
- 15 dos 26 planos e 7 memórias descreviam como pendente algo já feito ou substituído.

## Decisões do usuário (12/11/2026)

- **Identidade única: Ardósia refinada** (D115, D117, D119), como está em `src/ui/styles/tokens.css`, `src/ui/components`, `lab/vitrine.html` e `docs/diretrizes-visuais.md` (seções 3, 6 e 7). Fontes: Nunito, Inter, Source Sans 3 (D67).
- Todas as outras identidades, paletas, bancadas, layouts e direções visuais anteriores estão **descartadas**. Não consultar o usuário sobre elas, não preservar como opção futura.
- **Três paletas oficiais na mesma linguagem:** Ardósia padrão, A (azul-gelo) e B (cinza-índigo). A e B **não saem**; a sessão 3 confere se precisam de refino. Paleta só troca cor.
- Pendências antigas: o Claude encerra sem perguntar item a item. O usuário só entra em: ação externa, decisão funcional que não dá para inferir, aceite de visual novo.
- Assumido (o usuário não contestou): "ler o livro numa tela" vai ao backlog; varredura de telas fica depois das Etapas 11 e 12; aceites antigos (célula de dia D118, aviso Redimensionar, foco do cartão do Acervo D112, mouse, "+ Nova pasta") valem como estão no app; cores lima e damasco descartadas; bolinha das Faltas (D128) é exceção registrada ao "sem círculos".

## Sessão 1: faxina de papel (Sonnet). FEITA em 12/11/2026. Não toca em `src/`

1. Criar `docs/estado.md` (cabe em uma tela): onde estamos, próximo passo, arquivos envolvidos, "esperando o usuário", no máximo 3 iniciativas abertas.
2. Mover para `docs/arquivo/`: `plano/etapa-01` a `etapa-10` e `etapa-13`, `loop-telas`, `acervo-visual`, `foco-mosaico`, `linguagem-visual`, `identidade-tipografia`, `identidade-reformulacao`, `tipografia-seis-papeis`, `hub-layouts-brief`, `pedido-claudeweb-notas-agenda-treino`, `referencia-knowunity`, e `docs/briefing-identidade-fable.md`. Ficam em `plano/`: `_indice`, `etapa-11`, `etapa-12`, `roteiro-5min-publicacao`, este arquivo.
3. Reescrever `plano/_indice.md`: só a fila atual (sessões deste plano).
4. `backlog.md`: tirar linhas vencidas (pílula T/A da D103, "Cores mais confortáveis", B08, identidade do ClaudeWeb, layout do Hub 1920, "aplicar D113 e D114"). Acrescentar: ler o livro numa tela; botões "Registrar falta" e "Novo evento" no calendário do Hub; tipo "Apresentação"; três botões fora das peças (Atualizar, ErrorScreen, Criar); dividir `Grades.module.css`.
5. `decisoes.md`: conferir e fechar os "A VERIFICAR" (D06, D07, D12, D21; D43 fica até a Etapa 11); registrar a decisão da identidade única e das três paletas; mover decisões substituídas para `docs/decisoes-arquivo.md`.
6. `CLAUDE.md`: trocar "Leia antes de agir" por "abra `docs/estado.md` e, se precisar, a seção indicada em `docs/mapa.md`"; tirar a ordem de rodar `check` à mão (o hook e o `salvar` já rodam); acrescentar: fechar a sessão ao passar de ~35% do contexto, não trocar de modelo no meio, bancada e aplicação em sessões separadas, toda iniciativa termina como aplicada, recusada ou adiada; atualizar "Pendências abertas" e a lista de docs.
7. `docs/mapa.md`: atualizar; `scripts/salvar.sh` passa a rodar `node scripts/mapa.mjs`.
8. Memórias: apagar as de estado (`linguagem-visual-concluida`, `notas-redesenho-estado`, `identidade-reformulacao-estado`, `retomar-agenda`, `acervo-estado-atual`, `provas-hub-cartoes-estado`, `foco-mosaico-estado`, `hub-layouts-pendente`, `retomar-tipografia-direcao-arte`, `cores-tentativas-rejeitadas`, `giz-descartada-ardosia-fica`). Antes, guardar numa só memória as lições de como propor visual (claro primeiro, testar o caso extremo, até 3 versões, recomendação direta). Ficam as de gosto. Atualizar `MEMORY.md`.
9. Remover as tarefas agendadas `etapas567` e `mapa-projeto-ohara` (já executadas).

**Pronta quando:** `docs/plano/` só tem os 5 arquivos; `estado.md` cabe em uma tela; nenhuma memória descreve estado de trabalho; `check` passa; commit feito.

## Sessão 2: faxina visual (Sonnet)

1. `lab/`: ficam `index.html`, `_sala.css`, `_sala.js`, `vitrine.html`, `vitrine/` e `provas-dias.html` (modelo de bancada). **Antes de apagar, conferir o que a vitrine importa de `pecas-novas/`.** Apagar o resto (o git guarda o histórico). Pôr `DayItem` e `FaultCell` na vitrine.
2. Apagar `docs/prototipos/` e corrigir a citação na D82.
3. **Mover** (não apagar: nunca entraram no git) as pastas `*-claudeweb/` e os `.zip` da raiz para `../ohara-arquivo/`.
4. Tirar `public/prototipo-teclado/` e as exceções em `vite.config.ts`, `eslint.config.js` e `.prettierignore`; ajustar a citação em `docs/teclado.md`.
5. `tokens.css`: remover variáveis do foco antigo que nenhuma peça usa (conferir cada uma com busca).
6. `diretrizes-visuais.md`: virar checklist de uma página; o resto vai para `diretrizes-visuais-referencia.md`. Corrigir o cabeçalho ("Transição" está vencido).
7. **Não** remover as paletas A e B.

**Pronta quando:** busca por "giz", "anil" e "paleta c" não acha nada fora de `docs/arquivo/`; `check` e `e2e:curto` passam; commit feito.

## Sessão 3: três paletas (Fable na bancada, Sonnet no código). FEITA em 12/11/2026 (D132)

Bancada única com Ardósia padrão, A e B lado a lado, dois temas, foco testado. Refinar A e B só onde destoarem (contraste, azul de ação, cores de matéria). Dar nome a cada uma em Configs e mostrar na vitrine.
**Pronta quando:** o usuário aceitou as três; Configs mostra três opções com nome; lint visual passa; decisão registrada.

## Sessão 4: publicação (Sonnet) — FEITA em 12/11/2026

Resolver o teste "Agenda: prova nova aparece no Hub" (descobrir se é defeito do app ou do teste; o CI roda o e2e antes do deploy). O usuário cumpre `roteiro-5min-publicacao.md`. Juntar `telas-3-a-9` ao `main` e publicar **só com pedido explícito do usuário**.
**Pronta quando:** todos os testes passam; o site no ar mostra a versão nova.

## Sessão 5: Etapa 11, Treino com FSRS (Opus)

Conforme `etapa-11.md`. **Pronta quando:** critérios do plano cumpridos; roteiro de 5 minutos entregue; publicado.

## Sessão 6: Etapa 12, sincronização (Opus, modo de plano)

Conforme `etapa-12.md`. Fecha a Etapa 13 (teste das Notas em outro aparelho). **Depende do usuário cadastrar as origens no Google Cloud antes.**
**Pronta quando:** critérios do plano cumpridos; publicado.

## Sessão 7 em diante: varredura (Sonnet)

Acervo, Treino e Configs só com peças da vitrine, uma tela por sessão. Junto: dividir `Grades.module.css`.

## O que é só do usuário

1. Sessão 3: aceitar as três paletas.
2. Sessão 4: fazer o roteiro de 5 minutos e pedir a publicação.
3. Antes da sessão 6: Google Cloud.
