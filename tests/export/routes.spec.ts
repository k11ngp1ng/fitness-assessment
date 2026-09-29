import { test, expect } from "@playwright/test";

test("novos registros abrem diretamente e recarregam na exportação", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("./clientes/");
  await page.getByRole("button", { name: "Novo cliente", exact: true }).click();
  await page.getByLabel("Nome completo").fill("Cliente Exportação Demo");
  await page
    .getByRole("button", { name: "Criar cliente", exact: true })
    .click();
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", {
        name: "Cliente Exportação Demo",
        exact: true,
      }),
    })
    .click();
  await expect(page.getByText("Toda evolução tem um começo.")).toBeVisible();
  const clientUrl = page.url();
  expect(new URL(clientUrl).pathname.endsWith("/clientes/perfil/")).toBe(true);
  await page.reload();
  await expect(page.getByText("Toda evolução tem um começo.")).toBeVisible();
  await page
    .locator(".profile-actions")
    .getByRole("link", { name: "Nova avaliação", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const inputs = page.locator(".skinfold-row input");
  for (let i = 0; i < 21; i++) await inputs.nth(i).fill("10");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("button", { name: "Finalizar avaliação", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado da avaliação." }),
  ).toBeVisible();
  const resultUrl = page.url();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Resultado da avaliação." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver relatório" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu corpo. Sua trajetória." }),
  ).toBeVisible();
  const reportUrl = page.url();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seu corpo. Sua trajetória." }),
  ).toBeVisible();
  const direct = await context.newPage();
  for (const [url, heading] of [
    [clientUrl, "Cliente Exportação Demo"],
    [resultUrl, "Resultado da avaliação."],
    [reportUrl, "Seu corpo. Sua trajetória."],
  ]) {
    const response = await direct.goto(url);
    expect(response?.status()).toBe(200);
    await expect(
      direct.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
  await direct.close();
  // Lists and the report's return link must all resolve the new IDs.
  await page.getByRole("link", { name: /Jornada de/ }).click();
  await expect(
    page.getByRole("heading", { name: "Cliente Exportação Demo", exact: true }),
  ).toBeVisible();
  for (const route of ["./avaliacoes/", "./relatorios/"]) {
    await page.goto(route);
    await page
      .locator(".table-row")
      .filter({ hasText: "Cliente Exportação Demo" })
      .click();
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get("id") ===
        new URL(resultUrl).searchParams.get("id"),
    );
  }
  expect(errors).toEqual([]);
});

test("endereços incompletos, desconhecidos e antigos", async ({
  page,
  request,
}) => {
  for (const [path, missing] of [
    ["clientes/perfil", "Cliente não encontrado"],
    ["avaliacoes/resultado", "Avaliação não encontrada"],
    ["relatorios/visualizar", "Avaliação não encontrada"],
  ]) {
    for (const query of ["", "?id=", "?id=a&id=b"]) {
      await page.goto(`./${path}/${query}`);
      await expect(
        page.getByText("Registro não informado", { exact: true }),
      ).toBeVisible();
    }
    await page.goto(`./${path}/?id=inexistente`);
    await expect(page.getByText(missing, { exact: true })).toBeVisible();
  }
  for (const route of [
    "clientes/nathan/",
    "avaliacoes/nathan-sep/",
    "relatorios/nathan-sep/",
  ]) {
    expect((await page.goto(`./${route}`))?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect((await request.get("./arquivo-que-nao-existe/")).status()).toBe(404);
});

test("cadastro novo pode ser editado, arquivado e restaurado após recarregar", async ({
  page,
  context,
}) => {
  await page.goto("./clientes/");
  await page.getByRole("button", { name: "Novo cliente", exact: true }).click();
  await page.getByLabel("Nome completo").fill("Cliente Arquivo Demo");
  await page.getByRole("button", { name: "Criar cliente" }).click();
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", { name: "Cliente Arquivo Demo" }),
    })
    .click();
  await expect(page).toHaveURL((url) => url.searchParams.has("id"));
  const profileUrl = page.url();
  await page.getByRole("button", { name: "Editar cadastro" }).click();
  const editor = page.getByRole("dialog", { name: "Editar cadastro" });
  await editor.getByLabel("Nome completo").fill("Cliente Arquivo Revisado");
  await editor.getByRole("button", { name: "Salvar alterações" }).click();
  await page.getByRole("button", { name: "Arquivar cliente" }).click();
  await page.getByRole("button", { name: "Confirmar arquivamento" }).click();
  await page.reload();
  await expect(page.getByText(/Cliente arquivado em/)).toBeVisible();
  const direct = await context.newPage();
  expect((await direct.goto(profileUrl))?.status()).toBe(200);
  await expect(
    direct.getByRole("heading", { name: "Cliente Arquivo Revisado" }),
  ).toBeVisible();
  await direct.close();
  await page.getByRole("button", { name: "Restaurar cliente" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Arquivar cliente" }),
  ).toBeVisible();
});
