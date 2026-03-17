"use client";

import { useState } from "react";

interface GlowSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function GlowSearch({
  placeholder = "Rechercher une leçon, un mot...",
  onSearch,
}: GlowSearchProps) {
  const [query, setQuery] = useState("");

  return (
    <input
      placeholder={placeholder}
      type="text"
      autoComplete="off"
      name="search"
      className="search-input"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch?.(query)}
    />
  );
}
