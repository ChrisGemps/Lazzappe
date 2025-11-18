import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const categories = [
    { name: 'Trending' },
    { name: 'Season' },
    { name: 'Gender' },
    { name: 'Brands' },
    { name: 'Style' }
  ];

  const products = [
    { 
      id: 1, 
      name: 'Leather Jackets', 
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
    },
    { 
      id: 2, 
      name: 'Aesthetic Hats', 
      image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400&h=400&fit=crop'
    },
    { 
      id: 3, 
      name: 'Designed Caps', 
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'
    },
    { 
      id: 4, 
      name: 'Winter Jackets', 
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo-container">
            <div className="logo-icon">🛍️</div>
            <div className="logo-text">LAZZAPPE</div>
          </div>
        </div>
        
        <div className="nav-right">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Seller Dome</a>
          <a href="#" className="nav-link">Follow us on 🔵 📱</a>
          <span className="nav-link">🔔 Notification</span>
          <div className="user-info">
            <div className="user-avatar"></div>
            <span>iShowSpeed</span>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search" className="search-input" />
        </div>
      </div>

      <div className="main-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2 className="sidebar-title">Categories</h2>
          <h3 className="sidebar-subtitle">Shop By</h3>
          
          <div className="categories-list">
            {categories.map((category) => (
              <div key={category.name} className="category-item">
                <div className="category-left">
                  <span className="category-dot"></span>
                  <span className="category-name">{category.name}</span>
                </div>
                <div className="category-check">✓</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="content">
          <div className="products-container">
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-footer">
                    <span className="product-name">{product.name}</span>
                    <div className="product-add">+</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Large Product Showcase */}
            <div className="showcase">
              <img 
                src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop" 
                alt="Clothing rack"
                className="showcase-image"
              />
              
              <div className="price-tag">
                <span className="tag-icon">🏷️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}