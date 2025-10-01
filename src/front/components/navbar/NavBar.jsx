import React, { useRef, useState } from "react";
import "./navbar.css";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import logoUrl from "../../assets/img/FINALLOGO.png";
import { ButtonAvatar } from "./ButtonAvatar";
import { UserMenuSidebar } from "./SideBar";
import ThemeToggle from "../theme/ThemeToggle";

export const NavBar = () => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const avatarRef = useRef(null);
  const location = useLocation();

  const isLogged = token && token !== "undefined" && token !== "null";
  const isChatPage = location.pathname.startsWith("/chats");

  return (
    <>
      <nav aria-label="Principal">
        <div
          className={`nav-container ${isChatPage ? "chat-layout" : ""}`}
        >
          <Link to="/" className="logo" aria-label="Ir al inicio">
            <img src={logoUrl} alt="Hand To Hand Logo" className="logo-img" />
            <span className="logo-text">Hand to Hand</span>
          </Link>

          <div className="navbar-actions">
            {isLogged ? (
              <ButtonAvatar
                ref={avatarRef}
                onClick={() => setOpen(true)}
                open={open}
              />
            ) : (
              <>
                <Link to="/login" className="link-login">
                  Login
                </Link>
                <Link to="/signup" className="btn cta-nav">
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {isLogged && (
        <UserMenuSidebar
          open={open}
          onClose={() => setOpen(false)}
          restoreFocusTo={avatarRef}
        />
      )}
    </>
  );
};
