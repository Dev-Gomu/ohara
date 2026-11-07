import { EditorContent, type Editor } from '@tiptap/react';
import { Menu, MenuItem } from 'react-aria-components';
import { shortDate } from '../../../core/study/dates';
import { isoDay } from '../../../core/study/dates';
import { versionsOf } from '../../../core/study/versions';
import { Block } from '../../components/Block';
import { Window } from '../../components/Window';
import { dispatch } from '../../keyboard/store';
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

export function NotesBlock({ id, editor }: { id: string; editor: Editor | null }) {
  return (
    <Block id={id} title="Anotações" shortcut="Alt A" menu>
      <EditorContent editor={editor} className={styles.editor} />
      <div className={styles.ferramentas} role="toolbar" aria-label="Formatação">
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
