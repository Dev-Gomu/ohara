-- Cofre das Notas do boletim (D35 a D40). Nada aqui revela a chave mestra nem as notas:
-- a chave fica embrulhada pela frase e pelo código de recuperação, e os registros, cifrados.
CREATE TABLE vault (
  id TEXT PRIMARY KEY,
  iterations INTEGER NOT NULL,
  pass_salt TEXT NOT NULL,
  pass_wrapped TEXT NOT NULL,
  code_salt TEXT NOT NULL,
  code_wrapped TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE secret_records (
  id TEXT PRIMARY KEY,
  iv TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
