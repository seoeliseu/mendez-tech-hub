"use client";
import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/frontmatter-schema";
export function matchesFilter(cat: Category, active: Category | "all") {
  return active === "all" || cat === active;
}
export function Filters({ onChange }: { onChange: (a: Category | "all") => void }) {
  const [active, setActive] = useState<Category | "all">("all");
  const opts: (Category | "all")[] = ["all", ...CATEGORIES];
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {opts.map((o) => (
        <button key={o} onClick={() => { setActive(o); onChange(o); }}
          className={`rounded-md border px-3.5 py-1.5 text-xs font-medium ${active === o ? "border-dim bg-surface2 text-text" : "border-border text-muted"}`}>
          {o === "all" ? "Todos" : CATEGORY_LABELS[o]}
        </button>
      ))}
    </div>
  );
}
