import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./content-paths";
import { getAllModules, getModuleBySlug } from "./content";

const fixture = path.join(CONTENT_DIR, "backend", "_fixture-test.mdx");

beforeAll(() => {
  fs.mkdirSync(path.dirname(fixture), { recursive: true });
  fs.writeFileSync(
    fixture,
    // NOTE: slug is `fixture-test` (no leading underscore) even though the file is named
    // `_fixture-test.mdx` — the frontmatter `slug` field is Zod-validated against
    // /^[a-z0-9-]+$/ (see frontmatter-schema.ts), which real content slugs across the plan
    // (e.g. csharp-concepts, microservicos) confirm is intentional; only the filename uses
    // the leading underscore as a human-visible "this is a test fixture" marker.
    `---\ntitle: Fixture\nslug: fixture-test\ncategory: backend\nicon: "🧪"\naccent: "#a78bfa"\ndescription: d\ntags: [X]\norder: 999\nupdated: 2026-07-21\n---\n\n## Hello\nbody\n`
  );
});
afterAll(() => fs.rmSync(fixture));

describe("content loader", () => {
  it("lists modules including the fixture, sorted by order", () => {
    const mods = getAllModules();
    expect(mods.at(-1)?.slug).toBe("fixture-test");
    expect(mods.at(-1)?.category).toBe("backend");
  });
  it("gets a module body by slug", () => {
    const m = getModuleBySlug("fixture-test");
    expect(m?.meta.title).toBe("Fixture");
    expect(m?.body).toContain("## Hello");
  });
  it("returns null for unknown slug", () => {
    expect(getModuleBySlug("nope")).toBeNull();
  });
});
