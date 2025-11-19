import React from 'react';
import '../page/Dashboard.css';

export default function ProductCard({ product, onViewDetails, onAddToCart, onBuyNow }) {
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-footer">
        <div className="product-card-content">
          <div className="product-info" onClick={() => onViewDetails(product)}>
            <div className="product-name">{product.name}</div>
            <div className="product-price">₱{product.price?.toFixed(2)}</div>
          </div>
          <div className="product-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => onAddToCart(product)}
            >
              Add
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => onBuyNow(product)}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}