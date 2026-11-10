import styles from './Pill.module.css';

// Matéria: só a sigla, sobre a cor guardada como posição.
export function SubjectPill({ code, color }: { code: string; color: number }) {
  return (
    <span className={`${styles.pilula} ${styles.materia}`} data-materia={color}>
      {code}
    </span>
  );
}

// Estado: a marca alongada colorida nunca vai sem a palavra.
export function StatePill({ state, children }: { state: 'ok' | 'atencao'; children: string }) {
  return (
    <span className={`${styles.pilula} ${styles.estado}`} data-estado={state}>
      <i className={styles.marca} />
      {children}
    </span>
  );
}

// No máximo uma na tela: a aula em andamento.
export function NowPill() {
  return <span className={`${styles.pilula} ${styles.agora}`}>agora</span>;
}

// Evento na célula de dia: marca alongada na cor da matéria, sigla e texto curto (hora).
export function SubjectMark({
  code,
  color,
  children,
}: {
  code: string;
  color?: number | undefined;
  children?: string;
}) {
  return (
    <span className={styles.evento} data-materia={color}>
      <i className={styles.marcaMateria} />
      <b>{code}</b>
      {children !== undefined && <span>{children}</span>}
    </span>
  );
}

// Pílula do dia: dia da semana e número juntos; hoje fica cheia de ação.
export function DayPill({
  weekday,
  number,
  today,
}: {
  weekday: string;
  number: string;
  today?: boolean;
}) {
  return (
    <span className={styles.dia} data-hoje={today ?? false}>
      {[weekday, number].filter(Boolean).join(' ')}
    </span>
  );
}
