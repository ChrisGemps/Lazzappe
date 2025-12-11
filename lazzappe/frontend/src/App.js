import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";
import LoginPage from "./page/LoginPage";
import Register from "./page/Register";
import LandingPage from "./page/LandingPage";
import CartPage from "./component/CartPage";
import CheckoutPage from "./page/CheckoutPage";
import ProductsPage from "./page/Products";
import ProfilePage from "./page/ProfilePage";
import SellerDashboardPage from "./page/SellerDashboard";
import ManageOrders from "./page/ManageOrders";
import CustomerOrders from "./page/CustomerOrder";

function App() {
  useEffect(() => {
    // On app mount, refresh the user's current role from the server
    // This ensures that after a page reload, we have the latest role state
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const userId = parsedUser?.user_id || parsedUser?.id || parsedUser?.userId;
        if (!userId) return;

        fetch('http://localhost:8080/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: String(userId) })
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
          })
          .then(data => {
            if (data && data.user_id) {
              // Update localStorage with the current role from server
              const updatedUser = {
                ...parsedUser,
                role: data.role,
                seller_id: data.seller_id || null,
                isSeller: !!data.isSeller,
                isCustomer: !!data.isCustomer
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Notify other components about the role refresh
              try { window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: data.username || parsedUser.username })); } catch (e) {}
            }
          })
          .catch(err => {
            // If profile fetch fails, just use localStorage value
            console.error('Error refreshing user profile:', err);
          });
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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
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
