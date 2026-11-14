-- Imagens dos cartões (D158): reduzidas e guardadas no próprio banco (data URL), para irem no backup.
-- O texto do cartão aponta para elas com a linha "{img:id}"; o lado (frente ou verso) fica aqui.
CREATE TABLE card_images (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  side TEXT NOT NULL,
  mime TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX card_images_lesson ON card_images (lesson_id);
