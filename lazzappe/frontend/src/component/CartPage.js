import React, { useState } from 'react';
import '../css/Dashboard/CartPage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent"
import { Logotext2 } from './components';

export default function LuxuryCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Designer Smart Watch',
      price: 549.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Leather Laptop Bag',
      price: 189.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
    }
  ]);

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = 15;
  const total = subtotal + tax + shipping;

  return (
    <>
      <NavBarComponent />
      <div className="cart-container">
        <div className="cart-wrapper">
          {/* Header */}
          <div className="cart-header">
            <div className="cart-header-title">
              <Logotext2></Logotext2>
            </div>
          </div>

          <div className="cart-grid">
            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-content">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span className="quantity-value">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                        >
                          🗑
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

            {/* Summary */}
            <div>
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                
                <div className="summary-items">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="summary-divider">
                    <div className="summary-total">
                      <span>Total</span>
                      <span className="summary-total-amount">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={cartItems.length === 0}
                  className="checkout-btn"
                >
                  Proceed to Checkout
                  <div className="arrow-icon"></div>
                </button>

                <p className="security-text">
                  Secure checkout with encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}