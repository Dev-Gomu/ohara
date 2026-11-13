# Auditoria de arquitetura e custo (12/11/2026)

Pergunta: como a estrutura do projeto pode baratear cada ciclo de trabalho e soltar a experimentação visual. Medidas feitas por script; estimativa de tokens: ~10 por linha de código, ~1 por 4 caracteres de texto.

## 1. Diagnóstico (onde os créditos vão)

| Fonte de custo | Medida | Peso |
|---|---|---|
| **Ler o que a tela usa** | Para mexer numa tela, o código dela tem 230 a 870 linhas, mas o que ela importa soma **860 a 2.600 linhas** (3 a 4 vezes mais). Ex.: Acervo 506 próprias + 1.770 de dependências; Mesa 867 + 2.594. Hoje não há jeito de saber *como usar* uma peça sem abrir o arquivo dela. | **Alto** |
| **Experimentar visual** | A bancada atual é um HTML de 839 linhas escrito à mão (`provas-dias.html`) e três versões no mesmo arquivo. Ao aprovar, tudo é **reescrito** em React + CSS Module: o experimento é pago duas vezes. | **Alto** |
| **Manter os docs** | Desde 01/11, 226 alterações em `docs/` contra 568 em `src/`: **~28% das edições são papelada**. Cada sessão fecha mexendo em estado, plano, índice, decisões e backlog. | **Médio** |
| **Experimento quebra o portão** | O `eslint` também lê `lab/`. Um rascunho com erro faz o `check` falhar e o hook de parada me devolve o erro **a cada resposta**. Isso pune a experimentação. | Médio |
| Custo fixo da sessão | CLAUDE.md 8,6 KB (~2,4 mil tokens) + índice da memória 1,4 KB + `estado.md` 1,5 KB. Razoável; dá para cortar ~1/3 do CLAUDE.md. | Baixo |
| Docs grandes | `decisoes.md` 30 KB, `mapa-gerado.md` 22 KB, `diretrizes-visuais-referencia.md` 23 KB. Só pesam se lidos inteiros; o `mapa-gerado` só lista a 1ª linha de cada arquivo, o que não poupa a leitura do código. | Baixo |

**O que está saudável e não deve mudar:** nenhuma tela importa outra (só Agenda e Hub usam Faltas e Notas, de propósito); camadas `core/data/ui` limpas; arquivos ≤ ~360 linhas; peças centralizadas em `src/ui/components`; `npm run tela` barato. Reorganizar pastas **não** se paga.

Pontos de convergência (mais importados): `core/study/types` (36), `ui/keyboard/store` (31), `ui/study/study` (30), `NavItem`, `Block`, `navigation`. São os arquivos que hoje acabo abrindo em quase toda tarefa.

## 2. Simulação de 5 tarefas-tipo (leitura para entender)

| Tarefa | Hoje | Com as mudanças da seção 4 |
|---|---|---|
| Mudar uma tela (ex.: Acervo) | ~10 a 20 mil tokens (tela + peças + store) | ~6 a 8 mil (tela + cartão de peças) |
| Criar uma peça nova | ~6 mil (vitrine, peças vizinhas, tokens) | ~3 mil (cartão + tokens) |
| Regra nova no `core` | ~3 a 5 mil (já é bem isolado) | igual |
| Tecla nova | ~5 mil (`keys.ts` 316 linhas + teste) | igual; não compensa mexer |
| Experimento com 3 versões e 3 ajustes, depois aprovado | ~10 mil para escrever + ~2 a 4 mil por ajuste + ~10 mil para reescrever no app ≈ **25 a 30 mil** | ~5 mil para escrever + ~1 a 2 mil por ajuste + ~2 mil para promover ≈ **10 a 12 mil** |

## 3. Opções comparadas para o ambiente de experimento

| Opção | Economia | Liberdade | Manutenção | Veredito |
|---|---|---|---|---|
| A. Como hoje (HTML solto + Sala) | Ruim: reescrita ao aprovar | Média | Nula | Fica só para esboço de 1 tela parada |
| **B. Lab em TSX: uma pasta por ideia, um arquivo por versão, peças reais ou novas, dados de mentira** | **Boa**: ajuste mexe num arquivo pequeno; aprovar = mover o arquivo | **Alta**: animação, interação, tema próprio | Baixa: reaproveita o Vite e a Sala | **Recomendada** |
| C. Página no claude.ai (Artifact) | Ruim: não usa as peças nem os CSS reais, cada versão reenvia a página inteira, reescrita ao aprovar | Alta; abre no tablet por link | Nula | Só se você quiser ver longe do PC |
| D. Ramo ou cópia do app modificado | Ruim: mexe no produto antes da hora | Alta | Alta (conflitos) | Recusada |
| E. Storybook ou similar | Média | Alta | Dependência nova pesada; a vitrine já faz o papel | Recusada |

## 4. Recomendação (em ordem, uma sessão curta cada, Sonnet basta)

1. **Lab livre** (maior ganho):
   - `lab/livre/<ideia>/` com `v1.tsx`, `v2.tsx`, `v3.tsx` (máx. 3), cada um podendo trazer CSS próprio e ignorar a identidade. Um `lab/_dados.ts` com dados de mentira prontos (matérias, aulas, provas), para nenhum experimento inventar dados.
   - `lab/` fora do `eslint` e do hook: rascunho nunca trava o portão.
   - Promoção: a versão aprovada vira peça em `src/ui/components` (mesmo código, só troca cor/raio soltos por tokens) e entra na vitrine.
   - Limpeza: ao decidir, a pasta sai (o git guarda) e fica uma linha em `decisoes.md`. Nada fica "em estudo".
   - Opcional: `npm run dev -- --host` para abrir o lab no tablet pela rede de casa.
2. **Cartão de peças gerado**: estender `scripts/mapa.mjs` para gravar `docs/pecas.md` com o que cada peça, a store e `ui/study` exportam (nome, props, ações), em ~200 a 300 linhas. Regra nova: para usar uma peça, leia o cartão, não o código. Substitui a parte de `src/` do `mapa-gerado.md`.
3. **Fechamento enxuto**: ao fim da sessão, só `estado.md` (e `decisoes.md` quando houver decisão). Plano, índice e backlog só quando mudarem de fato. CLAUDE.md aparado (tirar o que já está em docs, como detalhes do legado e das pendências).

**O que não fazer:** reorganizar pastas, separar o app em pacotes, adotar Storybook ou trocar a pilha. Custam mais do que devolvem num app de ~15 mil linhas.

## 5. Decisões para registrar (só com o seu aceite)
- Lab livre em TSX, fora do lint e do hook, uma pasta por ideia, máx. 3 versões, limpa ao decidir.
- Cartão de peças gerado substitui a leitura do código das dependências.
- Fechamento de sessão mexe só em `estado.md`, salvo decisão nova.
