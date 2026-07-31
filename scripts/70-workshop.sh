#!/usr/bin/env bash
# Phase 70 (OPTIONAL, default on) — build + serve the interactive workshop website on the
# instance. Next.js app (web/) with a live in-browser shell (node-pty) bridged to a real bash
# with `kubectl` pointed at the k3s cluster. Exposed on PORT 3000 → publish as a Brev tunnel.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$HERE/lib/common.sh"
load_env

WEB_DIR="$REPO_ROOT/web"
PORT="${WORKSHOP_PORT:-3000}"
WORKSPACE="${LAB_WORKSPACE:-$HOME/kai-scheduler-101-labs}"
[[ -d "$WEB_DIR" ]] || { warn "web/ not found — skipping workshop site."; exit 0; }
export NEEDRESTART_MODE=l
export DEBIAN_FRONTEND=noninteractive

# --- Node 20+ and node-pty build deps ---
need_node=1
if command -v node >/dev/null 2>&1; then
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  (( major >= 20 )) && need_node=0
fi
if (( need_node )); then
  log "Installing Node.js 20 (for the workshop server)"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null 2>&1 || warn "NodeSource setup failed."
  sudo apt-get install -y nodejs >/dev/null 2>&1 || die "Could not install Node.js."
fi
# node-pty is a native addon — needs a toolchain.
sudo apt-get install -y python3 make g++ >/dev/null 2>&1 || warn "build tools may be missing (node-pty build could fail)."

log "Installing workshop deps + building (this takes a few minutes)"
cd "$WEB_DIR"
npm ci >/dev/null 2>&1 || npm install
npm run build

# --- run it as a systemd service so it survives logout/reboot ---
log "Installing systemd unit kai-scheduler-101-workshop.service (PORT ${PORT})"
RUN_USER="$(id -un)"
sudo tee /etc/systemd/system/kai-scheduler-101-workshop.service >/dev/null <<UNIT
[Unit]
Description=KAI Scheduler 101 workshop site (Next.js + live shell)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${WEB_DIR}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
Environment=HOST=0.0.0.0
Environment=HOME=${HOME}
Environment=LAB_CWD=${WORKSPACE}
Environment=LAB_KUBECONFIG=$(kubeconfig_path)
ExecStart=$(command -v node) ${WEB_DIR}/server.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now kai-scheduler-101-workshop.service
sudo systemctl restart kai-scheduler-101-workshop.service
code="000"
for _ in {1..20}; do
  code="$(curl -sS -m3 -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/" 2>/dev/null || echo 000)"
  [[ "$code" == "200" ]] && break
  sleep 1
done
log "Workshop site: http://<host>:${PORT}/  (local check -> HTTP ${code})"
if [[ "$code" != "200" ]]; then
  warn "Workshop service did not return HTTP 200 on 127.0.0.1:${PORT}."
  sudo systemctl --no-pager --full status kai-scheduler-101-workshop.service || true
  sudo journalctl -u kai-scheduler-101-workshop.service --no-pager -n 80 || true
  exit 1
fi
log "Expose host port ${PORT} as a Brev tunnel; learners open it and follow the lessons."
