#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# deploy.sh – One-shot VPS deployment for Acte
# ─────────────────────────────────────────────────────────
# USAGE:  SSH_HOST=49.12.109.24 SSH_USER=root ./scripts/deploy.sh
# ─────────────────────────────────────────────────────────
# SSHs into the production server, pulls the latest
# Docker images from GitHub Container Registry, restarts
# the stack, and runs a health check.
# ─────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ─────────────────────────────────────────────
SSH_HOST="${SSH_HOST:-49.12.109.24}"
SSH_USER="${SSH_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
STACK_DIR="${STACK_DIR:-/opt/acte}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.prod.yml}"

# ── SSH command wrapper ────────────────────────────────
ssh_target() {
  ssh -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new \
      -o LogLevel=ERROR "${SSH_USER}@${SSH_HOST}" "$@"
}

echo "━━━ Deploying Acte to ${SSH_HOST} ━━━"

# 1. Ensure the target directory exists on the server
echo "→ Ensuring ${STACK_DIR} exists on the server…"
ssh_target "mkdir -p ${STACK_DIR}"

# 2. Copy compose file and nginx config to the server
echo "→ Uploading compose file and nginx config…"
scp -P "${SSH_PORT}" -o StrictHostKeyChecking=accept-new \
    "${COMPOSE_FILE}" "${SSH_USER}@${SSH_HOST}:${STACK_DIR}/docker-compose.prod.yml"
scp -P "${SSH_PORT}" -o StrictHostKeyChecking=accept-new \
    "docker/nginx.conf" "${SSH_USER}@${SSH_HOST}:${STACK_DIR}/nginx.conf"

# 3. Pull the latest images (avoids downtime during build)
echo "→ Pulling latest Docker images…"
ssh_target "cd ${STACK_DIR} && \
  docker compose -f docker-compose.prod.yml pull --quiet"

# 4. Restart services with zero-downtime (rolling update)
echo "→ Restarting services…"
ssh_target "cd ${STACK_DIR} && \
  docker compose -f docker-compose.prod.yml up -d --remove-orphans"

# 5. Prune unused images / dangling resources
echo "→ Cleaning up…"
ssh_target "docker image prune -f"

# 6. Health check — wait until the backend responds
echo "→ Running health check…"
sleep 5
HEALTH_URL="https://api.acte.app/api/health"
if curl -sf "${HEALTH_URL}" > /dev/null 2>&1; then
  echo "✅ Deployment successful — backend is healthy at ${HEALTH_URL}"
else
  echo "⚠️  Health check failed. Checking container status…"
  ssh_target "cd ${STACK_DIR} && docker compose -f docker-compose.prod.yml ps"
  echo "⚠️  Review logs with: docker compose -f ${STACK_DIR}/docker-compose.prod.yml logs"
  exit 1
fi

# 7. Show running containers
echo "━━━ Active containers ━━━"
ssh_target "cd ${STACK_DIR} && docker compose -f docker-compose.prod.yml ps"

echo "━━━ Done ━━━"
