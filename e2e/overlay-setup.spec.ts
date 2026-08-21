import { test, expect } from "@playwright/test";

test.describe("Overlay setup page", () => {
    test("показує заголовок і поля налаштувань", async ({ page }) => {
    await page.goto("/overlay-setup");

    await expect(
      page.getByRole("heading", { name: "налаштування OBS-оверлею" })
    ).toBeVisible();
    await expect(page.getByText("price limit, hunt $")).toBeVisible();
    await expect(page.getByText("rank", { exact: true })).toBeVisible();
    await expect(page.getByText("quartermaster")).toBeVisible();
  });

   test("оновлює URL оверлею при зміні price limit", async ({ page }) => {
    await page.goto("/overlay-setup");

    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.click();
    await priceInput.fill(""); // очистити поточне значення
    await priceInput.pressSequentially("150", { delay: 20 });
    await priceInput.blur();

    // переконуємось, що React дійсно підхопив нове значення інпута
    await expect(priceInput).toHaveValue("150");

    const urlBox = page.locator("text=/overlay\\?/");
    await expect(urlBox).toContainText("price=150");
  });

   test("копіює overlay URL в буфер обміну", async ({ page, context, browserName }) => {
    // grantPermissions(["clipboard-read", "clipboard-write"]) підтримується лише в Chromium,
    // тому для крос-браузерної перевірки підміняємо navigator.clipboard.writeText.
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.addInitScript(() => {
      (window as any).__copiedText = null;
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: (text: string) => {
            (window as any).__copiedText = text;
            return Promise.resolve();
          },
          readText: () => Promise.resolve((window as any).__copiedText ?? "")
        }
      });
    });

    await page.goto("/overlay-setup");

    const copyButton = page.getByRole("button", {
      name: "copy url for OBS browser source"
    });
    await copyButton.click();

    await expect(page.getByRole("button", { name: "copied" })).toBeVisible();

    const clipboardText = await page.evaluate(() => (window as any).__copiedText as string);
    expect(clipboardText).toContain("/overlay?");
  });
});
