import { useLayoutEffect } from 'react';
import { imageIdOf, isFrontImage } from '../../../core/study/cardImages';
import { frontLines, groupLines, insertBlankAfter, markLength, splitLines } from '../../../core/study/cardLines';
import { clozeSegments, hasCloze } from '../../../core/study/cloze';
import { parseLine, type LineKind } from '../../../core/study/cardText';
import { Inline } from '../../components/CardBack';
import { CardPicture, ImageAttach } from '../../components/CardImages';
import { useCardView } from '../../study/cardView';
import type { CardImagesEditor } from './useCardImagesEditor';
import type { CardsEditor } from './useCardsEditor';
import styles from './CardEditor.module.css';

const BULLET: Partial<Record<LineKind, string>> = { item: '•', pro: '+', con: '−', doubt: '?' };

// Na frente, cada lacuna vira uma pílula com a resposta e o número no fim (D169).
function Pills({ text }: { text: string }) {
  return (
    <>
      {clozeSegments(text).map((part, index) =>
        part.number === null ? (
          <Inline key={index} text={part.text} />
        ) : (
          <span key={index} className={styles.lacuna}>
            {part.text}
            <b>{part.number}</b>
          </span>
        ),
      )}
    </>
  );
}

function Formatted({ raw, front, onPress }: { raw: string; front: boolean; onPress: () => void }) {
  const { kind, text } = parseLine(raw);
  const body = text === '' ? null : front ? <Pills text={text} /> : <Inline text={text} />;
  const press = { onMouseDown: (event: React.MouseEvent) => event.preventDefault(), onClick: onPress };
  if (front) {
    return (
      <p className={styles.frase} data-lacuna={hasCloze(text) ? '' : undefined} {...press}>
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

function Active({ editor, raw, front, hint }: { editor: CardsEditor; raw: string; front: boolean; hint: string }) {
  const { field, typeLine } = editor;
  const prefix = markLength(raw);
  const value = raw.slice(prefix);
  const { kind } = parseLine(raw);

  useLayoutEffect(() => {
    if (field.current) fitHeight(field.current);
  });

  return (
    <div className={styles.ativa} data-tipo={front ? 'front' : kind}>
      {prefix > 0 && !front && <span className={styles.pilula}>{raw.slice(0, prefix).trim()}</span>}
      <textarea
        ref={field}
        data-field
        data-card-line
        data-card-side={front ? 'front' : 'back'}
        rows={1}
        className={styles.campo}
        value={value}
        spellCheck
        aria-label="Linha do cartão"
        placeholder={hint}
        onChange={(event) => typeLine(event.target.value, event.target.selectionStart)}
      />
    </div>
  );
}

type Side = 'front' | 'back';

// Seletor Frente | Verso (D170): só o lado com o cursor o mostra; o dedo também troca de lado.
function SideMarker({ side, current, extra, onGo }: { side: Side; current: boolean; extra: boolean; onGo: (to: Side) => void }) {
  const sides: readonly [Side, string][] = [
    ['front', 'Frente'],
    ['back', extra ? 'Extra' : 'Verso'],
  ];
  return (
    <div className={styles.marcador} data-aberto={current} aria-hidden={!current}>
      <div>
        <span className={styles.seletor} onPointerDown={(event) => event.preventDefault()}>
          {sides.map(([id, name]) => (
            <button key={id} type="button" tabIndex={-1} data-sel={id === side} onClick={() => onGo(id)}>
              <i className={styles.marca2} />
              {name}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

// No cartão novo o próprio cartão é o editor (D138, D169): contornado, com a linha do cursor em texto cru.
export function CardEditor({ editor, images }: { editor: CardsEditor; images: CardImagesEditor }) {
  const { source, line, activate, saved, field, replace } = editor;
  const { sideOf } = images.source;
  const view = useCardView();
  const lines = splitLines(source);
  const groups = groupLines(source);

  useLayoutEffect(() => {
    field.current?.scrollIntoView({ block: 'nearest' });
  }, [line, source, field]);

  const render = (index: number, front: boolean, hint: string) => {
    const raw = lines[index] ?? '';
    const drop = images.dropOn(index);
    const id = imageIdOf(raw);
    if (id !== null) {
      const active = index === line;
      return (
        <div key={index} {...drop}>
          <CardPicture
            src={images.source.src(id)}
            side={front ? 'frente' : 'verso'}
            active={active}
            focusRef={active ? editor.imageField : undefined}
            onPress={() => activate(index)}
            onZoom={() => images.zoomAt(index)}
            onRemove={() => images.removeAt(index)}
          />
        </div>
      );
    }
    return (
      <div key={index} {...drop}>
        {index === line ? (
          <Active editor={editor} raw={raw} front={front} hint={hint} />
        ) : (
          <Formatted raw={raw} front={front} onPress={() => activate(index)} />
        )}
      </div>
    );
  };

  return (
    <div className={styles.editor} aria-label="Cartões novos" onPaste={images.onPaste} {...images.dropOn(line)}>
      {saved !== null && (
        <p className={styles.salvou}>
          {saved} {saved === 1 ? 'cartão salvo' : 'cartões salvos'}.
        </p>
      )}
      {groups.map((group) => {
        const first = group.first;
        const fronts = frontLines(source, group);
        const more = fronts.slice(1);
        const others = group.lines.filter((index) => !fronts.includes(index));
        const frontImages = others.filter((index) => isFrontImage(lines[index] ?? '', sideOf));
        const rest = others.filter((index) => !isFrontImage(lines[index] ?? '', sideOf));
        const sides = images.sidesOf(first);
        const cloze = fronts.some((index) => hasCloze(lines[index] ?? ''));
        const onFront = fronts.includes(line) || frontImages.includes(line);
        const onBack = rest.includes(line);
        const empty = rest.every((index) => (lines[index] ?? '').trim() === '' && imageIdOf(lines[index] ?? '') === null);
        const hint = cloze ? 'Extra (opcional)' : 'Resposta';
        const openBack = () => {
          if (rest[0] === undefined) replace(insertBlankAfter(source, fronts.at(-1) ?? first));
          else activate(rest[0]);
        };
        const go = (to: Side) => (to === 'front' ? activate(first) : openBack());
        return (
          <article
            key={group.first}
            className={styles.carta}
            data-compacto={view.compact}
            data-vazio={empty ? '' : undefined}
            data-lado={onFront ? 'frente' : onBack ? 'verso' : ''}
          >
            <div className={styles.ladoFrente}>
              <SideMarker side="front" current={onFront} extra={cloze} onGo={go} />
              <div className={styles.linhaFrente}>
                {render(first, true, 'Pergunta, ou frase com lacuna')}
                <ImageAttach
                  side="frente"
                  count={sides.front.length}
                  onAttach={() => images.pick(first, 'frente')}
                  onOpen={() => images.openDrawer(first, 'frente')}
                />
              </div>
              {more.map((index) => render(index, true, ''))}
              {frontImages.map((index) => render(index, true, ''))}
            </div>
            <div className={styles.ladoVerso} data-cor-titulos={view.colorTitles}>
              <SideMarker side="back" current={onBack} extra={cloze} onGo={go} />
              {empty && !onBack ? (
                <p className={styles.sugestao} onMouseDown={(event) => event.preventDefault()} onClick={openBack}>
                  {hint}
                </p>
              ) : (
                rest.map((index) => {
                  const blank = (lines[index] ?? '').trim() === '';
                  if (index !== line && blank && index === rest.at(-1)) return null;
                  return render(index, false, rest.length === 1 ? hint : '');
                })
              )}
              <span className={styles.canto}>
                <ImageAttach
                  side="verso"
                  count={sides.back.length}
                  onAttach={() => images.pick(first, 'verso')}
                  onOpen={() => images.openDrawer(first, 'verso')}
                />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
