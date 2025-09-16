import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect } from "react";
import { uploadImge, patchUser, getUsers } from "../../../services/userApi";
import "./profile.css";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

const countryNames = countries.getNames("en", { select: "official" });
const countryList = Object.entries(countryNames);

export const Profile = () => {
    const { user, loading, error, refreshUser } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [username, setUsername] = useState(user?.username || "");
    const [country, setCountry] = useState(user?.country || "");

    const [usernameExists, setUsernameExists] = useState(false);
    const [password, setPassword] = useState("");


    const usernameChanged = username !== user?.username;

    const handleImageUpload = async () => {
        if (!file || !file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida.");
            return;
        }
        setUploading(true);
        try {
            await uploadImge(file);
            await refreshUser();
            setFile(null);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (usernameChanged && !password) {
            alert("Debes ingresar tu contraseña para cambiar el nombre de usuario.");
            return;
        }

        if (usernameExists) {
            alert("El nombre de usuario ya existe.");
            return;
        }

        setSaving(true);
        try {
            await patchUser({
                username,
                country,
                password: usernameChanged ? password : undefined,
            });
            await refreshUser();
            setPassword("");
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setSaving(false);
        }
    };

    const checkUsernameExists = async (newUsername) => {
        if (!newUsername || newUsername === user.username) {
            setUsernameExists(false);
            return;
        }

        try {
            const users = await getUsers();
            const exists = users.some(
                (use) => use.username.toLowerCase() === newUsername.toLowerCase()
            );
            setUsernameExists(exists);
        } catch (error) {
            console.error("Error al verificar si el usuario existe:", error);
            setUsernameExists(false);
        }
    };

    useEffect(() => {
        if (usernameChanged) {
            checkUsernameExists(username);
        }
    }, [username]);

    if (loading || !user) {
        return (
            <div className="profile-container">
                <div className="loader-auth">Cargando ....</div>
            </div>
        );
    }

    return (
        <main className="profile-container" style={{ minHeight: "100vh" }}>
            <section className="profile-box">
                {/*Columna izquierda */}
                <div className="profile-left">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    {uploading ? (
                        <div className="loader-image">Subiendo imagen...</div>
                    ) : user.image ? (
                        <img src={user.image} alt="User profile" />
                    ) : (
                        <div
                            style={{
                                fontSize: "100px",
                                textAlign: "center",
                                marginBottom: "1rem",
                            }}
                        >
                            🤖
                        </div>
                    )}

                    <button
                        onClick={handleImageUpload}
                        disabled={uploading}
                        className="btn"
                    >
                        {uploading ? "Guardando..." : "Guardar img"}
                    </button>
                </div>

                {/* Columna derecha */}
                <div className="profile-right">
                    <div>
                        <strong>Username:</strong>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={user.username}
                            style={{ borderColor: usernameExists ? "red" : undefined }}
                        />
                        {usernameExists && (
                            <p style={{ color: "red" }}>
                                Ese nombre de usuario ya existe.
                            </p>
                        )}
                    </div>

                    {usernameChanged && !usernameExists && (
                        <div>
                            <strong>Confirmar contraseña:</strong>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Escribe tu contraseña"
                            />
                        </div>
                    )}

                    <div>
                        <strong>Email:</strong> {user.email}
                    </div>

                    <div>
                        <strong>Country:</strong>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            <option value="">Select a country</option>
                            {countryList.map(([code, name]) => (
                                <option key={code} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <strong>⭐:</strong> {user.score}
                    </div>

                    <div>
                        <button
                            onClick={handleSave}
                            disabled={saving || (usernameChanged && usernameExists)}
                            className="btn"
                        >
                            {saving ? "Guardando..." : (
                                <i className="fa-solid fa-floppy-disk"></i>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};
