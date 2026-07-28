import React, { createContext, useContext, useState, useEffect } from "react";
import { Listing } from "./types";

export interface CartEntry {
  listing: Listing;
  quantity: number;
}

interface CartContextType {
  items: Listing[];
  cartEntries: CartEntry[];
  wishlist: string[];
  addToCart: (item: Listing, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleWishlist: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Cargar localStorage solo después del montaje en el cliente para prevenir errores de hidratación
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem("ion-cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Compatibilidad con formato array simple de Listing
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && "listing" in parsed[0]) {
            setCartEntries(parsed);
          } else {
            // Convertir array plano de Listing a CartEntry con cantidad
            const entries: CartEntry[] = [];
            for (const item of parsed) {
              const existing = entries.find(e => e.listing.id === item.id);
              if (existing) {
                existing.quantity += 1;
              } else {
                entries.push({ listing: item, quantity: 1 });
              }
            }
            setCartEntries(entries);
          }
        }
      }

      const savedWishlist = localStorage.getItem("ion-wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error("Error al cargar localStorage:", e);
    }
  }, []);

  // Guardar en localStorage al actualizar
  const saveCart = (newEntries: CartEntry[]) => {
    setCartEntries(newEntries);
    if (typeof window !== "undefined") {
      localStorage.setItem("ion-cart", JSON.stringify(newEntries));
    }
  };

  const saveWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("ion-wishlist", JSON.stringify(newWishlist));
    }
  };

  const addToCart = (item: Listing, quantity: number = 1) => {
    const existingIndex = cartEntries.findIndex(e => e.listing.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cartEntries];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cartEntries, { listing: item, quantity }]);
    }
  };

  const removeFromCart = (id: string) => {
    const updated = cartEntries.filter(e => e.listing.id !== id);
    saveCart(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cartEntries.map(e => (e.listing.id === id ? { ...e, quantity } : e));
    saveCart(updated);
  };

  const toggleWishlist = (id: string) => {
    const updated = wishlist.includes(id) ? wishlist.filter(w => w !== id) : [...wishlist, id];
    saveWishlist(updated);
  };

  const clearCart = () => {
    saveCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ion-cart");
    }
  };

  const getTotal = () =>
    cartEntries.reduce((sum, entry) => sum + entry.listing.price * entry.quantity, 0);

  const getItemCount = () =>
    cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);

  // Lista plana de listings para compatibilidad
  const items = cartEntries.map(e => e.listing);

  return (
    <CartContext.Provider
      value={{
        items,
        cartEntries,
        wishlist: isMounted ? wishlist : [],
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe estar dentro de CartProvider");
  }
  return context;
}

