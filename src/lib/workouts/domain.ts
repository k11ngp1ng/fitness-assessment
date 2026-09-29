export const TRACKING_MODES = ["weight-reps", "reps", "duration"] as const;
export type TrackingMode = (typeof TRACKING_MODES)[number];
export type LoadConvention = "total" | "per-hand" | null;
export type SetKind = "warmup" | "work";

export interface Exercise {
  id: string;
  name: string;
  variation: string;
  equipment: string;
  instructions: string;
  trackingMode: TrackingMode;
  loadConvention: LoadConvention;
  mediaId: string | null;
  archivedAt: string | null;
}

export interface PlannedSet {
  id: string;
  kind: SetKind;
  targetReps: number | null;
  targetSeconds: number | null;
  targetLoadKg: number | null;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  variation: string;
  equipment: string;
  trackingMode: TrackingMode;
  loadConvention: LoadConvention;
  mediaId: string | null;
  instructions: string;
  notes: string;
  restSeconds: number | null;
  sets: PlannedSet[];
}

export interface WorkoutPlanRevision {
  id: string;
  templateId: string;
  revision: number;
  title: string;
  exercises: PlannedExercise[];
  publishedAt: string | null;
}

export interface WorkoutAssignment {
  id: string;
  clientId: string;
  planRevisionId: string;
}

export interface PerformedSet {
  id: string;
  plannedSetId: string;
  kind: SetKind;
  position: number;
  loadKg: number | null;
  reps: number | null;
  seconds: number | null;
  completedAt: string;
  recordedBy: "trainer" | "client";
}

export interface PerformedExercise {
  plannedExerciseId: string;
  exerciseId: string;
  variation: string;
  equipment: string;
  trackingMode: TrackingMode;
  loadConvention: LoadConvention;
  sets: PerformedSet[];
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  assignmentId: string;
  planRevisionId: string;
  startedAt: string;
  completedAt: string | null;
  status: "draft" | "completed" | "cancelled";
  exercises: PerformedExercise[];
}

export interface PreviousExercise {
  sessionId: string;
  completedAt: string;
  sets: PerformedSet[];
}

function validId(value: string): boolean {
  return Boolean(value.trim());
}

