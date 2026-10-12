import { describe, expect, it } from "vitest";
import ar from "@/i18n/messages/ar";
import en from "@/i18n/messages/en";
import { switchLocalePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { search } from "@/lib/search";
import { topics } from "@/lib/data/topics";
import { demoPosts } from "@/lib/data/demo/posts";
import { demoProfiles } from "@/lib/data/demo/profiles";

function keys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("bilingual interface", () => {
  it("Arabic and English dictionaries have identical keys", () => {
    expect(keys(en).sort()).toEqual(keys(ar).sort());
  });

  it("placeholders match between languages", () => {
    const flat = (o: unknown, p = ""): Array<[string, string]> =>
      typeof o === "string"
        ? [[p, o]]
        : Array.isArray(o)
          ? []
          : Object.entries(o as object).flatMap(([k, v]) => flat(v, p ? `${p}.${k}` : k));
    const enMap = new Map(flat(en));
    for (const [k, v] of flat(ar)) {
      const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      expect(vars(enMap.get(k)!), k).toBe(vars(v));
    }
  });

  it("every topic has Arabic and English names", () => {
    for (const t of topics) {
      expect(t.name.ar.trim()).not.toBe("");
      expect(t.name.en.trim()).not.toBe("");
    }
  });

  it("switches locale while keeping the path", () => {
    expect(switchLocalePath("/ar/topics/nutrition", "en")).toBe("/en/topics/nutrition");
    expect(switchLocalePath("/en", "ar")).toBe("/ar");
    expect(fmt("{n} / {max}", { n: 3, max: 10 })).toBe("3 / 10");
  });
});

describe("search", () => {
  const data = { posts: demoPosts, profiles: demoProfiles, topics };
  const visible = () => true;

  it("finds topics in both languages", () => {
    expect(search("تغذية", data, visible).topics.map((t) => t.slug)).toContain("nutrition");
    expect(search("nutrition", data, visible).topics.map((t) => t.slug)).toContain("nutrition");
  });

  it("finds creators by name or username", () => {
    expect(search("@sara.pharm", data, visible).profiles.map((p) => p.id)).toContain("p-sara");
    expect(search("Omar", data, visible).profiles.map((p) => p.id)).toContain("p-omar");
  });

  it("respects the visibility filter", () => {
    expect(search("herbal", data, (p) => p.moderation.status === "published").posts).toHaveLength(0);
  });
});
