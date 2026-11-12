# Plano: tipografia e identidade do zero

**Status:** executado em 06/11/2026 (proposta "Campo", Rodada 3 do canvas). **Conceito e base verde descartados:** o usuário não quer influência de medicina na identidade. As medições de fontes continuam válidas.
**Pedido do usuário:** definir uma proposta do zero, sem as preferências anteriores e sem o projeto antigo, pensando em efetividade, harmonia e coesão.
**Entrega:** **uma** proposta, não um cardápio. Este plano precede a Etapa 3 e vira as "diretrizes visuais" depois de aprovado.

> **Atualização de 06/11/2026:** o usuário recusou esta identidade e voltou à da Rodada 2 (lavanda, índigo, cantos arredondados, pílulas). A escolha de fontes segue na Rodada 5 do canvas.

## 1. Por que as rodadas 1 e 2 não funcionaram (hipóteses)
- **Fontes neutras:** Inter, Manrope, Plex e Noto são corretas, mas não dão voz ao app.
- **Troca de fonte sobre esqueleto herdado:** lavanda, pílulas e botões redondos numerados vieram do legado. A fonte mudava, o resto não.
- **Hierarquia achatada:** muitos textos entre 13 e 15 px com pesos parecidos.
- **Nada foi olhado antes da entrega:** as telas foram publicadas sem conferência visual.

## 2. O que continua e o que sai
**Continua, porque é fato do produto:**
- Tablet 1280×800 na horizontal, em sala, por horas. Também PC 1920×1200 e celular.
- Mosaico, teclado primeiro, três níveis de foco, alvos de 44 px, claro e escuro, contraste AA.
- Offline: fontes com licença OFL hospedadas junto do app.
- Morcego como ícone. Conteúdo de medicina: α, β, κ, →, ≥, índices, IL-1.

**Sai, porque era herança ou preferência:** lavanda, índigo, Poppins, pílulas, botões redondos numerados, raios de 16 a 24 px, a filosofia "Luz baixa" e as propostas das rodadas 1 e 2.

**Limite mantido:** continuam proibidos tarja colada na lateral ou no topo, "lua minguante" e gradiente (`CLAUDE.md`). "Sem divisórias" e "cantos bem arredondados" ficam livres nesta proposta. Se forem contrariados, avisar o usuário, que decide e atualiza o `CLAUDE.md`.

## 3. Sistema: quatro papéis
| Papel | Onde | Exigência |
|---|---|---|
| **Leitura** | Anotações, cartões, lembretes | Conforto longo, grego, `I` e `l` diferentes |
| **Interface** | Menus, títulos de bloco, botões, rótulos | Nítida em tamanho pequeno, compacta |
| **Dados** | Horas, datas, contagens, indicadores | Números tabulares; pode ser a interface |
| **Atalhos** | Teclas | Monoespaçada |

Regra: o que o app escreve é interface; o que o usuário escreveu ou vai estudar é leitura.
Coesão: no máximo **duas famílias**, mais a mono se ela não vier de uma delas. Alturas de letra compatíveis depois de ajustar os tamanhos. O contraste entre as vozes vem da estrutura (serifa contra grotesca), nunca de tamanhos parecidos com pesos parecidos.

## 4. Candidatas (medidas em 06/11/2026, nos arquivos do Google Fonts)
| Família | Papel | Altura x | `I`/`l` (largura) | Grego | Nota |
|---|---|---|---|---|---|
| **Piazzolla** | Leitura | 0,50 | 40/29 | Sim | Serifa angulosa e compacta, com voz própria. Candidata principal |
| Source Serif 4 | Leitura | 0,50 | 38/33 | Sim | Controle seguro |
| **Schibsted Grotesk** | Interface | 0,53 | 35/26 | Não | Grotesca de jornal, com caráter. Candidata principal |
| **Recursive** | Interface e atalhos | 0,53 | 50/35 | Não | Sans e mono na mesma família. Larga: 47 caracteres contra 50 |
| JetBrains Mono | Atalhos | 0,55 | Mono | Sim | Zero marcado, bom em teclas |

Todas têm números tabulares e algarismos alinhados.

**Eliminadas e por quê:** Ysabeau Office (altura x 0,42), Commissioner (sem tabulares), Alegreya, Vollkorn e Gentium (letra pequena, as duas primeiras com algarismos antigos), Atkinson, Newsreader e IBM Plex Serif (sem grego), Fraunces, Spectral, Merriweather, Geist, Instrument e Hanken (sem grego; as sans ainda poderiam ser interface, mas têm `I` e `l` iguais).

