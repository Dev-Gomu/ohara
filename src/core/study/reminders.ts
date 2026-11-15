import { daysBetween } from './dates';
import type { Reminder } from './types';

// D174: some ao fim do dia; o que ficou em aberto reaparece nos dias seguintes como atrasado.
export function isOverdue(item: Reminder, today: string): boolean {
  return !item.done && item.date < today;
}

export function overdueDays(item: Reminder, today: string): number {
  return isOverdue(item, today) ? daysBetween(item.date, today) : 0;
}

// Em aberto em cima (atrasados primeiro, o mais antigo antes), feitos embaixo. Dentro de cada grupo
// vale a ordem de criação. Feito de dia passado já saiu.
export function visibleReminders(items: readonly Reminder[], today: string): Reminder[] {
  const shown = items.filter((item) => item.date === today || isOverdue(item, today));
  const rank = (item: Reminder): number => (item.done ? 2 : isOverdue(item, today) ? 0 : 1);
  return shown
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        rank(a.item) - rank(b.item) ||
        (rank(a.item) === 0 ? a.item.date.localeCompare(b.item.date) : 0) ||
        a.index - b.index,
    )
    .map(({ item }) => item);
}

// Marcar um atrasado como feito leva para hoje: fica na lista até o fim do dia, e dá para desfazer.
export function toggledReminder(item: Reminder, today: string): Reminder {
  const done = !item.done;
  return { ...item, done, date: done && item.date < today ? today : item.date };
}

// D178: adiar leva o lembrete para outro dia; ele some da lista até lá e volta ao chegar o dia.
export function postponedReminder(item: Reminder, date: string): Reminder {
  return { ...item, date, done: false };
}

export function upcomingReminders(items: readonly Reminder[], today: string): Reminder[] {
  return items.filter((item) => !item.done && item.date > today);
}
