import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";

// A concept card. When `subModules` is non-empty, the card also renders a nested strip of
// compact child links (e.g. Observabilidade holds its tool pages; System Design holds its
// cases) so the landing grid stays de-cluttered — children don't get their own top-level card.
// Root is a <div> (not a <Link>) so the child <Link>s aren't illegally nested inside an <a>.
export function ConceptCard({ module: m, subModules = [] }: { module: ModuleMeta; subModules?: ModuleMeta[] }) {
  return (
    <div data-cat={m.category}
      className="group relative flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border bg-surface p-6 transition hover:-translate-y-1"
      style={{ borderTopColor: m.accent }}>
      <Link href={`/concepts/${m.slug}`} className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl" style={{ background: `${m.accent}1f` }}>{m.icon}</div>
          <span className="rounded border border-border bg-surface2 px-2 py-1 font-mono text-[9px] text-muted">{m.category}</span>
        </div>
        <div><div className="text-base font-semibold">{m.title}</div><p className="mt-1 text-[13px] text-muted">{m.description}</p></div>
        <div className="flex flex-wrap gap-1.5">{m.tags.slice(0, 4).map((t) => <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${m.accent}1a`, color: m.accent }}>{t}</span>)}</div>
      </Link>
      {subModules.length > 0 && (
        <div className="mt-1 rounded-lg border border-border/70 bg-surface2/40 p-2.5">
          <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {subModules.length} {subModules.length === 1 ? "página" : "páginas"}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {subModules.map((c) => (
              <Link key={c.slug} href={`/concepts/${c.slug}`}
                className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-xs transition hover:-translate-y-0.5 hover:border-dim"
                style={{ borderLeftColor: c.accent, borderLeftWidth: 2 }}>
                <span className="text-sm">{c.icon}</span>
                <span className="min-w-0 truncate font-medium">{c.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
