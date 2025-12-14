import React, { useState } from "react";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";
import '../css/Components/LoginPage.css';


const LoginForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const signinClick = async () => {
    setError("");
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Send username field regardless of whether it's email or username
      const payload = {
        username: form.username.trim(),
        password: form.password
      };

      console.debug('Login request payload:', payload);

      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      let textBody = null;
      try {
        data = await response.json();
      } catch (e) {
        try {
          textBody = await response.text();
        } catch (ee) {
          // ignore
        }
      }

      console.debug('Login response status:', response.status, 'jsonBody:', data, 'textBody:', textBody);

      if (!response.ok) {
        const errMsg = (data && (data.error || data.message)) || textBody || response.statusText || "Login failed";
        throw new Error(errMsg);
      }

      // Save JWT token - CRITICAL FOR AUTHENTICATION
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        console.log('JWT token saved to localStorage');
      } else {
        console.warn('No token received from server');
      }

      // Build user object from response
      const userToStore = {
        user_id: data.user_id || null,
        username: data.username || form.username.trim(),
        email: data.email || null,
        phone_number: data.phone_number || null,
        profilePhoto: data.profilePhoto || null,
        isSeller: data.isSeller === true,
        isCustomer: data.isCustomer === true,
        role: data.role || (data.isSeller ? 'SELLER' : 'CUSTOMER'),
        seller_id: data.seller_id || null
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem('username', userToStore.username);
      localStorage.setItem('justLoggedIn', 'true');

      // Notify other tabs and components about login
      window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: userToStore.username }));

      // After login, switch role to SELLER then back to CUSTOMER to initialize seller profile
      if (userToStore.user_id) {
        try {
          const token = localStorage.getItem('token');
          
          // Switch to SELLER - userId removed, backend gets user from JWT token
          const switchToSellerResponse = await fetch("http://localhost:8080/api/auth/switch-role", {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'SELLER' })
          });
          if (switchToSellerResponse.ok) {
            const switchData = await switchToSellerResponse.json();
            userToStore.role = 'SELLER';
            userToStore.seller_id = switchData.seller_id || null;
            localStorage.setItem("user", JSON.stringify(userToStore));
          }

          // Switch back to CUSTOMER - userId removed, backend gets user from JWT token
          const switchToCustomerResponse = await fetch("http://localhost:8080/api/auth/switch-role", {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'CUSTOMER' })
          });
          if (switchToCustomerResponse.ok) {
            const switchBackData = await switchToCustomerResponse.json();
            userToStore.role = 'CUSTOMER';
            userToStore.seller_id = null;
            localStorage.setItem("user", JSON.stringify(userToStore));
          }
        } catch (e) {
          console.warn('Failed to initialize roles after login:', e);
        }
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      signinClick();
    }
  };

  return (
    <div className="login-form-wrapper">
      <Logotext />
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Input
        type="text"
        placeholder="Username or Email"
        name="username"
        value={form.username}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      
      <Input
        type="password"
        placeholder="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />

      <Button
        text={loading ? "Signing in..." : "Sign in"}
        background="#2734ebff"
        onClick={signinClick}
        disabled={loading}
      />

      <div className="divider-container">
        <div className="divider-line"></div>
        <span className="divider-text">or Sign In with</span>
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

      <p className="signup-prompt">
        Don't have an account?{" "}
        <Link to="/register" className="signup-link">
          Create one
        </Link>
      </p>
    </div>
  );
};

const LoginPage = () => {
  return (
    <div className="login-page-wrapper">
      <div className="login-page-left">
        <LoginForm />
      </div>
      <BrandSide />
    </div>
  );
};

export default LoginPage;