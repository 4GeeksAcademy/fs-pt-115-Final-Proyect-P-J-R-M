import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./signup.css";

export function SignUp() {
  const { signUp, loading, error } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    dni: "",
    email: "",
    password: "",
    password2: "",
    image: "",
    country: "",
    score: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password !== userData.password2) {
      Swal.fire({
        icon: "error",
        title: "Contraseñas no coinciden",
        text: "Por favor, revisa los dos campos.",
      });
      return;
    }

    const ok = await signUp({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      dni: userData.dni,
      image: userData.image || "",
      score: userData.score || 0,
      country: userData.country || "",
    });


    if (ok) {
      Swal.fire({
        icon: "success",
        title: "¡Usuario registrado!",
        text: "Tu cuenta se creó correctamente",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/login");
    } else {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: error
      });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Crear cuenta</h1>

        <input
          className="login-input"
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={userData.username}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="text"
          name="dni"
          placeholder="DNI o pasaporte"
          value={userData.dni}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Email"
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

        <input
          className="login-input"
          type="password"
          name="password2"
          placeholder="Confirmar contraseña"
          value={userData.password2}
          onChange={handleChange}
          required
        />
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
