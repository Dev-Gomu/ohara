import {
  attachFile,
  checkFile,
  hasBlob,
  mimeOf,
  newFile,
  toHex,
  canDropBlob,
  detachFile,
} from '../../core/study/files';
import type { FileKind, StudyFile } from '../../core/study/types';
import { showNotice } from './notice';
import { openPdf } from './pdf';
import { storage } from './study';

const ACCEPT = 'application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg';

async function countPages(mime: string, bytes: ArrayBuffer): Promise<number> {
  if (mime !== 'application/pdf') return 1;
  const pdf = await openPdf(bytes);
  const pages = pdf.numPages;
  void pdf.loadingTask.destroy();
  return pages;
}

export async function attach(
  source: File,
  kind: FileKind,
  owner: { lessonId?: string; subjectId?: string },
): Promise<void> {
  const mime = mimeOf(source.name, source.type);
  const check = checkFile(source.name, source.type, source.size);
  if (check === 'tipo') return showNotice('Só PDF, PNG ou JPG podem ser anexados.');
  if (check === 'grande') return showNotice('Arquivo acima de 100 MB: nada foi gravado.');
  let pages: number;
  let sha256: string;
  let bytes: ArrayBuffer;
  try {
    bytes = await source.arrayBuffer();
    sha256 = toHex(await crypto.subtle.digest('SHA-256', bytes));
    pages = await countPages(mime, bytes);
  } catch {
    return showNotice('Não consegui ler esse arquivo. Ele está corrompido?');
  }
  if (!hasBlob(storage.read().files, sha256)) await storage.putBlob(sha256, bytes);
  const file = newFile(
    crypto.randomUUID(),
    { sha256, name: source.name, mime, size: source.size, pages },
    kind,
    owner,
  );
  const replaced = storage
    .read()
    .files.find(
      (item) => kind === 'slides' && item.kind === 'slides' && item.lessonId === owner.lessonId,
    );
  storage.write((data) => attachFile(data, file));
  if (replaced) await dropIfUnused(replaced);
  showNotice(`"${source.name}" anexado (${pages} ${pages === 1 ? 'página' : 'páginas'}).`);
}

async function dropIfUnused(file: StudyFile): Promise<void> {
  if (canDropBlob(storage.read().files, file.sha256, file.id)) {
    await storage.removeBlob(file.sha256);
  }
}

export async function detach(file: StudyFile): Promise<void> {
  storage.write((data) => detachFile(data, file.id));
  await dropIfUnused(file);
}

// O seletor só abre a partir de um gesto do usuário: Enter no menu conta como gesto.
export function pickFile(onPick: (file: File) => void, accept = ACCEPT): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) onPick(file);
    input.remove();
  });
  input.addEventListener('cancel', () => input.remove());
  document.body.append(input);
  input.click();
}

export function pickBackup(onPick: (file: File) => void): void {
  pickFile(onPick, '.sqlite3,.sqlite,.db,application/vnd.sqlite3,application/octet-stream');
}
