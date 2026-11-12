# Ohara

App pessoal de estudo de medicina (PWA). **Projeto novo, reescrito do zero.** A fonte da verdade é `docs/`, não o app antigo.

## Leia antes de agir
- Abra `docs/estado.md` (onde estamos e próximo passo). Se precisar de mais, a seção indicada em `docs/mapa.md`; não leia docs grandes inteiros.
- `docs/visao.md` (para quem é, o que NÃO faremos, glossário); `docs/decisoes.md` (D01 a D131: busque por ID com grep; não contrarie uma `Decidida` sem avisar); `docs/backlog.md` (ideias novas, uma linha).
- `docs/diretrizes-visuais.md`: obrigatório antes de propor ou mudar layout.
- `docs/plano/_indice.md` e o arquivo da sessão atual. Planos antigos ficam em `docs/arquivo/` e não são fila.
- `docs/teclado.md`, `docs/telas.md`, `docs/regras.md`: só quando a sessão os citar.

## O usuário
Estudante de medicina, **não programa**, é o Product Owner. Responda em **português**, curto e direto, sem enrolação. Explique em linguagem simples, sem jargão. Economize créditos: não releia arquivos à toa e não repita o que já está nos docs.

## Comandos
(criados na Etapa 1; ajuste esta seção se mudarem)
- `npm run check`: tipos (`tsc --noEmit`), lint e testes. **Portão único**, igual no CI e no hook.
- `npm run e2e`: build e roteiros do Playwright. Fora do `check`, roda no CI antes do deploy (D66).
- `npm run dev`: servidor local (http://localhost:5173/ohara/). `npm run build`: build de produção.
- Sala de protótipos: `npm run dev` e abrir http://localhost:5173/ohara/lab/. Um HTML por experimento em `lab/`, usando os CSS reais do app; fora do build e do `check`. Teste visual antes de mexer em `src/`: veja `lab/_sala.js` (barra de tema, paleta, largura) e copie `lab/provas-dias.html`.
- Prefixo de tudo que fica no navegador: **`ohara2-`** (`src/core/appInfo.ts`). Base do site: `/ohara/`. Node: `.nvmrc`.
- O hook e o `npm run salvar` já rodam o `check`: não o rode à mão a cada passo. Saída curta: não cole logs longos.

## Economia de créditos (obrigatório)
- **Conferir visual:** `npm run tela -- [caminho] --teclas "Alt+3,Enter" --sel "[data-block='x']"` (precisa do `npm run dev`). Gera `.telas/<saida>.jpg` com claro e escuro lado a lado, pequeno; leia só esse arquivo. Bancada: `npm run tela -- "lab/x.html?v=a"`. Use o navegador do app só se o usuário pedir ou para algo que o script não faz.
- **Sempre os dois temas desde a primeira versão.** Nunca julgue só o claro.
- **Bancadas com no máximo 3 versões.** Teste o estado de foco antes de recomendar.
- **Testes:** `npm run check` ao fim de cada mudança; `npm run e2e:curto` só ao fim da etapa (a falha "Agenda: prova nova aparece no Hub" já existe e não é sua).
- **Commit:** `npm run salvar -- "mensagem" "Co-Authored-By: ..."` roda o check e commita só as pastas do app. Só quando o usuário pedir.
- **Edição:** prefira Edit em arquivo já lido. Script Python de substituição só com `assert` em cada troca (falha silenciosa custou retrabalho).
- **Sessão curta:** uma etapa por sessão; ao fechar uma, sugira `/clear`. Não releia docs que já estão no contexto.

## Camadas (o lint falha o CI se violadas)
```
src/core/  TypeScript puro, SEM imports: teclado, mosaico, notas, agenda, sync, FSRS
src/data/  Worker SQLite, migrações, repositórios. Importa só core
src/ui/    React. NUNCA toca o SQLite
```
- Interfaces `Storage`, `SyncProvider` e `Auth` separam implementação de uso.
- Arquivos de até ~300 linhas. Divida antes de passar disso.

## Stack
TypeScript 6 estrito (`noUncheckedIndexedAccess`), Vite 8, React 19, React Aria Components (só menus, diálogos, janelas de consulta, réguas), CSS Modules + variáveis CSS (sem Tailwind), Tiptap 3, vite-plugin-pwa, SQLite wasm no OPFS, ts-fsrs.
Versões marcadas `A VERIFICAR` em `decisoes.md`: confirme antes de fixar e registre a troca.

## Teclado (regra mais crítica do projeto)
- **Um único listener** no `document`, em fase de captura, chama o **resolvedor puro** em `core/`. Ele é a única autoridade.
- **Nunca** crie `keydown` em componente. Se precisar de tecla nova, ponha na **tabela de teclas** (dado), que gera a ajuda e os testes.
- Modificador **Alt**. Use `e.code`, não `e.key` (teclado ABNT2).
- Três níveis de foco: menu, bloco, campo. Enter desce, Esc sobe. Ordem do Esc: janelas, depois menu, depois sobe nível.
- No campo, teclas soltas e setas são do texto.
- Toque é cidadão de primeira classe: toda ação com atalho também funciona com o dedo, com alvos grandes.

## Dados
- O **banco é a única fonte da verdade**. Estado de tela (mosaico, foco) fica em memória.
- **Nunca** caia em memória em silêncio se o OPFS falhar: mostre diagnóstico e erro.
- IDs **UUID**, exclusão lógica, migrações `.sql` numeradas, sem ORM.
- Salvar ao trocar de tela, ao ocultar o app e antes de sincronizar.
- Notas do boletim são **cifradas** antes de gravar e sincronizar. Não confunda com **Anotações** (texto das aulas).

## Visual: use a vitrine (obrigatório)
- Antes de montar ou mudar qualquer tela, abra `lab/vitrine.html` (`npm run tela -- "lab/vitrine.html"`) e monte **só com as peças de `src/ui/components`**. Não redesenhe peça dentro da tela. Peça nova só em bancada, com aceite do usuário.
- Cor só por papel (`--cor-*`) e raio só por token (`--raio-*`). `npm run lint` roda `scripts/lint-visual.mjs` e falha com cor, raio ou tamanho de letra solto em CSS fora de `src/ui/styles/`. Exceção rara: comentário `lint-visual-ok: motivo` na linha.

## Isolamento do app antigo
O mesmo domínio do GitHub Pages já hospeda o app antigo. Use **nomes de banco únicos** e **escopo próprio do service worker**. O código antigo fica em pasta ao lado, **somente leitura**, e não é copiado: só `docs/regras.md` descreve o comportamento aproveitado.

## Estilo de código
- Funções pequenas e puras no `core/`. Nomes de código em inglês; textos da interface e docs em português.
- Sem dependência nova sem motivo. Se for necessária, registre em `decisoes.md`.
- Sem comentários que repetem o código. Comente só o "porquê".
- Tipos explícitos nas fronteiras. Sem `any`.

## Testes
- **Vitest** em Node para o `core/`: toda regra nova tem teste.
- **Playwright** só em poucos roteiros feitos só com teclado.
- Teste de teclado nasce da tabela de teclas. Bug de teclado vira teste antes de virar correção.

## Como trabalhar
- **Uma etapa por sessão.** Termine a etapa, rode `check`, e pare. O usuário faz `/clear` entre etapas.
- Modo de plano nas Etapas 2, 7 e 12. Sem subagentes, salvo se pedido.
- Fora do escopo da etapa: **não faça**. Anote em `docs/backlog.md` (1 linha).
- Decisão nova: registre em `docs/decisoes.md` (até 5 linhas por etapa, formato da tabela).
- Dúvida de produto (o que o app deve fazer): **pergunte ao usuário**, em uma pergunta objetiva, com sua recomendação. Dúvida técnica: decida e registre.
- Ao final de cada etapa da Fase A, entregue um **roteiro de 5 minutos** para o usuário testar, em passos numerados.

## Não faça
- Não migre código nem dados do app antigo.
- Não crie painel de estudo, metas, sequência, novos blocos de mosaico, nem mais de um bloco do mesmo tipo.
- Não adicione servidor, contas ou backend.
- Não use `localStorage` para dados que importam (use o banco).
- Não publique nem faça `git push --force` sem pedido do usuário.

## Pendências abertas (ver `decisoes.md` e `estado.md`)
Argon2 ou PBKDF2 (Etapa 12), conta Dropbox (só se o teste favorecer), formato do hook de parada. Paleta e componente da Paleta já decididos (D13, D130, D131).

## Disciplina de sessão
- Feche a sessão ao passar de ~35% do contexto; não troque de modelo no meio.
- Bancada e aplicação no app ficam em sessões separadas.
- Toda iniciativa termina como **aplicada, recusada ou adiada** (nada fica "em estudo").

## Referência rápida do legado (acréscimo de 05/11/2026)
Há um kit de consulta barato em `referencia-legado/` (fora deste repositório, em `../Dev_Ohara/referencia-legado/`). Comece por `referencia-legado/LEIA-ME.md`: ele diz o que abrir. Contém resumo dos gostos do usuário, capturas de cada tela (tablet e PC, claro e escuro), cores e medidas (`tokens-legado.css`), atalhos (`teclado-legado.js`) e o histórico de decisões antigo (só com `grep`). É **só referência de comportamento e visual**: não copie código nem dados. Projeto antigo completo: `../PROJETO ESTUDO` (tag `legado-2026-11-05`), somente leitura. Proibido no visual, herdado do legado: tarja/faixa colada na lateral ou no topo e "lua minguante" em blocos; cartões de uma peça, cantos bem arredondados; sem divisórias, sem gradiente.
