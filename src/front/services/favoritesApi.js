const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});


// Obtener todos los favoritos (posts y chats) sin filtro
export const getFavorites = async () => {
  try {
    const [postsRes, chatsRes] = await Promise.all([
      fetch(`${apiUrl}/favorites/post`, { method: "GET", headers: authHeaders() }),
      fetch(`${apiUrl}/favorites/chat`, { method: "GET", headers: authHeaders() }),
    ]);

    if (!postsRes.ok || !chatsRes.ok) throw new Error("Error al obtener favoritos");

    const postsData = await postsRes.json();
    const chatsData = await chatsRes.json();

    return {
      fav_posts: postsData.fav_posts,
      fav_chats: chatsData.fav_chats,
    };
  } catch (error) {
    console.error("getFavorites error:", error);
    throw error;
  }
};


//  post a favoritos
export const addFavoritePost = async (postId, token) => {
  try {
    const response = await fetch(`${apiUrl}/favorites/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ post_id: postId }),
    });

    if (!response.ok) throw new Error("Error al agregar post a favoritos");

    return await response.json();
  } catch (error) {
    console.error("addFavoritePost error:", error);
    throw error;
  }
};

// post favorito como inactivo (soft delete)
export const removeFavoritePost = async (postId) => {
  try {
    const response = await fetch(`${apiUrl}/favorites/post`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ post_id: postId }),
    });

    if (!response.ok) throw new Error("Error al quitar post de favoritos");

    try {
      return await response.json();
    } catch {
      return true;
    }
  } catch (error) {
    console.error("removeFavoritePost error:", error);
    throw error;
  }
};

//  chat a favoritos
export const addFavoriteChat = async (chatId) => {
  try {
    const response = await fetch(`${apiUrl}/favorites/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ chat_id: chatId }),
    });

    if (!response.ok) throw new Error("Error al agregar chat a favoritos");

    return await response.json();
  } catch (error) {
    console.error("addFavoriteChat error:", error);
    throw error;
  }
};

//  chat favorito como inactivo (soft delete)
export const removeFavoriteChat = async (chatId) => {
  try {
    const response = await fetch(`${apiUrl}/favorites/chat`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ chat_id: chatId }),
    });

    if (!response.ok) throw new Error("Error al quitar chat de favoritos");

    try {
      return await response.json();
    } catch {
      return true;
    }
  } catch (error) {
    console.error("removeFavoriteChat error:", error);
    throw error;
  }
};