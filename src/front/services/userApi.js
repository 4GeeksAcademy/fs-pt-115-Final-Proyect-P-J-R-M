const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api/users";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getUsers = async () => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    return await response.json();
  } catch (error) {
    console.error("getUsers error:", error);
    throw error;
  }
};

export const patchUser = async (partialData) => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(partialData),
    });

    if (!response.ok) throw new Error("Error al actualizar usuario");

    return await response.json();
  } catch (error) {
    console.error("patchUser error:", error);
    throw error;
  }
};

export const deleteUser = async () => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Error al eliminar usuario");

    try {
      return await response.json();
    } catch {
      return true;
    }
  } catch (error) {
    console.error("deleteUser error:", error);
    throw error;
  }
};

// Favorites

export const getFavorites = async () => {
  try {
    const response = await fetch(`${apiUrl}/`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener favoritos");

    return await response.json();
  } catch (error) {
    console.error("getFavorites error:", error);
    throw error;
  }
};

export const addFavoritePost = async (postId) => {
  try {
    const response = await fetch(`${apiUrl}/post`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ post_id: postId }),
    });

    if (!response.ok) throw new Error("Error al agregar post a favoritos");

    return await response.json();
  } catch (error) {
    console.error("addFavoritePost error:", error);
    throw error;
  }
};

export const removeFavoritePost = async (postId) => {
  try {
    const response = await fetch(`${apiUrl}/post`, {
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

export const addFavoriteChat = async (chatId) => {
  try {
    const response = await fetch(`${apiUrl}/chat`, {
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

export const removeFavoriteChat = async (chatId) => {
  try {
    const response = await fetch(`${apiUrl}/chat`, {
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
