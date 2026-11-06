# Ohara

App pessoal de estudo de medicina (PWA): slides, anotações, cartões, agenda e notas. Reescrita do zero; a fonte da verdade é `docs/`.

## Como rodar

Requer Node (versão em `.nvmrc`).

```bash
npm ci          # instala
npm run dev     # servidor local em http://localhost:5173/ohara/
npm run check   # tipos + lint + testes (portão único)
npm run build   # build de produção em dist/
```

## Como publicar

Dê push na `main`. O GitHub Actions roda `check` e `build`; só se passarem, publica no GitHub Pages em https://dev-gomu.github.io/ohara/.
