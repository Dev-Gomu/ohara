import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import type { Split, Tree } from '../../core/mosaic/tree';
import styles from './Mosaic.module.css';

interface MosaicProps {
  tree: Tree;
  maximized: string | null;
  render: (id: string) => ReactNode;
  onChange: (tree: Tree) => void;
}

const MIN_RATIO = 0.2;

function replaceNode(tree: Tree, from: Split, to: Split): Tree {
  if (tree === from) return to;
  if (tree.kind === 'leaf') return tree;
  return {
    ...tree,
    first: replaceNode(tree.first, from, to),
    second: replaceNode(tree.second, from, to),
  };
}

function Divider({ node, onMove }: { node: Split; onMove: (ratio: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const box = ref.current?.parentElement?.getBoundingClientRect();
    if (!box) return;
    const ratio =
      node.axis === 'row'
        ? (event.clientX - box.left) / box.width
        : (event.clientY - box.top) / box.height;
    onMove(Math.min(1 - MIN_RATIO, Math.max(MIN_RATIO, ratio)));
  }

  return (
    <div
      ref={ref}
      className={styles.divisa}
      data-axis={node.axis}
      onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
      onPointerMove={drag}
    />
  );
}

// Grade dentro de grade (D10): cada divisão vira duas trilhas proporcionais.
export function Mosaic({ tree, maximized, render, onChange }: MosaicProps) {
  function node(item: Tree): ReactNode {
    if (item.kind === 'leaf') {
      return (
        <div
          key={item.id}
          className={styles.folha}
          data-sobre={maximized === item.id ? '' : undefined}
          hidden={maximized !== null && maximized !== item.id}
        >
          {render(item.id)}
        </div>
      );
    }
    const tracks = `minmax(0, ${item.ratio}fr) minmax(0, ${1 - item.ratio}fr)`;
    const style: CSSProperties =
      item.axis === 'row' ? { gridTemplateColumns: tracks } : { gridTemplateRows: tracks };
    (style as Record<string, string>)['--divisa'] = `${item.ratio * 100}%`;
    return (
      <div className={styles.divisao} style={style}>
        {node(item.first)}
        {node(item.second)}
        <Divider
          node={item}
          onMove={(ratio) => onChange(replaceNode(tree, item, { ...item, ratio }))}
        />
      </div>
    );
  }

  return (
    <div className={styles.mosaico} data-ampliado={maximized ?? undefined}>
      {node(tree)}
    </div>
  );
}
