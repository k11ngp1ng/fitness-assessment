import { test, expect } from "@playwright/test";
test("Dashboard, profile, history, progress and report; mobile and print", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "O próximo nível começa aqui." }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });
  for (const route of [
    "/clientes",
    "/clientes/nathan",
    "/avaliacoes",
    "/evolucao",
    "/relatorios",
    "/avaliacoes/nathan-sep",
    "/relatorios/nathan-sep",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Algo interrompeu");
  }
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.getByText("Transparência no método")).toBeVisible();
  await page.pdf({
    path: "artifacts/relatorio-nathan.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/clientes",
    "/clientes/nathan",
    "/avaliacoes/nova?cliente=nathan",
    "/avaliacoes/nathan-sep",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/dashboard-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("Create client, complete assessment with decimals and keyboard, persist, compare and search", async ({
  page,
}) => {
  await page.goto("/clientes");
  await page.getByRole("button", { name: "Novo cliente", exact: true }).click();
  await page.getByLabel("Nome completo").fill("Cliente Teste");
  await page
    .getByRole("button", { name: "Criar cliente", exact: true })
    .click();
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", { name: "Cliente Teste", exact: true }),
    })
    .click();
  await expect(page.getByText("Toda evolução tem um começo.")).toBeVisible();
  await page
    .locator(".profile-actions")
    .getByRole("link", { name: "Nova avaliação", exact: true })
    .click();
  await page.getByLabel("Peso corporal").fill("81,3");
  await page.getByLabel("Altura", { exact: false }).fill("1,82");
  await page.getByLabel("Idade na avaliação").fill("20");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "21 leituras",
  );
  const readings = [
    [10, 10, 11],
    [9, 9, 9],
    [3, 5, 5],
    [7, 6, 6],
    [5, 6, 6],
    [12, 12, 12],
    [15, 16, 15],
  ];
  const inputs = page.locator(".skinfold-row input");
  await inputs.nth(0).fill("10");
  await inputs.nth(0).press("Enter");
  await expect(inputs.nth(1)).toBeFocused();
  for (let i = 0; i < 21; i++)
    await inputs.nth(i).fill(String(readings[Math.floor(i / 3)][i % 3]));
  await expect(page.locator(".sum-bar")).toContainText("63,0");
  await page.reload();
  await expect(page.locator(".sum-bar")).toContainText("63,0");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Cintura cm", exact: true })
    .fill("83");
  await page
    .getByRole("textbox", { name: "Abdômen cm", exact: true })
    .fill("79,5");
  await page
    .getByRole("textbox", { name: "Braço direito · relaxado cm", exact: true })
    .fill("34");
  await page
    .getByRole("textbox", { name: "Braço direito · contraído cm", exact: true })
    .fill("37");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByText("perímetros não registrados", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Editar dados", exact: true }).click();
  await expect(page.getByLabel("Peso corporal")).toHaveValue("81,3");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("button", { name: "Finalizar avaliação", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado da avaliação." }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("finalizada");
  await expect(page.locator(".metric-card").first()).toContainText("7,9");
  await page.reload();
  await expect(page.locator(".metric-card").first()).toContainText("7,9");
  await page.goto("/clientes");
  await page
    .getByRole("textbox", { name: "Buscar cliente..." })
    .fill("Inexistente");
  await expect(page.getByText("Nenhum cliente encontrado")).toBeVisible();
});
test("Protocol restrictions and comparison controls", async ({ page }) => {
  await page.goto("/avaliacoes/nova?cliente=ana");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "homens de 18 a 61",
  );
  await page.goto("/evolucao");
  await page
    .getByRole("button", { name: "Peso corporal", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: /Gráfico de Peso corporal/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "3 meses", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "3 meses", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Cliente em acompanhamento").selectOption("ana");
  await expect(page.getByText("Vamos construir um histórico")).toBeVisible();
});
