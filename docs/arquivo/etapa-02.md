# Etapa 2: teclado

**Status:** aprovada pelo usuário, pronta para o Claude Code. Data: 06/11/2026.
**Modo:** modo de plano (D53). **Modelo:** Opus, esforço high.
**Leia antes:** `CLAUDE.md`, `docs/teclado.md`, `docs/decisoes.md` (D08, D14 a D20, D45, D46, D50, D61). Consulte `public/prototipo-teclado/teclas.js` e `app.js` só como referência de comportamento: é um rascunho em JavaScript, reescreva em TypeScript.

## Objetivo

Criar a **única autoridade do teclado**: uma tabela de teclas como dado, um resolvedor puro, um listener e os três níveis de foco. Depois desta etapa, tecla nova é uma linha na tabela, e a ajuda e os testes acompanham sozinhos. É a causa nº 1 dos problemas do legado, então a etapa só fecha com as regras impostas por máquina, não por boa intenção.

## Escopo

**Núcleo (`src/core/keyboard/`, TypeScript puro, com testes):**

1. **Tabela de teclas (`keys.ts`):** as **70 teclas** de `teclado.md` (as 71 do protótipo menos `Alt ;`, D61). Cada linha tem: grupo, rótulo do ABNT2, `code`, modificadores, níveis, ação e texto da ajuda. Sem a ação genérica `note` do protótipo: **cada linha tem ação própria e tipada**, mesmo que nada a execute ainda.
2. **Resolvedor (`resolve.ts`):** função pura. Entrada `{code, key, modificadores, isComposing, repeat, contexto}`, saída ação ou nulo (D15). Contexto = nível de foco + janela aberta (nenhuma, janela de consulta/ajuda/Paleta, menu ⋮).
3. **Níveis de foco (`focus.ts`):** função pura `(estado, ação) → estado` para Enter, Esc e movimento entre níveis, seguindo D17 e D18. Comportamento já testado no protótipo, que deve ser mantido:
   - Esc no nível menu não faz nada.
   - Alt J no nível menu desce para o bloco. Alt H e Alt L andam entre os itens do menu, em círculo.
   - Alt H J K L no nível campo troca de bloco e **continua no nível campo**.
   - Sem vizinho na direção pedida, nada acontece.
4. **Vizinho (`neighbor.ts`):** a função `neighbor` do protótipo, com testes. Recebe retângulos, sem saber nada de tela.

**Interface (`src/ui/keyboard/`):**

5. **Listener único:** um `keydown` no `document`, em captura, que monta o contexto, chama o resolvedor e despacha a ação. Havendo ação, chama `preventDefault` e `stopPropagation`. Sem ação, não toca no evento.
6. **Foco acompanha o toque:** tocar ou clicar num campo ou bloco atualiza o nível de foco. Use `focusin` e `pointerdown`, que não são `keydown` e não violam a regra. Sem isso, teclado e toque ficam dessincronizados.
7. **Ajuda gerada:** janela aberta por `Alt /` e `F1`, montada só a partir da tabela, agrupada e fechada por Esc. Usa o diálogo do React Aria (D08), que entra como dependência nesta etapa. O Esc continua sendo do listener: ele fecha a janela pelo estado, e não pelo tratamento interno do React Aria.
8. **Bancada de teclado:** tela provisória para testar a etapa, abaixo de nome e versão: uma barra de menu e três blocos fixos com um campo cada, mostrando nível atual, bloco em foco e **última ação recebida**. Serve só para o roteiro. Sai quando a Etapa 3 ou 4 a substituir.

**Regras impostas por máquina:**

9. **Lint contra `keydown` solto:** `no-restricted-syntax` que falha para `onKeyDown`, `onKeyUp`, `onKeyPress` e `addEventListener('keydown' | 'keyup' | 'keypress')` em `src/`, exceto no arquivo do listener único.
10. **Testes gerados da tabela (D16):** para cada linha, um teste que resolve a ação nos níveis listados e nulo nos outros. Mais um teste de **conflito**: nenhuma combinação de `code` + modificadores + nível aparece duas vezes.
11. **Um roteiro no Playwright (D50):** só com teclado, na bancada, cobrindo Enter, Esc, Alt H J K L, `Alt /` e digitação num campo. Comando próprio `npm run e2e`, **fora do `check`** para o hook continuar rápido, e rodando no CI antes do deploy.

## Regras novas a implementar e registrar

Vieram da análise do protótipo. Registre em `decisoes.md` (até 5 linhas):

| Regra | Por quê |
|---|---|
| **AltGr nunca é atalho.** Se `getModifierState('AltGraph')` for verdadeiro, o resolvedor devolve nulo | No ABNT2, AltGr+1, 2 e 3 digitam ¹ ² ³ e AltGr+Q digita `/`. Em alguns sistemas o AltGr chega como Ctrl+Alt, o que dispararia `Ctrl Alt 1` (Título 1) no meio do texto. O protótipo não trata isso |
| **Composição e teclas sem código devolvem nulo:** `isComposing`, `key === 'Dead'` ou `code` vazio | Acentos do ABNT2 e o teclado virtual do Android não podem disparar nada |
| **Repetição por linha:** só movimento e troca de página repetem ao segurar a tecla. Alt S, Alt W, Alt M e parecidas ignoram `repeat` | Segurar Alt S abriria e fecharia o bloco sem parar |
| **Com janela aberta,** só Esc age. Teclas soltas seguem para a janela (a Paleta precisa de setas e digitação). Teclas com Alt ou Ctrl da tabela são engolidas, sem ação | Evita `Alt ←` voltar a página do navegador com a janela aberta. Decisão do usuário: `Alt 1` a `6` também ficam bloqueadas, primeiro Esc, depois a tecla |
| **Playwright fora do `check`,** dentro do CI | Mantém o portão rápido (D48) sem abrir mão do roteiro (D50) |

