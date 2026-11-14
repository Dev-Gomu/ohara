import { fromBase64, joinBytes, newRecoveryCode, normalizeCode, toBase64, utf8 } from './codec';

// D87: PBKDF2-SHA256 com 600 000 iterações, agora só para o PIN e o código (D172: sem frase).
export const ITERATIONS = 600_000;
export const IV_BYTES = 12;
const SALT_BYTES = 16;

// Linha da tabela `vault`. Só o código de recuperação tranca a chave mestra aqui (sincroniza).
// passSalt/passWrapped são colunas antigas da frase (D36), agora sempre vazias.
export interface VaultData {
  id: string;
  iterations: number;
  passSalt: string;
  passWrapped: string;
  codeSalt: string;
  codeWrapped: string;
}

export const VAULT_ID = 'main';

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

export async function wrap(
  master: CryptoKey,
  secret: string,
  salt: Uint8Array<ArrayBuffer>,
  n: number,
) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = await crypto.subtle.wrapKey('raw', master, await wrapKeyFor(secret, salt, n), {
    name: 'AES-GCM',
    iv,
  });
  return toBase64(joinBytes(iv, new Uint8Array(sealed)));
}

export async function unwrap(
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

export function salt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

async function seal(
  master: CryptoKey,
  iterations: number,
): Promise<{ vault: VaultData; recoveryCode: string }> {
  const codeSalt = salt();
  const recoveryCode = newRecoveryCode();
  return {
    recoveryCode,
    vault: {
      id: VAULT_ID,
      iterations,
      passSalt: '',
      passWrapped: '',
      codeSalt: toBase64(codeSalt),
      codeWrapped: await wrap(master, normalizeCode(recoveryCode), codeSalt, iterations),
    },
  };
}

export interface Created {
  vault: VaultData;
  // Mostrado uma vez só; o app nunca o guarda.
  recoveryCode: string;
  // Chave em uso (não extraível) e o PIN que a tranca neste aparelho.
  key: CryptoKey;
  pin: PinData;
}

async function finish(master: CryptoKey, pin: string, iterations: number): Promise<Created> {
  const problem = pinProblem(pin);
  if (problem) throw new Error(problem);
  const sealed = await seal(master, iterations);
  const pinData = await makePin(master, pin, iterations);
  const key = (await unwrap(pinData.wrapped, pin, pinData.salt, iterations, false)) as CryptoKey;
  return { ...sealed, key, pin: pinData };
}

// D172: a chave mestra é aleatória; a pessoa só escolhe o PIN deste aparelho.
export async function createVault(pin: string, iterations = ITERATIONS): Promise<Created> {
  const master = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  return finish(master, pin, iterations);
}

export async function unlockWithCode(vault: VaultData, code: string): Promise<CryptoKey | null> {
  const clean = normalizeCode(code);
  if (!clean) return null;
  return unwrap(vault.codeWrapped, clean, vault.codeSalt, vault.iterations, false);
}

// PIN esquecido: o código abre a chave e cria PIN novo (e código novo; o usado deixa de valer).
export async function recoverWithCode(
  vault: VaultData,
  code: string,
  newPin: string,
): Promise<Created | null> {
  const problem = pinProblem(newPin);
  if (problem) throw new Error(problem);
  const clean = normalizeCode(code);
  if (!clean) return null;
  const master = await unwrap(vault.codeWrapped, clean, vault.codeSalt, vault.iterations, true);
  if (!master) return null;
  return finish(master, newPin, vault.iterations);
}

// PIN (D39/D172): por aparelho, guarda a chave. Fica em device_state, nunca sincroniza.
export const PIN_MAX_FAILS = 5;

export interface PinData {
  iterations: number;
  salt: string;
  wrapped: string;
  fails: number;
}

export function pinProblem(pin: string): string | null {
  return /^\d{6}$/.test(pin) ? null : 'O PIN tem de ter 6 números.';
}

export async function makePin(
  master: CryptoKey,
  pin: string,
  iterations: number,
): Promise<PinData> {
  const problem = pinProblem(pin);
  if (problem) throw new Error(problem);
  const pinSalt = salt();
  return {
    iterations,
    salt: toBase64(pinSalt),
    wrapped: await wrap(master, pin, pinSalt, iterations),
    fails: 0,
  };
}

export interface PinAttempt {
  key: CryptoKey | null;
  // null: o PIN (e a chave guardada) foi apagado por excesso de erros; só o código ou outro aparelho.
  next: PinData | null;
}

export async function tryPin(
  pin: PinData,
  attempt: string,
  extractable = false,
): Promise<PinAttempt> {
  const key = await unwrap(pin.wrapped, attempt, pin.salt, pin.iterations, extractable);
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
