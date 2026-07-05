import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { OwnerPage } from "@/src/features/owner/owner-page";

export default function OwnerRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;

  useEffect(() => {
    if (!loading && user && user.email !== ownerEmail) {
      router.replace("/");
    }
  }, [loading, router, user, ownerEmail]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Verificando permisos...</p>
        </div>
      </main>
    );
  }

  if (!user || user.email !== ownerEmail) {
    return null;
  }

  return <OwnerPage />;
}
