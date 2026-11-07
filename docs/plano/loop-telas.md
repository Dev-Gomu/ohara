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
| 4 | 6 Treino, Agenda, Configs e janelas | A fazer | |
| 5 | 8 Acervo e Anotações (telas) | A fazer | |
| 6 | 9 Agenda, Grade e Lembretes (telas) | A fazer | |

## Escolhas feitas sem o usuário

Ele revisa esta lista no fim. Uma linha por escolha: etapa, o que foi escolhido, por quê.

| Etapa | Escolha | Motivo |
|---|---|---|
| 3 | Fontes em 9 arquivos, 236 KB no total | Subconjunto com latim, grego, setas e símbolos |
| 3 | Clicar no número da tela atual volta ao bloco | Evita ficar preso no nível menu com o dedo |
| 5 | Hub e Acervo usam horário fixo 13:42 nos dados de exemplo | Sempre há uma aula de agora para ver |
| 5 | Seleção some em blocos onde ela não comanda nada | Evita realce sem sentido, registrado na diretriz |
| 3 | Tema: preferência do aparelho em `localStorage`, começa no tema do sistema | Não é dado do estudo |
