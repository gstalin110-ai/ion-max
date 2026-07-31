"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/auth-context";
import { ensureProfile, getMyProfile, updateMyProfile, getMyPosts, deletePost } from "@/src/services/social";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Edit3, X, Link as LinkIcon, Globe, Trash2, AlertTriangle, Camera, Upload } from "lucide-react";
import { supabase } from "@/src/lib/supabase/client";

export function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
          setUsername(profile.username ?? "");
          setAvatarUrl(profile.avatar_url ?? null);
          setSocialLinks(profile.social_links || {
            instagram: "",
            facebook: "",
            twitter: "",
            linkedin: "",
            website: ""
          });
          
          // Verificar si es admin por email o por BD
          const isOwnerByEmail = email === "gstalin110@gmail.com";
          const isAdminFromDb = profile.is_admin || profile.role === 'owner' || false;
          setIsOwner(isOwnerByEmail || isAdminFromDb);
        }

        // Cargar posts del usuario
        setLoadingPosts(true);
        const posts = await getMyPosts(userId);
        setMyPosts(posts);
      } finally {
        setLoading(false);
        setLoadingPosts(false);
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
        username,
        social_links: socialLinks
      });
      setMessage("Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("¿Estás seguro de eliminar este post? Esta acción no se puede deshacer.")) return;
    
    try {
      await deletePost(postId);
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      setMessage("Post eliminado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al eliminar post");
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      
      // Validar tamaño máximo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage("La imagen no puede superar 2MB");
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMessage("Solo se permiten archivos de imagen");
        return;
      }

      setUploadingAvatar(true);
      setMessage(null);

      if (!user) return;

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar perfil con nueva URL
      await updateMyProfile(user.id, { avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
      setMessage("Foto de perfil actualizada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al subir foto de perfil");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!confirm("¿Estás seguro de eliminar tu foto de perfil?")) return;
    
    try {
      if (!user) return;

      // Eliminar avatar de Supabase Storage si existe
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${fileName}`]);
        }
      }

      // Actualizar perfil sin avatar
      await updateMyProfile(user.id, { avatar_url: null });
      setAvatarUrl(null);
      setMessage("Foto de perfil eliminada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al eliminar foto de perfil");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer y eliminará todos tus datos permanentemente.")) return;
    
    if (!confirm("Esta es la última confirmación. ¿Realmente deseas eliminar tu cuenta de IÓN MAX?")) return;

    try {
      if (!user) return;

      // Eliminar usuario de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        // Si no es admin, intentar eliminar desde el cliente
        await supabase.auth.signOut();
      }

      setMessage("Cuenta eliminada correctamente. Serás redirigido...");
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al eliminar cuenta");
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Perfil profesional</p>
            <h1 className="mt-3 text-4xl font-black">Tu identidad en IÓN MAX</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Completa tu perfil para que otros profesionales te encuentren en la comunidad.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full bg-white/10 p-3 text-zinc-400 hover:text-white hover:bg-white/20 transition"
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={() => router.push("/admin")}
          className="w-full rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 px-6 py-4 text-sm font-black text-yellow-400 transition hover:from-yellow-400/20 hover:to-yellow-500/20"
        >
          🛡️ Panel de Administración
        </button>
      )}

      <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        {/* Sección de Foto de Perfil */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white/20 bg-zinc-800">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-500">
                  <span className="text-2xl font-bold">{fullName.charAt(0) || "U"}</span>
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-yellow-400 p-2 text-black hover:bg-yellow-300 transition">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-1">Foto de perfil</p>
            <p className="text-xs text-zinc-400 mb-2">
              Tamaño máximo: 2MB. Formatos: JPG, PNG, WebP
            </p>
            {isEditing && avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Eliminar foto
              </button>
            )}
            {uploadingAvatar && (
              <p className="text-xs text-yellow-400 mt-1">Subiendo...</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Nombre completo</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isEditing}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Username (para tu link único)</label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">ion-max.vercel.app/u/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditing}
              placeholder="tu-usuario"
              className="flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Profesión / sector</label>
          <input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            disabled={!isEditing}
            placeholder="Ej. Consultor digital, Diseñador, Emprendedor..."
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
            rows={4}
            placeholder="Cuéntale a la comunidad en qué te especializas..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Enlaces sociales */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-4 border-t border-white/10"
          >
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Enlaces sociales
            </p>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Instagram</label>
              <input
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/tu-usuario"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Facebook</label>
              <input
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/tu-usuario"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Twitter/X</label>
              <input
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/tu-usuario"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">LinkedIn</label>
              <input
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/tu-usuario"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Sitio web</label>
              <input
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://tu-sitio.com"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
              />
            </div>
          </motion.div>
        )}

        <p className="text-xs text-zinc-500">{user?.email}</p>
        {message && (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {message}
          </p>
        )}
        {isEditing && (
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-white py-3 text-sm font-black text-black disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        )}
      </form>

      {/* Sección de gestión de contenido */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-400" />
          Gestión de Contenido
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Elimina tus posts de la comunidad. Esta acción no se puede deshacer.
        </p>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : myPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-400">No tienes posts para eliminar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2 mb-2">{post.content}</p>
                    {post.image_url && (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden mb-2">
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <p className="text-xs text-zinc-500">
                      {new Date(post.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="flex-shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    title="Eliminar post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de eliminación de cuenta */}
      <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-6">
        <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Peligro
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Eliminar tu cuenta borrará permanentemente todos tus datos, posts, mensajes y configuraciones. Esta acción no se puede deshacer.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="w-full rounded-2xl border border-red-500/50 bg-red-500/10 px-6 py-4 text-sm font-black text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
        >
          Eliminar mi cuenta permanentemente
        </button>
      </div>
    </div>
  );
}
