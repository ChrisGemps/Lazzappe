import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/ManageOrders.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

export default function ManageOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    checkSellerAccess();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const checkSellerAccess = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please log in to access Manage Orders');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'GET', // GET is standard for fetching data
        headers,
        credentials: 'include', // include cookies for session-based auth
      });


      if (response.ok) {
        const profileData = await response.json();
        setUserRole(profileData.role);

        if (profileData.role !== 'SELLER' && profileData.role !== 'BOTH') {
          alert('Access denied. You need a Seller account to access this page.');
          navigate('/profile');
          return;
        }

        fetchOrders(userId);
      } else {
        // try to show server-provided message
        let msg = 'Failed to verify user role';
        try {
          const err = await response.json();
          if (err && (err.error || err.message)) msg = err.error || err.message;
        } catch (e) {}
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Error checking seller access:', error);
      alert('Failed to verify seller access. Please try again.');
      navigate('/dashboard');
    }
  };

  const fetchOrders = async (sellerId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/seller/${sellerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'ALL') {
      // Show only active orders (exclude delivered)
      setFilteredOrders(orders.filter(order => order.status !== 'DELIVERED'));
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Order status updated successfully!');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const userId = user.id || user.user_id;
        // If marking delivered and payment was via LAZZAPPEEPAY, credit seller's LazzappeeCoins
        if (newStatus === 'DELIVERED') {
          try {
            // find the order object (may be in selectedOrder or orders list)
            const order = orders.find(o => o.order_id === orderId) || selectedOrder;
            const pm = (order?.payment_method || order?.paymentMethod || '').toString().toUpperCase();
            if (pm.includes('LAZZAPPEEPAY') || pm.includes('LAZZAPPEE')) {
              const sellerAmount = parseFloat(calculateTotal(order.items || order.orderItems)) || 0;
              const uStr = localStorage.getItem('user');
              const uObj = uStr ? JSON.parse(uStr) : null;
              const uid = uObj?.user_id || uObj?.id || uObj?.userId;
              const key = uid ? `lazzappee_wallet_${uid}` : 'lazzappee_wallet';
              const prev = parseFloat(localStorage.getItem(key) || '0');
              const newBalance = Math.max(0, prev + sellerAmount);
              localStorage.setItem(key, newBalance.toFixed(2));
              try { window.dispatchEvent(new CustomEvent('lazzappe:wallet-updated', { detail: { balance: newBalance, userId: uid } })); } catch (e) {}
              alert(`LazzappeeCoins credited: ₱${sellerAmount.toFixed(2)} (New balance: ₱${newBalance.toFixed(2)})`);
            }
          } catch (err) {
            console.warn('Failed to credit seller wallet:', err);
          }
        }
        fetchOrders(userId);
        setShowModal(false);
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Order accepted successfully!');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const userId = user.id || user.user_id;
        fetchOrders(userId);
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
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
          const errorData = await response.json();
          alert(errorData.error || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      } finally {
        setLoading(false);
      }
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

  const getBillingLabel = (order) => {
    if (!order) return 'TO_PAY';
    const billing = order.billing_status || order.billingStatus;
    if (billing) return billing === 'PAID' ? 'PAID' : 'TO_PAY';

    const pm = (order.payment_method || order.paymentMethod || order.payment || '').toString().toUpperCase();
    const onlineIndicators = ['ONLINE', 'GCASH', 'PAYPAL', 'CARD', 'VIRTUAL', 'ONLINE_PAYMENT'];
    for (const ind of onlineIndicators) {
      if (pm.includes(ind)) return 'PAID';
    }

    if (pm.includes('COD') || pm.includes('CASH')) {
      return order.status === 'DELIVERED' ? 'PAID' : 'TO_PAY';
    }

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

  const getPaidAmount = (order) => {
    if (!order) return '0.00';
    // prefer server-provided paid/total fields
    const paidRaw = order.total_amount || order.totalAmount || order.total || order.paid_amount || order.paidAmount;
    if (paidRaw !== undefined && paidRaw !== null && paidRaw !== '') {
      const num = parseFloat(paidRaw) || 0;
      return num.toFixed(2);
    }

    // fallback: compute from items minus any lazzappee coins used
    const original = calculateTotal(order.items || order.orderItems);
    const lazz = parseFloat(order.lazzappeeCoinsUsed || order.lazzappee_coins_used || order.lazzappee_coins || order.lazzappeeCoins || 0) || 0;
    const computed = Math.max(0, original - lazz);
    return computed.toFixed(2);
  };

  return (
    <>
      <NavBarComponent />
      <div className="orders-container">
        <div className="orders-wrapper">
          {/* Header */}
          <div className="orders-header">
            <div className="orders-header-content">
              <h1 className="orders-title">Manage Orders</h1>
              <p className="orders-subtitle">Track and manage customer orders • Role: {userRole}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-number">{orders.length}</h3>
              <p className="stat-label">Total Orders</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">
                {orders.filter(o => o.status === 'PENDING').length}
              </h3>
              <p className="stat-label">Pending</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">
                {orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPING').length}
              </h3>
              <p className="stat-label">In Progress</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Active Orders
            </button>
            
            <button
              className={`filter-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${statusFilter === 'PROCESSING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PROCESSING')}
            >
              Processing
            </button>
            <button
              className={`filter-tab ${statusFilter === 'SHIPPING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SHIPPING')}
            >
              Shipping
            </button>
            <button
              className={`filter-tab ${statusFilter === 'DELIVERED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DELIVERED')}
            >
              Delivered
            </button>
          </div>

          {/* Orders Table */}
          <div className="orders-section">
            {loading && <div className="loading-message">Loading...</div>}
            
            {!loading && filteredOrders.length === 0 && (
              <div className="empty-state">
                <p>No orders found{statusFilter !== 'ALL' ? ` with status: ${statusFilter}` : ''}.</p>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="orders-list">
                {filteredOrders.map(order => (
                  <div key={order.order_id} className="order-card">
                    <div className="order-header-row">
                      <div className="order-info">
                        <h3 className="order-id">Order #{order.order_id}</h3>
                        <p className="order-date">
                          {new Date(order.order_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-details-row">
                      <div className="order-customer">
                        <p className="detail-label">Customer</p>
                        <p className="detail-value">{order.customer?.username || order.customer_name || 'N/A'}</p>
                      </div>
                      <div className="order-items-count">
                        <p className="detail-label">Items</p>
                        <p className="detail-value">{(order.items?.length ?? order.orderItems?.length ?? 0)} items</p>
                      </div>
                      <div className="order-billing">
                        <p className="detail-label">Payment</p>
                        <p className="detail-value">{getBillingLabel(order)}</p>
                      </div>
                      <div className="order-total">
                        <p className="detail-label">Total</p>
                        <p className="detail-value total-amount">
                          ₱{calculateTotal(order.items || order.orderItems).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="order-actions-row">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="btn-view-details"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Order Details</h2>
                  <p className="modal-subtitle">Order #{selectedOrder.order_id}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="btn-close">
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {/* Customer Info */}
                <div className="info-section">
                  <h3 className="section-title">Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedOrder.customer?.username || selectedOrder.customer_name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedOrder.customer?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Shipping Address:</span>
                      <span className="info-value">{selectedOrder.shipping_address || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Order Date:</span>
                      <span className="info-value">
                        {new Date(selectedOrder.order_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="info-section">
                  <h3 className="section-title">Order Items</h3>
                  <div className="payment-info">
                    <p className="payment-method">Method: {selectedOrder.payment_method || selectedOrder.paymentMethod || 'N/A'}</p>
                    <p className="payment-status">Billing: {getBillingLabel(selectedOrder)}</p>
                    <p className="payment-paid">Paid: ₱{getPaidAmount(selectedOrder)}</p>
                    {(selectedOrder.lazzappeeCoinsUsed || selectedOrder.lazzappee_coins_used || selectedOrder.lazzappee_coins) && (
                      <p className="payment-lazzappee">LazzappeeCoins used: ₱{(parseFloat(selectedOrder.lazzappeeCoinsUsed || selectedOrder.lazzappee_coins_used || selectedOrder.lazzappee_coins) || 0).toFixed(2)}</p>
                    )}
                  </div>
                  <div className="items-list">
                    {(selectedOrder.items || selectedOrder.orderItems || []).map((item, index) => {
                      const imgSrc = item.product?.image_url || item.image_url || item.product_image || item.image || '';
                      const title = item.product?.name || item.product_name || 'Product';
                      const qty = item.quantity || item.qty || 0;
                      const price = (parseFloat(item.price) || 0).toFixed(2);
                      return (
                        <div key={item.order_item_id || index} className="item-row">
                          <div className="item-thumb">
                            {imgSrc ? (
                              <img src={imgSrc} alt={title} />
                            ) : (
                              <div className="no-image-small">No Image</div>
                            )}
                          </div>
                          <div className="item-info">
                            <p className="item-name">{title}</p>
                            <p className="item-quantity">Qty: {qty}</p>
                          </div>
                          <p className="item-price">₱{price}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="order-total-row">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-value">
                      ₱{calculateTotal(selectedOrder.items || selectedOrder.orderItems).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="info-section">
                  <h3 className="section-title">Order Actions</h3>
                  <div className="status-buttons">
                    {selectedOrder.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(selectedOrder.order_id)}
                          className="status-btn btn-accept"
                          disabled={loading}
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.order_id)}
                          className="status-btn btn-cancel"
                          disabled={loading}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'PROCESSING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.order_id, 'SHIPPING')}
                          className="status-btn btn-shipping"
                          disabled={loading}
                        >
                          Mark as Shipping
                        </button>
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.order_id)}
                          className="status-btn btn-cancel"
                          disabled={loading}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'SHIPPING' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.order_id, 'DELIVERED')}
                        className="status-btn btn-delivered"
                        disabled={loading}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {selectedOrder.status === 'DELIVERED' && (
                      <div className="status-completed">
                        <p>Order has been delivered</p>
                      </div>
                    )}
                    {selectedOrder.status === 'CANCELLED' && (
                      <div className="status-cancelled-msg">
                        <p>Order has been cancelled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}