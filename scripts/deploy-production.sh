#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MESSAGE="${1:-deploy: production update}"

railway up -d \
  --service repause \
  --environment production \
  -m "$MESSAGE"

echo "Production deploy started."
echo "Status: railway deployment list"
echo "URL: https://repause-production.up.railway.app"
