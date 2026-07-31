"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/auth-context";
import { getCommunityMembers, getFollowers, getFollowing, isFollowing, followUser, unfollowUser } from "@/src/services/social";
import { Search, UserPlus, UserMinus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [membersData, followingData] = await Promise.all([
          getCommunityMembers(user.id),
          getFollowing(user.id),
        ]);
        setMembers(membersData);
        const followingIds = new Set(followingData.map((f: any) => f.id));
        setFollowing(followingIds);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) return;
    try {
      await followUser(user.id, userId);
      setFollowing(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;
    try {
      await unfollowUser(user.id, userId);
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const filteredMembers = members.filter((member) => {
    const q = search.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q) ||
      member.profession?.toLowerCase().includes(q) ||
      member.ion_id?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900 to-black p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-full bg-blue-500/20 p-3">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Usuarios</h1>
            <p className="text-sm text-zinc-400">Descubre y conecta con la comunidad</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, profesión o ID IÓN..."
            className="w-full rounded-2xl border border-white/10 bg-black px-12 py-4 text-white placeholder-zinc-500 outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-zinc-500">
            No se encontraron usuarios
          </div>
        ) : (
          filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 hover:border-white/20 transition cursor-pointer"
              onClick={() => handleProfileClick(member.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                  {(member.full_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{member.full_name || "Usuario"}</p>
                    {member.ion_id && (
                      <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-black text-blue-400">
                        {member.ion_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{member.profession || "Miembro de la comunidad"}</p>
                </div>
                {user && member.id !== user.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      following.has(member.id) ? handleUnfollow(member.id) : handleFollow(member.id);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      following.has(member.id)
                        ? "bg-white/10 text-zinc-400 hover:bg-white/20"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {following.has(member.id) ? (
                      <>
                        <UserMinus className="h-3 w-3 inline mr-1" />
                        Dejar de seguir
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 inline mr-1" />
                        Seguir
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
