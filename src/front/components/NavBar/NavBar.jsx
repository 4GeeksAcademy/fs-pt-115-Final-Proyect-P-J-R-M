import React from "react";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import logoUrl from "../../assets/img/FINALLOGO.png";
import { LanguageSelector } from "../language-select/LanguageSelect.jsx";
import { useAuth } from "../../hooks/useAuth";

export const NavBar = () => {
  const { token } = useAuth() || {};
  const navigate = useNavigate();

  const isLogged = Boolean(localStorage.getItem("token") || token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); 
  };

  return (
    <nav className="navbar" aria-label="Principal">
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
          <span className="logo-text">Hand to Hand</span>
        </Link>
      </div>

      <div className="navbar-buttons">
        {isLogged ? (
          <>
            <Link to="/profile" className="btn btn-signup">Profile</Link>
            <button onClick={handleLogout} className="btn btn-login">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-login">Login</Link>
            <Link to="/signup" className="btn btn-signup">Sign Up</Link>
          </>
        )}
        <LanguageSelector />
      </div>
    </nav>
  );
};