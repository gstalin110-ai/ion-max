import React, { createContext, useContext, useState, useEffect } from "react";
import { Item } from "./types";

interface CartContextType {
  items: Item[];
  wishlist: string[];
  addToCart: (item: Item) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("ion-cart");
    const savedWishlist = localStorage.getItem("ion-wishlist");
    if (savedCart) setItems(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const addToCart = (item: Item) => {
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

  const getTotal = () => items.reduce((sum, item) => sum + item.precio, 0);

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
