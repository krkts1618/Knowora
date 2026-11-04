"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { loginSchema } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth/auth-client";
import { ZodError } from "zod";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/library";
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(
    resetSuccess ? "Your password has been reset. Please sign in." : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      loginSchema.parse({ email, password, rememberMe });
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
      const res = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (res.error) {
        setError(res.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to sign in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />

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

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={loading}
          required
        />
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] focus:ring-[var(--focus-ring)] cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline-offset-2 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <AuthButton type="submit" loading={loading} className="mt-2">
        Sign in to NoteNest
      </AuthButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${redirectTo !== "/library" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-[var(--accent)] font-medium hover:underline underline-offset-2"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your private note repository and topics"
    >
      <Suspense fallback={<div className="text-xs text-center py-6">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
