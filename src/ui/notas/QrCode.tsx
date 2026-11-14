import qrcode from 'qrcode-generator';
import styles from './Qr.module.css';

// QR do "Adicionar outro aparelho" (D172). Desenhado em SVG com as cores do tema.
export function QrCode({ text }: { text: string }) {
  const qr = qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  const size = qr.getModuleCount();
  const cells: string[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (qr.isDark(row, col)) cells.push(`M${col} ${row}h1v1h-1z`);
    }
  }
  const quiet = 3;
  return (
    <svg
      className={styles.qr}
      viewBox={`${-quiet} ${-quiet} ${size + quiet * 2} ${size + quiet * 2}`}
      role="img"
      aria-label="QR para adicionar outro aparelho"
      shapeRendering="crispEdges"
    >
      <path d={cells.join('')} className={styles.modulos} />
    </svg>
  );
}
