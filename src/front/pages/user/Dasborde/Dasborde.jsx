import { useEffect, useState, useRef } from "react";
import { Calendar } from "../../../components/Calendar/Calendar";
import { useAuth } from "../../../hooks/useAuth";
import { getFavorites } from "../../../services/favoritesApi";
import { getPosts } from "../../../services/postApi";
import { uploadImge, patchUser, getUsers } from "../../../services/userApi";
import Swal from "sweetalert2";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import esLocale from "i18n-iso-countries/langs/es.json";
import dayjs from "dayjs";
import FinalLogo from "../../../assets/img/FINALLOGO.png";
import "./dasborde.css";

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);
const countryNames = countries.getNames("en", { select: "official" });
const countryList = Object.entries(countryNames);

/* Estrellas solo lectura */
function ReadOnlyStars({ value = 0 }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="profile-stars" aria-label={`Puntuación ${n} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`profile-stars__star ${i < n ? "is-active" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* Token helper: hook → session → local */
function useAuthToken(tokenFromAuth) {
  return (
    tokenFromAuth ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    null
  );
}

export const Dasborde = () => {
  const { user, loading, error, refreshUser, token: authTokenFromHook } = useAuth();
  const authToken = useAuthToken(authTokenFromHook);

  const [postfavo, setPostFavo] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [username, setUsername] = useState(user?.username || "");
  const [usernameExists, setUsernameExists] = useState(false);

  const [country, setCountry] = useState(user?.country || "");
  const usernameChanged = username !== user?.username;

  /* Cargar favoritos + posts */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authToken || !user) return;

        const favorites = await getFavorites(authToken);
        const posts = await getPosts(authToken);

        const favPosts = favorites?.fav_posts || [];
        const userPosts = (posts || []).filter((p) => p.user_id === user.id);

        const combined = new Map();
        [...favPosts, ...userPosts].forEach((p) => combined.set(p.id, p));
        setPostFavo(Array.from(combined.values()));
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    if (user) fetchData();
  }, [user, authToken]);

  /* Validación de username */
  useEffect(() => {
    if (!usernameChanged) return;
    const check = async () => {
      try {
        const users = await getUsers(authToken);
        const exists = (users || []).some(
          (u) => u.username?.toLowerCase() === username.toLowerCase()
        );
        setUsernameExists(exists);
      } catch (e) {
        console.error("Error al verificar username:", e);
        setUsernameExists(false);
      }
    };
    if (username && user?.username !== username) check();
    else setUsernameExists(false);
  }, [username, usernameChanged, user, authToken]);

  /* Subida de imagen */
  const handleImageUpload = async (fileToUpload) => {
    const imageFile = fileToUpload || file;
    if (!imageFile || !imageFile.type?.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Selecciona una imagen válida" });
      return;
    }
    setUploading(true);
    try {
      await uploadImge(imageFile, { asAvatar: true, token: authToken });
      await refreshUser();
      setFile(null);
      Swal.fire({
        icon: "success",
        title: "Imagen actualizada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({ icon: "error", title: "Error al subir imagen" });
    } finally {
      setUploading(false);
    }
  };

  /* Modal edición (username + país) */
  const openEditModal = () => {
    Swal.fire({
      title: "Editar perfil",
      html: `
        <div class="edit-modal">
          <label>Username</label>
          <input id="username-input" class="swal2-input" placeholder="Nuevo username" value="${username}" />
          <label>País</label>
          <select id="country-select" class="swal2-select">
            ${countryList
          .map(
            ([code, name]) =>
              `<option value="${name}" ${name === country ? "selected" : ""
              }>${name}</option>`
          )
          .join("")}
          </select>
          ${usernameExists
          ? `<p class="form-hint error" style="margin-top:.25rem">Ese nombre ya existe.</p>`
          : ""
        }
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const newUsername = (document.getElementById("username-input")?.value || "").trim();
        const newCountry = (document.getElementById("country-select")?.value || "").trim();
        return { newUsername, newCountry };
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const { newUsername, newCountry } = result.value || {};

      try {
        const ops = [];
        if (newUsername && newUsername !== user?.username && !usernameExists) {
          ops.push(patchUser({ username: newUsername, token: authToken }));
          setUsername(newUsername);
        }
        if (newCountry && newCountry !== user?.country) {
          ops.push(patchUser({ country: newCountry, token: authToken }));
          setCountry(newCountry);
        }
        if (ops.length) {
          await Promise.all(ops);
          await refreshUser();
          Swal.fire({
            icon: "success",
            title: "Perfil actualizado",
            timer: 1600,
            showConfirmButton: false,
          });
        }
      } catch (e) {
        console.error(e);
        Swal.fire({ icon: "error", title: "No se pudo actualizar el perfil" });
      }
    });
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dasborde-container">
      {user && (
        <div className="profile-header">
          <div className="profile-image">
            {uploading ? (
              <div className="loader-image"></div>
            ) : (
              <img
                src={user.image || FinalLogo}
                alt="Foto de perfil"
                className="profile-avatar"
              />
            )}

            <button
              type="button"
              className="change-img-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar imagen"
              aria-label="Cambiar imagen"
            >
              <i className="fa-solid fa-camera"></i>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={async (e) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) return;
                setFile(selectedFile);
                await handleImageUpload(selectedFile);
              }}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-info">
            <div className="profile-info__top">
              <h2 className="profile-info__name">{user.username}</h2>
              <ReadOnlyStars value={user.score} />
            </div>

            <div className="profile-info__rows">
              <div className="info-row">
                <span className="info-row__label">Email</span>
                <span className="info-row__value u-truncate">{user.email}</span>
              </div>

              <div className="info-row">
                <span className="info-row__label">País</span>
                <span className="info-row__value">
                  {user.country || "Planeta Tierra"}
                </span>
              </div>
            </div>

            <button className="edit-btn" onClick={openEditModal}>
              Editar perfil
            </button>
          </div>
        </div>
      )}

      {/* Secciones inferiores */}
      <div className="profile-sections">
        <div className="calendar-container">
          <Calendar
            markedDates={(postfavo || [])
              .map((post) =>
                dayjs(post.day_exchange, "DD/MM/YYYY").format("YYYY-MM-DD")
              )
              .filter(Boolean)}
          />
        </div>

        <div className="favorites-section">
          <h2>Posts</h2>
          {postfavo && postfavo.length > 0 ? (
            <ul className="favorites-list">
              {postfavo.map((post) => (
                <li key={post.id} className="post-item">
                  <div className="post-line">
                    <div className="post-line__left">
                      <div className="post-line__title u-truncate">
                        {post.destination || "Destino"}
                      </div>
                      <div className="post-line__meta">
                        <span className="chip">{post.divisas_one}</span>
                        <span className="arrow">→</span>
                        <span className="chip chip--gold">
                          {post.divisas_two}
                        </span>
                      </div>
                    </div>
                    <div className="post-line__right">
                      <span className="post-date">
                        {post.day_exchange || "Fecha N/D"}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay posts aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
