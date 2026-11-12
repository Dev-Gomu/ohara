-- Os bytes ficam no OPFS (.ohara2-files/<sha256>); aqui só os dados do anexo (D31).
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  sha256 TEXT NOT NULL,
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  pages INTEGER NOT NULL,
  kind TEXT NOT NULL,
  lesson_id TEXT,
  subject_id TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX files_lesson ON files (lesson_id);
CREATE INDEX files_sha ON files (sha256);

-- A contagem de páginas agora vem de files.pages.
ALTER TABLE lessons DROP COLUMN slides;
