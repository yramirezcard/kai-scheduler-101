import type { ReactNode } from "react";
import { LabSplit } from "./LabSplit";

export function LessonBody({ slug, hasLab, children }: { slug: string; hasLab?: boolean; children: ReactNode }) {
  return (
    hasLab ? (
      <LabSplit slug={slug}>{children}</LabSplit>
    ) : (
      <div className="prose mx-auto max-w-5xl">{children}</div>
    )
  );
}
