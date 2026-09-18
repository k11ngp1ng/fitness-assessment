"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { safeResult } from "@/lib/calculations";
import { dateLabel, fmt } from "@/lib/format";
import {
  Avatar,
  EmptyState,
  NewAssessment,
  PageHeader,
  SearchBox,
} from "@/components/ui";
export function AssessmentHistory({ report = false }: { report?: boolean }) {
  const { clients, assessments } = useStore();
  const [search, setSearch] = useState("");
  const list = [...assessments]
    .filter((a) =>
      clients
        .find((c) => c.id === a.clientId)
        ?.name.toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader
        eyebrow={report ? "APRESENTAÇÃO DE RESULTADOS" : "HISTÓRICO DE MEDIDAS"}
        title={
          report
            ? "Resultados que merecem ser vistos."
            : "Cada avaliação conta."
        }
        description={
          report
            ? "Relatórios completos, prontos para apresentar, imprimir ou salvar em PDF."
            : "Todas as avaliações, organizadas para o próximo passo."
        }
        action={<NewAssessment />}
      />
      <div className="list-toolbar">
        <span className="muted">
          {list.length}{" "}
          {report ? "relatórios disponíveis" : "avaliações registradas"}
        </span>
        <SearchBox value={search} onChange={setSearch} />
      </div>
      <section className="panel assessment-table">
        <div className="table-head">
          <span>CLIENTE</span>
          <span>DATA</span>
          <span>GORDURA CORPORAL</span>
          <span>PESO</span>
          <span />
        </div>
        {list.map((a) => {
          const c = clients.find((c) => c.id === a.clientId)!;
          return (
            <Link
              href={`/${report ? "relatorios" : "avaliacoes"}/${a.id}`}
              key={a.id}
              className="table-row"
            >
              <span className="table-person">
                <Avatar client={c} />
                <span>
                  <strong>{c.name}</strong>
                  <small>Jackson & Pollock · 7 dobras</small>
                </span>
              </span>
              <span>{dateLabel(a.date)}</span>
              <span>
                {fmt(safeResult(a)?.bodyFat)} <small>%</small>
              </span>
              <span>
                {fmt(a.weight)} <small>kg</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          );
        })}
        {!list.length && (
          <EmptyState
            title="Nenhuma avaliação encontrada"
            description="Busque outro nome ou inicie uma nova avaliação."
          />
        )}
      </section>
    </>
  );
}
