"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white"
      aria-label={isDark ? "Mode clair" : "Mode nuit"}
    >
      <Sun
        className={`h-4 w-4 transition-all ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
        style={{ position: isDark ? "absolute" : "relative" }}
      />
      <Moon
        className={`h-4 w-4 transition-all ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
        style={{ position: isDark ? "relative" : "absolute" }}
      />
    </button>
  );
}
