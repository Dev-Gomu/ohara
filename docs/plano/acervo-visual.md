# Revisão visual do Acervo: plano em 6 etapas

**Status:** plano escrito em 08/11/2026, nada aplicado. Pedido do usuário depois do foco (D105 a D107).
**Problema de partida:** o foco ficou quase invisível sobre os cartões de matéria, que têm fundo pastel cheio (o contorno é 70% da cor ativa sobre `--cor-cartao`, e a matéria tem outra cor por baixo). O resto do Acervo foi feito antes do foco novo e nunca teve uma revisão visual própria (D-Acervo pendente em `loop-telas.md`).
**Referências:** `../Dev_Ohara/referencia-legado/telas/acervo-pc.jpg` (só imagem), `docs/diretrizes-visuais.md` (checklist e modelo de proposta), `lab/_sala.js` (copie `lab/foco-provas.html`).
**Modelo sugerido:** Opus 5.5 nas etapas 1 e 2 (decisão de design); Sonnet 5.5 nas demais.
**Regra de trabalho:** cada etapa de desenho termina numa **bancada em `lab/`** com no máximo 4 versões e minha recomendação; o usuário escolhe; só então mexe em `src/`.

## O que vi

**App antigo (inspiração):**
- Cartão de matéria com **sigla enorme e fina** no alto, nome em caixa alta pequeno embaixo, e um **rodapé mais escuro** com horário da próxima aula, pílula "prova 8d" e botão de opções. A informação útil (quando é a aula, quando é a prova) estava no cartão.
- Cor da matéria em fundo cheio, **saturada e mais escura**: o texto claro lia bem e o foco (borda dupla clara) aparecia.
- Pouco ruído: título da tela, contagem, uma ação principal.

**App novo (problemas):**
1. Foco do cartão de matéria some sobre o pastel (e no escuro o brilho da cor briga com o contorno).
2. No cartão, o número de aulas é o maior elemento; a sigla virou pílula pequena. O que identifica a matéria (sigla) perdeu força e o que muda pouco (contagem) ganhou.
3. Falta a informação de **tempo** (próxima aula e prova) que o legado tinha.
4. Bloco de fundo escuro com borda grande em volta da grade e outra borda de foco dentro: contornos empilhados.
5. Prévia da aula é um retângulo colorido enorme e vazio (capa ainda é só cor).
6. Régua de anos e régua de pastas parecem iguais, mas fazem coisas diferentes; "+ Nova pasta" e "+ Nova matéria" em tracejado chamam mais que a seleção.
7. Aula selecionada na lista usa fundo azul forte mais contorno: com o foco novo, seleção e foco se confundem.

**Respeitar (gostos firmes):** sem divisórias, sem gradiente, sem tarja ou faixa colada na lateral ou no topo, cartões de uma peça, cantos bem arredondados, ícones SVG, só a **sigla** da matéria em cartões pequenos (ver `so-sigla-materia`; o Acervo é a exceção a decidir na etapa 2, pois o cartão grande comporta o nome), cor da matéria só em fundo cheio, pílula, bolinha, sigla ou título.

## Etapas

| # | Etapa | O que sai |
|---|---|---|
| 1 | **Foco sobre a cor da matéria** (o problema urgente) | Bancada `lab/foco-materia.html` com 4 jeitos: (a) contorno de 4px na **tinta** (`--cor-tinta`) por dentro; (b) contorno duplo (fio claro por fora, tinta por dentro, como o legado); (c) cartão "sobe" 2px com sombra suave e contorno de tinta; (d) cor da matéria escurece e o texto vira claro no foco. Testar nas 8 cores, claro e escuro, paletas A e B. Regra escolhida vale para todo cartão com fundo de matéria (Acervo, Agenda, Hub). |
| 2 | **Cartão de matéria** | Bancada com 4 composições: sigla grande e fina + nome pequeno (legado) ; sigla em pílula + nome grande (hoje, sem o número gigante); com ou sem rodapé de "próxima aula · prova em Nd"; tom da cor (pastel de hoje vs. mais saturado e escuro do legado). Pergunta de produto ao usuário: pode mostrar o **nome inteiro** no Acervo? (recomendo sim, só aqui). |
| 3 | **Réguas e ações** (anos, pastas, "+ Nova") | Régua de anos com cara de "pasta/arquivo" e régua de pastas com cara de filtro; "+ Nova" como ação discreta no fim (pílula cheia pequena, não tracejada). Aplicar o foco fino de 2px (D107). |
| 4 | **Lista de aulas e seleção** | Separar **selecionada** (preenchimento suave `--cor-escolhido`) de **em foco** (contorno 4px). Linha com título, data, pasta e contagem de cartões alinhados; pílula de atalho só onde há tecla. |
| 5 | **Prévia da aula** | Capa com proporção de slide e a sigla pequena; enquanto não há capa real, placeholder calmo (cor da matéria em tom suave, ícone de slide), nunca um retângulo gigante chapado. Título, data, pasta, contagens (slides, anotações, cartões) e botão "Abrir na Mesa". |
| 6 | **Aplicar e fechar** | Passar as escolhas para `Acervo.module.css`, `AcervoHome.tsx` e `SubjectView.tsx` (arquivos até ~300 linhas); conferir 1280×800 e PC, claro e escuro, paletas A e B, `?exemplo`, matéria sem aulas e com 42 aulas, nome longo. Atualizar `diretrizes-visuais.md`, registrar em `decisoes.md` (até 5 linhas, D108 em diante), `_indice.md` e `npm run check` + `npm run e2e`. Roteiro de 5 minutos. |

