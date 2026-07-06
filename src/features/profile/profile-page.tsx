"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { ensureProfile, getMyProfile, updateMyProfile } from "@/src/services/social";

export function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const email = user.email ?? "";
    const fullName = user.user_metadata?.nombre_completo as string | undefined;
    async function load() {
      try {
        await ensureProfile(userId, email, fullName);
        const profile = await getMyProfile(userId);
        if (profile) {
          setFullName(profile.full_name ?? "");
          setProfession(profile.profession ?? "");
          setBio(profile.bio ?? "");
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateMyProfile(user.id, {
        full_name: fullName,
        profession,
        bio,
      });
      setMessage("Perfil actualizado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Perfil profesional</p>
        <h1 className="mt-3 text-4xl font-black">Tu identidad en IÓN MAX</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Completa tu perfil para que otros profesionales te encuentren en la comunidad.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Nombre completo</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Profesión / sector</label>
          <input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Ej. Consultor digital, Diseñador, Emprendedor..."
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Cuéntale a la comunidad en qué te especializas..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
          />
        </div>
        <p className="text-xs text-zinc-500">{user?.email}</p>
        {message && (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-white py-3 text-sm font-black text-black disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar perfil"}
        </button>
      </form>
    </div>
  );
}
