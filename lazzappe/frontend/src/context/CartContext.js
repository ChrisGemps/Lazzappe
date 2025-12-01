import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  // helper to extract numeric userId from localStorage user object
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const u = JSON.parse(userStr);
      return u?.id || u?.user_id || u?.userId || null;
    } catch (e) { return null; }
  };

  const addToCart = async (product) => {
    const userId = getUserId();
    if (!userId) {
      // fallback to localStorage for guest
      let mapped;
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === product.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          mapped = next[idx];
          return next;
        }
        mapped = { ...product, qty: 1 };
        return [...prev, mapped];
      });
      return mapped;
    }

    try {
      const res = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), productId: product.id, quantity: 1 })
      });
      if (!res.ok) {
        console.error('Add to cart failed: non-ok response', res.status);
        return false;
      }
      const data = await res.json();
      const item = data.item || data; // controller returns {message,item}
      const mapped = {
        id: item.product?.product_id || product.id,
        cartItemId: item.cart_item_id,
        name: item.product?.name || product.name,
        price: typeof item.product?.price === 'number' ? item.product.price : parseFloat(item.product?.price || product.price || 0),
        image: item.product?.image_url || product.image || '',
        description: item.product?.description || product.description || '',
        qty: item.quantity || 1
      };
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === mapped.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: mapped.qty, cartItemId: mapped.cartItemId };
          return next;
        }
        return [...prev, mapped];
      });
      return mapped;
    } catch (err) {
      console.error('Add to cart failed:', err);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    const userId = getUserId();
    if (!userId) {
      setItems((prev) => prev.filter((p) => p.id !== productId));
      return;
    }
    try {
      const found = items.find((p) => p.id === productId);
      const cartItemId = found?.cartItemId;
      if (!cartItemId) {
        // nothing to delete on server, just update client
        setItems((prev) => prev.filter((p) => p.id !== productId));
        return;
      }
      const res = await fetch(`http://localhost:8080/api/cart/item/${cartItemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      setItems((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Remove from cart failed:', err);
    }
  };

  const updateQty = async (productId, qty) => {
    const userId = getUserId();
    if (!userId) {
      setItems((prev) => prev.map((p) => p.id === productId ? { ...p, qty } : p));
      return;
    }
    try {
      const found = items.find((p) => p.id === productId);
      const cartItemId = found?.cartItemId;
      if (!cartItemId) {
        // fallback to adding item
        await addToCart(found || { id: productId });
        return;
      }
      const res = await fetch(`http://localhost:8080/api/cart/item/${cartItemId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty })
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const data = await res.json();
      const item = data.item || data;
      setItems((prev) => prev.map((p) => p.id === productId ? { ...p, qty: item.quantity || qty } : p));
    } catch (err) {
      console.error('Update qty failed:', err);
    }
  };

  const clearCart = async () => {
    const userId = getUserId();
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/cart/${userId}/clear`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear cart');
      setItems([]);
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  };

  const itemCount = items.reduce((s, p) => s + (p.qty || 0), 0);

  const total = items.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0);

  // persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  // load server-side cart (by userId or username)
  const loadServerCart = async () => {
    const userId = getUserId();
    try {
      let res;
      if (userId) {
        res = await fetch(`http://localhost:8080/api/cart/${userId}`);
      } else {
        const username = localStorage.getItem('username');
        if (!username) return;
        res = await fetch(`http://localhost:8080/api/cart/by-username/${encodeURIComponent(username)}`);
      }
      if (!res || !res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const mapped = data.map((it) => ({
        id: it.product?.product_id,
        cartItemId: it.cart_item_id,
        name: it.product?.name,
        price: typeof it.product?.price === 'number' ? it.product.price : parseFloat(it.product?.price || 0),
        image: it.product?.image_url || '',
        description: it.product?.description || '',
        qty: it.quantity || 0
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Failed to load server cart:', err);
    }
  };

  // on mount: load server cart and set up listeners to reload when user/username changes
  useEffect(() => {
    loadServerCart();

    const storageHandler = (e) => {
      if (e.key === 'user' || e.key === 'username') {
        // user changed in another tab
        loadServerCart();
      }
      if (e.key === 'cart') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(Array.isArray(next) ? next : []);
        } catch (err) {
          setItems([]);
        }
      }
    };

    const usernameChangedHandler = () => {
      // custom event fired when login/profile changes
      loadServerCart();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('lazzappe:username-changed', usernameChangedHandler);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('lazzappe:username-changed', usernameChangedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for cart changes in other tabs/windows and update local state
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'cart') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(Array.isArray(next) ? next : []);
        } catch (err) {
          setItems([]);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

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
