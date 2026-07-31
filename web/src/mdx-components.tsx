import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";
import { Terminal } from "@/components/Terminal";
import { AppLaunchButton } from "@/components/AppLaunchButton";
import {
  ElasticAnimation,
  FairShareAnimation,
  GangSchedulingAnimation,
  GroveComponentsDiagram,
  GpuSharingAnimation,
  HierarchicalPodGroupAnimation,
  KaiArchitecture,
  KaiOverviewDiagram,
  LabEnvironmentStack,
  OperatorCrdsDiagram,
  OverQuotaAnimation,
  PlacementAnimation,
  PreemptionAnimation,
  PriorityClassDiagram,
  QueueBasicDiagram,
  QueueHierarchy,
  ReclaimAnimation,
  SchedulingCycle,
  ShardAnimation,
  TimeFairshareAnimation,
  TopologyMap,
} from "@/components/diagrams/KaiVisuals";

const components: MDXComponents = {
  Callout,
  Terminal,
  AppLaunchButton,
  ElasticAnimation,
  FairShareAnimation,
  GangSchedulingAnimation,
  GroveComponentsDiagram,
  GpuSharingAnimation,
  HierarchicalPodGroupAnimation,
  KaiArchitecture,
  KaiOverviewDiagram,
  LabEnvironmentStack,
  OperatorCrdsDiagram,
  OverQuotaAnimation,
  PlacementAnimation,
  PreemptionAnimation,
  PriorityClassDiagram,
  QueueBasicDiagram,
  QueueHierarchy,
  ReclaimAnimation,
  SchedulingCycle,
  ShardAnimation,
  TimeFairshareAnimation,
  TopologyMap,
  pre: CodeBlock,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

export { components as mdxComponents };
