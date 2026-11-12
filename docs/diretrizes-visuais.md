# Ohara: diretrizes visuais (resumo de uma página)

Detalhes, navegação e tabela de peças: `diretrizes-visuais-referencia.md`. Valores exatos: `src/ui/styles/tokens.css`. Identidade: **Ardósia refinada** (D130, formas e peças); cores: **Gelo suave** (D132).

**Antes de desenhar:** abra `lab/vitrine.html` (`npm run tela -- "lab/vitrine.html"`) e monte só com as peças de `src/ui/components`. Peça nova só em bancada (`lab/provas-dias.html` é o modelo), até 3 versões, com aceite do usuário.

## Princípio
Tela calma e fria; uma única luz, o azul, sempre onde as teclas agem. O layout **é** a navegação. Prioridade: não perder o lugar, menos teclas, o dedo faz tudo, leitura confortável, beleza.

## Checklist
**Fluxo e teclado**
- Caminho típico em uma linha, com o nível de cada passo; quantas teclas custa?
- Onde o foco nasce e para onde volta? O que Enter e Esc fazem em cada nível?
- Tecla nova entra na tabela de teclas (`teclado.md`), nunca em componente.
- Toda ação tem caminho pelo dedo (alvo de 44 px). Cabe em 1280 × 800 sem rolar a página.

**Luz e estados**
- Todo azul é ação, escolhido ou cursor. Só o bloco com o cursor está aceso. Um botão principal por bloco.
- Vazio, carregando e erro definidos.

**Visual**
- Só peças da vitrine e só tokens (`--cor-*`, `--raio-*`, escala de texto). Nada de hex, raio ou tamanho solto.
- Cor de matéria só em pílula, marca alongada ou cartão da matéria; sobre ela, `--cor-tinta`; nos cartões, só a sigla.
- Tudo que é marca é pílula (exceção: bolinha das Faltas, D130). Sem círculo, tarja ou faixa colada, divisória, gradiente, "lua minguante" nem fundo quente.
- Contraste 4,5:1 no texto e 3:1 em contorno e ícone, **nos dois temas**. Cor nunca é a única pista.
- Caixa-alta só em texto do app e em sigla. Números tabulares em horas, datas e contagens.
- Ícones SVG 24 px, traço de 2 px. Grade de 4 px. Sem movimento decorativo.
- Conferido nos dois temas com `npm run tela`, incluindo o estado com cursor.

**Dados e registro**
- Estado de tela fica em memória; dado, no banco. Regra nova vai para `decisoes.md`; ideia, para `backlog.md`.

**Proposta:** mostre a tela renderizada (1280 × 800, dois temas) e a alternativa descartada, com recomendação direta.
