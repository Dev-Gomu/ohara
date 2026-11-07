# Etapa 3: casca de navegação

**Status:** pronta em 07/11/2026, sem teste do usuário (ver `loop-telas.md`).

## Feito
- Campo navegável, regras das setas e Esc com tela-mãe no núcleo do teclado (D70 a D72), com testes.
- Seis telas com Alt 1 a 6, barra do topo e memória de foco por tela.
- Paleta com React Aria (D13), lembrete rápido provisório e ajuda.
- Tokens de `src/ui/styles/tokens.css`, tema claro e escuro, fontes servidas pelo app (D68).
- `docs/telas.md`. A bancada da Etapa 2 saiu.

## Critérios de pronto
`npm run check` e `npm run e2e` passam; capturas conferidas; nenhuma tecla fora da tabela.

## Roteiro de 5 minutos
1. Aperte Alt 1 a Alt 6 e confira o título de cada tela.
2. Aperte Esc até o foco chegar à barra de números. Use ← → e Enter para abrir outra tela.
3. Aperte Alt P, digite "trei", aperte ↓ e Enter: abre o Treino.
4. Aperte Alt P, digite "tema", aperte ↓ e Enter: o tema troca.
5. Feche e abra o app: o tema continua o mesmo.
6. Aperte Alt / e confira a lista de atalhos. Esc fecha.