## Fora de escopo (não fazer)

- Seis telas, Paleta de verdade, tema (Etapa 3). `Alt 1` a `6` e `Alt P` só aparecem como "última ação" na bancada. O que acontece com o nível de foco ao trocar de tela fica para a Etapa 3.
- Mosaico, trocar blocos de lugar, redimensionar (Etapa 4). `Alt Shift H J K L` e similares só aparecem como "última ação".
- Editor: `Ctrl B` e companhia são resolvidas e testadas, mas nada as executa. **Nota para a Etapa 8:** o Tiptap traz atalhos próprios. Como o listener corre primeiro e para o evento, as ações da tabela é que chamarão os comandos do Tiptap.
- Mexer em `public/prototipo-teclado/`: ele fica no ar até o teste do tablet. A remoção é uma tarefa da Etapa 6.

## Critérios de pronto (verificáveis)

| # | Critério | Como verificar |
|---|---|---|
| 1 | `npm run check` passa | Rodar o comando |
| 2 | Todas as 70 teclas de `teclado.md` estão na tabela, e `Alt ;` não está | Teste gerado, mais comparação com o documento |
| 3 | Duplicar uma linha da tabela **faz o check falhar** | Duplicar de propósito, ver o teste falhar, desfazer |
| 4 | Criar `onKeyDown` num componente **faz o check falhar** | Criar de propósito, ver o lint falhar, desfazer |
| 5 | `src/core/keyboard/` não importa nada fora de `core` | Lint de camadas |
| 6 | No campo, letras, setas, Enter, Tab, AltGr e teclas mortas resolvem para nulo | Testes do resolvedor |
| 7 | A ordem do Esc segue D18: janela, menu ⋮, depois sobe um nível; no nível menu não faz nada | Testes de `focus.ts` |
| 8 | Toda linha da tabela aparece na ajuda, e a ajuda não tem texto escrito à mão | Teste que compara as duas |
| 9 | Tocar num campo põe o nível em campo | Roteiro do Playwright ou teste de interface |
| 10 | `npm run e2e` passa, e roda no CI antes do deploy | Rodar o comando e ver a aba Actions |
| 11 | Nenhum arquivo passa de ~300 linhas | Conferir |

## Roteiro de 5 minutos (o usuário)

Publicar exige seu pedido. Ao terminar, o Claude Code pede autorização e sobe a versão, porque sem isso o aviso de atualização pode não aparecer.

1. No PC, abra o Ohara instalado e toque em **Atualizar**. A bancada deve aparecer.
2. Aperte **Enter** e **Esc** e veja o nível mudar entre menu, bloco e campo. No nível menu, Esc não faz nada.
3. No nível bloco, ande com **H J K L**, depois com as **setas**. No campo, as mesmas teclas devem digitar e mover o cursor.
4. No campo, digite um texto com acentos e `AltGr 1`, `AltGr 2` e `AltGr Q`. Tudo deve aparecer normalmente, sem nenhuma ação na tela.
5. Aperte **Alt /**. Confira se a ajuda mostra os atalhos, e feche com **Esc**. Repita com **F1**.
6. Teste as teclas que o navegador também usa: **Alt ←**, **Alt →**, **Alt F** e **Ctrl P**. No campo, teste **Ctrl K**, **Ctrl E** e **Ctrl M**. O app mostra a ação e o navegador **não pode** fazer nada junto (voltar página, abrir menu, imprimir). Isso fecha a pendência do PC em `teclado.md`.
7. Toque ou clique num campo e confirme que o nível mudou para campo. Aperte **Esc** para sair.
8. Se puder, repita os passos 2 a 7 no tablet. Não trava esta etapa, mas o teste do tablet é obrigatório antes do checkpoint da Etapa 6.

Se algum dos passos 1 a 7 falhar, a etapa **não** está pronta.

## Ao terminar

- Relatório curto: o que foi feito, dependências novas, decisões registradas, pendências.
- Atualizar `teclado.md` (pendência do passo 6) e o `CLAUDE.md`: comando `npm run e2e`, faixa de IDs e a pendência "tabela final de atalhos", que está velha. Limpar D20 e D54 de "Pendências consolidadas" em `decisoes.md`.
- Parar. O usuário faz `/clear`. A Etapa 3 só começa com `telas.md` e as diretrizes visuais prontos.

## Pontos de atenção

- **Tablet não testado.** O Android pode entregar `e.code` ou modificadores de outro jeito. A tabela é dado, então corrigir depois é trocar linhas. Não crie exceção por aparelho sem relatório real.
- **Layout físico:** `IntlRo` é o `/`, `BracketRight` é o `[` e `Backslash` é o `]`. Os nomes dos códigos enganam, então confie em `teclado.md`.
- **Ctrl fora do campo** resolve para nulo e o navegador age normalmente, exceto `Ctrl P`, que é da Paleta em todos os níveis.
- **React Aria:** confirme no plano que o diálogo aceita o fechamento controlado com o Esc parado em captura, e que o foco volta ao lugar certo. Se não der, pare e registre a alternativa antes de seguir.
- **Bug de teclado vira teste antes de virar correção.**
