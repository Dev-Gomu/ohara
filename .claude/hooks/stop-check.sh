#!/usr/bin/env bash
# Ao fim da resposta, roda o portão único. Se falhar, devolve o erro ao Claude (exit 2).
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
# evita laço: se já estamos continuando por causa deste hook, deixa parar
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;; esac
[ -f package.json ] || exit 0
out=$(npm run check 2>&1) || { echo "npm run check falhou:" >&2; echo "$out" | tail -25 >&2; exit 2; }
exit 0
