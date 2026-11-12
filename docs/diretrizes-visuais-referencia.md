# Ohara: diretrizes visuais

**Status:** referência completa (versão 3). O resumo de uma página, para consultar antes de propor layout, é `diretrizes-visuais.md`.
**Para copiar:** `lab/vitrine.html` (todas as peças reais, código em `lab/vitrine/`) e `lab/provas-dias.html` (modelo de bancada). Veja com `npm run tela -- "lab/vitrine.html"`. **Abra a vitrine antes de desenhar.**
**Valores exatos:** `src/ui/styles/tokens.css`. Este texto dá o **papel** de cada coisa, não o número.
**Identidade:** Ardósia refinada (D130), já aplicada no app; paletas A e B são opções (D131).

## 1. Princípio

**A tela é calma e fria; existe uma única luz, o azul, e ela está sempre onde as teclas agem.**

O layout não é decoração sobre a navegação: ele **é** a navegação. Onde um bloco fica define qual seta chega até ele. Por isso a posição é decidida pelo caminho do usuário, e só depois pelo desenho.

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

### 2.2 Dois tipos de campo (D70)

| Tipo | Exemplos | Setas e H J K L | Enter |
|---|---|---|---|
| **Campo de texto** | Anotações, busca, formulário | São do texto (D19) | É do texto |
| **Campo navegável** | Lista de aulas, régua de bimestres, grade de matérias, calendário | Andam entre os itens | Faz a ação principal do item |

A régua de bimestres é **um bloco com campo navegável**. Ela não é nível menu: nesse nível só existe a barra de telas, e Esc ali não faz nada (D17).

### 2.3 Regras das setas (D71)

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

### 2.5 Esc e a volta (D72)

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

### 3.1 Um azul, três forças

| Força | Token | Significa | Onde aparece |
|---|---|---|---|
| **Cheio** | `--cor-acao`, com `--cor-sobre-acao` por cima | Ação, agora, hoje | Botão principal, pílula "agora", dia de hoje, chave ligada, caixa marcada |
| **Claro** | `--cor-escolhido` | Escolhido | Aba atual, filtro ativo, item selecionado, dia escolhido |
| **Contorno** | `--cor-cursor` | Cursor do teclado | Um lugar só na tela |

Fora dessas três, o azul só aparece como texto em dois lugares: o rótulo do bloco aceso e o botão discreto. **Nada mais é azul.** O grafite deixou de ser cor de botão.

Teste rápido: se algo azul não é ação, nem escolhido, nem cursor, está errado.

### 3.2 Cursor e rastro

**Só existe um cursor na tela, sempre com a mesma forma:** contorno azul **por dentro** da peça (`box-shadow: inset`), nunca um anel afastado.

| Nível atual | Cursor em | Bloco |
|---|---|---|
| Menu | A aba, 2 px | Sem rastro |
| Bloco | O bloco inteiro, 3 px | Aceso |
| Campo navegável | O item, 2 px | Aceso, com **rastro** |
| Campo de texto | Cursor piscando do texto | Aceso, com **rastro** |

- **Rastro:** contorno fraco de 2 px no bloco (azul a 30% misturado à cor do bloco). Mostra para onde o Esc volta.
- **Sobre azul cheio** (botão principal), o cursor ganha um segundo aro por dentro, na cor do bloco, para não sumir.
- **Instantâneo.** Com a tecla segurada, atraso faria o cursor ficar para trás.
- **Com o dedo, o cursor some** e fica só o rastro. Ele volta na primeira tecla. O app decide pela última forma de uso, não pelo tipo de aparelho.
- Como o contorno é por dentro, ele não é cortado em áreas que rolam e cabe no vão de 8 px.

### 3.3 Três alturas

| Altura | Token | O que é |
|---|---|---|
| Fundo | `--cor-fundo` | Aparece só nos vãos |
| Bloco | `--cor-cartao` | O bloco onde o cursor está (aceso) |
| Peça | `--cor-cartao-2` | Botão, campo, ilha, cartão dentro do bloco |

**Os blocos sem cursor recuam** para meio caminho entre bloco e fundo, e o rótulo deles fica apagado. O bloco com o cursor acende e o rótulo fica azul. É isso que faz a luz seguir o teclado sem precisar de borda grossa.

**No nível menu** (cursor nas abas), o último bloco usado continua aceso, com rastro: é para ele que o Enter volta (D116).

Peça dentro de bloco usa a superfície de peça translúcida, para funcionar igual no bloco aceso e no recuado. Tokens: `--sup-recuada`, `--sup-peca`, `--cor-rastro`, `--cor-relevo`.

