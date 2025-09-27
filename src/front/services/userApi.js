const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api/users";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
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

//### Obtener todos los usuarios (activos y inactivos)
export const getAllUsers = async () => {
  const response = await fetch(`${apiUrl}/all?all=true`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener todos los usuarios");
  return await response.json();
};

//Cloudinary
export const uploadImge = async (file, { asAvatar = false } = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (asAvatar) formData.append("asAvatar", "1");

  const response = await fetch(`${apiUrl}/upload-img`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
  const data = await response.json();
  return data;
};
