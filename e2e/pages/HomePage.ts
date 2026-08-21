import type { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly generateButton: Locator;
  readonly lockButtons: Locator;
  readonly rerollButtons: Locator;
  readonly banButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.generateButton = page.getByRole("button", { name: /generate loadout/i });
    this.lockButtons = page.getByRole("button", { name: "lock slot" });
    this.rerollButtons = page.getByRole("button", { name: "reroll slot" });
    this.banButtons = page.getByRole("button", { name: "ban item" });
  }

  async goto() {
    await this.page.goto("/");
  }

  async generate() {
    await this.generateButton.click();
  }
}
