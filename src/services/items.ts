import { getListings } from "@/lib/supabase-helpers";
import type { Listing } from "@/lib/types";

export async function getItems() {
  return await getListings();
}

export async function getItemsByCategory(category: string) {
  const allListings = await getListings();
  return allListings.filter(listing => listing.category_name === category);
}
