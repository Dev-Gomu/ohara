import type { FileKind, StudyData, StudyFile } from './types';

// Limite por arquivo (D31).
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export const FILE_DIR = '.ohara2-files';

export type FileCheck = 'ok' | 'grande' | 'tipo';

export function mimeOf(name: string, declared: string): string {
  if (declared === 'application/pdf' || declared === 'image/png' || declared === 'image/jpeg') {
    return declared;
  }
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (/\.jpe?g$/.test(lower)) return 'image/jpeg';
  return declared;
}

export function checkFile(name: string, declaredMime: string, size: number): FileCheck {
  const mime = mimeOf(name, declaredMime);
  if (!/^(application\/pdf|image\/(png|jpeg))$/.test(mime)) return 'tipo';
  return size > MAX_FILE_BYTES ? 'grande' : 'ok';
}

export function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Mesmo conteúdo já guardado: os bytes não são gravados de novo.
export function hasBlob(files: readonly StudyFile[], sha256: string): boolean {
  return files.some((file) => file.sha256 === sha256);
}

// Só apaga os bytes quando nenhum registro vivo (fora o que está saindo) usa aquele hash.
export function canDropBlob(
  files: readonly StudyFile[],
  sha256: string,
  leavingId: string,
): boolean {
  return !files.some((file) => file.sha256 === sha256 && file.id !== leavingId);
}

export function clampPage(page: number, pages: number): number {
  return Math.min(Math.max(1, pages), Math.max(1, Math.floor(page)));
}

export function slidesOf(data: StudyData, lessonId: string): StudyFile | undefined {
  return data.files.find((file) => file.kind === 'slides' && file.lessonId === lessonId);
}

export function booksOf(data: StudyData, subjectId: string): StudyFile[] {
  return data.files.filter((file) => file.kind === 'livro' && file.subjectId === subjectId);
}

// Cada aula tem um conjunto de slides só: anexar outro substitui o anterior.
export function attachFile(data: StudyData, file: StudyFile): StudyData {
  const keep =
    file.kind === 'slides'
      ? data.files.filter((item) => !(item.kind === 'slides' && item.lessonId === file.lessonId))
      : data.files;
  return { ...data, files: [...keep, file] };
}

export function detachFile(data: StudyData, id: string): StudyData {
  return { ...data, files: data.files.filter((item) => item.id !== id) };
}

export function newFile(
  id: string,
  base: { sha256: string; name: string; mime: string; size: number; pages: number },
  kind: FileKind,
  owner: { lessonId?: string; subjectId?: string },
): StudyFile {
  return {
    id,
    ...base,
    kind,
    lessonId: owner.lessonId ?? null,
    subjectId: owner.subjectId ?? null,
  };
}

export function devicePageKey(lessonId: string): string {
  return `pagina.${lessonId}`;
}

// Bytes guardados que nenhum anexo vivo usa mais (aula ou matéria excluída, anexo trocado).
export function orphanBlobs(names: readonly string[], files: readonly StudyFile[]): string[] {
  const live = new Set(files.map((file) => file.sha256));
  return names.filter((name) => !live.has(name));
}
