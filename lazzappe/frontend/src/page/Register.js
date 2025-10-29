import React, { useState } from "react";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components"; // adjust import path
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    alert(`Welcome ${form.fullName || "User"}! Your account has been created.`);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ---------- LEFT SIDE: Register Form ---------- */}
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

          <Input
            type="text"
            placeholder="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          <Input
            type="email"
            placeholder="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <Button text="Register" background="#3b6dcf" onClick={handleRegister} />

          {/* ---------- OR Divider ---------- */}
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

          {/* ---------- Social Buttons ---------- */}
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

          {/* ---------- Footer Link ---------- */}
          <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
            {" "}
            <Link
                to="/login"
                style={{
                color: "#2734ebff",
                fontWeight: "verylight",
                textDecoration: "none",
                cursor: "pointer",
                }}>
                Already have an account?
            </Link>
          </p>
        </div>
      </div>

      {/* ---------- RIGHT SIDE: Dynamic Blue Flow Background ---------- */}
      <BrandSide />
    </div>
  );
}
