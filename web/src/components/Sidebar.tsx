"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRICULUM, ALL_LESSONS } from "@/lib/curriculum";
import { FlaskConical } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const numberOf = (slug: string) => ALL_LESSONS.findIndex((l) => l.slug === slug) + 1;
  return (
    <nav className="space-y-5 text-sm" aria-label="Lessons">
      {CURRICULUM.map((part) => (
        <div key={part.id}>
          <div className="mb-1 flex items-center gap-2 px-1">
            <span className="h-3.5 w-[3px] rounded-full bg-[var(--color-kai)]" />
            <div className="min-w-0">
              <div className="text-[0.78rem] font-bold leading-tight text-[var(--color-kai-bright)]">{part.title}</div>
              <div className="truncate text-[0.68rem] text-[var(--color-fg-mut)]">{part.subtitle}</div>
            </div>
          </div>
          <div className="space-y-0.5">
            {part.lessons.map((l) => {
              const active = pathname === `/learn/${l.slug}`;
              return (
                <Link
                  key={l.slug}
                  href={`/learn/${l.slug}`}
                  className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition ${
                    active
                      ? "bg-[var(--color-panel-2)] text-[var(--color-fg)]"
                      : "text-[var(--color-fg-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.62rem] font-semibold ${
                      active
                        ? "bg-[var(--color-kai)] text-white"
                        : "border border-[var(--color-line-2)] text-[var(--color-fg-mut)] group-hover:border-[var(--color-kai-dim)]"
                    }`}
                  >
                    {numberOf(l.slug)}
                  </span>
                  <span className="flex-1 leading-snug">{l.title}</span>
                  {l.hasLab && <FlaskConical size={12} className="shrink-0 text-[var(--color-kai)]" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
