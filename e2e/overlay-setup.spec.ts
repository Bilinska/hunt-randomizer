import { test, expect } from "@playwright/test";

test.describe("Overlay setup page (Bayou Roulette control panel)", () => {
  test("показує заголовок, статус підключення і command pills", async ({ page }) => {
    await page.goto("/overlay-setup");

    await expect(
      page.getByRole("heading", {
        name: "Bayou Roulette — loadout randomizer for Hunt: Showdown 1896"
      })
    ).toBeVisible();
    await expect(page.getByText("Not connected")).toBeVisible();
    await expect(page.getByText("!loadout", { exact: true })).toBeVisible();
    await expect(page.getByText("!loadout reroll", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "connect twitch" })).toBeVisible();
  });

  test("показує три варіанти лейауту з посиланнями на OBS url", async ({ page }) => {
    await page.goto("/overlay-setup");

    await expect(page.getByText("Dossier — left rail")).toBeVisible();
    await expect(page.getByText("Ticker — lower third")).toBeVisible();
    await expect(page.getByText("Field card — corner")).toBeVisible();
    await expect(page.getByRole("button", { name: "copy OBS url" })).toHaveCount(3);
  });

  test("копіює OBS url потрібного лейауту в буфер обміну", async ({
    page,
    context,
    browserName
  }) => {
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

    const tickerCard = page.getByTestId("layout-card-ticker");
    await tickerCard.getByRole("button", { name: "copy OBS url" }).click();
    await expect(tickerCard.getByRole("button", { name: "copied" })).toBeVisible();

    const clipboardText = await page.evaluate(() => (window as any).__copiedText as string);
    expect(clipboardText).toContain("/overlay/ticker");
  });

  test("зберігає налаштування через /api/settings", async ({ page }) => {
    await page.goto("/overlay-setup");

    const cooldownInput = page.locator("input[type='number']").first();
    await cooldownInput.fill("42");
    await cooldownInput.blur();

    await expect
      .poll(async () => {
        const res = await page.request.get("/api/settings");
        const body = await res.json();
        return body.cooldownSec;
      })
      .toBe(42);

    // повертаємо дефолт, щоб не впливати на інші тести цього прогону
    await cooldownInput.fill("90");
    await cooldownInput.blur();
    await expect
      .poll(async () => {
        const res = await page.request.get("/api/settings");
        return (await res.json()).cooldownSec;
      })
      .toBe(90);
  });
});
