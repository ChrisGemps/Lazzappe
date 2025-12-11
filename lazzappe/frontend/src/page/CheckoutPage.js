import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarComponent from '../component/Dashboard/NavBarComponent';
import { ChevronLeft } from 'lucide-react';
import '../css/Dashboard/CheckoutPage.css';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [editingBilling, setEditingBilling] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState('');
  const [isVoucherInputFocused, setIsVoucherInputFocused] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const shipping = 150;
  const tax = total * 0.1;
  const grandTotal = Math.max(0, total + tax + shipping);

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
      value: shipping, 
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

  const suggestionList = Object.values(availableVouchers).filter(v => !appliedVouchers.find(a => a.code === v.code));
  const filteredSuggestions = suggestionList.filter(v => {
    if (!voucherInput) return true;
    return v.code.toLowerCase().includes(voucherInput.toLowerCase()) || v.label.toLowerCase().includes(voucherInput.toLowerCase());
  });

  // Calculate totals with voucher discounts
  let discountedSubtotal = total;
  const percentVouchers = appliedVouchers.filter(v => v.type === 'percent');
  percentVouchers.forEach(v => { discountedSubtotal *= (1 - v.value / 100); });
  const fixedVouchers = appliedVouchers.filter(v => v.type === 'fixed');
  const totalFixed = fixedVouchers.reduce((s, v) => s + v.value, 0);
  discountedSubtotal = Math.max(0, discountedSubtotal - totalFixed);
  const shippingAfterVoucher = appliedVouchers.some(v => v.type === 'shipping') ? 0 : shipping;
  const totalVoucherDiscount = Math.max(0, total - discountedSubtotal);
  const taxAfterDiscount = discountedSubtotal * 0.1;
  const finalGrandTotal = Math.max(0, discountedSubtotal + taxAfterDiscount + shippingAfterVoucher);

  const placeOrder = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Please log in to place an order.');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const customerId = user.id || user.user_id || user.userId;

      if (!customerId) {
        alert('Unable to identify user. Please log in again.');
        navigate('/login');
        return;
      }

      if (!shippingAddress) {
        alert('Please enter a shipping address.');
        return;
      }

      // Prepare order items
      const orderItems = items.map(item => ({
        order_item_id: Math.random(),
        product: {
          product_id: item.id,
          name: item.name,
          image: item.image
        },
        quantity: item.qty || item.quantity || 1,
        price: item.price
      }));

      // Create order object
      const newOrder = {
        order_id: Math.floor(Math.random() * 1000000),
        customer_id: customerId,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        payment_method: paymentMethod,
        orderItems: orderItems,
        voucher_codes: appliedVouchers.map(v => v.code),
        order_date: new Date().toISOString(),
        status: 'PENDING',
        total_amount: finalGrandTotal,
        seller: {
          username: 'Default Seller'
        }
      };

      // Try to create order via API first
      try {
        const response = await fetch(`${API_BASE}/api/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: String(customerId),
            shipping_address: shippingAddress,
            billing_address: billingAddress || shippingAddress,
            payment_method: paymentMethod,
            order_items: items.map(item => ({
              product_id: item.id,
              quantity: item.qty || item.quantity || 1,
              price: item.price
            })),
            voucher_codes: appliedVouchers.map(v => v.code),
            total_amount: finalGrandTotal
          })
        });

        if (response.ok) {
          clearCart();
          alert('Order placed successfully!');
          navigate('/customer-orders');
          return;
        }
      } catch (apiErr) {
        console.log('API endpoint not yet available, using localStorage fallback');
      }

      // Fallback: Store order in localStorage for demo purposes
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      clearCart();
      alert('Order placed successfully!');
      navigate('/customer-orders');
    } catch (err) {
      console.error('Place order failed', err);
      alert('Failed to place order. Please try again.');
    }
  };

  useEffect(() => {
    const loadProfileAddress = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user.id || user.user_id || user.userId;
        if (!userId) return;
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: String(userId) })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.shipping_address) {
          setShippingAddress(data.shipping_address);
        }
        if (data && data.billing_address) {
          setBillingAddress(data.billing_address);
        }
      } catch (err) {
        console.error('Failed to load profile address', err);
      }
    };
    loadProfileAddress();
  }, [API_BASE]);

  return (
    <div className="cart-page-root">
      <NavBarComponent />
      <div className="cart-container">
        <div className="cart-wrapper">
          <div className="cart-header">
            <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <ChevronLeft size={18} />
              <span className="back-text">Back</span>
            </button>
          </div>

          <div className="checkout-grid">
            <div className="checkout-left">
              <h3>Delivery Address</h3>
              
              <div className="address-card">
                <div className="address-header">
                  <p className="address-title">Billing Address</p>
                  {!editingBilling && (
                    <button onClick={() => setEditingBilling(true)} className="edit-address-btn">Edit</button>
                  )}
                </div>
                {editingBilling ? (
                  <div className="address-edit-section">
                    <textarea
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Enter your billing address"
                      className="address-textarea"
                      rows="3"
                    />
                    <div className="address-actions">
                      <button onClick={() => setEditingBilling(false)} className="btn-save">Save</button>
                      <button onClick={() => setEditingBilling(false)} className="btn-cancel">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="address-text">{billingAddress || 'No billing address on file. Click Edit to add one.'}</p>
                )}
              </div>

              <div className="address-card">
                <div className="address-header">
                  <p className="address-title">Shipping Address</p>
                  {!editingShipping && (
                    <button onClick={() => setEditingShipping(true)} className="edit-address-btn">Edit</button>
                  )}
                </div>
                {editingShipping ? (
                  <div className="address-edit-section">
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your shipping address"
                      className="address-textarea"
                      rows="3"
                    />
                    <div className="address-actions">
                      <button onClick={() => setEditingShipping(false)} className="btn-save">Save</button>
                      <button onClick={() => setEditingShipping(false)} className="btn-cancel">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="address-text">{shippingAddress || 'No shipping address on file. Click Edit to add one.'}</p>
                )}
              </div>

              <h3>Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">💵 Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="emoney"
                    checked={paymentMethod === 'emoney'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">💳 E-Money</span>
                </label>
              </div>

              <h3>Items</h3>
              <div className="checkout-items">
                {items.map((it) => (
                  <div key={it.cartItemId || it.id} className="checkout-item">
                    <img src={it.image} alt={it.name} style={{width:64,height:64,objectFit:'cover'}} />
                    <div className="checkout-item-info">
                      <div>{it.name}</div>
                      <div>Qty: {it.qty || it.quantity || 1}</div>
                    </div>
                    <div className="checkout-item-price">₱{((it.price || 0) * (it.qty || it.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}
                {items.length === 0 && <p>Your cart is empty.</p>}
              </div>
            </div>

            <div className="checkout-right">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row"><span>Merchandise Subtotal</span><span>₱{(total).toFixed(2)}</span></div>
                <div className="summary-row"><span>Tax (10%)</span><span>₱{taxAfterDiscount.toFixed(2)}</span></div>
                <div className="summary-row"><span>Shipping</span><span>₱{shippingAfterVoucher.toFixed(2)}</span></div>
                {appliedVouchers.length > 0 && <div className="summary-row"><span>Voucher Discount</span><span>-₱{totalVoucherDiscount.toFixed(2)}</span></div>}
                <div className="summary-divider"><div className="summary-total"><span>Total</span><span className="summary-total-amount">₱{finalGrandTotal.toFixed(2)}</span></div></div>
                
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
                </div>

                <button className="btn btn-primary" disabled={items.length === 0} onClick={placeOrder} style={{ marginTop: '16px' }}>Place Order</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
