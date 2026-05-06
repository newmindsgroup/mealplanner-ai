#!/usr/bin/env bash
# ============================================================================
# NourishAI — One-Command VPS Deployment Script
# ============================================================================
#
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh              # Full deploy (build + push + restart)
#   ./deploy/deploy.sh --build-only # Build containers only
#   ./deploy/deploy.sh --restart    # Restart without rebuilding
#   ./deploy/deploy.sh --status     # Check service status
#   ./deploy/deploy.sh --logs       # Tail container logs
#   ./deploy/deploy.sh --ssl DOMAIN # Set up SSL with certbot
#
# Prerequisites:
#   - Docker & Docker Compose installed
#   - .env file configured (see .env.example)
#   - Domain DNS pointed to VPS IP (for SSL)
#
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${PURPLE}"
echo "  _   _                 _     _        _    ___"
echo " | \ | |               (_)   | |      / \  |_ _|"
echo " |  \| | ___  _   _ _ __ _ ___| |__   / _ \  | |"
echo " | |\  |/ _ \| | | | '__| / __| '_ \ / ___ \ | |"
echo " |_| \_|\___/ \__,_|_|  |_|\___|_| |_/_/   \_\___|"
echo -e "${NC}"
echo -e "${BLUE}🚀 NourishAI Deployment Manager v2.0${NC}"
echo ""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️ $1${NC}"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"; exit 1; }

check_prereqs() {
  command -v docker >/dev/null 2>&1 || error "Docker is not installed"
  command -v docker compose >/dev/null 2>&1 || error "Docker Compose is not installed"
  
  if [ ! -f ".env" ]; then
    warn ".env file not found — copying from .env.example"
    if [ -f ".env.example" ]; then
      cp .env.example .env
      warn "Please edit .env with your actual values before deploying"
      exit 1
    else
      error "No .env or .env.example found"
    fi
  fi
}

# ============================================================================
# COMMANDS
# ============================================================================

cmd_build() {
  log "🔨 Building containers..."
  docker compose build --no-cache
  log "✅ Build complete"
}

cmd_deploy() {
  check_prereqs
  
  log "📋 Pre-deployment checks..."
  
  # Verify critical env vars
  source .env 2>/dev/null || true
  [ -z "${JWT_SECRET:-}" ] && warn "JWT_SECRET not set in .env"
  [ -z "${DB_PASSWORD:-}" ] && warn "DB_PASSWORD not set in .env"
  
  log "🔨 Building containers..."
  docker compose build
  
  log "🚀 Starting services..."
  docker compose up -d
  
  log "⏳ Waiting for services to be healthy..."
  sleep 10
  
  # Health check
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ API server is healthy"
  else
    warn "API server not responding yet — checking logs..."
    docker compose logs --tail=20 app
  fi
  
  echo ""
  log "🎉 Deployment complete!"
  echo ""
  echo -e "  ${BLUE}App:${NC}       http://localhost:80"
  echo -e "  ${BLUE}API:${NC}       http://localhost:3001/api/health"
  echo -e "  ${BLUE}Database:${NC}  localhost:3306"
  echo ""
  echo -e "  ${YELLOW}Next steps:${NC}"
  echo "    1. Point your domain DNS to this server's IP"
  echo "    2. Run: ./deploy/deploy.sh --ssl your-domain.com"
  echo "    3. Configure Stripe keys in .env"
  echo ""
}

cmd_restart() {
  log "🔄 Restarting services..."
  docker compose restart
  log "✅ Services restarted"
}

cmd_stop() {
  log "🛑 Stopping services..."
  docker compose down
  log "✅ Services stopped"
}

cmd_status() {
  log "📊 Service Status"
  echo ""
  docker compose ps
  echo ""
  
  # API health check
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ API: Healthy"
    curl -sf http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || true
  else
    warn "API: Not responding"
  fi
}

cmd_logs() {
  docker compose logs -f --tail=100
}

cmd_ssl() {
  local DOMAIN="$1"
  [ -z "$DOMAIN" ] && error "Usage: ./deploy.sh --ssl your-domain.com"
  
  log "🔒 Setting up SSL for $DOMAIN..."
  
  # Install certbot if not present
  if ! command -v certbot >/dev/null 2>&1; then
    log "Installing certbot..."
    apt-get update && apt-get install -y certbot python3-certbot-nginx
  fi
  
  # Get certificate
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
  
  # Set up auto-renewal
  (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
  
  log "✅ SSL configured for $DOMAIN"
  log "✅ Auto-renewal cron job added"
}

cmd_backup() {
  log "💾 Creating database backup..."
  local BACKUP_FILE="backups/nourishai_$(date +%Y%m%d_%H%M%S).sql"
  mkdir -p backups
  
  docker compose exec -T db mysqldump -u root -p"${DB_PASSWORD:-nourishai}" nourishai > "$BACKUP_FILE"
  
  log "✅ Backup saved to $BACKUP_FILE"
}

# ============================================================================
# MAIN
# ============================================================================

case "${1:-}" in
  --build-only) cmd_build ;;
  --restart)    cmd_restart ;;
  --stop)       cmd_stop ;;
  --status)     cmd_status ;;
  --logs)       cmd_logs ;;
  --ssl)        cmd_ssl "${2:-}" ;;
  --backup)     cmd_backup ;;
  --help|-h)
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  (none)         Full deploy (build + start)"
    echo "  --build-only   Build containers only"
    echo "  --restart      Restart services"
    echo "  --stop         Stop all services"
    echo "  --status       Check service status"
    echo "  --logs         Tail container logs"
    echo "  --ssl DOMAIN   Set up SSL certificate"
    echo "  --backup       Backup database"
    echo "  --help         Show this help"
    ;;
  *)            cmd_deploy ;;
esac
