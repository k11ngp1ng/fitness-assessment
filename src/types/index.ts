export type Sex = "male" | "female" | "other";
export type FitnessLevel = "Iniciante" | "Ativo" | "Atleta";
export interface Client {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  fitness: FitnessLevel;
  initials: string;
  color: string;
  goal: string;
  createdAt: string;
}
export const SITES = [
  "subscapular",
  "triceps",
  "chest",
  "midaxillary",
  "suprailiac",
  "abdominal",
  "thigh",
] as const;
export type SkinfoldSite = (typeof SITES)[number];
export interface SkinfoldMeasurement {
  site: SkinfoldSite;
  readings: [number | null, number | null, number | null];
}
export const CIRCUMFERENCES = [
  "trunk",
  "chest",
  "waist",
  "abdomen",
  "hip",
  "rightRelaxed",
  "rightContracted",
  "leftRelaxed",
  "leftContracted",
  "rightThigh",
  "leftThigh",
] as const;
export type CircumferenceKey = (typeof CIRCUMFERENCES)[number];
export type CircumferenceMeasurement = Record<CircumferenceKey, number | null>;
export interface BodyCompositionResult {
  sum: number;
  density: number;
  bodyFat: number;
  fatMass: number;
  leanMass: number;
}
export interface Assessment {
  id: string;
  clientId: string;
  date: string;
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  fitness: FitnessLevel;
  protocol: "jp7-male";
  skinfolds: SkinfoldMeasurement[];
  circumferences: CircumferenceMeasurement;
  notes: string;
  historicalNote?: string;
  demo: boolean;
}
export interface AssessmentComparison {
  bodyFat: number;
  leanMass: number;
  weight: number;
  waist: number | null;
}
export interface Draft extends Assessment {
  step: number;
}
