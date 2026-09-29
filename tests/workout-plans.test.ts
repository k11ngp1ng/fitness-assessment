import assert from "node:assert/strict";
import test from "node:test";
import type { Exercise } from "../src/lib/workouts/domain";
import { buildPreviewPlan, type DraftPlan } from "../src/lib/workouts/plans";

const library: Exercise[] = [
  {
    id: "exercise-weight",
    name: "Exercício fictício com carga",
    variation: "Barra",
    equipment: "Barra livre",
    instructions: "Demonstração fictícia.",
    trackingMode: "weight-reps",
    loadConvention: "total",
    mediaId: null,
    archivedAt: null,
  },
  {
    id: "exercise-time",
    name: "Exercício fictício de duração",
    variation: "Solo",
    equipment: "Colchonete",
    instructions: "Outra demonstração fictícia.",
    trackingMode: "duration",
    loadConvention: null,
    mediaId: null,
    archivedAt: null,
  },
];

const draft: DraftPlan = {
  title: "  Rotina fictícia A  ",
  exercises: [
    {
      id: "planned-weight",
      exerciseId: "exercise-weight",
      notes: "  Movimentação controlada.  ",
      restSeconds: "90",
      sets: [
        {
          id: "warmup",
          kind: "warmup",
          target: "10",
          targetLoadKg: "",
        },
        { id: "work", kind: "work", target: "8", targetLoadKg: "12,5" },
      ],
    },
    {
      id: "planned-time",
      exerciseId: "exercise-time",
      notes: "",
      restSeconds: "0",
      sets: [{ id: "timed", kind: "work", target: "30", targetLoadKg: "" }],
    },
  ],
};

test("monta uma prévia com exercícios ordenados, metas e snapshot da biblioteca", () => {
  let next = 0;
  const editableLibrary = library.map((exercise) => ({ ...exercise }));
  const plan = buildPreviewPlan(
    draft,
    editableLibrary,
    () => `generated-${++next}`,
  );
  assert.equal(plan.title, "Rotina fictícia A");
  assert.equal(plan.publishedAt, null);
  assert.deepEqual(
    plan.exercises.map((exercise) => exercise.exerciseId),
    ["exercise-weight", "exercise-time"],
  );
  assert.equal(plan.exercises[0].restSeconds, 90);
  assert.equal(plan.exercises[0].notes, "Movimentação controlada.");
  assert.equal(plan.exercises[0].sets[1].targetLoadKg, 12.5);
  assert.equal(plan.exercises[1].sets[0].targetSeconds, 30);
  assert.equal(plan.exercises[1].sets[0].targetReps, null);
  editableLibrary[0].name = "Nome alterado depois";
  assert.equal(plan.exercises[0].name, "Exercício fictício com carga");
});

test("impede plano vazio, duplicatas e metas incompatíveis", () => {
  const make = (changed: DraftPlan) =>
    buildPreviewPlan(changed, library, () => "new-id");
  assert.throws(() => make({ title: "", exercises: draft.exercises }));
  assert.throws(() => make({ title: "A", exercises: [] }));
  assert.throws(() =>
    make({ ...draft, exercises: [draft.exercises[0], draft.exercises[0]] }),
  );
  assert.throws(() =>
    make({
      ...draft,
      exercises: [
        {
          ...draft.exercises[0],
          sets: [{ ...draft.exercises[0].sets[0], target: "0" }],
        },
      ],
    }),
  );
  assert.throws(() =>
    make({
      ...draft,
      exercises: [
        {
          ...draft.exercises[1],
          sets: [{ ...draft.exercises[1].sets[0], targetLoadKg: "10" }],
        },
      ],
    }),
  );
  assert.throws(() =>
    make({
      ...draft,
      exercises: [{ ...draft.exercises[0], restSeconds: "-1" }],
    }),
  );
});
