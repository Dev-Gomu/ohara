import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { Target, type TargetProps } from './Target';
import styles from './CheckItem.module.css';

// Item de checklist: a caixa enche com mola, o visto se desenha e o texto é riscado da esquerda.
// Porte do SpringCheck (React Bits), versão compacta aprovada (D173). O clique e o Enter são do Target.
interface CheckItemProps extends TargetProps {
  title: string;
  checked: boolean;
  // Dito por leitor de tela quando a pílula só mostra um número.
  note?: string | undefined;
  // Pílula no fim da linha (ex.: atrasado).
  children?: ReactNode;
}

const VISUAL_DURATION = 0.2;
const BOUNCE = 0.35;
const RULE_START = 0.12;
const RULE_END = 0.84;
const SWELL = 0.35;
const DONE_OPACITY = 0.5;
const TICK_PATH = 'M5 12.5l4.5 4.5L19 7.5';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const zetaOf = (bounce: number): number =>
  bounce <= 0 ? 1 : -Math.log(bounce) / Math.sqrt(Math.PI ** 2 + Math.log(bounce) ** 2);

export function CheckItem({ title, checked, note, children, ...target }: CheckItemProps) {
  const reduce = useReducedMotion() ?? false;
  const t = useMotionValue(checked ? 1 : 0);

  useEffect(() => {
    const goal = checked ? 1 : 0;
    if (reduce) {
      t.jump(goal);
      return undefined;
    }
    const controls = animate(t, goal, {
      type: 'spring',
      visualDuration: VISUAL_DURATION,
      bounce: 1 - zetaOf(BOUNCE),
    });
    return () => controls.stop();
  }, [checked, reduce, t]);

  const fill = useTransform(t, (v) => Math.max(v, 0));
  const box = useTransform(t, (v) => 1 + SWELL * Math.max(0, v - 1));
  const tick = useTransform(t, (v) => 1 - clamp01(v));
  const words = useTransform(t, (v) => 1 - (1 - DONE_OPACITY) * clamp01(v));
  const rule = useTransform(t, (v) => clamp01((clamp01(v) - RULE_START) / (RULE_END - RULE_START)));

  return (
    <Target className={styles.item} label={[title, checked ? 'feito' : '', note ?? ''].filter(Boolean).join(', ')} {...target}>
      <motion.span className={styles.caixa} style={{ scale: box }} aria-hidden="true">
        <span className={styles.anel} />
        <motion.span className={styles.enchimento} style={{ scale: fill }} />
        <svg className={styles.visto} viewBox="0 0 24 24">
          <motion.path d={TICK_PATH} pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: tick }} />
        </svg>
      </motion.span>
      <span className={styles.rotulo}>
        <motion.span className={styles.palavras} style={{ opacity: words }}>
          {title}
        </motion.span>
        <motion.span className={styles.risco} aria-hidden="true" style={{ scaleX: rule }} />
      </span>
      {children !== undefined && <span className={styles.fim}>{children}</span>}
    </Target>
  );
}
