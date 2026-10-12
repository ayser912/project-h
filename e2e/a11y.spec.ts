import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Automated WCAG 2.1 A/AA scan of key screens in both languages. */
const pages = ["/ar", "/en", "/ar/explore", "/en/create", "/ar/u/dr.layan.demo", "/en/post/post-activity-who", "/ar/communities", "/en/settings"];

for (const url of pages) {
  test(`no serious accessibility violations on ${url}`, async ({ page }) => {
    await page.goto(url);
    await page.locator("main").first().waitFor();
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`),
    ).toEqual([]);
  });
}
