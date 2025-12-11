import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/CartPage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";
import { Logotext2, LoginModal } from './components';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

const CartPage = () => {
  const { items: cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Voucher state
  const [voucherInput, setVoucherInput] = useState('');
  const [isVoucherInputFocused, setIsVoucherInputFocused] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Sample voucher data
  const allVouchers = [
    { code: 'WELCOME10', badge: '10%', label: 'Welcome Discount', description: '10% off on first purchase' },
    { code: 'SAVE20', badge: '20%', label: 'Save More', description: '20% off on orders above ₱500' },
    { code: 'SHIP100', badge: 'FREE', label: 'Free Shipping', description: 'Free shipping on all orders' },
    { code: 'SUMMER15', badge: '15%', label: 'Summer Sale', description: '15% off on all items' },
    { code: 'FLASH5', badge: '5%', label: 'Flash Deal', description: '5% instant discount' }
  ];

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
      const errorMsg = err?.message || 'Failed to update quantity. Please try again.';
      setToast({ show: true, message: errorMsg, type: 'error' });
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

  // Handle voucher input change and filter suggestions
  const handleVoucherInputChange = (value) => {
    setVoucherInput(value);
    setVoucherError('');
    
    if (value.trim().length > 0) {
      const filtered = allVouchers.filter(v => 
        v.code.toUpperCase().includes(value.toUpperCase()) &&
        !appliedVouchers.find(av => av.code === v.code)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  // Apply voucher by code
  const applyVoucherCode = (code) => {
    const voucher = allVouchers.find(v => v.code === code);
    if (!voucher) {
      setVoucherError('Invalid voucher code');
      return;
    }

    if (appliedVouchers.find(v => v.code === code)) {
      setVoucherError('This voucher is already applied');
      return;
    }

    setAppliedVouchers([...appliedVouchers, voucher]);
    setVoucherInput('');
    setFilteredSuggestions([]);
    setVoucherError('');
    setToast({ show: true, message: `Voucher ${code} applied!`, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
  };

  // Handle apply button click
  const onApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    
    if (!code) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    applyVoucherCode(code);
  };

  // Remove an applied voucher
  const removeVoucher = (code) => {
    setAppliedVouchers(appliedVouchers.filter(v => v.code !== code));
    setToast({ show: true, message: `Voucher ${code} removed`, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
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

  const handleCheckout = async (orderData) => {
    try {
      await clearCart();
      setCheckoutOpen(false);
      setToast({ show: true, message: `Order placed successfully! Order ID: ${orderData.order_id}`, type: 'success' });
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error after checkout:', err);
      setToast({ show: true, message: 'Order placed but failed to clear cart. Please refresh.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }
  };

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
                  
                  <div className="voucher-input-group">
                    <input
                      value={voucherInput}
                      onChange={(e) => handleVoucherInputChange(e.target.value)}
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
                  <button disabled={cartItems.length === 0} className="checkout-btn" onClick={() => setCheckoutOpen(true)}>Proceed to Checkout<div className="arrow-icon"></div></button>
                  <p className="security-text">Secure checkout with encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal open={loginModalOpen} onClose={() => { setLoginModalOpen(false); navigate('/dashboard'); }} />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        totalAmount={grandTotal}
        onCheckout={handleCheckout}
      />
      {toast.show && (
        <div className={`cart-toast ${toast.type === 'error' ? 'error' : 'success'}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default CartPage;