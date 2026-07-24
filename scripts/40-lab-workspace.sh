#!/usr/bin/env bash
# Phase 40 — stage the example manifests into a writable lab workspace the in-browser shell
# starts in. Learners edit these freely without dirtying the git checkout.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$HERE/lib/common.sh"
load_env

WORKSPACE="${LAB_WORKSPACE:-$HOME/kai-scheduler-101-labs}"
log "Staging lab workspace at $WORKSPACE"
mkdir -p "$WORKSPACE"
cp -r "$REPO_ROOT/manifests" "$WORKSPACE/" 2>/dev/null || true
cp -r "$REPO_ROOT/kwok" "$WORKSPACE/" 2>/dev/null || true

# Drop a kubeconfig copy the shell can find, and a hint file.
cp "$(kubeconfig_path)" "$WORKSPACE/kubeconfig" 2>/dev/null || true
printf '%s\n' \
  "KAI Scheduler 101 lab workspace" \
  "--------------------------------" \
  "Everything under ./manifests and ./kwok is yours to inspect or edit." \
  "kubectl is pre-pointed at the kind cluster." \
  "Follow the lessons in the website; use Run in shell to send commands here." \
  > "$WORKSPACE/README.txt"

log "Lab workspace ready."
