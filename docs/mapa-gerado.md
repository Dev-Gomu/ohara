<!-- Gerado por `node scripts/mapa.mjs`. Não editar à mão. -->
# Mapa gerado do projeto

## Docs (títulos # e ## com a linha)

### docs/backlog.md
- L1 # Ohara: backlog
- L12 ## Adiados (entram no fim do projeto, nesta ordem)
- L20 ## Condicionais e técnicos
- L29 ## Conceitos a esclarecer
- L34 ## Cortados (não voltam sem decisão explícita do usuário)
- L40 ## Ideias novas

### docs/decisoes-arquivo.md
- L1 # Decisões substituídas

### docs/decisoes.md
- L1 # Ohara: registro de decisões
- L12 ## 1. Plataforma e processo
- L22 ## 2. Linguagem, build e interface
- L35 ## 3. Teclado
- L47 ## 4. Dados e armazenamento
- L60 ## 5. Sincronização
- L71 ## 6. Notas em segredo
- L86 ## 7. Estudo
- L93 ## 8. Arquitetura de código
- L101 ## 9. Qualidade
- L110 ## 10. Trabalho com o Claude Code
- L119 ## Registro da Etapa 1 (05/11/2026)
- L151 ## Planos das Etapas 7 a 13 (Opus, 07/11/2026)
- L179 ## Pendências consolidadas
- L186 ## Identidade única e paletas (12/11/2026)

### docs/diretrizes-visuais-referencia.md
- L1 # Ohara: diretrizes visuais
- L8 ## 1. Princípio
- L21 ## 2. Modelo de navegação
- L86 ## 3. Foco e estados
- L152 ## 4. Mosaicos
- L184 ## 5. Padrões de layout
- L221 ## 6. Linguagem visual
- L278 ## 7. Peças: quando usar cada uma
- L308 ## 8. Checklist de cada proposta
- L351 ## 9. Modelo de proposta
- L369 ## 10. A confirmar

### docs/diretrizes-visuais.md
- L1 # Ohara: diretrizes visuais (resumo de uma página)
- L7 ## Princípio
- L10 ## Checklist

### docs/estado.md
- L1 # Estado do Ohara (atualizado em 12/11/2026)
- L5 ## Onde estamos
- L10 ## Próximo passo
- L13 ## Esperando o usuário
- L17 ## Iniciativas abertas (máx. 3)

### docs/mapa.md
- L1 # Mapa do projeto
- L7 ## Se o assunto é X, abra Y

### docs/regras.md
- L1 # Regras herdadas do legado: Agenda e Grade
- L7 ## 1. Papel da Agenda
- L20 ## 2. Cadastro de itens
- L33 ## 3. Grade (horário semanal)
- L48 ## 4. Teclado da Agenda
- L55 ## 5. Notas (só o que toca a Agenda)

### docs/teclado.md
- L1 # Ohara: teclado
- L8 ## Regras de uso
- L19 ## Tabela final
- L80 ## Decisões desta etapa
- L86 ## Testado (PC, Linux, Chrome instalado como app)
- L92 ## Testado no tablet (Galaxy Tab S7 FE, na horizontal)
- L98 ## Checkpoint da Etapa 6 (07/11/2026)
- L102 ## Pendências

### docs/telas.md
- L1 # Ohara: telas
- L6 ## Comum a todas
- L11 ## 1. Hub (Alt 1)
- L18 ## 2. Mesa (Alt 2)
- L25 ## 3. Acervo (Alt 3)
- L28 ## 4. Treino (Alt 4)
- L31 ## 5. Agenda (Alt 5)
- L34 ## 6. Configs (Alt 6)
- L37 ## Janelas de consulta (Paleta)

### docs/visao.md
- L1 # Ohara: visão do produto
- L11 ## 1. O que é
- L17 ## 2. Para quem
- L26 ## 3. Problema que resolve
- L34 ## 4. Critérios que decidem tudo
- L47 ## 5. O que o app tem
- L66 ## 6. O que não faremos
- L80 ## 7. Como saberemos que está bom
- L93 ## 8. Limites conhecidos
- L97 ## 9. Glossário

### docs/plano/_indice.md
- L1 # Ohara: fila atual

### docs/plano/etapa-11.md
- L1 # Etapa 11: Treino real com FSRS
- L6 ## Objetivo
- L9 ## Desenho
- L23 ## Fila da sessão (regras, em `session.ts`)
- L32 ## Configs
- L35 ## Testes obrigatórios (fuzz desligado e `now` fixo)
- L44 ## Critérios de pronto
- L49 ## Roteiro de 5 minutos

