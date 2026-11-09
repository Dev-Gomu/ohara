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
| D11 | Editor de Anotações: **Tiptap 3** (3.33, com `extension-highlight`, `task-list` e `task-item`) | Verificado na Etapa 8: teclas passam pela tabela, Alt e AltGr intactos | Decidida |
| D12 | PWA com **vite-plugin-pwa 1.3+**, com aviso de nova versão | Critério "pouca manutenção": atualiza com um toque | A VERIFICAR |
| D13 | Componente da Paleta: **React Aria** (Autocomplete com Menu), sem o cmdk | Já está no app e filtra bem. Dependência a menos | Decidida (Etapa 3) |

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
| D37 | Derivação: **Argon2** se houver biblioteca leve para o navegador; senão **PBKDF2** com muitas iterações | | Decidida (D87: PBKDF2) |
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
| D60 | Ícone do app: morcego **A · Refinado** (`Ohara – morcego tela cheia, refinado.html`), em SVG e PNG 192/512, com versão maskable de margem segura. Ícone final, não provisório | Escolha do usuário em 2026-11-05 | Substituída pela D69 |
| D69 | Ícone oficial: o gato-morcego preto sobre lavanda (`image(4).svg`), com **cantos arredondados** (raio de 24%, como o ícone anterior). Em `public/`: `icon.svg`, PNG 192 e 512, e maskable 512 em tela cheia | Escolha do usuário em 07/11/2026. Substitui a D60 | Decidida |
| D61 | Tecla de ajuda: **Alt /** (IntlRo, o `/` do ABNT2); **F1** como alternativa; **Alt ;** removida (duplicata) | Teste no PC confirmou as duas; uma só basta | Decidida |
| D59 | Regras de camada com `no-restricted-imports` do ESLint (sem plugin extra) | Menos dependências | Decidida |
| D62 | **AltGr nunca é atalho:** com `getModifierState('AltGraph')` verdadeiro, o resolvedor devolve nulo | No ABNT2, AltGr digita ¹ ² ³ e `/`, e pode chegar como Ctrl+Alt, o que dispararia Título 1 no meio do texto | Decidida |
| D63 | **Composição e teclas sem código devolvem nulo:** `isComposing`, `key === 'Dead'` ou `code` vazio | Acentos do ABNT2 e o teclado virtual do Android não podem disparar nada | Decidida |
| D64 | **Repetição por linha:** só movimento, troca de página e troca de controle repetem. Nas outras, a repetição é **engolida** (`swallow`), não nula | Segurar Alt S abriria e fecharia o bloco sem parar. Com nulo, segurar Alt F ou Ctrl P entregaria a repetição ao navegador | Decidida |
| D65 | **Com janela ou menu ⋮ aberto,** só Esc age. Teclas soltas seguem para a janela; as com Alt ou Ctrl da tabela e o F1 são engolidos, inclusive Alt 1 a 6 | Evita Alt ← voltar a página e F1 abrir a ajuda do navegador. Decisão do usuário: primeiro Esc, depois a tecla | Decidida |
| D66 | **Playwright fora do `check`, dentro do CI:** `npm run e2e` gera o build e roda antes do deploy | Mantém o portão rápido (D48) sem abrir mão do roteiro (D50) | Decidida |
| D67 | **Tipografia:** voz **Nunito** (700 e 800), interface **Inter** (500, 600 e 700), leitura **Source Sans 3** (400, 600 e itálico 400) e título de nota também **Source Sans 3** (600 e 700), separado da voz | Escolha do usuário em 07/11/2026, entre seis combinações em `tipografia-claudeweb/ohara-fontes.html`. As três têm acentos, grego, setas, ≥ ≤ e ₂ (conferido nos arquivos oficiais). Licença OFL | Decidida |
| D68 | **Fontes servidas pelo próprio app** (arquivos woff2 no build, sem CDN do Google), só com os pesos da D67 | Funciona offline no PWA (D02 e D57), e a licença OFL permite | Decidida |
| D75 | **Cores de matéria:** acrescentar amarelo `#F2C14E`, ciano `#35C7D1` e cinza-lavanda `#A7AEC4` às 5 atuais, para 8 matérias. As três novas dão 7,8:1 a 10,3:1 com a tinta; o roxo atual dá 5:1 | Roxo forte e roxo quase não se diferenciam. Medido em `diretrizes-visuais.md` 6.1 | Decidida (usuário, 07/11/2026) |
| D76 | **Filtro inicial da matéria:** abre no bimestre mais recente com aulas, não em "Todas" | Leva direto à aula atual; "Todas" continua na régua | Decidida (usuário, 07/11/2026) |
| D77 | **Teclas do Treino:** Espaço vira o cartão; 1 a 4 respondem (Errei, Difícil, Bom, Fácil). Em `teclado.md` | Mãos ficam no teclado durante a revisão | Decidida (usuário, 07/11/2026) |
| D78 | **Alt N:** deixa de ser "Cartão novo" e passa a ser "novo item no bloco em foco" (cartão, lembrete ou aula, conforme o bloco). Substitui a linha "Alt N" de `teclado.md` | Uma tecla de criar serve a todos os blocos, sem tecla por tipo | Decidida (usuário, 07/11/2026) |
| D70 | **Dois tipos de campo:** texto (setas e Enter são do texto, D19) e navegável (lista, régua, grade: setas e H J K L andam entre itens, Enter faz a ação principal). Amplia a D19 | Régua e lista não tinham nível próprio. Detalhe em `diretrizes-visuais.md` 2.2 | Decidida (delegada pelo usuário em 07/11/2026) |
| D71 | **Regras das setas:** cada controle usa um eixo; a seta do outro eixo e a seta na borda saem para o vizinho; segurar a tecla não atravessa a borda; controle interno não dá a volta | Liga régua, lista e prévia sem subir de nível. Complementa a D64 | Decidida (delegada pelo usuário em 07/11/2026) |
| D72 | **Esc com tela-mãe:** janela → menu ⋮ → campo → bloco → tela-mãe → menu de telas. O foco volta ao item de origem. Amplia a D18 | Matéria aberta precisa voltar à lista de matérias | Decidida (delegada pelo usuário em 07/11/2026) |
| D73 | **Mosaico livre** (Mesa, Hub; dwindle, D10) e **mosaico fixo** (Acervo, Treino, Agenda, Configs; grade CSS, mesmo foco, **vizinhos declarados**). A proibição de novos blocos vale para a Mesa | Teste no `neighbor`: com a lista mais estreita que a prévia, ↓ na régua cai na prévia | Decidida (delegada pelo usuário em 07/11/2026) |
| D74 | **Diretrizes visuais:** `diretrizes-visuais.md` e `src/ui/styles/tokens.css` valem para toda tela. Um só anel forte mostra onde as teclas agem; seleção é preenchimento; caixa-alta só em texto do app e nome de matéria | Caixa-alta troca `TNF-α` por `TNF-Α`. Ajusta a regra de texto do usuário da D67 | Decidida (delegada pelo usuário em 07/11/2026) |
| D79 | **Celular, um bloco por vez:** barra embaixo troca o bloco; ela segue o foco do teclado. Bloco sem título nem rótulo (régua, busca) fica sempre à vista, porque filtra o bloco da vez | Coluna que rola misturava tudo; régua sozinha numa página não serve para nada | Decidida (Claude, 07/11/2026; revisar com o usuário) |
| D80 | **Escolha do Treino:** régua de matérias (Todas ou uma), lista do que treinar (tudo, bimestres e, na matéria, cada aula) e Resumo. Enter na lista marca; com "tudo" ativo, marcar escolhe só aquela linha; marcar outras soma. Foco nasce em Iniciar com a última escolha. Sem vencidos, Iniciar vira Adiantar | Pedido do usuário (todos, bimestre, matéria, bimestres de uma matéria, uma aula). O de sempre custa 1 tecla | Decidida (Claude, 07/11/2026; revisar com o usuário) |
| D81 | **Cartões na Mesa:** abas Novo e Salvos. Novo é texto com as marcas do legado (`@` frente, `#`, `-`, `1.`, `+`, `--`, `?`, `**`, `==`) e prévia ao lado. Alt N abre um cartão de qualquer bloco da Mesa; Ctrl Enter salva só os completos. Rascunho fica só em memória até salvar | Criar cartão sem largar a aula; texto puro, sem HTML do usuário | Decidida (Claude, 07/11/2026; revisar com o usuário) |
| D82 | **Agenda = versão B (semana + prévia):** régua de visões no topo; Semana e Grade com horas (dias de segunda a domingo, provas e entregas no alto do dia, só a aula de agora em cor cheia); à direita, Prévia do item em foco, Matérias (filtro de uma escolha) e A completar. Nas colunas, ↑ ↓ andam no dia e ← → trocam de dia, pulando dia vazio. Alt PgUp PgDn trocam a semana ou o mês. Tab: régua, conteúdo, Prévia, Matérias, A completar (o filtro vem depois do conteúdo, exceção à diretriz 8.4, porque é pouco usado) | Escolhida entre A e B em `docs/prototipos/agenda-semana.html`. Lembretes saem da Agenda e ficam no Alt I | Decidida (usuário, 07/11/2026) |
| D83 | **Troca de tela sem animação.** Os blocos não fazem zoom ao chegar na tela, só ao serem reabertos com a tela aberta | Zoom e deslize foram testados e não agradaram; troca instantânea é mais rápida no uso com Alt 1 a 6 | Decidida (usuário, 07/11/2026) |

## Planos das Etapas 7 a 13 (Opus, 07/11/2026)

| ID | Decisão | Motivo | Status |
|---|---|---|---|
| D84 | **Espelho de leitura:** a tela lê um `StudyData` carregado do banco. `write` compara antes e depois (`diffStudy`) e manda só as linhas mudadas ao Worker, com fila de 300 ms. Se falhar, abre a tela de erro e recarrega do banco. **Refina a D26:** o espelho é cópia só de leitura, nunca fonte | As telas já usam `Storage` em sincronia. Ler do Worker a cada tecla obrigaria refazer todas as telas | Decidida (usuário, 07/11/2026) |
| D85 | `note_versions` ficam **só no aparelho** (não sincronizam) e só entram no espelho as da aula aberta. Antes de uma Anotação recebida sobrescrever a local, a local vira versão | Dezenas de MB sem uso no espelho e na nuvem. A rede de segurança da D34 continua valendo nos dois aparelhos | Decidida |
| D86 | **Exceção de camada:** só `src/core/study/fsrs.ts` importa `ts-fsrs` | Biblioteca pura, sem E/S. Mantém a D43 (função fina) sem mover regra para `data/` | Decidida |
| D87 | **Derivação da chave das Notas: PBKDF2-SHA256 com 600 000 iterações** (gravadas na `vault`) e frase de pelo menos 12 caracteres. **Fecha a D37** | Nativo no navegador e no Node dos testes, sem dependência. A frase própria (D36) compensa a vantagem do Argon2 | Decidida |
| D88 | **Formato da sincronização:** cada aparelho só grava os próprios arquivos (`log` numerado e `base` compactada) na pasta do app. Os PDFs vão em `blob.<sha256>` | Nenhum aparelho sobrescreve o de outro, então não há corrida de gravação no Drive. A junção pela D29 dá o mesmo resultado em qualquer ordem | Decidida |
| D89 | **Banco (Etapa 7):** `@sqlite.org/sqlite-wasm` 3.54.1 (SQLite 3.54.1), com `opfs-sahpool` num Worker. Colunas `order`, `start` e `end` viram `sort_order`, `start_time` e `end_time` (palavras do SQL). Sem chaves estrangeiras: a exclusão é lógica e a ordem de chegada na sincronização não é garantida | Confirma D21 (sahpool funciona no Chrome; `.wasm` no precache) | Decidida (Claude, 07/11/2026) |
| D90 | **Fila e falhas:** a gravação sai 300 ms depois da primeira mudança da fila, ou na hora ao trocar de tela, ocultar (`visibilitychange`, `pagehide`) e exportar. Erro de gravação abre a tela de erro; nunca cai em memória. Uma aba só (Web Locks). `?exemplo` usa outro banco e outra trava | Segue D22 a D25 e D84. `?erro=<código>` força cada tela de erro, só no dev | Decidida (Claude, 07/11/2026) |
| D91 | **SQL testado em Node:** o `@sqlite.org/sqlite-wasm` roda em Node, em memória; `src/data/sql.test.ts` aplica a migração 001 e faz ida e volta de todas as tabelas | Fecha o "A VERIFICAR" do plano da Etapa 7 | Decidida (Claude, 07/11/2026) |
| D92 | **Renomear e excluir:** pelo menu ⋮ (Alt O) do bloco, no item selecionado. Excluir matéria leva pastas, aulas, cartões, provas, aulas da Agenda e Grade; excluir pasta mantém as aulas, sem pasta; excluir aula leva os cartões e solta a Agenda. Cartões se editam em janela (frente e verso). Sem confirmação: aviso com **Desfazer** por 10 s, **Alt Z** (regras G8) | No banco a exclusão é lógica (D84). A Lixeira para ver e restaurar depois fica no backlog | Decidida (Claude, 07/11/2026; revisar com o usuário) |
| D93 | **Barra de formatação por teclado:** Alt T e Alt B, nas Anotações, focam o primeiro botão da barra (a única); Alt , e Alt . andam entre eles; Enter aplica e devolve o cursor ao texto | Fecha o item do backlog | Decidida (Claude, 07/11/2026) |
| D94 | **Barra de formatação em modo fantasma (substitui D93):** nasce oculta; Alt T mostra ou oculta nas Anotações; oculta, selecionar texto abre uma bolha com os mesmos botões; Alt B vai à barra, mostrando-a se preciso; Alt , e Alt . andam entre os botões. Preferência guardada no aparelho (localStorage, como o tema) | Pedido do usuário, igual ao app antigo (Alt T, `barraEd`) | Decidida (usuário, 07/11/2026) |
| D95 | **Anexos (Etapa 10):** `pdfjs-dist` 6.5.438 (dependência nova), carregado só ao abrir o primeiro PDF; o worker dele entra no precache (`mjs`). Bytes em `.ohara2-files/<sha256>` (exemplo: `-exemplo`); tabela `files` na migração 002, que também remove `lessons.slides` | Plano da Etapa 10 (D31). Um conjunto de slides por aula: anexar outro substitui e apaga os bytes se ninguém mais os usa | Decidida (Claude, 07/11/2026) |
| D96 | **Página atual por aparelho:** `device_state` carregado no `open` e gravado pela mesma fila (`Change` `device`); a UI usa `getDeviceState`/`setDeviceState`. Excluir aula ou matéria leva as linhas de anexos, mas os bytes órfãos ficam (limpeza no backlog) para o Desfazer funcionar | Segue D28 | Decidida (Claude, 07/11/2026) |
| D97 | **Limpeza de bytes órfãos** ao abrir o app (depois da tela pronta) e pelo botão em Configs. **Importar banco:** o Worker confere o arquivo numa cópia de teste (cabeçalho SQLite, tabelas do Ohara, versão ≤ a do app) antes de trocar o banco; depois a página recarrega e as migrações rodam. O backup não leva os PDFs. A Etapa 12 deve dar novo `device_id` a banco importado | Pedido do usuário (07/11/2026) | Decidida |
| D98 | **Notas do boletim (Etapa 13):** tela como **quinta visão da régua da Agenda** (Notas) e comando "Notas do boletim" na Paleta; trava ao sair da tela, ao ocultar o app e com 2 min sem uso. Migração `003_notas.sql` (o plano dizia 005: os números 003 e 004 ficaram livres). `vault` e `secret_records` entram no espelho só como texto cifrado; a tela decifra. A vault nova (primeira vez ou recuperação) só é gravada depois de "Anotei o código" | Pedido do usuário para avaliar (07/11/2026) | Decidida (Claude) |
| D99 | **Regras de cálculo:** reposição só tira a original quando tem nota; reposição vale pelo próprio peso; bônus de item soma na nota do item, de bimestre e de semestre soma depois da média, todos com o teto do esquema. Período sem nota sai da conta e marca "parcial". Excluir matéria **não** apaga as notas dela (sem a chave não dá); ficam cifradas e sem uso | Plano da Etapa 13 deixava em aberto | Decidida (Claude; revisar com o usuário) |
| D100 | **Faltas (pedido do usuário, 07/11/2026):** presença mínima de 75% por matéria; aula = blocos de 1 h (duração arredondada, mínimo 1). Conta só as aulas da Grade e da Agenda que **já terminaram**, desde a data de "início das aulas" da matéria (`subjects.classes_from`, migração 004). Cada aula pode ser marcada Presente (sem registro), Falta (inteira ou algumas horas) ou **Cancelada** (feriado, professor ausente), que sai da conta. Tela "Faltas" no botão do topo, ao lado de Notas, e na Paleta | Resposta do usuário: "pelo que já aconteceu até hoje", com feriados e cancelamentos fora da conta | Decidida (usuário) |
| D101 | Tabela `attendance` (id, matéria, dia, hora de início, horas faltadas, cancelada), sincronizável e **sem cifra** (não é nota). Mostra "pode faltar mais N h": `25% do total − faltas`, em passos de meia hora | Faltas não são sigilosas como o boletim | Decidida (Claude) |
| D102 | **Cartão de provas do Hub (07 a 08/11/2026, pedido do usuário):** um cartão por dia, até 4 siglas em vagas fixas (passou de 4: 3 siglas + pílula neutra "+N"). Topo: "dia da semana · mês" à esquerda e "em X d" à direita; corpo: dia com zero à esquerda (Nunito 800, 66px) e siglas. Só sigla da matéria, nunca o nome. Faixa do topo **tonal nos dois temas** (`--mistura-faixa`: 40% de `--cor-destaque` no claro, 30% no escuro); só o dia mais próximo tem a faixa cheia de destaque e corpo igual aos outros. Rolagem horizontal a partir de 5 cartões (colunas de 220px). O cartão **escala com a altura do bloco** (container query): faixa de 44 a 72px, dia de 66 a 120px, vagas de 28 a 38px; a sobra fica entre o dia e as siglas (no PC a faixa ocupava metade do cartão). Revê a regra "sem tarja": a faixa continua, mas leve. | Decidida |
| D103 | **Tipo da atividade no cartão (pendente de dados):** dia só de prova não leva marca; trabalho e apresentação (T, A) entram numa **pílula única com as iniciais**, no canto de cima à direita do corpo, na cor da faixa (S2 do lab). Não está no app: `Exam` não tem tipo e o bloco só lista provas. Entra quando trabalhos e apresentações forem para o bloco (aí renomear "Provas"). Protótipo: `lab/provas-n.html`. Dia com prova e outro tipo: marca só o que não é prova. | Decidida, não aplicada |
| D104 | **Animação da barra do topo (08/11/2026, pedido do usuário):** só a barra anima na troca de tela (indicador, pulo do número e título; botões e sigla de cada tela não animam). Opção em Configs → Aparência e na Paleta: Deslizar (padrão), Gelatina ou Nenhuma; respeita movimento reduzido. Cada tela desenha a própria barra, então só a entrada anima. Mantém D83 | Os blocos e telas continuam sem animação | Decidida (usuário, 08/11/2026) |

---

## Pendências consolidadas

| Item | Quando |
|---|---|
| D33: conta Dropbox | Etapa 12, se o teste favorecer |
| D44: otimizador do FSRS no navegador | Depois da Etapa 11 (B06); a tabela `reviews` guarda o histórico para ele |

## Itens a verificar na Etapa 1

O Claude Code deve **confirmar as versões e a compatibilidade atuais** de TypeScript 6, Vite 8, Tiptap 3, vite-plugin-pwa 1.3 e ts-fsrs antes de fixá-las, e confirmar que o `opfs-sahpool` funciona no GitHub Pages. Se algo divergir, registra a troca aqui (D06, D07, D11, D12, D21, D43).
| D105 | **Foco visual dos blocos (08/11/2026, aplicado):** bloco em foco = contorno de 4px por dentro na cor `--cor-contorno-foco` (70% de `--cor-bloco-ativo` sobre o cartão, sólida, definida em `tokens.css`); dentro do bloco = borda de 2px (D1). Item de lista em foco (`anel-interno`) usa o mesmo contorno; o anel escuro fica só no menu, botões e régua. Título do bloco passa à cor ativa. Na Mesa o título vira ícone (Slides, Anotações, Cartões), com nome em `aria-label`/`title`. O fundo "sobe para o cartão" do item (I3a) não foi forçado em base.css: cada lista tem seu próprio fundo de seleção. | Decidida |
| D106 | **Foco no bloco de provas do Hub (08/11/2026, versão E do lab `foco-provas.html`):** o bloco não tem contorno nem anel de cartão. No nível bloco, todas as faixas de cima dos cartões acendem na `--cor-bloco-ativo`; dentro, só a faixa do cartão em foco, com fio de 2px por dentro. Todos os cartões têm a mesma faixa tonal (o primeiro deixou de ter faixa de destaque). | Decidida (usuário) |
| D107 | **Foco em controles pequenos (08/11/2026, usuário):** anos e bimestres do Acervo, modos e dias da Agenda, réguas, botões Abrir e Iniciar usam contorno de **2px por dentro** na `--cor-contorno-foco` (classe `anel-fino`, via `ring="anel"` do `NavItem`). Itens de lista seguem em 4px. O anel escuro de 3px fica só no número do menu. | Decidida (usuário) |
| D108 | **Revisão visual do Acervo (08/11/2026, usuário aceitou as recomendações):** foco do cartão de matéria = 4px de `--cor-foco` por dentro (escura no claro, clara no escuro); cartão com sigla grande e fina, nome pequeno em caixa alta e rodapé com aulas e "prova em N d" (cor cheia no claro, mais funda com texto claro no escuro). "+ Nova matéria/pasta" = pílula tonal só com o "+" desenhado (N1b). Réguas de anos e pastas **sem contagem** nas pílulas (uma linha só; só "arquivado" fica no ano): a contagem já está no título do bloco de aulas e no cartão. Lista de aulas com seleção suave e foco de 4px; prévia com placeholder de capa suave. Bloco sem fundo (grade) não ganha contorno de bloco. | Decidida (usuário) |
| D109 | **Espessura do foco por tamanho (08/11/2026, usuário):** peças grandes (bloco, cartão de matéria) usam contorno de 4px por dentro; item de lista e controle pequeno usam 2px por dentro. Revê o 4px de itens de lista da D105 (apertava o texto nos itens de 56px). Itens de lista seguem em 56px. | Decidida (usuário) |
| D110 | **Tela inicial do Treino (08/11/2026, usuário escolheu a grade com teto):** coluna de blocos (Resumo com o número do dia e Iniciar, régua de período, busca, grade de disciplinas); "Ajustar o que treinar" abre a lista antiga ao lado. A grade mostra "Todas" e as disciplinas com cartões vencidos primeiro, até 14 peças em 2 linhas; o resto fica atrás da busca (sigla ou nome, sem acento). A régua de período usa as pastas que já existem (bimestres), sem conceito novo de "bimestre atual". Escolher uma disciplina zera o período e as marcas; só a última escolha fica lembrada. Sem tecla nova: a busca usa Alt F, como no Acervo. | Decidida (usuário) |
| D111 | **Fim do contorno preto (08/11/2026, usuário):** a barra do topo (1 a 6, Faltas, Notas, ?), os botões da barra de formatação das Anotações e o cartão de matéria do Acervo usam o mesmo contorno dos blocos: `--cor-contorno-foco` por dentro (2px nos controles, 4px no cartão de matéria). Na aba atual do topo, que é preenchida, o contorno de 2px usa `--cor-cartao` para aparecer. Revê o anel escuro do menu (D107) e o foco em `--cor-foco` do cartão de matéria (D108). | Decidida (usuário) |
| D112 | **Foco do cartão de matéria do Acervo (08/11/2026, estilo macOS, em teste):** anel fino de 2px afastado 4px do cartão, no tom da própria cor da matéria (mais fundo no claro, cor viva no escuro), com um brilho difuso embaixo; o cartão sobe 3px em 180 ms. Exceção às regras de sombra e movimento, só para esta peça; sem movimento com toque ou com "reduzir movimento". Substitui o foco por dentro da D111 nesta peça. | Decidida (usuário escolheu o refinamento "fino e limpo") |
| D113 | **Notas em pontos (08/11/2026, usuário):** cada avaliação tem **nota máxima** (padrão 10) e a nota digitada é a que o professor deu; cada bimestre tem **valor em pontos** no esquema da matéria (padrão 5 + 5; Propedêutica 3 + 7), no lugar do % de hoje. Regra única: bimestre = (tirado ÷ valia) × valor do bimestre; semestre = soma dos bimestres, sempre sobre 10; ano = média dos semestres (pesos editáveis). O peso da avaliação é, por padrão, a própria nota máxima. Avaliação pendente continua fora da conta. "Abaixo da meta" olha o **percentual**, nunca o número cru. Boletim em pontos; o máximo ("de 3") aparece só nos cabeçalhos. Soma ≠ 10 ou avaliações acima do valor do bimestre: **avisa, não bloqueia** | Professores dão a nota pensando no valor do bimestre (ex.: prova de 3,0 vale 3,0, não 10 com peso 3). Itens já gravados ganham máximo 10 e mantêm o resultado; como são cifrados, a migração é na leitura e regravação, não em `.sql` | Decidida (usuário) |
| D114 | **Layout da tela de Notas (08/11/2026, usuário):** barra do topo com ano, Aberto e Agenda; régua de matérias em bloco próprio com **cápsulas** (sigla colorida + média na mesma peça, "Boletim geral" na frente, busca `/`); por matéria: cartão com cabeçalho e **faixas** (cada semestre abraça seus 2 bimestres, o ano em faixa de marca), avaliações do bimestre e "Quanto preciso tirar" (em pontos). Boletim geral = A1 refinada: faixas contínuas, total em cápsula, coluna "Falta no 4º bim.", resumo numa faixa só com ajuste da meta, situação **atual** (Na meta, Atenção, Sem notas). Janelas simples (esquema: modelos 5 + 5, 3 + 7, Outro; avaliação: nome, vale, nota; resto em "Mais opções"). Protótipos: `lab/notas-6.html`, `notas-7.html`, `notas-9.html`, `notas-10.html` | Redesenho pedido pelo usuário a partir de referências; sério e sem poluição. Implementação ainda não feita | Decidida (usuário), a implementar |
| D115 | **Nova identidade visual: Ardósia (08/11/2026, usuário):** camadas cinza-azuladas sem contorno, ação e aba atual em grafite (`--cor-aba-ativa`), cor só na marca da matéria. Paleta C em `paletas.css` (Papel Frio fica como alternativa). Layout e filosofia de foco continuam os do app (D105 a D112). **Marca da matéria = M2:** pílula com a sigla dentro. **Sem círculos:** pontos, "hoje" e caixinhas viram pílulas alongadas (ponto 20×10, hoje 52×36, caixinha 40×24). Bancadas: `lab/hub-novo.html`, `lab/agenda-nova.html`. Aplicação em `src/` por tela, nas próximas etapas. |
