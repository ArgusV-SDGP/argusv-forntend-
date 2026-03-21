"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { register } from "@/lib/client-services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username, password);
      router.replace("/login");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#080808]">

      {/* ── Left panel — brand + background ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2340&auto=format&fit=crop"
            alt="Surveillance background"
            fill
            style={{ objectFit: "cover" }}
            priority
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#18ffbe]/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 relative">
            <Image src="/argusv-logo.svg" alt="ArgusV" fill style={{ objectFit: "contain" }} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ArgusV</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#18ffbe]/30 bg-[#18ffbe]/10">
            <span className="size-1.5 rounded-full bg-[#18ffbe] animate-pulse" />
            <span className="text-[#18ffbe] text-xs font-medium tracking-wide">AI-Powered Surveillance</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-snug">
            Join the<br />
            Future of<br />
            <span className="text-[#18ffbe]">Security.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Set up your account and gain access to real-time threat detection, zone monitoring, and AI-driven insights.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            {["Live Camera Feed", "AI Threat Analysis", "Zone Configuration", "Smart Alerts"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <span className="size-1.5 rounded-full bg-[#18ffbe]" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">© {new Date().getFullYear()} ArgusV. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#0a0a0a]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 relative">
              <Image src="/argusv-logo.svg" alt="ArgusV" fill style={{ objectFit: "contain" }} />
            </div>
            <span className="text-white font-bold text-lg">ArgusV</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5">Create account</h1>
            <p className="text-slate-500 text-sm">Set up your ArgusV account to get started</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#18ffbe]/60 focus:ring-1 focus:ring-[#18ffbe]/30 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#18ffbe]/60 focus:ring-1 focus:ring-[#18ffbe]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm focus:outline-none transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/50 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
                      : confirmPassword && confirmPassword === password
                      ? "border-[#18ffbe]/50 focus:border-[#18ffbe]/60 focus:ring-1 focus:ring-[#18ffbe]/20"
                      : "border-white/10 focus:border-[#18ffbe]/60 focus:ring-1 focus:ring-[#18ffbe]/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {/* Inline match hint */}
              {confirmPassword && (
                <p className={`text-xs ${confirmPassword === password ? "text-[#18ffbe]" : "text-red-400"}`}>
                  {confirmPassword === password ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#18ffbe] hover:bg-[#00e6a8] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors mt-2"
            >
              {isSubmitting ? (
                <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#18ffbe] hover:underline font-medium">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
