#!/usr/bin/env bash
set -euo pipefail

# Idempotent dependency install for all Next.js apps in this repo.
# Each app is a standalone npm project with its own lockfile.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

APPS=(
  "."
  "apps/lp"
  "apps/pilarim"
  "apps/ueno-gym"
)

for app in "${APPS[@]}"; do
  dir="$ROOT_DIR/$app"
  if [ -f "$dir/package-lock.json" ]; then
    echo "==> Installing dependencies in $app"
    (cd "$dir" && npm ci)
  fi
done

echo "All dependencies installed."
