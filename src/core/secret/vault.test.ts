import { describe, expect, it } from 'vitest';
import { CODE_LENGTH, fromBase64, newRecoveryCode, normalizeCode, toBase64 } from './codec';
import { exportPairing, pairFromText } from './pairing';
import {
  createVault,
  ITERATIONS,
  makePin,
  openRecord,
  pinProblem,
  PIN_MAX_FAILS,
  recoverWithCode,
  sealRecord,
  tryPin,
  unlockWithCode,
} from './vault';

// Poucas iterações só nos testes, para não demorar; o padrão de verdade é conferido abaixo.
const FAST = 1000;
const PIN = '482193';

describe('padrões', () => {
  it('usa PBKDF2 com 600 000 iterações e exige PIN de exatamente 6 números', () => {
    expect(ITERATIONS).toBe(600_000);
    for (const bad of ['12', '4821', '12ab34', '1234567']) expect(pinProblem(bad)).not.toBeNull();
    expect(pinProblem('000123')).toBeNull();
  });

  it('o código de recuperação tem 20 caracteres em grupos de 4 e aceita variações', () => {
    const code = newRecoveryCode();
    expect(code).toMatch(/^[A-Z2-7]{4}(-[A-Z2-7]{4}){4}$/);
    expect(normalizeCode(code.toLowerCase().replaceAll('-', ' '))).toHaveLength(CODE_LENGTH);
    expect(normalizeCode('ABCD-0189-ABCD-ABCD-ABCD')).toBe('');
  });

  it('base64 faz ida e volta', () => {
    const bytes = new Uint8Array([0, 1, 254, 255, 128]);
    expect([...fromBase64(toBase64(bytes))]).toEqual([...bytes]);
  });
});

describe('cifra de registros', () => {
  it('cifra e decifra de volta', async () => {
    const { key } = await createVault(PIN, FAST);
    const sealed = await sealRecord(key, 'r1', { kind: 'item', nota: 8.5 });
    expect(JSON.stringify(sealed)).not.toContain('8.5');
    expect(await openRecord(key, sealed)).toEqual({ kind: 'item', nota: 8.5 });
  });

  it('um byte trocado no texto cifrado falha', async () => {
    const { key } = await createVault(PIN, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 9 });
    const bytes = fromBase64(sealed.ciphertext);
    bytes[0] = (bytes[0] ?? 0) ^ 1;
    expect(await openRecord(key, { ...sealed, ciphertext: toBase64(bytes) })).toBeNull();
  });

  it('trocar o id (AAD) falha', async () => {
    const { key } = await createVault(PIN, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 9 });
    expect(await openRecord(key, { ...sealed, id: 'r2' })).toBeNull();
  });

  it('o mesmo texto cifrado duas vezes dá resultados diferentes', async () => {
    const { key } = await createVault(PIN, FAST);
    const a = await sealRecord(key, 'r1', { nota: 9 });
    const b = await sealRecord(key, 'r1', { nota: 9 });
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });
});

describe('criar o cofre (D172)', () => {
  it('não guarda frase: só o código tranca a vault e o PIN tranca a chave do aparelho', async () => {
    const { vault, pin, key } = await createVault(PIN, FAST);
    expect(vault.passWrapped).toBe('');
    expect(vault.iterations).toBe(FAST);
    expect(key.extractable).toBe(false);
    const sealed = await sealRecord(key, 'r1', { nota: 7 });
    const opened = (await tryPin(pin, PIN)).key;
    expect(opened && (await openRecord(opened, sealed))).toEqual({ nota: 7 });
  });

  it('recusa PIN inválido ao criar', async () => {
    await expect(createVault('12', FAST)).rejects.toThrow();
  });

  it('duas criações geram chaves diferentes', async () => {
    const a = await createVault(PIN, FAST);
    const b = await createVault(PIN, FAST);
    const sealed = await sealRecord(a.key, 'r1', { nota: 1 });
    expect(await openRecord(b.key, sealed)).toBeNull();
  });
});

