import React from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/img/LOGO.png";



export const NavBar = () => {

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
        Hand to Hand
      </div>
      <div className="navbar-buttons">
        <button className="btn btn-login"> Login </button>
        <button className="btn btn-register"> Sign Up </button>
      </div>
    </nav>
  );
}
