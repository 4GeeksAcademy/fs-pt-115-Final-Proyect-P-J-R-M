const urlApi = import.meta.env.VITE_BACKEND_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getUsers = async () => {
  const response = await fetch(`${urlApi}/api/users`, {
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

export const patchUser = async (partialData) => {
  const response = await fetch(`${urlApi}/api/users`, {
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

export const deleteUser = async () => {
  const response = await fetch(`${urlApi}/api/users`, {
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