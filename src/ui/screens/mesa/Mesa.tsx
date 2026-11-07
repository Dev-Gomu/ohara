import { useState } from 'react';
import { leaf, split } from '../../../core/mosaic/tree';
import { Block } from '../../components/Block';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { Mosaic } from '../../mosaic/Mosaic';
import { useMosaic } from '../../mosaic/useMosaic';
import { ScreenFrame } from '../../shell/ScreenFrame';
import styles from './Mesa.module.css';

const SLIDES = 'mesa.slides';
const NOTES = 'mesa.notes';
const CARDS = 'mesa.cards';
const ALL = [SLIDES, NOTES, CARDS];
const INITIAL = split('row', split('col', leaf(SLIDES), leaf(CARDS), 0.58), leaf(NOTES));

const TOGGLES = [
  { id: SLIDES, label: 'Slides', keys: 'Alt S' },
  { id: NOTES, label: 'Anotações', keys: 'Alt A' },
  { id: CARDS, label: 'Cartões', keys: 'Alt C' },
];

const PAGES = 38;
const CARD_LIST = [
  ['Qual receptor reconhece LPS?', 'TLR4'],
  ['Citocina que induz PCR no fígado', 'IL-6'],
  ['Quimiotático clássico de neutrófilos', 'IL-8 (CXCL8)'],
  ['Molécula do rolamento', 'Selectinas'],
] as const;
const CARD_COLORS = ['roxo', 'rosa', 'azul', 'verde'];

export function Mesa() {
  const mosaic = useMosaic('aula-demo', INITIAL, ALL);
  const [page, setPage] = useState(14);
  const [notes, setNotes] = useState('');

  useBlocks({
    blocks: [
      { id: SLIDES, kind: 'none' },
      { id: NOTES, kind: 'text' },
      { id: CARDS, kind: 'nav', nav: { axis: 'grid', count: CARD_LIST.length, columns: 2 } },
    ],
    arrival: { block: NOTES, level: 'field' },
    options: mosaic.options,
    actions: {
      ...mosaic.actions,
      changePage: (change) => {
        if (change.type !== 'changePage') return false;
        setPage((current) => Math.min(PAGES, Math.max(1, current + change.step)));
      },
    },
  });

  function render(id: string) {
    if (id === SLIDES) {
      return (
        <Block id={id} title="Slides" count={`${page} de ${PAGES}`} shortcut="Alt S" menu>
          <div className={styles.folha}>
            <p className={styles.slide}>Página {page}</p>
          </div>
        </Block>
      );
    }
    if (id === NOTES) {
      return (
        <Block id={id} title="Anotações" shortcut="Alt A" menu>
          <textarea
            className={styles.texto}
            data-field
            aria-label="Anotações"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Block>
      );
    }
    return (
      <Block id={id} title="Cartões" count={`${CARD_LIST.length} nesta aula`} shortcut="Alt C" menu>
        <div className={styles.cartoes}>
          {CARD_LIST.map(([question, answer], index) => (
            <NavItem
              key={question}
              block={id}
              index={index}
              className={styles.cartao}
              color={CARD_COLORS[index]}
            >
              <span className={styles.pergunta}>{question}</span>
              <span className={styles.resposta}>{answer}</span>
            </NavItem>
          ))}
        </div>
      </Block>
    );
  }

  return (
    <ScreenFrame
      title="Resposta inflamatória aguda"
      caps={false}
      end={
        <div className={styles.alternar} role="group" aria-label="Blocos">
          {TOGGLES.map(({ id, label, keys }) => (
            <button
              key={id}
              type="button"
              className={styles.pilula}
              data-sel={mosaic.isOpen(id)}
              aria-pressed={mosaic.isOpen(id)}
              title={keys}
              onClick={() => mosaic.toggle(id)}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <Mosaic
        tree={mosaic.tree}
        maximized={mosaic.maximized}
        render={render}
        onChange={mosaic.setTree}
      />
      {mosaic.resizing && (
        <div className={styles.aviso} role="status">
          Redimensionar: setas ajustam, Enter ou Esc termina
          <button
            type="button"
            className={styles.pronto}
            onClick={() => dispatch({ type: 'escape' })}
          >
            Pronto
          </button>
        </div>
      )}
    </ScreenFrame>
  );
}
