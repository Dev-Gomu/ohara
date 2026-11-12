// Relógio híbrido (D29): ordena como texto e nunca anda para trás, mesmo se o relógio do aparelho voltar.
export interface HlcState {
  ms: number;
  counter: number;
}

export const HLC_ZERO: HlcState = { ms: 0, counter: 0 };

export function tick(state: HlcState, now: number): HlcState {
  if (now > state.ms) return { ms: now, counter: 0 };
  return { ms: state.ms, counter: state.counter + 1 };
}

export function formatHlc(state: HlcState, device: string): string {
  const ms = String(state.ms).padStart(13, '0');
  const counter = String(state.counter).padStart(4, '0');
  return `${ms}-${counter}-${device}`;
}

export function parseHlc(value: string | null): HlcState {
  const match = /^(\d{13})-(\d{4})-/.exec(value ?? '');
  if (!match) return HLC_ZERO;
  return { ms: Number(match[1]), counter: Number(match[2]) };
}
