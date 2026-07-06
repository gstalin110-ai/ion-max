import React, { createContext, useContext, useState } from "react";
import { Listing } from "./types";

interface CartContextType {
  items: Listing[];
  wishlist: string[];
  addToCart: (item: Listing) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function initializeCart() {
  if (typeof window === 'undefined') return [];
  const savedCart = localStorage.getItem("ion-cart");
  return savedCart ? JSON.parse(savedCart) : [];
}

function initializeWishlist() {
  if (typeof window === 'undefined') return [];
  const savedWishlist = localStorage.getItem("ion-wishlist");
  return savedWishlist ? JSON.parse(savedWishlist) : [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Listing[]>(initializeCart);
  const [wishlist, setWishlist] = useState<string[]>(initializeWishlist);


  const addToCart = (item: Listing) => {
    const updated = [...items, item];
    setItems(updated);
    localStorage.setItem("ion-cart", JSON.stringify(updated));
  };

  const removeFromCart = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem("ion-cart", JSON.stringify(updated));
  };

  const toggleWishlist = (id: string) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(w => w !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("ion-wishlist", JSON.stringify(updated));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("ion-cart");
  };

  const getTotal = () => items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, wishlist, addToCart, removeFromCart, toggleWishlist, clearCart, getTotal }}>
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