function validTime(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function nonnegative(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value >= 0;
}

function positiveInteger(value: number | null): boolean {
  return value !== null && Number.isInteger(value) && value > 0;
}

export function createSession(
  plan: WorkoutPlanRevision,
  assignment: WorkoutAssignment,
  id: string,
  startedAt: string,
): WorkoutSession {
  if (
    !validId(id) ||
    !validId(assignment.id) ||
    !validId(plan.id) ||
    !validId(assignment.clientId) ||
    assignment.planRevisionId !== plan.id ||
    plan.exercises.length === 0 ||
    plan.exercises.some(
      (exercise) =>
        !validId(exercise.id) ||
        !validId(exercise.exerciseId) ||
        exercise.sets.length === 0 ||
        new Set(exercise.sets.map((set) => set.id)).size !==
          exercise.sets.length,
    ) ||
    new Set(plan.exercises.map((exercise) => exercise.id)).size !==
      plan.exercises.length ||
    new Set(
      plan.exercises.flatMap((exercise) => exercise.sets.map((set) => set.id)),
    ).size !==
      plan.exercises.reduce(
        (count, exercise) => count + exercise.sets.length,
        0,
      ) ||
    !validTime(startedAt)
  ) {
    throw new Error("Não foi possível iniciar o treino.");
  }
  return {
    id,
    clientId: assignment.clientId,
    assignmentId: assignment.id,
    planRevisionId: plan.id,
    startedAt,
    completedAt: null,
    status: "draft",
    exercises: plan.exercises.map((exercise) => ({
      plannedExerciseId: exercise.id,
      exerciseId: exercise.exerciseId,
      variation: exercise.variation,
      equipment: exercise.equipment,
      trackingMode: exercise.trackingMode,
      loadConvention: exercise.loadConvention,
      sets: [],
    })),
  };
}

export function recordSet(
  session: WorkoutSession,
  plan: WorkoutPlanRevision,
  plannedExerciseId: string,
  set: PerformedSet,
): WorkoutSession {
  if (session.status !== "draft" || session.planRevisionId !== plan.id)
    throw new Error("Este treino não pode ser alterado.");
  const exercise = plan.exercises.find((item) => item.id === plannedExerciseId);
  const plannedSet = exercise?.sets.find(
    (item) => item.id === set.plannedSetId,
  );
  const performedExercise = session.exercises.find(
    (item) => item.plannedExerciseId === plannedExerciseId,
  );
  const position = exercise?.sets
    .filter((item) => item.kind === plannedSet?.kind)
    .findIndex((item) => item.id === set.plannedSetId);
  if (
    !exercise ||
    !plannedSet ||
    !performedExercise ||
    performedExercise.exerciseId !== exercise.exerciseId ||
    position === undefined ||
    position < 0 ||
    !validId(set.id) ||
    !validTime(set.completedAt) ||
    set.kind !== plannedSet.kind ||
    set.position !== position ||
    !["trainer", "client"].includes(set.recordedBy) ||
    session.exercises.some((item) =>
      item.sets.some(
        (existing) =>
          existing.id === set.id &&
          (item.plannedExerciseId !== plannedExerciseId ||
            existing.plannedSetId !== set.plannedSetId),
      ),
    ) ||
    Date.parse(set.completedAt) < Date.parse(session.startedAt) ||
    (exercise.trackingMode === "weight-reps" &&
      (!nonnegative(set.loadKg) ||
        !positiveInteger(set.reps) ||
        set.seconds !== null)) ||
    (exercise.trackingMode === "reps" &&
      (set.loadKg !== null ||
        !positiveInteger(set.reps) ||
        set.seconds !== null)) ||
    (exercise.trackingMode === "duration" &&
      (set.loadKg !== null ||
        set.reps !== null ||
        !positiveInteger(set.seconds)))
  ) {
    throw new Error("Preencha a série com valores válidos para o exercício.");
  }
  return {
    ...session,
    exercises: session.exercises.map((item) =>
      item.plannedExerciseId === plannedExerciseId
        ? {
            ...item,
            sets: item.sets.some(
              (previous) => previous.plannedSetId === set.plannedSetId,
            )
              ? item.sets.map((previous) =>
                  previous.plannedSetId === set.plannedSetId
                    ? { ...set }
                    : previous,
                )
              : [...item.sets, { ...set }],
          }
        : item,
    ),
  };
}

export function finishSession(
  session: WorkoutSession,
  completedAt: string,
): WorkoutSession {
  if (
    session.status !== "draft" ||
    !validTime(completedAt) ||
    Date.parse(completedAt) < Date.parse(session.startedAt) ||
    !session.exercises.some((exercise) => exercise.sets.length > 0)
  ) {
    throw new Error("Registre ao menos uma série antes de finalizar o treino.");
  }
  return { ...session, status: "completed", completedAt };
}

export function previousExercise(
  sessions: WorkoutSession[],
  current: WorkoutSession,
  plannedExerciseId: string,
): PreviousExercise | null {
  const target = current.exercises.find(
    (exercise) => exercise.plannedExerciseId === plannedExerciseId,
  );
  if (!target) return null;
  const matches = sessions
    .flatMap((session) => {
      const completedAt = session.completedAt;
      if (
        session.clientId !== current.clientId ||
        session.id === current.id ||
        session.status !== "completed" ||
        completedAt === null ||
        !validTime(completedAt) ||
        Date.parse(completedAt) >= Date.parse(current.startedAt)
      )
        return [];
      return session.exercises
        .filter(
          (exercise) =>
            exercise.exerciseId === target.exerciseId &&
            exercise.variation === target.variation &&
            exercise.equipment === target.equipment &&
            exercise.trackingMode === target.trackingMode &&
            exercise.loadConvention === target.loadConvention &&
            exercise.sets.length > 0,
        )
        .map((exercise) => ({
          sessionId: session.id,
          completedAt,
          sets: exercise.sets,
        }));
    })
    .sort(
      (a, b) =>
        b.completedAt.localeCompare(a.completedAt) ||
        b.sessionId.localeCompare(a.sessionId),
    );
  return matches[0] ?? null;
}

export function previousSet(
  plannedSets: PlannedSet[],
  previous: PreviousExercise | null,
  plannedSetId: string,
): PerformedSet | null {
  if (!previous) return null;
  const planned = plannedSets.find((set) => set.id === plannedSetId);
  if (!planned) return null;
  const index = plannedSets
    .filter((set) => set.kind === planned.kind)
    .findIndex((set) => set.id === plannedSetId);
  return (
    previous.sets.find(
      (set) => set.kind === planned.kind && set.position === index,
    ) ?? null
  );
}
