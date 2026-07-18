import { supabase } from "./supabase";
import { Listing, ListingFormData, Profile, Wallet, Order, Role } from "./types";

// ========== FUNCIONES DE LISTINGS ==========

export async function getListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      categories!inner(name),
      profiles!inner(username, avatar_url)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Listing[];
}

export async function getListingsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Listing[];
}

export async function createListing(formData: ListingFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { error, data } = await supabase.from("listings").insert([
    {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      location: formData.location,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images,
      status: "pending_review",
    },
  ]).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateListing(id: string, formData: ListingFormData) {
  const { error, data } = await supabase
    .from("listings")
    .update({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      location: formData.location,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

// ========== FUNCIONES DE PROFILES ==========

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error, data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ========== FUNCIONES DE WALLET ==========

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Wallet;
}

// ========== FUNCIONES DE ROLES ==========

export async function getUserRole(userId: string): Promise<string> {
  // Primero intentar obtener el rol desde profiles.role (sistema unificado)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profile?.role) {
    return profile.role;
  }

  // Si no existe en profiles, intentar desde user_roles (sistema relacional)
  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      roles (
        name
      )
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.roles) return "user"; // Default role
  return (data.roles as any).name;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin" || role === "owner";
}

export async function isOwner(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "owner";
}

// ========== FUNCIONES DE AUTENTICACIÓN ==========

export async function signIn(email: string) {
  // Envia un magic link / OTP al email proporcionado
  const { data, error } = await supabase.auth.signInWithOtp({ email });

  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return user;
}
