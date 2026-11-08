import { EditorContent, type Editor } from '@tiptap/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Menu, MenuItem } from 'react-aria-components';
import { shortDate } from '../../../core/study/dates';
import { isoDay } from '../../../core/study/dates';
import { versionsOf } from '../../../core/study/versions';
import { Block } from '../../components/Block';
import { Window } from '../../components/Window';
import { dispatch } from '../../keyboard/store';
import { useNotesBar } from '../../study/notesBar';
import { useStudy } from '../../study/study';
import styles from './Mesa.module.css';

interface Tool {
  label: string;
  name: string;
  attrs?: Record<string, unknown>;
  run: (editor: Editor) => void;
}

const TOOLS: readonly Tool[] = [
  { label: 'N', name: 'bold', run: (e) => e.chain().focus().toggleBold().run() },
  { label: 'I', name: 'italic', run: (e) => e.chain().focus().toggleItalic().run() },
  { label: 'S', name: 'underline', run: (e) => e.chain().focus().toggleUnderline().run() },
  { label: 'Marca', name: 'highlight', run: (e) => e.chain().focus().toggleHighlight().run() },
  {
    label: 'T1',
    name: 'heading',
    attrs: { level: 1 },
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'T2',
    name: 'heading',
    attrs: { level: 2 },
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  { label: 'Lista', name: 'bulletList', run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: 'Tarefas', name: 'taskList', run: (e) => e.chain().focus().toggleTaskList().run() },
];

const TOOLBAR = '[data-block="mesa.notes"] [role="toolbar"] button';

const toolbarButtons = () => [...document.querySelectorAll<HTMLButtonElement>(TOOLBAR)];

// Devolve falso fora das Anotações, para a tecla seguir o caminho normal.
export function focusToolbar(): boolean {
  const first = toolbarButtons()[0];
  if (!first) return false;
  first.focus();
  return true;
}

export function stepToolbar(step: -1 | 1): boolean {
  const buttons = toolbarButtons();
  const at = buttons.findIndex((button) => button === document.activeElement);
  if (at < 0) return false;
  buttons[(at + step + buttons.length) % buttons.length]?.focus();
  return true;
}

interface Bubble {
  // Centro da seleção e a borda onde a bolha encosta.
  x: number;
  y: number;
  below: boolean;
}

const SETTLE_MS = 200;
const BUBBLE_HEIGHT = 52;

// Ancorada na caixa inteira da seleção. Em cima por padrão; embaixo no toque (o menu do sistema
// ocupa o alto) ou quando falta espaço.
function bubbleAt(editor: Editor): Bubble | null {
  const { from, to, empty } = editor.state.selection;
  if (empty || !editor.isFocused) return null;
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to);
  const top = Math.min(start.top, end.top);
  const bottom = Math.max(start.bottom, end.bottom);
  const touch = matchMedia('(pointer: coarse)').matches;
  const below = touch || top - BUBBLE_HEIGHT < 8;
  return {
    x: (Math.min(start.left, end.left) + Math.max(start.right, end.right)) / 2,
    y: below ? bottom + 8 : top - 8,
    below,
  };
}

function Tools({
  editor,
  className,
  style,
  keepField,
}: {
  editor: Editor | null;
  className: string;
  style?: CSSProperties;
  keepField?: string;
}) {
  return (
    <div
      className={className}
      style={style}
      data-keep-field={keepField}
      role="toolbar"
      aria-label="Formatação"
    >
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          type="button"
          className={styles.ferramenta}
          data-sel={editor?.isActive(tool.name, tool.attrs) ?? false}
          // Sem isto, o toque tira a seleção do texto antes do comando.
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            if (editor) tool.run(editor);
          }}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}

// Modo fantasma: sem barra, a bolha aparece sobre o trecho selecionado, mas só depois que a
// seleção assenta (sem arraste em curso), e some ao rolar ou ao limpar a seleção.
function useBubble(editor: Editor | null, active: boolean): Bubble | null {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  useEffect(() => {
    if (!editor || !active) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pressed = false;
    const hide = () => {
      clearTimeout(timer);
      setBubble(null);
    };
    const settle = () => {
      hide();
      if (!pressed) timer = setTimeout(() => setBubble(bubbleAt(editor)), SETTLE_MS);
    };
    // Tocar na própria bolha não é arrastar a seleção: mexer nela cancelaria o clique.
    const onBubble = (event: Event) =>
      event.target instanceof Element && event.target.closest('[data-keep-field]') !== null;
    const down = (event: Event) => {
      if (!onBubble(event)) pressed = true;
    };
    const up = (event: Event) => {
      if (onBubble(event)) return;
      pressed = false;
      settle();
    };
    editor.on('selectionUpdate', settle);
    editor.on('focus', settle);
    editor.on('blur', hide);
    editor.on('update', settle);
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointerup', up, true);
    document.addEventListener('scroll', hide, true);
    return () => {
      editor.off('selectionUpdate', settle);
      editor.off('focus', settle);
      editor.off('blur', hide);
      editor.off('update', settle);
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('scroll', hide, true);
      hide();
    };
  }, [editor, active]);
  return bubble;
}

// Metade da largura da bolha, para ela não sair da janela.
const HALF = 178;

function bubbleStyle(bubble: Bubble): CSSProperties {
  return {
    left: `clamp(${HALF}px, ${bubble.x}px, calc(100vw - ${HALF}px))`,
    top: bubble.y,
    transform: bubble.below ? 'translateX(-50%)' : 'translate(-50%, -100%)',
  };
}

export function NotesBlock({ id, editor }: { id: string; editor: Editor | null }) {
  const barVisible = useNotesBar();
  const bubble = useBubble(editor, !barVisible);
  return (
    <Block id={id} title="Anotações" icon="notas" shortcut="Alt A" menu>
      <EditorContent editor={editor} className={styles.editor} />
      {barVisible && <Tools editor={editor} className={styles.ferramentas ?? ''} />}
      {bubble &&
        createPortal(
          <Tools
            editor={editor}
            className={styles.bolha ?? ''}
            style={bubbleStyle(bubble)}
            keepField={id}
          />,
          document.body,
        )}
    </Block>
  );
}

function timeOf(at: number): string {
  const date = new Date(at);
  const hour = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${shortDate(isoDay(date))}, ${hour}`;
}

export function HistoryWindow({ lessonId, editor }: { lessonId: string; editor: Editor | null }) {
  const data = useStudy();
  const versions = versionsOf(data.noteVersions, lessonId);

  function restore(at: React.Key) {
    const version = versions.find((item) => String(item.at) === at);
    dispatch({ type: 'escape' });
    if (version) editor?.commands.setContent(version.html, { emitUpdate: true });
  }

  return (
    <Window id="historico" title="Histórico" testId="historico">
      <Menu
        autoFocus="first"
        aria-label="Versões"
        className={styles.versoes}
        items={versions.map((item) => ({ ...item, id: String(item.at) }))}
        onAction={restore}
        renderEmptyState={() => <p className={styles.vazio}>Ainda não há versões guardadas.</p>}
      >
        {(item) => (
          <MenuItem className={styles.versao} textValue={timeOf(item.at)}>
            {timeOf(item.at)}
          </MenuItem>
        )}
      </Menu>
    </Window>
  );
}
