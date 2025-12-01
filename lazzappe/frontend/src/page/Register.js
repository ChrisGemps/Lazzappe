import React, { useState } from "react";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    shippingAddress: "",
    billingAddress: "",
    registerAsSeller: false,
    storeName: "",
    storeDescription: "",
    businessLicense: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "checkbox" ? checked : value 
    });
    setError("");
  };

  const validateForm = () => {
    // Required fields for all users
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword || !form.shippingAddress.trim()) {
      setError("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }

    // Validate seller fields if registering as seller
    if (form.registerAsSeller) {
      if (!form.storeName.trim() || !form.storeDescription.trim()) {
        setError("Please fill in all seller information fields");
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const registrationData = {
        username: form.username,
        email: form.email,
        password: form.password,
        phone_number: form.phoneNumber || null,
        shipping_address: form.shippingAddress,
        billing_address: form.billingAddress || form.shippingAddress,
        register_as_seller: form.registerAsSeller,
      };

      // Add seller info if registering as seller
      if (form.registerAsSeller) {
        registrationData.store_name = form.storeName;
        registrationData.store_description = form.storeDescription;
        registrationData.business_license = form.businessLicense || null;
      }

      console.log("Sending request to backend:", registrationData);

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed.");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      alert("Registration Successful! Please sign in with your new account.");
      navigate("/login");
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage = error.message || "Registration failed.";
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-page-left">
        <div className="register-form-container">
          <Logotext />

          <h2 className="register-title">Create your account</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <Input
            type="text"
            placeholder="Username *"
            name="username"
            value={form.username}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="email"
            placeholder="Email Address *"
            name="email"
            value={form.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="password"
            placeholder="Password *"
            name="password"
            value={form.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="password"
            placeholder="Confirm Password *"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="tel"
            placeholder="Phone Number (Optional)"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="text"
            placeholder="Shipping Address *"
            name="shippingAddress"
            value={form.shippingAddress}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="text"
            placeholder="Billing Address (Optional - defaults to shipping)"
            name="billingAddress"
            value={form.billingAddress}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <div className="seller-checkbox-container" style={{ marginTop: '15px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="registerAsSeller"
                checked={form.registerAsSeller}
                onChange={handleChange}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <span>Register as a Seller</span>
            </label>
          </div>

          {form.registerAsSeller && (
            <div className="seller-fields" style={{ 
              border: '1px solid #e0e0e0', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>Seller Information</h3>
              
              <Input
                type="text"
                placeholder="Store Name *"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />

              <textarea
                placeholder="Store Description *"
                name="storeDescription"
                value={form.storeDescription}
                onChange={handleChange}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
              />

              <Input
                type="text"
                placeholder="Business License (Optional)"
                name="businessLicense"
                value={form.businessLicense}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
            </div>
          )}

          <Button text="Register" onClick={handleRegister} />

          <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-buttons-container">
            <SocialButton
              text="Google"
              icon="https://cdn-teams-slug.flaticon.com/google.jpg"
            />
            <SocialButton
              text="Facebook"
              icon="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png"
            />
          </div>

          <p className="login-prompt">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
               Login
            </Link>
          </p>
        </div>
      </div>

      <BrandSide />
    </div>
  );
}