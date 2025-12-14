import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";
import LoginPage from "./page/LoginPage";
import Register from "./page/Register";
import LandingPage from "./page/LandingPage";
import TopUpPage from "./page/TopUpPage";
import CartPage from "./component/CartPage";
import ProductsPage from "./page/Products";
import ProfilePage from "./page/ProfilePage";
import SellerDashboardPage from "./page/SellerDashboard";
import ManageOrders from "./page/ManageOrders";
import CustomerOrders from "./page/CustomerOrder";

function App() {
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const token = parsedUser?.token; // your JWT

        if (!token) return; // no token, cannot fetch profile

        fetch('http://localhost:8080/api/auth/profile', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
          })
          .then(data => {
            if (data && data.user_id) {
              const updatedUser = {
                ...parsedUser,
                role: data.role,
                seller_id: data.seller_id || null,
                isSeller: !!data.isSeller,
                isCustomer: !!data.isCustomer
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));

              window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { 
                detail: data.username || parsedUser.username 
              }));
            }
          })
          .catch(err => console.error('Error refreshing user profile:', err));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/topup" element={<TopUpPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/profile" element={<ProfilePage/>}/>
        <Route path="/seller-dashboard" element={<SellerDashboardPage/>}/>
        <Route path="/seller-orders" element={<ManageOrders/>}/>
        <Route path="/customer-orders" element={<CustomerOrders/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
