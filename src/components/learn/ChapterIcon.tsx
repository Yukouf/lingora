"use client";

import { Hand, UtensilsCrossed, ShoppingCart, MapPin, Building2, Plane, Briefcase, Heart, GraduationCap, MessageCircle } from "lucide-react";

const iconMap: Record<string, { icon: React.ElementType; color: string; animation: string }> = {
  "présenter": { icon: Hand, color: "#a78bfa", animation: "animate-wave" },
  "restaurant": { icon: UtensilsCrossed, color: "#f97316", animation: "animate-wiggle" },
  "courses": { icon: ShoppingCart, color: "#22d3ee", animation: "animate-bounce-slow" },
  "chemin": { icon: MapPin, color: "#ef4444", animation: "animate-pulse-soft" },
  "hôtel": { icon: Building2, color: "#fbbf24", animation: "animate-float" },
  "hotel": { icon: Building2, color: "#fbbf24", animation: "animate-float" },
  "transport": { icon: Plane, color: "#60a5fa", animation: "animate-fly" },
  "travail": { icon: Briefcase, color: "#8b5cf6", animation: "animate-wiggle" },
  "famille": { icon: Heart, color: "#f43f5e", animation: "animate-pulse-soft" },
  "école": { icon: GraduationCap, color: "#10b981", animation: "animate-bounce-slow" },
  "conversation": { icon: MessageCircle, color: "#06b6d4", animation: "animate-float" },
};

function getIconConfig(title: string) {
  const lower = title.toLowerCase();
  for (const [key, config] of Object.entries(iconMap)) {
    if (lower.includes(key)) return config;
  }
  return { icon: MessageCircle, color: "#a78bfa", animation: "animate-float" };
}

export function ChapterIcon({ title, locked = false }: { title: string; locked?: boolean }) {
  const { icon: Icon, color, animation } = getIconConfig(title);

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${locked ? "" : animation}`}
      style={{
        backgroundColor: locked ? "rgba(255,255,255,0.03)" : `${color}15`,
      }}
    >
      <Icon
        className="h-[18px] w-[18px]"
        style={{ color: locked ? "rgba(255,255,255,0.15)" : color }}
        strokeWidth={1.8}
      />
    </div>
  );
}
