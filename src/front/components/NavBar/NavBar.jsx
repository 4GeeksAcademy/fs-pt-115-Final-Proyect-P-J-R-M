import React from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/img/FINALLOGO.png";
import { LanguageSelector} from "../language-select/LanguageSelect.jsx";

export const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
          <span className="logo-text">Hand to Hand</span>
        </Link>
      </div>
      <div className="navbar-buttons">
        <button className="btn btn-login">Login</button>
        <Link to="/signup" className="btn btn-signup">Sign Up</Link>
        <LanguageSelector />
      </div>
    </nav>
  );
};
