import React from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/img/DEFINILOGO.png";



export const NavBar = () => {

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/" className="logo-link">
          <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
          Hand to Hand
        </Link>
      </div>
      <div className="navbar-buttons">
        <button className="btn btn-login"> Login </button>
        <button className="btn btn-signup"> Sign Up </button>
      </div>
    </nav>
  );
}
