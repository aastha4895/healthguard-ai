// Demo rows that describe the paper's actual experiment (Sec. III.K, Table V).
// Per-hospital record counts are not reported in the paper, so they stay empty.
import { ACCURACY, DATASETS, EPSILON_TABLE, FEDERATION } from "@/lib/paper-data";

const epsilonAtLightDp = EPSILON_TABLE.find((r) => r.sigma === ACCURACY.diabetes.federatedDp.sigma)!.epsilon;

export const PAPER_NODES = ["Hospital A", "Hospital B", "Hospital C"].map((name) => ({
  name,
  location: "Simulated hospital client",
  country: "Simulated",
  status: "online",
  patientCount: null,
  contribution: null,
  source: "paper",
}));

export const PAPER_MODELS = [
  {
    name: "Diabetes · FedAvg + DP",
    description: `Logistic regression on ${DATASETS.diabetes.name} (${DATASETS.diabetes.records} records), split non-IID across ${FEDERATION.hospitals} hospitals.`,
    disease: "Diabetes",
    accuracy: ACCURACY.diabetes.federatedDp.mean,
  },
  {
    name: "Heart Disease · FedAvg + DP",
    description: `Logistic regression on ${DATASETS.heart.name} (${DATASETS.heart.records} records), split non-IID across ${FEDERATION.hospitals} hospitals.`,
    disease: "Heart Disease",
    accuracy: ACCURACY.heart.federatedDp.mean,
  },
].map((m) => ({
  ...m,
  status: "completed",
  auc: null,
  loss: null,
  currentRound: FEDERATION.rounds,
  totalRounds: FEDERATION.rounds,
  privacyBudget: epsilonAtLightDp,
  nodeCount: FEDERATION.hospitals,
  source: "paper",
}));
