import React, { useState } from "react";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
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
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed. Please try again.");
      }

      const data = await response.json();

      localStorage.setItem("user", JSON.stringify(data));
      try {
        localStorage.setItem('username', data.username || data.user?.username || '');
      } catch (e) {}
      
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      console.log(error);
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

      <div className="divider-container">
        <hr className="divider-line" />
        <span className="divider-text">or Sign In with</span>
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