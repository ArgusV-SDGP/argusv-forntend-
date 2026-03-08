"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Image */}
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

      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md p-10 flex flex-col items-center mx-4">
        {/* Logo Section */}
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
          Step In. Let Intelligence Guide the Way
        </p>

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              type="text"
              placeholder="Company User Name"
              className="w-full px-4 py-3.5 rounded-md border border-[#4880c8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3.5 rounded-md border border-[#4880c8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm transition-colors"
            />
          </div>

          <div className="flex justify-center pt-2 pb-4">
            <Link
              href="#"
              className="text-blue-700 hover:text-blue-900 hover:underline text-sm font-medium"
            >
              Forgot Password
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
