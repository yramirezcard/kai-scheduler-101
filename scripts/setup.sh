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
export NEEDRESTART_MODE=l
export DEBIAN_FRONTEND=noninteractive
sudo mkdir -p /etc/needrestart/conf.d
printf "%s\n" "\$nrconf{restart} = 'l';" | sudo tee /etc/needrestart/conf.d/kai-scheduler-101.conf >/dev/null
log "Installing bootstrap host packages"
sudo apt-get update -y
sudo apt-get install -y \
  ansible \
  ca-certificates \
  curl \
  git \
  gnupg \
  lsb-release \
  python3 \
  python3-pip \
  socat \
  tar \
  unzip

if ! command -v ansible-playbook >/dev/null 2>&1; then
  die "ansible-playbook was not installed successfully"
fi

log "Running ansible bootstrap"
ansible-playbook -i "$REPO_ROOT/ansible/inventory/hosts.ini" "$REPO_ROOT/ansible/site.yml"

publish_envoy_socket() {
  [[ "${ENVOY_GATEWAY_ENABLED:-true}" == "true" ]] || return 0

  local gateway_name="kai-gw"
  local host_port="${ENVOY_HOST_PORT:-3001}"
  local cip=""

  for _ in {1..30}; do
    cip="$(KUBECONFIG="$(kubeconfig_path)" kubectl -n envoy-gateway-system get svc \
      -l gateway.envoyproxy.io/owning-gateway-name="${gateway_name}" \
      -o jsonpath='{.items[0].spec.clusterIP}' 2>/dev/null || true)"
    [[ -n "$cip" ]] && break
    sleep 5
  done

  if [[ -z "$cip" ]]; then
    warn "Envoy data-plane ClusterIP for ${gateway_name} not found; Prometheus tunnel on ${host_port} was not published."
    return 0
  fi

  log "Publishing Envoy routes on host :${host_port} (socat to ${cip}:80)"
  sudo tee /etc/systemd/system/kai-scheduler-101-envoy-proxy.service >/dev/null <<UNIT
[Unit]
Description=KAI Scheduler 101 Envoy host socket proxy for Brev
After=k3s.service network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/socat -d TCP-LISTEN:${host_port},fork,reuseaddr,bind=0.0.0.0 TCP:${cip}:80
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable kai-scheduler-101-envoy-proxy.service >/dev/null 2>&1 || true
  sudo systemctl restart kai-scheduler-101-envoy-proxy.service
  log "Prometheus Gateway route: http://<host>:${host_port}${PROMETHEUS_ROUTE_PATH:-/prometheus}/"
}

publish_envoy_socket

"$HERE/40-lab-workspace.sh"

# Interactive workshop website (Next.js + live shell). Set DEPLOY_WORKSHOP=false to skip.
if [[ "${DEPLOY_WORKSHOP:-true}" != "false" ]]; then
  "$HERE/70-workshop.sh" || warn "phase 70 (workshop site) failed — non-fatal; the cluster is still up."
fi

log "Done. KAI Scheduler 101 is ready:"
log "  • Workshop site : http://<host>:${WORKSHOP_PORT:-3000}/   (START HERE — lessons + live shell)"
log "  • Prometheus    : http://<host>:${ENVOY_HOST_PORT:-3001}${PROMETHEUS_ROUTE_PATH:-/prometheus}/   (expose port ${ENVOY_HOST_PORT:-3001})"
log "  • Cluster       : KUBECONFIG=$(kubeconfig_path) kubectl get nodes"
