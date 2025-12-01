import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/SellerDashboard.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [sellerId, setSellerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: ''
  });

  useEffect(() => {
    checkSellerAccess();
  }, []);

  const checkSellerAccess = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please log in to access Seller Dashboard');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      // Fetch fresh profile data to get current role
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId) })
      });

      if (response.ok) {
        const profileData = await response.json();
        setUserRole(profileData.role);

        // store seller id if available
        if (profileData.seller_id) {
          setSellerId(profileData.seller_id);
        }

        if (profileData.role !== 'SELLER' && profileData.role !== 'BOTH') {
          alert('Access denied. You need a Seller account to access this page. Please switch to Seller role in your profile.');
          navigate('/profile');
          return;
        }

        // User has seller access, fetch products using seller entity id when available
        const idToUse = profileData.seller_id || userId;
        fetchProducts(idToUse);
      } else {
        throw new Error('Failed to verify user role');
      }
    } catch (error) {
      console.error('Error checking seller access:', error);
      alert('Failed to verify seller access. Please try again.');
      navigate('/dashboard');
    }
  };

  const fetchProducts = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/products/seller/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;
      const idToSend = sellerId || userId;

      const url = editingProduct
        ? `http://localhost:8080/api/products/${editingProduct.product_id}`
        : 'http://localhost:8080/api/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seller_id: idToSend,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      });

      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts(userId);
      } else {
        const error = await response.json();
        alert(error.error || error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image_url: product.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const userId = user.id || user.user_id;
        fetchProducts(userId);
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image_url: ''
    });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <>
      <NavBarComponent />
      <div className="seller-container">
        <div className="seller-wrapper">
          {/* Header */}
          <div className="seller-header">
            <div className="seller-header-content">
              <h1 className="seller-title">Seller Dashboard</h1>
              <p className="seller-subtitle">Manage your products • Role: {userRole}</p>
            </div>
            <button onClick={handleAddNew} className="btn-add-product">
              + Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-number">{products.length}</h3>
              <p className="stat-label">Total Products</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">
                {products.filter(p => p.stock > 0).length}
              </h3>
              <p className="stat-label">In Stock</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">
                {products.filter(p => p.stock === 0).length}
              </h3>
              <p className="stat-label">Out of Stock</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="products-section">
            <h2 className="section-title">Products</h2>
            
            {loading && <div className="loading-message">Loading...</div>}
            
            {!loading && products.length === 0 && (
              <div className="empty-state">
                <p>No products yet. Click "Add Product" to create your first product!</p>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.product_id}>
                        <td>
                          <div className="product-image">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="product-name">{product.name}</div>
                          <div className="product-desc">{product.description}</div>
                        </td>
                        <td>{product.category}</td>
                        <td className="product-price">₱{parseFloat(product.price).toFixed(2)}</td>
                        <td>
                          <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(product)}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.product_id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal - same as before */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="btn-close">
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₱) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Electronics, Clothing, Home"
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}