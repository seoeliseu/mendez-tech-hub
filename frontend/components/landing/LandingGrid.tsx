"use client";
import { useState } from "react";
import type { ModuleMeta } from "@/lib/content";
import type { Category } from "@/lib/frontmatter-schema";
import { Filters, matchesFilter } from "./Filters";
import { ConceptCard } from "./ConceptCard";

export function LandingGrid({ modules }: { modules: ModuleMeta[] }) {
  const [active, setActive] = useState<Category | "all">("all");
  const visible = modules.filter((m) => matchesFilter(m.category, active));

  return (
    <>
      <Filters onChange={setActive} />
      {visible.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3.5 pb-16">
          {visible.map((m) => (
            <ConceptCard key={m.slug} module={m} />
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
