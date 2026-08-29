import { test, expect } from "@playwright/test";
import { E2E_COACH_EMAIL, E2E_COACH_PASSWORD } from "./test-coach";

test("coach can sign in, see live sandbox prices, and open Paddle checkout", async ({ page }) => {
  await page.goto("/coach/login");

  // The form defaults to signup mode — switch to signin for our pre-created coach.
  await page.getByRole("button", { name: /already have an account/i }).click();
  await page.getByPlaceholder("Email").fill(E2E_COACH_EMAIL);
  await page.getByPlaceholder("Password").fill(E2E_COACH_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/coach$/, { timeout: 15_000 });

  await page.goto("/coach/pricing");
  await expect(page.getByTestId("pricing-cards")).toBeVisible();

  // Prices come from a live Paddle PricePreview call — wait for the
  // placeholder ("…") to resolve to a real formatted amount.
  const proPrice = page.getByTestId("price-pro");
  await expect(proPrice).not.toHaveText(/…/, { timeout: 15_000 });
  await expect(proPrice).not.toHaveText("—");
  const monthlyText = await proPrice.textContent();

  await page.getByTestId("frequency-year").click();
  await expect(proPrice).not.toHaveText(/…/, { timeout: 15_000 });
  const yearlyText = await proPrice.textContent();
  expect(yearlyText).not.toBe(monthlyText);

  await page.getByTestId("subscribe-pro").click();

  // Paddle renders the checkout overlay in an iframe hosted on its own domain.
  const checkoutFrame = page.locator('iframe[src*="paddle"]').first();
  await expect(checkoutFrame).toBeVisible({ timeout: 15_000 });
});
