#!/usr/bin/env bash
# Top-level orchestrator for the Brev Launchable. Host and cluster bootstrap is kept in
# ansible roles so the lab setup stays readable, repeatable, and easy to rerun by section.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$HERE/lib/common.sh"
load_env

log "KAI Scheduler 101 launchable: starting provision"

"$HERE/00-preflight.sh"
if ! command -v ansible-playbook >/dev/null 2>&1; then
  log "Installing ansible"
  sudo apt-get update -y
  sudo apt-get install -y ansible
fi

log "Running ansible bootstrap"
ansible-playbook -i "$REPO_ROOT/ansible/inventory/hosts.ini" "$REPO_ROOT/ansible/site.yml"

"$HERE/40-lab-workspace.sh"

# Interactive workshop website (Next.js + live shell). Set DEPLOY_WORKSHOP=false to skip.
if [[ "${DEPLOY_WORKSHOP:-true}" != "false" ]]; then
  "$HERE/70-workshop.sh" || warn "phase 70 (workshop site) failed — non-fatal; the cluster is still up."
fi

log "Done. KAI Scheduler 101 is ready:"
log "  • Workshop site : http://<host>:${WORKSHOP_PORT:-3000}/   (START HERE — lessons + live shell)"
log "  • Cluster       : KUBECONFIG=$(kubeconfig_path) kubectl get nodes"
