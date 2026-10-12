import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

/** Interactions use the English UI for readable selectors; RTL has its own tests. */

const firstPostWith = (page: Page, text: string | RegExp) =>
  page.locator("main article").filter({ hasText: text }).first();

test.describe("Locale and layout", () => {
  test("unprefixed URL redirects by browser language", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "ar-JO" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await ctx.close();
    const ctxEn = await browser.newContext({ locale: "en-US" });
    const pageEn = await ctxEn.newPage();
    await pageEn.goto("/explore");
    await expect(pageEn).toHaveURL(/\/en\/explore$/);
    await ctxEn.close();
  });

  test("Arabic renders right-to-left and switching keeps the page", async ({ page }) => {
    await page.goto("/ar/explore");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { name: "المواضيع الصحية" })).toBeVisible();
    await page.getByRole("link", { name: "تغيير اللغة إلى الإنجليزية" }).first().click();
    await expect(page).toHaveURL(/\/en\/explore$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { name: "Health topics" })).toBeVisible();
    // The choice is remembered for unprefixed visits.
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("primary navigation reaches all five destinations", async ({ page, isMobile }) => {
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Main navigation" }).filter({ visible: true });
    for (const [name, url] of [
      ["Explore", /\/en\/explore$/],
      ["Communities", /\/en\/communities$/],
      ["Profile", /\/en\/profile$/],
      ["Home", /\/en$/],
    ] as const) {
      await nav.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
    await (isMobile ? nav.getByRole("link", { name: "Create" }) : page.getByRole("link", { name: "Create" }).first()).click();
    await expect(page).toHaveURL(/\/en\/create$/);
  });
});

