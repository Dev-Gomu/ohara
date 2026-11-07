# Ohara: diretrizes visuais

**Status:** versão 2, em vigor. Data: 07/11/2026.
**Papel:** define como cada tela é pensada, navegada e desenhada. Vale para toda proposta de layout, em qualquer tela.
**Fontes:** `visao.md`, `teclado.md`, `decisoes.md`, código de `src/core/keyboard/`, biblioteca de elementos e Acervo do ClaudeWeb, capturas da Rodada 2 e gostos registrados do legado.
**Valores exatos:** `src/ui/styles/tokens.css`. **Para testar o fluxo com as mãos:** `diretrizes-visuais-demo.html`.

As regras marcadas com **[proposta]** nasceram propostas e foram decididas (D70 a D74). Já estão no código e em `teclado.md`.

## 1. Princípio

**Toda mudança de layout deve deixar o fluxo por mosaicos mais curto, mais previsível e completo pelo teclado.**

O layout não é decoração sobre a navegação: ele **é** a navegação. Onde um bloco fica define qual seta chega até ele. Por isso a posição das coisas é decidida pelo caminho do usuário, e só depois pelo desenho.

Quando dois critérios entram em conflito, vale esta ordem:
1. **Não perder o lugar.** O usuário sempre sabe onde as teclas estão agindo.
2. **Menos teclas** no caminho mais usado.
3. **O dedo faz tudo** que o teclado faz.
4. **Leitura confortável** por horas.
5. **Beleza e identidade.**

## 2. Modelo de navegação

### 2.1 Três níveis

| Nível | O que é | Teclas soltas |
|---|---|---|
| **Menu** | A barra de telas (1 a 6) | ← → trocam o item; ↓ desce aos blocos |
| **Bloco** | Um painel do mosaico, visto de fora | Setas e H J K L vão ao bloco vizinho; Tab percorre os blocos |
| **Campo** | O interior do bloco | Dependem do tipo de campo (abaixo) |

Enter desce, Esc sobe (D17). Alt H J K L age em qualquer nível e **mantém o nível**: de dentro de uma lista, Alt L chega ao campo do bloco à direita sem subir e descer.

### 2.2 Dois tipos de campo [proposta, D70]

Hoje o código só conhece campo de texto, e a régua de bimestres e a lista de aulas não têm onde morar. A regra abaixo resolve isso:

| Tipo | Exemplos | Setas e H J K L | Enter |
|---|---|---|---|
| **Campo de texto** | Anotações, busca, formulário | São do texto (D19) | É do texto |
| **Campo navegável** | Lista de aulas, régua de bimestres, grade de matérias, calendário | Andam entre os itens | Faz a ação principal do item |

A régua de bimestres é **um bloco com campo navegável**. Ela não é nível menu: nesse nível só existe a barra de telas, e Esc ali não faz nada (D17).

### 2.3 Regras das setas [proposta, D71]

1. **Eixo:** um controle usa só o eixo dele. Régua usa ← →. Lista usa ↑ ↓. Grade usa os dois.
2. **Seta do outro eixo sai:** na régua, ↓ vai ao bloco de baixo. Na lista, → vai ao bloco da direita. O código do nível menu já faz isso.
3. **Borda sai:** na primeira aula, ↑ sobe para a régua.
4. **Segurar a tecla não atravessa a borda.** Quem segura ↓ para na última aula. Sair exige apertar de novo.
5. **Controle interno não dá a volta.** Do último item não se pula para o primeiro. Só a barra de telas dá a volta.

### 2.4 Enter segue o fluxo

Enter sempre leva adiante, para o próximo passo natural:

- Na **régua de filtro**, Enter entra no conteúdo filtrado, já no primeiro item.
- Na **lista**, Enter abre o item.
- No **cartão de matéria**, Enter abre a matéria.

**A seleção segue o foco nos filtros e nas listas.** Andar pela régua já filtra, e andar pela lista já troca a prévia. Ninguém precisa confirmar para ver o resultado.

### 2.5 Esc e a volta [proposta, D72]

Ordem do Esc: janela → menu ⋮ → campo → bloco → **tela-mãe** → menu de telas.

