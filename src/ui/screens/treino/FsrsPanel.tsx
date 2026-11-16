import type { Grade } from '../../../core/study/fsrs';
import { parseStamp } from '../../../core/study/schedule';
import type { Card } from '../../../core/study/types';
import styles from './FsrsPanel.module.css';

// Painel de teste (pedido do usuário, 15/11): mostra o que o FSRS sabe do cartão. Sai depois da fase de teste.
const STATES = ['Novo', 'Aprendendo', 'Revisão', 'Reaprendendo'] as const;
const LABELS: Readonly<Record<Grade, string>> = { 1: 'Errei', 2: 'Difícil', 3: 'Bom', 4: 'Fácil' };

const pad = (n: number): string => String(n).padStart(2, '0');
const when = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
const decimal = (n: number): string => n.toFixed(1).replace('.', ',');

interface FsrsPanelProps {
  card: Card;
  retention: number;
  next: Record<Grade, Date> | null;
}

export function FsrsPanel({ card, retention, next }: FsrsPanelProps) {
  const items: [string, string][] = [
    ['Estado', STATES[card.state]],
    ['Retenção', `${Math.round(retention * 100)}%`],
    ['Vence', when(parseStamp(card.due))],
    ['Estabilidade', `${decimal(card.stability)} d`],
    ['Dificuldade', decimal(card.difficulty)],
    ['Repetições', String(card.reps)],
    ['Lapsos', String(card.lapses)],
    ['Última', card.lastReview ? when(parseStamp(card.lastReview)) : 'nunca'],
  ];
  return (
    <aside className={styles.painel} aria-label="Dados do FSRS (teste)">
      <span className={styles.titulo}>Teste · FSRS</span>
      <dl className={styles.lista}>
        {items.map(([name, value]) => (
          <div key={name} className={styles.item}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {next && (
        <dl className={styles.lista}>
          {([1, 2, 3, 4] as const).map((grade) => (
            <div key={grade} className={styles.item}>
              <dt>{LABELS[grade]} volta</dt>
              <dd>{when(next[grade])}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className={styles.nota}>
        Tempos em minutos são passos fixos de aprendizado (1, 6 e 10 min) e não mudam com a retenção. Só os
        intervalos em dias mudam: retenção maior, dias menores.
      </p>
    </aside>
  );
}
