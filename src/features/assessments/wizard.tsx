"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CloudCheck,
  Info,
  Keyboard,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { newDraft } from "@/data/seed";
import { errors } from "@/lib/validation";
import { Avatar, EmptyState, PageHeader } from "@/components/ui";
import { BodyMap } from "@/components/body-map";
import {
  BasicData,
  Circumferences,
  Review,
  Skinfolds,
} from "@/features/measurements/steps";
import type { Client, Draft } from "@/types";
const steps = ["Dados", "Dobras", "Perimetria", "Revisão", "Resultado"];
export function AssessmentWizard() {
  const { clients } = useStore();
  const query = useSearchParams();
  const [clientId, setClientId] = useState(query.get("cliente") || "");
  const client = clients.find((c) => c.id === clientId);
  return (
    <>
      <Link
        href={client ? `/clientes/${client.id}` : "/avaliacoes"}
        className="back-link"
      >
        <ArrowLeft size={15} />
        {client ? "Voltar para o cliente" : "Todas as avaliações"}
      </Link>
      <PageHeader
        eyebrow="AVALIAÇÃO FÍSICA"
        title="Uma nova leitura. Um novo começo."
        description="Da coleta ao resultado, com precisão em cada etapa."
      />
      {client ? (
        <Wizard key={clientId} client={client} />
      ) : (
        <section className="panel choose-client">
          <h2>Quem vamos avaliar?</h2>
          <p>Selecione um cliente para iniciar ou retomar sua avaliação.</p>
          <label className="field">
            <span>Cliente</span>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {!clients.length && (
            <EmptyState
              title="Nenhum cliente cadastrado"
              description="Cadastre um cliente para começar."
            />
          )}
          <Link className="text-link" href="/clientes">
            Cadastrar um novo cliente <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </>
  );
}
function Wizard({ client }: { client: Client }) {
  const store = useStore(),
    router = useRouter();
  const [draft, setDraft] = useState<Draft>(
    () => store.drafts[client.id] || newDraft(client),
  );
  const [active, setActive] = useState("chest"),
    [validation, setValidation] = useState<string[]>([]),
    [saving, setSaving] = useState(false);
  const [resumed] = useState(!!store.drafts[client.id]);
  const initial = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    store.saveDraft(draft);
    setSaved(
      true,
    ); /* Save only when draft changes, not when provider changes. */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  function update(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setValidation([]);
  }
  function go(step: number) {
    update({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLElement>("input,select,textarea,button")
        ?.focus({ preventScroll: true }),
    );
  }
  function next() {
    const e = errors(draft, draft.step);
    setValidation(e);
    if (e.length) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    if (draft.step < 3) {
      go(draft.step + 1);
      return;
    }
    setSaving(true);
    const { step: _, ...assessment } = draft;
    const ok = store.saveAssessment(assessment);
    if (ok) {
      router.push(`/avaliacoes/${assessment.id}?salva=1`);
    } else {
      setSaving(false);
      setValidation([
        "A avaliação está nesta sessão, mas não foi persistida. Libere espaço no navegador e tente finalizar novamente.",
      ]);
    }
  }
  return (
    <>
      <div className="assessment-client">
        <Avatar client={client} />
        <div>
          <strong>{client.name}</strong>
          <span>
            {client.age} anos · {client.fitness}
          </span>
        </div>
        <span className="autosave">
          <CloudCheck size={15} />
          {store.storageError
            ? "Salvo apenas na sessão"
            : saved
              ? "Rascunho salvo neste navegador"
              : resumed
                ? "Rascunho recuperado"
                : "Salvamento automático local"}
        </span>
      </div>
      <nav className="stepper" aria-label="Etapas da avaliação">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`step ${i === draft.step ? "active" : i < draft.step ? "complete" : ""}`}
            aria-current={i === draft.step ? "step" : undefined}
          >
            <button
              type="button"
              disabled={i >= draft.step}
              onClick={() => go(i)}
            >
              <span>{i < draft.step ? <Check size={15} /> : i + 1}</span>
              {s}
            </button>
            {i < 4 && <div className="step-line" />}
          </div>
        ))}
      </nav>
      <div
        className={`assessment-layout ${draft.step === 3 ? "review-layout" : ""}`}
      >
        <form
          className="panel assessment-form"
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          noValidate
        >
          {draft.step === 0 && <BasicData draft={draft} update={update} />}
          {draft.step === 1 && (
            <Skinfolds draft={draft} update={update} onFocus={setActive} />
          )}
          {draft.step === 2 && (
            <Circumferences draft={draft} update={update} onFocus={setActive} />
          )}
          {draft.step === 3 && <Review draft={draft} onEdit={go} />}
          {validation.length > 0 && (
            <div className="error-message" role="alert" tabIndex={-1}>
              {validation.map((v) => (
                <p key={v}>{v}</p>
              ))}
            </div>
          )}
          <div className="form-footer">
            {draft.step > 0 ? (
              <button
                type="button"
                className="button outline"
                onClick={() => go(draft.step - 1)}
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
            ) : (
              <span className="muted small">* Campos obrigatórios</span>
            )}
            <button type="submit" disabled={saving} className="button primary">
              {draft.step === 3
                ? saving
                  ? "Salvando…"
                  : "Finalizar avaliação"
                : "Continuar"}
              {draft.step === 3 ? (
                <CheckCheck size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          </div>
        </form>
        <aside className="assessment-aside">
          <section className="panel">
            <span className="eyebrow">
              {draft.step === 3
                ? "PRONTO PARA APRESENTAR"
                : "REFERÊNCIA CORPORAL"}
            </span>
            <BodyMap active={active} />
            <h3>
              {draft.step === 1
                ? "Uma leitura de cada vez."
                : draft.step === 2
                  ? "Cada região, bem definida."
                  : draft.step === 3
                    ? "O próximo passo é visualizar."
                    : "O corpo conta uma história."}
            </h3>
            <p>
              {draft.step === 1
                ? "Selecione uma leitura para destacar a região no mapa. O desenho é ilustrativo; use a técnica padronizada do protocolo."
                : draft.step === 2
                  ? "Registre braços relaxados e contraídos separadamente. Campos em branco permanecem não registrados."
                  : "A consistência da coleta torna as comparações mais úteis ao longo do tempo."}
            </p>
          </section>
          <div className="aside-tip">
            <Keyboard size={18} />
            <div>
              <strong>Feito para o seu ritmo</strong>
              <p>
                Use Tab ou Enter para avançar pelas medidas sem tirar as mãos do
                teclado.
              </p>
            </div>
          </div>
          <div className="aside-tip">
            <Info size={18} />
            <p>As estimativas de composição corporal não são um diagnóstico.</p>
          </div>
          {resumed && (
            <span className="resumed">
              <RotateCcw size={13} />
              Continuando seu rascunho
            </span>
          )}
        </aside>
      </div>
    </>
  );
}
