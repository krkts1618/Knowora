"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { FormError } from "@/components/auth/FormError";
import { LogOut, ArrowLeft, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ProfileClientProps {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  initialProfile: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileClient({ user, initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.fullName || user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error)?.message || "An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B42318] hover:bg-[#B42318]/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>

      {/* Main card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] flex flex-col gap-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-muted)] text-[var(--accent)] border border-[var(--border)] flex items-center justify-center font-semibold text-lg">
            {fullName ? fullName.slice(0, 2).toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {fullName || "User Profile"}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">{user.email}</p>
          </div>
        </div>

        <FormSuccess message={success} />
        <FormError message={error} />

        {/* Read-only account info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--surface-muted)] text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Account Email</span>
            <span className="font-medium text-[var(--text-primary)]">{user.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Member Since</span>
            <span className="font-medium text-[var(--text-primary)]">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">User ID</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)] break-all">
              {user.id}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Authentication Status</span>
            <span className="font-medium text-[var(--status-success)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active Session
            </span>
          </div>
        </div>

        {/* Editable profile form */}
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Edit Profile Details
          </h2>

          <AuthInput
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            placeholder="Your name"
          />

          <AuthInput
            label="Avatar URL (Optional)"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            disabled={loading}
            placeholder="https://example.com/avatar.jpg"
            hint="Enter an image URL for your profile avatar."
          />

          <div className="flex justify-end pt-2">
            <AuthButton
              type="submit"
              loading={loading}
              className="w-auto px-6"
            >
              Save Profile Changes
            </AuthButton>
          </div>
        </form>
      </div>
    </div>
  );
}
