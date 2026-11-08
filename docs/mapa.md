# Mapa do projeto

> `docs/mapa-gerado.md` é gerado por `node scripts/mapa.mjs` (títulos e linhas de cada doc, e a primeira linha de cada arquivo de `src/`). Não edite ele à mão; rode o script de novo.

Use este mapa para ir direto ao trecho certo. Abra só a seção indicada, não o arquivo inteiro. Os IDs `D..` são de `docs/decisoes.md` (vão até D109).

## Se o assunto é X, abra Y

### Visão e escopo
- **O que é o app, para quem, o que não fazer:** `docs/visao.md`, seções 1, 4 e 6.
- **Ideia nova ou adiada:** `docs/backlog.md` (uma linha por ideia). Escopo congelado: D55.

### Teclado (regra mais crítica)
- **Tabela de teclas, Alt+1 a 6, Enter e Esc:** `docs/teclado.md`, seção "Tabela final".
- **Regras de uso e níveis de foco:** `docs/teclado.md` ("Regras de uso"); D19, D20, D70.
- **Código:** `src/core/keyboard/` (`keys.ts` é a tabela, `resolve.ts` é o resolvedor puro). Listener único em `src/ui/keyboard/listener.ts`. Nunca crie `keydown` em componente.
- **Testes de teclado:** `src/core/keyboard/*.test.ts`. Bug de teclado vira teste antes da correção.

### Dados e banco
- **Modelo de dados, OPFS, falhas:** `docs/plano/etapa-07.md`, seções "Desenho", "Abertura e falhas" e "Esquema". Decisões D84 a D86, D22.
- **Espelho de leitura e escrita:** D84. Código em `src/core/db/diff.ts` e `src/data/worker.ts`.
- **Migrações SQL:** `src/core/db/migrations.ts` e `src/data/migrationList.ts`. Sem ORM (D45).
- **Backup e importação:** `src/core/db/backup.ts`; D97.
- **Regra de camadas:** `docs/decisoes.md` seção 8 (D45). `core/` não tem imports; `data/` só importa `core/`; `ui/` nunca toca o SQLite.

### Telas
- **Hub (Alt 1), Mesa (2), Acervo (3), Treino (4), Agenda (5), Configs (6), janelas de consulta:** `docs/telas.md`, seções 1 a 6 e "Janelas de consulta".
- **Código das telas:** `src/ui/screens/<tela>/`. Casca e navegação: `src/ui/shell/`.
- **Mosaico (motor dwindle, mosaico fixo e livre):** `src/core/mosaic/tree.ts` e `src/ui/mosaic/`. Decisão D73 (livre x fixo) e D10.
- **Foco visual dos blocos:** `docs/plano/foco-mosaico.md`; D105 e D109.
- **Cartões de provas no Hub:** código em `src/ui/screens/hub/` (`HubBlocks.tsx`). Estado e regras de design: `docs/telas.md`, seção 1.

### Agenda, Grade e lembretes
- **Regras herdadas do legado:** `docs/regras.md`, seções 1 a 5.
- **Versão de layout da Agenda:** D82 (semana e prévia).
- **Lógica:** `src/core/study/agenda.ts`, `src/core/study/ics.ts` (exportação .ics) e `src/core/study/attendance.ts` (Faltas, D100 e D101).

### Treino e FSRS
- **Teclas do Treino:** `docs/teclado.md`, seção "Treino (no cartão, D77)".
- **Fila da sessão e cartões:** `src/core/study/session.ts`, `src/core/study/cardText.ts`.
- **Plano do FSRS (Etapa 11):** `docs/plano/etapa-11.md`. Otimizador de parâmetros: D44 (pendente).

### Notas do boletim (cifradas)
- **Cifra e derivação de chave:** `docs/decisoes.md` seção 6 (D35 a D40, D87 para PBKDF2).
- **Plano:** `docs/plano/etapa-13.md`.
- **Código:** `src/core/secret/` (`codec.ts`, `vault.ts`) e `src/core/grades/`.
- **Atenção:** Notas do boletim não são Anotações (texto das aulas).

### Sincronização
- **Interfaces `Storage`, `SyncProvider`, `Auth`:** D47.
- **Drive contra Dropbox, teste de login:** D32 e D33 (conta Dropbox pendente).
- **Plano:** `docs/plano/etapa-12.md`, seção "Desenho (D88)".
- **Código:** `src/core/study/storage.ts`, `src/data/dbStorage.ts`. Sincronização real ainda não existe.

### Decisões técnicas
- **Registro completo:** `docs/decisoes.md`. Use `grep -n "^| D<número> " docs/decisoes.md` para achar uma decisão.
- **Decisões `Decidida` não se contrariam sem avisar o usuário.** Itens `PENDENTE` estão em "Pendências consolidadas".
- **Plataforma e processo:** seção 1 (D01 só PWA, D02 GitHub Pages).

### Etapas e plano
- **Ordem, fila e status de cada etapa:** `docs/plano/_indice.md`, seções "Ordem de execução" e "Fase A/B".
- **Etapa atual:** o arquivo `docs/plano/etapa-XX.md` da etapa. Só ela é detalhada.
- **Histórico das rodadas de telas:** `docs/plano/loop-telas.md`.
- **Pendências de cor e identidade:** `docs/plano/identidade-tipografia.md` e `docs/plano/tipografia-seis-papeis.md`. D67 e D68 fecham a tipografia.

### Diretrizes visuais
- **Antes de propor ou mudar qualquer layout:** `docs/diretrizes-visuais.md`. Checklist na seção 8 e modelo de proposta na seção 9.
- **Foco e sete estados:** seção 3 (D105).
- **Cor, tipografia e espaço:** seção 6 (tokens em `src/ui/styles/tokens.css`).
- **Paletas de teste A e B:** `src/ui/styles/paletas.css`. O usuário ainda escolhe.
- **Revisão visual do Acervo:** `docs/plano/acervo-visual.md` (D108).

### Testes e qualidade
- **`npm run check`:** tipos, lint e Vitest. Portão único (D48).
- **`npm run e2e`:** Playwright, fora do `check`, roda no CI antes do deploy (D66).
- **Conferir visual sem gastar créditos:** `npm run tela -- [caminho]`, script `scripts/tela.mjs`. Sempre os dois temas.
- **Regra de teste:** `docs/decisoes.md` seção 9 (Qualidade).

### Economia de créditos e processo
- **Uma etapa por sessão, `/clear` entre etapas:** D53.
- **Commit em lote:** `npm run salvar -- "mensagem"`, script `scripts/salvar.sh`. Só quando o usuário pedir.
- **Edição e leitura:** `CLAUDE.md`, seção "Economia de créditos". Não releia docs já no contexto.
- **Trabalho com o Claude Code:** `docs/decisoes.md` seção 10.
