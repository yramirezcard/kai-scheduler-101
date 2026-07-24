"use client";
import { Search } from "lucide-react";

// Opens the ⌘K palette (dispatches an event the CommandPalette listens for). Shows the shortcut.
export function SearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("kai101:open-search"))}
      title="Search lessons (⌘K)"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-2)] px-2.5 py-1 text-[var(--color-fg-mut)] transition hover:border-[var(--color-kai-dim)] hover:text-[var(--color-fg)]"
    >
      <Search size={13} />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded border border-[var(--color-line-2)] px-1 text-[10px] sm:inline">⌘K</kbd>
    </button>
  );
}
