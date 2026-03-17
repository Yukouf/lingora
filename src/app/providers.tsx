"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { I18nProvider } from "@/lib/i18n/context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <TooltipProvider>
              {children}
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </I18nProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
