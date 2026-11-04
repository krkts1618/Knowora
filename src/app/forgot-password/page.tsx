"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth/auth-client";
import { ZodError } from "zod";
import { Info } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [emailProviderMissing, setEmailProviderMissing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setEmailProviderMissing(false);

    try {
      forgotPasswordSchema.parse({ email });
    } catch (err) {
      if (err instanceof ZodError) {
        const flattened = err.flatten().fieldErrors;
        const errorsMap: Record<string, string> = {};
        for (const [key, val] of Object.entries(flattened)) {
          if (Array.isArray(val) && val.length > 0) {
            errorsMap[key] = val[0] as string;
          }
        }
        setFieldErrors(errorsMap);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (res.error) {
        setError(res.error.message || "Failed to initiate password reset.");
        setLoading(false);
        return;
      }

      setSuccess("If an account with that email exists, password reset instructions have been triggered.");
      setEmailProviderMissing(true);
    } catch (err: unknown) {
      setError((err as Error)?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />

      {emailProviderMissing && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
          <Info className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--text-primary)] mb-1">
              Environment Configuration Notice
            </p>
            <p>
              Email delivery requires configuring <code>RESEND_API_KEY</code> or{" "}
              <code>SMTP_HOST</code> in <code>.env.local</code>. In local development without an email provider, the password reset token is logged to the server console.
            </p>
          </div>
        </div>
      )}

      <AuthInput
        label="Email Address"
        type="email"
        placeholder="you@domain.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={loading}
        required
      />

      <AuthButton type="submit" loading={loading} className="mt-2">
        Send recovery instructions
      </AuthButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-[var(--accent)] font-medium hover:underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email to receive a password recovery link"
    >
      <Suspense fallback={<div className="text-xs text-center py-6">Loading form...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
