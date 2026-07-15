"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { WalletProvider } from "@/components/wallet-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <WalletProvider>
          {children}
        </WalletProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "border border-gray-700/50 bg-gray-800/90 backdrop-blur-sm text-gray-100",
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