## Cuidados
- Uma etapa por vez, com `/clear` no meio se o usuário quiser. As etapas 1 a 5 só mexem em `lab/` e no fim de cada uma o usuário decide; a 6 é a única que edita `src/`.
- Não mexer em teclas nem em dados. Celular fora de foco.
- Dúvida de produto vai ao usuário com recomendação: nome inteiro no cartão (etapa 2) e se "próxima aula e prova" entra no cartão (precisa dos dados de horário e prova por matéria, que já existem).

## Resultado das etapas 1 a 5 (refeito considerando os DOIS temas, 08/11/2026)

A primeira rodada foi julgada quase só no claro. Esta revisão conferiu cada bancada no claro e no escuro (paleta A) e corrigiu o que falhava. Só `lab/` e este plano mudaram; `src/` está intacto. Abra pelo índice http://localhost:5173/ohara/lab/ ou em `lab/acervo-N-*.html?v=todas&paleta=a`, trocando o tema com a tecla **D** da sala.

**O que o escuro mudou:**
- Contorno de **tinta** (escura) por dentro, que eu tinha recomendado, **some no escuro**: o anel fica da cor da página e parece que o cartão encolheu. Passou para **`--cor-foco`** (escura no claro, clara no escuro), que lê nos dois temas.
- Cartão de matéria com **pastel cheio no escuro ofusca** e destoa do resto. No escuro a cor da matéria fica mais funda (62% da cor sobre a tinta) com texto claro; no claro segue pastel.
- O ícone e o texto do placeholder da prévia eram de tinta escura e **sumiam** sobre o fundo escuro; passaram a usar o texto do tema.

| Etapa | Bancada | Recomendo | Nos dois temas |
|---|---|---|---|
| 1 Foco sobre a matéria | `acervo-1-foco.html` | **E**: 4px de `--cor-foco` por dentro | Claro: anel escuro. Escuro: anel claro, nítido sobre todas as 8 cores. A (tinta) falha no escuro; F (duplo fino) funciona nos dois, mas é mais pesado. Hoje (2px, cor ativa) é invisível em ambos. |
| 2 Cartão de matéria | `acervo-2-cartao.html` | **E**: sigla enorme e fina, nome pequeno, rodapé sem fundo com aulas, horário e prova em Nd; **cor cheia no claro, cor funda com texto claro no escuro** | Foco de 4px de `--cor-foco`. Precisa dos dados de horário e prova por matéria (já existem). Pergunta ao usuário: nome inteiro no cartão (hoje aparece pequeno). |
| 3 Réguas e "+ Nova" | `acervo-3-reguas.html` | **~~A~~ recusada pelo usuário; escolher entre N1, N2 e N3** (ver abaixo) | A tinha dois defeitos: o foco some (anel da cor do preenchimento) e o disco cheio vira o item mais forte da régua, ofuscando a seleção (no escuro é um disco branco). Sem rótulo, não diz se cria matéria ou pasta. |
| 4 Lista de aulas | `acervo-4-aulas.html` | **A**: selecionada com fundo suave, foco com contorno de 4px (`--cor-contorno-foco`) | No escuro o fundo suave ainda se distingue do fundo forte de hoje e o contorno lê. |
| 5 Prévia | `acervo-5-previa.html` | **A**: placeholder suave (cor da matéria a 35%, ícone de slide, "sem capa ainda") | Texto e ícone seguem `--cor-texto-2`; B (miniatura ao lado) é a alternativa se faltar altura. |

**Pendente de conferir:** paleta B e o tema original (sem paleta) nas cinco bancadas, e o cartão da etapa 2 com nome longo ("Patologia geral e bases moleculares") em 1280×800 no app real.

**Para a etapa 6:** aplicar as recomendações em `Acervo.module.css`, `AcervoHome.tsx` e `SubjectView.tsx`. O foco da etapa 1 (4px de `--cor-foco`) também vale para os outros cartões com fundo de matéria (Agenda e Hub). Ao decidir, lembrar que o foco de bloco e de item (D105) usa `--cor-contorno-foco` e que cor de matéria fica mais funda no escuro só no Acervo, a menos que o usuário queira estender.

**Etapa 3, nova rodada (usuário recusou a A):** a bancada mostra Hoje, a A recusada e três novas, cada uma com a régua de anos em repouso e a de pastas com "+ Nova" em foco, nos dois temas.
- **N1 pílula tonal com ícone:** mesma altura e fundo dos chips, bolinha com "+" e o rótulo. Parece parte da régua, discreta, foco por contorno fino. **Minha recomendação.**
- **N2 texto discreto no fim da régua:** só "+ Nova pasta", sem fundo, empurrado para a direita; separa "criar" de "filtrar". Mais calma, mas o alvo de toque é menos óbvio.
- **N3 contorno fino sólido:** pílula com borda de 1,5px (não tracejada), logo depois dos chips. Mais visível que a N1, ainda leve.
