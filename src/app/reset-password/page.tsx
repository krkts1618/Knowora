"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { AuthButton } from "@/components/auth/AuthButton";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth/auth-client";
import { ZodError } from "zod";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? "Missing or invalid password reset token." : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Cannot reset password: reset token is missing.");
      return;
    }

    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      resetPasswordSchema.parse({
        password,
        confirmPassword,
        token,
      });
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
      const res = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (res.error) {
        setError(res.error.message || "Invalid or expired reset token.");
        setLoading(false);
        return;
      }

      setSuccess("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1200);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to reset password. The link may have expired.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          label="New Password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={loading || !token}
          required
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <PasswordInput
        label="Confirm New Password"
        placeholder="Repeat new password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        disabled={loading || !token}
        required
      />

      <AuthButton
        type="submit"
        loading={loading}
        disabled={!token || loading}
        className="mt-2"
      >
        Set new password
      </AuthButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
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

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter and confirm your new secure password"
    >
      <Suspense fallback={<div className="text-xs text-center py-6">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
