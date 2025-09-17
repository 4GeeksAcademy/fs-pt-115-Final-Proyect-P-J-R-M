import React from "react";
import "./avatar.css";

export default function Avatar({ seed, size = 34, title }) {
  const initials = String(seed ?? "Usuario").slice(0, 2).toUpperCase();
  return (
    <div
      className="chat-avatar"
      title={title || seed}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size / 3.2)) }}
      aria-label={title || seed}
    >
      {initials}
    </div>
  );
}
