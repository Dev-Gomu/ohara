import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import { toIcs } from './ics';

const today = '2026-11-07';
const ics = toIcs(createFixtures(today), today);

describe('.ics', () => {
  it('abre e fecha o calendário', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('usa quebra de linha do formato', () => {
    expect(ics.replaceAll('\r\n', '').includes('\n')).toBe(false);
  });

  it('traz aula e prova com data e hora', () => {
    expect(ics).toContain('DTSTART:20261107T130000');
    expect(ics).toContain('SUMMARY:Prova de Genética');
  });

  it('escapa vírgula e ponto e vírgula', () => {
    const data = createFixtures(today);
    const first = data.events[0];
    const events = first ? [{ ...first, title: 'A, B; C' }] : [];
    expect(toIcs({ ...data, events }, today)).toContain('A\\, B\\; C');
  });

  it('não passa de 75 caracteres por linha', () => {
    expect(ics.split('\r\n').every((line) => line.length <= 75)).toBe(true);
  });
});
