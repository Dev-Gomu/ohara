import { animate, motionValue } from 'motion/react';

// Dica "aquecida" (porte do WarmTooltip, React Bits; D175): a primeira espera um instante; enquanto
// o grupo está quente, a dica desliza para o vizinho em vez de fechar e abrir. Estado fora do React.
export type DicaSide = 'top' | 'bottom';
export type DicaMode = 'cold' | 'warm' | 'instant' | 'move';

export interface DicaPayload {
  id: string;
  trigger: HTMLElement;
  content: string;
  shortcut: string | undefined;
  side: DicaSide;
  gap: number;
  warmWindow: number;
}

export interface DicaView {
  state: 'closed' | 'open' | 'closing';
  current: DicaPayload | null;
  mode: DicaMode;
  // Para onde o texto antigo sai ao trocar de botão: -1 esquerda, 1 direita, 0 sem troca.
  swap: number;
}

const POP_MS = 160;
const GRACE_MS = 80;
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function anchorOf(trigger: HTMLElement, side: DicaSide, gap: number): [number, number] {
  const rect = trigger.getBoundingClientRect();
  return [rect.left + rect.width / 2, side === 'top' ? rect.top - gap : rect.bottom + gap];
}

const CLOSED: DicaView = { state: 'closed', current: null, mode: 'cold', swap: 0 };
const now = (): number => performance.now();

export class DicaController {
  view: DicaView = CLOSED;
  readonly ax = motionValue(0);
  readonly ay = motionValue(0);
  readonly w = motionValue(0);
  readonly h = motionValue(0);
  readonly presence = motionValue(0);
  private instant = false;
  private warmUntil = -Infinity;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getView = (): DicaView => this.view;

  private set(next: DicaView): void {
    this.view = next;
    this.listeners.forEach((listener) => listener());
  }

  isWarm(): boolean {
    return this.view.state !== 'closed' || now() < this.warmUntil;
  }

  show(payload: DicaPayload, mode: DicaMode): void {
    clearTimeout(this.closeTimer);
    clearTimeout(this.leaveTimer);
    const prev = this.view.current;
    const fresh = this.view.state === 'closed';
    let swap = 0;
    if (prev && prev.id !== payload.id) {
      const [from] = anchorOf(prev.trigger, prev.side, prev.gap);
      const [to] = anchorOf(payload.trigger, payload.side, payload.gap);
      swap = Math.sign(to - from) || 1;
    }
    this.instant = mode === 'instant';
    const next: DicaMode = fresh ? mode : mode === 'instant' ? 'instant' : 'move';
    this.set({ state: 'open', current: payload, mode: next, swap });
  }

  hide(id: string, instant: boolean): void {
    if (this.view.current?.id !== id || this.view.state !== 'open') return;
    clearTimeout(this.leaveTimer);
    if (instant || this.instant) this.beginClose(true);
    else this.leaveTimer = setTimeout(() => this.beginClose(false), GRACE_MS);
  }

  private beginClose(instant: boolean): void {
    const current = this.view.current;
    if (!current || this.view.state !== 'open') return;
    this.warmUntil = now() + current.warmWindow;
    this.set({ ...this.view, state: 'closing' });
    if (instant) {
      this.presence.jump(0);
      this.finishClose();
      return;
    }
    const closeMs = Math.round(POP_MS * 0.8);
    animate(this.presence, 0, { duration: closeMs / 1000, ease: EASE_OUT });
    this.closeTimer = setTimeout(() => this.finishClose(), closeMs);
  }

  private finishClose(): void {
    this.set(CLOSED);
  }

  reset(): void {
    clearTimeout(this.closeTimer);
    clearTimeout(this.leaveTimer);
    this.warmUntil = -Infinity;
    this.presence.jump(0);
    this.set(CLOSED);
  }
}
