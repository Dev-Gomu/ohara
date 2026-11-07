export function toBase64(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes;
}

export function joinBytes(first: Uint8Array, second: Uint8Array): Uint8Array<ArrayBuffer> {
  const joined = new Uint8Array(first.length + second.length);
  joined.set(first, 0);
  joined.set(second, first.length);
  return joined;
}

export function utf8(text: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(text);
}

// RFC 4648: 32 letras, então um byte & 31 é uniforme, sem viés.
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const CODE_LENGTH = 20;

export function newRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  const letters = [...bytes].map((byte) => BASE32.charAt(byte & 31));
  return letters.join('').replace(/(.{4})(?=.)/g, '$1-');
}

// Aceita minúsculas, espaços e sem os traços; devolve '' se tiver letra fora do alfabeto.
export function normalizeCode(input: string): string {
  const clean = input.replace(/[\s-]/g, '').toUpperCase();
  const valid = clean.length === CODE_LENGTH && [...clean].every((char) => BASE32.includes(char));
  return valid ? clean : '';
}
