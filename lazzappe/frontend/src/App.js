import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import Dashboard from "./page/Dashboard";
import Register from "./page/Register";
import LandingPage from "./page/LandingPage";
import CartPage from "./component/CartPage";
import ProductsPage from "./page/Products";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
