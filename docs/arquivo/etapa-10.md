# Etapa 10: Slides e Livros em PDF

**Status:** plano escrito pelo Opus em 07/11/2026 para o **Sonnet**. Depende da Etapa 7. **Aprovado pelo usuário em 07/11/2026.**

## Objetivo
Anexar PDF (ou imagem) a uma aula, como slides, e a uma matéria, como livro (B08). O PDF aparece no bloco Slides da Mesa e funciona sem internet.

## Desenho
- **Arquivo fora do SQLite (D31):** os bytes ficam no OPFS, em `.ohara2-files/<sha256>`. O banco guarda só os dados do arquivo. Arquivo repetido (mesmo hash) é gravado uma vez só.
- Migração `002_arquivos.sql`: tabela `files(id, sha256, name, mime, size, pages, kind, lesson_id, subject_id, updated_at, deleted)`. `kind` é `slides` (aula) ou `livro` (matéria, ou aula quando for capítulo). Sincronizável, com as colunas da Etapa 7.
- `Lesson.slides` (número fictício) sai. A contagem vem de `files.pages`.
- Hash com `crypto.subtle.digest('SHA-256')`. A gravação no OPFS vai para o Worker da Etapa 7 (mensagens `putFile`, `getFile`, `removeFile`), para usar o mesmo tratamento de erro (código `cota`).
- **Leitura do PDF:** `pdfjs-dist` (dependência nova: registrar em `decisoes.md` com a versão; o worker do pdf.js vai no precache do PWA). Uma página por vez, num canvas, com a página seguinte já preparada. Imagem PNG ou JPG vira um "PDF" de uma página.
- **Entrada:** menu ⋮ do bloco Slides → "Anexar PDF" (seletor de arquivo). No PC, também arrastar e soltar sobre o bloco. Livro: menu ⋮ da matéria no Acervo.
- Alt [ e Alt ] passam a página de qualquer bloco (já existem). A página atual de cada aula fica em `device_state` (por aparelho, D28).
- Excluir anexo: lógico (`deleted = 1`). O arquivo do OPFS só é apagado quando nenhum registro vivo usa aquele hash.
- Limite: 100 MB por arquivo (D31). Acima disso, aviso e nada é gravado.

## Fora do escopo
Sincronizar os bytes (Etapa 12), anotar sobre o PDF e busca dentro do PDF (backlog).

## Testes
- Vitest: escolha de hash e reaproveitamento, regra de "pode apagar o arquivo" e página atual com limite (não passa da última).
- Playwright (`?exemplo`): anexar um PDF pequeno de `e2e/fixtures/`, recarregar, ele continua lá e Alt ] passa a página.

## Critérios de pronto
- [ ] `npm run check` e `npm run e2e` passam.
- [ ] PDF de 50 MB abre no tablet sem travar a digitação nas Anotações.
- [ ] Offline: com o app aberto depois da primeira visita, um PDF já anexado continua abrindo.

## Roteiro de 5 minutos
1. Abra uma aula na Mesa. Menu ⋮ do bloco Slides → "Anexar PDF" e escolha um PDF de aula.
2. Com o cursor nas Anotações, aperte Alt ] três vezes: a página muda e o cursor fica onde estava.
3. Recarregue: o PDF continua lá, na mesma página.
4. Desligue o Wi-Fi e recarregue: o PDF abre.
5. No Acervo, menu ⋮ de uma matéria → "Anexar livro".
