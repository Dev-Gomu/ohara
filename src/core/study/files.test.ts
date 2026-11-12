import { describe, expect, it } from 'vitest';
import { EMPTY_STUDY } from './create';
import {
  attachFile,
  canDropBlob,
  checkFile,
  clampPage,
  detachFile,
  hasBlob,
  MAX_FILE_BYTES,
  mimeOf,
  orphanBlobs,
  newFile,
  slidesOf,
  toHex,
} from './files';

const base = { name: 'a.pdf', mime: 'application/pdf', size: 10, pages: 3 };
const slides = (id: string, sha256: string, lessonId: string) =>
  newFile(id, { ...base, sha256 }, 'slides', { lessonId });

describe('arquivos', () => {
  it('reconhece o tipo pelo nome quando o navegador não informa', () => {
    expect(mimeOf('aula.PDF', '')).toBe('application/pdf');
    expect(mimeOf('foto.jpeg', '')).toBe('image/jpeg');
  });

  it('aceita PDF e imagem, recusa outros tipos e acima de 100 MB', () => {
    expect(checkFile('a.pdf', 'application/pdf', 5)).toBe('ok');
    expect(checkFile('a.png', 'image/png', 5)).toBe('ok');
    expect(checkFile('a.docx', 'application/msword', 5)).toBe('tipo');
    expect(checkFile('a.pdf', 'application/pdf', MAX_FILE_BYTES + 1)).toBe('grande');
    expect(checkFile('a.pdf', 'application/pdf', MAX_FILE_BYTES)).toBe('ok');
  });

  it('gera o hash em hexadecimal', () => {
    expect(toHex(new Uint8Array([0, 15, 255]).buffer)).toBe('000fff');
  });

  it('reaproveita arquivo com o mesmo hash', () => {
    const data = attachFile(EMPTY_STUDY, slides('f1', 'h1', 'l1'));
    expect(hasBlob(data.files, 'h1')).toBe(true);
    expect(hasBlob(data.files, 'h2')).toBe(false);
  });

  it('só apaga os bytes quando nenhum outro registro usa o hash', () => {
    let data = attachFile(EMPTY_STUDY, slides('f1', 'h1', 'l1'));
    data = attachFile(data, slides('f2', 'h1', 'l2'));
    expect(canDropBlob(data.files, 'h1', 'f1')).toBe(false);
    data = detachFile(data, 'f2');
    expect(canDropBlob(data.files, 'h1', 'f1')).toBe(true);
  });

  it('anexar slides de novo substitui os da mesma aula', () => {
    let data = attachFile(EMPTY_STUDY, slides('f1', 'h1', 'l1'));
    data = attachFile(data, slides('f2', 'h2', 'l1'));
    expect(slidesOf(data, 'l1')?.id).toBe('f2');
    expect(data.files).toHaveLength(1);
  });

  it('a página não passa da última nem fica abaixo de 1', () => {
    expect(clampPage(5, 3)).toBe(3);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(4, 0)).toBe(1);
  });
});

describe('bytes órfãos', () => {
  it('lista só o que nenhum anexo vivo usa', () => {
    const data = attachFile(EMPTY_STUDY, slides('f1', 'h1', 'l1'));
    expect(orphanBlobs(['h1', 'h2', 'h3'], data.files)).toEqual(['h2', 'h3']);
    expect(orphanBlobs([], data.files)).toEqual([]);
  });
});