A tela-mãe é o passo novo: da matéria aberta, Esc no nível bloco volta à lista de matérias, com o foco no cartão de origem. O botão "← Acervo" é a versão de toque desse mesmo Esc.

**Volta ao mesmo lugar:** ao subir ou voltar a uma tela, o foco retorna ao item de onde o usuário saiu. Cada tela lembra matéria, filtro, item e rolagem enquanto o app estiver aberto. Isso é estado de tela, fica em memória (D26).

### 2.6 Foco de chegada

**Toda tela declara onde o foco nasce**, já no nível certo. É o que mais economiza teclas, porque corta o trajeto antes de ele começar. A coluna "Chegada" da seção 5 define cada caso.

### 2.7 Comando à distância

Uma ação frequente sobre outro bloco não deve exigir sair de onde se está. Exemplo: Alt ] passa o slide com o cursor parado nas Anotações. Antes de pedir uma tecla nova, pergunte se a ação merece isso. Se merecer, ela entra na tabela de `teclado.md`.

### 2.8 Orçamento de teclas

| Tipo de caminho | Limite | Se passar |
|---|---|---|
| Uso em aula (Mesa, slide, anotar) | 3 ações, de qualquer tela (`visao.md`) | Redesenhe |
| Uso diário (abrir aula, revisar, lembrete) | 6 ações | Revise o foco de chegada |
| Uso eventual (aula antiga, Configs) | Sem limite por setas | Deve existir pela Paleta (Alt P) |

**Conte a partir do foco de chegada e registre o número na proposta.**

## 3. Foco e estados

### 3.1 Um único anel forte

**Só existe um anel forte na tela, e ele mostra onde as teclas estão agindo agora.** Essa é a regra visual mais importante do app.

| Nível atual | Anel forte em | Borda do bloco |
|---|---|---|
| Menu | Número da tela | Nenhuma |
| Bloco | O bloco inteiro | Nenhuma além do anel |
| Campo navegável | O item | Borda de bloco ativo |
| Campo de texto | Cursor piscando, sem anel | Borda de bloco ativo |

- **Anel forte:** 3 px na cor do foco, afastado 3 px. O contraste é de 15:1 ou mais.
- **Borda de bloco ativo:** 2 px roxa. Diz "você está dentro deste bloco".
- O vão do mosaico (8 px) acomoda o anel (6 px). Dentro de áreas que rolam, deixe 8 px de folga para o anel não ser cortado.
- **Com o dedo, o anel some** e fica só a borda do bloco ativo. Ele volta na primeira tecla. O app decide isso pela última forma de uso, porque tablet com teclado físico engana a detecção por tipo de aparelho.

### 3.2 Sete estados

A biblioteca traz cinco. Os dois últimos abaixo faltavam, e o Selecionado é indispensável para filtros e listas.

| Estado | Como aparece | Regra |
|---|---|---|
| Normal | Cor própria | Alvo de 44 px ou mais |
| Passar o mouse | Borda roxa em cartões e campos; botão escuro vira roxo | Nunca é a única forma de ver algo |
| Foco | Anel forte | Regra 3.1 |
| Tocado | Encolhe levemente e troca para roxo forte ou cor de marca | 120 ms |
| Desabilitado | Fundo secundário e texto 2 | Sem tracejado. Continua focável quando precisa explicar o motivo |
| **Selecionado** | Filtro: fundo roxo com tinta. Item de lista: fundo de marca | **Sempre preenchimento, nunca borda.** Permanece quando o foco sai |
| **Vazio ou criar** | Borda tracejada | É navegável e tem ação. O tracejado não significa mais "desabilitado" |

**Seleção sem consequência não aparece fora de foco:** a lista de aulas mantém a seleção porque ela comanda a prévia. Já em lembretes e no calendário do Hub, a seleção só aparece com o bloco ativo.

**Três sinais, três formas:** foco é anel, seleção é preenchimento e mouse é borda. Um item pode estar selecionado e em foco ao mesmo tempo, e os dois sinais se somam.

Toda lista ou bloco também tem três situações de conteúdo:
- **Vazio:** frase curta e a ação de criar.
- **Carregando:** o espaço reservado, sem pular a tela.
- **Erro:** ícone de alerta, palavra e o que fazer. Nunca silencioso.

## 4. Mosaicos

