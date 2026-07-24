"use client";
import { useEffect, useState } from "react";

type Item = { id: string; text: string; level: number };

// A sticky "On this page" rail (xl+ screens) built from the lesson's h2/h3 headings — rehype-slug
// gives them ids. Scroll-spy highlights the section nearest the top. Re-scans per lesson via `slug`.
export function OnThisPage({ slug }: { slug: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // let MDX render first
    const t = setTimeout(() => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("article h2[id], article h3[id]"));
      setItems(nodes.map((n) => ({ id: n.id, text: n.textContent || "", level: n.tagName === "H3" ? 3 : 2 })));
    }, 40);
    return () => clearTimeout(t);
  }, [slug]);

  useEffect(() => {
    if (items.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    items.forEach((it) => { const el = document.getElementById(it.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <aside className="pointer-events-none fixed right-5 top-24 z-20 hidden w-52 2xl:block">
      <div className="pointer-events-auto max-h-[70vh] overflow-y-auto border-l border-[var(--color-line)] pl-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-mut)]">On this page</div>
        <ul className="space-y-1 text-xs">
          {items.map((it) => {
            const active = it.id === activeId;
            return (
              <li key={it.id} style={{ paddingLeft: it.level === 3 ? 12 : 0 }}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${it.id}`); }}
                  className={`block truncate transition ${active ? "font-medium text-[var(--color-kai-bright)]" : "text-[var(--color-fg-mut)] hover:text-[var(--color-fg)]"}`}
                  title={it.text}
                >
                  {it.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
