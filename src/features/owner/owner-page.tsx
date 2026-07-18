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
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black to-zinc-900 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Panel del Dueño</p>
        <h1 className="mt-3 text-3xl font-black">Administración de la App</h1>
        <p className="mt-2 text-sm text-zinc-400">Herramientas completas para que el dueño administre usuarios, roles, métricas y auditoría.</p>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          { label: "Usuarios", value: summary.users, color: "text-blue-400" },
          { label: "Admins", value: summary.admins, color: "text-purple-400" },
          { label: "Usuarios activos", value: summary.activeUsers, color: "text-emerald-400" },
          { label: "Configuraciones", value: summary.settingsCount, color: "text-yellow-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          { label: "Ingresos Totales", value: `$${summary.totalRevenue.toLocaleString()}`, color: "text-green-400" },
          { label: "Retiros Pendientes", value: summary.pendingWithdrawals, color: "text-orange-400" },
          { label: "Listings Activos", value: summary.activeListings, color: "text-blue-400" },
          { label: "Listings Pendientes", value: summary.pendingListings, color: "text-yellow-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Flujo comercial</p>
          <div className="mt-5 grid gap-4">
            {[
              { label: "Listings", value: summary.listings, color: "text-blue-400" },
              { label: "Pedidos", value: summary.orders, color: "text-purple-400" },
              { label: "Ventas", value: summary.sales, color: "text-green-400" },
              { label: "Auditoría", value: summary.auditEntries, color: "text-yellow-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-black/60 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{stat.label}</p>
                <p className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Sistema</p>
          <div className="mt-5 space-y-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Supabase</p>
              <p className="mt-2 font-black text-emerald-400">Conectado</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Propietario</p>
              <p className="mt-2 font-black text-white">{user?.email ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Estado</p>
              <p className="mt-2 text-emerald-400">● Sistema operativo</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Comunidad</p>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Publicaciones</p>
              <p className="mt-2 text-3xl font-black text-blue-400">{summary.communityPosts}</p>
            </div>
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Actividad</p>
              <p className="mt-2 text-sm text-zinc-400">Usuarios activos en la red social</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Acciones Rápidas */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Acciones rápidas del dueño</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <button className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-left hover:bg-yellow-400/20 transition-all">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Aprobar listings</p>
            <p className="mt-2 text-sm text-white font-black">{summary.pendingListings} pendientes</p>
          </button>
          <button className="rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 text-left hover:bg-orange-400/20 transition-all">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Procesar retiros</p>
            <p className="mt-2 text-sm text-white font-black">{summary.pendingWithdrawals} pendientes</p>
          </button>
          <button className="rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4 text-left hover:bg-blue-400/20 transition-all">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Verificar usuarios Empresas</p>
            <p className="mt-2 text-sm text-white font-black">Solicitudes</p>
          </button>
          <button className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4 text-left hover:bg-purple-400/20 transition-all">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Configurar comisiones</p>
            <p className="mt-2 text-sm text-white font-black">Tarifas</p>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Gestión de usuarios</p>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">{users.length} perfiles</span>
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/50">
          <div className="grid grid-cols-7 gap-4 bg-zinc-900/90 px-4 py-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
            <span>ID</span>
            <span className="col-span-2">Email</span>
            <span>Rol</span>
            <span>Activo</span>
            <span>Creado</span>
            <span className="text-right">Nombre</span>
          </div>
          <div className="space-y-2 p-4">
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

      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Auditoría</p>
        <div className="mt-4 space-y-4 text-sm text-zinc-300">
          {logs.length === 0 ? (
            <p className="text-zinc-500">No hay entradas de auditoría disponibles.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-white/10 bg-black/60 p-4">
                <p className="font-semibold text-white">{log.action ?? "Evento"}</p>
                <p className="text-xs text-zinc-500">{log.actor ?? "Sistema"} · {log.created_at ? new Date(log.created_at).toLocaleString("es-ES") : "-"}</p>
                <p className="mt-2 text-zinc-400">{log.details ?? "Sin detalles"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
