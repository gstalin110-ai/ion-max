"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Activity,
  BarChart3,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  RefreshCw,
  Eye,
  Ban,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase/client";

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  pendingListings: number;
  activeListings: number;
  recentUsers: RecentUser[];
  recentListings: RecentListing[];
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string;
}

interface RecentListing {
  id: string;
  title: string;
  price: number | null;
  status: string | null;
  seller_id: string;
  created_at: string;
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings">("overview");

  // Verificar que sea el owner
  useEffect(() => {
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
    if (!user) {
      router.push("/login");
      return;
    }
    if (ownerEmail && user.email !== ownerEmail) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);

      const [
        usersResult,
        listingsResult,
        pendingResult,
        activeResult,
        recentUsersResult,
        recentListingsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("listings")
          .select("id, title, price, status, seller_id, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setStats({
        totalUsers: usersResult.count ?? 0,
        totalListings: listingsResult.count ?? 0,
        totalOrders: 0, // Futuro: tabla orders
        pendingListings: pendingResult.count ?? 0,
        activeListings: activeResult.count ?? 0,
        recentUsers: (recentUsersResult.data ?? []) as RecentUser[],
        recentListings: (recentListingsResult.data ?? []) as RecentListing[],
      });
    } catch (err) {
      console.error("Error cargando datos del Owner Panel:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const handleListingStatusChange = async (listingId: string, status: "active" | "rejected") => {
    await supabase.from("listings").update({ status }).eq("id", listingId);
    void fetchStats();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    void fetchStats();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400" />
          <p className="mt-4 text-sm text-zinc-400">Cargando Panel del Owner...</p>
        </div>
      </div>
    );
  }