### 4.1 Livre e fixo [proposta, D73]

| | **Mosaico livre** | **Mosaico fixo** |
|---|---|---|
| Telas | Mesa, Hub | Acervo, Treino, Agenda, Configs |
| Arranjo | O usuário abre, fecha, troca e redimensiona | A tela define e não muda |
| Motor | Dwindle (D10) | Grade CSS simples, com o mesmo modelo de foco |
| Teclas que valem | Todas | Foco, Enter, Esc, Tab e Alt M. Alt Shift H J K L, Alt R, Alt W e Alt X não agem |
| Vizinhos | Calculados pela geometria | **Declarados pela tela** |

A proibição de novos blocos (`visao.md`) vale para os blocos de trabalho da **Mesa**: só Slides, Anotações e Cartões. As divisões fixas de outras telas, como já acontece no Hub, não são novos tipos de bloco de estudo.

**Por que declarar vizinhos:** o cálculo atual compara centros. Testei a matéria aberta no código real: com a lista de aulas mais estreita que a prévia, ↓ na régua cai na **prévia**, não na lista. A tela precisa dizer "abaixo da régua vem a lista".

### 4.2 Medidas

- **Tela:** a página nunca rola. Quem rola é o conteúdo do bloco.
- **Margem e vão:** 8 px. Barra do topo: 48 px.
- **Bloco mínimo:** 300 × 200 px. Abaixo disso, o bloco não abre lado a lado.
- **Ampliar (Alt M):** todo bloco pode ocupar a tela inteira. Em bloco de leitura, é o modo para estudar um texto longo.
- **Texto longo:** no máximo 72 caracteres por linha, mesmo em bloco largo no PC.

### 4.3 Aparelhos

| Aparelho | Área | Regra |
|---|---|---|
| Tablet, sempre na horizontal | 1280 × 800 | **Referência.** Todo desenho nasce aqui |
| PC | 1920 × 1200 (950 a 1150 úteis) | Os blocos crescem. Nada de novo aparece só por haver espaço |
| Celular | **Fora de foco** (usuário, 07/11/2026) | Fica o que já existe (D79: um bloco por vez, barra inferior). Não desenhar, conferir nem corrigir para celular |

## 5. Padrões de layout

**Antes de inventar um layout, encaixe a tela em um destes padrões.** Padrão novo exige justificativa.

| Padrão | Forma | Quando usar | Exemplo |
|---|---|---|---|
| **Régua + conteúdo** | Filtro no topo, conteúdo abaixo | Trocar de grupo sem atravessar itens | Anos, bimestres |
| **Lista + prévia** | Lista à esquerda, detalhe à direita | Escolher olhando o conteúdo | Aulas, seções de Configs |
| **Grade de cartões** | Cartões iguais, com setas nos dois eixos | Poucos itens, reconhecidos de relance (até 12) | Matérias |
| **Mosaico de trabalho** | Blocos que o usuário arranja | Trabalho simultâneo | Mesa, Hub |
| **Foco único** | Um bloco central, sem distração | Atenção total | Treino em sessão |
| **Janela de consulta** | Janela modal sobre a tela | Olhar algo sem perder o lugar | Lembretes, Próximas provas |

**Por que régua e não lista suspensa ou sanfona:** numa sanfona, chegar ao bimestre 2 exige atravessar as aulas do bimestre 1. Na régua, os grupos ficam a uma seta de distância, não importa o tamanho do conteúdo. **Regra geral: o que escolhe fica fora do que é escolhido.**

Lista suspensa só serve em formulário, para escolher um valor. Nunca para navegar.

### Tela por tela

Mapa de foco de cada tela. O detalhe funcional fica em `telas.md`, quando existir. Todas existem no app desde as etapas 3 a 9, com dados de exemplo. Treino, Agenda e Configs foram desenhadas sem referência do ClaudeWeb e ainda precisam da revisão do usuário.

