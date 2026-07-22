import { describe, it, expect } from "vitest";
import { matchesFilter } from "./Filters";
describe("matchesFilter", () => {
  it("all shows everything", () => expect(matchesFilter("backend", "all")).toBe(true));
  it("matches same category", () => expect(matchesFilter("infra", "infra")).toBe(true));
  it("hides other categories", () => expect(matchesFilter("backend", "infra")).toBe(false));
});
