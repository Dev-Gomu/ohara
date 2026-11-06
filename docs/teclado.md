# Ohara: teclado

**Status:** versão 1, Etapa 0 concluída com o PC. O tablet ficou pendente (ver "Pendências"). Data: 06/11/2026.
**Fonte:** protótipo em `public/prototipo-teclado/` (`teclas.js` é a tabela candidata) e o relatório do PC (Linux, Chrome instalado como app, teclado ABNT2).

Esta é a tabela de atalhos que a Etapa 2 implementa. Cada linha vira um teste (D16).

## Regras de uso

- **Alt** é o modificador do sistema e vale até dentro dos campos de texto.
- **Tecla solta** (H J K L, setas, Tab, Enter) só age fora de campos de texto. Digitar nunca dispara atalho.
- **Enter** desce um nível, **Esc** sobe um: menu → bloco → campo.
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
| H J K L · ← ↓ ↑ → (sem Alt) | No nível bloco: vai ao bloco vizinho |
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
| Alt N | Cartão novo |
| Alt 0 · Alt Shift 0 | Tamanhos padrão · ordem padrão |

### Sistema
| Tecla | Ação |
|---|---|
| Alt P · Ctrl P | Paleta: ir para… |
| Alt I | Lembrete rápido, em qualquer tela |
| Alt / · F1 | Ajuda |

### Slides
| Tecla | Ação |
|---|---|
| Alt [ · Alt Page Up | Página anterior |
| Alt ] · Alt Page Down | Próxima página |

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

## Pendências

- **Tablet (Galaxy Tab S7 FE, teclado ABNT2 bluetooth):** não testado. É o aparelho principal. Antes de congelar a tabela (Etapa 6), rodar o verificador e conferir o relatório.
- **Teclas do navegador:** o teste confirma que a página recebeu a tecla, não que o navegador não agiu também. Para `Ctrl K`, `Ctrl E` e `Ctrl M`, conferir na tela se o navegador não abriu nada.
- **Ctrl Alt 4 a 9 e Ctrl Shift 4 a 6:** fora da tabela, sem uso previsto.
