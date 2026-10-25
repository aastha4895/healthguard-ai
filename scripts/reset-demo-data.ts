// Replaces all hospitals and models with the rows from the paper's experiment.
// Users, sessions and saved risk assessments are not touched.
// Usage: bun scripts/reset-demo-data.ts   (uses DATABASE_URL from .env)
import { db } from "@/db/client";
import { models, nodes } from "@/db/schema";
import { PAPER_MODELS, PAPER_NODES } from "@/db/seed";

const host = new URL(process.env.DATABASE_URL!).host;
console.log(`Resetting demo data on ${host}`);
const removedNodes = await db.delete(nodes).returning({ id: nodes.id });
const removedModels = await db.delete(models).returning({ id: models.id });
await db.insert(nodes).values(PAPER_NODES);
await db.insert(models).values(PAPER_MODELS);
console.log(`Removed ${removedNodes.length} hospitals and ${removedModels.length} models; added ${PAPER_NODES.length} and ${PAPER_MODELS.length} from the paper.`);
