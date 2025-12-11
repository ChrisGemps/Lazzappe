import React, { useState, useEffect } from 'react';
import '../css/Dashboard/CheckoutModal.css';

const CheckoutModal = ({ open, onClose, totalAmount, onCheckout }) => {
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Fetch user's shipping address from profile on modal open
  useEffect(() => {
    if (open) {
      const fetchShippingAddress = async () => {
        try {
          const userStr = localStorage.getItem('user');
          if (!userStr) return;
          
          const user = JSON.parse(userStr);
          const userId = user?.user_id || user?.id || user?.userId;
          
          if (!userId) return;

          const response = await fetch('http://localhost:8080/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: String(userId) })
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
    }
  }, [open]);

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

      const response = await fetch('http://localhost:8080/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: String(userId),
          paymentMethod: paymentMethod,
          shippingAddress: shippingAddress,
          totalAmount: totalAmount.toString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();
      
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

  if (success) {
    return (
      <div className="checkout-modal-overlay" onClick={onClose}>
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
                <span className="info-value">{success.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value">₱{success.total_amount}</span>
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
                <span className="amount">₱{totalAmount.toFixed(2)}</span>
              </div>
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
                disabled={loading}
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
