// Single source of truth for every number the site shows about the research.
// All values come from the paper "Federated Healthcare AI: A Unified Platform for
// Multi-Hospital AI Collaboration with Formally-Accounted Differential Privacy".
// If a number is not in the paper, it does not belong here (or on the site).

// ── Federation setup (Sec. III.K, Appendix) ─────────────────────────────────
export const FEDERATION = {
  hospitals: 3, // simulated hospital clients
  rounds: 20, // T, communication rounds
  seeds: 5, // random seeds per configuration
  clipNorm: 3.0, // C, L2 clip norm on each update
  delta: 1e-5, // δ for (ε, δ)-DP
  model: "Logistic regression (NumPy re-implementation)",
  aggregation: "FedAvg (sample-weighted, Eq. 1)",
} as const;

// ── Datasets (Sec. III.G) ───────────────────────────────────────────────────
export const DATASETS = {
  diabetes: { name: "UCI Pima Indians Diabetes", records: 768 },
  heart: { name: "UCI Cleveland Heart Disease", records: 247 }, // after cleaning
} as const;

// ── Accuracy by condition (Tables V and VI, 5-seed averages, %) ─────────────
export const ACCURACY = {
  diabetes: {
    singleHospital: 69.9,
    federatedNoDp: 75.2,
    federatedDp: { mean: 74.5, std: 0.7, sigma: 0.05 },
    federatedHeavyDp: { mean: 51, sigma: 2.0, approx: true },
  },
  heart: {
    singleHospital: 76.9,
    federatedNoDp: 81.6,
    federatedDp: { mean: 80.0, std: 2.4, sigma: 0.05 },
    federatedHeavyDp: { mean: 59, sigma: 2.0, approx: true },
  },
} as const;

// Federated gain over single-hospital baseline at σ = 0.05 (Eq. 22), points
export const FEDERATED_GAIN = { diabetes: 4.6, heart: 3.1 } as const;

// ── Privacy (Sec. IV.F, V.B, Table III) ─────────────────────────────────────
// Membership-inference attack AUC stayed in this range at every σ (0.5 = random guess)
export const MIA_AUC = { min: 0.52, max: 0.55 } as const;

// DP noise levels tested in the sweep
export const SIGMA_SWEEP = [0, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0] as const;

// Table III: formal ε after T = 20 rounds (discrete Rényi-order grid, as executed)
export const EPSILON_TABLE: { sigma: number; z: number; epsilon: number }[] = [
  { sigma: 0.05, z: 0.017, epsilon: 37511 },
  { sigma: 0.1, z: 0.033, epsilon: 9705 },
  { sigma: 0.25, z: 0.083, epsilon: 1699 },
  { sigma: 0.5, z: 0.167, epsilon: 489 },
  { sigma: 1.0, z: 0.333, epsilon: 154 },
  { sigma: 2.0, z: 0.667, epsilon: 55 },
];

// σ needed for a conventional ε ≈ 8 over 20 rounds
export const SIGMA_FOR_EPSILON_8 = 9.26;

/**
 * Cumulative ε spent after r rounds, closed form (Eq. 8):
 *   ε(r) = r / (2z²) + sqrt(2 · r · ln(1/δ)) / z,   z = σ / C
 * Client-level (hospital-level) DP, non-subsampled Gaussian mechanism.
 * Returns Infinity when σ = 0 (no noise means no formal guarantee).
 */
export function epsilonAfterRounds(
  rounds: number,
  sigma: number,
  clipNorm: number = FEDERATION.clipNorm,
  delta: number = FEDERATION.delta,
): number {
  if (sigma <= 0) return Infinity;
  const z = sigma / clipNorm;
  return rounds / (2 * z * z) + Math.sqrt(2 * rounds * Math.log(1 / delta)) / z;
}

/** Round fraction ρ = r / T (Eq. 7) */
export function roundFraction(round: number, totalRounds: number = FEDERATION.rounds): number {
  return round / totalRounds;
}

// ── Significance tests (Sec. V.B, paired t-test vs σ = 0.05, n = 5 seeds) ───
export const SIGNIFICANCE = {
  diabetes: {
    vsNoDp: { p: 0.14 },
    sigma025: { p: 0.0045, cohensD: 2.57 },
  },
  heart: {
    vsNoDp: { p: 0.24 },
    sigma025: { p: 0.25, cohensD: 0.61 },
  },
  // Accuracy drop significant for both diseases once σ ≥ 0.5 (p < 0.05, d ≈ 1.5–4.3)
} as const;
