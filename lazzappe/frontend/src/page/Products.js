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
    // Listen for global product updates (created/updated/deleted) and refresh
    const onProductsChanged = () => { fetchProducts(); };
    window.addEventListener('lazzappe:products-changed', onProductsChanged);
    return () => {
      window.removeEventListener('lazzappe:products-changed', onProductsChanged);
    };
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
                onAddToCart={async (prod) => {
                  const userStr = localStorage.getItem('user');
                  if (!userStr) {
                    setToast({ show: true, message: 'Cannot add to cart — please log in first', type: 'error' });
                    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                    return;
                  }
                  const user = JSON.parse(userStr);
                  const role = (user && user.role) || '';
                  // Only allow Customers or BOTH to add to cart
                  if (role === 'SELLER') {
                    setToast({ show: true, message: 'Sellers cannot add products to the cart', type: 'error' });
                    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                    return;
                  }
                  // Block adding your own product to your cart (in case the product was not removed yet)
                  try {
                    const user = JSON.parse(userStr);
                    const currUserId = user?.id || user?.user_id || user?.userId;
                    // product.raw?.seller?.user?.user_id etc. depending on server // normalize check
                    const sellerUserId = prod?.raw?.seller_user_id || prod?.raw?.seller?.user?.user_id || prod?.raw?.seller?.user?.id || prod?.raw?.seller?.user?.userId || prod?.raw?.seller?.userId || null;
                    if (currUserId && sellerUserId && Number(currUserId) === Number(sellerUserId)) {
                      setToast({ show: true, message: 'You cannot add your own product to the cart', type: 'error' });
                      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                      return;
                    }
                  } catch (err) {
                    // ignore parsing errors
                  }
                  const added = await addToCart(prod);
                  if (!added || (added && added.ok === false)) {
                    const message = (added && added.message) || 'Failed to add product to cart. Please try again.';
                    setToast({ show: true, message, type: 'error' });
                    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                    return;
                  }
                  setToast({ show: true, message: `${prod.name} has been added to your cart`, type: 'success' });
                  setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                }}
            canAddToCart={( () => {
                const userStr = localStorage.getItem('user');
                if (!userStr) return true; // allow guests to add (they will be asked to login when necessary)
                const user = JSON.parse(userStr);
                const role = (user && user.role) || '';
                if (role === 'SELLER') return false;
                const currUserId = user?.id || user?.user_id || user?.userId;
                const sellerUserId = p?.raw?.seller_user_id || p?.raw?.seller?.user?.user_id || p?.raw?.seller?.user?.id || p?.raw?.seller?.user?.userId || p?.raw?.seller?.userId || null;
                if (currUserId && sellerUserId && Number(currUserId) === Number(sellerUserId)) return false;
                return true;
              })()}
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
                onAdd={async (prod) => {
            const username = localStorage.getItem('username');
            if (!username) {
              setToast({ show: true, message: 'Cannot add to cart — please log in first', type: 'error' });
              setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
              return false;
            }
            // Additional check: don't allow users to add their own products
            try {
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                const currUserId = user?.id || user?.user_id || user?.userId;
                const sellerUserId = prod?.raw?.seller_user_id || prod?.raw?.seller?.user?.user_id || prod?.raw?.seller?.user?.id || prod?.raw?.seller?.user?.userId || prod?.raw?.seller?.userId || null;
                if (currUserId && sellerUserId && Number(currUserId) === Number(sellerUserId)) {
                  setToast({ show: true, message: 'You cannot add your own product to the cart', type: 'error' });
                  setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
                  return false;
                }
              }
            } catch (err) { }
            const added = await addToCart(prod);
            if (!added || (added && added.ok === false)) {
              const message = (added && added.message) || 'Sellers cannot add products to the cart';
              setToast({ show: true, message, type: 'error' });
              setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
              return false;
            }
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
