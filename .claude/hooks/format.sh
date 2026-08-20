#!/bin/bash
# PostToolUse hook: Claudeがファイルを編集・作成した直後にPrettierを自動適用する。
# stdinにhookのJSONペイロードが渡される。node_modules未導入の間は静かに何もしない。
file=$(node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).tool_input.file_path||'')}catch{}})" 2>/dev/null)
[ -n "$file" ] && [ -f "$file" ] || exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.json|*.md|*.html)
    root=$(cd "$(dirname "$0")/../.." && pwd)
    [ -d "$root/node_modules" ] && (cd "$root" && npx --no-install prettier --write "$file" >/dev/null 2>&1)
    ;;
esac
exit 0
