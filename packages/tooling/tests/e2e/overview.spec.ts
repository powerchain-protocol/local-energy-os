import { test, expect } from "@playwright/test";
test("enterprise overview is accessible and responsive", async ({page})=>{await page.goto("/overview");await expect(page.getByRole("heading",{name:"Enterprise overview"})).toBeVisible();await expect(page.getByText("Live telemetry")).toBeVisible();});
