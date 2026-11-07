import { backLines, spans, type LineKind } from '../../core/study/cardText';
import styles from './CardBack.module.css';

const BULLETS: Partial<Record<LineKind, string>> = {
  item: '•',
  pro: '+',
  con: '−',
  doubt: '?',
};

export function Inline({ text }: { text: string }) {
  return (
    <>
      {spans(text).map((span, index) =>
        span.style === 'bold' ? (
          <strong key={index}>{span.text}</strong>
        ) : span.style === 'mark' ? (
          <mark key={index} className={styles.destaque}>
            {span.text}
          </mark>
        ) : (
          <span key={index}>{span.text}</span>
        ),
      )}
    </>
  );
}

// Verso do cartão já formatado: seção, listas e marcas clínicas (+ a favor, − contra, ? dúvida).
export function CardBack({ back, compact }: { back: string; compact?: boolean }) {
  return (
    <div className={styles.verso} data-compacto={compact}>
      {backLines(back).map((line, index) => {
        const bullet = line.kind === 'number' ? `${line.position}.` : BULLETS[line.kind];
        return (
          <p key={index} className={styles.linha} data-tipo={line.kind}>
            {bullet !== undefined && <span className={styles.marca}>{bullet}</span>}
            <span>
              <Inline text={line.text} />
            </span>
          </p>
        );
      })}
    </div>
  );
}
