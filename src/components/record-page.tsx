"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClientProfile } from "@/features/clients/profile";
import { Results } from "@/features/assessments/results";
import type { RecordKind } from "@/lib/routes";
import { EmptyState } from "@/components/ui";

export function RecordPage({ kind }: { kind: RecordKind }) {
  const ids = useSearchParams().getAll("id");
  const back =
    kind === "client"
      ? "/clientes"
      : kind === "report"
        ? "/relatorios"
        : "/avaliacoes";
  if (ids.length !== 1 || !ids[0].trim()) {
    return (
      <>
        <EmptyState
          title="Registro não informado"
          description="Abra um registro pela lista para consultar seus dados neste navegador."
        />
        <Link className="button outline" href={back}>
          Voltar à lista
        </Link>
      </>
    );
  }
  return kind === "client" ? (
    <ClientProfile id={ids[0]} />
  ) : (
    <Results id={ids[0]} report={kind === "report"} />
  );
}
