# Loop das telas: etapas 3, 4, 5, 6, 8 e 9

**Pedido do usuário (07/11/2026):** fazer as etapas em sequência, sem esperar testes dele, com foco nas telas. Todas em Opus. Abrir uma sessão por etapa falhou pelo Remote Control, então seguem na mesma sessão. A Etapa 7 (banco) fica para depois.

## Regras para cada sessão

Estas regras substituem, só neste loop, o "pare e espere" do `CLAUDE.md`. O resto do `CLAUDE.md` vale inteiro.

1. Leia `CLAUDE.md`, `docs/diretrizes-visuais.md`, `docs/plano/_indice.md` e a linha da sua etapa. Passe o checklist da diretriz em cada tela.
2. Faça **só a sua etapa**. Ideia fora dela vai para `docs/backlog.md`.
3. **Não espere o usuário.** Dúvida de produto: escolha a opção que você recomendaria e anote na tabela de escolhas abaixo. Só pare se a etapa não puder continuar sem ele.
4. Escreva `docs/plano/etapa-XX.md` antes de começar, com critérios de pronto. No fim, acrescente o **roteiro de 5 minutos** nele: o usuário roda todos juntos depois.
5. Confira as telas de verdade: capturas em 1280 × 800, claro e escuro, e um roteiro só de teclado. Teste que passa não prova que a tela está boa.
6. Rode `npm run check` e `npm run e2e`. Não declare pronto com falha.
7. Commite no branch `telas-3-a-9`. **Nunca faça push, merge em `main` ou deploy.**
8. Atualize a tabela de situação abaixo e termine. Não abra a próxima sessão: quem faz isso é a sessão que conduz o loop.

## Etapas 8 e 9 sem banco

Sem a Etapa 7, as duas fazem **só a parte de tela**, com dados fictícios. Isso contraria "nunca caia em memória em silêncio", então:
- Toda tela com dado fictício mostra aviso visível de que nada fica salvo.
- Os dados passam pela interface `Storage`, para o banco entrar depois sem refazer tela.
- Tiptap, histórico e busca funcionam em memória. A gravação real volta para depois da Etapa 7.

## Situação

| Ordem | Etapa | Situação | Commit |
|---|---|---|---|
| 1 | 3 Casca de navegação | Pronta | ver `git log` |
| 2 | 4 Mosaico e Mesa | Pronta | ver `git log` |
| 3 | 5 Fixtures e telas de leitura | Pronta | ver `git log` |
| 4 | 6 Treino, Agenda, Configs e janelas | Pronta | ver `git log` |
| 5 | 8 Acervo e Anotações (telas) | Pronta | ver `git log` |
| 6 | 9 Agenda, Grade e Lembretes (telas) | Pronta | ver `git log` |

## Escolhas feitas sem o usuário

Ele revisa esta lista no fim. Uma linha por escolha: etapa, o que foi escolhido, por quê.

| Etapa | Escolha | Motivo |
|---|---|---|
| 3 | Fontes em 9 arquivos, 236 KB no total | Subconjunto com latim, grego, setas e símbolos |
| 3 | Clicar no número da tela atual volta ao bloco | Evita ficar preso no nível menu com o dedo |
| 5 | Hub e Acervo usam horário fixo 13:42 nos dados de exemplo | Sempre há uma aula de agora para ver |
| 5 | Seleção some em blocos onde ela não comanda nada | Evita realce sem sentido, registrado na diretriz |
| 6 | Sessão de Treino usa fila simples: Errei volta ao fim. FSRS real fica na Etapa 11 | Só a tela está no escopo |
| 6 | Checkpoint de atalhos fechado com 75 teclas, sem revisão do usuário | Pedido de não esperar; ele revisa no fim |
| 8 | Editor com barra de formatação sempre visível | Toque precisa dela; escondê-la exigiria mais um passo |
| 8 | Aba Cartões da matéria alterna com Alt C | Reaproveita a tecla existente, sem tecla nova |
| 8 | Nova matéria fica no fim da régua de anos | Mantém a grade em duas linhas, como a diretriz pede |
| 9 | `regras.md` não foi escrito: usei as regras do legado para Grade e itens da Agenda | A etapa pedia o arquivo; ele segue pendente antes da parte real |
| 9 | Alt N na Agenda abre um menu com prova, trabalho, compromisso, Grade e lembrete | Uma tecla só para vários tipos (D78) |
| 9 | Celular em coluna que rola, não um bloco por vez | Evitar a rolagem lateral agora; o resto foi para o backlog |
| 3 | Tema: preferência do aparelho em `localStorage`, começa no tema do sistema | Não é dado do estudo |
| Rodada 2 | Treino abre com o foco em Iniciar e lembra a última escolha | O de sempre custa uma tecla (D80) |
| Rodada 2 | Com "tudo" marcado, marcar uma linha escolhe só ela | É o caso comum: só um bimestre ou só uma aula |
| Rodada 2 | Editor de cartões em texto com as marcas do legado, não formatado enquanto digita | A prévia ao lado mostra o cartão pronto; texto puro é mais seguro (D81) |
| Rodada 2 | Alt N cria cartão de qualquer bloco da Mesa | Anotar e criar o cartão sem largar a aula |
| Rodada 2 | Celular: réguas e busca ficam sempre à vista; a barra troca o resto | A régua filtra o bloco da vez (D79) |

## Rodada 2 (07/11/2026): Treino, editor de cartões e celular

Feita em Opus, no mesmo branch. Também corrigido: Alt M ampliava só até a metade da tela em blocos da esquerda.

**Roteiro de 5 minutos**
1. `npm run dev` e abra http://localhost:5173/ohara/.
2. **Alt 4** (Treino). O foco nasce em "Iniciar treino". Aperte **↑**: você está na régua de matérias. Ande com **→** até IMU e aperte **Enter**.
3. Na lista, desça até "Resposta inflamatória aguda" e aperte **Enter**: só ela fica marcada. Desça até "1º bimestre" e **Enter**: os dois somam. O Resumo diz "Imunologia · 1º bimestre e 1 aula".
4. **→** e **Enter** começa o treino só com esses cartões. **Esc** volta. Saia e volte com Alt 4: a escolha continua lá.
5. **Alt 2** (Mesa). Com o cursor nas Anotações, aperte **Alt N**: abre um cartão no bloco Cartões. Digite a frente, Enter, o verso; teste `# Seção`, `- item`, `+ a favor`, `-- contra`, `? dúvida`, `**negrito**` e `==destaque==`. A prévia ao lado mostra o cartão pronto.
6. **Alt N** de novo abre outro cartão. Deixe este sem verso e aperte **Ctrl Enter**: salva o completo, o incompleto fica no editor. Toque em "Salvos" para ver a lista.
7. **Alt M** no bloco Cartões: ele ocupa a tela inteira. Alt M de novo volta.
8. No celular (ou janela estreita): cada tela mostra um bloco; a barra de baixo troca entre eles.
