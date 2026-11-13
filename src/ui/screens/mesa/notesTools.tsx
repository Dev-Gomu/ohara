import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import type { FormatTool } from '../../components/FormatBar';
import { ask } from '../../shell/PromptWindow';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

interface Spec {
  id: string;
  label: string;
  glyph: ReactNode;
  name: string;
  attrs?: Record<string, unknown>;
  priority: FormatTool['priority'];
  run: (e: Editor) => void;
}

const GROUPS: readonly (readonly Spec[])[] = [
  [
    { id: 'h1', label: 'Título 1', glyph: <b>H1</b>, name: 'heading', attrs: { level: 1 }, priority: 1, run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: 'h2', label: 'Título 2', glyph: <b>H2</b>, name: 'heading', attrs: { level: 2 }, priority: 1, run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  ],
  [
    { id: 'negrito', label: 'Negrito', glyph: <b>B</b>, name: 'bold', priority: 1, run: (e) => e.chain().focus().toggleBold().run() },
    { id: 'italico', label: 'Itálico', glyph: <i>I</i>, name: 'italic', priority: 2, run: (e) => e.chain().focus().toggleItalic().run() },
    { id: 'sublinhado', label: 'Sublinhado', glyph: <u>U</u>, name: 'underline', priority: 2, run: (e) => e.chain().focus().toggleUnderline().run() },
    {
      id: 'marca', label: 'Marca-texto', name: 'highlight', priority: 1,
      glyph: <Icon><path d="M13 4l5 5-7 7H6v-5zM4 21h16" /></Icon>,
      run: (e) => e.chain().focus().toggleHighlight().run(),
    },
  ],
  [
    {
      id: 'topicos', label: 'Lista com tópicos', name: 'bulletList', priority: 3,
      glyph: <Icon><path d="M10 6h10M10 12h10M10 18h10M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></Icon>,
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'numerada', label: 'Lista numerada', name: 'orderedList', priority: 3,
      glyph: <Icon><path d="M11 6h9M11 12h9M11 18h9M4 5l1.5-1v5M4 14.5a1.3 1.3 0 012.4.6c0 1-2.4 1.4-2.4 2.9h2.6" /></Icon>,
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'tarefas', label: 'Lista de tarefas', name: 'taskList', priority: 3,
      glyph: <Icon><rect x="3.5" y="4" width="6" height="6" rx="1.5" /><path d="M4.8 15.5l1.7 1.7 2.8-3M13 7h7M13 17h7" /></Icon>,
      run: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'link', label: 'Link', name: 'link', priority: 4,
      glyph: <Icon><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></Icon>,
      run: (e) => {
        if (e.isActive('link')) return void e.chain().focus().unsetLink().run();
        ask({
          title: 'Link',
          action: 'Aplicar',
          fields: [{ id: 'href', label: 'Endereço do link' }],
          onSubmit: ({ href }) => {
            if (href) e.chain().focus().setLink({ href }).run();
          },
        });
      },
    },
  ],
];

export function notesGroups(editor: Editor | null): FormatTool[][] {
  return GROUPS.map((group) =>
    group.map((spec) => ({
      id: spec.id,
      label: spec.label,
      glyph: spec.glyph,
      priority: spec.priority,
      sel: editor?.isActive(spec.name, spec.attrs) ?? false,
      run: () => editor && spec.run(editor),
    })),
  );
}
