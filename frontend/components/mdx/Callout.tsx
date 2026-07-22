const STYLES = {
  tip: "border-[#66bb6a]/40 bg-[#66bb6a]/10",
  warn: "border-[#ffd54f]/40 bg-[#ffd54f]/10",
  info: "border-[#38bdf8]/40 bg-[#38bdf8]/10",
} as const;
const ICON = { tip: "✅", warn: "⚠️", info: "💡" } as const;

export function Callout({ type = "info", children }: { type?: keyof typeof STYLES; children: React.ReactNode }) {
  return (
    <div role="note" data-type={type} className={`my-5 flex gap-3 rounded-xl border p-4 text-sm ${STYLES[type]}`}>
      <span className="shrink-0 text-lg">{ICON[type]}</span>
      <div className="[&_strong]:block [&_strong]:mb-1">{children}</div>
    </div>
  );
}
