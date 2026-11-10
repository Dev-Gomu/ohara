# Briefing para o Fable: reformular a identidade visual do Ohara

Escrito pelo Sonnet em 09/11/2026, a pedido do usuário (Product Owner, estudante de medicina, não programa).

## O pedido do usuário
Reformular a identidade visual atual do app para **potencializar a funcionalidade**, mantendo o visual **agradável**. Ou seja: o visual deve trabalhar a favor do uso (hierarquia clara, foco legível, leitura rápida em sessão de estudo), não só enfeitar.

## Ponto de partida (o que existe hoje)
- Identidade oficial atual: **Ardósia (D115)**, paleta C, aba grafite, marca M2. Bancadas do Hub e da Agenda já feitas em `lab/`. Último commit: `9be83e5`.
- Tipografia decidida: **Nunito, Inter e Source Sans 3** (D67 e D68).
- Foco sem preto (D111). Foco do cartão de matéria (D112). Desenho de foco dos blocos da Mesa em `docs/plano/foco-mosaico.md`.
- Reformular a Ardósia é permitido, mas **avise antes** que está contrariando uma decisão `Decidida` e registre a mudança em `docs/decisoes.md` (formato da tabela, até 5 linhas).

## Leia antes de propor
1. `docs/diretrizes-visuais.md` (obrigatório: checklist e modelo de proposta).
2. `docs/visao.md` e `docs/decisoes.md` (em especial D67, D68, D105 a D115).
3. `CLAUDE.md` (regras do projeto).
4. Memória do projeto (`MEMORY.md`): cores recusadas, pílulas, sigla da matéria, foco em tablet e PC.

## Restrições já fechadas (não reabrir sem avisar)
- **Pílulas, nunca círculos**: marcas alongadas.
- **Ardósia fica**: néon e preto puro foram recusados. Giz foi descartada.
- **Sem tema de medicina**: nada de metáfora médica. Visual de produtividade e estudos.
- **Proibido (herdado do legado)**: tarja/faixa colada na lateral ou no topo, "lua minguante" em blocos, divisórias, gradiente. **Desejado:** cartões de uma peça, com cantos bem arredondados.
- **Cores**: 3 rodadas de ajuste de cor já foram recusadas. Tema **claro primeiro**; seja conservador e mostre poucas opções.
- **Cartões de matéria**: só a **sigla**, nunca o nome inteiro.
- **Foco**: tablet e PC. Celular fora de foco (não conferir nem corrigir).
- **Teclado é crítico**: três níveis de foco (menu, bloco, campo). O visual precisa deixar **óbvio em que nível o usuário está**. Toque também é cidadão de primeira classe (alvos grandes).

## Como trabalhar (economia de créditos)
- Prototipe em `lab/` (um HTML por experimento, CSS reais do app, copie `lab/provas-dias.html`). **Não mexa em `src/`** antes de o usuário aprovar na bancada.
- **Máximo 3 versões** por bancada. Teste o estado de **foco** antes de recomendar.
- **Sempre os dois temas** (claro e escuro) desde a primeira versão.
- Conferir visual: `npm run tela -- "lab/x.html?v=a"` (precisa do `npm run dev`). Leia só o JPG gerado em `.telas/`.
- Seguir o modelo de proposta de `docs/diretrizes-visuais.md`. Respostas em português, curtas e simples, sem jargão.
- Dúvida de produto: **uma pergunta objetiva ao usuário, com recomendação**. Dúvida técnica: decida e registre.
- Fora do escopo: anote em `docs/backlog.md` (1 linha).
- Rode `npm run check` ao fim de qualquer mudança em código.

## O que entregar
1. Diagnóstico curto: o que da Ardósia atual atrapalha a função (hierarquia, foco, contraste, densidade) e o que funciona.
2. Até 3 direções em bancada (`lab/`), nos dois temas, cobrindo Hub, Agenda e um bloco da Mesa com os três níveis de foco.
3. Recomendação sua, com o motivo em linguagem simples, e a lista do que mudaria em `src/` (sem aplicar).
4. Registro em `docs/decisoes.md` só depois da escolha do usuário.

## Arquivos soltos no repositório (não rastreados)
Há pastas de material de apoio na raiz (`identidade-nova-claudeweb/`, `identidade-v2-claudeweb/`, `tipografia-claudeweb/`, `cartoes-provas-claudeweb/`, `pacote-claudeweb-telas/`) e bancadas `lab/*giz*`, `lab/paletas-ricing.html`, `lab/papel-cores.html`. São experimentos anteriores; use como referência, não como decisão.
