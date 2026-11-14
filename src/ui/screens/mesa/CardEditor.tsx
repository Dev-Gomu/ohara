import { useLayoutEffect } from 'react';
import { groupLines, markLength, splitLines } from '../../../core/study/cardLines';
import { parseLine, type LineKind } from '../../../core/study/cardText';
import { Inline } from '../../components/CardBack';
import { useCardView } from '../../study/cardView';
import type { CardsEditor } from './useCardsEditor';
import styles from './CardEditor.module.css';

const BULLET: Partial<Record<LineKind, string>> = { item: '•', pro: '+', con: '−', doubt: '?' };

function Formatted({ raw, front, onPress }: { raw: string; front: boolean; onPress: () => void }) {
  const { kind, text } = parseLine(raw);
  const body = text === '' ? null : <Inline text={text} />;
  const press = { onMouseDown: (event: React.MouseEvent) => event.preventDefault(), onClick: onPress };
  if (front) {
    return (
      <p className={styles.frente} {...press}>
        {body ?? <span className={styles.vazio}>Sem frente</span>}
      </p>
    );
  }
  if (kind === 'section') return <h3 className={styles.titulo} {...press}>{body}</h3>;
  if (kind === 'subsection') return <h4 className={styles.subtitulo} {...press}>{body}</h4>;
  if (raw.trim() === '') return <p className={styles.espaco} {...press} />;
  const mark = kind === 'number' ? /^\d+[.)]/.exec(raw)?.[0] : BULLET[kind];
  return (
    <p className={styles.linha} data-tipo={kind} {...press}>
      {mark !== undefined && <span className={styles.marca}>{mark}</span>}
      <span>{body}</span>
    </p>
  );
}

// A linha cresce com o texto, em quantas linhas visuais precisar.
function fitHeight(area: HTMLTextAreaElement): void {
  area.style.height = 'auto';
  area.style.height = `${area.scrollHeight}px`;
}

function Active({ editor, raw, front }: { editor: CardsEditor; raw: string; front: boolean }) {
  const { field, typeLine } = editor;
  const prefix = markLength(raw);
  const value = raw.slice(prefix);
  const { kind } = parseLine(raw);

  useLayoutEffect(() => {
    if (field.current) fitHeight(field.current);
  });

  return (
    <div className={styles.ativa} data-tipo={front ? 'front' : kind}>
      {prefix > 0 && <span className={styles.pilula}>{raw.slice(0, prefix).trim()}</span>}
      <textarea
        ref={field}
        data-field
        data-card-line
        rows={1}
        className={styles.campo}
        value={value}
        spellCheck
        aria-label="Linha do cartão"
        placeholder={front ? 'Pergunta' : ''}
        onChange={(event) => typeLine(event.target.value, event.target.selectionStart)}
      />
    </div>
  );
}

// No cartão novo o próprio cartão é o editor (D138): pronto, com a linha do cursor em texto cru.
export function CardEditor({ editor }: { editor: CardsEditor }) {
  const { source, line, activate, saved, field } = editor;
  const view = useCardView();
  const lines = splitLines(source);
  const groups = groupLines(source);

  useLayoutEffect(() => {
    field.current?.scrollIntoView({ block: 'nearest' });
  }, [line, source, field]);

  const render = (index: number, front: boolean, last: boolean) => {
    const raw = lines[index] ?? '';
    if (index === line) return <Active key={index} editor={editor} raw={raw} front={front} />;
    // Linhas em branco no fim do cartão só aparecem quando o cursor está nelas.
    if (!front && last && raw.trim() === '') return null;
    return <Formatted key={index} raw={raw} front={front} onPress={() => activate(index)} />;
  };

  return (
    <div className={styles.editor} aria-label="Cartões novos">
      {saved !== null && (
        <p className={styles.salvou}>
          {saved} {saved === 1 ? 'cartão salvo' : 'cartões salvos'}.
        </p>
      )}
      {groups.map((group) => {
        const [first = 0, ...rest] = group.lines;
        return (
          <article
            key={group.first}
            className={styles.carta}
            data-compacto={view.compact}
          >
            <div className={styles.faixa}>{render(first, true, false)}</div>
            <div className={styles.verso} data-cor-titulos={view.colorTitles}>
              {rest.length === 0 && line !== first && (
                <p className={styles.falta}>Falta o verso</p>
              )}
              {rest.map((index) => render(index, false, index === rest.at(-1)))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
