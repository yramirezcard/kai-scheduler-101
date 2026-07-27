import Link from "next/link";
import { FIRST_SLUG, CURRICULUM, ALL_LESSONS } from "@/lib/curriculum";
import { ArrowRight, Clock, Cpu, FlaskConical, Layers, TerminalSquare } from "lucide-react";

export default function Home() {
  const labCount = ALL_LESSONS.filter((l) => l.hasLab).length;
  const totalMin = ALL_LESSONS.reduce((s, l) => s + l.minutes, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="border-b border-[var(--color-line)] pb-8">
        <div className="inline-flex items-center gap-2 border border-[var(--color-line-2)] bg-[var(--color-panel)] px-3 py-1 text-xs text-[var(--color-fg-dim)]">
          <Cpu size={14} className="text-[var(--color-kai-bright)]" />
          CPU-only Brev lab with k3s, KWOK, fake GPUs, and KAI Scheduler
        </div>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.08] md:text-6xl">
          KAI Scheduler 101
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-[var(--color-fg-dim)]">
          A 60-minute hands-on path through KAI installation, queues, fairness, preemption,
          gang scheduling, topology, GPU sharing, DRA, and operations. Run every command in
          the embedded shell against a real k3s control plane and simulated GPU fleet.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={`/learn/${FIRST_SLUG}`} className="group inline-flex items-center gap-2 rounded-lg bg-[var(--color-kai)] px-5 py-3 font-semibold text-white shadow-[0_6px_20px_color-mix(in_srgb,var(--color-kai)_35%,transparent)] transition hover:bg-[var(--color-kai-bright)]">
            Start the lab <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="flex items-center gap-4 text-xs text-[var(--color-fg-mut)]">
            <span className="inline-flex items-center gap-1.5"><Layers size={14} /> {CURRICULUM.length} parts</span>
            <span className="inline-flex items-center gap-1.5"><FlaskConical size={14} /> {labCount} hands-on chapters</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> ~{totalMin} min</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Feature icon={<TerminalSquare size={18} />} title="Embedded shell" body="Run tutorial commands directly in a bash session pointed at the lab cluster." />
        <Feature icon={<Cpu size={18} />} title="Simulated GPUs" body="KWOK and fake-gpu-operator provide GPU-like scheduling capacity on CPU-only hardware." />
        <Feature icon={<FlaskConical size={18} />} title="Guided observations" body="Each hands-on chapter explains what to inspect and ends with a short recap of the scheduling behavior." />
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">Course Path</h2>
          <span className="text-xs text-[var(--color-fg-mut)]">{ALL_LESSONS.length} chapters</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {CURRICULUM.map((p, i) => (
            <Link key={p.id} href={`/learn/${p.lessons[0].slug}`} className="group border border-[var(--color-line)] bg-[var(--color-panel)] p-5 transition hover:border-[var(--color-kai-dim)] hover:bg-[var(--color-panel-2)]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-line-2)] bg-[var(--color-bg)] text-sm font-bold text-[var(--color-kai-bright)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[var(--color-fg)]">{p.title}</div>
                  <div className="truncate text-xs text-[var(--color-fg-mut)]">{p.subtitle}</div>
                </div>
                <ArrowRight size={16} className="ml-auto shrink-0 text-[var(--color-fg-mut)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-kai-bright)]" />
              </div>
              <div className="mt-3 text-[11px] text-[var(--color-fg-mut)]">{p.lessons.length} chapters</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <div className="flex h-10 w-10 items-center justify-center border border-[var(--color-line-2)] bg-[var(--color-bg)] text-[var(--color-kai-bright)]">{icon}</div>
      <div className="mt-3 text-sm font-semibold text-[var(--color-fg)]">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-[var(--color-fg-mut)]">{body}</div>
    </div>
  );
}
