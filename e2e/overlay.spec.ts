import { test, expect } from "@playwright/test";

test.describe("Overlay pages (OBS browser source)", () => {
  test("dossier ?demo=1 показує зразковий лоадаут без Twitch-з'єднання", async ({ page }) => {
    await page.goto("/overlay/dossier?demo=1");

    await expect(page.getByText("Random loadout")).toBeVisible();
    await expect(page.getByText("Weapons")).toBeVisible();
    await expect(page.getByText("Traits")).toBeVisible();
  });

  test("ticker ?demo=1 показує зразковий лоадаут", async ({ page }) => {
    await page.goto("/overlay/ticker?demo=1");
    await expect(page.getByText("Rolled loadout")).toBeVisible();
  });

  test("field ?demo=1 показує зразковий лоадаут", async ({ page }) => {
    await page.goto("/overlay/field?demo=1");
    await expect(page.getByText("@preview")).toBeVisible();
  });

  test("старий /overlay редіректить на /overlay/dossier", async ({ page }) => {
    await page.goto("/overlay");
    await expect(page).toHaveURL(/\/overlay\/dossier$/);
  });

  test("живий рол через /api/roll долітає в overlay-сторінку по WebSocket", async ({
    page,
    request
  }) => {
    // без ?demo=1 — сторінка чекає на push через /ws/overlay
    await page.goto("/overlay/field");

    const res = await request.post("/api/roll");
    const body = await res.json();
    expect(body.type).toBe("roll");

    await expect(page.getByText(`@${body.roller}`)).toBeVisible({ timeout: 10_000 });
  });
});
