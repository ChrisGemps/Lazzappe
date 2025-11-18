import React, { useState } from "react";


// ---------------- Logo ----------------
export const Logotext = () => (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <img
      src="/logotext.png"  // Path to your PNG file in the public folder
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
export const Button = ({ text, background = "#f17358", onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200); 
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        marginLeft: "10px",
        width: "100%",
        padding: "10px",
        background: background,
        color: "white",
        border: "none",
        borderRadius: "4px",
        marginTop: "60px",
        marginBottom: "15px",
        cursor: "pointer",
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
