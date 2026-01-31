import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /never lose a deal to/i })
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText("Silent Decay.", { exact: true })
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("link", { name: /sign up/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/pricing/);
    const h1 = page.getByRole("heading", { level: 1, name: /pricing/i });
    await expect(h1).toBeVisible({ timeout: 25_000 });

    await page.goto("/#features", { waitUntil: "load" });
    await expect(page.locator("#features")).toBeVisible({ timeout: 25_000 });
  });
});
