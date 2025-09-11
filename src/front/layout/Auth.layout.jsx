import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export const AuthLayout = () => {
    const navigate = useNavigate()
    const { token } = useAuth()

    useEffect(() => {
        if (!token) {
            navigate("/login")
        }
    }, [token, navigate]);

    return (
        <Outlet />
    )
}