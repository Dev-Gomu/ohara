import type { DbErrorCode } from './protocol';

export type Phase = 'abertura' | 'migracao' | 'gravacao';

// Traduz o erro do navegador ou do SQLite. Na migração e na gravação, o que não for reconhecido
// ganha o código da fase, que explica melhor o que aconteceu.
export function classifyError(
  message: string,
  name: string,
  phase: Phase = 'abertura',
): DbErrorCode {
  if (name === 'QuotaExceededError' || /quota|SQLITE_FULL|disk is full/i.test(message)) {
    return 'cota';
  }
  if (/SQLITE_CORRUPT|SQLITE_NOTADB|not a database|malformed/i.test(message)) {
    return 'corrompido';
  }
  if (
    name === 'SecurityError' ||
    name === 'NotSupportedError' ||
    /opfs|getDirectory|createSyncAccessHandle|storage.*(unavailable|not available)/i.test(message)
  ) {
    return 'opfs-indisponivel';
  }
  if (phase === 'migracao') return 'migracao';
  if (phase === 'gravacao') return 'gravacao';
  return 'desconhecido';
}
