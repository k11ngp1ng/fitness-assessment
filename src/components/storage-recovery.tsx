"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

export function StorageRecovery() {
  const { recovery, retryRead, resetLocal } = useStore();
  const [confirmedFor, setConfirmedFor] = useState<typeof recovery>(null);
  const confirmed = confirmedFor === recovery;
  const [downloadError, setDownloadError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [recovery]);
  if (!recovery) return null;
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob([recovery!.raw ?? ""], { type: "text/plain;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "vertice-conteudo-original.txt";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError("");
    } catch {
      setDownloadError(
        "Não foi possível baixar o conteúdo. Tente novamente neste navegador.",
      );
    }
  }
  return (
    <section className="panel recovery-panel" aria-labelledby="recovery-title">
      <h1 id="recovery-title" ref={heading} tabIndex={-1}>
        Recuperar dados locais
      </h1>
      <p role="alert">{recovery.message}</p>
      <p>
        As gravações estão bloqueadas para proteger seus registros. Nenhum dado
        demonstrativo substituirá o conteúdo automaticamente.
      </p>
      <p>
        Ao recarregar os dados salvos, alterações que estavam apenas nesta
        sessão serão descartadas. Se você corrigiu ou restaurou o armazenamento,
        tente a leitura novamente.
      </p>
      <div className="recovery-actions">
        <button className="button primary" onClick={retryRead}>
          Recarregar dados salvos
        </button>
        {recovery.readable && recovery.raw !== null && (
          <button className="button outline" onClick={download}>
            Baixar conteúdo original
          </button>
        )}
      </div>
      {downloadError && <p role="alert">{downloadError}</p>}
      {recovery.readable && (
        <>
          <h2>Reinicializar a demonstração</h2>
          <p>
            Uma cópia integral do conteúdo original será mantida separadamente
            neste navegador antes de substituir os dados ativos pelos exemplos.
            Essa cópia local não é um backup externo; baixe o original para
            guardá-lo fora do navegador.
          </p>
          <label className="recovery-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) =>
                setConfirmedFor(e.target.checked ? recovery : null)
              }
            />{" "}
            Confirmo que desejo substituir os dados ativos pelos exemplos.
          </label>
          <button
            className="button outline"
            disabled={!confirmed}
            onClick={() => {
              if (confirmed) resetLocal();
            }}
          >
            Preservar cópia e reinicializar
          </button>
        </>
      )}
    </section>
  );
}
