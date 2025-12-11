import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/CartPage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";
import { Logotext2, LoginModal } from './components';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { items: cartItems, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const updateQuantity = async (cartItemId, productId, change) => {
    try {
      const item = cartItems.find(i => i.cartItemId === cartItemId);
      if (!item) {
        console.error('Item not found for cartItemId:', cartItemId);
        return;
      }
      const newQty = Math.max(1, (item.qty || item.quantity || 1) + change);
      await updateQty(item.id, newQty);
      setToast({ show: true, message: 'Quantity updated', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    } catch (err) {
      console.error('Failed to update quantity', err);
      setToast({ show: true, message: 'Failed to update quantity. Please try again.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const item = cartItems.find(i => i.cartItemId === cartItemId);
      if (!item) {
        console.error('Item not found for cartItemId:', cartItemId);
        return;
      }
      await removeFromCart(item.id);
      setToast({ show: true, message: 'Item removed from cart', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    } catch (err) {
      console.error('Failed to remove item', err);
      setToast({ show: true, message: 'Failed to remove item. Please try again.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || item.quantity || 1), 0);
  const shippingBase = 150;
  const tax = subtotal * 0.1;
  const grandTotal = Math.max(0, subtotal + tax + shippingBase);

  // Show login modal if no user is currently logged in, and verify customer role for logged-in users
  useEffect(() => {
    const checkUserStatus = async () => {
      const username = localStorage.getItem('username') || null;
      if (!username) {
        setLoginModalOpen(true);
        return;
      }

      // Check if logged-in user is in seller role (which shouldn't be buying)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id || user.user_id;

          const response = await fetch('http://localhost:8080/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: String(userId) })
          });

          if (response.ok) {
            const profileData = await response.json();
            // If user is SELLER only, redirect them
            if (profileData.role === 'SELLER') {
              alert('Sellers cannot purchase items. Please switch to Customer role in your profile to use the cart.');
              navigate('/profile');
            }
          }
        } catch (error) {
          console.error('Error verifying customer role:', error);
        }
      }
    };

    checkUserStatus();
  }, [navigate]);

  // Close login modal if user logs in (same tab or other tabs), and re-check role on username change
  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem('username')) {
        setLoginModalOpen(false);
        // Re-check user role when username changes (happens after role switch)
        const checkRole = async () => {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              const userId = user.id || user.user_id;
              const response = await fetch('http://localhost:8080/api/auth/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: String(userId) })
              });
              if (response.ok) {
                const profileData = await response.json();
                if (profileData.role === 'SELLER') {
                  alert('Sellers cannot purchase items. Please switch to Customer role in your profile to use the cart.');
                  navigate('/profile');
                }
              }
            } catch (error) {
              console.error('Error re-checking role:', error);
            }
          }
        };
        checkRole();
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('lazzappe:username-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('lazzappe:username-changed', handler);
    };
  }, [navigate]);

  return (
    <div className="cart-page-root">
      <NavBarComponent />
      <div className="cart-container">
        <div className="cart-wrapper">
          <div className="cart-header">My Cart</div>

          <div className="cart-grid">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.cartItemId || item.id} className="cart-item">
                  <div className="cart-item-content">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">₱{(item.price).toFixed(2)}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button onClick={() => updateQuantity(item.cartItemId, item.id, -1)} className="quantity-btn">−</button>
                          <span className="quantity-value">{item.qty || item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.id, 1)} className="quantity-btn">+</button>
                        </div>
                        <button onClick={() => removeItem(item.cartItemId)} className="remove-btn" aria-label={`Remove ${item.name}`}>
                          <Trash2 size={16} />
                          <span className="remove-btn-text">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="empty-cart">
                  <div className="empty-icon"></div>
                  <p className="empty-text">Your cart is empty</p>
                </div>
              )}
            </div>

            <div>
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                <div className="summary-items">
                  <div className="summary-row"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Tax (10%)</span><span>₱{tax.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Shipping</span><span>₱{shippingBase.toFixed(2)}</span></div>
                  <div className="summary-divider"><div className="summary-total"><span>Total</span><span className="summary-total-amount">₱{grandTotal.toFixed(2)}</span></div></div>
                </div>

                <div className="voucher-section">
                  <button disabled={cartItems.length === 0} className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout<div className="arrow-icon"></div></button>
                  <p className="security-text">Secure checkout with encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal open={loginModalOpen} onClose={() => { setLoginModalOpen(false); navigate('/dashboard'); }} />
      {toast.show && (
        <div className={`cart-toast ${toast.type === 'error' ? 'error' : 'success'}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default CartPage;