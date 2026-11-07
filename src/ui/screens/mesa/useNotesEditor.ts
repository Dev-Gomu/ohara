import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { KeyAction } from '../../../core/keyboard/actions';
import { addVersion } from '../../../core/study/versions';
import { ask } from '../../shell/PromptWindow';
import { storage } from '../../study/study';
import styles from './Mesa.module.css';

type EditorHandler = (change: KeyAction) => boolean | void;

function saveNotes(lessonId: string, html: string) {
  storage.write((data) => {
    const previous = data.lessons.find((item) => item.id === lessonId)?.notes ?? '';
    return {
      ...data,
      noteVersions: addVersion(data.noteVersions, lessonId, previous, Date.now(), crypto.randomUUID()),
      lessons: data.lessons.map((item) => (item.id === lessonId ? { ...item, notes: html } : item)),
    };
  });
}

export function useNotesEditor(lessonId: string, html: string): Editor | null {
  return useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: html,
    onUpdate: ({ editor }) => saveNotes(lessonId, editor.getHTML()),
    editorProps: {
      attributes: {
        'data-field': 'true',
        'aria-label': 'Anotações',
        role: 'textbox',
        class: styles.texto ?? '',
      },
    },
  });
}

function askLink(editor: Editor) {
  ask({
    title: 'Link',
    action: 'Aplicar',
    fields: [{ id: 'url', label: 'Endereço', value: editor.getAttributes('link').href as string }],
    onSubmit: ({ url }) => {
      if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    },
  });
}

// O listener engole as teclas do editor (D15): cada uma chega aqui pela tabela.
export function editorActions(
  editor: Editor | null,
  page: number,
): Partial<Record<KeyAction['type'], EditorHandler>> {
  if (!editor) return {};
  const run = () => editor.chain().focus();
  return {
    bold: () => void run().toggleBold().run(),
    italic: () => void run().toggleItalic().run(),
    underline: () => void run().toggleUnderline().run(),
    code: () => void run().toggleCode().run(),
    highlight: () => void run().toggleHighlight().run(),
    strikethrough: () => void run().toggleStrike().run(),
    orderedList: () => void run().toggleOrderedList().run(),
    bulletList: () => void run().toggleBulletList().run(),
    taskList: () => void run().toggleTaskList().run(),
    link: () => askLink(editor),
    markSlidePage: () => void run().insertContent(`[slide ${page}] `).run(),
    heading: (change) => {
      if (change.type === 'heading') run().toggleHeading({ level: change.level }).run();
    },
  };
}
