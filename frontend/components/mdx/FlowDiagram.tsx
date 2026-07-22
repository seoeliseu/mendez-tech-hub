type Row = { box: string; color?: string; note?: string; indent?: number; tip?: string };
export function FlowDiagram({ rows, title }: { rows: Row[]; title?: string }) {
  return (
    <div className="my-5 rounded-2xl border border-border bg-surface p-7">
      {title && <h4 className="mb-5 text-xs uppercase tracking-wide text-muted">{title}</h4>}
      {rows.map((r, i) => (
        <div key={i} className="mb-2 flex items-center gap-3" style={{ marginLeft: (r.indent ?? 0) * 40 }}>
          <div
            className={`rounded-lg border border-border bg-surface2 px-4 py-2.5 text-sm font-semibold${r.tip ? " cursor-help underline decoration-dotted decoration-muted/50 underline-offset-4" : ""}`}
            style={r.color ? { borderColor: `${r.color}99`, color: r.color } : undefined}
            title={r.tip}
          >
            {r.box}
          </div>
          {r.note && <span className="text-xs text-muted">{r.note}</span>}
        </div>
      ))}
    </div>
  );
}
