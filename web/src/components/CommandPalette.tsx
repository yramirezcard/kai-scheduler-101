"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_LESSONS } from "@/lib/curriculum";
import { Search, CornerDownLeft, FlaskConical } from "lucide-react";

// Global ⌘K / Ctrl-K palette to jump to any lesson. Substring match over title + part + blurb,
// title matches ranked first. Arrow keys to move, Enter to open, Esc to close.
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener("kai101:open-search", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("kai101:open-search", onOpen); };
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const scored = ALL_LESSONS.map((l, i) => {
      const title = l.title.toLowerCase();
      const hay = `${title} ${l.partTitle.toLowerCase()} ${l.blurb.toLowerCase()}`;
      let score = -1;
      if (!term) score = 1000 - i; // no query → original order
      else if (title.startsWith(term)) score = 300;
      else if (title.includes(term)) score = 200;
      else if (hay.includes(term)) score = 100;
      return { l, score };
    })
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.l);
    return scored;
  }, [q]);

  useEffect(() => { setActive(0); }, [q]);

  if (!open) return null;

  const go = (slug: string) => { setOpen(false); router.push(`/learn/${slug}`); };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].slug); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-line-2)] bg-[var(--color-panel)] shadow-[0_24px_70px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4">
          <Search size={16} className="text-[var(--color-fg-mut)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search lessons…"
            className="w-full bg-transparent py-3.5 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-mut)]"
          />
          <kbd className="rounded border border-[var(--color-line-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-fg-mut)]">esc</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-[var(--color-fg-mut)]">No lessons match “{q}”.</li>}
          {results.map((l, i) => {
            const num = ALL_LESSONS.findIndex((x) => x.slug === l.slug) + 1;
            return (
              <li key={l.slug}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(l.slug)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left ${i === active ? "bg-[var(--color-panel-2)]" : ""}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--color-line-2)] text-[11px] font-semibold text-[var(--color-fg-mut)]">
                    {num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg)]">
                      {l.title}
                      {l.hasLab && <FlaskConical size={11} className="text-[var(--color-kai)]" />}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--color-fg-mut)]">{l.partTitle}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className="shrink-0 text-[var(--color-fg-mut)]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
