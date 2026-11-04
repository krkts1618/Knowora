import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/schema/auth";
import { profiles, userPreferences } from "@/lib/db/schema/app";
import * as dotenv from "dotenv";
import path from "path";

if (!process.env.BETTER_AUTH_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

export const auth = betterAuth({
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
    requireEmailVerification: false,
    async sendResetPassword(data) {
      const emailConfigured = Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
      if (!emailConfigured) {
        console.warn(
          `[Auth Notice] Email delivery is NOT configured (RESEND_API_KEY or SMTP_HOST missing). ` +
          `Password reset link for ${data.user.email}: ${data.url}`
        );
        return;
      }
      // If SMTP or Resend credentials are provided, dispatch would occur here.
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          try {
            await db
              .insert(profiles)
              .values({
                id: newUser.id,
                fullName: newUser.name,
                avatarUrl: newUser.image,
              })
              .onConflictDoNothing();

            await db
              .insert(userPreferences)
              .values({
                userId: newUser.id,
                theme: "system",
                editorPreferences: {},
                keyboardShortcuts: {},
              })
              .onConflictDoNothing();
          } catch (error) {
            console.error("Failed to initialize profile or preferences:", error);
          }
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Auth = typeof auth;
