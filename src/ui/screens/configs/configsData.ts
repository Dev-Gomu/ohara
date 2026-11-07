import type { Diagnostics } from '../../../core/db/protocol';
import { SPECS } from '../../../core/db/specs';
import { isoDay } from '../../../core/study/dates';
import { dispatch } from '../../keyboard/store';
import { pickBackup } from '../../study/attach';
import { downloadBytes } from '../../study/download';
import { showNotice } from '../../study/notice';
import { ask } from '../../shell/PromptWindow';
import { storage } from '../../study/study';
import { currentPalette, cyclePalette, PALETTE_NAMES, toggleTheme } from '../../theme';

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

async function sweepFiles(): Promise<void> {
  const count = await storage.sweepBlobs();
  showNotice(
    count === 0
      ? 'Nenhum arquivo sem uso.'
      : `${count} ${count === 1 ? 'arquivo sem uso apagado' : 'arquivos sem uso apagados'}.`,
  );
}

const IMPORT_MESSAGES = {
  'nao-sqlite': 'Esse arquivo não é um banco SQLite.',
  'nao-ohara': 'Esse banco não é um backup do Ohara.',
  'versao-nova': 'Esse backup é de uma versão mais nova do Ohara. Atualize o app antes.',
} as const;

async function importBackup(file: File): Promise<void> {
  const check = await storage.importDatabase(await file.arrayBuffer());
  if (check === null) return showNotice('Importar só funciona com o banco real.');
  if (check !== 'ok') return showNotice(IMPORT_MESSAGES[check]);
  window.location.reload();
}

function askImport(): void {
  ask({
    title: 'Importar banco',
    action: 'Escolher arquivo',
    fields: [
      {
        id: 'confirma',
        label:
          'Isto SUBSTITUI todos os dados deste aparelho. Os PDFs anexados não vêm no backup. Exporte antes. Para seguir, digite substituir',
      },
    ],
    onSubmit: ({ confirma }) => {
      if (confirma?.trim().toLowerCase() === 'substituir') pickBackup(importBackup);
      else showNotice('Importação cancelada: a palavra não conferiu.');
    },
  });
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
        {
          label: 'Trocar paleta de cores',
          detail: `Original, A (azul-gelo) ou B (cinza-índigo). Agora: ${PALETTE_NAMES[currentPalette()]}.`,
          run: () => showNotice(`Paleta: ${PALETTE_NAMES[cyclePalette()]}.`),
        },
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
        {
          label: 'Importar banco',
          detail: 'Restaura um arquivo .sqlite3 exportado antes. Substitui os dados atuais.',
          run: askImport,
        },
        {
          label: 'Limpar arquivos sem uso',
          detail: 'Apaga PDFs de aulas ou matérias excluídas. Também roda ao abrir o app.',
          run: () => void sweepFiles(),
        },
      ],
    },
    { name: 'Segurança', rows: [{ label: 'Frase de acesso das Notas', detail: LATER }] },
    { name: 'Sobre', rows: aboutRows(diag) },
  ];
}
