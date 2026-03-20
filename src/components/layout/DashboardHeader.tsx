"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Settings } from "lucide-react";
import { GlowSearch } from "@/components/ui/glow-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebarMobile } from "./DashboardSidebarMobile";
import { GhostMascot } from "@/components/ui/ghost-mascot";
import { useI18n } from "@/lib/i18n/context";

export function DashboardHeader() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const user = session?.user;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <header className="dash-header">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger className="dash-mobile-menu md:hidden">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-none p-0">
          <DashboardSidebarMobile />
        </SheetContent>
      </Sheet>

      <Link href="/learn" className="flex items-center gap-1.5 md:hidden">
        <div className="relative h-5 w-5 shrink-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.15] origin-center">
            <GhostMascot />
          </div>
        </div>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">
          <span className="text-white">Ling</span>
          <span className="text-[#a78bfa]">you</span>
        </span>
      </Link>

      {/* Search */}
      <div className="hidden flex-1 justify-center px-8 md:flex">
        <GlowSearch />
      </div>

      <div className="flex items-center gap-3">
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="dash-avatar-trigger">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback className="bg-[#5353ff] text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="flex flex-col px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              {t.dashboard.nav.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.dashboard.nav.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
