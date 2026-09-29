"use client";

import { useState, type FormEvent } from "react";
import { EmptyState, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { parseDecimal } from "@/lib/validation";
import {
  createSession,
  finishSession,
  previousExercise,
  previousSet,
  recordSet,
  type Exercise,
  type PlannedExercise,
  type PlannedSet,
  type TrackingMode,
  type WorkoutPlanRevision,
  type WorkoutSession,
} from "@/lib/workouts/domain";
import {
  buildPreviewPlan,
  type DraftExercise,
  type DraftPlan,
  type DraftSet,
} from "@/lib/workouts/plans";

type Entry = { load: string; value: string };

function performedValue(entry: Entry, mode: TrackingMode) {
  const value = parseDecimal(entry.value);
  const load = mode === "weight-reps" ? parseDecimal(entry.load) : null;
  if (value === null || !Number.isInteger(value) || value <= 0) return null;
  if (
    mode === "weight-reps" &&
    (load === null || !Number.isFinite(load) || load < 0)
  )
    return null;
  return { load, value };
}

function formatPrevious(
  set: ReturnType<typeof previousSet>,
  exercise: PlannedExercise,
): string {
  if (!set) return "Sem registro anterior";
  const load =
    set.loadKg === null
      ? ""
      : `${set.loadKg.toLocaleString("pt-BR")} kg${exercise.loadConvention === "per-hand" ? " por mão" : ""} · `;
  return `${load}${set.reps ?? set.seconds} ${set.seconds === null ? "repetições" : "segundos"}`;
}

function formatTarget(exercise: PlannedExercise, set: PlannedSet): string {
  const count =
    exercise.trackingMode === "duration"
      ? `${set.targetSeconds} segundos`
      : `${set.targetReps} repetições`;
  const load =
    set.targetLoadKg === null
      ? ""
      : ` · ${set.targetLoadKg.toLocaleString("pt-BR")} kg${exercise.loadConvention === "per-hand" ? " por mão" : ""}`;
  return `${set.kind === "warmup" ? "Aquecimento" : "Trabalho"} · Meta: ${count}${load}`;
}

export function Workouts() {
  const { clients } = useStore();
  const activeClients = clients.filter((client) => !client.archivedAt);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [variation, setVariation] = useState("");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState<TrackingMode>("weight-reps");
  const [loadConvention, setLoadConvention] = useState<"total" | "per-hand">(
    "total",
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [clientId, setClientId] = useState("");
  const [draft, setDraft] = useState<DraftPlan>({ title: "", exercises: [] });
  const [plan, setPlan] = useState<WorkoutPlanRevision | null>(null);
  const [planClientId, setPlanClientId] = useState<string | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [author, setAuthor] = useState<"trainer" | "client">("client");
  const [message, setMessage] = useState("");

  function updateDraft(change: (current: DraftPlan) => DraftPlan) {
    setDraft(change);
    setPlan(null);
    setPlanClientId(null);
  }

  function updateDraftExercise(
    id: string,
    change: (current: DraftExercise) => DraftExercise,
  ) {
    updateDraft((current) => ({
      ...current,
      exercises: current.exercises.map((item) =>
        item.id === id ? change(item) : item,
      ),
    }));
  }

  function updateDraftSet(
    exerciseId: string,
    setId: string,
    change: (current: DraftSet) => DraftSet,
  ) {
    updateDraftExercise(exerciseId, (item) => ({
      ...item,
      sets: item.sets.map((set) => (set.id === setId ? change(set) : set)),
    }));
  }

  function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: name.trim(),
      variation: variation.trim(),
      equipment: equipment.trim(),
      instructions: instructions.trim(),
      trackingMode: mode,
      loadConvention: mode === "weight-reps" ? loadConvention : null,
      mediaId: null,
      archivedAt: null,
    };
    setLibrary((current) => [...current, exercise]);
    setSelectedExerciseId(exercise.id);
    setName("");
    setVariation("");
    setEquipment("");
    setInstructions("");
    setMessage("Exercício criado somente nesta sessão do navegador.");
  }

  function addToDraft() {
    const exercise = library.find((item) => item.id === selectedExerciseId);
    if (!exercise) return;
    if (draft.exercises.some((item) => item.exerciseId === exercise.id)) {
      setMessage("Este exercício já está no treino de exemplo.");
      return;
    }
    updateDraft((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          id: crypto.randomUUID(),
          exerciseId: exercise.id,
          notes: "",
          restSeconds: "",
          sets: [
            {
              id: crypto.randomUUID(),
              kind: "work",
              target: "",
              targetLoadKg: "",
            },
          ],
        },
      ],
    }));
    setMessage("Exercício adicionado à prévia. Defina a meta de cada série.");
  }

  function moveDraftExercise(id: string, direction: -1 | 1) {
    updateDraft((current) => {
      const exercises = [...current.exercises];
      const index = exercises.findIndex((item) => item.id === id);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= exercises.length)
        return current;
      [exercises[index], exercises[destination]] = [
        exercises[destination],
        exercises[index],
      ];
      return { ...current, exercises };
    });
  }

  function buildPlan() {
    if (!clientId) {
      setMessage("Escolha um cliente fictício para a prévia.");
      return;
    }
    try {
      const preview = buildPreviewPlan(draft, library, () =>
        crypto.randomUUID(),
      );
      setPlan(preview);
      setPlanClientId(clientId);
      setEntries({});
      setMessage("Prévia preparada nesta aba. Nenhum plano foi publicado.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível preparar o treino.",
      );
    }
  }

  function start() {
    if (!plan || !clientId || clientId !== planClientId) return;
    try {
      setSession(
        createSession(
          plan,
          {
            id: `demo-${plan.id}`,
            clientId,
            planRevisionId: plan.id,
          },
          crypto.randomUUID(),
          new Date().toISOString(),
        ),
      );
      setEntries({});
      setMessage(
        "Treino iniciado nesta aba. O registro ainda não é persistente.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o treino.",
      );
    }
  }

  function saveSet(
    exercise: PlannedExercise,
    set: PlannedSet,
    position: number,
  ) {
    if (!session || !plan) return;
    const values = performedValue(
      entries[set.id] ?? { load: "", value: "" },
      exercise.trackingMode,
    );
    if (!values) {
      setMessage(
        "Informe um número inteiro positivo e, quando necessário, uma carga válida em kg.",
      );
      return;
    }
    const previous = session.exercises
      .find((item) => item.plannedExerciseId === exercise.id)
      ?.sets.find((item) => item.plannedSetId === set.id);
    try {
      setSession(
        recordSet(session, plan, exercise.id, {
          id: previous?.id ?? crypto.randomUUID(),
          plannedSetId: set.id,
          kind: set.kind,
          position,
          loadKg: values.load,
          reps: exercise.trackingMode === "duration" ? null : values.value,
          seconds: exercise.trackingMode === "duration" ? values.value : null,
          completedAt: new Date().toISOString(),
          recordedBy: author,
        }),
      );
      setMessage(
        `Série registrada nesta aba por ${author === "trainer" ? "profissional" : "cliente"}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a série.",
      );
    }
  }

  function finish() {
    if (!session) return;
    try {
      const completed = finishSession(session, new Date().toISOString());
      setHistory((current) => [...current, completed]);
      setSession(null);
      setMessage(
        "Treino concluído nesta aba. Inicie outro para comparar as séries.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o treino.",
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="TREINOS · PRIMEIRA ETAPA"
        title="Tracker de treinos"
        description="Protótipo interativo com dados fictícios. Exercícios, planos e registros desta tela somem ao recarregar; ainda não há conta, upload ou sincronização."
      />
      {message && (
        <p className="workout-message" role="status">
          {message}
        </p>
      )}
      <div className="workout-layout">
        <section
          className="panel workout-panel"
          aria-labelledby="library-title"
        >
          <span className="eyebrow">01 · BIBLIOTECA</span>
          <h2 id="library-title">Exercícios</h2>
          <p className="muted">
            Comece com sua própria biblioteca. Nenhum exercício é criado
            automaticamente.
          </p>
          {library.length === 0 && (
            <EmptyState
              title="Biblioteca vazia"
              description="Crie um exercício para preparar um treino de exemplo."
            />
          )}
          {library.length > 0 && (
            <ul className="workout-list">
              {library.map((exercise) => (
                <li key={exercise.id}>
                  <strong>{exercise.name}</strong>
                  <span>
                    {exercise.variation || "Sem variação"} ·{" "}
                    {exercise.trackingMode === "duration"
                      ? "Duração"
                      : exercise.trackingMode === "reps"
                        ? "Repetições"
                        : "Carga e repetições"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form className="workout-form" onSubmit={addExercise}>
            <label>
              Nome do exercício
              <input
                required
                maxLength={90}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Agachamento livre"
              />
            </label>
            <label>
              Variação
              <input
                maxLength={90}
                value={variation}
                onChange={(event) => setVariation(event.target.value)}
                placeholder="Ex.: com barra"
              />
            </label>
            <label>
              Equipamento
              <input
                maxLength={90}
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                placeholder="Ex.: barra livre"
              />
            </label>
            <label>
              Como executar
              <textarea
                maxLength={1000}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Instruções em texto para o cliente"
              />
            </label>
            <label>
              Tipo de registro
              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as TrackingMode)
                }
              >
                <option value="weight-reps">Carga e repetições</option>
                <option value="reps">Somente repetições</option>
                <option value="duration">Duração em segundos</option>
              </select>
            </label>
            {mode === "weight-reps" && (
              <label>
                Como informar a carga
                <select
                  value={loadConvention}
                  onChange={(event) =>
                    setLoadConvention(
                      event.target.value as "total" | "per-hand",
                    )
                  }
                >
                  <option value="total">Carga total</option>
                  <option value="per-hand">Carga por mão</option>
                </select>
              </label>
            )}
            <button className="button primary" type="submit">
              Criar exercício
            </button>
          </form>
        </section>
        <section className="panel workout-panel" aria-labelledby="plan-title">
          <span className="eyebrow">02 · PLANO DE EXEMPLO</span>
          <h2 id="plan-title">Montar treino</h2>
          <p className="muted">
            Escolha exercícios da biblioteca, ordene e defina metas. A prévia
            não é publicada para o cliente.
          </p>
          <fieldset className="workout-builder" disabled={session !== null}>
            <div className="workout-form">
              <label>
                Nome do treino
                <input
                  maxLength={100}
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Treino A"
                />
              </label>
              <label>
                Cliente fictício
                <select
                  value={clientId}
                  onChange={(event) => {
                    setClientId(event.target.value);
                    setPlan(null);
                    setPlanClientId(null);
                  }}
                >
                  <option value="">Selecione</option>
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Exercício da biblioteca
                <select
                  value={selectedExerciseId}
                  onChange={(event) =>
                    setSelectedExerciseId(event.target.value)
                  }
                >
                  <option value="">Selecione</option>
                  {library.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                      {exercise.variation ? ` · ${exercise.variation}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button outline"
                type="button"
                disabled={!selectedExerciseId}
                onClick={addToDraft}
              >
                Adicionar ao treino
              </button>
            </div>
            {draft.exercises.length === 0 && (
              <p className="workout-builder-empty">
                Nenhum exercício no treino. Escolha um item da biblioteca para
                começar.
              </p>
            )}
            {draft.exercises.map((item, exerciseIndex) => {
              const exercise = library.find(
                (candidate) => candidate.id === item.exerciseId,
              );
              if (!exercise) return null;
              return (
                <article className="workout-draft-exercise" key={item.id}>
                  <div className="workout-draft-heading">
                    <div>
                      <span className="eyebrow">
                        EXERCÍCIO {exerciseIndex + 1}
                      </span>
                      <h3>{exercise.name}</h3>
                      <p>
                        {exercise.variation || "Sem variação"} ·{" "}
                        {exercise.equipment || "Sem equipamento informado"}
                      </p>
                    </div>
                    <div className="workout-draft-actions">
                      <button
                        type="button"
                        disabled={exerciseIndex === 0}
                        onClick={() => moveDraftExercise(item.id, -1)}
                        aria-label={`Mover ${exercise.name} para cima`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={exerciseIndex === draft.exercises.length - 1}
                        onClick={() => moveDraftExercise(item.id, 1)}
                        aria-label={`Mover ${exercise.name} para baixo`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((current) => ({
                            ...current,
                            exercises: current.exercises.filter(
                              (candidate) => candidate.id !== item.id,
                            ),
                          }))
                        }
                        aria-label={`Remover ${exercise.name} do treino`}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <div className="workout-draft-meta">
                    <label>
                      Descanso entre séries (segundos)
                      <input
                        inputMode="numeric"
                        value={item.restSeconds}
                        onChange={(event) =>
                          updateDraftExercise(item.id, (current) => ({
                            ...current,
                            restSeconds: event.target.value,
                          }))
                        }
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Observações para este treino
                      <textarea
                        maxLength={500}
                        value={item.notes}
                        onChange={(event) =>
                          updateDraftExercise(item.id, (current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Opcional"
                      />
                    </label>
                  </div>
                  <div className="workout-draft-sets">
                    {item.sets.map((set, setIndex) => (
                      <div className="workout-draft-set" key={set.id}>
                        <strong>Série {setIndex + 1}</strong>
                        <label>
                          Tipo
                          <select
                            value={set.kind}
                            onChange={(event) =>
                              updateDraftSet(item.id, set.id, (current) => ({
                                ...current,
                                kind: event.target.value as DraftSet["kind"],
                              }))
                            }
                          >
                            <option value="work">Trabalho</option>
                            <option value="warmup">Aquecimento</option>
                          </select>
                        </label>
                        <label>
                          {exercise.trackingMode === "duration"
                            ? "Meta (segundos)"
                            : "Meta (repetições)"}
                          <input
                            inputMode="numeric"
                            value={set.target}
                            onChange={(event) =>
                              updateDraftSet(item.id, set.id, (current) => ({
                                ...current,
                                target: event.target.value,
                              }))
                            }
                            placeholder={
                              exercise.trackingMode === "duration" ? "30" : "8"
                            }
                          />
                        </label>
                        {exercise.trackingMode === "weight-reps" && (
                          <label>
                            Meta de carga (kg, opcional)
                            <input
                              inputMode="decimal"
                              value={set.targetLoadKg}
                              onChange={(event) =>
                                updateDraftSet(item.id, set.id, (current) => ({
                                  ...current,
                                  targetLoadKg: event.target.value,
                                }))
                              }
                              placeholder="Opcional"
                            />
                          </label>
                        )}
                        <button
                          type="button"
                          disabled={item.sets.length === 1}
                          onClick={() =>
                            updateDraftExercise(item.id, (current) => ({
                              ...current,
                              sets: current.sets.filter(
                                (candidate) => candidate.id !== set.id,
                              ),
                            }))
                          }
                          aria-label={`Remover série ${setIndex + 1} de ${exercise.name}`}
                        >
                          Remover série
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="button outline"
                    type="button"
                    onClick={() =>
                      updateDraftExercise(item.id, (current) => ({
                        ...current,
                        sets: [
                          ...current.sets,
                          {
                            id: crypto.randomUUID(),
                            kind: "work",
                            target: "",
                            targetLoadKg: "",
                          },
                        ],
                      }))
                    }
                  >
                    Adicionar série a {exercise.name}
                  </button>
                </article>
              );
            })}
            <button
              className="button primary workout-preview-button"
              type="button"
              onClick={buildPlan}
            >
              Preparar prévia do treino
            </button>
          </fieldset>
          {plan && (
            <div className="workout-plan-summary">
              <strong>{plan.title}</strong>
              <span>
                {plan.exercises.length} exercício(s) ·{" "}
                {plan.exercises.reduce(
                  (total, exercise) => total + exercise.sets.length,
                  0,
                )}{" "}
                série(s)
              </span>
              <p>Vídeo opcional: upload privado entrará na etapa online.</p>
              {!session && (
                <button
                  className="button primary"
                  type="button"
                  onClick={start}
                >
                  Iniciar treino
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      {session && plan && (
        <section
          className="panel workout-panel workout-tracker"
          aria-labelledby="tracker-title"
        >
          <span className="eyebrow">03 · EXECUÇÃO</span>
          <h2 id="tracker-title">{plan.title}</h2>
          <div
            className="workout-author"
            role="group"
            aria-label="Quem está registrando"
          >
            <span>Registrado por</span>
            <label>
              <input
                type="radio"
                name="author"
                checked={author === "client"}
                onChange={() => setAuthor("client")}
              />{" "}
              Cliente
            </label>
            <label>
              <input
                type="radio"
                name="author"
                checked={author === "trainer"}
                onChange={() => setAuthor("trainer")}
              />{" "}
              Profissional
            </label>
          </div>
          {plan.exercises.map((exercise) => {
            const previous = previousExercise(history, session, exercise.id);
            const current = session.exercises.find(
              (item) => item.plannedExerciseId === exercise.id,
            );
            return (
              <section
                className="workout-tracker-exercise"
                key={exercise.id}
                aria-labelledby={`tracker-${exercise.id}`}
              >
                <h3 id={`tracker-${exercise.id}`}>
                  {exercise.name}
                  {exercise.variation ? ` · ${exercise.variation}` : ""}
                </h3>
                <p className="muted">
                  {exercise.instructions ||
                    "Siga a orientação combinada com o profissional."}
                </p>
                {exercise.notes && (
                  <p className="muted">Neste treino: {exercise.notes}</p>
                )}
                {exercise.restSeconds !== null && (
                  <p className="muted">
                    Descanso previsto: {exercise.restSeconds} segundos
                  </p>
                )}
                {previous && (
                  <p className="workout-previous-date">
                    Último treino comparável:{" "}
                    {new Date(previous.completedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
                <div className="workout-sets">
                  {exercise.sets.map((set, index) => {
                    const entry = entries[set.id] ?? { load: "", value: "" };
                    const prior = previousSet(exercise.sets, previous, set.id);
                    const done = current?.sets.find(
                      (item) => item.plannedSetId === set.id,
                    );
                    const position = exercise.sets
                      .slice(0, index)
                      .filter((item) => item.kind === set.kind).length;
                    return (
                      <div className="workout-set" key={set.id}>
                        <div className="workout-set-top">
                          <strong>Série {index + 1}</strong>
                          <span>
                            {done
                              ? `Registrada por ${done.recordedBy === "trainer" ? "profissional" : "cliente"}`
                              : "Pendente"}
                          </span>
                        </div>
                        <p className="workout-target">
                          {formatTarget(exercise, set)}
                        </p>
                        <p className="workout-prior">
                          Anterior: {formatPrevious(prior, exercise)}
                        </p>
                        <div className="workout-set-inputs">
                          {exercise.trackingMode === "weight-reps" && (
                            <label>
                              {exercise.loadConvention === "per-hand"
                                ? "Carga por mão (kg)"
                                : "Carga total (kg)"}
                              <input
                                inputMode="decimal"
                                value={entry.load}
                                onChange={(event) =>
                                  setEntries((currentEntries) => ({
                                    ...currentEntries,
                                    [set.id]: {
                                      ...entry,
                                      load: event.target.value,
                                    },
                                  }))
                                }
                                placeholder="0"
                              />
                            </label>
                          )}
                          <label>
                            {exercise.trackingMode === "duration"
                              ? "Duração (segundos)"
                              : "Repetições"}
                            <input
                              inputMode="numeric"
                              value={entry.value}
                              onChange={(event) =>
                                setEntries((currentEntries) => ({
                                  ...currentEntries,
                                  [set.id]: {
                                    ...entry,
                                    value: event.target.value,
                                  },
                                }))
                              }
                              placeholder={
                                exercise.trackingMode === "duration"
                                  ? "30"
                                  : "8"
                              }
                            />
                          </label>
                          <button
                            className="button outline"
                            type="button"
                            onClick={() => saveSet(exercise, set, position)}
                          >
                            {done ? "Corrigir série" : "Registrar série"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <button className="button primary" type="button" onClick={finish}>
            Concluir treino nesta aba
          </button>
        </section>
      )}
      {history.length > 0 && (
        <p className="workout-history">
          {history.length} treino(s) concluído(s) nesta aba. Esses dados não são
          salvos nem enviados.
        </p>
      )}
    </>
  );
}
