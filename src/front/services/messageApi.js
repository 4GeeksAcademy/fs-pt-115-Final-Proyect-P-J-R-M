const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api/messages";

export const getMessages = async (chatId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al traer los mensajes");

    return await response.json();
  } catch (error) {
    console.error("getMessages error:", error);
    throw error;
  }
};


export const createMessage = async (messageData, token) => {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) throw new Error("Error al crear el mensaje");

    return await response.json();
  } catch (error) {
    console.error("createMessage error:", error);
    throw error;
  }
};


export const deleteMessage = async (messageId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al eliminar el mensaje");

    return await response.json();
  } catch (error) {
    console.error("deleteMessage error:", error);
    throw error;
  }
};
