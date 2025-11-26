import React, { useState } from "react";
import '../css/Components/LoginPage.css';
import { useNavigate } from "react-router-dom";

export function LoginModal({ open, onClose }){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
      username: "",
      password: "",
    }
  );
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      signinClick();
    }
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
      // navigate("/dashboard");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



   if (!open) return null; // hide modal when "open" is false
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className="close-btn" onClick={onClose}>×</button>
        <Input
                type="text"
                placeholder="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}/>
              
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
        
      </div>
    </div>
  );
}



// ---------------- Logo ----------------
export const Logotext = () => (
  <div style={{ textAlign: "center", marginBottom: "0px" }}>
    <img
      src="/Lazzappee_logohd.png"  // Path to your logo PNG file in the public folder
      alt="LAZZAPPEE Logo" // Alt text for accessibility
      style={{
        maxWidth: "100%",   // Ensure the image is responsive
        height: "auto",     // Maintain aspect ratio
      }}
    />
  </div>
);

export const Logotext2 = () => (
  <div style={{ textAlign: "center", marginBottom: "0px" }}>
    <img
      src="/logo.png"
      alt="LAZZAPPEE Logo"
      style={{
        width: "100px",
        height: "auto",
      }}
    />
  </div>
);


// ---------------- Logo for Login/Register ----------------
export const LogotextLogin = () => (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <img
      src="/Lazzappee_logohd2.png"  // Path to your login logo PNG file in the public folder
      alt="LAZZAPPEE Logo" // Alt text for accessibility
      style={{
        maxWidth: "100%",   // Ensure the image is responsive
        height: "auto",     // Maintain aspect ratio
      }}
    />
  </div>
);


// ---------------- Input ----------------
export const Input = ({ type, placeholder, name, value, onChange, onKeyPress }) => (
  <input
    type={type}
    placeholder={placeholder}
    name={name}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    style={{
      width: "100%",
      padding: "12px",
      margin: "8px 0",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px"
    }}
  />
);

// ---------------- Button ----------------
export const Button = ({ text, background = "#2734ebff", onClick, disabled = false }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px",
        background: disabled ? "#9aa6ff" : background,
        color: "white",
        border: "none",
        borderRadius: "4px",
        marginTop: "10px",
        marginBottom: "15px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "bold",
        transform: isClicked ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.1s ease-in-out",
      }}
    >
      {text}
    </button>
  );
};

// ---------------- Social Button ----------------
export const SocialButton = ({ text, icon }) => (
  <button
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px", 
      border: "1px solid #ddd",
      borderRadius: "4px",
      margin: "0 5px",
      background: "#fff",
      cursor: "pointer",
      fontWeight: "500",
    }}
  >
    <img src={icon} alt={text} style={{ width: "18px", marginRight: "8px" }} />
    {text}
  </button>
);

// ---------------- Right Side Brand ----------------
export const BrandSide = () => (
  <div
    style={{
      flex: 2,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(-45deg, #dfefff, #b7d3ff, #e3f1ff, #a5c7ff, #c9ddff, #f0f7ff)",
      backgroundSize: "600% 600%",
      animation: "blueFlow 6s ease infinite",
    }}
  >
    <style>
      {`
        @keyframes blueFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}
    </style>

    <img
      src="/logo.png"
      alt="LAZZAPPEE Logo"
      style={{
        maxWidth: "40%",
        height: "auto",
        filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.25))",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    />
  </div>
);
