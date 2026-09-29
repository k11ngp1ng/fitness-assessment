import { expect, test } from "@playwright/test";

test("edição preserva snapshots e arquivamento mantém histórico e permite restauração", async ({
  page,
}) => {
  await page.goto("/clientes/perfil/?id=nathan");
  await page.getByRole("button", { name: "Editar cadastro" }).click();
  const editor = page.getByRole("dialog", { name: "Editar cadastro" });
  await editor.getByLabel("Nome completo").fill("Nathan Atualizado");
  await editor.getByLabel("Idade").fill("21");
  await editor.getByLabel("Peso").fill("82");
  await editor.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(editor).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Nathan Atualizado" }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("vertice:v1")!),
  );
  expect(saved.version).toBe(2);
  expect(
    saved.clients.find((client: { id: string }) => client.id === "nathan").age,
  ).toBe(21);
  expect(
    saved.assessments.find(
      (assessment: { id: string }) => assessment.id === "nathan-sep",
    ).age,
  ).toBe(20);
  expect(
    saved.assessments.find(
      (assessment: { id: string }) => assessment.id === "nathan-sep",
    ).weight,
  ).toBe(81.3);

  await page.goto("/avaliacoes/nova/?cliente=nathan");
  await page.getByLabel("Peso corporal").fill("83");
  await expect(page.getByText("Rascunho salvo neste navegador")).toBeVisible();
  await page.goto("/clientes/perfil/?id=nathan");

  await page.getByRole("button", { name: "Arquivar cliente" }).click();
  await page
    .getByRole("dialog", { name: "Arquivar Nathan Atualizado?" })
    .getByRole("button", { name: "Confirmar arquivamento" })
    .click();
  await expect(page.getByText(/Cliente arquivado em/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Restaurar cliente" }),
  ).toBeFocused();
  await page.reload();
  await expect(page.getByText(/Cliente arquivado em/)).toBeVisible();
  expect(
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem("vertice:v1")!);
      return data.drafts.nathan.weight;
    }),
  ).toBe(83);
  await page.goto("/clientes/");
  await expect(
    page.getByRole("heading", { name: "Nathan Atualizado" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Arquivados/ }).click();
  await expect(
    page.getByRole("heading", { name: "Nathan Atualizado" }),
  ).toBeVisible();
  await page.goto("/avaliacoes/nova/?cliente=nathan");
  await expect(
    page.getByRole("heading", { name: "Cliente arquivado" }),
  ).toBeVisible();
  await page.goto("/avaliacoes/resultado/?id=nathan-sep");
  await expect(page.locator("main")).toContainText("20 anos");
  await page.goto("/clientes/perfil/?id=nathan");
  await page.getByRole("button", { name: "Restaurar cliente" }).click();
  await expect(page.getByText(/Cliente arquivado em/)).toHaveCount(0);
  await page.goto("/clientes/");
  await expect(
    page.getByRole("heading", { name: "Nathan Atualizado" }),
  ).toBeVisible();
  await page.goto("/avaliacoes/nova/?cliente=nathan");
  await expect(page.getByLabel("Peso corporal")).toHaveValue("83");
});

test("falha ao editar mantém o formulário aberto e não promete persistência", async ({
  page,
}) => {
  await page.goto("/clientes/perfil/?id=nathan");
  await page.getByRole("button", { name: "Editar cadastro" }).click();
  const editor = page.getByRole("dialog", { name: "Editar cadastro" });
  await editor.getByLabel("Nome completo").fill("Nathan Sem Gravação");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
  });
  await editor.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(editor).toBeVisible();
  await expect(editor.getByRole("alert")).toContainText("apenas nesta sessão");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Nathan Demo" }),
  ).toBeVisible();
});

test("falhas ao arquivar ou restaurar não apagam o estado salvo", async ({
  page,
}) => {
  await page.goto("/clientes/perfil/?id=nathan");
  await page.getByRole("button", { name: "Arquivar cliente" }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
  });
  const confirmation = page.getByRole("dialog", {
    name: "Arquivar Nathan Demo?",
  });
  await confirmation
    .getByRole("button", { name: "Confirmar arquivamento" })
    .click();
  await expect(confirmation.getByRole("alert")).toContainText(
    "apenas nesta sessão",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Arquivar cliente" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Arquivar cliente" }).click();
  await page
    .getByRole("dialog", { name: "Arquivar Nathan Demo?" })
    .getByRole("button", { name: "Confirmar arquivamento" })
    .click();
  await expect(
    page.getByRole("button", { name: "Restaurar cliente" }),
  ).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
  });
  await page.getByRole("button", { name: "Restaurar cliente" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "A alteração está apenas nesta sessão" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Restaurar cliente" }),
  ).toBeVisible();
});
