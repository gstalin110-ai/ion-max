"use client";

import { useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { supabase } from "@/src/lib/supabase/client";
import toast from "react-hot-toast";
import { PaymentMethodsSection } from "./payment-methods-section";
import { InvoicesSection } from "./invoices-section";
import { SupportTicketsSection } from "./support-tickets-section";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"security" | "notifications" | "ai" | "payments" | "invoices" | "tickets">("security");
  const [isSaving, setIsSaving] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"none" | "code" | "verify">("none");
  const [resetLoading, setResetLoading] = useState(false);

  // Phone verification state
  const [verificationPhone, setVerificationPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"none" | "verify">("none");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // AI form state
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [aiRole, setAiRole] = useState("assistant");
  const [aiConsent, setAiConsent] = useState(false);

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

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

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const response = await fetch("/api/auth/request-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al solicitar código");
      }

      toast.success(data.message);
      setResetStep("code");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al solicitar código");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetNewPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword: resetNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar código");
      }

      toast.success(data.message);
      setResetStep("none");
      setResetEmail("");
      setResetCode("");
      setResetNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al verificar código");
    } finally {
      setResetLoading(false);
    }
  };

  const handleRequestPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);

    try {
      const response = await fetch("/api/auth/request-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: verificationPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al solicitar código");
      }

      toast.success(data.message);
      setPhoneStep("verify");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al solicitar código");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);

    try {
      const response = await fetch("/api/auth/verify-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: verificationPhone,
          code: phoneCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar código");
      }

      toast.success(data.message);
      setPhoneStep("none");
      setVerificationPhone("");
      setPhoneCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al verificar código");
    } finally {
      setPhoneLoading(false);
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

  const handleAiSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          gemini_api_key: geminiApiKey,
          ai_role: aiRole,
          ai_consent: aiConsent,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Configuración de IA actualizada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar configuración de IA");
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
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "security"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Seguridad
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "ai"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Inteligencia Artificial
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "notifications"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "payments"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Métodos de Pago
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "invoices"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Resultados
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            activeTab === "tickets"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Tickets
        </button>
      </div>

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Cambio de contraseña directo */}
          <form onSubmit={handlePasswordChange} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
            <h2 className="text-lg font-black text-white mb-4">Cambiar Contraseña</h2>
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
          </form>

          {/* Reset por código de 12h */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
            <h2 className="text-lg font-black text-white mb-4">Recuperar Contraseña por Email</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Solicita un código de recuperación que será válido por 12 horas. Recibirás el código en tu email.
            </p>

            {resetStep === "none" && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <label className="text-sm text-zinc-400">
                  Email
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                    placeholder="tu@email.com"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 disabled:opacity-50"
                >
                  {resetLoading ? "Enviando..." : "Solicitar Código"}
                </button>
              </form>
            )}

            {resetStep === "code" && (
              <form onSubmit={handleVerifyResetCode} className="space-y-4">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-yellow-400 font-black text-sm mb-2">📧 Código Enviado</p>
                  <p className="text-xs text-zinc-400">
                    Revisa tu email para el código de 6 dígitos. El código expira en 12 horas.
                  </p>
                </div>
                <label className="text-sm text-zinc-400">
                  Código de 6 dígitos
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white text-center font-mono text-2xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </label>
                <label className="text-sm text-zinc-400">
                  Nueva contraseña
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                    placeholder="••••••••"
                    required
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep("none")}
                    className="flex-1 bg-white/10 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 disabled:opacity-50"
                  >
                    {resetLoading ? "Verificando..." : "Verificar y Cambiar"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Verificación de teléfono */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
            <h2 className="text-lg font-black text-white mb-4">Verificar Teléfono (WhatsApp/SMS)</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Verifica tu número de teléfono para mayor seguridad. Recibirás un código por SMS válido por 30 minutos.
            </p>

            {phoneStep === "none" && (
              <form onSubmit={handleRequestPhoneCode} className="space-y-4">
                <label className="text-sm text-zinc-400">
                  Número de teléfono
                  <input
                    type="tel"
                    value={verificationPhone}
                    onChange={(e) => setVerificationPhone(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                    placeholder="+593 99 123 4567"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(96,165,250,0.5)] transition-all duration-300 disabled:opacity-50"
                >
                  {phoneLoading ? "Enviando..." : "Solicitar Código SMS"}
                </button>
              </form>
            )}

            {phoneStep === "verify" && (
              <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                  <p className="text-blue-400 font-black text-sm mb-2">📱 SMS Enviado</p>
                  <p className="text-xs text-zinc-400">
                    Revisa tu teléfono para el código de 6 dígitos. El código expira en 30 minutos.
                  </p>
                </div>
                <label className="text-sm text-zinc-400">
                  Código de 6 dígitos
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white text-center font-mono text-2xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPhoneStep("none")}
                    className="flex-1 bg-white/10 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={phoneLoading}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(96,165,250,0.5)] transition-all duration-300 disabled:opacity-50"
                  >
                    {phoneLoading ? "Verificando..." : "Verificar Teléfono"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            Por seguridad, te recomendamos usar una contraseña con al menos 8 caracteres, incluyendo números y símbolos.
          </p>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === "ai" && (
        <form onSubmit={handleAiSettingsUpdate} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
              <p className="text-yellow-400 font-black text-sm mb-2">🤖 Configuración de IA Personal</p>
              <p className="text-xs text-zinc-400">
                Ingresa tu propia Gemini API Key para habilitar las funciones de inteligencia artificial en IÓN MAX. 
                Tu clave se guardará de forma segura y se usará exclusivamente para tus funciones de IA.
              </p>
            </div>
            <label className="text-sm text-zinc-400">
              Gemini API Key
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white font-mono text-sm"
                placeholder="AIzaSy..."
              />
            </label>
            <label className="text-sm text-zinc-400">
              Rol de IA
              <select
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
              >
                <option value="assistant">Asistente General</option>
                <option value="writer">Escritor/Redactor</option>
                <option value="analyst">Analista de Datos</option>
                <option value="developer">Desarrollador</option>
                <option value="marketer">Marketing</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <p className="text-xs text-zinc-400 mb-2">¿Cómo obtener tu API Key?</p>
              <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                <li>Ve a <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Google AI Studio</a></li>
                <li>Crea un nuevo proyecto o selecciona uno existente</li>
                <li>Genera una API Key para Gemini</li>
                <li>Copia y pega la clave aquí</li>
              </ol>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-semibold">Consentimiento de IA</p>
                <p className="text-sm text-zinc-400">Autorizo el uso de IA para mejorar mi experiencia en IÓN MAX</p>
              </div>
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="w-5 h-5 rounded accent-yellow-400"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Configuración de IA"}
          </button>
          <p className="mt-4 text-xs text-zinc-500">
            Tu API Key se almacena de forma encriptada en tu perfil. IÓN MAX no comparte tu clave con terceros.
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

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <PaymentMethodsSection />
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <InvoicesSection />
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <SupportTicketsSection />
        </div>
      )}
    </div>
  );
}