test.describe("Journey A: new public user", () => {
  test("choose interests, follow a creator, watch a clip, save a post, see Following feed", async ({ page }) => {
    await page.goto("/en/onboarding");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Fitness" }).click();
    await page.getByRole("button", { name: "Nutrition" }).click();
    await expect(page.getByText("2 selected")).toBeVisible();
    await page.getByRole("button", { name: "Start browsing" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("main article").first()).toBeVisible();

    // Follow a verified creator from Explore.
    await page.goto("/en/explore");
    await page.getByRole("button", { name: "Follow Omar Khalil, RD" }).first().click();
    await expect(page.getByRole("button", { name: "Unfollow Omar Khalil, RD" }).first()).toBeVisible();

    // Watch a clip.
    await page.goto("/en/watch");
    await expect(page.getByRole("heading", { name: "Clips" })).toBeVisible();
    await expect(page.locator("video").first()).toBeAttached();
    await expect(page.getByText(/Clip 1 of \d+/)).toBeVisible();

    // Save a post.
    await page.goto("/en");
    const card = firstPostWith(page, "World Health Organization");
    await card.getByRole("button", { name: "Save" }).click();
    await expect(card.getByRole("button", { name: "Remove from saved" })).toBeVisible();

    // Saved shows privately on own profile; persists after reload.
    await page.goto("/en/profile");
    await page.reload();
    await page.getByRole("tab", { name: "Saved" }).click();
    await expect(page.getByText("Saved posts are private")).toBeVisible();
    await expect(firstPostWith(page, "World Health Organization")).toBeVisible();

    // Following feed now shows the followed creator, in time order.
    await page.goto("/en");
    await page.getByRole("tab", { name: "Following" }).click();
    const following = page.locator("main article");
    await expect(following.first()).toBeVisible();
    await expect(following.filter({ hasText: "Omar Khalil, RD" }).first()).toBeVisible();
  });
});

test.describe("Journey B: publish a personal experience", () => {
  test("write, attach photo, choose topic, preview, publish", async ({ page }) => {
    await page.goto("/en/create");
    await page.getByText("Personal experience", { exact: true }).click();
    await page.getByRole("textbox", { name: "Text", exact: true }).fill("My first week of evening walks. Personal experience, not advice.");
    await page.locator('input[type="file"][accept*="image"]').setInputFiles(path.join(__dirname, "fixtures/photo.jpg"));
    await page.getByPlaceholder("Image description for screen readers").fill("A mint-coloured square");
    await page.getByRole("button", { name: "Fitness" }).click();

    await page.getByRole("button", { name: "Preview" }).first().click();
    await expect(page.getByText("This is how your post will look")).toBeVisible();
    await expect(page.getByRole("img", { name: "A mint-coloured square" })).toBeVisible();

    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page).toHaveURL(/\/en\/post\/post-/);
    await expect(page.getByText("My first week of evening walks.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Post transparency: .*Personal experience/ })).toBeVisible();
    await expect(page.getByRole("img", { name: "A mint-coloured square" })).toBeVisible();

    // It appears on the author's profile, and survives a reload (device storage).
    await page.goto("/en/profile");
    await page.reload();
    await expect(page.getByText("My first week of evening walks.")).toBeVisible();
  });

  test("validates before publishing", async ({ page }) => {
    await page.goto("/en/create");
    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page.getByText("Fix the highlighted fields, then publish.")).toBeVisible();
    await expect(page.getByText("Write something before publishing.")).toBeVisible();
    await expect(page.getByText("Choose at least one topic.")).toBeVisible();
  });

  test("high-risk claims are held for review and not distributed", async ({ page }) => {
    await page.goto("/en/create");
    await page.getByRole("textbox", { name: "Text", exact: true }).fill("Stop taking your medication, this tea is a guaranteed cure.");
    await expect(page.getByText("This post will be reviewed")).toBeVisible();
    await page.getByRole("button", { name: "Medications and pharmacy" }).click();
    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page.getByText(/In review: your post is visible on your profile only/)).toBeVisible();

    await page.goto("/en");
    await expect(page.locator("main article").first()).toBeVisible();
    await expect(page.getByText("this tea is a guaranteed cure")).toHaveCount(0);
  });

  test("warns about identifying patient details", async ({ page }) => {
    await page.goto("/en/create");
    await page.getByRole("textbox", { name: "Text", exact: true }).fill("Patient name is Ahmad, call 0791234567");
    await expect(page.getByText("Your post may contain identifying details")).toBeVisible();
    await page.getByRole("button", { name: "General health" }).click();
    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page.getByText("Fix the highlighted fields, then publish.")).toBeVisible();
    await page.getByLabel(/I've checked and it contains no identifying details/).check();
    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page).toHaveURL(/\/en\/post\/post-/);
  });
});

test.describe("Journey D: checking health information", () => {
  test("credential details and per-post transparency are separate and explicit", async ({ page }) => {
    await page.goto("/en/post/post-activity-who");
    const card = page.locator("main").first();
    await card.getByRole("button", { name: /Credentials verified\. View credentials/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("What was checked")).toBeVisible();
    await expect(dialog.getByText("This is a fictional demo account")).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();

    await card.getByRole("button", { name: /Post transparency/ }).first().click();
    await expect(dialog.getByText("Physical activity — fact sheet")).toBeVisible();
    await expect(dialog.getByText("Demo review record, shown for illustration only.")).toBeVisible();
    await expect(dialog.getByText("We don't give posts an accuracy score.", { exact: false })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();

    // A verified author's other post is NOT labelled reviewed.
    await page.goto("/en/post/post-handwash-video");
    await expect(page.getByRole("button", { name: /Post transparency: .*Not reviewed/ })).toBeVisible();
  });
});

test.describe("Journey E: reporting", () => {
  test("report requires a reason and is saved", async ({ page }) => {
    await page.goto("/en/post/post-meal-prep");
    await page.getByRole("button", { name: "More options" }).first().click();
    await page.getByRole("menuitem", { name: "Report post" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Send report" }).click();
    await expect(dialog.getByText("Choose a reason to continue.")).toBeVisible();
    await dialog.getByText("Spam", { exact: true }).click();
    await dialog.getByRole("button", { name: "Send report" }).click();
    await expect(page.getByRole("status").getByText("Report sent")).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("projecth.demo.v1") ?? "{}").reports);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ postId: "post-meal-prep", reason: "spam" });
  });
});

