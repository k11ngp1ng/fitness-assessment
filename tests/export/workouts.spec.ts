import { expect, test } from "@playwright/test";

test("treinos abre diretamente na exportação e permite criar exercício", async ({
  page,
}) => {
  await page.goto("treinos/");
  await expect(
    page.getByRole("heading", { name: "Tracker de treinos" }),
  ).toBeVisible();
  await page.getByLabel("Nome do exercício").fill("Exercício fictício");
  await page.getByRole("button", { name: "Criar exercício" }).click();
  await expect(
    page.getByText("Exercício criado somente nesta sessão do navegador."),
  ).toBeVisible();
  await page.getByLabel("Nome do treino").fill("Rotina fictícia");
  await page.getByLabel("Cliente fictício").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Adicionar ao treino" }).click();
  await page.getByLabel("Meta (repetições)").fill("8");
  await page.getByRole("button", { name: "Preparar prévia do treino" }).click();
  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await expect(page.getByText("Meta: 8 repetições")).toBeVisible();
});
