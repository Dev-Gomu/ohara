# Pedido para o ClaudeWeb: Notas, Agenda e Treino

**Para:** ClaudeWeb (conta da esposa do usuário). **Tipo:** só desenho, sem código.
**Quem pede:** o Product Owner (estudante de medicina, não programa). Responda em português, curto e direto. Explique sem jargão.

## Contexto

Ohara é um app pessoal de estudo de medicina, em PWA, feito para tablet na horizontal (1280 × 800) e PC. O teclado é a forma principal de uso (Alt + tecla), e o toque também precisa funcionar em tudo. Há dois temas, claro e escuro, e **os dois devem ser mostrados desde a primeira versão**.

O desenho já tem regras fechadas. Antes de propor qualquer coisa, leia a biblioteca de elementos e as regras de layout. Use este modelo de proposta (seção 9 de `diretrizes-visuais.md`):

- Tela e padrão
- Caminho típico (com níveis: menu, bloco, campo)
- Teclas até o objetivo
- Foco de chegada e volta
- Blocos, vizinhos e ordem do Tab
- Enter e Esc em cada ponto
- Estados: selecionado, vazio, erro
- Versão de toque
- Estado de tela x dado
- Alternativa descartada e por quê (obrigatória)

Mostre a tela **renderizada em 1280 × 800, nos dois temas**. No máximo **3 versões** por tela.

**Regras que não podem ser quebradas:**
- Sem tarja ou faixa colada na lateral ou no topo, nem "lua minguante" em blocos.
- Cartões de uma peça, com cantos bem arredondados. Sem divisórias e sem gradiente.
- Sem tema de medicina (nada de símbolos de jaleco, estetoscópio, cruz etc.).
- Um anel de foco forte por tela. Seleção por preenchimento, foco por anel, mouse por borda.
- Cor de matéria só em fundo cheio, pílula, bolinha ou sigla.
- Caixa-alta só em texto do app e em nome de matéria. Títulos de aula e de nota ficam como foram digitados.
- Fontes: Nunito (títulos e números), Inter (botões e rótulos), Source Sans 3 (texto corrido).
- Ícones: traço de 2 px, SVG, nada de emoji.

## Arquivos que você precisa anexar nesta conversa

O ClaudeWeb não enxerga o computador do usuário. Anexe estes arquivos (eles são do próprio usuário, só para consulta):

- Biblioteca de elementos: `~/Downloads/ohara-biblioteca-de-elementos.html`
- Do app antigo, para o Treino: `referencia-legado/telas/treino-tablet.jpg`, `treino-pc.jpg` e `treino-tablet-escuro.jpg` (se existir). Para Agenda e Notas, use `agenda-tablet.jpg` e `mesa-tablet.jpg`, que mostram a convivência com a Mesa.
- Cores e medidas do app antigo: `referencia-legado/tokens-legado.css`
- Lista de regras do app antigo: `referencia-legado/essencial.md`

Pasta do kit: `../Dev_Ohara/referencia-legado/`.

**Proibido copiar código ou dados do app antigo.** Use só como referência visual e de comportamento.

## Tela 1: Notas do boletim

**O que é:** notas das provas e metas do bimestre. As notas são cifradas no app, então a tela precisa mostrar o estado de bloqueio (sem frase, com PIN, com trava de 2 minutos).

**Hoje:** a tela vive dentro da Agenda, com um botão **Notas** no topo ao lado do (?). Fica como um bloco de consulta.

**O que reformular:**
- Hierarquia clara: a nota e a meta ("quanto preciso") são o que se lê primeiro.
- Estados de bloqueio e de desbloqueio com a mesma linguagem visual.
- Teclado: qual é o foco de chegada, o que as setas fazem entre matérias e bimestres, e o que Enter e Esc fazem.
- Vazio (sem nota ainda) e erro (frase errada) com palavra e ícone.

**Padrão sugerido:** janela de consulta ou bloco com régua de bimestres e lista de matérias (diretrizes, seção 5).

## Tela 2: Agenda

**O que é:** a agenda da semana, com visões Semana, Mês, Lista e Grade, mais uma prévia do item selecionado. Usa o padrão **régua + conteúdo + prévia** (D82).

**O que aperfeiçoar:**
- Leitura da semana: aulas, provas e lembretes precisam se distinguir sem depender só de cor.
- Prévia: capa ou título, horário, matéria e ação principal (aula abre na Mesa).
- Matérias e "A completar" com estados claros (vazio, carregando, erro).
- Foco de chegada: semana, na aula de agora ou no dia de hoje.

**Padrão:** régua + conteúdo + prévia.

## Tela 3: Treino

**O que é:** o treino de cartões. Hoje tem matérias, o que treinar e um resumo, e depois um cartão ampliado para responder. Teclas já fixadas: Espaço vira o cartão, 1 a 4 respondem.

**O objetivo do usuário:** deixar a tela mais parecida com a do app antigo (`treino-tablet.jpg`), no que for visual.

**Como conciliar:**
- Preserve o que a diretriz já fixou: foco único na sessão, Espaço e 1 a 4, um primário por bloco, anel de foco forte, sem divisórias.
- Dentro disso, aproxime a composição, a hierarquia e os cartões do app antigo.
- Quando algo do antigo conflitar com a diretriz (por exemplo, o antigo mostra uma coluna que não cabe no padrão), **não decida sozinho**: mostre as duas opções e diga qual conflito existe, para o usuário escolher.

**Padrão:** régua + lista + foco único (diretrizes, seção 5).

## Entrega

1. Uma proposta por tela, no modelo da seção 9.
2. Renderização em 1280 × 800, claro e escuro, de cada versão.
3. Ao fim, uma lista curta das decisões que dependem do usuário (conflitos com o antigo, escolhas de produto).
4. Se possível, um arquivo HTML por tela para baixar, sem explicações longas dentro dele.

**Não entregar:** código do app, mudanças em `src/` ou sugestões para celular (o celular está fora de foco).
