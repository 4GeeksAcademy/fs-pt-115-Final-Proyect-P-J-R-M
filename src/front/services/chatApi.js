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
  const res = await fetch(`${apiUrl}/${chatId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text().catch(() => "");

  if (res.ok) {
    try {
      return JSON.parse(text || "null");
    } catch {
      return null;
    }
  }

  if (res.status === 400) {
    try {
      const data = JSON.parse(text);
      if (data?.msg && /already inactive|not found/i.test(data.msg))
        return null;
    } catch {
      if (/already inactive|not found/i.test(text)) return null;
    }
  }

  throw new Error(
    `Error al eliminar el chat (${res.status}): ${text || res.statusText}`
  );
};
