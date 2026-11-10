# Reformulação da identidade: Ardósia, "a luz segue o teclado"

**Status:** a parte visual (manter a paleta Ardósia) foi **recusada** pelo usuário em 09/11/2026: "não é identidade nova". As regras de foco seguem valendo na proposta seguinte, a identidade **Anil** (`lab/id-anil.html`), que aguarda a opinião dele. Briefing: `docs/briefing-identidade-fable.md`. Demo: `lab/id-demo.html`.
**Pedido:** uma identidade única e coesa (não remendos), agradável, feita para o uso rápido pelo teclado, com inspiração funcional em gerenciadores de janelas em mosaico (Hyprland).

## A ideia, em uma frase
**A tela é calma e neutra; existe uma única luz (o cobalto), e ela está sempre onde as teclas agem.** Todo o resto da identidade decorre disso.

## O que vem do Hyprland (função, não enfeite)
| No Hyprland | No Ohara |
|---|---|
| Borda colorida só na janela ativa | Contorno cobalto só onde as teclas agem |
| Janelas inativas levemente apagadas | Blocos inativos um degrau mais perto do fundo |
| Áreas de trabalho numeradas na barra | Telas 1 a 6; a atual abre e mostra o nome |
| Barra de módulos discreta | Topo em ilhas: telas, contexto, módulos |
| Indicador de modo (submap) | Indicador de nível: Menu, Bloco ou Campo, com as teclas que valem |
| Vãos iguais, sem decoração | Vão de 8 px, sem divisória, sombra ou gradiente (já é assim) |

## As 7 regras do sistema
1. **Três alturas de superfície.** Fundo, bloco, peça dentro do bloco. O bloco onde você está fica na altura cheia; os outros recuam um degrau.
2. **Um cursor só, sempre com a mesma forma.** Contorno cobalto por dentro: na aba (nível menu), no bloco (nível bloco, 3 px) ou no item (nível campo, 2 px). Nunca em dois lugares.
3. **Rastro.** Com o cursor num item, o bloco dele guarda um contorno fraco: mostra o caminho de volta do Esc.
4. **Escolhido é preenchimento neutro** (`--cor-escolhido`): aba atual, filtro, item da lista. Fica quando o cursor sai.
5. **Grafite é só ação.** Um botão principal por bloco. A aba atual deixa de ser grafite.
6. **Cor viva de conteúdo só na pílula da matéria** (M2). Capas e fundos ficam neutros.
7. **Tecla sempre visível e sempre igual:** a mesma pecinha em títulos, botões e no indicador de nível.

Texto em três degraus por bloco, com a escala que já existe: rótulo (caixa-alta, apagado; cobalto no bloco ativo), conteúdo, apoio.

## O que fica
Paleta C (nenhuma cor nova), tipografia (D67, D68), raios e cartões de uma peça bem arredondados, pílulas e M2, layout das telas, todo o modelo de teclado.

## Decisões que isto revê (só após o aceite)
D105, D107, D109, D111 (forma e espessura do foco viram a regra 2), D115 (aba atual em grafite vira a regra 4 e 5). Elemento novo: indicador de nível na barra. D106 e D112 ficam, salvo pedido.

## Passos (um por sessão)
1. **Aceite da demo** (`lab/id-demo.html`, Acervo de uma matéria, navegável pelo teclado).
2. **Telas-vitrine no lab:** Hub, Mesa e Agenda com as mesmas 7 regras.
3. **Aplicar em `src/`:** tokens e base primeiro, depois tela por tela; `decisoes.md` e seção 3 e 6 de `diretrizes-visuais.md` atualizadas.
