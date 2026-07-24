"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Terminal } from "./Terminal";
import { PanelBottomClose, PanelBottomOpen, RotateCcw, TerminalSquare } from "lucide-react";

// Hands-on lessons: content on top, a live lab shell docked to the BOTTOM of the viewport
// (full content-width). The drawer height is draggable (row-resize) and remembered. Running a
// command (Run-in-shell) or the "Show shell" button reveals it. On small screens it still docks
// at the bottom; content gets padding so nothing is hidden behind it.
export function LabSplit({ children }: { children: ReactNode; slug?: string }) {
  const [heightPx, setHeightPx] = useState(360); // drawer height
  const [show, setShow] = useState(false);
  const dragging = useRef(false);

  function setShowManual(next: boolean) {
    setShow(next);
    try { window.localStorage.setItem("kai101:shell-open", String(next)); } catch {}
  }

  useEffect(() => {
    const savedShow = window.localStorage.getItem("kai101:shell-open");
    const savedH = Number(window.localStorage.getItem("kai101:shell-h"));
    if (savedShow === "true") setShow(true);
    if (Number.isFinite(savedH) && savedH >= 180 && savedH <= 900) setHeightPx(savedH);
  }, []);

  useEffect(() => {
    const onStart = () => setShow(true);
    window.addEventListener("kai101:start-shell", onStart);
    return () => window.removeEventListener("kai101:start-shell", onStart);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("kai101:shell-h", String(heightPx)); } catch {}
  }, [heightPx]);

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    const maxH = Math.round(window.innerHeight * 0.82);
    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      // distance from the pointer to the bottom of the viewport = drawer height
      const h = window.innerHeight - ev.clientY;
      setHeightPx(Math.min(maxH, Math.max(180, h)));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  return (
    <div>
      {/* content — padded at the bottom while the drawer is open so nothing hides behind it */}
      <div className="prose max-w-none xl:max-w-6xl" style={{ paddingBottom: show ? heightPx + 24 : 0 }}>
        {children}
      </div>

      {!show && (
        <button
          onClick={() => setShowManual(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-lg border border-[var(--color-kai-dim)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-kai-bright)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition hover:bg-[var(--color-bg-2)]"
        >
          <PanelBottomOpen size={15} /> Show lab shell
        </button>
      )}

      {show && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col border-t border-[var(--color-line-2)] bg-[var(--color-term-bg)] shadow-[0_-6px_24px_color-mix(in_srgb,var(--color-fg)_14%,transparent)]"
          style={{ height: heightPx }}
        >
          {/* drag handle */}
          <div
            onMouseDown={startDrag}
            className="group flex h-2 shrink-0 cursor-row-resize items-center justify-center bg-[var(--color-panel)]"
            title="Drag to resize the shell"
          >
            <span className="h-[3px] w-10 rounded-full bg-[var(--color-line-2)] transition-colors group-hover:bg-[var(--color-kai)]" />
          </div>

          {/* drawer header */}
          <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5">
            <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-[var(--color-fg-dim)]">
              <TerminalSquare size={15} className="text-[var(--color-kai-bright)]" />
              <span className="truncate">Live lab shell — kubectl</span>
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setHeightPx(360)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-line-2)] text-[var(--color-fg-mut)] transition hover:bg-[var(--color-bg-2)] hover:text-[var(--color-fg)]"
                title="Reset shell height"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setShowManual(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-line-2)] text-[var(--color-fg-mut)] transition hover:bg-[var(--color-bg-2)] hover:text-[var(--color-fg)]"
                title="Hide shell"
              >
                <PanelBottomClose size={15} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 p-2">
            <Terminal title="lab shell — kubectl" fill bare />
          </div>
        </div>
      )}
    </div>
  );
}
