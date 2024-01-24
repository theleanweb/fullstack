import { test, expect } from "@playwright/test";

test.describe("Server SSR", () => {
  test("should render svelte to html", async ({ page }) => {
    await page.goto("/");
    const html = page.getByText("Home");
    console.log(html);
  });
});
