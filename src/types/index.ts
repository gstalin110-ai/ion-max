export type Category = "SHOP" | "ACADEMY" | "SERVICES" | "JOBS" | "BUSINESS";

export interface AppUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
}
