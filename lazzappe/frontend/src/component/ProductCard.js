import React from 'react';
import '../css/Dashboard/Dashboard.css';

export default function ProductCard({ product, onViewDetails, onAddToCart, canAddToCart = true }) {
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
            <div className="product-desc">{product.description}</div>
            <div className="product-price">₱{product.price?.toFixed(2)}</div>
          </div>
          <div className="product-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => onAddToCart(product)}
              disabled={!canAddToCart}
              title={!canAddToCart ? 'Sellers cannot add products to the cart' : 'Add to cart'}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}