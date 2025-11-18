import React, { useState } from "react";
import axios from "axios";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";

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
    setError(""); // Clear error when user types
  };

  const signinClick = async () => {
    // Validate inputs
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username: form.username,
        password: form.password,
      });

      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed. Please try again.";
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
    <div style={{ width: "100%", maxWidth: "300px", textAlign: "center" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Brown+Sugar&display=swap"
        rel="stylesheet"
      ></link>

      <Logotext />

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c33",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
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

      <div style={{ margin: "10px 0", textAlign: "center", color: "#2d2d2dff" }}>
        <hr style={{ border: "0.5px solid #ffffffff" }} />
        <span
          style={{
            position: "relative",
            padding: "0 10px",
            background: "transparent",
          }}
        >
          or Sign In with
        </span>
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

      <p style={{ marginTop: "25px", color: "#2d2d2dff" }}>
        Don't have an account?{" "}
        <Link
          to="/register"
          style={{
            color: "#2734ebff",
            fontWeight: "verylight",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
};

const LoginPage = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#ffecec",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #cce7ff, #f9f9f9)",
        }}
      >
        <LoginForm />
      </div>
      <BrandSide />
    </div>
  );
};

export default LoginPage;