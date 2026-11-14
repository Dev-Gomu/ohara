import { backBlocks, spans, type BackLine, type LineKind } from '../../core/study/cardText';
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
        ) : span.style === 'italic' ? (
          <em key={index}>{span.text}</em>
        ) : span.style === 'underline' ? (
          <u key={index}>{span.text}</u>
        ) : span.style === 'sup' ? (
          <sup key={index}>{span.text}</sup>
        ) : span.style === 'sub' ? (
          <sub key={index}>{span.text}</sub>
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

function Lines({ lines }: { lines: readonly BackLine[] }) {
  return lines.map((line, index) => {
    const bullet = line.kind === 'number' ? `${line.position}.` : BULLETS[line.kind];
    return (
      <p key={index} className={styles.linha} data-tipo={line.kind}>
        {bullet !== undefined && <span className={styles.marca}>{bullet}</span>}
        <span>
          <Inline text={line.text} />
        </span>
      </p>
    );
  });
}

interface CardBackProps {
  back: string;
  compact?: boolean;
  // Títulos de seção na cor de destaque (D155); desligado, ficam na cor do texto.
  colorTitles?: boolean;
}

// Verso: seção (#), subtítulo (##, recuado) e texto; em duas colunas quando o cartão é largo.
export function CardBack({ back, compact, colorTitles = true }: CardBackProps) {
  return (
    <div className={styles.verso} data-compacto={compact} data-cor-titulos={colorTitles}>
      {backBlocks(back).map((block, index) => (
        <section key={index} className={styles.secao}>
          {block.title !== null && <h3 className={styles.titulo}>{block.title}</h3>}
          <Lines lines={block.lines} />
          {block.subs.map((sub, subIndex) => (
            <div key={subIndex} className={styles.sub}>
              <h4 className={styles.subtitulo}>{sub.title}</h4>
              <Lines lines={sub.lines} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

interface StudyCardProps extends CardBackProps {
  front: string;
}

// Uma peça só (D138, D155): frente cheia no azul de ação e verso no mesmo contorno.
export function StudyCard({ front, back, compact, colorTitles }: StudyCardProps) {
  return (
    <article className={styles.carta} data-compacto={compact}>
      <p className={styles.frente}>{front ? <Inline text={front} /> : 'Sem frente'}</p>
      {back ? (
        <CardBack back={back} compact={compact} colorTitles={colorTitles} />
      ) : (
        <p className={styles.falta}>Falta o verso</p>
      )}
    </article>
  );
}
