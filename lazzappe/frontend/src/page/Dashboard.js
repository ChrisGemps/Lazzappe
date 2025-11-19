import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { CartProvider, useCart } from '../context/CartContext';
import Cart from '../component/Cart';
import ProductModal from '../component/ProductModal';
import { Logotext } from '../component/components';



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
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      price: 499.99
    },
    { 
      id: 2, 
      name: 'Aesthetic Hats', 
      image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400&h=400&fit=crop',
      price: 49.99
    },
    { 
      id: 3, 
      name: 'Designed Caps', 
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
      price: 24.99
    },
    { 
      id: 4, 
      name: 'Winter Jackets', 
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop',
      price: 599.99
    }
  ];

  return (
    <CartProvider>
    <DashboardInner products={products} categories={categories} />
    <Cart />
    </CartProvider>
  );
}

function DashboardInner({ products, categories }) {
  const [search, setSearch] = useState('');
  const [username, setUsername] = useState('Guest');
  const { addToCart, itemCount, setOpen } = useCart();
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    // try localStorage first (set by login/register flow)
    const stored = localStorage.getItem('username') || localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) setUsername(parsed.username);
        else setUsername(stored);
      } catch (e) {
        setUsername(stored);
      }
    }
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo-container">
            <div style={{ maxWidth: "170px", marginTop: "20px" }}>
            <Logotext />
            </div>
          </div>
        </div>
        
        <div className="nav-right">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Seller Dome</a>
          <a href="#" className="nav-link">Follow us on 🔵 📱</a>
          <span className="nav-link">🔔 Notification</span>
          <div className="user-info">
            <div className="user-avatar"></div>
            <span>{username}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginLeft:12}}>
            <button onClick={() => setOpen(true)} className="navbar-cart-btn">
              🛒 Cart ({itemCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Search Bar - Separated below navbar */}
      <div className="search-container-below">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="..." className="search-input" />
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
              {filtered.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-footer">
                    <div className="product-card-content">
                      <div className="product-info" onClick={() => setActiveProduct(product)}>
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">₱{product.price?.toFixed(2)}</div>
                      </div>
                      <div className="product-actions">
                        <button className="btn btn-secondary" onClick={() => addToCart(product)}>Add</button>
                        <button className="btn btn-primary" onClick={() => { addToCart(product); setOpen(true); }}>Buy</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* product modal */}
              <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} onAdd={(p) => addToCart(p)} />
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