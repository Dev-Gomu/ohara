# Bancada notas-extras (noite 14/11, terminada às 13h)

**Decisão (14/11): V1 aprovada pelo usuário (D165), com a meta do ano na linha do 2º semestre.**

**Link:** http://localhost:5173/ohara/lab/livre.html?ideia=notas-extras (vale depois que a branch for trazida ao main)

## O problema
Três itens das Notas que estavam na D114 (hoje só no backlog) e ainda não chegaram ao app:
1. busca `/` na régua de matérias;
2. meta por semestre ("Precisa no 2º bim."), só com números;
3. janela de esquema com os modelos 5 + 5 e 3 + 7 e um "Mais opções".

## O que já estava decidido e foi seguido
D113 (bimestre em pontos, nota máxima por avaliação), D114 (busca `/`, janela simples com modelos), D99 (pendente fica fora da conta), D123 (Boletim geral de 0 a 10, pontos só dentro da disciplina), a meta ajustável (`GoalIsland`) e só números.

## O que é novo (precisa do seu aceite)
- **Meta do 1º semestre:** "Precisa no 2º bim." para o semestre bater a meta. Hoje o app só mostra o 4º bimestre, que é a meta do ano.
- **"Na avaliação que falta":** quando parte do bimestre já tem nota, mostra quanto tirar só nas avaliações pendentes (ex.: precisa 4.0 de 5.0 no 2º bim.; já tirou 0.9 no seminário; na P2, 3.1 de 4.0).
- **Arredondamento para cima** (veja a conta abaixo).
- O total do semestre fica **"em aberto"** enquanto houver avaliação pendente.

## As versões (as três trazem as três peças)
- **V1 (recomendada):** busca na régua; a meta por semestre fica no bloco "Quanto preciso tirar", dividida em "1º semestre" e "Ano"; janela com **três cartões grandes** (5 + 5, 3 + 7, Mais opções), e "Mais opções" abre os campos na própria janela.
- **V2:** a meta aparece **dentro de cada faixa de semestre**, logo abaixo dos bimestres, e some o bloco lateral. A janela vira uma **lista** com marca em pílula.
- **V3:** igual à V1, mas abre no **Boletim geral**, onde a coluna "Precisa" acompanha o semestre ("8.0 no 2º bim." agora; "no 4º bim." depois).

**Recomendação: V1**, com a coluna da V3 no Boletim geral. A V1 deixa a resposta "quanto preciso" num só lugar, em pontos e na avaliação que falta; a faixa da V2 fica apertada quando o texto é longo. Os cartões da janela dão bons alvos de toque no tablet.

## A busca
- `/` (ou o botão "Buscar" no começo da régua) abre um campo no lugar de "Boletim geral".
- Digitar filtra pela sigla ou pelo nome. **Enter** abre a primeira matéria. **Esc** limpa e fecha.
- Sem resultado: "Nenhuma matéria com 'x'".

## A conta da meta (vira `src/core/grades/goal.ts`, com testes)
Tudo em pontos do semestre (D113): semestre = pontos do 1º bim. + pontos do 2º bim. + bônus do semestre.
- **Meta do semestre (2º ou 4º bim.):** `P = meta − bônus do semestre − pontos do 1º bim.`
  - Se o 1º bim. não tem nota: **sem dados** (não mostra a linha).
  - Se o 2º bim. está todo lançado: **fechado** (mostra o total).
  - `P ≤ 0`: **"já garantido"**.
  - `P > vale do 2º bim. × teto ÷ 10`: **"não dá mais"**.
  - Senão: **precisa** `cima(P)` pontos, ou `cima(P × 10 ÷ vale)` em nota de 0 a 10.
