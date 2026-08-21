import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Home page — randomizer", () => {
  test("завантажує головну сторінку з заголовком і кнопкою генерації", async ({
    page
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page.getByText("Hunt: Showdown 1896 — randomizer")).toBeVisible();
    await expect(home.generateButton).toBeVisible();
  });

  test("генерує лоадаут при натисканні на generate", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // до генерації слоти порожні (порожні weapon-картки не містять кнопки reroll активними, але самі кнопки вже є)
    await home.generate();

    // після генерації в кожному weapon-слоті з'являється кнопка lock/reroll/ban
    await expect(home.lockButtons.first()).toBeVisible();
    await expect(home.rerollButtons.first()).toBeVisible();
  });

  test("лок слота вимикає кнопку reroll для цього слота", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.generate();

    const firstLock = home.lockButtons.first();
    const firstReroll = home.rerollButtons.first();

    await expect(firstReroll).toBeEnabled();
    await firstLock.click();
    await expect(firstReroll).toBeDisabled();
  });

  test("копіює share-посилання в буфер обміну", async ({ page, context, browserName }) => {
    // grantPermissions(["clipboard-read", "clipboard-write"]) підтримується лише в Chromium,
    // тому для крос-браузерної перевірки підміняємо navigator.clipboard.writeText
    // і зчитуємо, що саме туди записав застосунок — це працює однаково в усіх браузерах.
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

    const home = new HomePage(page);
    await home.goto();
    await home.generate();

    const shareButton = page.getByRole("button", { name: "share" });
    await shareButton.click();

    await expect(page.getByRole("button", { name: "copied" })).toBeVisible();

    const clipboardText = await page.evaluate(() => (window as any).__copiedText as string);
    expect(clipboardText).toContain(page.url().split("?")[0]);
  });
});