| Tela | Padrão | Blocos, na ordem do Tab | Chegada | Enter principal |
|---|---|---|---|---|
| **Hub** | Mosaico | Provas, Calendário, Agenda de hoje, Lembretes | Agenda de hoje, na aula de agora | Abre a aula na Mesa |
| **Mesa** | Mosaico | Slides, Anotações, Cartões | Cursor nas Anotações da aula atual | Escrever |
| **Acervo, início** | Régua + grade | Anos, Matérias | Grade, na última matéria aberta | Abre a matéria |
| **Acervo, matéria** | Régua + lista + prévia | Pastas, Aulas, Prévia | Régua, na última pasta usada | Régua: entra nas aulas. Aula: abre na Mesa |
| **Treino** | Régua + lista + foco único | Matérias, O que treinar, Resumo; depois o cartão ampliado | Iniciar, com a última escolha | Lista: marca ou desmarca. Iniciar: começa a sessão |
| **Agenda** | Régua + conteúdo + prévia (D82) | Visão (Semana, Mês, Lista, Grade), Conteúdo, Prévia, Matérias, A completar | Semana, na aula de agora ou no dia de hoje | Ação principal da Prévia (aula: abre na Mesa) |
| **Configs** | Lista + prévia | Seções, Detalhe | Última seção | Entra na seção |

**Caso-modelo: a matéria aberta.**

> Enter no cartão da matéria → foco na **régua** → ← → filtra na hora → Enter ou ↓ entra nas **aulas** → ↑ ↓ troca a prévia → Enter abre na **Mesa**, ou → olha a **prévia**

A aula 3 do 2º bimestre custa 6 teclas, saindo de "Todas": → → Enter ↓ ↓ Enter.

## 6. Linguagem visual

**Identidade:** Rodada 2, lavanda e índigo. Cartões de uma peça, cor chapada, pílulas. Sem tema de medicina. Sutil e calmo na base, cor forte só no que merece atenção.

### 6.1 Cor

**A base é neutra, e a cor carrega significado.** Fundo e cartões ficam quietos para que a cor de matéria, a aula de agora e a seleção se destaquem.

| Regra | Motivo medido |
|---|---|
| Sobre cor de matéria, só `--cor-tinta` | Contraste de 5:1 a 7,5:1 |
| Cor de matéria **nunca** vira texto ou borda fina no tema claro | 2,3:1 a 2,7:1 com o branco |
| Roxo forte só em texto grande ou no estado tocado | 4,49:1 com a tinta, abaixo do mínimo para texto pequeno |
| Sobre cor de marca, use só `--cor-texto` | Texto 2 dá 2,98:1 no escuro |
| Borda de bloco ativo usa `--cor-bloco-ativo` | O roxo comum dá 2,9:1 com o fundo claro; o forte dá 3,2:1 |

- **Peça sobre o fundo usa `--cor-cartao`; peça sobre cartão usa `--cor-cartao-2`.** No tema claro, cartão 2 e fundo são quase iguais, e a pílula some. A tela de teste mostrou isso no botão "← Acervo".
- **Cor nunca é a única pista.** Matéria sempre tem sigla ou nome. Status sempre tem palavra e ícone.
- **Cor de matéria só em** fundo cheio, pílula, bolinha ou sigla. Nunca em tarja, faixa colada ou lua minguante.
- **Guarde a posição da cor, nunca o valor**, para o tema poder mudar sem mexer nos dados.
- **Status:** verde = em dia ou concluído. Laranja = atenção, atraso ou erro, sempre com ícone de alerta. Sem vermelho em barras.
- **Marca-texto das anotações** usa `--cor-marca`, em itálico.
- **Slide continua claro no tema escuro.** É conteúdo, não interface.

### 6.2 Tipografia (D67)

| Papel | Fonte | Onde |
|---|---|---|
| Voz | Nunito 700, 800 | Títulos de tela, números grandes, matérias, títulos curtos |
| Interface | Inter 500, 600, 700 | Botões, rótulos, siglas, horas, contagens, teclas |
| Leitura | Source Sans 3 400, 600, itálico | Texto corrido, respostas, lembretes, tudo que se digita |
| Título de nota | Source Sans 3 600, 700 | Títulos 1, 2 e 3 dentro das Anotações |

A escala tem 20 degraus fechados em `src/ui/styles/tokens.css`. Não use tamanho fora dela. Os HTML do ClaudeWeb somam mais de 30 combinações, com vizinhos como 15 e 15,5 px que não criam hierarquia.