test.describe("Video", () => {
  test("seeded clips actually play, with captions", async ({ page }) => {
    await page.goto("/en/post/post-desk-break");
    await page.getByRole("button", { name: "Play" }).first().click();
    const video = page.locator("main video").first();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 8000 })
      .toBeGreaterThan(0.3);
    expect(await video.evaluate((v: HTMLVideoElement) => v.textTracks[0]?.mode)).toBe("showing");
  });

  test("an uploaded short video is stored and plays back", async ({ page }) => {
    await page.goto("/en/create?type=video");
    await page.getByRole("textbox", { name: "Text", exact: true }).fill("My demo clip upload test");
    await page.locator('input[type="file"][accept*="video"]').setInputFiles(path.join(__dirname, "fixtures/clip.webm"));
    await expect(page.locator("form video")).toBeVisible();
    await page.getByRole("button", { name: "Fitness" }).click();
    await page.getByRole("button", { name: "Publish" }).first().click();
    await expect(page).toHaveURL(/\/en\/post\/post-/);
    await page.reload();
    await page.getByRole("button", { name: "Play" }).first().click();
    const video = page.locator("main video").first();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 8000 })
      .toBeGreaterThan(0.2);
  });
});

test.describe("Social interactions", () => {
  test("like, unlike and comment", async ({ page }) => {
    await page.goto("/en/post/post-pharmacy-question");
    const like = page.getByRole("button", { name: /^Like, 88 likes/ });
    await like.click();
    await expect(page.getByRole("button", { name: /^Unlike, 89 likes/ })).toBeVisible();
    await page.getByRole("button", { name: /^Unlike/ }).click();
    await expect(page.getByRole("button", { name: /^Like, 88 likes/ })).toBeVisible();

    await page.getByLabel("Write a comment…").fill("Thanks, very useful checklist idea.");
    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByText("Thanks, very useful checklist idea.")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Thanks, very useful checklist idea.")).toBeVisible();
  });

  test("blocking hides an author's posts and comments", async ({ page }) => {
    await page.goto("/en/u/karim.k");
    await page.getByRole("button", { name: "Account options" }).click();
    await page.getByRole("menuitem", { name: "Block Karim" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Block", exact: true }).click();
    await expect(page.getByText("You've blocked this account.")).toBeVisible();

    await page.goto("/en/post/post-activity-who");
    await expect(page.getByText("Does the time have to be in one block")).toHaveCount(0);
    await page.goto("/en/topics/medications");
    await expect(page.getByRole("main").getByText("What do you usually ask your pharmacist")).toHaveCount(0);

    await page.goto("/en/settings");
    await page.getByRole("button", { name: "Unblock" }).click();
    await page.goto("/en/topics/medications");
    await expect(page.getByRole("main").getByText("What do you usually ask your pharmacist")).toBeVisible();
  });

  test("restricted content stays behind a notice and out of feeds", async ({ page }) => {
    await page.goto("/en/u/natural.cure.demo");
    await expect(page.getByText("Restricted content", { exact: true })).toBeVisible();
    await expect(page.getByText("guaranteed cure!")).toHaveCount(0);
    await page.getByRole("button", { name: "Show content anyway" }).click();
    await expect(page.getByText("guaranteed cure!", { exact: false })).toBeVisible();
    await page.goto("/en/explore?q=herbal");
    await expect(page.getByText("No results for")).toBeVisible();
  });

  test("search finds topics, people and posts", async ({ page }) => {
    await page.goto("/en/explore?q=pharmac");
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "سارة النجار" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
  });
});
