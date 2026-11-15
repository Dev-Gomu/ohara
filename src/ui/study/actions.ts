import { postponedReminder, toggledReminder } from '../../core/study/reminders';
import { storage, today } from './study';

export function toggleReminder(id: string | undefined): void {
  storage.write((data) => ({
    ...data,
    reminders: data.reminders.map((item) =>
      item.id === id ? toggledReminder(item, today) : item,
    ),
  }));
}

export function postponeReminder(id: string, date: string): void {
  storage.write((data) => ({
    ...data,
    reminders: data.reminders.map((item) =>
      item.id === id ? postponedReminder(item, date) : item,
    ),
  }));
}
