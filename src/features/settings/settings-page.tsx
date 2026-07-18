"use client";

import { useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { supabase } from "@/src/lib/supabase/client";
import toast from "react-hot-toast";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio,
          profession,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Contraseña actualizada exitosamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar contraseña");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Guardar preferencias en profiles
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: {
            email: emailNotifications,
            push: pushNotifications,
            marketing: marketingEmails,
          },
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Preferencias de notificación actualizadas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar notificaciones");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Configuración</p>
        <h1 className="mt-3 text-4xl font-black">Ajusta tu experiencia</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Personaliza tu perfil, seguridad y notificaciones desde un centro centralizado.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
            activeTab === "profile"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
            activeTab === "security"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Seguridad
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
            activeTab === "notifications"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Notificaciones
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400 md:col-span-2">
              Nombre completo
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                placeholder="Tu nombre completo"
              />
            </label>
            <label className="text-sm text-zinc-400">
              Profesión
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                placeholder="Ej. Desarrollador, Diseñador, etc."
              />
            </label>
            <label className="text-sm text-zinc-400">
              Email (no editable)
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-zinc-500"
              />
            </label>
            <label className="text-sm text-zinc-400 md:col-span-2">
              Biografía
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                placeholder="Cuéntanos sobre ti..."
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <form onSubmit={handlePasswordChange} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="space-y-4">
            <label className="text-sm text-zinc-400">
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                placeholder="••••••••"
                required
              />
            </label>
            <label className="text-sm text-zinc-400">
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                placeholder="••••••••"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
          <p className="mt-4 text-xs text-zinc-500">
            Por seguridad, te recomendamos usar una contraseña con al menos 8 caracteres, incluyendo números y símbolos.
          </p>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <form onSubmit={handleNotificationsUpdate} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-semibold">Notificaciones por email</p>
                <p className="text-sm text-zinc-400">Recibe alertas importantes en tu correo</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded accent-yellow-400"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-semibold">Notificaciones push</p>
                <p className="text-sm text-zinc-400">Alertas en tiempo real en tu dispositivo</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 rounded accent-yellow-400"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-semibold">Emails de marketing</p>
                <p className="text-sm text-zinc-400">Noviedades y promociones de IÓN MAX</p>
              </div>
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="w-5 h-5 rounded accent-yellow-400"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </form>
      )}
    </div>
  );
}
