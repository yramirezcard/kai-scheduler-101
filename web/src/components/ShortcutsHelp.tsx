"use client";
import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";

// Press "?" to open a keyboard-shortcuts cheat sheet. Ignores keystrokes typed into inputs.
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Search lessons" },
  { keys: ["/"], label: "Search lessons" },
  { keys: ["?"], label: "This shortcuts help" },
  { keys: ["Esc"], label: "Close search / dialogs" },
  { keys: ["↑", "↓"], label: "Move in search results" },
  { keys: ["↵"], label: "Open the highlighted lesson" },
  { keys: ["▶"], label: "Run a command block in the lab shell" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "?" && !typing) { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "/" && !typing) { e.preventDefault(); window.dispatchEvent(new Event("kai101:open-search")); }
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-line-2)] bg-[var(--color-panel)] shadow-[0_24px_70px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-3">
          <Keyboard size={16} className="text-[var(--color-kai-bright)]" />
          <span className="text-sm font-semibold text-[var(--color-fg)]">Keyboard shortcuts</span>
          <button onClick={() => setOpen(false)} className="ml-auto text-[var(--color-fg-mut)] hover:text-[var(--color-fg)]"><X size={16} /></button>
        </div>
        <ul className="divide-y divide-[var(--color-line)]">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-[var(--color-fg-dim)]">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="rounded-md border border-[var(--color-line-2)] bg-[var(--color-bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-fg)]">{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--color-line)] px-4 py-2.5 text-center text-[11px] text-[var(--color-fg-mut)]">
          Press <kbd className="rounded border border-[var(--color-line-2)] px-1">?</kbd> anytime to toggle this.
        </div>
      </div>
    </div>
  );
}
