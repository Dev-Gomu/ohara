import { prefixed } from '../../core/appInfo';

export type TopAnimation = 'elastico' | 'nenhuma';

const MODES: readonly TopAnimation[] = ['elastico', 'nenhuma'];
const KEY = prefixed('animacao-topo');

export const TOP_ANIMATION_NAMES: Readonly<Record<TopAnimation, string>> = {
  elastico: 'Elástico',
  nenhuma: 'Nenhuma',
};

// Preferência de aparelho, como o tema: sem armazenamento vale o padrão.
export function currentTopAnimation(): TopAnimation {
  try {
    const value = localStorage.getItem(KEY);
    return MODES.find((mode) => mode === value) ?? 'elastico';
  } catch {
    return 'elastico';
  }
}

export function cycleTopAnimation(): TopAnimation {
  const next = MODES[(MODES.indexOf(currentTopAnimation()) + 1) % MODES.length] ?? 'elastico';
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Vale só até recarregar.
  }
  return next;
}

// Cada tela desenha a própria barra, então o índice da tela anterior vive aqui.
let previousIndex: number | null = null;

export interface TopBarParts {
  indicator: HTMLElement;
  numbers: readonly HTMLElement[];
  title: HTMLElement | null;
}

const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

// Elástico (ideia do RubberSegment, sem a biblioteca): cada ponta da pílula anda por conta própria.
// A da frente chega rápido e a de trás se estica e alcança depois, com uma folguinha de mola.
function elasticFrames(start: number, end: number, width: number): Keyframe[] {
  const total = 560;
  const steps = 28;
  const dir = end > start ? 1 : -1;
  const lead = (ms: number) => 1 - Math.pow(1 - clamp01(ms / 300), 4);
  const trail = (ms: number) => {
    const p = clamp01((ms - 70) / 490);
    return p >= 1 ? 1 : 1 - Math.exp(-9 * p) * Math.cos(7 * p);
  };
  return Array.from({ length: steps + 1 }, (_, step) => {
    const ms = (step / steps) * total;
    const left = start + (end - start) * (dir > 0 ? trail(ms) : lead(ms));
    const right = start + width + (end - start) * (dir > 0 ? lead(ms) : trail(ms));
    return { left: `${left}px`, width: `${Math.max(0, right - left)}px` };
  });
}

function play(parts: TopBarParts, from: number, to: number): void {
  const start = parts.numbers[from]?.offsetLeft;
  const end = parts.numbers[to]?.offsetLeft;
  const target = parts.numbers[to];
  if (start === undefined || end === undefined || !target) return;
  const dir = to > from ? 1 : -1;

  parts.indicator.animate(elasticFrames(start, end, target.offsetWidth), {
    duration: 560,
    easing: 'linear',
  });

  parts.title?.animate(
    [
      { transform: `translateX(${22 * dir}px)`, opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' },
  );
}

// Chamada depois que a tela mudou: o indicador já está no lugar certo, a animação só o leva até lá.
export function placeTopBar(parts: TopBarParts, current: number): void {
  const left = parts.numbers[current]?.offsetLeft ?? 0;
  parts.indicator.style.left = `${left}px`;
  parts.indicator.style.top = `${parts.numbers[current]?.offsetTop ?? 0}px`;
  parts.indicator.style.width = `${parts.numbers[current]?.offsetWidth ?? 0}px`;
  parts.indicator.style.height = `${parts.numbers[current]?.offsetHeight ?? 0}px`;
  const from = previousIndex;
  previousIndex = current;
  const mode = currentTopAnimation();
  if (from === null || from === current || mode === 'nenhuma' || reducedMotion()) return;
  play(parts, from, current);
}
