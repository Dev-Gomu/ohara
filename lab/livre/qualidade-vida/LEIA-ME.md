# Bancada qualidade-vida (14/11/2026)

Pequenos consertos de uso que não dependem de gosto. Uma versão só (`v1.tsx`), uma seção por item, "Hoje" e "Proposta" lado a lado; nas seções 1 a 3 dá para clicar e testar as teclas.
Link (depois de trazer a branch ao main): http://localhost:5173/ohara/lab/livre.html?ideia=qualidade-vida

**Decisão (14/11): todas aprovadas (D166), a aplicar.**

**Recomendação:** aplicar tudo, nesta ordem: **3 (+5b) → 1 (+5d) → 5a+4 → 2 → 5c**. Cabe em duas sessões: a primeira com 3, 1 e 5d (teclado e entrada), a segunda com 4, 5a, 2 e 5c.

| # | Item | Tamanho | Prioridade |
|---|---|---|---|
| 3 | Botões crescem no clique do mouse | P | **Alta** (o clique cai no vizinho) |
| 5b | Bolha das Anotações aparece com mouse | (vem com o 3) | Alta |
| 1 | Ajuda: ← → e Esc em dois passos | M | Média |
| 5d | Ajuda reabre na última lista | (vem com o 1) | Média |
| 5a | Avisos um em cima do outro | P | Média |
| 4 | Botões fora da vitrine (Atualizar, Desfazer, erro, Criar) | P | Média |
| 2 | Tabela: comandos pelo teclado | M | Média |
| 5c | Desfazer vence com o app oculto | P | Baixa |

---

## 3. Botões crescem no primeiro clique do mouse (defeito)
- **Causa:** `src/ui/keyboard/listener.ts` (`onPointerDown`) despacha `{ type: 'touch' }` para **qualquer** ponteiro, e `store.ts:165` grava `data-entrada="toque"`. As regras `:root[data-entrada='toque']` aumentam os botões para `--alvo` (44 px) entre o apertar e o soltar do mouse; o `click` cai onde o botão vizinho passou a estar. Conferido no app (porta 5174): depois de Alt 2, um `pointerdown` com `pointerType: 'mouse'` muda `data-entrada` de `teclado` para `toque`.
- **Correção:** o toque passa a levar o tipo de ponteiro, e a entrada vira três valores: `teclado`, `mouse`, `toque`. Função pura nova em `core/keyboard` (ex.: `inputModeOf(change)`): dedo ou caneta → `toque`; mouse → `mouse`; tecla → `teclado`. No CSS, o que **esconde o cursor** vale para `mouse` e `toque` (`:not([data-entrada='teclado'])`, igual ao visual de hoje com mouse); o que **aumenta alvo** vale só para `toque`.
- **Arquivos:** `core/keyboard/focus.ts` (campo `pointer` na mudança `touch`), função nova + teste em `core/keyboard`, `ui/keyboard/listener.ts`, `ui/keyboard/store.ts`; CSS com `data-entrada`: `styles/base.css`, `Button`, `Controls`, `Block`, `Cards`, `FormatBar`, `acervo/Acervo`, `mesa/TableBar` (separar "esconde cursor" de "aumenta alvo").
- **Teste antes da correção:** Vitest: `inputModeOf({ type:'touch', pointer:'mouse' })` ≠ `'toque'`. Playwright (só teclado + um clique): Alt 2, Alt A, clicar com mouse num botão da faixa; `data-entrada` não é `toque` e a largura do botão não muda.
- **Sem tecla nova.**

## 5b. Bolha das Anotações aparece com mouse
- **Causa:** `NotesBlock.tsx:125` só mostra a bolha com `data-entrada === 'toque'` (D142: só no toque), mas hoje o mouse também vira `toque`.
- **Correção:** nenhuma linha própria; some com o item 3. Teste: no Playwright do item 3, selecionar texto com o mouse não mostra `[data-keep-field]`.

