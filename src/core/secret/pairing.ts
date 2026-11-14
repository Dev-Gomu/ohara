import { fromBase64, toBase64 } from './codec';
import { makePin, pinProblem, unwrap, type PinData, type VaultData, VAULT_ID } from './vault';

// D172: aparelho novo recebe a chave mestra + a vault de outro aparelho, por QR ou texto.
// Formato: "OHARA1:" + base64 de [chave 32][iterações 4][salt do código 16][código trancado, resto].
const PREFIX = 'OHARA1:';
const KEY_BYTES = 32;
const HEAD = KEY_BYTES + 4 + 16;

export async function exportPairing(vault: VaultData, master: CryptoKey): Promise<string> {
  const key = new Uint8Array(await crypto.subtle.exportKey('raw', master));
  const wrapped = fromBase64(vault.codeWrapped);
  const bytes = new Uint8Array(HEAD + wrapped.length);
  bytes.set(key, 0);
  new DataView(bytes.buffer).setUint32(KEY_BYTES, vault.iterations);
  bytes.set(fromBase64(vault.codeSalt), KEY_BYTES + 4);
  bytes.set(wrapped, HEAD);
  return PREFIX + toBase64(bytes);
}

export interface Paired {
  vault: VaultData;
  key: CryptoKey;
  pin: PinData;
}

// Devolve null se o texto não for um código de aparelho válido.
export async function pairFromText(text: string, pin: string): Promise<Paired | null> {
  const problem = pinProblem(pin);
  if (problem) throw new Error(problem);
  const clean = text.replace(/\s/g, '');
  if (!clean.startsWith(PREFIX)) return null;
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = fromBase64(clean.slice(PREFIX.length));
  } catch {
    return null;
  }
  if (bytes.length <= HEAD) return null;
  const iterations = new DataView(bytes.buffer).getUint32(KEY_BYTES);
  if (iterations < 1 || iterations > 10_000_000) return null;
  const master = await crypto.subtle.importKey(
    'raw',
    bytes.slice(0, KEY_BYTES),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  const pinData = await makePin(master, pin, iterations);
  const key = await unwrap(pinData.wrapped, pin, pinData.salt, iterations, false);
  if (!key) return null;
  return {
    key,
    pin: pinData,
    vault: {
      id: VAULT_ID,
      iterations,
      passSalt: '',
      passWrapped: '',
      codeSalt: toBase64(bytes.slice(KEY_BYTES + 4, HEAD)),
      codeWrapped: toBase64(bytes.slice(HEAD)),
    },
  };
}
