import { useState } from 'react';
import type { DbErrorCode } from '../../core/db/protocol';
import { isoDay } from '../../core/study/dates';
import { downloadBytes } from '../study/download';
import styles from './ErrorScreen.module.css';

interface Message {
  text: string;
  retry?: string;
  exportable: boolean;
}

const MESSAGES: Record<DbErrorCode, Message> = {
  'outra-aba': {
    text: 'O Ohara já está aberto em outra aba. Feche a outra e toque em Tentar de novo.',
    retry: 'Tentar de novo',
    exportable: false,
  },
  'opfs-indisponivel': {
    text: 'Este navegador não deixa o Ohara guardar dados. Use o Chrome, fora da janela anônima.',
    retry: 'Tentar de novo',
    exportable: false,
  },
  cota: {
    text: 'Falta espaço no aparelho. Nada novo foi salvo.',
    retry: 'Tentar de novo',
    exportable: true,
  },
  migracao: {
    text: 'A atualização do banco falhou. Seus dados estão intactos na versão anterior.',
    exportable: true,
  },
  corrompido: { text: 'O arquivo do banco está danificado.', exportable: true },
  gravacao: {
    text: 'A última alteração não foi salva.',
    retry: 'Recarregar',
    exportable: true,
  },
  desconhecido: {
    text: 'Algo inesperado aconteceu ao abrir os dados.',
    retry: 'Tentar de novo',
    exportable: true,
  },
};

interface Props {
  code: DbErrorCode;
  detail: string;
  onExport: (() => Promise<Uint8Array | null>) | null;
}

export function ErrorScreen({ code, detail, onExport }: Props) {
  const message = MESSAGES[code];
  const [exportError, setExportError] = useState<string | null>(null);

  async function exportDb() {
    try {
      const bytes = await onExport?.();
      if (bytes) downloadBytes(bytes, `ohara-${isoDay(new Date())}.sqlite3`);
      else setExportError('Não foi possível ler o banco.');
    } catch {
      setExportError('Não foi possível ler o banco.');
    }
  }

  const canExport = message.exportable && onExport !== null;

  return (
    <main className={styles.tela} data-testid="erro" data-code={code}>
      <section className={styles.cartao} role="alert">
        <h1 className={styles.titulo}>{message.text}</h1>
        {code === 'desconhecido' && (
          <details className={styles.detalhe}>
            <summary>Detalhe técnico</summary>
            <pre>{detail}</pre>
          </details>
        )}
        {exportError && <p className={styles.detalhe}>{exportError}</p>}
        <div className={styles.botoes}>
          {canExport && (
            <button
              type="button"
              className={styles.botao}
              autoFocus
              onClick={() => void exportDb()}
            >
              Exportar banco
            </button>
          )}
          {message.retry && (
            <button
              type="button"
              className={styles.botao}
              autoFocus={!canExport}
              onClick={() => window.location.reload()}
            >
              {message.retry}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
