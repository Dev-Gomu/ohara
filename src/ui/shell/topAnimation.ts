import { prefixed } from '../../core/appInfo';

export type TopAnimation = 'deslizar' | 'gelatina' | 'nenhuma';

const MODES: readonly TopAnimation[] = ['deslizar', 'gelatina', 'nenhuma'];
const KEY = prefixed('animacao-topo');

export const TOP_ANIMATION_NAMES: Readonly<Record<TopAnimation, string>> = {
  deslizar: 'Deslizar',
  gelatina: 'Gelatina',
  nenhuma: 'Nenhuma',
};

// Preferência de aparelho, como o tema: sem armazenamento vale o padrão.
export function currentTopAnimation(): TopAnimation {
  try {
    const value = localStorage.getItem(KEY);
    return MODES.find((mode) => mode === value) ?? 'deslizar';
  } catch {
    return 'deslizar';
  }
}

export function cycleTopAnimation(): TopAnimation {
  const next = MODES[(MODES.indexOf(currentTopAnimation()) + 1) % MODES.length] ?? 'deslizar';
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

function play(parts: TopBarParts, from: number, to: number, mode: TopAnimation): void {
  const start = parts.numbers[from]?.offsetLeft;
  const end = parts.numbers[to]?.offsetLeft;
  const target = parts.numbers[to];
  if (start === undefined || end === undefined || !target) return;
  const dir = to > from ? 1 : -1;

  if (mode === 'deslizar') {
    parts.indicator.animate([{ left: `${start}px` }, { left: `${end}px` }], {
      duration: 550,
      easing: 'cubic-bezier(.34,1.5,.5,1)',
    });
  } else {
    const width = target.offsetWidth;
    const left = Math.min(start, end);
    parts.indicator.animate(
      [
        { left: `${start}px`, width: `${width}px`, transform: 'scale(1,1)' },
        {
          left: `${left}px`,
          width: `${Math.abs(start - end) + width}px`,
          transform: 'scale(1,.86)',
          offset: 0.45,
        },
        { left: `${end}px`, width: `${width}px`, transform: 'scale(1.08,1.08)', offset: 0.8 },
        { left: `${end}px`, width: `${width}px`, transform: 'scale(1,1)' },
      ],
      { duration: 640, easing: 'cubic-bezier(.3,.8,.3,1)' },
    );
  }

  target.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
    {
      duration: 380,
      easing: 'ease-out',
      delay: 120,
    },
  );

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
  const from = previousIndex;
  previousIndex = current;
  const mode = currentTopAnimation();
  if (from === null || from === current || mode === 'nenhuma' || reducedMotion()) return;
  play(parts, from, current, mode);
}
