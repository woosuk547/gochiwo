#!/usr/bin/env bash
# 로컬에서 NCP 서버로 이미지 빌드·전송·기동
# 사용: NCP_HOST=x.x.x.x NCP_USER=root ./scripts/deploy-ncp.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

NCP_HOST="${NCP_HOST:-101.79.25.108}"
NCP_USER="${NCP_USER:-root}"
KEY_FILE="${KEY_FILE:-$ROOT_DIR/deploy/ncp/repause-key.pem}"
if [[ -f "$KEY_FILE" ]]; then
  SSH_OPTS="${SSH_OPTS:--i $KEY_FILE -o StrictHostKeyChecking=accept-new}"
else
  SSH_OPTS="${SSH_OPTS:--o StrictHostKeyChecking=accept-new}"
fi

ENV_FILE="${ENV_FILE:-$ROOT_DIR/deploy/ncp/.env.production}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing $ENV_FILE — copy from Railway vars first" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
# build-args용 public 값만 로드
source <(grep -E '^(NEXT_PUBLIC_|NAVER_MAP_CLIENT_SECRET=)' "$ENV_FILE" || true)
set +a

echo "==> docker build"
docker build \
  --platform linux/amd64 \
  --build-arg "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-https://repause.co.kr}" \
  --build-arg "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID:-}" \
  --build-arg "NAVER_MAP_CLIENT_SECRET=${NAVER_MAP_CLIENT_SECRET:-}" \
  -t repause:latest .

echo "==> save & upload image"
docker save repause:latest | gzip | ssh $SSH_OPTS "${NCP_USER}@${NCP_HOST}" 'gunzip | docker load'

echo "==> sync compose/env/nginx"
ssh $SSH_OPTS "${NCP_USER}@${NCP_HOST}" 'mkdir -p /opt/repause'
scp $SSH_OPTS "$ROOT_DIR/deploy/ncp/docker-compose.yml" "${NCP_USER}@${NCP_HOST}:/opt/repause/docker-compose.yml"
scp $SSH_OPTS "$ENV_FILE" "${NCP_USER}@${NCP_HOST}:/opt/repause/.env.production"
scp $SSH_OPTS "$ROOT_DIR/deploy/ncp/nginx-repause.conf" "${NCP_USER}@${NCP_HOST}:/etc/nginx/sites-available/repause"

ssh $SSH_OPTS "${NCP_USER}@${NCP_HOST}" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/repause
docker compose up -d --force-recreate
ln -sfn /etc/nginx/sites-available/repause /etc/nginx/sites-enabled/repause
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
docker compose ps
curl -fsS -o /dev/null -w "local:%{http_code}\n" http://127.0.0.1:3000/ || true
REMOTE

echo "Deploy done. Point DNS A record to ${NCP_HOST}, then:"
echo "  ssh ${NCP_USER}@${NCP_HOST} 'certbot --nginx -d repause.co.kr -d www.repause.co.kr'"
