import {
  CIRCUMFERENCES,
  SITES,
  type Assessment,
  type SkinfoldMeasurement,
} from "@/types";
import { average, safeResult } from "@/lib/calculations";
export const parseDecimal = (v: string): number | null => {
  if (!v.trim()) return null;
  const s = v.trim().replace(",", ".");
  return /^\d+(\.\d*)?$/.test(s) && Number.isFinite(Number(s))
    ? Number(s)
    : NaN;
};
export function variation(m: SkinfoldMeasurement): string | null {
  const mean = average(m);
  if (mean === null) return null;
  const range =
    Math.max(...(m.readings as number[])) -
    Math.min(...(m.readings as number[]));
  if ((m.readings as number[]).some((v) => v > 60))
    return "Valor incomum. Confirme a leitura em mm.";
  return range > Math.max(2, mean * 0.15)
    ? "Variação elevada. Considere medir novamente."
    : null;
}
export function errors(a: Assessment, step: number): string[] {
  const e: string[] = [];
  if (step === 0 || step === 3) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(a.date) ||
      Number.isNaN(Date.parse(a.date)) ||
      new Date(a.date).toISOString().slice(0, 10) !== a.date
    )
      e.push("Informe uma data válida.");
    if (!Number.isFinite(a.weight) || a.weight <= 0)
      e.push("O peso deve ser maior que zero.");
    if (!Number.isFinite(a.height) || a.height <= 0)
      e.push("A altura deve ser maior que zero.");
    if (
      a.sex !== "male" ||
      !Number.isInteger(a.age) ||
      a.age < 18 ||
      a.age > 61
    )
      e.push(
        "Este protocolo atende homens de 18 a 61 anos. Outros protocolos estarão disponíveis futuramente.",
      );
  }
  if (step === 1 || step === 3) {
    if (
      SITES.some((site) => {
        const m = a.skinfolds.find((s) => s.site === site);
        return !m || average(m) === null;
      })
    )
      e.push(
        "Preencha as 21 leituras das dobras com números maiores que zero.",
      );
    else if (!safeResult(a))
      e.push(
        "Não foi possível estimar a composição. Revise os dados e as dobras.",
      );
  }
  if (step === 2 || step === 3) {
    if (
      CIRCUMFERENCES.some(
        (k) =>
          a.circumferences[k] !== null &&
          (!Number.isFinite(a.circumferences[k]) || a.circumferences[k]! <= 0),
      )
    )
      e.push(
        "As medidas de perimetria devem ser positivas ou ficar em branco.",
      );
  }
  return e;
}
export function warnings(a: Assessment): string[] {
  const w = a.skinfolds.map((m) => variation(m)).filter(Boolean) as string[];
  const result = safeResult(a);
  // JP1978 Table 1: sum of 7 skinfolds in the development sample, 32–272 mm.
  if (result && (result.sum < 32 || result.sum > 272))
    w.push(
      "Soma fora da faixa da amostra original (32–272 mm). Interprete a estimativa com cautela.",
    );
  if (a.weight < 35 || a.weight > 250)
    w.push("Peso incomum: confirme a unidade em kg.");
  if (a.height < 1.3 || a.height > 2.2)
    w.push("Altura incomum: confirme a unidade em metros.");
  if (
    CIRCUMFERENCES.some(
      (k) =>
        a.circumferences[k] !== null &&
        (a.circumferences[k]! < 10 || a.circumferences[k]! > 200),
    )
  )
    w.push("Há perímetros incomuns. Confirme as unidades em cm.");
  const missing = CIRCUMFERENCES.filter(
    (k) => a.circumferences[k] === null,
  ).length;
  if (missing)
    w.push(
      `${missing} perímetros não registrados; serão exibidos como ausentes.`,
    );
  return [...new Set(w)];
}
