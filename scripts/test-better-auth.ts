import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/lib/db";
import * as authSchema from "../src/lib/db/schema/auth";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testBetterAuth() {
  try {
    const auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: authSchema.user,
          session: authSchema.session,
          account: authSchema.account,
          verification: authSchema.verification,
        },
      }),
      emailAndPassword: {
        enabled: true,
      },
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    });

    console.log("Better Auth initialized successfully!");
    console.log("Available API methods:", Object.keys(auth.api));
  } catch (err: any) {
    console.error("Failed to initialize Better Auth:", err);
  }
}

testBetterAuth();
