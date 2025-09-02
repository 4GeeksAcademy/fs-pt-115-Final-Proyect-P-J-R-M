import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

export const LogIn = () => {
    const [userData, setUserData] = useState({
        email: "",
        password: ""
    });

    const { login, loading, error, token } = useAuth()

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

        login(userData)
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>

            {error && <p className="text-warning">{error}</p>}
            <p>{token}</p>
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
            <button type="submit">{loading ? "Cargando...." : "Login"}</button>
        </form>
    )
}
