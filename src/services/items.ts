import { supabase } from "@/src/lib/supabase-client";
import type { Item } from "@/src/types";

export async function getItems() {
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function getItemsByCategory(categoria: string) {
  const { data, error } = await supabase.from("items").select("*").eq("categoria", categoria).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Item[];
}
