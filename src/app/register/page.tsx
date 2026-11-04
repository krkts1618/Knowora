"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { AuthButton } from "@/components/auth/AuthButton";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { registerSchema } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth/auth-client";
import { ZodError } from "zod";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/library";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      registerSchema.parse({
        fullName,
        email,
        password,
        confirmPassword,
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
      const res = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (res.error) {
        setError(res.error.message || "Failed to create account. Email may already be in use.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      setError((err as Error)?.message || "An error occurred during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />

      <AuthInput
        label="Full Name"
        type="text"
        placeholder="Ada Lovelace"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
        disabled={loading}
        required
      />

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
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={loading}
          required
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <PasswordInput
        label="Confirm Password"
        placeholder="Repeat password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        disabled={loading}
        required
      />

      <AuthButton type="submit" loading={loading} className="mt-2">
        Create your account
      </AuthButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
        Already have an account?{" "}
        <Link
          href={`/login${redirectTo !== "/library" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-[var(--accent)] font-medium hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Organize, index, and retrieve notes with precision"
    >
      <Suspense fallback={<div className="text-xs text-center py-6">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
