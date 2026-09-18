import { test, expect } from "@playwright/test";
test("Invalid draft remains visible after reload instead of resetting all data", async ({
  page,
}) => {
  await page.goto("/avaliacoes/nova?cliente=nathan");
  await page.getByLabel("Idade na avaliação").fill("-1");
  await expect(page.locator(".autosave")).toContainText("Rascunho salvo");
  await page.reload();
  await expect(page.getByLabel("Idade na avaliação")).toHaveValue("-1");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "18 a 61",
  );
  await page.goto("/clientes");
  await expect(
    page.getByRole("heading", { name: "Nathan Demo", exact: true }),
  ).toBeVisible();
});
test("Storage failure is reported without falsely promising a saved draft", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/avaliacoes/nova?cliente=nathan");
  await page.getByLabel("Peso corporal").fill("83");
  await expect(page.locator(".storage-alert")).toContainText(
    "apenas nesta sessão",
  );
  await expect(page.locator(".autosave")).toContainText(
    "Salvo apenas na sessão",
  );
});
