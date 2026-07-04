import { AuthForm } from "@/src/features/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,_#050505,_#111)] px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