## 1. Ajuda: trocar de lista com ← → e Esc em dois passos
- **Causa:** em janela aberta, `resolveInOverlay` (`core/keyboard/resolve.ts`) devolve `null` para teclas soltas (são da janela, a Paleta precisa disso). A Ajuda não tem campo, então ← → se perdem; a lista escolhida é `useState` dentro de `HelpWindow.tsx`, fora do resolvedor.
- **Correção:** a lista da Ajuda passa a viver no estado de foco (`helpTab: 0 | 1 | 2` em `FocusState`). O contexto do resolvedor ganha qual janela está aberta; com a Ajuda aberta, ← → viram ação. Esc em dois passos dentro de `escape()` (`focus.ts`): se a janela é a Ajuda e `helpTab ≠ 0`, volta a 0; senão fecha. Abrir a Ajuda zera `helpTab` (resolve o 5d).
- **Linhas novas na tabela de teclas** (grupo "Sistema", valem só com a Ajuda aberta, como as `ADJUST_KEYS`: lista à parte `HELP_KEYS`):
  - `{ label: '→', code: 'ArrowRight', action: { type: 'helpTab', step: 1 } }` · "Próxima lista da Ajuda"
  - `{ label: '←', code: 'ArrowLeft', action: { type: 'helpTab', step: -1 } }` · "Lista anterior da Ajuda"
  - Esc já existe; muda só o redutor.
- **Toque:** as abas continuam tocáveis (já são). O X da janela fecha num passo só (toque não precisa do Esc em dois passos).
- **Testes:** `resolve.test.ts`: com `overlay: 'window'` e janela `help`, ArrowRight → `helpTab +1`; com a Paleta, ArrowRight continua `null`. `focus.test.ts`: Esc com `helpTab 2` → `helpTab 0` e janela aberta; segundo Esc fecha. `keys.test.ts` gera da lista nova.
- **Arquivos:** `core/keyboard/{keys,resolve,focus,actions}.ts` + testes, `ui/keyboard/listener.ts` (contexto com a janela), `ui/shell/HelpWindow.tsx` (lê `helpTab` do store).

## 5d. Ajuda reabre na última lista
- **Causa:** o `useState` da lista sobrevive enquanto o `HelpWindow` está montado; reabrir em outra tela mostra "Todos".
- **Correção:** vem com o item 1 (`openHelp` zera `helpTab`). Teste: `focus.test.ts`, `openWindow('help')` com `helpTab 2` → 0.

## 5a. Avisos um em cima do outro
- **Causa:** "Há uma versão nova" (`Shell.tsx`) e o aviso do Desfazer/notícia (`UndoBar.tsx`) usam o mesmo `.aviso` com `position: fixed` no mesmo lugar e mesma camada. Um esconde o outro (seção 4 da bancada, "Hoje · avisos").
- **Correção:** um contêiner de avisos no Shell (coluna, de baixo para cima) com os dois dentro; `.aviso` perde o `position: fixed`.
- **Arquivos:** `ui/shell/Shell.tsx`, `ui/shell/UndoBar.tsx`, `ui/shell/Shell.module.css`. **Teste:** e2e curto não precisa; conferir com `npm run tela` forçando os dois.

## 4. Botões fora das peças da vitrine
- **Hoje:** `Shell.tsx` (Atualizar) e `UndoBar.tsx` (Desfazer, o quarto encontrado) usam `Shell.module.css .botao`; `ErrorScreen.tsx` usa `ErrorScreen.module.css .botao`; `RulerCreate` (`components/Ruler.tsx`) é um `<button>` cru com `.criar`.
- **Proposta:** `Button variant="primary"` em Atualizar, Desfazer (com `shortcut="Alt Z"`) e Exportar banco; `Button` (plain) em Tentar de novo; `Button variant="quiet"` no Criar da régua. Os CSS `.botao` e `.criar` saem.
- **Peça muda:** `Button` ganha `autoFocus?: boolean` (a tela de erro abre sem o sistema de teclado e precisa do foco no primeiro botão). Rodar `npm run pecas` e pôr na vitrine.
- **Arquivos:** `components/Button.tsx`, `components/Ruler.tsx` (+ CSS), `shell/Shell.tsx`, `shell/UndoBar.tsx`, `shell/ErrorScreen.tsx` (+ CSS), `docs/pecas.md` (gerado).

