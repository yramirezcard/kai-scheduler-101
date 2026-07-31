# KAI Scheduler 101 Brev Launchable

Hands-on KAI Scheduler lab for a CPU-only Brev VM. The bootstrap creates a single-node k3s cluster, installs KWOK, creates simulated GPU nodes, installs fake-gpu-operator, installs Grove, installs Prometheus and Grafana with kube-prometheus-stack, and serves an interactive Next.js tutorial with an embedded shell.

## What This Lab Teaches

- KAI Scheduler installation with Helm chart `v0.16.5`.
- KAI operator, scheduler, binder, PodGroup, queue, topology, and shard CRDs.
- Queue hierarchy, quota, limits, priority, over-quota distribution, DRF, reclaim, and time-based fairshare.
- Workload priority and preemption.
- Gang, elastic, and hierarchical PodGroup scheduling.
- Scheduling cycle events, bin-pack vs spread, scheduling shards, and topology-aware scheduling.
- GPU sharing concepts and DRA-first workload examples.
- Metrics, snapshots, and ecosystem integration patterns.

## Brev Shape

| Resource | Value |
| --- | --- |
| Runtime | VM mode, Ubuntu 22.04 |
| Compute | 16 vCPU, 32 GB RAM recommended |
| GPU | none |
| Kubernetes | k3s |
| Simulated GPU layer | KWOK plus fake-gpu-operator |
| Workshop port | 3000 |

## Launchable Setup Script

```bash
cd kai-scheduler-101
./scripts/brev-setup.sh
```

Optional Launchable variables:

| Variable | Default |
| --- | --- |
| `K3S_CHANNEL` | `v1.34` |
| `K3S_VERSION` | unset, uses `K3S_CHANNEL` |
| `WORKSHOP_PORT` | `3000` |
| `KAI_VERSION` | `v0.16.5` |
| `FAKE_GPU_OPERATOR_VERSION` | `0.2.0` |
| `GROVE_VERSION` | `v0.1.0-alpha.11` |
| `GROVE_NAMESPACE` | `grove-system` |
| `KWOK_VERSION` | `v0.7.0` |
| `KUBE_PROMETHEUS_STACK_VERSION` | unset, uses chart repository default |
| `MONITORING_NAMESPACE` | `monitoring` |

`FAKE_GPU_OPERATOR_VERSION` pins the OCI Helm chart from `oci://ghcr.io/run-ai/fake-gpu-operator/fake-gpu-operator`. The GitHub release tag is `v0.2.0`, while Helm expects chart version `0.2.0`; the setup role accepts either form and strips a leading `v` before calling Helm.

`GROVE_VERSION` pins the Grove OCI Helm chart from `oci://ghcr.io/ai-dynamo/grove/grove-charts`. The chart version includes the leading `v`, matching the Grove release tag.

## Repo Layout

```text
ansible/      readable bootstrap roles for host prep, k3s, tooling, KWOK, fake GPUs, Grove, observability
kwok/         simulated node manifests, including 4-node and 24-node fleets
manifests/    YAML used by hands-on lessons
scripts/      Brev wrapper, setup orchestration, and workshop service setup
web/          Next.js tutorial UI with MDX lessons and embedded terminal
```

## Local Content Preview

```bash
cd web
npm install
npm run dev
```

The UI renders locally without a cluster. Hands-on checks need the Brev/k3s environment.

## Teardown

```bash
sudo /usr/local/bin/k3s-uninstall.sh
sudo systemctl disable --now kai-scheduler-101-workshop.service
```
