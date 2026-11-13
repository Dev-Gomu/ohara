# Mesa: espaço dos três blocos (Slides, Anotações, Cartões)

Link: http://localhost:5173/ohara/lab/livre.html?ideia=mesa-blocos&v=todas
Parâmetros: `&foco=slides|notas|cartoes|menu` `&nivel=bloco|campo` `&cartoes=novo|salvos` `&toque=1` `&extremo=1` `&barra=1`. Para ver bem, abra uma versão por vez (`&v=1`, `2`, `3`); em `todas` as colunas ficam estreitas.

## Altura hoje (medida em 1920) e em cada versão
Hoje: cabeçalho 60 px (Slides e Cartões) e 40 px (Anotações); barra de formatação ~56 px sempre; rodapé dos cartões ~60 px.

| | Cabeçalho | Formatação (Anotações) | Rodapé dos cartões |
|---|---|---|---|
| V1 | 28 px (+8 de margem) | só no campo | 1 linha só com Salvar |
| V2 | 0 | bolha só no campo | Salvar flutuante, 0 |
| V3 | 0 em cima; régua de 32 px embaixo | só no campo | dentro da régua, 0 |

Ganho aproximado: V1 devolve ~24 px em Slides/Cartões e ~20 px nos cartões embaixo; V2 devolve ~60 px por bloco e a barra inteira; V3 ~28 px por bloco e a barra inteira.

## O que cada versão propõe
- **V1 Cabeçalho fino:** mesma ideia de hoje, mais enxuta. Fora de foco só o ícone; em foco aparecem nome, tecla e ⋮. Passador vira texto "3 de 24" com setas pequenas. Abas Novo/Salvos viram texto com sublinhado.
- **V2 Sem cabeçalho:** o conteúdo ocupa tudo. Selo (ícone + tecla) no canto; ⋮, abas, passador, Salvar e formatação flutuam só com o bloco em foco ou no toque. Risco: o selo cobre um canto do conteúdo (reservei 34 px de topo nos cartões e nas anotações).
- **V3 Régua embaixo:** sem cabeçalho; no pé de cada bloco uma régua com nome, tecla, controle do bloco (páginas, abas, "Formatação Alt T") e ⋮. Salvar fica na régua dos cartões.

Em todas: três níveis de foco visíveis (fora, bloco, campo), toque com alvos de 44 px (`&toque=1`), alvos de dedo invisíveis ampliados nas setas e no ⋮.

## O que muda no app
`Block.tsx` (cabeçalho opcional/fino ou régua), `SlidesViewer`, `CardsBlock` (abas, rodapé), `NotesBlock` (barra só no campo), CSS da Mesa.

## Teclas novas sugeridas (tabela `src/core/keyboard/keys.ts`)
- Alt T já existe (barra de formatação): na V3 aparece como dica na régua.
- Opcional: tecla para alternar Novo/Salvos dentro de Cartões (se ainda não houver), e ⋮ do bloco via menu (Alt M?).

## Recomendação
**V3** se quiser clareza do que cada bloco é sem perder espaço; **V1** é a mais segura (muda pouco). Recomendo **V1 para o app já**, V3 se quiser ganhar mais altura. V2 devolve mais, porém esconde mais coisa (pior para quem aprende o teclado).

## Pendências
- Colunas estreitas (modo `todas`, 1920): Salvar da V3 estoura a régua em largura < ~600 px; no app real o bloco tem ≥ 640 px, mas conferir.
- Em tablet 1280 o slide fica pequeno nas três; não corrigido (é a proporção do mosaico).
- Teste de teclado real só no app (bancada é só desenho).
