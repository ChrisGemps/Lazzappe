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

  // Helper to get JWT token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

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
    const token = getToken();
    
    // Prevent sellers (role === 'SELLER') from adding items to cart
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = user?.role || '';
      if (role === 'SELLER') {
        return false;
      }
    } catch (e) {
      // ignore parsing errors and proceed
    }
    
    if (!token) {
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
      // Prevent adding own product to cart
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const currUserId = user?.id || user?.user_id || user?.userId;
          const sellerUserId = product?.raw?.seller_user_id || product?.raw?.seller?.user?.user_id || product?.raw?.seller?.user?.id || product?.raw?.seller?.user?.userId || product?.raw?.seller?.userId || null;
          if (currUserId && sellerUserId && Number(currUserId) === Number(sellerUserId)) {
            return false;
          }
        }
      } catch (err) {}

      // Check if product has sufficient stock before adding to cart
      if (product?.stock !== undefined) {
        const currentInCart = items.find(i => i.id === product.id)?.qty || 0;
        const totalRequested = currentInCart + 1;
        if (totalRequested > product.stock) {
          return { ok: false, message: `Insufficient stock. Only ${product.stock} available.` };
        }
      }

      const res = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      
      if (!res.ok) {
        let errMsg = 'Add to cart failed';
        try {
          const errBody = await res.json();
          if (errBody && (errBody.error || errBody.message)) errMsg = errBody.error || errBody.message;
        } catch (e) { }
        console.error('Add to cart failed: non-ok response', res.status, errMsg);
        return { ok: false, message: errMsg };
      }
      
      const data = await res.json();
      const item = data.item || data;
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
      
      return { ok: true, item: mapped };
    } catch (err) {
      console.error('Add to cart failed:', err);
      return { ok: false, message: err?.message || 'Add to cart failed' };
    }
  };

  const removeFromCart = async (productId) => {
    const token = getToken();
    
    if (!token) {
      setItems((prev) => prev.filter((p) => p.id !== productId));
      return;
    }
    
    try {
      const found = items.find((p) => p.id === productId);
      const cartItemId = found?.cartItemId;
      if (!cartItemId) {
        setItems((prev) => prev.filter((p) => p.id !== productId));
        return;
      }
      
      const res = await fetch(`http://localhost:8080/api/cart/item/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to remove item');
      setItems((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Remove from cart failed:', err);
    }
  };

  const updateQty = async (productId, qty) => {
    const token = getToken();
    
    if (!token) {
      setItems((prev) => prev.map((p) => p.id === productId ? { ...p, qty } : p));
      return;
    }
    
    try {
      const found = items.find((p) => p.id === productId);
      const cartItemId = found?.cartItemId;
      if (!cartItemId) {
        await addToCart(found || { id: productId });
        return;
      }

      // Check stock availability before updating quantity
      if (found?.stock !== undefined && qty > found.stock) {
        throw new Error(`Insufficient stock. Only ${found.stock} available.`);
      }

      const res = await fetch(`http://localhost:8080/api/cart/item/${cartItemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: qty })
      });
      
      if (!res.ok) throw new Error('Failed to update quantity');
      const data = await res.json();
      const item = data.item || data;
      setItems((prev) => prev.map((p) => p.id === productId ? { ...p, qty: item.quantity || qty } : p));
    } catch (err) {
      console.error('Update qty failed:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    const token = getToken();
    setItems([]); // clear local immediately
    
    try {
      localStorage.setItem('cart_cleared', 'true');
    } catch (e) {}
    
    if (!token) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8080/api/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to clear cart');
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

  // load server-side cart with JWT authentication
  const loadServerCart = async () => {
    // If cart was just cleared, don't load from server to keep it empty
    try {
      if (localStorage.getItem('cart_cleared')) {
        localStorage.removeItem('cart_cleared');
        return;
      }
    } catch (e) {}
    
    const token = getToken();
    if (!token) {
      return; // No token, no cart to load
    }
    
    try {
      const res = await fetch(`http://localhost:8080/api/cart`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!res || !res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.log('Cart load failed: Not authenticated');
        }
        return;
      }
      
      const data = await res.json();
      if (!Array.isArray(data)) return;
      
      const mapped = data.map((it) => ({
        id: it.product?.product_id,
        cartItemId: it.cart_item_id,
        name: it.product?.name,
        price: typeof it.product?.price === 'number' ? it.product.price : parseFloat(it.product?.price || 0),
        image: it.product?.image_url || '',
        description: it.product?.description || '',
        stock: it.product?.stock,
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
      if (e.key === 'user' || e.key === 'username' || e.key === 'token') {
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