import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  const storageKeyFor = (user) => `cart_${user || 'guest'}`;

  const [items, setItems] = useState(() => {
    try {
      // load cart for current username or guest
      const key = storageKeyFor(localStorage.getItem('username'));
      const raw = localStorage.getItem(key) ?? localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  const addToCart = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((p) => p.id === productId ? { ...p, qty } : p));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((s, p) => s + (p.qty || 0), 0);

  const total = items.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0);

  // persist cart to per-user localStorage key
  useEffect(() => {
    try {
      const key = storageKeyFor(username);
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items, username]);

  // listen for username changes from localStorage (cross-tab or login flows)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'username') {
        setUsername(e.newValue);
      }
    };
    const handleCustom = (e) => {
      // custom event from login page within same tab
      setUsername(e?.detail || localStorage.getItem('username'));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('lazzappe:username-changed', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lazzappe:username-changed', handleCustom);
    };
  }, []);

  // load cart when username changes (handles login flows)
  useEffect(() => {
    if (!username) {
      // when there's no logged user, clear the in-memory cart (UI shows empty cart)
      setItems([]);
      return;
    }
    try {
      const key = storageKeyFor(username);
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
      else {
        // If a guest cart exists, and the user just logged in, migrate guest cart to user cart
        const guestKey = storageKeyFor('guest');
        const guestRaw = localStorage.getItem(guestKey) || localStorage.getItem('cart');
        if (guestRaw) {
          try {
            const guestItems = JSON.parse(guestRaw);
            setItems(guestItems);
            // persist to user cart key
            localStorage.setItem(key, JSON.stringify(guestItems));
            // optional: clear guest cart
            // localStorage.removeItem(guestKey);
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [username]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, itemCount, total, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
