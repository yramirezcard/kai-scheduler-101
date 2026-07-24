import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { SearchButton } from "./SearchButton";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { Cpu } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] px-5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
        <Cpu size={18} className="text-[var(--color-kai-bright)]" />
        <span className="hidden sm:inline">
          <span className="text-[var(--color-fg-dim)]">KAI Scheduler</span>
          <span className="text-[var(--color-kai-bright)]"> 101</span>
          <span className="text-[var(--color-fg-mut)]"> · hands-on</span>
        </span>
        <span className="sm:hidden">KAI Scheduler 101</span>
      </Link>
      <div className="ml-auto flex items-center gap-2 text-[0.72rem] text-[var(--color-fg-mut)]">
        <SearchButton />
        <span className="hidden rounded-full border border-[var(--color-kai-dim)] px-2.5 py-1 text-[var(--color-kai-bright)] md:inline-block">kind · KWOK · fake GPUs</span>
        <ThemeToggle />
      </div>
      <CommandPalette />
      <ShortcutsHelp />
    </header>
  );
}
