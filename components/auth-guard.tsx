"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, getAccessToken, initArgusAuth } from "@/lib/client-services/auth.service";

const AUTH_ROUTES = new Set(["/login", "/register"]);

export function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initArgusAuth();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      if (!pathname) {
        return;
      }

      const isAuthRoute = AUTH_ROUTES.has(pathname);
      const token = getAccessToken();

      if (!token) {
        if (!isAuthRoute && !cancelled) {
          router.replace("/login");
        }

        return;
      }

      try {
        await fetchMe();

        if (isAuthRoute && !cancelled) {
          router.replace("/");
        }
      } catch {
        if (cancelled) {
          return;
        }

        router.replace("/login");
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
