import { useEffect, useState } from "react";
import { Calendar } from "../../../components/Calendar/Calendar";
import { CurrencyConverter } from "../../../components/currencyConverter/CurrencyConverter";
import { useAuth } from "../../../hooks/useAuth";
import { getFavorites } from "../../../services/favoritesApi";
import "./dasborde.css";

export const Dasborde = () => {
  const { user, loading, error } = useAuth();
  const [favorites, setFavorites] = useState({ posts: [], chats: [] });
  const [showPosts, setShowPosts] = useState(false);
  const [showChats, setShowChats] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favo = await getFavorites();
        setFavorites({
          posts: favo.favorite_posts || [],
          chats: favo.favorite_chats || [],
        });
      } catch (err) {
        console.error("Error al cargar favoritos", err);
      }
    };

    fetchFavorites();
  }, []);
//---------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getUsers();
        const map = {};
        allUsers.forEach((u) => {
          map[u.id] = u.username;
        });
        setUsersMap(map);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };

    fetchUsers();
  }, []);
//---------------------------------------------------------
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dasborde-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Usuario */}
        {user ? (
          <div className="sidebar-user">
            {user.image && (
              <img src={user.image} alt="Foto de perfil" />
            )}
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Country:</strong> {user.country}</p>
            <p><strong>Score:</strong> {user.score}</p>
          </div>
        ) : (
          <p>No hay usuario cargado.</p>
        )}

        <hr />

        {/* Posts */}
        <div className="sidebar-section">
          <button
            className="toggle-button"
            onClick={() => setShowPosts((prev) => !prev)}
          >
            {showPosts ? "Ocultar" : "Mostrar"} Posts
          </button>
          {showPosts && (
            <ul>
              {favorites.posts.length === 0 ? (
                <li>No hay posts</li>
              ) : (
                favorites.posts.map((post) => (
                  <li key={post.id}>{post.destination || `${post.description}`}</li>
                ))
              )}
            </ul>
          )}
        </div>
        <hr />

        {/* Chats */}
        <div className="sidebar-section">
          <button
            className="toggle-button"
            onClick={() => setShowChats((prev) => !prev)}
          >
            {showChats ? "Ocultar" : "Mostrar"} Chats
          </button>
            {showChats && (
            <ul>
              {favorites.chats.length === 0 ? (
                <li>No hay chats</li>
              ) : (
                favorites.chats.map((chat) => {
                  // Obtener IDs de usuario
                  const userOneId = typeof chat.user_one === "object" ? chat.user_one.id : chat.user_one;
                  const userTwoId = typeof chat.user_two === "object" ? chat.user_two.id : chat.user_two;

                  const otherUserId = userOneId === user.id ? userTwoId : userOneId;
                  const username = usersMap[otherUserId];

                  return (
                    <li key={chat.id}>
                      {username }
                      {/* //añadir los datos del chat.post_id = map del post que coincida */}
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="content">
        <div className="content-inner">
          <div className="calendar-container">
            <Calendar />
          </div>
          <div>
            <CurrencyConverter />
          </div>
        </div>
      </main>
    </div>
  );
};
