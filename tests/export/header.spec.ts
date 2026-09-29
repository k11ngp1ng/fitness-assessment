import { expect, test } from "@playwright/test";

test("cabeçalho exibe e atualiza o horário de Brasília no celular", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./evolucao/");

  const clock = page.locator(".topbar-clock");
  await expect(clock).toBeVisible();
  await expect(clock).toContainText(/\d{2}\/\d{2}\/\d{4}/);
  await expect(clock).toContainText(/\d{2}:\d{2}:\d{2}/);

  const initial = await clock.textContent();
  await expect.poll(() => clock.textContent()).not.toBe(initial);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
