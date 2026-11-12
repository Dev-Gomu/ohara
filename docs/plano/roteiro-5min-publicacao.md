# Roteiro de 5 minutos: antes de publicar no main

Rode `npm run dev` e abra `http://localhost:5173/ohara/` no PC. Marque cada passo. Se algo não acontecer como descrito, anote o número do passo e o que viu.

**0. Backup (só se já tem dados reais no app publicado)**
1. `Alt 6` (Configs) → Backup → exportar. Guarde o arquivo.

**1. Teclado e tema**
2. `Alt 1` a `Alt 6` trocam de tela, e o número ativo muda no topo.
3. `Alt D` troca claro e escuro. Em cada tela, nenhum texto some nem fica ilegível.
4. `Alt /` abre a ajuda. `Esc` fecha.

**2. Hub**
5. `Alt 1`: aparecem provas, calendário, agenda de hoje e lembretes. `Alt I`, digite "teste", `Enter`: o lembrete aparece em Lembretes.

**3. Acervo**
6. `Alt 3`: setas escolhem uma matéria, `Enter` abre. Setas andam pelas pastas e pelas aulas. `Esc` volta à lista de matérias.

**4. Mesa**
7. Numa aula, `Enter` em "Abrir na Mesa" (ou `Alt 2`): Slides, Anotações e Cartões aparecem. Escreva uma frase nas Anotações, troque de tela e volte: a frase continua lá.

**5. Treino (a tela nova)**
8. `Alt 4`: o foco já está no **Iniciar treino**. `Alt F`, digite "imu": só Imunologia aparece na grade. `Enter`: foco vai à grade. `Enter`: volta ao botão.
9. `Enter` inicia. `Espaço` vira o cartão, `1` a `4` respondem. `Esc` duas vezes volta ao início.
10. Na tela inicial, ↓ até "Ajustar o que treinar", `Enter`: a lista abre ao lado. `→` entra nela, `Enter` marca uma aula, o resumo muda.

**6. Agenda, Notas e Faltas**
11. `Alt 5`: troque entre Semana, Mês, Lista e Grade. Escolha uma aula e veja a prévia.
12. Botão **Notas** (topo): crie a frase de acesso e **anote o código de recuperação**. Feche, reabra, desbloqueie com a frase.
13. Botão **Faltas** (topo): abre sem erro e mostra as matérias.

**Se tudo passou:** podemos abrir o PR para o main. Se algo falhou, me diga o número do passo.
