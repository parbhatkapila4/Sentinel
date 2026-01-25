import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.skip("dashboard loads with metrics", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Revenue Impact")).toBeVisible();
    await expect(page.getByText("Data Accuracy")).toBeVisible();
    const chartsContainer = page.locator('canvas, [class*="recharts"]').first();
    await expect(chartsContainer).toBeVisible({ timeout: 10_000 });
  });
});
