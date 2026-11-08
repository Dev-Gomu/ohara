#!/usr/bin/env bash
# Portão + commit numa chamada só, com saída curta.
# Uso: npm run salvar -- "Mensagem do commit" ["Co-Authored-By: ..."]
# Só entra no commit o que já é do repositório e as pastas do app (src, docs, lab, e2e,
# scripts): as pastas de pacotes do ClaudeWeb ficam de fora.
set -euo pipefail

mensagem="${1:-}"
if [ -z "$mensagem" ]; then
  echo 'Falta a mensagem: npm run salvar -- "Mensagem"'
  exit 1
fi

if ! saida=$(npm run check 2>&1); then
  echo "$saida" | grep -iE 'error|fail|✗|×' | head -20
  echo 'check falhou: nada foi commitado.'
  exit 1
fi

git add -u
git add src docs lab e2e scripts package.json CLAUDE.md 2>/dev/null || true
if [ -n "${2:-}" ]; then git commit -q -m "$mensagem" -m "$2"; else git commit -q -m "$mensagem"; fi
git log --oneline -1
