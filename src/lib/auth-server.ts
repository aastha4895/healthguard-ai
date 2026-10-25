import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "admin" },
      hospitalName: { type: "string", required: false },
      country: { type: "string", required: false },
      department: { type: "string", required: false },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:8080",
    "https://healthguard-ai-zeta.vercel.app",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
});
