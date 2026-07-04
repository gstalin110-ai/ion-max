"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/admin");
      setIsRedirecting(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-8 py-10 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-zinc-400">{isRedirecting ? "Accediendo al panel" : "Redirigiendo..."}</p>
      </div>
    </main>
  );
}
