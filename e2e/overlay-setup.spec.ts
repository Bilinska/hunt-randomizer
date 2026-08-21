import { test, expect } from "@playwright/test";

test.describe("Overlay setup page", () => {
  test("показує заголовок і поля налаштувань", async ({ page }) => {
    await page.goto("/overlay-setup");

    await expect(
      page.getByRole("heading", { name: "налаштування OBS-оверлею" })
    ).toBeVisible();
    await expect(page.getByText("price limit, hunt $")).toBeVisible();
    await expect(page.getByText("rank", { exact: false })).toBeVisible();
    await expect(page.getByText("quartermaster")).toBeVisible();
  });

  test("оновлює URL оверлею при зміні price limit", async ({ page }) => {
    await page.goto("/overlay-setup");

    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.fill("150");

    const urlBox = page.locator("text=/overlay\\?/");
    await expect(urlBox).toContainText("price=150");
  });

  test("копіює overlay URL в буфер обміну", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/overlay-setup");

    const copyButton = page.getByRole("button", {
      name: "copy url for OBS browser source"
    });
    await copyButton.click();

    await expect(page.getByRole("button", { name: "copied" })).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("/overlay?");
  });
});
