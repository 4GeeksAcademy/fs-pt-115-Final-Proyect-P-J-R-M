import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import "./login.css"
import "../../../index.css";

export const LogIn = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [rememberMe, setRememeberMe] = useState(false)

  const { login, loading, error, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      Swal.fire({ title: "Inicio exitoso", icon: "success" });
      navigate("/posts");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!userData.email || !userData.password) return;
    const ok = await login({ email: userData.email, password: userData.password }, { rememberMe });

    if (!ok) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: `
      <p>Usuario o contraseña incorrecta...</p>`,
      });
    }
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
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememeberMe(e.target.checked)}
          />
          {" "} Recuedarme
        </label>

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Login"}
        </button>
        <div className="reset-link">
          <Link to="/signup" className="login-link">
            ¿Aún no estás registrado?
          </Link>

          <Link to="/request-reset" className="login-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
};