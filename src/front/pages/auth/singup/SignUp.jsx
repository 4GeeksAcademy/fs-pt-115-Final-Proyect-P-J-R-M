import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
       updateData.password2){
        setError("Contraseña no coincide")
        return
      }else {
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

    navigate("/login")

  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>

      <input
        type="text"
        name="username"
        placeholder="Nombre de usuario"
        value={userData.username}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="dni"
        placeholder="DNI o pasaporte"
        value={userData.dni}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
        required
      />
      {
        <>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={userData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirmar Contraseña"
            
            onChange={handleChange}
            required
          />
        </>
      }
      <button type="submit">Crear cuenta</button>
    </form>
  );
}