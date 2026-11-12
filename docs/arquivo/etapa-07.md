# Etapa 7: Banco

**Status:** plano escrito pelo Opus em 07/11/2026 para o **Sonnet** executar depois de um `/clear`. **Aprovado pelo usuário em 07/11/2026.**
**Modo de plano (D53):** o Sonnet entra em modo de plano só para comparar este arquivo com o código atual e apontar divergências. Ele não refaz o desenho. Se algo aqui não funcionar na prática, ele para e avisa (regra de troca, `_indice.md`).
**Branch:** `telas-3-a-9`, com um commit por passo. Sem push, sem merge e sem deploy.

## Objetivo
Todos os dados que hoje vivem em memória (`createMemoryStorage`) passam a ser gravados no SQLite, no OPFS e dentro de um Worker (D21). As telas **não mudam**: elas continuam usando a interface `Storage` de `src/core/study/storage.ts`. Ao recarregar a página, tudo continua lá.

## Desenho (decidido, ver D84 a D86)

### Espelho de leitura
- A tela lê um **espelho** (`StudyData`) carregado do banco na abertura. O espelho só copia o banco, nunca o substitui como fonte da verdade (D26, refinada pela D84).
- `write(change)` faz três coisas: (1) calcula o novo espelho; (2) compara o antigo com o novo usando `diffStudy`; (3) manda as mudanças ao Worker.
- O espelho muda na hora, porque digitar não pode esperar o disco. Se o Worker devolver erro, o app abre a **tela de erro global** e recarrega o espelho do banco. A falha nunca passa em silêncio (D22).
- **Fila com coalescência:** mudanças na mesma linha em até 300 ms viram uma só gravação (as Anotações gravam a cada tecla). `flush()` grava a fila na hora quando o app é ocultado (`visibilitychange`), ao trocar de tela e antes de sincronizar (D25).
- `note_versions` **não entram inteiras no espelho**, porque seriam dezenas de MB. O espelho só carrega as versões da aula aberta: `Storage.loadLesson(lessonId): Promise<void>`, chamado pela Mesa ao abrir uma aula.

### Camadas (D45)
| Onde | Arquivo | Papel |
|---|---|---|
| `core/db/` | `diff.ts` | `diffStudy(antes, depois): Change[]`. Usa os ids, compara primeiro por referência e depois campo a campo. Item que some do espelho vira `delete` |
| `core/db/` | `rows.ts` | `toRow` e `fromRow` por tabela (camelCase ↔ snake_case, `boolean` ↔ 0/1) |
| `core/db/` | `hlc.ts` | Relógio híbrido (D29): `tick(estado, agora, aparelho)`. Formato que se ordena como texto: `<ms com 13 dígitos>-<contador com 4 dígitos>-<id do aparelho>` |
| `core/db/` | `migrations.ts` | Lista ordenada de migrações e `pending(versaoAtual)`. Recebe o SQL já carregado como texto, sem importar arquivo |
| `core/db/` | `protocol.ts` | Tipos das mensagens entre a tela e o Worker, mais `DbErrorCode` |
| `core/db/` | `errors.ts` | `classifyError(mensagem, nome): DbErrorCode`, que traduz o erro do navegador ou do SQLite para um código |
| `data/` | `worker.ts` | Carrega o SQLite, instala o `opfs-sahpool`, roda as migrações e responde às mensagens |
| `data/` | `migrations/001_inicial.sql` | Esquema inicial, importado com `?raw` |
| `data/` | `client.ts` | Lado da tela: cria o Worker, faz pedido e resposta com id e repassa erros |
| `data/` | `dbStorage.ts` | `createDbStorage(client): Promise<Storage>`, com espelho, fila e `flush` |
| `data/` | `lock.ts` | Trava de uma aba só (Web Locks) |
| `src/main.tsx` | composição | Pega a trava, abre o banco, cria o `Storage` e só então desenha o `Shell`. Se algo falhar, desenha a tela de erro |
| `ui/study/study.ts` | | Deixa de criar o armazenamento em memória e passa a receber o `Storage` pronto (`setStorage`). A UI continua sem importar `data/` |
| `ui/shell/` | `ErrorScreen.tsx`, `Loading.tsx` | Tela de erro global e tela de abertura |

