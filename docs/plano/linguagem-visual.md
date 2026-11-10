# Linguagem visual reutilizável (Ardósia refinada)

**Status:** plano aceito em 09/11/2026. **Passo 1 feito em 09/11/2026** (`diretrizes-visuais.md` versão 3; a seção 10 lista o que os passos 3 e 4 precisam fechar). **Passo 2 feito em 09/11/2026** (tokens por papel; renomeados: `--cor-acao`, `--cor-sobre-acao`, `--cor-escolhido`, `--cor-cursor`; matérias `--cor-materia-0` a `7`; novos `--cor-agora`, `--cor-ok`, `--cor-atencao`, `--sup-recuada`, `--sup-peca`, `--cor-rastro`, `--cor-relevo`). **Passo 3 feito em 09/11/2026** (peças em `src/ui/components`, lista abaixo; conferência em `lab/pecas.html`). **Passo 4 feito em 10/11/2026** (vitrine em `lab/vitrine.html`, código em `lab/vitrine/`; substitui `lab/pecas.html`). **Passo 5 feito em 10/11/2026** (`scripts/lint-visual.mjs` dentro de `npm run lint`: cor, raio e tamanho de letra soltos falham; linha no `CLAUDE.md`). **Passo 6 feito em 10/11/2026** (Agenda: barra, prévia e "A completar"; Mesa: sigla, Anexar PDF e Salvar; usam `Button`, `Key`, `ListItem`, `Preview`, `SubjectPill`). **Passo 7 feito em 10/11/2026** (D117; D105, D107, D109, D111 e D115 revistas sem apagar). **Plano concluído.** Peças que faltavam feitas em 10/11/2026 (D118): `Filter`, `DayPill`, `SubjectMark`, `Toggles`, `ModeIndicator`; dia e modo ainda em teste.
**Objetivo:** qualquer modelo conseguir montar telas e criar peças novas no padrão, sem depender do Fable.
**Base:** `lab/id-ardosia2.html` (biblioteca) e `lab/hub-ardosia2.html` (Hub).

## Ideia central
Só o `.md` não basta: modelo reproduz qualidade copiando **exemplo que funciona**. O que garante o resultado é o conjunto: peças reais, vitrine, tokens por papel e lint. O `.md` explica só o porquê e quando usar cada peça.

## Passos (um por sessão, `/clear` entre eles)
| # | Passo | O que sai | Modelo |
|---|---|---|---|
| 1 | Regras de papel | `diretrizes-visuais.md` reescrito e curto: as 3 forças do azul, as 3 alturas, cursor, rastro, pílula, tecla, quando usar cada peça; aponta para a vitrine | **Fable** |
| 2 | Tokens | `tokens.css` e `paletas.css` com nomes por papel; cores viram valores trocáveis | Sonnet |
| 3 | Peças reais | Pílula, Tecla, Botão, Ilha, Bloco, Campo etc. em `src/ui/components` | **Fable** |
| 4 | Vitrine | Página no lab com todas as peças reais, nos dois temas; referência para copiar | **Fable** |
| 5 | Travas | Lint contra cor ou medida solta; linha no `CLAUDE.md` mandando usar a vitrine | Sonnet |
| 6 | Prova | Mesa e Agenda montadas só com as peças; o que faltar volta ao passo 3 | Sonnet |
| 7 | Registro | `decisoes.md` atualizado (revê D105, D107, D109, D111, D115) | Haiku |

## Peças (passo 3)
| Arquivo | Peças |
|---|---|
| `Key` | Tecla |
| `Button` | Botão principal (`primary`), comum e discreto (`quiet`); atalho, cursor, desabilitado |
| `Pill` | `SubjectPill`, `StatePill`, `NowPill` |
| `Island` | `Island`, `Tab` (aba), `LevelIndicator` |
| `Ruler` | `Ruler` (ligada ao teclado), `RulerPill`, `RulerCreate` |
| `ListItem` | Item de lista (hora, título, apoio, pílulas; `past`, `quietSelection`) |
| `Cards` | `AssessmentDayCard` (dia de avaliação, D120), `SubjectCard` |
| `Controls` | `Field`, `Toggle` (chave), `Check` (caixa), `Day`, `Progress` |
| `Preview` | Prévia |
| `Block`, `Window` | Já existiam; Bloco agora recua, acende e guarda rastro |

- **Como ligar ao teclado:** toda peça navegável aceita `nav={{ block, index }}` (usa o `NavItem`) ou, sem ele, `selected` e `cursor` fixos (abas, vitrine). O cursor é o atributo `data-cursor` (`base.css`).
- **Tokens novos:** `--cursor`, `--cursor-bloco`, `--sup-peca-viva`, `--cor-acao-viva`.
- **Já mudou no app:** Bloco (todas as telas) e Régua (Acervo, Agenda). O resto das telas ainda usa o desenho antigo até o passo 6.
- **Vitrine (passo 4):** cada ficha é um `Block` real com `fixed` (estado fixo, só para o lab); `?tema=escuro` e `?janela` servem ao `npm run tela`. O `Field` ganhou altura travada (esmagava em coluna). Nível menu decidido (D116): o último bloco fica aceso, com rastro.
- **Paleta aplicada (10/11, D119):** a Ardósia refinada e os raios do lab (22, 14, 14) já são o padrão de `tokens.css`; `lab/_ardosia2.css` saiu.
- **Ficou para o passo 6:** a paleta da Ardósia refinada ainda está só em `lab/_ardosia2.css` (o app segue na paleta C, com ação grafite); os raios do lab (22, 14, 14) diferem dos tokens (24, 18, 18); a barra do topo (`Shell`) ainda não usa Ilha, Aba e Indicador; cartões de prova e de matéria das telas ainda não usam `Cards`; mouse e "+ Nova pasta" aguardam o aceite do usuário.

## Regras
- Toda cor entra por **papel** ("ação", "matéria 3", "fundo"), nunca valor fixo. Assim a paleta troca em um arquivo só.
- **Paleta fora da fila:** pode ser definida a qualquer momento depois do passo 2, com Sonnet. Bancada das cores de matéria: `lab/id-cores-materia.html`.
- Montar tela com peças existentes: Sonnet. Criar peça **nova**: Opus ou Fable, com bancada e aceite do usuário.
- Sempre os dois temas, `npm run tela`, `npm run check` ao fim.
