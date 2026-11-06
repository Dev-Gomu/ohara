# Etapa 1: fundação

**Status:** pronta para o Claude Code. Data: 05/11/2026.
**Modo:** normal (sem modo de plano). **Leia antes:** `CLAUDE.md`, `docs/visao.md`, `docs/decisoes.md` (D01 a D12, D45, D48 a D50, D52 a D54).

## Objetivo

Deixar de pé um app **vazio, mas completo no que o cerca**: compila, é verificado por um comando, é publicado sozinho no GitHub Pages e instala como PWA. Nenhuma tela real ainda. Tudo o que vier depois se apoia nesta base, então ela precisa estar correta.

## Antes de começar (o usuário faz)

- Criar o **repositório novo** no GitHub e dar acesso ao Claude Code. Nome sugerido: `ohara` (confirmar).
- Colocar `CLAUDE.md` na raiz e `visao.md`, `decisoes.md`, `backlog.md` e a pasta `plano/` em `docs/`.
- Manter o app antigo fora do repositório, em pasta ao lado, somente leitura.

## Escopo

1. **Verificar versões antes de fixar** (marcadas `A VERIFICAR`): TypeScript 6, Vite 8, React 19, Tiptap 3, vite-plugin-pwa 1.3+ e ts-fsrs. Confirmar compatibilidade entre elas. Se alguma não existir ou divergir, escolher a alternativa mais próxima e **registrar a troca** em `decisoes.md` (D06, D07, D11, D12, D43). Instalar agora só o que a etapa usa; Tiptap e ts-fsrs ficam só verificados.
2. **Projeto:** Vite + React + TypeScript estrito (`noUncheckedIndexedAccess`), CSS Modules, arquivo único de variáveis CSS (tema claro e escuro, só as variáveis básicas).
3. **Estrutura de camadas** (D45): `src/core/`, `src/data/`, `src/ui/`, cada uma com um arquivo mínimo e um teste. Regra de lint que **falha** se `core` importar qualquer coisa, se `data` importar algo além de `core`, ou se `ui` importar `data`.
4. **Portão único:** `npm run check` = `tsc --noEmit` + ESLint + Vitest. Saída curta. Mais `npm run dev` e `npm run build`.
5. **Prettier** automático por hook e **Dependabot** com atualizações agrupadas (D49). Hook de verificação ao final da sessão: **confirmar o formato atual do hook de parada** e registrar (fecha D54).
6. **CI e deploy:** GitHub Actions roda `check` em todo push e faz **deploy no GitHub Pages só se passar** (D02).
7. **PWA mínima:** manifest, ícone provisório, service worker pelo vite-plugin-pwa, **aviso de nova versão com atualização por um toque**. Tela única com o nome "Ohara" e o número da versão.
8. **Isolamento do app antigo (obrigatório, D02):** o domínio `dev-gomu.github.io` é compartilhado. Definir `base` do Vite igual ao nome do repositório, `scope`, `start_url` e `id` do manifest dentro desse caminho, e service worker restrito a ele. Criar uma **constante única** com o prefixo dos nomes de banco (ex.: `ohara-`), mesmo sem banco ainda. Documentar em uma linha no `CLAUDE.md` se o nome final mudar.
9. **Hooks e regras:** `.claude/rules/` só se houver regra por pasta que valha o custo. Não criar por obrigação.
10. **README curto** com: o que é, como rodar, como publicar.

## Fora de escopo (não fazer)

Teclado, mosaico, telas, SQLite, Tiptap em uso, sincronização, cifra, qualquer dado fictício. Se surgir ideia, uma linha em `backlog.md`.

## Critérios de pronto (verificáveis)

| # | Critério | Como verificar |
|---|---|---|
| 1 | `npm run check` passa do zero (clone limpo, `npm ci`) | Rodar o comando |
| 2 | Violar uma camada **faz o check falhar** | Colocar temporariamente um import proibido em cada uma das três regras e ver o lint falhar; desfazer |
| 3 | `npm run build` gera o app sem erro nem aviso de tipo | Rodar o comando |
| 4 | O CI roda no GitHub e fica verde; com um teste quebrado de propósito, o **deploy não acontece** | Ver a aba Actions |
| 5 | O endereço do Pages abre o app e mostra nome e versão | Abrir a URL |
| 6 | O app **não interfere no app antigo**: abrir os dois no mesmo navegador, cada um com seu service worker e escopo | DevTools, aba Application |
| 7 | Instala como PWA no Chromium | Botão de instalar do navegador |
| 8 | Depois do primeiro acesso, o app **abre sem internet** | Modo avião ou DevTools offline |
| 9 | Publicar uma versão nova faz aparecer o **aviso de atualização**, que atualiza com um toque | Publicar duas versões em sequência |
| 10 | `decisoes.md` registra as versões realmente fixadas e as trocas (máx. 5 linhas novas) | Ler o arquivo |

## Roteiro de 5 minutos (o usuário)

1. Abra o endereço do Pages no Chromium. Veja "Ohara" e a versão.
2. Instale pelo navegador. Abra pelo ícone instalado.
3. Ative o modo avião e feche e abra o app. Ele deve abrir.
4. Peça ao Claude Code para trocar o número da versão e publicar. Reabra o app e toque no aviso de atualização. A versão nova deve aparecer.
5. Abra o app antigo no mesmo navegador. Ele deve continuar funcionando como antes.
6. Repita os passos 1 e 2 no tablet.

Se algum passo falhar, a etapa **não** está pronta.

## Ao terminar

- Relatório curto: o que foi feito, versões fixadas, trocas registradas, o que ficou pendente.
- Atualizar a seção "Comandos" do `CLAUDE.md` se algo mudou.
- Parar. O usuário faz `/clear`. A próxima etapa (2, teclado) só começa com `teclado.md` aprovado.

## Pontos de atenção

- O Firefox não instala PWA no Linux (D03). Testar a instalação no Chromium.
- Não criar `localStorage` para nada que importe.
- Se a verificação de versões mostrar incompatibilidade séria, **parar e perguntar** ao usuário, com recomendação, antes de seguir.

## Acréscimo (05/11/2026): referência do legado
- O app antigo foi congelado como **legado** em 05/11/2026 e continua no ar em `https://dev-gomu.github.io/ohara-teste/app/` (e `/prototipo/`). O repositório novo deve ter **nome diferente** de `ohara-teste` para não colidir no mesmo domínio.
- No isolamento (item 8), além do prefixo `ohara-` de banco, use prefixo próprio também em `localStorage` e no nome do cache do service worker (o legado usa banco `ohara` e dados no mesmo site). Sugestão: `ohara2-`.
- Kit de consulta do legado em `referencia-legado/LEIA-ME.md`. Nesta etapa só serve para o ícone provisório e as cores iniciais (`tokens-legado.css`); não é necessário abri-lo para o resto.
