# Referência visual: landing da Knowunity

**Origem:** https://knowunity.com.br/ (lida em 06/11/2026, tema escuro). Só inspiração de identidade: cores, fontes, clima. Nada de código, texto, imagem ou mascote entra no app.
**Status:** ficha de referência. Nenhuma decisão tomada. Ver "Conflito" no fim.

## 1. Clima
Escuro profundo, com **blocos de cor saturada e chapada** (roxo, rosa, azul, laranja, verde) em cantos grandes. Títulos enormes, pesados, em caixa-alta e comprimidos. Botões em pílula clara com sombra baixa. Divertido e jovem, sem gradiente nos blocos (gradiente só em detalhe de pilha de cartões).

## 2. Cores medidas
| Papel | Valor | Observação |
|---|---|---|
| Fundo da página | `#090C18` | Azul quase preto |
| Texto principal | `#F4F2FF` | Lavanda muito clara |
| Texto secundário | `#F5F3FF` a 68% | |
| Hero (bloco grande) | `#8872D8` | Roxo médio, canto inferior bem arredondado |
| Título sobre o hero | `#101D1B` | Verde quase preto |
| Cartão roxo | `#9178E6` | Raio 24 px |
| Cartão rosa | `#E879C0` | |
| Cartão azul | `#5FA0FC` | |
| Cartão laranja | `#FB7E5B` | |
| Cartão verde | `#00C386` | |
| Chip / pílula escura | `#22242F` | Raio total, 40 px de altura |
| Botão principal | claro (`#F4F2FF`), texto `#090C18`, pílula, sombra baixa | |
| Primária do sistema | `hsl(261 100% 66%)` | Violeta vivo |
| Hover de marca | `hsl(254 100% 85%)` | |

## 3. Tipografia
- **Títulos e botões:** fonte própria do site (`knGreedFont`), peso 900, grotesca comprimida. H1 124 px com entrelinha 0,8 e espaçamento -2%. H2 59 px/60. **Não temos licença: não usar.**
- **Corpo:** Inter, 18 px/24, com variantes `cv01`–`cv09`.
- Pesos: 900 para títulos e botões, 600 para chips, 400 para texto.

Substitutas livres (Google Fonts) para o efeito de título pesado e comprimido, a testar: Bricolage Grotesque (condensada, 800), Archivo (width 75, 800), Anton ou Big Shoulders só se o grego do conteúdo não importar (títulos não levam grego).

## 4. Formas
Cartões 24 px, pílulas 9999 px, blocos de seção com cantos de ~40 px. Sem bordas, sem divisórias. Sombra só em botão.

## 5. Proposta de modo claro (derivada, não existe no site)
Regra: manter o matiz e a saturação dos blocos de cor, inverter só a base e o texto.

| Papel | Escuro (site) | Claro proposto |
|---|---|---|
| Fundo | `#090C18` | `#F4F2FF` |
| Cartão neutro | `#22242F` | `#FFFFFF` |
| Texto | `#F4F2FF` | `#14122B` |
| Texto secundário | 68% claro | `#5C5878` |
| Blocos de cor | `#8872D8`, `#9178E6`, `#E879C0`, `#5FA0FC`, `#FB7E5B`, `#00C386` | iguais, com texto `#101D1B` (conferir contraste AA em cada um; o rosa e o azul pedem texto escuro) |
| Botão principal | claro sobre escuro | escuro (`#14122B`) com texto `#F4F2FF` |
| Sombra do botão | baixa, escura | baixa, com 12% de roxo |

## 6. Conflito com o que já está decidido
O Ohara usa **lavanda e índigo suaves, "sutil e calmo"** (`CLAUDE.md`, Rodada 2), e a Manrope e a Source Sans 3 já estão adotadas. O site é o oposto em energia: cores saturadas, título gritante. Duas leituras possíveis:
1. **Só pegar o clima em pontos específicos:** títulos pesados e comprimidos (Hub e telas vazias), cores de matéria mais vivas, pílulas escuras. Mantém a base atual.
2. **Trocar a identidade** pela da Knowunity (fundo `#090C18`, blocos saturados). Contraria a decisão da Rodada 2 e as regras de "sutil e calmo". Precisa de aval explícito do usuário e atualização do `CLAUDE.md`.

Estrutura de telas continua própria do Ohara.
