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

export const postUser = async (userData) => {
  const response = await fetch(`${urlUser}/api/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    console.error("Error al crear usuario");
    return null;
  }

  const data = await response.json();
  return data;
};

export const patchUser = async (partialData) => {
  const response = await fetch(`${urlUser}/api/users`, {
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
  const response = await fetch(`${urlUser}/api/users`, {
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

// Login
export const loginUser = async (UserData) => {
  const response = await fetch(`${urlUser}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(UserData),
  });

  if (!response.ok) {
    console.error("Error al iniciar sesión");
    return null;
  }

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};
