import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const LogIn = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const { login, loading, error, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/posts");
  }, [token, navigate]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.email || !userData.password) return;
    await login(userData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <p className="text-warning">{error}</p>}

      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={userData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={userData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Login"}
      </button>
    </form>
  );
};