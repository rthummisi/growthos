#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

# ── Self-register as global command ───────────────────────────────────────────
SYMLINK="/usr/local/bin/growthos"
if [[ ! -L "$SYMLINK" ]] || [[ "$(readlink "$SYMLINK")" != "$ROOT/growthos.sh" ]]; then
  echo -e "\033[0;36m  →\033[0m Registering 'growthos' as a global command..."
  ln -sf "$ROOT/growthos.sh" "$SYMLINK" 2>/dev/null || \
    sudo ln -sf "$ROOT/growthos.sh" "$SYMLINK"
  echo -e "\033[0;32m  ✓\033[0m You can now run 'growthos' from anywhere"
fi

# ── Colours ────────────────────────────────────────────────────────────────────
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

info()    { echo -e "${CYAN}  →${RESET} $*"; }
success() { echo -e "${GREEN}  ✓${RESET} $*"; }
warn()    { echo -e "${YELLOW}  ⚠${RESET} $*"; }
error()   { echo -e "${RED}  ✗${RESET} $*"; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }

# ── Cleanup on exit ────────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  header "Shutting down GrowthOS..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  success "All processes stopped."
}
trap cleanup EXIT INT TERM

# ── Banner ─────────────────────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  ██████╗ ██████╗  ██████╗ ██╗    ██╗████████╗██╗  ██╗ ██████╗ ███████╗"
echo "  ██╔════╝ ██╔══██╗██╔═══██╗██║    ██║╚══██╔══╝██║  ██║██╔═══██╗██╔════╝"
echo "  ██║  ███╗██████╔╝██║   ██║██║ █╗ ██║   ██║   ███████║██║   ██║███████╗"
echo "  ██║   ██║██╔══██╗██║   ██║██║███╗██║   ██║   ██╔══██║██║   ██║╚════██║"
echo "  ╚██████╔╝██║  ██║╚██████╔╝╚███╔███╔╝   ██║   ██║  ██║╚██████╔╝███████║"
echo "   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
echo -e "${RESET}"
echo -e "  ${CYAN}PLG Distribution Engine — v$(node -p "require('$ROOT/package.json').version")${RESET}"
echo ""

# ── Load .env ─────────────────────────────────────────────────────────────────
if [[ -f "$ROOT/.env" ]]; then
  set -a; source "$ROOT/.env"; set +a
  success "Environment loaded from .env"
else
  warn ".env not found — using system environment"
fi

# ── Check ANTHROPIC_API_KEY ───────────────────────────────────────────────────
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  error "ANTHROPIC_API_KEY is not set in .env — agents will not function"
  echo "  Set it in $ROOT/.env and restart."
  exit 1
fi

# ── Step 1: Docker services ────────────────────────────────────────────────────
header "1/4  Starting infrastructure (Postgres · Redis · MinIO)..."

if ! docker info &>/dev/null; then
  error "Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

docker compose -f "$ROOT/infra/docker-compose.yml" up -d --remove-orphans \
  > "$LOG_DIR/docker.log" 2>&1
success "Docker services started"

# Wait for Postgres
info "Waiting for Postgres..."
for i in $(seq 1 30); do
  if docker exec "$(docker compose -f "$ROOT/infra/docker-compose.yml" ps -q postgres)" \
    pg_isready -U growthos -d growthos &>/dev/null 2>&1; then
    success "Postgres ready"
    break
  fi
  if [[ $i -eq 30 ]]; then
    error "Postgres did not become ready in 30s"
    exit 1
  fi
  sleep 1
done

# Wait for Redis
info "Waiting for Redis..."
for i in $(seq 1 15); do
  if docker exec "$(docker compose -f "$ROOT/infra/docker-compose.yml" ps -q redis)" \
    redis-cli ping &>/dev/null 2>&1; then
    success "Redis ready"
    break
  fi
  if [[ $i -eq 15 ]]; then
    error "Redis did not become ready in 15s"
    exit 1
  fi
  sleep 1
done

# ── Step 2: Prisma migration ───────────────────────────────────────────────────
header "2/4  Running database migrations..."
cd "$ROOT"
npx prisma migrate deploy > "$LOG_DIR/migrate.log" 2>&1 && \
  success "Migrations applied" || \
  warn "Migration had warnings — check $LOG_DIR/migrate.log"
npx prisma generate > "$LOG_DIR/prisma-generate.log" 2>&1
success "Prisma client generated"

# ── Step 3: Backend ────────────────────────────────────────────────────────────
header "3/4  Starting backend (http://localhost:3001)..."
cd "$ROOT/backend"
npm run dev > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
PIDS+=("$BACKEND_PID")

info "Waiting for backend..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/system &>/dev/null; then
    success "Backend ready → http://localhost:3001"
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    error "Backend crashed — check $LOG_DIR/backend.log"
    cat "$LOG_DIR/backend.log" | tail -20
    exit 1
  fi
  if [[ $i -eq 30 ]]; then
    warn "Backend health check timed out — may still be compiling"
  fi
  sleep 1
done

# ── Step 4: Frontend ───────────────────────────────────────────────────────────
header "4/4  Starting frontend (http://localhost:3000)..."
cd "$ROOT/frontend"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
PIDS+=("$FRONTEND_PID")

info "Waiting for frontend..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000 &>/dev/null; then
    success "Frontend ready → http://localhost:3000"
    break
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    error "Frontend crashed — check $LOG_DIR/frontend.log"
    cat "$LOG_DIR/frontend.log" | tail -20
    exit 1
  fi
  if [[ $i -eq 30 ]]; then
    warn "Frontend health check timed out — may still be compiling"
  fi
  sleep 1
done

# ── Ready ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}  ✓ GrowthOS is running${RESET}"
echo ""
echo -e "  ${BOLD}Dashboard${RESET}   http://localhost:3000"
echo -e "  ${BOLD}API${RESET}         http://localhost:3001"
echo -e "  ${BOLD}MinIO${RESET}       http://localhost:9001  (growthos / growthos)"
echo ""
echo -e "  ${BOLD}Logs${RESET}        $LOG_DIR/"
echo -e "  ${CYAN}Press Ctrl+C to stop all services${RESET}"
echo ""

# ── Tail logs ─────────────────────────────────────────────────────────────────
tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log" &
PIDS+=($!)
wait
