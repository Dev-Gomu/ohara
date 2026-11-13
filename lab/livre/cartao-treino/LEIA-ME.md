# Editor de cartões da Mesa com as cores do Treino (D138 + D150)

Base: `../mesa-flashcard` (editor da D138). Aqui entram as cores do cartão do Treino: frente cheia no azul de ação com texto claro, borda do cartão na cor da frente (frente e verso são uma peça só), títulos de seção no destaque (cor nos títulos já ligada). Salvar saiu do rodapé e foi para o cabeçalho do bloco (D140).

- **V1 · Fiel.** Só as cores do Treino.
- **V2 · Duas colunas.** Verso em duas colunas quando o cartão passa de 520 px (tablet deitado); uma coluna abaixo disso.
- **V3 · Rótulos.** "Frente" e "Verso" em caixa-alta, como no Treino.

Query: `&cor=off` desliga a cor nos títulos; `&dens=compacta`; `&largura=livre`.
Tablet: `http://<IP do PC>:5180/ohara/lab/livre.html?ideia=cartao-treino&v=todas&largura=livre` (configuração `ohara-rede`).
Parecer (14/11): **V2 aprovada (D155)**. A pasta sai ao aplicar, junto com `mesa-flashcard`.
