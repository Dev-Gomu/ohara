<!-- Gerado por `node scripts/pecas.mjs`. Não editar à mão. -->
# Cartão de peças

## Peças (src/ui/components)

### Block.tsx
- `const PhoneBlock`
  Bloco que o celular mostra agora. As telas maiores ignoram (D79).
- `function Block(props: BlockProps)`
  `interface BlockProps { id: string; title?: string; icon?: IconName; label?: string; count?: string; shortcut?: string; tools?: ReactNode; menu?: boolean; fixed?: 'none' | 'block' | 'inside'; className?: string; children: ReactNode; }`

### BlockIcon.tsx
- `type IconName = keyof typeof PATHS;`
- `function BlockIcon({ name }: { name: IconName })`

### Button.tsx
- `function Button(props: ButtonProps)`
  `interface ButtonProps { variant?: 'primary' | 'plain' | 'quiet'; shortcut?: string; cursor?: boolean; menuItem?: boolean; disabled?: boolean; label?: string; autoFocus?: boolean; onPress?: () => void; children: ReactNode; }`

### CardBack.tsx
- `function Inline({ text, cloze }: InlineProps)`
  `interface InlineProps { text: string; cloze?: 'esconde' | 'revela'; }`
- `function CardBack({ back, compact, colorTitles = true, images }: CardBackProps)`
  Verso: seção (#), subtítulo (##, recuado) e texto; em duas colunas quando o cartão é largo.
  `interface CardBackProps { back: string; compact?: boolean; colorTitles?: boolean; images?: ImageSource | undefined; }`
- `function StudyCard({ front, back, compact, colorTitles, images }: StudyCardProps)`
  Uma peça só (D138, D155): frente cheia no azul de ação e verso no mesmo contorno.
  `interface StudyCardProps extends CardBackProps { front: string; }`
- `function ClozeFace({ text, side }: { text: string; side: 'frente' | 'verso' })`
  Cartão cloze (D157, D159): frente azul cheia com a lacuna e verso claro com a resposta, lado a lado.
- `function ClozeCard({ text }: { text: string })`

### CardImages.tsx
- `interface ImageSource { sideOf: SideOf; src: (id: string) => string | undefined; onZoom?: (id: string) => void; }`
  De onde a peça tira as imagens: a tela passa o índice do banco (a peça não lê dados).
- `const IMAGE_DRAWER`
- `const IMAGE_ZOOM`
- `function ImageIcon({ plus }: { plus?: boolean })`
- `function ImageAttach({ side, count, onAttach, onOpen }: ImageAttachProps)`
  Sem imagem: ícone discreto de anexar. Com imagem: pílula com ícone e número, que abre a gaveta (D158).
  `interface ImageAttachProps { side: ImageSide; count: number; onAttach: () => void; onOpen: () => void; }`
- `function CardPicture({ src, side, active, focusRef, onPress, onZoom, onRemove, size = 'linha', }: CardPictureProps)`
  Imagem no ponto do texto onde foi colocada. Sem os bytes (apagada), mostra o lugar vazio.
  `interface CardPictureProps { src: string | undefined; side: ImageSide; active?: boolean; focusRef?: React.Ref<HTMLDivElement>; onPress?: () => void; onZoom?: () => void; onRemove?: () => void; size?: 'linha' | 'grande' | 'mini'; }`
- `function ImageDrawer({ side, ids, context, source, onRemove, onAdd }: ImageDrawerProps)`
  Gaveta: só gerencia (← → andam, Enter amplia, Delete remove, Esc fecha).
  `interface ImageDrawerProps { side: ImageSide; ids: readonly string[]; context: string; source: ImageSource; onRemove: (id: string) => void; onAdd: () => void; }`
- `function ImageZoom({ ids, current, src }: ImageZoomProps): ReactNode`
  Ampliada: ← → trocam de imagem (a lista rola até a escolhida), Esc fecha.
  `interface ImageZoomProps { ids: readonly string[]; current: string | null; src: (id: string) => string | undefined; }`

### Cards.tsx
- `interface DayBrick { code: string; color: number; kind: string; }`
- `function AssessmentDayCard(props: AssessmentDayCardProps)`
  Dia de avaliação: número grande, dia da semana e mês, e uma pílula de sigla para cada prova ou trabalho. A peça alarga com a quantidade de pílulas; o tipo (prova, trabalho) fica no rótulo falado.
  `interface AssessmentDayCardProps extends TargetProps { when: string; month?: string; due: string; next?: boolean; bricks: readonly DayBrick[]; }`
- `function SubjectCard({ code, color, detail, ...target }: SubjectCardProps)`
  Único lugar em que a cor da matéria vira fundo. Só a sigla, nunca o nome inteiro.
  `interface SubjectCardProps extends TargetProps { code: string; color: number; detail?: string; }`

### CheckItem.tsx
- `function CheckItem({ title, checked, note, children, ...target }: CheckItemProps)`
  `interface CheckItemProps extends TargetProps { title: string; checked: boolean; note?: string | undefined; children?: ReactNode; }`

### Controls.tsx
- `function Field({ label, shortcut, ...input }: FieldProps)`
  Campo de busca e de formulário. As teclas são do texto: o listener cuida disso pelo nível.
  `interface FieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string; shortcut?: string; }`
- `function Toggle({ label, on, cursor, onChange }: SwitchProps)`
  `interface SwitchProps { label: string; on: boolean; cursor?: boolean; onChange?: (on: boolean) => void; }`
- `function Check({ label, on, cursor, onChange }: SwitchProps)`
  `interface SwitchProps { label: string; on: boolean; cursor?: boolean; onChange?: (on: boolean) => void; }`
- `function Day({ day, today, subject, dim, ...target }: DayProps)`
  `interface DayProps extends TargetProps { day: number; today?: boolean; subject?: number; dim?: boolean; }`
- `function Progress({ value, label }: { value: number; label: string })`
  Progresso: o número vai sempre ao lado da barra.

### DayItem.tsx
- `function DayItem(props: DayItemProps)`
  Item da Agenda de hoje: hora em duas linhas, título, sigla em texto; a matéria é um tom no fundo.
  `interface DayItemProps extends TargetProps { start: string; end: string; title: string; code: string; color: number | undefined; past?: boolean; children?: ReactNode; }`

### Dica.tsx
- `function Dica({ content, shortcut, side = 'top', children }: DicaProps)`
  `interface DicaProps { content: string; shortcut?: string; side?: 'top' | 'bottom'; children: ReactElement<{ 'aria-describedby'?: string }>; }`

### DicaGrupo.tsx
- `interface DicaGroup { id: string; controller: DicaController; delay: number; warmWindow: number; }`
- `const DicaContext`
- `function DicaGrupo({ delay = 400, warmWindow = 300, children, }: { delay?: number; warmWindow?: number; children: ReactNode; })`
  Uma dica só para a barra toda: cada botão pede, o grupo desenha e desliza.
- `const useDicaGroup = (): DicaGroup | null =>`

### FaultCell.tsx
- `function FaultCell({ code, missed, limit, attention, ...target }: FaultCellProps)`
  Célula de Faltas: só texto. A bolinha no canto da sigla (exceção ao "sem círculos", D128) marca atenção.
  `interface FaultCellProps extends TargetProps { code: string; missed: number | null; limit: number | null; attention: boolean; }`

### Filter.tsx
- `function FilterGrid({ label, children }: { label: string; children: ReactNode })`
  Filtro de uma escolha por matéria: marca na cor da matéria sempre à vista (serve de legenda); a escolhida ganha o fundo de escolhido. "Todas" vem sem marca (subject indefinido).
- `function FilterChip({ subject, children, ...target }: TargetProps & { subject?: number | undefined; children: string })`

### FormatBar.tsx
- `interface FormatTool { id: string; label: string; shortcut?: string; icon?: string; sel: boolean; run: () => void; }`
- `function FormatBar({ tools, styleTools, bar, onExpand, onOptions }: FormatBarProps)`
  Cabeçalho do bloco Anotações (D146): caderno, barra de formatação (D145) e ⋮ na mesma linha. O que não cabe sobe para o topo do menu Aa (D152). Caderno, Aa e ⋮ nunca somem.
  `interface FormatBarProps { tools: readonly FormatTool[]; styleTools: readonly FormatTool[]; bar?: 'top'; onExpand?: () => void; onOptions?: () => void; }`

### FormatIcons.tsx
- `type FormatIconName = keyof typeof PATHS;`
- `function FormatIcon({ name }: { name: string })`

### Grades.tsx
- `const cx = (names: string): string =>`
- `type Nota = number | null;`
- `const fmt`
- `const Of = ({ value }: { value: number }) =>`
- `const Soft = ({ children }: { children: ReactNode }) =>`
- `const LowMark = () =>`
- `function ResultMark({ kind, children }: { kind: 'ok' | 'atencao'; children: string })`
  Marca alongada com o sinal dentro (check ou X), sempre com a palavra; nunca círculo.
- `function GradeCell(props: { value: Nota; kind?: 'total' | 'aberto'; low?: boolean; })`
  Célula C: marca de atenção quando abaixo da meta; total e "em aberto" em pílula de peça.
- `function BoletimHeader()`
- `type NeedCell = number | 'ok' | 'nao' | null;`
- `function NeedView({ need }: { need: NeedCell })`
- `interface BoletimRowData { code: string; color: number; bimesters: readonly Nota[]; semesters: readonly Nota[]; semesterOpen: readonly boolean[]; average: Nota; averageOpen: boolean; need: NeedCell; min: number; }`
- `function BoletimRow(props: { row: BoletimRowData; block: string; index: number; onOpen: () => void })`
- `interface TileData { name: string; worth: number; points: Nota; grade10: Nota; convert: boolean; low: boolean; }`
  ---------- Disciplina ----------
- `function BimesterTile(props: { tile: TileData; block: string; index: number })`
  Bimestre como seletor: quanto vale e quanto já fez. As avaliações ficam na lista ao lado.
- `function SemesterFaixa(props: { label: string; total: Nota; children: ReactNode })`
- `function AvalRow(props: { name: string; note: string; grade: Nota; max: number; low: boolean; block: string; index: number; onOpen: () => void; })`
  Linha de avaliação A: nome à esquerda, "1.6 de 2.0" à direita.
- `function SummaryLines(props: { lines: readonly [string, ReactNode][]; children?: ReactNode })`
- `function NeedLines(props: { lines: readonly [string, ReactNode][] })`
- `function StatusPill({ kind, children }: { kind: 'ok' | 'atencao'; children: string })`
- `function GoalIsland(props: { value: number; block: string; onStep: (delta: number) => void })`
  Ajuste da meta (ilha A): menos, número e mais. Os dois botões entram no teclado do bloco.

### Island.tsx
- `function Island({ label, slides, children, }: { label?: string; slides?: boolean; children: ReactNode; })`
  Ilha: agrupa controles na barra do topo (telas, nível, módulos).
- `function Tab(props: TabProps)`
  Aba: ícone da tela e número, que é o próprio atalho. O nome da tela fica no título da barra.
  `interface TabProps { number: number; name: string; current?: boolean; cursor?: boolean; menuItem?: boolean; onOpen?: () => void; icon?: ReactNode; show?: 'numeros' | 'ambos' | 'icones' | 'sobrescrito' | 'subscrito'; }`
- `function LevelIndicator({ level, keys }: { level: keyof typeof LEVELS; keys: string[] })`
  Indicador de nível: um por tela, com as teclas que valem agora.
- `function ModeIndicator({ name, keys, onDone, }: { name: string; keys: string[]; onDone: () => void; })`
  Modo passageiro (Redimensionar): toma o lugar dos controles da barra enquanto dura. "Pronto" existe para o toque; no teclado, Enter ou Esc terminam.

### Key.tsx
- `function Key({ children }: { children: string })`
  Tecla: a mesma pecinha em todo lugar que ensina um atalho (diretrizes 6.6). Nunca clicável sozinha.

### ListItem.tsx
- `function ListItem(props: ListItemProps)`
  Item de lista: hora, depois título e apoio, depois pílulas.
  `interface ListItemProps extends TargetProps { time?: string; title: string; detail?: string; past?: boolean; quietSelection?: boolean; lead?: ReactNode; children?: ReactNode; }`

### NavItem.tsx
- `function useSelectedIndex(block: string, count: number): number`
- `function useNavCursor(block: string, index: number): boolean`
  Cursor de peças que não são NavItem (Button): o item escolhido de um bloco em nível de navegação.
- `function NavItem(props: NavItemProps)`
  Item de campo navegável. Quem desenha a seleção é a tela, pelo atributo data-sel.
  `interface NavItemProps { block: string; index: number; className?: string; ring?: 'anel' | 'anel-interno' | 'nenhum' | 'cursor'; onOpen?: () => void; label?: string; color?: string; subject?: number | undefined; choice?: boolean; marked?: boolean; children: ReactNode; }`

### Pill.tsx
- `function SubjectPill({ code, color }: { code: string; color: number })`
  Matéria: só a sigla, sobre a cor guardada como posição.
- `function StatePill({ state, children }: { state: 'ok' | 'atencao'; children: string })`
  Estado: a marca alongada colorida nunca vai sem a palavra.
- `function NowPill()`
  No máximo uma na tela: a aula em andamento.
- `function SubjectMark({ code, color, children, }: { code: string; color?: number | undefined; children?: string; })`
  Evento na célula de dia: marca alongada na cor da matéria, sigla e texto curto (hora).
- `function DayPill({ weekday, number, today, }: { weekday: string; number: string; today?: boolean; })`
  Pílula do dia: dia da semana e número juntos; hoje fica cheia de ação.

### PinSlots.tsx
- `type PinStatus = 'idle' | 'success' | 'error';`
  Código de N casas (PIN). Porte do Code Slots do React Bits, aprovado na bancada (V2). Campo de texto próprio: só dígitos e Backspace, sem escutar tecla (D15). Clique ou toque escolhe a casa.
- `function PinSlots({ length = 6, status = 'idle', mask = true, disabled = false, autoFocus = false, ariaLabel = 'PIN', onChange, onComplete, }: PinSlotsProps)`
  `interface PinSlotsProps { length?: number; status?: PinStatus; mask?: boolean; disabled?: boolean; autoFocus?: boolean; ariaLabel?: string; onChange?: (code: string) => void; onComplete?: (code: string) => void; }`

### PinSlotsParts.tsx
- `const SINK_FADE`
- `const clamp01 = (v: number): number =>`
- `const digitsOf = (raw: unknown): string =>`
- `const toSlots = (raw: unknown, n: number): string[] =>`
- `const firstEmptyOf = (slots: readonly string[]): number =>`
- `const isFull = (slots: readonly string[]): boolean =>`
- `function Slot({ mv, drop, char, active, rise, sink }: SlotProps)`
  Uma casa: o enchimento "pousa" com mola e o dígito sobe; no acerto, afunda em cascata.
  `interface SlotProps { mv: MotionValue<number>; drop: MotionValue<number>; char: string; active: boolean; rise: number; sink: number; }`

### Preview.tsx
- `function Preview({ title, detail, actions, children }: PreviewProps)`
  Prévia do item escolhido. O título é texto do usuário: fica como foi digitado.
  `interface PreviewProps { title: string; detail?: string; actions?: ReactNode; children?: ReactNode; }`

### Ruler.tsx
- `interface RulerItem { id: string; title: string; detail?: string | undefined; }`
- `function RulerPill({ title, detail, ...target }: RulerPillProps)`
  `interface RulerPillProps extends TargetProps { title: string; detail?: string | undefined; }`
- `function RulerCreate({ label, onCreate }: { label: string; onCreate?: () => void })`
  Criar fica no fim da régua, é peça comum e não seleciona.
- `function Ruler({ block, items, createLabel, onCreate }: RulerProps)`
  Régua de filtro: o que escolhe fica fora do que é escolhido.
  `interface RulerProps { block: string; items: readonly RulerItem[]; createLabel?: string; onCreate?: () => void; }`

### ScreenIcon.tsx
- `function ScreenIcon({ screen }: { screen: Screen })`
  Ícone da tela na aba do topo: traço simples, sem metáfora médica.

### Target.tsx
- `interface TargetProps { nav?: { block: string; index: number } | undefined; selected?: boolean | undefined; cursor?: boolean | undefined; onOpen?: (() => void) | undefined; label?: string | undefined; menuItem?: boolean | undefined; }`
  Onde a peça vive: `nav` liga ao teclado (campo navegável); sem ele, a tela informa escolhido e cursor (abas do menu, vitrine do lab).
- `function Target(props: Props)`
  `interface Props extends TargetProps { className?: string | undefined; subject?: number | undefined; children: ReactNode; }`

### Toggles.tsx
- `function ToggleGroup({ label, children }: { label: string; children: ReactNode })`
  Grupo de alternadores ou de abas: a mesma ilha recuada da barra do topo.
- `function BlockToggle({ name, letter, open, cursor, icon, onToggle }: BlockToggleProps)`
  Alternador de bloco: mostra ou esconde um bloco. Aberto = fundo de escolhido e marca cheia.
  `interface BlockToggleProps { name: string; letter: string; open: boolean; cursor?: boolean; icon?: ReactNode; onToggle: () => void; }`
- `function BlockTabs({ label, children }: BlockTabsProps)`
  Abas dentro do cabeçalho de um bloco. É barra do topo do bloco (Alt T chega nela).
  `interface BlockTabsProps { label: string; children: ReactNode; }`
- `function BlockTab({ selected, count, onPress, children }: BlockTabProps)`
  `interface BlockTabProps { selected: boolean; count?: number; onPress: () => void; children: string; }`

### TrashRow.tsx
- `function MoreButton({ label, expanded, onPress }: MoreButtonProps)`
  ⋮ de toque (44 px): abre as mesmas opções do Alt O.
  `interface MoreButtonProps { label: string; expanded: boolean; onPress: () => void; }`
- `interface RowAction { id: string; label: string; keys?: string; danger?: boolean; }`
- `function RowMenu({ actions, onAction, }: { actions: readonly RowAction[]; onAction: (id: string) => void; })`
  Menu do ⋮ dentro da linha. Setas e Enter são do React Aria; o Esc, do listener.
- `function TrashRow(props: TrashRowProps)`
  Linha da Lixeira (D164): sigla, título e apoio; a escolhida mostra Restaurar e ⋮ (toque).
  `interface TrashRowProps { lead?: ReactNode; title: string; detail: string; leaves?: string | null; when: string; selected: boolean; cursor: boolean; menuOpen: boolean; actions: readonly RowAction[]; onSelect: () => void; onRestore: () => void; onMenu: () => void; onAction: (id: string) => void; }`
- `function ConfirmBox({ title, confirmLabel, onCancel, onConfirm, children, }: ConfirmBoxProps)`
  Confirmação de ação sem volta, dentro da janela: o foco nasce em Cancelar, então Enter sozinho nunca apaga. Os dois botões têm o mesmo tamanho; o perigoso é só contorno.
  `interface ConfirmBoxProps { title: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; children: ReactNode; }`

### Window.tsx
- `function WindowFooter({ children }: { children: ReactNode })`
  O Esc é do listener: ele fecha pelo estado, e o React Aria nem chega a ver a tecla (D08). Rodapé de ações: os botões dividem a largura em partes iguais, sem atalhos escritos.
- `function Window({ id, title, context, detail, testId, wide, children }: WindowProps)`
  `interface WindowProps { id: string; title: string; context?: string; detail?: string; testId?: string; wide?: boolean; children: ReactNode; }`

### dicaController.ts
- `type DicaSide = 'top' | 'bottom';`
  Dica "aquecida" (porte do WarmTooltip, React Bits; D175): a primeira espera um instante; enquanto o grupo está quente, a dica desliza para o vizinho em vez de fechar e abrir. Estado fora do React.
- `type DicaMode = 'cold' | 'warm' | 'instant' | 'move';`
- `interface DicaPayload { id: string; trigger: HTMLElement; content: string; shortcut: string | undefined; side: DicaSide; gap: number; warmWindow: number; }`
- `interface DicaView { state: 'closed' | 'open' | 'closing'; current: DicaPayload | null; mode: DicaMode; swap: number; }`
- `const EASE_OUT`
- `function anchorOf(trigger: HTMLElement, side: DicaSide, gap: number): [number, number]`

## Store do teclado e das telas (src/ui/keyboard)

### store.ts
- `interface UiBlock extends BlockSpec { id: string; onActivate?: (index: number) => void; }`
- `interface FocusPlace { block: string; level: Level; items?: Readonly<Record<string, number>>; }`
- `interface ScreenRegistration { blocks: readonly UiBlock[]; arrival: FocusPlace; back?: () => void; actions?: Partial<Record<KeyAction['type'], (change: KeyAction) => boolean | void>>; options?: (block: string) => readonly BlockOption[]; }`
- `interface BlockOption { id: string; label: string; keys?: string; run: () => void; }`
- `interface KeyboardState { focus: FocusState; screen: Screen; lastAction: string | null; }`
- `function registerWindowActions(window: string, run: (change: KeyAction) => boolean): () => void`
- `function subscribe(subscriber: () => void): () => void`
- `function getKeyboardState(): KeyboardState`
- `function useKeyboardState(): KeyboardState`
- `function registerScreen(next: ScreenRegistration): void`
- `function blockRects(): Readonly<Record<string, Rect>>`
- `function blockOptions(block: string): readonly BlockOption[]`
- `function dispatch(change: FocusChange, repeat = false): void`

## Estudo (src/ui/study)

### actions.ts
- `function toggleReminder(id: string | undefined): void`
- `function postponeReminder(id: string, date: string): void`

### attach.ts
- `function attach(source: File, kind: FileKind, owner: { lessonId?: string; subjectId?: string }): Promise<void>`
- `function detach(file: StudyFile): Promise<void>`
- `function pickFile(onPick: (file: File) => void, accept = ACCEPT): void`
  O seletor só abre a partir de um gesto do usuário: Enter no menu conta como gesto.
- `function pickBackup(onPick: (file: File) => void): void`

### cardImages.ts
- `const isImageFile = (file: File): boolean =>`
- `function addImages(files: readonly File[], lessonId: string, side: ImageSide, already: number): Promise<string[]>`
  Grava as imagens e devolve os ids, na ordem; o limite é por lado do cartão.
- `function removeImages(ids: readonly string[]): void`
  Exclusão lógica no banco (a coleção perde o item e o diff marca deleted).
- `interface ImageIndex { sideOf: SideOf; src: (id: string) => string | undefined; }`
- `function useCardImages(): ImageIndex`
- `function pickImages(onPick: (files: File[]) => void): void`
  O seletor só abre a partir de um gesto do usuário: Enter no menu conta como gesto.
- `function openZoom(ids: readonly string[], current: string, fromDrawer = false): void`
- `function useZoom(): ZoomState`
  `interface ZoomState { ids: readonly string[]; current: string | null; fromDrawer: boolean; }`
- `function useImageWindows(onClosed: () => void): void`
  Ao fechar a ampliada que veio da gaveta, a gaveta volta; ao fechar a gaveta, o foco volta ao cartão.

### cardView.ts
- `interface CardView { compact: boolean; colorTitles: boolean; }`
- `const toggleCompact = (): void =>`
- `const toggleColorTitles = (): void =>`
- `const setCompact = (on: boolean): void =>`
- `const setColorTitles = (on: boolean): void =>`
- `const currentCardView = (): CardView =>`
- `function useCardView(): CardView`

### download.ts
- `function downloadBytes(bytes: Uint8Array, filename: string): void`
- `function downloadText(text: string, filename: string): void`
- `function fileSlug(text: string, fallback: string): string`

### editOptions.ts
- `function folderOptions(folder: { id: string; name: string } | undefined): BlockOption[]`
- `function lessonOptions(lesson: Lesson | undefined): BlockOption[]`
- `function cardOptions(card: Card | undefined): BlockOption[]`

### navigation.ts
- `const MESA_LESSON`
- `const ACERVO_SUBJECT`
- `function openLesson(lessonId: string): void`
- `function openSubject(subjectId: string): void`
  O bloco vazio faz a matéria aplicar o foco de chegada, com a pasta inicial da D76.
- `const AGENDA_MONTH`
- `const AGENDA_VIEWS`
- `const AGENDA_DAY`
  Dia que a Agenda mostra; semana, mês e lista partem dele.
- `const NOTES_OPEN`
  A tela de Notas vive dentro da Agenda, mas só se chega a ela pelo botão do topo ou pela Paleta (D41).
- `const FAULTS_OPEN`
- `function openFaults(): void`
- `function closeFaults(): void`
- `function openNotes(): void`
- `function closeNotes(): void`
- `function openDay(day: string): void`
  Abre o Mês já no dia pedido.

### notice.ts
- `function showNotice(text: string): void`
  Aviso curto sem ação (ex.: arquivo grande demais).
- `function useNotice(): string | null`

### pdf.ts
- `function openPdf(bytes: ArrayBuffer): Promise<PDFDocumentProxy>`
  O pdf.js assume a posse do buffer que recebe: passa uma cópia.

### reminderOptions.ts
- `function reminderOptions(item: Reminder | undefined): BlockOption[]`
  D178: o ⋮ do bloco Lembretes ganha "Adiar" para o lembrete sob o cursor.

### screenMemory.ts
- `function setScreenMemory(key: string, value: T): void`
- `function useScreenMemory(key: string, initial: T): [T, (value: T) => void]`
  Estado de tela que sobrevive à troca de tela, só enquanto o app está aberto (D26).

### study.ts
- `const today`
- `const nowTime`
  Horário fixo nos dados de exemplo, para sempre haver uma aula de agora.
- `const storage: Storage`
  Definido por main.tsx antes de desenhar qualquer tela: a UI nunca abre o banco.
- `function setStorage(next: Storage): void`
- `function useStudy(): StudyData`

### undo.ts
- `function removeWithUndo(label: string, change: (data: StudyData) => StudyData, root: string): void`
  D: exclusão é lógica no banco e tem Desfazer (regras.md G8). `label` aparece no aviso. `root` é o item que a pessoa excluiu: tudo que sai junto vai à Lixeira com essa raiz (D164).
- `function restoreWithUndo(label: string, root: string): void`
  Restaurar da Lixeira: volta o grupo da raiz (e o do pai, se ele também estava lá). Desfazer devolve à Lixeira com a raiz e a data de antes.
- `function runUndo(): void`
- `function useUndo(): Pick<Pending, 'label' | 'removal'> | null`
  `interface Pending { label: string; removal: boolean; undo: () => void; }`
