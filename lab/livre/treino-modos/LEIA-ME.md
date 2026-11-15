# Treino em dois modos (D180): roteiro de aplicação

Aprovado pelo usuário em 15/11/2026. Modelo visual: esta pasta.
- Ao abrir: http://localhost:5173/ohara/lab/livre.html?ideia=treino-modos&v=1
- Personalizado: http://localhost:5173/ohara/lab/livre.html?ideia=treino-modos&v=2
- Estados vazios: http://localhost:5173/ohara/lab/livre.html?ideia=treino-modos&v=3

Conferir com `npm run tela -- "lab/livre.html?ideia=treino-modos&v=2" --sel ".tm-pilha"`. Não redesenhe: copie o arranjo de `_tela.tsx` e `tm.css`.

## O que a tela é
Substitui a escolha atual do Treino (`src/ui/screens/treino/TrainingChoice.tsx`, `Inicio.module.css`). Coluna de 880 px no centro (nos dois sentidos), sempre em **duas metades iguais**:
1. **Modos** (escolha única, marcada só pelo fundo `--cor-escolhido`): "Todos os cartões" (padrão) | "Personalizado". No pé de cada um, o total de cartões do recorte.
2. Só no Personalizado: **Ano** | **Bimestre** (ilha da régua, `inicio.regua` + `periodoItem`; aceitam vários, o marcado leva visto).
3. Só no Personalizado: **Disciplina** (busca Alt F + grade de 5 colunas com a peça real: sigla, número, "hoje"/"em dia"; aceita várias; marcada = fundo de escolhido + selo azul no canto de fora) | **Aulas** (cabeçalho de bloco com "N de M"; grupos por disciplina e bimestre com `SubjectPill`; aulas recuadas com a caixa `treino.marca`; rola por dentro).
4. **Barra**: número grande, "cartões para hoje", linha de apoio com os novos; à direita "Limpar filtros" (só no Personalizado), "Iniciar treino" (Enter) e ⋮ (Exportar para o Anki; só com o cursor no bloco ou no toque, `fimDiscreto`).

## Regras (todas aprovadas)
- **Sem marcação não restringe:** categoria vazia vale "todos". Dentro da categoria é "ou"; entre categorias é "e".
- **Alcance:** todos os anos, inclusive arquivados (D179). `core/study/scope.ts` hoje exclui arquivados e só aceita uma disciplina (`Scope.subjectId`): passa a aceitar vários anos, bimestres, disciplinas e aulas.
- **Só o que existe:** Ano e Bimestre mostram só os que têm cartões. A bancada mostra 6 anos como caso extremo.
- **Aulas vazio:** sem disciplina marcada, o bloco diz "Marque uma disciplina para escolher aulas." e não recebe cursor. Desmarcar a disciplina desmarca as aulas dela.
- **Número ao vivo:** a barra e o pé do Personalizado mudam a cada marcação.
- **Sem cartões no recorte:** botão "Nada para treinar", desativado (v3). Há cartões mas nenhum para hoje: "Adiantar", como já é hoje (`docs/telas.md`, seção 4).
- **Lembrar:** ao abrir o Treino, o modo é sempre "Todos os cartões" e o cursor nasce no Iniciar (Enter começa). Os filtros do Personalizado ficam lembrados da última vez (dado que importa: banco, não `localStorage`); "Limpar filtros" zera.
- Mais de 14 disciplinas: linha "+ N disciplinas · digite para buscar" (`TILE_LIMIT`, `capTiles` em `core/study/subjectTiles.ts`).

## Teclado (entra na tabela de teclas, nunca em componente)
- Blocos na ordem: Modos, Ano, Bimestre, Disciplina, Aulas, Barra. Setas levam ao vizinho (esquerda/direita entre as metades, cima/baixo entre as fileiras).
- Modos: ← → troca e já escolhe. Ir para Personalizado abre os filtros; voltar a Todos fecha (sem apagar os filtros lembrados).
- Ano, Bimestre, Disciplina, Aulas: setas andam, Enter ou Espaço marca e desmarca. Alt F vai à busca da Disciplina.
- Barra: Enter inicia. Limpar filtros é botão comum (propor tecla só se sobrar uma livre; registrar).
- Esc sobe um nível; nada de `keydown` em componente. Toque faz tudo (alvos de 44 px).

## Ordem sugerida (uma sessão cada)
1. **Core:** `scope.ts` com vários anos/bimestres/disciplinas/aulas, arquivados incluídos, contagens e descrição; filtros lembrados; testes (`scope.test.ts`, `subjectTiles.test.ts`).
2. **Tela e teclas:** `TrainingChoice.tsx` dividido em arquivos de até ~300 linhas, CSS por token (o `tm.css` usa só tokens), tabela de teclas, e2e do Treino, vitrine e `npm run pecas` se nascer peça (candidatas: cartão de modo, selo de marcada).

## Fora desta aplicação (backlog)
Filtro por Prova, limite diário de novos, modos raros do ⋮, baralhos montados à mão.

Ao terminar: apagar esta pasta, atualizar `docs/telas.md` (seção 4), `docs/teclado.md` e `docs/estado.md`.
