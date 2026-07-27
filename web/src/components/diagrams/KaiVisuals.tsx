"use client";

import React, { useState, useEffect } from "react";

/* ──────────────────────────── shared primitives ──────────────────────────── */

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = "pink",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: "pink" | "teal" | "gold";
}) {
  const stroke =
    tone === "teal"
      ? "var(--color-accent)"
      : tone === "gold"
      ? "#f59e0b"
      : "var(--color-kai)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="var(--color-panel)"
        stroke={stroke}
        strokeWidth="1.6"
      />
      <text
        x={x + w / 2}
        y={y + 26}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="var(--color-fg)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 46}
          textAnchor="middle"
          fontSize="10.5"
          fill="var(--color-fg-mut)"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <path
      d={`M ${x1} ${y1} L ${x2} ${y2}`}
      stroke="var(--color-fg-mut)"
      strokeWidth="1.6"
      markerEnd="url(#arrow)"
    />
  );
}

function MovingDot({
  path,
  color = "var(--color-kai-bright)",
  dur = "3s",
  delay = "0s",
}: {
  path: string;
  color?: string;
  dur?: string;
  delay?: string;
}) {
  return (
    <circle r="5" fill={color}>
      <animateMotion dur={dur} begin={delay} repeatCount="indefinite" path={path} />
    </circle>
  );
}

function Frame({
  children,
  title,
  h = 320,
}: {
  children: React.ReactNode;
  title: string;
  h?: number;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-2)]">
      <svg viewBox={`0 0 900 ${h}`} width="100%" role="img" aria-label={title}>
        <rect width="900" height={h} fill="var(--color-bg-2)" />
        <text x="24" y="34" fontSize="15" fontWeight="800" fill="var(--color-fg)">
          {title}
        </text>
        {children}
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L8,3.2 L0,6.4 Z" fill="var(--color-fg-mut)" />
          </marker>
          <marker id="arrow-pink" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L8,3.2 L0,6.4 Z" fill="var(--color-kai)" />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 1 · KAI Overview
   Shows the contrast: default scheduler (single-pod fit) vs KAI (multi-concept)
   ══════════════════════════════════════════════════════════════════════════ */

export function KaiOverviewDiagram() {
  return (
    <Frame title="What KAI Scheduler Adds to Kubernetes" h={310}>
      {/* Left: vanilla K8s scheduler */}
      <rect x={40} y={58} width={350} height={220} rx={10} fill="var(--color-panel)" stroke="var(--color-line-2)" />
      <text x={215} y={84} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-fg-mut)">Default Scheduler</text>
      <Box x={75} y={100} w={130} h={54} label="Pod" sub="any Pod" tone="gold" />
      <Box x={230} y={100} w={130} h={54} label="Node" sub="fits?" tone="teal" />
      <Arrow x1={205} y1={127} x2={230} y2={127} />
      <text x={215} y={195} textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">Question: can this Pod fit?</text>
      <text x={215} y={215} textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">No queue, no gang, no fairness.</text>

      {/* Right: KAI */}
      <rect x={420} y={58} width={450} height={220} rx={10} fill="var(--color-panel)" stroke="var(--color-kai)" strokeWidth="1.8" />
      <text x={645} y={84} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-kai)">KAI Scheduler</text>
      {[
        ["Queues", "who deserves GPUs?"],
        ["Gang", "all-or-nothing pods"],
        ["Fairness", "surplus by priority"],
        ["Topology", "rack-local placement"],
        ["DRA", "device claims"],
        ["Sharing", "fractional GPUs"],
      ].map(([lbl, sub], i) => (
        <Box
          key={lbl}
          x={432 + (i % 3) * 148}
          y={102 + Math.floor(i / 3) * 74}
          w={132}
          h={58}
          label={lbl}
          sub={sub}
          tone={i % 3 === 0 ? "pink" : i % 3 === 1 ? "teal" : "gold"}
        />
      ))}
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 4 · KAI Architecture (detailed component flow)
   ══════════════════════════════════════════════════════════════════════════ */

