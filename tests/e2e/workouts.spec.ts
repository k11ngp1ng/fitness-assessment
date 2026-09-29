import { expect, test } from "@playwright/test";

test("monta dois exercícios, registra séries e compara cada exercício com a execução anterior", async ({
  page,
}) => {
  await page.goto("/treinos");
  await expect(
    page.getByRole("heading", { name: "Biblioteca vazia" }),
  ).toBeVisible();
  await expect(page.getByText(/somem ao recarregar/)).toBeVisible();

  await page
    .getByLabel("Nome do exercício")
    .fill("Exercício fictício com carga");
  await page.getByLabel("Equipamento").fill("Barra fictícia");
  await page
    .getByLabel("Como executar")
    .fill("Movimento fictício de demonstração.");
  await page.getByRole("button", { name: "Criar exercício" }).click();

  await page
    .getByLabel("Nome do exercício")
    .fill("Exercício fictício de duração");
  await page.getByLabel("Tipo de registro").selectOption("duration");
  await page.getByRole("button", { name: "Criar exercício" }).click();

  await page.getByLabel("Nome do treino").fill("Rotina fictícia A");
  await page.getByLabel("Cliente fictício").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Adicionar ao treino" }).click();
  const durationDraft = page
    .locator(".workout-draft-exercise")
    .filter({ hasText: "Exercício fictício de duração" });
  await durationDraft.getByLabel("Meta (segundos)").fill("30");

  await page
    .getByLabel("Exercício da biblioteca")
    .selectOption({ label: "Exercício fictício com carga" });
  await page.getByRole("button", { name: "Adicionar ao treino" }).click();
  const weightDraft = page
    .locator(".workout-draft-exercise")
    .filter({ hasText: "Exercício fictício com carga" });
  await weightDraft.getByLabel("Meta (repetições)").fill("8");
  await weightDraft.getByLabel("Meta de carga (kg, opcional)").fill("12,5");
  await weightDraft
    .getByRole("button", {
      name: "Adicionar série a Exercício fictício com carga",
    })
    .click();
  await weightDraft.getByLabel("Meta (repetições)").nth(1).fill("6");
  await weightDraft.getByLabel("Descanso entre séries (segundos)").fill("90");
  await page
    .getByRole("button", {
      name: "Mover Exercício fictício com carga para cima",
    })
    .click();
  await expect(page.locator(".workout-draft-exercise h3")).toHaveText([
    "Exercício fictício com carga",
    "Exercício fictício de duração",
  ]);
  await page.getByRole("button", { name: "Preparar prévia do treino" }).click();
  await expect(page.getByText("2 exercício(s) · 3 série(s)")).toBeVisible();
  await page.getByRole("button", { name: "Iniciar treino" }).click();

  const weightTracker = page
    .locator(".workout-tracker-exercise")
    .filter({ hasText: "Exercício fictício com carga" });
  const durationTracker = page
    .locator(".workout-tracker-exercise")
    .filter({ hasText: "Exercício fictício de duração" });
  await expect(weightTracker.locator(".workout-set").first()).toContainText(
    "Sem registro anterior",
  );
  await weightTracker
    .locator(".workout-set")
    .first()
    .getByLabel("Carga total (kg)")
    .fill("12,5");
  await weightTracker
    .locator(".workout-set")
    .first()
    .getByLabel("Repetições")
    .fill("8");
  await weightTracker
    .locator(".workout-set")
    .first()
    .getByRole("button", { name: "Registrar série" })
    .click();
  await durationTracker.getByLabel("Duração (segundos)").fill("30");
  await durationTracker
    .getByRole("button", { name: "Registrar série" })
    .click();
  await page.getByRole("button", { name: "Concluir treino nesta aba" }).click();
  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await expect(weightTracker.locator(".workout-set").first()).toContainText(
    "12,5 kg · 8 repetições",
  );
  await expect(durationTracker.locator(".workout-set").first()).toContainText(
    "30 segundos",
  );
  await expect(weightTracker.locator(".workout-set").nth(1)).toContainText(
    "Sem registro anterior",
  );

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Biblioteca vazia" }),
  ).toBeVisible();
  await expect(page.getByText(/somem ao recarregar/)).toBeVisible();
});

test("construtor cabe no celular e tablet sem rolagem horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/treinos");
  await page.getByLabel("Nome do exercício").fill("Exercício fictício");
  await page.getByRole("button", { name: "Criar exercício" }).click();
  await page.getByRole("button", { name: "Adicionar ao treino" }).click();
  await expect(
    page.getByRole("heading", { name: "Montar treino" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  for (const width of [820, 1180]) {
    await page.setViewportSize({ width, height: 820 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});
