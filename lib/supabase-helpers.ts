import { supabase } from "./supabase";
import { Item, AdminFormData, User } from "./types";

// ========== FUNCIONES DE ITEMS ==========

export async function getItems() {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function getItemsByCategory(categoria: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("categoria", categoria)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function createItem(formData: AdminFormData) {
  const { error, data } = await supabase.from("items").insert([
    {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      imagen_url: formData.imagen_url,
      enlace_externo: formData.enlace_externo,
      categoria: formData.categoria,
      etiqueta: formData.etiqueta || null,
      stock: formData.stock ? parseInt(formData.stock) : null,
    },
  ]);

  if (error) throw new Error(error.message);
  return data;
}

export async function updateItem(id: string, formData: AdminFormData) {
  const { error, data } = await supabase
    .from("items")
    .update({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      imagen_url: formData.imagen_url,
      enlace_externo: formData.enlace_externo,
      categoria: formData.categoria,
      etiqueta: formData.etiqueta || null,
      stock: formData.stock ? parseInt(formData.stock) : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) throw new Error(error.message);
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
