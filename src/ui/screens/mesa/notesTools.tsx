import type { Editor } from '@tiptap/react';
import type { FormatTool } from '../../components/FormatBar';
import { ask } from '../../shell/PromptWindow';

interface Spec {
  id: string;
  label: string;
  icon?: (e: Editor) => string;
  active?: (e: Editor) => boolean;
  run: (e: Editor) => void;
}

const chain = (e: Editor) => e.chain().focus();

// Título é um botão só: 1º toque Título 1, 2º Título 2, 3º volta ao texto.
function cycleHeading(e: Editor): void {
  if (e.isActive('heading', { level: 1 })) chain(e).toggleHeading({ level: 2 }).run();
  else if (e.isActive('heading', { level: 2 })) chain(e).setParagraph().run();
  else chain(e).toggleHeading({ level: 1 }).run();
}

// Sobrescrito, depois subscrito, depois normal (D145: o mais usado vem primeiro).
function cycleScript(e: Editor): void {
  if (e.isActive('superscript')) chain(e).unsetSuperscript().setSubscript().run();
  else if (e.isActive('subscript')) chain(e).unsetSubscript().run();
  else chain(e).setSuperscript().run();
}

function askLink(e: Editor): void {
  if (e.isActive('link')) return void chain(e).unsetLink().run();
  ask({
    title: 'Link',
    action: 'Aplicar',
    fields: [{ id: 'href', label: 'Endereço do link' }],
    onSubmit: ({ href }) => {
      if (href) chain(e).setLink({ href }).run();
    },
  });
}

const BAR: readonly Spec[] = [
  { id: 'titulo', label: 'Título', active: (e) => e.isActive('heading'), run: cycleHeading },
  { id: 'negrito', label: 'Negrito', active: (e) => e.isActive('bold'), run: (e) => void chain(e).toggleBold().run() },
  { id: 'italico', label: 'Itálico', active: (e) => e.isActive('italic'), run: (e) => void chain(e).toggleItalic().run() },
  { id: 'marca', label: 'Marca-texto', active: (e) => e.isActive('highlight'), run: (e) => void chain(e).toggleHighlight().run() },
  { id: 'topicos', label: 'Lista com tópicos', active: (e) => e.isActive('bulletList'), run: (e) => void chain(e).toggleBulletList().run() },
  { id: 'numerada', label: 'Lista numerada', active: (e) => e.isActive('orderedList'), run: (e) => void chain(e).toggleOrderedList().run() },
  {
    id: 'tabela',
    label: 'Tabela',
    active: (e) => e.isActive('table'),
    run: (e) => {
      if (!e.isActive('table')) chain(e).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    id: 'sobre',
    label: 'Sobrescrito / subscrito',
    icon: (e) => (e.isActive('subscript') ? 'sub' : 'sobre'),
    active: (e) => e.isActive('superscript') || e.isActive('subscript'),
    run: cycleScript,
  },
  { id: 'desfazer', label: 'Desfazer', run: (e) => void chain(e).undo().run() },
];

const STYLES: readonly Spec[] = [
  { id: 'sublinhado', label: 'Sublinhado', active: (e) => e.isActive('underline'), run: (e) => void chain(e).toggleUnderline().run() },
  { id: 'tachado', label: 'Tachado', active: (e) => e.isActive('strike'), run: (e) => void chain(e).toggleStrike().run() },
  { id: 'link', label: 'Link', active: (e) => e.isActive('link'), run: askLink },
  { id: 'tarefas', label: 'Tarefas', active: (e) => e.isActive('taskList'), run: (e) => void chain(e).toggleTaskList().run() },
  { id: 'recuo1', label: 'Recuar mais', run: (e) => void (chain(e).sinkListItem('listItem').run() || chain(e).sinkListItem('taskItem').run()) },
  { id: 'recuo2', label: 'Recuar menos', run: (e) => void (chain(e).liftListItem('listItem').run() || chain(e).liftListItem('taskItem').run()) },
  { id: 'citacao', label: 'Citação', active: (e) => e.isActive('blockquote'), run: (e) => void chain(e).toggleBlockquote().run() },
  { id: 'codigo', label: 'Código', active: (e) => e.isActive('code'), run: (e) => void chain(e).toggleCode().run() },
  { id: 'linha', label: 'Divisória', run: (e) => void chain(e).setHorizontalRule().run() },
  { id: 'limpar', label: 'Limpar', run: (e) => void chain(e).unsetAllMarks().clearNodes().run() },
  { id: 'refazer', label: 'Refazer', run: (e) => void chain(e).redo().run() },
];

function toTools(specs: readonly Spec[], editor: Editor | null): FormatTool[] {
  return specs.map((spec) => ({
    id: spec.id,
    label: spec.label,
    ...(editor && spec.icon && { icon: spec.icon(editor) }),
    sel: editor ? (spec.active?.(editor) ?? false) : false,
    run: () => editor && spec.run(editor),
  }));
}

export const notesBar = (editor: Editor | null) => toTools(BAR, editor);
export const notesStyles = (editor: Editor | null) => toTools(STYLES, editor);
