# Ohara: registro de decisões

**Status:** versão 1, rascunho para aprovação. Data: 05/11/2026.
**Formato (ADR simplificado):** uma linha por decisão, com o motivo. Decisões de produto estão em `visao.md`; aqui ficam as técnicas e de processo.

**Como manter:** o Claude Code acrescenta no máximo 5 linhas por etapa. Para mudar uma decisão, **não apague**: marque a antiga como `Substituída por Dxx` e crie uma nova.

**Status possíveis:** `Decidida`, `PENDENTE` (falta escolher), `A VERIFICAR` (decidida, mas depende de confirmação na prática).

---

## 1. Plataforma e processo

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D01 | **Só PWA** (instalada pelo navegador). Capacitor, Tauri, Electron e app nativo descartados | Critério "zero trabalho". A verificação de desenvolvedor do Android no Brasil (em vigor desde 30/09/2026) pesou contra apps fora de loja | Decidida |
| D02 | Hospedagem no **GitHub Pages por GitHub Actions**, em **repositório novo**. Deploy só se `npm run check` passar | Sem servidor próprio. O domínio é o mesmo do app antigo (`dev-gomu.github.io`), então o app novo **precisa** de nomes de banco únicos e escopo próprio do service worker. O Claude Code define os detalhes, mas **não pode esquecer essa exigência** | Decidida |
| D03 | No Linux Mint, instalar pelo Chromium/Chrome ou pelo Gerenciador de Aplicativos Web do Mint | O Firefox não instala PWAs | Decidida |
| D04 | **Reescrever do zero**, sem migrar código nem dados | O `nucleo/` antigo (~3 mil linhas de regras puras) serve só como especificação. O teclado estava espalhado em ~20 arquivos com `keydown` próprio (causa dos conflitos), sem testes, e os IDs numéricos sequenciais quebram sincronização por registro | Decidida |
| D05 | Legado **fora do repositório**, em pasta ao lado somente leitura (ex.: `ohara-legado`). Uma sessão própria extrai `docs/regras.md`: só comportamento, sem código, cada item marcado manter/descartar/rever, **aprovado pelo usuário**. Roda em paralelo à Fase A | Evita copiar código ruim e dá ao Claude Code uma especificação limpa | Decidida |

## 2. Linguagem, build e interface

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D06 | **TypeScript 6.0 estrito**, com `noUncheckedIndexedAccess`. Migrar para o 7.x quando o 7.1 e o typescript-eslint o suportarem | O 7.0 não tem API programática, o que exigiria dois compiladores | A VERIFICAR |
| D07 | **Vite 8** e **React 19**. O CI roda `tsc --noEmit` | O Vite não checa tipos | A VERIFICAR |
| D08 | **React Aria Components** só para menus, diálogos, janelas de consulta e réguas. **Navegação entre blocos e Esc pertencem ao núcleo próprio** | Aproveita foco preso e acessibilidade prontos, sem dividir a autoridade sobre o teclado | Decidida |
| D09 | **CSS Modules** + variáveis CSS num arquivo único. Sem Tailwind | Simplicidade e tema por variáveis | Decidida |
| D10 | **Mosaico próprio** em grid CSS, estilo dwindle, como **motor genérico** (serve à Mesa e ao Hub) | Um motor, duas telas | Decidida |
| D11 | Editor de Anotações: **Tiptap 3** | | A VERIFICAR |
| D12 | PWA com **vite-plugin-pwa 1.3+**, com aviso de nova versão | Critério "pouca manutenção": atualiza com um toque | A VERIFICAR |
| D13 | Componente da Paleta: React Aria ou cmdk | Decidir na Etapa 3, com a Paleta na mão | **PENDENTE** |

## 3. Teclado

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D14 | Modificador **Alt**. Usar `e.code`, não `e.key` | Ctrl fica para o navegador. `e.code` é estável no teclado ABNT2 | Decidida |
| D15 | **Um único listener** no `document`, em fase de captura, que chama um **resolvedor puro** em TypeScript (única autoridade). Entrada: `{code, key, modificadores, contexto}`; saída: ação ou nulo | Elimina a causa dos conflitos do legado | Decidida |
| D16 | A **tabela de teclas é dado**: gera a ajuda na tela e os testes. O CI barra qualquer quebra | Ajuda e comportamento nunca divergem | Decidida |
| D17 | **Três níveis de foco**: menu, bloco, campo. Enter desce, Esc sobe. Esc no menu não faz nada | Modelo previsível | Decidida |
| D18 | Prioridade do Esc: janelas (ajuda, Paleta, consulta) → menu ⋮ → sobe um nível | Esc sempre faz o que o contexto promete | Decidida |
| D19 | No campo, teclas soltas e setas são do texto. No nível bloco, h j k l e setas movem o foco | Digitar nunca dispara atalho | Decidida |
| D20 | Risco: Alt+1 a 9 troca de aba no Firefox/Linux e pode ser capturado por outros sistemas. A **tabela final** sai do log de teclas do protótipo da Mesa | Teste em aparelho real antes de congelar | Decidida (PC). Tablet pendente, ver `teclado.md` |

