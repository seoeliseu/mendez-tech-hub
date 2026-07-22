#!/usr/bin/env bash
# Rebuild rapido do Mendez Tech Hub no Docker (bash / WSL / git-bash).
#   ./docker-rebuild.sh             # rebuild (com cache) + sobe em background
#   ./docker-rebuild.sh --no-cache  # rebuild limpo, ignora cache
#   ./docker-rebuild.sh --logs      # rebuild + sobe + segue os logs
set -euo pipefail
cd "$(dirname "$0")"

build=(docker compose build)
follow=0
for a in "$@"; do
  case "$a" in
    --no-cache) build+=(--no-cache) ;;
    --logs)     follow=1 ;;
    *) echo "flag desconhecida: $a" >&2; exit 2 ;;
  esac
done

echo "==> ${build[*]}"
"${build[@]}"

echo "==> docker compose up -d"
docker compose up -d

echo "==> pronto -> http://localhost:3000"
[ "$follow" = "1" ] && exec docker compose logs -f || true
