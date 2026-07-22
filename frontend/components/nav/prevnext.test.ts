import { describe, it, expect } from "vitest";
import { getPrevNext } from "./PrevNext";
const mods = [{ slug: "a" }, { slug: "b" }, { slug: "c" }] as any;
describe("getPrevNext", () => {
  it("middle has both", () => expect(getPrevNext("b", mods)).toEqual({ prev: mods[0], next: mods[2] }));
  it("first has no prev", () => expect(getPrevNext("a", mods).prev).toBeNull());
  it("last has no next", () => expect(getPrevNext("c", mods).next).toBeNull());
});
