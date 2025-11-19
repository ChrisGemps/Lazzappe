import React, { useState } from "react";
import { LogotextLogin, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";
import './LoginPage.css';


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
      const isEmail = form.username.includes('@');
      const payload = isEmail
        ? { email: form.username.trim(), password: form.password }
        : { username: form.username.trim(), password: form.password };

      console.debug('Login request payload:', payload);

      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Try to parse JSON body when possible, but fall back to text
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

      // Derive username to store for UI; prefer returned username, otherwise use input
      const derivedUsername =
        (data && (data.username || data.user?.username || data.data?.username)) ||
        (isEmail ? form.username.trim() : form.username.trim());

      // Save user info and username
      try {
        if (data) localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem('username', derivedUsername || '');
      } catch (e) {
        console.warn('Unable to persist user to localStorage', e);
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
      <LogotextLogin />
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Input
        type="text"
        placeholder="Username"
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

      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">or Sign In with</span>
        <div class="divider-line"></div>
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