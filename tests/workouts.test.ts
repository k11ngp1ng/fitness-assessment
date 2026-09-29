import assert from "node:assert/strict";
import test from "node:test";
import {
  createSession,
  finishSession,
  previousExercise,
  previousSet,
  recordSet,
  type PerformedSet,
  type WorkoutPlanRevision,
} from "../src/lib/workouts/domain";

const plan: WorkoutPlanRevision = {
  id: "revision-a",
  templateId: "template-a",
  revision: 1,
  title: "Treino fictício A",
  publishedAt: "2026-09-01T12:00:00.000Z",
  exercises: [
    {
      id: "planned-a",
      exerciseId: "exercise-a",
      name: "Exercício fictício",
      variation: "Padrão",
      equipment: "Barra",
      trackingMode: "weight-reps",
      loadConvention: "total",
      mediaId: null,
      instructions: "Instruções fictícias.",
      notes: "",
      restSeconds: 60,
      sets: [
        {
          id: "warmup-a",
          kind: "warmup",
          targetReps: 10,
          targetSeconds: null,
          targetLoadKg: null,
        },
        {
          id: "work-a",
          kind: "work",
          targetReps: 8,
          targetSeconds: null,
          targetLoadKg: null,
        },
        {
          id: "work-b",
          kind: "work",
          targetReps: 8,
          targetSeconds: null,
          targetLoadKg: null,
        },
      ],
    },
  ],
};

function makeSet(overrides: Partial<PerformedSet> = {}): PerformedSet {
  return {
    id: "performed-a",
    plannedSetId: "work-a",
    kind: "work",
    position: 0,
    loadKg: 12.5,
    reps: 8,
    seconds: null,
    completedAt: "2026-09-02T12:01:00.000Z",
    recordedBy: "client",
    ...overrides,
  };
}

test("registra, corrige e finaliza sem modificar o plano", () => {
  const session = createSession(
    plan,
    { id: "assignment-a", clientId: "client-a", planRevisionId: plan.id },
    "session-a",
    "2026-09-02T12:00:00.000Z",
  );
  const recorded = recordSet(session, plan, "planned-a", makeSet());
  assert.equal(session.exercises[0].sets.length, 0);
  assert.equal(plan.exercises[0].sets[1].targetLoadKg, null);
  const corrected = recordSet(
    recorded,
    plan,
    "planned-a",
    makeSet({ loadKg: 14 }),
  );
  assert.equal(corrected.exercises[0].sets.length, 1);
  assert.equal(corrected.exercises[0].sets[0].loadKg, 14);
  const completed = finishSession(corrected, "2026-09-02T12:30:00.000Z");
  assert.equal(completed.status, "completed");
  assert.throws(() => recordSet(completed, plan, "planned-a", makeSet()));
});

test("rejeita dados incompatíveis, datas impossíveis e conclusão vazia", () => {
  assert.throws(() =>
    createSession(
      plan,
      { id: "a", clientId: "b", planRevisionId: plan.id },
      "s",
      "2026-02-30T12:00:00.000Z",
    ),
  );
  const session = createSession(
    plan,
    { id: "a", clientId: "b", planRevisionId: plan.id },
    "s",
    "2026-09-02T12:00:00.000Z",
  );
  assert.throws(() => finishSession(session, "2026-09-02T12:30:00.000Z"));
  assert.throws(() =>
    recordSet(session, plan, "planned-a", makeSet({ loadKg: Number.NaN })),
  );
  assert.throws(() =>
    recordSet(session, plan, "planned-a", makeSet({ reps: 0 })),
  );
  assert.throws(() =>
    recordSet(session, plan, "planned-a", makeSet({ position: 1 })),
  );
  assert.throws(() => recordSet(session, plan, "planned-missing", makeSet()));
  assert.throws(() =>
    recordSet(
      session,
      plan,
      "planned-a",
      makeSet({ completedAt: "2026-09-02T11:59:00.000Z" }),
    ),
  );
  const recorded = recordSet(session, plan, "planned-a", makeSet());
  assert.throws(() =>
    recordSet(
      recorded,
      plan,
      "planned-a",
      makeSet({ plannedSetId: "work-b", position: 1 }),
    ),
  );
});

test("mostra a última execução compatível do mesmo cliente, por tipo e posição", () => {
  const assignment = {
    id: "assignment-a",
    clientId: "client-a",
    planRevisionId: plan.id,
  };
  const first = createSession(
    plan,
    assignment,
    "session-1",
    "2026-09-02T12:00:00.000Z",
  );
  const withSecondSet = recordSet(
    first,
    plan,
    "planned-a",
    makeSet({
      id: "performed-b",
      plannedSetId: "work-b",
      position: 1,
      loadKg: 15,
    }),
  );
  const withFirstSet = recordSet(withSecondSet, plan, "planned-a", makeSet());
  const complete = finishSession(withFirstSet, "2026-09-02T12:30:00.000Z");
  const otherClient = {
    ...complete,
    id: "session-other",
    clientId: "client-other",
    completedAt: "2026-09-03T12:30:00.000Z",
  };
  const draft = {
    ...complete,
    id: "session-draft",
    status: "draft" as const,
    completedAt: null,
  };
  const current = createSession(
    plan,
    assignment,
    "session-2",
    "2026-09-04T12:00:00.000Z",
  );
  const previous = previousExercise(
    [otherClient, draft, complete],
    current,
    "planned-a",
  );
  assert.equal(previous?.sessionId, "session-1");
  assert.equal(
    previousSet(plan.exercises[0].sets, previous, "work-a")?.loadKg,
    12.5,
  );
  assert.equal(
    previousSet(plan.exercises[0].sets, previous, "work-b")?.loadKg,
    15,
  );
  assert.equal(previousSet(plan.exercises[0].sets, previous, "warmup-a"), null);
  assert.equal(previousExercise([otherClient], current, "planned-a"), null);
  const incompatible = {
    ...complete,
    exercises: complete.exercises.map((exercise) => ({
      ...exercise,
      loadConvention: "per-hand" as const,
    })),
  };
  assert.equal(previousExercise([incompatible], current, "planned-a"), null);
  const changedEquipment = {
    ...complete,
    exercises: complete.exercises.map((exercise) => ({
      ...exercise,
      equipment: "Outro equipamento",
    })),
  };
  assert.equal(
    previousExercise([changedEquipment], current, "planned-a"),
    null,
  );
});
