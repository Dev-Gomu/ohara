# Prompt: editor de criação de cartões do Ohara

Cole este texto numa conversa nova e anexe o .zip inteiro (ou as pastas `contexto/` e `imagens/`).

---

Você vai me ajudar a desenhar **o editor de criação de flashcards** de um app meu. Eu ainda não sei direito o que quero: parte do seu trabalho é me ajudar a descobrir. Leia os anexos antes de responder.

## Quem sou e como falar comigo
- Sou estudante de medicina e **não programo**. Sou o dono do produto.
- Responda em **português**, curto e direto, sem jargão técnico.
- Quando houver escolha, dê **uma recomendação clara**, não uma lista neutra.

## O app
Ohara é um app pessoal de estudo (roda no navegador, PC e tablet deitado; celular está fora de foco). A tela principal de aula se chama **Mesa** e tem três blocos lado a lado: **Slides**, **Anotações** e **Cartões**. Eu crio cartões **durante a aula**, olhando o slide e as anotações, e reviso depois numa tela de Treino.

Não quero mudar a Mesa nem o arranjo dos blocos. O trabalho é **só o que acontece dentro do bloco Cartões quando estou criando um cartão**.

## O que já existe (fatos)
- **Tipos de cartão:** simples (pergunta e verso) e cloze (frase com lacunas na escrita do Anki: `{{c1::resposta}}`; cada número vira um cartão).
- **O cartão é guardado como texto com marcas:** a primeira linha é a pergunta; as outras são o verso. Marcas do verso: `# título`, `## subtítulo`, `- item`, `1. item`, `**negrito**`, itálico, sublinhado, sobrescrito, subscrito, marca-texto. Também aceita imagens na frente e no verso. Detalhes em `contexto/core/`.
- **Como o cartão pronto aparece** (Treino e lista de salvos): uma peça só, com a **frente numa faixa azul cheia** e o verso claro embaixo, no mesmo contorno. Veja `imagens/` e `contexto/cartao/CardBack.*`.
- **Editor de cartões de hoje:** o próprio cartão é o editor; só a linha onde está o cursor vira texto cru. Código em `contexto/cartao/CardEditor.*`.
- **Editor de Anotações:** é um editor de texto rico de verdade (biblioteca Tiptap), com barra de formatação no topo do bloco, títulos, listas, tabela, marca-texto, atalhos de teclado. Você digita e o texto já aparece formatado, sem marcas cruas. Código em `contexto/anotacoes/`.
- **Atalhos atuais:** `contexto/docs/teclado.md` (procure "Editor (Anotações e Cartões)").

## O que já testei e o que achei
Tudo em protótipos, nada aplicado. Imagens em `imagens/`, código em `contexto/bancada/`.

| Ideia | O que era | Meu parecer |
|---|---|---|
| Texto puro | Um campo só, marcas cruas, sem ver o cartão | Recusei |
| Texto e prévia | Texto puro em cima, cartão pronto embaixo | Recusei nessa forma |
| Cartão pronto | Escrevo dentro do cartão já na forma final | Foi a melhor das três, mas ainda não é isso |
| Variações do cartão pronto | Só o cartão; com dois ícones; linha a linha | Vi e continuei insatisfeito |

## O que eu quero agora (com as minhas palavras)
- Um editor **mais parecido com o editor de Anotações**.
- Uma experiência **mais fluida e produtiva, pensada para usar só o teclado**.
- Quero **ver a prévia do cartão ao mesmo tempo** em que escrevo.
- O mais simples possível na tela.

Repare que há uma tensão aqui: eu recusei "texto em cima e prévia embaixo", mas quero ver a prévia. Parte do trabalho é descobrir **que tipo de prévia** eu quero (o próprio editor já formatado conta como prévia? prévia do verso só? prévia de como aparece no Treino? ao lado, embaixo, numa tecla?).

## Regras que qualquer proposta precisa respeitar
**Teclado (a regra mais importante do app)**
- Tudo se faz pelo teclado. O modificador do app é **Alt** (Alt + letra troca de bloco e abre menus); dentro de um campo de texto, teclas soltas e setas são do texto, e atalhos de formatação usam Ctrl.
- Três níveis de foco: menu, bloco, campo. **Enter desce, Esc sobe.**
- Teclado brasileiro ABNT2: não dependa de teclas que mudam de lugar nele.
- Toda ação com atalho também precisa funcionar com o dedo, com alvo grande (44 px).
- Diga sempre **quantas teclas custa** o caminho típico: criar um cartão simples, criar um cloze com duas lacunas, salvar e começar o próximo.

**Visual**
- Use só as cores e medidas de `contexto/estilo/tokens.css` (e `paletas.css`). Nada de cor solta.
- Sempre **tema claro e escuro**, desde a primeira versão.
- Tela calma e fria; o azul aparece só onde as teclas agem. Um botão principal por bloco.
- Proibido: fundo quente (amarelo, creme, areia), gradiente, divisórias, faixa colada na lateral, círculos (marcas são pílulas alongadas), branco cheio no tema escuro, metáforas médicas.
- O bloco Cartões costuma ser pequeno (por volta de 320 a 480 px de largura), mas pode ser alargado. A proposta tem de funcionar no pequeno.
- Resumo completo em `contexto/docs/diretrizes-visuais.md`.

**Produto**
- Não criar bloco novo na Mesa nem tela nova. Sem painel de metas, sequência ou estatística.
- O cartão final continua sendo a peça da faixa azul com o verso embaixo.
- A escrita do cloze continua compatível com o Anki (`{{c1::...}}`), mesmo que na tela apareça de outro jeito.

## Como quero que você trabalhe
1. **Primeiro, perguntas.** Faça até 5 perguntas para entender o que eu quero, **uma de cada vez**, cada uma com opções curtas e a sua recomendação. Se der para mostrar a diferença com um desenho pequeno em vez de texto, mostre.
2. **Depois, até 3 propostas** em protótipo que eu consiga **usar de verdade** (digitar, formatar, criar lacuna, salvar, ir para o próximo cartão), num único arquivo HTML interativo, com botão de tema claro/escuro e largura do bloco ajustável. Mostre também o caso difícil: verso longo com títulos e lista, e um cloze com duas lacunas.
3. Em cada proposta: uma frase de a favor, uma de contra, e a tabela de teclas.
4. Termine com **uma recomendação direta**.
5. Quando eu escolher, escreva um **resumo de entrega** para eu levar ao programador (outro Claude, que mexe no código): o que o editor faz, a tabela de teclas, os estados (vazio, escrevendo, pronto para salvar, salvo, erro), o que muda em relação ao editor de hoje, e as dúvidas técnicas que ficaram (por exemplo: usar o mesmo editor rico das Anotações e converter para o texto com marcas ao salvar, ou continuar em texto com marcas).

Não escreva código de produção do app. O protótipo é só para eu sentir a experiência.

## O que há nos anexos
- `imagens/`: a Mesa de hoje e os protótipos já testados (claro e escuro lado a lado).
- `contexto/estilo/`: cores, medidas e letras do app.
- `contexto/docs/`: diretrizes visuais e tabela de teclas.
- `contexto/cartao/`: o cartão pronto, o editor de hoje e o bloco Cartões.
- `contexto/anotacoes/`: o editor de Anotações e a barra de formatação.
- `contexto/core/`: as regras do texto do cartão (marcas, linhas, cloze).
- `contexto/bancada/`: os protótipos que já testei.
