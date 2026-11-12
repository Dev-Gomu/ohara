# Etapa 11: Treino real com FSRS

**Status:** plano escrito pelo Opus em 07/11/2026 para o **Sonnet**. Depende das Etapas 7 e 10. **Aprovado pelo usuário em 07/11/2026.**
**Cuidado:** um erro aqui é silencioso, porque o cartão só volta na data errada. Toda regra tem teste antes de ligar na tela.

## Objetivo
Trocar a fila simples do Treino (`core/study/session.ts`) pelo agendamento do **ts-fsrs** (D43), com retenção desejada configurável.

## Desenho
- **Biblioteca:** `ts-fsrs` (FSRS-6, D56: confirmar a versão 6.x no npm). Exceção de camada (D86): só `src/core/study/fsrs.ts` importa `ts-fsrs`. Acrescente essa exceção ao `eslint.config.js` só para esse arquivo.
- `fsrs.ts` é uma função fina em volta da biblioteca, com tipos próprios do app:
  - `schedule(card: CardState, grade: Grade, now: Date, params: TrainParams): { card: CardState; review: Review }`
  - `preview(card, now, params): Record<Grade, Date>` mostra o próximo intervalo de cada botão.
  - `Grade` 1 a 4 = Again, Hard, Good, Easy (Errei, Difícil, Bom, Fácil; D77).
  - `TrainParams`: `retention` (padrão 0,90, de 0,80 a 0,97), `fuzz` (ligado no app, desligado nos testes), passos de aprendizado `['1m', '10m']` e de reaprendizado `['10m']` (padrões da biblioteca).
- **Migração `003_fsrs.sql`:**
  - `cards` ganha `state` (0 novo, 1 aprendendo, 2 revisão, 3 reaprendendo), `stability`, `difficulty`, `reps`, `lapses`, `learning_steps`, `scheduled_days` e `last_review` (pode ser nulo).
  - `due` passa a ser data e hora ISO: os existentes viram `due || 'T00:00'` no horário local, com `state = 0`.
  - Tabela `reviews(id, card_id, grade, state, due, stability, difficulty, elapsed_days, scheduled_days, reviewed_at, updated_at, deleted)`. Só recebe linhas novas e sincroniza. Guarda o histórico para o otimizador, que continua no backlog (B06, D44).
  - Tabela `settings(key, value, updated_at, deleted)`, sincronizável, com `train.retention`.
- `Card` em `types.ts` ganha os campos do FSRS. Cartão novo nasce com `createEmptyCard` (`state = 0`, `due = agora`).

## Fila da sessão (regras, em `session.ts`)
1. **Entram:** cartões do escopo escolhido (D80) com `due` até o fim do dia de hoje, na hora local. Primeiro aprendendo e reaprendendo, pela `due`. Depois revisão, pela `due`. Por último os novos, pela data de criação. **Sem limite de novos** (o limite segue no backlog).
2. Depois da resposta, se a nova `due` cair em até **20 minutos**, o cartão volta à fila na posição da sua `due`. Senão, sai da sessão.
3. O próximo cartão é o primeiro com `due ≤ agora`. Se nenhum estiver vencido, mas houver algum nos 20 minutos, mostra o mais próximo, sem esperar.
4. A sessão termina quando a fila fica vazia. O resumo mostra os respondidos, os erros (Errei) e o próximo vencimento do escopo.
5. **Adiantar (D80):** sem nenhum vencido no escopo, pega os 20 de `due` mais próxima. O FSRS trata a revisão antecipada; não há regra extra.
- Cada resposta grava o cartão e a linha de `reviews` num `storage.write` só (um `apply` na transação).
- Verso virado: mostra o intervalo de cada botão embaixo dele (ex.: "10 min", "3 d"), vindo de `preview`.

## Configs
Seção nova **Treino**, com a régua "Retenção desejada" (80% a 97%, passo de 1%) e a frase: "Maior retenção: mais revisões por dia."

## Testes obrigatórios (fuzz desligado e `now` fixo)
- Novo + Bom → aprendendo, com `due` em +10 min. Novo + Fácil → revisão, `due` em pelo menos 1 dia.
- Em revisão, para o mesmo cartão: `due(Errei) < due(Difícil) < due(Bom) < due(Fácil)`.
- Revisão + Errei → reaprendendo, `lapses + 1`.
- Retenção de 0,95 dá intervalo menor que a de 0,85 no mesmo cartão.
- Ida e volta `CardState` ↔ cartão da biblioteca sem perda, inclusive datas e `last_review` nulo.
- Fila: ordem da regra 1, volta em até 20 minutos (regra 2), mais próximo quando ninguém venceu (regra 3), fim de sessão e Adiantar com limite 20.
- Migração 003 sobre um banco com cartões da 001 (no teste de SQL em Node, se a Etapa 7 confirmou que roda).

## Critérios de pronto
- [ ] `npm run check` e `npm run e2e` passam.
- [ ] Playwright: Treino com `?exemplo`, Espaço e 3 num cartão novo. Ele volta na mesma sessão, e o cartão respondido com 4 sai.
- [ ] Recarregar no meio da sessão não perde nenhuma resposta já dada.

## Roteiro de 5 minutos
1. Crie 3 cartões numa aula (Mesa, Alt N). Alt 4 e Iniciar.
2. Espaço vira. Embaixo de cada botão aparece o intervalo.
3. Responda 1 (Errei) no primeiro: ele volta antes do fim.
4. Responda 4 (Fácil) nos outros: eles somem da sessão.
5. Alt 6, Treino: mude a retenção para 95% e veja os intervalos menores no próximo cartão.
