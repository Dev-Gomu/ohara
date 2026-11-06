#!/usr/bin/env bash
# Formata com Prettier o arquivo que o Claude acabou de gravar.
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "$CLAUDE_PROJECT_DIR" || exit 0
f=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{}})')
case "$f" in
  *.ts|*.tsx|*.js|*.css|*.json|*.html) npx --no-install prettier --write "$f" >/dev/null 2>&1 ;;
esac
exit 0
