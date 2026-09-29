import assert from "node:assert/strict";
import test from "node:test";
import { formatBrasiliaTime } from "../src/lib/brasilia-time";

test("mostra a data de Brasília quando UTC já está no dia seguinte", () => {
  assert.deepEqual(formatBrasiliaTime(new Date("2026-09-30T01:02:03.000Z")), {
    date: "29/09/2026",
    time: "22:02:03",
  });
});
