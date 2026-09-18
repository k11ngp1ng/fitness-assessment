"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Ruler,
  Scale,
  Activity,
} from "lucide-react";
import { useStore, historyFor } from "@/lib/store";
import { safeResult, compare } from "@/lib/calculations";
import {
  Avatar,
  EmptyState,
  MetricCard,
  NewAssessment,
  SectionTitle,
} from "@/components/ui";
import { ProgressChart } from "@/components/progress-chart";
import { BodyMap } from "@/components/body-map";
import { dateLabel, fmt } from "@/lib/format";
export function ClientProfile({ id }: { id: string }) {
  const { clients, assessments } = useStore();
  const c = clients.find((c) => c.id === id);
  if (!c)
    return (
      <EmptyState
        title="Cliente não encontrado"
        description="Esse cadastro não está disponível neste navegador."
      />
    );
  const history = historyFor(assessments, id),
    a = history[0],
    result = safeResult(a),
    delta = a && history[1] ? compare(a, history[1]) : null;
  return (
    <>
      <Link href="/clientes" className="back-link">
        <ArrowLeft size={15} />
        Todos os clientes
      </Link>
      <section className="profile-header panel">
        <div className="profile-identity">
          <Avatar client={c} large />
          <div>
            <div className="eyebrow">
              JORNADA DO CLIENTE <span className="tag">{c.fitness}</span>
            </div>
            <h1>{c.name}</h1>
            <p>
              {c.age} anos <span>·</span>
              {fmt(c.height, 2)} m <span>·</span>
              {c.goal}
            </p>
          </div>
        </div>
        <div className="profile-actions">
          <NewAssessment clientId={id} />
          <span>
            <CalendarDays size={13} />
            {a
              ? `Última avaliação: ${dateLabel(a.date)}`
              : "Sem avaliações registradas"}
          </span>
        </div>
      </section>
      {a && result ? (
        <>
          <div className="stats-grid four">
            <MetricCard
              featured
              label="Gordura corporal"
              value={fmt(result.bodyFat)}
              unit="%"
              delta={delta?.bodyFat}
              caption={delta ? "p.p. desde a anterior" : "Primeira avaliação"}
              icon={<Activity size={18} />}
            />
            <MetricCard
              label="Massa magra"
              value={fmt(result.leanMass)}
              unit="kg"
              delta={delta?.leanMass}
              caption={delta ? "kg desde a anterior" : "Primeira avaliação"}
            />
            <MetricCard
              label="Peso corporal"
              value={fmt(a.weight)}
              unit="kg"
              delta={delta?.weight}
              caption={delta ? "kg desde a anterior" : "Primeira avaliação"}
              icon={<Scale size={18} />}
            />
            <MetricCard
              label="Cintura"
              value={fmt(a.circumferences.waist)}
              unit="cm"
              delta={delta?.waist}
              caption={
                delta?.waist != null
                  ? "cm desde a anterior"
                  : "Sem comparação anterior"
              }
              icon={<Ruler size={18} />}
            />
          </div>
          <ProgressChart assessments={history} />
          <div className="profile-bottom">
            <section className="panel">
              <SectionTitle
                title="Histórico de avaliações"
                sub="Os capítulos dessa transformação."
              />
              <div className="timeline">
                {history.map((item, i) => (
                  <Link
                    href={`/avaliacoes/${item.id}`}
                    className="timeline-item"
                    key={item.id}
                  >
                    <span
                      className={`timeline-dot ${i === 0 ? "current" : ""}`}
                    />
                    <div>
                      <strong>{dateLabel(item.date, true)}</strong>
                      <small>
                        {i === 0
                          ? "Avaliação mais recente"
                          : "Avaliação de acompanhamento"}{" "}
                        {item.demo ? "· Demo" : ""}
                      </small>
                    </div>
                    <div className="timeline-numbers">
                      <span>
                        {fmt(safeResult(item)?.bodyFat)}
                        <small>% gordura</small>
                      </span>
                      <span>
                        {fmt(item.weight)}
                        <small>kg peso</small>
                      </span>
                      <span>
                        {fmt(item.circumferences.waist)}
                        <small>cm cintura</small>
                      </span>
                    </div>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
              </div>
            </section>
            <section className="panel profile-map">
              <SectionTitle title="Visão corporal" sub="Última avaliação" />
              <div className="map-with-metrics">
                <BodyMap />
                <div>
                  <small>CINTURA</small>
                  <strong>
                    {fmt(a.circumferences.waist)} <span>cm</span>
                  </strong>
                  <small>MASSA GORDA</small>
                  <strong>
                    {fmt(result.fatMass)} <span>kg</span>
                  </strong>
                  <small>PERÍMETRO DO QUADRIL</small>
                  <strong>
                    {fmt(a.circumferences.hip)} <span>cm</span>
                  </strong>
                </div>
              </div>
              <Link
                className="button outline full-width"
                href={`/relatorios/${a.id}`}
              >
                <FileText size={16} />
                Abrir relatório
              </Link>
            </section>
          </div>
        </>
      ) : (
        <EmptyState
          title="Toda evolução tem um começo."
          description="Crie a primeira avaliação para preencher esta jornada com resultados."
        >
          <NewAssessment clientId={id} />
        </EmptyState>
      )}
    </>
  );
}
