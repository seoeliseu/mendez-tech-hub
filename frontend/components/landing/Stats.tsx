import type { ModuleMeta } from "@/lib/content";

export function Stats({ modules }: { modules: ModuleMeta[] }) {
  const moduleCount = modules.length;
  const categoryCount = new Set(modules.map((m) => m.category)).size;
  const tagCount = modules.reduce((sum, m) => sum + m.tags.length, 0);

  const items: { n: number; l: string }[] = [
    { n: moduleCount, l: "Módulos" },
    { n: categoryCount, l: "Categorias" },
    { n: tagCount, l: "Tags" },
  ];

  return (
    <div className="mb-7 flex flex-wrap gap-6 border-y border-border py-6">
      {items.map((item) => (
        <div key={item.l} className="flex flex-col gap-1">
          <span className="font-mono text-[26px] font-semibold leading-none text-text">{item.n}</span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-muted">{item.l}</span>
        </div>
      ))}
    </div>
  );
}
