import React from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/img/LOGO.png";



export const NavBar = () => {

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
        HAND TO HAND
      </div>
      <div className="navbar-buttons">
        <button className="btn btn-login">Sign in</button>
        <button className="btn btn-register">Register</button>
      </div>
    </nav>
  );
}
