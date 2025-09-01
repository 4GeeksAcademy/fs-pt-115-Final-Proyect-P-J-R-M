const urlUser = import.meta.env.VITE_BACKEND_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getUsers = async () => {
  const response = await fetch(`${urlUser}/api/users`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    console.error("Error al obtener usuarios");
    return null;
  }

  const data = await response.json();
  return data;
};

export const getUserProfile = async () => {
  const response = await fetch(`${urlUser}/api/users/profile`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    console.error("Error al obtener el perfil");
    return null;
  }

  const data = await response.json();
  return data;
};

export const patchUser = async (id, partialData) => {
  const response = await fetch(`${urlUser}/api/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(partialData),
  });

  if (!response.ok) {
    console.error("Error al actualizar usuario");
    return null;
  }

  const data = await response.json();
  return data;
};

export const deleteUser = async (id) => {
  const response = await fetch(`${urlUser}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    console.error("Error al eliminar usuario");
    return null;
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    return true;
  }
};

