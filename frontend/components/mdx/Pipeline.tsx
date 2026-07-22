type Step = { label: string; note?: string; kind?: "req" | "res" | "step" };
const BORDER = { req: "border-[#38bdf8]", res: "border-[#66bb6a]", step: "border-border" };
export function Pipeline({ steps, caption }: { steps: Step[]; caption?: string }) {
  return (
    <figure className="my-5">
      <div className="flex flex-wrap items-center gap-0 rounded-2xl border border-border bg-surface p-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`min-w-28 rounded-xl border bg-surface2 px-3 py-4 text-center ${BORDER[s.kind ?? "step"]}`}>
              <div className="text-sm font-bold">{s.label}</div>
              {s.note && <div className="text-xs text-muted">{s.note}</div>}
            </div>
            {i < steps.length - 1 && <span className="px-2 text-xl text-[#818cf8]">→</span>}
          </div>
        ))}
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
