"use client";
import { useState } from "react";
import { useStore, historyFor } from "@/lib/store";
import { ProgressChart } from "@/components/progress-chart";
import { EmptyState, PageHeader, NewAssessment } from "@/components/ui";
import { Comparisons } from "@/features/assessments/results";
export function Progress() {
  const { clients, assessments } = useStore();
  const [id, setId] = useState("nathan");
  const history = historyFor(assessments, id);
  return (
    <>
      <PageHeader
        eyebrow="EVOLUÇÃO & CONSISTÊNCIA"
        title="A história por trás dos números."
        description="Compare momentos, reconheça mudanças e planeje os próximos passos."
        action={<NewAssessment clientId={id} />}
      />
      <label className="field client-select">
        <span>Cliente em acompanhamento</span>
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {clients.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <ProgressChart assessments={history} />
      {history.length > 1 ? (
        <Comparisons current={history[0]} previous={history[1]} />
      ) : (
        <EmptyState
          title="Vamos construir um histórico"
          description="Duas avaliações são necessárias para comparar resultados."
        />
      )}
    </>
  );
}