## 4. Dados e armazenamento

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D21 | **SQLite oficial** (`@sqlite.org/sqlite-wasm`) no **OPFS**, em **Worker**, com o driver **`opfs-sahpool`** | O GitHub Pages não define COOP/COEP. Consequência: **só uma aba por vez**, com trava e mensagem clara | A VERIFICAR |
| D22 | **Nunca cair em memória em silêncio** se o OPFS falhar. Haverá tela de diagnóstico, exportação do arquivo do banco e tela de erro global | Critério "nunca perder dados" | Decidida |
| D23 | **IDs UUID**, exclusão lógica, migrações `.sql` numeradas, **sem ORM**, repositório fino tipado | UUID permite sync por registro; sem ORM, menos dependências | Decidida |
| D24 | `storage.persist()` na primeira abertura, sem botão | Pede ao navegador que não apague os dados | Decidida |
| D25 | **Gravação segura:** salvar ao trocar de tela, ao ocultar o app e antes de sincronizar | Cobre fechar a aba, trocar de app e sync | Decidida |
| D26 | **O banco é a única fonte da verdade** (sem cópia dele em memória). Estado de tela (mosaico, foco) fica em memória | Evita divergência entre tela e dados | Decidida |
| D27 | Busca: barra única com filtro (Tudo, Cartões, Anotações, aulas), usando a busca de texto do SQLite | | Decidida |
| D28 | O arranjo da Mesa é lembrado **por aula e por aparelho, sem sincronizar** | Aparelhos têm telas diferentes | Decidida |

## 5. Sincronização

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D29 | **Google Drive**, escopo `appdata`, sincronização **por registro**: data de edição + lixeira, **a última edição vale**, com **relógio híbrido (HLC)** | Permite editar nos dois aparelhos sem pacote inteiro. App do Google Cloud em "In production" | Decidida |
| D30 | **Fila de alterações pendentes** para uso offline. Sincroniza ao reconectar e ao abrir | Critério offline de `visao.md` | Decidida |
| D31 | **PDFs sincronizam à parte, por hash**. Baixa automático os de hoje e amanhã, mais "manter offline" por aula | Arquivos grandes (até 100 MB) não entram no fluxo por registro | Decidida |
| D32 | Interface **`SyncProvider`**, com **teste curto Drive vs Dropbox (PKCE)** na Etapa 12. O Dropbox só entra para eliminar o login ocasional; se o Drive bastar, ele some | No navegador, o token do Google dura 1 h e o refresh exige servidor. O Dropbox renova sem servidor | Decidida |
| D33 | Conta no Dropbox | Só será criada se o teste da Etapa 12 favorecer | **PENDENTE** |
| D34 | Rede de segurança para edição concorrente: **histórico de versões das Anotações** (50 versões, a cada 5 min) | A última edição vale, então é preciso poder voltar | Decidida |

## 6. Notas em segredo

Aqui "Notas" são as do boletim (média, pesos, itens), **não** as Anotações.

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D35 | Notas e boletim **cifrados com AES-GCM** (Web Crypto) antes de gravar no banco e antes de sincronizar. Cifra só esses dados, não o resto do app | Só o dono pode ver; a nuvem guarda dados ilegíveis | Decidida |
| D36 | Chave derivada de **frase própria**, não de PIN de 4 dígitos | Um PIN curto é quebrado em segundos por força bruta | Decidida |
| D37 | Derivação: **Argon2** se houver biblioteca leve para o navegador; senão **PBKDF2** com muitas iterações | | **PENDENTE** |
| D38 | **Código de recuperação** gerado na primeira vez e mostrado uma só vez. Trocar a frase **recifra apenas a chave mestra** | Evita reprocessar todas as notas | Decidida |
| D39 | **PIN curto opcional**, só como atalho de desbloqueio local, por aparelho. Não protege o arquivo sincronizado | Conveniência sem enfraquecer a proteção | Decidida |
| D40 | Perdendo frase **e** código, os dados são **irrecuperáveis** (não há servidor) | Custo aceito conscientemente | Decidida |
| D41 | Notas ficam **fora da Mesa e das janelas de consulta** | Sigilo (tela aberta em sala). Acesso pela Agenda e pela Paleta, sempre com a frase | Decidida |
| D42 | Testes obrigatórios: cifrar, decifrar, trocar a frase, recuperar pelo código | Erro aqui é irreversível | Decidida |

## 7. Estudo

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D43 | **ts-fsrs (FSRS-6)** no lugar do SM-2. Mesmos 4 botões (Errei, Difícil, Bom, Fácil), retenção desejada configurável. Começa limpo, sem dados para converter. O núcleo do Treino é uma **função fina em volta da biblioteca** | Algoritmo mais moderno. Trocar a biblioteca depois é barato | A VERIFICAR |
| D44 | Otimizador de parâmetros do FSRS: não sabemos se roda no navegador | Não é requisito do começo | **PENDENTE** |

