# Bancada agenda-acoes (noite 14/11, refeita às 13h50)

Link: http://localhost:5173/ohara/lab/livre.html?ideia=agenda-acoes (vale depois que a branch vier ao main).

## O problema
1. O calendário do Hub só mostra: para registrar falta ou criar evento é preciso ir à tela de Faltas ou à Agenda.
2. A Agenda não tem o tipo **Apresentação**; o bloco de avaliações do Hub (D120/D103) só lista provas.
3. A prévia de uma aula na Agenda não oferece **Mover** nem **Sem aula**, e não há **aula avulsa** (regras G4, G6, G8).

## As versões
Todas as janelas seguem o padrão D144 (contexto, X de 44 px, rodapé de metades iguais). A janela aparece fixa ao lado da tela para comparar; no app ela abre por cima.
- **V1 (recomendada):** no pé do calendário, dois botões de largura igual, **Registrar falta** e **Novo evento** (este é o azul). Agem no dia escolhido.
- **V2:** os mesmos dois como "Falta" e "+ Evento" no cabeçalho do bloco, ao lado do ⋮. Ganha altura, mas fica pequeno para o dedo e some no meio dos ícones.
- Itens 2 e 3 são iguais nas duas versões (sem dúvida real de fluxo):
  - **Novo evento** = uma janela só, com o tipo no topo: Prova, Trabalho, **Apresentação**, Compromisso, **Aula avulsa**. O tipo muda os campos (prova só exige matéria, C3; apresentação e aula avulsa têm início e fim; compromisso tem matéria opcional).
  - **Hub:** o dia com apresentação ou trabalho ganha a marca única com as iniciais (A, T, "T A") no canto de baixo do cartão, como manda a D103. O bloco passa a se chamar **Avaliações**.
  - **Prévia da aula:** Abrir na Mesa (azul), **Mover**, **Sem aula**. Mover abre janela com o dia da semana (pílulas), início, fim e sala; vale só para essa aula. Sem aula risca a aula, mostra aviso com **Desfazer (Alt Z)** e tira a aula da conta das Faltas; se a aula já tem anotações, recusa e sugere Mover (G6).
  - **Registrar falta:** lista as aulas do dia, cada uma com Presente / Falta / Cancelada (D100).

## Recomendação
**V1** (aprovada pelo usuário em 14/11). Dois botões grandes no pé do calendário, com o "Novo evento" azul; a lista do dia continua rolando acima deles.

## Teclas (linhas da tabela, nunca keydown em componente)
| Tecla | Onde | Faz | Toque |
|---|---|---|---|
| Alt N (`KeyN`, já existe: `newItem`) | Calendário do Hub | Novo evento no dia escolhido | botão Novo evento |
| Alt O → "Registrar falta neste dia" | Calendário do Hub | entra como opção do ⋮ (`options`), sem tecla nova | botão Registrar falta |
| Alt N | Agenda | o menu de novo item ganha Apresentação e Aula avulsa | "Novo neste dia" na prévia |
| ← → / Enter | Prévia da Agenda | andam entre Abrir na Mesa, Mover, Sem aula | botões |
| Alt Z (já existe) | qualquer | desfaz o Sem aula | Desfazer no aviso |

Nenhuma tecla nova: tudo cabe em linhas já existentes (Alt N, Alt O, Alt Z).

## O que a aplicação vai mexer
- `src/core/study/types.ts`: `EventKind` ganha `'apresentacao'`; `ClassEvent` ou tabela de exceções ganha `cancelled` e `movedFrom` (aula virtual da Grade movida ou cancelada).
- Migração nova (`00X_agenda_excecoes.sql`): exceções da Grade por data (cancelar, mover) e o tipo novo; Sem aula grava também em `attendance.cancelled` (D101) para sair da conta.
- `src/core/study/queries.ts`: `AssessmentDay` inclui trabalho e apresentação; `eventsOn` aplica as exceções. Testes Vitest para: cancelar recusado com conteúdo (G6), mover só uma aula, desfazer.
- `src/ui/components/Cards.tsx`: `AssessmentDayCard` ganha prop `kinds` (marca A/T no fim da fileira); regerar `docs/pecas.md`.
- `src/ui/screens/hub/Hub.module.css` (pedido 14/11 à tarde, V1 aprovada): cabeçalho do calendário com mais ar: ano na mesma letra do mês e na mesma linha de base, 16 px entre o cabeçalho e os dias da semana (`.aa-bloco-cal` em `aa.css`).
- `src/ui/screens/hub/HubBlocks.tsx`: rodapé do calendário com os dois botões; ⋮ com "Registrar falta neste dia"; bloco renomeado para Avaliações.
- `src/ui/screens/agenda/AgendaPreview.tsx` e `agendaForms.ts`: ações Mover e Sem aula, janelas Mover e Novo evento com os tipos novos.
- Roteiro e2e curto: Hub → Alt N → Apresentação → aparece no bloco Avaliações.
