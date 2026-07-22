"use client";
import { useState } from "react";
import type { ModuleMeta } from "@/lib/content";
import type { Category } from "@/lib/frontmatter-schema";
import { Filters, matchesFilter } from "./Filters";
import { ConceptCard } from "./ConceptCard";

export function LandingGrid({ modules }: { modules: ModuleMeta[] }) {
  const [active, setActive] = useState<Category | "all">("all");

  // Group children by parent slug (already order-sorted by getAllModules).
  const childrenByParent = new Map<string, ModuleMeta[]>();
  for (const m of modules) {
    if (!m.parent) continue;
    const arr = childrenByParent.get(m.parent) ?? [];
    arr.push(m);
    childrenByParent.set(m.parent, arr);
  }

  // Only top-level modules (no parent) become cards; children nest inside their parent card.
  const topLevel = modules.filter((m) => !m.parent && matchesFilter(m.category, active));

  return (
    <>
      <Filters onChange={setActive} />
      {topLevel.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3.5 pb-16">
          {topLevel.map((m) => (
            <ConceptCard key={m.slug} module={m} subModules={childrenByParent.get(m.slug) ?? []} />
          ))}
        </div>
      ) : (
        <p className="pb-16 text-sm text-muted">
          {modules.length === 0
            ? "Em breve — os módulos deste hub estão a caminho."
            : "Nenhum módulo nesta categoria ainda."}
        </p>
      )}
    </>
  );
}
