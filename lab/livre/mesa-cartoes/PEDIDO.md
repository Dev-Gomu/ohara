# Cartões da Mesa: pedido do usuário (12/11/2026)

Bancada ainda não feita. Fazer em sessão nova, no Fable; aplicação no Opus.

- Os marcadores continuam: `@` frente (a pergunta); `#` e `##` título e subtítulo do verso, sem letra grande, só para dividir seção; listas numeradas e o resto como hoje.
- O cartão deve aparecer já com o visual final enquanto se escreve (frente em destaque, verso com seções), como no app antigo. Referência: `referencia-legado.png` (a ideia, não o visual exato; cores e formas são as da Ardósia refinada, sem fundo quente nem tarja colada).
- `##` hoje não existe em `src/core/study/cardText.ts`: na imagem ele vira uma observação em caixa-alta, recuada, abaixo do texto da seção. É regra nova no core (com teste).
- Texto que formou o cartão da referência:

```
@SINAL DE BLUMBERG
#Execução
1. Paciente em decúbito dorsal
2. Compressão lenta e profunda no ponto de McBurney
3. Retirada brusca da mão (descompressão)
#Achado
Presença de dor aguda e intensa no momento exato da descompressão.
##Indica irritação peritoneal; é o sinal clássico de apendicite.
```

A confirmar na bancada: o texto digitado fica ao lado do cartão (como hoje) ou some e só o cartão aparece.

## Andamento da bancada (12/11/2026)

Bancada em `v1.tsx` a `v4.tsx` (`_partes.tsx`, `cartoes.css`): http://localhost:5173/ohara/lab/livre.html?ideia=mesa-cartoes&v=todas

Já aceito pelo usuário:
- Escreve-se dentro do cartão (sem texto ao lado); foco no tablet, bloco de ~400 px.
- Marca (`@`, `#`, `##`) aparece só na linha do cursor, em pílula antes do texto.
- Cartão de uma peça: frente azul (`--cor-destaque`, texto `--cor-tinta`, negrito) colada no topo, verso abaixo no mesmo contorno. Exceção à regra "sem faixa colada no topo": registrar em `decisoes.md` ao aplicar.
- Frente e texto do verso em `--leitura-texto`. Título de seção (`#`): `--ui-rotulo`, caixa-alta, `--cor-acao` (exceção a "azul só é ação": registrar). Subtítulo (`##`): `--ui-sigla`, caixa-alta, `--cor-texto-2`. Sem espaçamento extra entre letras.
- `##` abre um sub-bloco que guarda as linhas seguintes até o próximo `#` ou `##` (regra nova no core, com teste).
- Sem recuo nas listas; recuo curto (8 px) no sub-bloco é opcional (botão "Recuo" na bancada).

Em aberto: o visual do sub-bloco. Recusados: caixa cinza vazando, caixa cinza contida, subtítulo em pílula, trilho na margem (fraco), contorno com legenda, cartãozinho com cabeçalho, caixa azul clara. O usuário pediu minimalismo (mais texto, menos enfeite) e chegou a uma versão no Claude Web: trazer para a bancada como versão única, conferir nos dois temas e pedir o aceite.

Ao fechar: a moldura do lab livre aceita 4 versões (era 3) por causa desta bancada; voltar para 3.