**Caixa-alta só em texto escrito pelo app e em nome de matéria.** Título de aula, pergunta de cartão e título de nota ficam exatamente como foram digitados. O motivo é funcional: em caixa-alta, `TNF-α` vira `TNF-Α`, `IL-1β` vira `IL-1Β`, `pH` vira `PH` e `mRNA` vira `MRNA`.

**Exceção à regra da D67:** o texto do usuário usa leitura quando é corrido. Títulos curtos do usuário (nome da aula, pergunta do cartão) usam a voz, sem caixa-alta. É o que a biblioteca já faz.

**Números:** sempre tabulares em horas, datas e contagens.

### 6.3 Espaço e forma

- **Grade de 4 px.** Separe por espaço e por cartão. **Sem divisórias.**
- **Raios:** bloco 24, item e botão 18, campo 16, pílula total, mínimo 8. Quando um elemento encosta no de fora (recuo até 8 px), o raio interno é o externo menos o recuo.
- **Sem gradiente. Sem sombra**, exceto no botão flutuante e em janelas.
- **Barra de rolagem:** pílula solta, nunca a do sistema.
- **Sem cabeçalho repetido:** o título da tela fica na barra do topo, à direita dos números.

### 6.4 Ícones

Grade de 24 px, traço de 2 px, pontas arredondadas, sempre SVG, nunca emoji. Tamanhos: 14, 20, 24, 28 e 40, com o traço compensado para parecer igual. Ícone sozinho só em ação universal, e sempre com nome acessível. Os 26 ícones da biblioteca são o conjunto oficial.

### 6.5 Movimento

- Borda de bloco ativo: 200 ms, como no Hyprland.
- Anel forte: **instantâneo**. Com a tecla segurada, atraso faria o anel ficar para trás.
- Toque: 120 ms. Bloco abrindo: de 87% a 100%, só quando abre com a tela já aberta.
- **Troca de tela (D83):** instantânea, sem animação.
- Sem movimento decorativo. "Reduzir movimento" zera tudo.
- Cartão subir 3 px só com mouse.

### 6.6 Atalho visível

O app ensina as teclas enquanto é usado:
- **Título de bloco** mostra o atalho em pílula à direita.
- **Botão de ação** com atalho mostra a tecla dentro dele. Exemplo: `Novo  Alt N`.
- **Número da barra** é o próprio atalho.
- **Celular:** sem pílulas de tecla.

## 7. Componentes

A biblioteca do ClaudeWeb é a referência de desenho. Use só o que está nela, com os ajustes abaixo. Componente novo entra primeiro aqui.

| Grupo | Peças | Ajuste |
|---|---|---|
| Botões | Primário, secundário, pílula, numerado, só ícone, flutuante | **Um primário por bloco.** Desabilitado sem tracejado |
| Etiquetas | Matéria, sigla, sigla escura, status | Etiqueta só é clicável quando há ação. Área de toque de 44 px |
| Cartões | Prova, estudo, matéria | Todos com estado selecionado |
| Listas | Agenda, lembrete, linha de aula | Selecionado por preenchimento. Altura de 56 a 64 px |
| Campos | Texto, seletor, caixa, alternador | Seletor só em formulário |
| **Régua** (nova) | Pílulas ou cartões em linha, dentro de um bloco | Se não couber, rola por dentro. A ação de criar fica no fim e não seleciona |
| **Prévia** (nova) | Capa, título, dados, ação principal | Capa com proporção fixa. Atualiza sem pular a tela |
| **Janela** (nova) | Modal, raio 24, véu, largura até 640 px | Foco preso. Esc fecha e devolve o foco à origem |

## 8. Checklist de cada proposta

Responda antes de propor. "Não sei" significa que a proposta não está pronta.

**A. Fluxo**
1. Qual é o caminho típico, em uma linha, com o nível de cada passo?
2. Quantas teclas custa, a partir do foco de chegada? Cabe no orçamento (2.8)?
3. Algum passo atravessa conteúdo que não interessa? O que escolhe está fora do que é escolhido?
4. O filtro vem antes do conteúdo, na leitura e no Tab?
5. Qual padrão da seção 5 esta tela usa?

