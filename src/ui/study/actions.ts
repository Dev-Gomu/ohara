import { storage } from './study';

export function toggleReminder(id: string | undefined): void {
  storage.write((data) => ({
    ...data,
    reminders: data.reminders.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    ),
  }));
}
