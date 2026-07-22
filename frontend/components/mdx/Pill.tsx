const COLORS: Record<string, string> = {
  purple: "bg-[#a78bfa]/15 text-[#a78bfa]",
  blue: "bg-[#38bdf8]/15 text-[#38bdf8]",
  green: "bg-[#66bb6a]/15 text-[#66bb6a]",
  orange: "bg-[#fb923c]/15 text-[#fb923c]",
  yellow: "bg-[#fbbf24]/15 text-[#fbbf24]",
};
export function Pill({ color = "purple", children }: { color?: string; children: React.ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORS[color] ?? COLORS.purple}`}>{children}</span>;
}
