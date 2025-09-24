import { useEffect, useState, useRef } from "react";
import { Calendar } from "../../../components/Calendar/Calendar";
import { useAuth } from "../../../hooks/useAuth";
import { getFavorites } from "../../../services/favoritesApi"
import { getPosts } from "../../../services/postApi";
import { uploadImge, patchUser, getUsers } from "../../../services/userApi";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import dayjs from 'dayjs';

import "./dasborde.css";

countries.registerLocale(enLocale);
const countryNames = countries.getNames("en", { select: "official" });
const countryList = Object.entries(countryNames);

export const Dasborde = () => {
  const { user, loading, error, refreshUser } = useAuth();
  const [postfavo, setPostFavo] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [username, setUsername] = useState(user?.username || "");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  const [country, setCountry] = useState(user?.country || "");
  const [countrySaving, setCountrySaving] = useState(false);

  const usernameChanged = username !== user?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) return;

        const favorites = await getFavorites()
        const posts = await getPosts(token)

        const favPosts = favorites.favorite_posts || []
        const userPosts = posts.filter(post => post.user_id === user.id);

        const combinedPostsMap = new Map();
        [...favPosts, ...userPosts].forEach(post => {
          combinedPostsMap.set(post.id, post);
        });

        const combinedPosts = Array.from(combinedPostsMap.values());
        setPostFavo(combinedPosts);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (usernameChanged) {
      checkUsernameExists(username);
    }
  }, [username]);

  const checkUsernameExists = async (newUsername) => {
    if (!newUsername || newUsername === user.username) {
      setUsernameExists(false);
      return;
    }

    try {
      const users = await getUsers();
      const exists = users.some(
        (u) => u.username.toLowerCase() === newUsername.toLowerCase()
      );
      setUsernameExists(exists);
    } catch (error) {
      console.error("Error al verificar si el usuario existe:", error);
      setUsernameExists(false);
    }
  };


  const handleImageUpload = async (fileToUpload) => {
    const imageFile = fileToUpload || file;

    if (!imageFile || !imageFile.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida.");
      return;
    }

    setUploading(true);
    try {
      await uploadImge(imageFile, { asAvatar: true });
      await refreshUser();
      setFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUsernameSave = async () => {
    if (usernameExists) {
      alert("El nombre de usuario ya existe.");
      return;
    }

    setUsernameSaving(true);
    try {
      await patchUser({ username });
      await refreshUser();
    } catch (error) {
      console.error("Error updating username:", error);
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleCountrySave = async () => {
    setCountrySaving(true);
    try {
      await patchUser({ country });
      await refreshUser();
    } catch (error) {
      console.error("Error updating country:", error);
    } finally {
      setCountrySaving(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dasborde-container">
      <main className="content">
        {user && (
          <div className="user-card">
            <div className="user-image-container">
              {uploading || loading ? (
                <div className="loader-image"></div>
              ) : (
                user.image && (
                  <img src={user.image} alt="Foto de perfil" className="user-image" />
                )
              )}
            </div>
            <div className="user-info">
              <p> {user.username}</p>
              <p> {user.email}</p>
              <p> {user.country || "Planeta tierra"}</p>
              <p> {user.score}</p>
            </div>

            <button
              className="edit-toggle-btn"
              onClick={() => setShowEditForm(prev => !prev)}
            >
              {showEditForm ? "Cerrar edición" : "Editar perfil"}
            </button>

            {showEditForm && (
              <div className="user-edit-form">

                {/* Imagen */}
                <div className="form-row">
                  <label><strong>Cambiar imagen:</strong></label>
                  <div className="image-upload-row">
                    <button
                      type="button"
                      className="btn icon-save-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Seleccionar imagen"
                    >
                      <i className="fa-solid fa-image"></i>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={async (e) => {
                        const selectedFile = e.target.files[0];
                        if (!selectedFile) return;
                        setFile(selectedFile);
                        await handleImageUpload(selectedFile);
                      }}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="form-row">
                  <label><strong>Username:</strong></label>
                  <div className="input-button-row">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nuevo nombre de usuario"
                      style={{ borderColor: usernameExists ? "red" : undefined }}
                    />
                    <button
                      onClick={handleUsernameSave}
                      disabled={usernameSaving || usernameExists}
                      className="btn icon-save-btn"
                      title="Guardar username"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                    </button>
                  </div>
                  {usernameExists && (
                    <p style={{ color: "red" }}>Ese nombre de usuario ya existe.</p>
                  )}
                </div>

                {/* Country */}
                <div className="form-row">
                  <label><strong>Country:</strong></label>
                  <div className="input-button-row">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="compact-select"
                    >
                      <option value="">Select a country</option>
                      {countryList.map(([code, name]) => (
                        <option key={code} value={name}>{name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleCountrySave}
                      disabled={countrySaving}
                      className="btn icon-save-btn"
                      title="Guardar país"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="content-inner">
          <div className="calendar-container">
            <Calendar
              markedDates={postfavo
                .map(post => dayjs(post.day_exchange, 'DD/MM/YYYY').format('YYYY-MM-DD'))
                .filter(Boolean)}
            />
          </div>
          <div className="favorites-section">
            <h2>Posts</h2>
            {postfavo && postfavo.length > 0 ? (
              <ul className="favorites-list">
                {postfavo.map((post) => (
                  <li key={post.id} className="post-item">
                    <p className="post-destination"><strong></strong> {post.destination}</p>
                    <p className="post-monto"> {post.description} {post.divisas_one} → {post.divisas_two}</p>
                    <p className="post-exchange" ><strong>Fecha de intercambio:</strong> {post.day_exchange || "No especificada"}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay posts o creados aún.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
