import test from "node:test";
import assert from "node:assert/strict";
import { assessments } from "../src/data/seed";
import {
  average,
  calculate,
  compare,
  difference,
} from "../src/lib/calculations";
import { errors, parseDecimal, variation } from "../src/lib/validation";
import { historyFor } from "../src/lib/store";
const reference = assessments[0];
test("Same-day assessments use recording order, not random ID ordering", () => {
  const old = { ...reference, id: "z-old" },
    latest = { ...reference, id: "a-new", weight: 82 };
  assert.equal(historyFor([old, latest], reference.clientId)[0].id, "a-new");
});
test("Reference: seven means = 63 mm and Siri result matches screenshot", () => {
  const r = calculate(reference);
  assert.ok(Math.abs(r.sum - 63) < 1e-10);
  assert.ok(Math.abs(r.density - 1.08101338) < 1e-8);
  assert.ok(Math.abs(r.bodyFat - 7.9036755308) < 1e-8);
  assert.ok(Math.abs(r.fatMass + r.leanMass - 81.3) < 1e-10);
  assert.equal(Math.round(r.leanMass * 10) / 10, 74.9);
});
test("Decimal comma and dot, empty and invalid input", () => {
  assert.equal(parseDecimal("79,5"), 79.5);
  assert.equal(parseDecimal("79.5"), 79.5);
  assert.equal(parseDecimal(""), null);
  assert.ok(Number.isNaN(parseDecimal("-5")));
  assert.ok(Number.isNaN(parseDecimal("10abc")));
  assert.ok(Number.isNaN(parseDecimal("Infinity")));
});
test("Partial readings never generate a site mean", () => {
  assert.equal(average({ site: "chest", readings: [4, null, 5] }), null);
  assert.equal(average({ site: "chest", readings: [4, 5, 6] }), 5);
});
test("Unsupported demographics, missing/duplicate/invalid measurements rejected", () => {
  for (const changes of [
    { sex: "female" as const },
    { age: 17 },
    { age: 62 },
    { weight: -1 },
    { skinfolds: reference.skinfolds.slice(1) },
    { skinfolds: [reference.skinfolds[0], ...reference.skinfolds.slice(0, 6)] },
    {
      skinfolds: reference.skinfolds.map((s, i) =>
        i === 0
          ? { ...s, readings: [-1, 5, 6] as [number, number, number] }
          : s,
      ),
    },
  ])
    assert.throws(() => calculate({ ...reference, ...changes }));
});
test("High variation warns but remains calculable", () => {
  const a = {
    ...reference,
    skinfolds: reference.skinfolds.map((s, i) =>
      i === 0
        ? { ...s, readings: [10, 10, 18] as [number, number, number] }
        : s,
    ),
  };
  assert.ok(variation(a.skinfolds[0]));
  assert.deepEqual(errors(a, 1), []);
});
test("Historical ambiguous arm values remain unset", () => {
  assert.equal(reference.circumferences.rightRelaxed, null);
  assert.equal(reference.circumferences.rightContracted, null);
  assert.match(reference.historicalNote!, /não confirmada/);
  assert.equal(difference(null, 34), null);
  assert.equal(difference(56, 56), 0);
  assert.equal(difference(35, 34.5), 0.5);
});
test("Comparisons preserve sign and reject different clients", () => {
  const prev = assessments[1];
  const c = compare(reference, prev);
  assert.ok(Math.abs(c.weight - -0.8) < 1e-10);
  assert.equal(c.waist, -3);
  assert.ok(c.bodyFat < 0);
  assert.throws(() => compare(reference, { ...prev, clientId: "other" }));
});
test("Circumferences may be omitted but negative and nonfinite values cannot save", () => {
  assert.deepEqual(errors(reference, 3), []);
  assert.ok(
    errors(
      {
        ...reference,
        circumferences: { ...reference.circumferences, waist: -5 },
      },
      2,
    ).length,
  );
  assert.ok(
    errors(
      {
        ...reference,
        circumferences: { ...reference.circumferences, waist: NaN },
      },
      3,
    ).length,
  );
});