### 3.4 Estados

| Estado | Como aparece | Regra |
|---|---|---|
| Normal | Cor do papel | Alvo de 44 px ou mais |
| Cursor | Contorno azul por dentro | Regra 3.2 |
| **Escolhido** | Azul claro, preenchido | **Permanece quando o cursor sai.** Nunca é borda |
| Ação principal | Azul cheio | Uma por bloco |
| Tocado | Encolhe levemente | 120 ms |
| Desabilitado | Texto apagado a 60%, sem fundo | Sem tracejado. Continua focável quando precisa explicar o motivo |
| Passada | Título em texto apagado | Aula que já aconteceu; continua navegável |

**Três sinais, três formas:** cursor é contorno, escolhido é azul claro, ação é azul cheio. Um item pode estar escolhido e com o cursor ao mesmo tempo, e os dois sinais se somam.

**Seleção sem consequência não aparece fora de foco:** a lista de aulas mantém o escolhido porque ele comanda a prévia. Em lembretes e no calendário do Hub, ele só aparece com o bloco aceso.

Toda lista ou bloco tem três situações de conteúdo:
- **Vazio:** frase curta e a tecla de criar ("Nenhuma aula. Alt N cria.").
- **Carregando:** o espaço reservado, sem pular a tela.
- **Erro:** palavra, ícone de alerta e o que fazer. Nunca silencioso.

## 4. Mosaicos

### 4.1 Livre e fixo (D73)

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

Mapa de foco de cada tela. O detalhe funcional fica em `telas.md`, quando existir.

| Tela | Padrão | Blocos, na ordem do Tab | Chegada | Enter principal |
|---|---|---|---|---|
| **Hub** | Mosaico | Provas, Calendário, Agenda de hoje, Lembretes | Agenda de hoje, na aula de agora | Abre a aula na Mesa |
| **Mesa** | Mosaico | Slides, Anotações, Cartões | Cursor nas Anotações da aula atual | Escrever |
| **Acervo, início** | Régua + grade | Anos, Matérias | Grade, na última matéria aberta | Abre a matéria |
| **Acervo, matéria** | Régua + lista + prévia | Pastas, Aulas, Prévia | Régua, na última pasta usada | Régua: entra nas aulas. Aula: abre na Mesa |
| **Treino** | Coluna de blocos + foco único | Resumo, Estudar (período), Disciplina (busca e grade), O que treinar (só aberto por "Ajustar"); depois o cartão ampliado | Iniciar, com a última escolha | Grade e período: Enter volta ao Iniciar. Iniciar: começa a sessão |
| **Agenda** | Régua + conteúdo + prévia (D82) | Visão (Semana, Mês, Lista, Grade), Conteúdo, Prévia, Matérias, A completar | Semana, na aula de agora ou no dia de hoje | Ação principal da Prévia (aula: abre na Mesa) |
| **Configs** | Lista + prévia | Seções, Detalhe | Última seção | Entra na seção |

**Caso-modelo: a matéria aberta.**

> Enter no cartão da matéria → foco na **régua** → ← → filtra na hora → Enter ou ↓ entra nas **aulas** → ↑ ↓ troca a prévia → Enter abre na **Mesa**, ou → olha a **prévia**

A aula 3 do 2º bimestre custa 6 teclas, saindo de "Todas": → → Enter ↓ ↓ Enter.

## 6. Linguagem visual

**Identidade:** Ardósia refinada. Base fria em três alturas, um azul em três forças, cor viva só de matéria. Tudo que é marca é pílula. Sem tema de medicina e **sem fundo quente** (nada de creme, areia, amarelo ou terroso na base).

### 6.1 Cor

- **Toda cor entra por papel** ("ação", "fundo", "matéria 3"), nunca por valor. Hex ou `rgb()` fora de `tokens.css` e `paletas.css` é erro. Assim a paleta troca em um arquivo só.
- **Cor de matéria só em três lugares:** pílula da sigla, marca alongada (dia do calendário) e fundo do cartão da própria matéria. Nunca em texto, borda, tarja, faixa colada, capa ou fundo de bloco.
- **Sobre cor de matéria, só `--cor-tinta`.**
- **Nos cartões, só a sigla** da matéria, nunca o nome inteiro.
- **Guarde a posição da cor, nunca o valor**, para o tema mudar sem mexer nos dados.
- **Cor nunca é a única pista.** Matéria tem sigla. Estado tem palavra.
- **Estado:** `--cor-ok` = em dia ou concluído. `--cor-atencao` = atraso, atenção ou erro. Sempre em marca alongada com a palavra ao lado.
- **Slide continua claro no tema escuro.** É conteúdo, não interface.
- **Contraste mínimo:** 4,5:1 em texto, 3:1 em contorno e ícone, **nos dois temas**. Nunca julgue só o claro.

