import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/client";
import { nodes, models, predictions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// ── Nodes ────────────────────────────────────────────────────────────────────
export const getNodes = createServerFn({ method: "GET" }).handler(async () => {
  return await db.select().from(nodes).orderBy(desc(nodes.createdAt));
});

export const createNode = createServerFn({ method: "POST" })
  .validator((data: {
    name: string; location: string; country: string;
    ipAddress?: string; patientCount?: number;
  }) => data)
  .handler(async ({ data }) => {
    const [node] = await db.insert(nodes).values(data).returning();
    return node;
  });

export const updateNodeStatus = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const [node] = await db
      .update(nodes)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(nodes.id, data.id))
      .returning();
    return node;
  });

// ── Models ───────────────────────────────────────────────────────────────────
export const getModels = createServerFn({ method: "GET" }).handler(async () => {
  return await db.select().from(models).orderBy(desc(models.createdAt));
});

export const createModel = createServerFn({ method: "POST" })
  .validator((data: {
    name: string; description?: string; disease: string; totalRounds?: number;
  }) => data)
  .handler(async ({ data }) => {
    const [model] = await db.insert(models).values(data).returning();
    return model;
  });

// ── Predictions ──────────────────────────────────────────────────────────────
export const getPredictions = createServerFn({ method: "GET" })
  .validator((data: { userId?: string }) => data)
  .handler(async ({ data }) => {
    if (data.userId) {
      return await db
        .select()
        .from(predictions)
        .where(eq(predictions.userId, data.userId))
        .orderBy(desc(predictions.createdAt))
        .limit(20);
    }
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt)).limit(20);
  });

export const savePrediction = createServerFn({ method: "POST" })
  .validator((data: {
    userId?: string; modelId?: string;
    age?: number; gender?: string; systolicBP?: number; diastolicBP?: number;
    cholesterol?: number; glucose?: number; bmi?: number; heartRate?: number;
    smoker?: boolean; diabetic?: boolean;
    riskLevel: string; riskScore: number; confidence: number;
  }) => data)
  .handler(async ({ data }) => {
    const [prediction] = await db.insert(predictions).values(data).returning();
    return prediction;
  });

// ── Seed initial data ────────────────────────────────────────────────────────
export const seedData = createServerFn({ method: "POST" }).handler(async () => {
  const existingNodes = await db.select().from(nodes).limit(1);
  if (existingNodes.length > 0) return { seeded: false };

  await db.insert(nodes).values([
    { name: "Mayo Clinic", location: "Rochester, MN, US", country: "United States", ipAddress: "10.0.1.12", status: "online", latency: "0.4ms", dataSize: "2.4 GB", patientCount: 12400, contribution: 18 },
    { name: "Cleveland Clinic", location: "Cleveland, OH, US", country: "United States", ipAddress: "10.0.1.15", status: "online", latency: "1.2ms", dataSize: "1.9 GB", patientCount: 9800, contribution: 15 },
    { name: "Johns Hopkins Hospital", location: "Baltimore, MD, US", country: "United States", ipAddress: "10.0.1.22", status: "syncing", dataSize: "3.1 GB", patientCount: 15200, contribution: 12 },
    { name: "Berlin Charité", location: "Berlin, DE", country: "Germany", ipAddress: "10.0.2.8", status: "online", latency: "18ms", dataSize: "2.8 GB", patientCount: 11600, contribution: 14 },
    { name: "Karolinska Institute", location: "Stockholm, SE", country: "Sweden", ipAddress: "10.0.2.14", status: "online", latency: "22ms", dataSize: "1.6 GB", patientCount: 8200, contribution: 11 },
    { name: "Tokyo Medical University", location: "Tokyo, JP", country: "Japan", ipAddress: "10.0.3.5", status: "offline", dataSize: "2.1 GB", patientCount: 10500, contribution: 0 },
    { name: "Toronto General Hospital", location: "Toronto, ON, CA", country: "Canada", ipAddress: "10.0.1.31", status: "online", latency: "8ms", dataSize: "1.4 GB", patientCount: 7300, contribution: 9 },
    { name: "São Paulo Hospital das Clínicas", location: "São Paulo, BR", country: "Brazil", ipAddress: "10.0.4.2", status: "online", latency: "45ms", dataSize: "1.8 GB", patientCount: 9100, contribution: 10 },
  ]);

  await db.insert(models).values([
    { name: "CardioRisk-v4", description: "Cardiovascular disease risk prediction using patient vitals, lab results, and demographic data.", status: "training", disease: "Cardiac", accuracy: 94.2, auc: 0.94, loss: 0.184, currentRound: 412, totalRounds: 500, privacyBudget: 0.045, nodeCount: 12 },
    { name: "DiabetesDetect-v2", description: "Early-onset Type 2 diabetes detection from blood glucose, BMI, and lifestyle indicators.", status: "completed", disease: "Diabetes", accuracy: 91.7, auc: 0.91, loss: 0.21, currentRound: 300, totalRounds: 300, privacyBudget: 0.062, nodeCount: 8 },
    { name: "StrokePredict-v1", description: "Ischemic stroke risk stratification using neurological markers and patient history.", status: "paused", disease: "Neurology", accuracy: 87.3, auc: 0.87, loss: 0.29, currentRound: 180, totalRounds: 400, privacyBudget: 0.08, nodeCount: 6 },
    { name: "SepsisAlert-v1", description: "Early sepsis detection from ICU vitals streams.", status: "training", disease: "Critical Care", accuracy: 89.1, auc: 0.89, loss: 0.26, currentRound: 95, totalRounds: 350, privacyBudget: 0.055, nodeCount: 10 },
  ]);

  return { seeded: true };
});
