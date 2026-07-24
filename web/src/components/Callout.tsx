import { Info, Lightbulb, AlertTriangle, FlaskConical, KeyRound } from "lucide-react";
import type { ReactNode } from "react";

const KINDS = {
  note: { icon: Info, color: "#5b8def", label: "Note" },
  tip: { icon: Lightbulb, color: "#2dd4bf", label: "Tip" },
  warn: { icon: AlertTriangle, color: "#e0a800", label: "Heads up" },
  lab: { icon: FlaskConical, color: "#5b8def", label: "In the lab" },
  exam: { icon: KeyRound, color: "#a78bfa", label: "Exam tip" },
} as const;

export function Callout({ type = "note", title, children }: { type?: keyof typeof KINDS; title?: string; children: ReactNode }) {
  const k = KINDS[type] ?? KINDS.note;
  const Icon = k.icon;
  return (
    <div className="my-5 flex gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4" style={{ borderLeft: `3px solid ${k.color}` }}>
      <Icon size={18} style={{ color: k.color, flexShrink: 0, marginTop: 2 }} />
      <div className="min-w-0">
        <div className="mb-1 text-sm font-semibold" style={{ color: k.color }}>{title ?? k.label}</div>
        <div className="text-sm text-[var(--color-fg-dim)] [&>*+*]:mt-2">{children}</div>
      </div>
    </div>
  );
}
