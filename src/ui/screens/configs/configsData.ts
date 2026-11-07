import type { Diagnostics } from '../../../core/db/protocol';
import { SPECS } from '../../../core/db/specs';
import { isoDay } from '../../../core/study/dates';
import { dispatch } from '../../keyboard/store';
import { downloadBytes } from '../../study/download';
import { storage } from '../../study/study';
import { toggleTheme } from '../../theme';

export interface Row {
  label: string;
  detail: string;
  run?: () => void;
}

export interface Section {
  name: string;
  rows: readonly Row[];
}

const LATER = 'Disponível quando os dados reais chegarem.';

function megabytes(bytes: number | null): string {
  return bytes === null ? 'indisponível' : `${(bytes / 1_048_576).toFixed(1)} MB`;
}

async function exportDatabase(): Promise<void> {
  const bytes = await storage.exportDatabase();
  if (bytes) downloadBytes(bytes, `ohara-${isoDay(new Date())}.sqlite3`);
}

function aboutRows(diag: Diagnostics | null): Row[] {
  const version: Row = { label: 'Ohara', detail: `Versão ${__APP_VERSION__}` };
  if (!diag) return [version, { label: 'Banco', detail: 'Lendo o diagnóstico…' }];
  const persisted = diag.persisted === null ? 'indisponível' : diag.persisted ? 'sim' : 'não';
  const counts = SPECS.map((spec) => `${spec.table} ${diag.counts[spec.table] ?? 0}`).join(', ');
  return [
    version,
    { label: 'SQLite', detail: `Versão ${diag.sqliteVersion}, esquema ${diag.schemaVersion}` },
    { label: 'Armazenamento persistente', detail: persisted },
    {
      label: 'Espaço',
      detail: `Usado ${megabytes(diag.usage)} de ${megabytes(diag.quota)}`,
    },
    { label: 'Registros', detail: counts },
    { label: 'Aparelho', detail: diag.deviceId },
  ];
}

export function buildSections(diag: Diagnostics | null): readonly Section[] {
  return [
    {
      name: 'Aparência',
      rows: [
        { label: 'Trocar tema', detail: 'Claro ou escuro, neste aparelho.', run: toggleTheme },
      ],
    },
    {
      name: 'Atalhos',
      rows: [
        {
          label: 'Ver todos os atalhos',
          detail: 'Abre a lista gerada da tabela de teclas.',
          run: () => dispatch({ type: 'openHelp' }),
        },
      ],
    },
    { name: 'Sincronização', rows: [{ label: 'Google Drive', detail: LATER }] },
    {
      name: 'Backup',
      rows: [
        {
          label: 'Exportar banco',
          detail: 'Baixa uma cópia dos dados, em um arquivo .sqlite3.',
          run: () => void exportDatabase(),
        },
      ],
    },
    { name: 'Segurança', rows: [{ label: 'Frase de acesso das Notas', detail: LATER }] },
    { name: 'Sobre', rows: aboutRows(diag) },
  ];
}
