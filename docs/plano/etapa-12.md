# Etapa 12: Sincronização

**Status:** plano escrito pelo Opus em 07/11/2026 para o **Sonnet**. Depende das Etapas 7 e 10. **Aprovado pelo usuário em 07/11/2026.**
**Modo de plano (D53):** igual à Etapa 7. O Sonnet confere este arquivo com o código e só aponta divergências.

## Antes de começar (o usuário faz, com o Sonnet guiando)
O projeto `ohara` do Google Cloud já existe, criado pelo legado e em produção. O ID do cliente está em `referencia-legado/DECISOES-legado.md` (busque "ID do cliente OAuth"; ele não é segredo).
1. Em "Origens JavaScript autorizadas", acrescentar `http://localhost:5173` e `http://localhost:4173`. `https://dev-gomu.github.io` já está lá.
2. Confirmar que o escopo `drive.appdata` está na tela de consentimento.
O Sonnet não entra no console do Google: ele só explica os cliques.

## Objetivo
Os mesmos dados nos dois aparelhos (tablet e PC), pelo Google Drive (D29), funcionando offline (D30). Os PDFs vão à parte, por hash (D31).

## Desenho (D88)
- **Ninguém sobrescreve o arquivo de outro aparelho.** Cada aparelho grava só os próprios arquivos na pasta do app do Drive (`appDataFolder`):
  - `ohara2.<aparelho>.log.<seq com 6 dígitos>.json`: lote de mudanças `{ device, seq, changes: [{ table, id, updated_at, deleted, row }] }`.
  - `ohara2.<aparelho>.base.json`: compactação `{ device, upto, rows }`. Contém as linhas cujo `updated_at` termina com o id deste aparelho, inclusive as excluídas (marca de exclusão).
  - `ohara2.blob.<sha256>`: bytes dos PDFs (Etapa 10), compartilhados.
- **Junção:** para cada linha recebida, aplica só se `updated_at` recebido for maior que o local, comparando como texto: a última edição vale e o id do aparelho desempata (D29). Antes de aplicar, o HLC local avança com o valor recebido (`receive` em `core/db/hlc.ts`).
- **Rede de segurança (D34, D85):** antes de uma Anotação recebida sobrescrever a local, a versão local entra em `note_versions`.
- **Migração `004_sync.sql`:**
  - `outbox(seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name, row_id)`. O `apply` da Etapa 7 a preenche na mesma transação, só para tabelas sincronizáveis. Aplicar mudança recebida **não** entra na fila.
  - `sync_cursor(device_id PRIMARY KEY, last_seq)` e `sync_state(key, value)` (último envio, último recebimento, último erro). Não sincronizam.
- **Envio:** lê a `outbox` → busca o valor atual de cada linha (mais de uma mudança na mesma linha vira uma) → grava `log.<seq+1>` → apaga a `outbox` até ali. Se cair no meio, reenvia; a junção ignora o repetido.
- **Recebimento:** lista os arquivos `ohara2.*`. Para cada outro aparelho: se `last_seq < base.upto`, lê a base; depois lê os logs com seq maior que o cursor, aplica e avança o cursor. No fim, recarrega o espelho (Etapa 7).
- **Compactação:** com mais de 50 logs próprios, grava a base nova e só então apaga os logs que ela cobre.
- **Quando sincroniza:** ao abrir, ao voltar a internet (`online`), 30 s depois da última edição e ao ocultar o app (depois do `flush`, sem esperar). Há também o botão "Sincronizar agora" em Configs.
- **Blobs:** arquivo novo entra numa fila de envio pelo hash e não reenvia se já existir. Baixa sozinho os PDFs das aulas de hoje e de amanhã (Grade e Agenda). "Manter offline" por aula no menu ⋮ do Slides, guardado em `device_state`.

## Interfaces (D47)
- `SyncProvider` em `core/sync/provider.ts`: `list(prefix)`, `read(name)`, `write(name, bytes)` e `remove(name)`.
- `Auth`: `token(interactive: boolean): Promise<string>` e `signOut()`.
- `data/sync/drive.ts` implementa as duas com o Google Identity Services (token client, escopo `https://www.googleapis.com/auth/drive.appdata`) e a API REST do Drive v3 (`spaces=appDataFolder`). O script do Google só carrega quando a sincronização é usada. O token fica só em memória, nunca no `localStorage`.
- `core/sync/memoryProvider.ts` é o provedor falso dos testes.

## Drive contra Dropbox (D32, D33)
O Drive vem primeiro. O diagnóstico conta quantas vezes o login foi pedido por semana (`sync_state`). Se, depois de 2 semanas de uso, o Drive pedir login mais de uma vez por semana, o usuário cria a conta Dropbox (D33) e uma etapa curta faz `dropbox.ts` com PKCE. Senão, o Dropbox sai do plano (B04).

## Tela
- Configs → **Sincronização:** "Entrar com Google", estado ("Sincronizado às 14:02", "3 alterações esperando", "Sem internet: sincroniza ao voltar", ou o erro em português), "Sincronizar agora", "Sair" e logins pedidos por semana.
- O topo das telas não muda. Erro de sincronização aparece como aviso curto **uma vez**, não a cada tentativa.

## Testes obrigatórios
- Junção: recebido mais novo vence; mais velho é ignorado; empate desempata pelo aparelho; exclusão recebida esconde a linha; mesmo lote aplicado duas vezes não muda nada.
- Dois aparelhos falsos (`memoryProvider`), com edições aleatórias offline nos dois e sincronização em ordem aleatória: no fim, **os dois ficam iguais** (teste de propriedade com sementes fixas).
- Compactação: aparelho novo que lê base mais logs chega ao mesmo estado de quem leu todos os logs.
- Cursor: log apagado depois da base não quebra quem estava atrás.
- Anotação recebida sobre uma local diferente cria uma versão no histórico.

## Critérios de pronto
- [ ] `npm run check` e `npm run e2e` passam (o Playwright não usa o Drive de verdade).
- [ ] Teste real: o mesmo texto chega do PC ao tablet e do tablet ao PC.
- [ ] Offline no tablet: edite, reconecte, e a edição chega ao PC sem tocar em nada.

## Roteiro de 5 minutos
1. No PC: Alt 6, Sincronização, "Entrar com Google".
2. No tablet: o mesmo. Em até 1 minuto aparecem as matérias do PC.
3. No tablet, escreva uma linha numa aula. No PC, toque em "Sincronizar agora": a linha aparece.
4. Desligue o Wi-Fi do tablet. Crie um lembrete. O estado diz "1 alteração esperando".
5. Ligue o Wi-Fi: o estado vira "Sincronizado" e o lembrete aparece no PC.
