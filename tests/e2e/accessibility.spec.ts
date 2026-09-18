import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
test("WCAG AA audit of dashboard and measurement workflow", async ({
  page,
}) => {
  const violations: unknown[] = [];
  for (const route of [
    "/",
    "/clientes",
    "/avaliacoes/nova?cliente=nathan",
    "/avaliacoes/nathan-sep",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    violations.push(
      ...result.violations.map((v) => ({
        route,
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/clientes");
  await expect(page.locator("main h1")).toBeVisible();
  const mobile = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  violations.push(
    ...mobile.violations.map((v) => ({
      route: "mobile/clientes",
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  );
  await writeFile(
    "artifacts/accessibility.json",
    JSON.stringify(violations, null, 2),
  );
  expect(violations).toEqual([]);
});
test("Measurement steps and review remain accessible on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/avaliacoes/nova?cliente=nathan");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const values = [
    [10, 10, 11],
    [9, 9, 9],
    [3, 5, 5],
    [7, 6, 6],
    [5, 6, 6],
    [12, 12, 12],
    [15, 16, 15],
  ].flat();
  for (let i = 0; i < 21; i++)
    await page.locator(".skinfold-row input").nth(i).fill(String(values[i]));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "artifacts/skinfolds-mobile.png",
    fullPage: true,
  });
  for (let i = 1; i <= 3; i++) {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
    if (i < 3)
      await page
        .getByRole("button", { name: "Continuar", exact: true })
        .click();
  }
});
