import React, { useState } from "react";
import { loginUser } from "../../services/servicesUser";

export const LogIn = () => {
    const [userData , setUserData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!userData.email || !userData.password) {
            alert("Todos los campos son obligatorios");
            return;
        }
        
        loginUser(userData).then(result => {
            if (result && result.token) {
                alert("Login exitoso");
            } else {
                alert("Email o contraseña incorrectos");
            }
        }).catch(error => {
            alert("Error de conexión");
            console.error(error);
        });
    };
    return (
        <form onSubmit={handleSubmit}>
      <h1>Log In</h1>
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
      <button type="submit">Log In</button>
    </form>
    )
}
