"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  ClipboardCheck,
  CalendarDays,
  MoveUpRight,
  Plus,
  ArrowRight,
} from "lucide-react";
import { historyFor, useStore } from "@/lib/store";
import { safeResult } from "@/lib/calculations";
import { dateLabel, fmt } from "@/lib/format";
import {
  Avatar,
  MetricCard,
  NewAssessment,
  PageHeader,
  SectionTitle,
  TextLink,
  EmptyState,
} from "@/components/ui";
import { ProgressChart } from "@/components/progress-chart";
export function Dashboard() {
  const { clients, assessments } = useStore();
  const nathan = clients.find((c) => c.id === "nathan") || clients[0];
  if (!nathan)
    return (
      <EmptyState
        title="Sua próxima jornada começa aqui."
        description="Cadastre seu primeiro cliente para iniciar as avaliações."
      >
        <Link className="button primary" href="/clientes">
          Cadastrar cliente
        </Link>
      </EmptyState>
    );
  const history = historyFor(assessments, nathan.id);
  const result = safeResult(history[0]);
  const month = assessments.filter((a) => a.date.startsWith("2026-09")).length;
  const recent = [...assessments]
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const recurring = clients.filter(
    (c) => historyFor(assessments, c.id).length > 1,
  ).length;
  return (
    <>
      <PageHeader
        eyebrow="SEU CENTRO DE PERFORMANCE"
        title="O próximo nível começa aqui."
        description="Uma visão clara dos seus clientes. Mais espaço para transformar resultados."
        action={<NewAssessment />}
      />
      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="live-dot" /> CIÊNCIA APLICADA. EVOLUÇÃO REAL.
          </span>
          <h2>
            Além das medidas.
            <br />
            <em>Mais possibilidades.</em>
          </h2>
          <p>Conecte cada avaliação à história de evolução do seu cliente.</p>
          <Link href="/clientes/nathan" className="button light">
            Explorar avaliação de Nathan <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="hero-v">V</div>
          <span className="art-label label-one">
            PRECISÃO
            <br />
            <b>EM CADA MOVIMENTO.</b>
          </span>
          <span className="art-label label-two">
            01 — ∞<br />
            EVOLUÇÃO CONTÍNUA
          </span>
          <div className="crosshair">+</div>
        </div>
        <span className="hero-index">VÉRTICE / PERFORMANCE SERIES 001</span>
      </section>
      <div className="stats-grid dashboard-stats">
        <MetricCard
          label="Clientes na carteira"
          value={String(clients.length).padStart(2, "0")}
          caption="Cada jornada importa"
          icon={<Users size={18} />}
        />
        <MetricCard
          label="Avaliações neste mês"
          value={String(month).padStart(2, "0")}
          caption="Setembro de 2026 · demonstração"
          icon={<ClipboardCheck size={18} />}
        />
        <MetricCard
          label="Clientes com histórico"
          value={String(recurring).padStart(2, "0")}
          caption="Evolução que você pode acompanhar"
          icon={<MoveUpRight size={18} />}
        />
      </div>
      <div className="dashboard-middle">
        <ProgressChart assessments={history} compact />
        <section className="panel spotlight">
          <div className="spotlight-title">
            <span className="eyebrow">JORNADA EM DESTAQUE</span>
            <ArrowUpRight size={19} />
          </div>
          <div className="spotlight-person">
            <Avatar client={nathan} large />
            <h3>{nathan.name}</h3>
            <p>Composição corporal · {history.length} avaliações</p>
          </div>
          <div className="spotlight-metric">
            <span>
              {fmt(result?.bodyFat)}
              <small>%</small>
            </span>
            <p>Gordura corporal estimada</p>
          </div>
          <div className="spotlight-bottom">
            <div>
              <small>MASSA MAGRA</small>
              <strong>
                {fmt(result?.leanMass)} <span>kg</span>
              </strong>
            </div>
            <div>
              <small>CINTURA</small>
              <strong>
                {fmt(history[0]?.circumferences.waist, 0)} <span>cm</span>
              </strong>
            </div>
          </div>
          <Link
            href={`/clientes/${nathan.id}`}
            className="button outline full-width"
          >
            Ver jornada completa <ArrowRight size={16} />
          </Link>
          <span className="demo-footnote">
            Cliente fictício · Dados de demonstração
          </span>
        </section>
      </div>
      <section className="panel">
        <SectionTitle
          title="Avaliações recentes"
          sub="Continue de onde a evolução parou."
          action={<TextLink href="/avaliacoes">Ver todas</TextLink>}
        />
        <div className="assessment-table">
          <div className="table-head">
            <span>CLIENTE</span>
            <span>DATA</span>
            <span>GORDURA CORPORAL</span>
            <span>PESO</span>
            <span />
          </div>
          {recent.map((a) => {
            const c = clients.find((c) => c.id === a.clientId)!;
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="table-row"
              >
                <span className="table-person">
                  <Avatar client={c} />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.goal}</small>
                  </span>
                </span>
                <span className="table-date">
                  <CalendarDays size={13} />
                  {dateLabel(a.date)}
                </span>
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
        </div>
      </section>
      <div className="bottom-prompt">
        <span>
          <Plus size={18} />
          Uma nova avaliação. Um novo ponto de partida.
        </span>
        <TextLink href="/clientes">Encontrar cliente</TextLink>
      </div>
    </>
  );
}
