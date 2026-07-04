export type Category = "SHOP" | "ACADEMY" | "SERVICES" | "JOBS" | "BUSINESS";

export interface Item {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  enlace_externo: string;
  categoria: Category;
  etiqueta?: string | null;
  stock?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
}
