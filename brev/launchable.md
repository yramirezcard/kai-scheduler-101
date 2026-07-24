# Brev Launchable Wizard Settings

## 1. Files & Runtime

- **Code source:** Git repo -> this repository.
- **Runtime mode:** VM, Ubuntu 22.04.

## 2. Environment

Setup script:

```bash
cd kai-scheduler-101
./scripts/brev-setup.sh
```

## 3. Jupyter & Networking

Expose these ports:

| Port | Purpose |
| --- | --- |
| 3000 | Tutorial website with embedded shell |
| 6443 | Optional kind API access from outside the VM |

Do not append raw ports to Brev tunnel URLs. Use the tunnel URL Brev provides for port 3000.

## 4. Compute

- GPU: none.
- Recommended size: 16 vCPU, 32 GB RAM, 100 GB disk.
- Nested virtualization: not required.

## 5. Review

- Name: `kai-scheduler-101`.
- Optional variables: `KIND_NODE_IMAGE`, `CLUSTER_NAME`, `WORKSHOP_PORT`, `KAI_VERSION`, `FAKE_GPU_OPERATOR_VERSION`, `KWOK_VERSION`.
