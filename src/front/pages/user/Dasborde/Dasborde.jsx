import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "../../../components/Calendar/Calendar";
import { useAuth } from "../../../hooks/useAuth";
import { getFavorites } from "../../../services/favoritesApi";
import { getPosts } from "../../../services/postApi";
import { uploadImge, patchUser, getUsers, deleteUser } from "../../../services/userApi";
import Swal from "sweetalert2";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import esLocale from "i18n-iso-countries/langs/es.json";
import dayjs from "dayjs";
import { Send } from "lucide-react";
import Perrete from "../../../assets/img/Perretefile.png"
import "./dasborde.css";

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);
const countryNames = countries.getNames("en", { select: "official" });
const countryList = Object.entries(countryNames);

function ReadOnlyStars({ value = 0 }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="profile-stars" aria-label={`Puntuación ${n} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`profile-stars__star ${i < n ? "is-active" : ""}`}>★</span>
      ))}
    </div>
  );
}

function useAuthToken(tokenFromAuth) {
  return tokenFromAuth || sessionStorage.getItem("token") || localStorage.getItem("token") || null;
}

function getAuthorInfo(post, currentUser, authorsById) {
  const fromMap = post?.user_id ? authorsById[post.user_id] : null;
  const name =
    post?.user?.username ||
    fromMap?.username ||
    post?.username ||
    (post?.user_id === currentUser?.id ? currentUser?.username : "Usuario");
  const image =
    post?.user?.image ||
    fromMap?.image ||
    post?.user_image ||
    (post?.user_id === currentUser?.id ? currentUser?.image : null);
  return { name, image };
}

export const Dasborde = () => {
  const navigate = useNavigate();
  const { user, loading, error, refreshUser, token: authTokenFromHook, logout } = useAuth();
  const authToken = useAuthToken(authTokenFromHook);

  const [postfavo, setPostFavo] = useState([]);
  const [authorsById, setAuthorsById] = useState({});

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [username, setUsername] = useState(user?.username || "");
  const [usernameExists, setUsernameExists] = useState(false);
  const [country, setCountry] = useState(user?.country || "");
  const usernameChanged = username !== user?.username;

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

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const users = await getUsers();
        const map = {};
        (users || []).forEach((u) => {
          if (u?.id) map[u.id] = { username: u.username, image: u.image };
        });
        setAuthorsById(map);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    if (authToken) loadAuthors();
  }, [authToken]);

  useEffect(() => {
    if (!usernameChanged) return;
    const check = async () => {
      try {
        const users = await getUsers();
        const exists = (users || []).some((u) => u.username?.toLowerCase() === username.toLowerCase());
        setUsernameExists(exists);
      } catch {
        setUsernameExists(false);
      }
    };
    if (username && user?.username !== username) check();
    else setUsernameExists(false);
  }, [username, usernameChanged, user, authToken]);

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
      Swal.fire({ icon: "success", title: "Imagen actualizada", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error al subir imagen" });
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = () => {
    Swal.fire({
      title: "Editar perfil",
      customClass: { popup: "swal-compact" },
      html: `
        <form id="edit-form" class="edit-modal edit-modal--compact">
          <div class="edit-row">
            <label class="edit-label">Username</label>
            <input id="username-input" class="swal2-input edit-input" placeholder="Nuevo username" value="${username || ""}" />
          </div>
          <div class="edit-row">
            <label class="edit-label">País</label>
            <select id="country-select" class="swal2-select edit-input">
              ${countryList
          .map(([code, name]) => `<option value="${name}" ${name === (country || "") ? "selected" : ""}>${name}</option>`)
          .join("")}
            </select>
          </div>
          <hr class="edit-sep" />
          <div class="edit-grid">
            <div class="edit-row">
              <label class="edit-label">Nueva contraseña</label>
              <input id="password-input" type="password" class="swal2-input edit-input" placeholder="Contraseña" />
            </div>
            <div class="edit-row">
              <label class="edit-label">Confirmar</label>
              <input id="password2-input" type="password" class="swal2-input edit-input" placeholder="Confirmar contraseña" />
            </div>
          </div>
          ${usernameExists ? `<p class="edit-hint error">Ese nombre de usuario ya existe.</p>` : ""}
          <p class="edit-hint">Solo se actualizará lo que cambies.</p>
        </form>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const newUsername = (document.getElementById("username-input")?.value || "").trim();
        const newCountry = (document.getElementById("country-select")?.value || "").trim();
        const pass1 = (document.getElementById("password-input")?.value || "");
        const pass2 = (document.getElementById("password2-input")?.value || "");
        if ((pass1 || pass2) && pass1.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres.");
          return false;
        }
        if (pass1 !== pass2) {
          Swal.showValidationMessage("Las contraseñas no coinciden.");
          return false;
        }
        if (newUsername && newUsername.length < 3) {
          Swal.showValidationMessage("El username debe tener al menos 3 caracteres.");
          return false;
        }
        return { newUsername, newCountry, pass1 };
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const { newUsername, newCountry, pass1 } = result.value || {};
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
        if (pass1) {
          ops.push(patchUser({ password: pass1, token: authToken }));
        }
        if (ops.length) {
          await Promise.all(ops);
          await refreshUser();
          Swal.fire({ icon: "success", title: "Perfil actualizado", timer: 1600, showConfirmButton: false });
        }
      } catch {
        Swal.fire({ icon: "error", title: "No se pudo actualizar el perfil" });
      }
    });
  };

  const handleDeleteUser = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará tu cuenta permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await deleteUser();
        await Swal.fire({
          icon: "success",
          title: "Cuenta eliminada",
          text: "Tu usuario ha sido eliminado correctamente.",
        });
        logout();
        navigate("/");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el usuario.",
        });
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
              <img src={user.image || Perrete} alt="Foto de perfil" className="profile-avatar" />
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
                <span className="info-row__value">{user.country || "Selecciona país"}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-btn" onClick={openEditModal}>
                Editar perfil
              </button>
              <button className="delete-btn" onClick={handleDeleteUser}>
                Eliminar usuario
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-sections">
        <div className="calendar-card">
          <div className="block-title">Calendario</div>
          <Calendar
            className="p2p-cal"
            markedDates={(postfavo || [])
              .map((post) => dayjs(post.day_exchange, "DD/MM/YYYY").format("YYYY-MM-DD"))
              .filter(Boolean)}
          />
          <div className="cal-legend">
            <span className="cal-legend__item"><span className="dot dot--marked" /> Fecha de intercambio</span>
          </div>
        </div>

        <div className="profile-posts-card">
          <div className="profile-posts-header">
            <h3 className="profile-posts-title">Posts</h3>
          </div>
          {postfavo && postfavo.length > 0 ? (
            <ul className="posts-list">
              {postfavo.map((post) => {
                const { name, image } = getAuthorInfo(post, user, authorsById);
                return (
                  <li key={post.id} className="post-item">
                    <div className="post-body-horizontal">
                      <div className="post-user">
                        <img className="post-avatar" src={image || Perrete} alt={name} loading="lazy" />
                        <h4 className="post-author" title={name}>{name}</h4>
                      </div>
                      <div className="post-info">
                        <div className="detail">
                          <div className="value" title={post.destination || "Destino"}>
                            {post.destination || "Destino"}
                          </div>
                        </div>
                      </div>
                      <div className="post-money">
                        <div className="detail">
                          <div className="value">
                            <span>{post.divisas_one}</span>
                            <Send size={18} className="text-gold" />
                            <span>{post.divisas_two}</span>
                          </div>
                        </div>
                      </div>
                      <div className="post-date">
                        <div className="detail">
                          <div className="value">{post.day_exchange || "Fecha N/D"}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="posts-empty">No hay posts aún.</div>
          )}
        </div>
      </div>
    </div>
  );
};
