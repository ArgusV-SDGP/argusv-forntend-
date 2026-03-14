"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/client-services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          className="opacity-90 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md p-10 flex flex-col items-center mx-4">
        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src="/logo.png"
              alt="ArgusV Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-xl font-medium text-slate-400 tracking-wide">
            ArgusV
          </h1>
        </div>

        <p className="text-gray-500 text-[15px] font-medium mb-8 text-center">
          Create your account to get started
        </p>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-[#4880c8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-[#4880c8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-[#4880c8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm transition-colors"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 text-center">{error}</p>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors text-sm"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-700 hover:text-blue-900 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
