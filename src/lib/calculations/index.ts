import {
  SITES,
  type Assessment,
  type AssessmentComparison,
  type BodyCompositionResult,
  type SkinfoldMeasurement,
} from "@/types";

export function average(m: SkinfoldMeasurement): number | null {
  return m.readings.length === 3 &&
    m.readings.every((v) => v !== null && Number.isFinite(v) && v > 0)
    ? (m.readings as number[]).reduce((a, b) => a + b, 0) / 3
    : null;
}
/** Jackson & Pollock (1978), Br J Nutr 40:497–504, DOI 10.1079/BJN19780152.
 * Seven-site male equation: D = 1.112 - .00043499*S + .00000055*S² - .00028826*age.
 * S is the sum of the seven site means in mm; D is g/mL. Male sample ages 18–61.
 * Siri (1961): fat percentage = 495/D - 450 (also cited in Table 1 of JP1978).
 * Fat mass = weight * percentage/100; fat-free mass = weight - fat mass.
 * No ethnicity/fitness adjustment. No rounding until presentation.
 * Source: https://www.kinantropo.org/_files/ugd/af7497_d8d71d5067184e93a90ae954a74c5c18.pdf
 * Coefficients cross-check: https://pmc.ncbi.nlm.nih.gov/articles/PMC4691302/ Table 1.
 */
function jp7(a: Assessment): BodyCompositionResult {
  if (a.sex !== "male" || !Number.isInteger(a.age) || a.age < 18 || a.age > 61)
    throw new Error("Protocolo disponível para homens de 18 a 61 anos.");
  if (!Number.isFinite(a.weight) || a.weight <= 0)
    throw new Error("Informe um peso válido.");
  if (
    a.skinfolds.length !== 7 ||
    new Set(a.skinfolds.map((s) => s.site)).size !== 7
  )
    throw new Error("Informe os sete locais de medição.");
  const means = SITES.map((site) => {
    const measurement = a.skinfolds.find((s) => s.site === site);
    return measurement ? average(measurement) : null;
  });
  if (means.some((v) => v === null))
    throw new Error(
      "Complete as três medidas de cada dobra com valores positivos.",
    );
  const sum = (means as number[]).reduce((s, v) => s + v, 0);
  const density =
    1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * a.age;
  const bodyFat = 495 / density - 450;
  if (
    !Number.isFinite(bodyFat) ||
    density <= 0 ||
    bodyFat <= 0 ||
    bodyFat >= 100
  )
    throw new Error("Medidas fora do intervalo calculável. Revise os valores.");
  const fatMass = (a.weight * bodyFat) / 100;
  return { sum, density, bodyFat, fatMass, leanMass: a.weight - fatMass };
}
export const protocols = {
  "jp7-male": { name: "Jackson & Pollock · 7 dobras", calculate: jp7 },
};
export const calculate = (a: Assessment) => protocols[a.protocol].calculate(a);
export function safeResult(a?: Assessment): BodyCompositionResult | null {
  try {
    return a ? calculate(a) : null;
  } catch {
    return null;
  }
}
export function compare(a: Assessment, b: Assessment): AssessmentComparison {
  if (a.clientId !== b.clientId || a.protocol !== b.protocol)
    throw new Error("Avaliações incompatíveis.");
  const current = calculate(a),
    previous = calculate(b);
  return {
    bodyFat: current.bodyFat - previous.bodyFat,
    leanMass: current.leanMass - previous.leanMass,
    weight: a.weight - b.weight,
    waist:
      a.circumferences.waist !== null && b.circumferences.waist !== null
        ? a.circumferences.waist - b.circumferences.waist
        : null,
  };
}
export const difference = (right: number | null, left: number | null) =>
  right === null || left === null ? null : Math.abs(right - left);
