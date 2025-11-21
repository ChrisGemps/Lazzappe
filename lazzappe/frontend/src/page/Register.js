import React, { useState } from "react";
import { LogotextLogin, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    shippingAddress: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
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

    return true;
  };

  const handleRegister = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Sending request to backend:", form);

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed.");
      }

      const data = await response.json();

      console.log("Backend response:", data);

      // After registering, redirect user to login page. Do not auto-login.
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
          <LogotextLogin />

          <h2 className="register-title">Create your account</h2>

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
            type="email"
            placeholder="Email Address"
            name="email"
            value={form.email}
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

          <Input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="text"
            placeholder="Shipping Address"
            name="shippingAddress"
            value={form.shippingAddress}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

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