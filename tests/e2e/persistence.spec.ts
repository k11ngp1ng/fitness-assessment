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

test("Client form stays open on write failure and retries without duplication", async ({
  page,
}) => {
  await page.goto("/clientes");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
    (window as Window & { restoreWrite?: () => void }).restoreWrite = () => {
      Storage.prototype.setItem = original;
    };
  });

  await page.getByRole("button", { name: "Novo cliente" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome completo").fill("Cliente Teste");
  await dialog.getByRole("button", { name: "Criar cliente" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText("apenas nesta sessão");
  await expect(page.locator(".storage-alert")).toContainText(
    "apenas nesta sessão",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("vertice:v1")),
  ).toBeNull();

  await page.evaluate(() =>
    (window as Window & { restoreWrite?: () => void }).restoreWrite?.(),
  );
  await dialog.getByRole("button", { name: "Criar cliente" }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(
    page.locator(".clients-grid").getByRole("heading", {
      name: "Cliente Teste",
    }),
  ).toHaveCount(1);
  expect(
    await page.evaluate(() => {
      const raw = localStorage.getItem("vertice:v1");
      if (!raw) return 0;
      const data = JSON.parse(raw) as { clients: { name: string }[] };
      return data.clients.filter((client) => client.name === "Cliente Teste")
        .length;
    }),
  ).toBe(1);
});
