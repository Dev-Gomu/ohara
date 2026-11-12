# Plano: duas tipografias em seis papéis

**Status:** Bancada aplicada em 06/11/2026 (Rodada 4 do canvas). Aguarda aprovação do usuário no tablet.
**Pedido:** dividir as fontes em seis papéis, com repetição só quando for ideal, e planejar duas tipografias do zero.
**Substitui** a regra de "no máximo duas famílias" de `identidade-tipografia.md`. O Campo fica como referência, sem decisão do usuário.

> **Atualização de 06/11/2026:** o usuário recusou esta identidade e voltou à da Rodada 2 (lavanda, índigo, cantos arredondados, pílulas). A escolha de fontes segue na Rodada 5 do canvas.

## 1. O que cada papel exige
| Papel | Exigência |
|---|---|
| Interface geral | Nítida em 13 a 15 px, compacta, números tabulares |
| Sigla (3 letras) | Maiúsculas fortes, mesma largura para alinhar em lista, boa de 12 a 40 px |
| Título da anotação | Voz própria, grego, compacto em bloco estreito |
| Texto da anotação | Conforto longo, grego, setas, ≥, índices, itálico |
| Pergunta do cartão | Lida de relance, em 24 px no Treino, com presença |
| Resposta do cartão | Contraste claro com a pergunta, calma, aceita listas |

## 2. Medição (arquivos reais do Google Fonts)
Só 8 famílias têm grego, setas, ≥ e índices completos: B612, Fira Sans, IBM Plex Sans, JetBrains Mono, Literata, Piazzolla, Sofia Sans, Source Serif 4. Os papéis que recebem conteúdo do usuário só usam fontes dessa lista. É requisito funcional do conteúdo, não tema da identidade.

Interface e sigla podem ficar fora dela, porque não recebem texto de estudo.

**Regra do usuário (06/11/2026):** nenhuma influência de medicina na identidade. O app é de produtividade e estudos, independente do assunto.

## 3. Tipografia 1: Estante
Conceito: um bom livro dentro de uma ferramenta de trabalho. Serifa domina o conteúdo.

| Papel | Fonte | Peso | Tamanho / linha |
|---|---|---|---|
| Interface geral | Schibsted Grotesk | 500, 600 | 14 / 20 |
| Sigla | JetBrains Mono | 700 | 13 / 16 |
| Título da anotação | Piazzolla | 600 | 28 / 34 |
| Texto da anotação | Source Serif 4 | 400, 600, itálico | 17 / 27 |
| Pergunta | Piazzolla | 600 | 24 / 31 |
| Resposta | Source Serif 4 | 400 | 18 / 27 |

Repetições: Piazzolla em título e pergunta (as duas chamam atenção); Source Serif em texto e resposta (as duas são para ler).
Risco: duas serifas lado a lado. Piazzolla tem α de desenho simples.

## 4. Tipografia 2: Bancada
Conceito: mesa de trabalho precisa. Sem serifa em quase tudo; a serifa só surge quando a resposta aparece.

| Papel | Fonte | Peso | Tamanho / linha |
|---|---|---|---|
| Interface geral | IBM Plex Sans | 500, 600 | 14 / 20 |
| Sigla | B612 Mono | 700 | 12,5 / 16 |
| Título da anotação | Sofia Sans Semi Condensed | 700 | 30 / 34 |
| Texto da anotação | IBM Plex Sans | 400, 600, itálico | 16 / 26 |
| Pergunta | IBM Plex Sans | 600 | 23 / 30 |
| Resposta | Source Serif 4 | 400 | 18 / 27 |

Repetições: Plex em interface, texto e pergunta (coesão de ferramenta).
Risco: leitura longa em sem serifa cansa mais que em serifa. O hífen da Sofia é largo ("TNF–α").

## 5. Decisões comuns
- **Horas e atalhos** usam a mesma mono da sigla. Não é um sétimo papel.
- **Números grandes** do Hub usam a fonte do título da anotação.
- **Cartão em lista** (Mesa): mesma fonte da pergunta e da resposta, em 15,5 px.
- **Cores:** neutras nesta rodada, para julgar só a tipografia.

## 6. Descartadas depois de ver
- B612 inteira: setas minúsculas e itálico estranho. Fica só a Mono, em sigla.
- Fira Sans inteira: correta e coesa, porém sem voz.
- Piazzolla como texto: algarismos e setas pequenos em leitura longa.

## 7. Execução
1. Gerar fontes woff2 enxutas e medir o peso total. Meta: até 400 KB por tipografia.
2. Montar **Mesa, Hub e Treino** nas duas, com a mesma base de cor. O Treino entra porque só nele pergunta e resposta aparecem em tamanho real.
3. Mostrar a pergunta sozinha e depois com a resposta revelada.
4. Conferir por captura em tamanho real, claro e escuro, antes de publicar. Canvas pede login no navegador embutido: renderizar localmente.
5. Publicar como "Rodada 4" no canvas, com troca entre as duas.

Fora do escopo: mexer em `src/`. Modelo indicado: Opus.

## 8. Resultado da Bancada (Rodada 4)
- Base: grafite neutro com marca-texto amarelo. Amarelo só em marcação, "agora" e foco.
- Peso: 214 KB em woff2 (8 arquivos, latim, grego e símbolos).
- Mudanças em relação ao plano: horas e contagens foram para IBM Plex Sans, porque a B612 Mono abre vão nos dois-pontos ("08: 00"). No Treino, pergunta em 32/40 e resposta em 22/34.
- Teclas do Treino ainda não existem em `teclado.md`. Os botões da tela não mostram atalho.
