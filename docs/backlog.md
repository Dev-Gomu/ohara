# Ohara: backlog

**Status:** versão 1. Data: 05/11/2026. Dono: o usuário (Product Owner).

Lista curta do que foi **adiado ou ainda não decidido**. O que está no plano de etapas não entra aqui.

**Regras:**
- Ideia nova durante uma etapa vem para cá, em **uma linha**, e **não** é feita na etapa em curso.
- O escopo é **congelado no checkpoint da Etapa 6**. Depois dele, só entra no plano o que o usuário aprovar.
- Para o item sair daqui: o usuário aprova e ele ganha etapa em `plano/`.

## Adiados (entram no fim do projeto, nesta ordem)

| ID | Item | Observação |
|---|---|---|
| B01 | **Sala de Foco** | Escopo ainda por definir com o usuário |
| B02 | **Integração com Anki** | Importar e/ou exportar cartões. Formato a definir |
| B03 | **Gerador automático de revisões** (1, 7 e 30 dias) | Por último, depois do Anki |

## Condicionais e técnicos

| ID | Item | Reavaliar quando |
|---|---|---|
| B04 | **Dropbox como provedor de sincronização** | Etapa 12, só se o teste Drive vs Dropbox favorecer (ver D32, D33) |
| B05 | **Migrar para TypeScript 7.x** | Quando o 7.1 e o typescript-eslint o suportarem (ver D06) |
| B06 | **Otimizador de parâmetros do FSRS no navegador** | Etapa 11, se for viável rodar sem servidor (ver D44) |
| B07 | **Novos blocos de mosaico** (ex.: Lembretes ou Agenda como bloco da Mesa) | Depois do checkpoint da Etapa 6, se as janelas de consulta não bastarem |

## Conceitos a esclarecer

| ID | Item | Pergunta |
|---|---|---|
| B08 | **Livro** | **Decidido em 06/11/2026:** PDF que pode ser anexado a uma matéria (livro inteiro) ou a uma aula (capítulo). Ver glossário em `visao.md` |

## Cortados (não voltam sem decisão explícita do usuário)

- Painel de estudo.
- Metas.
- Sequência de dias.

## Ideias novas

*(vazio; acrescente uma linha por ideia, com data)*
- 2026-11-05: **B09 Importar o backup .zip do app antigo** (matérias, aulas, anotações, cartões, provas) para o app novo, sem migrar código. Só depois da Fase B.
- 2026-11-05: Ideias que sobraram do legado, sem decisão: cloze nos cartões, suspender cartão, estudar só uma prova, limite de novos por dia, pomodoro, paleta de comandos no gerenciador de cartões, escolha do ícone de atalhos (o "?" do legado não agradou).
- 2026-11-05: Manter o app antigo no ar até o novo ter tudo o que o usuário usa.
- 2026-11-07: **Antes da Etapa 3:** aprovar D70 a D74 e passar as regras de `diretrizes-visuais.md` (2.2 a 2.5) para `teclado.md` e para o resolvedor.
