import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /never lose a deal to/i })
    ).toBeVisible();
    await expect(
      page.getByText("Silent Decay.", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /sign up/i }).first()
    ).toBeVisible();
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^pricing$/i }).first().click();
    await expect(page.locator("#pricing")).toBeVisible();

    await page.goto("/#features");
    await expect(page.locator("#features")).toBeVisible();
  });
});
