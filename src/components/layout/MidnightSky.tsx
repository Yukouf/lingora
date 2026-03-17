"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function MidnightSky() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || resolvedTheme !== "dark") return null;

  return (
    <div className="midnight-sky" aria-hidden="true">
      <div className="sky-canvas">
        <div className="stars stars-1" />
        <div className="stars stars-2" />
        <div className="stars stars-3" />
        <div className="meteor m1" />
        <div className="meteor m2" />
        <div className="meteor m3" />
        <div className="moon" />
      </div>
    </div>
  );
}
