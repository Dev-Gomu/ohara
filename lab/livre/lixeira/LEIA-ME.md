# Bancada: Lixeira (noite 14/11)

> **Decisão do usuário (14/11, D164): V2 aprovada.** Onde este texto diverge, vale a D164: a entrada fica no menu ⋯ do topo (D137), não em ícone solto; restaurar uma pasta devolve só a pasta (D92: excluir pasta deixa as aulas vivas, sem pasta).

Abrir: http://localhost:5173/ohara/lab/livre.html?ideia=lixeira (vale depois que a branch `bancadas/noite-14-11` vier ao main).
Estados para ver direto: `&cursor=2&menu=1` (⋮ aberto), `&confirma=1` (Apagar de vez), `&vazia=1`, `&busca=xyz` (busca sem resultado).

## O problema
Hoje o que se exclui some da tela e fica marcado no banco (`deleted = 1`), com Desfazer por 10 s (Alt Z). Depois disso não há como ver nem restaurar. Falta também o ⋮ por toque para excluir (hoje só Alt O).

## As versões
- **V1 · janela comum agrupada por tipo (recomendada).** Janela de consulta de 640 px, igual às outras. Busca no topo; lista em grupos (Matérias, Pastas, Aulas, Cartões, Provas, Anexos, Lembretes) com contagem. Cada linha: sigla, título, "excluída há 3 d · volta com 9 cartões · anotações · slides". O item a que faltam 7 dias ou menos ganha "some em 5 d" (texto, sem barra). A linha com cursor mostra **Restaurar** (botão principal) e **⋮** (Restaurar · Apagar de vez…).
- **V2 · janela larga com régua e prévia.** Tipos à esquerda (← → troca), lista no meio, prévia à direita com "na lixeira desde", "some em" e "volta junto". Mais informação, mas três colunas para uma lista que quase sempre tem poucos itens; duplica o que a linha já diz.
- **V3 · janela comum agrupada por data.** Hoje, Esta semana, Antes; o tipo vai no apoio. Bom para "apaguei sem querer agora há pouco", mas quem procura "aquela aula" pensa no tipo, não no dia. A busca já cobre o caso "acabei de apagar" (o item de hoje aparece no topo do seu grupo).

**Recomendação: V1.** Uma janela basta, sem tela nova; mesma forma das janelas de consulta; o agrupamento por tipo responde ao que a pessoa procura; tudo cabe em 1280 × 800.

## Onde a Lixeira mora (V1)
- **Ícone de lixeira** na barra do topo, entre **Notas** e **?** (mais um item do menu do topo, entra nas setas do menu como Faltas e Notas).
- **Paleta** (Alt P): comando "Lixeira" (entra em `CONSULT_WINDOWS`).
- **Aviso do Desfazer**: "Aula excluída · Desfazer Alt Z · **Ver lixeira**" (toque).
- Sem tecla própria (Alt sobra pouco); se o uso pedir, uma linha nova na tabela depois.

## Teclado (linhas da tabela de teclas, nada de keydown em componente)
| Tecla | Nível | Ação |
|---|---|---|
| ↑ ↓ | janela Lixeira, lista | anda entre os itens (atravessa os grupos) |
| Enter | lista | **Restaurar** o item com cursor; aviso "Voltou ao lugar" com Desfazer (Alt Z) |
| Alt O | lista | abre o ⋮ do item (Restaurar · Apagar de vez…); Enter no menu escolhe |
| Alt F | janela | vai à busca; ↓ volta à lista; Esc sai da busca |
| Enter / Tab | confirmação | o foco **nasce em Cancelar**: Enter sozinho nunca apaga. Tab até "Apagar de vez" + Enter apaga |
| Esc | janela | confirmação → menu → busca → fecha a janela, foco volta para onde estava |

Toque: tocar na linha escolhe; Restaurar e ⋮ aparecem nela (44 px). ⋮ → Apagar de vez… → confirmação com dois botões do mesmo tamanho (Cancelar, Apagar de vez em contorno de atenção, nunca cheio de branco no escuro).

**⋮ por toque em todo bloco:** o item escolhido de qualquer lista que já tem Alt O mostra o mesmo botão ⋮ (44 px) da linha da Lixeira, abrindo as mesmas opções (`blockOptions`). Começa pela régua de pastas, que hoje só tem Alt O.

## Regras de dados (para aplicar)
1. **Migração `006_lixeira.sql`** (a 005 é das imagens): em toda tabela com `deleted`, acrescentar `deleted_at TEXT` (quando) e `deleted_by TEXT` (id do item que foi excluído direto: a "raiz"). Excluir marca a raiz e todos os filhos ainda vivos com o mesmo `deleted_by`.
2. **A lista mostra só raízes** (`deleted = 1 AND deleted_by = id`). O "volta com" é a contagem dos filhos com o mesmo `deleted_by`.
3. **Restaurar traz junto exatamente o que a exclusão levou**: aula → seus cartões, anotações (são texto da aula: voltam sempre), slides e anexos, eventos ligados à aula; pasta → só a pasta (D92: as aulas ficaram vivas, sem pasta); matéria → pastas, aulas, cartões, provas, horários, eventos, faltas, livro. Um cartão apagado **antes**, sozinho, continua na lixeira como item próprio.
4. **Pai também na lixeira:** restaurar um cartão cuja aula está na lixeira restaura a aula junto (e avisa); o mesmo para aula sem matéria.
5. **Avaliação do boletim** (cifrada): aparece como "Avaliação de IMU" sem a nota; restaurar não precisa da chave.
6. **Apagar de vez** não some a linha: vira lápide (`deleted = 2`, conteúdo zerado, `updated_at` novo) para a sincronização não ressuscitar o item no outro aparelho; os bytes do arquivo saem do OPFS na hora.
7. **Limpeza automática: 30 dias** após `deleted_at`, ao abrir o app (mesma rotina de lápide do item 6). Por quê: é o prazo que todo mundo já conhece (Drive, Gmail), cobre o intervalo entre provas, e impede que PDFs de slides e livros apagados ocupem espaço e sincronização para sempre. Os últimos 7 dias aparecem como "some em N d" na linha.
8. Desfazer (Alt Z, 10 s) continua igual; restaurar pela Lixeira também ganha Desfazer.

## O que a aplicação vai mexer
- `src/data/migrations/006_lixeira.sql` + `migrationList.ts`; repositório: `listTrash`, `restore(id)`, `purge(id)`, `purgeOlderThan(30)`.
- `src/core/`: regra pura de "o que vai junto" e de prazo (`trash.ts`) com testes Vitest (raiz/filhos, pai na lixeira, lápide, 30 dias).
- `src/ui/study/undo.ts` (gravar `deleted_at`/`deleted_by`; "Ver lixeira" no aviso).
- `src/ui/shell/commands.ts` (comando Lixeira), `ScreenFrame.tsx` (ícone no menu do topo; `BlockIcon`/ícone novo "lixeira" 24 px traço 2).
- Janela nova `src/ui/shell/TrashWindow.tsx` com `Window` + `Field` + `SubjectPill` + `Button`; linha com ações vira peça (`TrashRow` ou extensão do `ListItem`) na vitrine, `npm run pecas`.
- Tabela de teclas (`core/keyboard/keys.ts`): ações da janela Lixeira acima; testes nascem da tabela. Playwright: um roteiro "excluir aula → Alt P lixeira → Enter restaura".
- `docs/decisoes.md` (Lixeira em janela, 30 dias, lápide) e `docs/teclado.md`.