### 6.2 Tipografia (D67, D68)

| Papel | Fonte | Onde |
|---|---|---|
| Voz | Nunito 700, 800 | Títulos de tela, números grandes, títulos curtos |
| Interface | Inter 500, 600, 700 | Botões, rótulos, siglas, horas, contagens, teclas |
| Leitura | Source Sans 3 400, 600, itálico | Texto corrido, respostas, lembretes, tudo que se digita |

- **Três degraus por bloco:** rótulo (caixa-alta, apagado; azul no bloco aceso), conteúdo, apoio (apagado). Não crie um quarto.
- A escala é fechada em `tokens.css` (`--voz-*`, `--ui-*`, `--leitura-*`). Não use tamanho fora dela.
- **Caixa-alta só em texto escrito pelo app e em sigla de matéria.** Título de aula, pergunta de cartão e título de nota ficam como foram digitados: em caixa-alta, `TNF-α` vira `TNF-Α` e `pH` vira `PH`.
- Texto do usuário usa leitura quando é corrido e voz quando é título curto (nome da aula, pergunta do cartão).
- **Números tabulares** em horas, datas e contagens.

### 6.3 Espaço e forma

- **Grade de 4 px.** Margem e vão de 8 px. Separe por espaço e por altura de superfície. **Sem divisórias.**
- **Pílulas, não círculos:** caixa de marcar, chave, dia do calendário, marca de estado e de matéria são alongadas. Nenhuma bolinha.
- **Cartões de uma peça**, cantos bem arredondados. Raios só pelos tokens (`--raio-bloco`, `--raio-item`, `--raio-botao`, `--raio-campo`; pílula é raio total). Quando uma peça encosta na de fora, o raio interno é o externo menos o recuo.
- **Sem gradiente. Sem sombra**, exceto em janelas e no botão flutuante.
- **Proibido:** tarja ou faixa colada na lateral ou no topo, "lua minguante", cabeçalho repetido (o título da tela fica na barra do topo).
- **Barra de rolagem:** pílula solta, nunca a do sistema.

### 6.4 Ícones

Grade de 24 px, traço de 2 px, pontas arredondadas, sempre SVG, nunca emoji. Ícone sozinho só em ação universal, e sempre com nome acessível.

### 6.5 Movimento

- Bloco acender ou recuar: 200 ms. Cursor: **instantâneo**. Toque: 120 ms.
- Troca de tela (D83): instantânea.
- Sem movimento decorativo. "Reduzir movimento" zera tudo.

### 6.6 Tecla sempre visível

O app ensina as teclas enquanto é usado, sempre com a **mesma pecinha** (Tecla, com relevo embaixo):
- **Rótulo de bloco:** atalho à direita.
- **Botão com atalho:** a tecla dentro dele (`Novo lembrete  Alt N`).
- **Aba:** o número é o próprio atalho.
- **Indicador de nível:** as teclas que valem agora.

## 7. Peças: quando usar cada uma

Monte telas **só com estas peças**. Elas são componentes reais em `src/ui/components` (um arquivo por peça). Veja todas em `lab/vitrine.html`; não redesenhe uma peça dentro da tela.

