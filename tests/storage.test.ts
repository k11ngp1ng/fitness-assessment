import test from "node:test";
import assert from "node:assert/strict";
import { clients, assessments, newDraft } from "../src/data/seed";
import {
  LocalRepository,
  parseLocalData,
  RecoveryError,
  STORAGE_KEY,
  type LocalData,
} from "../src/lib/storage";

const initial: LocalData = { clients, assessments, drafts: {} };
const raw = JSON.stringify(initial);
function memory(value: string | null) {
  const values = new Map<string, string>();
  if (value !== null) values.set(STORAGE_KEY, value);
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
test("v1 original e rascunhos incompletos continuam editáveis", () => {
  const draft = newDraft(clients[0]);
  draft.age = -1;
  draft.date = "";
  draft.circumferences.waist = -1;
  const result = parseLocalData(
    JSON.stringify({ ...initial, drafts: { [draft.clientId]: draft } }),
  );
  assert.equal(result.drafts[draft.clientId].age, -1);
  assert.equal(result.drafts[draft.clientId].skinfolds[0].readings[0], null);
  assert.equal(
    result.assessments[0].historicalNote,
    assessments[0].historicalNote,
  );
});
test("v1 migra para v2 sem alterar avaliações, rascunhos ou o original na leitura", () => {
  const legacyClients = clients.map((client) =>
    Object.fromEntries(
      Object.entries(client).filter(([key]) => key !== "archivedAt"),
    ),
  );
  const draft = newDraft(clients[0]);
  const legacy = JSON.stringify({
    clients: legacyClients,
    assessments,
    drafts: { [draft.clientId]: draft },
  });
  const storage = memory(legacy);
  const repo = new LocalRepository(() => storage);
  const migrated = repo.read(initial);
  assert.equal(storage.getItem(STORAGE_KEY), legacy);
  assert.ok(migrated.clients.every((client) => client.archivedAt === null));
  assert.deepEqual(
    migrated.assessments,
    JSON.parse(JSON.stringify(assessments)),
  );
  assert.deepEqual(
    migrated.drafts[draft.clientId],
    JSON.parse(JSON.stringify(draft)),
  );
  repo.write(migrated);
  const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
  assert.equal(saved.version, 2);
  assert.deepEqual(parseLocalData(JSON.stringify(saved)), migrated);
});
test("v2 valida arquivamento sem perder vínculos nem histórico", () => {
  const archived = {
    ...initial,
    version: 2,
    clients: [{ ...clients[0], archivedAt: "2026-09-29" }, ...clients.slice(1)],
  };
  assert.equal(
    parseLocalData(JSON.stringify(archived)).clients[0].archivedAt,
    "2026-09-29",
  );
  for (const archivedAt of [undefined, "", "2026-02-30", 123, false])
    assert.throws(() =>
      parseLocalData(
        JSON.stringify({
          ...archived,
          clients: [{ ...clients[0], archivedAt }, ...clients.slice(1)],
        }),
      ),
    );
  assert.throws(() =>
    parseLocalData(JSON.stringify({ ...archived, version: 3 })),
  );
});
test("contratos, versões, datas, duplicatas e vínculos são validados", () => {
  const variants: unknown[] = [
    null,
    [],
    {},
    { ...initial, version: 3 },
    { ...initial, drafts: [] },
  ];
  for (const patch of [
    { sex: "invalid" },
    { fitness: "invalid" },
    { createdAt: "2026-02-30" },
    { height: null },
    { name: "" },
  ])
    variants.push({
      ...initial,
      clients: [{ ...clients[0], ...patch }, ...clients.slice(1)],
    });
  variants.push({ ...initial, clients: [...clients, clients[0]] });
  variants.push({ ...initial, assessments: [...assessments, assessments[0]] });
  variants.push({
    ...initial,
    assessments: [{ ...assessments[0], clientId: "missing" }],
  });
  variants.push({
    ...initial,
    assessments: [{ ...assessments[0], date: "2026-02-30" }],
  });
  variants.push({
    ...initial,
    assessments: [{ ...assessments[0], notes: null }],
  });
  variants.push({ ...initial, drafts: { wrong: newDraft(clients[0]) } });
  for (const value of variants)
    assert.throws(() => parseLocalData(JSON.stringify(value)));
  assert.throws(() => parseLocalData(raw.replace('"age":20', '"age":1e999')));
});
test("leitura inválida bloqueia toda gravação até uma recuperação explícita", () => {
  for (const original of [
    "{broken",
    "",
    "{}",
    JSON.stringify({ ...initial, version: 99 }),
  ]) {
    const storage = memory(original);
    const repo = new LocalRepository(() => storage);
    assert.throws(() => repo.read(initial), RecoveryError);
    assert.throws(() => repo.write(initial), RecoveryError);
    assert.equal(storage.getItem(STORAGE_KEY), original);
    storage.setItem(STORAGE_KEY, raw);
    assert.deepEqual(repo.read(initial), JSON.parse(raw));
    repo.write(initial);
  }
});
test("reinicialização preserva bytes originais e não prossegue se a cópia falhar", () => {
  const storage = memory("{original");
  const repo = new LocalRepository(() => storage);
  assert.throws(() => repo.read(initial));
  repo.reset("{original", initial, "unique");
  assert.equal(storage.getItem(`${STORAGE_KEY}:recovery:unique`), "{original");
  assert.deepEqual(
    parseLocalData(storage.getItem(STORAGE_KEY)!),
    JSON.parse(raw),
  );
  const failing = memory("{original");
  const broken = new LocalRepository(() => ({
    ...failing,
    setItem: () => {
      throw new Error("quota");
    },
  }));
  assert.throws(() => broken.reset("{original", initial, "copy"));
  assert.equal(failing.getItem(STORAGE_KEY), "{original");
});
test("falha após copiar, conflito e armazenamento inacessível preservam o original", () => {
  const storage = memory("{original");
  const repo = new LocalRepository(() => ({
    ...storage,
    setItem: (key, value) => {
      if (key === STORAGE_KEY) throw new Error("quota");
      storage.setItem(key, value);
    },
  }));
  assert.throws(() => repo.reset("{original", initial, "copy"));
  assert.equal(storage.getItem(STORAGE_KEY), "{original");
  assert.equal(storage.getItem(`${STORAGE_KEY}:recovery:copy`), "{original");
  const inaccessible = new LocalRepository(() => {
    throw new Error("denied");
  });
  assert.throws(
    () => inaccessible.read(initial),
    (error: unknown) => error instanceof RecoveryError && !error.readable,
  );
  assert.throws(() => inaccessible.write(initial));
  const shared = memory(raw);
  const other = new LocalRepository(() => shared);
  other.read(initial);
  shared.setItem(STORAGE_KEY, "different");
  assert.throws(() => other.write(initial), RecoveryError);
  assert.throws(() => other.reset(raw, initial, "stale"));
  assert.equal(shared.getItem(STORAGE_KEY), "different");
});
