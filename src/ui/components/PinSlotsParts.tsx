import { motion, useTransform, type MotionValue } from 'motion/react';
import { useState } from 'react';
import styles from './PinSlots.module.css';

export const SINK_FADE = 0.6;
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
export const digitsOf = (raw: unknown): string => String(raw ?? '').replace(/\D/g, '');
export const toSlots = (raw: unknown, n: number): string[] => {
  const d = digitsOf(raw).slice(0, n);
  return Array.from({ length: n }, (_, i) => d[i] ?? '');
};
export const firstEmptyOf = (slots: readonly string[]): number => {
  const i = slots.indexOf('');
  return i === -1 ? slots.length - 1 : i;
};
export const isFull = (slots: readonly string[]): boolean => slots.every(Boolean);

interface SlotProps {
  mv: MotionValue<number>;
  drop: MotionValue<number>;
  char: string;
  active: boolean;
  rise: number;
  sink: number;
}

// Uma casa: o enchimento "pousa" com mola e o dígito sobe; no acerto, afunda em cascata.
export function Slot({ mv, drop, char, active, rise, sink }: SlotProps) {
  const [shown, setShown] = useState(char);
  if (char && char !== shown) setShown(char);
  const fill = useTransform(mv, (t) => `scale(${Math.max(t, 0)})`);
  const lift = useTransform(
    [mv, drop],
    ([t, d]: number[]) => `translateY(${(1 - (t ?? 0)) * rise + Math.max(d ?? 0, 0) * sink}px)`,
  );
  const ink = useTransform(
    [mv, drop],
    ([t, d]: number[]) => clamp01(t ?? 0) * (1 - clamp01((d ?? 0) / SINK_FADE)),
  );
  return (
    <span
      className={styles.slot}
      data-active={active ? '' : undefined}
      data-filled={char ? '' : undefined}
      aria-hidden="true"
    >
      <motion.span className={styles.fill} style={{ transform: fill }} />
      {shown ? (
        <motion.span className={styles.digit} style={{ transform: lift, opacity: ink }}>
          {shown}
        </motion.span>
      ) : null}
    </span>
  );
}
