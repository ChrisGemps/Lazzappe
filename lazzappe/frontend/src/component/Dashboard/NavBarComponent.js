import '../../css/Dashboard/Dashboard.css';
import React from 'react';
import { ShoppingCart, Bell, HelpCircle, User, Search } from 'lucide-react';
import { Logotext } from '../components';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <nav className="navbar">
        {/* Top Header */}
        <div className="centerItems">
          <div className="navbar-top">
            <div className="navbar-top-left">
              <a href="#" className="nav-link">Seller Centre</a>
              <a href="#" className="nav-link">Sell on Lazzappe</a>
              <span>Follow us on</span>
            </div>
            <div className="navbar-top-right">
              <Bell size={16} />
              <HelpCircle size={16} />
              <a href="#" className="nav-link">Sign Up</a>
              <a href="#" className="nav-link">Login</a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="centerItems">
          <div className="navbar-main">
            {/* Logo */}
            <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <Logotext />
            </div>

            {/* Search Bar */}
            <div className="navbar-search-container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Up to 43% off on Olay"
                  className="search-input"
                />
                <button className="search-button">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Cart */}
            <div className="navbar-cart">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="navbar-categories">
          <a href="#" className="category-link">Room decor</a>
          <a href="#" className="category-link">Study table</a>
          <a href="#" className="category-link">Seamless panty</a>
          <a href="#" className="category-link">Baking pan</a>
          <a href="#" className="category-link">Diamond painting</a>
          <a href="#" className="category-link">Sexy lingerie</a>
          <a href="#" className="category-link">Samsung case</a>
          <a href="#" className="category-link">Oversized shirt</a>
        </div>
      </nav>
    </>
  );
}