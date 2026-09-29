const recordPaths = {
  client: "/clientes/perfil/",
  assessment: "/avaliacoes/resultado/",
  report: "/relatorios/visualizar/",
};

export type RecordKind = keyof typeof recordPaths;

// Next Link/router apply basePath; IDs remain opaque query values.
export function recordHref(kind: RecordKind, id: string) {
  return `${recordPaths[kind]}?${new URLSearchParams({ id })}`;
}
