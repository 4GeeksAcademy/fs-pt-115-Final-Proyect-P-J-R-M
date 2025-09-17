import { useEffect, useState } from "react";
import { Calendar } from "../../../components/Calendar/Calendar";
import { useAuth } from "../../../hooks/useAuth";
import { getFavorites } from "../../../services/favoritesApi"
import { getPosts } from "../../../services/postApi";
import dayjs from 'dayjs';

import "./dasborde.css";

export const Dasborde = () => {
  const { user, loading, error } = useAuth();
  const [postfavo, setPostFavo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) return;

        const favorites = await getFavorites()
        const posts = await getPosts(token)


        // Favoritos
        const favPosts = favorites.favorite_posts || []


        // Posts creados por el usuario
        const userPosts = posts.filter(post => post.user_id === user.id);

        // Combinar y eliminar duplicados por ID
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dasborde-container">
      <main className="content">

        {/*  Usuario */}
        {user && (
          <div className="user-card">
            <div className="user-image-container">
              {user.image && (
                <img src={user.image} alt="Foto de perfil" className="user-image" />
              )}
              <a href="/profile" className="edit-icon" title="Editar perfil">
                <i class="fa-regular fa-pen-to-square"></i>
              </a>
            </div>
            <div className="user-info">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Country:</strong> {user.country}</p>
              <p><strong>Score:</strong> {user.score}</p>
            </div>
          </div>
        )}
        <div className="content-inner">
          {/* Calendario */}
          <div className="calendar-container">
            <Calendar
              markedDates={
                postfavo
                  .map(post => dayjs(post.day_exchange).format('YYYY-MM-DD'))
                  .filter(Boolean)
              }
            />
          </div>
          {/* Posts */}
          <div className="favorites-section">
            <h2>Posts</h2>
            {postfavo && postfavo.length > 0 ? (
              <ul className="favorites-list">
                {postfavo.map((post) => (
                  <li key={post.id} className="favorite-item">
                    <p><strong>Destino:</strong> {post.destination}</p>
                    <p><strong>Intercambio:</strong> {post.description} {post.divisas_one} → {post.divisas_two}</p>
                    <p><strong>Fecha de intercambio:</strong> {post.day_exchange || "No especificada"}</p>
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
