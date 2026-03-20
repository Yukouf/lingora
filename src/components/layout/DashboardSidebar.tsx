"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  MessageSquare,
  Layers,
  BarChart3,
  Users2,
  Users,
  Award,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GhostMascot } from "@/components/ui/ghost-mascot";
import { useI18n } from "@/lib/i18n/context";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/learn", label: t.dashboard.nav.learn, icon: GraduationCap },
    { href: "/practice", label: t.dashboard.nav.practice, icon: MessageSquare },
    { href: "/practice/flashcards", label: t.dashboard.nav.flashcards, icon: Layers },
    { href: "/community", label: t.dashboard.nav.community, icon: Users },
    { href: "/clubs", label: t.dashboard.nav.clubs, icon: Users2 },
    { href: "/progress", label: t.dashboard.nav.progress, icon: BarChart3 },
    { href: "/certifications", label: t.dashboard.nav.certifications, icon: Award },
    { href: "/settings", label: t.dashboard.nav.settings, icon: Settings },
  ];

  return (
    <aside className="dash-sidebar sticky top-0 hidden h-screen w-64 md:flex">
      {/* Logo — ghost mascot + monospace style like landing page */}
      <div className="dash-nav-group">
        <Link href="/" className="dash-brand-link">
          <div className="dash-ghost-mini">
            <GhostMascot />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            <span className="text-white">Ling</span>
            <span className="text-[#a78bfa]">you</span>
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
          <span className="dash-nav-label">{t.dashboard.nav.logout}</span>
        </button>
      </div>
    </aside>
  );
}
