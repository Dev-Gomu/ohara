# Criador de cartões: pedido de propostas (para o Fable)

**Pedido do usuário (14/11/2026):** 3 sugestões de como será o **mosaico do criador de flashcards**, coesas com o app. É uma pergunta aberta: não há direção, preferência nem forma esperada. Proponha o que achar melhor.

## Para não enviesar
- **Não abra** `lab/livre/criar-cartao/` nem `lab/livre/pilula-cloze/` e não use o resumo da linha "ADIADA" do `docs/estado.md` antes de propor. São tentativas antigas; o usuário quer olhar de novo sem elas.
- Não há decisão anterior a respeitar sobre esta tela. As regras gerais do projeto (abaixo) continuam valendo.

## O que já existe (fatos, não direção)
- **Para quem:** estudante de medicina; cria cartões **durante a aula**, junto do slide e das anotações, e revisa depois no Treino (`docs/visao.md`).
- **Onde vive hoje:** bloco **Cartões** da **Mesa** (`src/ui/screens/mesa/`: `CardsBlock`, `CardEditor`), ao lado de Slides e Anotações. Abas Novo e Salvos. Ver na tela: `npm run tela -- "" --teclas "Alt+Digit2"`.
- **Tipos de cartão:** **simples** (pergunta e verso) e **cloze** (frase com lacunas na escrita do Anki, `{{c1::resposta}}`; um cartão por número; vários `c1` na mesma frase saem no mesmo cartão). Regras puras em `src/core/study/` (`cloze.ts`, `cardLines.ts`, `cardFormat.ts`, `cardImages.ts`).
- **O que o cartão já aceita:** formatação no verso (títulos `#` e `##`, listas, negrito, itálico, sublinhado, sobrescrito, subscrito, marca-texto), imagens na frente e no verso, exportação para o Anki.
- **Onde o cartão aparece depois:** lista Salvos na Mesa, Acervo e Treino (frente e verso; o cloze tem frente com a lacuna escondida).

## Regras do projeto que valem para qualquer proposta
- `CLAUDE.md` inteiro, em especial: **teclado** (um único listener, teclas na tabela, Alt como modificador, três níveis de foco), **toque** com alvos grandes, **peças de `src/ui/components`** (`docs/pecas.md`, `lab/vitrine.html`), cor e raio só por token, **dois temas** desde a primeira versão.
- `docs/visao.md`: o que **não** faremos (por exemplo, nada de novos tipos de bloco na Mesa nem dois blocos iguais).
- `docs/diretrizes-visuais.md` antes de propor layout. Foco em **PC e tablet deitado** (celular fora de foco).
- Bancada no lab livre (`lab/livre/<ideia>/v1..v3.tsx`, máx. 3 versões), dados de mentira em `lab/_dados.ts`. Nada em `src/` até o usuário escolher.

## Entrega esperada
Três propostas rodáveis no lab livre, conferidas em claro e escuro, com uma frase de prós e contras em cada uma e uma recomendação direta.
