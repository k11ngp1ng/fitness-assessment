"use client";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  Activity,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmt } from "@/lib/format";
import { parseDecimal } from "@/lib/validation";
import type { Client } from "@/types";
export function Avatar({
  client,
  large = false,
}: {
  client: Client;
  large?: boolean;
}) {
  return (
    <span className={`avatar ${client.color} ${large ? "large" : ""}`}>
      {client.initials}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function NewAssessment({ clientId }: { clientId?: string }) {
  return (
    <Link
      className="button primary"
      href={`/avaliacoes/nova${clientId ? `?cliente=${clientId}` : ""}`}
    >
      <Plus size={17} />
      Nova avaliação
    </Link>
  );
}
export function MetricCard({
  label,
  value,
  unit,
  delta,
  caption,
  featured = false,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: number | null;
  caption?: string;
  featured?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className={`metric-card ${featured ? "featured" : ""}`}>
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>
      <div className="metric-bottom">
        {delta != null && (
          <span className="delta">
            {delta < 0 ? (
              <ArrowDownRight size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}{" "}
            {fmt(Math.abs(delta))}
          </span>
        )}
        <span>{caption || "Última avaliação"}</span>
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Activity size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Buscar cliente...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches("input,textarea,select") ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  return (
    <label className="search-box">
      <Search size={17} />
      <input
        ref={inputRef}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <kbd>/</kbd>
    </label>
  );
}
export function NumberField({
  label,
  value,
  onChange,
  unit,
  onFocus,
  required = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit: string;
  onFocus?: () => void;
  required?: boolean;
}) {
  const [raw, setRaw] = useState(
    value === null ? "" : String(value).replace(".", ","),
  );
  useEffect(() => {
    setRaw(
      value === null
        ? ""
        : Number.isNaN(value)
          ? "-"
          : String(value).replace(".", ","),
    );
  }, [value]);
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="required"> *</span>}
      </span>
      <div
        className={`number-control ${value !== null && (!Number.isFinite(value) || value <= 0) ? "invalid" : ""}`}
      >
        <input
          type="text"
          inputMode="decimal"
          required={required}
          aria-invalid={
            value !== null && (!Number.isFinite(value) || value <= 0)
          }
          value={raw}
          onFocus={(e) => {
            e.target.select();
            onFocus?.();
          }}
          onChange={(e) => {
            const input = e.target.value;
            setRaw(input);
            onChange(parseDecimal(input));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const fields = Array.from(
                e.currentTarget
                  .closest("form")
                  ?.querySelectorAll<HTMLInputElement>(
                    "input,select,textarea",
                  ) || [],
              );
              fields[fields.indexOf(e.currentTarget) + 1]?.focus();
            }
          }}
        />
        <span>{unit}</span>
      </div>
    </label>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}
export function SectionTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="loader" />
      Preparando seu espaço de trabalho…
    </div>
  );
}
