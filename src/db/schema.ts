import {
  pgTable, text, timestamp, integer, real, boolean, uuid,
} from "drizzle-orm/pg-core";

// ── Users (managed by better-auth) ──────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // extra fields
  role: text("role").default("admin"),
  hospitalName: text("hospital_name"),
  country: text("country"),
  department: text("department"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Hospital Nodes ───────────────────────────────────────────────────────────
export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  ipAddress: text("ip_address"),
  status: text("status").notNull().default("online"), // online | syncing | offline
  latency: text("latency"),
  dataSize: text("data_size"),
  patientCount: integer("patient_count").default(0),
  contribution: integer("contribution").default(0),
  source: text("source").notNull().default("user"), // "paper" rows come from the research paper and cannot be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Federated Models ─────────────────────────────────────────────────────────
export const models = pgTable("models", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("training"), // training | completed | paused
  disease: text("disease").notNull(),
  accuracy: real("accuracy").default(0),
  auc: real("auc").default(0),
  loss: real("loss").default(0),
  currentRound: integer("current_round").default(0),
  totalRounds: integer("total_rounds").default(500),
  privacyBudget: real("privacy_budget").default(0.1),
  nodeCount: integer("node_count").default(0),
  source: text("source").notNull().default("user"), // "paper" rows come from the research paper and cannot be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Predictions ──────────────────────────────────────────────────────────────
export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  modelId: uuid("model_id").references(() => models.id, { onDelete: "set null" }),
  // inputs
  age: integer("age"),
  gender: text("gender"),
  systolicBP: integer("systolic_bp"),
  diastolicBP: integer("diastolic_bp"),
  cholesterol: integer("cholesterol"),
  glucose: integer("glucose"),
  bmi: real("bmi"),
  heartRate: integer("heart_rate"),
  smoker: boolean("smoker").default(false),
  diabetic: boolean("diabetic").default(false),
  // outputs
  riskLevel: text("risk_level"), // low | moderate | high
  riskScore: integer("risk_score"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
