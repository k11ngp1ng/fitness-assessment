export const fmt = (value: number | null | undefined, digits = 1) =>
  value == null || !Number.isFinite(value)
    ? "—"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
export const dateLabel = (date: string, long = false) =>
  new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: long ? "long" : "short",
    year: "numeric",
  });
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;
export const siteLabels = {
  subscapular: "Subescapular",
  triceps: "Tríceps",
  chest: "Peitoral",
  midaxillary: "Axilar média",
  suprailiac: "Supra-ilíaca",
  abdominal: "Abdominal",
  thigh: "Femoral médio",
};
export const circumferenceLabels = {
  trunk: "Tronco / ombros",
  chest: "Peitoral",
  waist: "Cintura",
  abdomen: "Abdômen",
  hip: "Quadril / glúteos",
  rightRelaxed: "Braço direito · relaxado",
  rightContracted: "Braço direito · contraído",
  leftRelaxed: "Braço esquerdo · relaxado",
  leftContracted: "Braço esquerdo · contraído",
  rightThigh: "Coxa direita",
  leftThigh: "Coxa esquerda",
};
