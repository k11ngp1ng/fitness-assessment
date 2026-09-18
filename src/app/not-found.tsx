import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Página não encontrada</h1>
      <p>Volte ao seu espaço de trabalho para continuar.</p>
      <Link href="/" className="button primary">
        Ir para visão geral
      </Link>
    </div>
  );
}
