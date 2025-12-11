import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/CustomerOrder.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    checkCustomerAccess();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const checkCustomerAccess = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please log in to view your orders');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId) })
      });

      if (response.ok) {
        const profileData = await response.json();

        if (profileData.role !== 'CUSTOMER' && profileData.role !== 'BOTH') {
          alert('Access denied. You need a Customer account to access this page.');
          navigate('/profile');
          return;
        }

        fetchOrders(userId);
      } else {
        throw new Error('Failed to verify user role');
      }
    } catch (error) {
      console.error('Error checking customer access:', error);
      alert('Failed to verify access. Please try again.');
      navigate('/dashboard');
    }
  };

  const fetchOrders = async (customerId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/customer/${customerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } else {
        // Fallback to localStorage if API not available
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = storedOrders.filter(order => String(order.customer_id) === String(customerId));
        setOrders(userOrders);
        setFilteredOrders(userOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to localStorage
      try {
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = storedOrders.filter(order => String(order.customer_id) === String(customerId));
        setOrders(userOrders);
        setFilteredOrders(userOrders);
      } catch (localErr) {
        console.error('Error reading from localStorage:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Order cancelled successfully!');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const userId = user.id || user.user_id;
        fetchOrders(userId);
        setShowModal(false);
      } else {
        alert('Failed to cancel order. It may have already been processed.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPING': return 'status-shipping';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return '🕐';
      case 'PROCESSING': return '📦';
      case 'SHIPPING': return '🚚';
      case 'DELIVERED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const getBillingLabel = (order) => {
    if (!order) return 'TO_PAY';
    const billing = order.billing_status || order.billingStatus;
    if (billing) return billing === 'PAID' ? 'PAID' : 'TO_PAY';

    const pm = (order.payment_method || order.paymentMethod || order.payment || '').toString().toUpperCase();
    // Treat common online payment identifiers as paid immediately
    const onlineIndicators = ['ONLINE', 'GCASH', 'PAYPAL', 'CARD', 'VIRTUAL', 'ONLINE_PAYMENT'];
    for (const ind of onlineIndicators) {
      if (pm.includes(ind)) return 'PAID';
    }

    // If COD, only become PAID when order is delivered/received
    if (pm.includes('COD') || pm.includes('CASH')) {
      return order.status === 'DELIVERED' ? 'PAID' : 'TO_PAY';
    }

    // Fallback: if order already delivered, mark as PAID, else TO_PAY
    return order.status === 'DELIVERED' ? 'PAID' : 'TO_PAY';
  };

  const calculateTotal = (items) => {
    const list = items || [];
    if (!list || list.length === 0) return 0;
    return list.reduce((sum, item) => {
      const qty = item.quantity || item.qty || 0;
      const price = parseFloat(item.price || 0) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const canCancelOrder = (status) => {
    return status === 'PENDING' || status === 'PROCESSING';
  };

  return (
    <>
      <NavBarComponent />
      <div className="customer-orders-container">
        <div className="customer-orders-wrapper">
          {/* Header */}
          <div className="customer-orders-header">
            <div className="customer-orders-header-content">
              <h1 className="customer-orders-title">My Orders</h1>
              <p className="customer-orders-subtitle">Track and manage your purchases</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="customer-stats-grid">
            <div className="customer-stat-card">
              <div className="stat-icon">📊</div>
              <div>
                <h3 className="customer-stat-number">{orders.length}</h3>
                <p className="customer-stat-label">Total Orders</p>
              </div>
            </div>
            <div className="customer-stat-card">
              <div className="stat-icon">🕐</div>
              <div>
                <h3 className="customer-stat-number">
                  {orders.filter(o => o.status === 'PENDING').length}
                </h3>
                <p className="customer-stat-label">Pending</p>
              </div>
            </div>
            <div className="customer-stat-card">
              <div className="stat-icon">🚚</div>
              <div>
                <h3 className="customer-stat-number">
                  {orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPING').length}
                </h3>
                <p className="customer-stat-label">Shipping</p>
              </div>
            </div>
            <div className="customer-stat-card">
              <div className="stat-icon">✅</div>
              <div>
                <h3 className="customer-stat-number">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </h3>
                <p className="customer-stat-label">Delivered</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="customer-filter-tabs">
            <button
              className={`customer-filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Orders
            </button>
            <button
              className={`customer-filter-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </button>
            <button
              className={`customer-filter-tab ${statusFilter === 'PROCESSING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PROCESSING')}
            >
              Processing
            </button>
            <button
              className={`customer-filter-tab ${statusFilter === 'SHIPPING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SHIPPING')}
            >
              Shipping
            </button>
            <button
              className={`customer-filter-tab ${statusFilter === 'DELIVERED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DELIVERED')}
            >
              Delivered
            </button>
          </div>

          {/* Orders Section */}
          <div className="customer-orders-section">
            {loading && <div className="customer-loading-message">Loading your orders...</div>}
            
            {!loading && filteredOrders.length === 0 && (
              <div className="customer-empty-state">
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>
                  {statusFilter !== 'ALL' 
                    ? `You don't have any ${statusFilter.toLowerCase()} orders.` 
                    : "You haven't placed any orders yet."}
                </p>
                <button 
                  onClick={() => navigate('/shop')} 
                  className="btn-shop-now"
                >
                  Start Shopping
                </button>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="customer-orders-list">
                {filteredOrders.map(order => (
                  <div key={order.order_id} className="customer-order-card">
                    <div className="customer-order-header-row">
                      <div className="customer-order-info">
                        <h3 className="customer-order-id">Order #{order.order_id}</h3>
                        <p className="customer-order-date">
                          Placed on {new Date(order.order_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`customer-order-status ${getStatusColor(order.status)}`}>
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </span>
                    </div>

                    <div className="customer-order-details-row">
                      <div className="customer-order-seller">
                        <p className="customer-detail-label">Seller</p>
                        <p className="customer-detail-value">{order.seller?.username || 'N/A'}</p>
                      </div>
                      <div className="customer-order-items-count">
                        <p className="customer-detail-label">Items</p>
                        <p className="customer-detail-value">{(order.items?.length ?? order.orderItems?.length ?? 0)} items</p>
                      </div>
                      <div className="customer-order-billing">
                        <p className="customer-detail-label">Payment</p>
                        <p className="customer-detail-value">{getBillingLabel(order)}</p>
                      </div>
                      <div className="customer-order-total">
                        <p className="customer-detail-label">Total</p>
                        <p className="customer-detail-value customer-total-amount">
                          ₱{calculateTotal(order.items || order.orderItems).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="customer-order-actions-row">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="customer-btn-view-details"
                      >
                        View Details
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.order_id)}
                          className="customer-btn-cancel"
                          disabled={loading}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="customer-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="customer-modal-header">
                <div>
                  <h2>Order Details</h2>
                  <p className="customer-modal-subtitle">Order #{selectedOrder.order_id}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="customer-btn-close">
                  ×
                </button>
              </div>
              
              <div className="customer-modal-body">
                {/* Order Status */}
                <div className="customer-info-section">
                  <h3 className="customer-section-title">Order Status</h3>
                  <div className="status-timeline">
                    <div className={`timeline-step ${['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="timeline-dot"></div>
                      <p className="timeline-label">Pending</p>
                    </div>
                    <div className={`timeline-step ${['PROCESSING', 'SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="timeline-dot"></div>
                      <p className="timeline-label">Processing</p>
                    </div>
                    <div className={`timeline-step ${['SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="timeline-dot"></div>
                      <p className="timeline-label">Shipping</p>
                    </div>
                    <div className={`timeline-step ${selectedOrder.status === 'DELIVERED' ? 'active' : ''}`}>
                      <div className="timeline-dot"></div>
                      <p className="timeline-label">Delivered</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="customer-info-section">
                  <h3 className="customer-section-title">Order Items</h3>
                  <div className="customer-billing-section">
                    <p className="customer-billing-method">Method: {selectedOrder.payment_method || selectedOrder.paymentMethod || 'N/A'}</p>
                    <p className="customer-billing-status">Status: {getBillingLabel(selectedOrder)}</p>
                  </div>
                  <div className="customer-items-list">
                    {(selectedOrder.items || selectedOrder.orderItems || []).map((item, index) => {
                      const imgSrc = item.product?.image_url || item.image_url || item.product_image || item.image || '';
                      const title = item.product?.name || item.product_name || 'Product';
                      const qty = item.quantity || item.qty || 0;
                      const price = (parseFloat(item.price) || 0).toFixed(2);
                      const subtotal = (qty * (parseFloat(item.price) || 0)).toFixed(2);
                      return (
                        <div key={item.order_item_id || index} className="customer-item-row">
                          <div className="customer-item-thumb">
                            {imgSrc ? <img src={imgSrc} alt={title} /> : <div className="no-image-small">No Image</div>}
                          </div>
                          <div className="customer-item-info">
                            <p className="customer-item-name">{title}</p>
                            <p className="customer-item-meta">ID: {item.product_id || item.product?.id || '-'}</p>
                            <p className="customer-item-quantity">Quantity: {qty}</p>
                          </div>
                          <div className="customer-item-pricing">
                            <p className="customer-item-price">₱{price}</p>
                            <p className="customer-item-subtotal">Subtotal: ₱{subtotal}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="customer-order-total-row">
                    <span className="customer-total-label">Total Amount:</span>
                    <span className="customer-total-value">
                      ₱{calculateTotal(selectedOrder.items || selectedOrder.orderItems).toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* Actions: cancel option */}
                {canCancelOrder(selectedOrder.status) && (
                  <div className="customer-info-section">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.order_id)}
                      className="customer-btn-cancel-modal"
                      disabled={loading}
                    >
                      Cancel This Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}