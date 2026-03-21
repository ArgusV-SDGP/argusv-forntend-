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

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const user = await fetchMe();

        if (!cancelled) {
          setUsername(user.username);
          setUserRole(user.role);
        }
      } catch {
        if (!cancelled) {
          setUsername("User");
          setUserRole("viewer");
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    logout();
    setIsProfileMenuOpen(false);
    router.replace("/login");
  }

  const isAdmin = userRole.toUpperCase() === "ADMIN";

  return (
    <header className="relative z-50 flex h-16 w-full items-center justify-between px-4 md:px-6 bg-secondary/5 ">
      {/* Left - Logo */}
      <div className="flex items-center">
        <span className="text-xl font-bold tracking-tight text-foreground">
          ArgusV
        </span>
        <div className="h-6 w-3.5 bg-foreground transform -skew-x-[20deg] ml-1.5 rounded-[1px]" />
      </div>

      {/* Center - Navigation */}
      <NavigationMenu className="hidden md:flex rounded-full border border-border/50 bg-background/50 backdrop-blur-sm px-1 py-1 shadow-xs">
        <NavigationMenuList className="gap-0">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/")}>
                Live Feed
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/recordings" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/recordings")}>
                Recordings
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/detections" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/detections")}>
                Detections
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/chat" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/chat")}>
                <span className="flex items-center gap-1.5">
                  <Bot className="size-3.5" />Chat
                </span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/zones" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/zones")}>
                Zones
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right - Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-5 text-muted-foreground">
        <button className="hidden md:block hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1">
          <LayoutGrid className="size-5" />
        </button>
        <button className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1 relative">
          <Bell className="size-5" />
        </button>
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
            className="size-8 rounded-full bg-muted overflow-hidden border border-border shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              alt="User Profile"
              className="h-full w-full object-cover"
            />
          </button>
          {isProfileMenuOpen ? (
            <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              <div className="px-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold leading-tight text-slate-900">
                    {username}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 capitalize">
                    {userRole.toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-xs font-medium tracking-wide text-blue-600">
                    ArgusV Access
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                {isAdmin ? (
                  <>
                    <Link
                      href="/user-profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <UserRound className="size-3.5 text-slate-700" />
                      <span>Go to profile</span>
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <Settings className="size-3.5 text-slate-700" />
                      <span>Setting</span>
                    </Link>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
                  <LogOut className="size-3.5 text-slate-700" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <button
          className="md:hidden hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1 ml-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-md p-4 md:hidden z-50">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${pathname === "/" ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
            >
              Live Feed
            </Link>
            <Link
              href="/recordings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${pathname?.startsWith("/recordings") ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
            >
              Recordings
            </Link>
            <Link
              href="/detections"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${pathname?.startsWith("/detections") ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
            >
              Detections
            </Link>
            <Link
              href="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${pathname?.startsWith("/chat") ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
            >
              Chat
            </Link>
            <Link
              href="/zones"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${pathname?.startsWith("/zones") ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
            >
              Zones
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
