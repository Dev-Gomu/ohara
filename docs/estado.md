# Estado do Ohara (atualizado em 12/11/2026)

**Leia só este arquivo para retomar.** Detalhes de cada sessão: `docs/plano/faxina.md`. Fila: `docs/plano/_indice.md`.

## Onde estamos
- Publicado no main (PR 2, 12/11/2026): https://dev-gomu.github.io/ohara/. Etapas 1 a 10 e 13 (sem sincronização) feitas; Hub Refinado, Agenda B, Faltas, Notas e menu de telas já no app (D121 a D129).
- Identidade única (formas e peças): **Ardósia refinada** (D130). Cores: três paletas, **Gelo suave** (padrão), Gelo e Índigo (D132).
- Faxina: sessões 1 a 4 feitas (papel, visual, paletas, publicação). Na 4 saíram dois defeitos reais: Paleta reabria com a busca velha e carregar a aula apagava a versão do Histórico criada durante o carregamento. `lab/` só tem índice, sala, vitrine (agora com DayItem e FaultCell) e `provas-dias.html`; `diretrizes-visuais.md` virou resumo de uma página.

## Próximo passo
Auditoria concluída (12/11): lab livre (`lab/livre.html`), cartão de peças (`docs/pecas.md`, `npm run pecas`) e fechamento enxuto (D133 a D135). Agora:
**Sessão R: refinos das telas** (`plano/faxina.md`). **R1 Acervo aplicada (D136, 12/11):** matéria aberta com contagem nas pastas, linha da aula só com data, abas Aulas/Cartões no cabeçalho da lista, capa menor com começo da anotação e `Button` no "Abrir na Mesa"; `Grades.module.css` dividido em três (Celulas, Linhas, Disciplina); `lab/livre/acervo/` apagado. **R3 Mesa: barra do topo aprovada (D137, V2 de `lab/livre/mesa/`), a aplicar** (Opus; o menu Faltas/Notas/Ajuda vale para todas as telas). Faltam duas bancadas, uma por sessão, no Fable: **Cartões: bancada aprovada em 13/11 (D138, D139)** em `lab/cartao-flashcard.html` e `lab/livre/mesa-flashcard/`; a aplicar em 4 etapas, uma por sessão: (1) core: `##`, `->`, marcas inline e tabela de símbolos, com testes; (2) teclas Ctrl . e Ctrl , e atalhos no editor de cartões; (3) visual do `CardBack` e do editor + itens no menu ⋮ do bloco; (4) conversão para o Anki (B02, só preparar). `lab/livre/mesa-cartoes/` sai ao aplicar. Na lista de salvos: virar lista de fato (backlog, 13/11) e **barra de formatação** (o usuário acha feia; pedir a lista de mudanças). Próximo: R2 Configs. Treino só depois da Etapa 11. Depois: Sessão 5 (Etapa 11), Sessão 6 (sincronização, só se houver necessidade).

## Esperando o usuário
- Antes da sessão 6: cadastrar as origens no Google Cloud.
- Teste de backup (`banco.spec.ts`, download) falhou uma vez no CI e passou ao repetir: se voltar, investigar.

## Iniciativas abertas (máx. 3)
1. Refinos das telas (Sessão R).
2. Etapa 11, Treino com FSRS.
3. Etapa 12, sincronização.
