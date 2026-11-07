-- Presença: um registro por aula (matéria, dia e hora de início) que foi cancelada ou teve falta.
-- Aula sem registro conta como presente. Horas faltadas, em blocos de 1 hora.
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  missed REAL NOT NULL,
  cancelled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX attendance_subject ON attendance (subject_id, date);

-- Data em que começam a valer as aulas da matéria para a conta dos 75%.
ALTER TABLE subjects ADD COLUMN classes_from TEXT;
