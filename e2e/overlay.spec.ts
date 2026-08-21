import { test, expect } from "@playwright/test";

test.describe("Overlay page (OBS browser source)", () => {
  test("генерує і показує лоадаут одразу при завантаженні", async ({ page }) => {
    await page.goto("/overlay?price=300&rank=50&qm=0&slots=big,medium&tools=4&cons=4");

    await expect(page.getByText("HUNT LOADOUT")).toBeVisible();
    await expect(page.getByText("[R] reroll")).toBeVisible();
    await expect(page.getByText(/hunt \$$/)).toBeVisible();
  });

  test("рерольнить лоадаут при натисканні клавіші R", async ({ page }) => {
    await page.goto("/overlay?price=300&rank=50&qm=0&slots=big,medium&tools=4&cons=4");

    const costLocator = page.getByText(/hunt \$$/).last();
    await expect(costLocator).toBeVisible();
    const before = await costLocator.textContent();

    // Кілька рероллів, бо випадковий результат іноді може збігтися з попереднім.
    let changed = false;
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("r");
      const after = await costLocator.textContent();
      if (after !== before) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });
});
