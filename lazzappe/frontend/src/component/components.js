import React, { useState } from "react";


// ---------------- Logo ----------------
export const Logotext = () => (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <img
      src="/logotext.png"  // Path to your PNG file in the public folder
      alt="LAZZAPPEE Logo" // Alt text for accessibility
      style={{
        maxWidth: "100%",   // Ensure the image is responsive
        height: "60px",     // Maintain aspect ratio
      }}
    />
  </div>
);


// ---------------- Input ----------------
export const Input = ({ type, placeholder }) => (
  <input
    type={type}
    placeholder={placeholder}
    style={{
      display: "block",
      width: "100%",
      padding: "10px",
      marginBottom: "12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
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
      background: "linear-gradient(to bottom, #ffffff, #e6f0ff)",
    }}
  >
    <h1
      style={{
        fontSize: "5rem",
        fontFamily: "serif",
        fontWeight: "lighter",
      }}
    >
      brand side dri dapita wahahah
    </h1>
  </div>
);
