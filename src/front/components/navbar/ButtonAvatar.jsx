import React, { forwardRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./button-avatar.css";

export const ButtonAvatar = forwardRef(function ButtonAvatar(
  { onClick, open = false, controlsId = "user-menu" },
  ref
) {
  const { user } = useAuth();
  const initial = (user?.username?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <button
      type="button"
      className="btn-avatar"
      onClick={onClick}
      ref={ref}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={controlsId}
      title={user?.username || "Usuario"}
    >
      {user?.image ? (
        <img src={user.image} className="btn-avatar__img" alt="Avatar" />
      ) : (
        <span className="btn-avatar__fallback" aria-hidden="true">
          {initial}
        </span>
      )}
    </button>
  );
});
