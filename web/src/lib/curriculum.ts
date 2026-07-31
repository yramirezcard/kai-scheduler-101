export type Lesson = { slug: string; title: string; blurb: string; minutes: number; hasLab?: boolean };
export type Part = { id: string; title: string; subtitle: string; lessons: Lesson[] };

export const CURRICULUM: Part[] = [
  { id: "overview", title: "Part I - Overview", subtitle: "What KAI solves and how this simulated lab works", lessons: [
    { slug: "kai-overview", title: "KAI Scheduler Overview", blurb: "A Kubernetes-native scheduler for AI workloads, GPUs, queues, fairness, gangs, and topology.", minutes: 2 },
    { slug: "lab-environment", title: "Lab Environment", blurb: "Verify k3s, KWOK, fake GPU nodes, Helm, and the absence of KAI before installation.", minutes: 2, hasLab: true },
  ]},
  { id: "install-architecture", title: "Part II - Installation & Architecture", subtitle: "Install KAI and inspect its controllers", lessons: [
    { slug: "installing-kai", title: "Installing KAI with Helm", blurb: "Install the pinned v0.16.5 chart from GHCR and validate pods, CRDs, and queues.", minutes: 4, hasLab: true },
    { slug: "kai-architecture", title: "The KAI Architecture", blurb: "Operator, scheduler, binder, podgrouper, webhooks, controllers, and reservation flow.", minutes: 2, hasLab: true },
    { slug: "operator-crds", title: "The Operator & CRDs", blurb: "Inspect Config, SchedulingShard, Queue, PodGroup, BindRequest, Topology, and submit a DRA pod.", minutes: 3, hasLab: true },
  ]},
  { id: "queues", title: "Part III - Queues and Resource Governance", subtitle: "Model teams with quotas, limits, and hierarchy", lessons: [
    { slug: "scheduling-queues", title: "Scheduling Queues", blurb: "Create research and platform queues and send DRA workloads to each.", minutes: 3, hasLab: true },
    { slug: "hierarchical-queues", title: "Hierarchical Queues", blurb: "Build a two-level organization and see how parent quota flows to leaves.", minutes: 2, hasLab: true },
  ]},
  { id: "priority", title: "Part IV - Workload Priority & Preemption", subtitle: "Priority classes and eviction behavior", lessons: [
    { slug: "priority-classes", title: "Priority Classes", blurb: "Create train, build-preemptible, build, and inference classes.", minutes: 2, hasLab: true },
    { slug: "intraqueue-preemption", title: "Preemption Within a Queue", blurb: "Use inference-preempts-train to observe intra-queue preemption rules.", minutes: 2, hasLab: true },
  ]},
  { id: "fairness", title: "Part V - Fairness & Resource Distribution", subtitle: "Surplus, DRF, reclaim, and historical usage", lessons: [
    { slug: "overquota-distribution", title: "Queue Priority & Over-Quota Distribution", blurb: "Reproduce a 10-GPU surplus example with priority and overQuotaWeight.", minutes: 3, hasLab: true },
    { slug: "fairshare-drf", title: "Fair-Share & DRF", blurb: "Interpret dominant resource fairness and the simulator input.", minutes: 2, hasLab: true },
    { slug: "reclaim-between-queues", title: "Reclaim Between Queues", blurb: "Trigger reclaim and verify quota protection guarantees.", minutes: 2, hasLab: true },
    { slug: "time-based-fairshare", title: "Time-Based Fairshare", blurb: "Enable historical usage accounting and understand prerequisites.", minutes: 2, hasLab: true },
  ]},
  { id: "gang", title: "Part VI - Gang & Elastic Scheduling", subtitle: "All-or-nothing and elastic multi-pod workloads", lessons: [
    { slug: "podgroups-gang", title: "PodGroups & Gang Scheduling", blurb: "Run a minMember job and inspect generated PodGroups.", minutes: 3, hasLab: true },
    { slug: "elastic-workloads", title: "Elastic Workloads", blurb: "Inspect minSubGroup replicas that start at 3/4 and expand later.", minutes: 3, hasLab: true },
    { slug: "hierarchical-podgroups", title: "Hierarchical PodGroups & SubGroups", blurb: "Map Grove-style disaggregated serving roles to subgroup constraints.", minutes: 4, hasLab: true },
  ]},
  { id: "cycle-placement", title: "Part VII - The Scheduling Cycle & Advanced Placement", subtitle: "Actions, placement policies, shards, and topology", lessons: [
    { slug: "scheduling-cycle", title: "Inside a Scheduling Cycle", blurb: "Read events from Allocate, Consolidate, Reclaim, Preempt, and StaleGangEviction.", minutes: 2, hasLab: true },
    { slug: "scheduling-shards", title: "Scheduling Shards", blurb: "Partition scheduling behavior by node labels.", minutes: 2, hasLab: true },
    { slug: "binpack-spread", title: "Bin-Packing vs Spread & Consolidation", blurb: "Apply placement shards and compare node placement.", minutes: 2, hasLab: true },
    { slug: "topology-aware-scheduling", title: "Topology-Aware Scheduling", blurb: "Expand to 24 simulated nodes and enforce rack locality.", minutes: 4, hasLab: true },
  ]},
  { id: "gpu", title: "Part VIII - GPU Sharing", subtitle: "Fractional GPU allocation and memory isolation", lessons: [
    { slug: "gpu-sharing", title: "GPU Sharing: Fractions & Memory", blurb: "Use KAI annotations for fractional GPU intent and discuss hardware caveats.", minutes: 2, hasLab: true },
  ]},
  { id: "operations", title: "Part IX - Operations & Integration", subtitle: "Observe, debug, and connect KAI to the ecosystem", lessons: [
    { slug: "metrics-observability", title: "Metrics & Observability", blurb: "Create a KAI ServiceMonitor and query KAI metrics in Prometheus.", minutes: 4, hasLab: true },
    { slug: "debugging-snapshots", title: "Debugging with Snapshots", blurb: "Use the snapshot endpoint and replay tool as an escalation path.", minutes: 2, hasLab: true },
    { slug: "ecosystem-integrations", title: "Ecosystem Integrations", blurb: "Review KubeRay, Kubeflow Training Operator, LeaderWorkerSet, and JobSet integration patterns.", minutes: 2 },
  ]},
];

export const ALL_LESSONS: (Lesson & { partId: string; partTitle: string })[] =
  CURRICULUM.flatMap((p) => p.lessons.map((l) => ({ ...l, partId: p.id, partTitle: p.title })));

export function lessonNeighbors(slug: string) {
  const i = ALL_LESSONS.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? ALL_LESSONS[i - 1] : null,
    next: i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null,
    current: i >= 0 ? ALL_LESSONS[i] : null,
  };
}

export const FIRST_SLUG = ALL_LESSONS[0]?.slug ?? "kai-overview";
