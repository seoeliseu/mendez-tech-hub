import { describe, it, expect } from "vitest";
import { createEngine } from "./search-engine";
const recs = [
  { id: "1", slug: "csharp", title: "C#", category: "backend", section: "Dependency Injection", anchor: "di", text: "scoped transient singleton lifetime", tags: ["DI"] },
  { id: "2", slug: "sys", title: "System Design", category: "infra", section: "Caching", anchor: "cache", text: "cdn redis cache", tags: [] },
] as any;
describe("search engine", () => {
  it("finds by body term", () => {
    const e = createEngine(recs);
    expect(e.search("transient")[0].slug).toBe("csharp");
  });
  it("finds by section", () => {
    expect(createEngine(recs).search("caching")[0].slug).toBe("sys");
  });
});
