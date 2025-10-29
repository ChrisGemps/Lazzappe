import React from "react";
import { Logotext, Input, Button, SocialButton, BrandSide } from "../component/components";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate(); // hook inside component

  const signinClick = () => {
    navigate("/dashboard");
  };

  return (
    <div style={{ width: "100%", maxWidth: "300px", textAlign: "center" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Brown+Sugar&display=swap"
        rel="stylesheet"
      ></link>

      <Logotext />

      <Input type="email" placeholder="user@email.com" />
      <Input type="password" placeholder="Password" />

      <Button text="Sign in" background="#2734ebff" onClick={signinClick} />

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

      {/* 🔗 Register Link */}
      <p style={{ marginTop: "25px", color: "#2d2d2dff" }}>
        Don’t have an account?{" "}
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
