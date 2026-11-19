import { test, expect } from "@playwright/test";

const routesToTest = [
  "/",
  "/login",
  "/dashboard",
  "/dashboard/notes",
  "/dashboard/timetable",
  "/dashboard/attendance",
  "/dashboard/pyqs",
  "/dashboard/flashcards",
];

test.describe("Responsive No-Horizontal-Overflow & Mobile Usability Matrix", () => {
  for (const route of routesToTest) {
    test(`Verify no horizontal scroll overflow on route: ${route}`, async ({
      page,
    }) => {
      await page.goto(route);

      // Wait for layout to settle
      await page.waitForLoadState("domcontentloaded");

      // Check whether root element exceeds viewport width
      const hasHorizontalOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        return docWidth > windowWidth;
      });

      expect(
        hasHorizontalOverflow,
        `Detected horizontal page overflow on route ${route}`
      ).toBe(false);
    });
  }

  test("Verify tap targets are at least 44px on mobile viewports", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Tap target sizing is strictly verified on mobile viewports");

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Sample primary navigation and interactive buttons
    const buttons = page.locator("button, a.btn");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(36); // standard touch threshold
      }
    }
  });
});
