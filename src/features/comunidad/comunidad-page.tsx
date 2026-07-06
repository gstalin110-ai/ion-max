"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/auth-context";
import {
  createCommunityPost,
  ensureProfile,
  getCommunityMembers,
  getCommunityPosts,
  type CommunityMember,
  type CommunityPost,
} from "@/src/services/social";

export function ComunidadPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        await ensureProfile(user.id, user.email ?? "", user.user_metadata?.nombre_completo);
        const [membersData, postsData] = await Promise.all([
          getCommunityMembers(user.id),
          getCommunityPosts(),
        ]);
        setMembers(membersData);
        setPosts(postsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newPost.trim()) return;
    setPosting(true);
    try {
      await createCommunityPost(user.id, newPost.trim());
      setNewPost("");
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo publicar. Verifica las tablas en Supabase.");
    } finally {
      setPosting(false);
    }
  }

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.profession?.toLowerCase().includes(q)
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
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Red profesional</p>
        <h1 className="mt-3 text-4xl font-black text-white">Comunidad IÓN MAX</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          Conecta con otros profesionales, comparte actualizaciones y encuentra colaboradores dentro del ecosistema.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <form onSubmit={handlePost} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Comparte una actualización profesional..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={posting || !newPost.trim()}
              className="mt-3 rounded-2xl bg-yellow-400 px-6 py-2 text-sm font-black text-black disabled:opacity-50"
            >
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </form>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-zinc-500">
                Sé el primero en publicar en la comunidad.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/20 text-sm font-black text-yellow-400">
                      {(post.author?.full_name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {post.author?.full_name ?? "Profesional"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {post.author?.profession ?? "Miembro IÓN MAX"} ·{" "}
                        {new Date(post.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">{post.content}</p>
                  {post.author && post.author.id !== user?.id && (
                    <Link
                      href={`/mensajes?con=${post.author.id}`}
                      className="mt-4 inline-block text-xs font-bold text-yellow-400 hover:text-yellow-300"
                    >
                      Enviar mensaje →
                    </Link>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-lg font-black text-white">Profesionales</h2>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o sector..."
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500"
            />
            <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4"
                >
                  <p className="font-bold text-white">{member.full_name ?? "Sin nombre"}</p>
                  <p className="text-xs text-zinc-500">{member.profession ?? "Profesional"}</p>
                  {member.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{member.bio}</p>
                  )}
                  <Link
                    href={`/mensajes?con=${member.id}`}
                    className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
                  >
                    Conectar
                  </Link>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-sm text-zinc-500">No hay miembros que coincidan.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
