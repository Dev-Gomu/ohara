import { describe, expect, it } from 'vitest';
import {
  isOverdue,
  overdueDays,
  postponedReminder,
  toggledReminder,
  upcomingReminders,
  visibleReminders,
} from './reminders';
import type { Reminder } from './types';

const TODAY = '2026-11-15';
const r = (id: string, date: string, done = false): Reminder => ({ id, text: id, date, done });

describe('lembretes', () => {
  it('só atrasado em aberto reaparece; feito de ontem some e futuro não aparece', () => {
    const list = [r('ontem-aberto', '2026-11-14'), r('ontem-feito', '2026-11-14', true), r('amanha', '2026-11-16')];
    expect(visibleReminders(list, TODAY).map((i) => i.id)).toEqual(['ontem-aberto']);
  });

  it('ordem: atrasados (mais antigo primeiro), de hoje em aberto, feitos embaixo', () => {
    const list = [
      r('hoje-feito', TODAY, true),
      r('hoje-a', TODAY),
      r('velho', '2026-11-10'),
      r('hoje-b', TODAY),
      r('ontem', '2026-11-14'),
    ];
    expect(visibleReminders(list, TODAY).map((i) => i.id)).toEqual([
      'velho',
      'ontem',
      'hoje-a',
      'hoje-b',
      'hoje-feito',
    ]);
  });

  it('conta os dias de atraso só para o que está em aberto e passou', () => {
    expect(overdueDays(r('a', '2026-11-12'), TODAY)).toBe(3);
    expect(overdueDays(r('b', TODAY), TODAY)).toBe(0);
    expect(isOverdue(r('c', '2026-11-12', true), TODAY)).toBe(false);
  });

  it('marcar atrasado como feito leva para hoje e desmarcar mantém o dia', () => {
    const done = toggledReminder(r('a', '2026-11-12'), TODAY);
    expect(done).toMatchObject({ done: true, date: TODAY });
    expect(toggledReminder(done, TODAY)).toMatchObject({ done: false, date: TODAY });
    expect(toggledReminder(r('b', TODAY), TODAY).date).toBe(TODAY);
  });
});

describe('adiar e agendados', () => {
  it('adiar muda o dia, reabre e tira da lista de hoje', () => {
    const moved = postponedReminder(r('a', '2026-11-10', true), '2026-11-20');
    expect(moved).toMatchObject({ date: '2026-11-20', done: false });
    expect(visibleReminders([moved], TODAY)).toEqual([]);
  });

  it('agendados são os em aberto com data futura', () => {
    const list = [r('f', '2026-11-20'), r('h', TODAY), r('ff', '2026-11-21', true)];
    expect(upcomingReminders(list, TODAY).map((i) => i.id)).toEqual(['f']);
  });
});
