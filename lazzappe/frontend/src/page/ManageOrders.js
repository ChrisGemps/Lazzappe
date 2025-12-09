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

      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId) })
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
        throw new Error('Failed to verify user role');
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
      setFilteredOrders(orders);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const calculateTotal = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return 0;
    return orderItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
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
                {orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPED').length}
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
              All Orders
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
              className={`filter-tab ${statusFilter === 'SHIPPED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SHIPPED')}
            >
              Shipped
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
                        <p className="detail-value">{order.customer?.username || 'N/A'}</p>
                      </div>
                      <div className="order-items-count">
                        <p className="detail-label">Items</p>
                        <p className="detail-value">{order.orderItems?.length || 0} items</p>
                      </div>
                      <div className="order-total">
                        <p className="detail-label">Total</p>
                        <p className="detail-value total-amount">
                          ₱{calculateTotal(order.orderItems).toFixed(2)}
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
                      <span className="info-value">{selectedOrder.customer?.username || 'N/A'}</span>
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
                  <div className="items-list">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <p className="item-name">{item.product?.name || 'Product'}</p>
                          <p className="item-quantity">Qty: {item.quantity}</p>
                        </div>
                        <p className="item-price">₱{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="order-total-row">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-value">
                      ₱{calculateTotal(selectedOrder.orderItems).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="info-section">
                  <h3 className="section-title">Update Order Status</h3>
                  <div className="status-buttons">
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.order_id, 'PROCESSING')}
                      className="status-btn btn-processing"
                      disabled={loading || selectedOrder.status === 'PROCESSING'}
                    >
                      Mark as Processing
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.order_id, 'SHIPPED')}
                      className="status-btn btn-shipped"
                      disabled={loading || selectedOrder.status === 'SHIPPED'}
                    >
                      Mark as Shipped
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.order_id, 'DELIVERED')}
                      className="status-btn btn-delivered"
                      disabled={loading || selectedOrder.status === 'DELIVERED'}
                    >
                      Mark as Delivered
                    </button>
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