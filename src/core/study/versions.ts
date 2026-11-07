import type { NoteVersion } from './types';

export const VERSION_INTERVAL = 5 * 60_000;
export const MAX_VERSIONS = 50;

// D34: guarda uma versão a cada 5 minutos, até 50 por aula. Grava a versão anterior à edição,
// para que restaurar sempre traga algo diferente do que está na tela.
export function addVersion(
  versions: readonly NoteVersion[],
  lessonId: string,
  html: string,
  now: number,
): readonly NoteVersion[] {
  const own = versions.filter((version) => version.lessonId === lessonId);
  const last = own.at(-1);
  if (last && (now - last.at < VERSION_INTERVAL || last.html === html)) return versions;
  const kept = own.length >= MAX_VERSIONS ? own.slice(own.length - MAX_VERSIONS + 1) : own;
  const others = versions.filter((version) => version.lessonId !== lessonId);
  return [...others, ...kept, { lessonId, at: now, html }];
}

export function versionsOf(versions: readonly NoteVersion[], lessonId: string): NoteVersion[] {
  return versions.filter((version) => version.lessonId === lessonId).reverse();
}
