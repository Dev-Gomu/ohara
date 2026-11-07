const DAY = 86_400_000;

// Datas de estudo são dias do calendário, sem fuso: "2026-11-07".
export function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDay(day: string): Date {
  const [year = 1970, month = 1, date = 1] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export function addDays(day: string, amount: number): string {
  const date = parseDay(day);
  date.setDate(date.getDate() + amount);
  return isoDay(date);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY);
}

const MONTHS = 'jan fev mar abr mai jun jul ago set out nov dez'.split(' ');
const MONTH_NAMES =
  'janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro'.split(
    ' ',
  );
const WEEKDAYS = 'domingo segunda terça quarta quinta sexta sábado'.split(' ');

export function shortDate(day: string): string {
  const date = parseDay(day);
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
}

export function longDate(day: string): string {
  const date = parseDay(day);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function monthName(day: string): string {
  return MONTH_NAMES[parseDay(day).getMonth()] ?? '';
}

// Semanas completas, de domingo a sábado, que cobrem o mês do dia dado.
export function monthGrid(day: string): string[] {
  const first = parseDay(day);
  first.setDate(1);
  const start = addDays(isoDay(first), -first.getDay());
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const cells = daysBetween(start, isoDay(last)) + 1;
  const total = Math.ceil(cells / 7) * 7;
  return Array.from({ length: total }, (_, index) => addDays(start, index));
}
