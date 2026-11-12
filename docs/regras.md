# Regras herdadas do legado: Agenda e Grade

**Status:** rascunho para aprovação (D05). Data: 07/11/2026.
**Fonte:** `referencia-legado/DECISOES-legado.md` (entradas de 1/11/2026 sobre Agenda, Grade, pastas de bimestre e notas). Só comportamento, sem código.
**Marcas:** **Manter** (vale no Ohara novo), **Descartar** (não entra), **Rever** (o usuário decide).

## 1. Papel da Agenda

| # | Regra | Marca |
|---|---|---|
| A1 | A Agenda é a **única tela que cria e edita datas**. A Hub só tem um "+" rápido | Manter |
| A2 | Tipos de item: **prova, trabalho (com data de entrega), compromisso e lembrete** | Manter |
| A3 | Abre na visão **Semana**, com as aulas da Grade como fundo. Visões: Semana, Mês, Lista | Manter |
| A4 | Na Lista, **atrasados no topo** | Manter |
| A5 | **Filtro por matéria** em bolinhas no topo | Manter |
| A6 | A Agenda e a Hub **nunca mostram nota** | Manter |
| A7 | Plano automático de estudo (blocos, tempo livre, dificuldade, "próximo estudo") | Descartar (CLAUDE.md: sem painel de estudo nem metas) |
| A8 | Cadastro por frase única ("prova de Farmaco dia 12") | Descartar (sem IA, seria só leitor de palavras) |

## 2. Cadastro de itens

| # | Regra | Marca |
|---|---|---|
| C1 | Formulário **sempre vazio** e **um item por vez** (sem lote) | Manter |
| C2 | Cadastro **igual no tablet e no PC** | Manter |
| C3 | Prova exige **só a matéria**. Data, hora e peso são opcionais e completáveis depois | Manter |
| C4 | Seção **"A completar"** na Agenda: provas sem data, hora ou peso. A Hub mostra só o número de provas sem data, de forma discreta | Manter |
| C5 | Campos comuns: **local ou sala** e **observação livre** | Manter |
| C6 | Compromisso tem **repetição simples**: semanal, mensal, até uma data | Manter |
| C7 | Prova tem dois campos: **"Bimestre da nota"** e **"Conteúdo"** (bimestre atual, padrão, ou cumulativa marcando pastas, com atalho "Marcar do 1º até aqui"). Padrão dos dois = pasta com estrela | Manter |
| C8 | Conteúdo por pastas conta só as aulas **até o dia da prova** | Manter |

## 3. Grade (horário semanal)

| # | Regra | Marca |
|---|---|---|
| G1 | Grade = **regra semanal**: matéria, dia da semana, início e fim, repetição (**toda semana ou quinzenal**), rótulo curto opcional (T, P, Tutoria) e sala opcional | Manter |
| G2 | **Aulas futuras são virtuais**: calculadas pela regra e mostradas na Semana, no Mês e na Hub. Viram aula de verdade quando o usuário abre ou estuda | Manter |
| G3 | Mudar horário vale **daqui para frente**: passado e aulas com conteúdo ficam intactos | Manter |
| G4 | Exceções feitas na **Semana**, aula a aula: cancelar ("sem aula"), aula avulsa, mover de dia ou hora | Manter |
| G5 | Quinzenal tem **"inverter a partir daqui"** (feriado inverte a alternância) | Manter |
| G6 | Cancelar aula que **já tem conteúdo** é recusado | Manter |
| G7 | Editor da Grade = **cronograma clicável** (Seg a Sáb × horas; clicar no vazio cria, no bloco edita) com **painel ao lado**. No editor tudo vale "a partir de" uma data (padrão: hoje) | Manter |
| G8 | Excluir e inverter têm **Desfazer** | Manter |
| G9 | Aula nova cai na **pasta com estrela** da matéria | Manter |
| G10 | **.ics:** a Grade do app manda; importar .ics vira só um atalho para preencher a Grade (no menu ⋯ da Agenda). Exportar .ics continua (Etapa 9) | Manter (usuário, 07/11/2026) |

## 4. Teclado da Agenda

| # | Regra | Marca |
|---|---|---|
| T1 | Trocar de semana (ou de mês) com **Alt PgUp PgDn**, as mesmas teclas de página do slide; setas andam dentro dos blocos. `[` `]` soltos saem | Manter, ajustada (D82) |
| T2 | Alt N abre o menu "novo item" (prova, trabalho, compromisso, Grade, lembrete) | Manter (D78, já feito nas telas) |

## 5. Notas (só o que toca a Agenda)

| # | Regra | Marca |
|---|---|---|
| N1 | Estrutura: matéria → semestre → bimestre → itens com peso. Mínimo 7,0, "Preciso de X", prova faltada = pendente (não vale zero), reposição ocupa o lugar da original, bônus com teto 10 | Manter (detalhe na Etapa 13) |
| N2 | Regras de cálculo são um **esquema por matéria e por ano**, nunca fixo no código | Manter |
| N3 | Trava das Notas por **PIN curto** (só trava de tela) | Rever (D41 pede a frase da cifra; decide-se na Etapa 13) |
| N4 | Recuperação e prova final | Descartar (o usuário não usa) |
