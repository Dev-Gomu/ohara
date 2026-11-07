# Etapa 5: fixtures e telas de leitura

**Status:** pronta em 07/11/2026, sem teste do usuário (ver `loop-telas.md`).

## Feito
- Dados fictícios em `src/core/study/fixtures.ts`, com casos extremos: matéria vazia, nome longo, pasta vazia, 42 aulas e ano arquivado.
- Interface `Storage` em `src/core/study/storage.ts`, com versão em memória. O banco implementa a mesma interface depois.
- Hub em mosaico: provas, calendário, agenda de hoje, lembretes. Foco nasce na aula de agora.
- Acervo: início (anos e matérias) e matéria aberta (pastas, aulas, prévia), no fluxo da diretriz.
- Mesa ligada aos dados. Selo "Dados de exemplo" em toda tela.

## Roteiro de 5 minutos
1. Abra o app: o foco está na aula de agora. Enter abre a aula na Mesa, com o cursor nas Anotações.
2. Aperte Alt 3 e → até Imunologia. Enter abre a matéria, já no 2º bimestre.
3. Use ← → na régua: as aulas mudam na hora.
4. Enter entra nas aulas. ↓ troca a prévia. → vai à prévia. ← volta. ↑ na primeira aula sobe à régua.
5. Esc duas vezes volta à lista de matérias, no cartão de origem.
6. Aperte ↑ e ←: a régua de anos mostra o 1º ano arquivado.
7. Aperte Alt I, escreva um lembrete, Enter: ele aparece no Hub.
