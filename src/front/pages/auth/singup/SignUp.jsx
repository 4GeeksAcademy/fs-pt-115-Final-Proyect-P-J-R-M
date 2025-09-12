import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./signup.css"
export function SignUp() {
  const [error, setError] = useState(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    username: "",
    dni: "",
    email: "",
    password: "",
    image: "",
    country: "",
    score: 0,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    const updateData = prev => ({ ...prev, [name]: value })
    setUserData(updateData);
    if (updateData.password2 &&
      updateData.password !==
      updateData.password2) {
      setError("Contraseña no coincide")
      return
    } else {
      setError(null);
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!userData.username || !userData.dni || !userData.email || !userData.password) {
      alert("Todos los campos son requeridos");
      return;
    }

    signUp({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      dni: userData.dni,
      image: userData.image || "",
      score: userData.score || 0,
      country: userData.country || ""
    });

    Swal.fire({
      icon: "success",
      title: "¡Usuario registrado!",
      text: "Tu cuenta se creó correctamente",
      timer: 2000,
      showConfirmButton: false,
    });

    navigate("/login")

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
          value={userData.password2 || ""}
          onChange={handleChange}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button className="login-button" type="submit">
          Crear cuenta
        </button>
      </form>
    </div>
  );
}