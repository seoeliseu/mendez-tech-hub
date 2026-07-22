export function CardGrid({ cols = 2, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  const c = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`my-5 grid grid-cols-1 gap-4 ${c}`}>{children}</div>;
}
export function Card({ accent = "#818cf8", pill, title, children }:
  { accent?: string; pill?: string; title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6" style={{ borderColor: `${accent}66` }}>
      {pill && <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${accent}26`, color: accent }}>{pill}</span>}
      {title && <h3 className="mb-2 text-base font-bold">{title}</h3>}
      <div className="text-sm text-muted">{children}</div>
    </div>
  );
}
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-border bg-surface2 px-2 py-0.5 font-mono text-[10px] text-muted">{children}</span>;
}
