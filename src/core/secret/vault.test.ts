import { describe, expect, it } from 'vitest';
import { CODE_LENGTH, fromBase64, newRecoveryCode, normalizeCode, toBase64 } from './codec';
import {
  changePassphrase,
  createPin,
  createVault,
  ITERATIONS,
  openRecord,
  passphraseProblem,
  PIN_MAX_FAILS,
  recoverWithCode,
  sealRecord,
  tryPin,
  unlockWithCode,
  unlockWithPassphrase,
} from './vault';

// Poucas iterações só nos testes, para não demorar; o padrão de verdade é conferido abaixo.
const FAST = 1000;
const PASS = 'frase de teste bem longa';

describe('padrões', () => {
  it('usa PBKDF2 com 600 000 iterações e exige frase de 12 caracteres', () => {
    expect(ITERATIONS).toBe(600_000);
    expect(passphraseProblem('curta')).not.toBeNull();
    expect(passphraseProblem('doze letras!')).toBeNull();
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
    const { key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { kind: 'item', nota: 8.5 });
    expect(JSON.stringify(sealed)).not.toContain('8.5');
    expect(await openRecord(key, sealed)).toEqual({ kind: 'item', nota: 8.5 });
  });

  it('um byte trocado no texto cifrado falha', async () => {
    const { key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 9 });
    const bytes = fromBase64(sealed.ciphertext);
    bytes[0] = (bytes[0] ?? 0) ^ 1;
    expect(await openRecord(key, { ...sealed, ciphertext: toBase64(bytes) })).toBeNull();
  });

  it('trocar o id (AAD) falha', async () => {
    const { key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 9 });
    expect(await openRecord(key, { ...sealed, id: 'r2' })).toBeNull();
  });

  it('o mesmo texto cifrado duas vezes dá resultados diferentes', async () => {
    const { key } = await createVault(PASS, FAST);
    const a = await sealRecord(key, 'r1', { nota: 9 });
    const b = await sealRecord(key, 'r1', { nota: 9 });
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });
});

describe('frase de acesso', () => {
  it('a frase certa abre e a errada falha sem expor nada', async () => {
    const { vault, key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 7 });
    const opened = await unlockWithPassphrase(vault, PASS);
    expect(opened && (await openRecord(opened, sealed))).toEqual({ nota: 7 });
    expect(await unlockWithPassphrase(vault, 'frase errada completa')).toBeNull();
  });

  it('a chave em uso não é extraível', async () => {
    const { vault, key } = await createVault(PASS, FAST);
    const opened = await unlockWithPassphrase(vault, PASS);
    expect(key.extractable).toBe(false);
    expect(opened?.extractable).toBe(false);
  });

  it('as iterações gravadas na vault são respeitadas', async () => {
    const { vault } = await createVault(PASS, FAST);
    expect(vault.iterations).toBe(FAST);
    expect(await unlockWithPassphrase({ ...vault, iterations: FAST + 1 }, PASS)).toBeNull();
  });

  it('trocar a frase: a nova abre, a antiga falha e as notas continuam intactas', async () => {
    const { vault, key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 6.5 });
    const next = await changePassphrase(vault, PASS, 'outra frase igualmente longa');
    expect(next).not.toBeNull();
    if (!next) return;
    expect(await unlockWithPassphrase(next, PASS)).toBeNull();
    const opened = await unlockWithPassphrase(next, 'outra frase igualmente longa');
    expect(opened && (await openRecord(opened, sealed))).toEqual({ nota: 6.5 });
  });

  it('trocar a frase com a frase antiga errada falha', async () => {
    const { vault } = await createVault(PASS, FAST);
    expect(
      await changePassphrase(vault, 'errada errada errada', 'outra frase igualmente longa'),
    ).toBeNull();
  });

  it('recusa frase curta ao criar e ao trocar', async () => {
    await expect(createVault('curta', FAST)).rejects.toThrow();
    const { vault } = await createVault(PASS, FAST);
    await expect(changePassphrase(vault, PASS, 'curta')).rejects.toThrow();
  });
});

describe('código de recuperação', () => {
  it('abre a vault, e o código novo vale enquanto o antigo deixa de valer', async () => {
    const created = await createVault(PASS, FAST);
    const sealed = await sealRecord(created.key, 'r1', { nota: 5 });
    expect(await unlockWithCode(created.vault, created.recoveryCode)).not.toBeNull();

    const recovered = await recoverWithCode(
      created.vault,
      created.recoveryCode.toLowerCase(),
      'frase nova depois de perder',
    );
    expect(recovered).not.toBeNull();
    if (!recovered) return;
    expect(recovered.recoveryCode).not.toBe(created.recoveryCode);
    expect(await openRecord(recovered.key, sealed)).toEqual({ nota: 5 });
    expect(await unlockWithCode(recovered.vault, created.recoveryCode)).toBeNull();
    expect(await unlockWithCode(recovered.vault, recovered.recoveryCode)).not.toBeNull();
    expect(await unlockWithPassphrase(recovered.vault, PASS)).toBeNull();
    expect(
      await unlockWithPassphrase(recovered.vault, 'frase nova depois de perder'),
    ).not.toBeNull();
  });

  it('código errado ou mal formado falha', async () => {
    const { vault } = await createVault(PASS, FAST);
    expect(await unlockWithCode(vault, newRecoveryCode())).toBeNull();
    expect(await unlockWithCode(vault, 'curto')).toBeNull();
    expect(
      await recoverWithCode(vault, newRecoveryCode(), 'frase nova depois de perder'),
    ).toBeNull();
  });
});

describe('PIN', () => {
  it('abre com o PIN certo', async () => {
    const { vault, key } = await createVault(PASS, FAST);
    const sealed = await sealRecord(key, 'r1', { nota: 4 });
    const pin = await createPin(vault, PASS, '4821');
    expect(pin).not.toBeNull();
    if (!pin) return;
    const attempt = await tryPin(pin, '4821');
    expect(attempt.key && (await openRecord(attempt.key, sealed))).toEqual({ nota: 4 });
  });

  it('não cria PIN com a frase errada nem com formato inválido', async () => {
    const { vault } = await createVault(PASS, FAST);
    expect(await createPin(vault, 'frase errada completa', '4821')).toBeNull();
    await expect(createPin(vault, PASS, '12')).rejects.toThrow();
    await expect(createPin(vault, PASS, '12ab')).rejects.toThrow();
  });

  it('5 erros apagam o PIN; antes disso, acertar zera a contagem', async () => {
    const { vault } = await createVault(PASS, FAST);
    let pin = await createPin(vault, PASS, '4821');
    expect(pin).not.toBeNull();
    for (let step = 1; step < PIN_MAX_FAILS; step += 1) {
      const attempt = await tryPin(pin as NonNullable<typeof pin>, '0000');
      expect(attempt.key).toBeNull();
      expect(attempt.next?.fails).toBe(step);
      pin = attempt.next;
    }
    const good = await tryPin(pin as NonNullable<typeof pin>, '4821');
    expect(good.next?.fails).toBe(0);
    pin = good.next;

    for (let step = 1; step < PIN_MAX_FAILS; step += 1) {
      pin = (await tryPin(pin as NonNullable<typeof pin>, '0000')).next;
    }
    const last = await tryPin(pin as NonNullable<typeof pin>, '0000');
    expect(last.key).toBeNull();
    expect(last.next).toBeNull();
  });
});
