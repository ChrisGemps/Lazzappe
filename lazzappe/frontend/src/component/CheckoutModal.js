import React, { useState, useEffect } from 'react';
import '../css/Dashboard/CheckoutModal.css';

const CheckoutModal = ({ open, onClose, totalAmount, onCheckout, clearCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [paidAmount, setPaidAmount] = useState(null);

  // LAZZAPPEEPAY gives 5% discount when selected
  const LAZZAPPEEPAY_DISCOUNT = 0.05;

  // Fetch user's shipping address from profile on modal open
  useEffect(() => {
    if (open) {
      // reset paid amount when modal opens
      setPaidAmount(null);
      // load wallet balance from localStorage when modal opens
      try {
        const w = parseFloat(localStorage.getItem('lazzappee_wallet')) || 0;
        setWalletBalance(w);
      } catch (err) {
        setWalletBalance(0);
      }

      // listener to update wallet balance if changed elsewhere
      const onWalletUpdated = () => {
        try { setWalletBalance(parseFloat(localStorage.getItem('lazzappee_wallet')) || 0); } catch (e) { setWalletBalance(0); }
      };
      window.addEventListener('lazzappe:wallet-updated', onWalletUpdated);
      window.addEventListener('storage', onWalletUpdated);

      const fetchShippingAddress = async () => {
        try {
          const userStr = localStorage.getItem('user');
          if (!userStr) return;
          
          const user = JSON.parse(userStr);
          const userId = user?.user_id || user?.id || user?.userId;
          
          if (!userId) return;

          const response = await fetch('http://localhost:8080/api/auth/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // include session cookie if you are using session-based auth
          });


          if (response.ok) {
            const profileData = await response.json();
            if (profileData.shipping_address) {
              setShippingAddress(profileData.shipping_address);
            }
          }
        } catch (err) {
          console.error('Error fetching shipping address:', err);
        }
      };

      fetchShippingAddress();

      return () => {
        window.removeEventListener('lazzappe:wallet-updated', onWalletUpdated);
        window.removeEventListener('storage', onWalletUpdated);
      };
    }
  }, [open]);

  // when payment method changes, auto-enable wallet usage for LAZZAPPEEPAY
  useEffect(() => {
    if (paymentMethod === 'LAZZAPPEEPAY') setUseWallet(true);
    else setUseWallet(false);
  }, [paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const userId = user?.user_id || user?.id || user?.userId;

      if (!userId) {
        setError('User information not found. Please log in again.');
        setLoading(false);
        return;
      }

      const discountRate = paymentMethod === 'LAZZAPPEEPAY' ? LAZZAPPEEPAY_DISCOUNT : 0;
      const discounted = Math.max(0, totalAmount * (1 - discountRate));

      // determine coins to apply (for LAZZAPPEEPAY we auto-apply coins)
      const coinsToApply = paymentMethod === 'LAZZAPPEEPAY' ? Math.min(walletBalance, discounted) : (useWallet ? Math.min(walletBalance, discounted) : 0);
      const finalTotal = Math.max(0, discounted - coinsToApply);

      const response = await fetch('http://localhost:8080/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ensures backend knows who the user is
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          shippingAddress: shippingAddress,
          totalAmount: finalTotal.toFixed(2),
          lazzappeeCoinsUsed: coinsToApply.toFixed(2)
        })
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();
      // prefer server-provided total amount (discounted/final) if returned
      try {
        const serverTotal = data?.total_amount || data?.totalAmount || data?.total || data?.paid_amount || data?.paidAmount;
        if (serverTotal !== undefined && serverTotal !== null && serverTotal !== '') {
          setPaidAmount(parseFloat(serverTotal).toFixed(2));
        } else {
          setPaidAmount(finalTotal.toFixed(2));
        }
      } catch (e) {
        setPaidAmount(finalTotal.toFixed(2));
      }
      
      // After successful checkout, deduct stock from seller's products
      // Get cart items from localStorage to see what was ordered
      try {
        const cartStr = localStorage.getItem('cart');
        if (cartStr) {
          const cartItems = JSON.parse(cartStr);
          // For each item in cart, find the product and update stock
          for (const cartItem of cartItems) {
            try {
              // Fetch the product to get its current details
              const productRes = await fetch(`http://localhost:8080/api/products/${cartItem.id}`);
              if (productRes.ok) {
                const product = await productRes.json();
                const newStock = Math.max(0, product.stock - cartItem.qty);
                
                // Update the product stock
                await fetch(`http://localhost:8080/api/products/${cartItem.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...product,
                    stock: newStock
                  })
                });
              }
            } catch (err) {
              console.warn(`Failed to deduct stock for product ${cartItem.id}:`, err);
              // don't fail checkout if stock update fails
            }
          }
          // Notify sellers that products changed
          try { window.dispatchEvent(new CustomEvent('lazzappe:products-changed')); } catch (err) {}
        }
      } catch (err) {
        console.warn('Error updating stock after checkout:', err);
      }

      setSuccess(data);
      setLoading(false);
      // Clear the cart immediately after successful checkout
      if (clearCart) clearCart();
      // if coins were used, update local wallet immediately and notify other components
      try {
        if (typeof coinsToApply === 'number' && coinsToApply > 0) {
          const current = parseFloat(localStorage.getItem('lazzappee_wallet')) || 0;
          const newWallet = Math.max(0, current - coinsToApply);
          localStorage.setItem('lazzappee_wallet', newWallet.toFixed(2));
          try { window.dispatchEvent(new CustomEvent('lazzappe:wallet-updated')); } catch (err) {}
          setWalletBalance(newWallet);
        }
      } catch (err) {
        console.warn('Failed to update wallet after checkout:', err);
      }
      setTimeout(() => {
        onCheckout(data);
      }, 2000);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (!open) return null;

  // compute display amounts for LAZZAPPEEPAY + wallet usage (auto-apply coins for LAZZAPPEEPAY)
  const displayDiscountRate = paymentMethod === 'LAZZAPPEEPAY' ? LAZZAPPEEPAY_DISCOUNT : 0;
  const discountedAmount = Math.max(0, totalAmount * (1 - displayDiscountRate));
  const appliedCoins = paymentMethod === 'LAZZAPPEEPAY' ? Math.min(walletBalance, discountedAmount) : (useWallet ? Math.min(walletBalance, discountedAmount) : 0);
  const payableAmount = Math.max(0, discountedAmount - appliedCoins);
  const walletInsufficient = paymentMethod === 'LAZZAPPEEPAY' && walletBalance < discountedAmount;

  if (success) {
    return (
      <div className="checkout-modal-overlay">
        <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p className="success-message">Thank you for your order.</p>
            <div className="order-info">
              <div className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">#{success.order_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Method:</span>
                      <span className="info-value">{success.payment_method === 'COD' ? 'Cash on Delivery' : success.payment_method === 'ONLINE' ? 'Online Payment' : success.payment_method === 'LAZZAPPEEPAY' ? 'LAZZAPPEEPAY Wallet' : success.payment_method}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                      <span className="info-value">₱{paidAmount ?? (success.total_amount || success.totalAmount || success.total)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">{success.status}</span>
              </div>
            </div>
            <p className="success-note">You will receive a confirmation email shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-modal-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Total Amount */}
            <div className="checkout-section">
              <h3>Order Summary</h3>
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="amount">₱{(paymentMethod === 'LAZZAPPEEPAY' ? (totalAmount * (1 - LAZZAPPEEPAY_DISCOUNT)) : totalAmount).toFixed(2)}</span>
              </div>
              {paymentMethod === 'LAZZAPPEEPAY' && (
                <>
                  <div className="order-discount">
                    <span>LAZZAPPEEPAY Discount (5%)</span>
                    <span className="amount">-₱{(totalAmount * LAZZAPPEEPAY_DISCOUNT).toFixed(2)}</span>
                  </div>

                  <div className="wallet-line" style={{marginTop: '8px'}}>
                    <span><strong>LazzappeeCoins Balance: </strong> ₱{walletBalance.toFixed(2)}</span>
                    <button type="button" className="wallet-topup-btn" onClick={() => { window.location.href = '/topup'; }}>Top Up</button>
                  </div>

                  <div className="order-discount">
                    <span>Applied LazzappeeCoins</span>
                    <span className="amount">-₱{appliedCoins.toFixed(2)}</span>
                  </div>

                  {useWallet && walletInsufficient && (
                    <div className="checkout-error">Insufficient LazzappeeCoins to cover the discounted total.</div>
                  )}
                </>
              )}
            </div>

            {/* Shipping Address */}
            <div className="checkout-section">
              <label htmlFor="shippingAddress" className="checkout-label">Shipping Address *</label>
              <textarea
                id="shippingAddress"
                className="checkout-input"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address"
                rows="3"
              />
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <label className="checkout-label">Payment Method *</label>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="LAZZAPPEEPAY"
                    checked={paymentMethod === 'LAZZAPPEEPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-option-title">LAZZAPPEEPAY</span>
                    <span className="payment-option-desc">Pay with LAZZAPPEE wallet (5% off)</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-option-title">Cash on Delivery (COD)</span>
                    <span className="payment-option-desc">Pay when you receive your order</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-option-title">Online Payment</span>
                    <span className="payment-option-desc">Pay with card or digital wallet</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="checkout-error">{error}</div>}

            {/* Buttons */}
            <div className="checkout-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-place-order"
                disabled={loading || walletInsufficient}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
