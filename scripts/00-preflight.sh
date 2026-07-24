#!/usr/bin/env bash
# Phase 00 — sanity checks before we touch the host.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$HERE/lib/common.sh"
load_env

log "Preflight checks"

# Architecture (kind node images are published for amd64 + arm64).
arch="$(uname -m)"
case "$arch" in
  x86_64|amd64|aarch64|arm64) log "Architecture: $arch (supported)";;
  *) warn "Architecture '$arch' is unusual for kind — proceeding anyway.";;
esac

# Disk: kind + node images + the workshop build want a few GB.
avail_kb="$(df -Pk "$HOME" | awk 'NR==2{print $4}')"
if [[ -n "${avail_kb:-}" && "$avail_kb" -lt 15000000 ]]; then
  warn "Less than ~15 GB free under $HOME — the cluster + site build may be tight."
else
  log "Disk under $HOME looks sufficient."
fi

# Memory hint.
mem_kb="$(awk '/MemTotal/{print $2}' /proc/meminfo 2>/dev/null || echo 0)"
if [[ "$mem_kb" -gt 0 && "$mem_kb" -lt 7500000 ]]; then
  warn "Less than ~8 GB RAM detected — a multi-node kind cluster may be cramped. Consider KIND_WORKERS=1."
fi

log "Preflight OK."
