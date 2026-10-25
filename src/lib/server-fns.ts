import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { nodes, models, predictions, user } from "@/db/schema";
import { LEGACY_DEMO_MODELS, LEGACY_DEMO_NODES, PAPER_MODELS, PAPER_NODES } from "@/db/seed";
import { auth } from "@/lib/auth-server";
import { computeRisk } from "@/lib/risk";

// Every write needs a signed-in user; the id comes from the session cookie,
// never from the browser.
async function requireUser() {
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user) throw new Error("Your session has expired. Please sign in again.");
  return session.user;
}

// Brings any database (dev or production) up to date: adds the "source"
// column, removes the old invented demo rows and inserts the paper's rows.
// Idempotent, and runs at most once per server instance.
let ready: Promise<void> | null = null;
function ensureData() {
  ready ??= (async () => {
    await db.execute(sql`ALTER TABLE nodes ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user'`);
    await db.execute(sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user'`);
    await db.delete(nodes).where(and(ne(nodes.source, "paper"), inArray(nodes.name, LEGACY_DEMO_NODES)));
    await db.delete(models).where(and(ne(models.source, "paper"), inArray(models.name, LEGACY_DEMO_MODELS)));
    const existing = await db.select({ id: nodes.id }).from(nodes).where(eq(nodes.source, "paper")).limit(1);
    if (!existing.length) {
      await db.insert(nodes).values(PAPER_NODES);
      await db.insert(models).values(PAPER_MODELS);
    }
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

const parse = <T extends z.ZodTypeAny>(schema: T) => (data: unknown) => schema.parse(data) as z.infer<T>;

// ── Hospitals (nodes) ───────────────────────────────────────────────────────
export const getNodes = createServerFn({ method: "GET" }).handler(async () => {
  await ensureData();
  return await db.select().from(nodes).orderBy(nodes.createdAt);
});

export const createNode = createServerFn({ method: "POST" })
  .validator(parse(z.object({
    name: z.string().trim().min(2).max(80),
    location: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(60),
    patientCount: z.number().int().min(0).max(10_000_000).optional(),
  })))
  .handler(async ({ data }) => {
    await requireUser();
    const [node] = await db.insert(nodes).values({ ...data, status: "online", source: "user" }).returning();
    return node;
  });

export const deleteNode = createServerFn({ method: "POST" })
  .validator(parse(z.object({ id: z.string().uuid() })))
  .handler(async ({ data }) => {
    await requireUser();
    const rows = await db.delete(nodes).where(and(eq(nodes.id, data.id), ne(nodes.source, "paper"))).returning();
    if (!rows.length) throw new Error("Hospitals from the paper's experiment can't be removed.");
    return { ok: true };
  });

// ── Models ──────────────────────────────────────────────────────────────────
export const getModels = createServerFn({ method: "GET" }).handler(async () => {
  await ensureData();
  return await db.select().from(models).orderBy(models.createdAt);
});

export const createModel = createServerFn({ method: "POST" })
  .validator(parse(z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional(),
    disease: z.string().trim().min(2).max(40),
    totalRounds: z.number().int().min(1).max(1000),
  })))
  .handler(async ({ data }) => {
    await requireUser();
    const [model] = await db
      .insert(models)
      .values({ ...data, status: "planned", currentRound: 0, accuracy: null, auc: null, loss: null, privacyBudget: null, nodeCount: 0, source: "user" })
      .returning();
    return model;
  });

export const deleteModel = createServerFn({ method: "POST" })
  .validator(parse(z.object({ id: z.string().uuid() })))
  .handler(async ({ data }) => {
    await requireUser();
    const rows = await db.delete(models).where(and(eq(models.id, data.id), ne(models.source, "paper"))).returning();
    if (!rows.length) throw new Error("Models from the paper's experiment can't be removed.");
    return { ok: true };
  });

// ── Risk assessments (predictions) ──────────────────────────────────────────
export const getMyPredictions = createServerFn({ method: "GET" }).handler(async () => {
  const me = await requireUser();
  return await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, me.id))
    .orderBy(desc(predictions.createdAt))
    .limit(200);
});

const vitals = z.object({
  age: z.number().int().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  systolicBP: z.number().int().min(60).max(260),
  diastolicBP: z.number().int().min(30).max(160).optional(),
  heartRate: z.number().int().min(20).max(250).optional(),
  cholesterol: z.number().int().min(50).max(600),
  glucose: z.number().int().min(30).max(600),
  bmi: z.number().min(10).max(80),
  smoker: z.boolean(),
  diabetic: z.boolean(),
});

export const savePrediction = createServerFn({ method: "POST" })
  .validator(parse(vitals))
  .handler(async ({ data }) => {
    const me = await requireUser();
    // Recompute on the server so stored scores always follow the paper's rules.
    const r = computeRisk(data);
    const [row] = await db
      .insert(predictions)
      .values({ ...data, userId: me.id, riskLevel: r.level, riskScore: r.score, confidence: r.confidence })
      .returning();
    return row;
  });

export const deletePrediction = createServerFn({ method: "POST" })
  .validator(parse(z.object({ id: z.string().uuid() })))
  .handler(async ({ data }) => {
    const me = await requireUser();
    await db.delete(predictions).where(and(eq(predictions.id, data.id), eq(predictions.userId, me.id)));
    return { ok: true };
  });

// ── Profile ─────────────────────────────────────────────────────────────────
export const updateProfile = createServerFn({ method: "POST" })
  .validator(parse(z.object({
    name: z.string().trim().min(2).max(80),
    hospitalName: z.string().trim().max(120),
    country: z.string().trim().max(60),
    department: z.string().trim().max(60),
  })))
  .handler(async ({ data }) => {
    const me = await requireUser();
    const [row] = await db.update(user).set({ ...data, updatedAt: new Date() }).where(eq(user.id, me.id)).returning();
    return { name: row.name, hospitalName: row.hospitalName, country: row.country, department: row.department };
  });

// ── Demo data from the paper ────────────────────────────────────────────────
export const seedData = createServerFn({ method: "POST" }).handler(async () => {
  await ensureData();
  return { ok: true };
});
