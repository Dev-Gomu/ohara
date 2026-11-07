-- Toda tabela sincronizável tem id (UUID), updated_at (HLC) e deleted (exclusão lógica).
CREATE TABLE years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  year_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color INTEGER NOT NULL,
  last_access TEXT,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  folder_id TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  slides INTEGER NOT NULL,
  notes TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  due TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  lesson_id TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE slots (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  weekday INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  every INTEGER NOT NULL,
  anchor TEXT NOT NULL,
  label TEXT NOT NULL,
  room TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  date TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

-- Versões das Anotações ficam só no aparelho e são apagadas de verdade (D85).
CREATE TABLE note_versions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  html TEXT NOT NULL
);
CREATE INDEX note_versions_lesson ON note_versions (lesson_id, at);

CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE device_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX lessons_subject ON lessons (subject_id);
CREATE INDEX cards_lesson ON cards (lesson_id);
