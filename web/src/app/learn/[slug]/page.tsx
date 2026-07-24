import { notFound } from "next/navigation";
import Link from "next/link";
import { ALL_LESSONS, lessonNeighbors } from "@/lib/curriculum";
import { mdxComponents } from "@/mdx-components";
import { LessonBody } from "@/components/LessonBody";
import { OnThisPage } from "@/components/OnThisPage";
import { Clock, ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";

const TOTAL = ALL_LESSONS.length;

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ slug: l.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = ALL_LESSONS.find((x) => x.slug === slug);
  return { title: l ? `${l.title} · KAI Scheduler 101` : "KAI Scheduler 101" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { current, prev, next } = lessonNeighbors(slug);
  if (!current) notFound();
  const index = ALL_LESSONS.findIndex((l) => l.slug === slug) + 1;
  const pct = Math.round((index / TOTAL) * 100);

  let Content: React.ComponentType<{ components?: typeof mdxComponents }>;
  try {
    const mod = await import(`@/content/${slug}.mdx`);
    Content = mod.default;
  } catch {
    notFound();
  }

  return (
    <article>
      <div className="mb-6 border-b border-[var(--color-line)] pb-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-kai-bright)]">{current.partTitle}</span>
          <span className="text-[11px] text-[var(--color-fg-mut)]">Lesson {index} of {TOTAL}</span>
          <span className="ml-auto hidden h-1.5 w-40 overflow-hidden rounded-full bg-[var(--color-line)] sm:block">
            <span className="block h-full rounded-full bg-gradient-to-r from-[var(--color-kai)] to-[var(--color-accent)]" style={{ width: `${pct}%` }} />
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)] md:text-4xl">{current.title}</h1>
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-fg-mut)]">
          <span className="flex items-center gap-1"><Clock size={13} /> {current.minutes} min</span>
          {current.hasLab && <span className="flex items-center gap-1 text-[var(--color-kai)]"><FlaskConical size={13} /> hands-on lab</span>}
        </div>
      </div>

      <OnThisPage slug={current.slug} />
      <LessonBody slug={current.slug} hasLab={current.hasLab}>
        <Content components={mdxComponents} />
      </LessonBody>

      <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-[var(--color-line)] pt-6">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="group flex flex-1 flex-col rounded-lg border border-[var(--color-line)] p-4 transition hover:border-[var(--color-kai-dim)]">
            <span className="flex items-center gap-1 text-xs text-[var(--color-fg-mut)]"><ArrowLeft size={12} /> Previous</span>
            <span className="mt-1 text-sm font-medium text-[var(--color-fg-dim)] group-hover:text-[var(--color-fg)]">{prev.title}</span>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link href={`/learn/${next.slug}`} className="group flex flex-1 flex-col items-end rounded-lg border border-[var(--color-line)] p-4 text-right transition hover:border-[var(--color-kai-dim)]">
            <span className="flex items-center gap-1 text-xs text-[var(--color-fg-mut)]">Next <ArrowRight size={12} /></span>
            <span className="mt-1 text-sm font-medium text-[var(--color-fg-dim)] group-hover:text-[var(--color-fg)]">{next.title}</span>
          </Link>
        ) : <div className="flex-1" />}
      </nav>
    </article>
  );
}
