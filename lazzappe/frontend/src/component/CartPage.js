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

  const updateQuantity = async (id, change) => {
    try {
      const item = cartItems.find(i => i.cartItemId === id || i.id === id);
      if (!item) {
        console.error('Item not found for id:', id);
        return;
      }
      const newQty = Math.max(1, (item.qty || item.quantity || 1) + change);
      await updateQty(item.cartItemId || item.id, newQty);
      await updateQty(id, newQty);
      setToast({ show: true, message: 'Quantity updated', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    } catch (err) {
      console.error('Failed to update quantity', err);
      setToast({ show: true, message: 'Failed to update quantity. Please try again.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    }
  };

  const removeItem = async (id) => {
    try {
      const item = cartItems.find(i => i.cartItemId === id || i.id === id);
      if (!item) {
        console.error('Item not found for removal:', id);
        return;
      }
      await removeFromCart(item.cartItemId || item.id);
      await removeFromCart(id);
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

  // Voucher system state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState('');
  const [isVoucherInputFocused, setIsVoucherInputFocused] = useState(false);

  const availableVouchers = {
    'LP40': { 
      code: 'LP40', 
      type: 'percent', 
      value: 40, 
      label: '40% off entire order', 
      description: 'Mega Sale - Get 40% discount on all items',
      badge: '🔥'
    },
    'NEW200': { 
      code: 'NEW200', 
      type: 'fixed', 
      value: 200, 
      label: '₱200 off', 
      description: 'New customer - Save ₱200 on your order',
      badge: '⭐'
    },
    'SHIPFREE': { 
      code: 'SHIPFREE', 
      type: 'shipping', 
      value: shippingBase, 
      label: 'Free shipping', 
      description: 'Free delivery on all orders',
      badge: '🚚'
    }
  };

  const MAX_VOUCHERS = 3;

  const applyVoucherCode = (codeIn) => {
    const code = (codeIn || voucherInput || '').trim().toUpperCase();
    setVoucherError('');
    if (!code) { setVoucherError('Please enter a voucher code'); return; }
    const voucher = availableVouchers[code];
    if (!voucher) { setVoucherError('Invalid voucher code'); return; }
    if (appliedVouchers.find(v => v.code === code)) { setVoucherError('Voucher already applied'); return; }
    if (appliedVouchers.length >= MAX_VOUCHERS) { setVoucherError(`You can apply up to ${MAX_VOUCHERS} vouchers only`); return; }
    setAppliedVouchers(prev => [...prev, voucher]);
    setVoucherInput('');
    setIsVoucherInputFocused(false);
  };

  const onApplyVoucher = () => applyVoucherCode(voucherInput);

  const removeVoucher = (code) => {
    setAppliedVouchers(prev => prev.filter(v => v.code !== code));
    setVoucherError('');
  };

  // Suggestions list for the dropdown (available Vouchers not yet applied)
  const suggestionList = Object.values(availableVouchers).filter(v => !appliedVouchers.find(a => a.code === v.code));
  const filteredSuggestions = suggestionList.filter(v => {
    if (!voucherInput) return true; // show all if input empty when focused
    return v.code.toLowerCase().includes(voucherInput.toLowerCase()) || v.label.toLowerCase().includes(voucherInput.toLowerCase());
  });

  // Calculate discounts and totals
  let discountedSubtotal = subtotal;
  const percentVouchers = appliedVouchers.filter(v => v.type === 'percent');
  percentVouchers.forEach(v => { discountedSubtotal *= (1 - v.value / 100); });
  const fixedVouchers = appliedVouchers.filter(v => v.type === 'fixed');
  const totalFixed = fixedVouchers.reduce((s, v) => s + v.value, 0);
  discountedSubtotal = Math.max(0, discountedSubtotal - totalFixed);
  const shippingAfterVoucher = appliedVouchers.some(v => v.type === 'shipping') ? 0 : shippingBase;
  const totalVoucherDiscount = Math.max(0, subtotal - discountedSubtotal);
  const taxAfterDiscount = discountedSubtotal * 0.1;
  const grandTotal = Math.max(0, discountedSubtotal + taxAfterDiscount + shippingAfterVoucher);

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
          <div className="cart-header">
            <div className="cart-header-title">
              <Logotext2 />
            </div>
          </div>

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
                          <button onClick={() => updateQuantity(item.cartItemId || item.id, -1)} className="quantity-btn">−</button>
                          <span className="quantity-value">{item.qty || item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.cartItemId || item.id, 1)} className="quantity-btn">+</button>
                        </div>
                        <button onClick={() => removeItem(item.cartItemId || item.id)} className="remove-btn" aria-label={`Remove ${item.name}`}>
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
                  <div className="summary-row"><span>Tax (10%)</span><span>₱{(subtotal * 0.1).toFixed(2)}</span></div>
                  <div className="summary-row"><span>Shipping</span><span>₱{shippingAfterVoucher.toFixed(2)}</span></div>
                  {appliedVouchers.length > 0 && <div className="summary-row"><span>Voucher Discount</span><span>-₱{totalVoucherDiscount.toFixed(2)}</span></div>}
                  <div className="summary-divider"><div className="summary-total"><span>Total</span><span className="summary-total-amount">₱{grandTotal.toFixed(2)}</span></div></div>
                </div>

                <div className="voucher-section">
                  <div className="voucher-input-group">
                    <input
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      type="text"
                      placeholder="Enter voucher code"
                      className="voucher-input"
                      onFocus={() => setIsVoucherInputFocused(true)}
                      onBlur={() => setTimeout(() => setIsVoucherInputFocused(false), 180)}
                    />
                    <button className="btn btn-primary" onClick={onApplyVoucher}>Apply</button>
                  </div>
                  {voucherError && <div className="voucher-error">{voucherError}</div>}
                  {appliedVouchers.length > 0 && (
                    <div className="applied-vouchers">
                      {appliedVouchers.map(v => (
                        <div key={v.code} className="voucher-pill">
                          <span className="voucher-pill-badge">{v.badge}</span>
                          <div className="voucher-pill-content">
                            <span className="voucher-code">{v.code}</span>
                            <span className="voucher-label">{v.label}</span>
                          </div>
                          <button className="remove-voucher" onClick={() => removeVoucher(v.code)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isVoucherInputFocused && filteredSuggestions.length > 0 && (
                    <div className="voucher-suggestions">
                      {filteredSuggestions.map((s) => (
                        <div
                          key={s.code}
                          className={`voucher-suggestion`}
                          onMouseDown={(e) => { e.preventDefault(); applyVoucherCode(s.code); }}
                        >
                          <div className="voucher-suggestion-badge">{s.badge}</div>
                          <div className="voucher-suggestion-content">
                            <div className="voucher-suggestion-main">{s.code}</div>
                            <div className="voucher-suggestion-sub">{s.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button disabled={cartItems.length === 0} className="checkout-btn">Proceed to Checkout<div className="arrow-icon"></div></button>
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