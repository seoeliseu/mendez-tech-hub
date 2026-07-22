import { describe, it, expect } from "vitest";
import { buildRecords } from "./search-record";

const meta = { slug: "csharp", title: "C#", category: "backend", tags: ["DI"] } as any;

describe("buildRecords", () => {
  it("creates one record per section with anchors", () => {
    const recs = buildRecords(meta, "intro\n\n## Dependency Injection\n\nscoped transient\n\n## Async\n\nawait\n");
    expect(recs.find((r) => r.section === "Dependency Injection")?.anchor).toBe("dependency-injection");
    expect(recs.some((r) => r.section === "Async")).toBe(true);
  });
});
