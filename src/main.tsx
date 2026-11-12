import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { DbErrorCode } from './core/db/protocol';
import { EMPTY_STUDY } from './core/study/create';
import { FILE_DIR } from './core/study/files';
import { createFixtures } from './core/study/fixtures';
import type { StudyData } from './core/study/types';
import { createClient, DbError, type DbClient } from './data/client';
import { createDbStorage } from './data/dbStorage';
import { acquireLock } from './data/lock';
import { prefixed } from './core/appInfo';
import { DB_NAME } from './data/dbName';
import { ErrorScreen } from './ui/shell/ErrorScreen';
import { Loading } from './ui/shell/Loading';
import { Shell } from './ui/shell/Shell';
import { setStorage, storage, today } from './ui/study/study';
import './ui/styles/fonts.css';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import './ui/styles/paletas.css';
import { applyPalette, applyTheme } from './ui/theme';

applyTheme();
applyPalette();

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado');
const root = createRoot(container);

function show(node: ReactNode) {
  root.render(<StrictMode>{node}</StrictMode>);
}

// Modo exemplo (?exemplo): outro banco, preenchido com dados fictícios. Só para testes e dev.
const sample = new URLSearchParams(window.location.search).has('exemplo');
const NAMES = sample
  ? {
      pool: prefixed('exemplo-pool'),
      file: `${DB_NAME}-exemplo.sqlite3`,
      lock: prefixed('trava-exemplo'),
      filesDir: `${FILE_DIR}-exemplo`,
    }
  : {
      pool: prefixed('pool'),
      file: `${DB_NAME}.sqlite3`,
      lock: prefixed('trava'),
      filesDir: FILE_DIR,
    };

function initialData(): StudyData {
  if (sample) return createFixtures(today);
  const year = { id: crypto.randomUUID(), name: String(new Date().getFullYear()), archived: false };
  return { ...EMPTY_STUDY, years: [year] };
}

function fail(code: DbErrorCode, detail: string, client: DbClient | null) {
  show(
    <ErrorScreen
      code={code}
      detail={detail}
      onExport={client ? async () => client.exportFile() : null}
    />,
  );
}

async function boot() {
  const forced = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('erro')
    : null;
  if (forced) return fail(forced as DbErrorCode, 'Erro forçado no dev.', null);

  show(<Loading />);
  if (!(await acquireLock(NAMES.lock))) return fail('outra-aba', '', null);
  // Pede ao navegador para não apagar os dados sozinho (D24); a resposta aparece em Configs.
  await navigator.storage?.persist?.().catch(() => false);

  const client = createClient();
  try {
    setStorage(
      await createDbStorage(client, {
        pool: NAMES.pool,
        file: NAMES.file,
        filesDir: NAMES.filesDir,
        persistent: !sample,
        initial: initialData,
        onFatal: (error) => fail(error.code ?? 'gravacao', error.message, client),
      }),
    );
  } catch (error) {
    const code = error instanceof DbError ? error.code : 'desconhecido';
    return fail(code, error instanceof Error ? error.message : String(error), client);
  }
  show(<Shell />);
  // Arquivos de aulas excluídas só saem do disco aqui: o Desfazer já não vale depois de recarregar.
  void storage.sweepBlobs().catch(() => undefined);
}

void boot();
