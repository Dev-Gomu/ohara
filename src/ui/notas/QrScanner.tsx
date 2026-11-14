import { useEffect, useRef, useState } from 'react';
import styles from './Qr.module.css';

interface Detector {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}
type DetectorCtor = new (options: { formats: string[] }) => Detector;

// Lê o QR do aparelho antigo pela câmera: BarcodeDetector do navegador, ou jsQR (carregado só aqui).
async function readFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  native: Detector | null,
) {
  if (native) return (await native.detect(video))[0]?.rawValue ?? null;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || video.videoWidth === 0) return null;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { default: jsQR } = await import('jsqr');
  return (
    jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' })?.data ?? null
  );
}

export function QrScanner({ onRead }: { onRead: (text: string) => void }) {
  const [active, setActive] = useState(false);
  const [problem, setProblem] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    let stop = false;
    let stream: MediaStream | null = null;
    const Ctor = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    const native = Ctor ? new Ctor({ formats: ['qr_code'] }) : null;
    async function loop() {
      const element = video.current;
      const surface = canvas.current;
      if (stop || !element || !surface) return;
      const found = await readFrame(element, surface, native).catch(() => null);
      if (found?.startsWith('OHARA1:')) {
        setActive(false);
        onRead(found);
        return;
      }
      setTimeout(() => void loop(), 250);
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((media) => {
        if (stop) return media.getTracks().forEach((track) => track.stop());
        stream = media;
        if (video.current) {
          video.current.srcObject = media;
          void video.current.play();
        }
        void loop();
      })
      .catch(() => {
        setProblem('Sem acesso à câmera. Escreva o código abaixo.');
        setActive(false);
      });
    return () => {
      stop = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [active, onRead]);

  return (
    <div className={styles.leitor}>
      {active ? (
        <>
          <video ref={video} className={styles.video} muted playsInline />
          <canvas ref={canvas} hidden />
        </>
      ) : (
        <button type="button" className={styles.botao} onClick={() => setActive(true)}>
          Ler o QR com a câmera
        </button>
      )}
      {problem && <p className={styles.aviso}>{problem}</p>}
    </div>
  );
}