## 2. Tabela nas Anotações: comandos pelo teclado
- **Causa:** a mini-barra (`mesa/TableBar.tsx`) só tem `onPress`; não há linha na tabela de teclas para os comandos.
- **Correção:** lista à parte `TABLE_KEYS` (como `ADJUST_KEYS` e `LINE_KEYS`), válida só no nível campo com o cursor numa tabela (contexto `inTable`, lido como `cardLineContext`). Alt Shift + seta está livre (Alt Shift só é usado com H J K L para trocar blocos).
  - `{ label: 'Alt Shift ↓', code: 'ArrowDown', mods: 'as', action: { type: 'tableAddRow', where: 'after' } }` · "+ Linha abaixo"
  - `{ label: 'Alt Shift ↑', code: 'ArrowUp', mods: 'as', action: { type: 'tableAddRow', where: 'before' } }` · "+ Linha acima"
  - `{ label: 'Alt Shift →', code: 'ArrowRight', mods: 'as', action: { type: 'tableAddColumn', where: 'after' } }` · "+ Coluna à direita"
  - `{ label: 'Alt Shift ←', code: 'ArrowLeft', mods: 'as', action: { type: 'tableAddColumn', where: 'before' } }` · "+ Coluna à esquerda"
  - `{ label: 'Alt ⌫', code: 'Backspace', mods: 'a', action: { type: 'tableDeleteRow' } }` · "− Linha"
  - `{ label: 'Alt Shift ⌫', code: 'Backspace', mods: 'as', action: { type: 'tableDeleteColumn' } }` · "− Coluna"
  - Em `ADJUST_KEYS`: `{ label: '=', code: 'Equal', shift: false, action: { type: 'tableEqualize' } }` · "Igualar colunas"
  - "Apagar tabela": sem tecla de propósito (destrutivo); fica o botão e o Ctrl Z do editor.
- **Toque:** os mesmos botões da mini-barra; a tecla aparece no botão (`shortcut`) só fora do toque, como o "Ajustar".
- **Testes:** `resolve.test.ts`: com `inTable`, Alt Shift ↓ → `tableAddRow`; sem `inTable`, Alt Shift ↓ → `null` (fica para o texto). `keys.test.ts`: sem colisão com as linhas existentes.
- **Arquivos:** `core/keyboard/{keys,resolve,actions}.ts` + testes, `ui/keyboard/listener.ts` (contexto), novo `ui/keyboard/tableContext.ts` (pequeno), `mesa/NotesBlock.tsx` ou `notesTools.tsx` (registrar as ações), `mesa/TableBar.tsx` (mostrar as teclas).

## 5c. Desfazer vence com o app oculto
- **Causa:** `ui/study/undo.ts` usa `setTimeout` de 10 s que corre com o app em segundo plano. No tablet, excluir, trocar de app e voltar já perdeu o Desfazer.
- **Correção:** pausar o prazo enquanto `document.hidden` (`visibilitychange` no próprio módulo; não é tecla, não fere D15) e retomar com o que faltava.
- **Teste:** Vitest com relógio falso: excluir, ficar oculto 30 s, voltar → Desfazer ainda existe; 10 s visíveis depois → some.

---

### O que não entrou (verificado e descartado)
- Suspeita de que o foco entrar num campo pelo teclado (Alt F) também vire "toque" pelo `focusin`: testado no Acervo, fica `teclado`. Não é defeito.

### Nota para quem roda a cópia `ohara-bancadas`
O `node_modules` da cópia é um atalho para o do app principal, e o Vite na 5174 recusa servir o `sqlite3.wasm` de fora da pasta: o app abre na tela de erro ("Algo inesperado..."). Para conferir o app ali, subi o Vite com uma configuração temporária que só acrescenta `server.fs.allow: ['..']` (arquivo apagado ao fim, nada commitado). Não afeta o main.