describe('código de recuperação', () => {
  it('abre a vault; recuperar cria PIN novo e código novo, o usado deixa de valer', async () => {
    const created = await createVault(PIN, FAST);
    const sealed = await sealRecord(created.key, 'r1', { nota: 5 });
    expect(await unlockWithCode(created.vault, created.recoveryCode)).not.toBeNull();

    const recovered = await recoverWithCode(
      created.vault,
      created.recoveryCode.toLowerCase(),
      '135790',
    );
    expect(recovered).not.toBeNull();
    if (!recovered) return;
    expect(recovered.recoveryCode).not.toBe(created.recoveryCode);
    expect(await openRecord(recovered.key, sealed)).toEqual({ nota: 5 });
    expect(await unlockWithCode(recovered.vault, created.recoveryCode)).toBeNull();
    expect(await unlockWithCode(recovered.vault, recovered.recoveryCode)).not.toBeNull();
    expect((await tryPin(recovered.pin, PIN)).key).toBeNull();
    const again = (await tryPin(recovered.pin, '135790')).key;
    expect(again && (await openRecord(again, sealed))).toEqual({ nota: 5 });
  });

  it('código errado ou mal formado falha; PIN novo inválido é recusado', async () => {
    const { vault, recoveryCode } = await createVault(PIN, FAST);
    expect(await unlockWithCode(vault, newRecoveryCode())).toBeNull();
    expect(await unlockWithCode(vault, 'curto')).toBeNull();
    expect(await recoverWithCode(vault, newRecoveryCode(), '135790')).toBeNull();
    await expect(recoverWithCode(vault, recoveryCode, '12')).rejects.toThrow();
  });
});

describe('PIN', () => {
  it('PIN errado não abre', async () => {
    const { pin } = await createVault(PIN, FAST);
    expect((await tryPin(pin, '000000')).key).toBeNull();
  });

  it('5 erros apagam o PIN; antes disso, acertar zera a contagem', async () => {
    const created = await createVault(PIN, FAST);
    let pin: typeof created.pin | null = created.pin;
    for (let step = 1; step < PIN_MAX_FAILS; step += 1) {
      const attempt = await tryPin(pin as NonNullable<typeof pin>, '000000');
      expect(attempt.key).toBeNull();
      expect(attempt.next?.fails).toBe(step);
      pin = attempt.next;
    }
    const good = await tryPin(pin as NonNullable<typeof pin>, PIN);
    expect(good.next?.fails).toBe(0);
    pin = good.next;

    for (let step = 1; step < PIN_MAX_FAILS; step += 1) {
      pin = (await tryPin(pin as NonNullable<typeof pin>, '000000')).next;
    }
    const last = await tryPin(pin as NonNullable<typeof pin>, '000000');
    expect(last.key).toBeNull();
    expect(last.next).toBeNull();
  });

  it('trocar o PIN: o novo abre as mesmas notas e o antigo não', async () => {
    const created = await createVault(PIN, FAST);
    const sealed = await sealRecord(created.key, 'r1', { nota: 3 });
    const master = (await tryPin(created.pin, PIN, true)).key as CryptoKey;
    const next = await makePin(master, '999000', FAST);
    expect((await tryPin(next, PIN)).key).toBeNull();
    const opened = (await tryPin(next, '999000')).key;
    expect(opened && (await openRecord(opened, sealed))).toEqual({ nota: 3 });
  });
});

describe('aparelho novo (pareamento)', () => {
  it('o texto do aparelho antigo abre as mesmas notas com um PIN novo', async () => {
    const created = await createVault(PIN, FAST);
    const sealed = await sealRecord(created.key, 'r1', { nota: 9 });
    const master = (await tryPin(created.pin, PIN, true)).key as CryptoKey;
    const text = await exportPairing(created.vault, master);
    expect(text).not.toContain(created.recoveryCode);

    const paired = await pairFromText(text.replace(/(.{6})/g, '$1 '), '777111');
    expect(paired).not.toBeNull();
    if (!paired) return;
    expect(await openRecord(paired.key, sealed)).toEqual({ nota: 9 });
    expect(paired.vault).toEqual(created.vault);
    expect((await tryPin(paired.pin, PIN)).key).toBeNull();
    const again = (await tryPin(paired.pin, '777111')).key;
    expect(again && (await openRecord(again, sealed))).toEqual({ nota: 9 });
    // O código de recuperação continua valendo no aparelho novo.
    expect(await unlockWithCode(paired.vault, created.recoveryCode)).not.toBeNull();
  });

  it('texto inválido é recusado e PIN ruim dá erro', async () => {
    expect(await pairFromText('qualquer coisa', '777111')).toBeNull();
    expect(await pairFromText('OHARA1:AAAA', '777111')).toBeNull();
    await expect(pairFromText('OHARA1:AAAA', '12')).rejects.toThrow();
  });
});
