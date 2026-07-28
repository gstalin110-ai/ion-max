"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { getOwnerSummary, getOwnerUsers, getOwnerLogs, toggleUserActive, updateUserRole, type OwnerProfile, type AuditLogEntry } from "@/src/services/owner";

const roleOptions = ["client", "admin", "owner"];

export function OwnerPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    users: 0,
    admins: 0,
    activeUsers: 0,
    listings: 0,
    orders: 0,
    sales: 0,
    auditEntries: 0,
    settingsCount: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingListings: 0,
    activeListings: 0,
    communityPosts: 0,
  });
  const [users, setUsers] = useState<OwnerProfile[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwnerData() {
      try {
        const [summaryData, usersData, logsData] = await Promise.all([
          getOwnerSummary(),
          getOwnerUsers(),
          getOwnerLogs(),
        ]);
        setSummary(summaryData);
        setUsers(usersData);
        setLogs(logsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOwnerData();
  }, []);

  async function handleToggleActive(profile: OwnerProfile) {
    if (!profile.id) return;
    setSaving(true);
    try {
      await toggleUserActive(profile.id, !Boolean(profile.active ?? profile.is_active));
      setUsers((current) =>
        current.map((item) =>
          item.id === profile.id ? { ...item, active: !Boolean(profile.active ?? profile.is_active) } : item
        )
      );
      setMessage("Estado de usuario actualizado");
    } catch (error) {
      setMessage(`Error actualizando estado: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(profileId: string, role: string) {
    setSaving(true);
    try {
      await updateUserRole(profileId, role);
      setUsers((current) =>
        current.map((item) => (item.id === profileId ? { ...item, role } : item))
      );
      setMessage("Rol de usuario actualizado");
    } catch (error) {
      setMessage(`Error actualizando rol: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Cargando panel del dueño...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black to-zinc-900 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Panel del Dueño</p>
        <h1 className="mt-3 text-3xl font-black">Administración IÓN MAX</h1>
        <p className="mt-2 text-sm text-zinc-400">Panel de control completo para gestión de usuarios, métricas y operaciones.</p>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {message}
        </div>
      )}

      {/* Bento Grid de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(140px,auto)]">
        {/* Ingresos Globales - Grande */}
        <div className="md:col-span-2 lg:col-span-2 rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <p className="text-xs uppercase tracking-[0.3em]">Ingresos Globales</p>
          </div>
          <p className="text-4xl font-black text-white">${summary.totalRevenue.toLocaleString()}</p>
          <p className="mt-2 text-sm text-zinc-400">Comisiones de wallet incluidas</p>
        </div>

        {/* Usuarios Activos */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Usuarios Activos</p>
          <p className="mt-4 text-4xl font-black text-emerald-400">{summary.activeUsers}</p>
          <p className="mt-2 text-sm text-zinc-400">de {summary.users} totales</p>
        </div>

        {/* Listings Pendientes */}
        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Listings Pendientes</p>
          <p className="mt-4 text-4xl font-black text-white">{summary.pendingListings}</p>
          <p className="mt-2 text-sm text-zinc-400">Requieren aprobación</p>
        </div>

        {/* Retiros Pendientes */}
        <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Retiros Pendientes</p>
          <p className="mt-4 text-4xl font-black text-white">{summary.pendingWithdrawals}</p>
          <p className="mt-2 text-sm text-zinc-400">Por procesar</p>
        </div>

        {/* Comisiones Wallet */}
        <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Comisiones Wallet</p>
          <p className="mt-4 text-4xl font-black text-white">{summary.sales}</p>
          <p className="mt-2 text-sm text-zinc-400">Transacciones</p>
        </div>

        {/* Publicaciones Comunidad */}
        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Publicaciones</p>
          <p className="mt-4 text-4xl font-black text-white">{summary.communityPosts}</p>
          <p className="mt-2 text-sm text-zinc-400">En comunidad</p>
        </div>

        {/* Admins */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Administradores</p>
          <p className="mt-4 text-4xl font-black text-purple-400">{summary.admins}</p>
          <p className="mt-2 text-sm text-zinc-400">Con acceso</p>
        </div>

        {/* Estado Sistema */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Estado Sistema</p>
          <p className="mt-4 text-2xl font-black text-emerald-400">● Operativo</p>
          <p className="mt-2 text-sm text-zinc-400">Supabase conectado</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">Acciones Rápidas</p>
        <div className="grid gap-3 md:grid-cols-4">
          <button className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-left hover:bg-yellow-400/20 transition-all group">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-400 group-hover:text-yellow-300">Aprobar Listings</p>
            <p className="mt-2 text-sm text-white font-black">{summary.pendingListings} pendientes</p>
          </button>
          <button className="rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 text-left hover:bg-orange-400/20 transition-all group">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-400 group-hover:text-orange-300">Procesar Retiros</p>
            <p className="mt-2 text-sm text-white font-black">{summary.pendingWithdrawals} pendientes</p>
          </button>
          <button className="rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4 text-left hover:bg-blue-400/20 transition-all group">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 group-hover:text-blue-300">Verificar Empresas</p>
            <p className="mt-2 text-sm text-white font-black">Solicitudes</p>
          </button>
          <button className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4 text-left hover:bg-purple-400/20 transition-all group">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 group-hover:text-purple-300">Configurar Comisiones</p>
            <p className="mt-2 text-sm text-white font-black">Tarifas</p>
          </button>
        </div>
      </div>

      {/* Gestión de Usuarios */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Gestión de Usuarios</p>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">{users.length} perfiles</span>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/50">
          <div className="grid grid-cols-7 gap-4 bg-zinc-900/90 px-4 py-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
            <span>ID</span>
            <span className="col-span-2">Email</span>
            <span>Rol</span>
            <span>Activo</span>
            <span>Creado</span>
            <span className="text-right">Nombre</span>
          </div>
          <div className="space-y-2 p-4 max-h-[400px] overflow-y-auto">
            {users.map((profile) => {
              const active = Boolean(profile.active ?? profile.is_active);
              return (
                <div key={profile.id} className="grid grid-cols-7 gap-4 rounded-3xl bg-white/5 p-4 text-sm text-zinc-300">
                  <span className="truncate">{profile.id.slice(0, 6)}</span>
                  <span className="col-span-2 truncate">{profile.email ?? "-"}</span>
                  <select
                    value={profile.role ?? "client"}
                    onChange={(event) => handleRoleChange(profile.id, event.target.value)}
                    disabled={saving}
                    className="rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(profile)}
                    disabled={saving}
                    className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${active ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}
                  >
                    {active ? "Activo" : "Inactivo"}
                  </button>
                  <span className="truncate">{profile.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "-"}</span>
                  <span className="text-right text-xs text-zinc-400">{profile.full_name ?? "Sin nombre"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Encuestas de Satisfacción y Auditoría */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">Encuestas de Satisfacción</p>
          <div className="space-y-3">
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-black">Satisfacción General</p>
                <span className="text-yellow-400 font-black">4.8/5.0</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-black">Calidad de Servicio</p>
                <span className="text-green-400 font-black">4.6/5.0</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-black">Soporte de Wallet</p>
                <span className="text-blue-400 font-black">4.9/5.0</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "98%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">Auditoría Reciente</p>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-zinc-500 text-sm">No hay entradas de auditoría disponibles.</p>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-black/60 p-4">
                  <p className="font-semibold text-white text-sm">{log.action ?? "Evento"}</p>
                  <p className="text-xs text-zinc-500 mt-1">{log.actor ?? "Sistema"} · {log.created_at ? new Date(log.created_at).toLocaleString("es-ES") : "-"}</p>
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2">{log.details ?? "Sin detalles"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
