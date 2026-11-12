import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import type { StudyFile } from '../../../core/study/types';
import { openPdf } from '../../study/pdf';
import { storage } from '../../study/study';
import styles from './Mesa.module.css';

type Loaded =
  | { state: 'carregando' }
  | { state: 'falta' }
  | { state: 'pdf'; pdf: PDFDocumentProxy }
  | { state: 'imagem'; url: string };

function useLoaded(file: StudyFile): Loaded {
  const [loaded, setLoaded] = useState<{ sha: string; value: Loaded } | null>(null);
  useEffect(() => {
    let alive = true;
    let cleanup = () => {};
    void (async () => {
      const bytes = await storage.getBlob(file.sha256).catch(() => null);
      if (!alive) return;
      if (!bytes) return setLoaded({ sha: file.sha256, value: { state: 'falta' } });
      if (file.mime === 'application/pdf') {
        const pdf = await openPdf(bytes).catch(() => null);
        if (!alive) return void pdf?.loadingTask.destroy();
        cleanup = () => void pdf?.loadingTask.destroy();
        setLoaded({ sha: file.sha256, value: pdf ? { state: 'pdf', pdf } : { state: 'falta' } });
      } else {
        const url = URL.createObjectURL(new Blob([bytes], { type: file.mime }));
        cleanup = () => URL.revokeObjectURL(url);
        setLoaded({ sha: file.sha256, value: { state: 'imagem', url } });
      }
    })();
    return () => {
      alive = false;
      cleanup();
    };
  }, [file.sha256, file.mime]);
  return loaded?.sha === file.sha256 ? loaded.value : { state: 'carregando' };
}

function PdfPage({ pdf, page }: { pdf: PDFDocumentProxy; page: number }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: element.clientWidth, height: element.clientHeight }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = canvas.current;
    if (!target || size.width === 0 || size.height === 0) return;
    let task: RenderTask | undefined;
    let alive = true;
    void (async () => {
      const current = await pdf.getPage(page);
      // Deixa a página seguinte pronta: a próxima passada de slide aparece sem espera.
      if (page < pdf.numPages) void pdf.getPage(page + 1);
      if (!alive) return;
      const base = current.getViewport({ scale: 1 });
      const fit = Math.min(size.width / base.width, size.height / base.height);
      const ratio = window.devicePixelRatio || 1;
      const viewport = current.getViewport({ scale: fit * ratio });
      target.width = Math.floor(viewport.width);
      target.height = Math.floor(viewport.height);
      target.style.width = `${Math.floor(viewport.width / ratio)}px`;
      target.style.height = `${Math.floor(viewport.height / ratio)}px`;
      task = current.render({ canvas: target, viewport });
      await task.promise.catch(() => undefined);
    })();
    return () => {
      alive = false;
      task?.cancel();
    };
  }, [pdf, page, size]);

  return (
    <div ref={box} className={styles.pagina}>
      <canvas ref={canvas} data-testid="pagina-pdf" data-page={page} />
    </div>
  );
}

export function SlidesViewer({ file, page }: { file: StudyFile; page: number }) {
  const loaded = useLoaded(file);
  if (loaded.state === 'carregando') return <p className={styles.vazio}>Abrindo…</p>;
  if (loaded.state === 'falta') {
    return (
      <p className={styles.vazio}>
        Não achei os bytes de "{file.name}" neste aparelho. Anexe o arquivo de novo.
      </p>
    );
  }
  if (loaded.state === 'imagem') {
    return (
      <div className={styles.pagina}>
        <img className={styles.imagem} src={loaded.url} alt={file.name} />
      </div>
    );
  }
  return <PdfPage pdf={loaded.pdf} page={page} />;
}
