"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>Algo interrompeu o carregamento.</h1>
      <p>
        Tente abrir a página novamente. Seus dados salvos continuam neste
        navegador.
      </p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
