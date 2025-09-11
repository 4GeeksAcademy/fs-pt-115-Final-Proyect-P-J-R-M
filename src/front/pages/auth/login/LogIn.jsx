import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./login.css"

export const LogIn = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const { login, loading, error, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      Swal.fire({
        title: "Inicio exitoso",
        icon: "success",
        draggable: true,
      });
      navigate("/posts");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Usuario o contraseña incorrecta...",
      });
    }
  }, [error]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.email || !userData.password) return;
    await login(userData);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Login</h1>

        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={userData.email}
          onChange={handleChange}
          required
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={userData.password}
          onChange={handleChange}
          required
        />

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Login"}
        </button>
      </form>
    </div>
  );
};