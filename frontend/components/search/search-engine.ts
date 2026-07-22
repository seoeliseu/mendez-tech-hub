import { Document } from "flexsearch";
import type { SearchRecord } from "@/lib/search-record";

// FlexSearch 0.8 (`flexsearch@^0.8.212`) ships the `Document` index as a named
// export (`import { Document } from "flexsearch"`), not the `FlexSearch.Document`
// default-namespace shape from older versions. The constructor shape below
// (`document: { id, index, store }` plus a top-level `tokenize`, inherited by every
// indexed field unless overridden per-field) is unchanged from the brief and is
// confirmed correct for 0.8 via Context7 + node_modules/flexsearch/index.d.ts.
export function createEngine(records: SearchRecord[]) {
  const index = new Document<SearchRecord>({
    document: { id: "id", index: ["section", "text", "tags", "title"], store: true },
    tokenize: "forward",
  });
  records.forEach((r) => index.add(r));

  return {
    search(q: string): SearchRecord[] {
      if (!q.trim()) return [];

      // Non-merged, enriched, multi-field Document search in 0.8 returns
      // `Array<{ field, result: Array<{ id, doc }> }>` — one group per indexed
      // field that matched — per node_modules/flexsearch/index.d.ts
      // `EnrichedDocumentSearchResults<D>`. Same shape the brief assumed
      // (`group.result` / `hit.doc`); only the import above changed for 0.8.
      const groups = index.search(q, { enrich: true, limit: 12 });

      const seen = new Set<string>();
      const out: SearchRecord[] = [];
      for (const group of groups) {
        for (const hit of group.result) {
          if (!hit.doc) continue; // `doc` is typed `D | null` — store:true means this never happens in practice
          const key = String(hit.id); // `Id = number | string` — normalize before de-duping across field groups
          if (!seen.has(key)) {
            seen.add(key);
            out.push(hit.doc);
          }
        }
      }
      return out.slice(0, 12); // per-field `limit` caps each group, not the merged total; re-cap after de-dup
    },
  };
}
