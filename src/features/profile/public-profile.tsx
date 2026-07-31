"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/auth-context";
import { getMyProfile, getCommunityPosts, isFollowing, followUser, unfollowUser } from "@/src/services/social";
import { Heart, MessageCircle, Clock, UserPlus, UserMinus, Calendar, MapPin, Link as LinkIcon, Shield, Globe, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function PublicProfilePage({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileData, postsData] = await Promise.all([
          getMyProfile(userId),
          getCommunityPosts(),
        ]);
        setProfile(profileData);
        
        // Filtrar posts del usuario según privacidad
        const userPosts = postsData.filter(post => post.user_id === userId);
        
        // Verificar privacidad del perfil
        const privacy = profileData?.privacy_settings || {};
        const postsVisibility = privacy.posts_visibility || 'public';
        
        if (postsVisibility === 'public' || (user && postsVisibility === 'friends')) {
          setPosts(userPosts);
        } else if (postsVisibility === 'private' && user?.id === userId) {
          setPosts(userPosts);
        } else {
          setPosts([]);
        }

        // Verificar si el usuario actual sigue a este perfil
        if (user && user.id !== userId) {
          const following = await isFollowing(user.id, userId);
          setIsFollowingUser(following);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      await followUser(user.id, userId);
      setIsFollowingUser(true);
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await unfollowUser(user.id, userId);
      setIsFollowingUser(false);
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Perfil no encontrado</p>
      </div>
    );
  }

  const privacy = profile.privacy_settings || {};
  const profileVisibility = privacy.profile_visibility || 'public';

  // Verificar si el usuario puede ver el perfil
  const canViewProfile = profileVisibility === 'public' || 
                        (user && profileVisibility === 'friends' && isFollowingUser) ||
                        user?.id === userId;

  if (!canViewProfile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center">
          <Shield className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-white mb-2">Perfil Privado</p>
          <p className="text-sm text-zinc-500">Este perfil solo es visible para amigos del usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header del perfil */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900 to-black p-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl font-black text-white">
              {(profile.full_name ?? "?")[0]?.toUpperCase()}
            </div>
            {profile.is_admin && (
              <div className="absolute -bottom-2 -right-2 rounded-full bg-yellow-500 p-2">
                <Shield className="h-4 w-4 text-black" />
              </div>
            )}
          </div>

          {/* Info del perfil */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{profile.full_name || "Usuario"}</h1>
                {profile.ion_id && (
                  <p className="text-sm text-blue-400 font-black mb-2">{profile.ion_id}</p>
                )}
                {profile.username && (
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4 text-zinc-500" />
                    <p className="text-sm text-zinc-400">ion-max.vercel.app/u/{profile.username}</p>
                  </div>
                )}
                {profile.profession && (
                  <p className="text-sm text-zinc-400 mb-4">{profile.profession}</p>
                )}
                {profile.bio && (
                  <p className="text-sm text-zinc-300 mb-4 line-clamp-3">{profile.bio}</p>
                )}
              </div>

              {/* Botón seguir */}
              {user && user.id !== userId && (
                <button
                  onClick={isFollowingUser ? handleUnfollow : handleFollow}
                  className={`rounded-full px-6 py-2 text-sm font-black transition ${
                    isFollowingUser
                      ? "bg-white/10 text-zinc-400 hover:bg-white/20"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowingUser ? (
                    <>
                      <UserMinus className="h-4 w-4 inline mr-2" />
                      Siguiendo
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 inline mr-2" />
                      Seguir
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Enlaces sociales */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex gap-4 mt-4">
                {profile.social_links.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition">
                    <LinkIcon className="h-4 w-4" />
                  </a>
                )}
                {profile.social_links.facebook && (
                  <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition">
                    <LinkIcon className="h-4 w-4" />
                  </a>
                )}
                {profile.social_links.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition">
                    <LinkIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {/* Info adicional */}
            <div className="flex gap-6 mt-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {new Date(profile.created_at).toLocaleDateString("es-ES")}</span>
              </div>
              {profile.role && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profile.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Configuración de privacidad visible */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 flex items-center gap-3"
      >
        <Globe className="h-5 w-5 text-blue-400" />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Visibilidad del perfil</p>
          <p className="text-xs text-zinc-500">
            {profileVisibility === 'public' ? 'Público - Visible para todos' : 
             profileVisibility === 'friends' ? 'Amigos - Solo visible para amigos' : 
             'Privado - Solo visible para ti'}
          </p>
        </div>
      </motion.div>

      {/* Publicaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white">Publicaciones</h2>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-zinc-500">
            {user?.id === userId ? "Aún no has publicado nada" : "Este usuario no tiene publicaciones públicas"}
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black text-white">
                  {(profile.full_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{profile.full_name || "Usuario"}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 mb-4">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {post.images.slice(0, 4).map((image: string, i: number) => (
                    <div key={i} className="relative h-48 rounded-xl overflow-hidden">
                      <Image
                        src={image}
                        alt={`Post image ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Heart className="h-4 w-4" />
                  <span>{(post.likes_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <MessageCircle className="h-4 w-4" />
                  <span>{(post.comments_count || 0).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
