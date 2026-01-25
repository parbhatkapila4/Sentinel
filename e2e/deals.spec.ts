import { test, expect } from "@playwright/test";

test.describe("Deal management", () => {
  test.skip("deals page shows empty state for new user", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.getByText("No deals yet")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /create your first deal/i })
    ).toBeVisible();
  });

  test.skip("can navigate to new deal page", async ({ page }) => {
    await page.goto("/deals");
    await page.getByRole("link", { name: /new deal/i }).first().click();
    await expect(page).toHaveURL(/\/deals\/new/);
    await expect(
      page.getByLabel(/name|deal name/i).or(page.getByPlaceholder(/name|deal/i))
    ).toBeVisible();
    await expect(page.getByText(/stage|value/i).first()).toBeVisible();
  });
});
