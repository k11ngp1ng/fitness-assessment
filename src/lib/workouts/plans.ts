import { parseDecimal } from "../validation";
import type { Exercise, SetKind, WorkoutPlanRevision } from "./domain";

export interface DraftSet {
  id: string;
  kind: SetKind;
  target: string;
  targetLoadKg: string;
}

export interface DraftExercise {
  id: string;
  exerciseId: string;
  notes: string;
  restSeconds: string;
  sets: DraftSet[];
}

export interface DraftPlan {
  title: string;
  exercises: DraftExercise[];
}

function requiredPositiveInteger(raw: string): number | null {
  const value = parseDecimal(raw);
  return value !== null && Number.isInteger(value) && value > 0 ? value : null;
}

function optionalNonnegative(raw: string): number | null | undefined {
  if (!raw.trim()) return null;
  const value = parseDecimal(raw);
  return value !== null && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function optionalNonnegativeInteger(raw: string): number | null | undefined {
  const value = optionalNonnegative(raw);
  return value === null || (value !== undefined && Number.isInteger(value))
    ? value
    : undefined;
}

export function buildPreviewPlan(
  draft: DraftPlan,
  library: Exercise[],
  createId: () => string,
): WorkoutPlanRevision {
  const title = draft.title.trim();
  if (!title || draft.exercises.length === 0)
    throw new Error("Dê um nome ao treino e adicione ao menos um exercício.");

  const exerciseIds = draft.exercises.map((item) => item.exerciseId);
  const plannedIds = draft.exercises.map((item) => item.id);
  const allSetIds = draft.exercises.flatMap((item) =>
    item.sets.map((set) => set.id),
  );
  if (
    new Set(exerciseIds).size !== exerciseIds.length ||
    new Set(plannedIds).size !== plannedIds.length ||
    new Set(allSetIds).size !== allSetIds.length
  )
    throw new Error("Há exercícios ou séries duplicados no plano.");

  const exercises = draft.exercises.map((item) => {
    const exercise = library.find(
      (candidate) => candidate.id === item.exerciseId && !candidate.archivedAt,
    );
    const restSeconds = optionalNonnegativeInteger(item.restSeconds);
    if (
      !item.id.trim() ||
      !exercise ||
      item.sets.length === 0 ||
      restSeconds === undefined
    )
      throw new Error("Revise os exercícios, séries e o descanso do plano.");

    const sets = item.sets.map((set) => {
      const target = requiredPositiveInteger(set.target);
      const targetLoadKg = optionalNonnegative(set.targetLoadKg);
      if (
        !set.id.trim() ||
        !["warmup", "work"].includes(set.kind) ||
        target === null ||
        targetLoadKg === undefined ||
        (exercise.trackingMode !== "weight-reps" &&
          set.targetLoadKg.trim() !== "")
      )
        throw new Error(`Revise a meta das séries de ${exercise.name}.`);
      return {
        id: set.id,
        kind: set.kind,
        targetReps: exercise.trackingMode === "duration" ? null : target,
        targetSeconds: exercise.trackingMode === "duration" ? target : null,
        targetLoadKg:
          exercise.trackingMode === "weight-reps" ? targetLoadKg : null,
      };
    });
    return {
      id: item.id,
      exerciseId: exercise.id,
      name: exercise.name,
      variation: exercise.variation,
      equipment: exercise.equipment,
      trackingMode: exercise.trackingMode,
      loadConvention: exercise.loadConvention,
      mediaId: exercise.mediaId,
      instructions: exercise.instructions,
      notes: item.notes.trim(),
      restSeconds,
      sets,
    };
  });

  return {
    id: createId(),
    templateId: createId(),
    revision: 1,
    title,
    exercises,
    publishedAt: null,
  };
}
