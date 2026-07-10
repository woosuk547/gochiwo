#!/usr/bin/env bash
# NCP Ubuntu 서버 최초 1회 실행 (root)
set -euo pipefail

apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw nginx certbot python3-certbot-nginx

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# Firewall: SSH / HTTP / HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p /opt/repause /var/www/certbot
echo "bootstrap ok"
