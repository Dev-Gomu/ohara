import { Target, type TargetProps } from './Target';
import styles from './FaultCell.module.css';

interface FaultCellProps extends TargetProps {
  code: string;
  // Horas faltadas e limite até agora; null enquanto não houve aula.
  missed: number | null;
  limit: number | null;
  attention: boolean;
}

function hoursText(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
}

// Célula de Faltas: só texto. A bolinha no canto da sigla (exceção ao "sem círculos", D128) marca atenção.
export function FaultCell({ code, missed, limit, attention, ...target }: FaultCellProps) {
  return (
    <Target className={styles.celula} {...target}>
      <b className={`${styles.sigla} ${attention ? styles.atencao : ''}`}>{code}</b>
      <span className={styles.numero}>
        {missed === null || limit === null ? (
          '—'
        ) : (
          <>
            {hoursText(missed)}
            <small>/{hoursText(limit)}</small>
          </>
        )}
      </span>
    </Target>
  );
}