## 5. Execução
1. **Conferir glifos** de → ↑ ↓ ≥ ≤ ₂ nas finalistas de leitura, renderizando-os. Se faltar algum, trocar a fonte ou definir o substituto.
2. **Definir a base nova:** fundo, superfícies, texto e foco em claro e escuro, a partir do conforto e do contraste, sem partir de lavanda. Uma cor de ação. Cor de matéria fica fora, só um exemplo.
3. **Definir a escala a partir da leitura:** corpo de partida 17/27 px, linha de 60 a 72 caracteres, grade de 4 px. Títulos com salto claro, sem tamanhos vizinhos. No máximo três pesos.
4. **Montar a Mesa em HTML local**, servida em localhost, em três combinações:
   - X: Schibsted Grotesk + Piazzolla + JetBrains Mono
   - Y: Recursive (Sans e Mono) + Piazzolla
   - Z: Schibsted Grotesk + Source Serif 4 + JetBrains Mono (controle)
5. **Olhar de verdade:** captura em 1280×800, claro e escuro, e também o bloco estreito de 300 px.
6. **Escolher uma** com a tabela da seção 6. Se nenhuma passar, voltar às candidatas e registrar por quê. Não entregar a melhor das ruins.
7. **Redesenhar Mesa e Hub** na escolhida, repensando a navegação e os marcadores sem herdar nada. Conteúdo fictício igual ao da Rodada 2 (`Mesa` e `Hub` do canvas).
8. **Revisar por captura** nos dois temas: cortes, sobras, alinhamento, hierarquia.
9. **Publicar** como página "Rodada 3" no canvas `https://claude.ai/artifact/RyoWyJJK8zu6Pt7JSvUgU2`: Mesa, Hub e uma folha de especificação (papéis, escala, pesos, cores).
10. **Medir o peso** das fontes em woff2 só com latim e grego. Meta: até 400 KB no total.

Fora do escopo: mexer em `src/`, instalar fontes no app, paleta de matérias. Isso vem depois da aprovação.

## 6. Critérios de escolha
Nota de 1 a 5. Reprova com qualquer nota abaixo de 3.
- **Leitura longa:** parágrafo de anotação confortável, inclusive no escuro.
- **Separação:** dá para distinguir conteúdo e interface de relance.
- **Harmonia:** as famílias parecem da mesma mão.
- **Voz:** a tela é reconhecível sem o logo, sem enfeite.
- **Densidade:** funciona em bloco de 300 px sem quebrar mal.
- **Siglas médicas:** IL-1β, TNF-α, PGE₂ e 08:00 sem confusão ou ruído.

## 7. Pronto quando
- Uma proposta publicada, com Mesa e Hub em claro e escuro, conferidas por captura.
- Relato curto: o que foi escolhido, o que foi descartado e a nota de cada critério.
- Usuário testa no tablet e aprova ou recusa. Só então registrar em `decisoes.md` e criar as diretrizes.

## 8. Resultado da execução
**Escolhida: X, proposta "Campo".** Schibsted Grotesk (interface), Piazzolla (leitura, títulos e números grandes), JetBrains Mono (horas e atalhos). Base verde-acinzentada, foco laranja.

| Critério | X | Y | Z |
|---|---|---|---|
| Leitura longa | 4 | 4 | 5 |
| Separação | 5 | 5 | 5 |
| Harmonia | 4 | 3 | 4 |
| Voz | 5 | 4 | 3 |
| Densidade (300 px) | 4 | 3 | 4 |
| Siglas médicas | 4 | 4 | 5 |

- Y saiu: a Recursive deixa a interface com cara de código e destoa da serifa. Z passa, mas é genérica.
- Pontos fracos de X: algarismos e setas da Piazzolla um pouco pequenos. Hífen pode quebrar "IL-1" no fim da linha (tratar na Etapa 8).
- Símbolos: Piazzolla tem todos (α β κ → ≥ ₂). Schibsted não tem grego completo nem índices, por isso nunca deve receber texto de estudo.
- Peso: 134 KB em woff2 (6 arquivos, latim, grego e símbolos). Meta de 400 KB cumprida.
- Slide no tema escuro continua claro, por ser conteúdo. Avaliar na Etapa 10.
