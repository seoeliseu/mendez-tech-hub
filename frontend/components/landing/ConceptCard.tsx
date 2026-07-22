import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
export function ConceptCard({ module: m }: { module: ModuleMeta }) {
  return (
    <Link href={`/concepts/${m.slug}`} data-cat={m.category}
      className="group relative flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border bg-surface p-6 transition hover:-translate-y-1"
      style={{ borderTopColor: m.accent }}>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl" style={{ background: `${m.accent}1f` }}>{m.icon}</div>
        <span className="rounded border border-border bg-surface2 px-2 py-1 font-mono text-[9px] text-muted">{m.category}</span>
      </div>
      <div><div className="text-base font-semibold">{m.title}</div><p className="mt-1 text-[13px] text-muted">{m.description}</p></div>
      <div className="flex flex-wrap gap-1.5">{m.tags.slice(0, 4).map((t) => <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${m.accent}1a`, color: m.accent }}>{t}</span>)}</div>
    </Link>
  );
}