### Esquema (`001_inicial.sql`)
- Uma tabela por coleção de `StudyData`: `years`, `subjects`, `folders`, `lessons`, `cards`, `exams`, `events`, `slots`, `reminders`. Cada campo de `types.ts` vira uma coluna com o mesmo nome em snake_case.
- **Toda tabela sincronizável** tem três colunas: `id TEXT PRIMARY KEY` (UUID, D23), `updated_at TEXT NOT NULL` (HLC) e `deleted INTEGER NOT NULL DEFAULT 0`. A Etapa 12 usa as três sem migração nova.
- **Exclusão é lógica:** `delete` grava `deleted = 1` e um `updated_at` novo. O espelho só carrega `deleted = 0`. Exceção: `note_versions`, local e apagada de verdade (D85).
- `note_versions(id, lesson_id, at, html)`, com índice `(lesson_id, at)`. Fica no aparelho e não sincroniza (D85). `NoteVersion` ganha `id`.
- `meta(key PRIMARY KEY, value)`: `device_id` (UUID gerado na primeira abertura), `hlc` (último valor) e `created_at`. Não sincroniza.
- `device_state(key PRIMARY KEY, value TEXT)` para o arranjo da Mesa por aula (D28). Não sincroniza. Nesta etapa só cria a tabela: o arranjo continua em memória até a etapa que o pedir.
- Busca: sem FTS nesta etapa. A busca atual, sem acento e em memória (`core/study/search.ts`), já funciona sobre o espelho. FTS fica para quando ficar lenta (linha no backlog).
- Migração: `PRAGMA user_version` guarda o número. Cada migração roda numa transação. Se falhar, desfaz tudo e gera o erro `migracao`. Também `PRAGMA foreign_keys = ON` e `journal_mode` padrão do sahpool.

### Worker e OPFS
- Pacote **`@sqlite.org/sqlite-wasm`** (D21; confirmar a versão no npm e registrar em `decisoes.md`).
- `installOpfsSAHPoolVfs({ name: 'ohara2-pool', directory: '.ohara2-pool' })`, para não colidir com o legado (D57). Arquivo `/ohara2-db.sqlite3` (`DB_NAME` de `src/data/dbName.ts`).
- Worker com `new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`. No `vite.config.ts`: `optimizeDeps.exclude: ['@sqlite.org/sqlite-wasm']` e `worker.format: 'es'`.
- **PWA offline:** o `.wasm` precisa entrar no precache. Acrescente `wasm` aos `globPatterns` e suba `maximumFileSizeToCacheInBytes` para 3 MB. Confira no `dist/sw.js` que o arquivo está lá.
- Mensagens: `open` (devolve o espelho e o diagnóstico), `apply` (lista de `Change` numa transação só), `loadVersions`, `export` (bytes do arquivo, pelo `exportFile` do sahpool) e `diagnose`.

### Abertura e falhas (D22)
Ordem em `main.tsx`: `Loading` → trava → `navigator.storage.persist()` (D24, guarda o resultado) → Worker `open` → `Shell`.

| Código | Quando | Texto na tela (curto) | Botões |
|---|---|---|---|
| `outra-aba` | Trava ocupada | "O Ohara já está aberto em outra aba. Feche a outra e toque em Tentar de novo." | Tentar de novo |
| `opfs-indisponivel` | Navegador sem OPFS ou janela anônima | "Este navegador não deixa o Ohara guardar dados. Use o Chrome, fora da janela anônima." | Tentar de novo |
| `cota` | Disco cheio (`QuotaExceededError`) | "Falta espaço no aparelho. Nada novo foi salvo." | Exportar banco, Tentar de novo |
| `migracao` | Migração falhou | "A atualização do banco falhou. Seus dados estão intactos na versão anterior." | Exportar banco |
| `corrompido` | `SQLITE_CORRUPT` ou `SQLITE_NOTADB` | "O arquivo do banco está danificado." | Exportar banco |
| `gravacao` | `apply` falhou depois de aberto | "A última alteração não foi salva." | Exportar banco, Recarregar |
| `desconhecido` | Qualquer outro | Mensagem técnica num bloco recolhido | Exportar banco, Tentar de novo |

- A tela de erro segue `diretrizes-visuais.md`: cartão central e foco no primeiro botão. Enter aciona.
- **Nunca** abra o app em memória quando houver erro. O caminho em memória só existe no modo exemplo e nos testes.

