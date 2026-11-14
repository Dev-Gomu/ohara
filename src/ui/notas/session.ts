import { useSyncExternalStore } from 'react';
import { defaultScheme, type Item, type Scheme } from '../../core/grades/grades';
import { exportPairing, pairFromText } from '../../core/secret/pairing';
import {
  createVault,
  makePin,
  openRecord,
  recoverWithCode,
  sealRecord,
  tryPin,
  unlockWithCode,
  type PinData,
  type VaultData,
} from '../../core/secret/vault';
import type { SecretRow, VaultRow } from '../../core/study/types';
import { subscribe as subscribeKeyboard } from '../keyboard/store';
import { storage } from '../study/study';

// D41: a chave mestra só existe em memória e some depois de 2 minutos sem uso.
export const IDLE_MS = 120_000;
const PIN_KEY = 'pin';

// Código novo ainda não confirmado: a vault só vai para o banco quando o usuário diz que anotou.
export interface Draft {
  vault: VaultData;
  code: string;
  key: CryptoKey;
  pin: PinData;
}

interface View {
  key: CryptoKey | null;
  draft: Draft | null;
  schemes: Readonly<Record<string, Scheme>>;
  items: readonly Item[];
  unreadable: number;
}

type Payload = ({ kind: 'esquema' } & Scheme) | ({ kind: 'item' } & Item);

const CLOSED: View = { key: null, draft: null, schemes: {}, items: [], unreadable: 0 };
let view: View = CLOSED;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: View): void {
  view = next;
  clearTimeout(timer);
  if (next.key) timer = setTimeout(lock, IDLE_MS);
  listeners.forEach((listener) => listener());
}

export function useSecretView(): View {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => view,
  );
}

export const isOpen = (): boolean => view.key !== null;

export function lock(): void {
  if (view !== CLOSED) set(CLOSED);
}

// Qualquer uso renova os 2 minutos. Observa o teclado pelo estado, sem criar listener de tecla.
function touch(): void {
  if (view.key) set(view);
}
subscribeKeyboard(touch);
document.addEventListener('pointerdown', touch, true);
document.addEventListener('input', touch, true);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') lock();
});
window.addEventListener('pagehide', lock);

export function vaultRow(): VaultRow | undefined {
  return storage.read().vault[0];
}

async function open(key: CryptoKey): Promise<void> {
  const schemes: Record<string, Scheme> = {};
  const items: Item[] = [];
  let unreadable = 0;
  for (const row of storage.read().secrets) {
    const payload = (await openRecord(key, row)) as Payload | null;
    if (payload?.kind === 'esquema') {
      schemes[payload.subjectId] = { ...defaultScheme(payload.subjectId), ...payload };
    } else if (payload?.kind === 'item') {
      items.push(payload);
    } else {
      unreadable += 1;
    }
  }
  set({ key, draft: null, schemes, items, unreadable });
}

export function schemeFor(subjectId: string): Scheme {
  return view.schemes[subjectId] ?? defaultScheme(subjectId);
}

function putRow(row: SecretRow): void {
  storage.write((data) => ({
    ...data,
    secrets: data.secrets.some((item) => item.id === row.id)
      ? data.secrets.map((item) => (item.id === row.id ? row : item))
      : [...data.secrets, row],
  }));
}

async function save(id: string, payload: Payload): Promise<void> {
  if (!view.key) return;
  putRow(await sealRecord(view.key, id, payload));
}

export async function saveScheme(scheme: Scheme): Promise<void> {
  await save(`esquema-${scheme.subjectId}`, { kind: 'esquema', ...scheme });
  set({ ...view, schemes: { ...view.schemes, [scheme.subjectId]: scheme } });
}

export async function saveItem(item: Item): Promise<void> {
  await save(item.id, { kind: 'item', ...item });
  const others = view.items.filter((other) => other.id !== item.id);
  set({ ...view, items: [...others, item] });
}

export function removeItem(id: string): void {
  storage.write((data) => ({ ...data, secrets: data.secrets.filter((row) => row.id !== id) }));
  set({ ...view, items: view.items.filter((item) => item.id !== id) });
}

function draftOf(created: Awaited<ReturnType<typeof createVault>>): Draft {
  return { vault: created.vault, code: created.recoveryCode, key: created.key, pin: created.pin };
}

// Primeira vez: gera o cofre e o código, mas só grava depois de confirmar (confirmDraft).
export async function startSetup(pin: string): Promise<void> {
  set({ ...CLOSED, draft: draftOf(await createVault(pin)) });
}

export async function confirmDraft(): Promise<void> {
  const draft = view.draft;
  if (!draft) return;
  storage.write((data) => ({ ...data, vault: [draft.vault] }));
  writePin(draft.pin);
  await storage.flush();
  await open(draft.key);
}

export function cancelDraft(): void {
  set(CLOSED);
}

// PIN esquecido (ou apagado por erros): o código abre a chave e o PIN novo vale neste aparelho.
export async function recover(code: string, newPin: string): Promise<boolean> {
  const row = vaultRow();
  const created = row && (await recoverWithCode(row, code, newPin));
  if (!created) return false;
  set({ ...CLOSED, draft: draftOf(created) });
  return true;
}

export async function checkCode(code: string): Promise<boolean> {
  const row = vaultRow();
  return row !== undefined && (await unlockWithCode(row, code)) !== null;
}

// Aparelho novo: o texto/QR do aparelho antigo traz a chave; o PIN novo é só deste aparelho.
export async function pairDevice(text: string, pin: string): Promise<boolean> {
  const paired = await pairFromText(text, pin);
  if (!paired) return false;
  storage.write((data) => ({ ...data, vault: [paired.vault] }));
  writePin(paired.pin);
  await storage.flush();
  await open(paired.key);
  return true;
}

export function readPin(): PinData | null {
  const text = storage.getDeviceState(PIN_KEY);
  return text ? (JSON.parse(text) as PinData) : null;
}

function writePin(pin: PinData | null): void {
  storage.setDeviceState(PIN_KEY, pin ? JSON.stringify(pin) : '');
  // Faz a tela de Notas travadas reler se há PIN (ex.: apagado por 5 erros).
  set({ ...view });
}

// Confere o PIN (contando os erros, como no desbloqueio) e devolve a chave extraível, ou null.
async function checkPin(pin: string): Promise<CryptoKey | null> {
  const saved = readPin();
  if (!saved) return null;
  const attempt = await tryPin(saved, pin, true);
  writePin(attempt.next);
  return attempt.key;
}

export async function changePin(oldPin: string, newPin: string): Promise<boolean> {
  const saved = readPin();
  const master = await checkPin(oldPin);
  if (!saved || !master) return false;
  writePin(await makePin(master, newPin, saved.iterations));
  return true;
}

// Texto do QR do "Adicionar outro aparelho". Pede o PIN de novo; erro conta como no desbloqueio.
export async function pairingText(pin: string): Promise<string | null> {
  const row = vaultRow();
  const master = await checkPin(pin);
  return row && master ? exportPairing(row, master) : null;
}

export type PinResult = 'ok' | 'errado' | 'apagado';

export async function unlockPin(pin: string): Promise<PinResult> {
  const saved = readPin();
  if (!saved) return 'apagado';
  const attempt = await tryPin(saved, pin);
  writePin(attempt.next);
  if (attempt.key) {
    await open(attempt.key);
    return 'ok';
  }
  return attempt.next ? 'errado' : 'apagado';
}
