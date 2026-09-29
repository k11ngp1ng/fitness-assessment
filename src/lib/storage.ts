import {
  CIRCUMFERENCES,
  SITES,
  type Assessment,
  type Client,
  type Draft,
} from "@/types";
import { errors } from "@/lib/validation";

export type LocalData = {
  clients: Client[];
  assessments: Assessment[];
  drafts: Record<string, Draft>;
};
export const STORAGE_KEY = "vertice:v1";
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const id = (v: unknown): v is string =>
  text(v) &&
  !!v.trim() &&
  !["__proto__", "constructor", "prototype"].includes(v);
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const measure = (v: unknown) => v === null || finite(v);
const sex = (v: unknown): v is Client["sex"] =>
  v === "male" || v === "female" || v === "other";
const fitness = (v: unknown): v is Client["fitness"] =>
  v === "Iniciante" || v === "Ativo" || v === "Atleta";
const date = (v: unknown): v is string =>
  text(v) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
function client(v: unknown, version: 1 | 2): Client | null {
  if (
    !object(v) ||
    !(
      id(v.id) &&
      text(v.name) &&
      !!v.name.trim() &&
      text(v.initials) &&
      sex(v.sex) &&
      fitness(v.fitness) &&
      finite(v.age) &&
      Number.isInteger(v.age) &&
      v.age > 0 &&
      finite(v.height) &&
      v.height > 0 &&
      finite(v.weight) &&
      v.weight > 0 &&
      text(v.color) &&
      text(v.goal) &&
      date(v.createdAt)
    ) ||
    (version === 1
      ? v.archivedAt !== undefined && v.archivedAt !== null
      : v.archivedAt !== null && !date(v.archivedAt))
  )
    return null;
  // All declared Client fields were checked above. Preserve unrelated v1 fields.
  return { ...v, archivedAt: version === 1 ? null : v.archivedAt } as Client;
}
function assessment(v: unknown): v is Assessment {
  if (
    !object(v) ||
    !id(v.id) ||
    !id(v.clientId) ||
    !text(v.date) ||
    !sex(v.sex) ||
    !fitness(v.fitness) ||
    !finite(v.age) ||
    !finite(v.height) ||
    !finite(v.weight) ||
    v.protocol !== "jp7-male" ||
    !text(v.notes) ||
    (v.historicalNote !== undefined && !text(v.historicalNote)) ||
    typeof v.demo !== "boolean" ||
    !Array.isArray(v.skinfolds) ||
    v.skinfolds.length !== SITES.length ||
    !object(v.circumferences)
  )
    return false;
  const folds = v.skinfolds;
  const circumferences = v.circumferences;
  return (
    SITES.every(
      (site) =>
        folds.filter(
          (m) =>
            object(m) &&
            m.site === site &&
            Array.isArray(m.readings) &&
            m.readings.length === 3 &&
            m.readings.every(measure),
        ).length === 1,
    ) && CIRCUMFERENCES.every((key) => measure(circumferences[key]))
  );
}
function draft(v: unknown): v is Draft {
  return (
    assessment(v) &&
    "step" in v &&
    finite(v.step) &&
    Number.isInteger(v.step) &&
    v.step >= 0 &&
    v.step <= 3
  );
}
export function parseLocalData(raw: string): LocalData {
  const v: unknown = JSON.parse(raw);
  if (!object(v)) throw new Error("Formato local não reconhecido.");
  // Existing v1 documents have no version field. Migrate only known versions.
  const version = v.version === undefined ? 1 : v.version;
  if (
    (version !== 1 && version !== 2) ||
    !Array.isArray(v.clients) ||
    !Array.isArray(v.assessments) ||
    !v.assessments.every((a) => assessment(a) && errors(a, 3).length === 0) ||
    !object(v.drafts)
  )
    throw new Error("Formato local não reconhecido.");
  const parsedClients: Client[] = [];
  for (const item of v.clients) {
    const parsed = client(item, version);
    if (!parsed) throw new Error("Cliente inválido.");
    parsedClients.push(parsed);
  }
  const clients = new Set(parsedClients.map((c) => c.id));
  const assessments = v.assessments as Assessment[]; // Validated above, including finalization rules.
  const ids = new Set(assessments.map((a) => a.id));
  if (
    clients.size !== v.clients.length ||
    ids.size !== assessments.length ||
    assessments.some((a) => !clients.has(a.clientId))
  )
    throw new Error("Identificadores ou vínculos inválidos.");
  for (const [key, value] of Object.entries(v.drafts)) {
    if (
      !draft(value) ||
      key !== value.clientId ||
      !clients.has(key) ||
      ids.has(value.id)
    )
      throw new Error("Rascunho inválido.");
    ids.add(value.id);
  }
  return {
    clients: parsedClients,
    assessments,
    drafts: v.drafts as Record<string, Draft>,
  };
}

function serializeLocalData(data: LocalData): string {
  return JSON.stringify({ version: 2, ...data }, (_key, value) =>
    typeof value === "number" && !Number.isFinite(value) ? -1 : value,
  );
}

export class RecoveryError extends Error {
  constructor(
    message: string,
    public raw: string | null,
    public readable = true,
  ) {
    super(message);
  }
}
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export class LocalRepository {
  private baseline: string | null = null;
  private blocked = true;
  constructor(private storage: () => StoragePort) {}
  read(fallback: LocalData): LocalData {
    this.blocked = true;
    let raw: string | null;
    try {
      raw = this.storage().getItem(STORAGE_KEY);
    } catch {
      throw new RecoveryError(
        "Não foi possível acessar o armazenamento. Nenhum dado foi substituído.",
        null,
        false,
      );
    }
    let data: LocalData;
    try {
      data = raw === null ? fallback : parseLocalData(raw);
    } catch {
      throw new RecoveryError(
        "Os dados locais não puderam ser validados. O conteúdo original foi preservado.",
        raw,
      );
    }
    this.baseline = raw;
    this.blocked = false;
    return data;
  }
  invalidate() {
    this.blocked = true;
  }
  write(data: LocalData) {
    if (this.blocked)
      throw new RecoveryError(
        "As gravações estão bloqueadas. Recarregue os dados salvos para continuar.",
        null,
        false,
      );
    const storage = this.storage();
    const current = storage.getItem(STORAGE_KEY);
    if (current !== this.baseline) {
      this.blocked = true;
      throw new RecoveryError(
        "Os dados foram alterados em outra aba. Recarregue os dados salvos antes de continuar.",
        current,
      );
    }
    const raw = serializeLocalData(data);
    storage.setItem(STORAGE_KEY, raw);
    this.baseline = raw;
  }
  reset(original: string | null, fallback: LocalData, backupId: string) {
    this.blocked = true;
    const storage = this.storage();
    if (storage.getItem(STORAGE_KEY) !== original)
      throw new Error("Os dados mudaram. Recarregue antes de reinicializar.");
    if (original !== null) {
      const key = `${STORAGE_KEY}:recovery:${backupId}`;
      if (storage.getItem(key) !== null)
        throw new Error("Já existe uma cópia com esse identificador.");
      storage.setItem(key, original);
      if (storage.getItem(key) !== original)
        throw new Error("Não foi possível confirmar a cópia de recuperação.");
    }
    if (storage.getItem(STORAGE_KEY) !== original)
      throw new Error("Os dados mudaram. Recarregue antes de reinicializar.");
    const raw = serializeLocalData(fallback);
    storage.setItem(STORAGE_KEY, raw);
    this.baseline = raw;
    this.blocked = false;
  }
}
