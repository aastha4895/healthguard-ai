// Rule-based clinical risk score, exactly as described in the paper (Sec. IV.G,
// Eq. 10-20). This is a transparent triage aid. It is NOT the federated
// logistic-regression model, and the paper's accuracies do not apply to it.

export type RiskLevel = "low" | "moderate" | "high";
export type Trend = "improving" | "stable" | "deteriorating";

export interface RiskInput {
  age: number; // A, years
  systolicBP: number; // S, mmHg
  cholesterol: number; // L, mg/dL
  bmi: number; // B, kg/m²
  glucose: number; // G, mg/dL (fasting)
  smoker: boolean; // M
  diabetic: boolean; // Q
}

export interface RiskStage {
  stage: string;
  feature: string;
  value: string;
  points: number;
  max: number;
  rule: string; // which band was hit
  source: string; // guideline behind the band edges
}

export interface RiskResult {
  raw: number; // S_raw, 0-125 (Eq. 17)
  score: number; // R = min(100, S_raw) (Eq. 18)
  level: RiskLevel; // Eq. 19
  confidence: number; // κ = min(95, 72 + 0.3·S_raw), display heuristic (Eq. 20)
  stages: RiskStage[];
}

function band(x: number, edges: [number, number][], fallback = 0): [number, string] {
  // edges: [threshold, points] from highest to lowest; strict ">" as in the paper
  for (const [t, p] of edges) if (x > t) return [p, `> ${t}`];
  return [fallback, `≤ ${edges[edges.length - 1][0]}`];
}

export function computeRisk(x: RiskInput): RiskResult {
  const [pA, rA] = band(x.age, [[60, 25], [45, 15], [30, 5]]);
  const [pS, rS] = band(x.systolicBP, [[160, 25], [140, 15], [120, 5]]);
  const [pL, rL] = band(x.cholesterol, [[240, 20], [200, 10]]);
  const [pB, rB] = band(x.bmi, [[30, 15], [25, 7]]);
  const [pG, rG] = band(x.glucose, [[126, 15], [100, 7]]);
  const pH = (x.smoker ? 15 : 0) + (x.diabetic ? 10 : 0);

  const stages: RiskStage[] = [
    { stage: "1", feature: "Age", value: `${x.age} y`, points: pA, max: 25, rule: rA, source: "Authors' design choice" },
    { stage: "2", feature: "Systolic BP", value: `${x.systolicBP} mmHg`, points: pS, max: 25, rule: rS, source: "JNC 7" },
    { stage: "3", feature: "Cholesterol", value: `${x.cholesterol} mg/dL`, points: pL, max: 20, rule: rL, source: "NCEP ATP III" },
    { stage: "4a", feature: "BMI", value: `${x.bmi} kg/m²`, points: pB, max: 15, rule: rB, source: "WHO" },
    { stage: "4b", feature: "Fasting glucose", value: `${x.glucose} mg/dL`, points: pG, max: 15, rule: rG, source: "ADA 2025" },
    {
      stage: "5",
      feature: "History",
      value: [x.smoker && "smoker", x.diabetic && "diabetic"].filter(Boolean).join(", ") || "none",
      points: pH,
      max: 25,
      rule: "smoker +15, diabetic +10",
      source: "Authors' design choice",
    },
  ];

  const raw = pA + pS + pL + pB + pG + pH;
  const score = Math.min(100, raw);
  const level: RiskLevel = score >= 55 ? "high" : score >= 30 ? "moderate" : "low";
  const confidence = Math.round(Math.min(95, 72 + 0.3 * raw) * 10) / 10;
  return { raw, score, level, confidence, stages };
}

// The paper's worked example (Sec. IV.G): expect 69 points, High Risk, κ = 92.7%
export const WORKED_EXAMPLE: RiskInput = {
  age: 52, systolicBP: 145, cholesterol: 210, bmi: 28, glucose: 110, smoker: true, diabetic: false,
};

// ── Patient risk trajectory (Eq. 24-26) ─────────────────────────────────────
const TIER: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };

/** ΔR_t = R_t − R_{t−1}; Improving if < −5, Deteriorating if > 5, else Stable. */
export function trend(current: number, previous: number): { delta: number; trend: Trend } {
  const delta = current - previous;
  return { delta, trend: delta < -5 ? "improving" : delta > 5 ? "deteriorating" : "stable" };
}

/** Alert when the risk tier escalates between consecutive assessments. */
export function tierEscalated(current: RiskLevel, previous: RiskLevel): boolean {
  return TIER[current] > TIER[previous];
}
