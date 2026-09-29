"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clients as seedClients,
  assessments as seedAssessments,
} from "@/data/seed";
import type { Assessment, Client, Draft } from "@/types";
import { today } from "@/lib/format";
import {
  LocalRepository,
  RecoveryError,
  STORAGE_KEY,
  type LocalData as Data,
} from "@/lib/storage";
type Store = Data & {
  ready: boolean;
  recovery: RecoveryError | null;
  retryRead: () => void;
  resetLocal: () => boolean;
  storageError: string;
  addClient: (c: Client) => boolean;
  updateClient: (c: Client) => boolean;
  setClientArchived: (id: string, archived: boolean) => boolean;
  saveAssessment: (a: Assessment) => boolean;
  saveDraft: (d: Draft) => void;
};
const Context = createContext<Store | null>(null);

const initial: Data = {
  clients: seedClients,
  assessments: seedAssessments,
  drafts: {},
};
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(initial),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState("");
  const [recovery, setRecovery] = useState<RecoveryError | null>(null);
  const [repository] = useState(() => new LocalRepository(() => localStorage));
  const retryRead = useCallback(() => {
    try {
      setData(repository.read(initial));
      setRecovery(null);
      setStorageError("");
    } catch (error) {
      if (error instanceof RecoveryError) setRecovery(error);
    }
    setReady(true);
  }, [repository]);
  useEffect(() => {
    // A leitura precisa terminar antes de expor os formulários após a hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    retryRead();
    function changed(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      repository.invalidate();
      setRecovery(
        new RecoveryError(
          "O armazenamento mudou em outra aba. Recarregue os dados salvos para continuar.",
          event.newValue,
          false,
        ),
      );
    }
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener("storage", changed);
    };
  }, [repository, retryRead]);
  function resetLocal(): boolean {
    if (!recovery?.readable) return false;
    try {
      repository.reset(recovery.raw, initial, crypto.randomUUID());
      setData(initial);
      setRecovery(null);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "Não foi possível reinicializar com segurança. O original e qualquer cópia já criada foram mantidos. Libere espaço ou recarregue os dados salvos.",
      );
      return false;
    }
  }
  function persist(next: Data): boolean {
    try {
      repository.write(next);
      setData(next);
      setStorageError("");
      return true;
    } catch (error) {
      if (error instanceof RecoveryError) {
        setRecovery(error);
        return false;
      }
      setData(next);
      setStorageError(
        "Armazenamento indisponível. As alterações estão apenas nesta sessão. Libere espaço antes de fechar a página.",
      );
      return false;
    }
  }
  return (
    <Context.Provider
      value={{
        ...data,
        ready,
        recovery,
        retryRead,
        resetLocal,
        storageError,
        addClient: (c) =>
          persist({
            ...data,
            clients: data.clients.some((existing) => existing.id === c.id)
              ? data.clients.map((existing) =>
                  existing.id === c.id ? c : existing,
                )
              : [...data.clients, c],
          }),
        updateClient: (updated) => {
          if (!data.clients.some((c) => c.id === updated.id)) return false;
          return persist({
            ...data,
            clients: data.clients.map((c) =>
              c.id === updated.id
                ? {
                    ...updated,
                    createdAt: c.createdAt,
                    archivedAt: c.archivedAt,
                  }
                : c,
            ),
          });
        },
        setClientArchived: (id, archived) => {
          if (!data.clients.some((c) => c.id === id)) return false;
          return persist({
            ...data,
            clients: data.clients.map((c) =>
              c.id === id ? { ...c, archivedAt: archived ? today() : null } : c,
            ),
          });
        },
        saveDraft: (d) => {
          if (!data.clients.some((c) => c.id === d.clientId && !c.archivedAt))
            return;
          persist({ ...data, drafts: { ...data.drafts, [d.clientId]: d } });
        },
        saveAssessment: (a) => {
          if (!data.clients.some((c) => c.id === a.clientId && !c.archivedAt))
            return false;
          const drafts = { ...data.drafts };
          delete drafts[a.clientId];
          return persist({
            ...data,
            drafts,
            assessments: [...data.assessments.filter((x) => x.id !== a.id), a],
            clients: data.clients.map((c) =>
              c.id === a.clientId &&
              historyFor(
                [...data.assessments.filter((x) => x.id !== a.id), a],
                c.id,
              )[0]?.id === a.id
                ? {
                    ...c,
                    weight: a.weight,
                    height: a.height,
                    age: a.age,
                    fitness: a.fitness,
                  }
                : c,
            ),
          });
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => {
  const s = useContext(Context);
  if (!s) throw new Error("StoreProvider required");
  return s;
};
export const historyFor = (assessments: Assessment[], id: string) =>
  assessments
    .filter((a) => a.clientId === id)
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date));
