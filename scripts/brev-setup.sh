#!/bin/bash
# Brev Launchable lifecycle wrapper.
# Locate the cloned repo, capture the Launchable env-config vars into .env, run the full
# provision, and tee the output. Deliberately robust: NO `set -e`, so a permission-denied in
# the repo `find` can't kill the script with "error, 0 logs".
set -uo pipefail

echo "[brev-setup] locating repo..."
REPO="$(find "$HOME" /home /workspace . -maxdepth 5 -type d -name kai-scheduler-101 2>/dev/null | head -1 || true)"
if [ -z "${REPO:-}" ]; then
  echo "[brev-setup] ERROR: repo 'kai-scheduler-101' not found under \$HOME /home /workspace"
  ls -la "$HOME" || true
  exit 1
fi
cd "$REPO"
echo "[brev-setup] repo: $REPO"
chmod +x scripts/*.sh 2>/dev/null || true

# Launchable env-config vars (Step 5) are injected as env vars; capture them into .env so
# setup.sh reads them deterministically. All are optional — defaults ship in the repo.
cat > .env <<EOF
K3S_CHANNEL=${K3S_CHANNEL:-v1.34}
K3S_VERSION=${K3S_VERSION:-}
WORKSHOP_PORT=${WORKSHOP_PORT:-3000}
DEPLOY_WORKSHOP=${DEPLOY_WORKSHOP:-true}
KAI_VERSION=${KAI_VERSION:-v0.16.5}
FAKE_GPU_OPERATOR_VERSION=${FAKE_GPU_OPERATOR_VERSION:-0.2.0}
GROVE_VERSION=${GROVE_VERSION:-v0.1.0-alpha.11}
GROVE_NAMESPACE=${GROVE_NAMESPACE:-grove-system}
KWOK_VERSION=${KWOK_VERSION:-v0.7.0}
KUBE_PROMETHEUS_STACK_VERSION=${KUBE_PROMETHEUS_STACK_VERSION:-}
MONITORING_NAMESPACE=${MONITORING_NAMESPACE:-monitoring}
ENVOY_GATEWAY_ENABLED=${ENVOY_GATEWAY_ENABLED:-true}
ENVOY_GATEWAY_VERSION=${ENVOY_GATEWAY_VERSION:-1.4.6}
ENVOY_GATEWAY_NAMESPACE=${ENVOY_GATEWAY_NAMESPACE:-kai-gateway}
ENVOY_HOST_PORT=${ENVOY_HOST_PORT:-3001}
ENVOY_WEB_NODEPORT=${ENVOY_WEB_NODEPORT:-30080}
PROMETHEUS_ROUTE_PATH=${PROMETHEUS_ROUTE_PATH:-/prometheus}
EOF

echo "[brev-setup] running setup.sh (live; also saved to \$HOME/setup.log) ..."
# FOREGROUND + line-buffered so the Brev "Script Logs" panel streams each phase live.
stdbuf -oL -eL ./scripts/setup.sh 2>&1 | stdbuf -oL tee "$HOME/setup.log"
rc=${PIPESTATUS[0]}
echo "[brev-setup] setup.sh exit code: $rc"
[ "$rc" -eq 0 ] && echo "[brev-setup] cluster + course up — open the :3000 tunnel to start." \
               || echo "[brev-setup] failed (rc=$rc) — see the log above or \$HOME/setup.log."
exit "$rc"
