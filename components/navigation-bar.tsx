"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu-1";
import { LayoutGrid, Bell } from "lucide-react";

export function NavigationBar() {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    const isActive =
      path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return "rounded-full bg-[#4a4949] text-[#18ffbe] px-5 py-1.5 text-sm font-medium transition-colors hover:bg-black/90 data-[active]:bg-black";
    }
    return "rounded-full bg-transparent text-muted-foreground px-5 py-1.5 text-sm font-medium transition-colors hover:text-foreground hover:bg-accent/50";
  };

  return (
    <header className="flex h-16 w-full items-center justify-between px-6 bg-secondary/5 ">
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
            <Link href="/incidents" legacyBehavior passHref>
              <NavigationMenuLink className={getLinkStyle("/incidents")}>
                Incidents
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
      <div className="flex items-center gap-5 text-muted-foreground">
        <button className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1">
          <LayoutGrid className="size-5" />
        </button>
        <button className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1 relative">
          <Bell className="size-5" />
        </button>
        <div className="size-8 rounded-full bg-muted overflow-hidden border border-border shadow-sm shrink-0">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            alt="User Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
