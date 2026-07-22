type Bar = { w: number; kind: "work" | "io" };
type Thread = { label: string; bars: Bar[] };
const BAR = { work: "bg-[#818cf8]/30 border-[#818cf8]/60 text-[#a89cf7]", io: "bg-[#ffd54f]/15 border-[#ffd54f]/40 text-[#ffd54f]" };
export function ThreadTimeline({ threads }: { threads: Thread[] }) {
  return (
    <div className="my-5 rounded-2xl border border-border bg-surface p-7">
      {threads.map((t, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <div className="w-24 shrink-0 text-xs font-bold text-muted">{t.label}</div>
          {t.bars.map((b, j) => (
            <div key={j} className={`flex h-7 items-center rounded-md border px-3 text-[11px] font-semibold ${BAR[b.kind]}`} style={{ width: b.w }}>
              {b.kind === "work" ? "CPU" : "I/O"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