### docs/plano/etapa-12.md
- L1 # Etapa 12: Sincronização
- L6 ## Antes de começar (o usuário faz, com o Sonnet guiando)
- L12 ## Objetivo
- L15 ## Desenho (D88)
- L31 ## Interfaces (D47)
- L37 ## Drive contra Dropbox (D32, D33)
- L40 ## Tela
- L44 ## Testes obrigatórios
- L51 ## Critérios de pronto
- L56 ## Roteiro de 5 minutos

### docs/plano/faxina.md
- L1 # Plano de faxina e retomada (12/11/2026)
- L7 ## Por que (resumo das medições, 44 sessões)
- L13 ## Decisões do usuário (12/11/2026)
- L21 ## Sessão 1: faxina de papel (Sonnet). FEITA em 12/11/2026. Não toca em `src/`
- L35 ## Sessão 2: faxina visual (Sonnet)
- L47 ## Sessão 3: três paletas (Fable na bancada, Sonnet no código). FEITA em 12/11/2026 (D132)
- L52 ## Sessão 4: publicação (Sonnet)
- L57 ## Sessão 5: Etapa 11, Treino com FSRS (Opus)
- L61 ## Sessão 6: Etapa 12, sincronização (Opus, modo de plano)
- L66 ## Sessão 7 em diante: varredura (Sonnet)
- L70 ## O que é só do usuário

### docs/plano/roteiro-5min-publicacao.md
- L1 # Roteiro de 5 minutos: antes de publicar no main

## Código em src/ (primeira linha de comentário ou primeiro export)

