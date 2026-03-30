"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { login } from "@/lib/client-services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
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
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {/* Teal glow accent */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#18ffbe]/10 rounded-full blur-3xl" />
        </div>

        {/* Logo top-left */}
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
            Intelligent<br />
            Surveillance,<br />
            <span className="text-[#18ffbe]">Redefined.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Real-time threat detection, zone monitoring, and AI-driven insights — all in one platform.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-2 pt-2">
            {["Live Camera Feed", "AI Threat Analysis", "Zone Configuration", "Smart Alerts"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <span className="size-1.5 rounded-full bg-[#18ffbe]" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
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
            <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
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
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link href="#" className="text-xs text-slate-500 hover:text-[#18ffbe] transition-colors">
                Forgot password?
              </Link>
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
                <LogIn className="size-4" />
              )}
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#18ffbe] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
