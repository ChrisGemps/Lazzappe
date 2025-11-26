import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logotext,LoginModal } from "../component/components";
import "../css/Dashboard/LandingPage.css";


export default function LazzappeeLandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const handleLogin = () => {
    setOpen(true);
  };

  const handleShopNow = () => {
    navigate("/dashboard");
  };

  

  const handleSignup = () => {
    navigate("/register");
  };

  return (
    <>
      <header className="lz-header">
        <Logotext />
        <nav className="lz-nav">
          <a href="#home" className="lz-nav-link">FEEDBACK</a>
          <a href="#about" className="lz-nav-link">ABOUT US</a>
          <>
            <button className="lz-nav-link" onClick={handleLogin}>LOGIN</button>
            <LoginModal open={open} onClose={() => setOpen(false)} />
          </>
          <a href="#contact" className="lz-nav-link" onClick={handleSignup}>SIGNUP</a>
        </nav>
        <div className="lz-menu-icon">☰</div>
      </header>

      <main className="lz-hero-section">
        <div className="lz-hero-text">
          <h1 className="lz-title">Shop Everything in One Place</h1>
          <h2 className="lz-subtitle">Where Convenience Meets Quality</h2>
          <p className="lz-description">
            Our e-commerce website improves the shopping experience by focusing on important customer needs.
            We provide order status updates, simple returns, transparent pricing, and reviews from verified sellers and buyers—making online shopping easier and more trustworthy.
          </p>
          <button className="lz-shop-btn" onClick={handleShopNow}>SHOP NOW</button>
        </div>

        <div className="lz-hero-graphic">
          {/* Placeholder graphic box - replace with SVG/3D image if needed */}
          <div className="lz-graphic-box">STORE GRAPHIC HERE</div>
        </div>
      </main>

      <footer className="lz-footer">
        <div className="lz-socials">
          <span>📘</span>
          <span>📸</span>
          <span>🐦</span>
        </div>
        <p>© 2025 LAZZAPPEE — All rights reserved.</p>
      </footer>
    </>
  );
}
