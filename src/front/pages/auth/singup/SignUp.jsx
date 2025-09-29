import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./signup.css"
import { Link } from "react-router-dom";
import "../../../index.css";

export function SignUp() {
  const [passwordError, setPasswordError] = useState(null)
  const { signUp, error, loading } = useAuth()
  const navigate = useNavigate()
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [userData, setUserData] = useState({
    username: "",
    dni: "",
    email: "",
    password: "",
    password2: "",
    image: "",
    country: "",
    score: 0,
    acceptTerms: false
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
        setSignupSuccess(false);
      });
    }
  }, [signupSuccess, loading, error, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => {
      const updateData = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Validación de contraseñas
      if (updateData.password2 && updateData.password !== updateData.password2) {
        setPasswordError("Las contraseñas no coinciden");
      } else {
        setPasswordError(null);
      }
      return updateData;
    });
  };
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
    
    setSignupSuccess(true);
  };
  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1 className="signup-title">Crear cuenta</h1>
        <input
          className="signup-input"
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={userData.username}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="signup-input"
          type="text"
          name="dni"
          placeholder="DNI o pasaporte"
          value={userData.dni}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="signup-input"
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="signup-input"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={userData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          className="signup-input"
          type="password"
          name="password2"
          placeholder="Confirmar contraseña"
          value={userData.password2}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <label>
          <input
            type="checkbox"
            name="acceptTerms"
            checked={userData.acceptTerms}
            onChange={handleChange}
            disabled={loading}
            required
          />
          {" "}Acepto condiciones y términos
        </label>
        {passwordError && <p className="signup-error">{passwordError}</p>}
        <button
          className="signup-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <div className="reset-link" style={{ marginTop: "20px" }}>
          <Link to="/login" className="signup-link">
            ¿Ya estás registrado?
          </Link>
        </div>
      </form>
    </div>
  );
}



