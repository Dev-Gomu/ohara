# Treino com o cartão novo (D138)

Link: http://localhost:5173/ohara/lab/livre.html?ideia=treino-cartao&v=todas
Parâmetros úteis: `&estado=frente|verso`, `&cor=on` (cor nos títulos), `&dens=compacta`, `&extremo=1` (frente longa + verso com muitas seções), `&largura=1920`.

## Rodada 2 (parecer: V1, com botões Errei/Difícil/Bom/Fácil sóbrios, na cor de destaque)
Layout da V1 nas três; muda só a cor dos quatro botões (nada de rosa/verde):
- **V1 · Um tom só.** Fundo suave do destaque e texto no destaque, igual nos quatro.
- **V2 · Contorno.** Só contorno no destaque; "Bom" (o mais usado) preenchido.
- **V3 · Rampa.** Quatro intensidades do destaque, de Errei (mais fraco) a Fácil (mais forte).
Recomendação: **V2** (guia o olho para o Bom sem cor de semáforo). Claro e escuro conferidos. Prazos nos botões ficam de fora, como na V1.
Link: http://localhost:5173/ohara/lab/livre.html?ideia=treino-cartao&v=todas

## Rodada 3 (13/11: aprovada a V2 da rodada 2, notas em contorno; falta só o topo do cartão)
Queixa: a faixa azul com texto preto na frente não combina com o app. As três tiram a faixa; contorno do cartão mais calmo.
- **V1 · Lisa.** Pergunta no mesmo fundo do cartão, na cor do texto.
- **V2 · Destaque.** Pergunta na cor de destaque, sem fundo.
- **V3 · Peça.** Pergunta numa peça interna de tom suave, com folga e canto próprio.
Sem parecer: substituída pela rodada 4 (as classes `tc-f1` a `tc-f3` seguem em `treino.css`).

## Rodada 4 (13/11: a partir de duas imagens de referência do usuário; modelo em `_ref.tsx`)
Referência: frente cheia de azul com a pergunta centrada e rótulo "Frente"; verso com rótulo "Verso", título e seções em duas colunas com títulos azuis e caixas. Adaptado: sem tarja lateral, sem linha divisória, sem fundo quente. Notas em contorno (V2 da rodada 2) nas três; sem botão "Ver resposta" (toca no cartão ou Espaço).
- **V1 · Fiel.** Frente cheia no azul de ação, texto claro; verso em duas colunas com peças.
- **V2 · Limpa.** Mesma frente; verso em duas colunas sem peças.
- **V3 · Suave.** Frente cheia em tom suave do destaque, texto escuro; verso com peças.
Parecer (13/11): **V2 aprovada** (frente cheia no azul de ação, verso em duas colunas sem peças).

## Rodada 5 (13/11: só o título do verso, que repete a pergunta; base V2 da rodada 4)
- **V1 · Pouco.** 17 px, peso 600, cinza: quase do tamanho do texto.
- **V2 · Moderado.** 24 px, negrito, cor do texto.
- **V3 · Muito.** 24 px numa peça azul cheia (a cor da frente), com folga e canto próprio.
Parecer (13/11): **recusada** (título dentro do verso não agradou); virou a rodada 6.

## Rodada 6 (13/11: estilo Anki; frente e verso como estão, mas ao revelar a pergunta fica no topo da tela, fora do verso)
- **V1 · Dois cartões.** A frente azul encolhe e fica em cima; o verso vem num cartão abaixo.
- **V2 · Texto solto.** A pergunta vira título da tela, centrada, sem cartão; verso no cartão abaixo.
- **V3 · Dois cartões, frente suave.** Como a V1, com a pergunta em tom suave.
Parecer (13/11, após teste no tablet): **V1 DECIDIDA (D150)**.

### Estresse da rodada 6 (`&extremo=2`: caso clínico de ~620 letras na frente + verso longo)
Sem ajuste, a pergunta no topo tomava mais da metade da tela e espremia o verso. Regra adotada nas três versões: a letra da pergunta encolhe em dois degraus (até 140 letras, até 360, acima disso) e fica alinhada à esquerda no maior; no topo, a pergunta ocupa no máximo ~38% da altura e rola dentro; na frente, rola dentro do cartão se passar.

### Teste no tablet (13/11)
`&cheia=1` faz a tela de Treino cobrir a bancada inteira; dar a nota volta para a frente. Servidor aberto à rede de casa: configuração `ohara-rede` em `.claude/launch.json` (porta 5180, `--host`); no tablet, `http://<IP do PC>:5180/ohara/lab/livre.html?ideia=treino-cartao&v=1&cheia=1`. Conferido em 820x1180 e 1180x820 pelo `npm run tela`; falta o parecer no aparelho.
