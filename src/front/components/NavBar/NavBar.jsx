import React, { useState } from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/img/FINALLOGO.png";
import { LanguageSelector } from "../language-select/LanguageSelect";
import { useAuth } from "../../hooks/useAuth";
import { ButtonAvatar } from "./ButtonAvatar";
import { UserMenuSidebar } from "./SideBar.jsx";

export const NavBar = () => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);

  const isLogged = token && token !== "undefined" && token !== "null";

  return (

    <>
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
              <ButtonAvatar onClick={() => setOpen(true)} />
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

      {isLogged && (
        <UserMenuSidebar
          open={open}
          onClose={() => setOpen(false)} />
      )}
    </>
  );
};