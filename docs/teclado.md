# Ohara: teclado

**Status:** versão 1, Etapa 0 concluída com o PC. Roteiro da Etapa 2 passou no tablet (ver "Testado"). Falta o verificador completo no tablet (ver "Pendências"). Data: 06/11/2026.
**Fonte:** protótipo em `public/prototipo-teclado/` (`teclas.js` é a tabela candidata) e o relatório do PC (Linux, Chrome instalado como app, teclado ABNT2).

Esta é a tabela de atalhos que a Etapa 2 implementa. Cada linha vira um teste (D16).

## Regras de uso

- **Alt** é o modificador do sistema e vale até dentro dos campos de texto.
- **Tecla solta** (H J K L, setas, Tab, Enter) só age fora de campos de texto. Digitar nunca dispara atalho.
- **Enter** desce um nível, **Esc** sobe um: menu → bloco → campo.
- **Dois tipos de campo (D70):** no campo de texto, setas e Enter são do texto. No campo navegável (lista, régua, grade), setas e H J K L andam entre os itens e Enter faz a ação principal.
- **Setas no campo navegável (D71):** cada controle usa um eixo. A seta do outro eixo e a seta na borda saem para o vizinho. Segurar a tecla não atravessa a borda. Só a barra de telas dá a volta.
- **Esc (D72):** janela → menu ⋮ → campo → bloco → tela-mãe → barra de telas.
- **Ctrl** fica para o editor (negrito, títulos, listas) e para a Paleta alternativa.
- Teclas do ABNT2 são lidas pelo código físico (`e.code`), não pelo caractere. Por isso `Alt /` é a tecla `IntlRo`, e `Alt ]` é `Backslash`.

## Tabela final

### Telas
| Tecla | Ação |
|---|---|
| Alt 1 … Alt 6 | Hub, Mesa, Acervo, Treino, Agenda, Configs |

### Foco e movimento
| Tecla | Ação |
|---|---|
| Alt H J K L · Alt ← ↓ ↑ → | Foco para o vizinho (menu, bloco e campo) |
| Alt Shift H J K L | Troca o bloco em foco de lugar com o vizinho |
| H J K L · ← ↓ ↑ → (sem Alt) | No bloco: vai ao vizinho. No campo navegável: próximo item. No menu: próxima tela |
| Enter | Desce um nível |
| Esc | Sobe um nível (ou fecha janela) |
| Tab · Shift Tab | Próximo e anterior bloco |

### Blocos
| Tecla | Ação |
|---|---|
| Alt S · Alt A · Alt C | Abre ou fecha Slides, Anotações, Cartões |
| Alt M · Alt W | Amplia o bloco · fecha o bloco |
| Alt R | Modo de redimensionar |
| Alt X | Troca pelo bloco escondido |
| Alt O | Opções (⋮) do bloco |
| Alt T · Alt F · Alt B | Vai à barra de cima · ao campo · à barra de baixo |
| Alt , · Alt . | Controle anterior e próximo na barra |
| Alt N | Novo item no bloco em foco (D78). Na Mesa, sempre um cartão novo, de qualquer bloco |
| Alt 0 · Alt Shift 0 | Tamanhos padrão · ordem padrão |

### Sistema
| Tecla | Ação |
|---|---|
| Alt P · Ctrl P | Paleta: ir para… |
| Alt I | Lembrete rápido, em qualquer tela |
| Alt Z | Desfaz a última exclusão (vale por 10 segundos) |
| Alt / · F1 | Ajuda |

### Slides
| Tecla | Ação |
|---|---|
| Alt [ · Alt Page Up | Página anterior |
| Alt ] · Alt Page Down | Próxima página |

### Treino (no cartão, D77)
| Tecla | Ação |
|---|---|
| Espaço | Vira o cartão |
| 1 · 2 · 3 · 4 | Errei, Difícil, Bom, Fácil |

### Editor (Anotações e Cartões)
| Tecla | Ação |
|---|---|
| Ctrl B · Ctrl I · Ctrl U | Negrito, itálico, sublinhado |
| Ctrl K · Ctrl E · Ctrl M | Link · código · marcar a página do slide |
| Ctrl Shift H · Ctrl Shift X | Marca-texto · riscado |
| Ctrl Alt 1 · 2 · 3 | Título 1, 2, 3 |
| Ctrl Shift 7 · 8 · 9 | Lista numerada, com marcadores, de tarefas |
| Ctrl Enter | Salvar cartões |

## Decisões desta etapa

- **Alt /** é a tecla de ajuda. **Alt ;** sai da tabela: era duplicata, e no ABNT2 o `;` fica numa tecla que o usuário não associa a ajuda.
- **F1** fica como segunda opção de ajuda.
- O **Alt+número** não troca aba no Chrome Linux (fecha o D20 para o PC).

## Testado (PC, Linux, Chrome instalado como app)

- 71 de 71 teclas sem cursor em campo.
- 60 de 60 teclas com cursor em campo.
- Nenhum conflito entre teclas no mesmo nível (checado por `teclas.js`).

## Testado no tablet (Galaxy Tab S7 FE, na horizontal)

- **Teclado:** Pebble Keys 2 380s, bluetooth, ABNT2.
- **Roteiro de 5 minutos da Etapa 2 (0.2.0):** 7 de 7 passos.
- Enter, Esc, H J K L, setas, digitação no campo, AltGr, Alt /, F1, toque no campo.

## Checkpoint da Etapa 6 (07/11/2026)

Tabela congelada com 75 teclas. Tecla nova, a partir daqui, precisa de motivo registrado em `decisoes.md`.

## Pendências

- **Tablet, verificador completo:** o roteiro passou, mas a lista de 70 teclas ainda não foi rodada no tablet. Antes de congelar a tabela (Etapa 6), rodar o verificador do protótipo no tablet e conferir o relatório.
- **Teclas do navegador:** o passo 6 do roteiro passou no tablet. Ainda não foi testado no PC, na versão 0.2.0.
- **Ctrl Alt 4 a 9 e Ctrl Shift 4 a 6:** fora da tabela, sem uso previsto.