## 8. Arquitetura de código

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D45 | Três camadas: `src/core/` (TypeScript puro, **sem imports**: teclado, mosaico, notas, agenda, sync, FSRS), `src/data/` (Worker SQLite, migrações, repositórios; importa só `core`), `src/ui/` (React; **nunca toca o SQLite**). O lint falha o CI se uma camada for violada | Regras testáveis sem navegador; fronteiras impostas por máquina | Decidida |
| D46 | Arquivos de até ~300 linhas | Cabem no contexto do Claude Code e são fáceis de revisar | Decidida |
| D47 | Interfaces **`Storage`**, **`SyncProvider`** e **`Auth`** | Permitem trocar implementações sem mexer na UI | Decidida |

## 9. Qualidade

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D48 | **Portão único `npm run check`** (tipos, lint, testes), igual no CI e no hook. O deploy só ocorre se passar | Um só critério de "pronto" | Decidida |
| D49 | ESLint, Prettier automático por hook, Dependabot com atualizações agrupadas | Critério "pouca manutenção" | Decidida |
| D50 | **Vitest** em Node para o núcleo. **Playwright** só em poucos roteiros feitos só com teclado | Testa o que mais importa sem custo alto | Decidida |
| D51 | Cada etapa da Fase A termina com um **roteiro de 5 minutos** para o usuário usar | O usuário valida de verdade, não só os testes | Decidida |

## 10. Trabalho com o Claude Code

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D52 | `CLAUDE.md` com **60 a 100 linhas**, regras por pasta em `.claude/rules/`. Ele diz que o projeto é novo e que a fonte da verdade é `docs/` | Contexto enxuto economiza créditos | Decidida |
| D53 | **Uma etapa por sessão**, `/clear` entre etapas, modo de plano nas Etapas 2, 7 e 12, **sem subagentes** por padrão. Saída curta em testes e lint | Economia de créditos | Decidida |
| D54 | Hooks para `check` e Prettier. O formato do hook de parada deve ser confirmado na Etapa 1 | Detalhes de configuração mudam entre versões | Decidida (ver D58) |
| D55 | Ideias novas vão para `docs/backlog.md`, não para a etapa em curso. **Escopo congelado no checkpoint da Etapa 6** (atalhos congelados junto) | Evita crescimento descontrolado | Decidida |

## Registro da Etapa 1 (05/11/2026)

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D56 | Versões fixadas: TypeScript **6.0.3** (7.x fora: typescript-eslint exige <6.1), Vite 8.3, React 19.3, vite-plugin-pwa **2.0** (plano dizia 1.3+; aceita Vite 8), Vitest 5.1, ESLint 10. Tiptap 3.33 e ts-fsrs 6.0 existem, ainda não instalados (D06, D07, D11, D12, D43 confirmadas) | Compatibilidade verificada no npm | Decidida |
| D57 | Prefixo único **`ohara2-`** (banco, localStorage, cache do SW `ohara2`) e base `/ohara/`. O legado já usa `ohara-` e `ohara.` no localStorage | Evita colisão no domínio compartilhado (D02) | Decidida |
| D58 | Hooks do Claude Code em `.claude/settings.json`: `PostToolUse` (Prettier) e `Stop` (roda `check`; falha devolve exit 2; evita laço por `stop_hook_active`). Fecha D54 | Formato confirmado | Decidida |
| D60 | Ícone do app: morcego **A · Refinado** (`Ohara – morcego tela cheia, refinado.html`), em SVG e PNG 192/512, com versão maskable de margem segura. Ícone final, não provisório | Escolha do usuário em 2026-11-05 | Decidida |
| D61 | Tecla de ajuda: **Alt /** (IntlRo, o `/` do ABNT2); **F1** como alternativa; **Alt ;** removida (duplicata) | Teste no PC confirmou as duas; uma só basta | Decidida |
| D59 | Regras de camada com `no-restricted-imports` do ESLint (sem plugin extra) | Menos dependências | Decidida |

---

## Pendências consolidadas

| Item | Quando |
|---|---|
| D13: React Aria ou cmdk para a Paleta | Etapa 3 |
| D20: tabela final de atalhos | Etapa 0, após o protótipo |
| D33: conta Dropbox | Etapa 12, se o teste favorecer |
| D37: Argon2 ou PBKDF2 | Etapa 13 |
| D44: otimizador do FSRS no navegador | Etapa 11 |
| D54: formato do hook de parada | Etapa 1 |

## Itens a verificar na Etapa 1

O Claude Code deve **confirmar as versões e a compatibilidade atuais** de TypeScript 6, Vite 8, Tiptap 3, vite-plugin-pwa 1.3 e ts-fsrs antes de fixá-las, e confirmar que o `opfs-sahpool` funciona no GitHub Pages. Se algo divergir, registra a troca aqui (D06, D07, D11, D12, D21, D43).
