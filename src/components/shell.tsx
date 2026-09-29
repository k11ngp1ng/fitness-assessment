"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  TrendingUp,
  FileText,
  ChevronRight,
  ArrowUpRight,
  Dumbbell,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Loading } from "./ui";
import { StorageRecovery } from "./storage-recovery";
import { BrandMark } from "./brand-mark";
import { BrasiliaClock } from "./brasilia-clock";
const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { href: "/evolucao", label: "Evolução", icon: TrendingUp },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
];
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    store = useStore();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Vértice início">
          <span className="brand-symbol">
            <BrandMark />
          </span>
          <span>
            vértice<span className="brand-sub">PERFORMANCE LAB</span>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Navegação principal">
          {nav.map((n) => (
            <Link
              className={`nav-item ${(n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "active" : ""}`}
              href={n.href}
              aria-label={n.label}
              title={n.label}
              aria-current={
                (n.href === "/" ? path === "/" : path.startsWith(n.href))
                  ? "page"
                  : undefined
              }
              key={n.href}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.href === "/clientes" && (
                <span className="nav-count">
                  {store.clients.filter((c) => !c.archivedAt).length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="live-dot" /> SEU PRÓXIMO NÍVEL
            <h3>
              Precisão que
              <br />
              vira evolução.
            </h3>
            <p>Cada medida conta uma história.</p>
            <Link href="/evolucao">
              Explore os resultados <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="trainer">
            <span className="trainer-avatar">PT</span>
            <div>
              <strong>Personal Trainer</strong>
              <small>Workspace demonstrativo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={13} />
            <span>
              {nav.find((n) => n.href !== "/" && path.startsWith(n.href))
                ?.label || "Visão geral"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span className="live-dot" />
              <span className="demo-label-full">Modo demonstração</span>
              <span className="demo-label-short">Demo</span>
            </span>
            <BrasiliaClock />
            <span className="small-logo" aria-hidden="true">
              <BrandMark />
            </span>
          </div>
        </header>
        {store.storageError && (
          <div role="alert" className="storage-alert">
            {store.storageError}
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {!store.ready ? (
            <Loading />
          ) : store.recovery ? (
            <StorageRecovery />
          ) : (
            children
          )}
        </main>
        <footer className="app-footer">
          <span>
            VÉRTICE <span>·</span> Precisão em cada evolução.
          </span>
          <span>Dados demonstrativos · Armazenamento local</span>
        </footer>
      </div>
    </div>
  );
}