- src/core/appInfo.test.ts: (sem comentário nem export no topo)
- src/core/appInfo.ts: Prefixo único do app novo. O legado usa chaves "ohara-" e "ohara." no mesmo domínio,
- src/core/db/backup.test.ts: (sem comentário nem export no topo)
- src/core/db/backup.ts: Só aceita backup do próprio Ohara e de uma versão que este app sabe abrir.
- src/core/db/db.test.ts: (sem comentário nem export no topo)
- src/core/db/diff.ts: Compara primeiro por referência: digitar nas Anotações mexe em um item só.
- src/core/db/errors.ts: Traduz o erro do navegador ou do SQLite. Na migração e na gravação, o que não for reconhecido
- src/core/db/hlc.ts: Relógio híbrido (D29): ordena como texto e nunca anda para trás, mesmo se o relógio do aparelho voltar.
- src/core/db/migrations.ts: O SQL chega já como texto: o core não importa arquivo.
- src/core/db/protocol.ts: Estado só deste aparelho (D28): página atual de cada aula etc. Não sincroniza.
- src/core/db/rows.ts: `export type SqlValue = string | number | null;`
- src/core/db/specs.ts: Falso: fica no aparelho, é apagada de verdade e não sincroniza (D85).
- src/core/grades/grades.test.ts: (sem comentário nem export no topo)
- src/core/grades/grades.ts: Regras N1 e N2 de regras.md. Puro: os dados vêm decifrados da tela.
- src/core/keyboard/actions.ts: 'field' é o campo de texto; 'nav' é o campo navegável: lista, régua ou grade (D70).
- src/core/keyboard/focus.test.ts: a à esquerda, ocupando a altura; b em cima e c embaixo, à direita.
- src/core/keyboard/focus.ts: Item escolhido em cada campo navegável. Sobrevive à saída do bloco: a seleção permanece.
- src/core/keyboard/keyTools.ts: Lista as combinações repetidas: code + modificadores + nível só pode aparecer uma vez.
- src/core/keyboard/keys.test.ts: Transcrito de docs/teclado.md: a tabela não pode perder nem ganhar tecla em silêncio.
- src/core/keyboard/keys.ts: a = Alt, c = Ctrl, s = Shift
- src/core/keyboard/nav.test.ts: (sem comentário nem export no topo)
- src/core/keyboard/nav.ts: 'columns': colunas de tamanhos diferentes, como os dias da semana na Agenda.
- src/core/keyboard/neighbor.test.ts: (sem comentário nem export no topo)
- src/core/keyboard/neighbor.ts: Folga para vãos e arredondamento: tocar a borda ainda conta como estar daquele lado.
- src/core/keyboard/resolve.test.ts: (sem comentário nem export no topo)
- src/core/keyboard/resolve.ts: No ABNT2 o AltGr digita ¹ ² ³ e /, e pode chegar como Ctrl+Alt. Acentos e o teclado
- src/core/mosaic/tree.test.ts: a e c à esquerda, um sobre o outro; b à direita
- src/core/mosaic/tree.ts: `export interface Leaf`
- src/core/secret/codec.ts: RFC 4648: 32 letras, então um byte & 31 é uniforme, sem viés.
- src/core/secret/vault.test.ts: Poucas iterações só nos testes, para não demorar; o padrão de verdade é conferido abaixo.
- src/core/secret/vault.ts: D87: PBKDF2-SHA256 com 600 000 iterações. O valor fica gravado na vault para poder subir depois.
- src/core/study/agenda.test.ts: (sem comentário nem export no topo)
- src/core/study/agenda.ts: A semana mostra de 7h às 19h; aula fora disso alarga a faixa em vez de sumir.
- src/core/study/attendance.test.ts: 2026-11-02 é segunda-feira.
- src/core/study/attendance.ts: Aprovação por frequência: pelo menos 75% de presença (D100).
- src/core/study/cardText.test.ts: (sem comentário nem export no topo)
- src/core/study/cardText.ts: Texto do editor de cartões. Cada cartão começa numa linha "@ frente"; as linhas
- src/core/study/create.test.ts: (sem comentário nem export no topo)
- src/core/study/create.ts: `export const SUBJECT_COLORS = 8;`
- src/core/study/dates.test.ts: (sem comentário nem export no topo)
- src/core/study/dates.ts: Datas de estudo são dias do calendário, sem fuso: "2026-11-07".
- src/core/study/edit.test.ts: (sem comentário nem export no topo)
- src/core/study/edit.ts: A aula na Agenda acompanha o título e a data.
- src/core/study/files.test.ts: (sem comentário nem export no topo)
- src/core/study/files.ts: Limite por arquivo (D31).
- src/core/study/fixtures.ts: Título, dias antes de hoje, pasta (1, 2 ou 0 para sem pasta)
- src/core/study/ics.test.ts: (sem comentário nem export no topo)
- src/core/study/ics.ts: O formato limita a linha a 75 caracteres; a continuação começa com espaço.
- src/core/study/queries.test.ts: (sem comentário nem export no topo)
- src/core/study/queries.ts: `export const ALL_FOLDERS = 'todas';`
- src/core/study/scope.test.ts: (sem comentário nem export no topo)
- src/core/study/scope.ts: O que entra no treino. Sem matéria, as linhas são os bimestres de todas as matérias,
- src/core/study/search.test.ts: (sem comentário nem export no topo)
- src/core/study/search.ts: Matéria abre a própria matéria; aula e cartão abrem a aula na Mesa.
- src/core/study/session.test.ts: (sem comentário nem export no topo)
- src/core/study/session.ts: A data da próxima revisão vem do FSRS na Etapa 11. Aqui só se decide a fila da sessão.
- src/core/study/storage.ts: A tela só conhece esta interface: o banco (data/) e a memória (testes) a implementam.
- src/core/study/subjectTiles.test.ts: (sem comentário nem export no topo)
- src/core/study/subjectTiles.ts: Peça da grade de disciplinas do Treino. id nulo é "Todas".
- src/core/study/types.ts: Posição na paleta, nunca o valor da cor: o tema pode mudar sem mexer nos dados.
- src/core/study/versions.test.ts: (sem comentário nem export no topo)
- src/core/study/versions.ts: D34: guarda uma versão a cada 5 minutos, até 50 por aula. Grava a versão anterior à edição,
- src/data/client.ts: `export class DbError extends Error`
- src/data/dbName.test.ts: (sem comentário nem export no topo)
- src/data/dbName.ts: `export const DB_NAME = prefixed('db');`
- src/data/dbStorage.ts: Chamado só em banco novo; no modo exemplo devolve os dados fictícios.
- src/data/lock.ts: Uma aba só por banco: o OPFS não aceita dois escritores. A trava dura até a aba fechar.
- src/data/migrationList.ts: `export const MIGRATIONS: readonly Migration[] = [`
- src/data/sql.test.ts: (sem comentário nem export no topo)
- src/data/sql.ts: Fatia mínima do SQLite que o app usa: o Worker e os testes em Node a implementam.
- src/data/worker.ts: Fica pronto assim que o pool existe, para o export funcionar mesmo se a migração falhar.
- src/env.d.ts: (sem comentário nem export no topo)
- src/main.tsx: Modo exemplo (?exemplo): outro banco, preenchido com dados fictícios. Só para testes e dev.
- src/ui/components/Block.module.css: Só o bloco com o cursor acende; os outros recuam para o fundo (diretrizes 3.3).
- src/ui/components/Block.tsx: Bloco que o celular mostra agora. As telas maiores ignoram (D79).
- src/ui/components/BlockIcon.tsx: `export type IconName = keyof typeof PATHS;`
- src/ui/components/Button.module.css: Sobre azul cheio o cursor ganha um segundo aro, para não sumir.
- src/ui/components/Button.tsx: 'primary': azul cheio, um por bloco. 'quiet': só texto, para ajuste menor.
- src/ui/components/CardBack.module.css: (sem comentário nem export no topo)
- src/ui/components/CardBack.tsx: Verso do cartão já formatado: seção, listas e marcas clínicas (+ a favor, − contra, ? dúvida).
- src/ui/components/Cards.module.css: Dia de avaliação: peça recuada com os bloquinhos das matérias.
- src/ui/components/Cards.tsx: Texto do app, já pronto: "prova", "trabalho", "apres.".
- src/ui/components/Controls.module.css: Em coluna, o flex: 1 esmagaria ou esticaria o campo.
- src/ui/components/Controls.tsx: Campo de busca e de formulário. As teclas são do texto: o listener cuida disso pelo nível.
- src/ui/components/DayItem.module.css: (sem comentário nem export no topo)
- src/ui/components/DayItem.tsx: Posição da cor da matéria: tinge o cartão inteiro (D128).
- src/ui/components/FaultCell.module.css: Bolinha de notificação no canto superior direito da sigla; o anel vem da cor do bloco.
- src/ui/components/FaultCell.tsx: Horas faltadas e limite até agora; null enquanto não houve aula.
- src/ui/components/Filter.module.css: (sem comentário nem export no topo)
- src/ui/components/Filter.tsx: Filtro de uma escolha por matéria: marca na cor da matéria sempre à vista (serve de legenda);
- src/ui/components/Grades.module.css: ---------- 1. Célula de nota ----------
- src/ui/components/Grades.tsx: Peças de Notas aprovadas nos degraus 1 a 3 (D121 a D124). Só desenho: as contas vêm da tela.
- src/ui/components/Island.module.css: O ícone acompanha o tamanho do número.
- src/ui/components/Island.tsx: Ilha: agrupa controles na barra do topo (telas, nível, módulos).
- src/ui/components/Key.module.css: Quem hospeda a tecla pode trocar o fundo e o relevo (botão principal, ilha).
- src/ui/components/Key.tsx: Tecla: a mesma pecinha em todo lugar que ensina um atalho (diretrizes 6.6). Nunca clicável sozinha.
- src/ui/components/ListItem.module.css: Largura fixa: as horas alinham de uma linha para a outra.
- src/ui/components/ListItem.tsx: Aula que já aconteceu: título apagado, continua navegável.
- src/ui/components/NavItem.tsx: 'anel' = controle pequeno (contorno fino de 2px); 'anel-interno' = item de lista (4px);
- src/ui/components/Pill.module.css: (sem comentário nem export no topo)
- src/ui/components/Pill.tsx: Matéria: só a sigla, sobre a cor guardada como posição.
- src/ui/components/Preview.module.css: Só o corpo rola: título e ações não pulam ao trocar de item.
- src/ui/components/Preview.tsx: Linha de apoio: hora, matéria, contagens.
- src/ui/components/Ruler.module.css: "+" desenhado com duas barras: o glifo de texto desalinhava dentro da pílula.
- src/ui/components/Ruler.tsx: Criar fica no fim da régua, é peça comum e não seleciona.
- src/ui/components/ScreenIcon.tsx: (sem comentário nem export no topo)
- src/ui/components/Target.tsx: Onde a peça vive: `nav` liga ao teclado (campo navegável); sem ele, a tela informa
- src/ui/components/Toggles.module.css: O alvo de toque ocupa a altura inteira da ilha.
- src/ui/components/Toggles.tsx: Grupo de alternadores ou de abas: a mesma ilha recuada da barra do topo.
- src/ui/components/Window.module.css: (sem comentário nem export no topo)
- src/ui/components/Window.tsx: O Esc é do listener: ele fecha pelo estado, e o React Aria nem chega a ver a tecla (D08).
- src/ui/faltas/Faltas.tsx: (sem comentário nem export no topo)
- src/ui/faltas/summary.ts: Horas faltadas e o limite até agora; null enquanto não houve aula.
- src/ui/keyboard/bars.ts: Barras de um bloco: a de cima é o cabeçalho (abas, ferramentas) e a de baixo é o rodapé
- src/ui/keyboard/listener.ts: Painel flutuante de um campo (a bolha das Anotações): tocar nele mantém o cursor no texto.
- src/ui/keyboard/store.ts: Devolver false deixa a tecla seguir o caminho normal.
- src/ui/keyboard/useBlocks.ts: Cada tela declara seus blocos. Sem deps: a contagem de itens muda com o filtro.
- src/ui/mosaic/Mosaic.module.css: Ampliado cobre o mosaico sem desmontar os outros blocos: nada digitado se perde.
- src/ui/mosaic/Mosaic.tsx: (sem comentário nem export no topo)
- src/ui/mosaic/useMosaic.ts: O arranjo vive em memória até existir banco: o banco o guardará por aula e por aparelho.
- src/ui/notas/Notas.module.css: (sem comentário nem export no topo)
- src/ui/notas/Notas.tsx: `export function Notas()`
- src/ui/notas/NotasAberto.tsx: (sem comentário nem export no topo)
- src/ui/notas/forms.ts: `export function askSetup(): void`
- src/ui/notas/model.ts: Contas de tela de Notas: transforma itens e esquema nos números que as peças mostram (D123).
- src/ui/notas/session.ts: D41: a chave mestra só existe em memória e some depois de 2 minutos sem uso.
- src/ui/screens/acervo/Acervo.module.css: (sem comentário nem export no topo)
- src/ui/screens/acervo/Acervo.tsx: `export function Acervo()`
- src/ui/screens/acervo/AcervoHome.tsx: (sem comentário nem export no topo)
- src/ui/screens/acervo/SubjectView.tsx: (sem comentário nem export no topo)
- src/ui/screens/agenda/Agenda.module.css: (sem comentário nem export no topo)
- src/ui/screens/agenda/Agenda.tsx: (sem comentário nem export no topo)
- src/ui/screens/agenda/AgendaPreview.module.css: (sem comentário nem export no topo)
- src/ui/screens/agenda/AgendaPreview.tsx: `export interface PreviewAction`
- src/ui/screens/agenda/AgendaWeek.module.css: (sem comentário nem export no topo)
- src/ui/screens/agenda/AgendaWeek.tsx: Semana com horas: o dia e as provas no alto, as aulas na altura do horário.
- src/ui/screens/agenda/agendaData.ts: Vazio na Grade, que é regra semanal e não tem data.
- src/ui/screens/agenda/agendaForms.ts: (sem comentário nem export no topo)
- src/ui/screens/configs/Configs.module.css: (sem comentário nem export no topo)
- src/ui/screens/configs/Configs.tsx: `export function Configs()`
- src/ui/screens/configs/configsData.ts: `export interface Row`
- src/ui/screens/hub/Hub.module.css: (sem comentário nem export no topo)
- src/ui/screens/hub/Hub.tsx: Altura que as Provas precisam: cartão de 86 px mais a margem de 8 px dos dois lados.
- src/ui/screens/hub/HubBlocks.tsx: `export function ExamsBlock({ id, days }: { id: string; days: readonly AssessmentDay[] })`
- src/ui/screens/mesa/CardsBlock.module.css: (sem comentário nem export no topo)
- src/ui/screens/mesa/CardsBlock.tsx: O rascunho fica na memória da tela, por aula, até salvar (não sobrevive a fechar o app).
- src/ui/screens/mesa/Mesa.module.css: (sem comentário nem export no topo)
- src/ui/screens/mesa/Mesa.tsx: (sem comentário nem export no topo)
- src/ui/screens/mesa/NotesBlock.tsx: (sem comentário nem export no topo)
- src/ui/screens/mesa/SlidesViewer.tsx: (sem comentário nem export no topo)
- src/ui/screens/mesa/useNotesEditor.ts: `export function useNotesEditor(lessonId: string, html: string): Editor | null`
- src/ui/screens/treino/Inicio.module.css: Tela inicial do Treino: uma coluna de blocos no centro; "Ajustar" abre a lista ao lado.
- src/ui/screens/treino/TrainingChoice.tsx: `export function TrainingChoice({ onStart }: TrainingChoiceProps)`
- src/ui/screens/treino/TrainingSession.tsx: `export function TrainingSession({ session, onChange }: TrainingSessionProps)`
- src/ui/screens/treino/Treino.module.css: O cursor da lista não comanda nada: só aparece com o bloco ativo (diretriz 3.2).
- src/ui/screens/treino/Treino.tsx: `export function Treino()`
- src/ui/shell/ConsultWindows.module.css: (sem comentário nem export no topo)
- src/ui/shell/ConsultWindows.tsx: Janelas de consulta: olhar sem perder o lugar. Esc devolve ao ponto de origem.
- src/ui/shell/ErrorScreen.module.css: (sem comentário nem export no topo)
- src/ui/shell/ErrorScreen.tsx: (sem comentário nem export no topo)
- src/ui/shell/HelpWindow.module.css: (sem comentário nem export no topo)
- src/ui/shell/HelpWindow.tsx: `export function HelpWindow()`
- src/ui/shell/Loading.tsx: `export function Loading()`
- src/ui/shell/OptionsWindow.module.css: (sem comentário nem export no topo)
- src/ui/shell/OptionsWindow.tsx: Menu ⋮ do bloco. Setas e Enter ficam com o React Aria; o Esc é do listener (D18).
- src/ui/shell/Palette.module.css: (sem comentário nem export no topo)
- src/ui/shell/Palette.tsx: D13: React Aria, já presente no app. As setas e o Enter ficam com ele enquanto a janela
- src/ui/shell/PromptWindow.module.css: (sem comentário nem export no topo)
- src/ui/shell/PromptWindow.tsx: Formulário curto de qualquer tela. Enter envia, Esc cancela.
- src/ui/shell/ReminderWindow.tsx: `export function ReminderWindow()`
- src/ui/shell/ScreenFrame.module.css: (sem comentário nem export no topo)
- src/ui/shell/ScreenFrame.tsx: Falso quando um modo passageiro (Redimensionar) toma o lugar do indicador de nível.
- src/ui/shell/Shell.module.css: Tecla sobre o botão amarelo do aviso.
- src/ui/shell/Shell.tsx: (sem comentário nem export no topo)
- src/ui/shell/UndoBar.tsx: `export function UndoBar()`
- src/ui/shell/commands.ts: `export const CONSULT_WINDOWS = [`
- src/ui/shell/topAnimation.ts: Preferência de aparelho, como o tema: sem armazenamento vale o padrão.
- src/ui/shell/topTabs.ts: Como a barra do topo mostra as telas: só o número, número com ícone, só o ícone ou o ícone
- src/ui/study/actions.ts: `export function toggleReminder(id: string | undefined): void`
- src/ui/study/attach.ts: `export async function attach(`
- src/ui/study/download.ts: `export function downloadBytes(bytes: Uint8Array, filename: string): void`
- src/ui/study/editOptions.ts: `export function folderOptions(folder: { id: string; name: string } | undefined): BlockOption[]`
- src/ui/study/navigation.ts: O bloco vazio faz a matéria aplicar o foco de chegada, com a pasta inicial da D76.
- src/ui/study/notesBar.ts: Preferência de aparelho, como o tema: sem armazenamento, vale o padrão (barra oculta, modo fantasma).
- src/ui/study/notice.ts: Aviso curto sem ação (ex.: arquivo grande demais).
- src/ui/study/pdf.ts: pdf.js só carrega quando o primeiro PDF é aberto; o worker dele vai no precache do PWA.
- src/ui/study/screenMemory.ts: Estado de tela que sobrevive à troca de tela, só enquanto o app está aberto (D26).
- src/ui/study/study.ts: Horário fixo nos dados de exemplo, para sempre haver uma aula de agora.
- src/ui/study/undo.ts: D: exclusão é lógica no banco e tem Desfazer (regras.md G8). `label` aparece no aviso.
- src/ui/styles/base.css: (sem comentário nem export no topo)
- src/ui/styles/fonts.css: Fontes da D67, servidas pelo app (D68). Licença OFL.
- src/ui/styles/paletas.css: Paletas oficiais além da base (Gelo suave, sem atributo, em tokens.css; D132). Configs e ?paleta=a|b trocam.
- src/ui/styles/tokens.css: Tokens do Ohara: docs/diretrizes-visuais.md explica cada regra.
- src/ui/theme.ts: Preferência de aparelho, não dado: se o armazenamento falhar, vale o tema do sistema.