### Primeira abertura e dados de exemplo
- Banco novo começa **vazio** e cria um ano com o nome do ano corrente, para o Acervo poder receber matérias.
- `?exemplo` na URL (só nos testes e no dev) usa outro pool (`ohara2-exemplo-pool`), preenche com `createFixtures` na criação e mantém o aviso "Dados de exemplo". `Storage.persistent` é `false` nesse modo. O Playwright passa a abrir com `?exemplo`.
- **Telas vazias:** passe por todas as telas com o banco vazio. Nenhuma pode quebrar. Bloco vazio mostra uma frase curta com a tecla de criar (ex.: "Nenhuma aula. Alt N cria."), no tom de `diretrizes-visuais.md`.

### Configs
- Em **Backup:** botão "Exportar banco", que baixa `ohara-AAAA-MM-DD.sqlite3`. Importar fica para depois (linha no backlog).
- Em **Sobre:** diagnóstico com versão do SQLite, versão das migrações, armazenamento persistente sim ou não, espaço usado e livre (`storage.estimate()`), número de registros por tabela e id do aparelho.

## Fora do escopo
Sincronização, fila de envio e conflitos (Etapa 12), FSRS (11), PDFs no OPFS (10), notas cifradas (13), importar banco, FTS, renomear e excluir nas telas (pendência separada do Sonnet).

## Passos (um commit cada)
1. `core/db/`: `hlc`, `rows`, `diff`, `migrations`, `errors` e `protocol`, com testes. Ainda sem SQLite.
2. Dependência, `vite.config.ts`, Worker, migração 001 e `client`. Teste manual no `npm run dev`: abrir e ver o diagnóstico no console do Worker.
3. `dbStorage` com espelho, fila de 300 ms, `flush`, `loadLesson` e `noteVersions` por aula. Ajuste mínimo em `useNotesEditor` e no histórico.
4. `main.tsx`, `setStorage`, trava, `Loading` e `ErrorScreen` com todos os códigos.
5. Modo `?exemplo`, telas vazias e Playwright com `?exemplo`.
6. Configs: exportar e diagnóstico. PWA com `.wasm` no precache.
7. `docs/telas.md` (some a frase "enquanto não houver banco"), `decisoes.md` (versão do pacote), `_indice.md` e `loop-telas.md`.

## Testes obrigatórios
- **Vitest (core):** `diffStudy` em inserção, edição, item que some, item igual com objeto novo (não gera mudança) e as dez coleções. `toRow` e `fromRow` ida e volta em todas as tabelas. `tick` do HLC: relógio parado, relógio que volta no tempo e ordem como texto. `pending` em banco novo, banco no meio e banco em dia. `classifyError` em cada código da tabela.
- **Teste de SQL em Node:** se o `@sqlite.org/sqlite-wasm` rodar em Node, sem OPFS e em memória (A VERIFICAR), aplique a 001 e faça ida e volta de cada tabela. Se não rodar, registre em `decisoes.md` e cubra isso no Playwright.
- **Playwright:** (a) criar uma matéria, recarregar e ela continua lá; (b) digitar nas Anotações, recarregar e o texto continua lá; (c) segunda aba mostra "outra aba"; (d) Exportar banco baixa um arquivo com mais de 0 bytes.

## Critérios de pronto
- [ ] `npm run check` e `npm run e2e` passam.
- [ ] Nada é perdido ao recarregar, ao fechar a aba logo depois de digitar e ao ocultar o app no tablet.
- [ ] Cada código de erro foi visto na tela pelo menos uma vez, forçado no dev.
- [ ] O app abre offline depois da primeira visita, com o `.wasm` no cache.
- [ ] Nenhum arquivo passa de ~300 linhas. `ui/` não importa `data/`.

## Roteiro de 5 minutos (usuário, no Chrome do PC e no tablet)
1. Abra o app. Ele está vazio, sem o aviso "Dados de exemplo".
2. Alt 3, Alt N: crie uma matéria. Entre nela e crie uma aula.
3. Abra a aula na Mesa e escreva duas linhas nas Anotações. Feche a aba na hora.
4. Abra de novo: a matéria, a aula e o texto continuam lá.
5. Abra o app numa segunda aba: aparece o aviso de outra aba aberta.
6. Alt 6, Backup, Exportar banco: baixa um arquivo `.sqlite3`.
7. Alt 6, Sobre: "Armazenamento persistente: sim".