  // ── Métricas de la cuadrícula Bento ──────────────────────────────────────────
  const bentoCards = [
    {
      icon: Users,
      label: "Usuarios registrados",
      value: stats?.totalUsers ?? 0,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      border: "border-blue-500/20",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: ShoppingBag,
      label: "Listings activos",
      value: stats?.activeListings ?? 0,
      color: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-400",
      border: "border-green-500/20",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: Clock,
      label: "Pendientes de revisión",
      value: stats?.pendingListings ?? 0,
      color: "from-yellow-500/20 to-yellow-600/5",
      iconColor: "text-yellow-400",
      border: "border-yellow-500/20",
      trend: "Requiere acción",
      trendUp: false,
    },
    {
      icon: Package,
      label: "Total de listings",
      value: stats?.totalListings ?? 0,
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
      border: "border-purple-500/20",
      trend: "+5%",
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Owner Panel</h1>
                <p className="text-sm text-zinc-400">IÓN MAX — Control total</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchStats()}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </button>
          </div>
        </div>

        {/* ── BENTO GRID DE MÉTRICAS ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {bentoCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-3xl border ${card.border} bg-gradient-to-br ${card.color} p-5`}
              >
                <div className="flex items-start justify-between">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  <span
                    className={`text-xs font-semibold ${
                      card.trendUp ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {card.trend}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-black text-white">
                  {card.value.toLocaleString("es-EC")}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── TABS DE NAVEGACIÓN ── */}
        <div className="flex gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 p-1 w-fit">
          {(["overview", "users", "listings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "overview" ? "Resumen" : tab === "users" ? "Usuarios" : "Listings"}
            </button>
          ))}
        </div>

        {/* ── PANEL RESUMEN ── */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Usuarios recientes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-yellow-400" />
                  Nuevos usuarios
                </h2>
                <span className="text-xs text-zinc-500">Últimos registros</span>
              </div>
              <div className="space-y-3">
                {(stats?.recentUsers ?? []).slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-black/40 p-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-sm font-black text-yellow-400">
                      {(u.full_name || u.email)[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {u.full_name || "Sin nombre"}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{u.email}</p>
                    </div>
                    <select
                      defaultValue={u.role ?? "client"}
                      onChange={(e) => void handleRoleChange(u.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                    >
                      <option value="client">Cliente</option>
                      <option value="seller">Vendedor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Listings pendientes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  Pendientes de aprobación
                </h2>
                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">
                  {stats?.pendingListings} pendientes
                </span>
              </div>
              <div className="space-y-3">
                {(stats?.recentListings ?? [])
                  .filter((l) => l.status === "pending" || l.status === "active")
                  .slice(0, 5)
                  .map((listing) => (
                    <div key={listing.id} className="flex items-center gap-3 rounded-2xl bg-black/40 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
                        <p className="text-xs text-zinc-500">
                          ${listing.price?.toFixed(2) ?? "0.00"} ·{" "}
                          <span
                            className={
                              listing.status === "active"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }
                          >
                            {listing.status === "active" ? "Activo" : "Pendiente"}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => void handleListingStatusChange(listing.id, "active")}
                          title="Aprobar"
                          className="rounded-full bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20 transition"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleListingStatusChange(listing.id, "rejected")}
                          title="Rechazar"
                          className="rounded-full bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {(stats?.pendingListings ?? 0) === 0 && (
                  <p className="text-center text-sm text-zinc-500 py-4">
                    ✅ No hay listings pendientes de revisión
                  </p>
                )}
              </div>
            </motion.div>

            {/* Panel de actividad rápida */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 lg:col-span-2"
            >
              <h2 className="mb-4 font-black text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-400" />
                Acciones rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Ver Marketplace", href: "/marketplace", icon: ShoppingBag, color: "text-blue-400" },
                  { label: "Ver Comunidad", href: "/comunidad", icon: Users, color: "text-green-400" },
                  { label: "Ver Mensajes", href: "/messages", icon: MessageSquare, color: "text-purple-400" },
                  { label: "Estadísticas", href: "/admin", icon: BarChart3, color: "text-yellow-400" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center hover:bg-white/10 transition"
                    >
                      <Icon className={`h-6 w-6 ${action.color}`} />
                      <span className="text-xs font-semibold text-zinc-300">{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── PANEL USUARIOS ── */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
          >
            <h2 className="mb-6 font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              Gestión de usuarios ({stats?.totalUsers ?? 0} total)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                    <th className="pb-3 pr-4">Usuario</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Rol</th>
                    <th className="pb-3">Registrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(stats?.recentUsers ?? []).map((u) => (
                    <tr key={u.id} className="group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/10 text-xs font-black text-yellow-400">
                            {(u.full_name || u.email)[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{u.full_name || "Sin nombre"}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{u.email}</td>
                      <td className="py-3 pr-4">
                        <select
                          defaultValue={u.role ?? "client"}
                          onChange={(e) => void handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                        >
                          <option value="client">Cliente</option>
                          <option value="seller">Vendedor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-zinc-500">
                        {new Date(u.created_at).toLocaleDateString("es-EC")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── PANEL LISTINGS ── */}
        {activeTab === "listings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
          >
            <h2 className="mb-6 font-black text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-yellow-400" />
              Gestión de listings ({stats?.totalListings ?? 0} total)
            </h2>
            <div className="space-y-3">
              {(stats?.recentListings ?? []).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-white">{listing.title}</p>
                    <p className="text-sm text-zinc-500">
                      ${listing.price?.toFixed(2) ?? "0.00"} ·{" "}
                      {new Date(listing.created_at).toLocaleDateString("es-EC")}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                      listing.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : listing.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {listing.status === "active"
                      ? "Activo"
                      : listing.status === "pending"
                      ? "Pendiente"
                      : "Rechazado"}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`/listing/${listing.id}`}
                      target="_blank"
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                      title="Ver listing"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => void handleListingStatusChange(listing.id, "active")}
                      className="rounded-full bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20 transition"
                      title="Aprobar"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void handleListingStatusChange(listing.id, "rejected")}
                      className="rounded-full bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                      title="Rechazar"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
