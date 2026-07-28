"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  getAllUsers,
  banUser,
  unbanUser,
  setUserRole,
  getAllListingsAdmin,
  approveListing,
  rejectListing,
  getAllOrdersAdmin,
  getSystemStats,
  getRecentActivity,
  getAllSurveys
} from "@/lib/supabase-helpers";

export function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0 });
  const [recentActivity, setRecentActivity] = useState({ listings: [] as any[], orders: [] as any[], users: [] as any[] });
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.email !== "gstalin110@gmail.com") {
      router.push("/profile");
      return;
    }
    loadData();
  }, [user, router]);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        getSystemStats(),
        getRecentActivity()
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  async function loadListings() {
    try {
      const data = await getAllListingsAdmin();
      setListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
    }
  }

  async function loadOrders() {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }

  async function loadSurveys() {
    try {
      const data = await getAllSurveys();
      setSurveys(data || []);
    } catch (error) {
      console.error("Error loading surveys:", error);
    }
  }

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "listings") loadListings();
    if (activeTab === "orders") loadOrders();
    if (activeTab === "surveys") loadSurveys();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Panel de Administración</p>
        <h1 className="mt-3 text-4xl font-black">ION MAX Control Center</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Gestiona usuarios, listings, órdenes y configuración del sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm text-zinc-400">Usuarios Totales</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.users}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm text-zinc-400">Listings Activos</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.listings}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm text-zinc-400">Órdenes Totales</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.orders}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm text-zinc-400">Ingresos Generados</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            activeTab === "dashboard"
              ? "bg-yellow-400 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            activeTab === "users"
              ? "bg-yellow-400 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab("listings")}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            activeTab === "listings"
              ? "bg-yellow-400 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            activeTab === "orders"
              ? "bg-yellow-400 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Órdenes
        </button>
        <button
          onClick={() => setActiveTab("surveys")}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            activeTab === "surveys"
              ? "bg-yellow-400 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Encuestas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
            <h2 className="text-xl font-black text-white">Actividad Reciente</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Listings Recientes</p>
                <div className="mt-2 space-y-2">
                  {recentActivity.listings.slice(0, 5).map((listing: any) => (
                    <div key={listing.id} className="flex justify-between rounded-xl border border-white/5 bg-black px-4 py-3">
                      <span className="text-sm text-white">{listing.title}</span>
                      <span className="text-xs text-zinc-400">{listing.profiles?.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Órdenes Recientes</p>
                <div className="mt-2 space-y-2">
                  {recentActivity.orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex justify-between rounded-xl border border-white/5 bg-black px-4 py-3">
                      <span className="text-sm text-white">Orden #{order.id.slice(0, 8)}</span>
                      <span className="text-xs text-zinc-400">${order.total_amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <h2 className="text-xl font-black text-white">Gestión de Usuarios</h2>
          <div className="mt-4 space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">{user.full_name || user.email}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-xs text-zinc-500">Rol: {user.role || "user"}</p>
                </div>
                <div className="flex gap-2">
                  {user.banned ? (
                    <button
                      onClick={() => unbanUser(user.id).then(loadUsers)}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400"
                    >
                      Desbanear
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const reason = prompt("Razón del ban:");
                        if (reason) banUser(user.id, reason).then(loadUsers);
                      }}
                      className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400"
                    >
                      Banear
                    </button>
                  )}
                  <select
                    value={user.role || "user"}
                    onChange={(e) => setUserRole(user.id, e.target.value).then(loadUsers)}
                    className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "listings" && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <h2 className="text-xl font-black text-white">Gestión de Listings</h2>
          <div className="mt-4 space-y-2">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">{listing.title}</p>
                  <p className="text-xs text-zinc-400">{listing.profiles?.full_name}</p>
                  <p className="text-xs text-zinc-500">${listing.price}</p>
                  <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                    listing.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                    listing.status === "pending_review" ? "bg-yellow-500/20 text-yellow-400" :
                    listing.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-zinc-500/20 text-zinc-400"
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {listing.status === "pending_review" && (
                    <>
                      <button
                        onClick={() => approveListing(listing.id).then(loadListings)}
                        className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Razón del rechazo:");
                          if (reason) rejectListing(listing.id, reason).then(loadListings);
                        }}
                        className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <h2 className="text-xl font-black text-white">Gestión de Órdenes</h2>
          <div className="mt-4 space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">Orden #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-zinc-400">Comprador: {order.buyer?.full_name}</p>
                  <p className="text-xs text-zinc-400">Vendedor: {order.seller?.full_name}</p>
                  <p className="text-xs text-zinc-500">${order.total_amount}</p>
                  <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                    order.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                    order.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    order.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                    "bg-zinc-500/20 text-zinc-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "surveys" && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
          <h2 className="text-xl font-black text-white">Respuestas de Encuestas ({surveys.length})</h2>
          <p className="text-sm text-zinc-400 mt-1 mb-6">
            Visualiza las respuestas de los usuarios para la mejora de IÓN MAX.
          </p>
          <div className="mt-4 space-y-6">
            {surveys.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                Aún no hay respuestas de encuestas registradas.
              </div>
            ) : (
              surveys.map((survey, sIndex) => (
                <div key={survey.id || sIndex} className="rounded-2xl border border-white/10 bg-black/60 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                      Respuesta #{surveys.length - sIndex}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {survey.created_at ? new Date(survey.created_at).toLocaleString('es-ES') : "Fecha desconocida"}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    {[
                      { id: 1, q: "¿Qué edad tienes?" },
                      { id: 2, q: "¿Cuál es tu ocupación principal?" },
                      { id: 3, q: "¿Qué tan importante es para ti tener una plataforma unificada para negocios?" },
                      { id: 4, q: "¿Qué funcionalidad te interesa más?" },
                      { id: 5, q: "¿Con qué frecuencia usarías una plataforma como IÓN MAX?" },
                      { id: 6, q: "¿Qué presupuesto mensual estarías dispuesto a invertir en una plataforma premium?" },
                      { id: 7, q: "¿Prefieres aprender mediante cursos o contenido interactivo?" },
                      { id: 8, q: "¿Qué tan importante es la comunidad y networking para ti?" },
                      { id: 9, q: "¿Utilizarías herramientas de IA para mejorar tu productividad?" },
                      { id: 10, q: "¿Qué país te gustaría que IÓN MAX priorice para su expansión?" },
                      { id: 11, q: "¿Qué te gustaría mejorar en plataformas similares que has usado?" },
                      { id: 12, q: "¿Algún comentario o sugerencia adicional para IÓN MAX?" }
                    ].map((question) => {
                      const answer = survey.answers?.[question.id];
                      if (!answer) return null;
                      return (
                        <div key={question.id} className="p-3 rounded-xl bg-zinc-950/50 border border-white/5 space-y-1">
                          <p className="text-xs text-zinc-400 font-bold">{question.id}. {question.q}</p>
                          <p className="text-white font-medium">{answer}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
