import type {
  DbFailure,
  Diagnostics,
  OpenResult,
  Reply,
  Request,
  ResultMap,
} from '../core/db/protocol';
import type { Row } from '../core/db/rows';
import type { Change } from '../core/db/protocol';

export class DbError extends Error {
  readonly code: DbFailure['code'];
  constructor(failure: DbFailure) {
    super(failure.message);
    this.code = failure.code;
  }
}

export interface DbClient {
  open(pool: string, file: string): Promise<OpenResult>;
  apply(changes: Change[]): Promise<void>;
  loadVersions(lessonId: string): Promise<Row[]>;
  exportFile(): Promise<Uint8Array>;
  diagnose(): Promise<Diagnostics>;
}

type Pending = { resolve: (value: never) => void; reject: (error: DbError) => void };

export function createClient(): DbClient {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, Pending>();
  let next = 0;

  worker.onmessage = (event: MessageEvent<Reply>) => {
    const reply = event.data;
    const entry = pending.get(reply.id);
    if (!entry) return;
    pending.delete(reply.id);
    if (reply.ok) entry.resolve(reply.result as never);
    else entry.reject(new DbError(reply.error));
  };
  worker.onerror = (event) => {
    const failure = new DbError({ code: 'desconhecido', message: event.message });
    pending.forEach((entry) => entry.reject(failure));
    pending.clear();
  };

  function send<T extends Request['type']>(request: Request & { type: T }): Promise<ResultMap[T]> {
    return new Promise((resolve, reject) => {
      next += 1;
      pending.set(next, { resolve: resolve as Pending['resolve'], reject });
      worker.postMessage({ id: next, request });
    });
  }

  return {
    open: (pool, file) => send({ type: 'open', pool, file }),
    apply: async (changes) => void (await send({ type: 'apply', changes })),
    loadVersions: (lessonId) => send({ type: 'loadVersions', lessonId }),
    exportFile: () => send({ type: 'export' }),
    diagnose: () => send({ type: 'diagnose' }),
  };
}
