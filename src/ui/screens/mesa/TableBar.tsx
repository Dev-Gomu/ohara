import { useEffect } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { SIZE_STEP, type SizeAxis } from '../../../core/notes/tableSize';
import { Button } from '../../components/Button';
import { setAdjusting, useAdjusting } from '../../keyboard/tableAdjust';
import { setInTable } from '../../keyboard/tableContext';
import { equalizeColumns, measure, setSize, spotOf } from './tableOps';
import styles from './TableBar.module.css';

const COMMANDS: readonly { label: string; shortcut?: string; run: (e: Editor) => void }[] = [
  { label: '+ Linha', shortcut: 'Alt Shift ↓', run: (e) => void e.chain().focus().addRowAfter().run() },
  { label: '+ Coluna', shortcut: 'Alt Shift →', run: (e) => void e.chain().focus().addColumnAfter().run() },
  { label: '− Linha', shortcut: 'Alt ⌫', run: (e) => void e.chain().focus().deleteRow().run() },
  { label: '− Coluna', shortcut: 'Alt Shift ⌫', run: (e) => void e.chain().focus().deleteColumn().run() },
  {
    label: 'Igualar colunas',
    shortcut: 'Alt R =',
    run: (e) => {
      const spot = spotOf(e.state);
      if (spot) equalizeColumns(e.view, spot);
    },
  },
  { label: 'Apagar tabela', run: (e) => void e.chain().focus().deleteTable().run() },
];

function Step({ editor, axis, name, value }: { editor: Editor; axis: SizeAxis; name: string; value: number }) {
  const move = (delta: number) => {
    const spot = spotOf(editor.state);
    if (spot) setSize(editor.view, spot, axis, measure(editor.view, spot, axis) + delta);
  };
  return (
    <span className={styles.par} role="group" aria-label={name}>
      <Button label={`Diminuir ${name}`} onPress={() => move(-SIZE_STEP)}>−</Button>
      <b>{value}</b>
      <Button label={`Aumentar ${name}`} onPress={() => move(SIZE_STEP)}>+</Button>
    </span>
  );
}

// Mini-barra (D149): só aparece com o cursor na tabela; no modo Ajustar vira uma linha única.
export function TableBar({ editor, keep }: { editor: Editor | null; keep: string }) {
  const adjusting = useAdjusting();
  const sizes = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const spot = e ? spotOf(e.state) : null;
      if (!e || !spot) return null;
      return { width: measure(e.view, spot, 'width'), height: measure(e.view, spot, 'height') };
    },
    equalityFn: (a, b) => a?.width === b?.width && a?.height === b?.height,
  });
  const inTable = sizes !== null;
  useEffect(() => {
    setInTable(inTable);
    return () => setInTable(false);
  }, [inTable]);
  if (!editor || !sizes) return null;
  return (
    <div
      className={styles.barra}
      data-keep-field={keep}
      role="toolbar"
      aria-label={adjusting ? 'Ajustar tabela' : 'Tabela'}
      // Sem isto, tocar na barra tira o cursor da tabela antes do comando.
      onPointerDown={(event) => event.preventDefault()}
    >
      {adjusting ? (
        <>
          <span className={styles.rotulo}>Largura</span>
          <Step editor={editor} axis="width" name="largura" value={sizes.width} />
          <span className={styles.rotulo}>Altura</span>
          <Step editor={editor} axis="height" name="altura" value={sizes.height} />
          <Button variant="primary" onPress={() => setAdjusting(false)}>Pronto</Button>
        </>
      ) : (
        <>
          {COMMANDS.map((c) => (
            <Button key={c.label} variant="quiet" {...(c.shortcut !== undefined && { shortcut: c.shortcut })} onPress={() => c.run(editor)}>{c.label}</Button>
          ))}
          <Button variant="quiet" shortcut="Alt R" onPress={() => setAdjusting(true)}>Ajustar</Button>
        </>
      )}
    </div>
  );
}
