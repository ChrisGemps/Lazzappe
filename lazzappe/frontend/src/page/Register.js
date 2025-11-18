import React, { useState } from "react";
import axios from "axios";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

 const handleRegister = async () => {
  setError("");

  if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
    setError("Please fill in all fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    setError("Please enter a valid email address");
    return;
  }

  if (form.password.length < 6) {
    setError("Password must be at least 6 characters long");
    return;
  }

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match!");
    return;
  }

  try {
    console.log("Sending request to backend:", form); // Debug log

    const response = await axios.post("http://localhost:8080/api/auth/register", {
      username: form.username,
      email: form.email,
      password: form.password,
    });

    console.log("Backend response:", response.data); // Debug log

    // Persist user info so dashboard can show the username immediately
    try {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('username', response.data.username || form.username);
    } catch (e) {
      // ignore
    }

    alert("Registration Successful! You are now logged in.");
    navigate("/dashboard");
  } catch (error) {
    console.error("Axios full error:", error); // Debug log
    console.error("Axios response:", error.response); // Debug log

    const errorMessage = error.response?.data?.error || error.message || "Registration failed.";
    setError(errorMessage);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          flex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 60px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <Logotext />

          <h2
            style={{
              textAlign: "center",
              color: "#3b6dcf",
              marginBottom: "25px",
              fontWeight: "600",
            }}
          >
            Create your account
          </h2>

          {error && (
            <div
              style={{
                backgroundColor: "#fee",
                color: "#c33",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "15px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
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

          <Button text="Register" background="#3b6dcf" onClick={handleRegister} />

          {/* OR Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#ccc" }}></div>
            <span style={{ margin: "0 10px", color: "#888" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#ccc" }}></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SocialButton
              text="Google"
              icon="https://cdn-teams-slug.flaticon.com/google.jpg"
            />
            <SocialButton
              text="Facebook"
              icon="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png"
            />
          </div>

          <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
            <Link
              to="/login"
              style={{
                color: "#2734ebff",
                fontWeight: "verylight",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Already have an account? Login
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <BrandSide />
    </div>
  );
}