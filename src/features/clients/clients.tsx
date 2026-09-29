"use client";
import { recordHref } from "@/lib/routes";
import Link from "next/link";
import { useRef, useState } from "react";
import { Plus, ArrowUpRight, X, Users, Check } from "lucide-react";
import { historyFor, useStore } from "@/lib/store";
import {
  Avatar,
  EmptyState,
  NumberField,
  PageHeader,
  SearchBox,
} from "@/components/ui";
import { dateLabel, fmt, today } from "@/lib/format";
import type { Client } from "@/types";
export function Clients() {
  const store = useStore();
  const [search, setSearch] = useState(""),
    [tab, setTab] = useState("all");
  const dialog = useRef<HTMLDialogElement>(null);
  const activeClients = store.clients.filter((c) => !c.archivedAt);
  const filtered = store.clients.filter(
    (c) =>
      c.name
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")) &&
      (tab === "archived"
        ? !!c.archivedAt
        : !c.archivedAt &&
          (tab === "all" ||
            (tab === "history"
              ? historyFor(store.assessments, c.id).length > 0
              : historyFor(store.assessments, c.id).length === 0))),
  );
  return (
    <>
      <PageHeader
        eyebrow="GESTÃO DE CLIENTES"
        title="Pessoas. Jornadas. Resultados."
        description="Conheça cada trajetória e acompanhe o que faz a diferença."
        action={
          <button
            className="button primary"
            onClick={() => dialog.current?.showModal()}
          >
            <Plus size={17} />
            Novo cliente
          </button>
        }
      />
      <div className="list-toolbar">
        <div className="filter-tabs">
          {[
            ["all", "Todos os clientes"],
            ["history", "Com avaliações"],
            ["new", "Sem avaliação"],
            ["archived", "Arquivados"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={tab === id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "all" && <span>{activeClients.length}</span>}
              {id === "archived" && (
                <span>{store.clients.length - activeClients.length}</span>
              )}
            </button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} />
      </div>
      <div className="clients-grid">
        {filtered.map((c) => {
          const h = historyFor(store.assessments, c.id);
          return (
            <Link
              className="panel client-card"
              href={recordHref("client", c.id)}
              key={c.id}
            >
              <div className="client-card-top">
                <Avatar client={c} large />
                <ArrowUpRight size={20} />
              </div>
              <h2>{c.name}</h2>
              <p>{c.goal}</p>
              <span className="tag">
                {c.archivedAt ? `Condicionamento: ${c.fitness}` : c.fitness}
              </span>
              {c.archivedAt && (
                <span className="tag">
                  Arquivado em {dateLabel(c.archivedAt)}
                </span>
              )}
              <div className="client-facts">
                <div>
                  <small>IDADE</small>
                  <strong>
                    {c.age} <span>anos</span>
                  </strong>
                </div>
                <div>
                  <small>ALTURA</small>
                  <strong>
                    {fmt(c.height, 2)} <span>m</span>
                  </strong>
                </div>
                <div>
                  <small>PESO</small>
                  <strong>
                    {fmt(h[0]?.weight ?? c.weight)} <span>kg</span>
                  </strong>
                </div>
              </div>
              <div className="client-card-footer">
                <span>
                  {h.length
                    ? `Última: ${dateLabel(h[0].date)}`
                    : "Pronto para a primeira avaliação"}
                </span>
                <span>
                  {h.length} <Users size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {!filtered.length && (
        <EmptyState
          title="Nenhum cliente encontrado"
          description={
            tab === "archived"
              ? "Nenhum cliente arquivado corresponde à busca."
              : "Experimente outro nome ou crie um novo cliente."
          }
        />
      )}
      <dialog ref={dialog} className="modal">
        <div className="modal-heading">
          <div>
            <div className="eyebrow">NOVA JORNADA</div>
            <h2>Adicionar cliente</h2>
          </div>
          <button
            aria-label="Fechar cadastro"
            className="icon-button"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <ClientForm onDone={() => dialog.current?.close()} />
      </dialog>
    </>
  );
}
export function ClientForm({
  onDone,
  client,
}: {
  onDone: () => void;
  client?: Client;
}) {
  const { addClient, updateClient } = useStore();
  const pendingClientId = useRef<string | null>(null);
  const [form, setForm] = useState(() => ({
    name: client?.name ?? "",
    age: client?.age ?? 25,
    height: client?.height ?? 1.75,
    weight: client?.weight ?? 75,
    sex: client?.sex ?? "male",
    fitness: client?.fitness ?? "Ativo",
    goal: client?.goal ?? "Composição corporal",
  }));
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !form.name.trim() ||
          form.age <= 0 ||
          !Number.isInteger(form.age) ||
          form.height <= 0 ||
          form.weight <= 0 ||
          ![form.age, form.height, form.weight].every(Number.isFinite)
        ) {
          setError("Preencha um nome e medidas válidas.");
          return;
        }
        const name = form.name.trim();
        if (!client) pendingClientId.current ??= crypto.randomUUID();
        const updated: Client = {
          ...form,
          name,
          id: client?.id ?? pendingClientId.current ?? crypto.randomUUID(),
          sex: form.sex,
          fitness: form.fitness,
          initials: name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")
            .toUpperCase(),
          color: client?.color ?? "lime",
          createdAt: client?.createdAt ?? today(),
          archivedAt: client?.archivedAt ?? null,
        };
        const saved = client ? updateClient(updated) : addClient(updated);
        if (!saved) {
          setError(
            `Não foi possível salvar ${client ? "as alterações" : "o cliente"} neste navegador. ${client ? "As alterações estão" : "O cadastro está"} apenas nesta sessão. Verifique o aviso de armazenamento e tente novamente antes de fechar a página.`,
          );
          return;
        }
        pendingClientId.current = null;
        setError("");
        setForm({
          name: "",
          age: 25,
          height: 1.75,
          weight: 75,
          sex: "male",
          fitness: "Ativo",
          goal: "Composição corporal",
        });
        onDone();
      }}
    >
      <label className="field">
        <span>Nome completo</span>
        <input
          autoFocus
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Como seu cliente se chama?"
        />
      </label>
      <div className="form-grid">
        <NumberField
          label="Idade"
          unit="anos"
          value={form.age}
          onChange={(v) => setForm({ ...form, age: v ?? 0 })}
        />
        <label className="field">
          <span>Sexo</span>
          <select
            value={form.sex}
            onChange={(e) => {
              const sex = e.target.value;
              if (sex === "male" || sex === "female" || sex === "other")
                setForm({ ...form, sex });
            }}
          >
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro / não informado</option>
          </select>
        </label>
        <NumberField
          label="Altura"
          unit="m"
          value={form.height}
          onChange={(v) => setForm({ ...form, height: v ?? 0 })}
        />
        <NumberField
          label="Peso"
          unit="kg"
          value={form.weight}
          onChange={(v) => setForm({ ...form, weight: v ?? 0 })}
        />
        <label className="field">
          <span>Condicionamento</span>
          <select
            value={form.fitness}
            onChange={(e) => {
              const fitness = e.target.value;
              if (
                fitness === "Iniciante" ||
                fitness === "Ativo" ||
                fitness === "Atleta"
              )
                setForm({ ...form, fitness });
            }}
          >
            {["Iniciante", "Ativo", "Atleta"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Foco do acompanhamento</span>
          <select
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
          >
            {[
              "Composição corporal",
              "Performance esportiva",
              "Condicionamento",
              "Força e movimento",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <p className="muted small">
        O cálculo de sete dobras desta versão atende homens de 18 a 61 anos.
      </p>
      <button type="submit" className="button primary full-width">
        <Check size={17} />
        {client ? "Salvar alterações" : "Criar cliente"}
      </button>
    </form>
  );
}
