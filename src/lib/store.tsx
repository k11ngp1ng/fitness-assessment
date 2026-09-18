"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clients as seedClients,
  assessments as seedAssessments,
} from "@/data/seed";
import {
  CIRCUMFERENCES,
  SITES,
  type Assessment,
  type Client,
  type Draft,
} from "@/types";
import { errors } from "@/lib/validation";
type Data = {
  clients: Client[];
  assessments: Assessment[];
  drafts: Record<string, Draft>;
};
type Store = Data & {
  ready: boolean;
  storageError: string;
  addClient: (c: Client) => boolean;
  saveAssessment: (a: Assessment) => boolean;
  saveDraft: (d: Draft) => void;
};
const Context = createContext<Store | null>(null);
const KEY = "vertice:v1";
const initial: Data = {
  clients: seedClients,
  assessments: seedAssessments,
  drafts: {},
};
function validClient(c: Client) {
  return (
    c &&
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.initials === "string" &&
    ["male", "female", "other"].includes(c.sex) &&
    Number.isFinite(c.age) &&
    Number.isFinite(c.height) &&
    Number.isFinite(c.weight)
  );
}
function validAssessment(a: Assessment) {
  return (
    a &&
    typeof a.id === "string" &&
    typeof a.clientId === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
    a.protocol === "jp7-male" &&
    Number.isFinite(a.age) &&
    Number.isFinite(a.weight) &&
    Array.isArray(a.skinfolds) &&
    a.skinfolds.length === 7 &&
    SITES.every((site) =>
      a.skinfolds.some(
        (s) =>
          s.site === site &&
          Array.isArray(s.readings) &&
          s.readings.length === 3 &&
          s.readings.every((v) => v === null || typeof v === "number"),
      ),
    ) &&
    a.circumferences &&
    CIRCUMFERENCES.every(
      (k) =>
        a.circumferences[k] === null || typeof a.circumferences[k] === "number",
    )
  );
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(initial),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          !Array.isArray(parsed.clients) ||
          !parsed.clients.every(validClient) ||
          !Array.isArray(parsed.assessments) ||
          !parsed.assessments.every(
            (a: Assessment) =>
              validAssessment(a) &&
              errors(a, 3).length === 0 &&
              parsed.clients.some((c: Client) => c.id === a.clientId),
          ) ||
          !parsed.drafts ||
          typeof parsed.drafts !== "object" ||
          !Object.values(parsed.drafts).every(
            (d) =>
              validAssessment(d as Draft) &&
              parsed.clients.some(
                (c: Client) => c.id === (d as Draft).clientId,
              ) &&
              Number.isInteger((d as Draft).step) &&
              (d as Draft).step >= 0 &&
              (d as Draft).step <= 3,
          )
        )
          throw new Error();
        setData(parsed);
      }
    } catch {
      setStorageError(
        "Não foi possível ler os dados locais. A demonstração está disponível; os dados existentes não foram substituídos.",
      );
    }
    setReady(true);
  }, []);
  function persist(next: Data): boolean {
    try {
      // Preserve invalid numeric draft entries as invalid, rather than JSON's
      // default null conversion (which could silently omit an optional measure).
      localStorage.setItem(
        KEY,
        JSON.stringify(next, (_key, value) =>
          typeof value === "number" && !Number.isFinite(value) ? -1 : value,
        ),
      );
      setData(next);
      setStorageError("");
      return true;
    } catch {
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
        storageError,
        addClient: (c) => persist({ ...data, clients: [...data.clients, c] }),
        saveDraft: (d) => {
          persist({ ...data, drafts: { ...data.drafts, [d.clientId]: d } });
        },
        saveAssessment: (a) => {
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
