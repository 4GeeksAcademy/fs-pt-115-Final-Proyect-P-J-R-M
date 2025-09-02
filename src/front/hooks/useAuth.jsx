import { createContext, useContext, useEffect, useState } from "react";
const urlApi = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem("token") || null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const signUp = async (newUser) => {
        setLoading(true)

        try {
            const response = await fetch(`${urlApi}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const responseError = await response.json()
                throw new Error(responseError.detail || "Error desconocido")
            }

        } catch (error) {

            setError(Error.message)

        } finally {
            setLoading(false)
        }
    }

    const login = async (user) => {
        setLoading(true)
        console.log(user);

        try {
            const response = await fetch(`${urlApi}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            console.log(response);


            if (!response.ok) {
                const responseError = await response.json()
                throw new Error(responseError.detail || "Error desconocido")
            }

            const data = await response.json();
            setToken(data.token)
            localStorage.setItem("token", data.token)

        } catch (error) {

            setError(Error.message)

        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
    }

    const getUserProfile = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${urlApi}/api/users/profile`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!response.ok) {
                const responseError = await response.json()
                throw new Error(responseError.detail || "Error desconocido")
            }
            
            const data = await response.json();
            setUser(data)

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }

    };

    useEffect(() => {
        if (token) {
            getUserProfile()
        }
    }, [token])

    return (
        <AuthContext.Provider value={{ user, token, loading, error, signUp, login, logout }}>{children}</AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}

