"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu-1";
import { LayoutGrid, Bell, Menu, X, LogOut, UserRound, Bot, Settings } from "lucide-react";
import { fetchMe, logout } from "@/lib/client-services/auth.service";

export function NavigationBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [userRole, setUserRole] = useState("viewer");
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const getLinkStyle = (path: string) => {
    const isActive =
      path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return "rounded-full bg-[#4a4949] text-[#18ffbe] px-5 py-1.5 text-sm font-medium transition-colors hover:bg-black/90 data-[active]:bg-black";
    }
    return "rounded-full bg-transparent text-muted-foreground px-5 py-1.5 text-sm font-medium transition-colors hover:text-foreground hover:bg-accent/50";
  };
