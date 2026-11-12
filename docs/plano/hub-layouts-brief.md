# Hub: 2 a 3 layouts novos (pedido ao Fable, 10/11/2026)

**Objetivo:** propor 2 a 3 organizações do Hub para tela de 1920x1080 (e que sobrevivam a tablet), só em bancada, sem mexer em `src/`.

## O que já está decidido
- **Agenda de hoje = estilo B** (`lab/pecas-novas/ideias-hoje.tsx`): eixo de horas 08 a 18, blocos pela duração, todos neutros, aula de agora com pílula "agora" e linha da hora atual (pílula com a hora). Pode ser vertical ou horizontal.
- Blocos do Hub: provas e trabalhos, calendário, agenda de hoje, lembretes. Sem blocos novos (CLAUDE.md).
- Só peças de `src/ui/components` (vitrine); peça nova só em bancada com aceite. Só sigla da matéria. Sem círculos, tarjas, divisórias, gradiente. Dois temas desde a primeira versão.
- Dia de avaliação: `AssessmentDayCard` (D120), sem limite de itens; tipos prova, trabalho e "apres.".

## Problema a resolver
Em 1920x1080 o bloco de provas tem ~270px (26% da altura) e os cartões ~107px: vazio embaixo e à direita. O Hub parece "estranho".

## Já testado (não escolhido)
- **Layout 1:** provas em faixa horizontal no alto, mais justa; calendário | agenda B vertical | lembretes embaixo.
- **Layout 2:** agenda B horizontal no alto; calendário | provas em lista vertical | lembretes embaixo.
Ver `lab/pecas-novas.html?peca=hublayout&v=1` e `&v=2`. Defeitos conhecidos: números do calendário pequenos; teclado muda de eixo no Layout 2 (provas ↑ ↓, aulas ← →).

## Entrega
2 a 3 layouts novos (ou variações dos acima) em `lab/pecas-novas/hub-layouts.tsx`, vistos com `npm run tela -- "lab/pecas-novas.html?peca=hublayout&v=N" --largura 1920 --altura 1080`, mais uma checagem a 1280x800. Dizer qual recomenda e por quê, incluindo o efeito no teclado. Máximo 3 versões.
