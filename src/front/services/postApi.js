const apiUrl = import.meta.env.VITE_BACKEND_URL + "/posts";

export const getPosts = async (token) => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al traer los posts");

    return await response.json();
  } catch (error) {
    console.error("getPosts error:", error);
    throw error;
  }
};

export const getPostById = async (id, token) => {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al traer el post");

    return await response.json();
  } catch (error) {
    console.error("getPostById error:", error);
    throw error;
  }
};

export const createPost = async (postData, token) => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) throw new Error("Error al crear el post");

    return await response.json();
  } catch (error) {
    console.error("createPost error:", error);
    throw error;
  }
};

export const updatePost = async (id, postData, token) => {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) throw new Error("Error al actualizar el post");

    return await response.json();
  } catch (error) {
    console.error("updatePost error:", error);
    throw error;
  }
};

export const deletePost = async (id, token) => {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al eliminar el post");

    return await response.json();
  } catch (error) {
    console.error("deletePost error:", error);
    throw error;
  }
};
