import { AnimatePresence, animate, motion, useTransform } from 'motion/react';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { anchorOf, DicaController, EASE_OUT } from './dicaController';
import styles from './Dica.module.css';

export interface DicaGroup {
  id: string;
  controller: DicaController;
  delay: number;
  warmWindow: number;
}

export const DicaContext = createContext<DicaGroup | null>(null);

const MARGIN = 8;
const TRAVEL_S = 0.32;
const POP_S = 0.16;
const POP_SCALE = 0.94;
const RISE = 4;
const SWAP_S = 0.14;
const SWAP_SHIFT = 10;
const PAD_X = 10;
const PAD_Y = 6;

const LAYER = {
  enter: (dir: number) => ({ opacity: dir === 0 ? 1 : 0, x: SWAP_SHIFT * dir }),
  show: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -SWAP_SHIFT * dir }),
};

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

// Uma dica só para a barra toda: cada botão pede, o grupo desenha e desliza.
export function DicaGrupo({
  delay = 400,
  warmWindow = 300,
  children,
}: {
  delay?: number;
  warmWindow?: number;
  children: ReactNode;
}) {
  const id = useId();
  const reduce = useReducedMotion() ?? false;
  const [controller] = useState(() => new DicaController());
  const view = useSyncExternalStore(controller.subscribe, controller.getView);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [group] = useState<DicaGroup>(() => ({ id, controller, delay, warmWindow }));

  const { ax, ay, w, h, presence } = controller;
  const place = useTransform(() => {
    const width = w.get();
    const height = h.get();
    const left = clamp(
      ax.get() - width / 2,
      MARGIN,
      Math.max(MARGIN, window.innerWidth - MARGIN - width),
    );
    const top = controller.view.current?.side === 'bottom' ? ay.get() : ay.get() - height;
    return `translate(${left}px, ${top}px)`;
  });
  const pop = useTransform(presence, (p) =>
    reduce
      ? 'none'
      : `translateY(${(1 - p) * RISE * (controller.view.current?.side === 'bottom' ? -1 : 1)}px) scale(${POP_SCALE + (1 - POP_SCALE) * p})`,
  );

  // Mede o texto e leva a caixa até o botão: desliza se já estava aberta, surge se estava fria.
  useLayoutEffect(() => {
    const current = view.current;
    const text = textRef.current;
    if (!current || !text || view.state !== 'open') return;
    const [x, y] = anchorOf(current.trigger, current.side, current.gap);
    const width = text.offsetWidth + PAD_X * 2;
    const height = text.offsetHeight + PAD_Y * 2;
    if (view.mode === 'move' && !reduce) {
      const spring = { type: 'spring', duration: TRAVEL_S, bounce: 0.1 } as const;
      animate(ax, x, spring);
      animate(ay, y, spring);
      animate(w, width, spring);
      animate(h, height, spring);
      animate(presence, 1, { duration: 0.12, ease: EASE_OUT });
      return;
    }
    ax.jump(x);
    ay.jump(y);
    w.jump(width);
    h.jump(height);
    if (view.mode === 'cold' && !reduce) {
      presence.jump(0);
      animate(presence, 1, { duration: POP_S, ease: EASE_OUT });
    } else presence.jump(1);
  }, [view, reduce, ax, ay, w, h, presence]);

  // Rolar ou redimensionar: a dica acompanha o botão; aba escondida fecha.
  useEffect(() => {
    if (view.state === 'closed') return undefined;
    let raf = 0;
    const follow = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const current = controller.view.current;
        if (!current) return;
        const [x, y] = anchorOf(current.trigger, current.side, current.gap);
        ax.jump(x);
        ay.jump(y);
      });
    };
    const onHidden = () => {
      const current = controller.view.current;
      if (document.visibilityState === 'hidden' && current) controller.hide(current.id, true);
    };
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    window.addEventListener('resize', follow);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', follow, { capture: true });
      window.removeEventListener('resize', follow);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [view.state, controller, ax, ay]);

  const current = view.current;
  const across = view.swap;
  return (
    <DicaContext.Provider value={group}>
      {children}
      {view.state !== 'closed' && current
        ? createPortal(
            <motion.span
              id={id}
              role="tooltip"
              className={styles.dica}
              style={{ transform: place, width: w, height: h }}
            >
              <motion.span
                className={styles.caixa}
                data-side={current.side}
                style={{ transform: pop, opacity: presence }}
              >
                <AnimatePresence initial={false} custom={across}>
                  <motion.span
                    key={current.id}
                    className={styles.camada}
                    custom={across}
                    variants={LAYER}
                    initial="enter"
                    animate="show"
                    exit="exit"
                    transition={{ duration: reduce ? 0 : SWAP_S, ease: EASE_OUT }}
                  >
                    <span
                      ref={(el) => {
                        if (el) textRef.current = el;
                      }}
                      className={styles.texto}
                    >
                      {current.content}
                      {current.shortcut ? (
                        <kbd className={styles.tecla}>{current.shortcut}</kbd>
                      ) : null}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </motion.span>,
            document.body,
          )
        : null}
    </DicaContext.Provider>
  );
}

export const useDicaGroup = (): DicaGroup | null => useContext(DicaContext);
