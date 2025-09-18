import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./signup.css"
import { Link } from "react-router-dom";

export function SignUp() {
  const [passwordError, setPasswordError] = useState(null) // Solo para errores de contraseña local
  const { signUp, error, loading } = useAuth() // Usar estados del hook
  const navigate = useNavigate()
  const [signupSuccess, setSignupSuccess] = useState(false) // Estado para controlar el éxito
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

  useEffect(() => {
    if (signupSuccess && !loading && !error) {
      Swal.fire({
        icon: "success",
        title: "¡Usuario registrado!",
        text: "Tu cuenta se creó correctamente",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
        setSignupSuccess(false); // Reset del estado
      });
    }
  }, [signupSuccess, loading, error, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => {
      const updateData = { ...prev, [name]: value };
      // Validar contraseñas si ambas existen
      if (updateData.password2 && updateData.password !== updateData.password2) {
        setPasswordError("Las contraseñas no coinciden");
      } else {
        setPasswordError(null);
      }
      return updateData;
    });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.username || !userData.dni || !userData.email || !userData.password) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Todos los campos son obligatorios",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    if (userData.password !== userData.password2) {
      Swal.fire({
        icon: "error",
        title: "Error en contraseña",
        text: "Las contraseñas no coinciden",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    // Llamar al signUp del hook
    await signUp({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      dni: userData.dni,
      image: userData.image || "",
      score: userData.score || 0,
      country: userData.country || ""
    });
    // Marcar que se intentó el signup - el useEffect manejará el resultado
    setSignupSuccess(true);
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
          disabled={loading}
          required
        />
        <input
          className="login-input"
          type="text"
          name="dni"
          placeholder="DNI o pasaporte"
          value={userData.dni}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={userData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="login-input"
          type="password"
          name="password2"
          placeholder="Confirmar contraseña"
          value={userData.password2}
          onChange={handleChange}
          disabled={loading}
          required
        />
        {passwordError && <p className="login-error">{passwordError}</p>}
        <button
          className="login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <div style={{ marginTop: "20px" }}>
          <Link to="/login" style={{ color: "#007BFF", textDecoration: "none" }}>
            ¿Ya estás registrado?
          </Link>
        </div>
      </form>
    </div>
  );
}









