"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Printer,
} from "lucide-react";
import { useStore, historyFor } from "@/lib/store";
import { calculate, compare, difference } from "@/lib/calculations";
import { circumferenceLabels, dateLabel, fmt, signed } from "@/lib/format";
import { Avatar, EmptyState, MetricCard, SectionTitle } from "@/components/ui";
import { ProgressChart } from "@/components/progress-chart";
import { BodyMap } from "@/components/body-map";
import { CIRCUMFERENCES, type Assessment } from "@/types";
export function Comparisons({
  current,
  previous,
}: {
  current: Assessment;
  previous: Assessment;
}) {
  const delta = compare(current, previous);
  const a = calculate(current),
    b = calculate(previous);
  const items = [
    {
      label: "Gordura corporal",
      before: b.bodyFat,
      after: a.bodyFat,
      delta: delta.bodyFat,
      unit: "%",
      diffUnit: "p.p.",
    },
    {
      label: "Cintura",
      before: previous.circumferences.waist,
      after: current.circumferences.waist,
      delta: delta.waist,
      unit: "cm",
      diffUnit: "cm",
    },
    {
      label: "Massa magra",
      before: b.leanMass,
      after: a.leanMass,
      delta: delta.leanMass,
      unit: "kg",
      diffUnit: "kg",
    },
    {
      label: "Peso corporal",
      before: previous.weight,
      after: current.weight,
      delta: delta.weight,
      unit: "kg",
      diffUnit: "kg",
    },
  ];
  return (
    <section className="comparison-section">
      <SectionTitle
        title="Desde a última avaliação"
        sub={`${dateLabel(previous.date)} → ${dateLabel(current.date)} · Mudanças, sem julgamentos.`}
      />
      <div className="comparison-grid">
        {items.map((i) => (
          <div className="panel comparison-card" key={i.label}>
            <span>{i.label}</span>
            <div>
              <span>{fmt(i.before)}</span>
              <ArrowRight size={15} />
              <strong>
                {fmt(i.after)} <small>{i.unit}</small>
              </strong>
            </div>
            <b>
              {i.delta === null
                ? "Sem comparação"
                : `${signed(i.delta)} ${i.diffUnit}`}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}
export function Results({
  id,
  report = false,
}: {
  id: string;
  report?: boolean;
}) {
  const { clients, assessments } = useStore();
  const query = useSearchParams();
  const assessment = assessments.find((a) => a.id === id);
  const client = clients.find((c) => c.id === assessment?.clientId);
  if (!assessment || !client)
    return (
      <EmptyState
        title="Avaliação não encontrada"
        description="Este resultado não está disponível no armazenamento local."
      />
    );
  const a = assessment,
    result = calculate(a),
    history = historyFor(assessments, client.id),
    currentIndex = history.findIndex((x) => x.id === a.id),
    previous = history[currentIndex + 1],
    until = history.slice(currentIndex);
  return (
    <div className={report ? "report-view" : "results-view"}>
      <div className="results-toolbar">
        <Link href={`/clientes/${client.id}`} className="back-link">
          <ArrowLeft size={15} />
          Jornada de {client.name.split(" ")[0]}
        </Link>
        {report ? (
          <button onClick={() => window.print()} className="button primary">
            <Printer size={16} />
            Imprimir / Salvar PDF
          </button>
        ) : (
          <Link href={`/relatorios/${id}`} className="button outline">
            <FileText size={16} />
            Ver relatório
          </Link>
        )}
      </div>
      {query.get("salva") === "1" && (
        <div className="success-banner" role="status">
          <CheckCircle2 size={18} />
          Avaliação finalizada e salva neste navegador.
        </div>
      )}
      <header className="result-hero">
        <div>
          <div className="eyebrow">
            VÉRTICE /{" "}
            {report
              ? "RELATÓRIO DE AVALIAÇÃO FÍSICA"
              : "PRECISÃO QUE REVELA EVOLUÇÃO"}
          </div>
          <h1>
            {report ? "Seu corpo. Sua trajetória." : "Resultado da avaliação."}
          </h1>
          <div className="result-client">
            <Avatar client={client} />
            <div>
              <strong>{client.name}</strong>
              <span>
                {dateLabel(a.date, true)} <span>·</span> {a.age} anos{" "}
                <span>·</span> {fmt(a.height, 2)} m
              </span>
            </div>
          </div>
        </div>
        <div className="result-stamp">
          <span>V</span>
          <small>
            PERFORMANCE
            <br />
            ASSESSMENT
          </small>
        </div>
      </header>
      <div className="stats-grid four">
        <MetricCard
          featured
          label="Gordura corporal"
          value={fmt(result.bodyFat)}
          unit="%"
          caption="Estimativa · Jackson & Pollock"
        />
        <MetricCard
          label="Massa magra"
          value={fmt(result.leanMass)}
          unit="kg"
          caption="Massa livre de gordura"
        />
        <MetricCard
          label="Massa gorda"
          value={fmt(result.fatMass)}
          unit="kg"
          caption="Composição estimada"
        />
        <MetricCard
          label="Peso corporal"
          value={fmt(a.weight)}
          unit="kg"
          caption={`Registrado em ${dateLabel(a.date)}`}
        />
      </div>
      <section className="panel composition-strip">
        <div>
          <span className="legend-dot" />
          Massa magra <b>{fmt(100 - result.bodyFat)}%</b>
        </div>
        <div className="composition-track">
          <span style={{ width: `${100 - result.bodyFat}%` }} />
        </div>
        <div>
          <span className="legend-dot fat" />
          Massa gorda <b>{fmt(result.bodyFat)}%</b>
        </div>
      </section>
      {previous ? (
        <Comparisons current={a} previous={previous} />
      ) : (
        <div className="notice">
          Primeira avaliação: este é o ponto de partida para as próximas
          comparações.
        </div>
      )}
      <div className="results-body">
        <section className="panel">
          <SectionTitle
            title="O desenho das suas medidas"
            sub="Perimetria corporal · centímetros"
          />
          <div className="result-circumferences">
            {CIRCUMFERENCES.map((k) => (
              <div key={k}>
                <span>{circumferenceLabels[k]}</span>
                <strong>
                  {a.circumferences[k] === null ? (
                    <small>Não registrado</small>
                  ) : (
                    <>
                      {fmt(a.circumferences[k])}
                      <small> cm</small>
                    </>
                  )}
                </strong>
              </div>
            ))}
          </div>
          {a.historicalNote && (
            <p className="historical-note">{a.historicalNote}</p>
          )}
        </section>
        <section className="panel result-map">
          <BodyMap />
          <div className="symmetry-mini">
            <h3>Comparação bilateral</h3>
            {[
              [
                "Braços relaxados",
                difference(
                  a.circumferences.rightRelaxed,
                  a.circumferences.leftRelaxed,
                ),
              ],
              [
                "Braços contraídos",
                difference(
                  a.circumferences.rightContracted,
                  a.circumferences.leftContracted,
                ),
              ],
              [
                "Coxas",
                difference(
                  a.circumferences.rightThigh,
                  a.circumferences.leftThigh,
                ),
              ],
            ].map(([label, value]) => (
              <div key={label as string}>
                <span>{label}</span>
                <strong>{fmt(value as number | null)} cm</strong>
              </div>
            ))}
            <p>Diferenças absolutas, sem diagnóstico.</p>
          </div>
        </section>
      </div>
      <ProgressChart assessments={until} />
      <section className="panel notes-panel">
        <SectionTitle
          title="Olhar do profissional"
          sub="Observações desta avaliação"
        />
        <p className="notes-text">
          {a.notes || "Nenhuma observação registrada."}
        </p>
      </section>
      <section className="methodology">
        <div>
          <strong>Transparência no método</strong>
          <p>
            Jackson & Pollock (1978), 7 dobras para homens de 18–61 anos.
            Conversão de Siri (1961). Estimativas sujeitas à técnica de coleta e
            às limitações do protocolo.
          </p>
          <p>
            Soma das médias: <b>{fmt(result.sum)} mm</b> <span>·</span>{" "}
            Densidade corporal: <b>{fmt(result.density, 5)} g/mL</b>
          </p>
        </div>
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/718832/"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Referência científica <ArrowUpRight size={15} />
        </a>
      </section>
      <footer className="report-footer">
        <span>VÉRTICE · PERSONAL TRAINING</span>
        <span>
          {a.demo
            ? "Avaliação demonstrativa · Dados fictícios"
            : "Avaliação registrada localmente"}{" "}
          · {dateLabel(a.date)}
        </span>
      </footer>
    </div>
  );
}
