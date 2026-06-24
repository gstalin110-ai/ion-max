// Tipos para todo el ecosistema de IÓN MAX

export type Categoria = "SHOP" | "ACADEMY" | "SERVICES";

export interface Item {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  enlace_externo: string;
  categoria: Categoria;
  etiqueta?: string;
  stock?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends Item {
  cantidad: number;
}

export interface WishlistItem {
  id: string;
  nombre: string;
  imagen_url: string;
  precio: number;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen_url: string;
  enlace_externo: string;
  categoria: Categoria;
  etiqueta: string;
  stock?: string;
}
