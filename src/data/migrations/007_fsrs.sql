-- Treino com FSRS (Etapa 11). Os cartões existentes ficam como novos (state 0) e mantêm a data:
-- o app lê "2026-11-15" como meia-noite local; depois da 1ª resposta, `due` ganha a hora.
ALTER TABLE cards ADD COLUMN state INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN stability REAL NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN difficulty REAL NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN reps INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN lapses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN learning_steps INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN scheduled_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN last_review TEXT;

-- Histórico das respostas: só recebe linhas novas e sincroniza (otimizador no backlog, B06).
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  grade INTEGER NOT NULL,
  state INTEGER NOT NULL,
  due TEXT NOT NULL,
  stability REAL NOT NULL,
  difficulty REAL NOT NULL,
  scheduled_days INTEGER NOT NULL,
  learning_steps INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  deleted_by TEXT
);
CREATE INDEX reviews_card ON reviews (card_id);

-- Preferências que sincronizam (ex.: train.retention); a chave é o id.
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  deleted_by TEXT
);
