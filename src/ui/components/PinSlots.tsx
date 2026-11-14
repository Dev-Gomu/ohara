import {
  animate,
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import styles from './PinSlots.module.css';
import { Slot, clamp01, digitsOf, firstEmptyOf, isFull, toSlots } from './PinSlotsParts';

// Código de N casas (PIN). Porte do Code Slots do React Bits, aprovado na bancada (V2).
// Campo de texto próprio: só dígitos e Backspace, sem escutar tecla (D15). Clique ou toque escolhe a casa.
export type PinStatus = 'idle' | 'success' | 'error';

interface PinSlotsProps {
  length?: number;
  status?: PinStatus;
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
}

const SENTINEL = '\u200b';
const SIZE = 44;
const GAP = 8;
const RADIUS = 12;
const BOUNCE = 0.2;
const SETTLE = 0.3;
const RISE = 8;
const CASCADE = 20;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SINK_DELAY = 0.06;
const SINK_STEP = 0.03;
const CHECK_RISE = 8;

export function PinSlots({
  length = 6,
  status = 'idle',
  mask = true,
  disabled = false,
  autoFocus = false,
  ariaLabel = 'PIN',
  onChange,
  onComplete,
}: PinSlotsProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<string[]>(() => toSlots('', length));
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const activeMv = useMotionValue(0);
  const openMv = useMotionValue(status === 'success' ? 1 : 0);
  const checkMv = useMotionValue(status === 'success' ? 1 : 0);
  const glide = useRef(new Set<number>());
  const target = useRef<number[]>([]);
  const draining = useRef(false);
  const drainTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const statusRef = useRef(status);
  const veiled = status === 'success';
  const slotsRef = useRef(slots);
  const reduceRef = useRef(reduce);
  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  const { mvs, drops } = useMemo(
    () => ({
      mvs: Array.from({ length }, () => motionValue(0)),
      drops: Array.from({ length }, () => motionValue(0)),
    }),
    [length],
  );
  const pitch = SIZE + GAP;
  const height = Math.round(SIZE * 1.18);

  const drive = useCallback(
    (i: number, to: number, delayMs = 0) => {
      const mv = mvs[i];
      if (!mv) return;
      target.current[i] = to;
      if (reduceRef.current) {
        mv.jump(to);
        return;
      }
      animate(mv, to, { type: 'spring', duration: SETTLE, bounce: BOUNCE, delay: delayMs / 1000 });
    },
    [mvs],
  );
  const land = useCallback(
    (i: number, delayMs = 0) => {
      if ((mvs[i]?.get() ?? 0) > 0) mvs[i]?.jump(0);
      drive(i, 1, delayMs);
    },
    [mvs, drive],
  );
  const moveActive = useCallback(
    (next: number, crossed: readonly number[]) => {
      crossed.forEach((j) => glide.current.add(j));
      activeMv.jump(next);
      setActive(next);
    },
    [activeMv],
  );
  const jumpActive = useCallback(
    (next: number) => {
      glide.current.clear();
      activeMv.jump(next);
      setActive(next);
    },
    [activeMv],
  );

  // O cursor desliza junto com as casas que estão pousando.
  const caretX = useTransform(() => {
    const a = activeMv.get();
    let x = a * pitch;
    mvs.forEach((mv, j) => {
      if (!glide.current.has(j)) return;
      const h = clamp01(mv.get());
      const to = target.current[j];
      if (to === undefined || h === clamp01(to)) {
        glide.current.delete(j);
        return;
      }
      x += j < a ? -(1 - h) * pitch : h * pitch;
    });
    return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
  });
  const caretTransform = useTransform(caretX, (x) => `translateX(${x}px)`);
  const washRadius = Math.min(RADIUS, SIZE / 2);
  const washClip = useTransform(
    openMv,
    (o) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`,
  );
  const checkTransform = useTransform(
    checkMv,
    (c) => `translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`,
  );
  const checkOpacity = useTransform(checkMv, clamp01);

  const commit = useCallback(
    (next: string[]) => {
      const prev = slotsRef.current;
      slotsRef.current = next;
      setSlots(next);
      onChange?.(next.join(''));
      if (!isFull(prev) && isFull(next)) onComplete?.(next.join(''));
    },
    [onChange, onComplete],
  );

  const insert = (raw: string, from = active) => {
    const digits = digitsOf(raw);
    if (!digits) return;
    const next = [...slotsRef.current];
    const crossed: number[] = [];
    const step = reduce ? 0 : CASCADE;
    let i = from;
    for (const ch of digits) {
      if (i >= length) break;
      next[i] = ch;
      land(i, (i - from) * step);
      crossed.push(i);
      i += 1;
    }
    if (!crossed.length) return;
    commit(next);
    moveActive(Math.min(i, length - 1), crossed);
  };
  const clearSlot = (i: number, stepBack = false) => {
    if (!slotsRef.current[i]) {
      if (stepBack) jumpActive(i);
      return;
    }
    const next = [...slotsRef.current];
    next[i] = '';
    drive(i, 0);
    commit(next);
    if (stepBack) moveActive(i, [i]);
  };

  const isBusy = () => disabled || draining.current || status === 'success';
  // Sem keydown (D15): o campo guarda um caractere invisível e tudo vem do evento de entrada.
  // Texto novo traz dígitos (digitar ou colar); campo vazio é o Backspace.
  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (isBusy()) return;
    const raw = e.currentTarget.value;
    const d = digitsOf(raw);
    if (d) insert(d, d.length === 1 ? active : 0);
    else if (!raw.includes(SENTINEL)) {
      if (slotsRef.current[active]) clearSlot(active);
      else if (active > 0) clearSlot(active - 1, true);
    }
  };
  const onRowMouseDown = (e: MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    const row = rowRef.current;
    if (row && !draining.current && status !== 'success') {
      const rect = row.getBoundingClientRect();
      const zoom = rect.width / (row.offsetWidth || rect.width) || 1;
      const i = Math.floor((e.clientX - rect.left) / zoom / pitch);
      jumpActive(Math.max(0, Math.min(i, firstEmptyOf(slotsRef.current))));
    }
    inputRef.current?.focus();
  };

  // Acerto: a faixa abre, as casas afundam em cascata e o visto sobe.
  useEffect(() => {
    const was = statusRef.current;
    statusRef.current = status;
    if (status === 'success') {
      if (reduceRef.current) {
        openMv.jump(1);
        drops.forEach((d) => d.jump(1));
        checkMv.jump(1);
        return;
      }
      animate(openMv, 1, { duration: 0.3, ease: EASE_OUT });
      drops.forEach((d, k) =>
        animate(d, 1, { type: 'spring', duration: 0.3, bounce: 0, delay: SINK_DELAY + k * SINK_STEP }),
      );
      animate(checkMv, 1, { type: 'spring', duration: 0.35, bounce: BOUNCE, delay: 0.28 });
      return;
    }
    if (was !== 'success') return;
    openMv.jump(0);
    checkMv.jump(0);
    drops.forEach((d) => d.jump(0));
  }, [status, openMv, checkMv, drops]);

  // Erro: as casas esvaziam de trás para frente e o cursor volta ao começo.
  useEffect(() => {
    if (status !== 'error') return;
    const filled = slotsRef.current.flatMap((c, i) => (c ? [i] : [])).reverse();
    if (!filled.length) return;
    draining.current = true;
    const step = reduceRef.current ? 0 : CASCADE;
    filled.forEach((i, k) => drive(i, 0, k * step));
    moveActive(0, slotsRef.current.map((_, j) => j));
    clearTimeout(drainTimer.current);
    drainTimer.current = setTimeout(
      () => {
        draining.current = false;
        commit(Array.from({ length }, () => ''));
      },
      reduceRef.current ? 300 : (filled.length - 1) * step + SETTLE * 1000,
    );
  }, [status, drive, moveActive, commit, length]);

  useEffect(() => () => clearTimeout(drainTimer.current), []);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const showCaret =
    focused && !disabled && !veiled && (status === 'error' || !slots[active]);
  const vars = {
    '--cs-size': `${SIZE}px`,
    '--cs-height': `${height}px`,
    '--cs-gap': `${GAP}px`,
    '--cs-radius': `${Math.min(RADIUS, SIZE / 2)}px`,
    '--cs-font': `${Math.round(SIZE * 0.5)}px`,
  } as CSSProperties;
  const count = slots.filter(Boolean).length;

  return (
    <div className={styles.raiz} style={vars}>
      <div
        ref={rowRef}
        className={styles.linha}
        data-status={status}
        data-disabled={disabled ? '' : undefined}
        onMouseDown={onRowMouseDown}
      >
        <input
          ref={inputRef}
          className={styles.entrada}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={SENTINEL}
          aria-label={ariaLabel}
          aria-invalid={status === 'error'}
          aria-describedby={`${uid}-conta`}
          disabled={disabled}
          readOnly={status === 'success'}
          onChange={onInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {slots.map((ch, i) => (
          <Slot
            key={i}
            mv={mvs[i] as MotionValue<number>}
            drop={drops[i] as MotionValue<number>}
            char={mask && ch ? '•' : ch}
            active={focused && i === active}
            rise={RISE}
            sink={Math.round(height * 0.5)}
          />
        ))}
        <motion.span className={styles.veu} aria-hidden="true" style={{ clipPath: washClip }}>
          <motion.span className={styles.visto} style={{ transform: checkTransform, opacity: checkOpacity }}>
            <svg
              width={Math.round(SIZE * 0.6)}
              height={Math.round(SIZE * 0.6)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </motion.span>
        </motion.span>
        <motion.span
          className={styles.cursor}
          aria-hidden="true"
          data-show={showCaret ? '' : undefined}
          style={{ transform: caretTransform }}
        >
          <span key={active} className={styles.cursorLinha} />
        </motion.span>
      </div>
      <span id={`${uid}-conta`} className={styles.leitor} aria-live="polite">
        {status === 'success' ? 'PIN aceito' : `${count} de ${length} dígitos`}
      </span>
    </div>
  );
}
