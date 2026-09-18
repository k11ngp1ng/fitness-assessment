"use client";
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
  const filtered = store.clients.filter(
    (c) =>
      c.name
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")) &&
      (tab === "all" ||
        (tab === "history"
          ? historyFor(store.assessments, c.id).length > 0
          : historyFor(store.assessments, c.id).length === 0)),
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
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={tab === id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "all" && <span>{store.clients.length}</span>}
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
              href={`/clientes/${c.id}`}
              key={c.id}
            >
              <div className="client-card-top">
                <Avatar client={c} large />
                <ArrowUpRight size={20} />
              </div>
              <h2>{c.name}</h2>
              <p>{c.goal}</p>
              <span className="tag">{c.fitness}</span>
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
          description="Experimente outro nome ou crie um novo cliente."
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
function ClientForm({ onDone }: { onDone: () => void }) {
  const { addClient } = useStore();
  const [form, setForm] = useState({
    name: "",
    age: 25,
    height: 1.75,
    weight: 75,
    sex: "male",
    fitness: "Ativo",
    goal: "Composição corporal",
  });
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
        addClient({
          ...form,
          name,
          id: crypto.randomUUID(),
          sex: form.sex as Client["sex"],
          fitness: form.fitness as Client["fitness"],
          initials: name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")
            .toUpperCase(),
          color: "lime",
          createdAt: today(),
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
            onChange={(e) => setForm({ ...form, sex: e.target.value })}
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
            onChange={(e) => setForm({ ...form, fitness: e.target.value })}
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
        Criar cliente
      </button>
    </form>
  );
}
