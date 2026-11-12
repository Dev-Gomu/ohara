import type { PDFDocumentProxy } from 'pdfjs-dist';

// pdf.js só carrega quando o primeiro PDF é aberto; o worker dele vai no precache do PWA.
let loading: Promise<typeof import('pdfjs-dist')> | null = null;

async function lib() {
  loading ??= (async () => {
    const [pdfjs, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  })();
  return loading;
}

// O pdf.js assume a posse do buffer que recebe: passa uma cópia.
export async function openPdf(bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await lib();
  return pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
}
