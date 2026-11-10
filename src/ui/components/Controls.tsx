import type { InputHTMLAttributes } from 'react';
import { Key } from './Key';
import { Target, type TargetProps } from './Target';
import styles from './Controls.module.css';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  shortcut?: string;
}

// Campo de busca e de formulário. As teclas são do texto: o listener cuida disso pelo nível.
export function Field({ label, shortcut, ...input }: FieldProps) {
  return (
    <label className={styles.campo}>
      <input className={styles.entrada} aria-label={label} placeholder={label} {...input} />
      {shortcut !== undefined && <Key>{shortcut}</Key>}
    </label>
  );
}

interface SwitchProps {
  label: string;
  on: boolean;
  cursor?: boolean;
  onChange?: (on: boolean) => void;
}

export function Toggle({ label, on, cursor, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      tabIndex={-1}
      className={styles.chave}
      aria-checked={on}
      aria-label={label}
      data-cursor={cursor ? '' : undefined}
      onClick={() => onChange?.(!on)}
    />
  );
}

export function Check({ label, on, cursor, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="checkbox"
      tabIndex={-1}
      className={styles.caixa}
      aria-checked={on}
      aria-label={label}
      data-cursor={cursor ? '' : undefined}
      onClick={() => onChange?.(!on)}
    >
      {on && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

interface DayProps extends TargetProps {
  day: number;
  today?: boolean;
  // Marca alongada com a cor da matéria (dia de prova ou de aula).
  subject?: number;
}

export function Day({ day, today, subject, ...target }: DayProps) {
  return (
    <Target className={`${styles.dia} ${today ? styles.hoje : ''}`} {...target}>
      {day}
      {subject !== undefined && <i className={styles.marca} data-materia={subject} />}
    </Target>
  );
}

// Progresso: o número vai sempre ao lado da barra.
export function Progress({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={styles.progresso}>
      <div
        className={styles.barra}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <i style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.numero}>
        {percent}% {label}
      </span>
    </div>
  );
}
