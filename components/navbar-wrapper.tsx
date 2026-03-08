"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "./navigation-bar";

export function NavbarWrapper() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return <NavigationBar />;
}
