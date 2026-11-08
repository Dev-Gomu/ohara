# Foco visual dos blocos: plano de implementação (Etapa 7)

**Status:** desenho fechado com o usuário em 08/11/2026. Falta aplicar no app. Nada disto está em `src/` ainda.
**Referência de cor:** paleta A (`src/ui/styles/paletas.css`), tema claro primeiro, depois o escuro.
**Bancadas (sala de protótipos, `npm run dev` e http://localhost:5173/ohara/lab/):** `foco-mesa.html` (indicador do bloco, rótulos, dentro do bloco) e `foco-casos.html` (itens de lista, rolagem, movimento reduzido). Servem de gabarito visual.
**Modelo sugerido:** Sonnet 5.5. Chame o Opus só se aparecer conflito com a regra 3.1 das diretrizes ou com o anel do nível menu.

## O que foi decidido

| # | Assunto | Decisão |
|---|---|---|
| 1 | Bloco em foco (nível bloco) | **F2**: contorno de **4 px por dentro** (`outline-offset: -4px`), cor `--cor-bloco-ativo` a **70%**. No app, usar a **cor sólida equivalente** (mistura de 70% da cor ativa sobre o `--cor-cartao`), não transparência: menos processamento e mais compatível. Calcular uma por tema e por paleta, ou `color-mix` já resolvido em variável. Substitui o anel escuro de 3 px por fora (`.anel` em `base.css`) **nos blocos**. |
| 2 | Dentro do bloco (Enter) | **D1**: contorno afina para a borda de 2 px da cor ativa (como `data-foco='dentro'` já faz hoje). O item recebe o sinal de foco (regra 6). |
| 3 | Rótulo do bloco | **L1, só na Mesa**: ícone fantasma no lugar do nome (20 px, traço de 2, opacidade 45%); no bloco em foco ou dentro, o ícone acende na cor `--cor-bloco-ativo` (100%). Nome inteiro só em `aria-label` e na dica (`title`). Ícones: Slides = tela com pé, Anotações = lápis, Cartões = cartas (SVGs em `lab/foco-mesa.html`, objeto `ICONE`). |
| 4 | Rótulo nas outras telas | **Nome escrito continua**, e no bloco em foco ou dentro ele passa de `--cor-texto-2` para `--cor-bloco-ativo`. Blocos sem título visível (Provas, Matérias do Acervo, Agenda e Prévia da tela Agenda) seguem sem título. |
| 5 | Blocos sem foco | **Nenhum recuo.** Não escurecem nem esmaecem (Slides precisa estar sempre legível). |
| 6 | Item em foco dentro de lista | **I3a**: o item "sobe" para o fundo do bloco (`--cor-cartao`) com contorno de 4 px por dentro (`outline-offset: -4px`), mesma cor sólida do item 1. Se o item também estiver **selecionado**, mantém o fundo de marca (`--cor-marca`) e soma o contorno. Substitui o anel escuro `.anel-interno` **nos itens de lista** (cartões, aulas, linhas). |
| 7 | Toque | Tocar num bloco entra direto no nível dentro. Com dedo: sem anel/contorno de teclado; ficam a borda D1 e o ícone aceso. Os sinais de teclado voltam na primeira tecla (já existe `data-entrada`). |
| 8 | Mouse | Hover no bloco não muda nada. Hover no item mostra borda fina (diretrizes 3.2). Clique = toque. |
| 9 | Janela ou Paleta aberta | O véu escuro de hoje cobre a tela; o bloco em foco continua com o contorno por baixo. |
| 10 | Rolagem | Contorno é por dentro, então não é cortado. Item com contorno por dentro fica inteiro na beira da lista. |
| 11 | Movimento reduzido | `prefers-reduced-motion`: sem os 200 ms de esmaecimento da borda (`--tempo-borda` já vai a 0 em `tokens.css`; garantir que cobre o contorno novo). |
| 12 | Escopo | Vale em **todas as telas**. Só o ícone (item 3) é exclusivo da Mesa. |

Recusados no caminho (não refazer): F1 anel por fora, F3 fundo tonal, F4/F5 rótulo em pílula cheia no foco; rótulos R1 a R8 (inicial, círculo, pílula, nome em pílula, ícone com inicial) e L2; recuo P1 a P3; D2, D3; itens I1, I2, I3b, I3c, I3d, I3e.

## Passos

1. **Tokens** (`src/ui/styles/tokens.css` e `paletas.css`): variável do contorno em cor sólida (item 1) por tema e paleta; manter `--anel-traco` e `--anel-afastamento` só para o anel do **menu** (número da tela) e botões. Espessura do contorno de bloco e de item: 4 px.
2. **Bloco** (`src/ui/components/Block.tsx` e `Block.module.css`): trocar a classe `anel` do nível bloco por contorno F2 (`outline` por dentro). Manter a borda D1 de 2 px em `data-foco='dentro'`. Título passa à cor ativa quando `data-foco` existe.
3. **Rótulo com ícone na Mesa**: nova prop no `Block` (ex.: `icon`), usada só em `Mesa.tsx`, `CardsBlock.tsx` e `NotesBlock.tsx`. Ícones em `src/ui/components/` (SVG inline, sem dependência). `aria-label` e `title` com o nome.
4. **Item em foco** (`src/ui/components/NavItem.tsx` e `base.css`): a classe `anel-interno` vira o estilo I3a (fundo do bloco + contorno por dentro 4 px). Cuidar de `ring="anel"` (régua e botão "Abrir", que ficam como estão, no anel escuro) e de `Notas.tsx` e `Faltas.tsx`, que usam `anel-interno`. Respeitar item selecionado (`--cor-marca`).
5. **Toque, mouse e janelas**: conferir que `data-entrada='toque'` desliga o contorno de bloco e de item novos; conferir o véu das janelas e a ordem do Esc (não muda).
6. **Diretrizes e decisões**: atualizar `docs/diretrizes-visuais.md` seção 3.1 (anel forte vira contorno por dentro; anel escuro fica só no menu) e a tabela 3.2; registrar em `docs/decisoes.md` (até 5 linhas, próxima ID livre: D105 em diante) e no `docs/plano/_indice.md`.
7. **Testes**: `npm run check` e `npm run e2e` (os roteiros de teclado podem checar classe `anel`; ajustar o seletor se mudar). Conferir no navegador, claro e escuro, paleta A, em 1280×800 e PC, e com `?exemplo`.
8. **Roteiro de 5 minutos para o usuário**, em passos numerados, ao final.

## Cuidados

- Não criar `keydown` em componente (regra do teclado). Nada aqui mexe em teclas.
- Arquivos até ~300 linhas; `Block.module.css` e `base.css` são pequenos, mas confira antes de somar.
- Celular está fora de foco; não conferir nem corrigir.
- As bancadas em `lab/` não entram no build nem no `check`. Pode apagar `lab/foco-*.html` só se o usuário pedir.
