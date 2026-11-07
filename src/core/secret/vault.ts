import { fromBase64, joinBytes, newRecoveryCode, normalizeCode, toBase64, utf8 } from './codec';

// D87: PBKDF2-SHA256 com 600 000 iterações. O valor fica gravado na vault para poder subir depois.
export const ITERATIONS = 600_000;
export const MIN_PASSPHRASE = 12;
const IV_BYTES = 12;
const SALT_BYTES = 16;

// Linha da tabela `vault`. Tudo em base64; nada aqui revela a chave mestra.
export interface VaultData {
  id: string;
  iterations: number;
  passSalt: string;
  passWrapped: string;
  codeSalt: string;
  codeWrapped: string;
}

export const VAULT_ID = 'main';

export function passphraseProblem(passphrase: string): string | null {
  return [...passphrase.normalize('NFC')].length < MIN_PASSPHRASE
    ? `A frase precisa de pelo menos ${MIN_PASSPHRASE} caracteres.`
    : null;
}

async function wrapKeyFor(secret: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const base = await crypto.subtle.importKey(
    'raw',
    utf8(secret.normalize('NFC')),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

async function wrap(master: CryptoKey, secret: string, salt: Uint8Array<ArrayBuffer>, n: number) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = await crypto.subtle.wrapKey('raw', master, await wrapKeyFor(secret, salt, n), {
    name: 'AES-GCM',
    iv,
  });
  return toBase64(joinBytes(iv, new Uint8Array(sealed)));
}

async function unwrap(
  wrapped: string,
  secret: string,
  salt: string,
  iterations: number,
  extractable: boolean,
): Promise<CryptoKey | null> {
  const bytes = fromBase64(wrapped);
  try {
    return await crypto.subtle.unwrapKey(
      'raw',
      bytes.slice(IV_BYTES),
      await wrapKeyFor(secret, fromBase64(salt), iterations),
      { name: 'AES-GCM', iv: bytes.slice(0, IV_BYTES) },
      { name: 'AES-GCM', length: 256 },
      extractable,
      ['encrypt', 'decrypt'],
    );
  } catch {
    return null;
  }
}

function salt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

async function seal(
  master: CryptoKey,
  passphrase: string,
  iterations: number,
): Promise<{ vault: VaultData; recoveryCode: string }> {
  const passSalt = salt();
  const codeSalt = salt();
  const recoveryCode = newRecoveryCode();
  return {
    recoveryCode,
    vault: {
      id: VAULT_ID,
      iterations,
      passSalt: toBase64(passSalt),
      passWrapped: await wrap(master, passphrase, passSalt, iterations),
      codeSalt: toBase64(codeSalt),
      codeWrapped: await wrap(master, normalizeCode(recoveryCode), codeSalt, iterations),
    },
  };
}

export interface Created {
  vault: VaultData;
  // Mostrado uma vez só; o app nunca o guarda.
  recoveryCode: string;
  key: CryptoKey;
}

export async function createVault(passphrase: string, iterations = ITERATIONS): Promise<Created> {
  const problem = passphraseProblem(passphrase);
  if (problem) throw new Error(problem);
  const master = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const sealed = await seal(master, passphrase.normalize('NFC'), iterations);
  // O que fica em uso não é extraível: a chave nunca sai da memória do navegador.
  const key = (await unwrap(
    sealed.vault.passWrapped,
    passphrase,
    sealed.vault.passSalt,
    iterations,
    false,
  )) as CryptoKey;
  return { ...sealed, key };
}

export function unlockWithPassphrase(
  vault: VaultData,
  passphrase: string,
): Promise<CryptoKey | null> {
  return unwrap(vault.passWrapped, passphrase, vault.passSalt, vault.iterations, false);
}

export async function unlockWithCode(vault: VaultData, code: string): Promise<CryptoKey | null> {
  const clean = normalizeCode(code);
  if (!clean) return null;
  return unwrap(vault.codeWrapped, clean, vault.codeSalt, vault.iterations, false);
}

// Só a vault muda: as notas não são recifradas (D38). O código de recuperação continua o mesmo.
export async function changePassphrase(
  vault: VaultData,
  oldPassphrase: string,
  newPassphrase: string,
): Promise<VaultData | null> {
  const problem = passphraseProblem(newPassphrase);
  if (problem) throw new Error(problem);
  const master = await unwrap(
    vault.passWrapped,
    oldPassphrase,
    vault.passSalt,
    vault.iterations,
    true,
  );
  if (!master) return null;
  const passSalt = salt();
  return {
    ...vault,
    passSalt: toBase64(passSalt),
    passWrapped: await wrap(master, newPassphrase.normalize('NFC'), passSalt, vault.iterations),
  };
}

// Recuperar: frase nova e código novo. O código usado deixa de valer.
export async function recoverWithCode(
  vault: VaultData,
  code: string,
  newPassphrase: string,
): Promise<Created | null> {
  const problem = passphraseProblem(newPassphrase);
  if (problem) throw new Error(problem);
  const clean = normalizeCode(code);
  if (!clean) return null;
  const master = await unwrap(vault.codeWrapped, clean, vault.codeSalt, vault.iterations, true);
  if (!master) return null;
  const sealed = await seal(master, newPassphrase.normalize('NFC'), vault.iterations);
  const key = (await unwrap(
    sealed.vault.passWrapped,
    newPassphrase,
    sealed.vault.passSalt,
    vault.iterations,
    false,
  )) as CryptoKey;
  return { ...sealed, key };
}

// PIN (D39): por aparelho, só atalho de desbloqueio. Guardado em device_state, nunca sincroniza.
export const PIN_MAX_FAILS = 5;

export interface PinData {
  iterations: number;
  salt: string;
  wrapped: string;
  fails: number;
}

export function pinProblem(pin: string): string | null {
  return /^\d{4,6}$/.test(pin) ? null : 'O PIN tem de ter de 4 a 6 números.';
}

export async function createPin(
  vault: VaultData,
  passphrase: string,
  pin: string,
): Promise<PinData | null> {
  const problem = pinProblem(pin);
  if (problem) throw new Error(problem);
  const master = await unwrap(
    vault.passWrapped,
    passphrase,
    vault.passSalt,
    vault.iterations,
    true,
  );
  if (!master) return null;
  const pinSalt = salt();
  return {
    iterations: vault.iterations,
    salt: toBase64(pinSalt),
    wrapped: await wrap(master, pin, pinSalt, vault.iterations),
    fails: 0,
  };
}

export interface PinAttempt {
  key: CryptoKey | null;
  // null: o PIN foi apagado por excesso de erros; só a frase abre.
  next: PinData | null;
}

export async function tryPin(pin: PinData, attempt: string): Promise<PinAttempt> {
  const key = await unwrap(pin.wrapped, attempt, pin.salt, pin.iterations, false);
  if (key) return { key, next: { ...pin, fails: 0 } };
  const fails = pin.fails + 1;
  return { key: null, next: fails >= PIN_MAX_FAILS ? null : { ...pin, fails } };
}

// Registros: JSON cifrado com a chave mestra. O id vai como dado autenticado (AAD),
// então um registro não pode ser trocado por outro sem a leitura falhar.
export interface SealedRecord {
  id: string;
  iv: string;
  ciphertext: string;
}

export async function sealRecord(key: CryptoKey, id: string, value: object): Promise<SealedRecord> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: utf8(id) },
    key,
    utf8(JSON.stringify(value)),
  );
  return { id, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(sealed)) };
}

export async function openRecord(key: CryptoKey, record: SealedRecord): Promise<unknown | null> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(record.iv), additionalData: utf8(record.id) },
      key,
      fromBase64(record.ciphertext),
    );
    return JSON.parse(new TextDecoder().decode(plain)) as unknown;
  } catch {
    return null;
  }
}
