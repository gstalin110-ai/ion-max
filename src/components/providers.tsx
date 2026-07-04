"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/lib/cart-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <Toaster position="top-right" toastOptions={{ style: { background: "#111", color: "#fff", border: "1px solid #333" } }} />
      </CartProvider>
    </QueryClientProvider>
  );
}
