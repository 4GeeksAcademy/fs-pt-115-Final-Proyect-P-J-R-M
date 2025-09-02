const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api/chats";


export const getChats = async (postId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al traer los chats");

    return await response.json();
    
  } catch (error) {
    console.error("getChats error:", error);
    throw error;
  }
};


export const createChat = async (chatData, token) => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) throw new Error("Error al crear el chat");

    return await response.json();
  } catch (error) {
    console.error("createChat error:", error);
    throw error;
  }
};


export const deleteChat = async (chatId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al eliminar el chat");

    return await response.json();
  } catch (error) {
    console.error("deleteChat error:", error);
    throw error;
  }
};