- **Avaliações que faltam** (quando parte do bimestre já foi lançada; vale quando o peso de cada avaliação é a própria nota máxima, padrão da D113): `tirar = P × (soma dos máximos do bimestre) ÷ vale − soma já tirada`. Se `tirar` for maior que o que as pendentes valem: "não dá mais"; se `tirar ≤ 0`: "já garantido".
- **Meta do ano (4º bim.):** alvo do 2º semestre = `(meta × 100 − peso1 × semestre1) ÷ (100 − peso1)`. Depois aplica a mesma conta com o 3º bim. Só aparece quando o 1º semestre fecha.
- **Arredondamento:** `cima(x) = teto(x × 10 − 1e-9) ÷ 10`, sempre **para cima** em 0,1. Se precisa de 4,63 e o app mostra 4,6, o aluno fica abaixo da meta. O `1e-9` evita que 4,0 vire 4,1 por erro de ponto flutuante.
- **Testes mínimos:** 5 + 5 (IMU: 3.0 no 1º → 4.0 de 5.0, nota 8.0); 3 + 7 (PRO: 2.7 → 4.3 de 7.0); exatamente no teto (GEN: 2.0 → 5.0 de 5.0, "precisa", não "impossível"); impossível (EPI: 1.0 → 6 > 5); garantido com bônus; bimestre parcial (IMU: 3.1 de 4.0 na P2); 4,63 → 4,7; meta do ano (FIS: 6.9 no 1º sem., 2.9 no 3º → 4.2 de 5.0).
- A conta da bancada está em `_conta.ts` (pura, sem imports).

## Pergunta para você (uma)
A linha do 2º semestre deve olhar a **meta do ano** (o que decide a aprovação; a V1 faz assim) ou a **meta do próprio 2º semestre**? Recomendo a do ano.

## O que a aplicação vai mexer
- `src/core/grades/goal.ts` (novo) + `goal.test.ts`. As funções `neededForSemester` e `neededInFourthForYear` de `grades.ts` passam a usá-lo, com o arredondamento para cima.
- `src/ui/notas/model.ts`: `needCell` do Boletim geral segue o semestre (V3); linhas de "Quanto preciso tirar".
- `src/ui/notas/NotasAberto.tsx`: busca na régua; total do semestre "em aberto"; linhas novas.
- `src/ui/notas/forms.ts`: `askScheme` vira a janela com modelos (`Window` + cartões) e "Mais opções". Hoje é um formulário de 7 campos.
- `src/ui/components/Grades.tsx`: `BoletimHeader` com o rótulo "Precisa" e o bimestre ao lado do número. É peça nova, então entra na vitrine e roda `npm run pecas`. Os cartões de modelo da janela também viram peça (`ChoiceCard`).
- **Sem migração:** o esquema já é cifrado em `secret_records`, e os modelos só preenchem `bimester1`.
- **Tabela de teclas** (`src/core/keyboard/keys.ts`; nada de keydown em componente):
  - `row('Notas', '/', 'IntlRo', '', NAV, { type: 'goToField' }, 'Busca matéria')` + linha igual com `NumpadDivide`. No ABNT2 o `/` é a tecla `IntlRo`; `Slash` é o `;`.
  - Na busca (nível campo): Enter abre a primeira e Esc limpa e volta à régua (ação nova `searchPick`, ou o `onActivate` do bloco).
  - Janela: ← → / ↑ ↓ andam entre os cartões e Enter escolhe, como nas outras janelas.
  - O esquema continua no ⋮ do bloco ("Editar esquema de cálculo").
  - Teste de teclado nasce dessas linhas.
- **Toque:** botão "Buscar" no começo da régua; botão "Esquema" no topo do bloco da disciplina; cartões e campos com alvo grande.
- `e2e`: um roteiro só com teclado: `/`, "fa", Enter, abre FAR.

## O que ficou de fora
- Bônus e peso dos semestres aparecem em "Mais opções", mas a bancada só aplica o valor dos bimestres.
- Celular não conferido (fora de foco).
- Na bancada, a tecla **E** abre o esquema (no app é o ⋮).