export function KaiArchitecture() {
  return (
    <Frame title="KAI Scheduler Control Plane — Component Flow" h={330}>
      {/* Layer 0: workload input */}
      <Box x={20} y={108} w={130} h={70} label="Workload" sub="Pod / Job / Ray / Spark" tone="gold" />

      {/* Layer 1: admission + podgrouper */}
      <Box x={200} y={58} w={150} h={64} label="Admission" sub="queue defaults & validation" />
      <Box x={200} y={178} w={150} h={64} label="PodGrouper" sub="builds gang metadata" />

      {/* Layer 2: scheduler + queue controller */}
      <Box x={420} y={58} w={150} h={64} label="Scheduler" sub="cycle: alloc → preempt" />
      <Box x={420} y={178} w={150} h={64} label="QueueController" sub="hierarchy & quota" tone="teal" />

      {/* Layer 3: binder + reservation */}
      <Box x={640} y={58} w={150} h={64} label="Binder" sub="binds pod + DRA claim" />
      <Box x={640} y={178} w={150} h={64} label="Reservation" sub="GPU sharing accounting" tone="teal" />

      {/* Operator at top */}
      <Box x={340} y={262} w={220} h={52} label="Operator" sub="reconciles Config & Shards" tone="gold" />

      {/* Arrows */}
      <Arrow x1={150} y1={133} x2={200} y2={88} />
      <Arrow x1={150} y1={148} x2={200} y2={208} />
      <Arrow x1={350} y1={90} x2={420} y2={90} />
      <Arrow x1={350} y1={210} x2={420} y2={210} />
      <Arrow x1={570} y1={90} x2={640} y2={90} />
      <Arrow x1={715} y1={122} x2={715} y2={178} />

      {/* animated dots */}
      <MovingDot path="M 150 133 C 175 110 195 95 200 88" dur="3.5s" />
      <MovingDot path="M 350 90 L 420 90" color="var(--color-accent-bright)" dur="2.5s" delay="0.6s" />
      <MovingDot path="M 570 90 L 640 90" dur="2.5s" delay="1.2s" />
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 5 · Operator & CRDs
   Shows the operator-watches-CRDs-and-reconciles-components flow
   ══════════════════════════════════════════════════════════════════════════ */

export function OperatorCrdsDiagram() {
  const crds = ["Queue", "PodGroup", "BindRequest", "Topology", "SchedulingShard"];
  return (
    <Frame title="Operator Reconciles KAI Custom Resources" h={300}>
      {/* Operator on left */}
      <Box x={40} y={110} w={150} h={68} label="Operator" sub="kai-scheduler-operator" tone="gold" />

      {/* Config CR + Shard CR */}
      <Box x={255} y={68} w={165} h={58} label="Config CR" sub="kai-config" />
      <Box x={255} y={155} w={165} h={58} label="SchedulingShard" sub="per-shard config" tone="teal" />
      <Arrow x1={190} y1={133} x2={255} y2={97} />
      <Arrow x1={190} y1={148} x2={255} y2={175} />

      {/* CRD list */}
      <text x={510} y={60} fontSize="12" fontWeight="700" fill="var(--color-fg)">Available KAI CRDs</text>
      {crds.map((c, i) => (
        <g key={c}>
          <rect x={492} y={74 + i * 38} width={170} height={28} rx={5} fill="var(--color-panel)" stroke="var(--color-kai)" strokeWidth="1.2" />
          <text x={577} y={93 + i * 38} textAnchor="middle" fontSize="12" fill="var(--color-fg)">{c}</text>
        </g>
      ))}

      {/* arrow from config to CRDs */}
      <Arrow x1={420} y1={100} x2={492} y2={112} />

      {/* animated dot */}
      <MovingDot path="M 190 133 C 220 100 240 97 255 97" dur="3s" />
      <MovingDot path="M 420 100 L 492 112" color="var(--color-accent-bright)" dur="2.5s" delay="1s" />

      <text x={40} y={282} fontSize="11" fill="var(--color-fg-mut)">
        The operator reads Config and SchedulingShard CRs and reconciles scheduler deployments and runtime settings.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 6 · Scheduling Queues (2-layer: parent + leaf queues)
   Different from Chapter 7 which shows a 3-layer org hierarchy
   ══════════════════════════════════════════════════════════════════════════ */

export function QueueBasicDiagram() {
  return (
    <Frame title="Queue Structure: Parent Controls, Leaves Accept Workloads" h={278}>
      {/* parent – quota is the ceiling for all children combined */}
      <Box x={295} y={50} w={310} h={68} label="team-parent" sub="quota 8 GPUs · limit 16 GPUs · parent queue – no workloads" />

      {/* leaves */}
      <Box x={100} y={168} w={240} h={64} label="research" sub="leaf · quota 4 GPUs · priority 80" tone="teal" />
      <Box x={560} y={168} w={240} h={64} label="platform" sub="leaf · quota 4 GPUs · priority 60" tone="gold" />

      {/* arrows parent → leaves */}
      <Arrow x1={450} y1={118} x2={220} y2={168} />
      <Arrow x1={450} y1={118} x2={680} y2={168} />

      {/* animated quota flows */}
      <MovingDot path="M 450 118 C 360 145 275 155 220 168" dur="3.5s" />
      <MovingDot path="M 450 118 C 540 145 625 155 680 168" color="var(--color-accent-bright)" dur="3.5s" delay="0.9s" />

      <text x={40} y={272} fontSize="11" fill="var(--color-fg-mut)">
        The parent quota (8 GPUs) caps the combined allocation of all children. Leaf queues divide that capacity and are the only valid workload targets.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 7 · Hierarchical Queues (3-layer org hierarchy)
   ══════════════════════════════════════════════════════════════════════════ */

export function QueueHierarchy() {
  return (
    <Frame title="Three-Layer Queue Hierarchy — Quota and Limits at Every Level" h={420}>
      {/* Layer 1: org root */}
      <Box x={310} y={50} w={280} h={72} label="ai-org" sub="Q: 16 GPUs· L: 24 GPUs" />

      {/* Layer 2: departments */}
      {/* foundation-models: has children → teal (intermediate) */}
      <Box x={75} y={166} w={250} h={72} label="foundation-models" sub="Q: 12 GPUs· L: 20 GPUs· P: 90" tone="teal" />
      {/* applied-ai: no children → gold (leaf) */}
      <Box x={575} y={166} w={250} h={72} label="applied-ai" sub="Q: 4 GPUs· L: 12 GPUs· P: 70  " tone="gold" />

      {/* Layer 3: leaf teams */}
      <Box x={30} y={290} w={210} h={72} label="fm-training" sub="Q: 8 GPUs· L: 16 GPUs· P: 80" tone="gold" />
      <Box x={265} y={290} w={210} h={72} label="fm-evaluation" sub="Q: 4 GPUs· L: 8 GPUs· P: 60" tone="gold" />

      {/* Arrows */}
      <Arrow x1={450} y1={122} x2={200} y2={166} />
      <Arrow x1={450} y1={122} x2={700} y2={166} />
      <Arrow x1={200} y1={238} x2={135} y2={290} />
      <Arrow x1={200} y1={238} x2={370} y2={290} />

      {/* Animated quota-flow dots */}
      {/* path: org → foundation-models → fm-training */}
      <MovingDot
        path="M 450 122 C 370 148 270 160 200 166 C 175 205 155 250 135 290"
        dur="4.5s"
        delay="0s"
      />
      {/* path: org → foundation-models → fm-evaluation */}
      <MovingDot
        path="M 450 122 C 370 148 270 160 200 166 C 215 205 295 255 370 290"
        color="var(--color-accent-bright)"
        dur="4.5s"
        delay="1.2s"
      />
      {/* path: org → applied-ai (leaf, stops here) */}
      <MovingDot
        path="M 450 122 C 535 145 645 160 700 166"
        color="#f59e0b"
        dur="3s"
        delay="0.6s"
      />

      {/* Legend */}
      <rect x={30} y={378} width={840} height={32} rx={5} fill="var(--color-panel)" stroke="var(--color-line-2)" />
      <text x={46} y={393} fontSize="10.5" fill="var(--color-fg-mut)">
        Q = quota (guaranteed) · L = limit (burst ceiling) · P = queue priority · Gold = leaf queue (accepts workloads) · Teal = intermediate (has children)
      </text>
      <text x={46} y={407} fontSize="10.5" fill="var(--color-fg-mut)">
        applied-ai is a leaf at Layer 2 — it has no child queues and accepts workloads directly.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 8 · Over-Quota Distribution
   Specific 10-GPU two-phase example: quota → priority → weight
   ══════════════════════════════════════════════════════════════════════════ */

export function OverQuotaAnimation() {
  return (
    <Frame title="Queue Priority: Resource Distribution" h={405}>
      <style>{`
        .oq-gpu { width: 55px; height: 35px; rx: 3; fill: #888; stroke: #666; stroke-width: 2; }
        .oq-pool { fill: color-mix(in srgb, var(--color-panel) 84%, white); stroke: var(--color-line-2); stroke-width: 1.5; rx: 6; }
        .oq-qbg { fill: color-mix(in srgb, var(--color-panel) 92%, white); stroke: var(--color-line-2); stroke-width: 1.5; rx: 6; }
        .oq-sbox { fill: none; stroke: var(--color-fg-mut); stroke-width: 2; stroke-dasharray: 7 4; rx: 4; }
        .oq-plbl { font-size: 13px; fill: var(--color-fg-dim); font-weight: 700; text-anchor: middle; }
        .oq-qn { font-size: 13px; font-weight: 700; text-anchor: middle; }
        .oq-qi { font-size: 10px; fill: var(--color-fg-mut); text-anchor: middle; }
        .oq-gt { font-size: 10px; fill: #fff; font-weight: 700; text-anchor: middle; }
        .oq-pt { font-size: 12px; fill: var(--color-fg-dim); text-anchor: middle; font-style: italic; }
        .oq-sl { font-size: 11px; fill: var(--color-fg-dim); font-weight: 700; text-anchor: middle; }
        .oq-stl { font-size: 9px; fill: var(--color-fg-mut); text-anchor: start; }
        .oq-g1 { animation: oq-g1a 24s ease-in-out infinite; }
        .oq-g2 { animation: oq-g2a 24s ease-in-out infinite; }
        .oq-g3 { animation: oq-g3a 24s ease-in-out infinite; }
        .oq-g4 { animation: oq-g4a 24s ease-in-out infinite; }
        .oq-g5 { animation: oq-g5a 24s ease-in-out infinite; }
        .oq-g6 { animation: oq-g6a 24s ease-in-out infinite; }
        .oq-g7 { animation: oq-g7a 24s ease-in-out infinite; }
        .oq-g8 { animation: oq-g8a 24s ease-in-out infinite; }
        .oq-g9 { animation: oq-g9a 24s ease-in-out infinite; }
        .oq-g10 { animation: oq-g10a 24s ease-in-out infinite; }
        .oq-g1 rect, .oq-g2 rect { animation: oq-ch 24s ease-in-out infinite; }
        .oq-g3 rect, .oq-g4 rect { animation: oq-cm 24s ease-in-out infinite; }
        .oq-g5 rect, .oq-g6 rect, .oq-g7 rect { animation: oq-cl 24s ease-in-out infinite; }
        .oq-g8 rect, .oq-g9 rect { animation: oq-chs 24s ease-in-out infinite; }
        .oq-g10 rect { animation: oq-cms 24s ease-in-out infinite; }
        @keyframes oq-ch { 0%,10%{fill:#888;stroke:#666} 16%,81%{fill:#e8706a;stroke:#c0403a} 87%,100%{fill:#888;stroke:#666} }
        @keyframes oq-cm { 0%,10%{fill:#888;stroke:#666} 16%,81%{fill:#e8a84a;stroke:#c0842a} 87%,100%{fill:#888;stroke:#666} }
        @keyframes oq-cl { 0%,10%{fill:#888;stroke:#666} 16%,81%{fill:#6a9ae8;stroke:#3a6ac0} 87%,100%{fill:#888;stroke:#666} }
        @keyframes oq-chs { 0%,46%{fill:#888;stroke:#666} 52%,81%{fill:#e8706a;stroke:#c0403a} 87%,100%{fill:#888;stroke:#666} }
        @keyframes oq-cms { 0%,48%{fill:#888;stroke:#666} 54%,81%{fill:#e8a84a;stroke:#c0842a} 87%,100%{fill:#888;stroke:#666} }
        @keyframes oq-g1a { 0%{opacity:0;transform:translate(290px,58px)} 3%,8%{opacity:1;transform:translate(290px,58px)} 16%,81%{opacity:1;transform:translate(80px,287px)} 87%{opacity:0;transform:translate(80px,287px)} 93%,100%{opacity:0;transform:translate(290px,58px)} }
        @keyframes oq-g2a { 0%{opacity:0;transform:translate(355px,58px)} 3%,10%{opacity:1;transform:translate(355px,58px)} 18%,81%{opacity:1;transform:translate(145px,287px)} 87%{opacity:0;transform:translate(145px,287px)} 93%,100%{opacity:0;transform:translate(355px,58px)} }
        @keyframes oq-g3a { 0%{opacity:0;transform:translate(420px,58px)} 3%,8%{opacity:1;transform:translate(420px,58px)} 16%,81%{opacity:1;transform:translate(355px,287px)} 87%{opacity:0;transform:translate(355px,287px)} 93%,100%{opacity:0;transform:translate(420px,58px)} }
        @keyframes oq-g4a { 0%{opacity:0;transform:translate(485px,58px)} 3%,10%{opacity:1;transform:translate(485px,58px)} 18%,81%{opacity:1;transform:translate(420px,287px)} 87%{opacity:0;transform:translate(420px,287px)} 93%,100%{opacity:0;transform:translate(485px,58px)} }
        @keyframes oq-g5a { 0%{opacity:0;transform:translate(550px,58px)} 3%,8%{opacity:1;transform:translate(550px,58px)} 16%,81%{opacity:1;transform:translate(625px,287px)} 87%{opacity:0;transform:translate(625px,287px)} 93%,100%{opacity:0;transform:translate(550px,58px)} }
        @keyframes oq-g6a { 0%{opacity:0;transform:translate(290px,98px)} 3%,10%{opacity:1;transform:translate(290px,98px)} 18%,81%{opacity:1;transform:translate(690px,287px)} 87%{opacity:0;transform:translate(690px,287px)} 93%,100%{opacity:0;transform:translate(290px,98px)} }
        @keyframes oq-g7a { 0%{opacity:0;transform:translate(355px,98px)} 3%,12%{opacity:1;transform:translate(355px,98px)} 20%,81%{opacity:1;transform:translate(755px,287px)} 87%{opacity:0;transform:translate(755px,287px)} 93%,100%{opacity:0;transform:translate(355px,98px)} }
        @keyframes oq-g8a { 0%{opacity:0;transform:translate(420px,98px)} 3%,42%{opacity:1;transform:translate(420px,98px)} 50%,81%{opacity:1;transform:translate(80px,343px)} 87%{opacity:0;transform:translate(80px,343px)} 93%,100%{opacity:0;transform:translate(420px,98px)} }
        @keyframes oq-g9a { 0%{opacity:0;transform:translate(485px,98px)} 3%,44%{opacity:1;transform:translate(485px,98px)} 52%,81%{opacity:1;transform:translate(145px,343px)} 87%{opacity:0;transform:translate(145px,343px)} 93%,100%{opacity:0;transform:translate(485px,98px)} }
        @keyframes oq-g10a { 0%{opacity:0;transform:translate(550px,98px)} 3%,46%{opacity:1;transform:translate(550px,98px)} 54%,81%{opacity:1;transform:translate(355px,343px)} 87%{opacity:0;transform:translate(355px,343px)} 93%,100%{opacity:0;transform:translate(550px,98px)} }
        .oq-t1 { animation: oq-t1a 24s ease-in-out infinite; }
        @keyframes oq-t1a { 0%,5%{opacity:0} 8%,25%{opacity:1} 30%,100%{opacity:0} }
        .oq-t2 { animation: oq-t2a 24s ease-in-out infinite; }
        @keyframes oq-t2a { 0%,33%{opacity:0} 37%,75%{opacity:1} 81%,100%{opacity:0} }
        .oq-sb { animation: oq-sba 24s ease-in-out infinite; }
        @keyframes oq-sba { 0%,24%{opacity:0} 28%,54%{opacity:1} 58%,100%{opacity:0} }
      `}</style>

      <text x="450" y="46" className="oq-plbl">Resource Pool (10 GPUs)</text>
      <rect x="275" y="52" width="350" height="92" className="oq-pool" />

      <rect x="55" y="220" width="235" height="170" className="oq-qbg" />
      <rect x="330" y="220" width="235" height="170" className="oq-qbg" />
      <rect x="605" y="220" width="235" height="170" className="oq-qbg" />

      <text x="172" y="238" className="oq-qn" fill="#c0403a">Vision Team</text>
      <text x="172" y="252" className="oq-qi">Priority: 2 | Quota: 2 | Weight: 2</text>
      <text x="447" y="238" className="oq-qn" fill="#c0842a">LLM Team</text>
      <text x="447" y="252" className="oq-qi">Priority: 2 | Quota: 2 | Weight: 1</text>
      <text x="722" y="238" className="oq-qn" fill="#3a6ac0">Data Processing</text>
      <text x="722" y="252" className="oq-qi">Priority: 1 | Quota: 3 | Weight: 1</text>

      <text x="75" y="277" className="oq-stl">Quota</text>
      <text x="75" y="333" className="oq-stl">Surplus</text>
      <text x="350" y="277" className="oq-stl">Quota</text>
      <text x="350" y="333" className="oq-stl">Surplus</text>
      <text x="620" y="277" className="oq-stl">Quota</text>

      <text x="450" y="192" className="oq-pt oq-t1">Quota: distributed to all queues regardless of priority</text>
      <text x="450" y="192" className="oq-pt oq-t2">Over-quota: highest priority first, then split by weight (2:1)</text>

      <rect x="413" y="92" width="200" height="48" className="oq-sbox oq-sb" />
      <text x="513" y="158" className="oq-sl oq-sb">Surplus (3 GPUs)</text>

      {["oq-g1", "oq-g2", "oq-g3", "oq-g4", "oq-g5", "oq-g6", "oq-g7", "oq-g8", "oq-g9", "oq-g10"].map((className) => (
        <g key={className} className={className}>
          <rect className="oq-gpu" />
          <text x="27" y="22" className="oq-gt">GPU</text>
        </g>
      ))}
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 9 · Fair-Share & DRF
   Shows dominant resource fairness across multiple resource types
   ══════════════════════════════════════════════════════════════════════════ */

export function FairShareAnimation() {
  return (
    <Frame title="Dominant Resource Fairness: Compare Each Queue's Largest Share" h={460}>
      <style>{`
        .drf-pool { fill: color-mix(in srgb, var(--color-panel) 84%, white); stroke: var(--color-line-2); stroke-width: 1.5; rx: 6; }
        .drf-qbg { fill: color-mix(in srgb, var(--color-panel) 92%, white); stroke: var(--color-line-2); stroke-width: 1.5; rx: 6; }
        .drf-label { font-size: 13px; fill: var(--color-fg-dim); font-weight: 700; text-anchor: middle; }
        .drf-qn { font-size: 13px; font-weight: 700; text-anchor: middle; }
        .drf-sub { font-size: 10px; fill: var(--color-fg-mut); text-anchor: middle; }
        .drf-note { font-size: 12px; fill: var(--color-fg-dim); text-anchor: middle; }
        .drf-small { font-size: 9.5px; fill: var(--color-fg-mut); text-anchor: start; }
        .drf-value { font-size: 9.5px; fill: var(--color-fg-dim); text-anchor: end; }
        .drf-tag { font-size: 10px; font-weight: 700; text-anchor: middle; }
        .drf-bar-bg { fill: color-mix(in srgb, var(--color-fg) 8%, transparent); rx: 4; }
        .drf-bar { rx: 4; }
        .drf-gpu { fill:#e8706a; stroke:#c0403a; }
        .drf-mem { fill:#e8a84a; stroke:#c0842a; }
        .drf-cpu { fill:#6a9ae8; stroke:#3a6ac0; }
      `}</style>

      <text x="450" y="52" className="drf-label">Resource Pool: 10 GPUs · 100 CPU · 100 GiB memory</text>
      <rect x="220" y="56" width="460" height="104" className="drf-pool" />

      <rect x="270" y="86" width="110" height="18" className="drf-bar-bg" />
      <rect x="270" y="86" width="110" height="18" className="drf-bar drf-gpu" />
      <text x="325" y="124" className="drf-tag" fill="#c0403a">GPU</text>
      <rect x="395" y="86" width="110" height="18" className="drf-bar-bg" />
      <rect x="395" y="86" width="110" height="18" className="drf-bar drf-mem" />
      <text x="450" y="124" className="drf-tag" fill="#c0842a">Memory</text>
      <rect x="520" y="86" width="110" height="18" className="drf-bar-bg" />
      <rect x="520" y="86" width="110" height="18" className="drf-bar drf-cpu" />
      <text x="575" y="124" className="drf-tag" fill="#3a6ac0">CPU</text>

      <text x="450" y="190" className="drf-note">DRF compares the largest share per queue: max(GPU share, memory share, CPU share)</text>

      <rect x="45" y="220" width="250" height="205" className="drf-qbg" />
      <rect x="325" y="220" width="250" height="205" className="drf-qbg" />
      <rect x="605" y="220" width="250" height="205" className="drf-qbg" />

      <text x="172" y="238" className="drf-qn" fill="#c0403a">Vision Team</text>
      <text x="172" y="255" className="drf-sub">many GPU claims, modest CPU/memory</text>
      <text x="447" y="238" className="drf-qn" fill="#c0842a">LLM Team</text>
      <text x="447" y="255" className="drf-sub">fewer GPUs, large memory request</text>
      <text x="730" y="238" className="drf-qn" fill="#3a6ac0">Data Processing</text>
      <text x="730" y="255" className="drf-sub">no GPU claim, high CPU request</text>

      {/* Vision: 5/10 GPU, 2.5/100 CPU, 2.5/100 Gi memory */}
      <text x="70" y="290" className="drf-small">GPU share</text>
      <rect x="142" y="278" width="105" height="14" className="drf-bar-bg" />
      <rect x="142" y="278" width="82" height="14" className="drf-bar drf-gpu" />
      <text x="272" y="290" className="drf-value">50%</text>
      <text x="70" y="322" className="drf-small">Memory share</text>
      <rect x="142" y="310" width="105" height="14" className="drf-bar-bg" />
      <rect x="142" y="310" width="11" height="14" className="drf-bar drf-mem" />
      <text x="272" y="322" className="drf-value">3%</text>
      <text x="70" y="354" className="drf-small">CPU share</text>
      <rect x="142" y="342" width="105" height="14" className="drf-bar-bg" />
      <rect x="142" y="342" width="11" height="14" className="drf-bar drf-cpu" />
      <text x="272" y="354" className="drf-value">3%</text>
      <rect x="85" y="382" width="170" height="26" rx="5" fill="color-mix(in srgb, #e8706a 18%, transparent)" stroke="#c0403a" />
      <text x="170" y="399" className="drf-tag" fill="#c0403a">dominant: GPU</text>

      {/* LLM: 2/10 GPU, 1/100 CPU, 24/100 Gi memory */}
      <text x="350" y="290" className="drf-small">GPU share</text>
      <rect x="422" y="278" width="105" height="14" className="drf-bar-bg" />
      <rect x="422" y="278" width="42" height="14" className="drf-bar drf-gpu" />
      <text x="552" y="290" className="drf-value">20%</text>
      <text x="350" y="322" className="drf-small">Memory share</text>
      <rect x="422" y="310" width="105" height="14" className="drf-bar-bg" />
      <rect x="422" y="310" width="78" height="14" className="drf-bar drf-mem" />
      <text x="552" y="322" className="drf-value">24%</text>
      <text x="350" y="354" className="drf-small">CPU share</text>
      <rect x="422" y="342" width="105" height="14" className="drf-bar-bg" />
      <rect x="422" y="342" width="10" height="14" className="drf-bar drf-cpu" />
      <text x="552" y="354" className="drf-value">1%</text>
      <rect x="365" y="382" width="170" height="26" rx="5" fill="color-mix(in srgb, #e8a84a 18%, transparent)" stroke="#c0842a" />
      <text x="450" y="399" className="drf-tag" fill="#c0842a">dominant: memory</text>

      {/* Data: 0/10 GPU, 12/100 CPU, 6/100 Gi memory */}
      <text x="630" y="290" className="drf-small">GPU share</text>
      <rect x="702" y="278" width="105" height="14" className="drf-bar-bg" />
      <rect x="702" y="278" width="2" height="14" className="drf-bar drf-gpu" />
      <text x="832" y="290" className="drf-value">0%</text>
      <text x="630" y="322" className="drf-small">Memory share</text>
      <rect x="702" y="310" width="105" height="14" className="drf-bar-bg" />
      <rect x="702" y="310" width="12" height="14" className="drf-bar drf-mem" />
      <text x="832" y="322" className="drf-value">6%</text>
      <text x="630" y="354" className="drf-small">CPU share</text>
      <rect x="702" y="342" width="105" height="14" className="drf-bar-bg" />
      <rect x="702" y="342" width="70" height="14" className="drf-bar drf-cpu" />
      <text x="832" y="354" className="drf-value">12%</text>
      <rect x="645" y="382" width="170" height="26" rx="5" fill="color-mix(in srgb, #6a9ae8 18%, transparent)" stroke="#3a6ac0" />
      <text x="730" y="399" className="drf-tag" fill="#3a6ac0">dominant: CPU</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 10 · Reclaim Between Queues
   ══════════════════════════════════════════════════════════════════════════ */

export function ReclaimAnimation() {
  const gpu = (
    key: string,
    fill: string,
    stroke: string,
    label = "GPU",
  ) => (
    <g key={key}>
      <rect width={40} height={30} rx={3} fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={20} y={19} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">{label}</text>
    </g>
  );

  const queueBox = (
    x: number,
    y: number,
    title: string,
    sub: string,
    titleFill: string,
  ) => (
    <g>
      <rect x={x} y={y} width={270} height={180} rx={7} fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke="var(--color-line-2)" strokeWidth="1.5" />
      <text x={x + 135} y={y + 25} textAnchor="middle" fontSize="13" fontWeight="800" fill={titleFill}>{title}</text>
      <text x={x + 135} y={y + 43} textAnchor="middle" fontSize="10" fill="var(--color-fg-mut)">{sub}</text>
      <text x={x + 18} y={y + 65} fontSize="9.5" fill="var(--color-fg-mut)">Quota</text>
      <rect x={x + 18} y={y + 73} width={220} height={38} rx={5} fill="color-mix(in srgb, var(--color-fg) 5%, transparent)" stroke="var(--color-line)" />
      <text x={x + 18} y={y + 130} fontSize="9.5" fill="var(--color-fg-mut)">Over-quota</text>
      <rect x={x + 18} y={y + 138} width={220} height={36} rx={5} fill="color-mix(in srgb, var(--color-fg) 5%, transparent)" stroke="var(--color-line)" />
    </g>
  );

  return (
    <Frame title="Reclaim Between Queues" h={430}>
      <style>{`
        .rq-title { font-size: 12px; font-weight: 800; fill: var(--color-fg); text-anchor: middle; }
        .rq-note { font-size: 10.5px; fill: var(--color-fg-mut); text-anchor: middle; }
        .rq-pool { fill: color-mix(in srgb, var(--color-panel) 84%, white); stroke: var(--color-line-2); stroke-width: 1.5; rx: 6; }
        .rq-phase-a { animation: rq-phase-a 12s ease-in-out infinite; }
        .rq-phase-b { animation: rq-phase-b 12s ease-in-out infinite; }
        .rq-move-1 { animation: rq-move-1 12s ease-in-out infinite; }
        .rq-move-2 { animation: rq-move-2 12s ease-in-out infinite; }
        .rq-move-3 { animation: rq-move-3 12s ease-in-out infinite; }
        .rq-move-4 { animation: rq-move-4 12s ease-in-out infinite; }
        @keyframes rq-phase-a { 0%,30%{opacity:1} 42%,72%{opacity:0} 84%,100%{opacity:1} }
        @keyframes rq-phase-b { 0%,30%{opacity:0} 42%,72%{opacity:1} 84%,100%{opacity:0} }
        @keyframes rq-move-1 { 0%,28%{transform:translate(208px,337px)} 46%,74%{transform:translate(518px,272px)} 92%,100%{transform:translate(208px,337px)} }
        @keyframes rq-move-2 { 0%,30%{transform:translate(260px,337px)} 48%,74%{transform:translate(570px,272px)} 92%,100%{transform:translate(260px,337px)} }
        @keyframes rq-move-3 { 0%,32%{transform:translate(312px,337px)} 50%,74%{transform:translate(622px,272px)} 92%,100%{transform:translate(312px,337px)} }
        @keyframes rq-move-4 { 0%,34%{transform:translate(364px,337px)} 52%,74%{transform:translate(674px,272px)} 92%,100%{transform:translate(364px,337px)} }
      `}</style>

      <text x="450" y="46" className="rq-title">Resource Pool (8 GPUs)</text>
      <rect x="270" y="52" width="360" height="74" className="rq-pool" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`pool-${i}`} transform={`translate(${282 + i * 43},75)`}>
          {gpu(`pool-${i}`, "#888", "#666")}
        </g>
      ))}

      <g className="rq-phase-a">
        <text x="450" y="154" className="rq-title">Phase 1: Idle quota is borrowed</text>
        <text x="450" y="171" className="rq-note">reclaim-low uses 8G: 4G protected quota + 4G borrowed over-quota; reclaim-high has 0G</text>
      </g>
      <g className="rq-phase-b">
        <text x="450" y="154" className="rq-title">Phase 2: Reclaim restores the guarantee</text>
        <text x="450" y="171" className="rq-note">only preemptible over-quota GPUs move; reclaim-low keeps quota while reclaim-high reaches quota</text>
      </g>

      {queueBox(
        190,
        195,
        "reclaim-low",
        "quota 4G · borrowed up to 8G",
        "#c0842a",
      )}
      {queueBox(
        500,
        195,
        "reclaim-high",
        "quota 4G · below quota",
        "#3a6ac0",
      )}

      {Array.from({ length: 4 }, (_, i) => (
        <g key={`low-quota-${i}`} transform={`translate(${208 + i * 52},272)`}>
          {gpu(`low-quota-${i}`, "#e8a84a", "#c0842a")}
        </g>
      ))}

      {["rq-move-1", "rq-move-2", "rq-move-3", "rq-move-4"].map((className, i) => (
        <g key={className} className={className}>
          {gpu(`moving-${i}`, "#e8706a", "#c0403a")}
        </g>
      ))}

      <line x1="430" y1="352" x2="498" y2="310" stroke="var(--color-kai)" strokeWidth="1.7" markerEnd="url(#arrow-pink)" />
      <text x="466" y="332" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--color-kai)">reclaim</text>

      <rect x="85" y="395" width="730" height="22" rx="6" fill="color-mix(in srgb, #e8706a 14%, transparent)" stroke="#c0403a" />
      <text x="450" y="410" className="rq-note" fill="#c0403a">Protected quota GPUs stay in reclaim-low; only borrowed over-quota GPUs can move.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 11 · Time-Based Fairshare
   Shows how historical usage decays and affects future surplus allocation
   ══════════════════════════════════════════════════════════════════════════ */

export function TimeFairshareAnimation() {
  return (
    <Frame title="Time-Based Fairshare: GPU-Time Oscillates Between Two Queues" h={520}>
      <style>{`
        .tf-axis { stroke: var(--color-line-2); stroke-width: 1.3; }
        .tf-grid { stroke: color-mix(in srgb, var(--color-fg) 10%, transparent); stroke-width: 1; }
        .tf-label { font-size: 10px; fill: var(--color-fg-mut); }
        .tf-title { font-size: 12px; font-weight: 800; fill: var(--color-fg); }
        .tf-note { font-size: 10.5px; fill: var(--color-fg-mut); text-anchor: middle; }
        .tf-vision { stroke: #e8706a; fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        .tf-llm { stroke: #6a9ae8; fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        .tf-reveal { stroke-dasharray: 900; animation: tf-reveal 12s linear infinite; }
        .tf-cursor { animation: tf-cursor 12s linear infinite; }
        .tf-phase-a { animation: tf-phase-a 12s linear infinite; }
        .tf-phase-b { animation: tf-phase-b 12s linear infinite; }
        .tf-phase-c { animation: tf-phase-c 12s linear infinite; }
        @keyframes tf-reveal { 0%{stroke-dashoffset:900;opacity:.2} 8%{opacity:1} 72%{stroke-dashoffset:0;opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
        @keyframes tf-cursor { 0%{transform:translateX(0px);opacity:.15} 8%{opacity:1} 72%{transform:translateX(660px);opacity:1} 100%{transform:translateX(660px);opacity:.15} }
        @keyframes tf-phase-a { 0%,25%{opacity:1} 33%,100%{opacity:0} }
        @keyframes tf-phase-b { 0%,26%{opacity:0} 34%,54%{opacity:1} 62%,100%{opacity:0} }
        @keyframes tf-phase-c { 0%,55%{opacity:0} 63%,100%{opacity:1} }
      `}</style>

      <text x="450" y="48" textAnchor="middle" className="tf-title">Two queues · same over-quota weight · historical GPU-time changes the next fair share</text>
      <g transform="translate(700,38)">
        <line x1="0" y1="0" x2="22" y2="0" className="tf-vision" />
        <text x="30" y="4" className="tf-label">Vision Team</text>
        <line x1="0" y1="18" x2="22" y2="18" className="tf-llm" />
        <text x="30" y="22" className="tf-label">LLM Team</text>
      </g>

      {/* Top chart: actual allocation */}
      <text x="74" y="82" className="tf-title">Actual GPU allocation</text>
      <text x="74" y="100" className="tf-label">GPUs</text>
      <line x1="90" y1="222" x2="790" y2="222" className="tf-axis" />
      <line x1="90" y1="92" x2="90" y2="222" className="tf-axis" />
      {[0, 30, 60].map((v, i) => (
        <g key={`alloc-grid-${v}`}>
          <line x1="90" y1={222 - i * 55} x2="790" y2={222 - i * 55} className="tf-grid" />
          <text x="62" y={226 - i * 55} className="tf-label">{v}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((v, i) => (
        <text key={`alloc-tick-${v}`} x={90 + i * 165} y="242" textAnchor="middle" className="tf-label">{v}</text>
      ))}
      <text x="440" y="262" textAnchor="middle" className="tf-label">simulation cycles / time</text>
      <path className="tf-vision tf-reveal" d="M90 112 L250 112 L255 218 L412 218 L417 112 L578 112 L583 218 L750 218" />
      <path className="tf-llm tf-reveal" d="M90 218 L250 218 L255 112 L412 112 L417 218 L578 218 L583 112 L750 112" />

      {/* Bottom chart: effective fair share */}
      <text x="74" y="294" className="tf-title">Effective fair share after historical usage penalty</text>
      <text x="74" y="312" className="tf-label">GPU fair share</text>
      <line x1="90" y1="452" x2="790" y2="452" className="tf-axis" />
      <line x1="90" y1="322" x2="90" y2="452" className="tf-axis" />
      {[0, 30, 60].map((v, i) => (
        <g key={`share-grid-${v}`}>
          <line x1="90" y1={452 - i * 55} x2="790" y2={452 - i * 55} className="tf-grid" />
          <text x="62" y={456 - i * 55} className="tf-label">{v}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((v, i) => (
        <text key={`share-tick-${v}`} x={90 + i * 165} y="472" textAnchor="middle" className="tf-label">{v}</text>
      ))}
      <path className="tf-vision tf-reveal" d="M90 342 C160 350 205 390 250 432 C305 386 360 350 420 342 C485 352 525 392 580 432 C640 388 700 352 750 342" />
      <path className="tf-llm tf-reveal" d="M90 432 C160 424 205 384 250 342 C305 388 360 424 420 432 C485 422 525 382 580 342 C640 386 700 422 750 432" />

      <g className="tf-cursor">
        <line x1="90" y1="92" x2="90" y2="452" stroke="var(--color-fg-mut)" strokeWidth="1.2" strokeDasharray="4 4" />
        <circle cx="90" cy="222" r="4" fill="var(--color-fg-mut)" />
        <circle cx="90" cy="452" r="4" fill="var(--color-fg-mut)" />
      </g>

      <g className="tf-phase-a">
        <text x="450" y="284" className="tf-note">Vision has been running over-quota; its historical GPU-time rises.</text>
      </g>
      <g className="tf-phase-b">
        <text x="450" y="284" className="tf-note">LLM has low historical usage, so its effective fair share is boosted.</text>
      </g>
      <g className="tf-phase-c">
        <text x="450" y="284" className="tf-note">As LLM consumes GPU-time, Vision becomes comparatively starved and gets the next turn.</text>
      </g>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 12 · Priority Classes — ladder showing 4 priority levels
   ══════════════════════════════════════════════════════════════════════════ */

export function PriorityClassDiagram() {
  const classes = [
    { name: "train", value: 50, tone: "gold" as const, note: "preemptible" },
    { name: "build-preemptible", value: 75, tone: "gold" as const, note: "preemptible" },
    { name: "build", value: 100, tone: "teal" as const, note: "non-preemptible ≥100" },
    { name: "inference", value: 125, tone: "pink" as const, note: "non-preemptible ≥100" },
  ];
  return (
    <Frame title="Four KAI Priority Classes — The ≥100 Non-Preemptible Line" h={300}>
      {/* priority axis */}
      <line x1={80} y1={260} x2={780} y2={260} stroke="var(--color-fg-mut)" strokeWidth="1.5" />
      <text x={80} y={280} fontSize="11" fill="var(--color-fg-mut)">lower priority →</text>
      <text x={680} y={280} fontSize="11" fill="var(--color-fg-mut)">higher priority</text>

      {classes.map((c, i) => {
        const x = 90 + i * 180;
        const barH = 44 + i * 28;
        const stroke = c.tone === "teal" ? "var(--color-accent)" : c.tone === "gold" ? "#f59e0b" : "var(--color-kai)";
        return (
          <g key={c.name}>
            <rect x={x} y={260 - barH} width={140} height={barH} rx={4}
              fill={`color-mix(in srgb, ${stroke} 25%, transparent)`}
              stroke={stroke} strokeWidth="1.5" />
            <text x={x + 70} y={260 - barH - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-fg)">{c.name}</text>
            <text x={x + 70} y={260 - barH + 20} textAnchor="middle" fontSize="13" fontWeight="800" fill={stroke}>{c.value}</text>
            <text x={x + 70} y={260 - barH + 38} textAnchor="middle" fontSize="10" fill="var(--color-fg-mut)">{c.note}</text>
          </g>
        );
      })}

      {/* non-preemptible threshold line */}
      <line x1={448} y1={84} x2={448} y2={260} stroke="var(--color-kai)" strokeWidth="2" strokeDasharray="6 4" />
      <text x={454} y={78} fontSize="11" fontWeight="700" fill="var(--color-kai)">≥100: non-preemptible</text>
      <text x={454} y={93} fontSize="10" fill="var(--color-fg-mut)">(in-quota resources only)</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 13 · Intra-Queue Preemption
   Shows inference evicting train inside the same queue
   ══════════════════════════════════════════════════════════════════════════ */

export function PreemptionAnimation() {
  return (
    <Frame title="Intra-Queue Preemption" h={360}>
      <style>{`
        .ip-title { font-size: 13px; font-weight: 800; fill: var(--color-fg); text-anchor: middle; }
        .ip-sub { font-size: 10px; fill: var(--color-fg-mut); text-anchor: middle; }
        .ip-small { font-size: 9.5px; fill: var(--color-fg-mut); text-anchor: middle; }
        .ip-train { fill: color-mix(in srgb, #94a3b8 42%, transparent); stroke: #64748b; }
        .ip-wait-1 { animation: ip-wait-1 14s ease-in-out infinite; }
        .ip-wait-2 { animation: ip-wait-2 14s ease-in-out infinite; }
        .ip-train-out { animation: ip-train-out 14s ease-in-out infinite; }
        .ip-inf-in { animation: ip-inf-in 14s ease-in-out infinite; }
        .ip-backlog { animation: ip-backlog 14s ease-in-out infinite; }
        .ip-phase-a { animation: ip-phase-a 14s ease-in-out infinite; }
        .ip-phase-b { animation: ip-phase-b 14s ease-in-out infinite; }
        .ip-phase-c { animation: ip-phase-c 14s ease-in-out infinite; }
        @keyframes ip-wait-1 { 0%,8%{opacity:0;transform:translate(-55px,164px)} 18%,100%{opacity:1;transform:translate(222px,164px)} }
        @keyframes ip-wait-2 { 0%,18%{opacity:0;transform:translate(-55px,164px)} 30%,100%{opacity:1;transform:translate(90px,164px)} }
        @keyframes ip-train-out { 0%,52%{opacity:1;transform:translate(616px,154px)} 64%,82%{opacity:.35;transform:translate(354px,164px)} 92%,100%{opacity:1;transform:translate(616px,154px)} }
        @keyframes ip-inf-in { 0%,32%{opacity:0;transform:translate(-55px,164px)} 42%,52%{opacity:1;transform:translate(354px,164px)} 62%,82%{opacity:1;transform:translate(616px,154px)} 92%,100%{opacity:0;transform:translate(-55px,164px)} }
        @keyframes ip-backlog { 0%,52%{opacity:0} 64%,82%{opacity:1} 92%,100%{opacity:0} }
        @keyframes ip-phase-a { 0%,30%{opacity:1} 38%,100%{opacity:0} }
        @keyframes ip-phase-b { 0%,32%{opacity:0} 42%,54%{opacity:1} 64%,100%{opacity:0} }
        @keyframes ip-phase-c { 0%,56%{opacity:0} 66%,84%{opacity:1} 94%,100%{opacity:0} }
      `}</style>

      <line x1="96" y1="76" x2="486" y2="76" stroke="var(--color-fg-mut)" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <text x="95" y="70" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-fg-mut)">Back</text>
      <text x="505" y="80" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-fg-mut)">Front</text>

      <g className="ip-phase-a">
        <text x="450" y="330" className="ip-sub">train jobs are submitted first and wait in FIFO order because no GPU is free.</text>
      </g>
      <g className="ip-phase-b">
        <text x="450" y="330" className="ip-sub">inference is submitted third, but priority 125 moves it to the front of the queue.</text>
      </g>
      <g className="ip-phase-c">
        <text x="450" y="330" className="ip-sub">inference schedules by preempting only the running preemptible train; build stays protected.</text>
      </g>

      {/* Waiting queue */}
      <g className="ip-wait-2">
        <rect width="118" height="74" rx="5" className="ip-train" strokeDasharray="5 4" />
        <text x="59" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-fg-mut)">train</text>
        <text x="59" y="44" className="ip-small">(Priority: 50)</text>
        <text x="59" y="59" className="ip-small">Submitted: 2nd</text>
      </g>

      <g className="ip-wait-1">
        <rect width="118" height="74" rx="5" className="ip-train" strokeDasharray="5 4" />
        <text x="59" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-fg-mut)">train</text>
        <text x="59" y="44" className="ip-small">(Priority: 50)</text>
        <text x="59" y="59" className="ip-small">Submitted: 1st</text>
      </g>

      <g className="ip-inf-in">
        <rect width="124" height="74" rx="5" fill="var(--color-kai)" stroke="var(--color-kai-bright)" strokeWidth="1.5" />
        <text x="62" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">inference</text>
        <text x="62" y="44" textAnchor="middle" fontSize="10" fill="#fff">(Priority: 125)</text>
        <text x="62" y="59" textAnchor="middle" fontSize="10" fill="#fff">Submitted: 3rd</text>
      </g>

      <g className="ip-backlog">
        <rect x="354" y="164" width="118" height="74" rx="5" className="ip-train" strokeDasharray="5 4" />
        <text x="413" y="190" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-fg-mut)">train</text>
        <text x="413" y="208" className="ip-small">(Priority: 50)</text>
        <text x="413" y="223" className="ip-small">Preempted</text>
      </g>

      {/* Running box */}
      <rect x="590" y="104" width="286" height="166" rx="6" fill="none" stroke="var(--color-line-2)" strokeDasharray="5 4" />
      <text x="733" y="126" className="ip-title">Running</text>

      <g className="ip-train-out">
        <rect width="118" height="74" rx="5" className="ip-train" />
        <text x="59" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-fg)">train</text>
        <text x="59" y="44" textAnchor="middle" fontSize="10" fill="var(--color-fg)">(Priority: 50)</text>
        <text x="59" y="59" textAnchor="middle" fontSize="10" fill="var(--color-fg)">Running</text>
      </g>

      <rect x="746" y="154" width="118" height="74" rx="5" fill="var(--color-kai)" stroke="var(--color-kai-bright)" strokeWidth="1.5" />
      <text x="805" y="180" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">build</text>
      <text x="805" y="198" textAnchor="middle" fontSize="10" fill="#fff">(Priority: 100)</text>
      <text x="805" y="213" textAnchor="middle" fontSize="10" fill="#fff">Running</text>

      <text x="733" y="294" className="ip-sub">build is non-preemptible; train is the eligible victim.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 14 · Gang Scheduling — all-or-nothing minMember
   ══════════════════════════════════════════════════════════════════════════ */

export function GangSchedulingAnimation() {
  const slot = (x: number, y: number, key: string, className = "", label = "free") => (
    <g key={key} className={className}>
      <rect x={x} y={y} width={50} height={34} rx={3} fill="transparent" stroke="var(--color-line-2)" strokeDasharray="4 3" />
      <text x={x + 25} y={y + 21} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--color-fg-mut)">{label}</text>
    </g>
  );
  const workload = (x: number, y: number, key: string, className = "", status = "Running", completed = false) => (
    <g key={key} className={className}>
      <rect
        x={x}
        y={y}
        width={50}
        height={34}
        rx={3}
        fill={completed ? "#f59e0b" : "var(--color-accent)"}
        stroke={completed ? "#fbbf24" : "var(--color-accent-bright)"}
        strokeWidth="1.4"
      />
      <text x={x + 25} y={y + 14} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#05201d">Pod</text>
      <text x={x + 25} y={y + 27} textAnchor="middle" fontSize="7.2" fontWeight="700" fill="#05201d">{status}</text>
    </g>
  );
  const completingWorkload = (x: number, y: number) => (
    <g>
      {workload(x, y, "b8-running", "gang-complete-running")}
      {workload(x, y, "b8-completed", "gang-complete-done", "Completed", true)}
    </g>
  );
  const gangPod = (key: string, className: string) => (
    <g key={key} className={className}>
      <rect width={50} height={34} rx={3} fill="var(--color-kai)" stroke="var(--color-kai-bright)" strokeWidth="1.4" />
      <text x="25" y="15" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff">Pod</text>
      <text x="25" y="27" textAnchor="middle" fontSize="7.2" fill="#fff">Pending</text>
    </g>
  );
  const node = (x: number, title: string) => (
    <g>
      <rect x={x} y="76" width="170" height="272" rx="4" fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke="var(--color-kai)" strokeWidth="1.4" />
      <text x={x + 85} y="99" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-kai)">{title}</text>
      {slot(x + 24, 116, `${title}-s1`)}
      {slot(x + 96, 116, `${title}-s2`)}
      {slot(x + 24, 166, `${title}-s3`)}
      {slot(x + 96, 166, `${title}-s4`)}
      {slot(x + 24, 216, `${title}-s5`)}
      {slot(x + 96, 216, `${title}-s6`)}
      {slot(x + 24, 266, `${title}-s7`)}
      {slot(x + 96, 266, `${title}-s8`)}
    </g>
  );

  return (
    <Frame title="Gang Scheduling: 4/4 pods Must Fit Before Any Start" h={470}>
      <style>{`
        .gang-note { font-size: 11px; fill: var(--color-fg-mut); text-anchor: middle; }
        .gang-phase-a { animation: gang-phase-a 14s ease-in-out infinite; }
        .gang-phase-b { animation: gang-phase-b 14s ease-in-out infinite; }
        .gang-phase-c { animation: gang-phase-c 14s ease-in-out infinite; }
        .gang-complete-running { animation: gang-complete-running 14s ease-in-out infinite; }
        .gang-complete-done { animation: gang-complete-done 14s ease-in-out infinite; }
        .gang-p1 { animation: gang-p1 14s ease-in-out infinite; }
        .gang-p2 { animation: gang-p2 14s ease-in-out infinite; }
        .gang-p3 { animation: gang-p3 14s ease-in-out infinite; }
        .gang-p4 { animation: gang-p4 14s ease-in-out infinite; }
        @keyframes gang-phase-a { 0%,34%{opacity:1} 44%,100%{opacity:0} }
        @keyframes gang-phase-b { 0%,36%{opacity:0} 46%,56%{opacity:1} 66%,100%{opacity:0} }
        @keyframes gang-phase-c { 0%,58%{opacity:0} 68%,86%{opacity:1} 96%,100%{opacity:0} }
        @keyframes gang-complete-running { 0%,40%{opacity:1;transform:scale(1)} 48%,86%{opacity:0;transform:scale(.96)} 96%,100%{opacity:1;transform:scale(1)} }
        @keyframes gang-complete-done { 0%,40%{opacity:0;transform:scale(.96)} 48%,58%{opacity:1;transform:scale(1.08)} 68%,86%{opacity:.08;transform:scale(.88)} 96%,100%{opacity:0;transform:scale(.96)} }
        @keyframes gang-p1 { 0%,62%{transform:translate(304px,386px)} 74%,86%{transform:translate(79px,266px)} 96%,100%{transform:translate(304px,386px)} }
        @keyframes gang-p2 { 0%,62%{transform:translate(362px,386px)} 74%,86%{transform:translate(461px,216px)} 96%,100%{transform:translate(362px,386px)} }
        @keyframes gang-p3 { 0%,62%{transform:translate(420px,386px)} 74%,86%{transform:translate(699px,166px)} 96%,100%{transform:translate(420px,386px)} }
        @keyframes gang-p4 { 0%,62%{transform:translate(478px,386px)} 74%,86%{transform:translate(461px,266px)} 96%,100%{transform:translate(478px,386px)} }
      `}</style>

      <g className="gang-phase-a">
        <text x="450" y="60" className="gang-note">Gang workload requests 4 GPU pods, but only 3 slots are free. Result: 3/4 fit, none start.</text>
      </g>
      <g className="gang-phase-b">
        <text x="450" y="60" className="gang-note">A running workload completes and frees one more GPU slot.</text>
      </g>
      <g className="gang-phase-c">
        <text x="450" y="60" className="gang-note">Now 4/4 pods fit, so KAI binds the entire gang together.</text>
      </g>

      {node(55, "Node A")}
      {node(365, "Node B")}
      {node(675, "Node C")}

      {workload(79, 116, "a1")}
      {workload(151, 116, "a2")}
      {workload(79, 166, "a3")}
      {workload(151, 166, "a4")}
      {workload(79, 216, "a5")}
      {workload(151, 216, "a6")}
      {workload(151, 266, "a8")}

      {workload(389, 116, "b1")}
      {workload(461, 116, "b2")}
      {workload(389, 166, "b3")}
      {workload(461, 166, "b4")}
      {workload(389, 216, "b5")}
      {workload(389, 266, "b7")}
      {completingWorkload(461, 266)}

      {workload(699, 116, "c1")}
      {workload(771, 116, "c2")}
      {workload(771, 166, "c4")}
      {workload(699, 216, "c5")}
      {workload(771, 216, "c6")}
      {workload(699, 266, "c7")}
      {workload(771, 266, "c8")}

      <rect x="286" y="366" width="274" height="70" rx="7" fill="color-mix(in srgb, var(--color-kai) 10%, transparent)" stroke="var(--color-kai)" strokeDasharray="5 4" />
      <text x="423" y="381" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">Queued pod group · minMember: 4</text>
      {gangPod("gang-1", "gang-p1")}
      {gangPod("gang-2", "gang-p2")}
      {gangPod("gang-3", "gang-p3")}
      {gangPod("gang-4", "gang-p4")}

      <text x="450" y="456" className="gang-note">Gang scheduling avoids starting a partial distributed job that would wait or fail.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 15 · Elastic Workloads
   Shows minimum start then scale-up with spare capacity
   ══════════════════════════════════════════════════════════════════════════ */

export function ElasticAnimation() {
  const slot = (x: number, y: number, key: string, label = "free") => (
    <g key={key}>
      <rect x={x} y={y} width={58} height={36} rx={3} fill="transparent" stroke="var(--color-line-2)" strokeDasharray="4 3" />
      <text x={x + 29} y={y + 22} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--color-fg-mut)">{label}</text>
    </g>
  );
  const runningPod = (x: number, y: number, key: string, className = "", status = "Running", completed = false) => (
    <g key={key} className={className}>
      <rect
        x={x}
        y={y}
        width={58}
        height={36}
        rx={3}
        fill={completed ? "#f59e0b" : "var(--color-accent)"}
        stroke={completed ? "#fbbf24" : "var(--color-accent-bright)"}
        strokeWidth="1.4"
      />
      <text x={x + 29} y={y + 15} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#05201d">Pod</text>
      <text x={x + 29} y={y + 28} textAnchor="middle" fontSize="7.2" fontWeight="700" fill="#05201d">{status}</text>
    </g>
  );
  const replica = (key: string, className: string, name: string, required = true) => (
    <g key={key} className={className}>
      <rect width={58} height={36} rx={3} fill="var(--color-kai)" stroke="var(--color-kai-bright)" strokeWidth="1.5" />
      <text x="29" y="14" textAnchor="middle" fontSize="7.8" fontWeight="800" fill="#fff">{name}</text>
      <text x="29" y="27" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">{required ? "required" : "elastic"}</text>
    </g>
  );
  const completingWorkload = (x: number, y: number) => (
    <g>
      {runningPod(x, y, "elastic-old-running", "elastic-complete-running")}
      {runningPod(x, y, "elastic-old-completed", "elastic-complete-done", "Completed", true)}
    </g>
  );

  return (
    <Frame title="Elastic Workloads: minSubGroup Starts 3/4, Then Expands to 4/4" h={510}>
      <style>{`
        .elastic-note { font-size: 11px; fill: var(--color-fg-mut); text-anchor: middle; }
        .elastic-phase-a { animation: elastic-phase-a 15s ease-in-out infinite; }
        .elastic-phase-b { animation: elastic-phase-b 15s ease-in-out infinite; }
        .elastic-phase-c { animation: elastic-phase-c 15s ease-in-out infinite; }
        .elastic-complete-running { animation: elastic-complete-running 15s ease-in-out infinite; }
        .elastic-complete-done { animation: elastic-complete-done 15s ease-in-out infinite; }
        .elastic-r1 { animation: elastic-r1 15s ease-in-out infinite; }
        .elastic-r2 { animation: elastic-r2 15s ease-in-out infinite; }
        .elastic-r3 { animation: elastic-r3 15s ease-in-out infinite; }
        .elastic-r4 { animation: elastic-r4 15s ease-in-out infinite; }
        @keyframes elastic-phase-a { 0%,30%{opacity:1} 40%,100%{opacity:0} }
        @keyframes elastic-phase-b { 0%,32%{opacity:0} 42%,58%{opacity:1} 68%,100%{opacity:0} }
        @keyframes elastic-phase-c { 0%,60%{opacity:0} 70%,88%{opacity:1} 98%,100%{opacity:0} }
        @keyframes elastic-complete-running { 0%,54%{opacity:1;transform:scale(1)} 62%,88%{opacity:0;transform:scale(.94)} 98%,100%{opacity:1;transform:scale(1)} }
        @keyframes elastic-complete-done { 0%,54%{opacity:0;transform:scale(.96)} 62%,70%{opacity:1;transform:scale(1.08)} 80%,88%{opacity:.1;transform:scale(.88)} 98%,100%{opacity:0;transform:scale(.96)} }
        @keyframes elastic-r1 { 0%,26%{transform:translate(580px,378px)} 40%,88%{transform:translate(504px,178px)} 98%,100%{transform:translate(580px,378px)} }
        @keyframes elastic-r2 { 0%,26%{transform:translate(650px,378px)} 40%,88%{transform:translate(356px,228px)} 98%,100%{transform:translate(650px,378px)} }
        @keyframes elastic-r3 { 0%,26%{transform:translate(720px,378px)} 40%,88%{transform:translate(430px,228px)} 98%,100%{transform:translate(720px,378px)} }
        @keyframes elastic-r4 { 0%,62%{transform:translate(650px,430px)} 76%,88%{transform:translate(430px,178px)} 98%,100%{transform:translate(650px,430px)} }
      `}</style>

      <g className="elastic-phase-a">
        <text x="450" y="60" className="elastic-note">The PodGroup has four replica SubGroups, but minSubGroup: 3 lets the workload start when any 3 replicas fit.</text>
      </g>
      <g className="elastic-phase-b">
        <text x="450" y="60" className="elastic-note">Only three GPU slots are free, so KAI schedules the required replica SubGroups and leaves replica 4 elastic.</text>
      </g>
      <g className="elastic-phase-c">
        <text x="450" y="60" className="elastic-note">When a running pod completes, the fourth replica is added without restarting the running work.</text>
      </g>

      <rect x="300" y="86" width="304" height="258" rx="5" fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke="var(--color-kai)" strokeWidth="1.4" />
      <text x="452" y="110" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-kai)">Node A · 8 GPU slots</text>
      {slot(356, 128, "e-s1")}
      {slot(430, 128, "e-s2")}
      {slot(504, 128, "e-s3")}
      {slot(356, 178, "e-s4")}
      {slot(430, 178, "e-s5")}
      {slot(504, 178, "e-s6")}
      {slot(356, 228, "e-s7")}
      {slot(430, 228, "e-s8")}

      {runningPod(356, 128, "e-old-1")}
      {runningPod(430, 128, "e-old-2")}
      {runningPod(504, 128, "e-old-3")}
      {runningPod(356, 178, "e-old-4")}
      {completingWorkload(430, 178)}

      <rect x="552" y="354" width="294" height="112" rx="7" fill="color-mix(in srgb, var(--color-kai) 10%, transparent)" stroke="var(--color-kai)" strokeDasharray="5 4" />
      <text x="699" y="370" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">Queued PodGroup · four replica SubGroups</text>
      <text x="699" y="484" textAnchor="middle" fontSize="10" fill="var(--color-fg-mut)">replica 4 remains elastic until capacity appears</text>
      {replica("elastic-replica-1", "elastic-r1", "replica 1")}
      {replica("elastic-replica-2", "elastic-r2", "replica 2")}
      {replica("elastic-replica-3", "elastic-r3", "replica 3")}
      {replica("elastic-replica-4", "elastic-r4", "replica 4", false)}

      <rect x="54" y="112" width="190" height="118" rx="6" fill="var(--color-panel)" stroke="var(--color-line-2)" />
      <text x="149" y="137" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-fg)">PodGroup policy</text>
      <text x="149" y="164" textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">children: 4 replicas</text>
      <text x="149" y="185" textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">minSubGroup: 3</text>
      <text x="149" y="206" textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">each replica minMember: 1</text>

      <text x="450" y="500" className="elastic-note">Elastic scheduling separates the minimum useful gang from optional capacity above the threshold.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 16 · Hierarchical PodGroups & SubGroups
   Shows nested roles (router, prefill, decode) for distributed serving
   ══════════════════════════════════════════════════════════════════════════ */

export function HierarchicalPodGroupAnimation() {
  const nodeSlot = (x: number, y: number, w = 82, h = 36) => (
    <rect x={x} y={y} width={w} height={h} rx={4} fill="transparent" stroke="var(--color-line-2)" strokeDasharray="4 3" />
  );
  const roleBox = (name: string, sub: string, className: string, w = 100) => (
    <g className={className}>
      <rect width={w} height={42} rx={4} fill="var(--color-kai)" stroke="var(--color-kai-bright)" strokeWidth="1.5" />
      <text x={w / 2} y="17" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">{name}</text>
      <text x={w / 2} y="31" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff">{sub}</text>
    </g>
  );
  const node = (x: number, title: string, subtitle: string) => (
    <g>
      <rect x={x} y="128" width="240" height="190" rx="5" fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke="var(--color-kai)" strokeWidth="1.4" />
      <text x={x + 120} y="151" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-kai)">{title}</text>
      <text x={x + 120} y="169" textAnchor="middle" fontSize="9.5" fill="var(--color-fg-mut)">{subtitle}</text>
      {nodeSlot(x + 24, 190)}
      {nodeSlot(x + 134, 190)}
      {nodeSlot(x + 24, 246)}
      {nodeSlot(x + 134, 246)}
    </g>
  );

  return (
    <Frame title="Hierarchical PodGroups: Co-Locate Serving Components" h={470}>
      <style>{`
        .hpg-note { font-size: 11px; fill: var(--color-fg-mut); text-anchor: middle; }
        .hpg-phase-a { animation: hpg-phase-a 15s ease-in-out infinite; }
        .hpg-phase-b { animation: hpg-phase-b 15s ease-in-out infinite; }
        .hpg-phase-c { animation: hpg-phase-c 15s ease-in-out infinite; }
        .hpg-router { animation: hpg-router 15s ease-in-out infinite; }
        .hpg-prefill-leader { animation: hpg-prefill-leader 15s ease-in-out infinite; }
        .hpg-prefill-worker { animation: hpg-prefill-worker 15s ease-in-out infinite; }
        .hpg-decode-leader { animation: hpg-decode-leader 15s ease-in-out infinite; }
        .hpg-decode-worker { animation: hpg-decode-worker 15s ease-in-out infinite; }
        .hpg-kv-arrow { animation: hpg-kv-arrow 15s ease-in-out infinite; }
        @keyframes hpg-phase-a { 0%,28%{opacity:1} 38%,100%{opacity:0} }
        @keyframes hpg-phase-b { 0%,30%{opacity:0} 40%,58%{opacity:1} 68%,100%{opacity:0} }
        @keyframes hpg-phase-c { 0%,60%{opacity:0} 70%,88%{opacity:1} 98%,100%{opacity:0} }
        @keyframes hpg-router { 0%,24%{transform:translate(78px,370px)} 42%,88%{transform:translate(70px,190px)} 98%,100%{transform:translate(78px,370px)} }
        @keyframes hpg-prefill-leader { 0%,24%{transform:translate(198px,370px)} 42%,88%{transform:translate(180px,190px)} 98%,100%{transform:translate(198px,370px)} }
        @keyframes hpg-prefill-worker { 0%,24%{transform:translate(318px,370px)} 42%,88%{transform:translate(180px,246px)} 98%,100%{transform:translate(318px,370px)} }
        @keyframes hpg-decode-leader { 0%,42%{transform:translate(438px,370px)} 60%,88%{transform:translate(424px,190px)} 98%,100%{transform:translate(438px,370px)} }
        @keyframes hpg-decode-worker { 0%,42%{transform:translate(558px,370px)} 60%,88%{transform:translate(424px,246px)} 98%,100%{transform:translate(558px,370px)} }
        @keyframes hpg-kv-arrow { 0%,58%{opacity:0} 70%,88%{opacity:1} 98%,100%{opacity:0} }
      `}</style>

      <g className="hpg-phase-a">
        <text x="450" y="60" className="hpg-note">Grove describes one serving system as cliques: router, prefill leader/workers, and decode leader/workers.</text>
      </g>
      <g className="hpg-phase-b">
        <text x="450" y="60" className="hpg-note">KAI sees a hierarchy: prefill and decode each need their leader and workers before the root gang can start.</text>
      </g>
      <g className="hpg-phase-c">
        <text x="450" y="60" className="hpg-note">Topology-aware placement keeps tightly coupled components together while allowing prefill and decode to land on different nodes.</text>
      </g>

      <rect x="60" y="78" width="780" height="32" rx="5" fill="color-mix(in srgb, var(--color-kai) 12%, transparent)" stroke="var(--color-kai)" />
      <text x="450" y="99" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">PodCliqueSet: multinode-disaggregated · PodGang requires router + prefill + decode</text>

      {node(46, "Node A", "router + prefill colocated")}
      {node(350, "Node B", "decode colocated")}
      {node(654, "Node C", "spare / later scale-out")}

      <g className="hpg-kv-arrow">
        <path d="M 286 226 C 322 206 350 206 386 226" fill="none" stroke="var(--color-accent-bright)" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="336" y="202" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--color-accent)">KV transfer path</text>
      </g>

      <rect x="48" y="350" width="660" height="84" rx="7" fill="color-mix(in srgb, var(--color-kai) 10%, transparent)" stroke="var(--color-kai)" strokeDasharray="5 4" />
      <text x="378" y="366" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">Queued Grove components</text>
      {roleBox("router", "PodClique", "hpg-router")}
      {roleBox("prefill leader", "minMember: 1", "hpg-prefill-leader")}
      {roleBox("prefill worker", "minMember: 2", "hpg-prefill-worker")}
      {roleBox("decode leader", "minMember: 1", "hpg-decode-leader")}
      {roleBox("decode worker", "minMember: 2", "hpg-decode-worker")}

      <text x="450" y="456" className="hpg-note">Hierarchical PodGroups keep atomic scheduling while letting each role express its own gang and placement rules.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 17 · Scheduling Cycle — five ordered actions
   ══════════════════════════════════════════════════════════════════════════ */

export function SchedulingCycle() {
  const steps = ["Allocate", "Consolidate", "Reclaim", "Preempt", "StaleGangEviction"];
  const tones: Array<"teal" | "gold" | "pink"> = ["teal", "teal", "gold", "pink", "pink"];
  return (
    <Frame title="KAI Scheduling Cycle — Five Ordered Actions (Non-Disruptive First)" h={240}>
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={36 + i * 166} y={84} w={130} h={60} label={s} tone={tones[i]} />
          {i < steps.length - 1 && <Arrow x1={166 + i * 166} y1={114} x2={202 + i * 166} y2={114} />}
          {i < steps.length - 1 && (
            <MovingDot
              path={`M ${166 + i * 166} 114 L ${202 + i * 166} 114`}
              color={i < 2 ? "var(--color-accent-bright)" : "var(--color-kai-bright)"}
              dur="1.6s"
              delay={`${i * 0.6}s`}
            />
          )}
        </g>
      ))}
      <text x={36} y={175} fontSize="11" fill="var(--color-fg-mut)">
        ← non-disruptive (teal)
      </text>
      <text x={530} y={175} fontSize="11" fill="var(--color-fg-mut)">
        disruptive (pink) →
      </text>
      <text x={36} y={200} fontSize="11" fill="var(--color-fg-mut)">
        Allocate and Consolidate try to place work without disturbing running pods.
        Reclaim, Preempt, and StaleGangEviction evict; they run only after non-disruptive actions cannot help.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 18 · Bin-Pack vs Spread
   ══════════════════════════════════════════════════════════════════════════ */

export function PlacementAnimation() {
  const slot = (x: number, y: number, key: string, label = "free") => (
    <g key={key}>
      <rect x={x} y={y} width={50} height={34} rx={3} fill="transparent" stroke="var(--color-line-2)" strokeDasharray="4 3" />
      <text x={x + 25} y={y + 21} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--color-fg-mut)">{label}</text>
    </g>
  );
  const queuedPod = (className: string, label: string, tone: "pink" | "teal") => (
    <g className={className}>
      <rect width={50} height={34} rx={3} fill={tone === "pink" ? "var(--color-kai)" : "var(--color-accent)"} stroke={tone === "pink" ? "var(--color-kai-bright)" : "var(--color-accent-bright)"} strokeWidth="1.4" />
      <text x="25" y="15" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={tone === "pink" ? "#fff" : "#05201d"}>{label}</text>
      <text x="25" y="27" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={tone === "pink" ? "#fff" : "#05201d"}>Pod</text>
    </g>
  );
  const node = (x: number, y: number, title: string, tone: "pink" | "teal") => (
    <g>
      <rect x={x} y={y} width={170} height={174} rx={4} fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke={tone === "pink" ? "var(--color-kai)" : "var(--color-accent)"} strokeWidth="1.4" />
      <text x={x + 85} y={y + 23} textAnchor="middle" fontSize="12" fontWeight="800" fill={tone === "pink" ? "var(--color-kai)" : "var(--color-accent)"}>{title}</text>
      {slot(x + 24, y + 44, `${title}-1`)}
      {slot(x + 96, y + 44, `${title}-2`)}
      {slot(x + 24, y + 94, `${title}-3`)}
      {slot(x + 96, y + 94, `${title}-4`)}
    </g>
  );

  return (
    <Frame title="Spread vs Bin-Pack: Node Utilization Trade-off" h={850}>
      <style>{`
        .place-note { font-size: 11px; fill: var(--color-fg-mut); text-anchor: middle; }
        .spread-p1 { animation: spread-p1 13s ease-in-out infinite; }
        .spread-p2 { animation: spread-p2 13s ease-in-out infinite; }
        .spread-p3 { animation: spread-p3 13s ease-in-out infinite; }
        .bin-p1 { animation: bin-p1 13s ease-in-out infinite; }
        .bin-p2 { animation: bin-p2 13s ease-in-out infinite; }
        .bin-p3 { animation: bin-p3 13s ease-in-out infinite; }
        @keyframes spread-p1 { 0%,24%{transform:translate(344px,342px)} 44%,86%{transform:translate(119px,166px)} 96%,100%{transform:translate(344px,342px)} }
        @keyframes spread-p2 { 0%,24%{transform:translate(402px,342px)} 44%,86%{transform:translate(389px,166px)} 96%,100%{transform:translate(402px,342px)} }
        @keyframes spread-p3 { 0%,24%{transform:translate(460px,342px)} 44%,86%{transform:translate(659px,166px)} 96%,100%{transform:translate(460px,342px)} }
        @keyframes bin-p1 { 0%,24%{transform:translate(344px,728px)} 44%,86%{transform:translate(119px,544px)} 96%,100%{transform:translate(344px,728px)} }
        @keyframes bin-p2 { 0%,24%{transform:translate(402px,728px)} 44%,86%{transform:translate(191px,544px)} 96%,100%{transform:translate(402px,728px)} }
        @keyframes bin-p3 { 0%,24%{transform:translate(460px,728px)} 44%,86%{transform:translate(119px,594px)} 96%,100%{transform:translate(460px,728px)} }
      `}</style>

      <text x="450" y="60" className="place-note">Same three Pods, same three feasible nodes. The shard placement strategy changes which node scores highest.</text>

      <text x={450} y={92} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-accent)">Spread</text>
      <text x={450} y={112} textAnchor="middle" fontSize="10.5" fill="var(--color-fg-mut)">prioritize distribution across nodes</text>
      {node(95, 122, "Node A", "teal")}
      {node(365, 122, "Node B", "teal")}
      {node(635, 122, "Node C", "teal")}
      <rect x="326" y="324" width="220" height="66" rx="7" fill="color-mix(in srgb, var(--color-accent) 10%, transparent)" stroke="var(--color-accent)" strokeDasharray="5 4" />
      <text x="436" y="342" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-accent)">Queued spread workload</text>
      {queuedPod("spread-p1", "S1", "teal")}
      {queuedPod("spread-p2", "S2", "teal")}
      {queuedPod("spread-p3", "S3", "teal")}

      <line x1="70" y1="424" x2="830" y2="424" stroke="var(--color-line-2)" strokeWidth="1.2" strokeDasharray="6 6" />

      <text x={450} y={462} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-kai)">Bin-Pack</text>
      <text x={450} y={482} textAnchor="middle" fontSize="10.5" fill="var(--color-fg-mut)">prioritize fuller nodes first, leaving larger empty regions</text>
      {node(95, 500, "Node A", "pink")}
      {node(365, 500, "Node B", "pink")}
      {node(635, 500, "Node C", "pink")}
      <rect x="326" y="710" width="220" height="66" rx="7" fill="color-mix(in srgb, var(--color-kai) 10%, transparent)" stroke="var(--color-kai)" strokeDasharray="5 4" />
      <text x="436" y="728" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">Queued bin-pack workload</text>
      {queuedPod("bin-p1", "B1", "pink")}
      {queuedPod("bin-p2", "B2", "pink")}
      {queuedPod("bin-p3", "B3", "pink")}

      <text x="450" y="840" className="place-note">Spread trades fragmentation for wider failure isolation. Bin-pack trades wider spread for larger empty regions that help future gangs.</text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 19 · Scheduling Shards
   ══════════════════════════════════════════════════════════════════════════ */

export function ShardAnimation() {
  const shardCard = (
    x: number,
    y: number,
    w: number,
    title: string,
    lines: string[],
    tone: "pink" | "teal" = "pink",
  ) => {
    const stroke = tone === "teal" ? "var(--color-accent)" : "var(--color-kai)";
    return (
      <g>
        <rect x={x} y={y} width={w} height={86} rx={6} fill="var(--color-panel)" stroke={stroke} strokeWidth="1.5" />
        <text x={x + w / 2} y={y + 24} textAnchor="middle" fontSize="12.5" fontWeight="800" fill="var(--color-fg)">{title}</text>
        {lines.map((line, i) => (
          <text key={line} x={x + w / 2} y={y + 46 + i * 16} textAnchor="middle" fontSize="10" fill="var(--color-fg-mut)">{line}</text>
        ))}
      </g>
    );
  };

  return (
    <Frame title="Scheduling Shards: Independent Scheduling Domains per Node Group" h={360}>
      {/* Left: node pools */}
      <text x={165} y={66} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-fg)">Node Pools</text>
      {shardCard(44, 82, 242, "h100-pool", ["nodes: NVIDIA-DGX-H100", "label selects this shard"])}
      {shardCard(44, 200, 242, "l40s-pool", ["nodes: NVIDIA-L40S", "separate node set"], "teal")}

      {/* SchedulingShard CRDs */}
      <text x={450} y={66} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-fg)">SchedulingShard CRDs</text>
      {shardCard(320, 82, 260, "h100-shard", ["actions: allocate -> preempt", "partition: NVIDIA-DGX-H100"])}
      {shardCard(320, 200, 260, "l40s-shard", ["actions: allocate -> consolidate", "partition: NVIDIA-L40S"], "teal")}

      {/* Scheduler instances */}
      <text x={750} y={66} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-fg)">Schedulers</text>
      {shardCard(640, 82, 220, "scheduler-h100", ["own deployment", "own cycle"])}
      {shardCard(640, 200, 220, "scheduler-l40s", ["own deployment", "own cycle"], "teal")}

      <Arrow x1={286} y1={125} x2={320} y2={125} />
      <Arrow x1={286} y1={243} x2={320} y2={243} />
      <Arrow x1={580} y1={125} x2={640} y2={125} />
      <Arrow x1={580} y1={243} x2={640} y2={243} />

      <MovingDot path="M 286 125 L 320 125" dur="2s" />
      <MovingDot path="M 286 243 L 320 243" color="var(--color-accent-bright)" dur="2s" delay=".8s" />
      <MovingDot path="M 580 125 L 640 125" dur="2s" delay="0.4s" />
      <MovingDot path="M 580 243 L 640 243" color="var(--color-accent-bright)" dur="2s" delay="1.2s" />

      <text x={450} y={320} textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">
        Each shard gets its own scheduling cycle, action set, and node scope.
      </text>
      <text x={450} y={338} textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">
        Queues, nodes, and PodGroups with matching partition labels are evaluated together.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 20 · Topology-Aware Scheduling
   Inspired by the KAI docs topology example:
   2 blocks × 3 racks × 4 hosts = 24 nodes
   ══════════════════════════════════════════════════════════════════════════ */

export function TopologyMap() {
  const blocks = ["block-a", "block-b"];
  const racks = [1, 2, 3];
  const blockColors = ["var(--color-kai)", "var(--color-accent)"];

  return (
    <Frame title="Topology: 2 Blocks × 3 Racks × 4 Hosts = 24 Simulated Nodes" h={420}>
      {blocks.map((b, bi) => {
        const bx = 30 + bi * 435;
        const bcolor = blockColors[bi];
        return (
          <g key={b}>
            {/* block frame */}
            <rect x={bx} y={58} width={410} height={330} rx={10}
              fill="color-mix(in srgb, transparent 100%, transparent)"
              stroke={bcolor} strokeWidth="2" strokeDasharray="8 4" />
            <rect x={bx + 10} y={52} width={100} height={20} rx={4}
              fill="var(--color-bg-2)" />
            <text x={bx + 14} y={67} fontSize="12" fontWeight="800" fill={bcolor}>{b}</text>
            <text x={bx + 14} y={83} fontSize="10" fill="var(--color-fg-mut)">
              topology-block: {b}
            </text>

            {racks.map((r) => {
              const rx2 = bx + 18 + (r - 1) * 130;
              const rackStroke = bi === 0 ? "#f59e0b" : "var(--color-accent)";
              return (
                <g key={r}>
                  {/* rack frame */}
                  <rect x={rx2} y={100} width={112} height={270} rx={7}
                    fill="var(--color-panel)" stroke={rackStroke} strokeWidth="1.4" />
                  <text x={rx2 + 56} y={120} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-fg)">
                    rack-{r}
                  </text>
                  <text x={rx2 + 56} y={134} textAnchor="middle" fontSize="9" fill="var(--color-fg-mut)">
                    rack={b}-r{r}
                  </text>

                  {/* 4 host nodes per rack */}
                  {[0, 1, 2, 3].map((n) => {
                    const ny = 148 + n * 54;
                    const nodeStroke = bi === 0 ? "var(--color-kai)" : "var(--color-accent)";
                    return (
                      <g key={n}>
                        <rect x={rx2 + 10} y={ny} width={92} height={42} rx={5}
                          fill="color-mix(in srgb, var(--color-panel) 60%, transparent)"
                          stroke={nodeStroke} strokeWidth="1" />
                        <text x={rx2 + 56} y={ny + 15} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-fg)">
                          {b.replace("block-", "")}-r{r}-n{n + 1}
                        </text>
                        <text x={rx2 + 56} y={ny + 28} textAnchor="middle" fontSize="8" fill="var(--color-fg-mut)">
                          8 GPUs
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      <rect x={30} y={398} width={840} height={16} rx={3} fill="transparent" />
      <text x={30} y={410} fontSize="10" fill="var(--color-fg-mut)">
        Labels: kai.scheduler/topology-block (block-a/b) · kai.scheduler/topology-rack (block-a-r1 … block-b-r3) · hostname (node name)
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 21 · GPU Sharing
   ══════════════════════════════════════════════════════════════════════════ */

export function GpuSharingAnimation() {
  const workloadPod = (x: number, y: number, name: string) => (
    <g>
      <rect x={x} y={y} width={150} height={56} rx={5} fill="var(--color-accent)" stroke="var(--color-accent-bright)" strokeWidth="1.5" />
      <text x={x + 75} y={y + 23} textAnchor="middle" fontSize="12" fontWeight="800" fill="#05201d">{name}</text>
      <text x={x + 75} y={y + 41} textAnchor="middle" fontSize="10" fontWeight="700" fill="#05201d">gpu-fraction: 0.5</text>
    </g>
  );
  const reservationPod = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width={178} height={72} rx={5} fill="color-mix(in srgb, var(--color-kai) 18%, transparent)" stroke="var(--color-kai)" strokeWidth="1.4" strokeDasharray="6 4" />
      <text x={x + 89} y={y + 24} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-kai)">one reservation Pod</text>
      <text x={x + 89} y={y + 43} textAnchor="middle" fontSize="9.5" fill="var(--color-fg-mut)">reserves shared GPU</text>
      <text x={x + 89} y={y + 59} textAnchor="middle" fontSize="9.5" fill="var(--color-fg-mut)">0.5 + 0.5 = 1.0</text>
    </g>
  );

  return (
    <Frame title="GPU Sharing: Cross-Namespace Pods Share One GPU" h={430}>
      <style>{`
        .gpu-share-line { stroke-dasharray: 6 5; opacity: .95; }
      `}</style>

      <rect x="42" y="74" width="202" height="120" rx="7" fill="var(--color-panel)" stroke="var(--color-accent)" strokeWidth="1.5" />
      <text x="143" y="100" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-accent)">namespace-a</text>
      {workloadPod(68, 122, "Pod A")}

      <rect x="42" y="224" width="202" height="120" rx="7" fill="var(--color-panel)" stroke="var(--color-accent)" strokeWidth="1.5" />
      <text x="143" y="250" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-accent)">namespace-b</text>
      {workloadPod(68, 272, "Pod B")}

      <rect x="352" y="94" width="196" height="230" rx="8" fill="color-mix(in srgb, var(--color-panel) 92%, white)" stroke="var(--color-kai)" strokeWidth="1.7" />
      <text x="450" y="120" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-kai)">one physical GPU</text>
      <text x="450" y="140" textAnchor="middle" fontSize="9.5" fill="var(--color-fg-mut)">same GPU ID / UUID</text>
      <rect x="386" y="160" width="128" height="56" rx="5" fill="var(--color-accent)" stroke="var(--color-accent-bright)" strokeWidth="1.4" />
      <text x="450" y="183" textAnchor="middle" fontSize="11" fontWeight="800" fill="#05201d">Pod A share</text>
      <text x="450" y="201" textAnchor="middle" fontSize="10" fontWeight="700" fill="#05201d">0.5 GPU</text>
      <rect x="386" y="228" width="128" height="56" rx="5" fill="var(--color-accent)" stroke="var(--color-accent-bright)" strokeWidth="1.4" />
      <text x="450" y="251" textAnchor="middle" fontSize="11" fontWeight="800" fill="#05201d">Pod B share</text>
      <text x="450" y="269" textAnchor="middle" fontSize="10" fontWeight="700" fill="#05201d">0.5 GPU</text>
      <text x="450" y="306" textAnchor="middle" fontSize="10" fill="var(--color-fg-mut)">combined request fills device</text>

      <rect x="636" y="84" width="220" height="250" rx="7" fill="var(--color-panel)" stroke="var(--color-kai)" strokeWidth="1.5" />
      <text x="746" y="110" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-kai)">reservation namespace</text>
      <text x="746" y="128" textAnchor="middle" fontSize="9.5" fill="var(--color-fg-mut)">kai-resource-reservation</text>
      {reservationPod(657, 156)}
      <rect x="667" y="252" width="158" height="50" rx="5" fill="color-mix(in srgb, var(--color-accent) 14%, transparent)" stroke="var(--color-accent)" strokeWidth="1.2" />
      <text x="746" y="273" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="var(--color-accent)">GPU ID discovery</text>
      <text x="746" y="290" textAnchor="middle" fontSize="9" fill="var(--color-fg-mut)">runtime + NVML access</text>

      <path className="gpu-share-line" d="M 218 150 C 282 150 318 168 386 188" fill="none" stroke="var(--color-accent-bright)" strokeWidth="1.8" markerEnd="url(#arrow)" />
      <path className="gpu-share-line" d="M 218 300 C 282 300 318 276 386 256" fill="none" stroke="var(--color-accent-bright)" strokeWidth="1.8" markerEnd="url(#arrow)" />
      <path className="gpu-share-line" d="M 514 188 C 578 180 610 176 657 186" fill="none" stroke="var(--color-kai)" strokeWidth="1.8" markerEnd="url(#arrow-pink)" />
      <path className="gpu-share-line" d="M 514 256 C 578 254 614 238 657 218" fill="none" stroke="var(--color-kai)" strokeWidth="1.8" markerEnd="url(#arrow-pink)" />
      <path d="M 746 252 L 746 228" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" markerEnd="url(#arrow)" />

      <text x="450" y="378" textAnchor="middle" fontSize="11" fill="var(--color-fg-mut)">
        The binder uses the reservation Pod to reserve and identify the physical GPU, then binds both fractional Pods to that same device.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 22 · DRA — ResourceClaim flow and BindRequest
   ══════════════════════════════════════════════════════════════════════════ */

export function BinderDraAnimation() {
  return (
    <Frame title="DRA: Scheduler Selects Node, Binder Executes via BindRequest" h={310}>
      <Box x={50} y={85} w={160} h={70} label="scheduler" sub="selects node\nmakes decision" />
      <Box x={290} y={85} w={180} h={70} label="BindRequest" sub="pod + node + claim\nKAI-specific object" tone="gold" />
      <Box x={560} y={85} w={175} h={70} label="binder" sub="binds pod to node\nand allocates claim" tone="teal" />

      {/* DRA objects below */}
      <Box x={50} y={215} w={160} h={64} label="Pod" sub="resources.claims\nreferences template" tone="gold" />
      <Box x={270} y={215} w={175} h={64} label="ResourceClaim" sub="from template\ndevice allocation" />
      <Box x={505} y={215} w={165} h={64} label="DeviceClass" sub="gpu.nvidia.com\ndevice constraints" tone="teal" />

      <Arrow x1={210} y1={120} x2={290} y2={120} />
      <Arrow x1={470} y1={120} x2={560} y2={120} />
      <Arrow x1={640} y1={155} x2={640} y2={215} />
      <Arrow x1={130} y1={155} x2={130} y2={215} />
      <Arrow x1={210} y1={247} x2={270} y2={247} />
      <Arrow x1={445} y1={247} x2={505} y2={247} />

      <MovingDot path="M 210 120 L 290 120" dur="2s" />
      <MovingDot path="M 470 120 L 560 120" color="var(--color-accent-bright)" dur="2s" delay="1s" />

      <text x={50} y={300} fontSize="11" fill="var(--color-fg-mut)">
        The scheduler writes a BindRequest rather than calling the bind API directly.
        The binder picks it up, performs both the pod bind and the ResourceClaim allocation atomically.
      </text>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Chapter 22 · DRA Flow (data path)
   ══════════════════════════════════════════════════════════════════════════ */

export function DraFlow() {
  return (
    <Frame title="DRA GPU Claim Lifecycle" h={260}>
      <Box x={40} y={95} w={160} h={70} label="Pod" sub="resources.claims" tone="gold" />
      <Box x={270} y={95} w={185} h={70} label="ResourceClaim" sub="from template" />
      <Box x={520} y={95} w={170} h={70} label="DeviceClass" sub="gpu.nvidia.com" tone="teal" />
      <Box x={750} y={95} w={120} h={70} label="Binder" sub="BindRequest" />
      <Arrow x1={200} y1={130} x2={270} y2={130} />
      <Arrow x1={455} y1={130} x2={520} y2={130} />
      <Arrow x1={690} y1={130} x2={750} y2={130} />
      <MovingDot path="M 200 130 L 270 130" dur="2.2s" />
      <MovingDot path="M 455 130 L 520 130" color="var(--color-accent-bright)" dur="2.2s" delay="0.8s" />
      <MovingDot path="M 690 130 L 750 130" color="#f59e0b" dur="2.2s" delay="1.6s" />
    </Frame>
  );
}
