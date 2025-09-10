import { useAuth } from "../../../hooks/useAuth"
import { useState } from "react";
import { uploadImge } from "../../../services/userApi"
import "./profile.css"
export const Profile = () => {

    const { user, loading, error, refreshUser } = useAuth()
    console.log(user);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    console.log("Loading:", loading);
    console.log("User:", user);
    console.log("Error:", error);

    const handleClick = async () => {
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

    if (loading || !user) {
        return (
            <div className="loader-auth text-center py-5">
                <p>Cargando mamahuevo....</p>
            </div>
        );
    }

    return (
        <main className="container-fluid bg-main min-vh-100 py-5">
            <section className="row justify-content-start">
                <div className="col-12 col-md-12 col-lg-4 p-4 bg-light rounded shadow">

                    <div className="mb-4 text-center">
                        <h1>{user.username}</h1>
                    </div>
                    <div className="mb-3">
                        <input
                            type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                        <button onClick={handleClick} disabled={uploading} className="btn btn-upload" >

                            {uploading ? "Guardando..." : "Guardar"}
                        </button>
                        {uploading ? (
                            <div className="loader-image"></div>  
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
                    </div>

                    <div className="text-secondary mb-1"><strong>Email:</strong> {user.email}</div>
                    <div className="text-secondary mb-1"><strong>País:</strong> {user.country}</div>
                    <div className="text-secondary mb-1"><strong>⭐:</strong> {user.score}</div>
                </div>
            </section>
        </main>
    );
};