**B. Teclado**
6. Onde o foco nasce? Para onde volta ao sair e retornar?
7. Cada controle tem eixo claro? O que as setas fazem em cada borda?
8. O que Enter faz em cada item? O que Esc faz em cada nível?
9. Precisa de tecla nova? Ela entra em `teclado.md`, nunca em componente.

**C. Foco e estados**
10. O anel forte aparece em um só lugar, em todos os níveis?
11. Foco, seleção e mouse são distinguíveis, inclusive juntos?
12. Como ficam vazio, carregando e erro?

**D. Mosaico**
13. É livre ou fixo? Os vizinhos estão declarados?
14. Funciona com o bloco no tamanho mínimo e ampliado?
15. A Mesa continua só com Slides, Anotações e Cartões?

**E. Toque e aparelhos**
16. Toda ação tem caminho pelo dedo, com alvo de 44 px, sem depender de mouse?
17. Funciona em 1280 × 800, no PC e no celular, sem a página rolar?

**F. Visual**
18. Usa só tokens e peças da biblioteca?
19. Passa no contraste (4,5:1 em texto, 3:1 em borda e ícone), nos dois temas?
20. Respeita as proibições? Nada de tarja ou faixa colada na lateral ou no topo, lua minguante, divisória, gradiente ou tema de medicina. Cartões são de uma peça, com cantos bem arredondados.
21. Caixa-alta só em texto do app e em nome de matéria?

**G. Dados e registro**
22. O que é estado de tela (memória) e o que é dado (banco)? E se o banco falhar?
23. Criou regra nova? Registre em `decisoes.md`. Ideia para depois vai ao `backlog.md`.

## 9. Modelo de proposta

```
Tela e padrão:
Caminho típico (com níveis):
Teclas até o objetivo:
Foco de chegada e volta:
Blocos, vizinhos e ordem do Tab:
Enter e Esc em cada ponto:
Estados: selecionado, vazio, erro:
Versão de toque e celular:
Estado de tela x dado:
Decisão nova:
Alternativa descartada e por quê:
```

A alternativa descartada é obrigatória: sem ela, a escolha não foi comparada. Mostre a tela **renderizada** em 1280 × 800, nos dois temas, antes de pedir a decisão.

## 10. O que corrigir nos HTML do ClaudeWeb

Antes de virar tela real:

| Onde | Problema | Correção |
|---|---|---|
| Acervo | Seleção e mouse usam a mesma borda roxa, e duas aulas parecem selecionadas | Seleção por preenchimento |
| Acervo | "Novo bimestre" e "Nova pasta" fazem a mesma coisa | Uma ação só, no fim da régua |
| Acervo | Sigla da prévia estica na largura toda da capa | Sigla em tamanho natural |
| Acervo | "Abrir na Mesa" sem tecla visível, e a tela sem pílulas de atalho | Seguir 6.6 |
| Acervo | Teclas tratadas no próprio HTML, e o foco some ao mudar de bloco | Não copiar. Usar o resolvedor |
| Mesa e Acervo | Título de aula em caixa-alta | Seguir 6.2 |
| Biblioteca | Título de nota em caixa-alta | Títulos 1, 2 e 3 da escala |
| Biblioteca | Tracejado usado para desabilitado e para vazio | Tracejado só em vazio ou criar |
| Biblioteca | Botões 1 a 6 rotulados "Mesa 1" a "Mesa 6" para leitores de tela | Usar o nome da tela |
| Capturas | Título de nota roxo no claro (3,48:1) | Vale a biblioteca: cor do texto |

## 11. Pendências

**Decididas pelo usuário em 07/11/2026** (D75 a D78):
- **Cores de matéria:** 8 cores, com amarelo, ciano e cinza-lavanda acrescentados às 5 atuais.
- **Filtro inicial da matéria:** o bimestre mais recente com aulas.
- **Teclas do Treino:** Espaço vira, 1 a 4 respondem. Entram em `teclado.md` na Etapa 6.
- **Alt N:** cria novo item no bloco em foco. Entra em `teclado.md` na Etapa 6.

**Técnicas:**
- Celular: hoje os blocos viram uma coluna que rola. A regra da seção 4.3 (um bloco por vez, com barra inferior) ainda não foi feita.
- As regras [proposta] da seção 2 já estão no código e em `teclado.md`.
