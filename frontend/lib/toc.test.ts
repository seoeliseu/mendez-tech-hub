import { describe, it, expect } from "vitest";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("captures h2/h3 with slug ids", () => {
    const t = extractToc("## Ciclo de Vida\n\ntext\n\n### Scoped\n");
    expect(t[0]).toEqual({ depth: 2, text: "Ciclo de Vida", id: "ciclo-de-vida" });
    expect(t[1].id).toBe("scoped");
  });

  // Guards the anchor-matching contract: extractToc's ids must match the ids rendered
  // on the actual h2/h3 elements (see mdx-components.tsx), including for PT-BR content
  // with accented characters. If diacritic stripping ever regresses, TOC links would
  // point at `#inversão-de-dependência` while the rendered heading id is `#inversao-de-dependencia` (or vice versa) — a silent, hard-to-notice broken anchor.
  it("strips accents from PT-BR headings", () => {
    const t = extractToc("## Inversão de Dependência\n");
    expect(t[0].id).toBe("inversao-de-dependencia");
  });
});
