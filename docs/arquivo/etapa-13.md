# Etapa 13: Notas do boletim cifradas

**Status:** plano escrito pelo Opus em 07/11/2026 para o **Sonnet**. Depende das Etapas 7 e 12. **Aprovado pelo usuário em 07/11/2026.**
**Segurança:** o Sonnet não muda nenhuma regra de cifra deste arquivo sem perguntar. Erro aqui é irreversível (D42).
"Notas" aqui são as do boletim, **não** as Anotações.

## Pergunta ao usuário no início (produto)
**Onde fica a tela de Notas?** Recomendação: um quarto item na régua da Agenda (Semana, Mês, Lista, **Notas**), mais "Notas" na Paleta. A D41 pede Agenda e Paleta e proíbe a Mesa e as janelas de consulta. O layout segue o modelo de proposta de `diretrizes-visuais.md`, com o visual do legado como referência (`referencia-legado/telas`, busque "Notas"). **O Sonnet espera o OK do layout antes de desenhar.**

## Cifra (D35 a D40, D87)
Tudo em `core/secret/`, com o `crypto.subtle` do navegador, que também existe no Node dos testes. Sem dependência nova.
- **Chave mestra (CM):** AES-GCM de 256 bits, aleatória, criada uma vez.
- **Frase de acesso:** pelo menos 12 caracteres. Chave da frase = PBKDF2-SHA256, **600 000 iterações**, sal aleatório de 16 bytes (D87). Ela embrulha a CM (`wrapKey` com AES-GCM e IV de 12 bytes).
- **Código de recuperação (D38):** 20 caracteres aleatórios em base32, mostrados em grupos de 4 (`XXXX-XXXX-XXXX-XXXX-XXXX`), **uma vez só**. Ele embrulha a mesma CM, com o mesmo PBKDF2 e outro sal.
- **Tabela `vault`** (migração `005_notas.sql`, sincronizável): uma linha com sal, iterações e CM embrulhada pela frase, e sal e CM embrulhada pelo código. As iterações ficam gravadas para poderem subir depois sem quebrar nada.
- **Trocar a frase:** desembrulha a CM com a frase antiga e embrulha com a nova. Só a `vault` muda; as notas não são recifradas (D38).
- **Recuperar pelo código:** desembrulha a CM, pede frase nova e gera **código novo**, mostrado uma vez. O código usado deixa de valer.
- **Tabela `secret_records(id, iv, ciphertext, updated_at, deleted)`**, sincronizável. O texto aberto é JSON (`{ kind, ...dados }`), cifrado com a CM. O `id` vai como dado autenticado (AAD), para um registro não poder ser trocado por outro.
- **Desbloqueada,** a CM fica só em memória, importada como não extraível para cifrar e decifrar. Ela é apagada da memória com **2 minutos sem uso** nas Notas, ao ocultar o app e ao sair da tela de Notas.
- **PIN opcional (D39):** 4 a 6 números, por aparelho. Embrulha a CM com PBKDF2 do PIN e guarda em `device_state`, sem sincronizar. Com **5 erros**, o PIN é apagado e só a frase abre. O PIN não protege o arquivo sincronizado, e a tela de configurar o PIN diz isso.
- **Exportar banco** (Etapa 7) leva só o texto cifrado.

## Regras das notas (N1 de `regras.md`, detalhadas do legado)
Em `core/grades/`, puro, com tipos próprios.
- **Esquema por matéria e por ano**, editável e copiado do ano anterior: mínimo (padrão 7,0), pesos dos semestres no ano (padrão 50/50), pesos dos bimestres em cada semestre (padrão 50/50; somam sempre 100%) e teto do bônus (10).
- **Item** (prova ou trabalho): bimestre (1 a 4), nome, peso relativo dentro do bimestre, nota ou **pendente**, ligação opcional a uma prova da Agenda (`examId`), item que ele repõe (`replaces`) e bônus opcional.
- **Nota do bimestre** = média ponderada dos itens com nota. Item pendente **não vale zero**: fica fora da conta e a média sai marcada como **parcial**.
- **Reposição** ocupa o lugar da original: a original sai da conta.
- **Bônus** pode estar no item, no bimestre ou no semestre. Ele soma depois da média daquele nível, com teto 10.
- **Semestre** = soma ponderada dos bimestres. **Ano** = soma ponderada dos semestres. Aprovação: ano ≥ mínimo.
- **"Preciso de X"** no 2º semestre: `(mínimo × (p1 + p2) − p1 × média1) / p2`. Com o padrão, fica `2 × 7,0 − média do 1º`. Se der mais que 10, mostra "não dá para chegar ao mínimo". Se der menos que 0, mostra 0.
- "Trazer da Agenda" cria um item a partir de uma prova. A Agenda e a Hub **nunca mostram nota** (A6).

## Testes obrigatórios (D42)
- Cifra: cifrar e decifrar de volta; frase errada falha sem expor nada; trocar a frase faz a nova abrir e a antiga falhar, com as notas intactas e sem recifrar; recuperar pelo código faz o código novo valer e o antigo deixar de valer; um byte trocado no texto cifrado falha; trocar o `id` (AAD) falha; PIN abre; 5 erros apagam o PIN; iterações gravadas na `vault` são respeitadas.
- Notas: média com pendente (parcial), reposição, bônus nos três níveis com teto, pesos 30/70, "preciso de X" nos dois extremos e a cópia do esquema do ano anterior.
- Sync (com o `memoryProvider` da Etapa 12): o outro aparelho recebe só texto cifrado e abre com a mesma frase.

## Critérios de pronto
- [ ] `npm run check` e `npm run e2e` passam.
- [ ] Busca por uma nota conhecida no arquivo exportado e no Drive não acha nada em texto aberto.
- [ ] O usuário anotou o código de recuperação fora do app antes de lançar a primeira nota.

## Roteiro de 5 minutos
1. Abra Notas pela Agenda. Crie a frase de acesso e anote o código mostrado.
2. Numa matéria, lance duas provas no 1º bimestre, uma com nota e uma pendente: a média aparece como parcial.
3. Espere 2 minutos sem tocar: as Notas travam. Abra com a frase.
4. Configure um PIN e abra com ele.
5. Em Configs, troque a frase. Trave e abra com a nova.
6. No outro aparelho, depois de sincronizar, abra as Notas com a mesma frase.
