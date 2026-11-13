# Prompt: propostas visuais do Ohara (6 frentes)

Cole o bloco abaixo numa sessão nova. Uma frente por sessão (regra do projeto: bancada e aplicação em sessões separadas). Troque `FRENTE` pelo número desejado.

---

Quero propostas visuais para a **frente FRENTE** da lista abaixo. Só bancada: não mexa em `src/` nem aplique nada.

## Como trabalhar (regras do projeto, resumo)
1. Leia `docs/estado.md`, `docs/diretrizes-visuais.md` e `docs/pecas.md`. Abra a vitrine (`npm run tela -- "lab/vitrine.html"`) e monte **só com as peças de `src/ui/components`**. Peça nova só dentro da bancada, com meu aceite.
2. Bancada no lab livre: `lab/livre/<ideia>/v1..v3.tsx` (máximo 3 versões), http://localhost:5173/ohara/lab/livre.html?ideia=<pasta>. Dados de mentira em `lab/_dados.ts`.
3. Confira **sempre claro e escuro** desde a primeira versão, em **tablet (1280) e PC (1920)**; celular fora de foco. Use `npm run tela` (não o navegador do app) e leia só o `.jpg` gerado.
4. Teste o estado de foco e o caso extremo (texto comprido, muitos itens) antes de recomendar.
5. Entregue: até 3 versões, **uma recomendação direta** e o que cada uma muda em relação ao app hoje. Links sempre completos (`http://localhost:5173/ohara/...`).

## O que não pode aparecer (aprendido nas rodadas anteriores)
Gradiente, sombra, linha divisória, tarja ou faixa colada na lateral, círculos como marca (use pílulas), fundo quente (amarelo, creme, areia, terroso), branco preenchido no tema escuro (ação na cor de destaque), indicadores visuais nas notas (medidor, barra, gráfico), nome inteiro da matéria no cartão (só a sigla), tema de medicina como metáfora. Cores suaves, frias: nem neon, nem escuras. Cor só por papel (`--cor-*`), raio só por token (`--raio-*`).

## As frentes

**1. Tela de Configs (ajustes).** Hoje é só texto. Proponha uma tela organizada em seções, com as peças da vitrine (alternadores, listas de escolha, botões). Inclua o que já vai existir: paleta, tema, e (futuro) a densidade do cartão. Sessão R2 do plano.

**2. Janelas de cada mosaico.** As janelas do bloco (menu ⋮, consulta, diálogos). Hoje são listas simples. Proponha um padrão único de janela (cabeçalho, corpo, rodapé de ações) que sirva a todas, mostrando o menu ⋮ do Cartões (Usar cartão compacto, Ligar cor nos títulos, Ver cartões salvos) e ao menos uma janela de consulta.

**3. Barra de formatação do editor de anotações.** Os botões atuais (N, I, S, Marca, T1, T2, Lista, Tarefas) parecem infantis. **Antes de desenhar, me entregue a lista de mudanças que você pretende fazer (ícones, tamanho, agrupamento, estados) para eu aprovar**; só depois a bancada. Mantenha os mesmos atalhos (Ctrl B, I, U, Shift H, Shift 7/8/9) e acrescente Ctrl . e Ctrl , (sobrescrito, subscrito) já aprovados no D139.

**4. Treino (revisão de fato).** Os cartões dentro da revisão devem seguir o **cartão novo do D138**: uma peça só, frente azul no topo, verso com seção, subtítulo e texto, nas duas densidades e com a opção de cor nos títulos. Referências: `lab/cartao-flashcard.html` e `lab/livre/mesa-flashcard/`. Mostre frente, verso virado e os botões Errei, Difícil, Bom e Fácil (teclas 1 a 4). Leia `src/ui/screens/treino/TrainingSession.tsx` e `docs/teclado.md` (seção Treino) antes.

**5. Erros visuais da Agenda.**
- Painel do dia: "Sexta, 13" e "Dia" encostam na borda do bloco, sem margem interna. Proponha o espaçamento certo, com o token de padding dos blocos.
- Visão de mês: dias com muitos itens vazam do quadradinho (o último item é cortado). Proponha até 3 saídas (por exemplo limitar por altura e mostrar "+N", ou só a sigla e a hora, ou pílulas compactas) e teste o caso extremo de 6 itens num dia.
- Confira também a visão de semana e a grade com o mesmo critério.

**6. Janela de atalhos (Alt /).** Abre **nos atalhos da tela atual**. Deve ter navegação entre três listas: **Todos** (todos os atalhos do app), **Desta tela** (exclusivos da tela atual) e **Universais** (usados em qualquer tela; não é o mesmo que "todos"). Cada lista dividida por seção, bem legível. A janela é navegável só com teclado (Enter desce, Esc sobe) e com toque. A fonte dos dados é a tabela de teclas (`src/core/keyboard/keys.ts`): não duplique atalho em componente. Proponha o formato e diga se a tabela precisa de um campo novo para marcar "universal".

## Ao terminar
Resuma em poucas linhas: o que propõe, o que muda no app e qual versão recomenda. Atualize só `docs/estado.md`. Não aplique.
