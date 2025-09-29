import { createContext, useContext, useEffect, useState } from "react";
const urlApi = import.meta.env.VITE_BACKEND_URL;
import Swal from "sweetalert2";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
	// Helper
	const safeget = (key) => {
		const getterToken = localStorage.getItem(key) ?? sessionStorage.getItem(key);
		return getterToken && getterToken !== "undefined" && getterToken !== "null" ? getterToken : null
	}

	const [user, setUser] = useState(null)
	const [token, setToken] = useState(safeget("token"))
	const [refreshToken, setRefreshToken] = useState(safeget("refresh_token"))
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)


	const signUp = async (newUser) => {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(`${urlApi}/api/users/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUser),
			});

			if (!response.ok) {
				const responseError = await response.json()
				throw new Error(responseError.detail || "Error desconocido")
			}

		} catch (error) {

			setError(error.message)
			Swal.fire({
				icon: "error",
				title: "Error al registrarse",
				text: "El usuario ya existe",
				confirmButtonText: "Entendido",
				confirmButtonColor: "#d33",
			});

		} finally {
			setLoading(false)
		}
	}

	const login = async (user, { rememberMe = false } = {}) => {
		setLoading(true)
		setError(null)

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
			const access = data.token
			const refresh = data.refresh_token

			if (!access) {
				const responseError = await response.json()
				throw new Error(responseError.detail || "Error desconocido")
			}

			const storeToken = rememberMe ? localStorage : sessionStorage
			const otherToken = rememberMe ? sessionStorage : localStorage

			storeToken.setItem("token", access)

			if (refresh) {
				storeToken.setItem("refresh_token", refresh)
			}

			otherToken.removeItem("token")
			otherToken.removeItem("refresh_token")

			setToken(access)

			if (refresh) {
				setRefreshToken(refresh)
			}

			setUser(data.user || null)
			return true

		} catch (error) {

			setError(error.message)

		} finally {
			setLoading(false)
		}
	}

	const logout = () => {
		setUser(null)
		setToken(null)
		setRefreshToken(null)
		localStorage.removeItem("token")
		localStorage.removeItem("refresh_token")
		sessionStorage.removeItem("token")
		sessionStorage.removeItem("refresh_token")
	}

	const setAccessWhereRefreshIs = (newAccess) => {
		if (localStorage.getItem("refresh_token")) {
			localStorage.setItem("token", newAccess);
		} else if (sessionStorage.getItem("refresh_token")) {
			sessionStorage.setItem("token", newAccess);
		} else {
			localStorage.setItem("token", newAccess);
		}
		setToken(newAccess);
	};

	const refreshAccess = async () => {
		const refresh = refreshToken || safeget("refresh_token")

		if (!refresh) return null

		try {
			const response = await fetch(`${urlApi}/api/users/refresh`, {
				method: "POST",
				headers: { Authorization: `Bearer ${refresh}` }
			})

			if (!response.ok) {
				logout();
				return null
			}

			const data = await response.json();

			if (data.access_token) {
				setAccessWhereRefreshIs(data.access_token)
				return data.access_token
			}
			return null
		} catch {
			return null
		}
	}

	const getUserProfile = async () => {
		setLoading(true);
		try {
			let response = await fetch(`${urlApi}/users/profile`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.status === 401) {
				const newAccess = await refreshAccess();
				if (newAccess) {
					response = await fetch(`${urlApi}/users/profile`, {
						headers: { Authorization: `Bearer ${newAccess}` },
					});
				} else {

					return;
				}
			}

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || data.msg || "Error al traer el Usuario");
			setUser(data);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (token) {
			getUserProfile()
		}
	}, [token])

	return (
		<AuthContext.Provider value={{ user, token, loading, error, signUp, login, logout, refreshUser: getUserProfile }}>{children}</AuthContext.Provider>
	)
}

export const useAuth = () => {
	return useContext(AuthContext)
}

