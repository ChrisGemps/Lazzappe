import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/CartPage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";
import { Logotext2 } from './components';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { items: cartItems, addToCart, updateQty, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const updateQuantity = (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, (item.qty || item.quantity || 1) + change);
    updateQty(id, newQty);
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || item.quantity || 1), 0);
  const shippingBase = 150;

  // Voucher system state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState('');
  const [isVoucherInputFocused, setIsVoucherInputFocused] = useState(false);

  const availableVouchers = {
    'LP40': { code: 'LP40', type: 'percent', value: 40, label: '40% off' },
    'NEW200': { code: 'NEW200', type: 'fixed', value: 200, label: '₱200 off' },
    'SHIPFREE': { code: 'SHIPFREE', type: 'shipping', value: shippingBase, label: 'Free Shipping' }
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

  /*
  // Redirect to login if no user is currently logged-in (we check a username saved to localStorage on login)
  useEffect(() => {
    const username = localStorage.getItem('username') || null;
    if (!username) {
      // redirect to login; optionally, preserve where user came from
      navigate('/login', { replace: true, state: { from: '/cart' } });
    }
  }, [navigate]);
 */

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
            <div className="cart-item">
            <div className="cart-item-content">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <div className="cart-item-header">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, -1)} className="quantity-btn">−</button>
                    <span className="quantity-value">{item.qty || item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="quantity-btn">+</button>
                  </div>
                <div className="cart-item-actions">
                  <button onClick={() => removeItem(item.id)} className="remove-btn">✕</button>
                </div>
                </div>
                <p className="cart-item-price">₱{(item.price).toFixed(2)}</p>
                

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
                          <span className="voucher-code">{v.code}</span>
                          <span className="voucher-label">{v.label}</span>
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
                          <div className="voucher-suggestion-main">{s.code}</div>
                          <div className="voucher-suggestion-sub">{s.label}</div>
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
    </div>
  );
}

export default CartPage;