| Peça | Use para | Regras |
|---|---|---|
| **Bloco** | Toda divisão da tela | Rótulo em caixa-alta, com a tecla à direita. Recuado, aceso ou com rastro (3.3) |
| **Ilha** | Agrupar controles na barra do topo | Pílula de 44 px na superfície recuada. Três ilhas: telas, nível, módulos |
| **Aba** | Trocar de tela, só na ilha de telas | Só o número; a atual abre e mostra o nome ("1 Hub"), em azul claro |
| **Indicador de nível** | Dizer onde as teclas agem | Um por tela, na barra: MENU, BLOCO ou CAMPO, mais as teclas que valem |
| **Régua** | Escolher um grupo (pasta, bimestre, visão) | Pílulas em linha, fora do conteúdo que filtram. Criar fica no fim e não seleciona. Se não couber, rola por dentro |
| **Item de lista** | Aula, lembrete, linha de agenda | 56 a 64 px. Hora, depois título e apoio, depois pílulas |
| **Botão principal** | A ação mais provável do bloco | Azul cheio. **Um por bloco** |
| **Botão comum** | Demais ações | Superfície de peça |
| **Botão discreto** | Ação menor, de ajuste | Só texto azul, sem fundo |
| **Tecla** | Mostrar um atalho | Sempre igual (6.6). Nunca clicável sozinha |
| **Pílula de matéria** | Dizer de qual matéria é | Sigla sobre a cor da matéria, com `--cor-tinta` |
| **Pílula de estado** | Em dia, atenção | Marca alongada colorida e a palavra |
| **Pílula "agora"** | A aula em andamento | Azul cheio. No máximo uma na tela |
| **Cartão de prova** | Próximas provas | Dia da semana e mês, prazo, número grande, pílulas das matérias |
| **Cartão de matéria** | Grade do Acervo e do Treino | Fundo na cor da matéria, sigla grande, uma linha de apoio |
| **Campo** | Busca e formulário | 44 px, superfície de peça, tecla à direita. Lista suspensa só em formulário, nunca para navegar |
| **Chave e caixa de marcar** | Ligar e concluir | Pílulas. Ligada ou marcada: azul cheio |
| **Dia** | Calendário | Pílula. Hoje: azul cheio. Escolhido: azul claro |
| **Barra de progresso** | Quanto já foi feito | Pílula; preenchimento em `--cor-ok`, com o número ao lado |
| **Prévia** | Detalhe do item escolhido | Título, dados, ação principal. Atualiza sem pular a tela |
| **Janela** | Consultar sem perder o lugar | Modal até 640 px. Foco preso. Esc fecha e devolve o cursor à origem |

**Peça nova** só nasce em bancada no lab (até 3 versões, dois temas, com o cursor testado) e com o aceite do usuário. Depois entra nesta tabela e na vitrine. Antes de pedir uma, tente montar com as que existem.

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

**C. Luz e estados**
10. O cursor aparece em um só lugar, em todos os níveis? O rastro mostra a volta do Esc?
11. Todo azul da tela é ação, escolhido ou cursor (3.1)?
12. Só o bloco com o cursor está aceso? Há um só botão principal por bloco?
13. Como ficam vazio, carregando e erro?

**D. Mosaico**
14. É livre ou fixo? Os vizinhos estão declarados?
15. Funciona com o bloco no tamanho mínimo e ampliado?
16. A Mesa continua só com Slides, Anotações e Cartões?

**E. Toque**
17. Toda ação tem caminho pelo dedo, com alvo de 44 px, sem depender de mouse?
18. Funciona em 1280 × 800 e no PC, sem a página rolar?

**F. Visual**
19. Usa só peças da seção 7 e só tokens, sem cor ou medida solta?
20. Cor de matéria só em pílula, marca alongada ou cartão da matéria? Só a sigla?
21. Tudo que é marca é pílula? Nenhum círculo, tarja, faixa colada, divisória, gradiente ou fundo quente?
22. Foi conferido **nos dois temas**, com `npm run tela`, incluindo o estado com cursor?
23. Caixa-alta só em texto do app e em sigla?

**G. Dados e registro**
24. O que é estado de tela (memória) e o que é dado (banco)? E se o banco falhar?
25. Criou regra nova? Registre em `decisoes.md`. Ideia para depois vai ao `backlog.md`.

## 9. Modelo de proposta

```
Tela e padrão:
Caminho típico (com níveis):
Teclas até o objetivo:
Foco de chegada e volta:
Blocos, vizinhos e ordem do Tab:
Enter e Esc em cada ponto:
Estados: escolhido, cursor, vazio, erro:
Versão de toque:
Estado de tela x dado:
Decisão nova:
Alternativa descartada e por quê:
```

A alternativa descartada é obrigatória: sem ela, a escolha não foi comparada. Mostre a tela **renderizada** em 1280 × 800, nos dois temas, antes de pedir a decisão.

## 10. A confirmar

Pontos que a biblioteca ainda não mostra. Não decida sozinho: leve em bancada.

- **Passar o mouse:** as peças sobem um degrau de superfície (`--sup-peca-viva`, `--cor-acao-viva`), nunca contorno (contorno é só do cursor). Feito no passo 3; aguarda o aceite do usuário.
- **Vazio ou criar:** "+ Nova pasta" é peça comum no fim da régua, sem tracejado. Feito no passo 3; aguarda o aceite do usuário.
- **Hub:** rodapé da agenda, aulas passadas apagadas e provas sem faixa (mexe na D106) aguardam a palavra do usuário.
- **Cores de matéria:** fora da fila, depois do passo 2. Bancada antiga apagada (git guarda).
