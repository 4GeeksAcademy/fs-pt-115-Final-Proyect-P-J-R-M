import { useAuth } from "../../../hooks/useAuth"
import { useState } from "react";
import { uploadImge }from "../../../services/userApi"

export const Profile = () => {

    const { user, loading, error } = useAuth()
    console.log(user);
    
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    console.log(file);

    const handelClick = async () => {
        if (!file) return;
        setUploading(true); // mostrar loader de imagen

        try {
            await uploadImge(file) // subir imagen
            await  refreshUser()//  actualiza el perfil del usuario
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
        <div className="col-12 col-md-6 col-lg-4 p-4 bg-light rounded shadow">

          <div className="mb-4 text-center">
            {user.image ? (
              <img
                src={user.image}
                alt="Foto de perfil"
                width={120}
                className="rounded-circle border border-secondary"
              />
            ) : (
              <p>No hay imagen de perfil</p>
            )}
          </div>

          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="form-control bg-input border-0"
            />
          </div>

          <div className="d-grid mb-3">
            <button
              onClick={handelClick}
              disabled={uploading}
              className="btn btn-upload"
            >
              {uploading ? "Guardando..." : "Guardar"}
            </button>
          </div>

          {uploading && (
            <div className="loader-image mx-auto mb-3"></div>
          )}

          <div className="text-secondary mb-1"><strong>Email:</strong> {user.email}</div>
          <div className="text-secondary mb-1"><strong>País:</strong> {user.country}</div>
          <div className="text-secondary mb-1"><strong>Puntaje:</strong> {user.score}</div>
        </div>
      </section>
    </main>
  );
};