# Etapa 4: mosaico e Mesa

**Status:** pronta em 07/11/2026, sem teste do usuário (ver `loop-telas.md`).

## Feito
- Motor dwindle puro em `src/core/mosaic/tree.ts`, com testes: abrir, fechar, trocar, redimensionar, tamanhos e ordem padrão.
- `neighbor` por borda compartilhada: resolve o caso dos blocos altos que estava no backlog.
- Mesa com Slides, Anotações e Cartões. Cursor nasce nas Anotações. Alt S, A, C, M, W, R, X, O, Alt Shift H J K L, Alt 0 e Alt Shift 0 funcionam.
- Toque: botões de bloco no topo, menu ⋮ com as mesmas ações e divisa invisível para arrastar.
- Arranjo em memória por aula, até existir banco.

## Roteiro de 5 minutos
1. Aperte Alt 2: o cursor já está nas Anotações. Digite algo.
2. Aperte Alt ]: o slide passa, e o cursor continua no texto.
3. Aperte Alt S duas vezes: Slides fecha e volta, e o texto continua lá.
4. Aperte Alt M e de novo Alt M: amplia e volta.
5. Aperte Alt R, use as setas e Esc: o bloco muda de tamanho.
6. Aperte Alt Shift H: os blocos trocam de lugar. Alt Shift 0 desfaz.
7. Com o dedo, arraste o vão entre dois blocos e abra o ⋮ de um bloco.
