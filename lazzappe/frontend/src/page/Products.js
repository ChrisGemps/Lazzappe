import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../component/ProductCard';
import ProductModal from '../component/ProductModal';
import { useCart } from '../context/CartContext';
import NavBarComponent from "../component/Dashboard/NavBarComponent";
import '../css/Dashboard/Products.css';

// Simple query parser
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Products() {
  const navigate = useNavigate();
  const query = useQuery();
  const category = query.get('category') || '';

  // For now, a mocked product list. Replace with fetch to API if available.
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Close login modal if user logs in (same tab or another tab)
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch products from backend API and map to frontend-friendly shape
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }
        const mapped = data.map((p) => ({
          id: p.product_id,
          name: p.name,
          description: p.description,
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
          image: p.image_url || p.image || '',
          category: p.category || '',
          stock: p.stock || 0,
          raw: p
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const filtered = useMemo(() => {
    const arr = category
      ? products.filter((p) => {
          if (!p.category) return false;
          const catNorm = normalize(p.category);
          const queryNorm = normalize(category);
          // Prefer exact category match (normalized) to avoid 'men' matching 'women'
          if (catNorm === queryNorm) return true;
          // fallback: allow substring match only if query is longer than 3 characters
          if (queryNorm.length > 3 && catNorm.includes(queryNorm)) return true;
          return false;
        })
      : products;

    // Alphabetical order by product name
    return arr.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [products, category]);

  return (
    
    <div className="products-wrapper">
      <NavBarComponent showCategories={false} />
      <div>
  <ul>&nbsp;</ul>
</div>

      <div className="products-header">
        <h2>Products {category ? ` - ${category}` : ''}</h2>
      </div>

      <div className="products-grid">
            {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onViewDetails={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod) => {
                        const username = localStorage.getItem('username');
                        if (!username) {
                          setToast({ show: true, message: 'Cannot add to cart — please log in first', type: 'error' });
                          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                          return;
                        }
                        addToCart(prod);
                        setToast({ show: true, message: `${prod.name} has been added to your cart`, type: 'success' });
                        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                      }}
          />
        ))}

        {filtered.length === 0 && (
          <div className="products-empty">
            No products found{category ? ` for category "${category}"` : ''}.
          </div>
        )}
      </div>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
                onAdd={(prod) => {
            const username = localStorage.getItem('username');
            if (!username) {
              setToast({ show: true, message: 'Cannot add to cart — please log in first', type: 'error' });
              setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
              return false;
            }
            addToCart(prod);
            setToast({ show: true, message: `${prod.name} has been added to your cart`, type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
            return true;
          }}
        />
      )}
      {/* No modal for login on Products - show error toast instead when trying to add as guest */}
      {toast.show && (
        <div className={`products-toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.message}</div>
      )}
    </div>
  );
}
