import '../../css/Dashboard/Dashboard.css';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, Bell, HelpCircle, Search } from 'lucide-react';
import { LogotextLogin, LoginModal } from '../components';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginToast, setLoginToast] = useState({ show: false, message: '' });
  const { clearCart, itemCount } = useCart();
  

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const location = useLocation();

  useEffect(() => {
    // update when route changes (e.g., after login navigation)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      // If login occurred on a full page (LoginPage) the NavBar may not have been mounted
      // yet when the login event was dispatched. Check a flag and show the toast when present.
      try {
        const justLoggedIn = localStorage.getItem('justLoggedIn');
        if (justLoggedIn === 'true') {
          setLoginToast({ show: true, message: `Welcome, ${storedUsername}` });
          setTimeout(() => setLoginToast({ show: false, message: '' }), 3000);
          localStorage.removeItem('justLoggedIn');
        }
      } catch (e) {
        // ignore read errors
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [location]);

  useEffect(() => {
    const handleStorage = () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    };
    window.addEventListener('storage', handleStorage);
    // Listen to explicit username-changed events fired from the LoginModal and other places
    const handleUsernameChanged = (e) => {
      const payload = (e && e.detail) || localStorage.getItem('username');
      const name = payload || localStorage.getItem('username') || '';
      if (name) {
        // show a temporary welcome toast
        setLoginToast({ show: true, message: `Welcome, ${name}` });
        setTimeout(() => setLoginToast({ show: false, message: '' }), 3000);
      }
    };
    window.addEventListener('lazzappe:username-changed', handleUsernameChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lazzappe:username-changed', handleUsernameChanged);
    };
  }, []);

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    // Clear login info
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
    // Clear cart state and persist empty cart in localStorage
    try {
      clearCart();
      // write empty to storage to notify other tabs
      localStorage.setItem('cart', JSON.stringify([]));
    } catch (e) {
      // fallback: remove cart item
      try { localStorage.removeItem('cart'); } catch (ee) {}
    }
    try { window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: null })); } catch (e) {}
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        {/* Welcome toast */}
        {loginToast.show && (
          <div className={`nav-toast ${loginToast.show ? 'show' : ''}`}>{loginToast.message}</div>
        )}
        {/* Top Header */}
        <div className="centerItems">
          <div className="navbar-top">
            <div className="navbar-top-left">
              <a href="#" className="nav-link">Seller Centre</a>
              <a href="#" className="nav-link">Sell on Lazzappee</a>
              <span>Follow us on</span>
            </div>
            <div className="navbar-top-right">
              <Bell size={16} />
              <HelpCircle size={16} />
              {isLoggedIn ? (
                <>
                  <span className="nav-link">Welcome, {username}</span>
                  <button
                    className="nav-link btn-logout"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="nav-link">Sign Up</Link>
                  <Link
                    to="/login"
                    className="nav-link"
                    onClick={(e) => {
                      // open the login modal instead of navigating away
                      e.preventDefault();
                      setLoginOpen(true);
                    }}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="centerItems">
          <div className="navbar-main">
            {/* Logo */}
            <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <LogotextLogin />
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
              <button
                className="cart-icon-button"
                onClick={() => navigate('/cart')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Cart"
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </button>
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
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}