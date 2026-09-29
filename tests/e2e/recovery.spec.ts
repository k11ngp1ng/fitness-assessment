import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("conteúdo inválido permanece intacto após navegar, recarregar e baixar", async ({
  page,
}) => {
  for (const original of ["{corrompido", "{}", '{"version":99}']) {
    await page.goto("/");
    await page.evaluate(
      (value) => localStorage.setItem("vertice:v1", value),
      original,
    );
    await page.goto("/avaliacoes/nova/?cliente=nathan");
    await expect(
      page.getByRole("heading", { name: "Recuperar dados locais" }),
    ).toBeFocused();
    await expect(page.getByLabel("Peso corporal")).toHaveCount(0);
    await page.getByRole("link", { name: "Clientes", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Novo cliente", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Recarregar dados salvos" }).click();
    await page.reload();
    expect(await page.evaluate(() => localStorage.getItem("vertice:v1"))).toBe(
      original,
    );
    const downloading = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Baixar conteúdo original" })
      .click();
    const download = await downloading;
    expect(await readFile((await download.path())!, "utf8")).toBe(original);
  }
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({ path: "tmp/recovery-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "tmp/recovery-mobile.png", fullPage: true });
});

test("reinicialização exige confirmação e preserva uma cópia antes de desbloquear", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("vertice:v1", "{original"));
  await page.reload();
  const reset = page.getByRole("button", {
    name: "Preservar cópia e reinicializar",
  });
  await expect(reset).toBeDisabled();
  await page.getByRole("checkbox").check();
  await reset.click();
  await expect(
    page.getByRole("heading", { name: "O próximo nível começa aqui." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((k) => k.startsWith("vertice:v1:recovery:"))
        .map((k) => localStorage.getItem(k)),
    ),
  ).toEqual(["{original"]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recuperar dados locais" }),
  ).toHaveCount(0);
});

test("falha de cópia mantém bloqueio; dados restaurados podem ser relidos", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("vertice:v1", "{original"));
  await page.reload();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
  });
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Preservar cópia e reinicializar" })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível reinicializar" }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("vertice:v1"))).toBe(
    "{original",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recuperar dados locais" }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "vertice:v1",
      JSON.stringify({ clients: [], assessments: [], drafts: {} }),
    ),
  );
  await page.getByRole("button", { name: "Recarregar dados salvos" }).click();
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await expect(page.getByText("Nenhum cliente encontrado")).toBeVisible();
});

test("mudança em outra aba bloqueia o formulário aberto", async ({
  page,
  context,
}) => {
  await page.goto("/avaliacoes/nova/?cliente=nathan");
  await expect(page.getByLabel("Peso corporal")).toBeVisible();
  const other = await context.newPage();
  await other.goto("/");
  await other.evaluate(() => localStorage.setItem("vertice:v1", "{outra aba"));
  await expect(
    page.getByRole("heading", { name: "Recuperar dados locais" }),
  ).toBeVisible();
  await expect(page.getByLabel("Peso corporal")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("vertice:v1"))).toBe(
    "{outra aba",
  );
});
