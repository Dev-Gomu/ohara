import { describe, expect, it } from 'vitest';
import { addVersion, MAX_VERSIONS, VERSION_INTERVAL, versionsOf } from './versions';

let counter = 0;
const uid = () => `v${(counter += 1)}`;

describe('histórico das Anotações (D34)', () => {
  it('guarda a primeira versão', () => {
    expect(addVersion([], 'a', '<p>1</p>', 0, uid())).toHaveLength(1);
  });

  it('não guarda antes de 5 minutos', () => {
    const first = addVersion([], 'a', '<p>1</p>', 0, uid());
    expect(addVersion(first, 'a', '<p>2</p>', VERSION_INTERVAL - 1, uid())).toBe(first);
  });

  it('guarda depois de 5 minutos', () => {
    const first = addVersion([], 'a', '<p>1</p>', 0, uid());
    expect(addVersion(first, 'a', '<p>2</p>', VERSION_INTERVAL, uid())).toHaveLength(2);
  });

  it('não repete o mesmo texto', () => {
    const first = addVersion([], 'a', '<p>1</p>', 0, uid());
    expect(addVersion(first, 'a', '<p>1</p>', VERSION_INTERVAL * 2, uid())).toBe(first);
  });

  it('mantém no máximo 50 por aula, sem tocar nas outras', () => {
    let versions = addVersion([], 'b', 'outra', 0, uid());
    for (let index = 0; index < 60; index += 1) {
      versions = addVersion(versions, 'a', `${index}`, index * VERSION_INTERVAL, uid());
    }
    expect(versionsOf(versions, 'a')).toHaveLength(MAX_VERSIONS);
    expect(versionsOf(versions, 'b')).toHaveLength(1);
  });

  it('mostra a mais recente primeiro', () => {
    const first = addVersion([], 'a', '1', 0, uid());
    const second = addVersion(first, 'a', '2', VERSION_INTERVAL, uid());
    expect(versionsOf(second, 'a')[0]?.html).toBe('2');
  });
});
