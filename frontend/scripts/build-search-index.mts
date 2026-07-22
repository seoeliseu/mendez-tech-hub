// Build-time search index generator. Walks all content modules (Task 2's `getAllModules`),
// splits each module's body into per-section records (`buildRecords`, Task 11), and writes
// the concatenated array to `public/search-index.json` for the client-side search (Task 12)
// to fetch and index. Run via `npm run predev` / `npm run prebuild` (see package.json) using
// `tsx` — native Node's ESM loader rejects the extensionless relative imports used throughout
// `lib/*.ts` (e.g. `./content-paths`), so this script cannot run under plain
// `node --experimental-strip-types` without rewriting those imports. tsx resolves them like
// the rest of the toolchain (ts-node-style resolution), so it is used instead.
import fs from "node:fs";
import path from "node:path";
import { getAllModules, getModuleBySlug } from "../lib/content";
import { buildRecords, type SearchRecord } from "../lib/search-record";

function main() {
  const records: SearchRecord[] = getAllModules().flatMap((meta) => {
    const found = getModuleBySlug(meta.slug);
    if (!found) return []; // unreachable in practice — slug just came from getAllModules()
    return buildRecords(meta, found.body);
  });

  const outPath = path.join(process.cwd(), "public", "search-index.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2) + "\n");

  console.log(`[build-search-index] wrote ${records.length} record(s) to ${path.relative(process.cwd(), outPath)}`);
}

main();
