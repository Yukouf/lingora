"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  MessageSquare,
  Layers,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GhostMascot } from "@/components/ui/ghost-mascot";

const navItems = [
  { href: "/learn", label: "Apprendre", icon: GraduationCap },
  { href: "/practice", label: "Pratiquer", icon: MessageSquare },
  { href: "/practice/flashcards", label: "Flashcards", icon: Layers },
  { href: "/progress", label: "Progression", icon: BarChart3 },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function DashboardSidebarMobile() {
  const pathname = usePathname();

  return (
    <div className="dash-sidebar h-full">
      {/* Logo — ghost mascot + monospace style */}
      <div className="dash-nav-group">
        <Link href="/" className="dash-brand-link">
          <div className="dash-ghost-mini">
            <GhostMascot />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
            Lingyou
          </span>
        </Link>
      </div>

      <div className="dash-separator" />

      {/* Navigation */}
      <nav className="dash-nav-group dash-nav-main">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("dash-nav-item", isActive && "active")}
            >
              <item.icon />
              <span className="dash-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dash-separator" />

      {/* Logout — red hover */}
      <div className="dash-nav-group">
        <button
          className="dash-nav-item dash-nav-danger"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          <span className="dash-nav-label">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
