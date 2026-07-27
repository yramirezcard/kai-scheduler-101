# KAI Scheduler 101 Brev Launchable

Hands-on KAI Scheduler lab for a CPU-only Brev VM. The bootstrap creates a kind cluster, installs KWOK, creates simulated GPU nodes, installs fake-gpu-operator, and serves an interactive Next.js tutorial with an embedded shell.

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
| Kubernetes | kind |
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
| `KIND_NODE_IMAGE` | `kindest/node:v1.34.0` |
| `CLUSTER_NAME` | `kai-scheduler-101` |
| `WORKSHOP_PORT` | `3000` |
| `KAI_VERSION` | `v0.16.5` |
| `FAKE_GPU_OPERATOR_VERSION` | unset, uses latest chart from the Helm repo |
| `KWOK_VERSION` | `v0.7.0` |

`FAKE_GPU_OPERATOR_VERSION` is an optional Helm chart version override. Leave it unset for the Launchable default. Do not set it to the fake-gpu-operator GitHub release tag such as `v0.2.0`; the Helm chart repository uses a different chart version stream.

## Repo Layout

```text
ansible/      readable bootstrap roles for host prep, kind, tooling, KWOK, fake GPUs
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

The UI renders locally without a cluster. Hands-on checks need the Brev/kind environment.

## Teardown

```bash
kind delete cluster --name kai-scheduler-101
sudo systemctl disable --now kai-scheduler-101-workshop.service
```
