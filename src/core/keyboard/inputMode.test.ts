import { describe, expect, it } from 'vitest';
import { inputModeOf } from './inputMode';

const target = { kind: 'outside' } as const;

describe('inputModeOf', () => {
  it('mouse não vira toque', () => {
    expect(inputModeOf({ type: 'touch', target, pointer: 'mouse' })).toBe('mouse');
  });
  it('dedo, caneta e foco sem ponteiro viram toque', () => {
    expect(inputModeOf({ type: 'touch', target, pointer: 'touch' })).toBe('toque');
    expect(inputModeOf({ type: 'touch', target })).toBe('toque');
  });
  it('tecla é teclado', () => {
    expect(inputModeOf({ type: 'enter' })).toBe('teclado');
  });
});
